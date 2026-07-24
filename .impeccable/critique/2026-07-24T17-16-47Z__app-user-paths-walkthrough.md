---
target: app user paths walkthrough
total_score: 29
p0_count: 0
p1_count: 1
timestamp: 2026-07-24T17-16-47Z
slug: app-user-paths-walkthrough
---
# ScaleCraft — Browser Walkthrough Critique (re-run after UI Overhaul Part 2, Phases 1-6)

**Date:** 2026-07-24
**Method:** dual-agent (A: design-review subagent · B: detector + browser-evidence subagent), run in isolation per protocol.
**Evidence:** A — live headless-Chromium walkthrough of `/`, `/sandbox`, `/building-blocks`, `/real-world-extraction` (both themes) plus source reading (ComponentPicker + sub-components, ChapterWorkspace/ChapterSidebar/ChapterList/QuestionPane, HomeCanvas/ModeNode). B — `detect.mjs --json` scan of `src/` plus browser-console injection on 5 page states.

Paths exercised: Home → all three mode cards (now all live); Sandbox's Component Picker via right-click and via `/`, search, arrow/Home/End/Enter/Esc nav, Tools row, custom-component create/edit/delete, empty-canvas hint; Building Blocks and Real World Extraction chapter list → select → question pane → hint reveal → back; picker filtering to a chapter's `availableComponentIds`; both themes.

## Design Health Score

| # | Heuristic | Score | vs. 2026-07-22 baseline | Key issue |
|---|---|---|---|---|
| 1 | Visibility of System Status | 2 | unchanged | Same stale-validation-vanishes issue, now also present (copy-pasted) in ChapterWorkspace |
| 2 | Match System / Real World | 3 | **worse (was 4)** | Chapter List's one dummy entry ("Placeholder Chapter"/"Placeholder Project") has zero "this is a stub" signal — reads as real content |
| 3 | User Control and Freedom | 3 | unchanged | Picker's Esc/backdrop-click now solid; chapter mode's Ctrl+S silently no-ops |
| 4 | Consistency and Standards | 3 | unchanged | Picker reuses menu chrome well; its own category rail truncates inconsistently with the modal's own generous width |
| 5 | Error Prevention | 2 | unchanged | Still no Clear-board confirmation — untouched by this overhaul |
| 6 | Recognition Rather Than Recall | 3 | **better (was 2)** | Picker's footer tip + dismissible canvas hint meaningfully improve on the old silent palette |
| 7 | Flexibility and Efficiency | 4 | **better (was 3)** | `/` + full keyboard listbox nav is the first true keyboard path to add a component — directly closes the baseline's flagged gap |
| 8 | Aesthetic and Minimalist Design | 3 | **worse (was 4)** | Category-rail label truncation (no tooltip) is a visible rough edge in an otherwise disciplined dialog |
| 9 | Error Recovery | 4 | unchanged | Validation explanations remain the product's strongest feature, now present in chapters too |
| 10 | Help and Documentation | 2 | unchanged | No onboarding/legend; chapters add hints but nothing explains what "chapters" are on first entry |
| **Total** | | **29/40** | **flat** | The keyboard-navigation win is real, but it's exactly offset by two new rough edges (category truncation, placeholder-content signaling) this same overhaul introduced |

## Anti-Patterns Verdict

**LLM assessment (A):** Not AI slop. `dashdraw` reuse is disciplined and consistent with DESIGN.md's Do's; no idle animation, no gradient-soup, no celebratory states introduced by this overhaul.

**Deterministic scan (B):** `detect.mjs` against `src/` found exactly **one** finding — the same pre-existing `src/canvas/ZoneNode.tsx:109` `text-[10px]` advisory from 2026-07-22, still unfixed, still not touched by this branch's work. All of this overhaul's new files (ComponentPicker + 4 sub-components, SidebarShell, all 4 files under `src/chapters/`) scanned clean at the CLI level.

Browser-console injection (5 page states: Home, Sandbox default, Sandbox-with-picker-open, Building Blocks with a chapter selected, RWE) surfaced more than the CLI pass, with a mix of real and questionable findings:
- **One genuine, novel finding the LLM review didn't call out by file:line**: `ComponentPickerResults`/`ComponentPicker.tsx:353`'s footer tip ("Tip: right-click the canvas or press / to add a component") is 11px, sentence-case text — DESIGN.md's 11px allowance is scoped to the uppercase/600-weight "Label" style for section headers, not incidental instructional copy, so this is a legitimate, if minor, off-ramp use. Folded into Priority Issues below as the detector's contribution this round.
- **Likely false positives, not actioned**: `theater-slop-phrase` and `flat-type-hierarchy` fire identically on every single page at the body level — almost certainly one shared global string/style rather than four independent problems (worth a single manual check, not four fixes); `flat-type-hierarchy`'s reported size list is literally DESIGN.md's own documented type ramp, which the generic browser rule has no way to know is intentional. `clipped-overflow-container` on React Flow's own root pane and node wrappers is very likely required for the library's pan/zoom viewport clipping, not an app bug. `layout-transition` on the new chapter sidebar's `width` transition is a real "don't animate layout properties" hit by the general rule, but it's the exact same pattern the old QuestionPanel/current DocsPanel already use — an accepted, pre-existing product convention, not something this phase introduced.
- `ai-color-palette` ("cyan neon text") on Home's mode-card title is plausibly just the app's own deliberate `--mode-*` category-color system reading as "neon" to a generic rule that doesn't know about DESIGN.md's two-channel color system — flagged, not actioned, without a closer look.

## Overall Impression

This round is a real, if narrow, net wash: the Component Picker's keyboard-first design is a genuine, substantial improvement (Heuristics 6 and 7 both up, closing a gap the last critique explicitly flagged), but the same overhaul introduced two new, avoidable rough edges — truncated category labels with no tooltip, and dummy chapter content with no "this is a stub" signal — that cost exactly as much as the picker gained. None of this is close to AI slop; it's a genuinely disciplined, on-brand extension of the existing design language that just needs a finishing pass, which is squarely what Step 4 in NEXT_STEPS.md already has queued.

## What's Working

1. **The Component Picker's keyboard model** — `/` from anywhere (outside a text field), full ArrowUp/Down/Home/End/Enter navigation, `role="listbox"` + `aria-activedescendant` + a live (if currently sr-only) result count. This is the app's first true keyboard-navigable surface and it closes the single biggest accessibility/power-user gap the last critique found.
2. **All three Home mode cards are now genuinely, consistently live** — same dashed-border treatment, same hover-scale, same branded loading transition on all three; the prior "two dead cards" asymmetry is fully resolved.
3. **Chapter component filtering is correct and silent** — verified live: Building Blocks' picker shows exactly the four items its `availableComponentIds` allows (plus Tools), nothing leaks in from the full registry, and Sandbox's own picker is unaffected after visiting a chapter route.

## Priority Issues

**[P1] Chapter List's single placeholder entry gives no "this is a stub" signal.**
Why it matters: "Placeholder Chapter" / "Placeholder Project" read as real, finished titles at a glance. A first-time visitor to Building Blocks sees exactly one row and nothing else — indistinguishable from a bug or an empty, broken list, and this is a brand-new failure mode the baseline never had (Sandbox-only apps don't have "chapter lists" to look empty).
Fix: a small "1 of N — more coming soon" caption under the list, or visually mute/badge dummy entries until real curriculum content lands.
Suggested command: `/impeccable clarify`.

**[P2] Category-jump rail truncates real labels with no tooltip.** (`src/canvas/ComponentPickerCategoryNav.tsx`, `w-24 truncate`)
Why it matters: "Networking"→"Network...", "Messaging"→"Messagi...", "Distributed Systems"→"Distribut..." — genuinely ambiguous, and undermines the otherwise-polished dialog's craft in a ~640px-wide surface that has room to spare.
Fix: widen the rail, wrap to two lines (DESIGN.md's own Palette Tile precedent: wrap, never truncate with an ellipsis), or add `title={categoryLabel[category]}` as a floor.
Suggested command: `/impeccable polish`.

**[P2] Chapter mode's Ctrl+S is a silent no-op.** (`ChapterWorkspace.tsx`'s `useCanvasShortcuts(() => {})`)
Why it matters: a user who edits a chapter's graph and hits Ctrl+S out of Sandbox muscle memory gets zero feedback — no toast, no visibly-disabled affordance — which reads as "it's broken," not "not built yet."
Fix: a one-line toast ("Chapter progress isn't saved yet") on the shortcut, or omit the Ctrl+S legend entry specifically for chapter routes until milestone 9 lands.
Suggested command: `/impeccable clarify`.

**[P3] Component Picker's footer tip text sits below DESIGN.md's own type ramp.** (`ComponentPicker.tsx:353`, 11px sentence-case)
Why it matters: minor, but it's a real off-ramp use the detector caught that the manual review didn't call out by file:line — the 11px allowance in DESIGN.md is scoped to uppercase "Label" text, not incidental instructional copy.
Fix: bump to 12px or restyle as a proper Label-style caption.
Suggested command: `/impeccable polish`.

**[P3] Component Picker's default (unfiltered) view still surfaces the full ~25-component registry at once.**
Why it matters: working-memory load matches the old palette rather than improving on it; the new dialog's real estate could support smarter defaults.
Fix: collapse less-common categories by default, or surface a "recently used" group above the full list.
Suggested command: `/impeccable distill`.

## Persona Red Flags

**Jordan (first-timer):** Opens Building Blocks, sees one chapter titled "Placeholder Chapter" with no stub signal — plausible read: "is this app finished?" Selects it, sees a required-components line stuck at "0/3 present" against an empty canvas with no starter graph and no explanation of why. This is a genuinely new bounce risk the Sandbox-only baseline never had.

**Alex (power-user):** Clear win — `/` + arrows + Enter is now a real mouse-free path to build a graph from nothing. Only friction: truncated category-rail labels slow down jump-navigation slightly.

**Sam (accessibility-dependent):** The picker's `role="listbox"` / `aria-activedescendant` / live result count is a correct, meaningful pattern — a real accessibility improvement over the old palette. One ding: `QuestionPane.tsx`'s `HintDisclosure` sets `aria-expanded={true}` on a plain `<div>` once revealed, not on the triggering control (which unmounts on reveal) — not meaningful ARIA once revealed.

## Minor Observations

- The baseline's "one asymmetric hover-arrow affordance" (only Sandbox's card had it) is resolved by virtue of all three cards now being genuinely live and identically styled.
- `ChapterWorkspace.tsx`'s header is a deliberate copy-paste of Sandbox's (per its own code comment) — worth watching for drift once chapter-specific Save semantics diverge at milestone 9.
- Tab order on Home reaches the theme toggle within a few tabs with a visible, clean focus ring — solid keyboard basics, unaffected by this round.
- The handful of likely-false-positive browser-detector findings (shared "theater" tagline, type-ramp size list, React-Flow-inherent overflow clipping) are worth one quick manual pass to confirm, not four separate fixes.

## Questions to Consider

1. Should a chapter mode with zero real content simply stay off Home's card list until real curriculum exists, rather than shipping a clickable "Placeholder Chapter" a real visitor can land on?
2. Now that the picker proves keyboard-only insertion works end to end, does Sandbox's first-run onboarding gap (still un-addressed at Heuristic 10) become the next most valuable fix, since there's no more permanent palette to lean on as a passive discovery aid?
3. Is a centered blocking dialog still the right long-term shape for the picker once it also has to teach a learner *why* 20 components just disappeared in chapter mode?
