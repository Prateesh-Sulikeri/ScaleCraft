import { useEffect } from "react";
import { db } from "./db";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

/** Idle time after the last edit before a save fires — long enough not to
 * spam writes while dragging, short enough that a save is durable well
 * before a user could physically close the tab. */
export const AUTOSAVE_DEBOUNCE_MS = 800;

/**
 * Debounced autosave-on-edit (MILESTONES.md #9's "Done when": autosave
 * works offline for both sandbox and chapter attempts). Runs alongside —
 * not instead of — the explicit Save button and the save-on-unmount
 * cleanup already in ChapterWorkspace/SandboxPage: those still cover
 * in-app navigation and the manual affordance, this is what stops closing
 * or refreshing the tab from losing work that was never explicitly saved.
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
export function useAutosave(saveId: string | null, nodes: AnyNodeType[], edges: ArchitectureEdgeType[]): void {
  useEffect(() => {
    if (!saveId) return;
    const handle = setTimeout(() => {
      void db.saves.put({ id: saveId, updatedAt: Date.now(), nodes, edges });
    }, AUTOSAVE_DEBOUNCE_MS);
    return () => clearTimeout(handle);
  }, [saveId, nodes, edges]);
}
