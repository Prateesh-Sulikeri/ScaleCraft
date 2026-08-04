# Testing & Deployment Requirements

## Overview

Tests gate merges (via GitHub Actions CI on every PR), not deployments. Vercel
deploys run `next build` only - no test/lint/typecheck re-run - because CI has
already gated anything reaching `main`/`develop`/`release/*`. This document
outlines the complete testing and deployment pipeline for ScaleCraft.

**2026-08-04 fix**: `vercel.json`'s `buildCommand` used to run
`typecheck && lint && test && npm run build`, and `npm run build` itself
re-ran `typecheck && lint && test` before `next build` - so every deploy paid
for typecheck/lint/the full unit suite twice. That duplication (plus running
the full test suite during deploy at all, which CI already does pre-merge)
was the dominant cause of ~10-11 minute Vercel deploys. Fixed by making
`npm run build` = `next build` only; `vercel.json buildCommand` = `npm run
build`. See `.claude/docs/BUILD_PERFORMANCE_AUDIT.md` for the full profiling
and before/after numbers.

## Test Coverage

### Test Suite Composition (verified 2026-07-26 via `npm test`)
- **Total Tests**: 129, across 22 files
- **Unit Tests**: 100 (validation rules, store operations, persistence, components)
- **Major Flow Tests**: 29 (workflow integration tests, `src/flows/`)
- **Current Pass Rate**: 129/129 (100%)

### Major Flow Tests

The following test files cover all critical user workflows:

1. **canvas-workflow.test.ts** (4 tests)
   - Creating architectures by inserting components via the Component Picker
   - Connecting nodes with edges
   - Deleting nodes and cascading edge cleanup
   - Multi-node operations

2. **validation-workflow.test.ts** (6 tests)
   - Detecting anti-patterns (direct client→database)
   - Catching single-instance load balancer bottlenecks
   - Finding request-flow cycles
   - Detecting orphan read replicas
   - Verifying configuration fixes work

3. **persistence-workflow.test.ts** (3 tests)
   - Saving and loading complete architectures
   - Preserving node configuration across save/load cycles
   - Export/import as JSON format
   - Multi-slot saves for future chapters

4. **annotation-workflow.test.ts** (9 tests)
   - Creating and managing zones for grouping
   - Adding and editing comments
   - Placing start markers
   - Ensuring annotations persist through save/load

5. **config-workflow.test.ts** (7 tests)
   - Opening component inspector
   - Updating configuration values
   - Real-time validation changes
   - Configuration persistence across save/load

## Build Requirements

### Local Development
```bash
# Full pipeline (matches CI), run manually before pushing:
npm run typecheck && npm run lint && npm test && npm run build

# Just a build:
npm run build
```

`npm run build` is `next build` only. It re-checks TypeScript internally
(confirmed - a deliberate type error fails `next build` on its own) but does
**not** run ESLint or the test suite (confirmed empirically - a restricted-
import lint violation did not fail `next build`). Type safety on deploy is
still enforced; lint and test enforcement live entirely in CI, pre-merge.

### GitHub Actions CI/CD
**File**: `.github/workflows/ci.yml`

**Triggers:**
- On every push to `release/**` or `develop`
- On every pull request to `release/**`, `develop`, or `main`

**Workflow Steps:**
1. Checkout code
2. Install dependencies (npm ci)
3. Run TypeScript check
4. Run ESLint
5. Run unit/component tests with coverage (vitest)
6. Run e2e tests (Playwright)
7. Build with Next.js

**PR Merge Requirements:**
- All GitHub Actions checks must pass
- Tests must pass before merge is allowed

### Vercel Deployments
**File**: `vercel.json`

**Build Command:**
```bash
npm run build
```
(= `next build` only)

**Deployment Rules:**
- No test/lint/typecheck re-run at deploy time - CI already gated the code
  that reached a deployable branch
- Output directory: `.next`
- `ignoreCommand` (`scripts/check-deploy-branch.sh`) restricts deploys to
  `main`, `develop`, `release/*`

**Deployment Fails If:**
- TypeScript errors exist (caught by `next build`'s own type check)
- Build compilation fails

## Running Tests Locally

### All Tests
```bash
npm test
```

### Major Flow Tests Only
```bash
npm run test:flows
```

### With Watch Mode (Development)
```bash
npm test  # Re-runs on file changes
```

## Quality Gates Summary

```
┌─────────────────────────────────────────┐
│           QUALITY GATES                 │
├─────────────────────────────────────────┤
│ LOCAL:    typecheck && lint && test &&  │
│           build (run manually, matches  │
│           CI) - not required per commit │
├─────────────────────────────────────────┤
│ PR:       GitHub Actions CI             │
│           • TypeScript, ESLint          │
│           • Unit/component tests + cov  │
│           • E2E tests (Playwright)      │
│           • next build                  │
│           • Cannot merge if failed      │
├─────────────────────────────────────────┤
│ DEPLOY:   Vercel                        │
│           • next build only             │
│           • No test/lint/typecheck      │
│             re-run - CI already gated   │
│             this code before merge      │
└─────────────────────────────────────────┘
```

## Test Execution Flow

```
Code Push/PR
    ↓
GitHub Actions Triggered (ci.yml)
    ↓
  ├─ TypeScript Check
  ├─ ESLint Validation
  ├─ Unit/component tests + coverage (vitest)
  ├─ E2E tests (Playwright)
  └─ next build
    ↓
All Checks Pass?
    ├─ YES → Merge allowed
    └─ NO → Block merge
    ↓
Merge → develop/main/release branch
    ↓
Vercel: next build → Deploy
```

## Continuous Improvement

### Adding New Tests
1. Create new test file in `src/flows/` following naming convention
2. Use `useCanvasStore` for state management
3. Import `toArchitectureGraph` and `ruleRegistry` for validation
4. Run `npm test` to verify
5. All tests must pass before PR can be merged

### Debugging Test Failures
```bash
# Run specific test file
npm test -- src/flows/canvas-workflow.test.ts

# Run specific test
npm test -- src/flows/canvas-workflow.test.ts -t "creates a basic architecture"

# Watch mode for development
npm test -- --watch
```

## Next Steps

- [x] Increase major flow test coverage to 100% passing (129/129 as of 2026-07-26)
- [ ] Add E2E tests for complete user workflows (Playwright, per [[TECH_STACK]])
- [ ] Set up code coverage tracking (codecov)
- [ ] Add performance benchmarks
- [ ] Document test data fixtures for reuse

## References

- Test files: `src/flows/*.test.ts`, plus co-located `*.test.{ts,tsx}` across `src/`
- CI/CD config: `.github/workflows/ci.yml`
- Vercel config: `vercel.json`
- Build script: `package.json` → `build` script
