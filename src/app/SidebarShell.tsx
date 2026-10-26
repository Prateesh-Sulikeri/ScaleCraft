"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Home, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useResizableWidth } from "@/lib/use-resizable-width";
import { useViewportWidth } from "@/lib/use-large-screen";

const COLLAPSED_WIDTH = 40;
/** Below this the canvas can't spare a push column (iPad portrait): the
 * sidebar starts collapsed to its rail and opens as an overlay instead. */
const OVERLAY_BELOW = 1024;

type SidebarShellProps = {
  children: ReactNode;
};

/**
 * Generic collapsible + resizable left `<aside>` chrome — Home link,
 * collapse toggle, 220-480px drag-resize, the same width-transition +
 * opacity-fade pattern the old QuestionPanel established. Content-agnostic:
 * takes `children` instead of baking in Sandbox's old intro text + Palette.
 */
export function SidebarShell({ children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { width, onPointerDown } = useResizableWidth(320, 220, 480, "right");
  const overlay = useViewportWidth() < OVERLAY_BELOW;

  // Collapse on entering overlay width (first load in portrait, or a
  // rotation), so the canvas is what a narrow screen opens on. Adjusted
  // during render, React's pattern for state that follows a changed value.
  const [prevOverlay, setPrevOverlay] = useState(overlay);
  if (overlay !== prevOverlay) {
    setPrevOverlay(overlay);
    if (overlay) setCollapsed(true);
  }

  const floating = overlay && !collapsed;

  return (
    // In overlay mode the rail's width stays in flow so the canvas never
    // shifts when the panel opens over it.
    <div className="flex shrink-0" style={overlay ? { width: COLLAPSED_WIDTH } : undefined}>
      {floating && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-[var(--z-modal-backdrop)] bg-background/40"
          onClick={() => setCollapsed(true)}
        />
      )}
      <aside
        style={{ width: collapsed ? COLLAPSED_WIDTH : floating ? `min(${width}px, 85vw)` : width }}
        className={`flex shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
          floating ? "absolute inset-y-0 left-0 z-[var(--z-modal-backdrop)] bg-background shadow-lg" : ""
        }`}
      >
        <div
          className={`flex shrink-0 items-center px-3 pt-3 pb-3 touch:px-1.5 touch:py-1.5 ${
            collapsed ? "flex-col gap-3 touch:gap-1" : "justify-between"
          }`}
        >
          <Link
            href="/"
            aria-label="Back to Home"
            className="text-foreground/60 hover:text-foreground touch:p-2"
          >
            <Home size={collapsed ? 16 : 14} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            className="text-foreground/60 hover:text-foreground touch:p-2"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={14} />}
          </button>
        </div>

        <div
          className={`flex min-h-0 flex-1 flex-col transition-opacity duration-150 motion-reduce:transition-none ${
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {children}
        </div>
      </aside>
      {!collapsed && !floating && (
        <div
          onPointerDown={onPointerDown}
          className="w-1 touch:w-3 shrink-0 cursor-col-resize touch-none bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
        />
      )}
    </div>
  );
}
