# Design Language

Status: **directional, not pixel-final**. This sets the system a future design pass
works within; it is not a finished visual spec.

## Overall posture

`INITIAL_THOUGHTS.md` is explicit: "ScaleCraft is not intended to be a game." The visual
language should read as a **technical instrument** — closer to Excalidraw, Linear, or a
cloud provider's architecture-diagram console than to a puzzle game's UI, even though the
interaction model borrows mechanics from puzzle games (see [[RESEARCH]]). Motion and
color communicate *state*, never decoration.

## Iconography

Component nodes are icon-driven, flat, single-color-per-category — not skeuomorphic.
Two constraints shape this:

- **Cannot reuse AWS/GCP/Azure architecture icon sets** — trademarked, not licensed for
  a competing product. Recommend starting from an open-licensed icon base (Lucide) and
  building a small set of custom composed icons only for components Lucide doesn't
  cover well, rather than commissioning a full bespoke set before validating the product.
  Revisit once the component library is large enough to justify the investment (see
  [[OPEN_QUESTIONS]]).
- **Icons should be legible at node scale on a canvas with dozens of nodes** — favor
  simple, high-contrast glyphs over detailed illustrations.

## Color system

Two independent color channels, deliberately kept visually distinct so they never
collide on the same node:

**Category color** (identity — which kind of component this is), used as a fill/accent
on the node card and in the palette sidebar:

| Category | Hue |
|---|---|
| Networking | Blue |
| Compute | Violet |
| Data | Green |
| Caching | Amber |
| Messaging | Pink |
| Distributed Systems | Red |

**Validation state color** (status — how this node is currently judged), used as a
border/ring/glow treatment layered on top of the category fill, never replacing it:

| State | Color |
|---|---|
| Valid / no issues | Green ring |
| Warning | Amber ring |
| Error | Red ring |

Because "Data" category and "Error" state are both red/green-adjacent, state is
communicated by *ring + icon* (e.g. a small warning glyph), not fill color alone — don't
rely on hue by itself to distinguish the two channels.

**Mode color** (context — which learning mode the current route is), a third channel
added when the Sandbox route shipped (milestone 3). Confined to the mode badge and the
header's bottom border only — **never** on a component node — so it can't collide with
the category/state channels above:

| Mode | Color |
|---|---|
| Sandbox | Cyan |
| Building Blocks | Orange |
| Real World Extraction | Indigo |

Like category/state colors (see "Theming" below), mode colors are tuned with separate
dark/light values (`src/app/globals.css`'s `--mode-*` tokens): no single hue cleared
4.5:1 contrast against both panel backgrounds at once, verified with a WCAG contrast
check.

## Typography

- UI chrome, body text, docs panels: **Inter** (or system-ui equivalent) — neutral,
  highly legible at small sizes.
- Technical labels, config values, component ids, anything code-shaped: a monospace
  face (e.g. JetBrains Mono) — reinforces "this is an engineering tool," and gives
  config panels a code-editor feel consistent with the audience.

## Theming

Dark mode is the default (canvas/creative-tool convention — Figma, Excalidraw, tldraw
all default or heavily favor dark), with full light mode support, not an afterthought.
Category, state, and edge colors each have independent light/dark values tuned for
contrast in both (`src/app/globals.css`'s `.light` block) — none of them are a naive
invert of the dark value.

## Motion

Every animation must mean something; none are decorative:

- Simulation tokens moving along `request-flow` edges (the core "watch a request
  traverse the system" moment).
- Validation state transitions (a ring color change on a node when a rule starts/stops
  matching).
- Connection-draw feedback (a valid vs. invalid drop target while dragging an edge).

No idle animation, no gamified particle effects, no celebratory confetti-style success
states — a clean state change (e.g. a chapter's "success criteria met" banner) is enough.
This is a direct consequence of "not a game."

## Component node anatomy

A consistent card shape across every component type, so the palette and canvas share one
visual grammar: icon (top-left) + label + category color accent (left border or header
bar) + validation state ring (whole-card outline) + an expand affordance for a config
summary (e.g. "TTL: 60s" under a Cache node). Config panels and docs panels open as
side/overlay panels, not inline in the node — keeps the canvas legible when a graph has
many nodes.
