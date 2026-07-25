---
target: app user paths walkthrough
total_score: 33
p0_count: 0
p1_count: 0
timestamp: 2026-07-24T17-39-26Z
slug: app-user-paths-walkthrough
---
# ScaleCraft — Browser Walkthrough Critique (re-run after clarify/polish/distill fix round)

**Date:** 2026-07-24 (same-day re-run, after the critique -> clarify/polish/distill/polish sequence)
**Method:** dual-agent (A: design-review subagent · B: detector + browser-evidence subagent), run in isolation per protocol.
**Evidence:** A — live headless-Chromium re-walkthrough verifying each of the 5 fixes individually plus a fresh holistic pass. B — `detect.mjs --json` scan of `src/` plus browser-console injection on 4 page states, diffed against the prior snapshot's per-page findings.

## Design Health Score

| # | Heuristic | Score | vs. 29/40 baseline | Why |
|---|---|---|---|---|
| 1 | Visibility of System Status | 2 | unchanged | Stale-validation issue untouched by this round |
| 2 | Match System / Real World | **4** | **recovered (was 3)** | Draft badge + "more coming soon" caption confirmed live, both themes |
| 3 | User Control and Freedom | 4 | **better (was 3)** | Ctrl+S toast confirmed live, auto-dismisses ~3.2s; partially offset by the new keyboard issue below |
| 4 | Consistency and Standards | **4** | **recovered (was 3)** | Category rail no longer truncates — confirmed via DOM measurement, not just visual glance |
| 5 | Error Prevention | 2 | unchanged | No Clear-board confirm — untouched, out of scope |
| 6 | Recognition Rather Than Recall | 3 | unchanged | Default-collapse is a wash: less to scan, but the rail is now the only persistent inventory of what's hidden |
| 7 | Flexibility and Efficiency | 4 | unchanged | Search, arrows, Home/End/Enter, and jump-rail-into-collapsed-category all verified still correct |
| 8 | Aesthetic and Minimalist Design | **4** | **recovered (was 3)** | Rail fix + default tile count nearly halved (16 vs. ~29) |
| 9 | Error Recovery | 4 | unchanged | Validation explanations remain the strongest feature |
| 10 | Help and Documentation | 2 | unchanged | Still no onboarding/legend — three rounds running now |
| **Total** | | **33/40** | **+4** | Both heuristics the last round dinged (2, 8) fully recovered; one new keyboard-focus issue is the only drag on what would otherwise have been a larger jump |

## Anti-Patterns Verdict

**Deterministic scan:** Still exactly one finding — the same pre-existing `ZoneNode.tsx:109` advisory, unrelated to this round, unfixed. None of the 7 files touched this round introduced a new CLI finding. The previously-flagged `ComponentPicker.tsx:353` 11px tiny-text finding is confirmed gone (computed style now reads `font-size: 12px`). One new, minor browser-console finding appeared on the picker-open state — a `skipped-heading` (h1 "ScaleCraft" → h3, missing h2) traced to the picker's own category header markup — not one of the 5 named fixes, and not previously called out at this exact page state; worth a quick manual check, not urgent.

**LLM assessment:** Not AI slop — same disciplined register, no new decorative motion or gradient additions.

## Fix-by-Fix Verification

| # | Fix | Status |
|---|---|---|
| 1 | Chapter List Draft badge + caption | **Confirmed working**, both themes; badge class matches `ModeNode.tsx`'s existing pill exactly |
| 2 | Chapter Ctrl+S toast | **Confirmed working**; correct copy, auto-dismiss ~3.2s, re-fires on repeat press |
| 3 | Category rail no longer truncates | **Confirmed**; full labels wrap, `title` attribute present as floor |
| 4 | Picker footer tip → 12px | **Confirmed**; computed `font-size: 12px` |
| 5 | Picker default collapse (Networking/Compute expanded) | **Confirmed correct default state and keyboard/search reach** — but introduced the new issue below |

## What's Working

1. Both previously-flagged heuristics (2 and 8) recovered fully, not just cosmetically patched — verified via DOM state and computed styles, not assumption.
2. The Ctrl+S toast is a clean, on-brand reuse of `UndoToast`'s exact chrome — zero new visual vocabulary introduced.
3. Default tile count is down ~45% (16 vs. ~29) with nothing actually hidden from keyboard or search reach — verified, not just visually plausible.

## New Priority Issue (introduced by this round, not present in the 29/40 baseline)

**[P2] Tab reaches the new category-toggle buttons, but pressing Enter there doesn't toggle them — it silently fires whatever the roving `activeIndex` points to instead.**
File: `src/canvas/ComponentPicker.tsx`'s window-level `keydown` listener (unconditional on real focus target) + the new per-category `<button>` in `ComponentPickerResults.tsx`.
Reproduced live: Tab from the search input reaches the "Networking (8)" toggle as real DOM focus (confirmed via `document.activeElement`); pressing Enter there doesn't collapse Networking — it fires `activateItem(activeIndex)` (index 0, "Add zone"), arming zone-placement mode and closing the dialog entirely, completely disconnected from what was visually tabbed to.
Why it matters: this is a genuine regression, not a pre-existing gap surfacing — before this round, category headers were plain non-interactive `<h3>` text with no `tabIndex`, so Tab skipped over them entirely. The new toggle buttons are the first *always-present* native Tab stop inside the results area that the picker's roving-`activeIndex` keyboard model doesn't know about (unlike the custom-component Edit/Delete buttons, which only ever mount for the currently-active tile, so they can't diverge from `activeIndex` the same way).
Fix: give the category toggle buttons their own `onKeyDown` (stop propagation, handle Enter/Space locally) or fold them into the same flat `activeIndex`/`aria-activedescendant` roving model the rest of the listbox already uses.
Suggested command: `/impeccable audit` (keyboard-interaction pass scoped to the picker), or a direct fix given how localized it is.

No other new P0/P1/P2/P3 issues found in the holistic re-pass.

## Persona Red Flags

**Jordan (first-timer):** Bounce risk from the prior round is resolved — the Draft badge and caption make the stub obvious now.

**Alex (power-user):** Rail fix removes prior friction. Minor new friction: collapse state resets on every picker re-open (by design), so a frequently-used niche category needs re-expanding each session — though jump-rail and arrow-nav both still reach it in one action either way.

**Sam (accessibility-dependent):** New regression here specifically — Tab now reaches non-functional-via-Enter category buttons, which reads as broken to anyone navigating by keyboard or screen reader rather than mouse. This is the one real cost of this round's fixes.

## Minor Observations

- Collapse state isn't persisted across a picker close/reopen — consistent with the picker's existing "search always resets on open" pattern, not a new inconsistency.
- The four categories collapsed by default happen to be exactly the ones absent from both placeholder chapters' `availableComponentIds` — chapter-mode pickers are unaffected by this change today.
- Light theme verified clean on both the Draft badge/caption and the picker fixes — no contrast regressions.

## Questions to Consider

1. Now that two of the three previously-flagged heuristics have fully recovered, is the Help & Documentation gap (score 2, unchanged for three consecutive rounds) the next highest-leverage fix, ahead of further Component Picker polish?
2. The category-toggle buttons are the picker's first real interactive element embedded inside a roving-tabindex listbox that isn't conditionally mounted — does this pattern need a documented convention before the picker grows more additions like it (e.g., a future "recently used" row)?
3. Should collapse state persist per-session now that it's proven not to break search/keyboard reach, or is losing it on every open deliberately the right call ("always predictable on open")?
