"use client";

import { cloneElement, isValidElement, useRef, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";

/**
 * Hover tooltip matching PaletteItem's visual language (Palette.tsx) rather
 * than the browser's native `title` styling — used anywhere a small icon
 * button needs a label (docs panel controls, tab strip). Portaled to
 * document.body and positioned via a measured rect rather than a plain
 * absolute/group-hover child, for the same reason as PaletteItem's own
 * tooltip: a scrollable ancestor (e.g. DocsTabBar's tab strip) couples
 * overflow-x to overflow-y once either is non-visible, so an in-flow
 * tooltip risks being clipped or forcing a scrollbar instead of showing.
 */
export function Tooltip({ label, children }: { label: string; children: ReactElement }) {
  const anchorRef = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = anchorRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const margin = 8;
    // Clamp to keep tooltip fully within viewport while centered on button
    const left = Math.min(Math.max(center, 80 + margin), window.innerWidth - 80 - margin);
    setPos({ top: rect.bottom + 6, left });
  };
  const hide = () => setPos(null);

  if (!isValidElement(children)) return children;

  return (
    <>
      {cloneElement(children as ReactElement<Record<string, unknown>>, {
        ref: anchorRef,
        onMouseEnter: show,
        onMouseLeave: hide,
      })}
      {pos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-panel px-2.5 py-1 text-xs text-foreground shadow-lg"
            style={{ top: pos.top, left: pos.left }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
}
