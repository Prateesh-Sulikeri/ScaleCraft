"use client";

import { CloudAlert, CloudOff, History } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useSyncStatusStore } from "@/persistence/sync-status";

/**
 * Quiet, error-only cloud-sync indicator (release 6.1.0-alpha Phase 6,
 * pending-6.1.0-poa.md - fixes audit S5; reworded in Phase 9.1 to stop
 * promising an auto-resolve that a permanently-rejected write can't deliver).
 * Renders nothing while sync is healthy - no toast, no persistent "synced"
 * badge, matching CLAUDE.md's "not a game, motion communicates state only."
 *
 * Push and pull failures get separate copy since they're different claims:
 * unsynced rows keep retrying and are safe locally either way, a failed pull
 * just means the on-screen data might be stale. `discardedCount` (close-out
 * P2.1) is a third, distinct claim from either - a past edit that lost
 * reconciliation to a newer write from another device and is not coming
 * back, checked after dirty/pull since it's the rarest and least urgent of
 * the three.
 */
export function CloudSyncIndicator() {
  const dirtyCount = useSyncStatusStore((state) => state.dirtyCount);
  const pullError = useSyncStatusStore((state) => state.pullError);
  const discardedCount = useSyncStatusStore((state) => state.discardedCount);

  if (dirtyCount > 0) {
    return (
      <Tooltip
        label={`${dirtyCount} change${dirtyCount === 1 ? "" : "s"} haven't synced to the cloud yet - saved locally, retrying automatically`}
      >
        <div
          aria-label="Cloud sync pending"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-state-error text-state-error"
        >
          <CloudAlert size={16} />
        </div>
      </Tooltip>
    );
  }

  if (pullError) {
    return (
      <Tooltip label="Couldn't check the cloud for updates - showing your local data, will retry automatically">
        <div
          aria-label="Cloud sync check failed"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-state-error text-state-error"
        >
          <CloudOff size={16} />
        </div>
      </Tooltip>
    );
  }

  if (discardedCount > 0) {
    return (
      <Tooltip
        label={`${discardedCount} edit${discardedCount === 1 ? "" : "s"} made here didn't sync in time and ${discardedCount === 1 ? "was" : "were"} replaced by a newer change from another device`}
      >
        <div
          aria-label="An edit was overwritten by another device"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-state-error text-state-error"
        >
          <History size={16} />
        </div>
      </Tooltip>
    );
  }

  return null;
}
