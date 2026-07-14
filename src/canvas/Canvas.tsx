"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
} from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
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

const EXPORT_IMAGE_WIDTH = 1600;
const EXPORT_IMAGE_HEIGHT = 1200;

export type CanvasHandle = {
  exportImage: (opts: { format: "png" | "jpg"; backgroundColor?: string }) => Promise<void>;
};

type FlowCanvasProps = {
  /** Keyed by node id — derived from the latest validation run, merged into
   * node data at render time only. Never written back into the store: the
   * store holds the graph a user is editing, not validation results. */
  nodeStates?: Record<string, ValidationState>;
};

const FlowCanvas = forwardRef<CanvasHandle, FlowCanvasProps>(function FlowCanvas(
  { nodeStates },
  ref,
) {
  const { screenToFlowPosition, getNodes } = useReactFlow();

  useImperativeHandle(ref, () => ({
    exportImage: async ({ format, backgroundColor }) => {
      const viewportEl = document.querySelector<HTMLElement>(".react-flow__viewport");
      if (!viewportEl) return;

      // Same pattern as xyflow's own "Download Image" example: fit the
      // whole graph (not just the current on-screen viewport) into a
      // fixed-size export canvas.
      const bounds = getNodesBounds(getNodes());
      const viewport = getViewportForBounds(bounds, EXPORT_IMAGE_WIDTH, EXPORT_IMAGE_HEIGHT, 0.2, 2, 0.1);

      const capture = format === "jpg" ? toJpeg : toPng;
      const dataUrl = await capture(viewportEl, {
        backgroundColor,
        width: EXPORT_IMAGE_WIDTH,
        height: EXPORT_IMAGE_HEIGHT,
        style: {
          width: `${EXPORT_IMAGE_WIDTH}px`,
          height: `${EXPORT_IMAGE_HEIGHT}px`,
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `scalecraft-canvas-${Date.now()}.${format === "jpg" ? "jpg" : "png"}`;
      a.click();
    },
  }));
  const storeNodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);
  const addNode = useCanvasStore((s) => s.addNode);
  const addZone = useCanvasStore((s) => s.addZone);
  const isPlacingZone = useCanvasStore((s) => s.isPlacingZone);
  const setIsPlacingZone = useCanvasStore((s) => s.setIsPlacingZone);
  const setSelectedEdgeId = useCanvasStore((s) => s.setSelectedEdgeId);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);

  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);
  const [previewRect, setPreviewRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Escape cancels placement — both before a drag has started (just exits
  // the mode) and mid-drag (tears down the in-progress window listeners
  // via the ref below, so nothing gets created).
  useEffect(() => {
    if (!isPlacingZone) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      dragCleanupRef.current?.();
      setIsPlacingZone(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isPlacingZone, setIsPlacingZone]);

  // Zones don't just spawn in — clicking "Add zone" arms placement mode
  // (crosshair cursor, see the overlay in the render below) and this drags
  // out the actual rectangle. A near-zero drag (a plain click) falls back
  // to the original fixed default size, centered on the click point, so a
  // quick click still works without requiring the drag.
  const startPlacementDrag = (event: React.MouseEvent) => {
    const start = { x: event.clientX, y: event.clientY };
    setPreviewRect({ left: start.x, top: start.y, width: 0, height: 0 });

    function onMove(moveEvent: MouseEvent) {
      setPreviewRect({
        left: Math.min(start.x, moveEvent.clientX),
        top: Math.min(start.y, moveEvent.clientY),
        width: Math.abs(moveEvent.clientX - start.x),
        height: Math.abs(moveEvent.clientY - start.y),
      });
    }

    function cleanup() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      dragCleanupRef.current = null;
      setPreviewRect(null);
    }

    function onUp(upEvent: MouseEvent) {
      const screenLeft = Math.min(start.x, upEvent.clientX);
      const screenTop = Math.min(start.y, upEvent.clientY);
      const screenWidth = Math.abs(upEvent.clientX - start.x);
      const screenHeight = Math.abs(upEvent.clientY - start.y);
      cleanup();

      // screenToFlowPosition, not raw pixel deltas, for the size too — a
      // raw screen-pixel diff would be wrong under any zoom other than 1.
      const topLeftFlow = screenToFlowPosition({ x: screenLeft, y: screenTop });
      if (screenWidth < 10 && screenHeight < 10) {
        addZone({ x: topLeftFlow.x - 160, y: topLeftFlow.y - 110 });
      } else {
        const bottomRightFlow = screenToFlowPosition({
          x: screenLeft + screenWidth,
          y: screenTop + screenHeight,
        });
        addZone(
          topLeftFlow,
          Math.max(120, bottomRightFlow.x - topLeftFlow.x),
          Math.max(80, bottomRightFlow.y - topLeftFlow.y),
        );
      }
      setIsPlacingZone(false);
    }

    dragCleanupRef.current = cleanup;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

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

      {isPlacingZone && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 z-40 -translate-x-1/2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
            Click and drag to place a zone · Esc to cancel
          </div>
          <div
            onMouseDown={startPlacementDrag}
            className="absolute inset-0 z-30 cursor-crosshair"
          />
        </>
      )}

      {previewRect &&
        createPortal(
          // Plain, static outline while dragging — a normal drag is enough
          // here; the animated dashed border (see ZoneNode.tsx) is what the
          // zone actually looks like once placed, not something the
          // in-progress drag needs to preempt.
          <div
            className="pointer-events-none fixed z-50 rounded-lg border border-dashed bg-panel/20"
            style={{
              left: previewRect.left,
              top: previewRect.top,
              width: previewRect.width,
              height: previewRect.height,
              borderColor: "color-mix(in srgb, var(--zone, #ff3483) 75%, transparent)",
            }}
          />,
          document.body,
        )}
    </div>
  );
});

export const Canvas = forwardRef<CanvasHandle, FlowCanvasProps>(function Canvas(props, ref) {
  return (
    <ReactFlowProvider>
      <FlowCanvas {...props} ref={ref} />
    </ReactFlowProvider>
  );
});
