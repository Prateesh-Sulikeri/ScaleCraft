"use client";

import { useState } from "react";
import { CloudAlert, CloudOff, History, RefreshCw } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useSyncStatusStore } from "@/persistence/sync-status";
import { flushDirtyRows } from "@/persistence/flush-dirty";

/**
 * Quiet, error-only cloud-sync indicator (release 6.1.0-alpha Phase 6,
 * pending-6.1.0-poa.md - fixes audit S5; reworded in Phase 9.1 to stop
 * promising an auto-resolve that a permanently-rejected write can't deliver).
 * Renders nothing while sync is healthy - no toast, no persistent "synced"
 * badge, matching CLAUDE.md's "not a game, motion communicates state only."
 *
 * Pending, pull failure and discard get separate copy since they're
 * different claims. Pending is neutral, not an error: under the checkpoint
 * model unsynced rows are the normal state between checkpoints, so this is a
 * quiet affordance to push now, not an alarm. A failed pull just means the
 * on-screen data might be stale. `discardedCount` (close-out
 * P2.1) is a third, distinct claim from either - a past edit that lost
 * reconciliation to a newer write from another device and is not coming
 * back, checked after dirty/pull since it's the rarest and least urgent of
 * the three.
 */
export function CloudSyncIndicator() {
  const dirtyCount = useSyncStatusStore((state) => state.dirtyCount);
  const pullError = useSyncStatusStore((state) => state.pullError);
  const discardedCount = useSyncStatusStore((state) => state.discardedCount);
  const [syncing, setSyncing] = useState(false);

  if (dirtyCount > 0) {
    // Clickable, because unsynced no longer means "a push failed": under the
    // checkpoint model (persistence/save-revisions.ts) it is usually just
    // work that has not reached its next checkpoint yet. This is the explicit
    // "sync now" - the same flush the next mount or `online` event would run.
    return (
      <Tooltip
        label={`${dirtyCount} change${dirtyCount === 1 ? "" : "s"} not in the cloud yet - saved locally. Click to sync now`}
      >
        <button
          type="button"
          disabled={syncing}
          onClick={() => {
            setSyncing(true);
            void flushDirtyRows().finally(() => setSyncing(false));
          }}
          aria-label={syncing ? "Syncing to the cloud" : "Sync to the cloud now"}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-foreground/60 hover:bg-border/40 hover:text-foreground disabled:opacity-60"
        >
          {syncing ? <RefreshCw size={16} className="animate-spin" /> : <CloudAlert size={16} />}
        </button>
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
