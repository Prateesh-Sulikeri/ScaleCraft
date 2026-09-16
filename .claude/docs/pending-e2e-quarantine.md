# Pending: e2e test quality

**Status: the four quarantined tests are fixed and un-quarantined (6.1.1,
2026-08-16).** What remains in this doc is the systemic problem they were a
symptom of: ~106 vacuously-passing assertions still in the suite.

## The four quarantined tests (resolved)

All four are back, no `test.fixme`, passing. Worth recording that the
original diagnosis was only partly right - three of them had a second cause
that a selector fix alone would not have reached:

| Test | Recorded cause | Actual cause |
| --- | --- | --- |
| `design-editor-integration` - config panel | `[class*='panel']` matched 17 elements | that, **plus** the popover opens on double-click (`Canvas.tsx` `onNodeDoubleClick`), so a single click never opened it at all |
| `design-editor-integration` - docs in inspector | `[class*='docs'], [class*='modal']` matched nothing | docs open as a **tab** in the docs panel (`openDocTab`), never a modal - no wait could have made that selector match |
| `canvas-interactions` - multi-select delete | fixed `waitForTimeout` sleeps raced | right-clicking a *node* opens the single-node menu (`onNodeContextMenu`), which deletes one - hence "expected 2, received 3". The group delete is on the selection rect (`onSelectionContextMenu`), and only a **box-drag** selection activates that rect; ctrl-clicking nodes does not |
| `chapter-reader` - progress bar | 816px baseline was pre-hydration width | confirmed: `ReadingProgress.tsx` reports `percent = 100` while `scrollable <= 0`, so the baseline was a *full* bar. Now asserts on `aria-valuenow` |

Lesson for the next quarantine: confirm the interaction actually reaches the
thing being asserted on, not just that the selector resolves.

## The real problem: assertions that cannot fail

`if ((await x.count()) > 0) { ...assert... }` passes when the guard is false,
having checked nothing - it reads as coverage while providing none.
`canvas-interactions.spec.ts` also had a literal `expect(true).toBe(true)`
early-return. Both patterns were what let the four above sit green locally
for so long.

Still present, as of 6.1.1:

| Spec | Guards |
| --- | --- |
| `custom-components.spec.ts` | 29 |
| `deep-check-ai.spec.ts` | 25 |
| `chapter-exam.spec.ts` | 22 |
| `design-editor-integration.spec.ts` | 14 |
| `canvas-interactions.spec.ts` | 12 |
| `chapter-reader.spec.ts` | 4 |

Roughly 106 sites. **Not** a mechanical find-and-replace: each one needs a
decision about what the precondition should be. Where the thing is genuinely
expected, assert it (`await expect(x.first()).toBeVisible()`); where it is
legitimately optional, the test probably wants splitting or deleting rather
than guarding.

Unscoped - it needs its own pass, and its own decision about how much of this
suite is worth keeping versus rewriting.

## Reproducing CI conditions locally

```
CI=true npx playwright test
```

Against a dev server that is not already running (`next dev` refuses a second
instance for the same directory, so use a separate git worktree with a real
`node_modules`, not a symlink: Turbopack rejects a symlink pointing outside
the project root).

Note the suite runs single-worker now (see `playwright.config.ts`) - the one
shared Clerk account means parallel specs overwrite each other's synced state.

## Fixed in place, earlier (for the record)

- `mode-isolation.spec.ts` - hardcoded `http://localhost:3000/` in two
  `waitForURL` calls. Works in CI but breaks on any other port. Now matches on
  pathname.

## `multi-device-sync.spec.ts` is load-sensitive (observed 2026-09-15)

Measured while adding `e2e/design-editor-geometry.spec.ts` (Design Editor
revamp, Step 6). Adding ~30s of browser work to the front of the suite made
`multi-device-sync.spec.ts` fail intermittently at the tail of the full run:

| Configuration | Result |
|---|---|
| Full suite, without the new spec (x2) | clean |
| Full suite, with the new spec, 5 tests (x2) | 1 failure each, **a different test each time** |
| `multi-device-sync` alone | clean, 10 passed |
| new spec -> `multi-device-sync`, back to back | clean, 15 passed |

**It is not state interference.** Running the new spec immediately before
`multi-device-sync` is clean, and the failing test differed between runs
(`:159` "picks up a change when refocused", then `:273` "a stale device
opening a chapter"). Both failures were `expect.poll` timeouts waiting for
device B to pull device A's write.

So the tests are sensitive to **cumulative** load: two browser contexts
polling a `next dev` server for a cross-device sync inside a 20s budget, at
the end of a long run. The spec is also `mode: "serial"` (line 96), so one
failure marks the rest of the block "did not run" - the count looks worse
than it is.

Mitigated, not fixed. The new spec was consolidated from 5 tests to 3 (one
pass over all 14 chapters instead of three), which cut its cost. The
underlying fragility is untouched: anything else added to this suite can
resurface it. If it needs a real fix, the poll budgets in that spec - not
the specs around it - are where to look.
