"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Palette } from "@/canvas/Palette";
import { Canvas } from "@/canvas/Canvas";
import { NodeInspector } from "@/canvas/NodeInspector";
import { ThemeToggle } from "./ThemeToggle";
import { QuestionPanel } from "./QuestionPanel";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
import type { ValidationState } from "@/canvas/types";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import type { ValidationViolation } from "@/validation-engine/types";

// Seeded once on first load so the canvas isn't empty — not a chapter
// starterGraph (those arrive with the chapter framework, milestone 5), just
// a friendlier first impression than a blank pane.
// Two rows rather than one wide row: at the node width needed to fit a
// title + description (see ComponentNode), four nodes in a single line
// don't fit the center canvas column at a comfortable zoom — this halves
// the horizontal span fitView has to accommodate.
const seedGraph: ArchitectureGraph = {
  nodes: [
    { id: "client-1", componentId: "client", position: { x: 0, y: 0 }, config: {} },
    {
      id: "lb-1",
      componentId: "load-balancer",
      position: { x: 280, y: 0 },
      config: { algorithm: "round-robin" },
    },
    {
      id: "app-1",
      componentId: "app-server",
      position: { x: 0, y: 160 },
      config: { instances: 2 },
    },
    {
      id: "db-1",
      componentId: "sql-database",
      position: { x: 280, y: 160 },
      config: { engine: "postgres" },
    },
  ],
  edges: [
    { id: "e1", source: "client-1", target: "lb-1", kind: "request-flow" },
    { id: "e2", source: "lb-1", target: "app-1", kind: "request-flow" },
    { id: "e3", source: "app-1", target: "db-1", kind: "request-flow" },
  ],
};

export default function Home() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const loadGraph = useCanvasStore((s) => s.loadGraph);

  useEffect(() => {
    if (useCanvasStore.getState().nodes.length > 0) return;
    loadGraph(seedGraph);
    // Seed once on mount; loadGraph is a stable store action, not a reactive dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Validation is explicit, not live — per direction, an automatic
  // per-edit re-check felt noisy. `checkedGraphKey` is a snapshot of the
  // graph at the moment "Validate" was last clicked; comparing it to the
  // current graph is how we know results are stale without re-running
  // anything automatically.
  const [violations, setViolations] = useState<ValidationViolation[] | null>(null);
  const [checkedGraphKey, setCheckedGraphKey] = useState<string | null>(null);

  const currentGraphKey = JSON.stringify(toArchitectureGraph(nodes, edges));
  const isStale = violations !== null && checkedGraphKey !== currentGraphKey;

  const handleValidate = () => {
    const graph = toArchitectureGraph(nodes, edges);
    setViolations(runValidation(graph, ruleRegistry));
    setCheckedGraphKey(JSON.stringify(graph));
  };

  const nodeStates: Record<string, ValidationState> = {};
  if (violations && !isStale) {
    for (const v of violations) {
      for (const id of v.offendingNodeIds) {
        nodeStates[id] = v.severity === "error" ? "error" : "warning";
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">ScaleCraft</h1>
          <p className="text-sm text-foreground/60">
            Drag components from the palette, connect them, then click Validate.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleValidate}
            className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
          >
            <CheckCircle2 size={14} />
            Validate
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <QuestionPanel violations={violations} isStale={isStale} />

        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <Canvas nodeStates={nodeStates} />
          </div>
          <Palette />
        </div>

        <NodeInspector />
      </main>
    </div>
  );
}
