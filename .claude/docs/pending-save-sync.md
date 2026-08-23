# Save/sync optimization + best-only exam records

**Status: built, on `fix/db-fixes`. Not merged, not released, no release-notes
entry yet.** Typecheck and the full test suite pass locally (241 files, 2347
tests); `npm run lint` and `npm run build` have not been run yet. The Postgres
migration
(`drizzle/0007_redundant_reaper.sql`) is applied to the **Development** Neon
branch as of 2026-08-23; **`main` is not migrated**. Promotion sequence and the
ordering constraint it depends on: `.claude/docs/runbook-release-7.1.0.md`.

Two changes ship together because both are about the same thing: Postgres
holding the durable *latest* state rather than a log of everything that
happened.

---

## 1. Saves: Dexie is local safety, Postgres is a checkpoint

### What changed

Before, a canvas reached Postgres on every manual Save (sandbox) and on every
sandbox unmount. Now no save path pushes on its own. Instead:

| Trigger | Cloud write? |
|---|---|
| Debounced autosave (2s) | No, and never did |
| Save button / Ctrl+S, either surface | **No** (used to, in the sandbox) |
| Sandbox, every ~5 min while ahead of the cloud | **Yes, new** |
| Sandbox, leaving the page / hiding / closing the tab | Yes |
| Chapter Submit | Yes, immediately, unchanged |
| Header cloud indicator, clicked | **Yes, new** (explicit sync) |
| Chapter edits, saves, autosaves, unmount | No, unchanged |

Chapters were deliberately left out of checkpointing (user decision): an
in-progress attempt stays on the device until Submit, as before.

### How it decides

`src/persistence/save-revisions.ts` owns all of it.

- `localRevision` bumps on every real change; `cloudRevision` is what the
  server has acknowledged. `localRevision > cloudRevision` is the only
  "needs a push" test.
- `dirty` is kept equal to that test, so `flushDirtyRows`, the header
  indicator and `reconcile.ts` all keep working untouched.
- `graphHash` (`src/persistence/graph-hash.ts`) is a content hash over ids,
  types, positions rounded to the pixel, parents, and data minus render-only
  fields (`validationState`, `highlighted`, plus React Flow's `selected` /
  `dragging`). A write whose hash matches the stored one returns early: no
  revision bump, no `updatedAt` move, nothing to push. This is what makes
  selecting a node, or undoing back to where you started, free.
- Revisions are client-side only. No Postgres column, no route change.
  `updated_at` stays the server-side ordering key.

### Decisions worth remembering

- **`syncedAt` is no longer nulled on a local edit.** It is the server's clock
  from the last confirmed sync, and `reconcile.ts` needs it to tell "about to
  push" from "already beaten by another device." Nulling it made that check
  dead code. This is a correctness fix that came along for free.
- **The exit write moved into `useAutosave`.** A slot that opts into
  `cloudCheckpoint` gets its unmount write from the hook, so the sandbox page
  no longer keeps an unmount-save effect (and no longer needs the
  `hasLoadedInitialStateRef` that guarded it - `saveId: null` does that job).
  `ChapterWorkspace` keeps its own, because it does not checkpoint.
- **`pagehide` + `visibilitychange` are best-effort.** An IndexedDB read plus
  a fetch during teardown is not guaranteed to land. The debounced local write
  already covers the data; the checkpoint is a bonus, and `flushDirtyRows` on
  the next mount is the real backstop.
- **The header indicator is now neutral, not red, and clickable.** Unsynced
  used to mean "a push failed"; under this model it usually just means "not
  yet checkpointed," so an error-red badge every five minutes would be a lie.
- **Explicit sync reuses `flushDirtyRows`** rather than adding a save-specific
  path, so one click covers all six tables.

### What is deliberately given up

Up to `CLOUD_CHECKPOINT_MS` (5 min) of sandbox work if the machine dies, on
that device only. It is in IndexedDB and pushes on the next visit.

---

## 2. Exam attempts: best-only, with a count

### What changed

`exam_attempts` went from one row per submission
(PK `user_id, chapter_definition_id, attempt_number`) to one row per chapter
(PK `user_id, chapter_definition_id`) holding the best attempt plus
`total_attempts`.

The count exists because the exam UI shows "Attempt 4 · Best score 60%" and
`CLAUDE.md` carves attempt count out of the no-scoring-theatrics rule as
completion-gating information. Without it, collapsing to best-only would have
silently deleted a documented product behavior. (User picked this over
dropping the count from the UI.)

### Shape changes

- Dexie store renamed `examAttempts` -> `examBest`, keyed by
  `chapterDefinitionId`. IndexedDB cannot re-key a store in place, so v13
  copies rows into the new store and v14 drops the old one. The Postgres table
  keeps its name so the `/api/sync/exam-attempts` route path does not churn.
- `ExamAttempt` lost `attemptNumber`, gained `totalAttempts`. New
  `SubmittedExamAttempt` = what one submission produces, before the merge
  assigns a count and sync metadata.
- `ProgressInputs.examAttemptsByDefinition: Map<string, ExamAttempt[]>` ->
  `examBestByDefinition: Map<string, ExamAttempt>`. `bestExamScore` /
  `examPassed` / `examLocked` now read a row instead of reducing a list.
- `ExamShell` lost its `attemptNumber` prop; `buildAttempt` lost its third
  argument.

### Merge rules (`progress-store.mergeExamAttempt`)

- Count goes up on every submission, best or not.
- Strictly greater score wins. **A tie keeps the existing row** - an equal
  score adds nothing, and rewriting would move `submitted_at` off the moment
  the score was first reached.
- `recordExamAttempt` now calls `refresh()` first, same rule as `markVisited`:
  the row is a full-row overwrite composed from the previous best and count,
  so a stale local copy would drop a better score from another device and
  undercount attempts.

### The route is best-preserving

`POST /api/sync/exam-attempts` is the only sync route that is not plain
last-write-wins: `ON CONFLICT` takes `greatest()` of score and count, and moves
`submitted_at`/`answers` only when the incoming score actually wins. With one
slot per chapter, a device flushing an old attempt could otherwise clobber a
better score. Because the server row is therefore always the max of everything
pushed, the generic `reconcileRows` LWW merge stays safe.

### Migrations

- Postgres `drizzle/0007_redundant_reaper.sql`. The generated version was
  wrong twice over (new PK added before the duplicate rows it rejects; `ADD
  COLUMN ... NOT NULL` with no value for existing rows), so the file is
  hand-ordered: add nullable column, stamp counts while the rows to discard
  are still there, `DELETE` all but the best per `(user, chapter)`, then set
  NOT NULL and re-key. No temp tables - the HTTP driver may put each statement
  on its own connection. Ties resolve to earliest `submitted_at`, then lowest
  `attempt_number`.
- Dexie v13/v14 applies the identical rule locally, and backfills `saves` with
  hash + revisions (an unsynced row starts behind the cloud so the first
  checkpoint pushes it). Covered by three tests in `db.test.ts` that open a
  real v12 database and upgrade it.

### What is deliberately given up

Attempt-by-attempt history. Score-over-time, first-vs-last, per-question
improvement: not reconstructable, by choice.

---

## Files

New: `src/persistence/graph-hash.ts`, `src/persistence/save-revisions.ts`
(+ tests for both).

Changed: `src/persistence/db.ts` (v13/v14, `CanvasSave`, `ExamAttempt`,
`SubmittedExamAttempt`), `cloud-sync.ts`, `use-autosave.ts`, `flush-dirty.ts`,
`src/app/CloudSyncIndicator.tsx`, `src/app/(protected)/sandbox/page.tsx`,
`src/chapters/ChapterWorkspace.tsx`, `YourTurnCard.tsx`, `QuestionPane.tsx`,
`exam/{ExamShell,ExamResults,exam-attempt}`, `src/curriculum/{progress,
progress-store}.ts`, `src/home/home-data.ts`, `src/db/schema.ts`,
`src/db/sync/schemas.ts`, `src/app/api/sync/exam-attempts/route.ts`,
`docs/DATABASE.md`.

Untouched, as instructed: `custom_components`, `chapter_progress`,
`curriculum_progress`.

## Before this merges

**Full promotion sequence: `.claude/docs/runbook-release-7.1.0.md`.** It has the
ordering constraint that is easy to get wrong (`main`'s Neon branch must be
migrated before the merge to `develop`, because Preview branches from `main`),
the verification queries, and the recovery path if the migration half-applies.

1. **Run the Postgres migration.** Development is done as of 2026-08-23;
   `main` is not. There is no migrate-on-deploy step, so until it runs, every
   `/api/sync/exam-attempts` call against that branch fails.
2. **Write the release-notes entry.** `VERSION` is 7.1.0-alpha and
   `release-notes.ts` still tops out at 7.0.0-alpha, so 7.1.0's entry is
   already owed; this work belongs in it or in a 7.2.0 entry, per
   `.claude/docs/RELEASE_NOTES.md`. Deliberately not written here - which
   release this lands in is not this branch's call.
3. Manual click-through worth doing: sandbox edit -> wait 5 min -> confirm one
   push; sandbox edit -> navigate away -> confirm push; chapter edit -> Save ->
   confirm *no* push; chapter Submit -> confirm push; fail an exam twice then
   pass -> confirm the count reads 3 and the score reads the best.
