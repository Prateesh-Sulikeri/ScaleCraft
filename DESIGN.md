---
name: ScaleCraft
description: Interactive system-design learning lab — a technical instrument, not a game.
colors:
  near-black-canvas: "#0a0a0a"
  raised-panel: "#141414"
  hairline-border: "#2a2a2a"
  ink: "#ededed"
  wire-blue: "#3b82f6"
  circuit-violet: "#8b5cf6"
  ledger-green: "#22c55e"
  cache-amber: "#f59e0b"
  signal-pink: "#ec4899"
  fault-red: "#ef4444"
  state-valid: "#22c55e"
  state-warning: "#f59e0b"
  state-error: "#ef4444"
  zone-magenta: "#ff3483"
typography:
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "12px"
  lg: "16px"
components:
  button-primary:
    backgroundColor: "{colors.raised-panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.sm}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.hairline-border}"
  node-card:
    backgroundColor: "{colors.raised-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    width: "200px"
  dropdown-menu:
    backgroundColor: "{colors.raised-panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px"
  palette-tile:
    rounded: "{rounded.md}"
    height: "40px"
    width: "40px"
---

# Design System: ScaleCraft

## 1. Overview

**Creative North Star: "The Systems Console"**

ScaleCraft's own product brief is explicit: "ScaleCraft is not intended to be a game." The visual language reads as a technical instrument — closer to Excalidraw, Linear, or a cloud provider's architecture-diagram console than to a puzzle game's chrome, even though the interaction model (dragging components onto a canvas, connecting them, getting validated) borrows mechanics from puzzle games. Motion and color are load-bearing signal, never decoration: a ring color says a node passed or failed validation, a dashed line moving along an edge says "this is the live request path" — nothing plays because a page loaded, nothing loops because it looks nice at rest.

Dark is the default posture, in the same way Figma, Excalidraw, and tldraw default to (or heavily favor) dark — but light mode is a fully realized second theme, not an inverted afterthought. The system runs on exactly one sans-serif (Inter) for essentially everything, with a monospace face (JetBrains Mono) held in reserve for anything that is literally code-shaped: config values, component identifiers. There is no single "brand accent" the way a marketing surface would have one — instead there are six equally-weighted category identity colors, each belonging to a family of system component (networking, compute, data, caching, messaging, distributed systems), layered against a completely separate, three-color semantic state vocabulary (valid / warning / error).

**Key Characteristics:**
- Two independent color channels that never share a rendering surface: category (identity, always a fill or badge tint) and validation state (status, always a ring or outline layered on top)
- One sans face (Inter) carries headings, buttons, labels, and body; JetBrains Mono is the only second face, reserved for config/technical values
- Flat by default — shadow exists only on chrome that floats above the canvas plane (menus, the docs window), never on the canvas content itself
- Every animation ties to a specific, real state change; nothing idles, nothing celebrates

## 2. Colors

The palette is not a primary-plus-neutral system — it's six co-equal category identities layered against a three-color status vocabulary and a small neutral scaffold, plus one signature accent for the "mark zone" grouping feature.

### Category (Identity)
Each has an independent light-mode value (darker/more saturated, same hue family) — the
dark-tuned hex collapses badge/icon contrast on a white surface, so light isn't a naive
invert; see `src/app/globals.css`'s `.light` block.
- **Wire Blue** (#3b82f6 dark / #1d4ed8 light): Networking components — Client, Load Balancer. Fills the icon badge and outlines the palette tile.
- **Circuit Violet** (#8b5cf6 dark / #6d28d9 light): Compute components — Application Server.
- **Ledger Green** (#22c55e dark / #15803d light): Data components — SQL Database.
- **Cache Amber** (#f59e0b dark / #b45309 light): Caching components (registry seed set — none shipped yet, token reserved).
- **Signal Pink** (#ec4899 dark / #be185d light): Messaging components (reserved).
- **Fault Red** (#ef4444 dark / #b91c1c light): Distributed-systems components (reserved).

### Semantic (Validation State)
Light values reuse the matching category's light value, preserving the intentional
pixel-level coincidence described under Named Rules below.
- **Ledger Green** (#22c55e dark / #15803d light) — Valid: a whole-card outline ring when a rule is satisfied.
- **Cache Amber** (#f59e0b dark / #b45309 light) — Warning: same ring treatment, non-blocking issue.
- **Fault Red** (#ef4444 dark / #b91c1c light) — Error: same ring treatment, blocking issue; also the Validate button's failing state and the offending nodes' outline.

### Edge (Connection Identity)
Also independently tuned per theme — the dark-tuned cyan `--edge-request-flow` (the
primary "watch a request traverse the system" edge) measured ~1.7:1 against the light
canvas, nearly invisible, before this pass.
- **Signal Cyan** (#22d3ee dark / #0284a5 light): request-flow, the primary path.
- **Slate** (#94a3b8 dark / #475569 light): control, a muted non-blocking signal.
- **Teal** (#14b8a6 dark / #0f766e light): replication, a data-sync back-edge.
- **Fuchsia** (#d946ef dark / #a21caf light): async, queued/event-driven.

### Neutral
- **Near-Black Canvas** (#0a0a0a): the app background and canvas plane (dark theme).
- **Raised Panel** (#141414): every panel, card, dropdown, and floating window surface — one step up from the canvas.
- **Hairline Border** (#2a2a2a): all dividers, card borders, input borders.
- **Ink** (#ededed): primary text. Light theme swaps these four to #ffffff / #f5f5f5 / #d4d4d8 / #171717 respectively — same roles, independently tuned, never a naive invert.

### Typographic Accent
- **Hero Blue** (#60a5fa dark / #1d4ed8 light): `--hero-accent`, Home's hero and the feedback survey's selected chips. Its own token rather than a borrowed category/mode/state hue, because each of those channels carries a meaning a hero does not have; never applied to canvas content, so it cannot collide with any channel there. Blue is the one cool hue the mode channel leaves open - three earlier attempts are recorded in `globals.css` so they are not retried (Building Blocks teal read as an accident above a teal CTA; violet sat too close to RWE's indigo; amber was plainly wrong against a cool palette). Measured 8.4:1 (dark) and 7.0:1 (light) against their own backgrounds.

### Accent
- **Zone Magenta** (#ff3483): the one color outside the category/state system — a labeled grouping rectangle ("mark zone") uses it for an always-animated dashed border. It exists precisely because it doesn't collide with any category or state hue.

### Named Rules
**The Two-Channel Rule.** Category color and validation-state color never share a rendering surface on the same node: category always fills or tints a badge, border, or palette tile; state always renders as a ring/outline layered on top of it. Three category hues intentionally coincide exactly with a state hue at the pixel level — Data ↔ Valid (#22c55e), Caching ↔ Warning (#f59e0b), Distributed Systems ↔ Error (#ef4444) — and this is safe *specifically because* they never occupy the same channel at once. Never use a state color as a fill. Never use a category color as a status ring.

**The Progress-Is-Not-Validation Rule.** A progress bar (Learning Path, workspace curriculum navigator) never uses `--state-valid` green, even at 100% — completing curriculum is not the same signal as a passing validation ring, and reusing the color would blur two meanings that need to stay distinct. `ProgressBar`'s default fill is neutral (`foreground/70`); the one exception is a *course*-level bar, which may use that course's own mode-identity color (`modeColorVar`) — that's the identity channel, not the state channel, so it doesn't violate the Two-Channel Rule either. Section-level bars stay neutral always. Home's mode cards (`src/home/ModeCard.tsx`) are a second consumer of this same exception, one course-level `ProgressBar` per card, tinted with that mode's own `modeColorVar`. `ReadingProgress` (Chapter Reader) is a third, deliberate exception: it tracks scroll position through one article, not curriculum or validation state, so there's no meaning left to blur — green here, confirmed with the user.

## 3. Typography

**Display Font:** none — this register doesn't use one.
**Body Font:** Inter (with system-ui, sans-serif fallback)
**Label/Mono Font:** JetBrains Mono (with monospace fallback)

**Character:** Unglamorous and legible. One well-tuned sans instead of a display/body pairing, because ScaleCraft is a working tool a user is inside of, not a marketing surface they're looking at. JetBrains Mono only ever appears where content is genuinely code-shaped — it's a tell that says "this is configuration," not a stylistic flourish.

### Hierarchy
- **Title** (600, 14px, 1.2 line-height): panel headers ("INSPECTOR"), node titles, docs-window title bars.
- **Body** (400, 14px, 1.5 line-height): buttons, form labels, validation messages. Steps up to 16px/28px specifically inside the docs window's prose, where reading comfort matters more than density.
- **Label** (600, 11px, 1.3 line-height, 0.05em tracking, uppercase): section headers ("COMPONENTS," "NETWORKING," category group names) — the smallest, densest text in the system, always uppercase, never used for anything a user reads at length.
- **Mono** (400, 14px, JetBrains Mono): config-form field values, component identifiers.

### Named Rules
**The One-Family Rule.** Inter alone carries every weight of the interface — headings, buttons, body copy, labels. JetBrains Mono is the only second face, reserved strictly for values that are literally code-shaped (config fields, component ids). Never reach for a third face, and never use the mono face for anything decorative.

## 4. Elevation

The system is flat by default. The canvas plane and everything resting on it (component node cards, the mark-zone rectangle) carry at most a whisper-thin ambient shadow — depth on the canvas comes from the validation-state ring and category fill, not from drop shadows. Elevation is reserved entirely for chrome that floats *above* the canvas plane: dropdown menus, the right-click context menu, the palette's hover tooltip, and the docs window.

### Shadow Vocabulary
- **ambient-card** (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)`): component node cards at rest. Barely perceptible — the ring and fill do the real work of separating a node from the canvas.
- **floating-menu** (`box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)`): dropdown menus (Export, Validate), the right-click context menu, the palette hover tooltip.
- **floating-window** (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)`): the docs window specifically — it's a persistent, draggable, resizable surface rather than a transient menu, and reads one step heavier as a result.

### Named Rules
**The Flat Canvas Rule.** Nothing on the canvas plane itself casts a shadow beyond node cards' own whisper-thin `ambient-card`. Shadow means "this is floating above the diagram" — it is chrome-only vocabulary, never applied to diagram content. The Home exception this rule used to carry has retired: Home's mode cards no longer ride a react-flow surface at all (see Home Dashboard below), so their hover elevation (`0 10px 28px -16px`, well under `floating-menu`'s weight) is ordinary chrome shadow on ordinary chrome, not an exemption. Nothing on a canvas plane is exempt today.

**Modals portal to `<body>`.** `CenteredModal` renders through `createPortal`, never in place. `position: fixed` resolves against the nearest *transformed* ancestor rather than the viewport, and `PageEnter.tsx` animates with `both` fill-mode — so its `transform: translateY(0)` persists after the animation ends and silently becomes the containing block for every page it wraps. Home's dialogs were being laid out inside Home's scrolling column and clipped by it, which read as the sticky header cutting off the top of the panel. Any future floating chrome that must escape page layout gets the same treatment; a z-index alone does not fix this, because the problem is the containing block, not the stacking order.

**Guided tour.** `--z-tour: 55` sits between modal (50) and tooltip (60) — the tour overlay (`src/tour/TourOverlay.tsx`) must paint above any modal it's spotlighting a control within, but a tooltip hovering during a tour step still wins.

**Tour-active dropdown lift.** While a tour runs, `TourController` sets `data-tour-active` on `<body>` and `globals.css` raises `--z-dropdown-backdrop`/`--z-dropdown` to 56/57 for the duration. The spotlight deliberately leaves the real control clickable, so a learner can open a context menu or a header menu mid-step — and at their normal 20/30 those paint *underneath* the tour's backdrop, dimmed and unreadable. Scoped to the tour rather than raising the base tokens, so the ordinary hierarchy is unchanged everywhere else.

**Tour controls dock, they don't float.** The tour's idle controls (Replay/Resume tour, Start over) portal into a footer slot at the bottom of the chapter sidebar (`ChapterSidebar.tsx` -> `TourController`'s `idleSlot`), not a `fixed bottom-4 left-4` pill. Floating them over the canvas corner meant permanently covering the bottom of the sidebar's own content, for a control that is idle-state chrome. Focus mode is the one fallback to the floating position, since it unmounts the sidebar entirely. The slot is `empty:hidden`, so a chapter with no tour pays no border or padding for it.

**Destructive controls arm before they fire.** "Start over" discards a learner's saved canvas, so the first click swaps it to "Discard my work?" in `state-error` and only the second commits; blur disarms it. Inline two-step rather than a `window.confirm` or a modal — nothing else in the app blocks the tab, and a modal is heavier than the decision.

**Don't spotlight what you can't point at.** A tour target covering more than ~45% of the viewport (the canvas, on every desktop size) is rendered ambiently: no dimming, no ring, nothing blocked, card docked in a corner. Ringing a near-fullscreen target carries no information — four consecutive steps drew the identical full-panel outline — and leaves no side with room for the popover, which is how the card ended up off-screen at x = -16 at every size from 1280x720 to 2560x1440. Point steps at the specific control they're about (`hint-toggle`, `chapter-complete`, `debrief`), not the panel that contains it.

## 5. Components

### Buttons
- **Shape:** 6px radius (`rounded-md`), 1px hairline border, always visible (not borderless-until-hover).
- **Primary (the only variant — no filled/ghost split):** raised-panel background, ink text, border-hairline-border, `padding: 6px 12px`, 14px/500-weight label, icon (14px) + label, `gap: 6px`.
- **Hover:** background steps to hairline-border. No transition duration is currently set on this — the state change is instant, consistent with "no decorative motion," though a 150ms crossfade (matching the product register's 150–250ms convention) would read as more deliberate than accidental.
- **Stateful variant (Validate button):** neutral border/text at rest, ledger-green when the graph passes, fault-red when it fails, and a dashed border at reduced opacity when results are stale.
- **Stateful variant (YourTurnCard's quiz/exercise buttons):** the Reader's combined "Your turn" card (`src/chapters/YourTurnCard.tsx`) - one bordered card holding the Knowledge check row and the Design exercise row, divider between when both are present. Same border+text (no fill) treatment as Validate: neutral at rest, ledger-green once that row's task is done (quiz passed / exercise validated), fault-red on an attempted-but-not-yet-passed quiz. The exercise row has no failed state, only not-yet-done. Confirmed with the user as a deliberate second exception — these two plus Validate are the system's only semantic-colored buttons; every other button stays neutral regardless of what it does.

### Dropdown / Context Menus
One shared visual language across three distinct triggers (Export menu, Validate's result dropdown, right-click context menu): raised-panel background, hairline-border, 6px radius, `floating-menu` shadow, `padding: 12px` (dropdowns) or `4px 0` (context menu list). Menu items are full-width rows, `padding: 6px 12px`, hairline-border hover fill, danger items (Delete) in fault-red text. A full-viewport transparent click-catcher closes the menu on any outside click — never a manual blur/escape-only pattern.

### Node Card
- **Shape:** 120 x 96 fixed (was 200 x 65, then briefly 140 x 100), 8px radius (`rounded-lg`), 6px padding. Height is a real default, not content-driven: the authored starter-graph pitch assumes every unresized card is exactly 96px tall, and an auto-height card would let a two-line label eat into the vertical gap the invariant gates check. Geometry is exported from `src/canvas/card-geometry.ts` and imported everywhere it is asserted - never re-declared.
- **The icon is the focal point, not a corner ornament.** Anatomy top to bottom: a 12px meta row (uppercase mono category short code - `NET`/`COMP`/`DATA`/`CACHE`/`MSG`/`DIST` - on the left, configured dot and validation glyph on the right); a centred 44px category-tinted icon plate holding a 24px Lucide glyph at `strokeWidth 1.5`; the component label centred at 11px/600, up to two lines; the instance name in mono beneath, **only when set**. At canvas zoom the glyph is what a learner actually recognises; the label is confirmation.
- **Spare height frames the icon, it does not pool under the text.** The icon block owns the `flex-1`. Whitespace around a focal element reads as composition; the same whitespace below a label reads as a card that failed to fill itself. The instance-name row is conditional for the same reason - an always-present empty row puts the card back in the business of reserving space for nothing.
- **The plate itself was enlarged 32px -> 44px (2026-09-11, second user review).** A small icon centred inside the `flex-1` slack still read as "wasted space" no matter how the surrounding whitespace was justified - the tile needs to fill most of the space it is centred in, not float in it. Verified via a Playwright screenshot pass against the running app before and after.
- **No description line and no divider rule.** The description moved to the inspector, which is what buys the card its footprint. The ModeCard dimension-line motif was tried here and cut: at 120px wide, with an icon already acting as the focal point, it was a rule separating content from an empty row.
- **Two color channels, kept separate:** category identity lives on the icon plate and the short code; validation state owns the whole-card 2px outline and its glyph. The short code renders in neutral ink rather than the category color - the *word* is the identity channel, and coloring 8px text would put `--category-compute` at 4.35:1 on dark panel, under the 4.5:1 floor (measured).
- **State is never hue alone.** Per §2's Color Blindness Support rule, the state ring is paired with a labelled glyph (check / triangle / cross). The pre-revamp card used an identical solid 2px outline for all three states, separating valid from error by hue alone - the most common form of color blindness.
- **Resizable, from the corners.** `NodeResizer` survives the redesign; floors are 96 x 76. Only the four corner handles resize: the side controls sit exactly where the connect band runs (see Connection Ports), so they are transparent and `pointer-events: none` rather than beaten to the pointer while still advertising a drag. Corners give full width and height control, and selection is already stated by the card's outline and glow, so the resizer's border was a third, redundant indicator.
- **No `overflow-hidden` on the card.** The four connection ports are centred on its edges (`translate -50%`), so clipping the box clips half of every port. The only child that needs clipping (the label) clamps itself.
- **Shadow:** `ambient-card` only.

### Connection Ports
Connecting two components must never require pixel-perfect aim. Four mechanisms, each covering a different part of the gesture:
- **Four sides, every one of them a port that both sends and receives.** All four are `source` handles with explicit ids (`port-left`/`top`/`right`/`bottom`). Under loose `connectionMode` a source handle serves as either end of an edge, so this is what lets an edge leave *any* side - while an edge's source is only ever looked up in `handleBounds.source`, so a side with no source handle can never be left at all. Single-purpose sides (Left/Top receive, Right/Bottom send) could not draw half the edges a learner can make: an edge running *up* the canvas had nowhere to go and doubled back over itself, dragging out of a target handle silently reversed the edge's direction, and a side-conditional handle meant an authored edge into an input-less component resolved to nothing and was dropped undrawn. Explicit ids matter too - xyflow resolves a *null* handle id to `handleBounds[0]`, which follows DOM order, so an id-less port breaks the moment someone reorders the JSX.
- **A band along each side, not a disc around a dot.** Drawn by `::after` (`globals.css`), stretched to the side's own length from `--sc-card-w`/`--sc-card-h`, which the card passes down - a handle is xyflow's element and cannot measure the card it belongs to. It reaches ~13px inward and ~13px outward, with a 16px corner inset so a corner belongs to exactly one side. The disc it replaced was measured (a 4px grid-scan of press-and-drag outcomes over a whole card) to leave roughly four fifths of the card's surface starting a *node drag* instead of a connection - and since the ports are invisible at rest, hitting one meant hovering, finding a 9px dot and landing within ~14px of its centre. A band makes the perimeter continuous: there is no dot to find, only an edge to grab. Only the hit area changes - `handleBounds` is measured from the handle element, never the pseudo-element, so edges still attach at the side midpoints. The card's interior still drags the node. xyflow's stock handle is a 6px `#1a192b` dot - a colour belonging to no token here - with `cursor: crosshair`, which is the cursor for dragging out a marquee, not for pulling a wire. Ours is `grab`/`grabbing`.
- **`connectionRadius` 60 (default 20), which makes the whole card a drop target.** The worst-covered point on a 120 x 96 card is its centre, exactly 60px from the left and right handles, so the four catch radii union to cover every pixel of the card - whole-card drop targeting through geometry, with no hit-test code. Verified by simulation rather than asserted: every port, every drop point, across layouts from the authored pitch down to a 24px gap, landed on the intended card.
- **`connectionMode="loose"` plus an explicit validity rule.** Loose mode lets a drop land on the nearest handle regardless of its type, which is what stops a drag near a card's bottom edge from dying silently on that card's bottom *source* handle. Direction is then restated in `canvas/connection-rules.ts`, deliberately narrow: it rejects only connections with nowhere to attach (a Client declares no inputs at all), never ones that merely look like bad architecture - judging the architecture is the validation engine's job, and it owes the user an explanation.
- **Click-to-connect completes on a port and cancels on anything else.** React Flow arms the gesture on a port click but never disarms it, so a stray click used to sit armed indefinitely and the next port click anywhere on the board produced an edge nobody asked for. The arm is cancelled by the next `pointerdown` that isn't on a port - one capture-phase rule rather than a set of per-gesture handlers, because `onPaneClick` does not fire while the pane is in selection mode, which is most of the time. While armed it reveals every legal port, the same way a drag does.
- **Which way a new edge points follows the drag** - from the card you grabbed to the card you dropped on - and `EdgeInspector` carries a Reverse control on its `source -> target` line for when that is backwards. Ports are deliberately not typed by side: single-purpose sides were tried and removed (see above). Note that the *rendering* still reads the way a diagram should - a forward edge leaves the right and enters the left, a downward one leaves the bottom and enters the top. Four-way ports govern where a wire can be grabbed, never where it lands.

### Inspector (Node & Edge)
Redesigned together in Step 3 of the Design Editor revamp (D5/D14) to read as
one system, not two generations of UI - the popover (`NodeConfigPopover.tsx`)
predates the four-sided-handle connection work; the edge picker
(`EdgeInspector.tsx`) was a single `<select>` in a bare bordered box.

- **The node popover carries everything the 120x96 card gave up.** An
  identity header in the same bordered-wireframe-icon-tile + uppercase
  short-code language as the card and Home's `ModeCard` (40px tile here, one
  size down from the card's 44px - an accent next to a header, not the
  panel's sole focal point); the description the card's D3 cut moved here
  intact; a live **Connections** list (arrow + the other endpoint's display
  name, resolved via the same `componentDisplayNames` helper the Start
  marker's target picker uses, so the two surfaces can't disagree on a
  node's name) with each edge's kind; and the node's validation state as a
  labelled chip next to Docs, using the exact same
  ring-color/glyph/label mapping as the card's own state ring (pulled into
  `validation-visuals.ts` so the two can't drift onto different sets for
  the same three states). Width grew 288px -> 340px to hold it.
- **Validation explanations surface right under the header, not only in the
  global Validate dropdown.** `connection-rules.ts` (Step 2) only refuses a
  connection with nowhere to attach - every other bad connection reaches the
  graph, and CLAUDE.md's "an explanation is always shown on failure" rule
  shouldn't require leaving the node you're already inspecting to read why.
  Both inspectors filter the same Validate-run result to `offendingNodeIds`/
  `offendingEdgeIds` naming the thing they're currently showing; full
  message + explanation, never truncated, matching `ValidationIndicator`'s
  own "never collapse an explanation" rule.
- **The edge inspector gained a source -> target identity line** above the
  kind picker (same `componentDisplayNames` resolution, plus a dot in the
  edge's own `EDGE_COLOR_VAR` color) and the same validation-explanation
  block as the node popover. Position, width-to-content, and the kind
  `<select>` + caption are otherwise unchanged - D6/D7 made creating an edge
  dramatically easier, which is what turns this from a rarely-opened control
  into a main one, not a reason to relocate it.
- **Validation results still never enter the canvas store.** Both panels
  receive `nodeStates`/`violations` as props (Canvas.tsx forwards what
  page.tsx/`ChapterWorkspace.tsx` already compute for `ValidationIndicator`
  and the card's own ring) rather than reading them off store state -
  `ComponentNodeData.validationState`'s own doc comment is explicit that the
  store holds the graph being edited, not validation results, and that
  boundary holds for the inspectors too.

**Ports are revealed, not permanent.** Hidden at rest; shown on card hover or selection, and on every legal destination for the duration of a drag (via the `sc-canvas-connecting` class Canvas.tsx sets from its own `onConnectStart`/`End` state). Twenty cards' worth of always-on dots is noise on a graph being read rather than edited. The port under the cursor turns `--state-valid` or `--state-error` before release, so a rejected drop says so instead of doing nothing. Click-to-connect works for free - xyflow's `connectOnClick` defaults on, and the ports are now large enough to click.

**The trap this replaced.** Every card carried an unconditional, invisible, permanently-unconnectable `start-target` handle at top centre, there to anchor a Start marker's pointer arrow. xyflow's `getClosestHandle` ignores connectability when snapping, so a drop near the top of any card snapped to that handle and then failed the validity check silently - the connection simply never happened. There is no such handle now: the top side is `port-top`, a real port like the other three, and the Start marker's pointer aims at it.

**Edges are drawn, not stored.** Which sides an edge attaches to is recomputed from live card positions on every render (`canvas/edge-routing.ts`), never persisted - an edge means "A connects to B", and nothing in the domain graph or the validation engine reads which side it touched. So edges re-route as a learner drags a card around, and a stale handle id in an old save is simply overwritten. Both canvases go through one `routeEdge()`, which picks the axis, asks the right blocking question for it and returns the pair - they had drifted apart once already, each answering "which side does this edge leave from" differently. Four rules govern the choice: any real horizontal offset takes the horizontal pair (right-to-left forward, left-to-right backward); column-aligned cards take the vertical pair; **a run with a third card standing in its corridor leaves and re-enters the same side**, which is how a path is told to route around rather than straight through (both axes - the vertical case alone left a tier-skipping edge drawn clean through the tier it skipped); and **when the opposite edge also exists, whichever half travels backwards detours** - over the top for a row, out to the left for a column. Without that last rule the two halves of a two-way pair resolve to the same two ports in reverse order and are drawn as one line, so the learner sees one wire where they made two and only the top one can be clicked, inspected or deleted. The detour and the route-around deliberately use opposite sides, so fixing one can never recreate the other. On the orthogonal reference diagram, edges out of one port to several targets get staggered `stepPosition` values so each branch turns in its own channel - without that a fan-out's vertical runs sit exactly on top of each other and read as one thick stroke that sprouts arrowheads. The live canvas doesn't need it: a bezier fan already spreads, since each curve bends toward its own target.

**Starter-graph layout standard (authoring, Design Editor).** Every authored starter graph places nodes on a **260 x 160** pitch - 140px horizontal / 64px vertical of real gap against the 120x96 card. The two axes are deliberately asymmetric: the horizontal gap is where tier-to-tier connectors run and a fan-out needs room for several side by side, while the vertical gap only ever carries one short arrow between two stacked cards in the same tier. At the old 99px vertical a tier column was mostly empty space and a four-deep stack pushed a diagram past 750px tall for four cards' worth of content. One column per architectural tier, flowing left to right, with the tier's own members stacked top down inside it - see CURRICULUM.md §11.5 for the full rule and §11.6 for the zone geometry derived from it. Enforced by `authoring-invariants.test.ts`; see `.claude/docs/pending-design-editor-revamp.md` for the derivation and `.claude/docs/pending-design-editor-exercise.md` for the 2026-08 audit that established the 320x160 predecessor.

### Home Dashboard (signature surface)
Home (`src/home/HomeDashboard.tsx`) is a product dashboard, not a canvas. It replaced a static react-flow mode selector (`HomeCanvas`/`ModeNode`/`HomeTitleNode`, deleted) that looked striking but could only ever hold three cards, with nowhere to put progress, activity, or release news. The dotted plane survives as a plain CSS `radial-gradient` (1px dot, 26px pitch, `--border` at 85%), so the motif is intact with none of the graph machinery.

Structure, top to bottom: a sticky `HomeHeader` (brand lockup + nav, an upcoming "Report a Bug" control, theme toggle, `AppUserButton`); a two-column hero pairing the headline and single primary CTA with the alpha announcement card; "Choose your mode" and the three mode cards; a two-up row of Recent activity and At a glance (four tiles: chapters completed, checkpoints completed, current day streak, longest streak); a minimal footer. One shared measure (`src/home/layout.ts`'s `HOME_CONTAINER`) governs header, main, and footer so they align — capped at 1400px and stepping up only past 2200px/2560px, since 1400px is right at 1080p and anything wider there runs nearly edge to edge. `main` is `justify-center`, so a 1440p-tall window centers the content instead of stranding it at the top above a dead band.

Exactly one control on the page is accent-filled: the hero's "Continue Learning" (Building Blocks teal, bordered + 15% tint + accent text, the same no-fill treatment as the stateful Validate button). Everything else is the system's standard bordered button. Upcoming product areas (ScaleDocs, Roadmap, Report a Bug) render as muted, non-focusable text plus a "Soon" chip — never a link that 404s, and never a tab stop that cannot be activated. There is deliberately no "Home" tab: the brand lockup immediately to its left is already the link home, so a tab beside it was two controls for one destination.

**Two hues in the hero, and exactly two.** Every *UI* element reads from `--hero-accent` blue — the headline's second line, the primary CTA's border/tint/text, the version chip, the announcement card's border, the NEW marker. The illustration reads from it too, at low opacity in thin outlines and translucent fills, so the whole section is one hue at several intensities rather than a colour scheme. A teal illustration was tried as a deliberately separate decorative object and read as the hero simply not being blue — the accent is the identity here, and a flourish in a second hue undercut it. Earlier drafts had three unrelated colors (teal CTA, violet headline, cyan illustration) and looked assembled rather than designed.

**The announcement illustration** (`AlphaAnnouncement.tsx`'s `GeometricObject`) is a cluster of translucent wireframe blocks held inside an isometric bounding cage, over a dashed ground plate, with hand-placed ambient specks and one soft radial pool of glow behind. Plain inline SVG, no illustration dependency, every value `currentColor` at some opacity so it follows the theme. Two details that are load-bearing rather than decorative: each block paints its own silhouette in `--panel` before its translucent faces, so overlapping blocks occlude instead of showing each other's edges through and reading as a tangle of lines; and the cluster sits on a true isometric grid (two back blocks a full step apart, the front one at their midpoint one step forward) rather than merely near one. At rest all four blocks touch: an earlier version floated the top one clear of the cluster with a dashed connector across the gap, which just read as a cube hovering for no reason.

**The one animated thing on Home.** Hovering the announcement card lifts the top block 7px off the stack, brings the cage, glow, and ambient specks up from ~75-80% to full, and warms the card's border. Hover is a real state change, which is what exempts this from "nothing animates at rest" — the object is completely still until pointed at. The lift is the assembling-a-system gesture the product is about, and it is why the stack is drawn touching at rest: without contact there is nothing to lift *off*. The card is the hover `group`, not the drawing, since the drawing is `pointer-events-none` scenery behind the copy — so the response triggers from anywhere on the card. Guarded with `motion-reduce`, verified to pin at `translateY(0)` with `transition: none`. Nothing here can jitter: the card itself never moves, so the pointer cannot fall out of a hover target that shifted under it (contrast the mode cards, which need a fixed hit area for exactly that reason).

**Exactly one accent-filled control.** The hero's "Continue Learning" is the only accent-filled thing on Home (bordered + 15% tint + accent text, the same no-fill treatment as the stateful Validate button). Everything else is the system's standard bordered button. A second accented button next to it — an earlier draft put "See what's new" there — is both a hierarchy problem and, in that specific case, a duplicate of the announcement card's own action.

**The CTA has three states, not two.** `ContinueTarget.kind` is `"fresh" | "resume" | "next"`, not a `fresh` boolean. "Not a resume" is not the same as "has never started": a learner who finished four chapters and left nothing half-open has no chapter to resume, and a boolean read that as a first visit and said "Start Learning" to someone plainly mid-course. The hint line under the CTA distinguishes the three too — "Starting with" / "Picking up at" / "Up next".

**No metric that needs a table.** Every "At a glance" figure is derived from state the app already persists. There is deliberately no "time spent": measuring it honestly needs an active-tab heartbeat writing to a per-day counter (Clerk cannot supply it either - its session fields are presence, not duration, and are overwritten rather than accumulated), and neither a placeholder dash nor the manifest's per-chapter *estimate* dressed up as a measurement earned the slot. Both streaks are approximations of what the data can support - `curriculumProgress` keeps only the latest visit per chapter - and each carries a tooltip saying so rather than presenting a confident number the data cannot back. Longest streak can additionally *move* when an old chapter is re-read, for the same reason; making it monotonic would mean persisting the maximum, i.e. the table this card is designed to avoid.

**"View all activity" is a dialog, not a route.** It used to link to the Building Blocks Learning Path, which answered a different question (per-chapter status for one course) than the label asked. It now opens `AllActivityModal.tsx` — a `CenteredModal` at the new `size="full"` (88vh × min(1320px, 94vw)), split into a fixed left summary rail and a scrolling full list on the right. A dialog rather than an `/activity` page because there is no server-side activity resource to route to: the list is derived client-side from the same current-state timestamps the card uses, so a URL could not be linked to usefully. Rows are shared markup (`ActivityRow.tsx`) with the card, so the two can never drift in columns or link behavior; the dialog adds one absolute-date column, since its rows go back weeks and "3mo ago" alone stops being useful.

**Activity by mode is a donut, and it counts items — not time.** `ActivityModeDonut.tsx` is hand-drawn SVG (three stroked arcs on one circle, `stroke-dasharray`), not a charting dependency. Three rules it follows: slices sit in a fixed order (`MODE_SPLIT_ORDER`) so a mode keeps its position and color as counts change — color follows the entity, never its rank; percentages use largest-remainder rounding so the labels always total 100 rather than printing 33/33/33; and a 3px panel-colored gap separates arcs. That gap is load-bearing, not styling: Sandbox cyan and Building Blocks teal measure ΔE 5.8 apart in light mode (validated, not eyeballed), so touching arcs read as one. Identity is carried by the always-present legend — mode icon + name + count + percent, every mode listed including zeros — never by color alone. The hole holds the total, so each percentage is read against the number it divides. Sandbox is capped at 1 by construction (one save slot), which the rail's caption states rather than letting the lopsided ring imply a bug.

### Home Mode Card (signature component)
Home's mode card (`src/home/ModeCard.tsx`, three in a responsive grid — 1/2/3 columns), styled as an engineering specification sheet rather than a generic dashboard card. 8px radius (`rounded-lg`), hairline border, `p-4`. Anatomy top to bottom: a 40px bordered icon tile (wireframe Lucide glyph — `Boxes`/`Globe`/`Code2` per mode, see `modeIcon` in `src/lib/modes.ts`) beside a rectangular (not pill) uppercase short code in the mode's own `modeColorVar` (`BUILD`/`EXTRACT`/`SANDBOX`, see `modeShortCode`); the mode title (mode-colored) and its `modeTagline`; a flex spacer; a thin flanking-tick "dimension line" divider; and a footer row pairing "x / y chapters" plus a percentage above a course-level `ProgressBar` (mode-colored, see the Progress-Is-Not-Validation Rule) with a bordered arrow-affordance square. Sandbox has no course, so its footer reads `FREE-FORM` instead of progress. On hover the border, arrow, and a whisper of elevation sharpen together; no idle animation, matching the system's "nothing loops at rest" posture.

**Hover lift on a fixed hit area.** The card is two boxes on purpose: the `<Link>` is the hit area and never moves, and an inner div carries the visual and the `-translate-y-0.5` lift. With the lift on the link itself, resting the pointer on the card's exact top or bottom edge slid the element out from under the cursor, un-hovering it, which slid it back — the card oscillated for as long as the pointer sat on that line. Any hover treatment that moves an element must move something *inside* the hit target, never the target.

**Transition property lists name `translate`, not `transform`.** Tailwind v4 implements `-translate-y-*`/`translate-x-*` via the standalone `translate` CSS property. A bracketed list like `transition-[border-color,box-shadow,transform]` therefore never animates them — the lift snapped instead of easing. The plain `transition-transform` utility does cover translate; an explicit property list does not.

**The card resolves into its own accent on hover.** Four things move together, all keyed off the one `group` and all reading from `--accent`: the lift and border (150ms), the icon tile's tint 10% → 20% and the short-code badge's border 40% → 75% (200ms), the dimension line's ticks brightening while its rule is measured out left to right in the accent (200/300ms), and the arrow. Nothing here is decoration for its own sake — the card is stating which mode it is, using the drafting motif it already carries. The sweep is a `scaleX` on a 1px overlay (compositor-only, no layout or paint) and every other step is a color change on a box no larger than 40px; nothing animates at rest, so an idle Home costs nothing. Under `motion-reduce` the lift pins at zero but the dimension line still lands filled — it carries meaning the lift doesn't, so its reduced-motion treatment is "instant," not "absent."

### Palette Tile
- **Shape:** 40px square, 8px radius, 2px border in the category color, background tinted to that same color at 12% mix.
- **Label:** 12px, center-aligned, wraps to two lines rather than truncating with an ellipsis — full component names stay legible even in a compact grid.
- **Hover:** a portaled tooltip (not a native `title` attribute) shows the full label + summary, positioned via a measured rect rather than CSS `:hover` so it always escapes the palette's own scroll container instead of clipping.

### Search Input
- **Style:** hairline-border, `background` (one step darker than panel), 6px radius, left-inset search icon, `padding: 6px 8px 6px 28px`.
- **Focus:** border shifts to 40%-opacity ink — no glow, no ring, matching the system's general avoidance of focus glows outside of form controls.

### Docs Window (signature component)
A small floating, draggable, resizable, minimizable window — not a full-screen modal, not a sidebar tab. No backdrop; the canvas stays fully interactive around it. Title bar is the drag handle (`cursor: move`), with minimize (collapses to a pill capsule at the same position, not a fixed corner) and close as the only two controls. Resizable via a bottom-right corner grip, clamped 300–640px wide and 200–640px tall. Up to four can be open simultaneously, each independent. This is the system's clearest departure from "modal as first thought" — proof that an inline/progressive alternative was chosen deliberately.

### Zone (signature component)
A labeled, resizable grouping rectangle for visually clustering related nodes. Border is an animated dashed outline (`stroke-dasharray` + a moving dash offset) in zone-magenta, reusing the exact same keyframe the system already uses for animated request-flow edges — the zone reads as "part of the same live system" as everything else in motion, not a one-off effect invented for this one element. The animation is permanent, not a creation flourish; dragging a *new* zone into place shows a plain, unanimated dashed preview rectangle, and only the settled result is animated.

**Authored starter-graph decorators use a demarcation palette, not zone-magenta by default.** Every chapter with a `starterGraph` may ship pre-placed zones/comments (`starterDecorators`, `.claude/docs/pending-starter-decorators.md`) drawn from `ANNOTATION_COLOR_PRESETS`: blue for the client/edge tier, purple for the application tier, emerald for the data tier, slate for comments, and zone-magenta reserved specifically for the one optional "Build here" gap zone marking where the exercise's fix belongs. A tier-colored zone tells the learner what a boundary *is*; keeping magenta scarce is what makes the gap zone read as "the thing that's different here" rather than one more grouping box. See `CURRICULUM.md` §11.6 for the full authoring convention (geometry formula, zone-vs-comment rule, when to skip the gap zone).

### Component Picker (signature component)
A centered, command-palette-style dialog (`src/canvas/ComponentPicker.tsx`) — the app's single component-insertion surface in Sandbox, replacing the old permanent Palette sidebar entirely. Reachable via `/` (anywhere outside a text field) or right-click on empty canvas. `~640px` wide, `max-h-[70vh]` with the results list scrolling internally, raised-panel background, hairline border, 6px radius, `floating-menu` shadow — the same visual language as every other dropdown/context menu, just centered and modal instead of anchored to a trigger. A search input (auto-focused on open) filters built-in and custom components by label/summary; results group by category behind a left-hand category-jump rail. It is the system's first true keyboard-navigable listbox (`role="listbox"`, `aria-activedescendant`): ArrowUp/Down and Home/End move one flat active index across the results (category grouping is visual only, not a separate keyboard stop), Enter inserts, Esc or a backdrop click closes. A trailing Tools row (Add zone / Add comment / Add flag / New component) replaces the old palette toolbar one-for-one, keyboard-reachable for the first time. Selecting a component arms a click-to-place cursor rather than inserting at a guessed position — the user always confirms the exact landing spot with a real click on the canvas.

### Learning Path (signature component)
The curriculum browser at `/building-blocks` and `/real-world-extraction` (`src/learning-path/LearningPath.tsx`) — full-screen, no canvas, no `AppHeader`, no `SidebarShell`. Rebuilt in v7.0 to sit alongside the Home dashboard rather than looking like the page that predates it; the curriculum model underneath is untouched.

Structure, top to bottom: a header strip (back-to-ScaleCraft link, Download Curriculum, theme toggle, `AppUserButton`); an elevated course card (`CourseHeader`) that is three columns on a wide screen — `BlueprintCube` illustration, identity + `OverallProgress`, and four `CourseStats` tiles — collapsing to illustration + identity with the tiles beneath, then to a single stack; a search box + collapse-all/expand-all toggle on the left of a control row with `StatusFilter` (All / Not started / In progress / Completed) on the right; then a two-column body — the curriculum, and a sticky rail holding `UpNextCard` and `TipCard`. One shared measure (`src/learning-path/layout.ts`'s `LEARNING_PATH_CONTAINER`) governs all three bands, capped at 1200px rather than Home's 1400px because this page's main column is one-line chapter rows and a wider measure strands each row's arrow an inch from its title. There is deliberately no bottom summary card: chapter/section totals and the estimate are already in the header and the rows themselves.

`OverallProgress` (percent bar, `x / y` chapters and `x / y` sections split into two independently-scannable stats — each count bolder than its label, separated by a hairline divider, not one run-on caption sentence) and the collapsible `SectionCard`s carry the same information they always did. A section header is identical collapsed and expanded — bordered eyebrow badge, title, `x / y`, chevron — so collapsing reads as the same component folded, not a different one; expanding adds the section summary and its rows. Each row (`ChapterRow`) still shows number, title, the color-coded difficulty meter (`DifficultyDots` — green/amber/red dots for foundational/intermediate/advanced, unchanged), a domain chip on Real World Extraction rows only (e.g. "Messaging", "Location & mobility" — `null` for every Building Blocks entry, so nothing renders there), a status icon (`ChapterStatusIcon` — check/dashed-circle/plain-circle, never color-only, each with its own `aria-label`), and a manual-complete toggle. Title and metadata now share one line where there is room and wrap when there isn't, rather than always occupying two. Checkpoint rows (`kind: "checkpoint"`) render distinctly — a flag icon, bordered R1/R2/R3 number chip, bold title, and a subtly tinted row background. Unauthored entries (no backing `ChapterDefinition` yet) render muted, non-interactive, and are not tab stops — clicking one does nothing rather than 404ing. A top-right Download Curriculum link is a plain `<a download>`, no JS. This is the primary navigation surface into a chapter; the workspace's own sidebar (below) is a secondary view over the same progress model, not a competing one.

**One accent per course, and it means progress or position.** Everything accented on this page reads `--course-accent` (`src/learning-path/accent.ts`): the overall progress bar, the course glyph's tile, the active status-filter chip, the up-next chapter's marker, the Up next card's border, and the illustration's thin lines. Building Blocks resolves it to `--hero-accent`, the same blue as Home's hero (v7.0's reference design for this page); Real World Extraction keeps its own indigo, `--mode-real-world-extraction`, because that mode is indigo on every other surface in the app and a blue Learning Path would be the one that disagrees. Everything else stays neutral black/dark gray — most borders here are hairline `--border`, and the accent is worth nothing if every card carries it.

The accent and its two derived intensities (`--course-accent-line` for borders at rest, `--course-accent-soft` for filled chips, `--course-accent-wash` for tinted surfaces) are set inline on the page root, not in `globals.css`. They have to be: a `color-mix()` written at `:root` substitutes against the base var *there*, and descendants inherit the already-computed colour — so overriding only the base further down would leave the derived stops on the wrong hue. `globals.css` still carries a `:root` default of all four, so a component rendered outside this page resolves to the hero accent rather than to nothing.

**The row is the link, and the marker follows the card.** The whole chapter row is the hit area (the status toggle excepted — a button cannot nest inside an anchor), with the trailing arrow inside the link so it responds from anywhere on the row. The chapter `UpNextCard` points at carries a 2px left accent rule and a tinted surface; every other row reserves that column with a transparent border, so nothing shifts sideways as the marker moves. Both come from one call to `resolveContinueTarget` (`src/home/home-data.ts`, scoped to this course), so the card, the marker, and Home's own CTA can never disagree about what is next — and the card navigates via the same `HeldTransitionLink` + lesson route a row uses, not a second mechanism.

**`CourseStats` invents nothing.** Chapters completed, sections completed, and overall progress come from the `CourseSummary` the page already computes; the day streak reuses Home's `computeDayStreak` over the same `activityTimestamps`, and carries the same tooltip caveat. It spans all recorded activity rather than this one course — there is a single set of timestamps, and slicing it per course would report two different streaks for the same day's work.

**Two illustrations, one drawing.** Each course gets its own (`CourseIllustration.tsx` keys them by `CourseId`, so adding a course is a type error rather than a missing picture), and both are built from the same primitives in `blueprint-geometry.tsx` — one 2:1 isometric projection, one `diamond()`, one `GroundGrid`, one `BlueprintGlow`. That shared geometry is what makes them read as the same hand rather than two drawings that happen to share a colour.

- **Building Blocks — `BlueprintCube.tsx`:** a single isometric wireframe cube on a technical ground plane, with dashed hidden edges, vertex ticks, and two flanking-tick dimension lines. One block on purpose: Home's announcement object owns the assembled-cluster gesture, and this page's subject is the unit itself.
- **Real World Extraction — `BlueprintSystem.tsx`:** the same unit seen from the other end. Four nodes of a small running system sit on the plane — an entry, two services, a store — and one block has been lifted clear of its slot, held in four corner brackets. It leaves a dashed footprint where it came from and a thin plumb line back down to it, and the two edges that ran through it are drawn dashed: it is extracted, not floating for effect. Two things are load-bearing rather than styling: the grid runs at half a node step, so every node lands on an intersection instead of merely near one; and the four nodes are deliberately *not* mirrored, because at symmetric coordinates the four edges close into a perfect rhombus and the whole thing reads as one decorative diamond instead of a topology. The brackets are four marks, never a closed rectangle — a full box reads as a card behind the block rather than an instrument pointed at it.

Both are plain inline SVG, every value `currentColor` at some opacity so they follow the theme *and* the course accent, and both are `aria-hidden` — the header's title and progress carry the meaning. Nothing on this page animates at rest; the only motion is hover (row arrow, card border) and the existing expand/collapse.

### Chapter Sidebar (in-workspace navigator)
Building Blocks and Real World Extraction's left panel inside a chapter workspace (`src/chapters/ChapterSidebar.tsx`) — the one place left in the app with a permanent sidebar; Sandbox has none (see Component Picker above). Reuses `SidebarShell`'s chrome exactly: collapses to a 40px icon strip, 220–480px drag-resize, the same width-transition + opacity-fade pattern the old QuestionPanel established. There is always an open chapter now (the route drives selection, not this panel), so the content slot is a **Question Pane** — problem statement (rendered as Markdown), a Draft badge for throwaway placeholder content, learning objectives, a required-components progress line, and hints — with a **"Back to lesson"** link docked above it, back to that chapter's Chapter Reader page. The Design Editor is reached only through the Reader now, so this sidebar carries no curriculum browser or Learning Path link of its own — going back always means going back to the lesson this canvas belongs to. Hints render as individually-collapsed "Show hint" disclosures, never pre-expanded — the same never-auto-surfaced posture the system already applies to validation explanations, just covering a chapter's own scaffolding instead of a rule failure. When the build passes but the chapter's own Knowledge check exam (Reader-only, see below) isn't passed yet (best attempt below the 80% threshold, or not yet attempted), a single muted line — "Knowledge check remaining." — appears under the completion line: copy only, no badge, no nagging.

### Design Editor canvas (flow-diagram rules)
The editable canvas picks its handles the same way the reference diagram does - `src/canvas/edge-routing.ts` is shared by both - but draws the path differently: the editable board keeps curves, the printed figure is orthogonal.

- **Edges are curved, animated and arrowed.** The default bezier path with a kind-coloured `markerEnd`, and the drag preview (`connectionLineType`) curves the same way, so the wire never snaps to a different shape on release. Right-angle (`smoothstep`) connectors were tried on the live canvas and reverted - they read as stiff on a board someone is actively editing. Every kind keeps the `dashdraw` marching-ants motion (`animated`): on the editable canvas a wire is a live connection, which is what that motion says.
- **Handles are chosen from live geometry, not stored.** Which side an edge attaches to is presentation, never data: no part of the domain graph or the validation engine reads it. So it is recomputed every render from current positions and edges re-route as a learner drags a card. Authored edges carry no handle ids at all, and xyflow resolves those to Left/Right always - which is what drew every tier-change edge as a diagonal across the canvas before this.
- **Fit has a legibility floor, anchored left.** `MIN_FIT_ZOOM` stops the view shrinking past the point a card's label is readable; when it bites, the graph is anchored to its left edge rather than centred, so a wide design opens at its entry point and pans right.
- Starter graphs are authored as vertical tier columns flowing left to right - see `.claude/docs/CURRICULUM.md` §11.5/§11.6 for the authoring standard and its invariant gates.

### Reference Diagram (Debrief)
`src/chapters/ReferenceGraphCanvas.tsx` - the read-only architecture diagram inside a chapter's Debrief disclosure, drawn from that blueprint's `referenceGraph`. A real React Flow render of the same `ComponentCardVisual` the live canvas uses, not the textual `ReadOnlyGraphSummary` (which quiz diagram questions keep, since there the graph *is* the question).

**It reads as an architecture diagram, not a node graph.** Five rules carry that, shared with the live Design Editor canvas (`src/canvas/edge-routing.ts` is the one source for the last two):

- **Left to right between groups, top down inside one.** `reference-layout.ts` ignores the authored `position` fields entirely and computes stages as longest-path rank from `entryPointIds`, ordering branches with a barycenter pass. A chain of four stages or fewer stays one flat row; a longer one stacks four consecutive stages per vertical column and starts the next column to the right. Nothing ever wraps back to the left. A blueprint author writes nodes and edges; the shape is derived, so it cannot drift.
- **Orthogonal connectors** (`smoothstep`), not beziers, with an arrowhead in the edge's own kind colour. Kind still reads as colour + dash pattern per `edge-styles.ts`, so the arrow is a direction channel only and never the sole carrier of anything.
- **Only a forward edge attaches left-to-right.** An edge whose target sits to the right leaves the source's right handle and enters the target's left; everything else - a straight vertical drop, a feedback path like a replica serving reads back - leaves the bottom and arrives at the top. Attaching a backward edge to the right handle is what drew the long diagonals this replaced.
- **A fan-out turns in staggered channels.** Three edges out of one handle would otherwise share a single vertical run and read as one thick line sprouting arrowheads; each branch gets its own stub length, ordered so the furthest branch runs outermost.
- **The box follows the drawing.** The container takes the diagram's own aspect ratio (clamped 170-380px tall) rather than a fixed height, and opens at a floor zoom rather than shrinking past readability.

Its own pitch (200 x 150) is deliberately tighter than the authored canvas pitch (260 x 195, `card-geometry.ts`): that spacing is sized for grabbing an edge and dropping a label, and none of it applies to a render nobody can touch.

A **Start badge** (`ReferenceStartBadge.tsx`) sits above every `entryPointIds` node - a flow diagram has to say where the flow begins. It is the read-only counterpart to the canvas Start flag, stripped to a label and a down chevron since nothing here is editable. Four gates in `authoring-invariants.test.ts` hold the data honest: every Debrief-capable blueprint has a reference graph, every graph names an entry point, every entry point and edge endpoint is a real node, and no node is unreachable from an entry point.

Wheel scroll always falls through to the page (this sits inside a scrolling disclosure); drag-to-pan plus a small zoom/fit row **below** the frame is how a learner explores a bigger diagram. Below, not xyflow's floating `Controls` - at sidebar width the panel's bottom-right corner is a card, so an overlay covers the thing it exists to help read.

### Chapter Reader (documentation-style lesson page)
`/<mode>/<chapterSlug>/lesson` (`src/chapters/ChapterReader.tsx`) — the reading page between the Learning Path and the Design Editor canvas. No AppHeader, same posture as the Learning Path itself. A fixed, always-expanded left panel (`ReaderSidebar` — a `ChevronLeft` "Learning Path" back-link, not an external-link icon: this stays inside ScaleCraft, it isn't a hop to another site; below it a real heading, "Curriculum", paired with the course name (`course.title`) as a subtitle so the label has context instead of floating alone; then the full curriculum via `CurriculumSectionList`, every row a plain `Link` to another chapter's own Reader — no held loading transition, this destination is too light to need one. Section labels ("UNIT 0", etc.) carry an invisible spacer matching a row's status-icon width + gap, so label text and row-title text share one left column instead of staggering); the lesson prose center, opening with a domain badge (RWE chapters only, rectangular/filled — visually distinct from the pill-shaped prerequisite chips below it) and a "Prerequisites" row of capsule tags (linking to each prereq's own lesson when authored, a plain unlinked chip otherwise, since an unauthored slug 404s), then `MarkdownRenderer` over a per-chapter `.md` file, with a slim `ReadingProgress` bar (green, sticky to the top of the article's own scroll container — see the Progress-Is-Not-Validation exception above; a `ResizeObserver` on the article's content siblings, not just the `scroll` event, keeps it accurate when Mermaid diagrams or images resize the article after the last scroll), then `YourTurnCard` (see below) — one shared card holding the "Knowledge check" row when the chapter has a quiz and the "Design exercise" row's "Begin exercise" link (this one *does* hold the branded loading transition — it's mounting the real canvas, which is heavy), divider between when both rows are present; on the right, an "On this page" `TableOfContents` (IntersectionObserver scroll-spy, with a synthetic "Knowledge check" entry appended when the chapter has a quiz) alongside `ThemeToggle`, since this page has no header of its own to carry one.

**Measure:** the prose column is `max-w-2xl` (42rem) up to a `min-[1800px]` arbitrary breakpoint, `max-w-5xl` (64rem) above it. 42rem holds a comfortable line length through 1080p; on a 2K display the two fixed asides leave enough slack that the same column reads thin. Stock Tailwind's largest breakpoint (`2xl`, 1536px) is already below 1080p's width, so distinguishing the two needs an arbitrary one. The wide step is a deliberate call by the author (2026-08-17), favouring a filled 2K display over a textbook measure: 64rem runs past the usual 60-90 character band, so if long-form prose starts feeling harder to track on those displays, `max-w-4xl` (56rem) is the middle ground.

### Knowledge Check (exam)
The Reader's last content section, the Knowledge check row of `YourTurnCard` (`src/chapters/YourTurnCard.tsx`, same slot/anchor as the earlier inline model it replaced) — its "Take the quiz"/"Retake the quiz"/"View your result" button opens a full-screen, proctored-*style* exam. "Proctored" is presentation only, not anti-cheat — real fullscreen (best-effort, CSS `fixed inset-0` fallback) plus a focused, distraction-free layout; the UI is honest that browsers don't let a page block Escape-exit or detect tab-switches. Not scoring theater (CLAUDE.md's one documented exception to "not a game," confirmed with the user) — no points, streaks, badges, or celebration animation, just a real score/pass-fail line that gates completion honestly.

Plain heading ("Knowledge check", `id="knowledge-check"` for the TOC), a Draft badge for placeholder chapters, and upfront copy: "*N* questions · 80% to pass". Four launcher states, each one button: never attempted → **Take the quiz**; attempts remain, not passed → "Attempt *N* of 3 used · Best score *X*%" + **Take the quiz**; passed → "Passed · *X*%" + **View your result**; exhausted without passing → "3 of 3 attempts used · Best score *X*%" + **View your best attempt**. Real World Extraction quizzes additionally gate on the project's own Phase B validation pass (`evaluateChapter`) — nothing renders until then, since a retrospective needs a build to retrospect on; Building Blocks quizzes carry no such gate.

**Exam shell** (`ExamShell.tsx`, portaled full-screen dialog, same `z-modal` tiers as `ComponentPicker`): one question at a time — prompt (Markdown) + the same 3-dot difficulty meter as before (`QuizDifficultyDots`, ramp position not a score) + a kind-specific body (single/multi-choice, ordering via up/down buttons, matching via per-row selects, or a diagram), all unchanged from the earlier inline model and fully reusable since they're pure and `disabled`/`revealed`-gated. Free navigation replaces the old fixed per-question flow: "Question *X* of *N*", jumpable progress dots, Back/Skip-or-Next, arrow-key nav — answers persist across navigation (the one real behavioral fix this pivot exists to make). "Submit exam" is reachable from any question; submitting with unanswered questions shows a styled confirm dialog (`ExamConfirmSubmitDialog`, "*N* unanswered — submit anyway?") before scoring them incorrect.

**Results screen** (`ExamResults.tsx`, same full-screen chrome as the exam shell) — a score banner (percent + Passed/Not-yet-passing line, `text-state-valid` only when passed) followed by the full per-question review: every option's explanation still always shows (chosen or not, right or wrong — CLAUDE.md/QUIZ_FRAMEWORK.md §1's rule survives the pivot, just deferred to this end screen instead of per-question-immediately), plus a Correct/Incorrect/Not-answered chip per question. Diagram questions render `ReadOnlyGraphSummary` above the choice body throughout (exam and results both): a lightweight text list (not a canvas), each node label prefixed with a small category-color dot and each edge row carrying the same color + dash-pattern pairing the live canvas uses per kind (`src/canvas/edge-styles.ts` — the one shared source for both), with a screen-reader-only text description of the kind alongside the decorative glyph.

### Release notes (dialog)
`ReleaseNotesModal.tsx` — `CenteredModal` at `size="viewport"` with `hideHeader`, since it carries its own headline. **One release per slide**, not one long scrolling list: at eighteen releases the current one (the only thing most readers open this for) was one paragraph among seventy. Left rail lists every release (version, formatted date, `Latest` chip on the head) and jumps straight to one; on `lg` it is a bordered left column with a timeline rule behind the markers, below `lg` the same list becomes a horizontal chip strip above the slide. Flanking circular arrow buttons page the timeline (grid columns, not absolute positioning, so nothing overlaps at any width), `ArrowLeft`/`ArrowRight` do the same from the keyboard, and Escape closes. Pagination dots window to nine around the current slide, with the continuing edge dot shrunk, so the strip stays a strip as the list grows. Slides enter via `release-slide-forward`/`release-slide-back` (260ms, `motion-safe:` only) — direction encodes which way you moved through the timeline, which a plain crossfade cannot say. One accent throughout (`--hero-accent`) for the eyebrow, section labels, icon tiles, and the active rail marker — deliberately not a `--mode-*` or category hue, which are identity channels for things this dialog isn't about.

**One blueprint for every release** (`ReleaseIllustration.tsx`): the release line — shipped versions as nodes on a solid rule, the current one marked inside a registration square, the line going dashed with empty nodes past it, and a leader running up to a bracketed callout note. Drawn in the app's own vocabulary (nodes on a line, drafting leaders, a flanking-tick dimension rule) rather than a metaphor from outside it; a summit-and-route version was built and dropped as a stock illustration that said nothing a changelog needs said, and the note is a bracket-and-baseline callout rather than a filled rounded card, which read as a loading skeleton. 2.4:1 sheet, matching the slot the dialog gives it — a squarer box lets `meet` letterbox the drawing into the middle of its container. A per-release motif was also built and dropped: it made every future release owe a bespoke drawing before it could ship. Content for the slides follows the authoring contract in `.claude/docs/RELEASE_NOTES.md`, enforced by `src/content/release-notes.test.ts`.

### Feedback survey (dialog)
`FeedbackSurveyModal.tsx` - `CenteredModal` at `size="viewport"` with `hideHeader`, the third dialog on that shell alongside About and Release notes. Three fixed bands: a header carrying the eyebrow/headline/alpha badge over Home's own dotted plane (1px dot, 26px pitch, masked to fade downward) with `FeedbackIllustration` beside it, a scrolling two-column body, and a footer holding Cancel plus the primary Send. Left column is the survey itself (the three question sections plus "In your words"); the right column is everything *about* the submission rather than part of it - screenshots, reply address, technical details - separated by a left rule and stacked under the questions below `lg`.

Sections carry a numbered marker running straight through both columns (1-4 left, 5-6 right), `aria-hidden` since they are not steps and answer order is free. Every multiple-choice answer is a chip card: hairline border, icon at 15px, label at 12.5px, `--hero-accent` border/tint/text when selected (the accent's documented use, see Typographic Accent). Chips lay out on a grid whose column count is chosen from the option count, so six options read as two rows of three rather than a four-and-two remainder. Glyphs are mapped by option label inside the dialog rather than declared in `feedback.ts`, keeping the content file free of UI imports (the same split `release-notes.ts` uses); the mode question reuses `modeIcon`, so those three glyphs match Home's mode cards instead of drifting.

Screenshots use one dashed dropzone that is also the browse button (drag *and* click, one target, `disabled` at the 3-image cap). Free text gets 4-row boxes with a live `n / 1000` count. Technical details is a native `<details>`, open by default, listing version/page/viewport/browser as a hairline-divided table - `describeBrowser` renders a readable "Chrome 151" with the full user agent printed underneath it, never in place of it, since the whole point of the panel is that nothing leaves that the sender has not read. Nothing in the form is required; the only send gate is that *something* was answered.

### Scrollbars
Thin (10px), theme-aware, applied globally in `globals.css` — `scrollbar-width: thin` + `scrollbar-color` for Firefox, `::-webkit-scrollbar` for Chromium/WebKit. The thumb is `--border` (a translucent `color-mix` toward `--foreground` on hover), inset from the track edges via a transparent border + `background-clip: padding-box`, track and corner transparent. Reads `--border`/`--foreground` directly, so it follows the light/dark toggle the same way everything else does, with no separate scrollbar tokens.

### Held loading transition
`HeldTransitionLink`/`ModeCard`'s branded loading overlay holds for 700ms (down from an original 1250ms) before the real navigation fires. Scoped to where a heavy mount is actually being masked: Home -> Sandbox keeps it (Sandbox mounts the full canvas + component registry + validation engine, nothing scoped down); Home -> Building Blocks/RWE dropped it (those land on the Learning Path, a plain curriculum list with no canvas at all — too light to need a hold). `ChapterRow`/`CurriculumSectionList` rows into the Chapter Reader are plain `Link`s for the same reason; `YourTurnCard`'s "Begin exercise" keeps the hold, since it mounts the real canvas.

## 6. Accessibility

ScaleCraft's design must be navigable by all users, regardless of ability. These are non-negotiable requirements, not "nice-to-haves."

### Keyboard Navigation
- Every interactive element must be keyboard-focusable with a visible focus indicator (≥2px outline).
- Tab order must follow visual flow (left-to-right, top-to-bottom).
- The primary workflow (canvas manipulation, validation, export) must be completable via keyboard alone.
- Toolbar buttons must be discoverable without hover — either visible labels, a keyboard legend (Shift+?), or both.

### Color Blindness Support
Validation state colors (error red, warning amber) must not rely on hue alone. Pair them with a secondary visual signal:
- **Error ring:** solid 2px outline + optional error glyph (✕ or !)
- **Warning ring:** dashed or dotted outline + optional warning glyph (⚠ or ?)
- Test with a colorblind simulator (Chrome DevTools, WebAIM, or Coblis) before shipping.
- Ensure both themes maintain ≥4.5:1 contrast against their background (see Neutral colors).

### ARIA and Screen Readers
- All icon-only buttons must have descriptive `aria-label` attributes (e.g., "Save graph" not just "Save").
- Tooltips are supplements, not the only affordance label — the button itself must announce its purpose.
- Heading structure must be semantic (h1 for main title, h2 for sections); never skip levels for styling.
- Dynamic content changes (validation results, save confirmation) must announce via `aria-live: polite` so screen readers notify users.
- Form fields must have associated labels; never rely on placeholder text alone.

### Motion and Reduced Motion
- Every animation must respect the `prefers-reduced-motion: reduce` media query.
- When animation is disabled, the state change must still be visible via instant color/opacity shift or a brief crossfade.
- Motion-essential content (a request path moving along an edge) can animate, but must be pairable with a static equivalent (legend, static label) for users with motion sensitivity.

### Zoom and Magnification
- The interface must remain fully functional at up to 200% zoom in the browser.
- Avoid fixed pixel sizes that cause layout breakage; use relative units (em, rem, %) wherever possible.
- Don't hide critical controls or labels at high zoom.

---

## 7. User Education and Onboarding

ScaleCraft's most distinctive feature is its two-channel color system (category + validation state). Users must understand it to use the app effectively. Education is not optional.

### Legend / Help Panel
Provide an accessible, discoverable legend showing:
- **Category colors:** Blue = Networking, Violet = Compute, Green = Data, Amber = Caching, Pink = Messaging, Red = Distributed Systems
- **Validation states:** Green ring = valid (passes all rules), Amber ring = warning (non-blocking issue), Red ring = error (blocking issue)
- **Edge types:** Cyan = request-flow (primary path), Slate = control, Teal = replication, Fuchsia = async
- **Mark zones:** Magenta dashed border = visual grouping (non-functional, for organization only)

Make it accessible via:
- A toolbar `?` or `Help` button that opens a lightweight floating panel (not a modal).
- Inline tooltips on the first interaction with an unfamiliar element (first hover over a green node, show a micro-tooltip: "Data component — valid").
- An in-app glossary (linked from DocsPanel) explaining each component type and edge type at the domain level.

### First-Visit Onboarding
For users visiting the Sandbox for the first time:
- Show a **welcome carousel** (3–5 slides, dismissible) covering:
  1. "Canvas basics: drag to place, click to inspect, right-click to edit"
  2. "Color meanings: category identity (what it is) and validation state (is it valid?)"
  3. "Validate button: checks your design against real-world rules and explains why"
  4. "Export: save your work or share it"
- Make it skippable (skip all, skip this step) so power users aren't blocked.
- Don't gate the interface behind onboarding — show it modally on first load, but let users close it and start working immediately.
- Persist "onboarding seen" flag per user in IndexedDB so it doesn't repeat.

### Keyboard Shortcuts
Implemented as `ShortcutsModal.tsx` — a centered modal (the same `CenteredModal`
shell as About/Release notes), not a floating panel, opened via the header's
Keyboard Shortcuts button or the `Shift+/` ("?") shortcut from anywhere
(`use-canvas-shortcuts.ts`):
- Shortcuts are grouped into sections by use case (Canvas navigation, Editing,
  Components & documentation, File, General), not a single flat list.
- A search box filters by section title or by an individual shortcut's
  label/key combo, so either "editing" or "undo" narrows the list. It has its
  own clear (X) button, and resets automatically whenever the modal closes
  (backdrop click, the X, or Escape) so reopening always starts at the full
  list, not the last search.
- `Escape` closes the modal - checked ahead of the focus-mode-exit Escape in
  `use-canvas-shortcuts.ts`, so one Escape closes just the modal even when
  focus mode is also active underneath it.
- `Ctrl/Cmd+/` opens documentation for the selected component (`openDocTab`),
  alongside bare `/` (add component) and `Shift+/` (open this modal) as the
  "/" family of discovery shortcuts.
- Consider a command palette (Ctrl+K or Cmd+K) for future power-user features (search components, run validation, export).

---

## 8. Do's and Don'ts

### Do:
- **Do** treat category color and validation-state color as two channels that never occupy the same rendering surface on one node (see The Two-Channel Rule).
- **Do** reuse the `dashdraw` motion token for anything that should read as "part of the live system" (the zone border) rather than inventing a new animation per element. Note edges no longer use it: every edge kind used to set xyflow's `animated`, so a finished design was twenty permanently crawling wires and a request-flow edge could never be a plain solid line. That is decorative animation at rest, which this product does not do. Edge kind is carried statically instead, by colour plus `edge-styles.ts`'s dash pattern.
- **Do** keep every button the same neutral shape and color, with the single deliberate exception of the Validate button's semantic state color.
- **Do** favor a floating, dismissible window (see Docs Window) over a modal when the content is reference material the user wants to keep glancing at while they keep working.
- **Do** wrap long labels across two lines rather than truncating with an ellipsis when there's vertical room (see Palette Tile).
- **Do** require explicit confirmation (modal, toast with undo, or confirmation dialog) before destructive actions (delete node, delete edge, clear canvas).
- **Do** add visible ARIA labels to every icon-only button; make tooltip text a supplement, not the source of truth.
- **Do** pair validation state colors with a secondary visual signal (outline pattern, glyph) so colorblind users can distinguish error from warning.
- **Do** keep chapter hints collapsed behind a deliberate per-hint reveal click (see Chapter Sidebar) — the same never-auto-surfaced posture already required of validation explanations, applied to hints too.

### Don't:
- **Don't** add idle animation, gamified particle effects, or celebratory confetti-style success states — direct language from the system's own design brief: "ScaleCraft is not intended to be a game."
- **Don't** reuse AWS/GCP/Azure's architecture-diagram icon sets — trademarked, not licensed for a competing product. Lucide (open-licensed) is the icon base.
- **Don't** rely on hue alone to distinguish the category channel from the state channel on a single node — pair state with a ring *and* an icon, since three category/state hue pairs are pixel-identical by design.
- **Don't** use `border-left`/`border-right` as a colored accent stripe anywhere in this system — category identity is communicated via icon-badge fill or a full 2px border, never a side stripe.
- **Don't** default to a modal for anything that could be inline or a lightweight floating window instead (see Docs Window) — modals are a last resort here, not a first instinct.
- **Don't** invent a new one-off animation for a new element — check whether `dashdraw` (or a real state-change transition) already covers the intent before adding motion.
- **Don't** hide critical affordances behind icon-only buttons without a keyboard legend or visible label. Power users and accessibility-dependent users must be able to discover what's available.
- **Don't** animate or highlight disabled UI elements in a way that suggests interactivity (e.g., animated dashed border on "coming soon" mode cards). Reserve `dashdraw` for interactive or state-signaling elements only.
- **Don't** leave validation explanations only in code or documentation. They must surface in the UI when validation fails — the user sees "why" inline, not just "invalid."
