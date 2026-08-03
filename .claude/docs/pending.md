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
- [x] Canvas scroll (wheel, Shift+wheel) - xyflow default wheel handling
- [x] Canvas zoom (Ctrl+wheel, Ctrl +/-, Ctrl+0) - keyboard shortcuts + trackpad support
- [x] Trackpad gestures (pinch, two-finger drag) - pinch via wheel+Ctrl, pan via pointer events
- [x] Zoom to fit / zoom to selection (Shift+1, Shift+2) - fitView() with proper bounds
- [x] Selection marquee - xyflow selectionOnDrag={!isConnecting}
- [x] Interaction priority handling - order verified in pending.md spec
- [x] Animation/smoothing - 200-300ms duration on all viewport changes
- [ ] Test all behaviors - manual browser testing needed

---

## Implementation Notes (Phase 1)

- Zoom limits: 0.25x (min) to 4x (max) to prevent viewport loss
- Smooth animations on all zoom/pan operations (200-300ms duration)
- Keyboard shortcuts use event.code for cross-layout compatibility
- Trackpad pinch support via Ctrl+wheel with preventDefault
- Space-bar pan works on nodes too (spaceHeld disables nodesDraggable)
- Middle-mouse pan alternative to Space+drag
- Zoom center stays at cursor position (xyflow default)
- Infinite canvas enabled (no viewport bounds)
- Selection marquee on empty canvas drag (selectionOnDrag)
- Ctrl+wheel also works as keyboard shortcut (handled separately)
