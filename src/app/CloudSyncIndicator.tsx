"use client";

import { CloudAlert } from "lucide-react";
import { Tooltip } from "@/app/Tooltip";
import { useSyncStatusStore } from "@/persistence/sync-status";

/**
 * Quiet, error-only cloud-sync indicator (release 6.1.0-alpha Phase 6,
 * pending-6.1.0-poa.md - fixes audit S5). Renders nothing while sync is
 * healthy - no toast, no persistent "synced" badge, matching CLAUDE.md's
 * "not a game, motion communicates state only." Appears only once a push or
 * pull has actually failed, and disappears again the moment any sync call
 * succeeds - the same quiet-unless-wrong pattern use-autosave.ts already
 * uses for the Save button's local-write error state, just scoped to the
 * network half instead of the Dexie half.
 */
export function CloudSyncIndicator() {
  const status = useSyncStatusStore((state) => state.status);
  if (status !== "error") return null;
  return (
    <Tooltip label="Cloud sync failed - your work is saved locally and will sync automatically once this resolves">
      <div
        aria-label="Cloud sync failed"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-state-error text-state-error"
      >
        <CloudAlert size={16} />
      </div>
    </Tooltip>
  );
}
