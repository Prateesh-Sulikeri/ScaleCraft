# Persistence Audit - 6.1.0 Neon Cloud Sync

Status: **Audit complete 2026-08-12.** Findings below are ordered by severity.
Companion to `pending-cloud-sync.md` (the build log) - this doc is the
correctness review of what that release actually shipped.

Triggered by a failed multi-device test: chapter marked complete in Chrome
never appeared in Edge. That symptom turned out to be the least of it.

---

## Summary

The write path (Dexie -> POST -> Postgres) is broadly correct: routes are
auth-gated, upserts key correctly, the server stamps `updatedAt`. Almost every
defect is on the **read path and the lifecycle around it** - hydration
granularity, account identity, and failure visibility.

Three findings are severity-critical. One (S1) is reproduced data loss that a
storage wipe does not fix.

---

## S1 - `markVisited` silently wipes manual chapter completion (CRITICAL, reproduced)

`src/curriculum/progress-store.ts:138-143`

```ts
markVisited: async (slug) => {
  const row = { ...existingRow(get().rowsBySlug, slug), lastVisitedAt: Date.now() };
  await db.curriculumProgress.put(row);   // full-record replace
  void syncCurriculumProgress(row);       // pushes the damage to every device
```

`existingRow` reads the **in-memory zustand store**, not Dexie. On a hard page
load directly onto a chapter workspace the store is empty, because
`ChapterWorkspace.tsx:131` fires `markVisited` in an effect that runs *before*
the `hydrate()` effect at `:138`. So `existingRow` returns the default
`{ manuallyCompletedAt: null }`, and Dexie's `put` full-replaces the real row.

Then `syncCurriculumProgress` POSTs that null up, and the server upsert
overwrites the cloud copy. The completion is destroyed everywhere, not just
locally.

Reproduced with a scratch vitest case against real fake-indexeddb: seed
`manuallyCompletedAt`, call `markVisited` on an unhydrated store, read the row
back -> `null`.

Reachable path: refresh, deep link, or bookmark on `/chapters/<slug>`.
Navigating from the Learning Path first happens to be safe, because that page
mounts and hydrates the shared singleton store beforehand. That is why this
does not reproduce every time.

Same read-from-memory pattern in `setManualComplete` (clobbers `lastVisitedAt`)
and `resetChapter`.

**Fix:** read the existing row from Dexie inside the mutator, or await
`hydrate()` before any mutator runs. Do not derive a full-replace payload from
possibly-unhydrated memory.

## S2 - The Dexie database is shared across every account on a browser (CRITICAL)

`src/persistence/db.ts:152` - `constructor(name: string = "scalecraft")`.

The database name is a constant. There is no `userId` dimension in any Dexie
table, and no sign-out or user-change cleanup exists anywhere in `src/`
(grepped: no `SignOut` handler, no `db.delete()`, no `Dexie.delete`).

Consequence: account B signing in on a browser previously used by account A
reads A's saves, chapter progress, exam attempts, custom components, and Deep
Check critiques (which can contain AI-generated analysis of A's work). This is
the cross-account interference already observed.

**A one-time storage wipe does not fix this.** The wipe clears today's
contamination; the structural defect recurs the moment two accounts share a
browser again.

**Fix (cheap):** store the signed-in `userId` locally; on mount, if it differs
from the stored one, delete the Dexie database and the `scalecraft:*`
localStorage keys before any read.
**Fix (structural):** name the database per user, `scalecraft:<userId>`.

## S3 - Backfill pushes one account's local data into another's cloud (CRITICAL)

`src/persistence/backfill.ts` + `src/app/api/sync/backfill/route.ts`

`runOneTimeBackfill` mounts on every protected page. A brand-new account B has
no `userSyncState` row, so the guard passes, and it reads the **entire local
Dexie** - which on a shared browser still holds A's data - and POSTs every row
to `/api/sync/*`, where the server stamps each one with **B's** userId. B is
then marked backfilled forever.

That is a silent, permanent cross-account write, not just a display leak.

Secondary defects in the same flow:
- **Wrong-device-wins:** whichever device mounts first defines the backfill. A
  fresh device with zero rows pushes nothing, then marks the user done,
  permanently stranding the rich data on the original device (normal sync only
  fires on *new* writes).
- **Race:** two tabs or devices can both see `backfilled: false` and both push.
  `onConflictDoNothing` only makes the marker idempotent; both payloads land.
- **Failure swallowed:** `Promise.allSettled` then unconditional
  `markBackfillComplete()`. If every POST failed, the user is still marked done
  and the data is never pushed or retried.

**Decision (user, 2026-08-12): remove the backfill flow entirely.** It cannot
distinguish "this local data belongs to this account" from "this local data was
left here by someone else", and a user may legitimately want data in one
account and not another. Replaced by a one-time local-storage reset at 6.1.0
(3 users total, accepted data loss).

## S4 - Hydrate-on-empty is a bootstrap, not sync (HIGH)

This is the systemic reason multi-device does not work for most things.

Every hydrate path fires **only when local data is absent**, and never again:

| Data | Gate | File |
|---|---|---|
| chapterProgress, curriculumProgress, examAttempts | whole table empty | `progress-store.ts:104-124` |
| saves (sandbox, chapter) | that scope absent | `sandbox/page.tsx:127`, `ChapterWorkspace.tsx:185` |
| chapterProgress (per chapter) | that row absent | `ChapterWorkspace.tsx:272` |
| deepCheckSessions | that saveId's list empty | `deepCheckSessions.ts:13` |
| customComponents | whole table empty | `sandbox/page.tsx:148` |

Two distinct problems:

**4a - granularity.** The three progress tables gate on *whole-table*
emptiness, not per-key. Combined with S1's `markVisited`, which writes a
`curriculumProgress` row on **every chapter open**, simply viewing any chapter
on device B permanently poisons that device: the table is never empty again, so
it never pulls curriculum progress from the cloud for any chapter, ever.

**4b - latching.** Even at correct granularity, `hydrated` latches true and
absence is the only trigger. Once device B holds any row for a scope, device
A's later edits never reach it. Cross-device continuity therefore only works
for data device B has never touched. Anything B has opened is frozen at B's
local copy forever.

`pending-cloud-sync.md` decision 3 chose hydrate-on-empty deliberately, so 4b
is arguably as-designed - but the design does not deliver the cross-device
continuity the release is named for. Worth an explicit re-decision.

## S5 - Sync failures are completely invisible (HIGH)

`src/persistence/cloud-sync.ts:17-23` - `postSync` never checks `res.ok`.

A 400 (Zod rejection), 401 (expired session), or 500 (database down) is
indistinguishable from success. There is no retry, no status surface, no
console warning. Cloud sync can be fully broken for every write with zero
signal to the user or to us.

`getSync` does check `res.ok`, but returns `null` on failure - which every
caller treats as "no remote data exists", i.e. a transient network error looks
exactly like an empty cloud.

## S6 - No client-side last-write-wins (MEDIUM)

`updatedAt` is stored on both sides and returned by every GET, but no client
ever compares it. `pending-cloud-sync.md` decision 4 claims LWW "needed no
extra code" - true for concurrent *server* writes, but there is no newer-wins
read anywhere, so two devices that both hold data never converge. Follows
directly from S4b.

## S7 - Deletes are asymmetric (MEDIUM)

- **No DELETE route for `saves` at all.** `handleResetToStarter`
  (`ChapterWorkspace.tsx:417`) deletes the local save only. If the tab closes
  inside the 2s autosave debounce, the cloud keeps the discarded attempt and
  the next load hydrates it back. Resurrection.
- `deleteSession` (`deepCheckSessions.ts:29`) sends `?id=undefined` when a row
  predates `syncId`, silently deleting nothing.

## S8 - Sandbox unmount does not sync (MEDIUM)

`sandbox/page.tsx:178-184` writes `db.saves.put` on unmount but never calls
`syncSave`. `ChapterWorkspace.tsx:234-235` does both. Editing the sandbox and
navigating away inside the debounce window never reaches the cloud.

## S9 - customComponents hydrate only on the sandbox page (MEDIUM)

`sandbox/page.tsx:148` is the sole caller of `hydrateCustomComponents`. A user
who works only in chapters never pulls their custom component palette onto a
new device.

## S10 - localStorage is account-agnostic (LOW)

`scalecraft:tour-log`, tour run state (`tour-state.ts`), `sc-insert-hint-dismissed`,
`scalecraft:deep-check-panel-width`. Not learner data, but a second account on
the same browser inherits "tour already seen" and never gets onboarding.

## S11 - Timestamps stored without timezone (LOW)

Every `timestamp()` in `src/db/schema.ts` omits `withTimezone: true`, so values
are stored naive and `.getTime()` round-trips assume the server's zone. Safe on
Vercel (UTC), latent anywhere else.

---

## What the 6.1.0 reset does and does not fix

**Decision (user, 2026-08-12):** drop backfill, wipe local storage once on
6.1.0, ask the 3 current users to restart. Data loss accepted at this scale.

Fixed by the wipe:
- S3 (backfill removed outright)
- today's already-contaminated local state from S2

**Not fixed by the wipe - still live bugs afterward:**
- **S1** - data loss on chapter open, unrelated to stale storage
- **S2** - structural; recurs on the next shared-browser account switch
- **S4** - multi-device still will not propagate updates
- **S5** - failures still silent
- S6-S11

## Recommended order

1. Remove backfill (`backfill.ts`, `BackfillOnMount.tsx`, the route, the
   `userSyncState` table). User-approved.
2. One-time storage reset gated on a version epoch key, clearing Dexie and the
   `scalecraft:*` localStorage keys.
3. Wipe-on-user-change (S2 cheap fix) - reuses step 2's machinery, and is what
   actually keeps accounts isolated going forward.
4. Fix S1 - read from Dexie in the progress-store mutators.
5. Make S5 visible - check `res.ok`, distinguish "sync failed" from "no remote
   data".
6. Re-decide S4: keep hydrate-on-empty and drop the cross-device claim, or
   implement `updatedAt`-compared reads on mount.
