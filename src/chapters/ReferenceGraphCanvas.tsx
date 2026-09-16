"use client";

import { useCallback, useEffect, useMemo } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  ConnectionMode,
  MarkerType,
  getViewportForBounds,
  useReactFlow,
  useStore,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { EDGE_COLOR_VAR, EDGE_DASH_ARRAY } from "@/canvas/edge-styles";
import { referenceNodeTypes, type ReferenceComponentNodeType } from "./ReferenceComponentNode";
import {
  referenceStartNodeTypes,
  START_BADGE_GAP,
  START_BADGE_HEIGHT,
  START_BADGE_WIDTH,
  type ReferenceStartBadgeType,
} from "./ReferenceStartBadge";
import { CARD_HEIGHT, CARD_WIDTH } from "@/canvas/card-geometry";
import {
  fanOutStepPositions,
  pickEdgeHandles,
  reciprocalEdgeIds,
  routeEdge,
  EDGE_CORNER_RADIUS,
  EDGE_STUB,
  PORT_IDS,
} from "@/canvas/edge-routing";
import { computeReferenceLayout } from "./reference-layout";
import type { ArchitectureGraph } from "@/lib/graph";

const nodeTypes = { ...referenceNodeTypes, ...referenceStartNodeTypes };

/** Exported for direct unit testing - jsdom never runs xyflow's own
 * ResizeObserver-driven node measurement, so an unmeasured node has no
 * internal handle bounds and never renders an edge path in a test
 * environment. The edge/handle-pair selection logic is a pure function of
 * the authored graph, so it's tested as one directly instead of through a
 * full ReactFlow render. */
export function buildNodesAndEdges(graph: ArchitectureGraph) {
  const positionById = computeReferenceLayout(graph);

  const componentNodes: ReferenceComponentNodeType[] = graph.nodes.map((n) => ({
    id: n.id,
    type: "referenceComponent",
    position: positionById.get(n.id) ?? { x: 0, y: 0 },
    data: { componentId: n.componentId, config: n.config },
    draggable: false,
    selectable: false,
    focusable: false,
  }));

  // One badge per entryPointIds, directly above the node it marks - the
  // read-only equivalent of the live canvas's Start marker (see
  // ReferenceStartBadge.tsx for why it's a stripped-down visual rather than
  // a reused StartNode).
  const startNodes: ReferenceStartBadgeType[] = graph.entryPointIds
    .map((targetId): ReferenceStartBadgeType | null => {
      const targetPos = positionById.get(targetId);
      if (!targetPos) return null;
      return {
        id: `${targetId}-start-badge`,
        type: "referenceStart",
        position: { x: targetPos.x, y: targetPos.y - START_BADGE_HEIGHT - START_BADGE_GAP },
        data: {},
        draggable: false,
        selectable: false,
        focusable: false,
      };
    })
    .filter((n): n is ReferenceStartBadgeType => n !== null);

  const nodes: Node[] = [...componentNodes, ...startNodes];

  const deltaOf = (e: { source: string; target: string }) => {
    const from = positionById.get(e.source);
    const to = positionById.get(e.target);
    // Every reference card is exactly CARD_WIDTH x CARD_HEIGHT (nothing here
    // is resizable), so the centre offset is the position offset.
    return from && to ? { dx: to.x - from.x, dy: to.y - from.y } : null;
  };

  // Every reference card is exactly CARD_WIDTH x CARD_HEIGHT (nothing here is
  // resizable), so a box is just its position plus the fixed card size.
  const boxOf = (id: string) => {
    const p = positionById.get(id);
    return p ? { x: p.x, y: p.y, width: CARD_WIDTH, height: CARD_HEIGHT } : null;
  };
  const allBoxes = graph.nodes.map((n) => boxOf(n.id)).filter((b) => b !== null);

  const reciprocal = reciprocalEdgeIds(graph.edges);
  const withHandles = graph.edges.map((e) => {
    const source = boxOf(e.source);
    const target = boxOf(e.target);
    if (!source || !target) return { ...e, ...pickEdgeHandles(0, 0, PORT_IDS) };
    return { ...e, ...routeEdge(source, target, allBoxes, PORT_IDS, reciprocal.has(e.id)) };
  });
  const steps = fanOutStepPositions(withHandles, deltaOf);

  const edges: Edge[] = withHandles.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    sourceHandle: e.sourceHandle,
    targetHandle: e.targetHandle,
    selectable: false,
    focusable: false,
    // Orthogonal, not the default bezier. This is the single change that
    // makes the render read as an architecture diagram rather than a node
    // graph - right-angle connectors are the convention every AWS/Azure/GCP
    // diagram uses, and they're what lets a fan-out branch or a feedback
    // path route around the cards instead of cutting across them.
    type: "smoothstep",
    pathOptions: {
      borderRadius: EDGE_CORNER_RADIUS,
      offset: EDGE_STUB,
      stepPosition: steps.get(e.id),
    },
    // Direction comes from the arrowhead alone. Kind stays colour + dash
    // pattern, exactly as edge-styles.ts defines it everywhere else, so the
    // arrow never becomes the only channel for anything.
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: EDGE_COLOR_VAR[e.kind],
    },
    // A reference diagram is a printed figure, not a live system - and the
    // live canvas doesn't animate either any more (see store.tsx's edgeStyle).
    animated: false,
    style: {
      stroke: EDGE_COLOR_VAR[e.kind],
      strokeWidth: 1.5,
      ...(EDGE_DASH_ARRAY[e.kind] ? { strokeDasharray: EDGE_DASH_ARRAY[e.kind] } : {}),
    },
  }));

  return { nodes, edges };
}

/**
 * The diagram's own aspect ratio, used to size the container instead of a
 * fixed height. A fixed box gives a flat 3-node chain the same 288px of
 * height as one with a three-deep fan-out, so the flat one fits to width and
 * leaves two thirds of the panel empty while the tall one is squeezed. Letting
 * the box follow the drawing keeps both at roughly the same card size.
 *
 * Clamped at both ends: the panel shares a narrow sidebar with the rest of the
 * Debrief, so it can neither collapse to a strip nor push the commentary off
 * screen.
 */
const MIN_PANEL_HEIGHT = 170;
const MAX_PANEL_HEIGHT = 380;
/** Same reasoning as Canvas.tsx's MIN_FIT_ZOOM, scaled for the reference
 * card: below this a label stops being readable, so the view stops shrinking
 * and starts panning. */
const REFERENCE_MIN_ZOOM = 0.55;
const REFERENCE_FIT_PADDING = 0.15;

/**
 * Frames the diagram, floor-clamped and anchored at the entry point rather
 * than centred - Canvas.tsx's `fitGraphIntoView` rule, for the same reason.
 * Below REFERENCE_MIN_ZOOM the drawing is wider than the frame, and a centred
 * fit then cuts *both* ends: at the default 320px sidebar bb-3-1 and bb-3-4
 * lost the Client card off the left (START badge and all) and "SQL Datab..."
 * off the right. A diagram is read from its entry point, so that end is the
 * one to pin; the panel pans and has its own zoom controls for the rest.
 *
 * Re-runs when the pane resizes, since the sidebar is drag-resizable.
 */
function useFitReferenceGraph() {
  // getNodesBounds off the instance, not the standalone import: the free
  // function has no nodeLookup, warns about it, and returns a box this canvas
  // cannot fit from.
  const { getNodes, getNodesBounds, setViewport } = useReactFlow();
  const paneWidth = useStore((s) => s.width);
  const paneHeight = useStore((s) => s.height);
  return useCallback(() => {
    const bounds = getNodesBounds(getNodes());
    if (!paneWidth || !paneHeight || bounds.width === 0 || bounds.height === 0) return;
    const viewport = getViewportForBounds(
      bounds,
      paneWidth,
      paneHeight,
      REFERENCE_MIN_ZOOM,
      1,
      REFERENCE_FIT_PADDING,
    );
    setViewport({
      zoom: viewport.zoom,
      x:
        bounds.width * viewport.zoom > paneWidth
          ? REFERENCE_FIT_PADDING * paneWidth - bounds.x * viewport.zoom
          : viewport.x,
      y:
        bounds.height * viewport.zoom > paneHeight
          ? REFERENCE_FIT_PADDING * paneHeight - bounds.y * viewport.zoom
          : viewport.y,
    });
  }, [getNodes, getNodesBounds, setViewport, paneWidth, paneHeight]);
}

/** Runs the fit once xyflow has measured the nodes - the same moment its own
 * `fitView` prop would have fired, which this replaces. */
function ReferenceFit() {
  const fit = useFitReferenceGraph();
  // Not `useNodesInitialized`: this canvas passes `nodes` with no
  // `onNodesChange`, so xyflow never writes measured dimensions back onto the
  // nodes we hand it and that hook stays false forever. The internal lookup
  // does carry the measurements, and it is what getNodesBounds reads anyway.
  const measured = useStore((s) => {
    if (s.nodeLookup.size === 0) return false;
    for (const [, node] of s.nodeLookup) {
      if (!node.measured?.width || !node.measured?.height) return false;
    }
    return true;
  });
  useEffect(() => {
    if (!measured) return;
    fit();
  }, [measured, fit]);
  return null;
}

function diagramAspectRatio(nodes: Node[]): number {
  if (nodes.length === 0) return 2;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const isBadge = n.type === "referenceStart";
    const w = isBadge ? START_BADGE_WIDTH : CARD_WIDTH;
    const h = isBadge ? START_BADGE_HEIGHT : CARD_HEIGHT;
    minX = Math.min(minX, n.position.x);
    minY = Math.min(minY, n.position.y);
    maxX = Math.max(maxX, n.position.x + w);
    maxY = Math.max(maxY, n.position.y + h);
  }
  const width = maxX - minX;
  const height = maxY - minY;
  if (width <= 0 || height <= 0) return 2;
  return width / height;
}

function ReferenceGraphCanvasInner({ graph }: { graph: ArchitectureGraph }) {
  const { nodes, edges } = useMemo(() => buildNodesAndEdges(graph), [graph]);

  // Same "default to dark until mounted" reasoning as Canvas.tsx - next-themes
  // only knows the real theme after mount.
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  const aspectRatio = useMemo(() => diagramAspectRatio(nodes), [nodes]);

  return (
    <div className="sc-reference-canvas flex flex-col gap-1">
      <div
        className="w-full overflow-hidden rounded-md border border-border"
        style={{ aspectRatio, minHeight: MIN_PANEL_HEIGHT, maxHeight: MAX_PANEL_HEIGHT }}
        aria-label="Reference architecture diagram"
      >
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          // Nothing here connects, but every port is a `source` handle (see
          // edge-routing.ts) and only loose mode will resolve one as an edge's
          // *target*. Strict mode drops every edge silently.
          connectionMode={ConnectionMode.Loose}
          // Wheel stays page scroll (this sits inside a scrollable disclosure
          // panel) - drag-to-pan and the zoom buttons below are how a learner
          // explores a bigger reference graph instead.
          panOnScroll={false}
          zoomOnScroll={false}
          proOptions={{ hideAttribution: true }}
          minZoom={0.25}
          maxZoom={2}
          // No declarative `fitView`: a single unwrapped pipeline is wide and
          // the sidebar is narrow, so the fit needs both a zoom floor (below
          // it a label stops being readable) and an entry-point anchor once
          // that floor bites. `translateExtent` is left open so the panning
          // that then matters actually works.
        >
          <Background />
          <ReferenceFit />
        </ReactFlow>
      </div>
      <ReferenceZoomControls />
    </div>
  );
}

/**
 * Zoom chrome, deliberately outside the framed diagram rather than xyflow's
 * `<Controls>` panel floating inside it. At sidebar width the panel's
 * bottom-right corner is a card, not empty canvas, so an overlay covers the
 * thing it is there to help read.
 */
function ReferenceZoomControls() {
  const { zoomIn, zoomOut } = useReactFlow();
  const fit = useFitReferenceGraph();
  const button =
    "rounded border border-border p-1 text-foreground/60 hover:bg-border/40 hover:text-foreground";
  return (
    <div className="flex items-center justify-end gap-1">
      <button type="button" onClick={() => zoomOut()} className={button} aria-label="Zoom out">
        <Minus size={12} />
      </button>
      <button type="button" onClick={() => zoomIn()} className={button} aria-label="Zoom in">
        <Plus size={12} />
      </button>
      <button
        type="button"
        onClick={() => fit()}
        className={button}
        aria-label="Fit diagram to view"
      >
        <Maximize2 size={12} />
      </button>
    </div>
  );
}

/**
 * D10/D17's "real read-only canvas render" for Debrief's blueprint
 * reference graphs. A genuinely different renderer from
 * ReadOnlyGraphSummary.tsx, not a fork of it - see that file's comment for
 * why both legitimately coexist. Mounts its own ReactFlowProvider, never
 * canvas/store.tsx's per-chapter CanvasStoreProvider, so nothing here can
 * read or mutate the graph a learner is actively editing on the same page.
 */
export function ReferenceGraphCanvas({ graph }: { graph: ArchitectureGraph }) {
  return (
    <ReactFlowProvider>
      <ReferenceGraphCanvasInner graph={graph} />
    </ReactFlowProvider>
  );
}
