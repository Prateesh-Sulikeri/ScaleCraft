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
) {
  const [width, setWidth] = useState(defaultWidth);
  const dragRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const onMouseDown = (event: React.MouseEvent) => {
    event.preventDefault();
    dragRef.current = { startX: event.clientX, startWidth: width };
    const prevCursor = document.body.style.cursor;
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = moveEvent.clientX - dragRef.current.startX;
      const signedDelta = grows === "right" ? delta : -delta;
      setWidth(Math.min(max, Math.max(min, dragRef.current.startWidth + signedDelta)));
    };

    const onMouseUp = () => {
      dragRef.current = null;
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return { width, onMouseDown };
}
