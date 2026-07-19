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

### Accent
- **Zone Magenta** (#ff3483): the one color outside the category/state system — a labeled grouping rectangle ("mark zone") uses it for an always-animated dashed border. It exists precisely because it doesn't collide with any category or state hue.

### Named Rules
**The Two-Channel Rule.** Category color and validation-state color never share a rendering surface on the same node: category always fills or tints a badge, border, or palette tile; state always renders as a ring/outline layered on top of it. Three category hues intentionally coincide exactly with a state hue at the pixel level — Data ↔ Valid (#22c55e), Caching ↔ Warning (#f59e0b), Distributed Systems ↔ Error (#ef4444) — and this is safe *specifically because* they never occupy the same channel at once. Never use a state color as a fill. Never use a category color as a status ring.

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
**The Flat Canvas Rule.** Nothing on the canvas plane itself casts a shadow beyond node cards' own whisper-thin `ambient-card`. Shadow means "this is floating above the diagram" — it is chrome-only vocabulary, never applied to diagram content.

## 5. Components

### Buttons
- **Shape:** 6px radius (`rounded-md`), 1px hairline border, always visible (not borderless-until-hover).
- **Primary (the only variant — no filled/ghost split):** raised-panel background, ink text, border-hairline-border, `padding: 6px 12px`, 14px/500-weight label, icon (14px) + label, `gap: 6px`.
- **Hover:** background steps to hairline-border. No transition duration is currently set on this — the state change is instant, consistent with "no decorative motion," though a 150ms crossfade (matching the product register's 150–250ms convention) would read as more deliberate than accidental.
- **Stateful variant (Validate button):** the one button that changes color by state, not just on hover — neutral border/text at rest, ledger-green when the graph passes, fault-red when it fails, and a dashed border at reduced opacity when results are stale. This is the system's only semantic-colored button; every other button stays neutral regardless of what it does.

### Dropdown / Context Menus
One shared visual language across three distinct triggers (Export menu, Validate's result dropdown, right-click context menu): raised-panel background, hairline-border, 6px radius, `floating-menu` shadow, `padding: 12px` (dropdowns) or `4px 0` (context menu list). Menu items are full-width rows, `padding: 6px 12px`, hairline-border hover fill, danger items (Delete) in fault-red text. A full-viewport transparent click-catcher closes the menu on any outside click — never a manual blur/escape-only pattern.

### Node Card
- **Shape:** 200px fixed width, 12px radius (`rounded-xl`) — the roomiest radius in the system, reserved for this one signature element.
- **Anatomy:** icon badge (32px, 8px radius, category-color fill at 20% mix) + title (14px/600) + one-line summary (12px, 60%-opacity ink) stacked beside it, whole-card 2px outline in the state ring color (defaults to hairline-border when unvalidated).
- **Shadow:** `ambient-card` only.

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
Make them discoverable without reading docs:
- Publish a keyboard legend accessible via `Shift+?` or from the toolbar (e.g., a `Help` menu with "Keyboard Shortcuts" as one option).
- Legend should show: Ctrl+Z (Undo), Ctrl+Shift+Z or Ctrl+Y (Redo), Ctrl+S (Save), Ctrl+/ (Help).
- Consider a command palette (Ctrl+K or Cmd+K) for future power-user features (search components, run validation, export).

---

## 8. Do's and Don'ts

### Do:
- **Do** treat category color and validation-state color as two channels that never occupy the same rendering surface on one node (see The Two-Channel Rule).
- **Do** reuse the `dashdraw` motion token for anything that should read as "part of the live system" (edges, the zone border) rather than inventing a new animation per element.
- **Do** keep every button the same neutral shape and color, with the single deliberate exception of the Validate button's semantic state color.
- **Do** favor a floating, dismissible window (see Docs Window) over a modal when the content is reference material the user wants to keep glancing at while they keep working.
- **Do** wrap long labels across two lines rather than truncating with an ellipsis when there's vertical room (see Palette Tile).
- **Do** require explicit confirmation (modal, toast with undo, or confirmation dialog) before destructive actions (delete node, delete edge, clear canvas).
- **Do** add visible ARIA labels to every icon-only button; make tooltip text a supplement, not the source of truth.
- **Do** pair validation state colors with a secondary visual signal (outline pattern, glyph) so colorblind users can distinguish error from warning.

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
