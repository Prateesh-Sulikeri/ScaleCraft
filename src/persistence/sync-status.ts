import { create } from "zustand";

/**
 * Global, quiet cloud-sync health indicator (release 6.1.0-alpha Phase 6,
 * pending-6.1.0-poa.md - fixes audit S5). Every `postSync`/`getSync` call in
 * cloud-sync.ts reports here on success/failure. Deliberately global rather
 * than per-table: a learner doesn't need to know *which* of six tables
 * failed to sync, only that something did and a retry is happening on the
 * next write or load (Phase 1.3's dirty-flush / the next hydrate() call) -
 * "not a game, motion communicates state only" (CLAUDE.md), so this is a
 * single quiet icon, no per-table detail, no toast on success.
 */
type SyncStatus = "idle" | "error";

type SyncStatusStore = {
  status: SyncStatus;
  markSyncError: () => void;
  markSyncOk: () => void;
};

export const useSyncStatusStore = create<SyncStatusStore>((set) => ({
  status: "idle",
  markSyncError: () => set({ status: "error" }),
  markSyncOk: () => set({ status: "idle" }),
}));
