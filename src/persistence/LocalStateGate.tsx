"use client";

import { registerCurrentUserId } from "@/persistence/db";

/**
 * Tells the persistence layer which account is signed in, so the checks in
 * db.ts's `ready` handler (release 6.1.0-alpha Phase 2,
 * pending-6.1.0-poa.md — account isolation) know whether the local Dexie
 * database and sc-/scalecraft: localStorage keys belong to this account or a
 * previous one on the same browser, and wipe them if not.
 *
 * Registers synchronously during render rather than in a useEffect — see the
 * comment on registerCurrentUserId in db.ts for why that ordering matters.
 *
 * Mounted in src/app/(protected)/layout.tsx, alongside FlushDirtyRows.
 * Replaces the old LocalStorageReset, which only handled the release-epoch
 * half of this problem; that logic now lives in db.ts too, so there is one
 * place that owns "is local state valid for this user right now."
 */
export function LocalStateGate({ userId }: { userId: string }) {
  registerCurrentUserId(userId);
  return null;
}
