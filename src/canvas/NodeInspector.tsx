"use client";

import { useState } from "react";
import { FileText, PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { ConfigForm } from "./ConfigForm";
import { useResizableWidth } from "@/lib/use-resizable-width";

/**
 * The right panel — see .claude/docs/MILESTONES.md milestone 2. Config (a
 * form derived from the component's configSchema) is its only body — Docs
 * opens as an independent floating window (see DocsWindows.tsx), not tied
 * to this panel or to node selection at all, so collapsing this sidebar or
 * deselecting a node no longer hides or closes a docs window someone left
 * open. "View docs" here just calls the same store action the right-click
 * context-menu shortcut uses.
 */
export function NodeInspector() {
  const [collapsed, setCollapsed] = useState(false);
  const { width, onMouseDown } = useResizableWidth(384, 280, 560, "left");
  const openDocsWindow = useCanvasStore((s) => s.openDocsWindow);
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeConfig = useCanvasStore((s) => s.updateNodeConfig);
  const updateNodeName = useCanvasStore((s) => s.updateNodeName);

  const selected = nodes.find((n) => n.id === selectedNodeId);
  // Zones aren't ComponentDefinitions (see types.ts) — no config/docs to
  // show for one, so it falls through to the same empty state as nothing
  // selected.
  const node = selected?.type === "component" ? selected : undefined;
  const definition = node ? getComponent(node.data.componentId) : undefined;

  const COLLAPSED_WIDTH = 40;

  return (
    <div className="flex shrink-0">
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
        />
      )}
      <aside
        style={{ width: collapsed ? COLLAPSED_WIDTH : width }}
        className="flex shrink-0 flex-col overflow-hidden border-l border-border transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
      >
        <div
          className={`flex shrink-0 items-center py-3 ${collapsed ? "justify-center" : "justify-end px-3"}`}
        >
          <button
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? "Expand inspector panel" : "Collapse inspector panel"}
            className="text-foreground/60 hover:text-foreground"
          >
            {collapsed ? <PanelRightOpen size={16} /> : <PanelRightClose size={14} />}
          </button>
        </div>

        <div
          className={`min-h-0 flex-1 overflow-y-auto px-4 pb-4 transition-opacity duration-150 motion-reduce:transition-none ${
            collapsed ? "pointer-events-none opacity-0" : "opacity-100"
          }`}
        >
          {!node || !definition ? (
            <>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                Inspector
              </h2>
              <p className="mt-3 text-sm text-foreground/60">Select a component to configure it or read its docs.</p>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
                  {definition.label}
                </h2>
                <button
                  onClick={() => openDocsWindow(definition.id)}
                  className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
                >
                  <FileText size={12} />
                  View docs
                </button>
              </div>

              <label className="mt-3 block">
                <span className="text-xs font-medium text-foreground/70">Instance name</span>
                <input
                  key={node.id}
                  defaultValue={node.data.name ?? ""}
                  onChange={(event) => updateNodeName(node.id, event.target.value)}
                  placeholder={`e.g. ${definition.id}-1`}
                  className="mt-1 w-full rounded border border-border bg-background px-2 py-1 font-mono text-sm outline-none placeholder:text-foreground/30 focus:border-foreground/40"
                />
              </label>

              <div className="mt-3 flex-1 overflow-y-auto">
                <ConfigForm
                  key={node.id}
                  definition={definition}
                  value={node.data.config}
                  onChange={(config) => updateNodeConfig(node.id, config)}
                />
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
