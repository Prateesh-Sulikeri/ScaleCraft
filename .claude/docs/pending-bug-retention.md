# Bug report retention / automatic cleanup

Status: **Built on `fix/db-auto-clean-up` (cut from
`release/v7.2.0-design-editor-polish`), 2026-08-24. Not committed, not
pushed.** Migration `0008_mature_sir_ram` is generated but **not yet applied
to Neon** - see "Before this merges" at the bottom. `npm run typecheck`, `lint`,
`test` (2406 passing) and `build` all green.

Two automatic deletions on top of the Report a Bug feature
(`.claude/docs/pending-report-a-bug.md`, read that first):

1. A report's screenshot is deleted as soon as the report reaches a terminal
   status. The bytes are the expensive part and they have no use once the bug
   is done.
2. The whole report is deleted 15 days after that, unconditionally.

Yes, this fits the current setup. Neon Postgres for the data, a Vercel Cron
route for the schedule, and the existing `src/bugs/image-storage.ts` seam for
the byte deletion. No new provider, no new dependency.

## Decisions locked (2026-08-24, with the user)

| Question | Answer |
|---|---|
| What fires the "delete image on close" step? | A close script that closes through app code (instant), with the daily sweep as the backstop for anything closed by hand SQL |
| Which statuses count as closed? | Both `resolved` and `closed` |
| Does an unread closing note delay the purge? | No. 15 days regardless - **and the reporter is told this explicitly in the UI** |

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
3. **Drop images** - for every terminal report with an `image_ref`:
   `deleteBugImage()`, then `image_ref = NULL, image_deleted_at = now()`.
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
status + closing notes + `closed_at`, then runs step 3 for that one report.
Raising the reporter's unread badge still falls out of the status change for
free, exactly as the `seen_status` design intended.

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
discovered. `BugDetail` gains two server-computed fields - `deletesAt`
(`closed_at + 15 days`, null while active) and `imageRemovedAt` - so the date
arithmetic lives in one place on the server and every device shows the same
date.

`BugDetailsView` renders, when `deletesAt` is set:

> This report will be deleted on 8 September 2026. Closed reports are removed
> after 15 days, whether or not they've been read.

and separately, only when `imageRemovedAt` is set:

> The attachment was removed when this report was closed.

Both are plain informational text in the same muted register as the rest of the
details view - a statement of how the system works, not a warning, and
certainly not a countdown.

Resolved sub-decision: the list rows carry **no** retention hint. The list is
for scanning, and the notice belongs next to the closing notes it explains.

### As built, two deviations from the plan above

- The attachment line renders as the **Attachment field itself** ("Removed when
  this report was closed on 24 August 2026") rather than as loose prose. It
  belongs where the screenshot used to be, because that is where the reporter
  asks the question.
- `deleteBugImage` takes no `userId`, unlike `getBugImage`. Both of its callers
  are author-side and have no user context, and adding an ownership argument the
  caller would have to invent is worse than not having one. The read path keeps
  its check.

## Before this merges

1. **Run the migration** against Neon: `npm run db:migrate` for the dev branch,
   and the production branch before the deploy. Two nullable columns, no
   backfill, no lock of consequence.
2. **Set `CRON_SECRET`** in Vercel (Production at minimum) and in `.env.local`.
   Both new routes 503 until it exists, so the cron would run and do nothing -
   silently, since a failing cron is not an alert. `openssl rand -hex 32`.
3. **Confirm the first sweep by hand** before trusting the schedule:
   `curl -H "Authorization: Bearer $CRON_SECRET" .../api/cron/bug-retention`
   returns the five counts. On the first run, `clockStarted` should equal the
   number of reports already sitting resolved/closed.
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

- `retention.test.ts` - which rows each step selects, the `deletesAt`
  arithmetic, reopen clears the clock, purge does not touch active reports.
- `image-storage.test.ts` - `deleteBugImage` on a `db:` ref and on an unknown
  prefix (must no-op, not throw); `deleteOrphanBugImages` respects the age
  guard and spares referenced rows.
- Route tests - 401 without the bearer, on both new routes.
- `BugDetailsView.test.tsx` - the deletion notice renders with the date only
  when `deletesAt` is set; the attachment line only when `imageRemovedAt` is.

## Docs to update when this lands

- `docs/DATABASE.md` - its per-table reference lists every read/write/delete
  per table; this adds a delete path to both bug tables.
- `.claude/docs/pending-report-a-bug.md` - its "Not built" section currently
  says there is no delete of a submitted report, and no triage tool.
- `src/content/release-notes.ts` - entry per `.claude/docs/RELEASE_NOTES.md`.
- `.env.example` - `CRON_SECRET`.
