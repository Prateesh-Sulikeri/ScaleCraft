"use client";

import { useState } from "react";
import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { ConfigForm } from "./ConfigForm";

type Tab = "config" | "docs";

/**
 * The right panel — see .claude/docs/MILESTONES.md milestone 2. Two
 * user-selected sections, never both forced into view: Config (a form
 * derived from the component's configSchema) and Docs (its markdown docs,
 * opened on demand). See "Hints vs. explanations" in ARCHITECTURE.md for the
 * same opt-in principle applied here to documentation.
 */
export function NodeInspector() {
  const [tab, setTab] = useState<Tab>("config");
  const selectedNodeId = useCanvasStore((s) => s.selectedNodeId);
  const nodes = useCanvasStore((s) => s.nodes);
  const updateNodeConfig = useCanvasStore((s) => s.updateNodeConfig);

  const node = nodes.find((n) => n.id === selectedNodeId);
  const definition = node ? getComponent(node.data.componentId) : undefined;

  if (!node || !definition) {
    return (
      <div className="p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">Inspector</h2>
        <p className="mt-3 text-sm text-foreground/60">Select a component to configure it or read its docs.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">{definition.label}</h2>

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
          // Plain text for now: current docs content is plain prose with no
          // markdown syntax in use, so this renders identically to a
          // markdown pass. Swap in a real renderer (e.g. react-markdown)
          // once chapter content actually uses markdown formatting.
          <p className="text-sm leading-relaxed text-foreground/80">{definition.docs}</p>
        )}
      </div>
    </div>
  );
}
