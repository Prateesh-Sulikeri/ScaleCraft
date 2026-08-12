# Release 6.1.0-alpha - Persistence POA

Status: **Scoped and decided. No code beyond Phase 0, which already landed.**
Written 2026-08-12 after the multi-device test failure and the persistence
audit that followed; all five open decisions resolved the same day (see
"Decisions - resolved" below). Phases 1-8 are unblocked. This is the single
running doc for the rest of 6.1.0.

Supersedes nothing, but consolidates three threads that were drifting apart:

- `.claude/docs/pending-cloud-sync.md` - the original build log. Still the
  record of what shipped and why. Its remaining unchecked items move here.
- `.claude/docs/pending-persistence-audit.md` - the correctness review, S1-S11.
  Stays as the evidence file; this doc is where the findings get scheduled.
- The storage/scale conversation (Neon free tier, 79 chapters). Never had a
  doc. It does now, see Phase 4 and Appendix A.

---

## The one-paragraph problem statement

6.1.0 shipped a write path that works and a read path that does not sync.
`pending-cloud-sync.md` decision 3 chose "hydrate-on-empty": pull from Postgres
only when a local table or scope has no row at all. That is a first-run seed,
not synchronisation. Once a device has touched anything, no code path ever
pulls an update onto it again. Combined with a browser-wide Dexie database that
has no account dimension, the result is that cross-device sync silently does
not work and cross-account data leaks. Neither is a timing issue and neither
resolves on reload.

## The architectural decision this release turns on

**Move from "local-first with a cloud seed" to "cloud is the record, local is a
cache."**

Everything else in this doc follows from that one sentence, so it is worth
being explicit about what it does and does not change:

| | Today | After |
|---|---|---|
| Where edits are written first | Dexie | Dexie (unchanged) |
| Read latency | instant, local | instant, local (unchanged) |
| Offline editing | works | works (unchanged) |
| What happens when local and cloud disagree | local silently wins forever | newest wins, per key |
| What a device pulls on load | nothing, unless empty | whatever the server has that is newer |
| Cost of losing local data | data loss | nothing, it refills |

That last row is the load-bearing one. Once local is genuinely disposable,
account isolation stops needing per-user databases or a `userId` column on
every table: wiping on account change becomes correct and cheap, because the
cloud refills it. Several problems collapse into one fix.

**This is not a step toward multiplayer.** Single-player remains permanent
(CLAUDE.md). Last-write-wins with no merge UI is chosen precisely because
concurrent editing is not a scenario we serve. See Phase 3's non-goals.

---

## Phase 0 - Landed 2026-08-12

Done, verified, full CI green. Recorded here so the sequence reads whole.

- [x] **Backfill removed entirely.** `backfill.ts`, `BackfillOnMount.tsx`, the
      route, `userSyncState`, and the client wrappers. Migration
      `drizzle/0003_light_the_stranger.sql` drops the table. It could push one
      account's local data into another account's cloud rows (audit S3).
      **Not yet applied to Neon: `npm run db:migrate` still pending.**
- [x] **One-time 6.1.0 local reset.** Dexie `version(10)` clears every table on
      upgrade; a schema bump rather than a mount effect, so it cannot be raced
      by a component reading first. localStorage cleared by
      `src/persistence/LocalStorageReset.tsx`, epoch-gated on
      `scalecraft:storage-epoch`. `aiProfiles` is cleared too despite being
      local-only, because it holds the AI provider API key, which is the worst
      thing to leak across accounts on a shared browser. Users re-enter the key
      once.
- [x] **Audit S1 fixed.** `markVisited` built its Dexie `put` payload from the
      in-memory store, which is empty until `hydrate()` resolves, so a hard load
      onto `/chapters/<slug>` wiped that chapter's `manuallyCompletedAt` and
      synced the null up, destroying the completion on every device. Mutators
      now read Dexie. Two regression tests added.

---

## Phase 1 - Sync metadata foundation

Nothing else can be built correctly without this, and it is nearly free right
now because Phase 0 already wipes local data. Doing it later costs a real
migration.

### 1.1 Every local row needs sync metadata

Only `CanvasSave` has an `updatedAt` today. `ChapterProgress`,
`CurriculumProgress`, `ExamAttempt`, `DeepCheckSession` and
`CustomComponentRecord` have none, so **there is currently nothing to compare
and last-write-wins is unimplementable as the data stands.**

Add to every synced local row:

```ts
type SyncMeta = {
  /** Server's updatedAt from the last successful push or pull of this row.
   *  Server time only, never Date.now(). Null = never synced. */
  syncedAt: number | null;
  /** Local edit not yet acknowledged by the server. */
  dirty: boolean;
};
```

- [ ] Add `SyncMeta` to the six synced row types in `src/persistence/db.ts`
- [ ] Dexie `version(11)` adding the fields (no upgrade callback needed; v10
      already emptied everything, so there are no rows to backfill)
- [ ] Every write path sets `dirty: true`; every successful sync response
      writes back `syncedAt` and clears `dirty`

### 1.2 Clock skew must not decide conflicts

This is the trap that makes naive LWW wrong. Devices have unreliable clocks,
and every `completedAt` / `submittedAt` / `createdAt` we store is
`Date.now()` from the client. Comparing two devices' local timestamps to pick
a winner means a laptop with a skewed clock wins every conflict forever.

**Rule: the server's `updatedAt` is the only ordering authority.** Clients
never compare their own clocks to each other. The reconciliation predicate is
not "is my timestamp newer" but:

```
if (local.dirty)                      -> push local, adopt returned updatedAt
else if (remote.updatedAt > local.syncedAt) -> adopt remote
else                                  -> no-op
```

The routes already return `{ updatedAt }` on POST, so the plumbing exists and
is simply unused today.

- [ ] Document this rule in `ARCHITECTURE.md` alongside the schema-parity note
- [ ] Client-supplied domain timestamps (`completedAt` etc.) stay as display
      data only, never as conflict-resolution input

### 1.3 The `dirty` flag gives us offline for free

`pending-cloud-sync.md` decision 2 explicitly declined an offline queue. With a
`dirty` flag we get the useful 90% of one at no extra cost: on load, and on
regaining connectivity, flush all dirty rows. No queue table, no retry
scheduler, no ordering guarantees. Single-player means a flush is always safe.

- [ ] Flush-dirty-rows pass on app load and on `online` event

---

## Phase 2 - Account isolation

Fixes audit S2, the cross-account leak. Depends on Phase 1 only conceptually.

The Dexie database name is a browser-wide constant, `"scalecraft"`, with no
account dimension and no sign-out cleanup anywhere in `src/`. Account B on a
browser previously used by A reads A's saves, progress, exam attempts, custom
components and Deep Check critiques.

Two candidate designs were considered:

| | Per-user DB (`scalecraft:<userId>`) | Wipe on user change |
|---|---|---|
| Switching accounts | keeps both caches | re-pulls from cloud |
| Call sites touched | all ~15 (`await getDb()`) | 1 |
| Race risk | must resolve userId before first read | none, gated at boot |
| Correct once local is a cache | yes | yes |

**Decision: wipe on user change.** Once Phase 3 makes local a disposable
cache, keeping two caches warm buys nothing but complexity, and the per-user
variant requires threading an async db accessor through every call site. The
cheap option is not a compromise here, it is the right shape.

- [ ] Persist the signed-in `userId` locally (localStorage, alongside the
      storage epoch)
- [ ] On boot, before any read: if stored userId differs from current, delete
      the Dexie database and clear `sc-` / `scalecraft:` localStorage keys
- [ ] Must run before any component reads. Same ordering constraint as the v10
      reset, so use the same mechanism rather than a mount effect
- [ ] Extend `LocalStorageReset.tsx` into a general `LocalStateGate`, or
      replace it, so there is one place that owns "is local state valid for
      this user right now"

### 2.1 localStorage is account-agnostic too (S10)

`sc-tour-*`, `sc-insert-hint-dismissed`, `scalecraft:tour-log`,
`scalecraft:deep-check-panel-width`. Not learner data, but a second account
inherits "tour already seen" and never gets onboarding. Covered for free by the
wipe above.

---

## Phase 3 - Read reconciliation

The core fix. Replaces hydrate-on-empty at all six call sites. Fixes S4 and
S6, and is what makes the multi-device test in `pending-cloud-sync.md` able to
pass at all.

### 3.1 Call sites to convert

| Data | Current gate | Becomes |
|---|---|---|
| chapterProgress, curriculumProgress, examAttempts | whole table empty (`progress-store.ts:104-124`) | per-key reconcile |
| saves, sandbox | scope absent (`sandbox/page.tsx:127`) | per-scope reconcile |
| saves, chapter | scope absent (`ChapterWorkspace.tsx:185`) | per-scope reconcile |
| chapterProgress, per chapter | row absent (`ChapterWorkspace.tsx:272`) | per-key reconcile |
| deepCheckSessions | list empty (`deepCheckSessions.ts:13`) | union by syncId |
| customComponents | table empty (`sandbox/page.tsx:148`) | per-key reconcile |

Note the whole-table gate is the worse half of S4: `markVisited` writes a
`curriculumProgress` row on **every chapter open**, so merely viewing one
chapter permanently poisons that device's ability to ever pull curriculum
progress for any chapter.

### 3.2 Merge semantics per table

Not every table is last-write-wins. Getting this wrong reintroduces data loss.

- **saves** - LWW per `scopeId`. One graph per user per chapter, genuinely
  mutable, newest wins.
- **chapterProgress** - LWW per `chapterId`, but effectively monotonic: a
  completion record is only ever created, never meaningfully updated.
- **curriculumProgress** - LWW per `slug`, **conditional on 3.3 below.** See
  the hazard note there; this is the one that bites.
- **examAttempts** - union by `[chapterDefinitionId, attemptNumber]`.
  Append-only, so conflicts are impossible by construction.
- **deepCheckSessions** - union by `syncId`. Append-only.
- **customComponents** - LWW per `id`, plus the delete problem in Phase 7.

### 3.3 Hydrate-before-mutate must be an enforced invariant

`curriculumProgress` holds two independently-written fields:
`manuallyCompletedAt` (the toggle) and `lastVisitedAt` (opening the chapter).
Whole-row LWW means a device that merely *visits* a chapter writes a row whose
`manuallyCompletedAt` is null, and if that write is newer it wins and destroys
a completion made elsewhere.

That is audit S1 returning through a different door. The S1 fix (read Dexie,
not memory) makes the local write correct; it does not make it correct
*relative to the server*, because a device that has not reconciled yet has no
idea a completion exists.

**The invariant: no mutator may run before reconciliation for its table has
completed.** Decided: mutators await a module-level `ready` promise. No API
change to callers, impossible to forget at a call site.

- [ ] Implement the `ready` promise gate, and add a regression test that
      mutates before reconcile resolves and asserts nothing is lost. This is
      the single most important test in the release

### 3.4 Cloud restore is lossy, and reconciliation makes that dangerous

**This escalates a known, accepted tradeoff into a real bug, and must be fixed
in this phase.**

`savedGraphs.graph` stores the domain `ArchitectureGraph`; the client runs
`toArchitectureGraph()` before POSTing, and restores via `loadGraph()`. Dexie
stores raw canvas state (`nodes`/`edges`) and restores via `loadCanvasState()`.
`ArchitectureGraph` does not carry zones or Start markers (see
`canvas/types.ts` and db.ts's own comment about exactly this).

`pending-cloud-sync.md` accepted "zones are dropped on cross-device restore"
because the cloud was only ever read when local was empty, making it a rare
edge case. Under reconciliation **the cloud can win over a device that has
local data**, so a user with zones on their canvas can now have them silently
deleted by a routine sync. That is no longer an acceptable tradeoff.

- [ ] Store raw canvas state in `savedGraphs`, not `ArchitectureGraph`, so the
      cloud round-trip is lossless
- [ ] Keep `toArchitectureGraph()` for validation only, which is what it is for
- [ ] Replace the `graph` column with `canvasState` (Postgres migration; no
      production data worth preserving)

### 3.5 Non-goals, restated

- No merge UI, no conflict prompts, no three-way merge. Single-player.
- No realtime, no websockets, no polling. Reconcile on load and on explicit
  user action only.
- No CRDTs. The correct amount of engineering for one person editing one graph
  on one device at a time is last-write-wins.

---

## Phase 4 - Write triggers and storage economics

The measured numbers are in Appendix A. Summary: **logical storage is a
non-issue and was never the risk.** The risks are compute hours and write
amplification.

### 4.1 What is actually scarce

Neon free plan, per project: **0.5 GB storage**, **100 CU-hours/month**,
**instant-restore history capped at 6 hours and 1 GB-month**.

- Storage: a user completing all 79 chapters costs roughly **800 KB**. That is
  ~600 full-completion users against 0.5 GB, before jsonb compression. Not the
  constraint.
- **Compute hours: likely binds first.** Scale-to-zero suspends after 5 minutes
  idle, and every background sync POST wakes the compute. A 2-second-debounced
  autosave pins compute awake for the entire duration of any editing session.
- **History/WAL amplification: the sharp one.** Every autosave is an UPDATE;
  Postgres MVCC writes a new tuple version each time, and that change history
  counts against the 1 GB-month cap. A 30-minute session at a 2-second debounce
  is ~300 versions of a ~10 KB jsonb, roughly **3 MB of history to store 10 KB
  of data.**

The correct read of this: it is not rows accumulating, it is *versions*
accumulating. `savedGraphs` already upserts on `${userId}:${scopeId}`, so there
has never been row growth per save and there is nothing to "delete previous
state" for.

### 4.2 Decision: sync on meaningful events, not on a timer

- [ ] **Chapters: push on Submit.** The chapter attempt is the unit that
      matters, and Submit is the moment it becomes meaningful.
- [ ] **Sandbox: push on explicit Save (button / Ctrl+S) and on unmount.**
      Sandbox has no Submit, so it needs its own trigger. Also fixes S8, where
      the sandbox unmount handler writes Dexie but never calls `syncSave` at
      all, unlike `ChapterWorkspace`.
- [ ] **Remove `syncSave` from the debounced autosave path** in
      `use-autosave.ts`. Local Dexie autosave is unchanged: still every 2
      seconds, still instant, still offline-safe. Only the network write moves.

### 4.3 The tradeoff this accepts

Submit-only means the cloud does not know about in-progress work. Starting a
design on a laptop and continuing on a desktop mid-exercise will not carry
over; only submitted attempts will. Given single-player is permanent and
mid-exercise device-hopping is not a real workflow, this is judged acceptable.

**It must be an explicit decision, not a silent consequence.** If in-progress
continuity is wanted later, the `dirty` flag from Phase 1.3 already provides
the hook: flush on tab hide (`visibilitychange`) rather than on every edit,
which costs one write per session instead of hundreds.

---

## Phase 5 - Bounds and retention

Unbounded growth is the only thing that turns a non-issue into an issue given
enough time.

### 5.1 Deep Check sessions are unbounded

`deepCheckSessions` is genuinely append-only. `saveSession`
(`src/persistence/deepCheckSessions.ts:23`) only ever adds: no cap, no pruning,
no retention policy. Each row holds a full `AiCritique` at roughly 3-5 KB. Five
runs per chapter across 79 chapters is ~395 rows, **~1.6 MB per user, double
the entire saves footprint, and growing without limit.**

- [ ] Retain the last N = 5 sessions per `saveId`, pruning on write, both
      locally and server-side
- [ ] Older sessions are deleted outright, not just left unsynced - AI
      critiques are regenerable, so aggressive pruning has no real cost

### 5.2 `AiCritique.tradeoffs` has no length bound

In `src/ai/schema.ts`, `summary` (600), `title` (80) and `body` (1500) all cap
their length. `tradeoffs[].decision` / `.cost` / `.benefit` are bare
`z.string()` with no `.max()`. A model returning a megabyte string validates
and gets stored. Inconsistent with the rest of the schema, and it is a storage
and abuse surface reachable from model output.

- [ ] Add `.max()` to all three, matching the existing conventions

### 5.3 Exam attempts

Also append-only, bounded in practice by passing the chapter but not in
principle. Rows are small. Monitor rather than cap.

- [ ] No action now. Revisit if Appendix A's per-user figure moves

---

## Phase 6 - Observability

Fixes audit S5. Cheap, and everything above is unverifiable without it.

`postSync` (`src/persistence/cloud-sync.ts:17-23`) never checks `res.ok`. A 400
from Zod, a 401 from an expired session, and a 500 from the database are all
indistinguishable from success. There is no retry, no status surface, no
console warning. **Cloud sync can be completely broken for every write with
zero signal to anyone.**

`getSync` does check `res.ok` but returns `null` on failure, and every caller
reads `null` as "no remote data exists", so a transient network error is
indistinguishable from an empty cloud. Under Phase 3 that is worse than it
sounds: a failed fetch during reconciliation would look like "the server has
nothing" and could let a stale local row win.

- [ ] `postSync` checks `res.ok`, keeps `dirty: true` on failure
- [ ] `getSync` distinguishes "failed" from "empty". Reconciliation must
      **abort**, not proceed, on a failed fetch
- [ ] A quiet, non-blocking sync status surface. Must respect the "not a game,
      motion communicates state only" principle: no toasts on success, and
      failure is surfaced the way `use-autosave.ts` already surfaces a failed
      local save

---

## Phase 7 - Deletes and tombstones

Fixes S7. Deliberately last, because under merge-on-load it becomes newly
relevant and the right answer depends on Phase 3's shape.

- **No DELETE route for `saves` exists at all.** `handleResetToStarter`
  (`ChapterWorkspace.tsx:417`) deletes the local row only. Close the tab inside
  the autosave debounce and the cloud keeps the discarded attempt, which the
  next load restores. Resurrection.
- **Merge-on-load resurrects deletes generally.** Deleting a custom component
  on device A gets re-added from B's stale copy.
- `deleteSession` sends `?id=undefined` when a row predates `syncId`, silently
  deleting nothing.

Decided: the server's set is authoritative for a table once local has flushed
its dirty rows. No tombstone column, no reaping schedule.

- [ ] Add the missing `saves` DELETE route
- [ ] Fix `deleteSession`'s undefined-id no-op

---

## Phase 8 - Verification

- [ ] Unit: reconciliation merge semantics per table, including the
      mutate-before-reconcile regression from 3.3
- [ ] Unit: clock-skew case. A device with a clock an hour fast must not win
      on the strength of its clock
- [ ] Unit: v11 migration, and that the account-change wipe fires correctly
- [ ] **Manual multi-device click-through** (carried over from
      `pending-cloud-sync.md`, still unchecked): submit on device A, open on
      device B, confirm it appears. Edit both, confirm newest wins. Sign out on
      B, sign in as a second account, confirm zero data from the first is
      visible
- [ ] Manual: zones survive a cross-device round trip (3.4)
- [ ] Full CI: `npm run typecheck && npm run lint && npm test && npm run build`

---

## Decisions - resolved 2026-08-12

All five were open with a recommendation attached; the user confirmed every
recommendation as-is. No dissent, no alternate picked. Phases 1-8 are
unblocked as of this entry.

1. **Phase 3.3 mechanism - ready-promise.** Mutators await a module-level
   `ready` promise rather than field-level timestamps. Simplest enforcement,
   makes reconciliation an invariant instead of a per-caller convention.
2. **Phase 3.4 column - replace `graph` with raw `canvasState`.** No
   production data worth preserving; a second column alongside would only add
   dead-code/schema surface. `toArchitectureGraph()` stays, scoped to
   validation only.
3. **Phase 4.2 trigger set - Submit-only confirmed.** Deliberate tradeoff:
   losing in-progress cross-device continuity is acceptable given single-player
   is permanent. Local Dexie autosave is unaffected.
4. **Phase 5.1 retention - N = 5 Deep Check sessions per `saveId`/scope.**
   Balances comparison history against unbounded append-only growth;
   critiques are regenerable so aggressive pruning has no real cost.
5. **Phase 7 delete strategy - server-authoritative set.** Local is a
   disposable cache under this release's core decision, so tombstones
   (schema + filtering + GC) buy nothing a single-player product needs.

---

## Deferred deliberately, with triggers

Recording these so they are decisions rather than oversights.

| Item | Trigger to revisit |
|---|---|
| `aiProfiles` cloud sync | Never. API keys stay in the browser, permanently out of scope |
| Realtime / multi-tab live updates | Never. Single-player is permanent |
| Offline queue with retry/backoff | If the Phase 1.3 dirty-flag flush proves insufficient in practice |
| Data export / delete-my-account | First real user outside the current group of 3, or any GDPR exposure |
| Multi-slot sandbox saves | `SANDBOX_SAVE_ID` is a fixed key. When a second sandbox board is wanted |
| Rate limiting on `/api/sync/*` | Open signup, or any abuse observed |
| Paid Neon tier | 100 CU-hours or 0.5 GB approached. Storage is $0.35/GB-month, so compute will be the reason, not storage |
| Chapter rename/delete orphaning rows | Rows are keyed by `chapterId` / `slug`. When a published chapter is first renamed or removed |
| Dexie <-> Postgres schema parity | Ongoing obligation. Still needs the `ARCHITECTURE.md` note from `pending-cloud-sync.md` |
| Timestamps stored without timezone (S11) | Fine on Vercel (UTC). If anything ever runs outside UTC |

---

## Appendix A - Measured storage figures

Measured 2026-08-12 against the real chapter definitions in
`src/content/chapters/index.ts`, not estimated.

- **~109 bytes per node+edge** serialized `ArchitectureGraph`
- Largest authored graph: 698 B (`bb-3-4-load-balancer`, 4 nodes 3 edges)
- Only 4 graphs authored so far, so the per-element figure is the reliable one

Extrapolated:

| Scenario | Size |
|---|---|
| Realistic completed exercise (20 nodes, 30 edges) | ~5.5 KB |
| Same, pessimistic with config payloads | ~10 KB |
| One user, all 79 chapters + sandbox | **~800 KB** |
| Full-completion users fitting in 0.5 GB | **~600** |
| One Deep Check session (`AiCritique`) | ~3-5 KB typical, ~14 KB at schema max |
| One user, 5 Deep Checks per chapter | **~1.6 MB** |

jsonb over ~2 KB is TOASTed and compressed, and JSON compresses 3-5x, so
on-disk will be materially below these figures. **Deep Check is the larger
per-user cost, and the only one that grows without bound.**

## Appendix B - Audit findings mapped to phases

| Finding | Severity | Phase |
|---|---|---|
| S1 `markVisited` wipes completion | Critical | **Phase 0, done.** Guarded again by 3.3 |
| S2 browser-wide Dexie, cross-account leak | Critical | Phase 2 |
| S3 backfill cross-account write | Critical | **Phase 0, done** |
| S4 hydrate-on-empty is not sync | High | Phase 3 |
| S5 sync failures invisible | High | Phase 6 |
| S6 no client-side LWW | Medium | Phase 1.2, Phase 3 |
| S7 asymmetric deletes | Medium | Phase 7 |
| S8 sandbox unmount does not sync | Medium | Phase 4.2 |
| S9 customComponents hydrate only on sandbox page | Medium | Phase 3.1 |
| S10 localStorage account-agnostic | Low | Phase 2.1 |
| S11 timestamps without timezone | Low | Deferred, see table above |
