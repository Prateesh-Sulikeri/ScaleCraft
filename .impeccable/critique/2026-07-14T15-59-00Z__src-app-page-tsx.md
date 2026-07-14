---
target: src/app/page.tsx (Sandbox canvas)
total_score: 31
p0_count: 1
p1_count: 2
timestamp: 2026-07-14T15-59-00Z
slug: src-app-page-tsx
---
Method: dual-agent (A: ab15f2caa7a52a44f · B: a226a9550e9ffda04)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Validate color-codes pass/fail on the button, but a passing graph never marks any node — the only "pass" signal lives in a dropdown that vanishes on the next click. |
| 2 | Match System / Real World | 3 | Vocabulary (round-robin, request-flow/control/replication/async, postgres engine) matches real system-design language well; icons are generic Lucide glyphs, not domain-evocative. |
| 3 | User Control and Freedom | 1 | No undo/redo anywhere in the store (confirmed by direct grep); Delete/Backspace and "Delete N components" execute immediately, zero confirmation. |
| 4 | Consistency and Standards | 4 | One button shape everywhere; Export/Validate/ContextMenu dropdowns share an identical backdrop-click-catcher pattern verified line-for-line in the JSX. |
| 5 | Error Prevention | 3 | Direct Client→DB wiring is allowed and only caught post-hoc — deliberate pedagogical choice per CLAUDE.md, not an oversight. JPEG+transparent auto-corrects to white. |
| 6 | Recognition Rather Than Recall | 4 | Palette, inspector, and edge-kind selector all show current state without requiring memory. |
| 7 | Flexibility and Efficiency | 3 | Resizable panels, quick-add menu, duplicate, Esc-cancel are good; no keyboard shortcuts anywhere, no command palette. |
| 8 | Aesthetic and Minimalist Design | 4 | Genuinely restrained, matches its own "not a game" mandate — confirmed even the detector's own single-font/overused-font flags are false positives against a documented, intentional one-family type system. |
| 9 | Error Recovery | 3 | Validation explanations are specific and well-tempered; undercut by the results dropdown auto-closing the moment you click the flagged node to actually fix it. |
| 10 | Help and Documentation | 3 | The Docs Window is excellent once found, but nothing in the UI points a first-timer toward it, and edge kinds / zones have no in-app explanation. |
| **Total** | | **31/40** | **Good — solid foundation, User Control is the clear outlier dragging the score down.** |

## Anti-Patterns Verdict

**Does this look AI-generated? No — and it's a specific kind of no.** No gradient text, no side-stripe accents, no hero-metric template, no identical decorative card grids. The Docs Window (draggable, minimizable-to-capsule, resizable, independent multi-window lifecycle up to 4 at once) is the single strongest piece of evidence: "modal as first thought" is the product register's most-named tell, and this project visibly built the harder, better alternative instead.

**LLM assessment (Assessment A):** Two things would make an experienced reviewer pause only once they *interact*, not just look — invisible keyboard focus in dark theme, and light-theme muted-text contrast failures that ironically match the exact "light gray text on near-white" pattern the skill calls the single biggest AI-slop readability tell. The recurring uppercase tracked labels ("COMPONENTS," "NETWORKING," etc.) are correctly *not* an eyebrow-trope violation — they're product-register section headers, which the register explicitly permits.

**Deterministic scan (Assessment B):** `detect.mjs --json src` returned 3 advisory findings, cross-checked against the newly-written `DESIGN.md`:
- Two `design-system-color` hits on `#e22f80` in `Canvas.tsx`/`ZoneNode.tsx` — **false positive**, confirmed by reading `globals.css`: `#e22f80` is only the CSS `var(--zone, #e22f80)` fallback and never actually renders, since `--zone: #FF3483` (DESIGN.md's Zone Magenta) is always defined. Still worth tidying the fallback constant for consistency, but nothing user-visible is wrong.
- One `design-system-font-size` hit: `text-[10px]` in `Palette.tsx:145` (the category group headers) sits 1px below DESIGN.md's documented 11px Label size — likely genuine, minor drift.

**Browser visualization:** injection succeeded across 4 page states (baseline, mid zone-drag, docs window open, Export dropdown open). Both `clipped-overflow-container` hits (`main.flex.flex-1.overflow-hidden`, `div.react-flow.dark`) present in every pass are **false positives** — traced to React Flow's own internal viewport machinery (`.react-flow__viewport`, `.react-flow__nodes`), which is deliberately positioned beyond the pane's bounds as part of how xyflow implements a pannable/zoomable canvas. Verified neither the docs window (`fixed z-50`, mounted outside `<main>`) nor the header dropdowns are actually being clipped. The `repeating-stripes-gradient` hit in the Export-dropdown pass is also a **false positive** — it's the standard checkerboard swatch denoting "transparent background," not a decorative stripe pattern. `overused-font`/`single-font` are working against a documented, intentional constraint (DESIGN.md's "One-Family Rule").

**One real finding the browser pass caught that the CLI scan structurally could not:** `flat-type-hierarchy: Sizes: 10px, 12px, 14px, 16px, 18px` in every pass. The `18px` traces to `page.tsx`'s `<h1 className="text-lg font-semibold">ScaleCraft</h1>` — Tailwind's named `text-lg` class, which sits outside DESIGN.md's documented ramp (tops out at 16px). The CLI detector's regex only matches arbitrary-value classes like `text-[18px]`, not named scale classes, so this is a genuine detection-mode gap, not a false positive — worth folding into the type ramp or intentionally excepted.

## Overall Impression

A genuinely restrained, non-slop interface that visibly earned its "technical instrument, not a game" positioning — the Docs Window and the shared dropdown vocabulary are real design-system discipline, not just claimed. The gap between "looks careful" and "is careful under interaction" is where this review lives: no undo, invisible keyboard focus, and light-theme contrast that wasn't actually re-verified per DESIGN.md's own claim of independent tuning. The single biggest opportunity is closing that look-vs-behavior gap before more surface area (chapters, more categories) gets built on top of it.

## What's Working

1. **The Docs Window is a real signature component, not a claim.** Verified end-to-end: opens independent of node selection/panel state, drags with a genuine click-vs-drag threshold so restoring a minimized capsule doesn't misfire, resizes via a clamped corner grip, stacks up to 4 simultaneously with cascading positions.
2. **Validation ties message + explanation + node highlighting into one coherent unit** — the ring appears on exactly the offending nodes at the same moment the explanation names them, correctly executing both heuristic #1 and CLAUDE.md's "explanation always shown" principle together.
3. **Real cross-surface design-system discipline** in the dropdown/menu vocabulary — Export, Validate's results panel, and the context menu share an identical backdrop-click-catcher, radius, shadow, and hover fill, confirmed line-for-line in the actual JSX, not just by eye.

## Priority Issues

**[P0] No undo/redo, no delete confirmation**
**Why it matters:** The product's own north star names Figma, Excalidraw, and Linear (`DESIGN.md` §1) — all of which ship a full undo stack. A stray Backspace on a multi-node selection ("Delete N components" fires on one click) permanently destroys work with no recovery path beyond a manual re-save.
**Fix:** Add an undo/redo stack scoped to node/edge/zone mutations (e.g. `zundo` for Zustand); at minimum, a "Node deleted — Undo" toast with a short window before committing.
**Suggested command:** `/impeccable harden`

**[P1] Keyboard focus indicator is invisible in dark theme**
**Why it matters:** Every unstyled interactive element relies on the browser default outline, measured at `rgb(16,16,16) auto 1px` — indistinguishable from the `#0a0a0a`/`#141414` dark-theme surfaces it sits on. Dark is the declared default posture, so a keyboard-only user can Tab through the entire header and never see focus. WCAG 2.4.7 failure, and a direct miss on the product register's own "every component needs default/hover/focus/active" checklist.
**Fix:** One global rule: `*:focus-visible { outline: 2px solid var(--foreground); outline-offset: 2px; }`, verified against both themes.
**Suggested command:** `/impeccable harden`

**[P1] The documented "valid" ring state is dead code**
**Why it matters:** `DESIGN.md` documents a green ring for a passing node, and `ComponentNode.tsx` implements the color for it — but `page.tsx`'s `nodeStates` builder only ever assigns `"error"`/`"warning"`, never `"valid"`. Confirmed visually: a fully passing graph shows plain neutral rings on every node. The only confirmation of success lives in a dropdown that closes on the next click — this is also the root cause of the emotional peak-end asymmetry noted below (failure feels resolved and lasting; success doesn't).
**Fix:** On a passing Validate run, assign `"valid"` to node states so the canvas itself carries the result.
**Suggested command:** `/impeccable polish`

**[P2] Real contrast failures on body/label text in light theme**
**Why it matters:** Computed WCAG contrast: `text-foreground/50` on light bg/panel = 3.34–3.41:1; `text-foreground/40` = 2.52–2.55:1 — both under the 4.5:1 (body) / 3:1 (UI) floors, on real read text (Export menu labels, context-menu header, palette empty-state and category headers). The same tokens pass comfortably in dark theme (4.7–6.4:1), meaning light mode's opacity scale was not independently re-verified per `DESIGN.md`'s own claim of being "independently tuned, never a naive invert."
**Fix:** Raise these instances to `/60`+ in light mode, or add a light-mode-specific muted token calibrated to 4.5:1 rather than reusing one opacity scale across both themes.
**Suggested command:** `/impeccable audit`

**[P3] Zone/edge/error-ring visual collisions at shared boundaries**
**Why it matters:** An edge crossing through a zone's interior cuts through the "ZONE" label itself with no visual accommodation; separately, zone-magenta (`#FF3483`) sitting next to a fault-red (`#ef4444`) error ring reads as "the same red" at a glance — the one hue-adjacency the Two-Channel Rule didn't anticipate (it only guarantees category vs. state don't collide *on the same node*). Minor at current 4-component scale.
**Suggested command:** `/impeccable polish`

## Persona Red Flags

**Riley (stress-tester):** Right-clicking a multi-node selection → "Delete N components" fires on one click with zero confirmation and zero undo (`ContextMenu.tsx`'s `"selection"` branch calls `deleteNodes(target.ids)` directly). One misclick during a stress pass discards an entire layout permanently.

**Sam (accessibility-dependent):** Tabbing through the header toolbar in the default dark theme gives no visible indication of focus (computed outline indistinguishable from the surface). The same user, if also low-vision, hits the light-theme label contrast failures (3.3:1, 2.5:1) on the Export menu and empty-search state.

**Jordan (first-timer):** Dropped into Sandbox with only "Drag components from the palette, connect them, then click Validate." Nothing points toward "View docs" (buried in the Inspector), nothing explains the four edge kinds (bare mono-font `<select>`, no docs link), and nothing explains what a zone actually does (purely visual, doesn't group-move — the code comments say so, the UI doesn't).

## Minor Observations

- A genuine detection-mode gap: the browser pass caught `page.tsx`'s `<h1 className="text-lg">` (18px) sitting outside `DESIGN.md`'s documented type ramp — the CLI scanner's regex only matches arbitrary-value classes (`text-[18px]`), not named Tailwind scale classes, so it structurally couldn't see this. Worth folding into the ramp or intentionally excepting.
- The `#e22f80` CSS fallback in `Canvas.tsx`/`ZoneNode.tsx` never renders (the real `--zone` variable is always defined) but is worth updating to `#ff3483` anyway for consistency with `DESIGN.md`.
- The zone's default label reads "ZONE" — correct, but at `uppercase`/`tracking-wide` it visually reads like a rendering glitch ("ZO NE") until you look closely.
- Palette tile hover tooltips correctly escape their scroll container (a real, documented fix) but can visually overlap the next category group's tiles when hovering the last item in a group.
- z-index usage (10 → 20 → 30 → 40 → 50) is a genuinely semantic, non-arbitrary scale — worth calling out as exceeding the bar, not just meeting it.

## Questions to Consider

- If "explanations are always shown on failure" is non-negotiable, why does the app never visually confirm success on the canvas itself — is a transient dropdown line really the equal-and-opposite feedback a passing validation deserves?
- The north star explicitly benchmarks against Figma/Linear/Excalidraw, all of which treat undo as table stakes. Was deferring undo a deliberate pre-chapter scoping call, or did it just fall out of scope because nothing forced the question?
