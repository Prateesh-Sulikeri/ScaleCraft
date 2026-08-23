import { useCallback, useEffect, useRef, useState } from "react";
import { checkpointSave, putSaveLocal } from "./save-revisions";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/** Idle time after the last edit before autosave writes. Long enough that a
 * whole editing burst (dragging, typing, rearranging) reads as one session
 * instead of a save per keystroke - short enough that work is durable well
 * before a user could physically close the tab. */
export const AUTOSAVE_DEBOUNCE_MS = 2000;

/** How long "Saved just now" (the button's check icon) stays up before
 * quieting back to the resting Save icon. */
const SAVED_RECENT_MS = 1500;

/** Every autosave still writes to IndexedDB - this only throttles which of
 * those writes also pulse the button's icon. A long editing session debounces
 * to a write every ~AUTOSAVE_DEBOUNCE_MS, and flashing the icon on every
 * single one of those reads as constant background noise even though no
 * individual save is late or missed. Manual saves (saveNow: the Save button,
 * Ctrl+S) always flash - the throttle only applies to the silent, automatic
 * path. */
export const AUTOSAVE_VISIBLE_EVERY = 2;

/** How often a still-unsynced design is checkpointed to Postgres. Long
 * enough that an editing session costs a handful of cloud writes instead of
 * one per save, short enough that a dead laptop loses minutes, not hours. */
export const CLOUD_CHECKPOINT_MS = 5 * 60_000;

/** Resting state is "saved", not hidden - the Save button always renders
 * something. "saving" only appears once a write is actually in flight, never
 * during the debounce wait itself (that's what used to make every keystroke/
 * drag flash "Saving..."), and only for a save that's actually visible per
 * AUTOSAVE_VISIBLE_EVERY. "error" always surfaces regardless of throttling -
 * a failed save is never something to hide - and persists until the next
 * write (auto or manual) succeeds. */
export type SaveStatus = "saved" | "saving" | "saved-recent" | "error";

export type UseAutosaveOptions = {
  /** Whether this slot keeps a cloud checkpoint: a push every
   * CLOUD_CHECKPOINT_MS while the local row is ahead of the cloud, plus one
   * when the editor is left or the tab is hidden. Defaults to false.
   *
   * Sandbox passes true - it has no Submit, so a checkpoint is its only
   * durable cloud copy. Chapters stay false: a chapter's canvas reaches the
   * cloud on Submit and nowhere else, so an in-progress attempt is local
   * until submitted. No path here pushes on a manual save; saving is a local
   * act, and the checkpoint decides when the cloud hears about it. */
  cloudCheckpoint?: boolean;
};

export type UseAutosaveResult = {
  status: SaveStatus;
  /** Writes immediately, bypassing the debounce and cancelling any pending
   * one - used by the Save button and Ctrl+S. Always visible. */
  saveNow: () => Promise<void>;
  /** Timestamp of the most recent successful saveNow() write, or null before
   * the first one - never set by the debounced autosave path. Drives
   * SaveToast.tsx: a toast on every quiet background write would be exactly
   * the header-clutter/noise this hook's own status throttling (see
   * AUTOSAVE_VISIBLE_EVERY above) was built to avoid, but an explicit
   * Ctrl+S/Save-button press is a deliberate action a user expects
   * confirmation for. Callers should key their toast on this value, not
   * re-derive it from `status` (saved-recent fires for throttled autosaves
   * too). */
  lastManualSaveAt: number | null;
};

/**
 * Debounced autosave-on-edit (MILESTONES.md #9's "Done when": autosave works
 * offline for both sandbox and chapter attempts), plus `saveNow` for the
 * explicit Save button/Ctrl+S so both paths drive one shared status instead
 * of two separate indicators. Runs alongside - not instead of -
 * ChapterWorkspace's save-on-unmount cleanup: that still covers in-app
 * navigation, this is what stops closing or refreshing the tab from losing
 * work that was never explicitly saved. With `cloudCheckpoint` the hook owns
 * the exit write itself, so a caller that opts in needs no unmount save of
 * its own.
 *
 * `saveId: null` disables the effect entirely (e.g. ChapterWorkspace before
 * the open chapter resolves). Callers MUST also pass `null` until their own
 * initial restore-from-db has actually completed (not just started) - nodes
 * starts at `[]` before that read resolves, and if it takes longer than
 * AUTOSAVE_DEBOUNCE_MS (a slow first IndexedDB open is enough), autosave
 * would otherwise write that transient empty state to the save slot first,
 * and the restore would then load its own empty write back as if it were a
 * real prior save - silently discarding the starterGraph/actual save. This
 * was a real, reproduced bug: see ChapterWorkspace.tsx's `hasLoadedRef`.
 */
export function useAutosave(
  saveId: string | null,
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
  options?: UseAutosaveOptions,
): UseAutosaveResult {
  const cloudCheckpoint = options?.cloudCheckpoint ?? false;
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [lastManualSaveAt, setLastManualSaveAt] = useState<number | null>(null);
  // Bumped on every write attempt. A write's completion only applies if it's
  // still the most recent attempt - otherwise a slow write finishing after a
  // newer one already started (a later debounce, or a manual saveNow) would
  // stomp the status out of order.
  const generationRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const recentTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // Counts every debounced autosave attempt (not manual saves) so only every
  // AUTOSAVE_VISIBLE_EVERYth one touches `status` - the rest still write, just
  // silently.
  const autosaveCountRef = useRef(0);
  // Set on any failed write, cleared on the next successful one - forces that
  // recovery to be visible even on an otherwise-silent cycle, so "Save
  // failed" can never get stuck showing after the problem has actually
  // resolved underneath.
  const hadErrorRef = useRef(false);

  const write = useCallback(
    async (id: string, nodesToSave: AnyNodeType[], edgesToSave: ArchitectureEdgeType[], visible: boolean) => {
      const generation = ++generationRef.current;
      const shouldShow = visible || hadErrorRef.current;
      if (shouldShow) setStatus("saving");
      try {
        // Local only, always. An unchanged graph is a no-op here rather than a
        // new revision, so it can never turn into a cloud write either.
        await putSaveLocal(id, nodesToSave, edgesToSave);
        hadErrorRef.current = false;
        if (generationRef.current !== generation) return;
        if (!shouldShow) return;
        setStatus("saved-recent");
        clearTimeout(recentTimeoutRef.current);
        recentTimeoutRef.current = setTimeout(() => {
          if (generationRef.current === generation) setStatus("saved");
        }, SAVED_RECENT_MS);
      } catch {
        // Errors are never throttled - a failed save must always surface.
        hadErrorRef.current = true;
        if (generationRef.current === generation) setStatus("error");
      }
    },
    [],
  );

  useEffect(() => {
    if (!saveId) return;
    debounceRef.current = setTimeout(() => {
      autosaveCountRef.current += 1;
      const visible = autosaveCountRef.current % AUTOSAVE_VISIBLE_EVERY === 0;
      void write(saveId, nodes, edges, visible);
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(debounceRef.current);
  }, [saveId, nodes, edges, write]);

  // Latest graph, for the checkpoint paths below - they fire from a timer or
  // a teardown, neither of which has the current render's props in scope.
  const latestRef = useRef<{ nodes: AnyNodeType[]; edges: ArchitectureEdgeType[] }>({ nodes, edges });
  useEffect(() => {
    latestRef.current = { nodes, edges };
  }, [nodes, edges]);

  // Cloud checkpoints: on a timer while the local row is ahead of the cloud,
  // and once on the way out (leaving the editor, hiding or closing the tab).
  // checkpointSave is a no-op when nothing is ahead, so a quiet board costs
  // one IndexedDB read every CLOUD_CHECKPOINT_MS and no network at all.
  useEffect(() => {
    if (!saveId || !cloudCheckpoint) return;
    const flush = () => {
      const { nodes: latestNodes, edges: latestEdges } = latestRef.current;
      void putSaveLocal(saveId, latestNodes, latestEdges).then(() => checkpointSave(saveId));
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const interval = setInterval(flush, CLOUD_CHECKPOINT_MS);
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      flush();
    };
  }, [saveId, cloudCheckpoint]);

  const saveNow = useCallback(async () => {
    if (!saveId) return;
    clearTimeout(debounceRef.current);
    await write(saveId, nodes, edges, true);
    // hadErrorRef reflects the write() call just above, synchronously set
    // before it returned - false means that write succeeded.
    if (!hadErrorRef.current) setLastManualSaveAt(Date.now());
  }, [saveId, nodes, edges, write]);

  // Derived, not effect-driven: a null saveId means autosave is disabled
  // right now, so callers should treat status as inert (AppHeader hides the
  // Save button's status affordance entirely whenever saveId is null, same as
  // it already gates Save/Project/Board).
  return { status: saveId ? status : "saved", saveNow, lastManualSaveAt };
}
