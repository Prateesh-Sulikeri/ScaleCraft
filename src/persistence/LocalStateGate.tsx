"use client";

import { registerCurrentUserId } from "@/persistence/db";

/**
 * Tells the persistence layer which account is signed in, so the checks in
 * db.ts's `ready` handler (release 6.1.0-alpha Phase 2,
 * pending-6.1.0-poa.md — account isolation) know whether the local Dexie
 * database and sc-/scalecraft: localStorage keys belong to this account or a
 * previous one on the same browser, and wipe them if not.
 *
 * `userId` is nullable since Phase 11 (read without an account) — most
 * routes are public now, so this mounts globally in the root layout rather
 * than a gated one, and a signed-out visit is a real, expected case. A null
 * userId is a no-op: `currentUserId` in db.ts stays whatever it already was
 * (null on a fresh load), which is exactly right because Phase 11 also means
 * no signed-out page ever calls hydrate()/refresh() — see progress-store.ts
 * and custom-components-store.ts's callers — so there is no local write to
 * gate against in the first place.
 *
 * Registers synchronously during render rather than in a useEffect — see the
 * comment on registerCurrentUserId in db.ts for why that ordering matters.
 *
 * Mounted in src/app/layout.tsx (root), ahead of {children}, so it runs
 * before any descendant on any route — public or gated — can query Dexie.
 */
export function LocalStateGate({ userId }: { userId: string | null }) {
  if (userId) registerCurrentUserId(userId);
  return null;
}
