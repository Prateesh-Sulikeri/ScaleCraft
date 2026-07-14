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

  const selected = nodes.find((n) => n.id === selectedNodeId);
  // Zones aren't ComponentDefinitions (see types.ts) — no config/docs to
  // show for one, so it falls through to the same empty state as nothing
  // selected.
  const node = selected?.type === "component" ? selected : undefined;
  const definition = node ? getComponent(node.data.componentId) : undefined;

  if (collapsed) {
    return (
      <div className="flex w-10 shrink-0 flex-col items-center border-l border-border py-3">
        <button
          onClick={() => setCollapsed(false)}
          aria-label="Expand inspector panel"
          className="text-foreground/60 hover:text-foreground"
        >
          <PanelRightOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex shrink-0">
      <div
        onMouseDown={onMouseDown}
        className="w-1 shrink-0 cursor-col-resize bg-transparent hover:bg-foreground/20 active:bg-foreground/30"
      />
      <aside style={{ width }} className="flex shrink-0 flex-col overflow-y-auto border-l border-border p-4">
      {!node || !definition ? (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
              Inspector
            </h2>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse inspector panel"
              className="text-foreground/40 hover:text-foreground"
            >
              <PanelRightClose size={14} />
            </button>
          </div>
          <p className="mt-3 text-sm text-foreground/60">Select a component to configure it or read its docs.</p>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
              {definition.label}
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => openDocsWindow(definition.id)}
                className="flex items-center gap-1 text-xs text-foreground/60 hover:text-foreground"
              >
                <FileText size={12} />
                View docs
              </button>
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Collapse inspector panel"
                className="text-foreground/40 hover:text-foreground"
              >
                <PanelRightClose size={14} />
              </button>
            </div>
          </div>

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
      </aside>
    </div>
  );
}
