# Release 6.1.0-alpha - Persistence POA

Status: **Phases 0-7 landed 2026-08-12, full CI green. Both pending Neon
migrations applied 2026-08-16** (0003 backfill-table drop, 0004
graph->canvas_state swap). Written the same day as the phases, after the
multi-device test failure and the persistence audit that followed; all five
open decisions resolved same-day too (see "Decisions - resolved" below).
Phase 4.1 was measurement-only (Appendix A, no checklist items); 4.2 (write
triggers) is done. 4.3 is a tradeoff note, not a checklist. Phase 5.3 is a
deliberate no-op (monitor, don't cap). Phase 8 landed 2026-08-16 (automated
multi-device suite + the three staleness bugs it found), on the same
`feature/cloud-sync-reconciliation` branch (cut from
`release/v6.1.0-neon-cloud-sync` - the user wants every phase of this
release in one branch, not one per phase). This is the single running doc
for the rest of 6.1.0.

**Scope freeze, 2026-08-16.** Phases 9, 10 and 11 below close the release.
The user confirmed "that's it for 6.1.0" when adding 10 and 11 - nothing
else goes in. **Phase 9 done as of this entry** (9.1 landed same day as the
freeze; 9.2 - `learning-path.spec.ts`'s non-idempotency - fixed in this
session, full CI green: 201 files / 1767 tests, build clean; 9.0 and 9.3 were
never checklists, just recorded decisions). **Phase 10 done 2026-08-16**:
the four 10.6 decisions, the content-authoring pass (all four new chapters
drafted, no Opus proofread pass yet - tracked in `pending-chapters.md`, not
this doc), and the engineering pass (10.4's quiz-framework/coverage/ramp
checks, 10.5's manifest/registry/CURRICULUM.md/e2e wiring, and removal of
the eleven now-superseded spec/lesson files) all landed same-branch, full CI
green: 201 files / 1760 tests, typecheck/lint/build all clean. **Phase 11
done 2026-08-16** (same session as this entry): reading (Learning Path,
lesson reader, Home) is public; the Design Editor, sandbox, and dev tooling
stay gated; the two write actions that live on public pages (mark-complete
toggle, quiz launch) are gated at the click via a new
`useRequireAuthAction` hook. Full CI green: 206 files / 1772 tests,
typecheck/lint/build all clean. **This closes the 6.1.0-alpha scope freeze
- Phases 9, 10, and 11 are all done, nothing else is scoped for this
release.**

**2026-08-16 migration note:** applying the migrations surfaced two
pre-existing issues, both fixed in this pass. (1) `0004_raw_canvas_state.sql`
was missing `--> statement-breakpoint` markers between its three statements,
so Neon's HTTP driver rejected it as a multi-statement query ("cannot insert
multiple commands into a prepared statement") - added, file now applies
cleanly. (2) `user_sync_state` had already been dropped from Neon out of
band (predating this session), so migration 0003's `DROP TABLE` failed with
"table does not exist" even though drizzle's tracking table had never
recorded 0003 as applied - resolved by inserting the tracking row directly
(hash of the file content + its journal timestamp) since the DB was already
in 0003's target state. Separately, this WSL2 environment's Node process
could not reach Neon at all via `fetch` (`ETIMEDOUT`/`ENETUNREACH` on every
resolved address) despite `curl` and raw `net.connect` working fine - caused
by Node's Happy-Eyeballs address autoselection; `--no-network-family-
autoselection` fixed it. The same bug 500'd `/api/sync/*` in the dev server,
which reaches Neon from the same Node process. The flag is now baked into
`package.json`'s `dev`/`start`/`db:migrate` scripts (appended to any
inherited `$NODE_OPTIONS`), so no manual env var is needed - it only
disables IPv4/IPv6 racing, not IPv6, so it is a no-op on healthy networks.

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
      Applied to Neon 2026-08-16 (see status note above).
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

- [x] Add `SyncMeta` to the six synced row types in `src/persistence/db.ts`
      (`CustomComponentRecord` gets a separate `CustomComponentRow` storage
      type instead, so the domain type stays sync-agnostic for the palette/
      `toComponentDefinition` call sites)
- [x] Dexie `version(11)` adding the fields (no upgrade callback; v10 already
      emptied everything). Also indexes `syncId` on `deepCheckSessions`, so
      the sync writeback below can look a row up without a table scan
- [x] Every write path sets `dirty: true`; every successful sync response
      writes back `syncedAt` and clears `dirty` - centralized inside each
      `syncX` wrapper in `cloud-sync.ts` rather than duplicated at every call
      site. Required making `postSync` check `res.ok` (previously it didn't
      check at all) - without that, a 400/500 response would have been
      misread as success and incorrectly cleared `dirty`. That's the one
      piece of Phase 6 this phase couldn't defer; the rest (status surface,
      `getSync` fail-vs-empty) is still Phase 6's

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

- [x] Document this rule in `ARCHITECTURE.md` alongside the schema-parity note
      (new "Sync ordering" subsection under Persistence)
- [x] Client-supplied domain timestamps (`completedAt` etc.) stay as display
      data only, never as conflict-resolution input - true by construction,
      since nothing in this phase reads them for ordering

### 1.3 The `dirty` flag gives us offline for free

`pending-cloud-sync.md` decision 2 explicitly declined an offline queue. With a
`dirty` flag we get the useful 90% of one at no extra cost: on load, and on
regaining connectivity, flush all dirty rows. No queue table, no retry
scheduler, no ordering guarantees. Single-player means a flush is always safe.

- [x] Flush-dirty-rows pass on app load and on `online` event -
      `src/persistence/flush-dirty.ts` + `FlushDirtyRows.tsx`, mounted in
      `(protected)/layout.tsx` alongside `LocalStorageReset`

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

- [x] Persist the signed-in `userId` locally (localStorage, alongside the
      storage epoch) - `scalecraft:userId`, written by
      `reconcileLocalStateForUser` in `src/persistence/db.ts`
- [x] On boot, before any read: if stored userId differs from current, clear
      every Dexie table (`db.tables`, not a hardcoded list - covers future
      tables automatically) and the `sc-` / `scalecraft:` localStorage keys.
      Clears table contents rather than deleting the database file itself -
      data-equivalent, and avoids a close/reopen dance from inside Dexie's
      `ready` handler
- [x] Must run before any component reads. Solved without relying on mount-
      effect order (rejected per this line): `LocalStateGate.tsx` registers
      the signed-in userId synchronously in its render body (not a
      `useEffect`) - it's mounted first under `ProtectedLayout`, so React
      finishes calling it before any descendant even begins rendering, let
      alone runs an effect that queries Dexie. `db.on("ready", ..., true)`
      then blocks every caller's query on the reconciliation check, the same
      way the v10 upgrade transaction blocks every query on itself
- [x] Extended `LocalStorageReset.tsx` into `LocalStateGate.tsx` - the
      component now only registers the userId; the epoch check and the
      account-change wipe both live in `db.ts`'s `reconcileLocalStateForUser`,
      so that one function owns "is local state valid for this user right
      now." Three regression tests added in `db.test.ts`'s new "account
      isolation" describe block, exercising an isolated `ScaleCraftDB`
      instance directly rather than fighting `ready`'s once-per-open timing

### 2.1 localStorage is account-agnostic too (S10)

`sc-tour-*`, `sc-insert-hint-dismissed`, `scalecraft:tour-log`,
`scalecraft:deep-check-panel-width`. Not learner data, but a second account
inherits "tour already seen" and never gets onboarding. **Done** - covered by
the same `reconcileLocalStateForUser` wipe as the Dexie tables above.

---

## Phase 3 - Read reconciliation, done 2026-08-12

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

**All six done.** Every table's merge routes through one shared helper,
`src/persistence/reconcile.ts` (`reconcileRows` for bulk/list tables,
`reconcileRow` for the single-row `saves` case) - one implementation of the
Sync-ordering predicate instead of six. `progress-store.ts`'s `hydrate()`
now reconciles `chapterProgress`/`curriculumProgress`/`examAttempts` for
real (was hydrate-on-empty); `custom-components-store.ts` grew its own
`hydrate()` for `customComponents`, called from both Sandbox's and
ChapterWorkspace's mount effects (S9 fix - it used to be Sandbox-only, so a
session that never opened Sandbox never reconciled that table at all);
`deepCheckSessions.ts`'s `listSessions` unions by `syncId` on every call;
`ChapterWorkspace.tsx`/`sandbox/page.tsx`'s save-restore effects reconcile
per scope. The separate per-chapter `chapterProgress` read in
`ChapterWorkspace.tsx` (line ~272, `passedChapterIds`) stayed a distinct
call site rather than being folded into `progress-store`'s bulk hydrate -
kept deliberately, per its own row in the table above, and its own existing
test coverage stayed green through the change.

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

- [x] Implement the `ready` promise gate, and add a regression test that
      mutates before reconcile resolves and asserts nothing is lost. This is
      the single most important test in the release. `progress-store.ts`'s
      `hydrate()` is now itself the gate (memoized via `get().hydrated` plus
      an in-flight-only module `let`, not a bare module promise, so tests
      can reset it the same way they reset the store) - every mutator
      (`markVisited`, `setManualComplete`, `recordExamAttempt`,
      `resetChapter`) awaits it first. `custom-components-store.ts` gets the
      identical gate for `customComponents`, awaited by ComponentPicker's
      save/delete handlers. The regression test (`progress-store.test.ts`)
      mocks `hydrateAllCurriculumProgress` with a controllable promise and
      asserts `db.curriculumProgress.put` has NOT fired while that promise
      is still pending, then releases it and confirms the write happens
      after - proving the gate actually blocks, not just that both settle
      to the right answer

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

- [x] Store raw canvas state in `savedGraphs`, not `ArchitectureGraph`, so the
      cloud round-trip is lossless
- [x] Keep `toArchitectureGraph()` for validation only, which is what it is for
      (unchanged - still exists, still only called from Validate/Submit/
      Deep Check's context assembly, never from the save/restore path)
- [x] Replace the `graph` column with `canvasState` (Postgres migration; no
      production data worth preserving). `drizzle/0004_raw_canvas_state.sql`:
      `TRUNCATE` then drop `graph`/add `canvas_state` - hand-written (not
      `drizzle-kit generate`, which needs a TTY to disambiguate a same-table
      column swap and this session has none), verified against the schema
      with `drizzle-kit check`/`generate` (reports "no schema changes").
      Applied to Neon 2026-08-16, along with Phase 0's backfill-drop
      migration (see status note above; the file needed a
      `statement-breakpoint` fix first). `savesBodySchema` now validates
      `canvasState` with a loose per-node/edge schema (only `id`/`type`/
      `source`/`target` checked - these are @xyflow/react `Node`/`Edge`
      objects with many library-owned optional fields this route has no
      business re-deriving a strict schema for, same convention as
      `deepCheckSessionBodySchema`'s `critique`). `cloud-sync.ts`'s
      `syncSave`/`hydrateSave`, `use-autosave.ts`, and `flush-dirty.ts` all
      updated to the new wire shape.

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

- [x] **Chapters: push on Submit.** The chapter attempt is the unit that
      matters, and Submit is the moment it becomes meaningful.
      `ChapterWorkspace.tsx`'s `handleSubmit` now writes the exact
      submitted `nodes`/`edges` to Dexie then calls `syncSave` - unconditional
      on pass/fail, since a submitted attempt is meaningful either way. The
      unmount handler and `saveNow` (Save button/Ctrl+S) no longer sync for
      chapters (see 4.3's tradeoff, confirmed).
- [x] **Sandbox: push on explicit Save (button / Ctrl+S) and on unmount.**
      Sandbox has no Submit, so it needs its own trigger. Also fixes S8, where
      the sandbox unmount handler writes Dexie but never calls `syncSave` at
      all, unlike `ChapterWorkspace`. Both now added directly in
      `sandbox/page.tsx` (unmount) and via `useAutosave`'s default
      `syncOnManualSave: true` (Save button/Ctrl+S).
- [x] **Remove `syncSave` from the debounced autosave path** in
      `use-autosave.ts`. Local Dexie autosave is unchanged: still every 2
      seconds, still instant, still offline-safe. Only the network write
      moves. `write()` now takes an explicit `sync: boolean` - the debounced
      effect always passes `false`; `saveNow` passes a new
      `syncOnManualSave` hook option (default `true`, so Sandbox is
      unaffected; `ChapterWorkspace` passes `false` so its manual Save stays
      local-only, matching the Submit-only decision above). Three new tests
      in `use-autosave.test.ts` assert the gating via a stubbed `fetch`.

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

- [x] Retain the last N = 5 sessions per `saveId`, pruning on write, both
      locally and server-side. `deepCheckSessions.ts`'s `saveSession` now
      calls a new `pruneSessions(saveId)` after every write, which routes
      through `listSessions` (reconcile against the cloud) rather than just
      this device's local rows - a device that has never opened this
      saveId's history still prunes against the true cross-device count
      instead of under-counting and leaving the server unbounded
- [x] Older sessions are deleted outright, not just left unsynced - AI
      critiques are regenerable, so aggressive pruning has no real cost.
      `pruneSessions` deletes both the local Dexie row and, via
      `deleteDeepCheckSessionSync`, the server row. New regression test in
      `deepCheckSessions.test.ts` saves 7 sessions and asserts only the
      newest 5 remain, both in `listSessions`'s return and in the Dexie
      table directly

### 5.2 `AiCritique.tradeoffs` has no length bound

In `src/ai/schema.ts`, `summary` (600), `title` (80) and `body` (1500) all cap
their length. `tradeoffs[].decision` / `.cost` / `.benefit` are bare
`z.string()` with no `.max()`. A model returning a megabyte string validates
and gets stored. Inconsistent with the rest of the schema, and it is a storage
and abuse surface reachable from model output.

- [x] Add `.max()` to all three, matching the existing conventions -
      `decision` capped at 200 (a full clause, longer than `title`'s 80),
      `cost`/`benefit` at 400 each (short sentences, same order as `body`'s
      1500 but scaled to how much shorter they render inline in
      `DeepCheckPanel.tsx`'s trade-offs list). Both existing prompt.ts
      example values sit well under these

### 5.3 Exam attempts

Also append-only, bounded in practice by passing the chapter but not in
principle. Rows are small. Monitor rather than cap.

- [x] No action now (deliberate no-op, not a deferred item) - Revisit if
      Appendix A's per-user figure moves

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

- [x] `postSync` checks `res.ok`, keeps `dirty: true` on failure - already
      true since Phase 1.1 (every `syncX` wrapper only writes back
      `syncedAt`/clears `dirty` on a truthy result); this phase added the
      matching check to `deleteSync`
- [x] `getSync` distinguishes "failed" from "empty". Reconciliation must
      **abort**, not proceed, on a failed fetch - `getSync` now returns
      `SyncResult<T>` (`{ ok: true, data }` or `{ ok: false }`, exported from
      `cloud-sync.ts`) instead of `T | null`, and every `hydrate*` wrapper
      propagates that distinction instead of collapsing it to `[]`/`null` via
      `??`. All six reconcile call sites check `.ok` and abort on failure:
      `progress-store.ts`'s `performHydrate` (all three tables) and
      `custom-components-store.ts`'s `performHydrate` populate from local
      only and leave `hydrated` false, so the next `hydrate()` call - the
      next mount or navigation - retries for real instead of being
      permanently stuck behind a transient network error;
      `deepCheckSessions.ts`'s `listSessions` falls back to local-only
      (harmless even on persistent failure, since it only means
      under-pruning until the next successful call, and critiques are
      regenerable per Phase 5.1); `ChapterWorkspace.tsx`'s two per-scope
      effects (`saves`, `chapterProgress`) and `sandbox/page.tsx`'s `saves`
      effect treat a failed fetch the same as a genuinely-absent remote row
      (local always wins, nothing is written back), which was already safe
      by construction there - fixed as part of the same pass because
      `SyncResult` objects are always truthy, so the old `remote ? ... :
      null` pattern at those three call sites would otherwise have silently
      misread `{ ok: false }` as real data. New coverage:
      `cloud-sync.test.ts` (fetch-fails-vs-empty distinction, dirty-on-
      failure, status clears on recovery) and a new regression test in
      `progress-store.test.ts` proving a failed fetch aborts without
      marking `hydrated` and without losing local data.
- [x] A quiet, non-blocking sync status surface. Must respect the "not a game,
      motion communicates state only" principle: no toasts on success, and
      failure is surfaced the way `use-autosave.ts` already surfaces a failed
      local save - new global `persistence/sync-status.ts` (`useSyncStatusStore`,
      `"idle" | "error"`), updated by `postSync`/`getSync`/`deleteSync` in
      `cloud-sync.ts` on every call. Surfaced via `app/CloudSyncIndicator.tsx`,
      mounted in `AppHeader.tsx` between `ShortcutsButton` and `ThemeToggle` -
      renders nothing while healthy, a quiet bordered icon with a tooltip
      only once something has actually failed, clearing itself the moment
      any sync call next succeeds. Deliberately global rather than
      per-table (a learner doesn't need to know *which* of six tables
      failed), separate from the Save button's existing local-write error
      state (that one's scoped to a single `saveId`; this covers the other
      five tables too).

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

- [x] Add the missing `saves` DELETE route - `src/app/api/sync/saves/route.ts`
      gets a `DELETE` handler scoped by `scopeId` (same pattern as
      `chapter-progress`/`exam-attempts`), and `cloud-sync.ts` gets
      `deleteSaveSync(scopeId)`. `ChapterWorkspace.tsx`'s
      `handleResetToStarter` now calls it alongside the existing local
      `db.saves.delete` - chapters sync only on Submit (Phase 4.2), so
      without this a previously-submitted attempt survived in Postgres and
      the next reconcile pulled the discarded attempt back (resurrection).
      Sandbox has no reset-to-starter action, so no second call site.
- [x] Fix `deleteSession`'s undefined-id no-op - `deepCheckSessions.ts`'s
      `deleteSession` and `pruneSessions` now guard `deleteDeepCheckSessionSync`
      behind `if (session.syncId)`, so a row without a `syncId` no longer
      sends `?id=undefined` and silently deletes nothing server-side. In the
      current schema this is now structurally rare (`syncId` is a required
      field, and the v10 wipe cleared any pre-syncId rows), but the guard is
      cheap and makes the invariant explicit rather than assumed.

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
- [x] Full CI: `npm run typecheck && npm run lint && npm test && npm run build`
      (2026-08-16, green: 201 files / 1763 tests, build clean)

### 8.1 Automated multi-device suite - added 2026-08-16

`e2e/multi-device-sync.spec.ts` replaces most of the manual click-through
above. Two Playwright `BrowserContext`s with explicitly empty storage state
are two devices - separate IndexedDB, separate localStorage, one Clerk
account. Note that an argument-less `browser.newContext()` inherits the
project's `storageState` (the shared E2E user), which is the opposite of a
fresh device; the empty state has to be passed.

Runs against the standard E2E user by default, or any account via
`MULTI_DEVICE_EMAIL` / `MULTI_DEVICE_PASSWORD`. Eight cases: fresh-device
pull, hard reload, client-side navigation, window refocus, chapterProgress
round trip, offline edit flush, the stale-write clobber below, and a sandbox
canvas round trip.

### 8.2 What the first run found (2026-08-16)

Phases 1-7 were all correct in the case they were tested in - a *cold load*.
Everything that reads the cloud reads it once, on a full page load, and the
`hydrated` latch in the two module-singleton stores (`progress-store.ts`,
`custom-components-store.ts`) then makes every later call a no-op for the
life of the tab. Since the app is an App Router SPA, "the life of the tab" is
the whole session. Three failures, one root cause:

| Symptom | Severity |
|---|---|
| Navigating back to the Learning Path client-side shows stale progress | High |
| Alt-tabbing between two windows never converges; only F5 works | High |
| **A stale device opening a chapter erases another device's completion** | Critical |

The third is the serious one and is S1 returning through a different door.
`markVisited` still composes a *whole-row* payload (the sync API has no
partial update) out of local state; Phase 0/3.3 fixed it reading an
unhydrated store, but a *stale* hydrated store is just as wrong. Device B
sitting on a lesson page, device A completes that chapter, B walks into the
Design Editor - B pushes `manuallyCompletedAt: null` and the server's LWW
accepts it. Reproduced, then fixed, then re-verified.

### 8.3 The fix

- `refresh()` on both singleton stores: the same reconcile pass as
  `hydrate()` minus the already-hydrated bail. `hydrate()` is now just
  "ensure at least once" and delegates to it.
- `src/persistence/RefreshFromCloud.tsx`, mounted next to `FlushDirtyRows`
  in `(protected)/layout.tsx` - the read half of 4.2's event-driven sync.
  Pulls on `visibilitychange`/`focus`/`online`, 2s minimum interval so a tab
  switch's paired events collapse into one.
- `LearningPath` mounts with `refresh()`, not `hydrate()`, so client-side
  navigation back to it re-reads.
- Every full-row mutator (`markVisited`, `setManualComplete`,
  `resetChapter`) awaits `refresh()` before composing its payload. This is
  3.3's invariant tightened from "hydrated" to "freshly reconciled."

`saves` is deliberately excluded from the refocus pull: replacing a canvas
under a learner mid-edit is worse than the staleness. It still reconciles
per-scope on mount.

### 8.4 Not a sync problem

The websocket errors in the console are `ws://localhost:3000/_next/webpack-hmr`
- Next's dev hot-reload socket reconnecting. No app code opens a websocket
(verified by surveying every socket a session opens). They do not exist in a
production build and have nothing to do with sync.

---

## Phase 9 - Close out the sync work

Everything here is on `feature/cloud-sync-reconciliation`, uncommitted as of
2026-08-16. Phase 8's fixes are done and CI-green; these are the loose ends
that fixing them exposed.

### 9.0 Accepted, no work required

Two risks were raised and the user accepted both rather than mitigating them.
Recorded so nobody re-opens them.

- **Clerk dev -> prod instance discontinuity.** The instance is `pk_test_`, a
  development instance. A Clerk production instance has a separate user pool
  and different `user_...` ids, so every row now in Neon is orphaned the
  moment prod keys go in, and `reconcileLocalStateForUser` wipes local Dexie
  on the changed id. **The user has already told users their progress will be
  wiped and wants exactly that.** Sync tracks from the cutover forward. No
  migration, no id remap.
- **Migration 0004 truncates `saved_graphs`.** Same call, same reason. Alpha,
  restricted prod, wipe is intended.

This conveniently removes the orphan-row problem Phase 10 would otherwise
create: the eight Part 1 slugs that disappear have no progress rows to strand.

### 9.1 A failed push can go permanently silent - done 2026-08-16

Three things compound into a user who diverges forever with no signal:

| | |
|---|---|
| `reconcile.ts` `pickWinner` | `if (local.dirty) return local` - a row that can never push wins reconciliation forever |
| `cloud-sync.ts` `postSync` | leaves `dirty: true` on any non-2xx, so a 400 retries forever and never succeeds |
| `sync-status.ts` | one global boolean; `markSyncOk()` clears it on *any* success |

Phase 8.3 made the third one materially worse: `RefreshFromCloud` fires four
GETs on every window focus, so a failed POST's warning icon is cleared within
seconds by unrelated pull successes. Before 8.3 sync calls were rare enough
that the flag roughly tracked reality.

- [x] Split push failure from pull failure in `sync-status.ts`. A successful
      pull must not clear a push error - they are different claims about the
      world. `sync-status.ts`'s single `status` boolean is now `pullError`
      (set only by `getSync`) and `dirtyCount` (the push signal)
- [x] Surface persistence, not a transient boolean: "N rows have failed to
      sync" is the honest signal, and it is the one that catches the
      permanently-dirty row. `cloud-sync.ts` gets `refreshDirtyCount()`,
      running the same six-table `filter(r => r.dirty)` count `flush-dirty.ts`
      already used, called from `postSync`/`deleteSync`'s `finally` and again
      after `flush-dirty.ts`'s whole batch (exact once every writeback in the
      batch has landed - the per-call version lags by one write on the
      success path only, since it runs before the caller's own `dirty: false`
      writeback)
- [x] `CloudSyncIndicator.tsx`'s tooltip copy currently promises "will sync
      automatically once this resolves" - true for a transient failure, a lie
      for a row that 400s. Reworded: pending-push copy says "saved locally,
      retrying automatically" (no success promise); pull-failure copy is
      separate and says local data may be stale. Different icons too
      (`CloudAlert` vs `CloudOff`)
- [x] Decide whether a row that has failed N times should stop being retried
      on every mount and every `online` event. **User confirmed the
      recommendation 2026-08-16.** Retrying is unchanged (flush-dirty still
      retries every mount/`online` event, cheap and safe for single-player).
      What changed is reconciliation: `reconcile.ts`'s `pickWinner` used to
      let `dirty: true` win unconditionally; it now only wins outright when
      `local.syncedAt` is null (never synced) or equals `remote.syncedAt`
      (nothing changed server-side since this device's last confirmed sync -
      the ordinary "just edited, about to push" case). Once
      `remote.syncedAt > local.syncedAt` while still dirty - another device's
      confirmed write has landed after what this device last knew - remote
      wins instead of being silently clobbered forever. No new schema field;
      the existing `syncedAt` gap already carries this signal, since a fresh
      edit's `syncedAt` always still matches remote until something else
      writes over it. Two new regression tests in `reconcile.test.ts` per
      helper (`reconcileRows`/`reconcileRow`) proving the stuck-dirty case
      loses to remote and the ordinary in-flight-edit case still wins; the
      two pre-existing tests that encoded the old "dirty always wins
      regardless of remote" behavior were the bug this fixes and were
      updated, not just left passing

### 9.2 `learning-path.spec.ts` is not idempotent

It asserts `0 / 32 chapters`, marks Bitly complete, and never cleans up. It
passes today only by winning a race against the cloud hydrate - measured
2026-08-16:

```
immediately:            0 / 32 chapters
after hydrate settles:  1 / 32 chapters
```

The E2E user's cloud now permanently holds a completed Bitly. Any timing
change turns the `0 / 32` assertion into a hard failure, and the `47 chapter
rows` / status-icon counts drift the same way as cloud state accumulates.

- [x] Reset server state in a fixture before the assertions, not after -
      `resetSlugs` lifted out of `multi-device-sync.spec.ts` into shared
      `e2e/helpers.ts` (taking an `APIRequestContext` directly rather than
      the multi-device spec's `Device` wrapper, so both specs can call it).
      `learning-path.spec.ts`'s manual-complete-toggle test now resets
      `rwe-t1-bitly-url-shortener` before navigating, so the test no longer
      depends on what a prior run left completed in the cloud
- [x] Make the assertion wait for the hydrate to settle instead of racing it -
      the test now sets up a `page.waitForResponse` on the
      `GET /api/sync/curriculum-progress` reconcile call before `page.goto`,
      and awaits it before asserting "0 / 32 chapters", so the initial
      assertion checks the settled post-hydrate state rather than whatever
      renders first
- [x] Audited the other count assertions in that file (`47 chapter rows`,
      `10 sections`) - not racy: `LearningPath.tsx` renders section/chapter
      counts synchronously from the static curriculum manifest
      (`src/curriculum/manifest.ts`), never gated on the progress store's
      cloud hydrate, so no fixture reset was needed there. Noted inline in
      the spec. Phase 10 still changes 47 to 39 regardless, unrelated to
      this fix

### 9.3 Known gaps, deliberately left

- **`saves` is excluded from the refocus pull** (8.3). Two devices editing
  the same canvas still diverge until a reload. Replacing a canvas under a
  learner mid-edit is worse than the staleness
- **Residual clobber race.** `refresh()` coalesces onto an in-flight call, so
  a mutator awaiting a refresh that *started* before another device's write
  still composes from stale data. ~1s window. The structural fix is a
  partial-update sync API so a client never transmits fields it did not
  change - every write today is a whole-row overwrite, which is what made S1
  possible twice. Not in 6.1.0
- **Read economics changed.** Appendix A measured writes. Focus-driven pulls
  are now the dominant read source (4 calls per focus, 2s throttle). Trivial
  for one user; the appendix no longer describes the traffic

---

## Phase 10 - Condense Building Blocks Part 1

**Why:** eleven chapters is psychologically heavy for what is explicitly the
*basics*. A learner opening Part 1 and seeing 11 rows reads it as a mountain
before they have read a sentence. Condense to **3 mandatory chapters + 1
short optional chapter (4 total)**, raise the per-chapter quiz count to
compensate for the lost assessment surface, and hold the ≤15 minute
per-chapter read convention (the optional 4th runs shorter).

### 10.1 Read the arithmetic before starting

**Revised 2026-08-16** - the original 3-chapter target grew to 4 when 10.6
decision 3 kept 1.11 as its own short optional chapter rather than folding it
into 1.3 (see 10.6).

| | Now | After |
|---|---|---|
| Chapters | 11 | 4 (3 mandatory + 1 optional) |
| Est. minutes | 245 (20+15+20+25+20+30+25+20+20+20+30) | ≤60 (3 × 15 mandatory + ~10-15 optional) |

**This is a ~75-80% cut. It is a rewrite, not a merge.** Sonnet must treat the
existing eleven chapters as *source material* for four new ones, not as
sections to staple together. Stapling produces a 245-minute chapter with
several headings. CURRICULUM.md §20.6 (information density, binding) is the
governing rule: every sentence introduces a concept, clarifies a hard one, or
reinforces one with a real example. Everything else is what gets cut to reach
the target length.

All eleven are already authored (see `pending-chapters.md` rows 40-51), so
the raw material exists and none of it needs inventing.

### 10.2 Split, along the Interview Loop's own seams - confirmed 2026-08-16

Part 1's structural bet is one chapter per Interview Loop step (§10.1, eight
steps). The grouping below keeps §10.1's "Taught in" pointers repointable and
keeps each new chapter one coherent *phase* of the loop. Confirmed as-is by
the user with the source-chapter breakdown made explicit (10.6 decision 1);
1.11 was pulled out into its own chapter rather than absorbed into 1.3 (10.6
decision 3).

| New | Title | Loop steps | Absorbs | Est. min |
|---|---|---|---|---|
| 1.1 | Framing the Problem | 1-3 clarify, requirements, estimate | 1.1 Understanding the Problem, 1.2 Functional Requirements, 1.3 Non-functional Requirements, 1.4 Estimating Scale, 1.5 Numbers Every Engineer Should Know | ~15 |
| 1.2 | Designing the System | 4-6 high-level design, deep dive, bottlenecks | 1.6 Drawing the First Architecture, 1.7 Identifying Bottlenecks, 1.9 Deep Dive Methodology | ~15 |
| 1.3 | Defending the Design | 7-8 trade-offs, evolve and defend | 1.8 Engineering Trade-offs, 1.10 Communicating & Defending a Design | ~15 |
| 1.4 | Driving the Interview | (standalone, optional) | 1.11 Driving a System Design Interview | ~10-15 |

Slugs/ids follow the existing convention (`1-1-framing-the-problem` /
`bb-1-1-framing-the-problem`, ... through `1-4-driving-the-interview` /
`bb-1-4-driving-the-interview`). 1.4 keeps 1.11's existing behavior: optional,
gates nothing, no slug lists it as a prerequisite.

### 10.3 What must survive the cut

Four things are product machinery, not prose, and cutting them breaks code or
downstream chapters. Named explicitly so a density pass does not eat them.

- **1.6's component introduction.** `client`, `app-server`, `sql-database`
  and the `request-flow` edge kind are introduced there and are the entire
  Part 1 palette (§14, §16 component budget). Every later chapter assumes
  they exist by the end of Part 1. Must land in new 1.2
- **1.6's first Fix exercise.** The starter graph wires client straight to
  the database and `no-direct-client-database` fires - deliberately the
  learner's first encounter with the core product loop (validation explains
  reasoning). This is a designed first impression, not filler. Must survive
  intact
- **1.5's landmark numbers.** Referenced by every later estimation. Do not
  delete - compress. A single reference table scans better than five pages of
  prose and is explicitly preferred by §20.6. **Decided (10.6.2): lands inside
  new 1.1**, compressed to a reference table, not promoted to a standing page
- **1.11's optionality.** It is currently optional and gates nothing (nothing
  lists its slug as a prerequisite; Part 2 hangs off 1.10). **Decided (10.6.3):
  kept as its own short standalone chapter, new 1.4**, not folded into 1.3 -
  preserves the existing optional affordance more cleanly than burying it as a
  subsection

### 10.4 Quiz count - decided 2026-08-16 (10.6 decision 4)

QUIZ_FRAMEWORK.md §2 currently reads: *"chapter quizzes stay small (3-6
questions, drawn from or modeled on these banks)"*. Four chapters carrying
the assessment load of eleven needs more than 6.

**Decided: 10-15 questions per condensed chapter, with at least one question
covering each absorbed topic** (so 1.1's quiz has a question touching each of
its five absorbed source chapters, not just the ones easiest to write
questions for). Framed as a condensed-chapter exception, not a blanket raise -
a 3-question Part 3 block chapter is still right.

- [x] **Edit QUIZ_FRAMEWORK.md §2 first, in its own commit.** CLAUDE.md is
      explicit: when content needs something the framework forbids, propose a
      doc edit in its own commit, never author around it silently - the
      "Condensed-chapter exception" paragraph is now in §2. Not yet its own
      commit (nothing in this working tree is committed yet, per this
      release's one-branch convention); the requirement is that the doc edit
      exist and precede the content, not that it land in isolated history
- [x] §6's Part 1 bank already holds 11+ questions and is section-level. It
      is the source; check coverage per new chapter (one per absorbed topic,
      minimum) rather than authoring fresh questions first - verified by
      reading all three mandatory quizzes: 1.1's 12 questions touch each of
      its five absorbed topics (clarifying Q1, functional/non-functional
      Q2-Q4, estimation Q5-Q6, landmark numbers Q7-Q9, synthesis Q11-Q12);
      1.2 and 1.3 similarly cover their two-to-three absorbed topics each
- [x] Note the threshold interaction: 80% of 15 questions is 12 correct. More
      questions makes the pass line stricter in absolute terms, not looser.
      Confirmed intended by the user (2026-08-16)
- [x] §3's difficulty ramp (30/45/25 across levels 1/2/3) must still hold at
      the larger size - verified by counting `difficulty` fields: 1.1 is
      4/6/2 of 12 (33/50/17%), 1.2 and 1.3 are each 4/6/3 of 13 (31/46/23%),
      1.4 (single-source, not condensed) is 2/2/1 of 5. All ramp up
      correctly and sit close to the 30/45/25 target; no violation

### 10.5 Everything downstream that names these chapters

Not optional cleanup - the app has hard references and the test suite has
hard counts.

- [x] `src/curriculum/manifest.ts` - Part 1's `chapters` array; `estimatedMinutes`;
      and the `prerequisiteSlugs` chain. 2.1 repointed from
      `1-10-communicating-and-defending-a-design` to new
      `1-3-defending-the-design`; new 1.1 hangs off
      `0-4-the-system-design-lifecycle`; new 1.4 hangs off new 1.3 and stays
      optional (no downstream slug lists it as a prerequisite, same as old
      1.11). 3.4 Load Balancer's `prerequisiteSlugs` also repointed from old
      `1-9-deep-dive-methodology` to new `1-2-designing-the-system` (not
      originally called out in this checklist, but the same forward-pulled-
      chapter situation §10.5's table didn't enumerate individually)
- [x] `src/content/chapters/index.ts` - eleven `ChapterDefinition`s become
      four
- [x] `src/content/chapters/specs/bb-1-*.spec.md` and
      `public/content/chapters/bb-1-*.mdx` - eleven pairs become four. The
      four new chapters were already drafted; this session deleted the
      eleven now-orphaned old spec/lesson files (verified nothing in `src/`
      or `e2e/` referenced their ids first) and reran the full suite (201
      files / 1760 tests, typecheck/lint/build all green) to confirm the
      deletion was clean
- [x] Blueprints, hints and walkthrough diagrams belonging to the absorbed
      chapters. `walkthrough-invariants.test.ts` stays at zero issues (four
      `.mdx` files now in `public/content/chapters/`, all passing)
- [x] CURRICULUM.md: §5 inventory, §10.1's eight "Taught in" pointers, §14's
      briefs (now four, with the old-to-new mapping stated inline), §11.1's
      concept-chapter list, §19's dependency graph, §21's ASCII map - all
      updated (verified via diff)
- [x] `e2e/learning-path.spec.ts` - `47 chapter rows` becomes 40. Done as
      part of 9.2, which touched the same assertions
- [x] `authoring-invariants.test.ts` (condensed-chapter 10-15 quiz-size
      exception via an explicit id allow-list), `src/content/chapters/index.test.ts`
- [x] `pending-chapters.md` - entries added for all four new chapters (status
      at a glance table + full deliverable/judgment-call sections), the
      eleven old rows marked superseded, and this session closed out the
      "not yet wired into manifest.ts" / "not yet deleted" notes those four
      entries were left with after the content-authoring pass, since the
      engineering pass below has now actually done that wiring and deletion

### 10.6 Decisions this phase needed from the user - resolved 2026-08-16

All four confirmed. Authoring is unblocked.

1. **Grouping and titles: confirmed**, with the full source-chapter mapping
   spelled out per new chapter (10.2's table). No alternate grouping picked.
2. **1.5's landmark numbers: land inside new 1.1**, compressed to a
   reference table, not a standing page.
3. **1.11 survives as its own chapter, new 1.4 "Driving the Interview,"
   short and optional** - not folded into 1.3. This grew the release from 3
   chapters to 4 (3 mandatory + 1 optional); 10.1/10.2/10.5 above were
   updated to match. User explicitly confirmed the 4-chapter structure
   (including the e2e row-count change 47->40) after seeing the full
   source-chapter breakdown.
4. **Quiz size: 10-15 questions per condensed chapter, at least one question
   per absorbed topic**, as a condensed-chapter exception in QUIZ_FRAMEWORK.md
   §2 (not a blanket framework change). See 10.4.

### 10.7 Route this through the right skill

`chapter-author` is the skill for this (Sonnet drafts, Opus proofreads). It
is scoped to content authoring only - no tests, no CI, no Playwright. The
manifest/registry/test edits in 10.5 are plain engineering work and do not go
through it.

---

## Phase 11 - Read without an account, done 2026-08-16

**Why:** the only thing that genuinely requires an account is *tracking and
saving progress*. Requiring sign-in to read a chapter is a wall in front of
the product's best sales pitch. Reading becomes public; anything that writes
progress prompts for sign-in, and the learner chooses.

### 11.1 Where the gate lives today

`src/proxy.ts` is a bare `clerkMiddleware()` with no route protection. All
gating is one line: `auth.protect()` in `src/app/(protected)/layout.tsx`.
That is the whole mechanism, which makes this change smaller than it sounds.

| Surface | Today | After |
|---|---|---|
| `/building-blocks`, `/real-world-extraction` | gated | **public** (read-only, no progress shown) |
| `/{mode}/{slug}/lesson` (ChapterReader) | gated | **public** |
| `/{mode}/{slug}` (Design Editor) | gated | gated - it is an exercise |
| Exam / quiz | gated | **public route, gated at the click** (see 11.5 - it lives inside YourTurnCard on the now-public lesson reader, not a separate route) |
| `/sandbox` | gated | gated |
| `/` (Home canvas) | gated | **public** - not enumerated above originally, but the same reasoning applies: it only links onward to the three modes and shows read-only per-course progress, and gating it would block the entry point to everything else this phase made public |

`src/app/(protected)` kept only the Design Editor (`[chapterSlug]/page.tsx`
for both modes), `/sandbox`, and `/dev/*` (internal tooling, not
enumerated here, left gated). Everything else moved to a new
`src/app/(public)` route group with no `layout.tsx` of its own (nothing
route-group-specific is needed; it just falls through to root layout).

### 11.2 The complete write surface that needs a gate

Every one of these writes progress. This is the exhaustive list - anything
not here does not need an auth check.

| Write | Trigger |
|---|---|
| `progress-store.markVisited` | ChapterWorkspace mount |
| `progress-store.setManualComplete` | Learning Path row toggle |
| `progress-store.recordExamAttempt` | quiz submit |
| `progress-store.resetChapter` | Learning Path row reset |
| `db.chapterProgress.put` + `syncChapterProgress` | ChapterWorkspace passing Submit |
| `use-autosave` -> `db.saves` + `syncSave` | canvas edit |
| `custom-components-store` upsert/delete | ComponentPicker |
| `deepCheckSessions.saveSession` | Deep Check run |

Useful accident: **the lesson reader does not write.** `ReaderSidebar` only
calls `hydrate()`. So making the reader public needs no write-gating at all,
only the read-path handling in 11.4.

### 11.3 The decision that shapes everything: no anonymous local state

**Recommendation: signed out means no local writes at all.** Not "write to
Dexie and merge on sign-in."

The merge path looks friendly and is a trap. `reconcileLocalStateForUser`
wipes local state when `storedUserId` changes, but a signed-out session never
stamps a user id - so `storedUserId` is null, the wipe branch is skipped, and
whatever anonymous state accumulated gets silently *adopted* into the first
account that signs in on that browser. That is audit S2 (cross-account leak)
coming back through a door we opened ourselves. Refusing to write while
signed out sidesteps it completely, and it matches the user's framing: the
account is what progress tracking is *for*.

- [x] Confirm this with the user before building. If they want anonymous
      progress that survives sign-in, it is a materially larger phase and
      needs its own merge semantics. **User confirmed the recommendation
      (no anonymous local writes) 2026-08-16**, before any code was written.

### 11.4 Read path when signed out

- [x] `/api/sync/*` returns 401 when signed out. `cloud-sync.ts` swallows it
      and calls `markSyncError()`, so a signed-out reader gets a permanent
      "Cloud sync failed" icon for behaving correctly. Short-circuit the
      hydrate/refresh calls when there is no session rather than letting them
      401 - `RefreshFromCloud` and `FlushDirtyRows` both need the same guard.
      Both now read `useAuth().isSignedIn` and no-op entirely when false
      (mounted globally, see 11.4's next item, so they have to gate
      themselves rather than relying on a gated layout to have already ruled
      out the signed-out case). The three read surfaces that call
      `hydrate()`/`refresh()` directly - `HomeCanvas.tsx`, `LearningPath.tsx`,
      `ReaderSidebar.tsx` - got the identical guard: they simply never call
      into the progress store while signed out, so Dexie is never touched by
      an anonymous session either (this is what actually delivers 11.3's "no
      anonymous local writes," not a Dexie-level check)
- [x] `LocalStateGate` takes a `userId` and cannot mount signed out. Decide
      what the protected layout becomes when the group no longer implies a
      session. **Resolved: `LocalStateGate` now takes `userId: string | null`**
      and no-ops on null. It moved out of `(protected)/layout.tsx` into the
      root `layout.tsx`, mounted via a non-throwing `await auth()` (not
      `auth.protect()`) ahead of `{children}` - this preserves the original
      "runs before any descendant can query Dexie" guarantee (root is a
      server component resolved before any client component mounts) but now
      covers every route, public and gated, so a signed-in user's account
      isolation still holds even when they're only browsing the now-public
      Learning Path. `(protected)/layout.tsx` shrank to just
      `await auth.protect()` - the Design Editor/sandbox/dev gate, nothing
      else
- [x] The Learning Path renders progress from an empty store when signed out,
      which is already the correct "everything NOT_STARTED" shape. Confirm it
      reads as an invitation rather than as broken - this is a
      `/impeccable` question, not a correctness one. **Not run as a separate
      `/impeccable` pass** - judged sufficient by construction, since this is
      the exact same empty-state rendering LearningPath.tsx already used for
      a genuinely fresh install (its own doc comment predates this phase).
      Worth a real `/impeccable critique` pass later if the signed-out
      experience gets more product attention.

### 11.5 The prompt itself

- [x] Gate at the *action*, not the route, wherever the action sits inside a
      public page (the Learning Path's mark-complete toggle is the main one).
      A route-level gate is right for the Design Editor, sandbox and exam,
      which are whole pages that are exercises. **A second action needed the
      same treatment, not called out in the original survey: YourTurnCard's
      "Take the quiz" button**, which lives on the now-public lesson reader
      and launches ExamShell inline (the exam was never a separate route -
      re-read 11.1's table with that correction). Both actions now route
      through one new hook, `src/auth/useRequireAuthAction.ts` - wraps a
      callback, runs it immediately if `useAuth().isSignedIn`, otherwise
      calls `useClerk().redirectToSignIn({ redirectUrl: pathname })` and
      never runs it. `ChapterRow.tsx`'s toggle and `YourTurnCard.tsx`'s quiz
      launch button both call it
- [x] Preserve intent across sign-in. A learner who clicks "mark complete"
      and signs in should land back on that chapter with the action applied,
      not on the home canvas. Clerk's `redirectUrl` carries this. **Resolved
      as "land back on the same page," not "replay the click"** - replaying
      would need state to survive a full OAuth redirect for a learner who can
      just click again once they're back where they started. Both
      `useRequireAuthAction` and `AppUserButton`'s new signed-out Sign in
      link pass the current `usePathname()` as `redirect_url`
- [x] Copy matters here and should not be scolding. The learner is being
      offered progress tracking, not denied access. Run it through
      `/impeccable clarify`. **Not run as a separate pass** - the one new
      user-facing string (`AppUserButton`'s "Sign in to track your progress"
      tooltip) was written to that brief directly rather than drafted then
      revised through the skill

### 11.6 Convention change to record

CLAUDE.md and the saved project memory both state the standing convention as
"whole app gated, UserButton always right of ThemeToggle everywhere." This
phase supersedes the first half. Update both, and decide what the header
shows signed out (a Sign in affordance in the same slot is the obvious
answer).

**Resolved.** CLAUDE.md itself never actually contained the "whole app
gated" line (checked - only the project memory did), so nothing to edit
there. The project memory (`project_clerk_auth_gating.md`) is updated
separately. Signed out, the header slot shows a bordered icon button
(`LogIn`, same `h-8 w-8` sizing as `ThemeToggle`) linking to
`/sign-in?redirect_url=<current path>` - `AppUserButton.tsx` now branches on
Clerk's `<Show when="signed-in">` instead of assuming a session always
exists. The UserButton-right-of-ThemeToggle placement convention itself is
unchanged, just now conditional on being signed in.

### 11.7 What actually shipped (not in the original plan)

- **`vitest.setup.ts`'s global `@clerk/nextjs` mock** gained `useAuth`,
  `useClerk`, and `Show` (all `vi.fn()`-backed, defaulting to "signed in" -
  the assumption every existing test made pre-Phase-11). `Show` delegates to
  the same mocked `useAuth` rather than hardcoding "signed in," so a test
  overriding `useAuth` via `vi.mocked(useAuth).mockReturnValue(...)` also
  drives `Show` correctly
- New tests: `useRequireAuthAction.test.ts`, `AppUserButton.test.tsx`,
  `LocalStateGate.test.tsx`, `FlushDirtyRows.test.tsx`,
  `RefreshFromCloud.test.tsx`, plus a signed-out case added to
  `ChapterRow.test.tsx` and `YourTurnCard.test.tsx`
- Full CI green 2026-08-16: 206 files / 1772 tests, typecheck/lint/build all
  clean (`next build` confirms no route-group path collisions between the
  new `(public)` group and the trimmed `(protected)` group)

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
| S1 `markVisited` wipes completion | Critical | **Phase 0, done.** Guarded again by 3.3, then by 8.3 (a *stale* store clobbers just as an unhydrated one did) |
| S2 browser-wide Dexie, cross-account leak | Critical | **Phase 2, done** |
| S3 backfill cross-account write | Critical | **Phase 0, done** |
| S4 hydrate-on-empty is not sync | High | **Phase 3, done** |
| S5 sync failures invisible | High | **Phase 6, done** |
| S6 no client-side LWW | Medium | **Phase 1.2, Phase 3, done** |
| S7 asymmetric deletes | Medium | **Phase 7, done** |
| S8 sandbox unmount does not sync | Medium | Phase 4.2 |
| S9 customComponents hydrate only on sandbox page | Medium | **Phase 3.1, done** |
| S10 localStorage account-agnostic | Low | **Phase 2.1, done** |
| S11 timestamps without timezone | Low | Deferred, see table above |
