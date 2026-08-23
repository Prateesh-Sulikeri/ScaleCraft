# Pending - Day streak: real counter (release 7.1.0-alpha)

**Status: built, on `fix/streak-counter` (branched from `feature/report-a-bug`).
Not merged.** Depends on the streak persistence introduced by
`feat: add Report a Bug, progress reset, and streak persistence`, so it cannot
be cut from `release/v7.1.0-progress-reset` directly - that branch does not have
`src/persistence/streak-days.ts` yet.

## The bug

Reported symptom: a 1-day streak became a **4-day** streak immediately after
resetting Building Blocks progress. Resetting made the number go *up*.

Root cause, in two halves:

1. **The streak had no durable record.** It was derived from
   `curriculumProgress.lastVisitedAt` (one timestamp *per chapter*, overwritten
   on every re-open) plus `manuallyCompletedAt` and exam `submittedAt`.
   Re-reading a chapter tomorrow deleted the evidence that you were active
   today. On an ordinary day nothing was written down anywhere.
2. **The only writer was reset itself.** `resetCourse` snapshotted the day set
   into Clerk `publicMetadata` before wiping, and the POST response returned
   the server's *unioned* set. So a reset was the one operation that could
   reveal days the client had forgotten (from earlier resets, or another
   device) - and the number jumped.

Compounding it, `fetchPreservedStreakDays` collapsed every failure to `[]`,
which is indistinguishable from "this account has no history". One 401 or
dropped request silently rendered a lower streak with full confidence.

## The fix

Record every active day as it happens, instead of inferring it afterwards.

| Piece | What it does |
| --- | --- |
| `db.activeDays` (schema v12) | One row per local day index with recorded activity. `syncedAt: null` = owed a push. Never cleared by a progress reset; cleared on sign-out and account switch like every table (both go through `db.tables`). |
| `persistence/active-days.ts` | `recordActiveDay` (idempotent local bank) and `reconcileActiveDays` (union both ways, flush pending, one pass at a time). |
| `progress-store.recordToday` | Called by `markVisited`, `setManualComplete(true)` and `recordExamAttempt`. Skips entirely on a day already banked. |
| `fetchStreakDays` | Returns `number[] | null`. `null` is *unknown*, never *empty*. |
| `HomeStats.streakKnown` | False until the account's log has been read; both streak tiles render `-` / "not loaded" rather than a confidently wrong number. |

Clerk `publicMetadata` stays the account-wide mirror - no Postgres table, no
`/api/sync/*` reconcile, no last-write-wins - because the client only pushes on
a day it has not banked yet. At most one write per device per day, none at all
on a day already confirmed.

### Why two stores

They fail differently. The local table is always writable, so an offline day is
still a recorded day and can never be lost to a dropped request. Clerk metadata
outlives this browser's storage, so it is what a second device (or the same one
after a sign-out) inherits history from. Union both ways; nothing ever deletes.

### Decisions worth not relitigating

- **`loaded` and `pending` are separate.** `loaded` asks "can the number on
  screen be trusted"; `pending` asks "does the server hold everything".
  A successful read with a failed write satisfies the first and fails the
  second. `resetCourse` gates on the second.
- **`reconcileActiveDays` queues rather than sharing an in-flight promise.**
  Handing `resetCourse` a pass that started before it banked its backfill would
  let it read `pending: 0` about days it had never offered, and delete progress
  on the strength of it.
- **Reset still aborts**, but only when something is actually at risk: an
  unconfirmed day, or a failed read. When every day is already banked it
  proceeds without a write, so a dead network is no longer a reason to block
  the learner.
- **`activeDaysLoaded` only latches on.** A failed push does not make history
  already fetched this session incomplete.
- **`STREAK_DAYS_KEY` stays `"streakDays"`.** Renaming it would orphan the days
  accounts have already banked.
- **Un-completing a chapter is not activity.** It stamps no timestamp, so it
  was never a day the streak recognised.
- **`syncedAt` is not indexed.** IndexedDB has no null key, so an index on it
  would exclude exactly the unsynced rows a pending-push query needs.

## Consequences

- `computeDayStreak` is now exact rather than a floor, and
  `computeLongestStreak` is monotonic (it could previously *shrink* when
  re-opening an old chapter moved its `lastVisitedAt` forward).
- Existing accounts keep whatever days they already banked in Clerk; a browser
  upgrading to schema v12 starts with an empty local table and converges on the
  next hydrate. `resetCourse` also backfills days out of live timestamps before
  wiping, which closes the gap for rows written by a build that predates the
  log.

## Verification

`npm run typecheck && npm run lint && npm test && npm run build` all pass.

One **pre-existing, unrelated** failure: `src/content/chapters/index.test.ts`
expects a chapter list that does not include `bb-2-1-from-browser-to-backend`
or `bb-2-2-where-can-things-go-wrong`. It comes from the `Chapter 2.2 Authored`
commit, not from this work.

New coverage: `src/persistence/active-days.test.ts` (14 cases - idempotence,
offline retry, both-ways union, unknown-vs-empty, concurrency/queueing), plus
store-level cases proving the streak is unchanged across a reset, that one day
costs exactly one Clerk write, and that both stat cards render `-` when the log
has not loaded.

`scripts/dump-streak-days.mjs` (untracked) decodes the day set stored on each
Clerk user, for confirming against real data.
