"use client";

import { useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  type Edge,
} from "@xyflow/react";
import type { ArchitectureGraph } from "@/lib/graph";
import { ComponentNode, type ComponentNodeType, type ValidationState } from "./ComponentNode";

const nodeTypes = { component: ComponentNode };

type CanvasProps = {
  graph: ArchitectureGraph;
  /** Keyed by node id — drives the validation-state ring, see ComponentNode. */
  nodeStates?: Record<string, ValidationState>;
};

export function Canvas({ graph, nodeStates }: CanvasProps) {
  const nodes: ComponentNodeType[] = useMemo(
    () =>
      graph.nodes.map((n) => ({
        id: n.id,
        type: "component",
        position: n.position,
        data: { componentId: n.componentId, validationState: nodeStates?.[n.id] },
      })),
    [graph.nodes, nodeStates],
  );

  const edges: Edge[] = useMemo(
    () =>
      graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: e.kind === "request-flow",
        style: e.kind !== "request-flow" ? { strokeDasharray: "4 4" } : undefined,
      })),
    [graph.edges],
  );

  return (
    <div className="h-full w-full">
      <ReactFlowProvider>
        <ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
