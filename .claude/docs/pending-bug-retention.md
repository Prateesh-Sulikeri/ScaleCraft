# Bug report retention / automatic cleanup

Status: **On `fix/db-auto-clean-up`, pushed 2026-08-26. Not merged.** Migration
`0008_mature_sir_ram` is **applied to the Neon `development` branch**; still
outstanding on production - see "Before this merges" at the bottom.
`npm run typecheck`, `lint`, `test` (2412 passing) and `build` all green.

Two automatic deletions on top of the Report a Bug feature
(`.claude/docs/pending-report-a-bug.md`, read that first):

1. A report's screenshot is deleted 7 days after the report reaches a terminal
   status. The bytes are the expensive part and stop being evidence first.
2. The whole report is deleted 15 days after that same close, unconditionally.

Both windows run off one column, `closed_at`.

Yes, this fits the current setup. Neon Postgres for the data, a Vercel Cron
route for the schedule, and the existing `src/bugs/image-storage.ts` seam for
the byte deletion. No new provider, no new dependency.

## Decisions locked (2026-08-24, with the user)

| Question | Answer |
|---|---|
| What fires the "delete image on close" step? | The nightly sweep alone. A close script closes through app code for an exact `closed_at`, but deletes nothing itself |
| Which statuses count as closed? | Both `resolved` and `closed` |
| Does an unread closing note delay the purge? | No. 15 days regardless - **and the reporter is told this explicitly in the UI** |
| How long does a closed report keep its screenshot? | 7 days (2026-08-26, revised from "immediately"). See below |

### Revision, 2026-08-26: a 7-day image grace window

Originally the screenshot went the instant a report reached a terminal status.
It now survives 7 days, because the moment you most want to look at it is
while writing the closing notes - which is exactly the moment the old rule
took it away.

What this changed:

- `BUG_IMAGE_RETENTION_DAYS = 7` in `types.ts`, with `bugImageDeletesAt` /
  `bugImageRetentionCutoff` mirroring the 15-day pair. No new column: the
  window hangs off the same `closed_at`, so one write starts both clocks and
  one write (reopening) stops both.
- Step 3 gained a `closed_at < now() - 7 days` bound. Step 1 stamps a hand-SQL
  close with `now`, so the sweep that *discovers* a close can never also strip
  it - eligibility always falls on a later run.
- `POST /api/bugs/[id]/close` no longer deletes anything, and
  `deleteReportImage` is gone. With a grace window there is nothing left for
  that request to do immediately, and the sweep must handle a hand-SQL close
  correctly regardless - one deleting code path beats two that have to agree.
  The route still earns its place: an exact `closed_at` and closing notes
  written through app code. It returns `{ id, status, closedAt }`.
- The details view gained a second notice, under the screenshot while there
  still is one: "This screenshot will be removed on <date>, 7 days after
  closing. The report itself stays until <date>." The post-removal line moved
  off "removed when this report was closed" to "Removed on <date>, 7 days
  after this report was closed."

### Why not a Postgres trigger

It was the obvious "fires no matter who does the UPDATE" answer and it was
rejected: a trigger would have to parse `db:<uuid>` out of `image_ref` in SQL,
which is the one thing `image-storage.ts` exists to prevent, and it would
silently stop deleting anything the day images move to Vercel Blob. The cost
of not having it is that a bug closed by raw SQL keeps its screenshot until
the next sweep (< 24h). That is acceptable; the close script is the intended
path.

### Why `resolved` counts too

`isBugActive()` in `src/bugs/types.ts` treats only `closed` as finished, and
that stays as it is - it drives the list's StatusDot colour and changing it
would grey out resolved reports, which nobody asked for. Retention gets its
own predicate, `isBugTerminal()` = `resolved | closed`. The two questions are
genuinely different: "is this outstanding work" vs. "is this done being
evidence".

Consequence to accept: re-opening a resolved report gets the report back but
never the screenshot.

## Schema (migration 0008)

Two nullable columns on `bug_reports`. No new table, nothing dropped.

- `closed_at timestamp` - when the report entered a terminal status. Null while
  active. Set when status enters `{resolved, closed}`, cleared when it leaves.
  This is the 15-day clock. **Not** `updated_at`: editing closing notes on day
  14 would reset that one, and `seen` deliberately does not bump it at all.
- `image_deleted_at timestamp` - when the sweep actually dropped an attachment.
  Exists purely so the details view can tell "this report never had a
  screenshot" from "this report's screenshot was removed", which are otherwise
  identical once `image_ref` is null. One column beats guessing and beats
  showing every terminal report a line about attachments it never had.

Both are stamped by app code, not a trigger (see above).

## The sweep: `GET /api/cron/bug-retention`

One route, four idempotent steps in order, all logic in `src/bugs/retention.ts`
so the route is a thin caller and the rules are unit-testable without HTTP.

1. **Stamp** - `closed_at = now()` for terminal reports where it is null.
   This is what catches a close done by hand SQL; the clock starts at the
   first sweep that sees it, up to a day late, and that is fine.
2. **Unstamp** - `closed_at = NULL` for non-terminal reports where it is set.
   A reopened report goes back on the clock only when it is re-closed.
3. **Drop images** - for every terminal report with an `image_ref` whose
   `closed_at` is more than 7 days old: `deleteBugImage()`, then
   `image_ref = NULL, image_deleted_at = now()`.
   **Bytes first, ref second, deliberately.** A crash between them leaves a
   dangling ref that the image route already renders as a 404, and the next
   sweep retries it harmlessly. Nulling the ref first and crashing would
   orphan the bytes forever with nothing pointing at them to find them by.
4. **Purge** - `DELETE FROM bug_reports WHERE closed_at < now() - 15 days`.
   Step 3 ran first in the same request, so every row reaching here already
   has a null `image_ref`.

Plus a fifth, unrelated to closing: **orphan images**. The create route
deliberately writes the image before the bug row ("a stored image with no bug
row is a harmless orphan"), so a failed submit leaves bytes behind that nothing
will ever reference. `deleteOrphanBugImages(olderThan)` clears rows no bug
points at and older than 24h - the age guard keeps it from racing a submit
that is mid-flight.

Both new functions (`deleteBugImage`, `deleteOrphanBugImages`) go **inside**
`image-storage.ts`, which is the module allowed to know that a ref is
`db:<uuid>`. Nothing else learns the encoding, so the Blob swap stays a
one-file change.

### Schedule and auth

`vercel.json` gains:

```json
"crons": [{ "path": "/api/cron/bug-retention", "schedule": "0 4 * * *" }]
```

Daily is enough for a 15-day window and fits the Hobby plan's once-a-day cron
limit. Crons only run on production deployments, which is what we want - a
preview branch must not be deleting production rows.

Auth is `CRON_SECRET`: Vercel sends `Authorization: Bearer $CRON_SECRET` on
every cron invocation when that env var is set, and the route 401s on anything
else. Goes in `.env.example` and in Vercel's env store (Production).

## Closing a bug: `POST /api/bugs/[id]/close`

The path that makes deletion immediate rather than next-morning. Author-only,
guarded by the same `CRON_SECRET` bearer - it is not a reporter-facing route
and does not use `requireUserId`, because the author closing someone else's
report is the entire point.

Body: `{ status: "resolved" | "closed", closingNotes?: string }`. It sets
status + closing notes + `closed_at` and stops there - deletion is the sweep's
job (see the 2026-08-26 revision above). Raising the reporter's unread badge
still falls out of the status change for free, exactly as the `seen_status`
design intended.

`scripts/close-bug.mjs` is a thin `fetch` wrapper over it, reading the secret
and base URL from `.env.local`, in the same style as
`scripts/dump-streak-days.mjs`. A fetch rather than a Drizzle import because
there is no `tsx` in the toolchain and `image-storage.ts` sits behind `@/`
aliases - and because closing against production from a laptop is the actual
use case. Run: `node scripts/close-bug.mjs <id> --status closed --notes "..."`.

This is also the seed of the admin/triage UI that
`pending-report-a-bug.md` lists under "Not built" - when it arrives it calls
this route instead of a shell.

## What the reporter is told

Non-negotiable, per the decision above: the 15-day deletion is announced, not
discovered. `BugDetail` gains three server-computed fields - `deletesAt`
(`closed_at + 15 days`, null while active), `imageDeletesAt`
(`closed_at + 7 days`) and `imageRemovedAt` - so the date arithmetic lives in
one place on the server and every device shows the same date.

`BugDetailsView` renders, when `deletesAt` is set:

> This report will be deleted on 8 September 2026. Closed reports are removed
> after 15 days, whether or not they've been read.

and separately, only when `imageRemovedAt` is set:

> Removed on 31 August 2026, 7 days after this report was closed.

and, while the screenshot is still there on a closed report:

> This screenshot will be removed on 31 August 2026, 7 days after closing. The
> report itself stays until 8 September 2026.

Both are plain informational text in the same muted register as the rest of the
details view - a statement of how the system works, not a warning, and
certainly not a countdown.

Resolved sub-decision: the list rows carry **no** retention hint. The list is
for scanning, and the notice belongs next to the closing notes it explains.

### As built, two deviations from the plan above

- The attachment line renders as the **Attachment field itself** rather than as
  loose prose. It belongs where the screenshot used to be, because that is
  where the reporter asks the question. The pending notice sits in the same
  place, under the screenshot it is about.
- `deleteBugImage` takes no `userId`, unlike `getBugImage`. Both of its callers
  are author-side and have no user context, and adding an ownership argument the
  caller would have to invent is worse than not having one. The read path keeps
  its check.

## Before this merges

1. **Run the migration** against Neon. **Dev branch done** (2026-08-26,
   `ep-sweet-union-awxmuy08`); the production branch is still outstanding and
   has to happen before the deploy. Two nullable columns, no backfill, no lock
   of consequence.
2. **Set `CRON_SECRET`** in Vercel (Production at minimum) and in `.env.local`.
   Both new routes 503 until it exists, so the cron would run and do nothing -
   silently, since a failing cron is not an alert. `openssl rand -hex 32`.
3. **Confirm the first sweep by hand** before trusting the schedule. Not yet
   run against a live route - only dry-run in SQL (see the session log). It
   would put the three existing dev reports on a 15-day deletion clock, which
   is why it was left for a deliberate decision rather than done in passing.
   `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/bug-retention`
   returns the five counts. On the first run, `clockStarted` should equal the
   number of reports already sitting resolved/closed - and `imagesDeleted`
   should be **0**, because everything it just stamped closed at `now`. The
   first real image deletion is 7 days later; that is the correct behaviour,
   not a broken sweep.
4. **Release notes** entry, per `.claude/docs/RELEASE_NOTES.md`.

## Not covered by unit tests

The repo has no DB harness (`src/db/client.test.ts` only checks the lazy
constructor), so `retention.test.ts` and `image-storage.test.ts` fake the
drizzle builder. They pin the two things a fake can honestly check - the order
the writes happen in, and the values passed to `.set()` - and deliberately do
not decode WHERE conditions. What that leaves unverified is exactly which rows
each step selects, which is why step 3 above is a manual check against real
data rather than optional.

## Tests

- `retention.test.ts` - which rows each step selects, the `deletesAt` and
  `imageDeletesAt` arithmetic (each against its own sweep cutoff, plus that the
  screenshot always goes strictly before the report), reopen clears the clock,
  purge does not touch active reports.
- `image-storage.test.ts` - `deleteBugImage` on a `db:` ref and on an unknown
  prefix (must no-op, not throw); `deleteOrphanBugImages` respects the age
  guard and spares referenced rows.
- Route tests - 401 without the bearer, on both new routes; the close route
  deletes nothing and returns `closedAt`.
- `BugDetailsView.test.tsx` - the deletion notice renders with the date only
  when `deletesAt` is set; the removed-attachment line only when
  `imageRemovedAt` is; the pending-removal notice only on a closed report that
  still has its screenshot.

## Docs to update when this lands

- `docs/DATABASE.md` - its per-table reference lists every read/write/delete
  per table; this adds a delete path to both bug tables.
- `.claude/docs/pending-report-a-bug.md` - its "Not built" section currently
  says there is no delete of a submitted report, and no triage tool.
- `src/content/release-notes.ts` - entry per `.claude/docs/RELEASE_NOTES.md`.
- `.env.example` - `CRON_SECRET`.


## Session log

### 2026-08-26 - grace window, branch reconciliation, dev migration

Started from "I closed a dummy ticket and its image is still in the DB".

**What the report actually was.** Not a bug in shipped code. On `develop`,
`main` and this branch's base there is no delete path for a bug image at all -
`image-storage.ts` had `putBugImage`/`getBugImage` and nothing else, and there
is no FK from `bug_reports.image_ref` to `bug_report_images` to cascade off.
The cleanup existed only as commit `aee0ff6`, sitting unmerged on a branch
named `clean-up/calude-clean-up` (typo intentional in the branch name, not
here). That commit's parent was exactly this branch's HEAD, so
`fix/db-auto-clean-up` fast-forwarded onto it with no merge and no conflict.

**A false start worth recording.** Before finding `aee0ff6`, a Postgres-trigger
implementation of the same feature was built here and then discarded: schema
column, migration `0008_fast_vengeance` with retention/reopen/delete triggers
plus backfill, `sweepExpiredBugImages`, `/api/bugs/cleanup`, a cron entry, and
`CRON_SECRET`. It was found by a stale `.next/types` reference pointing at
routes that existed on no branch in the working tree. It duplicated `aee0ff6`,
collided with it on migration number `0008` and on `vercel.json`'s `crons` key,
and took the approach this doc's "Why not a Postgres trigger" section had
already rejected for stated reasons. Discarded, not merged. The diff was kept
in the session scratchpad only; the stash holding it was dropped on request, so
it is gone.

**The one thing that changed on merit.** The 7-day image grace window, ported
onto `aee0ff6`'s design - see the 2026-08-26 revision section above for the
what and why. No new column; it hangs off the existing `closed_at`.

**Verified against real dev data**, after applying the migration:

- `closed_at` and `image_deleted_at` present and nullable on `bug_reports`.
- Three closed reports, all with `closed_at = null` - closed by hand SQL before
  any of this existed. Four images, 982 KB total, one of them unreferenced by
  any report.
- Dry-run of each sweep step in read-only SQL: `clockStarted` 3,
  `clockCleared` 0, `imagesDeleted` 0, `reportsPurged` 0,
  `orphanImagesDeleted` 0 (the one orphan was ~6h old, inside the 24h age
  guard). This is the correct first-run shape: the sweep that discovers a
  hand-SQL close stamps it with `now` and therefore cannot also strip it.

**Not done, deliberately.** The sweep was never actually run - only dry-run.
Running it stamps `closed_at` on those three dev reports and starts their
15-day clock, which is a real consequence for someone's test data and belongs
to a deliberate decision. `CRON_SECRET` is still unset both locally and in
Vercel. Production migration not run. No release-notes entry yet.

**Also not done:** no entry appended to `.claude/PROGRESS_LOG.md` for this
session.
