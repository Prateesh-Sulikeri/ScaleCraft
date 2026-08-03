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

## Implementation Tasks

- [ ] Canvas pan (Space + drag, middle mouse)
- [ ] Canvas scroll (wheel, Shift+wheel)
- [ ] Canvas zoom (Ctrl+wheel, Ctrl +/-, Ctrl+0)
- [ ] Trackpad gestures (pinch, two-finger drag)
- [ ] Zoom to fit / zoom to selection
- [ ] Selection marquee
- [ ] Interaction priority handling
- [ ] Animation/smoothing
- [ ] Test all behaviors
