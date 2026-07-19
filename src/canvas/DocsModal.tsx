"use client";

import { useRef, useState } from "react";
import { Maximize2, Minus, X } from "lucide-react";

type DocsModalProps = {
  title: string;
  docs: string;
  /** Which slot in the open-windows list this is — used only to cascade
   * each new window's default position so they don't stack exactly on top
   * of each other. */
  index: number;
  minimized: boolean;
  onMinimizedChange: (minimized: boolean) => void;
  onClose: () => void;
};

const DEFAULT_WIDTH = 420;
const DEFAULT_HEIGHT = 340;
const CASCADE_STEP = 28;
const MIN_WIDTH = 300;
const MAX_WIDTH = 640;
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 640;
const DRAG_THRESHOLD = 4;

function defaultPosition(index: number) {
  const baseX = typeof window !== "undefined" ? Math.max(24, window.innerWidth / 2 - DEFAULT_WIDTH / 2) : 200;
  return { x: baseX + index * CASCADE_STEP, y: 96 + index * CASCADE_STEP };
}

/**
 * A small, moveable floating window rather than a full-screen backdrop
 * modal — no darkened overlay, whatever's behind it stays fully
 * interactive. Generic over title/docs; its only current caller is
 * AboutButton.tsx (Home's static About dialog) — the canvas's own
 * component documentation now lives in the docked docs-panel (see
 * docs-panel/DocsPanel.tsx), not this component. Position and size are
 * local state, not stored — they change continuously during drag/resize,
 * and only `minimized` (which toggles rarely) needs to survive being read
 * from outside this component.
 */
export function DocsModal({ title, docs, index, minimized, onMinimizedChange, onClose }: DocsModalProps) {
  const [pos, setPos] = useState(() => defaultPosition(index));
  const [size, setSize] = useState({ width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT });
  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const didDragRef = useRef(false);
  const resizeRef = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);

  // Shared by both the full window's title bar and the minimized capsule —
  // dragging either one repositions the same (x, y). A restore-from-click
  // on the capsule is handled separately in its own onClick, gated on
  // didDragRef so a drag-release doesn't also fire it (see the capsule
  // button below). The guard below specifically targets the minimize/close
  // buttons nested *inside* the title bar (tagged data-window-control) —
  // not a bare `button` check, since the capsule itself is a <button> and
  // would always self-match that, silently no-op'ing every capsule drag.
  const startDrag = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest("[data-window-control]")) return;
    didDragRef.current = false;
    dragRef.current = { startX: event.clientX, startY: event.clientY, origX: pos.x, origY: pos.y };

    const onMove = (moveEvent: MouseEvent) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dx = moveEvent.clientX - drag.startX;
      const dy = moveEvent.clientY - drag.startY;
      if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) didDragRef.current = true;
      setPos({ x: drag.origX + dx, y: drag.origY + dy });
    };
    const onUp = () => {
      dragRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const startResize = (event: React.MouseEvent) => {
    event.stopPropagation();
    resizeRef.current = { startX: event.clientX, startY: event.clientY, startW: size.width, startH: size.height };

    const onMove = (moveEvent: MouseEvent) => {
      const resize = resizeRef.current;
      if (!resize) return;
      setSize({
        width: Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, resize.startW + (moveEvent.clientX - resize.startX))),
        height: Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, resize.startH + (moveEvent.clientY - resize.startY))),
      });
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (minimized) {
    return (
      <button
        onMouseDown={startDrag}
        onClick={() => {
          if (!didDragRef.current) onMinimizedChange(false);
        }}
        style={{ left: pos.x, top: pos.y }}
        className="fixed z-[var(--z-modal)] flex cursor-move items-center gap-2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs font-medium shadow-lg hover:bg-border"
      >
        <Maximize2 size={12} />
        {title}
      </button>
    );
  }

  return (
    <div
      style={{ left: pos.x, top: pos.y, width: size.width, height: size.height }}
      className="fixed z-[var(--z-modal)] flex flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-xl"
    >
      <div
        onMouseDown={startDrag}
        className="flex shrink-0 cursor-move items-center justify-between border-b border-border px-3 py-2"
      >
        <h2 className="truncate text-sm font-semibold">{title}</h2>
        <div className="flex shrink-0 items-center gap-1">
          <button
            data-window-control
            onClick={() => onMinimizedChange(true)}
            aria-label="Minimize docs"
            className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground"
          >
            <Minus size={14} />
          </button>
          <button
            data-window-control
            onClick={onClose}
            aria-label="Close docs"
            className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-base leading-7 text-foreground/80">{docs}</p>
      </div>
      <div
        onMouseDown={startResize}
        aria-label="Resize docs window"
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize"
        style={{ background: "linear-gradient(135deg, transparent 50%, var(--border) 50%)" }}
      />
    </div>
  );
}
