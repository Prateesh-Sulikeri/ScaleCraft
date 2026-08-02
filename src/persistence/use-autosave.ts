import { useCallback, useEffect, useRef, useState } from "react";
import { db } from "./db";
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

/** Resting state is "saved", not hidden - the Save button always renders
 * something. "saving" only appears once a write is actually in flight, never
 * during the debounce wait itself (that's what used to make every keystroke/
 * drag flash "Saving..."), and only for a save that's actually visible per
 * AUTOSAVE_VISIBLE_EVERY. "error" always surfaces regardless of throttling -
 * a failed save is never something to hide - and persists until the next
 * write (auto or manual) succeeds. */
export type SaveStatus = "saved" | "saving" | "saved-recent" | "error";

export type UseAutosaveResult = {
  status: SaveStatus;
  /** Writes immediately, bypassing the debounce and cancelling any pending
   * one - used by the Save button and Ctrl+S. Always visible. */
  saveNow: () => Promise<void>;
};

/**
 * Debounced autosave-on-edit (MILESTONES.md #9's "Done when": autosave works
 * offline for both sandbox and chapter attempts), plus `saveNow` for the
 * explicit Save button/Ctrl+S so both paths drive one shared status instead
 * of two separate indicators. Runs alongside - not instead of - the
 * save-on-unmount cleanup already in ChapterWorkspace/SandboxPage: that
 * still covers in-app navigation, this is what stops closing or refreshing
 * the tab from losing work that was never explicitly saved.
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
): UseAutosaveResult {
  const [status, setStatus] = useState<SaveStatus>("saved");
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
        await db.saves.put({ id, updatedAt: Date.now(), nodes: nodesToSave, edges: edgesToSave });
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

  const saveNow = useCallback(async () => {
    if (!saveId) return;
    clearTimeout(debounceRef.current);
    await write(saveId, nodes, edges, true);
  }, [saveId, nodes, edges, write]);

  // Derived, not effect-driven: a null saveId means autosave is disabled
  // right now, so callers should treat status as inert (AppHeader hides the
  // Save button's status affordance entirely whenever saveId is null, same as
  // it already gates Save/Project/Board).
  return { status: saveId ? status : "saved", saveNow };
}
