# ScaleCraft UI/UX Critique

**Date:** 2026-07-24 (re-run after a clarify/polish/distill/polish fix round)
**Method:** Dual-agent assessment (design-review subagent + detector/browser-evidence subagent), run in isolation per protocol.
**Overall Score:** 33/40 (up from 27/40 on 2026-07-19, via an intermediate 29/40 on 2026-07-22)

Full snapshot history (for trend tracking) lives in `.impeccable/critique/`; this file
tracks only the latest round so it stays a reliable "read this before UI work" pointer.
Latest snapshot: `.impeccable/critique/2026-07-24T17-39-26Z__app-user-paths-walkthrough.md`.

---

## Design Health Score

| # | Heuristic | Score | Trend | Key issue |
|---|-----------|-------|-------|-----------|
| 1 | Visibility of system status | 2 | unchanged | Stale-validation-results issue still untouched |
| 2 | Match system / real world | 4 | recovered (was 3) | Chapter Draft badge + "more coming soon" caption confirmed live, both themes |
| 3 | User control & freedom | 4 | better (was 3) | Ctrl+S toast confirmed live (auto-dismiss ~3.2s); offset by a new keyboard issue (see below) |
| 4 | Consistency & standards | 4 | recovered (was 3) | Component Picker category rail no longer truncates (confirmed via DOM measurement) |
| 5 | Error prevention | 2 | unchanged | No Clear-board confirmation dialog |
| 6 | Recognition over recall | 3 | unchanged | Picker's default-collapsed categories are a wash: less to scan, but the rail is now the only persistent inventory of what's hidden |
| 7 | Flexibility & efficiency | 4 | unchanged | Search, arrows, Home/End/Enter, jump-rail-into-collapsed-category all verified correct |
| 8 | Aesthetic & minimalist design | 4 | recovered (was 3) | Rail fix + default tile count nearly halved (16 vs. ~29) |
| 9 | Error recovery | 4 | unchanged | Validation explanations remain the strongest feature in the app |
| 10 | Help & documentation | 2 | unchanged | Still no onboarding/legend — three consecutive rounds now |

**Anti-slop verdict:** not AI-generated. Deterministic scan found exactly one advisory,
unchanged from prior rounds: `src/canvas/ZoneNode.tsx:109` — `text-[10px]` is off the
DESIGN.md type ramp (11px minimum label size).

---

## What's working

- Both heuristics dinged in the 2026-07-22 round (2 "match real world", 8 "aesthetic")
  fully recovered, verified via DOM state and computed styles, not assumption.
- The Ctrl+S toast is a clean, on-brand reuse of `UndoToast`'s exact chrome — zero new
  visual vocabulary introduced.
- Component Picker default tile count is down ~45% (16 vs. ~29) with nothing hidden
  from keyboard or search reach.
- Validation failure UX remains the best thing in the app — plain-language message +
  real architectural explanation + ring-highlighted offending nodes.

---

## Open priority issues (carried forward, still real)

### [P1] Validation evidence evaporates on edit
Dragging any node after a failed validation wipes the red rings and issues panel with
no trace — a learner can believe they fixed something that was never re-checked.
**Fix:** keep results visible but dimmed, with an explicit "Results out of date —
Re-validate" pill instead of deleting the evidence. **Command:** `/impeccable polish`

### [P1] No guardrails on loss
"Clear board" wipes instantly with no confirmation; no dirty indicator or navigation
guard for unsaved work (Undo exists but nothing surfaces it at the moment of loss).
**Fix:** toast + dirty-dot + navigation guard. **Command:** `/impeccable harden`

### [P2] New: Tab reaches Component Picker category-toggle buttons, but Enter there does the wrong thing
`src/canvas/ComponentPicker.tsx`'s window-level `keydown` listener fires whatever the
roving `activeIndex` points to instead of toggling the tabbed-to category button —
confirmed live: Tab from search reaches "Networking (8)" as real DOM focus, but Enter
there arms zone-placement mode and closes the dialog, completely disconnected from
what was visually tabbed to. This is a genuine regression introduced by the 2026-07-24
round's category-collapse feature, not a pre-existing gap (category headers used to be
non-interactive `<h3>`s with no tab stop at all).
**Fix:** give the toggle buttons their own `onKeyDown` (stop propagation, handle
Enter/Space locally), or fold them into the same roving-`activeIndex` model the rest of
the listbox uses. **Command:** `/impeccable audit` (keyboard-interaction pass scoped to
the picker), or a direct fix given how localized it is.

### [P2] Icon-only toolbar + arbitrary "Project"/"Board" menus
Neither "Project" nor "Board" is a concept the app defines anywhere; users build a
mental map by trial. **Command:** `/impeccable clarify`

### [P2] Amber means three different things
Caching category, validation warning rings, and Highlight Connections all use amber.
**Fix:** give Highlight Connections a non-semantic hue + explicit clear affordance.
**Command:** `/impeccable colorize`

### [P2] Edge direction is invisible
No arrowheads on edges; direction only inferable from dash animation.
**Command:** `/impeccable polish`

---

## Persona red flags (current)

**Jordan (first-timer):** the prior bounce risk (stub chapters looking broken) is
resolved — Draft badge + caption make the placeholder status obvious now. Still no
onboarding walkthrough or color legend.

**Alex (power user):** rail-truncation friction is gone. Minor new friction: Component
Picker category collapse state resets on every reopen (by design) — a frequently-used
niche category needs re-expanding each session, though jump-rail/arrow-nav both still
reach it in one action.

**Sam (accessibility):** the new P2 above is the one real regression this round — Tab
now reaches a non-functional-via-Enter control, which reads as broken to keyboard/
screen-reader users. Warning-vs-error rings still differ by hue only, no glyph/pattern.

---

## Questions to consider

1. Help & Documentation has scored 2/5 for three consecutive rounds — is onboarding
   (`/impeccable onboard`) now the highest-leverage fix, ahead of further picker polish?
2. The category-toggle buttons are the picker's first interactive element embedded in a
   roving-tabindex listbox that isn't conditionally mounted — worth a documented
   convention before more additions like it (e.g. a future "recently used" row)?
3. Should Component Picker collapse state persist per-session, or is resetting on every
   open deliberately correct ("always predictable on open")?

---

## Recommended sequence

1. Fix the Tab/Enter regression on category-toggle buttons (small, localized).
2. `/impeccable onboard` — first-run legend, color/state teaching, three rounds overdue.
3. `/impeccable harden` — loss guardrails (Clear-board confirm, dirty-dot, nav guard).
4. `/impeccable polish` — stale validation results, edge arrowheads.
5. Re-run `/impeccable critique` after fixes to measure the score change.
