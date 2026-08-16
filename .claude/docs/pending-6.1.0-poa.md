# Release 6.1.0-alpha - Remaining Fixes

Status: **Feature-complete and merged to `staging/release-6.1.0`, not shippable
yet.** Phases 0-11 all landed; this file is now the close-out list from the
2026-08-16 audit of the merged branch, not the build plan. The build plan (all
eleven phases, every decision and its rationale, the storage measurements and
the S1-S11 mapping) was replaced by this rewrite and lives in git history -
`git show f0db112:.claude/docs/pending-6.1.0-poa.md` for the last full version.
Its two companions are untouched and still the evidence files:
`pending-cloud-sync.md` and `pending-persistence-audit.md`.

Everything below is a defect or gap found *after* the phases were called done.
Nothing here is new scope.

## Where the code is

| Branch | Contains |
|---|---|
| `staging/release-6.1.0` | All of release 6 (both halves). The branch these fixes land on |
| `release/v6.1.0-neon-cloud-sync` | Recut from `develop`. Contains **no** cloud sync at all |
| `develop` / `main` | 6.0.0-alpha. Never received any of release 6 |

CI on the merged staging branch: typecheck, lint and build clean; tests
1780/1781 (the one failure is P2.4 below, a flake).

---

## P1 - Blocks the release

### 1.1 Sign-out leaves the previous account's progress on screen

Phase 11 made reading public. It did not give sign-out anywhere to put the
signed-in user's state, and there is no `signOut` handler anywhere in `src/`.

The mechanism, all three parts confirmed against the merged branch:

- `LocalStateGate` no-ops on a null `userId`, and `reconcileLocalStateForUser`
  only wipes when a *different* userId signs in. Signing out stamps nothing.
- `useCurriculumProgressStore` is a module singleton. Its `rowsBySlug`,
  `validationPassedDefinitionIds` and `examAttemptsByDefinition` survive sign-out.
- No `afterSignOutUrl` is configured on `ClerkProvider`, so Clerk's default is a
  client-side navigation to `/`. No document load, so the singleton is not torn
  down.

Result: sign out, land on the now-public Home canvas, and the previous account's
completions are still rendered. The `isSignedIn` guards on `HomeCanvas` /
`LearningPath` / `ReaderSidebar` only stop *new* hydrates; they do not clear what
is already in the store. Clears on any hard reload, so the window is one
session - but on a shared browser that is the exact window that matters.

This is audit S2 (cross-account leak) returning through the door Phase 11
opened. It is narrower than the original S2 (in-memory only, and the next
sign-in still wipes Dexie correctly) but it is the same class of bug.

- [ ] Reset the progress store and `custom-components-store` when `isSignedIn`
      goes false. A store-level `reset()` beside the existing `hydrate`/`refresh`
      is the smallest shape, driven from one component mounted in the root
      layout next to `LocalStateGate`.
- [ ] Decide whether sign-out should also clear Dexie, not just memory. Leaning
      yes, treating "local is a disposable cache" (this release's core decision)
      as the licence: the cloud refills it on next sign-in, so there is no cost,
      and it closes the on-disk half of the same hole.
- [ ] Regression test: hydrate as user A, flip `useAuth` to signed-out, assert
      the store no longer exposes A's rows.

### 1.2 The eleven removed chapter URLs 404 with no redirects

Phase 10 deleted eleven Part 1 slugs. Nothing in `next.config.*` or `src/proxy.ts`
maps them anywhere, so every bookmark and every external link into Part 1 is dead.
That includes links from the separate private textbook, which is the one
integration point CLAUDE.md says ScaleCraft has with it (manual citation URLs).

Both `/building-blocks/<slug>` and `/building-blocks/<slug>/lesson` need the
mapping. Targets follow Phase 10's absorption table:

| Old slug | Redirects to |
|---|---|
| `1-1-understanding-the-problem` | `1-1-framing-the-problem` |
| `1-2-functional-requirements` | `1-1-framing-the-problem` |
| `1-3-non-functional-requirements` | `1-1-framing-the-problem` |
| `1-4-estimating-scale` | `1-1-framing-the-problem` |
| `1-5-numbers-every-engineer-should-know` | `1-1-framing-the-problem` |
| `1-6-drawing-the-first-architecture` | `1-2-designing-the-system` |
| `1-7-identifying-bottlenecks` | `1-2-designing-the-system` |
| `1-9-deep-dive-methodology` | `1-2-designing-the-system` |
| `1-8-engineering-trade-offs` | `1-3-defending-the-design` |
| `1-10-communicating-and-defending-a-design` | `1-3-defending-the-design` |
| `1-11-driving-a-system-design-interview` | `1-4-driving-the-interview` |

- [ ] Add the redirects. `next.config`'s `redirects()` is the right home - static,
      no request inspection needed, and it keeps `proxy.ts` a bare
      `clerkMiddleware()`.
- [ ] Permanent (308) or temporary (307)? Recommend **permanent**: the old slugs
      are never coming back, and permanent is what tells the textbook's links and
      any crawler to stop asking.
- [ ] Test coverage that every old slug resolves rather than 404s, so a future
      slug change cannot quietly drop one.

### 1.3 Zones cross-device round trip is still unverified

The single unproven claim in the release. Phase 3.4 replaced the `graph` column
with raw `canvasState` and TRUNCATEd `saved_graphs` *specifically* because
`ArchitectureGraph` does not carry zones or Start markers, and reconciliation
made a lossy round trip capable of silently deleting a learner's zones.

Nothing tests it. `multi-device-sync.spec.ts` has eight cases including a sandbox
canvas round trip, but no case ever places a zone. The migration that justified
truncating the table is the one thing not covered.

- [ ] Add a zones case to `multi-device-sync.spec.ts`: place a zone (and a Start
      marker) on device A, save, confirm both arrive intact on device B.
- [ ] Run it. This is the one place in the release where an e2e run is worth
      asking for specifically, per the standing convention that e2e runs are
      requested rather than automatic.

---

## P2 - Should fix before the release walks to develop

### 2.1 A discarded offline edit gives the user no signal

`reconcile.ts`'s `pickWinner` drops a dirty local row once
`remote.syncedAt > local.syncedAt`. That is deliberate and correct for the
stuck-400 case Phase 9.1 wrote it for, and it is the right call for a
single-player LWW product.

What is missing is that the discard is *silent*. `sync-status.ts` tracks
`pullError` and `dirtyCount`; a row that loses reconciliation just stops being
dirty, so the count goes down and the user reads that as success. The one case
where a real edit is genuinely lost is the one case with no signal at all.

- [ ] Decide the minimum honest signal. A count of discarded-on-reconcile rows
      surfaced through the existing `CloudSyncIndicator` is probably enough; a
      modal is too much for something single-player makes rare.

### 2.2 `beta-allowlist.ts` is enforced nowhere

Pre-existing, not a Phase 11 regression - it has been an explicit stub since the
original scaffold ("Not yet wired to a real Clerk webhook/middleware"). Phase 11
is what makes it matter: reading is now fully public, so nothing stands between a
stranger and the entire curriculum, and sign-up is open.

- [ ] **Decision needed, not a code fix.** Either wire the allowlist (a Clerk
      webhook rejecting non-invited sign-ups), or delete the stub and accept that
      reading is public and accounts are open. The current state - a file that
      looks like a gate and is not one - is the only option worth ruling out.

### 2.3 Doc drift left by the phases

- [ ] `pending-chapters.md`: the four new chapters still have no Opus proofread
      pass recorded. Phase 10 authored them and explicitly deferred the review.
- [ ] `ARCHITECTURE.md` still owes the Dexie/Postgres schema-parity note carried
      over from `pending-cloud-sync.md`. Called out there as an ongoing
      obligation and never written.

### 2.4 Flaky test will redden CI at random

`src/app/(protected)/sandbox/page.test.tsx` > "running Validate against the seed
graph reports zero violations and clears staleness". Failed once under full-suite
parallel load on the merged branch, then passed 5/5 in isolation. Not caused by
the merge - the identical tree passed a full run earlier the same session. The
assertion races the staleness flag against validation completing.

- [ ] Make the staleness assertion wait for the state it expects rather than
      reading it immediately after the violations count settles.

---

## Explicitly NOT in 6.1.0

Recorded so they are decisions rather than oversights.

| Item | Why not now | Trigger |
|---|---|---|
| MDX compile cost (`/api/lessons/[chapterId]` recompiles per request, ~36ms mean, 80ms worst, no caching) | Release 7's whole subject | Scoped as release 7 |
| Chapters sync on Submit only, so unsubmitted work never reaches the cloud | Deliberate tradeoff (Phase 4.3), single-player | If in-progress continuity is ever wanted; flush on `visibilitychange` is the hook |
| Residual clobber race - a mutator awaiting an in-flight `refresh()` composes from stale data (~1s window) | Structural fix is a partial-update sync API; every write today is a whole-row overwrite | When a whole-row overwrite causes a third S1-class bug |
| `saves` excluded from the refocus pull | Replacing a canvas under a learner mid-edit is worse than the staleness | Never, unless the tradeoff is re-argued |
| Deep Check pruning under-prunes when the cloud fetch fails | Safe by construction, critiques are regenerable | If server-side session count is ever observed unbounded |
| Four quarantined e2e specs (`test.fixme`) | Pre-existing, arrived from develop, unrelated to release 6 | `pending-e2e-quarantine.md` owns these |
| Clerk dev -> prod userId discontinuity, and 0004's TRUNCATE | Both accepted; the progress wipe at cutover is intended | None. Sync tracks from the cutover forward |

---

## Audited and found sound

Recorded so this ground is not re-covered. Verified against the merged branch,
not against the old build log's claims.

- Merge is content-identical to `feature/cloud-sync-reconciliation`.
- No route-group collision between `(public)` and `(protected)`; build clean.
- Account isolation on sign-in as a *different* user works and is tested
  (`db.test.ts` "account isolation", plus the v10 reset block).
- Reconciliation merge semantics and the clock-skew case both have real coverage
  in `reconcile.test.ts`, including the stuck-dirty regression from Phase 9.1.
  These were left unticked in the old plan despite being done.
- The mutate-before-reconcile invariant is enforced and tested.
- Phase 11's write surface is fully gated: the two actions on public pages
  (mark-complete toggle, quiz launch) both route through `useRequireAuthAction`,
  and the three public read surfaces never call `hydrate`/`refresh` signed out.
- `/api/lessons/*` is correctly public; `/api/sync/*` correctly 401s.

## Verification gate for the release

- [ ] P1.1, P1.2, P1.3 closed
- [ ] P2.4 closed so the suite is honestly green
- [ ] Full CI: `npm run typecheck && npm run lint && npm test && npm run build`
- [ ] `multi-device-sync.spec.ts` run green, including the new zones case
- [ ] `staging/release-6.1.0` reviewed and merged onward by the user. Claude does
      not merge to `develop` or `main`.
