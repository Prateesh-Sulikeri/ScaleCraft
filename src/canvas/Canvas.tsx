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
  ConnectionLineType,
  ConnectionMode,
  Controls,
  MarkerType,
  getNodesBounds,
  getViewportForBounds,
  useNodesInitialized,
  useReactFlow,
  useStoreApi,
  type Connection,
} from "@xyflow/react";
import { toJpeg, toPng } from "html-to-image";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { getComponent } from "@/content/components/registry";
import { pickDefaultKind } from "./legal-edge-kinds";
import { CARD_HEIGHT, CARD_WIDTH, CONNECTION_RADIUS } from "./card-geometry";
import { canConnect } from "./connection-rules";
import { ArchitectureEdge } from "./ArchitectureEdge";
import { EDGE_COLOR_VAR } from "./edge-styles";
import { isHandPlaced, reciprocalEdgeIds, routeCurvedEdge, PORT_IDS } from "./edge-routing";
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
import { HIGHLIGHT_GOLD } from "./selection-style";
import { useCanvasStore, type PlacementMode } from "./store";
import { isEditableTarget } from "./use-canvas-shortcuts";
import type { AnyNodeType, ArchitectureEdgeType, ValidationState } from "./types";
import type { ValidationViolation } from "@/engines";

const nodeTypes = { component: ComponentNode, zone: ZoneNode, comment: CommentNode, start: StartNode };
/** Only the real edges below get this type; a Start marker's pointer keeps
 * xyflow's default bezier, which is the same curve minus the bow. */
const edgeTypes = { architecture: ArchitectureEdge };

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

/** Breathing room around the graph when fitting it into view, as a fraction
 * of the pane. */
const FIT_PADDING = 0.1;
/** The zoom below which a card's 11px label stops being readable. A starter
 * graph is a wide left-to-right pipeline (CURRICULUM.md §11.5), so fitting
 * one to width can ask for 0.5 or less - past this floor the view stops
 * shrinking and starts panning instead (see fitGraphIntoView). */
const MIN_FIT_ZOOM = 0.7;

export type CanvasHandle = {
  exportImage: (opts: { format: "png" | "jpg"; backgroundColor?: string }) => Promise<void>;
};

type FlowCanvasProps = {
  /** Keyed by node id — derived from the latest validation run, merged into
   * node data at render time only. Never written back into the store: the
   * store holds the graph a user is editing, not validation results. */
  nodeStates?: Record<string, ValidationState>;
  /** The full last-Validate-run result, same source as `nodeStates` above
   * (page.tsx/ChapterWorkspace.tsx) — passed through untouched to
   * NodeConfigPopover/EdgeInspector (Step 3, D5/D14) so each can filter to
   * the violations naming the node or edge it's currently showing. Also
   * never written back into the store, for the same reason nodeStates isn't. */
  violations?: ValidationViolation[] | null;
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
  { nodeStates, violations, onCanvasPaneClick },
  ref,
) {
  const { screenToFlowPosition, getNodes, fitView, setViewport, zoomIn, zoomOut, zoomTo } = useReactFlow();

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

  /** Restates, for loose connectionMode, the direction rule that handle
   * types used to enforce geometrically. See canvas/connection-rules.ts. */
  const isValidConnection = useCallback(
    (connection: Connection | ArchitectureEdgeType) =>
      canConnect(
        storeNodes.find((n) => n.id === connection.source),
        storeNodes.find((n) => n.id === connection.target),
      ),
    [storeNodes],
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

  // The declarative `fitView` prop below only ever runs once, on mount —
  // xyflow doesn't auto-refit when its container resizes, and doesn't
  // clip its own overflow either (no `overflow: hidden` in its base
  // stylesheet), so a resize with no refit left the graph painted at its
  // old scale/position, overflowing past the container's new edge into
  // whatever sits next to it (the docs panel, when opening/closing it or
  // toggling focus mode resizes this wrapper). Re-fitting on every real
  // resize keeps the view honest instead. Debounced so a panel-width drag
  // (many resize events in a row) settles once, not on every frame.
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Fit, but never below the zoom where a card's label stops being readable,
   * and when that floor bites, anchor the view to the graph's **left** edge
   * rather than its centre.
   *
   * Starter graphs are one continuous left-to-right pipeline now
   * (CURRICULUM.md §11.5), so an eight-stage chapter is ~1940px wide and a
   * plain fit lands near 0.5 zoom - a 62px card carrying 5px type. Clamping
   * the zoom alone isn't enough: xyflow centres the bounds, which opens a
   * wide diagram in the middle of the pipeline. A flow diagram is read from
   * its entry point, so a clamped fit starts at the left and the learner
   * pans right, the same way they'd read the architecture itself.
   */
  const fitGraphIntoView = useCallback(
    (duration?: number) => {
      const el = wrapperRef.current;
      const bounds = getNodesBounds(getNodes());
      if (!el || bounds.width === 0 || bounds.height === 0) {
        fitView({ padding: FIT_PADDING, maxZoom: 1, duration });
        return;
      }
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      const viewport = getViewportForBounds(bounds, width, height, MIN_FIT_ZOOM, 1, FIT_PADDING);
      const overflowsHorizontally = bounds.width * viewport.zoom > width;
      setViewport(
        {
          ...viewport,
          x: overflowsHorizontally ? FIT_PADDING * width - bounds.x * viewport.zoom : viewport.x,
        },
        duration ? { duration } : undefined,
      );
    },
    [fitView, getNodes, setViewport],
  );

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    let isFirstObservation = true;
    let debounceId: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      if (isFirstObservation) {
        isFirstObservation = false;
        return;
      }
      clearTimeout(debounceId);
      debounceId = setTimeout(() => fitGraphIntoView(200), 120);
    });
    observer.observe(el);
    return () => {
      clearTimeout(debounceId);
      observer.disconnect();
    };
  }, [fitGraphIntoView]);

  // Same left-anchored, floor-clamped fit on mount, replacing <ReactFlow>'s
  // declarative `fitView` prop (which centres and has no zoom floor).
  //
  // Gated on useNodesInitialized rather than a rAF. xyflow measures nodes with
  // its own ResizeObserver, and zone/comment decorators carry their size in
  // `data` rather than on the node, so until that lands getNodesBounds returns
  // a box smaller than the drawing. The fit computed from it came out a few
  // percent too big and pushed the rightmost tier off the pane: bb-3-3 mounted
  // at zoom 0.95 against a correct 0.84, with its whole DATA zone off-screen at
  // a 1116px pane. One-shot, so a node the learner adds later never re-frames
  // the board under them.
  const nodesInitialized = useNodesInitialized();
  const hasFittedRef = useRef(false);
  useEffect(() => {
    // False while the canvas is empty, so on a canvas that starts with nothing
    // this fires at the first node instead of at mount - harmless (one node,
    // one fit) and the only case where the shot is not spent on a loaded graph.
    if (!nodesInitialized || hasFittedRef.current) return;
    hasFittedRef.current = true;
    fitGraphIntoView();
  }, [nodesInitialized, fitGraphIntoView]);

  const [menu, setMenu] = useState<ContextMenuTarget | null>(null);
  // Set on pointerdown on a handle, before any drag motion — disables
  // selectionOnDrag for the gesture's whole duration so a connection drag
  // that passes over an intervening node never also starts a selection box.
  const [isConnecting, setIsConnecting] = useState(false);
  /**
   * A click-to-connect is armed: one port has been clicked and the canvas is
   * waiting for the second click.
   *
   * React Flow arms this itself (`connectOnClick`, on by default) but never
   * disarms it - clicking empty canvas, pressing Escape, dragging a card and
   * clicking a card body all leave it armed, and the arm has no visible state
   * of its own. A stray click on a port therefore sat there indefinitely, and
   * the next port click anywhere on the board silently produced an edge
   * between two cards the learner never meant to join. Measured: all four of
   * those gestures leak.
   *
   * So the arm is mirrored here, shown (every legal port is revealed while it
   * is live, the same way a drag reveals them), and cancelled on every gesture
   * that plainly means "never mind".
   */
  const [isArmed, setIsArmed] = useState(false);
  const flowStore = useStoreApi();
  const cancelArmedConnection = useCallback(() => {
    // `connectionClickStartHandle` is React Flow's own arm state; there is no
    // public action to clear it, and leaving it set is the bug.
    flowStore.setState({ connectionClickStartHandle: null });
    setIsArmed(false);
  }, [flowStore]);

  /**
   * One rule disarms it: the next pointerdown that isn't on a port.
   *
   * Deliberately not a set of per-gesture handlers. The first attempt hung the
   * cancel off `onPaneClick`, `onNodeClick` and `onNodeDragStart`, and it
   * missed - `onPaneClick` does not fire while the pane is in selection mode,
   * which is most of the time, so clicking empty canvas still left the
   * connection armed. Anything that starts anywhere other than a port means
   * the learner has moved on, so that is what this listens for.
   *
   * Capture phase, so it runs before xyflow's own handler. Only attached while
   * armed, and the arming click itself is safe: `isArmed` is still false at
   * that pointerdown, so there is no listener yet.
   */
  useEffect(() => {
    if (!isArmed) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (target?.closest?.(".react-flow__handle")) return;
      cancelArmedConnection();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isArmed, cancelArmedConnection]);
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
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const mod = event.ctrlKey || event.metaKey;

      // Zoom shortcuts: Ctrl++ (zoom in), Ctrl+- (zoom out), Ctrl+0 (reset to 100%), Shift+1 (fit all), Shift+2 (fit selection)
      //
      // zoomIn/zoomOut/zoomTo (not a hand-rolled setViewport({x, y, zoom})) —
      // those call panZoom.scaleBy/scaleTo under the hood, which anchor the
      // zoom on the *center of the pane*, not flow-space (0,0). A manual
      // setViewport that keeps x/y fixed while only changing zoom instead
      // zooms toward the flow origin — usually off in a corner of whatever
      // the user is looking at, not the center of their current view. These
      // helpers also respect the minZoom/maxZoom props on <ReactFlow> below,
      // so the clamp lives in one place instead of being duplicated here.
      if (mod && (event.key === "+" || event.key === "=")) {
        event.preventDefault();
        zoomIn({ duration: 200 });
        return;
      }
      if (mod && event.key === "-") {
        event.preventDefault();
        zoomOut({ duration: 200 });
        return;
      }
      if (mod && event.key === "0") {
        event.preventDefault();
        zoomTo(1, { duration: 300 });
        return;
      }
      if (event.shiftKey && event.code === "Digit1") { // Shift+1
        event.preventDefault();
        fitGraphIntoView(300);
        return;
      }
      if (event.shiftKey && event.code === "Digit2") { // Shift+2
        event.preventDefault();
        const selectedNodes = getNodes().filter((n) => n.selected);
        if (selectedNodes.length > 0) {
          fitView({ nodes: selectedNodes, padding: 0.2, duration: 300 });
        }
        return;
      }

      if (event.key !== "Escape") return;
      // The picker handles its own Escape (closes itself, no placement/
      // highlight side effect) — bail here so this listener doesn't also
      // clear an unrelated highlight underneath it while it's open.
      if (componentPicker) return;
      // Ahead of placement and highlight: an armed connection is the most
      // recent thing the user started, so it is what Escape should undo.
      if (isArmed) {
        cancelArmedConnection();
        return;
      }
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
    },
    [zoomIn, zoomOut, zoomTo, fitView, fitGraphIntoView, getNodes, componentPicker, pendingComponentPlacement, setPendingComponentPlacement, placementMode, setPlacementMode, highlight, clearHighlight, isArmed, cancelArmedConnection],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

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

  const createOrUpdateNode = useCallback(
    (
      n: AnyNodeType,
      validationState?: ValidationState,
      highlighted?: boolean,
      draggableOverride?: boolean,
    ): AnyNodeType => {
      const style = dimStyle(n.id);
      const isHigh = highlighted ?? false;

      if (n.type === "component") {
        const shouldUpdateValidation = validationState !== n.data.validationState;
        const shouldUpdateHighlight = isHigh !== n.data.highlighted;
        if (!shouldUpdateValidation && !shouldUpdateHighlight) return n;
        return {
          ...n,
          data: {
            ...n.data,
            ...(shouldUpdateValidation && { validationState }),
            ...(shouldUpdateHighlight && { highlighted: isHigh }),
          },
          style,
        } as AnyNodeType;
      }

      if (n.type === "zone") {
        const shouldUpdateValidation = validationState !== n.data.validationState;
        const shouldUpdateHighlight = isHigh !== n.data.highlighted;
        const shouldUpdateDraggable = draggableOverride !== n.draggable;
        if (!shouldUpdateValidation && !shouldUpdateHighlight && !shouldUpdateDraggable) return n;
        return {
          ...n,
          data: {
            ...n.data,
            ...(shouldUpdateValidation && { validationState }),
            ...(shouldUpdateHighlight && { highlighted: isHigh }),
          },
          draggable: draggableOverride,
          style,
        } as AnyNodeType;
      }

      const shouldUpdateHighlight = isHigh !== n.data.highlighted;
      const shouldUpdateDraggable = draggableOverride !== n.draggable;
      if (!shouldUpdateHighlight && !shouldUpdateDraggable) return n;
      return {
        ...n,
        data: { ...n.data, ...(shouldUpdateHighlight && { highlighted: isHigh }) },
        draggable: draggableOverride,
        style,
      } as AnyNodeType;
    },
    [dimStyle],
  );

  const nodes = useMemo(
    () =>
      storeNodes.map((n): AnyNodeType => {
        const validationState = nodeStates?.[n.id];
        const highlighted = isHighlighted(n.id);
        const draggableOverride = (n.type === "zone" || n.type === "comment" || n.type === "start")
          ? !n.data.locked && !spaceHeld
          : undefined;
        return createOrUpdateNode(n, validationState, highlighted, draggableOverride);
      }),
    [storeNodes, nodeStates, spaceHeld, createOrUpdateNode, isHighlighted],
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
          targetHandle: PORT_IDS.top,
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

  // Where each card currently sits, for edge routing below. Read from the
  // store's own nodes rather than xyflow's measured internals so it's
  // available on the very first render, before any ResizeObserver has fired.
  const componentBoxes = useMemo(() => {
    const boxes = new Map<string, { x: number; y: number; width: number; height: number }>();
    for (const n of storeNodes) {
      if (n.type !== "component") continue;
      boxes.set(n.id, {
        x: n.position.x,
        y: n.position.y,
        width: n.data.width ?? CARD_WIDTH,
        height: n.data.height ?? CARD_HEIGHT,
      });
    }
    return boxes;
  }, [storeNodes]);

  // Curved connectors with a direction arrowhead, attached to the sides the
  // current layout actually calls for and bowed around anything standing in
  // the run (see canvas/edge-routing.ts + ArchitectureEdge.tsx). Routing still
  // matters - authored edges carry no handle ids, so xyflow was resolving
  // every one of them to Left/Right - but the path itself stays a curve:
  // right-angle connectors were tried and read as stiff/mechanical on an
  // editable board.
  //
  // Routing applies to authored edges *only*. An edge a learner drew carries
  // the two ports they dropped it on and keeps them: any port may join any
  // port so long as the connection is legal, and second-guessing that was the
  // original complaint here (a primary wired to its replica came back
  // re-attached right-side to right-side). `autoRouteEdge` in store.tsx hands
  // one back to the router if moving the cards has left it pointing oddly.
  //
  // For the edges this *does* route, handles are always directional (a
  // trailing side to a leading one) and the detour is in `data.bow`, not in
  // the ports: routing a blocked run by putting both ends on the same side is
  // a smoothstep idiom, and on a bezier it drew a straight line along the
  // blocker's border that looked like an output wired to an output.
  //
  // `animated` (xyflow's marching-ants dash) is left to store.tsx's
  // edgeStyle, which turns it on for every kind.
  //
  // Pointer edges are deliberately excluded: a Start marker's arrow names its
  // own `start-source`/`start-target` pair and is not part of the domain
  // graph.
  const routedEdges = useMemo(() => {
    const allBoxes = [...componentBoxes.values()];
    const reciprocal = reciprocalEdgeIds(edges);
    return edges.map((e) => {
      const source = componentBoxes.get(e.source);
      const target = componentBoxes.get(e.target);
      const route =
        !isHandPlaced(e) && source && target
          ? routeCurvedEdge(source, target, allBoxes, PORT_IDS, reciprocal.has(e.id))
          : null;
      return {
        ...e,
        ...(route ? { sourceHandle: route.sourceHandle, targetHandle: route.targetHandle } : {}),
        type: "architecture",
        // A hand-placed edge is drawn between the ports it was given and
        // nothing else. Bowing it would be the router overriding the choice
        // again, one step further down.
        data: { ...(e.data ?? { kind: "request-flow" as const }), bow: route?.bow ?? null },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 16,
          height: 16,
          color: EDGE_COLOR_VAR[e.data?.kind ?? "request-flow"],
        },
      };
    });
  }, [edges, componentBoxes]);

  const displayEdges = useMemo(
    () =>
      [...routedEdges, ...pointerEdges].map((e) => {
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
    [routedEdges, pointerEdges, highlightSets],
  );

  return (
    <div
      ref={wrapperRef}
      // Drives the "show every legal port" rule in globals.css for the
      // duration of a connection drag - xyflow exposes the per-handle
      // classes but nothing on the container saying a drag is in flight.
      // An armed click-to-connect gets the same treatment: it is a connection
      // in progress too, and until it showed something it was invisible.
      className={`relative h-full w-full${isConnecting || isArmed ? " sc-canvas-connecting" : ""}`}
    >
      <ReactFlow
        colorMode={colorMode}
        nodes={nodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        isValidConnection={isValidConnection}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={CONNECTION_RADIUS}
        // The wire being dragged curves the same way the edge it becomes
        // will - a preview of a different shape would misstate what is about
        // to be drawn.
        connectionLineType={ConnectionLineType.Bezier}
        onConnectStart={() => setIsConnecting(true)}
        onConnectEnd={() => setIsConnecting(false)}
        onClickConnectStart={() => setIsArmed(true)}
        onClickConnectEnd={() => setIsArmed(false)}
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
        maxZoom={4}
        // Plain wheel pans — panOnScrollMode defaults to "free", which pans
        // both axes off whatever deltaX/deltaY the wheel event carries, so
        // Shift+wheel already pans horizontally with no extra config (xyflow's
        // own handler converts deltaY into deltaX under Shift on non-Mac;
        // Mac trackpads/mice already deliver Shift+wheel as a native deltaX).
        // Holding the zoomActivationKeyCode below during a wheel/pinch
        // switches from panning to xyflow's native, cursor-centered
        // scroll-to-zoom instead — this also covers trackpad pinch for free,
        // since browsers deliver a pinch gesture as a wheel event with
        // ctrlKey:true, which xyflow's pan-on-scroll handler already
        // special-cases as zoom regardless of this activation key. Without
        // panOnScroll, xyflow's default (zoomOnScroll, no Ctrl required) has
        // *every* wheel tick zoom the canvas — the opposite of the spec'd
        // "wheel scrolls, Ctrl+wheel zooms" (see pending.md).
        panOnScroll
        zoomActivationKeyCode="Control"
      >
        <Background />
        {/* bottom-right, not xyflow's bottom-left default — that corner is
         * reserved app-wide for the persistent Release Notes button (see
         * ReleaseNotesButton.tsx, mounted in the root layout). */}
        <Controls position="bottom-right" />
      </ReactFlow>
      <EdgeInspector violations={violations} />
      <ContextMenu target={menu} onClose={() => setMenu(null)} centerOnNode={centerOnNode} />
      <AnnotationEditor />
      <NodeConfigPopover nodeStates={nodeStates} violations={violations} />
      <ComponentPicker />

      {placementMode && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 z-[var(--z-canvas-overlay)] -translate-x-1/2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
            {PLACEMENT_HINT[placementMode]}
          </div>
          <div
            onMouseDown={startPlacementDrag}
            className="absolute inset-0 z-[var(--z-canvas-overlay)] cursor-crosshair"
          />
        </>
      )}

      {pendingComponentPlacement && (
        <>
          <div className="pointer-events-none absolute left-1/2 top-4 z-[var(--z-canvas-overlay)] -translate-x-1/2 rounded-full border border-border bg-panel px-3 py-1.5 text-xs text-foreground/80 shadow-lg">
            Click to place {pendingComponentPlacement.label} · Hold Shift to place another · Esc to cancel
          </div>
          <div
            onMouseDown={placeComponent}
            className="absolute inset-0 z-[var(--z-canvas-overlay)] cursor-pointer"
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
            className="pointer-events-none fixed z-[var(--z-canvas-overlay)] flex flex-col items-center gap-1"
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
            className="pointer-events-none fixed z-[var(--z-canvas-overlay)] rounded-lg border border-dashed bg-panel/20"
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
