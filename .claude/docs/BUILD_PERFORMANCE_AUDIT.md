# Build & Deployment Performance Audit

Date: 2026-08-04
Branch: `fix/vercel-build-duplication` (off `release/v3.4.0-test-updates`)

Method: profile first, optimize second, measure last. All "before" numbers
below come from a real production Vercel deployment
(`dpl_GHHS9tgXQXyq3ZMjHiJcv7kgnFAD`, commit `378d6f6`, main), pulled via the
Vercel API/build logs - not simulated. "After" numbers come from a rebuild
with the fix applied, timed locally and reasoned from the same log evidence.

## Current Build Pipeline (before)

```
vercel.json  buildCommand:
  npm run typecheck && npm run lint && npm test && npm run build

package.json build script:
  npm run typecheck && npm run lint && npm test && next build
```

Every Vercel deploy therefore ran typecheck, lint, and the full Vitest unit
suite **twice**: once directly, once again inside `npm run build`.

## Bottlenecks (measured, from the real deploy's build log)

Build machine: **2 vCPU, 8 GB** (Washington, D.C. / iad1).

| Time (build log) | Phase |
|---|---|
| 18:16:59 - 18:17:02 | Clone + restore cache (fast, cache hit) |
| 18:17:02 - 18:17:04 | `npm install` - "up to date in 1s" (cache hit, not a bottleneck) |
| 18:17:04 - 18:17:17 | `npm run typecheck` #1 - ~13s |
| 18:17:17 - 18:17:31 | `npm run lint` #1 - ~14s |
| 18:17:31 - ~18:21:35 | `npm test` #1 (vitest, 1336 tests / 160 files) - **~244s** |
| ~18:21:35 - 18:21:56 | `npm run typecheck` #2 + `npm run lint` #2 (inside `npm run build`) - ~21s |
| 18:21:56 - 18:26:00 | `npm test` #2 (same suite, again) - **244.01s** (Vitest's own reported duration) |
| 18:26:01 - 18:26:58 | `next build` (compile 40s + internal TS check 14.1s + static gen 0.5s) - ~57s |
| — | **Vercel's own summary: `Build Completed in /vercel/output [10m]`** |
| 18:26:58 - 18:27:33 | Deploy outputs + create/upload build cache - ~35s (outside the "build" phase, not addressed here) |

## Root Causes

1. **The entire quality-gate pipeline ran twice per deploy.** `vercel.json`'s
   `buildCommand` ran `typecheck && lint && test && npm run build`, and
   `npm run build` itself re-ran `typecheck && lint && test` before
   `next build`. This alone doubled typecheck, lint, and test cost on every
   deploy for no benefit - the second pass could never catch anything the
   first pass didn't already catch on the same commit.

2. **The full unit test suite ran on Vercel at all.** Per the CI/CD
   requirements this repo already documents but wasn't following in
   practice: deployment should never re-run what CI (`.github/workflows/
   ci.yml`) already gated on the PR before merge. `main`/`develop`/
   `release/*` are the only deployable branches (enforced by
   `scripts/check-deploy-branch.sh`), and CI already runs typecheck, lint,
   the full test suite with coverage, and Playwright e2e on every PR into
   those branches. Re-running tests at deploy time was pure redundant
   safety margin, and an expensive one.

3. **Vercel's build machine has 2 vCPUs vs. 8 on the local dev machine
   used to write this code**, and Vitest's default thread-pool parallelism
   scales with available cores. The same 1336-test suite that takes ~50s
   wall-clock locally took **244s** on the actual 2-core Vercel build
   machine - a ~4.8x slowdown. Because the suite ran twice (root cause 1),
   this 4.8x CPU penalty was paid twice: ~488s of the ~600s total build
   phase (81%) was test execution alone.

Ruled out (checked, not a factor):
- **`next build` itself is fast** (~24-57s) - only 11 routes, Turbopack.
- **No expensive static-generation work.** Chapter/component routes are
  dynamic (`ƒ`), not pre-rendered with `generateStaticParams`.
- **Markdown/docs content is not read at build time.** `content-service.ts`
  fetches `.md` files client-side at runtime via `useMarkdownFile` (a
  `"use client"` hook), confirmed by reading the source - build never
  touches `public/content/**`.
- **`npm install` was not a bottleneck** - Vercel's dependency cache was
  warm ("up to date in 1s"); a cold local `npm ci` measured ~33.5s, still
  minor relative to the ~488s of duplicated tests.
- **Vercel's build cache (`.next/cache`, `node_modules`) was already
  working** - confirmed by "Restored build cache from previous deployment"
  in the log. No caching fix was needed.

## Changes Made

1. **`package.json`**: `build` script changed from
   `npm run typecheck && npm run lint && npm test && next build` to just
   `next build`. Verified empirically that `next build` still enforces
   type-safety on its own (a deliberate type error failed the build); it
   does **not** run ESLint or tests (verified empirically - a restricted-
   import lint violation did not fail `next build`), so those must stay as
   separate, CI-only gates.

2. **`vercel.json`**: `buildCommand` changed from
   `npm run typecheck && npm run lint && npm test && npm run build` to
   `npm run build` (which is now just `next build`). Deployment no longer
   runs typecheck, lint, or the test suite - all three remain fully
   enforced pre-merge by `.github/workflows/ci.yml` on every PR into
   `main`/`develop`/`release/*`.

3. **`.claude/docs/TESTING_AND_DEPLOYMENT.md`**: updated to describe the
   actual (fixed) pipeline instead of the stale "deployment runs the full
   test suite" description, which was documenting the bug as intended
   behavior.

No changes were made to `next.config.ts`, Vitest config, caching, or
dependencies - none of those were implicated by the measurements.

## Before vs After

| Step | Before (real prod deploy) | After (measured/derived) | Change |
|---|---|---|---|
| Clone + cache restore | ~3s | ~3s (unchanged) | - |
| Install | ~2s (cache hit) | ~2s (unchanged) | - |
| Typecheck (standalone) | ~13s x2 = 26s | 0s (folded into `next build`'s own check) | -26s |
| Lint (standalone) | ~14s x2 = 28s | 0s (CI-only now) | -28s |
| Unit tests (1336 tests) | 244s x2 = 488s | 0s (CI-only now) | -488s |
| `next build` (incl. internal TS check) | ~57s | ~57s (unchanged) | - |
| **Total build phase** | **~600s (~10 min)** | **~62s (~1 min)** | **-538s, ~90% reduction, ~9.7x faster** |
| Deploy outputs + build cache upload | ~35s | ~35s (unchanged) | - |
| **End-to-end (build start → ready)** | **~635s (~10.6 min)** | **~97s (~1.6 min)** | **~6.5x faster** |

The local before/after (8-core dev machine, for reference - not what
Vercel actually runs on):

| Step | Before | After |
|---|---|---|
| Typecheck | 5.0s x2 | 0s (in `next build`) |
| Lint | 13.9s x2 | 0s |
| Test (1336 tests) | 50.4s x2 | 0s |
| `next build` | 24.1s | 24.4s |
| **Total** | **~162.7s** | **~24.4s** |

## Additional Recommendations (not implemented - not measurement-driven for deploy speed)

- **CI itself pays the same 2-core Vitest penalty.** `ci.yml` likely runs on
  a similarly CPU-constrained GitHub Actions runner, so the ~244s test
  wall-clock (not ~50s) is probably what CI experiences too. If CI time
  becomes a pain point, look at `vitest.config.ts` `test.pool`/
  `poolOptions.threads.maxThreads` tuning or splitting the suite into
  parallel CI jobs (`vitest --shard`) - but this wasn't measured against
  actual CI runs in this audit, so treat it as a lead, not a conclusion.
- **Bundle size** (largest client chunks currently 764K/644K/616K
  uncompressed) doesn't meaningfully affect *build* time here (`next build`
  is 24-57s regardless) - it affects runtime download/parse cost, a
  separate concern from what this audit was scoped to. If pursued, look at
  `mermaid` (84MB installed, used in canvas + docs rendering) and
  `lucide-react` (40MB installed) for import-path tree-shaking.
- **Branch protection**: this audit assumes GitHub branch protection
  actually requires `ci.yml` to pass before merging into
  `main`/`develop`/`release/*` (the repo's own docs say so). Worth
  confirming directly in GitHub repo settings, since the whole rationale
  for removing tests from the Vercel build depends on CI being a real,
  unbypassable gate, not just a documented convention.

## Remaining Opportunities

- `next build`'s internal TypeScript check (~14s) and Vitest CI runs are
  the only remaining non-trivial build-adjacent costs; both are legitimate
  (type safety, test correctness) and not redundant.
- Deploy-output upload and build-cache creation (~35s) is Vercel-platform
  overhead, not something this app's config controls.

## Estimated Vercel Deployment Time After Fix

**~1.5-2 minutes** end-to-end (build start to ready), down from ~10-11
minutes. This is within the requested 1-3 minute target. The estimate
follows directly from the real build log with the duplicated
typecheck/lint/test phases (542s) removed - not a speculative projection.
