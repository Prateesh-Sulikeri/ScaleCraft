"use client";

import { useCallback, useMemo, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useReactFlow,
} from "@xyflow/react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { getComponent } from "@/content/components/registry";
import { ComponentNode } from "./ComponentNode";
import { ZoneNode } from "./ZoneNode";
import { EdgeInspector } from "./EdgeInspector";
import { ContextMenu, type ContextMenuTarget } from "./ContextMenu";
import { PALETTE_DRAG_TYPE } from "./Palette";
import { useCanvasStore } from "./store";
import type { AnyNodeType, ValidationState } from "./types";

const nodeTypes = { component: ComponentNode, zone: ZoneNode };

type FlowCanvasProps = {
  /** Keyed by node id — derived from the latest validation run, merged into
   * node data at render time only. Never written back into the store: the
   * store holds the graph a user is editing, not validation results. */
  nodeStates?: Record<string, ValidationState>;
};

function FlowCanvas({ nodeStates }: FlowCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const storeNodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const addNode = useCanvasStore((s) => s.addNode);
  const setSelectedEdgeId = useCanvasStore((s) => s.setSelectedEdgeId);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);

  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);

  // next-themes only knows the real theme after mount (it reads the class
  // the pre-hydration script set) — default to our declared dark posture
  // until then rather than risk a hydration-mismatch flash.
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  const nodes = useMemo(
    () =>
      nodeStates
        ? storeNodes.map((n): AnyNodeType => {
            const validationState = nodeStates[n.id];
            // Branching (rather than one generic spread) keeps `data`'s
            // shape tied to `n.type` per xyflow's discriminated union —
            // a single spread across the union loses that tie and both
            // branches end up structurally identical anyway.
            return n.type === "zone"
              ? { ...n, data: { ...n.data, validationState } }
              : { ...n, data: { ...n.data, validationState } };
          })
        : storeNodes,
    [storeNodes, nodeStates],
  );

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentId = event.dataTransfer.getData(PALETTE_DRAG_TYPE);
      const definition = getComponent(componentId);
      if (!definition) return;
      const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(definition, position);
    },
    [screenToFlowPosition, addNode],
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="relative h-full w-full" onDrop={onDrop} onDragOver={onDragOver}>
      <ReactFlow
        colorMode={colorMode}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(null);
        }}
        onNodeClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(null);
        }}
        onPaneClick={() => {
          setSelectedEdgeId(null);
          setSelectedNodeId(null);
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          setMenu({ type: "node", id: node.id, x: event.clientX, y: event.clientY });
        }}
        onEdgeContextMenu={(event, edge) => {
          event.preventDefault();
          setMenu({ type: "edge", id: edge.id, x: event.clientX, y: event.clientY });
        }}
        onSelectionContextMenu={(event, selectedNodes) => {
          event.preventDefault();
          setMenu({
            type: "selection",
            ids: selectedNodes.map((n) => n.id),
            x: event.clientX,
            y: event.clientY,
          });
        }}
        onPaneContextMenu={(event) => {
          event.preventDefault();
          const mouseEvent = event as MouseEvent;
          setMenu({
            type: "pane",
            flowPosition: screenToFlowPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY }),
            x: mouseEvent.clientX,
            y: mouseEvent.clientY,
          });
        }}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionOnDrag
        panOnDrag={[1]}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <EdgeInspector />
      <ContextMenu target={menu} onClose={() => setMenu(null)} />
    </div>
  );
}

export function Canvas(props: FlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} />
    </ReactFlowProvider>
  );
}
