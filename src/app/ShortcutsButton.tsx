"use client";

import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Keyboard } from "lucide-react";

// Same portaled hover-tooltip convention as Palette.tsx's ToolbarButton
// (icon-only header buttons get a styled tooltip, not the plain native
// `title` attribute — see that component's own doc comment for why).
const TOOLTIP_WIDTH = 160;

const SHORTCUTS: { keys: string; label: string }[] = [
  { keys: "Ctrl/Cmd+S", label: "Save" },
  { keys: "Ctrl/Cmd+Z", label: "Undo" },
  { keys: "Ctrl/Cmd+Shift+Z", label: "Redo" },
  { keys: "Ctrl/Cmd+E", label: "Export JSON" },
  { keys: "Delete / Backspace", label: "Delete selection" },
  { keys: "Esc", label: "Cancel placement / close popovers" },
];

/**
 * A single, discoverable place for every keyboard shortcut (see
 * use-canvas-shortcuts.ts) — top-right of the header, alongside the other
 * icon-only controls (ThemeToggle), rather than scattering shortcut hints
 * across each button's own title attribute with no single place to see them
 * all at once. Uses the same dropdown-plus-backdrop convention as
 * ExportMenu/BoardMenu (a short reference list, not long-form docs, so
 * DocsModal's draggable window would be overkill here).
 */
export function ShortcutsButton() {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = () => {
    if (open) return; // the dropdown itself is already the explanation
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const margin = 8;
    const left = Math.min(
      Math.max(center, TOOLTIP_WIDTH / 2 + margin),
      window.innerWidth - TOOLTIP_WIDTH / 2 - margin,
    );
    setTooltipPos({ top: rect.bottom + 6, left });
  };

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={() => {
          setOpen((o) => !o);
          setTooltipPos(null);
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipPos(null)}
        aria-label="Keyboard shortcuts"
        className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 hover:text-foreground"
      >
        <Keyboard size={16} />
      </button>

      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-border bg-panel px-2.5 py-1.5 shadow-lg"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-xs font-semibold text-foreground">Keyboard shortcuts</div>
          </div>,
          document.body,
        )}

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          {/* right-0, not left-0 — this button now sits at the far right of
           * the header, so a left-anchored panel would overflow off-screen. */}
          <div className="absolute right-0 top-full z-30 mt-2 w-60 rounded-md border border-border bg-panel p-1 shadow-lg">
            <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
              Keyboard shortcuts
            </p>
            {SHORTCUTS.map((s) => (
              <div key={s.label} className="flex items-center justify-between gap-3 px-2 py-1">
                <span className="text-sm text-foreground/80">{s.label}</span>
                <kbd className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground/70">
                  {s.keys}
                </kbd>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
