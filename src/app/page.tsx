"use client";

import { useEffect, useMemo } from "react";
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

// Seeded once on first load so the canvas isn't empty — not a chapter
// starterGraph (those arrive with the chapter framework, milestone 5), just
// a friendlier first impression than a blank pane.
const seedGraph: ArchitectureGraph = {
  nodes: [
    { id: "client-1", componentId: "client", position: { x: 0, y: 100 }, config: {} },
    {
      id: "lb-1",
      componentId: "load-balancer",
      position: { x: 240, y: 100 },
      config: { algorithm: "round-robin" },
    },
    {
      id: "app-1",
      componentId: "app-server",
      position: { x: 480, y: 100 },
      config: { instances: 2 },
    },
    {
      id: "db-1",
      componentId: "sql-database",
      position: { x: 720, y: 100 },
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

  const violations = useMemo(
    () => runValidation(toArchitectureGraph(nodes, edges), ruleRegistry),
    [nodes, edges],
  );

  const nodeStates = useMemo(() => {
    const states: Record<string, ValidationState> = {};
    for (const v of violations) {
      for (const id of v.offendingNodeIds) {
        states[id] = v.severity === "error" ? "error" : "warning";
      }
    }
    return states;
  }, [violations]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-start justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">ScaleCraft</h1>
          <p className="text-sm text-foreground/60">
            Drag components from the palette, connect them, and watch validation react live.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 overflow-hidden">
        <QuestionPanel violations={violations} />

        <div className="flex flex-1 flex-col">
          <div className="flex-1">
            <Canvas nodeStates={nodeStates} />
          </div>
          <Palette />
        </div>

        <aside className="w-96 shrink-0 overflow-y-auto border-l border-border">
          <NodeInspector />
        </aside>
      </main>
    </div>
  );
}
