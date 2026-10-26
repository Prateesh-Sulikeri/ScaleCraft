"use client";

import { useRef, useState } from "react";

/**
 * Self-contained drag-to-resize width for a side panel — each panel owns
 * its own width, no lifting state up to a shared layout parent. `grows`
 * says which direction dragging the handle should widen the panel: "right"
 * for a panel anchored to the left edge of the screen (handle sits on its
 * right, dragging right grows it), "left" for one anchored to the right
 * edge (handle on its left, dragging left grows it).
 */
export function useResizableWidth(
  defaultWidth: number,
  min: number,
  max: number,
  grows: "left" | "right",
  /** Fired once, on pointerup, with the final width — for a caller that wants
   * to persist the committed width somewhere external (e.g. the docs
   * panel's width in the Zustand store, so it survives minimize/restore)
   * without routing every drag pixel through that store. */
  onCommit?: (width: number) => void,
) {
  const [width, setWidth] = useState(defaultWidth);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);
  const latestWidthRef = useRef(width);

  const onPointerDown = (event: React.PointerEvent) => {
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startWidth: width };
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onPointerMove = (moveEvent: PointerEvent) => {
      if (!dragRef.current) return;
      const delta = moveEvent.clientX - dragRef.current.startX;
      const signedDelta = grows === "right" ? delta : -delta;
      const next = Math.min(max, Math.max(min, dragRef.current.startWidth + signedDelta));
      latestWidthRef.current = next;
      setWidth(next);
    };

    const onPointerUp = () => {
      dragRef.current = null;
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      onCommit?.(latestWidthRef.current);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
  };

  return { width, onPointerDown };
}
