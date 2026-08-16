# Release 6.1.0-alpha - Neon Cloud User-Space Migration: Scoping

Status: **Scoping decisions locked 2026-08-12. Ready to build.** Started
2026-08-12, right after 6.0.0's Clerk auth work landed (now merged to
`main`/`develop`, `feature/clerk-auth` deleted post-merge). Branch:
`release/v6.1.0-neon-cloud-sync`, cut from `develop`, version bumped to
`6.1.0-alpha`. This is the running scoping doc for this release - update in
place as decisions land, per this project's scoping convention.

---

## Why this is 6.1.0, not folded into 6.0.0

The release branch was originally named `release/v6.0.0-auth-cloud-sync`,
anticipating both together. You've now explicitly split it: 6.0.0 = Clerk
auth end-to-end to production, 6.1.0 = Neon-backed cloud sync of local Dexie
data. Auth is a hard dependency for sync (rows are keyed by Clerk `userId`),
so the split respects the real dependency order. This doc is effectively the
second half of MILESTONES.md item 10 ("Auth + cloud sync").

## What already exists - don't re-build

- `src/db/schema.ts` - one table, `savedGraphs` (id, userId, scopeId, graph
  jsonb, updatedAt). Already anticipates Clerk userId keying.
- `src/db/client.ts` - lazy Drizzle+Neon client, throws only if `DATABASE_URL`
  is unset.
- `drizzle.config.ts` + `db:generate`/`db:migrate` npm scripts - already wired.
- Neon was chosen over Supabase specifically for scale-to-zero without a
  multi-day pause on inactive free projects, branch-per-PR workflow, and
  first-party Vercel integration (TECH_STACK.md) - relevant given the
  zero-budget constraint from the Clerk domain work.
- Nothing provisioned yet: `vercel env ls` is empty, no `DATABASE_URL`
  anywhere.

## What needs deciding - my first-pass read, correct as needed

1. **Which of the 8 Dexie tables actually need cloud sync?**
   `src/persistence/db.ts` has: saves, customComponents, chapterProgress,
   aiProfiles, aiActiveProfile, deepCheckSessions, curriculumProgress,
   examAttempts. Only `saves` has a Postgres counterpart so far.
   - *Sync*: saves, chapterProgress, curriculumProgress, examAttempts,
     deepCheckSessions - all "what did the learner do/complete" facts, which
     is exactly what cross-device continuity is for.
   - *Stay local-only*: aiProfiles/aiActiveProfile. The AI provider API key
     living inside `AiSettings` should almost certainly never leave the
     browser - syncing it makes this app a secret store for zero product
     benefit. Treating this as an explicit non-goal, not an oversight.
   - **Decided: include.** customComponents syncs too - a 6th synced table
     alongside saves, chapterProgress, curriculumProgress, examAttempts,
     deepCheckSessions. Only aiProfiles/aiActiveProfile stay local-only.

2. **Sync trigger: write-through or background?**
   Local Dexie writes must stay instant/offline-safe (existing autosave
   contract in `use-autosave.ts`) - cloud sync can't block or replace that.
   Proposal: after a successful local Dexie write, fire a debounced
   background POST to a Route Handler (reuse `use-autosave.ts`'s existing
   debounce). A failed sync just means "not yet synced," retried on the next
   write or next app load - no offline queue/retry infra, this is a
   single-user app, not building for scale.

3. **Read path: hydrate on load, from where?**
   Existing device: Dexie is already authoritative and instant, no reason to
   wait on network. New/different device: nothing local yet, must pull from
   Postgres. Proposal: always read Dexie first (unchanged); if a given scope
   (chapterId or sandbox save) has no local row and the user is
   authenticated, do one pull from Postgres to hydrate Dexie, then fall back
   to empty. No full sync-merge engine needed.

4. **Conflict resolution across devices**
   Given the standing single-player/no-multiplayer principle, simultaneous
   edits to the same save from two devices is an edge case, not a design
   center. Proposal: last-write-wins by `updatedAt`, no merge logic -
   consistent with "don't let persistence pay a tax for eventual
   multiplayer" already on record in OPEN_QUESTIONS.md.

5. **Schema/migration parity between Dexie and Postgres**
   Dexie is at schema v9 with real history (e.g. quizProgress ->
   examAttempts). Postgres is brand new, so it doesn't inherit that baggage.
   Proposal: Postgres tables mirror the *current* Dexie shape only, migrated
   via `drizzle-kit generate`/`migrate`. Future Dexie shape changes need a
   matching Postgres migration going forward - worth a one-line note in
   ARCHITECTURE.md once this ships.

6. **Docs/stub cleanup - 6.0.0 or 6.1.0?**
   `beta-allowlist.ts` plus its OPEN_QUESTIONS.md entry and the closed-beta
   language in ARCHITECTURE.md/MVP_SCOPE.md are stale now that you've decided
   on open signup. **Decided: separate chore, out of this release's scope.**
   Track as its own `chore/*` branch off `develop`, not bundled into
   6.1.0-neon-cloud-sync.

## Explicitly out of scope for 6.1.0 unless you object

- Anon -> account data migration: not needed, the whole app is already gated
  behind sign-in, no anonymous mode ever existed.
- Multi-device real-time merge/conflict UI: rejected per the no-multiplayer
  principle.
- GDPR/data-export/delete-my-data tooling: solo/pre-beta project, revisit if
  it ever gets real users.
---

## Decisions locked 2026-08-12

1. **Synced tables (6):** saves, chapterProgress, curriculumProgress,
   examAttempts, deepCheckSessions, customComponents. **Local-only (2):**
   aiProfiles, aiActiveProfile.
2. **Sync trigger:** debounced background POST to a Route Handler after a
   successful local Dexie write, reusing `use-autosave.ts`'s debounce. No
   offline queue/retry infra - a failed sync just retries on next write/load.
3. **Read path:** Dexie-first, always. One-shot pull from Postgres to
   hydrate Dexie only when a scope has no local row and the user is
   authenticated. No sync-merge engine.
4. **Conflict resolution:** last-write-wins by `updatedAt`. No merge logic.
5. **Schema parity:** Postgres tables mirror the *current* Dexie shape only
   (not its v1-v9 history). Future Dexie changes need a matching Postgres
   migration going forward - note this in ARCHITECTURE.md once shipped.
6. **beta-allowlist.ts / stale closed-beta docs cleanup:** out of scope for
   this release - separate `chore/*` branch off `develop`.

## Explicitly out of scope for 6.1.0

- Anon -> account data migration: not needed, the whole app is already gated
  behind sign-in, no anonymous mode ever existed.
- Multi-device real-time merge/conflict UI: rejected per the no-multiplayer
  principle.
- GDPR/data-export/delete-my-data tooling: solo/pre-beta project, revisit if
  it ever gets real users.
- beta-allowlist.ts / closed-beta docs cleanup: tracked separately, see
  decision 6 above.

---

## Scoped items (tracking checklist)

- [x] Provision Neon database + set `DATABASE_URL` in Vercel env (dev/preview/prod).
      Initially all three Vercel environments shared one Neon branch (`main`,
      id `br-summer-breeze-aww4iph2`). Fixed 2026-08-12: Preview already
      auto-branches per deployment (Vercel's Neon integration, no setup
      needed); Development now points at its own branch (`development`, id
      `br-billowing-field-awvgzzbt`, host `ep-sweet-union-awxmuy08`) via
      per-environment `DATABASE_URL`/`DATABASE_URL_UNPOOLED` entries in
      Vercel (previously one shared "All Environments" entry). The
      `neondb_owner` role password was rotated on both branches during this
      change after an accidental exposure in a terminal session - if a
      future `DATABASE_URL` connection ever fails with an auth error, that's
      likely why; check Vercel's current env var value, not this doc, for
      the live credential.
- [x] `src/db/schema.ts`: add tables for chapterProgress, curriculumProgress,
      examAttempts, deepCheckSessions, customComponents (mirroring current
      Dexie shapes), keyed by Clerk `userId`
- [x] `drizzle-kit generate` + `drizzle-kit migrate` for the new tables.
      Applied and verified against the real Neon DB (all 6 tables present,
      columns match schema.ts). Note: this WSL2 environment's `fetch` (and
      `@neondatabase/serverless`) intermittently fails with `ETIMEDOUT` on
      IPv6 candidates - `--dns-result-order=ipv4first` alone doesn't fix it
      reliably, only forcing `family: 4` on the underlying connection does.
      Retry `db:migrate` a few times if it fails with a fetch error; it's
      networking flakiness, not a migration problem.
- [x] Route Handlers: POST (write-through sync) + GET (one-shot hydrate) per
      synced table/scope. Six routes under `src/app/api/sync/<table>/route.ts`
      (saves, custom-components, chapter-progress, curriculum-progress,
      exam-attempts, deep-check-sessions), each auth-gated via
      `src/db/sync/auth.ts::requireUserId()` (Route Handlers aren't covered by
      the `(protected)` layout's `auth.protect()` - that only gates pages).
      POST bodies validated with per-table Zod schemas in
      `src/db/sync/schemas.ts`; upserts via `onConflictDoUpdate` on each
      table's natural key, server always stamps `updatedAt = now()`.
      `savedGraphs.graph` stores the domain `ArchitectureGraph` (client runs
      `toArchitectureGraph()` before POSTing) per explicit user decision
      2026-08-12 - **zones are dropped on cross-device restore**, a known,
      accepted tradeoff, not a bug. `deepCheckSessions.id` must be a stable
      client-generated id assigned once per session before its first sync
      (Dexie's local auto-increment id doesn't survive cross-device) - not
      yet wired, see next checklist item. No DELETE routes yet (e.g.
      removing a custom component doesn't propagate) - out of scope for this
      item, revisit when wiring the write path if it matters in practice.
      Verified: typecheck/lint clean, all 6 routes correctly 401 on
      unauthenticated requests against the real dev server. Full
      authenticated round-trip not yet verified (needs a signed-in session -
      deferred to the manual click-through checklist item).
- [x] Wire debounced background sync into each table's existing Dexie write
      path. `saves` reuses `use-autosave.ts`'s existing debounce (one call
      site fixes both sandbox and chapters); the other five tables sync
      fire-and-forget right after their (already-infrequent) Dexie write via
      `src/persistence/cloud-sync.ts`. `deepCheckSessions` gained a new
      `syncId` field (client `crypto.randomUUID()`, unindexed - no Dexie
      version bump) since its local auto-increment `id` is device-local.
      Added DELETE routes (chapter-progress, exam-attempts bulk,
      custom-components, deep-check-sessions) not in the original Route
      Handler pass - needed so `progress-store.ts`'s `resetChapter` (redo a
      chapter) propagates, not just adds/updates.
- [x] Wire Dexie-first read with Postgres hydrate-on-empty for authenticated
      users, per table/scope. Six call sites: sandbox page (saves,
      customComponents), ChapterWorkspace (saves, chapterProgress),
      progress-store's `hydrate()` (chapterProgress, curriculumProgress,
      examAttempts - each checked/hydrated independently, per-table).
      `chapter-progress`/`curriculum-progress`/`exam-attempts` GET routes now
      support two modes: `?scope=` for one row, no query for every row for
      the user (needed for progress-store's bulk hydrate - not anticipated
      in the original Route Handler pass either).
- [x] Last-write-wins conflict handling via `updatedAt` comparison on sync.
      Turned out to need no extra code: hydrate-on-empty only ever adopts a
      remote row when local has none at all (never a merge), and every POST
      unconditionally overwrites with `updatedAt = now()` server-side - so
      whichever device's write reaches the server last already wins, by
      construction.
- [x] One-time backfill for pre-existing local data (added mid-session,
      2026-08-12 - not in the original scoped list). Found via the first
      real multi-device test: a user's local Dexie data that predates this
      whole feature (e.g. chapters completed before cloud sync existed)
      never gets pushed by the normal write-path sync, since that only
      fires on *new* writes going forward. New `userSyncState` table
      (migration 0002) is a one-row-per-user switch: `GET
      /api/sync/backfill` tells a device whether to push; the first device
      to see `backfilled: false` pushes every local table once via
      `src/persistence/backfill.ts`, then `POST`s to mark the user done.
      Every other device for that account just sees `backfilled: true` and
      relies on the hydrate-on-empty already wired - it never re-pushes,
      even if its own local state is empty or stale. Mounted once at
      `src/app/(protected)/layout.tsx` via `BackfillOnMount.tsx` (not
      AppHeader - that's canvas-only, absent from the Learning Path home
      page, so not a universal-enough mount point). Existing
      `deepCheckSessions` rows saved before `syncId` existed get one
      assigned retroactively during backfill rather than being silently
      dropped.
- [x] **REVERTED 2026-08-12: the backfill above is removed entirely.** See
      the addendum at the end of this doc.
- [ ] ARCHITECTURE.md: note the Dexie<->Postgres schema-parity obligation
      going forward
- [ ] Manual multi-device click-through: save on device A, load on device B,
      confirm hydrate; edit both, confirm last-write-wins. First real attempt
      (2026-08-12, Chrome vs. Edge, same account) caught the backfill gap
      above rather than confirming success - retry now that it's fixed.
      **Still blocked:** see audit finding S4, hydrate-on-empty does not
      propagate updates to a device that already holds local data, so this
      test cannot pass as written until that is re-decided.

---

## Addendum 2026-08-12: backfill removed, one-time local reset instead

A persistence audit (`.claude/docs/pending-persistence-audit.md`) found that
the one-time backfill could push one account's local data into a *different*
account's cloud rows: the Dexie database is a single browser-wide
`"scalecraft"` store with no userId dimension and no sign-out cleanup, so a
second account signing in on the same browser reads the first account's data
and, with `backfilled: false` on the server, pushes all of it up under its own
userId (audit S2/S3).

**Decision (user):** remove the backfill flow outright. It cannot distinguish
"this local data belongs to this account" from "someone else left this here",
and a user may legitimately want data in one account and not another.

Removed:
- `src/persistence/backfill.ts`, `src/persistence/BackfillOnMount.tsx`
- `src/app/api/sync/backfill/route.ts`
- `userSyncState` table + `getBackfillStatus`/`markBackfillComplete`
- migration `drizzle/0003_light_the_stranger.sql` drops `user_sync_state`

Replaced by a one-time local reset at 6.1.0, accepted at 3 total users:
- **Dexie:** `db.ts` version(10) clears every table on upgrade. Done as a
  schema bump, not a mount effect, so it runs before any read can race it.
  aiProfiles is cleared too despite being local-only - it holds the AI
  provider API key, the worst thing to leak between accounts. Users re-enter
  their key once.
- **localStorage:** `src/persistence/LocalStorageReset.tsx`, epoch-gated on
  `scalecraft:storage-epoch`, clears the `sc-` and `scalecraft:` prefixes.

Also fixed in the same pass: audit S1, a reproduced data-loss bug where
`markVisited` wiped a chapter's `manuallyCompletedAt` and synced the null up.
Unrelated to stale storage, so the reset would not have covered it.

**The reset does not fix S2 structurally.** Account isolation still depends on
nobody sharing a browser between accounts; the contamination recurs on the
next account switch. Wipe-on-user-change is the recommended follow-up.
