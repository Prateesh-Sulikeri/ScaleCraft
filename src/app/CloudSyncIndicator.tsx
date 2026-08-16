"use client";

import { CloudAlert, CloudOff } from "lucide-react";
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
 * just means the on-screen data might be stale.
 */
export function CloudSyncIndicator() {
  const dirtyCount = useSyncStatusStore((state) => state.dirtyCount);
  const pullError = useSyncStatusStore((state) => state.pullError);

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

  return null;
}
