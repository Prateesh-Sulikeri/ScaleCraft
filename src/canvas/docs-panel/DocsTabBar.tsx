"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useCanvasStore } from "../store";
import { getComponent } from "@/content/components/registry";
import { Tooltip } from "@/app/Tooltip";

/**
 * VS Code-style tab strip. Each tab only needs its own Close (`×`) — Close
 * All lives once, at the strip's end, rather than as a per-tab overflow
 * menu: with the `×` already covering "close this one," the only other
 * action worth surfacing is bulk close, and one button for that beats a
 * `⋯` menu duplicating Close per tab for marginal gain (Close Others is the
 * spec's own "optional future enhancement" — skipped here as not worth the
 * extra menu).
 */
export function DocsTabBar() {
  const tabs = useCanvasStore((s) => s.docsPanel.tabs);
  const activeTabId = useCanvasStore((s) => s.docsPanel.activeTabId);
  const setActiveDocTab = useCanvasStore((s) => s.setActiveDocTab);
  const closeDocTab = useCanvasStore((s) => s.closeDocTab);
  const closeAllDocTabs = useCanvasStore((s) => s.closeAllDocTabs);
  const tabRefs = useRef(new Map<string, HTMLDivElement>());

  // Keeps the active tab visible when it's not the one a click/open just
  // happened on — e.g. opening a doc from a node scrolls the strip so the
  // newly-active tab is never left off-screen while an older, inactive tab
  // stays visible in a narrow panel (the strip itself has no other way to
  // reveal it, since overflow-x-auto doesn't auto-follow state changes).
  useEffect(() => {
    if (!activeTabId) return;
    tabRefs.current.get(activeTabId)?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [activeTabId]);

  if (tabs.length === 0) return null;

  return (
    <div className="flex shrink-0 items-stretch overflow-x-auto border-b border-border">
      {tabs.map((tab) => {
        const definition = getComponent(tab.componentId);
        const active = tab.componentId === activeTabId;
        return (
          <div
            key={tab.componentId}
            ref={(el) => {
              if (el) tabRefs.current.set(tab.componentId, el);
              else tabRefs.current.delete(tab.componentId);
            }}
            className={`flex shrink-0 items-center gap-1.5 border-r border-border px-3 py-2 text-sm ${
              active ? "bg-background text-foreground" : "text-foreground/60 hover:bg-border/40"
            }`}
          >
            <Tooltip label={definition?.label ?? tab.componentId}>
              <button onClick={() => setActiveDocTab(tab.componentId)} className="max-w-[140px] truncate">
                {definition?.label ?? tab.componentId}
              </button>
            </Tooltip>
            <Tooltip label="Close tab">
              <button
                onClick={() => closeDocTab(tab.componentId)}
                aria-label={`Close ${definition?.label ?? tab.componentId} tab`}
                className="rounded p-0.5 text-foreground/40 hover:bg-border hover:text-foreground"
              >
                <X size={12} />
              </button>
            </Tooltip>
          </div>
        );
      })}

      {tabs.length > 1 && (
        <Tooltip label="Close all documentation tabs">
          <button
            onClick={closeAllDocTabs}
            className="ml-auto shrink-0 px-3 py-2 text-xs text-foreground/50 hover:text-foreground"
          >
            Close all
          </button>
        </Tooltip>
      )}
    </div>
  );
}
