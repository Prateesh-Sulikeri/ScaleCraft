# Design Editor on tablets (release 7.4.0)

**Status (2026-10-26): phases 1-4 built** on `feat/responsive-release-design-editor`,
verified in emulated iPad (portrait/landscape) and iPhone screenshots. Still owed:
real-iPad pass (Q5), and the known gaps below.

Known gaps after phases 1-4:
- Header `...` popover is icon-only; touch users get aria-labels but no visible text.
- Tour steps targeting `question-pane` / `hint-toggle` show unanchored when the
  sidebar is collapsed (portrait); copy no longer assumes right-click.
- Shift-click "place another" has no touch equivalent (re-open the picker).
- Long-press has no unit test (jsdom has no PointerEvent.pointerType); covered manually.
Branches: `staging/7.4.0-responsive-release`, `feat/responsive-release-design-editor`.
Supersedes the "Rescoped to release 7.4.0" note in `pending-responsive.md`
(that doc's site-wide work shipped in 7.1.0).

## Decisions taken

| # | Date | Decision |
|---|---|---|
| D1 | 2026-10-26 | Touch support is **in**. A tablet user must be able to do everything a PC user can in the Design Editor. A large UI overhaul is acceptable. |
| D2 | 2026-10-26 | Phones are **permanently out** for the Design Editor. On a phone the Chapter Reader is the product. |
| D3 | 2026-10-26 | Scoping closed. User delegated Q1-Q6 to the recommendations below; keep the current design language, improve where needed. Q1: dock + selection toolbar everywhere. Q2: portrait and landscape. Q3: one-finger pan. Q4: compact shell below 1280. Q5: user's iPad is the real device. Q6: desktop header (>=1280) untouched this release. |

## Where the editor stands today (audit, 2026-10-26)

The gate already lets touch devices in: `use-large-screen.ts` admits coarse
pointers at >=768px. So an iPad reaches the editor today, and most of the
editor can't be used without a mouse and keyboard.

### Hard blockers (a task cannot be done at all by touch)

| Task | How it works today | Why touch fails |
|---|---|---|
| Add a component | Right-click empty canvas (`Canvas.tsx` `onPaneContextMenu`) or `/` (`use-canvas-shortcuts.ts:132`) opens `ComponentPicker` | No visible button anywhere. iOS Safari does not fire `contextmenu` on long-press. **No way in on a tablet.** Also a discoverability bug on desktop. |
| Place zone / comment / flag | Tools live inside the picker, so they're also unreachable | Same as above |
| Pan the canvas | `panOnDrag={[1]}` (middle mouse) + wheel (`panOnScroll`) | One-finger drag on empty canvas starts a box select (`selectionOnDrag`). No one-finger pan. |
| Node / edge / selection actions | Right-click `ContextMenu` | No long-press handling |
| Configure a node | Double-click (`onNodeDoubleClick` opens `NodeConfigPopover`) | Double-tap is unreliable and fights the browser's double-tap zoom |
| Delete | `Backspace` / `Delete` key | No on-screen delete for a node or edge outside the context menu |
| Duplicate, export, save, highlight connections... | Keyboard shortcuts (`S`, `E`, `D`, `A`, `Shift+L`, `/`) | Some have header buttons, some have only a shortcut or the context menu |

### Degraded (works, badly)

- **Ports:** 9px dots, revealed on hover or selection (`globals.css`
  `.react-flow__handle`). The `::after` hit area is generous, but there's no
  hover on touch, so they only appear once the card is selected.
- **Placing a component:** a ghost follows `mousemove`. On touch there's no
  ghost, though a tap probably still places it.
- **Resizing:** `SidebarShell` and `DocsPanel` resize on `onMouseDown`
  (`use-resizable-width`), not pointer events. Zone `NodeResizer` handles
  are tiny.
- **Tooltips:** hover-only. Every header control is icon-only and relies on
  them for its meaning.
- **Header:** `AppHeader.tsx` crams ~15 controls into one non-wrapping row.
  It's already tight at 1024px and won't fit in iPad portrait (768-834px).
- **Columns:** sidebar (220-480px) + canvas + docs panel (320-720px) are side
  by side. At 768px, sidebar plus docs leaves almost no canvas.
- **Popovers:** `ValidationIndicator` (`w-96`), `EdgeInspector` (`w-72`
  absolute), `NodeConfigPopover`. These are desktop popovers anchored to the
  cursor, and the on-screen keyboard will cover config inputs.

## Target devices

| Device | Portrait | Landscape |
|---|---|---|
| iPad mini / 10th gen | 744-820 x 1133-1180 | 1133-1180 x 744-820 |
| iPad Air 11" / Pro 11" | 820-834 | 1180-1194 |
| iPad Pro 13" | 1024 | 1366 |
| Android tablets | ~800 | ~1280 |

So the editor has to work at **768px wide** in portrait, and at a **short
height** (~744px) in landscape with the on-screen keyboard up.

## Proposed design (for discussion)

Two independent axes, not one breakpoint:

- **Width decides layout.** Below `xl` (1280) the editor uses the compact
  shell. At `xl` and up it keeps today's three-column layout.
- **Pointer decides gestures.** `(any-pointer: coarse)` turns on touch
  gestures and larger hit targets. An iPad with a trackpad, or a touchscreen
  laptop, gets both.

### Compact shell (below 1280px)

```
+------------------------------------------------------------+
| < Lesson  Ch 4: Caching   [undo][redo] [Validate] [Submit] [...] |  slim top bar
+------------------------------------------------------------+
|[Brief]                                                [Docs]|  edge tabs open
|                                                            |  overlay sheets
|                        canvas                              |
|                                                            |
|        +------------------------------------+              |
|        | [+ Add] [Zone] [Note] [Flag] | [Select] [Fit] |   |  floating dock
|        +------------------------------------+              |
+------------------------------------------------------------+
```

1. **Slim top bar.** Back to lesson, chapter title, Undo/Redo, Validate,
   Submit, Deep Check. Everything else (Save, Project, Board, Reset, Docs,
   Shortcuts, Theme, Report Bug, account) moves into one `...` overflow menu.
   The cloud-sync state shrinks to a dot.
2. **Brief (QuestionPane) becomes an overlay sheet** from the left, opened
   from an edge tab, instead of a push column. It stays open by default in
   landscape and closed by default in portrait. Reuse `MobileDrawer`'s
   pattern.
3. **Docs becomes an overlay sheet** from the right, so the canvas never
   loses width to it.
4. **Floating canvas dock** (new): Add component, Zone, Comment, Flag, a
   Select/Pan mode toggle, Fit view. This is the visible entry point that's
   missing today.
5. **Selection toolbar** (new, xyflow `NodeToolbar`): tapping a node shows
   Configure, Connect, Duplicate, Delete, More (highlight connections, zone
   actions). An edge gets Inspect and Delete. This replaces right-click and
   double-click as the primary route; both still work on desktop.
6. **Bottom sheets instead of cursor popovers** for node config, edge
   inspector and validation results in the compact shell. Inputs scroll
   above the on-screen keyboard (`visualViewport`).

### Touch gestures (coarse pointer)

| Gesture | Does |
|---|---|
| One-finger drag on empty canvas | Pan (box select moves behind the dock's Select toggle) |
| Pinch | Zoom (xyflow `zoomOnPinch`; verify it isn't swallowed by `panOnScroll`) |
| Tap node / edge | Select + selection toolbar |
| Drag node | Move |
| Long-press node / edge / canvas | Same `ContextMenu`, opened at the finger |
| Drag from a port | Connect (ports always visible on the selected node, ~24px visual / 44px hit) |
| Toolbar **Connect**, then tap a target node | Connect without hitting a port. Sides chosen by `edge-routing.ts` |
| Tap a picker item | Place at the centre of the visible canvas, selected, ready to drag (no ghost needed) |

Also: `touch-action: none` on the canvas so the page doesn't rubber-band or
pinch-zoom, a pointer-events rewrite of `use-resizable-width`, and on-screen
equivalents for every shortcut, so a keyboard is never required.

### Gate changes

- One minimum width of **768px** for both pointer types (today fine pointers
  need 1024). This makes a narrow desktop window use the compact shell
  instead of the block screen.
- Add a **minimum height** (~600px). Large phones in landscape (e.g.
  932x430) pass a width-only check and must not.
- `YourTurnCard` on a blocked device explains why instead of linking into
  the block screen.
- `src/lib/use-large-screen.ts` changes (unlike 7.1.0's D2).

### Scope

- **In:** chapter workspaces (both modes) and Sandbox. They share `Canvas`
  and the shell.
- **Out:** `(protected)/dev/*` labs.
- **Must survive:** the guided tour (`src/tour/`). Its anchors move in the
  compact shell, so every tour step needs re-checking at tablet width.

## Phasing (as built)

1. **Desktop-safe parity:** dock, selection toolbar, on-screen delete and
   duplicate. Useful at every width, low risk, and it fixes the desktop
   discoverability gap.
2. **Touch gestures:** pan/select model, long-press, larger ports,
   tap-to-connect, centre placement, pointer-event resize.
3. **Compact shell:** slim header + overflow menu, Brief and Docs sheets,
   bottom-sheet popovers.
4. **Gate + entry points:** thresholds, min height, `YourTurnCard`, tour pass.
5. **Verification:** Playwright `devices["iPad (gen 7)"]` /
   `["iPad Pro 11"]` projects with `hasTouch` on a small new spec, plus
   real-device checks.

## Open questions

- **Q1.** Should the dock and selection toolbar also show on desktop (one
  design everywhere), or only in the compact shell? *Recommendation: show
  them everywhere.*
- **Q2.** Support iPad portrait (768-834px) fully, or require landscape?
  *Recommendation: support both. Portrait uses closed-by-default sheets.*
- **Q3.** Default for one-finger drag on empty canvas: pan, or box select?
  *Recommendation: pan.*
- **Q4.** Is 1280px the right line for the compact shell, or should desktop
  users at 1024-1279px keep today's layout? *Recommendation: 1280.*
- **Q5.** Is there a real tablet (iPad / Android) available for acceptance
  testing, or is emulation all we have?
- **Q6.** Header layout changes at 1280px+ too, or desktop header untouched
  this release?
