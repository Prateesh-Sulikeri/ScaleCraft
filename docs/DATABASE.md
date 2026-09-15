# Database

Live reference for ScaleCraft's Postgres/Neon setup: how it's provisioned, how
dev/preview/prod are separated, connection strings, the client, migrations,
the schema, and - in "Per-table reference" below - every read, write, and
delete that ever touches each table, from both the user's side and the
code's. Read this before touching anything in `src/db/`, adding a table, or
debugging a `DATABASE_URL` connection error. For the original
persistence design tradeoffs (why Postgres mirrors Dexie, sync/conflict
model, what's local-only), see `.claude/docs/pending-cloud-sync.md` and
`.claude/docs/ARCHITECTURE.md` ("Persistence"). For the CI/build pipeline
around deploys, see `.claude/docs/TESTING_AND_DEPLOYMENT.md`.

## Provider and integration

Postgres via **Neon**, provisioned through the native **Vercel Marketplace
Neon integration** on the `scale-craft` Vercel project - not a manually
pasted connection string. The integration auto-populates a full var set into
Vercel's env store: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_*`,
`PG*`, `NEON_PROJECT_ID`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`.

Chosen over Supabase for: real free tier with scale-to-zero and no
multi-day pause on inactive free projects, branch-per-PR workflow, and
first-party Vercel integration (`.claude/docs/TECH_STACK.md:42`).

Only two of the auto-populated vars are actually read by app code:
`DATABASE_URL` and `DATABASE_URL_UNPOOLED`. The rest (`POSTGRES_*`, `PG*`,
`NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`) are unused passthroughs from the
integration - ScaleCraft uses Clerk for auth, not Neon Auth, and Drizzle
directly rather than Prisma. Don't wire new code to those unless a real need
shows up.

## Branch-per-environment

Three Vercel environments map to two Neon branches:

| Vercel environment | Neon branch | Branch id | Notes |
|---|---|---|---|
| Development | `development` | `br-billowing-field-awvgzzbt` (host `ep-sweet-union-awxmuy08`) | Dedicated branch, isolated from prod data |
| Preview | `main` (own sub-branch per deployment) | `br-summer-breeze-aww4iph2` | Vercel's Neon integration auto-branches per preview deployment, no manual setup |
| Production | `main` | `br-summer-breeze-aww4iph2` | |

`DATABASE_URL` and `DATABASE_URL_UNPOOLED` each have two separate values in
Vercel: one scoped to "Development" only, one scoped to "Production,
Preview" together (`vercel env ls` shows this directly).

This wasn't the original setup. Initially all three environments shared one
"All Environments" entry pointing at the `main` branch. Fixed **2026-08-12**
so local dev writes can't touch prod data - Preview already auto-branched
for free, so the fix was giving Development its own branch and splitting
the Vercel env entries per-environment. Tracked as a closed checklist item
in `.claude/docs/pending-cloud-sync.md` (Decisions locked 2026-08-12
section) - fully resolved, not an open question.

**Security note:** the `neondb_owner` role password was rotated on both
branches during that change, after an accidental exposure in a terminal
session. If `DATABASE_URL` ever fails with an auth error, check Vercel's
current env var value first - not this doc, not `.env.local` - for the live
credential.

## Connection strings: pooled vs. unpooled

Two distinct strings, two distinct purposes:

- **`DATABASE_URL`** (pooled, PgBouncer) - used by the app at runtime
  (`src/db/client.ts`). Every request-scoped query goes through this.
- **`DATABASE_URL_UNPOOLED`** (direct, session-level) - used only for
  migrations (`drizzle.config.ts`, `scripts/migrate.mjs`). Migrations run
  session-level operations that a pooled PgBouncer connection doesn't
  support, so they need the direct connection.

Never swap these: pointing the app at the unpooled URL exhausts direct
connections under load; pointing migrations at the pooled URL fails.

## Client

`src/db/client.ts` - lazy singleton, deliberately not constructed at module
load:

```ts
export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. ...");
  _db = drizzle(neon(url), { schema });
  return _db;
}
```

Lazy by design - constructing eagerly would crash the whole app any time
`DATABASE_URL` is unset (e.g. running the canvas/validation-engine scaffold
without a Neon project). It only throws when a caller actually touches the
database. Uses `drizzle-orm/neon-http` (`@neondatabase/serverless`), the
HTTP driver - not the websocket/TCP driver - because it's the one that
reliably works from WSL2 dev environments (see Gotchas below).

Every server-side DB access goes through `getDb()`. There is no direct
`neon()`/`drizzle()` call anywhere else in app code.

## Local development setup

1. Copy `.env.example` to `.env.local`.
2. Get the Development-branch `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` if
   you'll run migrations) from Vercel: `vercel env pull .env.local`, or copy
   from the Vercel dashboard (Development environment values). Never reuse
   the Production/Preview values for local dev.
3. `DATABASE_URL` alone is enough to run the app (`npm run dev`) against the
   dev database. Without it, `getDb()` throws only when something actually
   queries the DB - the canvas/validation-engine scaffold itself doesn't
   need it.

`.env.local` is gitignored; never commit it.

## Schema and migrations (Drizzle)

- Schema source of truth: `src/db/schema.ts` (application tables) and
  `src/db/sync/*` (auth-related types).
- `drizzle.config.ts` points at `./src/db/schema.ts`, outputs to `./drizzle`,
  and uses `DATABASE_URL_UNPOOLED` for `dbCredentials.url`.
- **Generate a migration** after a schema change:
  ```bash
  npm run db:generate   # dotenv -e .env.local -- drizzle-kit generate
  ```
- **Apply migrations**:
  ```bash
  npm run db:migrate    # dotenv -e .env.local -- node scripts/migrate.mjs
  ```
  `scripts/migrate.mjs` applies migrations via the HTTP driver
  (`drizzle-orm/neon-http/migrator`), matching `client.ts`'s runtime driver,
  rather than `drizzle-kit migrate`'s websocket path. This sidesteps a WSL2
  gotcha - some networks (WSL2 without a working default route to Neon's
  IPv6 addresses) fail the websocket handshake even though HTTP works fine.
- Applied migrations live in `drizzle/*.sql` with a matching entry in
  `drizzle/meta/_journal.json` and a `drizzle/meta/NNNN_snapshot.json`. Both
  are checked in - never hand-edit `_journal.json` or a snapshot.
- Migrations are applied manually (`npm run db:migrate`) against whichever
  branch `.env.local` points at. There is no automatic migrate-on-deploy
  step in the Vercel build (`vercel.json`'s `buildCommand` is `next build`
  only) - remember to run `db:migrate` against Production/Preview's branch
  after merging a schema change that ships to `main`/`develop`/`release/*`.

### Gotchas (WSL2 / networking)

`@neondatabase/serverless`'s `fetch` intermittently fails with `ETIMEDOUT`
on IPv6 candidates in this environment. `--dns-result-order=ipv4first`
alone doesn't fix it reliably - `db:migrate` already forces
`NODE_OPTIONS=--no-network-family-autoselection`. If `db:migrate` still
fails with a fetch/timeout error, retry a few times; it's networking
flakiness, not a migration problem.

## Schema overview

`src/db/schema.ts` - two families of tables:

**Cloud-sync mirrors** (mirror a Dexie table, see `src/persistence/db.ts`,
`updatedAt` used for last-write-wins conflict resolution across devices):
`savedGraphs`, `customComponents`, `chapterProgress`, `curriculumProgress`,
`examAttempts` (Dexie `examBest`), `deepCheckSessions`. All keyed by Clerk
`userId`. Two of them are not plain write-through mirrors: `savedGraphs` is
checkpointed rather than pushed on every save, and `examAttempts` keeps only
the best result per chapter - see their sections below. Complex
nested fields (canvas state, exam answers, AI critiques) are stored as
`jsonb` rather than normalized. Postgres mirrors only the *current* Dexie
shape, not its version history - a Dexie schema change needs a matching
Postgres migration going forward.

**Cloud-only tables** (no Dexie counterpart, nothing to reconcile offline):
`bugReports`, written straight through `/api/bugs`; `bugReportImages`, a
separate table (not a column) so list queries never drag image bytes along,
and so swapping to object storage later (Vercel Blob is the natural fit) is
a table removal rather than a bug-record migration. See
`src/bugs/image-storage.ts` for the storage seam - `bugReports.imageRef` is
an opaque ref only that module parses. These two are also the only tables the
app deletes from on its own: a nightly cron drops a closed report's screenshot
and purges the report itself 15 days later (`src/bugs/retention.ts`).

Route Handlers per synced table live under `src/app/api/sync/<table>/`
(saves, custom-components, chapter-progress, curriculum-progress,
exam-attempts, deep-check-sessions) - POST for write-through sync, GET to
pull the cloud copy for reconciliation (release 6.1.0-alpha Phase 3 replaced
the older hydrate-only-when-local-is-empty read with a real per-key merge).
Sync model (debounced write-through, Dexie-first reads, last-write-wins, no
offline queue) is documented in full in
`.claude/docs/pending-cloud-sync.md`.

Per-table detail - columns, and every operation with its user-facing trigger
and its code path - is in "Per-table reference" below.

## Per-table reference

What follows is, for every table, what it holds and every operation that ever
touches it: the user action that causes it and the code path that runs. Two
rules hold across the whole schema.

**Ownership is a WHERE clause, never a body field.** Every route resolves the
Clerk `userId` from the session (`requireUserId`, `src/db/sync/auth.ts`) and
carries it into the query. No route accepts a user id from a request body or
query string. A foreign row is therefore invisible rather than forbidden - a
bug id belonging to someone else returns 404, not 403, so the response cannot
confirm the row exists.

**Two write postures.**

- *Synced mirrors* (`saved_graphs`, `custom_components`, `chapter_progress`,
  `curriculum_progress`, `exam_attempts`, `deep_check_sessions`). IndexedDB
  (Dexie, `src/persistence/db.ts`) is the primary store. Every user action
  writes Dexie first with `dirty: true`, then fires a fire-and-forget POST at
  `/api/sync/<table>`. The route upserts and returns its own `updatedAt`; the
  client writes that back as `syncedAt` and clears `dirty`
  (`src/persistence/cloud-sync.ts`). A failed push is never an error the user
  sees: the row stays dirty, the header's sync indicator counts it, and
  `flushDirtyRows()` retries on the next mount, on every `online` event, and
  when the learner clicks that indicator. Reads come from Dexie; Postgres is
  pulled on mount and on tab refocus (`RefreshFromCloud`) and merged
  last-write-wins by `syncedAt` (`src/persistence/reconcile.ts`).

  **`saved_graphs` is the one exception to write-through.** A canvas changes
  hundreds of times per session, so its cloud copy is a *checkpoint*, not a
  mirror of every save - see its own section below.
- *Cloud-only* (`bug_reports`, `bug_report_images`). No Dexie table, no
  reconcile, no dirty flag. The request either succeeds or the user sees the
  failure - `src/bugs/client.ts` throws where the sync layer swallows.

Nothing in this schema is ever soft-deleted, and no route updates a row it
did not also key by `userId`.

### `saved_graphs`

One row per (user, canvas slot). The slot is `scopeId`: `"sandbox"` or
`"chapter:<chapterId>"`. Mirrors Dexie `saves`.

**Dexie is immediate local safety; this table is the durable latest
checkpoint.** Every edit still lands in IndexedDB within
`AUTOSAVE_DEBOUNCE_MS` (2s), but a cloud write costs a round trip and a save
row is overwritten anyway, so pushing every save bought nothing. The cloud
copy is refreshed on a schedule and on the way out instead. There is still
exactly one row per slot and no history: the recovery point is the latest
state, not a timeline.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Derived server-side as `${userId}:${scopeId}`, never trusted from the client |
| `user_id` | text | Ownership |
| `scope_id` | text | `SANDBOX_SAVE_ID` or `chapterSaveId(id)` |
| `canvas_state` | jsonb | Raw `{ nodes, edges }` as the canvas store holds them, not the domain `ArchitectureGraph` (which drops zones/comments/Start markers) |
| `updated_at` | timestamp | Server clock, the ordering key for last-write-wins |

Revisions are **client-side only** - there is no revision column here. The
Dexie row carries `localRevision` (bumped on every real change),
`cloudRevision` (the revision this table has acknowledged), and `graphHash`
(`src/persistence/graph-hash.ts`). `localRevision > cloudRevision` is the one
"needs a push" test, and `dirty` is kept equal to it so the existing flush and
indicator machinery works unchanged. `graphHash` covers ids, types, positions
(rounded to the pixel), parents, and data minus render-only fields, so
selecting a node, hovering it, or nudging it half a pixel is not a change: a
write whose hash matches the stored one is dropped before it can become a
revision, let alone a cloud write. All of this lives in
`src/persistence/save-revisions.ts`.

| Operation | User perspective | Technical perspective |
|---|---|---|
| Upsert (checkpoint) | Keeps editing the **sandbox**; roughly every 5 minutes their work quietly reaches the cloud | `useAutosave`'s `cloudCheckpoint` interval (`CLOUD_CHECKPOINT_MS`) calls `checkpointSave`, which pushes only when `localRevision > cloudRevision`. An idle or unchanged board costs one IndexedDB read and no network |
| Upsert (exit) | Leaves the sandbox, hides the tab, or closes it | Same `checkpointSave`, from the hook's unmount cleanup and from `pagehide`/`visibilitychange`. The hook owns the exit write, which is why the sandbox page keeps no unmount-save effect of its own |
| Upsert | In a **chapter**, presses Submit | `ChapterWorkspace.handleSubmit` -> `saveAndSyncNow`: local write then an unconditional push. Submit never waits for a checkpoint. This is still the only cloud push a chapter canvas ever gets |
| Upsert | Clicks the header's cloud indicator ("Sync now") | `flushDirtyRows()` pushes every dirty row across all six tables, this one included |
| *(no write)* | Presses Save or Ctrl+S, in either surface | Dexie only. A manual save is a local act; the checkpoint decides when the cloud hears about it |
| *(no write)* | In a chapter, drags nodes, edits, or lets autosave fire | Dexie only. Chapters pass `cloudCheckpoint: false`, so an in-progress attempt stays on the device until Submit |
| *(no write)* | Undoes an edit back to where they started | The graph hash is unchanged, so `putSaveLocal` returns early: no revision bump, no `updated_at` move, nothing to push |
| Delete | Presses "Start over" on the guided tour pill in a chapter | `deleteSaveSync(chapterSaveId(...))` -> `DELETE ?scopeId=`. Without it a previously submitted attempt would be pulled back on the next reconcile |
| Delete (bulk) | Resets a whole course from the Learning Path | `resetCourse` deletes the save slot of every chapter in that course. The sandbox slot belongs to no course and is never touched |
| Select | Opens the sandbox or a chapter's Design Editor | `GET ?scopeId=`, then `reconcileRow` against the local row. Freshest `syncedAt` wins; if the fetch fails, local wins (a failed fetch is never read as "the cloud is empty"). A remote win is written back through `adoptRemoteSave`, which stamps the hash and lands both revisions level so the adopted state is not immediately pushed back |

A local edit no longer nulls `syncedAt` (it used to). `syncedAt` is the
server's clock from the last confirmed sync, and `reconcile.ts` needs it to
tell a row that is about to push from one that has already been beaten by
another device's write.

**What is lost if the tab dies:** up to `CLOUD_CHECKPOINT_MS` of sandbox work,
and any unsubmitted chapter work, on that device only - both are already in
IndexedDB and push on the next visit. That is the trade the checkpoint model
makes deliberately.

### `custom_components`

The user's own component palette, account-wide - not scoped to a chapter or
a save. Mirrors Dexie `customComponents`.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Client-generated `crypto.randomUUID()`, globally unique on its own |
| `user_id` | text | Ownership column, not part of the key |
| `category`, `label`, `icon`, `summary`, `docs` | text | Palette presentation and docs panel |
| `has_input`, `has_output` | boolean | Which handles the node renders |
| `fields` | jsonb | `CustomFieldSpec[]` |
| `updated_at` | timestamp | Last-write-wins ordering |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Upsert | Creates a component in the palette's "Create component" modal, or edits an existing one | `ComponentPicker.handleSaveCustom` -> Dexie put -> `POST /api/sync/custom-components`, upsert on `id`. Editing reuses the same id, so it is an UPDATE |
| Delete | Deletes a custom component from the palette | `ComponentPicker.handleDeleteCustom` -> `DELETE ?id=` |
| Select | Opens the sandbox or a chapter editor (store hydrate), or returns to the tab after switching away (`RefreshFromCloud`) | `GET` returns every row for the user; `reconcileRows` merges per id |

Built-in components never appear here - they are versioned TypeScript in
`src/content/components/registry.ts`.

### `chapter_progress`

The validation engine's completion record: one row per chapter the user has
passed. Composite PK `(user_id, chapter_id)`. Mirrors Dexie `chapterProgress`.

| Column | Type | Notes |
|---|---|---|
| `user_id`, `chapter_id` | text | Composite PK - `chapterId` alone is not unique across accounts |
| `completed_at` | timestamp | When Submit first passed |
| `matched_blueprint_id` | text, nullable | Which solution blueprint the graph matched |
| `updated_at` | timestamp | Last-write-wins ordering |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Upsert | Presses Submit in a chapter and the graph passes | `handleSubmit`'s `outcome.passed` branch -> Dexie put -> `syncChapterProgress`. Upsert on `(userId, chapterId)`, so passing again overwrites `completedAt` and `matchedBlueprintId` |
| Delete | Presses Reset on a chapter row in the Learning Path | `progress-store.resetChapter` -> `DELETE ?chapterId=` |
| Delete (bulk) | Resets a whole course | `resetCourse` issues one delete per chapter definition id in the course |
| Select (one) | Opens a chapter | `GET ?chapterId=`, reconciled against the local row so a pass earned on another device shows up |
| Select (all) | Loads the Learning Path or Home | `GET` with no parameter - the progress store's bulk hydrate |

A failed Submit writes nothing here. There is no attempt or partial record -
this table only ever says "passed, at this time, matching this blueprint".

### `curriculum_progress`

What the *learner* did, kept deliberately separate from what the validation
engine proved. Keyed by curriculum `slug` (not definition id) so a chapter
with no authored definition can still be marked complete by hand. Composite
PK `(user_id, slug)`. Mirrors Dexie `curriculumProgress`.

| Column | Type | Notes |
|---|---|---|
| `user_id`, `slug` | text | Composite PK |
| `manually_completed_at` | timestamp, nullable | The "Mark complete" toggle. Null = not manually completed |
| `last_visited_at` | timestamp, nullable | Last time the chapter was opened; drives IN_PROGRESS |
| `updated_at` | timestamp | Last-write-wins ordering |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Upsert | Opens a chapter (sets `lastVisitedAt`) | `progress-store.markVisited`. Calls `refresh()` **first**: the sync route has no partial update, so the POST body is a whole row, and composing it from a stale local copy would erase whatever another device changed - opening a chapter would silently un-complete it everywhere |
| Upsert | Toggles "Mark complete" on or off | `setManualComplete`, same full-row refresh-then-write rule. Completing also banks today for the streak; un-completing does not |
| Update (null-out) | Resets a chapter, or resets a whole course | Both timestamps set to `null` rather than the row being deleted. Null/null reads as NOT_STARTED to `deriveStatus`, which is the intended end state |
| Select (all) | Learning Path, Home dashboard, chapter sidebar | `GET`, bulk hydrate + reconcile |

**There is no DELETE route for this table, on purpose.** A locally deleted
row would just be pulled back on the next reconcile, so reset nulls the
fields instead.

### `exam_attempts`

One row per **chapter**, holding that chapter's **best** attempt. Attempts are
still unlimited until passed, against the 80% threshold in
`QUIZ_FRAMEWORK.md` §1, but a beaten attempt is not kept: the row is
overwritten by whatever scored higher. Composite PK
`(user_id, chapter_definition_id)`. Mirrors Dexie `examBest`.

The table name is historical - it holds one best result per chapter, not a
list of attempts. The Dexie store was renamed (`examAttempts` -> `examBest`)
because IndexedDB cannot re-key a store in place; renaming the Postgres table
would have churned the `/api/sync/exam-attempts` route path for nothing.

| Column | Type | Notes |
|---|---|---|
| `user_id`, `chapter_definition_id` | text | Composite PK |
| `total_attempts` | integer | Submissions so far, best or not. All that survives of a discarded attempt, and what the exam UI's attempt count reads |
| `submitted_at` | timestamp | When the **best** attempt was submitted, not the latest one |
| `score` | integer | 0-100, rounded. The best score |
| `answers` | jsonb | `ExamQuestionAnswer[]` from the attempt that earned that score |
| `updated_at` | timestamp | Last-write-wins ordering |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Upsert (new best) | Submits an exam and beats their previous score | `progress-store.recordExamAttempt` refreshes first (the row is a full-row overwrite, same rule as `markVisited`), folds the submission in through `mergeExamAttempt`, then Dexie put -> `syncExamAttempt` |
| Upsert (count only) | Submits an exam and does **not** beat their previous score | Same path. `total_attempts` goes up; score, `submitted_at` and answers stay put. A tie counts as not beaten - an equal score adds nothing, and rewriting the row would move `submitted_at` off the moment the score was first reached |
| Delete (bulk) | Resets a chapter, or resets a whole course | `DELETE ?chapterDefinitionId=` removes the chapter's row. The count restarts from zero |
| Select | Loads the Learning Path or Home, or opens one chapter's exam results | `GET`, optionally filtered by `chapterDefinitionId` |

**The route's upsert is best-preserving, not last-write-wins** (the only route
here that is). One slot per chapter means a device pushing a worse best - an
old attempt flushed late, or one from a device that never saw the better
score - could otherwise overwrite a better one. `ON CONFLICT` takes
`greatest()` of the score and the count, and carries `submitted_at`/`answers`
across only when the incoming score actually wins. The losing client converges
on its next pull.

The results screen right after a submission shows the attempt just submitted,
not the stored best: someone who scored worse than last time still needs to see
what they scored now. "View your result" on a passed chapter shows the stored
best.

**What this gives up:** attempt-by-attempt history. Score-over-time, "your
first attempt vs. your last", and per-question improvement are not
reconstructable from this table, by choice - only the best result and the
number of tries are kept.

### `deep_check_sessions`

One row per completed Deep Check run - an AI critique of a board. Scoped by
`saveId`, the same slot key as `saved_graphs` (`"sandbox"` or
`"chapter:<id>"`), so history belongs to the board that produced it. Mirrors
Dexie `deepCheckSessions`.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Client-generated `crypto.randomUUID()` (`syncId` locally). Dexie's own auto-increment `id` is device-local and never leaves the browser |
| `user_id` | text | Ownership |
| `save_id` | text | Which board/chapter was critiqued |
| `created_at` | timestamp | Run time; the history list is newest-first |
| `critique` | jsonb | `AiCritique` (`src/ai/schema.ts`) |
| `updated_at` | timestamp | Last-write-wins ordering |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Insert | Runs Deep Check on a board and the critique comes back | `deepCheckSessions.saveSession` mints a `syncId`, adds locally, then POSTs. Append-only: a session's content never changes after creation |
| Delete (single) | Deletes one critique from the Deep Check history panel | `deleteSession` -> `DELETE ?id=<syncId>`. Guarded on `syncId` existing, so a legacy row cannot send `?id=undefined` and silently delete nothing |
| Delete (retention) | Nothing - automatic | After every new session, `pruneSessions` keeps the newest 5 per `saveId` and deletes the rest here and locally. It prunes against the *reconciled* list, not just this device's rows, so a device that never opened this board's history still prunes against the true cross-device count. Critiques are regenerable, so aggressive pruning costs nothing |
| Delete (bulk) | Resets a whole course | `resetCourse` deletes every session whose `saveId` is one of the course's chapter slots - a critique of a graph that no longer exists is worse than none |
| Select | Opens the Deep Check history panel for a board | `GET ?saveId=`, unioned with local rows by `syncId`. A failed fetch falls back to local-only rather than union-ing against a phantom empty remote |

### `bug_reports`

Cloud-only. A bug report is a message to the author, not learner state:
nothing to work on offline, nothing to reconcile, no merge.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | Server-generated `crypto.randomUUID()` |
| `user_id` | text | The reporter; every read filters on it |
| `category`, `priority` | text | Plain text validated by zod (`src/bugs/types.ts`), not pg enums, so adding a category is a one-line TS change instead of a migration |
| `title`, `description` | text | The report |
| `status` | text, default `'open'` | Author-owned triage state |
| `closing_notes` | text, nullable | The author's write-up of how it was closed. Null until triaged; the details view renders the section only when set |
| `seen_status` | text, default `'open'` | The status the reporter has already looked at. Unread is `seen_status <> status` |
| `image_ref` | text, nullable | Opaque handle, never a URL and never bytes. Only `src/bugs/image-storage.ts` parses it |
| `closed_at` | timestamp, nullable | When the report reached a terminal status (`resolved` or `closed`) - the start of the 15-day retention clock. Null while active, cleared again if reopened. Deliberately not `updated_at`, which closing notes would reset and `seen` never bumps |
| `image_deleted_at` | timestamp, nullable | When the retention sweep dropped this report's attachment. Exists only so the details view can tell "never had a screenshot" from "the screenshot was deleted on close" |
| `page_path`, `app_version` | text, nullable | Captured by the client at submit time - without them, every report costs a "which page? which build?" round trip |
| `created_at`, `updated_at` | timestamp | |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Insert | Fills in the Report a Bug form and submits | `POST /api/bugs`. If a screenshot is attached it is stored **first** (a stored image with no bug row is a harmless orphan; a bug row pointing at a ref that failed to write is a broken record the user can see). `status` and `seenStatus` both default to `open`, so a fresh report is never unread to its own reporter. The response returns the summary shape so the list updates with no refetch |
| Update (triage, closing) | Sees a report move to Fixed/Won't fix with closing notes, and its screenshot disappear | `POST /api/bugs/[id]/close` (`npm run bugs:close <id>`). Author-side: guarded by `CRON_SECRET`, **no ownership filter** - closing someone else's report is the whole function, the inverse of every other bug route. Sets `status`, `closing_notes`, `closed_at`, then deletes the attachment in the same request. Leaves `seen_status` alone, which is what raises the reporter's badge |
| Update (triage, by hand) | Same | Still supported: a plain SQL `UPDATE status = ...` against the Neon branch. `closed_at` is then stamped by the next nightly sweep instead of instantly, so the retention clock starts up to a day late. Hand SQL is the fallback path now, not the primary one |
| Update (acknowledge) | Opens the report's details view after it changed status | `POST /api/bugs/[id]/seen` copies `status` into `seen_status` and returns the fresh unread count. A POST, not a side effect of GET, so a prefetch or a double render cannot mark an update read that nobody saw. `updated_at` is deliberately not bumped - this is the reporter looking, not the report changing |
| Select (list) | Opens "My reports" | `GET /api/bugs` - summary columns only (no `description`, no image), newest first, `unread` computed per row |
| Select (one) | Opens one report | `GET /api/bugs/[id]`. Ownership lives in the WHERE clause, so a foreign id is an ordinary 404. The `imageRef` never leaves the server; the client only learns `hasImage` |
| Select (count) | Any page with the Report a Bug button mounted | `GET /api/bugs/unread-count` - its own route so the badge does not pay for a list the user has not opened |
| Update (retention clocks) | Invisible | The nightly sweep stamps `closed_at` on terminal reports that lack one (catching hand-SQL closes) and clears it on reopened ones. `src/bugs/retention.ts`, steps 1-2 |
| Update (drop attachment) | The details view says the screenshot was removed when the report was closed | Terminal reports have their `image_ref` nulled and `image_deleted_at` stamped, after the bytes are deleted. `src/bugs/retention.ts` step 3 - also run for a single report by the close route |
| **Delete** | The report vanishes 15 days after it was closed | `GET /api/cron/bug-retention` step 4: `DELETE` where `closed_at` is more than `BUG_RETENTION_DAYS` (15) old. Unconditional - read or not, acknowledged or not. Runs after step 3 in the same sweep, so every row it deletes has already lost its attachment |

**The reporter is told about the deletion.** `GET /api/bugs/[id]` returns a
server-computed `deletesAt` (`closed_at` + 15 days) and `imageRemovedAt`, and
the details view states the date plus "whether or not they have been read".
That is a product requirement, not a nicety - a report that silently
disappears is indistinguishable from a bug in the app. Do not remove the
notice while the purge exists.

**A reporter still cannot delete their own report.** The only DELETE is the
automatic one above.

### `bug_report_images`

The current backing store behind an `imageRef`. Its own table rather than a
column on `bug_reports` so a list query physically cannot drag image bytes
along, and so dropping it for object storage later is a table removal rather
than a bug-record migration.

| Column | Type | Notes |
|---|---|---|
| `id` | text PK | `crypto.randomUUID()`; the ref stored on the bug is `db:<id>` |
| `user_id` | text | Second ownership check, independent of the caller's |
| `mime_type` | text | Served back as the response content type |
| `data` | text | base64, no `data:` prefix |
| `created_at` | timestamp | |

| Operation | User perspective | Technical perspective |
|---|---|---|
| Insert | Attaches a screenshot to a bug report | `putBugImage` during `POST /api/bugs`. Rejects rather than truncates: empty or over `MAX_IMAGE_BYTES` (2 MB) returns 400, because a half-stored screenshot is worse than a report with none |
| Select | The details view renders the attachment | `GET /api/bugs/[id]/image` proves ownership on the bug row first, then `getBugImage` checks `userId` again, then streams real bytes with `cache-control: private, max-age=3600, immutable` so the browser may keep it but no shared cache may |
| Delete (on close) | Screenshot disappears as soon as the report is closed | `deleteBugImage`, from `POST /api/bugs/[id]/close` (immediately) or the nightly sweep (for a report closed by hand SQL). The bytes go **first**, then `bug_reports.image_ref` is nulled: a crash between the two leaves a dangling ref the image route already 404s and the next sweep tidies, whereas the reverse order strands the bytes forever with nothing pointing at them |
| Delete (orphans) | Invisible | `deleteOrphanBugImages`, last step of the nightly sweep. Clears rows no report references and older than 24h - real, not theoretical: `POST /api/bugs` writes the image before the bug row on purpose, so every abandoned submit leaves one. The age floor keeps it from racing a submit that is mid-flight |

Swapping to Vercel Blob later means minting `blob:<url>` refs in
`putBugImage` and teaching `getBugImage` the new prefix, leaving the `db:`
branch for rows already written. No route contract, client code, or bug
record changes. Deletion lives behind the same seam for the same reason - a
Postgres trigger doing the retention cleanup would have had to parse
`db:<uuid>` in SQL and would have silently stopped working on that swap.

**Scheduled cleanup.** `vercel.json` runs `GET /api/cron/bug-retention` daily
at 04:00 UTC. Crons only fire on production deployments, so a preview branch
never deletes production rows. Auth is `CRON_SECRET` (Vercel sends it as
`Authorization: Bearer ...`); the route and the close route both fail closed
with a 503 when it is unset. Full rationale:
`.claude/docs/pending-bug-retention.md`.

## Deliberately not in Postgres

Not everything the app persists lives here, and the omissions are decisions,
not gaps:

- **Day streak / active days** - the durable day log lives in Dexie
  (`activeDays`) and syncs to the Clerk user's `publicMetadata` through
  `/api/streak-days` (`src/persistence/active-days.ts`,
  `streak-days.ts`). It unions rather than merging last-write-wins, has no
  `SyncMeta`, and has **no DELETE by design** - the whole point is that
  resetting progress cannot destroy the streak, so an endpoint that could
  wipe it would hand back the capability the design withholds. Filing it
  under `/api/sync/` would imply a contract it does not implement.
- **AI profiles and the provider API key** - Dexie only, never sent to the
  server, and cleared on sign-out (`clearLocalStateOnSignOut`) because a key
  leaking between accounts is the worst thing in local storage.
- **Home's feedback survey** - relayed as email through Brevo
  (`/api/feedback`), never stored in any table. That route is deliberately
  unauthenticated and rate-limited so first-look visitors can use it.
- **Guided tour state** - `localStorage`, per browser.
- **Curriculum content** (chapters, components, blueprints, validation rules)
  - versioned TypeScript in the repo, per `CLAUDE.md`. No CMS, no content
  tables.
- **`user_sync_state`** - created by migration `0000` and never used; dropped
  in `0006`. If an old snapshot or doc mentions it, it is gone.

Sign-out wipes the local Dexie stores; the Postgres rows survive untouched
and re-hydrate on the next sign-in. That asymmetry is the whole point of the
mirror.

## Deploy gating

`vercel.json`'s `ignoreCommand` (`scripts/check-deploy-branch.sh`) only lets
`main`, `develop`, and `release/*` branches deploy. Every other branch is
skipped at the Vercel layer, so only those three branches ever run against
the Production/Preview Neon branch.
