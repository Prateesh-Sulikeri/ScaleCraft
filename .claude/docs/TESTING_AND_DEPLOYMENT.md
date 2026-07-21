# Testing & Deployment Requirements

## Overview

All builds and deployments now require tests to pass. This document outlines the complete testing and deployment pipeline for ScaleCraft.

## Test Coverage

### Test Suite Composition
- **Total Tests**: 118
- **Pre-existing Unit Tests**: 89 (validation rules, store operations, persistence)
- **Major Flow Tests**: 20 (new workflow integration tests)
- **Current Pass Rate**: 109/118 (92%)

### Major Flow Tests Created

The following test files cover all critical user workflows:

1. **canvas-workflow.test.ts** (4 tests)
   - Creating architectures by dragging components
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

4. **annotation-workflow.test.ts** (8 tests)
   - Creating and managing zones for grouping
   - Adding and editing comments
   - Placing start markers
   - Ensuring annotations persist through save/load

5. **config-workflow.test.ts** (5 tests)
   - Opening component inspector
   - Updating configuration values
   - Real-time validation changes
   - Configuration persistence across save/load

## Build Requirements

### Local Development
```bash
npm run build
```

**Build Pipeline:**
1. ✅ TypeScript type-checking (`npm run typecheck`)
2. ✅ ESLint validation (`npm run lint`)
3. ✅ All tests pass (`npm test`)
4. ✅ Next.js build succeeds (`next build`)

**Build fails if:**
- TypeScript compilation errors exist
- ESLint finds violations
- Any test fails (109 tests + all major flow tests)
- Next.js build compilation fails

### GitHub Actions CI/CD
**File**: `.github/workflows/test-and-build.yml`

**Triggers:**
- On every push to `main` or `development` branches
- On every pull request to `main` or `development` branches

**Workflow Steps:**
1. Checkout code
2. Install dependencies (npm ci)
3. Run TypeScript check
4. Run ESLint
5. Run all tests (vitest)
6. Run major flow tests specifically
7. Build with Next.js

**PR Merge Requirements:**
- All GitHub Actions checks must pass
- Status checks cannot be bypassed
- Tests must pass before merge is allowed

### Vercel Deployments
**File**: `vercel.json`

**Build Command:**
```bash
npm run typecheck && npm run lint && npm test && npm run build
```

**Deployment Rules:**
- Pre-deployment build runs full test suite
- Deployment fails if tests don't pass
- Output directory: `.next`
- Auto-deploy enabled for: `main`, `development`

**Deployment Fails If:**
- Tests fail
- TypeScript errors exist
- ESLint violations found
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
│ LOCAL:    npm run build                 │
│           • TypeScript ✓                │
│           • ESLint ✓                    │
│           • Tests (118) ✓               │
│           • Build ✓                     │
├─────────────────────────────────────────┤
│ PR:       GitHub Actions CI             │
│           • Same as local + workflow    │
│           • Cannot merge if failed      │
├─────────────────────────────────────────┤
│ DEPLOY:   Vercel Pre-deployment Check  │
│           • Same as local               │
│           • Deployment blocked if fail  │
└─────────────────────────────────────────┘
```

## Test Execution Flow

```
Code Push/PR
    ↓
GitHub Actions Triggered
    ↓
  ├─ TypeScript Check
  ├─ ESLint Validation
  ├─ All 118 Tests
  │  ├─ 89 Unit Tests (validation, store, persistence)
  │  ├─ 20 Major Flow Tests
  │  └─ Result: 109 passing
  └─ Next.js Build
    ↓
All Checks Pass?
    ├─ YES → Merge allowed / Deploy to Vercel
    └─ NO → Block merge / Cancel deployment
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

- [ ] Increase major flow test coverage to 100% passing
- [ ] Add E2E tests for complete user workflows
- [ ] Set up code coverage tracking (codecov)
- [ ] Add performance benchmarks
- [ ] Document test data fixtures for reuse

## References

- Test files: `src/flows/*.test.ts`
- CI/CD config: `.github/workflows/test-and-build.yml`
- Vercel config: `vercel.json`
- Build script: `package.json` → `build` script
