import { create } from "zustand";

/**
 * Global, quiet cloud-sync health indicator (release 6.1.0-alpha Phase 6,
 * pending-6.1.0-poa.md - fixes audit S5; split in Phase 9.1 after Phase
 * 8.3's focus-driven pulls started clearing push errors within seconds of
 * them happening). Push and pull are different claims about the world, so
 * they get independent signals:
 *
 * - `dirtyCount` - rows across the six synced tables that are still `dirty`,
 *   i.e. haven't been acknowledged by the server. Recomputed by
 *   `refreshDirtyCount()` in cloud-sync.ts after every push attempt and by
 *   flush-dirty.ts after every flush pass. This is the honest "N rows
 *   failed to sync" signal, not a boolean that a later successful pull can
 *   wipe out.
 * - `pullError` - the last `getSync` call failed. Cleared by the next
 *   successful pull only.
 * - `discardedCount` - close-out P2.1 (pending-6.1.0-poa.md). A dirty local
 *   row loses reconciliation to a confirmed newer remote write
 *   (reconcile.ts's `pickWinner`) in exactly the case where a real edit is
 *   genuinely lost - `dirtyCount` just goes down like any other successful
 *   sync, so without this nothing tells the learner it happened. Cumulative
 *   for the page's lifetime (a discard is a one-time past event, not an
 *   ongoing condition to reflect live like `dirtyCount`); a fresh load
 *   starts back at zero, which is an acceptable reset boundary given how
 *   rare this is in a single-player product.
 *
 * Deliberately global rather than per-table - a learner doesn't need to know
 * *which* table failed, only that something did. "Not a game, motion
 * communicates state only" (CLAUDE.md): a single quiet icon, no toast on
 * success.
 */
type SyncStatusStore = {
  pullError: boolean;
  dirtyCount: number;
  discardedCount: number;
  markPullError: () => void;
  markPullOk: () => void;
  setDirtyCount: (count: number) => void;
  recordDiscarded: (count: number) => void;
};

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  pullError: false,
  dirtyCount: 0,
  discardedCount: 0,
  markPullError: () => set({ pullError: true }),
  markPullOk: () => set({ pullError: false }),
  setDirtyCount: (count) => set({ dirtyCount: count }),
  recordDiscarded: (count) =>
    set((state) => ({ discardedCount: state.discardedCount + count })),
}));
