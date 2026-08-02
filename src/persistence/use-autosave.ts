import { useEffect, useRef, useState } from "react";
import { db } from "./db";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/** Idle time after the last edit before a save fires — long enough not to
 * spam writes while dragging, short enough that a save is durable well
 * before a user could physically close the tab. */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/** How long the "Saved" indicator stays up before going quiet again —
 * matches the manual Save button's own justSaved window (AppHeader). */
const SAVED_DISPLAY_MS = 1500;

/** `"idle"`: nothing pending, no indicator. `"saving"`: an edit is debounced
 *  and waiting to write. `"saved"`: the write just completed. */
export type AutosaveStatus = "idle" | "saving" | "saved";

/**
 * Debounced autosave-on-edit (MILESTONES.md #9's "Done when": autosave
 * works offline for both sandbox and chapter attempts). Runs alongside —
 * not instead of — the explicit Save button and the save-on-unmount
 * cleanup already in ChapterWorkspace/SandboxPage: those still cover
 * in-app navigation and the manual affordance, this is what stops closing
 * or refreshing the tab from losing work that was never explicitly saved.
 * Returns a status so callers can surface a "Saving..."/"Saved" indicator
 * near the header — silent otherwise, exactly around a real save event.
 *
 * `saveId: null` disables the effect entirely (e.g. ChapterWorkspace before
 * the open chapter resolves). Callers MUST also pass `null` until their own
 * initial restore-from-db has actually completed (not just started) — nodes
 * starts at `[]` before that read resolves, and if it takes longer than
 * AUTOSAVE_DEBOUNCE_MS (a slow first IndexedDB open is enough), autosave
 * would otherwise write that transient empty state to the save slot first,
 * and the restore would then load its own empty write back as if it were a
 * real prior save — silently discarding the starterGraph/actual save. This
 * was a real, reproduced bug: see ChapterWorkspace.tsx's `hasLoadedRef`.
 */
export function useAutosave(
  saveId: string | null,
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
): AutosaveStatus {
  const [status, setStatus] = useState<AutosaveStatus>("idle");
  // Bumped on every effect run. A write's completion callback only applies
  // its status update if it's still the most recent run — otherwise a slow
  // write finishing after a newer edit already started re-debouncing would
  // stomp "saving" back to "saved" out of order.
  const generationRef = useRef(0);

  useEffect(() => {
    if (!saveId) return;
    const generation = ++generationRef.current;
    // Deferred to a microtask rather than called synchronously in the
    // effect body, to avoid react-hooks/set-state-in-effect's
    // cascading-render warning (same pattern as ChapterWorkspace.tsx's
    // restore effect).
    void Promise.resolve().then(() => {
      if (generationRef.current === generation) setStatus("saving");
    });
    let savedDisplayHandle: ReturnType<typeof setTimeout> | undefined;
    const debounceHandle = setTimeout(() => {
      void db.saves.put({ id: saveId, updatedAt: Date.now(), nodes, edges }).then(() => {
        if (generationRef.current !== generation) return;
        setStatus("saved");
        savedDisplayHandle = setTimeout(() => {
          if (generationRef.current === generation) setStatus("idle");
        }, SAVED_DISPLAY_MS);
      });
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => {
      clearTimeout(debounceHandle);
      if (savedDisplayHandle) clearTimeout(savedDisplayHandle);
    };
  }, [saveId, nodes, edges]);

  // Derived, not effect-driven: a null saveId means autosave is disabled
  // right now, so the indicator goes quiet immediately rather than waiting
  // on (or triggering) a render.
  return saveId ? status : "idle";
}
