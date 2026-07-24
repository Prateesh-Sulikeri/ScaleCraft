"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Home, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useResizableWidth } from "@/lib/use-resizable-width";

const COLLAPSED_WIDTH = 40;

type SidebarShellProps = {
  children: ReactNode;
};

/**
 * Generic collapsible + resizable left `<aside>` chrome — Home link,
 * collapse toggle, 220-480px drag-resize, width transition — extracted
 * verbatim (behavior-wise) from the pre-Component-Picker QuestionPanel
 * (see git history at a2c4846~1) so chapter mode's ChapterSidebar can reuse
 * it. Content-agnostic: takes `children` instead of baking in Sandbox's old
 * intro text + Palette.
 */
export function SidebarShell({ children }: SidebarShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { width, onMouseDown } = useResizableWidth(320, 220, 480, "right");

  return (
    <div className="flex shrink-0">
      <aside
        style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
        className="flex shrink-0 flex-col overflow-hidden border-r border-border transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      >
        <div
          className={`flex shrink-0 items-center px-3 pt-3 ${
            collapsed ? "flex-col gap-3" : "justify-between"
          }`}
        >
          <Link
            href="/"
            aria-label="Back to Home"
            className="text-foreground/60 hover:text-foreground"
          >
            <Home size={collapsed ? 16 : 14} />
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="text-foreground/60 hover:text-foreground"
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
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
        />
      )}
    </div>
  );
}
