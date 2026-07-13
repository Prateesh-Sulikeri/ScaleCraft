"use client";

import { useState } from "react";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { ConfigForm } from "./ConfigForm";

/**
 * The right panel — see .claude/docs/MILESTONES.md milestone 2. Two
 * user-selected sections, never both forced into view: Config (a form
 * derived from the component's configSchema) and Docs (its markdown docs,
 * opened on demand). See "Hints vs. explanations" in ARCHITECTURE.md for the
 * same opt-in principle applied here to documentation. Tab state lives in
 * the canvas store (not local) so the right-click "View docs" shortcut
 * (see ContextMenu) can jump straight to the Docs tab from outside.
 */
export function NodeInspector() {
  const [collapsed, setCollapsed] = useState(false);
  const tab = useCanvasStore((s) => s.inspectorTab);
  const setTab = useCanvasStore((s) => s.setInspectorTab);
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
    <aside className="flex w-96 shrink-0 flex-col overflow-y-auto border-l border-border p-4">
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
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse inspector panel"
              className="text-foreground/40 hover:text-foreground"
            >
              <PanelRightClose size={14} />
            </button>
          </div>

          <div className="mt-3 flex gap-1 border-b border-border">
            {(["config", "docs"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-sm capitalize ${
                  tab === t
                    ? "border-b-2 border-foreground text-foreground"
                    : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-3 flex-1 overflow-y-auto">
            {tab === "config" ? (
              <ConfigForm
                key={node.id}
                definition={definition}
                value={node.data.config}
                onChange={(config) => updateNodeConfig(node.id, config)}
              />
            ) : (
              // Plain text for now: current docs content is plain prose with
              // no markdown syntax in use, so this renders identically to a
              // markdown pass. Swap in a real renderer (e.g. react-markdown)
              // once chapter content actually uses markdown formatting.
              <p className="text-sm leading-relaxed text-foreground/80">{definition.docs}</p>
            )}
          </div>
        </>
      )}
    </aside>
  );
}
