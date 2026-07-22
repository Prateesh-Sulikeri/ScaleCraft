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
  MarkerType,
  getNodesBounds,
  getViewportForBounds,
  useReactFlow,
  type Connection,
} from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { getComponent } from "@/content/components/registry";
import { pickDefaultKind } from "./legal-edge-kinds";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import { Server } from "lucide-react";
import { ComponentNode } from "./ComponentNode";
import { ZoneNode } from "./ZoneNode";
import { CommentNode } from "./CommentNode";
import { StartNode } from "./StartNode";
import { EdgeInspector } from "./EdgeInspector";
import { ContextMenu, type ContextMenuTarget } from "./ContextMenu";
import { AnnotationEditor } from "./AnnotationEditor";
import { NodeConfigPopover } from "./NodeConfigPopover";
import { ComponentPicker } from "./ComponentPicker";
import { RightClickCursorHint } from "./RightClickCursorHint";
import { HIGHLIGHT_GOLD } from "./selection-style";
import { useCanvasStore, type PlacementMode } from "./store";
import { isEditableTarget } from "./use-canvas-shortcuts";
import { useDismissedFlag } from "@/lib/use-dismissed-flag";
import type { AnyNodeType, ArchitectureEdgeType, ValidationState } from "./types";

const nodeTypes = { component: ComponentNode, zone: ZoneNode, comment: CommentNode, start: StartNode };

/** Drag-to-draw defaults for the two resizable annotation types — "start"
 * isn't here since it's fixed-size and never drag-sized (see
 * startPlacementDrag below). Mirrors each store action's own default
 * width/height (addZone/addComment) so the plain-click fallback centers a
 * same-sized annotation on the click point. */
const ANNOTATION_DEFAULTS = {
  zone: { width: 320, height: 220, minWidth: 120, minHeight: 80 },
  // Compact by default — a comment is a short note, not a document; the
  // original 220x140 default left most of the box empty for a typical
  // one-line note. Still freely resizable up from here via NodeResizer.
  comment: { width: 176, height: 60, minWidth: 100, minHeight: 32 },
} as const;

const PLACEMENT_HINT: Record<Exclude<PlacementMode, null>, string> = {
  zone: "Click and drag to place a zone · Esc to cancel",
  comment: "Click and drag to place a comment · Esc to cancel",
  start: "Click to place a start marker · Esc to cancel",
};

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
  /** Fires on top of Canvas's own pane-click handling (deselect/clear
   * highlight) — lets sandbox/page.tsx also dismiss its last Validate run
   * (nodeStates above, plus the header button's own pass/fail color) on the
   * same click, since violations/checkedGraphKey live in page.tsx, not the
   * store. Without an explicit way to dismiss it, a passing run's green
   * ring had no path back to neutral short of editing the graph. Named
   * distinctly from the `<ReactFlow onPaneClick>` prop below (a JSX
   * attribute name, not a scope binding, so there's no actual collision —
   * this is purely to keep the two from reading as the same thing at a
   * glance). */
  onCanvasPaneClick?: () => void;
};

const FlowCanvas = forwardRef<CanvasHandle, FlowCanvasProps>(function FlowCanvas(
  { nodeStates, onCanvasPaneClick },
  ref,
) {
  const { screenToFlowPosition, getNodes, fitView } = useReactFlow();

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
  const storeOnConnect = useCanvasStore((s) => s.onConnect);
  /** Picks a category-aware default kind instead of always hardcoding
   * request-flow — reconciles the connect gesture with
   * legal-edge-kinds.ts's matrix (see .claude/docs/validation_agent_design.md,
   * section 2.3): without this, a new edge into a pair where request-flow
   * isn't legal would trip illegal-edge-kind.ts immediately, before the user
   * has done anything. Falls back to the store's own "request-flow" default
   * if either endpoint isn't a real component (e.g. mid-drag onto empty
   * canvas never fires onConnect anyway, but this stays safe regardless). */
  const onConnect = useCallback(
    (connection: Connection) => {
      const sourceNode = storeNodes.find((n) => n.id === connection.source);
      const targetNode = storeNodes.find((n) => n.id === connection.target);
      const sourceDef = sourceNode?.type === "component" ? getComponent(sourceNode.data.componentId) : undefined;
      const targetDef = targetNode?.type === "component" ? getComponent(targetNode.data.componentId) : undefined;
      const kind = sourceDef && targetDef ? pickDefaultKind(sourceDef.category, targetDef.category) : undefined;
      storeOnConnect(connection, kind);
    },
    [storeNodes, storeOnConnect],
  );
  const addZone = useCanvasStore((s) => s.addZone);
  const addComment = useCanvasStore((s) => s.addComment);
  const addStartMarker = useCanvasStore((s) => s.addStartMarker);
  const placementMode = useCanvasStore((s) => s.placementMode);
  const setPlacementMode = useCanvasStore((s) => s.setPlacementMode);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const openConfigPopover = useCanvasStore((s) => s.openConfigPopover);
  const setSelectedEdgeId = useCanvasStore((s) => s.setSelectedEdgeId);
  const setSelectedNodeId = useCanvasStore((s) => s.setSelectedNodeId);
  const highlight = useCanvasStore((s) => s.highlight);
  const clearHighlight = useCanvasStore((s) => s.clearHighlight);
  const componentPicker = useCanvasStore((s) => s.componentPicker);
  const openComponentPicker = useCanvasStore((s) => s.openComponentPicker);
  const pendingComponentPlacement = useCanvasStore((s) => s.pendingComponentPlacement);
  const setPendingComponentPlacement = useCanvasStore((s) => s.setPendingComponentPlacement);
  const addNode = useCanvasStore((s) => s.addNode);

  /** Phase 4 "Center View" — frames one node in the viewport without
   * touching the rest of the graph's zoom/pan. Uses the `fitView` returned
   * by useReactFlow() (an imperative function scoped to this call), not the
   * declarative `fitView` prop on <ReactFlow> further down (that one only
   * runs once, on mount, to frame the whole graph — no conflict). */
  const centerOnNode = useCallback(
    (nodeId: string) => {
      fitView({ nodes: [{ id: nodeId }], duration: 300, maxZoom: 1.2 });
    },
    [fitView],
  );

  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);
  // Cursor-following "right-click to add" teaching graphic (see
  // RightClickCursorHint.tsx) — shares the sandbox pill's dismiss flag
  // (dismissing either hides both, since they teach the same gesture) and
  // is suppressed whenever any other overlay is already up, so it never
  // fights the picker/context-menu/placement-mode overlays for attention.
  const [insertHintDismissed] = useDismissedFlag("sc-insert-hint-dismissed");
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  // Set on pointerdown on a handle, before any drag motion — disables
  // selectionOnDrag for the gesture's whole duration so a connection drag
  // that passes over an intervening node never also starts a selection box.
  const [isConnecting, setIsConnecting] = useState(false);
  const [previewRect, setPreviewRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);
  const dragCleanupRef = useRef<(() => void) | null>(null);

  // Escape cancels placement — both before a drag has started (just exits
  // the mode) and mid-drag (tears down the in-progress window listeners via
  // the ref below, so nothing gets created) — and, when no placement is in
  // progress, clears an active Highlight Connections dim instead (see
  // ContextMenu.tsx's "Highlight Connections" item). Always attached (not
  // gated on placementMode being truthy, unlike before) so Escape can clear
  // the highlight on its own.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // The picker handles its own Escape (closes itself, no placement/
      // highlight side effect) — bail here so this listener doesn't also
      // clear an unrelated highlight underneath it while it's open.
      if (componentPicker) return;
      if (pendingComponentPlacement) {
        setPendingComponentPlacement(null);
        return;
      }
      if (placementMode) {
        dragCleanupRef.current?.();
        setPlacementMode(null);
        return;
      }
      if (highlight) clearHighlight();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    placementMode,
    setPlacementMode,
    highlight,
    clearHighlight,
    componentPicker,
    pendingComponentPlacement,
    setPendingComponentPlacement,
  ]);

  // xyflow's hold-Space-to-pan (`panActivationKeyCode`, on by default) only
  // takes over a drag that starts on the blank pane — it has no awareness of
  // node/zone/comment/start dragging at all, and a node marked `draggable`
  // always gets xyflow's own `nopan` class, which makes a mousedown on it
  // start a node-move instead of falling through to the pane's pan handler.
  // So without this, holding Space and dragging from on top of a node just
  // moves that node — the cursor never even reaches "grabbing" because the
  // pane itself never enters its `dragging` state. Tracking Space here and
  // folding it into every node's `draggable` below (plus `nodesDraggable`
  // for plain component nodes, which don't set an explicit per-node value)
  // makes every node let go while Space is held, so the same drag pans the
  // canvas — matching blank-canvas behavior instead of stopping short of it.
  const [spaceHeld, setSpaceHeld] = useState(false);
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== "Space" || event.repeat || isEditableTarget(event.target)) return;
      setSpaceHeld(true);
    }
    function onKeyUp(event: KeyboardEvent) {
      if (event.code !== "Space") return;
      setSpaceHeld(false);
    }
    // Guards against a stuck "held" state if a keyup is missed (e.g.
    // Alt-Tabbing away mid-hold never delivers one).
    function onBlur() {
      setSpaceHeld(false);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  // Annotations don't just spawn in — clicking a palette "Add …" button arms
  // placement mode (crosshair cursor, see the overlay in the render below)
  // and this drags out the actual rectangle for the two resizable types
  // (zone/comment). A near-zero drag (a plain click) falls back to that
  // type's fixed default size, centered on the click point, so a quick click
  // still works without requiring the drag. "start" is fixed-size and never
  // drag-sized — a single click places it immediately, no rectangle at all.
  const startPlacementDrag = (event: React.MouseEvent) => {
    const mode = placementMode;
    if (!mode) return;

    if (mode === "start") {
      // Centers on the click point — StartNode.tsx renders at a fixed
      // w-[180px] with auto height; ~20px approximates half the card's
      // rendered height at rest (label row + target chip).
      const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
      const newId = addStartMarker({ x: flowPos.x - 90, y: flowPos.y - 20 });
      setPlacementMode(null);
      // Same "open the color/label popup right where it landed" convention
      // as zone/comment below — a flag's headline customization is color.
      openAnnotationEditor(newId, { x: event.clientX, y: event.clientY });
      return;
    }

    const addAnnotation = mode === "zone" ? addZone : addComment;
    const { width, height, minWidth, minHeight } = ANNOTATION_DEFAULTS[mode];
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
      let newId: string;
      if (screenWidth < 10 && screenHeight < 10) {
        newId = addAnnotation({ x: topLeftFlow.x - width / 2, y: topLeftFlow.y - height / 2 });
      } else {
        const bottomRightFlow = screenToFlowPosition({
          x: screenLeft + screenWidth,
          y: screenTop + screenHeight,
        });
        newId = addAnnotation(
          topLeftFlow,
          Math.max(minWidth, bottomRightFlow.x - topLeftFlow.x),
          Math.max(minHeight, bottomRightFlow.y - topLeftFlow.y),
        );
      }
      setPlacementMode(null);
      // Opens right where the drag/click just ended — see
      // AnnotationEditor.tsx — so a new user sees color + label/text in one
      // obvious place instead of having to discover the inline controls.
      openAnnotationEditor(newId, { x: upEvent.clientX, y: upEvent.clientY });
    }

    dragCleanupRef.current = cleanup;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // Picking a component from ComponentPicker.tsx arms this instead of
  // inserting immediately at a guessed position (viewport center or the
  // right-click point) — the user always confirms the exact landing spot
  // with a real click, same "click to place" gesture "start" placement mode
  // already uses above, just carrying a component payload instead of a
  // fixed annotation type. Shift-click re-arms the same component so
  // several of one kind can be dropped in a row without reopening the
  // picker each time.
  const [ghostPos, setGhostPos] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    if (!pendingComponentPlacement) {
      setGhostPos(null);
      return;
    }
    function onMove(event: MouseEvent) {
      setGhostPos({ x: event.clientX, y: event.clientY });
    }
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [pendingComponentPlacement]);

  const placeComponent = (event: React.MouseEvent) => {
    if (!pendingComponentPlacement) return;
    const flowPos = screenToFlowPosition({ x: event.clientX, y: event.clientY });
    addNode(pendingComponentPlacement, flowPos);
    if (!event.shiftKey) setPendingComponentPlacement(null);
  };

  // next-themes only knows the real theme after mount (it reads the class
  // the pre-hydration script set) — default to our declared dark posture
  // until then rather than risk a hydration-mismatch flash.
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";

  // Phase 4 "Highlight Connections"/"Highlight Zone" — derives the
  // highlighted node/edge id sets from the store's `highlight` each render,
  // rather than having every node component subscribe to it directly (only
  // a few nodes/edges care at any one time, most just need to dim). null
  // means "no active highlight," not "highlight nothing."
  //
  // "connections" is graph-based: the origin component node plus every node
  // directly joined to it by a real edge. "zone" is spatial instead: every
  // node (any type) whose position falls inside the origin zone's own
  // rectangle — this is what makes "Highlight Zone" actually usable, since
  // xyflow doesn't reparent nodes dropped into a zone (see ZoneNodeData's
  // doc comment), so graph traversal has nothing to walk. Either way, an
  // edge only counts as highlighted when BOTH endpoints are in the set —
  // an edge leaving the zone/neighborhood stays dimmed like everything else
  // outside it.
  const highlightSets = useMemo(() => {
    if (!highlight) return null;
    const connectedNodeIds = new Set<string>([highlight.id]);
    if (highlight.mode === "connections") {
      for (const e of edges) {
        if (e.source === highlight.id || e.target === highlight.id) {
          connectedNodeIds.add(e.source);
          connectedNodeIds.add(e.target);
        }
      }
    } else {
      const zone = storeNodes.find(
        (n): n is Extract<AnyNodeType, { type: "zone" }> => n.id === highlight.id && n.type === "zone",
      );
      if (!zone) return null;
      const { x: zx, y: zy } = zone.position;
      const { width: zw, height: zh } = zone.data;
      for (const n of storeNodes) {
        if (n.id === zone.id || n.type === "zone") continue;
        const { x, y } = n.position;
        if (x >= zx && x <= zx + zw && y >= zy && y <= zy + zh) connectedNodeIds.add(n.id);
      }
    }
    const connectedEdgeIds = new Set<string>();
    for (const e of edges) {
      if (connectedNodeIds.has(e.source) && connectedNodeIds.has(e.target)) connectedEdgeIds.add(e.id);
    }
    return { connectedNodeIds, connectedEdgeIds };
  }, [highlight, edges, storeNodes]);

  const dimStyle = useCallback(
    (id: string): React.CSSProperties => ({
      opacity: highlightSets && !highlightSets.connectedNodeIds.has(id) ? 0.3 : 1,
      transition: "opacity 150ms ease-out",
    }),
    [highlightSets],
  );
  const isHighlighted = useCallback(
    (id: string) => highlightSets?.connectedNodeIds.has(id) ?? false,
    [highlightSets],
  );

  const nodes = useMemo(
    () =>
      nodeStates
        ? storeNodes.map((n): AnyNodeType => {
            // Only component/zone nodes declare a validationState field at
            // all (see types.ts) — comment/start are pure annotations, never
            // touched by the validation engine, so they pass through as-is.
            // Branched per literal type (not one guard + generic spread):
            // narrowing to a 2+ member remaining union still loses the
            // type/data correlation the same way spreading the full union
            // would — each branch has to narrow to exactly one member.
            const validationState = nodeStates[n.id];
            const style = dimStyle(n.id);
            const highlighted = isHighlighted(n.id);
            if (n.type === "component")
              return { ...n, data: { ...n.data, validationState, highlighted }, style };
            if (n.type === "zone")
              return {
                ...n,
                data: { ...n.data, validationState, highlighted },
                draggable: !n.data.locked && !spaceHeld,
                style,
              };
            if (n.type === "comment")
              return { ...n, data: { ...n.data, highlighted }, draggable: !n.data.locked && !spaceHeld, style };
            if (n.type === "start")
              return { ...n, data: { ...n.data, highlighted }, draggable: !n.data.locked && !spaceHeld, style };
            // Unreachable — the four branches above already cover every
            // member of AnyNodeType, so `n` is narrowed to `never` here.
            // Just return it as-is (no `style` merge — spreading `never`
            // is a TS error, and this line never actually executes).
            return n;
          })
        : storeNodes.map((n): AnyNodeType => {
            // Same locked -> non-draggable override as above, needed even
            // when nodeStates is absent (e.g. before the first Validate
            // click) so locking isn't validation-dependent.
            const style = dimStyle(n.id);
            const highlighted = isHighlighted(n.id);
            if (n.type === "zone")
              return { ...n, data: { ...n.data, highlighted }, draggable: !n.data.locked && !spaceHeld, style };
            if (n.type === "comment")
              return { ...n, data: { ...n.data, highlighted }, draggable: !n.data.locked && !spaceHeld, style };
            if (n.type === "start")
              return { ...n, data: { ...n.data, highlighted }, draggable: !n.data.locked && !spaceHeld, style };
            return { ...n, data: { ...n.data, highlighted }, style };
          }),
    [storeNodes, nodeStates, spaceHeld, dimStyle, isHighlighted],
  );

  // A Start marker's pointer arrow (see StartNode.tsx) — derived purely from
  // each start node's targetId, never stored in the store's own `edges`
  // (that array is the domain graph's edges; this is a canvas-only visual).
  // Filtered to targets that still exist, since a targetId can go stale for
  // one render after its component is deleted, before store.ts's
  // pruneStartTargets cleanup lands. Non-interactive (selectable/deletable/
  // focusable all false) — it's a picked-from-dropdown pointer, not
  // something a user drags or deletes like a real edge.
  const pointerEdges = useMemo(() => {
    const componentIds = new Set(storeNodes.filter((n) => n.type === "component").map((n) => n.id));
    return storeNodes
      .filter((n) => n.type === "start" && n.data.targetId && componentIds.has(n.data.targetId))
      .map(
        (n): ArchitectureEdgeType => ({
          id: `start-pointer:${n.id}`,
          source: n.id,
          sourceHandle: "start-source",
          target: (n as Extract<AnyNodeType, { type: "start" }>).data.targetId!,
          targetHandle: "start-target",
          // No explicit `type` — falls back to React Flow's default bezier
          // edge, same as every real edge (none of them set `type` either).
          // Previously hardcoded to "straight", which is exactly why this
          // pointer looked visually distinct (sharp, fixed-angle) from
          // every other connection on the canvas.
          selectable: false,
          deletable: false,
          focusable: false,
          interactionWidth: 0,
          // `kind` is never read for a pointer edge — it's not a real edge
          // in the domain graph (see toArchitectureGraph in store.ts) and
          // never reaches EdgeInspector, so this value is just filler to
          // satisfy ArchitectureEdgeData's shape.
          data: { kind: "request-flow" },
          style: { stroke: "var(--foreground)", strokeWidth: 1.5, strokeDasharray: "4 4", opacity: 0.55 },
          markerEnd: { type: MarkerType.ArrowClosed, width: 14, height: 14, color: "var(--foreground)" },
        }),
      );
  }, [storeNodes]);

  const displayEdges = useMemo(
    () =>
      [...edges, ...pointerEdges].map((e) => {
        if (!highlightSets) return e;
        if (highlightSets.connectedEdgeIds.has(e.id)) {
          // Same gold as ComponentNode's ring (HIGHLIGHT_GOLD) — a connected
          // edge trades its own kind color for gold too, so the whole
          // highlighted path (nodes + edges) reads as one continuous
          // visual, not just a ring around each endpoint.
          return { ...e, style: { ...e.style, stroke: HIGHLIGHT_GOLD, strokeWidth: 2.5 } };
        }
        return { ...e, style: { ...e.style, opacity: 0.15, transition: "opacity 150ms ease-out" } };
      }),
    [edges, pointerEdges, highlightSets],
  );

  const showCursorHint =
    !insertHintDismissed && hoverPos && !menu && !placementMode && !pendingComponentPlacement && !componentPicker;

  return (
    <div
      className="relative h-full w-full"
      onMouseMove={(event) => setHoverPos({ x: event.clientX, y: event.clientY })}
      onMouseLeave={() => setHoverPos(null)}
    >
      <ReactFlow
        colorMode={colorMode}
        nodes={nodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
        onEdgeClick={(_, edge) => {
          setSelectedEdgeId(edge.id);
          setSelectedNodeId(null);
        }}
        onNodeClick={(_, node) => {
          setSelectedNodeId(node.id);
          setSelectedEdgeId(null);
        }}
        onNodeDoubleClick={(event, node) => {
          if (node.type !== "component") return;
          openConfigPopover(node.id, { x: event.clientX, y: event.clientY });
        }}
        onPaneClick={() => {
          setSelectedEdgeId(null);
          setSelectedNodeId(null);
          clearHighlight();
          onCanvasPaneClick?.();
        }}
        onNodeContextMenu={(event, node) => {
          event.preventDefault();
          // Right-clicking a different node than the one currently
          // highlighted clears the old highlight — see the Phase 4
          // "Highlight Connections" clear-triggers list in pending.md.
          // Picking "Highlight Connections"/"Highlight Zone" from the menu
          // that's about to open will set a fresh one right back if the
          // user chooses to.
          if (highlight && highlight.id !== node.id) clearHighlight();
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
          openComponentPicker();
        }}
        deleteKeyCode={["Backspace", "Delete"]}
        selectionOnDrag={!isConnecting}
        panOnDrag={[1]}
        nodesDraggable={!spaceHeld}
        // xyflow's default (true) bumps a selected node's z-index by 1000
        // above everything else — for a Zone, whose whole rectangle is one
        // large, semi-opaque, pointer-interactive div, that meant a
        // *selected* zone jumped on top of every component sitting inside
        // it, silently swallowing clicks meant for those components (you'd
        // have to click blank canvas or a different node first to
        // deselect the zone before a contained node became clickable
        // again). Zones are already pinned to zIndex: -1 at creation (see
        // store.ts's addZone) specifically so they stay behind components;
        // disabling this keeps that ordering permanent instead of letting
        // selection override it.
        elevateNodesOnSelect={false}
        proOptions={{ hideAttribution: true }}
        minZoom={0.25}
        fitView
        fitViewOptions={{ padding: 0.1, maxZoom: 1 }}
      >
        <Background />
        <Controls />
      </ReactFlow>
      <EdgeInspector />
      <ContextMenu target={menu} onClose={() => setMenu(null)} centerOnNode={centerOnNode} />
      <AnnotationEditor />
      <NodeConfigPopover />
      <ComponentPicker />
      {showCursorHint && <RightClickCursorHint pos={hoverPos} />}

      {placementMode && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 z-[var(--z-modal-backdrop)] -translate-x-1/2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
            {PLACEMENT_HINT[placementMode]}
          </div>
          <div
            onMouseDown={startPlacementDrag}
            className="absolute inset-0 z-[var(--z-modal-backdrop)] cursor-crosshair"
          />
        </>
      )}

      {pendingComponentPlacement && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 z-[var(--z-modal-backdrop)] -translate-x-1/2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
            Click to place {pendingComponentPlacement.label} · Hold Shift to place another · Esc to cancel
          </div>
          <div
            onMouseDown={placeComponent}
            className="absolute inset-0 z-[var(--z-modal-backdrop)] cursor-crosshair"
          />
        </>
      )}

      {pendingComponentPlacement &&
        ghostPos &&
        createPortal(
          // Follows the cursor so the user sees exactly what's about to
          // land before committing to a spot — same tile look as the
          // picker's own grid (ComponentPickerRow), just untethered.
          <div
            className="pointer-events-none fixed z-[var(--z-tooltip)] flex flex-col items-center gap-1"
            style={{ left: ghostPos.x + 12, top: ghostPos.y + 12 }}
          >
            {(() => {
              const Icon = iconMap[pendingComponentPlacement.icon] ?? Server;
              const color = categoryColorVar[pendingComponentPlacement.category];
              return (
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg border-2 opacity-80"
                  style={{ borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
              );
            })()}
          </div>,
          document.body,
        )}

      {previewRect &&
        createPortal(
          // Plain, static outline while dragging — a normal drag is enough
          // here; the annotation's own placed-state border (ZoneNode's
          // animated dash, CommentNode's plain neutral border) is what it
          // actually looks like once placed, not something the in-progress
          // drag needs to preempt.
          <div
            className="pointer-events-none fixed z-[var(--z-modal)] rounded-lg border border-dashed bg-panel/20"
            style={{
              left: previewRect.left,
              top: previewRect.top,
              width: previewRect.width,
              height: previewRect.height,
              borderColor:
                placementMode === "comment"
                  ? "color-mix(in srgb, var(--foreground) 50%, transparent)"
                  : "color-mix(in srgb, var(--zone, #ff3483) 75%, transparent)",
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
