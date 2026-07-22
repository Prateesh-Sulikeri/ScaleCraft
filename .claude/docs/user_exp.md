# ScaleCraft UX Walkthrough Report

**Date:** 2026-07-22
**Method:** ⚠️ DEGRADED: single-context (sub-agent spawning restricted by session policy — browser walkthrough ran first, detector scan after, sequentially).
**Evidence:** live headless-Chromium drive of `/` and `/sandbox` — 30+ screenshots, real clicks, real edge drags.

**Paths covered:** Home & mode cards → Sandbox; palette (search hit/empty, hover tooltips, tile click); node select/move/resize; right-click menus (node, pane); Configure floating window; Documentation panel + per-node docs; drawing a bad Client→SQL-Database edge; edge inspector; Validate pass/fail/stale; zone/comment/flag placement + editor popovers; Save → reload persistence; navigating away with unsaved work; Project menu (Import/Export JSON/PNG); Board menu (Clear/Restore); keyboard-shortcuts legend and Esc behavior on every popover; New-component modal; light theme (both pages); About dialog; disabled mode cards; Clear board → Undo.

A permanent snapshot of this critique also lives at
`.impeccable/critique/2026-07-22T04-12-49Z__app-user-paths-walkthrough.md`.

---

## Design Health Score — 29/40 (up from 27 on 2026-07-19)

| # | Heuristic | Score | Key issue |
|---|-----------|-------|-----------|
| 1 | Visibility of system status | 2 | Validation results vanish silently on edit; save feedback is a brief icon swap |
| 2 | Match system / real world | 4 | Domain vocabulary and docs content are right |
| 3 | User control & freedom | 3 | Undo is strong (even restores Clear board); Esc unreliable, no unsaved-work guard |
| 4 | Consistency & standards | 3 | Esc works on some popovers, not others; Project/Board split is arbitrary |
| 5 | Error prevention | 2 | Clear board is instant, no confirm; unsaved work silently lost on navigation |
| 6 | Recognition over recall | 2 | Config/docs only via right-click, which nothing teaches; icon-only toolbar; no color legend |
| 7 | Flexibility & efficiency | 3 | Shortcuts legend, Duplicate, quick-add exist; no keyboard path to add/connect nodes |
| 8 | Aesthetic & minimalist | 4 | Disciplined; both themes genuinely realized |
| 9 | Error recovery | 4 | Validation explanations are exemplary |
| 10 | Help & documentation | 2 | Docs panel is strong; zero onboarding/legend/first-run help |

**Anti-slop verdict:** not AI-generated; deterministic scan found only the known advisory (`src/canvas/ZoneNode.tsx:109` — 10px text off the DESIGN.md type ramp).

---

## What's working

- **Validation failure UX is the best thing in the app.** The bad Client→DB edge produced "2 ISSUES," each with a plain-language headline and a real architectural explanation ("…application servers enforce authentication, authorization, and business logic. Route this request through an Application Server instead."), with offending nodes ring-highlighted red. This is the product promise, delivered.
- **The Documentation panel is genuinely educational** — tabs per component, "What is it / Why do we need it / How does it work," inline diagrams.
- **Safety and persistence fundamentals hold:** Undo restores even a cleared board; zones/comments/flags survive save + reload; light theme is a real second theme, not an invert.

---

## Where users get confused (priority order)

### [P1] Clicking a node leads nowhere

Selection shows only resize handles; Configure and Open Documentation exist solely in the right-click menu, and the only in-app instruction ("Drag components from the palette, connect them, then click Validate") never mentions right-click. A first-timer will click, see nothing actionable, and never find per-component config or docs.

**Fix:** open the Configure floating window (or a slim inspector) on double-click and/or show small ⚙/📖 affordances on the selected node; mention right-click in the left-panel helper text.
**Suggested command:** `/impeccable onboard` + `/impeccable clarify`

### [P1] Validation evidence evaporates

After a failed validation, dragging any node wipes the red rings and the issues panel with no trace; the stale cue is a subtle dashed border on an icon-only button, far top-right. A learner can believe they fixed something that was never re-checked.

**Fix:** keep results visible but dimmed, with an explicit "Results out of date — Re-validate" pill near the last results instead of deleting the evidence.
**Suggested command:** `/impeccable polish`

### [P1] No guardrails on loss

Verified: "Clear board" wipes instantly with no confirmation, and navigating Home with an unsaved flag silently discarded it — no dirty indicator, no route guard, no beforeunload. Undo exists but nothing says so at the moment of loss.

**Fix:** toast "Board cleared — Undo," a dirty-dot on the Save button, and a navigation guard when unsaved changes exist.
**Suggested command:** `/impeccable harden`

### [P1] The app's own keyboard legend is wrong about Esc

The shortcuts legend says "Esc — Cancel placement / close popovers," but verified: Esc closes neither the Project menu nor the New-component modal (its only exits are ✕/Cancel). The one place the app teaches keyboard behavior, it teaches something false.

**Fix:** one shared escape-to-close hook wired into every popover/menu/modal, matching the legend.
**Suggested command:** `/impeccable harden`

### [P2] Icon-only toolbar + arbitrary "Project"/"Board" menus

Nine unlabeled icons; meaning arrives only via hover tooltip. Save is on the toolbar but Restore-last-save hides under "Board," Export under "Project," Clear under "Board" — neither "Project" nor "Board" is a concept the app defines anywhere; users must build a mental map by trial.

**Fix:** merge into one menu or rename by function ("Import/Export", "Reset"); consider text labels on Save/Validate, the two highest-value actions.
**Suggested command:** `/impeccable clarify`

### [P2] Amber now means three different things

Category "Caching" (amber tiles), validation **warning** rings (amber), and Highlight Connections (amber rings + amber dashed edges on the highlighted subgraph, with no visible way to clear the state). A user who just learned "amber ring = warning" then right-clicks Highlight Connections and sees false warnings everywhere.

**Fix:** give Highlight Connections a non-semantic hue (ink at high opacity, or the selection blue) and an explicit clear affordance (Esc + click empty canvas).
**Suggested command:** `/impeccable colorize`

### [P2] Edge direction is invisible; seed graph opens with a confusing wraparound edge

Edges have no arrowheads — direction is only inferable from dash animation — yet "Reverse direction" is a context-menu item, implying direction matters. The seed graph's Load Balancer → App Server edge exits right, loops across the whole canvas, and enters from the far left as a long diagonal: the first thing every new user sees reads as a bug.

**Fix:** add `markerEnd` arrowheads to all edge kinds; re-lay the seed graph so flow reads left-to-right/top-to-bottom without wraparound.
**Suggested command:** `/impeccable polish`

---

## Persona red flags

**Jordan (first-timer):** palette tile *click* does nothing with zero feedback (drag is the only way in — verified: clicking CDN added no node); no legend for the 6 category + 3 state colors; config/docs undiscoverable behind right-click; Flag node shows "Set target…" with no explanation of what a flag/target is. Stalls within minutes.

**Alex (power user):** no keyboard way to add or connect components; no command palette; Esc unreliable. Save/Export shortcuts and the legend are good — but the legend lies about Esc. Mild friction; stays but grumbles.

**Sam (accessibility):** warning vs error rings still differ by hue only (no glyph/pattern); save confirmation is a visual icon swap with no `aria-live` announcement; component placement is pointer-only end to end (the pane right-click quick-add is also pointer-only).

---

## Minor observations

- About dialog is a single wall-of-text paragraph — break into 3–4 short paragraphs or bullets.
- Save success is communicated only by a checkmark icon swap; add `aria-live="polite"` "Saved".
- Empty palette search ("No components match 'zzzz'." with a clear ✕) is good — keep it.
- `src/canvas/ZoneNode.tsx:109` `text-[10px]` off the type ramp (detector advisory, unchanged since last run).
- "Add Flag" aria-label capitalization is inconsistent with "Add zone"/"Add comment".
- Edge-inspector helper text ("the only kind checked for cycles") is engine jargon a learner won't parse.

---

## Questions to consider

1. Should the Sandbox's first-run state teach the two-channel color system — e.g., a dismissible one-time legend card on the canvas instead of a modal?
2. If validation is the product's soul, should results be a persistent panel (with stale/dimmed states) rather than a transient dropdown?
3. Is "Flag / Set target…" earning its palette slot yet, or should it hide until the chapter system gives targets meaning?

---

## Recommended sequence

1. `/impeccable onboard` — node-click affordances, first-run legend, teach right-click
2. `/impeccable harden` — Esc everywhere, clear-board confirm, unsaved-work guard
3. `/impeccable polish` — stale validation results, edge arrowheads, seed layout, highlight color
4. `/impeccable clarify` — toolbar/menu naming, About copy

Re-run `/impeccable critique` after fixes to measure the score change.
