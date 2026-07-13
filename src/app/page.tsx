"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@/canvas/Canvas";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "@/validation-engine/engine";
import { getRules } from "@/validation-engine/rules";
import type { ValidationState } from "@/canvas/ComponentNode";

const validGraph: ArchitectureGraph = {
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

// Same nodes, but the client bypasses the load balancer and app server to
// hit the database directly — exercises the noDirectClientDatabase rule.
const invalidGraph: ArchitectureGraph = {
  nodes: validGraph.nodes,
  edges: [
    ...validGraph.edges,
    { id: "e4", source: "client-1", target: "db-1", kind: "request-flow" },
  ],
};

export default function Home() {
  const [showInvalid, setShowInvalid] = useState(false);
  const graph = showInvalid ? invalidGraph : validGraph;
  const rules = useMemo(() => getRules(["no-direct-client-database"]), []);
  const violations = useMemo(() => runValidation(graph, rules), [graph, rules]);

  const nodeStates = useMemo(() => {
    const states: Record<string, ValidationState> = {};
    for (const v of violations) {
      for (const id of v.offendingNodeIds) states[id] = v.severity === "error" ? "error" : "warning";
    }
    return states;
  }, [violations]);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h1 className="text-lg font-semibold">ScaleCraft</h1>
          <p className="text-sm text-foreground/60">Scaffold smoke test — canvas, registry, and validation engine wired end-to-end.</p>
        </div>
        <button
          onClick={() => setShowInvalid((v) => !v)}
          className="rounded-md border border-border px-3 py-1.5 text-sm font-mono hover:bg-panel"
        >
          {showInvalid ? "Show valid example" : "Show invalid example"}
        </button>
      </header>

      <main className="flex flex-1">
        <div className="flex-1">
          <Canvas graph={graph} nodeStates={nodeStates} />
        </div>

        <aside className="w-96 shrink-0 border-l border-border p-4 overflow-y-auto">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground/60">
            Validation
          </h2>
          {violations.length === 0 ? (
            <p className="mt-3 text-sm text-state-valid">No violations.</p>
          ) : (
            <ul className="mt-3 space-y-4">
              {violations.map((v, i) => (
                <li key={i} className="rounded-md border border-border p-3">
                  <p
                    className="text-sm font-medium"
                    style={{ color: v.severity === "error" ? "var(--state-error)" : "var(--state-warning)" }}
                  >
                    {v.message}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">{v.explanation}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </main>
    </div>
  );
}
