# Release 6.1.0-alpha - Neon Cloud User-Space Migration: Scoping

Status: **Scoping in progress - not ready to build.** Started 2026-08-12,
right after 6.0.0's Clerk auth work landed on `feature/clerk-auth` (production
DNS still propagating). This is the running scoping doc for this release -
update in place as decisions land, per this project's scoping convention.

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
   - *Your call*: customComponents. Cross-device-useful in theory, but it's
     another table + route + sync path for what's likely light usage.
     Proposing we defer it out of 6.1.0 v1 unless you disagree.

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
   on open signup. Flagging this as a 6.0.0 cleanup item (it's an auth
   decision, not a sync one) so it doesn't get silently dropped while we
   focus on this doc.

## Explicitly out of scope for 6.1.0 unless you object

- Anon -> account data migration: not needed, the whole app is already gated
  behind sign-in, no anonymous mode ever existed.
- Multi-device real-time merge/conflict UI: rejected per the no-multiplayer
  principle.
- GDPR/data-export/delete-my-data tooling: solo/pre-beta project, revisit if
  it ever gets real users.
- customComponents sync: proposed default is defer, see item 1.

---

## Scoped items (tracking checklist)

Empty until the decisions above land - filled in once scoping is done, same
pattern as `pending-diagram-pipeline.md`.
