---
target: app user paths walkthrough
total_score: 29
p0_count: 0
p1_count: 4
timestamp: 2026-07-22T04-12-49Z
slug: app-user-paths-walkthrough
---
# ScaleCraft — Browser Walkthrough Critique (all major user paths)

**Date:** 2026-07-22
**Method:** ⚠️ DEGRADED: single-context (sub-agent spawning restricted by session policy; Assessment A browser walkthrough ran first, detector scan ran after, sequentially)
**Evidence:** live headless-Chromium walkthrough of `/` and `/sandbox` (30+ screenshots, real clicks/drags), plus `detect.mjs` scan of `src/`.

Paths exercised: Home → mode cards → Sandbox; palette search (hit/empty), tile click, hover tooltips; node select/move/resize; right-click menus (node, pane); Configure window; Documentation panel + per-node docs; edge draw (Client→SQL DB), edge inspector; Validate pass/fail/stale; zone/comment/flag placement + editors; Save → reload persistence; navigate-away with unsaved changes; Project menu (Import/Export JSON/PNG); Board menu (Clear/Restore); keyboard-shortcuts legend; Esc behavior on every popover; New component modal; light theme (both pages); About dialog; disabled mode cards; Clear board → Undo.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Validation rings + issue panel vanish silently the moment the graph is edited; save feedback is a 1.5s icon swap; stale state cue is subtle |
| 2 | Match System / Real World | 4 | Domain vocabulary is right; docs panel explains concepts well |
| 3 | User Control and Freedom | 3 | Undo is a real safety net (even restores Clear board), but Esc is unreliable and there's no guard on navigating away with unsaved work |
| 4 | Consistency and Standards | 3 | Esc closes some popovers, not others (Project menu, New-component modal ignore it — the legend claims it works); Project vs Board menu split is arbitrary |
| 5 | Error Prevention | 2 | Clear board wipes instantly, no confirmation; unsaved work lost silently on navigation; no beforeunload guard |
| 6 | Recognition Rather Than Recall | 2 | Node config + per-node docs only reachable via right-click; nothing teaches right-click; icon-only toolbar; no color legend |
| 7 | Flexibility and Efficiency | 3 | Shortcuts legend, Duplicate, quick-add via pane right-click; no command palette, no keyboard path to add/connect components |
| 8 | Aesthetic and Minimalist Design | 4 | Disciplined, flat, both themes genuinely realized |
| 9 | Error Recovery | 4 | Validation explanations are exemplary — plain-language "why" + concrete fix, always shown |
| 10 | Help and Documentation | 2 | Documentation panel + per-component docs are strong; still zero onboarding, no legend, no first-run help |
| **Total** | | **29/40** | Up from 27 (2026-07-19). Craft is good; discoverability and state-feedback are the gaps. |

## Anti-Patterns Verdict

Not AI slop. Deterministic scan: 1 advisory only — `src/canvas/ZoneNode.tsx:109` `text-[10px]` off the DESIGN.md type ramp (same as last run). No overlay injection was performed (headless session, no user-visible browser).

## What's Working

1. **Validation failure UX is the best thing in the app.** Client→DB produced "2 ISSUES", each with a red plain-language headline and a full explanation ("…application servers enforce authentication, authorization, and business logic. Route this request through an Application Server instead."), offending nodes ring-highlighted red. This delivers the product's core promise.
2. **Documentation panel is genuinely educational** — tabbed, with "What is it? / Why do we need it? / How does it work?" and inline diagrams.
3. **Undo restores even Clear board**, and saves (including zones/comments/flags) survive reload. Light theme is independently tuned, not an invert.

## Priority Issues

### [P1] Clicking a node gives no path to config or docs — everything important hides behind right-click
Clicking a node shows only a selection box with resize handles. Configure and Open Documentation exist solely in the context menu; the only instruction in the UI ("Drag components from the palette, connect them, then click Validate") never mentions right-click. A first-timer will click, see nothing actionable, and never find per-component config/docs.
**Fix:** open the Configure floating window (or a slim inspector) on double-click and/or show a small inline affordance on selection (⚙/📖 buttons on the selected node); mention right-click in the left-panel helper text.

### [P1] Validation results evaporate silently on edit; stale state is nearly invisible
After a failed validation, dragging a node clears all red rings and the issues panel with no trace. The Validate button's stale styling (dashed border, icon-only, far top-right) is too subtle to register. A learner can believe they fixed the problem when nothing was re-checked.
**Fix:** keep rings/issues visible but dimmed with a "Results out of date — Re-validate" pill near the last results (or over the canvas), rather than deleting the evidence.

### [P1] Destructive/dangerous actions have no guardrails
"Clear board" wipes instantly with no confirmation (Undo works, but nothing tells you that at the moment of loss). Navigating Home with unsaved changes silently discards them — verified: a flag placed and not saved was gone after leaving and returning. No beforeunload, no "unsaved changes" indicator anywhere.
**Fix:** confirm Clear board (or toast "Board cleared — Undo"); add a dirty-state dot on the Save button + a beforeunload/route-change guard when unsaved.

### [P1] Esc behavior contradicts the app's own keyboard legend
The shortcuts panel says "Esc — Cancel placement / close popovers." Verified: Esc does **not** close the Project menu, and does **not** close the New-component modal (its only exits are ✕/Cancel). The one place the app teaches keyboard behavior, it teaches something false.
**Fix:** wire Escape into every popover/modal/menu (one shared hook), matching the legend.

### [P2] Icon-only toolbar with an arbitrary Project/Board split
Nine unlabeled icons; meaning arrives only via hover tooltip. Save lives on the toolbar, but Restore-last-save is under "Board"; Export is under "Project"; Clear is under "Board." Neither "Project" nor "Board" is a concept the app defines anywhere — users must build a mental map by trial.
**Fix:** merge into one "File/Board" menu or label the two menus by function ("Import/Export", "Reset"); consider text labels on Save/Validate, the two highest-value actions.

### [P2] Amber now means three different things
Category "Caching" (amber tiles), validation **warning** rings (amber), and the new Highlight Connections feature (amber rings + amber dashed edges on the highlighted subgraph). A user who just learned "amber ring = warning" then right-clicks Highlight Connections and sees false warnings everywhere — and there's no visible way to clear the highlight state.
**Fix:** give Highlight Connections a non-semantic hue (e.g. the ink color at high opacity or the selection blue) and an explicit "clear highlight" affordance (Esc + clicking empty canvas).

### [P2] Edge direction is invisible; seed graph draws a confusing wraparound edge
Edges have no arrowheads; direction is only inferable from dash animation. The context menu offers "Reverse direction," implying direction matters, but you can't see it. The seed graph's LB→App Server edge exits right, loops across the canvas and enters from the far left as a long diagonal — the very first thing a new user sees reads as a mistake.
**Fix:** add arrowheads (markerEnd) to all edge kinds; lay out the seed graph so flow reads left-to-right/top-to-bottom without wraparound.

## Persona Red Flags

**Jordan (first-timer):** Palette tile *click* does nothing (drag is the only way in — verified: clicking CDN added no node, with zero feedback); config/docs undiscoverable behind right-click; no legend for the 6 category + 3 state colors; Flag node shows "Set target…" with no explanation of what a flag/target is. Will stall inside two minutes.
**Alex (power user):** No keyboard way to add or connect components; no command palette; Esc unreliable; Save/Export shortcuts exist and legend is good — but the legend lies about Esc. Mild friction, stays but grumbles.
**Sam (accessibility):** Warning vs error rings still differ by hue only (no glyph/pattern); save confirmation is a visual icon swap with no `aria-live` announcement; drag-only component placement excludes keyboard users entirely (pane right-click quick-add exists but is also pointer-only).

## Minor Observations

- About dialog is a single wall-of-text paragraph — break into 3-4 short paragraphs or bullets.
- Save button aria-label is "Save" but the tooltip is "Save (Ctrl+S)" — fine; but success is communicated only by a checkmark icon swap; add `aria-live="polite"` "Saved".
- Empty palette search ("No components match 'zzzz'." with a clear ✕) is good.
- `ZoneNode.tsx:109` `text-[10px]` off the type ramp (detector advisory, unchanged since last run).
- "Add Flag" aria-label capitalization is inconsistent with "Add zone"/"Add comment".
- Edge inspector helper text ("the only kind checked for cycles") is engine jargon a learner won't parse.

## Questions to Consider

1. Should the Sandbox's first-run state teach the two-channel color system — e.g., a dismissible one-time legend card on the canvas instead of a modal?
2. If validation is the product's soul, should results be a persistent panel (with stale/dimmed states) rather than a transient dropdown?
3. Is "Flag / Set target…" earning its palette slot yet, or should it hide until the chapter system gives targets meaning?
