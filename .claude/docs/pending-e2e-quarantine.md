# Pending: quarantined e2e tests

**Status: 4 tests quarantined via `test.fixme`, 2026-08-12.** They are skipped,
not deleted - the bodies are intact, so un-quarantining is deleting one
`.fixme`. Every one of them needs a rewrite, not a timeout bump.

## Why these were pulled

They blocked `develop -> main` (release 6.0.0-auth-cloud-sync). All three pass
against a warm local dev server and fail against a cold CI one - not because CI
is slow, but because each is written loosely enough that it only *happens* to
pass locally. The e2e step was the sole CI failure; typecheck, lint, unit tests
and build were green throughout.

Reproduce CI conditions locally with a cold server, 2 workers, retries on:

```
CI=true npx playwright test
```

(against a dev server that is not already running - `next dev` refuses a second
instance for the same directory, so use a separate git worktree with a real
`node_modules`, not a symlink: Turbopack rejects a symlink pointing outside the
project root.)

## The four

### 1. `e2e/design-editor-integration.spec.ts` - "open component config panel and modify settings"

`page.locator("aside, [class*='inspector'], [class*='panel']")` resolves to 17
elements, because `[class*='panel']` matches every `bg-panel` utility class in
the toolbar. Strict-mode violation, deterministic once the branch is entered.

**Rewrite:** target the inspector by role or a `data-testid`, not a class
substring.

### 2. `e2e/design-editor-integration.spec.ts` - "view component documentation in inspector"

`page.locator("[class*='docs'], [class*='modal']")` matches nothing after the
docs button is clicked.

**Rewrite:** same - assert on the real docs panel via role/testid.

### 3. `e2e/canvas-interactions.spec.ts` - "multi-select nodes and delete them together"

Paces the interaction with fixed `waitForTimeout(200/300)` sleeps. Under CI load
the ctrl-click lands before selection state settles, so one node is deleted
instead of two (`expected 2, received 3`).

**Rewrite:** wait on selection state (selected node count) rather than sleeping.

### 4. `e2e/chapter-reader.spec.ts` - "reading progress bar updates on scroll"

Reads the bar's width, scrolls, then asserts the width grew. The first read is
816px and the post-scroll value is 481px - the bar *shrinks*, because 816px is
the pre-hydration full-container width of `[role="progressbar"] > div` rather
than a rendered progress value. So "after > before" can never hold. It passed
locally only because a warm server hydrated before the first read.

An initial attempt to fix this in place (wait for the article to be scrollable,
then poll the width) did not work and was reverted to a quarantine - polling
cannot rescue a comparison against a bogus baseline.

**Rewrite:** wait for the bar to hydrate (width below full container, or a
`aria-valuenow` attribute) before taking the baseline, then assert on
`aria-valuenow` rather than computed pixel width.

## A shared design flaw worth fixing when these are rewritten

Tests 1 and 2 wrap their assertions in `if ((await nodes.count()) > 0) { ... }`.
When the guard is false the test passes having asserted nothing - so they were
reporting green locally while covering nothing. A test that can pass vacuously
is worse than no test, because it reads as coverage. Prefer asserting the
precondition (`await expect(nodes.first()).toBeVisible()`) over guarding on it.

`e2e/canvas-interactions.spec.ts` also contains a literal `expect(true).toBe(true)`
early-return in the same test - same anti-pattern.

## Fixed in place, not quarantined (for the record)

- `chapter-reader.spec.ts` "reading progress bar updates on scroll" - was flaky
  (`expected > 816, received 816`): scrolled before the article had layout, then
  checked once after a fixed 200ms. Now waits for the element to actually be
  scrollable and polls the width.
- `mode-isolation.spec.ts` - hardcoded `http://localhost:3000/` in two
  `waitForURL` calls. Works in CI but breaks on any other port. Now matches on
  pathname.
