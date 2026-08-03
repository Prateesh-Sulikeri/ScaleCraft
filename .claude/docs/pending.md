# Release 3.3.0 - Canvas Navigation Specification

Canvas navigation overhaul: implement infinite canvas panning/zooming, keyboard shortcuts, trackpad gestures, and selection behavior. The specification below defines the exact interaction model and priorities.

---

## Mouse Navigation

| Action | Shortcut | Notes |
|---------|----------|-------|
| Pan | **Space + Left Mouse Drag** | Primary canvas navigation |
| Pan | **Middle Mouse Drag** | Alternative navigation |
| Vertical Scroll | **Mouse Wheel** | Scroll canvas vertically |
| Horizontal Scroll | **Shift + Mouse Wheel** | Scroll canvas horizontally |
| Zoom | **Ctrl + Mouse Wheel** | Zoom towards mouse cursor |
| Zoom In | **Ctrl + +** | Keyboard shortcut |
| Zoom Out | **Ctrl + -** | Keyboard shortcut |
| Reset Zoom | **Ctrl + 0** | Reset to 100% |
| Zoom to Fit | **Shift + 1** | Fit all content in viewport |
| Zoom to Selection | **Shift + 2** | Fit selected nodes |

---

## Trackpad Navigation

| Gesture | Action |
|----------|--------|
| Two-finger Drag | Pan canvas |
| Pinch | Zoom |
| Shift + Two-finger Drag | Horizontal pan (optional) |

---

## Zoom Behavior

- Zoom is centered around the mouse cursor.
- Smooth animated zoom.
- Preserve cursor position while zooming.
- Preserve pan position during zoom.
- Infinite canvas.

---

## Selection Behavior

| Action | Result |
|---------|--------|
| Click empty canvas | Clear selection |
| Drag empty canvas | Marquee selection |
| Hold Space | Pan instead of selecting |
| Ctrl + Mouse Wheel | Zoom regardless of current tool |

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl + + | Zoom In |
| Ctrl + - | Zoom Out |
| Ctrl + 0 | Reset Zoom (100%) |
| Shift + 1 | Zoom to Fit |
| Shift + 2 | Zoom to Selection |

---

## Interaction Priority

1. Hold **Space** -> Pan
2. Middle Mouse Drag -> Pan
3. Mouse Wheel -> Vertical Scroll
4. Shift + Mouse Wheel -> Horizontal Scroll
5. Ctrl + Mouse Wheel -> Zoom
6. Trackpad Pinch -> Zoom
7. Two-finger Drag -> Pan

---

## Design Principles

- Infinite canvas.
- Cursor-centered zoom.
- Smooth panning and zooming.
- No visible scrollbars.
- Navigation should feel identical to modern infinite-canvas tools such as Figma, FigJam, Miro, and tldraw.

---

## Implementation Tasks (Phase 1)

- [x] Canvas pan (Space + drag, middle mouse) - xyflow panActivationKeyCode + panOnDrag={[1]}
- [x] Canvas scroll (wheel, Shift+wheel) - `panOnScroll` (fixed, see below)
- [x] Canvas zoom (Ctrl+wheel, Ctrl +/-, Ctrl+0) - `zoomActivationKeyCode` + zoomIn/zoomOut/zoomTo (fixed, see below)
- [x] Trackpad gestures (pinch, two-finger drag) - native xyflow zoomOnPinch, no custom code needed
- [x] Zoom to fit / zoom to selection (Shift+1, Shift+2) - fitView() with proper bounds
- [x] Selection marquee - xyflow selectionOnDrag={!isConnecting}
- [x] Interaction priority handling - order verified in pending.md spec
- [x] Animation/smoothing - 200-300ms duration on all viewport changes
- [x] Test zoom keyboard shortcuts - Canvas.test.tsx "zoom keyboard shortcuts" (asserts actual transform, not just no-crash)
- [ ] Manual browser pass (pan/scroll/pinch feel) - not yet done

---

## Fixed: first pass (Haiku) shipped a broken implementation (2026-08-03)

The first pass checked every box above as done, and typecheck/lint/test/build
all passed — but the actual navigation behavior didn't match the spec. Passing
CI was never proof the feature worked; nothing in that pass exercised the
canvas in a browser or asserted on the resulting zoom/pan state. Concretely:

1. **No `panOnScroll` was ever set.** xyflow's default (`zoomOnScroll: true`,
   `panOnScroll: false`) makes *every* plain wheel tick zoom the canvas —
   the opposite of the spec's "wheel scrolls, Ctrl+wheel zooms". The
   implementation notes claimed "Regular wheel = pan vertically (handled by
   ReactFlow default)" - false; that's not xyflow's default, and nothing set
   it. **Fix:** added `panOnScroll` + `zoomActivationKeyCode="Control"` on
   `<ReactFlow>` - xyflow's own pan-on-scroll handler already special-cases
   Shift+wheel as horizontal pan (no extra code) and Ctrl+wheel/pinch as zoom
   (also no extra code).

2. **Zoom wasn't centered on anything - it drifted toward the flow origin.**
   Both the Ctrl+/- keyboard handler and the custom wheel-pinch handler did
   `setViewport({ x: viewport.x, y: viewport.y, zoom: newZoom })` - holding
   x/y fixed while changing zoom moves the *flow-space (0,0) point*, not the
   cursor or viewport center, toward the screen origin. Directly violates the
   "Zoom is centered around the mouse cursor" / "Preserve cursor position"
   spec lines. **Fix:** replaced with xyflow's own `zoomIn`/`zoomOut`/`zoomTo`
   helpers (`useReactFlow()`), which wrap `panZoom.scaleBy`/`scaleTo` -
   center-anchored and already used/tested by the library itself, so no
   hand-rolled anchor math is needed.

3. **A redundant custom wheel handler double-fired zoom on Ctrl+wheel /
   trackpad pinch.** Since xyflow's default already treats Ctrl+wheel as zoom
   (regardless of the missing `panOnScroll`), the added `handleWheel` listener
   on the wrapper div computed and applied a *second*, uncentered zoom change
   on top of xyflow's own - compounding into visibly janky, exaggerated zoom
   speed. **Fix:** removed entirely; `panOnScroll` + `zoomActivationKeyCode`
   +  the default `zoomOnPinch` cover wheel-zoom, trackpad pinch, and
   Ctrl+wheel in one place, correctly, with no custom listener.

4. **No `maxZoom` on `<ReactFlow>`.** The custom zoom code clamped to
   `[0.25, 4]` in JS, but xyflow's own zoom instance (which actually owns the
   scale) still had its default `scaleExtent` of `[minZoom, 2]` since only
   `minZoom={0.25}` was set - the two clamps didn't agree. **Fix:** added
   `maxZoom={4}` on `<ReactFlow>` so there's one source of truth.

See commit history on `feature/canvas-pan-zoom` for the corrected diff.

---

## Implementation Notes (Phase 1, corrected)

- Zoom limits: 0.25x (min) to 4x (max), enforced by `<ReactFlow minZoom
  maxZoom>` - the single source of truth (no duplicate clamps in handlers).
- Ctrl+/-/0 use `zoomIn`/`zoomOut`/`zoomTo` from `useReactFlow()` - anchored
  by xyflow itself, not a manual `setViewport`.
- Wheel/trackpad behavior comes from `panOnScroll` + `zoomActivationKeyCode=
  "Control"` on `<ReactFlow>`, not a custom wheel listener - Shift+wheel
  horizontal pan and Ctrl+wheel/pinch zoom are both handled by xyflow's own
  pan-on-scroll code path.
- Space-bar pan works on nodes too (spaceHeld disables nodesDraggable).
- Middle-mouse pan alternative to Space+drag (`panOnDrag={[1]}`).
- Selection marquee on empty canvas drag (selectionOnDrag).
- Shift+1/Shift+2 use `event.code` (`Digit1`/`Digit2`), not `event.key`, for
  cross-keyboard-layout compatibility.
