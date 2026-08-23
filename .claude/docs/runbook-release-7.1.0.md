# Runbook: promoting release 7.1.0-alpha to develop and main

Written 2026-08-23. Covers the database side of moving release 7.1.0-alpha
(report-a-bug, the streak fix, and the save/sync + best-only-exam work in
`.claude/docs/pending-save-sync.md`) from a release branch to `develop` and
then `main`.

Delete this file once 7.1.0 is on `main`. It is a one-release runbook, not a
standing reference - the durable versions of what it explains live in
`docs/DATABASE.md` (branch-per-environment, per-table behavior) and
`.claude/docs/pending-save-sync.md` (why the schema changed).

**State when this was written:** the Development Neon branch is migrated
through `0007_redundant_reaper`. `main` is not.

---

## The ordering constraint (read this first)

`develop` deploys to **Preview**, and the Preview `DATABASE_URL` is the Vercel
entry scoped "Production, Preview" together, resolving against the `main` Neon
branch (`br-summer-breeze-aww4iph2`). Preview auto-branches per deployment, but
that branch is a copy of `main` as it is at that moment, so it inherits main's
schema.

**So `main`'s Neon branch has to be migrated before the merge to `develop`, not
before the merge to `main`.**

Migrating after the develop merge means UAT runs new code against old schema
and every exam sync returns 500. That looks like a code bug and is not one.

## The window that cannot be avoided

`0007` is destructive: it drops `attempt_number` and collapses every chapter's
attempts to one row. Currently-deployed production code still writes
`attempt_number`. So either order leaves a gap:

- Migrate first: production exam submissions break until the `main` merge lands.
- Merge first: production exam submissions break until the migration lands.

Migrate first is the better half of the trade. The breakage falls on code that
is about to be replaced anyway, and it lets develop/UAT validate against the
right schema.

**Scope of the breakage:** exam submit and exam hydrate only. Saves, chapter
progress, curriculum progress, bug reports and Deep Check are untouched by
`0007`.

The zero-downtime alternative is expand/contract - ship `total_attempts`
additively in 7.1.0 with code tolerating both shapes, drop `attempt_number` in
7.2.0. Real work, and not worth it at alpha scale. Keeping steps 5 and 8 below
minutes apart rather than days is the whole mitigation.

---

## Before opening the PR

1. **Write the 7.1.0-alpha release-notes entry.** `src/content/release-notes.ts`
   still tops out at 7.0.0-alpha, so 7.1.0 is already owed one covering
   report-a-bug, the streak fix, and the save/sync work. Follow
   `.claude/docs/RELEASE_NOTES.md` - `release-notes.test.ts` fails CI on an
   off-pattern entry.

2. **Check which Neon branch the `DATABASE_URL` GitHub secret points at.**
   `.github/workflows/ci.yml` runs the full e2e suite against a live database,
   and those tests now exercise exam sync. If that secret is the `main` branch,
   CI fails on the PR until step 5 has run. If it is `development`, CI is
   already fine.

3. **Confirm how far behind `main` actually is.** It may be missing more than
   `0007` if the report-a-bug tables were never applied there:

   ```sql
   select hash, created_at from drizzle.__drizzle_migrations order by created_at;
   ```

   Compare the row count against the 8 entries in `drizzle/meta/_journal.json`.

## Promotion

4. Merge `fix/db-fixes` into the release branch, open the release -> `develop`
   PR, and let CI go green.

5. **Migrate `main`'s Neon branch, before merging that PR:**

   ```bash
   DATABASE_URL_UNPOOLED='<Production unpooled URL from Vercel>' \
     NODE_OPTIONS="$NODE_OPTIONS --no-network-family-autoselection" \
     node scripts/migrate.mjs
   ```

   Take the URL from Vercel's Production scope, not from anything cached
   locally - the `neondb_owner` password was rotated (see `docs/DATABASE.md`).
   Bypassing `npm run db:migrate` is deliberate: that script loads `.env.local`
   and would hit the dev branch instead.

6. **Verify before going further:**

   ```sql
   \d exam_attempts
   select count(*), count(distinct (user_id, chapter_definition_id)) from exam_attempts;
   ```

   Both counts must be equal, `total_attempts` must be `not null`,
   `attempt_number` must be gone, and the primary key must be
   `(user_id, chapter_definition_id)`.

7. **Merge to `develop`.** Preview deploys against the now-correct schema. UAT
   click-through worth doing here:
   - Submit a chapter exam twice, failing then passing. The count reads
     "Attempt 2" and the score reads the best, not the latest.
   - Fail a third time. The count goes to 3 and the best score does not move.
   - Edit the sandbox and press Save several times. No cloud write. Wait out
     the 5 minute checkpoint, or navigate away, and confirm exactly one.
   - Edit a chapter canvas and press Save. No cloud write. Press Submit. One
     cloud write.
   - Click the header cloud indicator while it is showing a pending count and
     confirm the count clears.

8. **Merge `develop` into `main`.** No further migration: Preview and
   Production share the branch already migrated in step 5.

---

## If the migration half-applies

The neon-http migrator runs `0007`'s statements one at a time over HTTP, so a
mid-migration failure can leave a partial schema with no `0007` row in
`drizzle.__drizzle_migrations`.

Do not re-run blindly. Check `\d exam_attempts` first, hand-finish the
remaining statements from `drizzle/0007_redundant_reaper.sql` in file order,
then confirm the migrations row landed.

Re-running a migration that fully applied is safe and idempotent - the journal
table skips it - so a duplicate run in the normal case costs nothing.

Neon's branch/restore is the undo if the collapse goes wrong. Confirm the
restore window on the current plan **before** step 5, not during it.

## Two things that need no action

- **Users' local data upgrades itself.** The Dexie v13/v14 upgrade runs in the
  browser on first load after deploy, collapsing local attempts with the same
  tie-break rule as the SQL (highest score, then earliest `submitted_at`).
- **Rows that fail to push during the window are not lost.** They stay `dirty`
  and retry on the next mount, the next `online` event, or a click of the
  header cloud indicator.
