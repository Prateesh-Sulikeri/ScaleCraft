"use client";

import { BookOpen, Maximize2, Minus } from "lucide-react";
import { useCanvasStore } from "../store";
import { useResizableWidth } from "@/lib/use-resizable-width";
import { Tooltip } from "@/app/Tooltip";
import { DocsTabBar } from "./DocsTabBar";
import { DocsTabContent } from "./DocsTabContent";

/**
 * Docked documentation panel — a flex sibling of the canvas normally, but
 * an `absolute inset-0` overlay on top of it in focus mode (never a flex-1
 * sibling that displaces Canvas — that used to unmount/resize the ReactFlow
 * instance and left it fit to a stale container size on exit).
 */
export function DocsPanel() {
  const tabs = useCanvasStore((s) => s.docsPanel.tabs);
  const activeTabId = useCanvasStore((s) => s.docsPanel.activeTabId);
  const storedWidth = useCanvasStore((s) => s.docsPanel.width);
  const setDocsPanelWidth = useCanvasStore((s) => s.setDocsPanelWidth);
  const setDocsPanelMinimized = useCanvasStore((s) => s.setDocsPanelMinimized);
  const toggleFocusMode = useCanvasStore((s) => s.toggleFocusMode);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);

  const { width, onMouseDown } = useResizableWidth(storedWidth, 320, 720, "left", setDocsPanelWidth);

  return (
    <div
      className={
        focusMode ? "absolute inset-0 z-[var(--z-modal)] flex bg-background" : "flex min-w-0 shrink-0"
      }
    >
      {!focusMode && (
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
        />
      )}
      <aside
        style={{ width: focusMode ? "100%" : width }}
        className={`flex min-w-0 flex-1 shrink-0 flex-col overflow-hidden bg-background ${
          focusMode
            ? ""
            : "border-l border-border transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
        }`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-foreground/60">
            <BookOpen size={13} />
            Documentation
          </span>
          {!focusMode && (
            <div className="flex items-center gap-1">
              <Tooltip label="Focus mode">
                <button
                  onClick={toggleFocusMode}
                  aria-label="Enter focus notes mode"
                  className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground"
                >
                  <Maximize2 size={14} />
                </button>
              </Tooltip>
              <Tooltip label="Minimize">
                <button
                  onClick={() => setDocsPanelMinimized(true)}
                  aria-label="Minimize documentation panel"
                  className="rounded p-1 text-foreground/50 hover:bg-border hover:text-foreground"
                >
                  <Minus size={14} />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        <DocsTabBar />

        {tabs.length === 0 || !activeTabId ? (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-foreground/50">
            No documentation open - right-click a component and choose &quot;Open Documentation&quot;.
          </div>
        ) : (
          <DocsTabContent key={activeTabId} componentId={activeTabId} />
        )}
      </aside>
    </div>
  );
}
