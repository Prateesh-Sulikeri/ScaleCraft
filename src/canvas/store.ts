import { create } from "zustand";
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge as rfAddEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from "@xyflow/react";
import type { ComponentDefinition } from "@/content/components/types";
import type { CustomComponentRecord } from "@/content/components/custom";
import type { ArchitectureGraph, EdgeKind, XY } from "@/lib/graph";
import type {
  AnyNodeType,
  ComponentNodeType,
  ZoneNodeData,
  CommentNodeData,
  StartNodeData,
  ArchitectureEdgeType,
} from "./types";
import { DEFAULT_ZONE_COLOR, DEFAULT_COMMENT_COLOR, DEFAULT_FLAG_COLOR } from "./annotation-colors";

/** What the palette's "Add zone"/"Add comment"/"Add start" buttons put the
 * canvas into — one mutually-exclusive placement mode rather than three
 * parallel booleans, so Canvas.tsx's drag-gesture/Escape-cancel/preview
 * logic branches once instead of tripling itself per annotation type. */
export type PlacementMode = "zone" | "comment" | "start" | null;

/** Color + line pattern per kind (see globals.css's --edge-* tokens) — two
 * redundant channels so kind is legible even for colorblind users or at
 * small canvas scale, not color alone. Every kind animates (see
 * DESIGN.md's "Do reuse the dashdraw motion token for anything that should
 * read as part of the live system") — a real connection is a real
 * connection regardless of kind, so request-flow doesn't get a motion
 * signal the other three don't. */
const EDGE_COLOR_VAR: Record<EdgeKind, string> = {
  "request-flow": "var(--edge-request-flow)",
  control: "var(--edge-control)",
  replication: "var(--edge-replication)",
  async: "var(--edge-async)",
};

const EDGE_DASH_ARRAY: Partial<Record<EdgeKind, string>> = {
  control: "2 3",
  replication: "6 3",
  async: "3 6",
};

function edgeStyle(kind: EdgeKind) {
  return {
    animated: true,
    style: {
      stroke: EDGE_COLOR_VAR[kind],
      ...(EDGE_DASH_ARRAY[kind] ? { strokeDasharray: EDGE_DASH_ARRAY[kind] } : {}),
    },
  };
}

/** A scoped alternative to a full undo/redo history stack — only delete is
 * risky enough (permanent, one click, no confirmation) to need a safety
 * net; every other mutation stays a plain, un-undoable action. `mode`
 * decides how `undoLastDelete` restores the snapshot: "merge" adds it back
 * onto whatever's there now (a delete changed nothing else), "replace"
 * discards current state in favor of the snapshot (clear board / restore
 * last save already replaced state with something else, so adding back on
 * top would merge two full graphs together instead of reverting). */
export type PendingUndo = {
  nodes: AnyNodeType[];
  edges: ArchitectureEdgeType[];
  label: string;
  mode: "merge" | "replace";
  at: number;
};

const UNDO_MERGE_WINDOW_MS = 200;

/** A general-purpose undo/redo history stack, additive alongside
 * `pendingUndo` above rather than replacing it — `pendingUndo` stays exactly
 * as-is (it drives the delete-specific UndoToast), this separately backs
 * Ctrl+Z/Ctrl+Shift+Z for every kind of edit (move, resize, type, add,
 * connect, delete, ...). Each entry is a full nodes/edges snapshot rather
 * than a diff — simpler and correct for a canvas this size, no risk of
 * partial-patch drift.
 *
 * `key` is what makes continuous gestures (dragging a node, resizing an
 * annotation, typing into a label) collapse into ONE history entry instead
 * of one per animation frame / keystroke: calls sharing the same key within
 * HISTORY_MERGE_WINDOW_MS of each other coalesce, keeping the *first* call's
 * pre-edit snapshot rather than the latest one. Discrete actions (add a
 * node, delete, connect, duplicate, ...) pass a fresh crypto.randomUUID() so
 * they never coalesce with anything and always get their own undo step.
 */
type HistoryEntry = { nodes: AnyNodeType[]; edges: ArchitectureEdgeType[]; key: string; at: number };

const HISTORY_MERGE_WINDOW_MS = 500;
const MAX_HISTORY = 50;

function pushHistory(
  past: HistoryEntry[],
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
  key: string,
): HistoryEntry[] {
  const top = past[past.length - 1];
  if (top && top.key === key && Date.now() - top.at < HISTORY_MERGE_WINDOW_MS) {
    return [...past.slice(0, -1), { ...top, at: Date.now() }];
  }
  return [...past, { nodes, edges, key, at: Date.now() }].slice(-MAX_HISTORY);
}

function undoLabel(nodes: AnyNodeType[], edges: ArchitectureEdgeType[]): string {
  const nodeWord = nodes.length === 1 ? "item" : "items";
  const edgeWord = edges.length === 1 ? "connection" : "connections";
  if (nodes.length > 0 && edges.length > 0) {
    return `${nodes.length} ${nodeWord} and ${edges.length} ${edgeWord} deleted`;
  }
  if (nodes.length > 0) return `${nodes.length} ${nodeWord} deleted`;
  return `${edges.length} ${edgeWord} deleted`;
}

/** A Start marker's `targetId` (see StartNode.tsx) points at a component id
 * directly, not via a real edge — so deleting that component doesn't clean
 * itself up the way an edge would via onEdgesChange. Called from every node
 * removal path (onNodesChange, deleteNode, deleteNodes) so a Start marker
 * never keeps pointing at a node that no longer exists. */
function pruneStartTargets(nodes: AnyNodeType[], removedIds: Set<string>): AnyNodeType[] {
  return nodes.map((n) =>
    n.type === "start" && n.data.targetId && removedIds.has(n.data.targetId)
      ? { ...n, data: { ...n.data, targetId: null } }
      : n,
  );
}

/** Deleting a node also removes its connected edges via a SEPARATE
 * onNodesChange/onEdgesChange call (xyflow dispatches them independently,
 * order not guaranteed) — merging into a still-fresh pendingUndo (within
 * UNDO_MERGE_WINDOW_MS) rather than overwriting it is what keeps "delete a
 * connected node" as one combined undo entry regardless of which handler
 * runs first, instead of the second call clobbering the first's snapshot. */
function mergeIntoPendingUndo(
  current: PendingUndo | null,
  newNodes: AnyNodeType[],
  newEdges: ArchitectureEdgeType[],
): PendingUndo {
  if (current && current.mode === "merge" && Date.now() - current.at < UNDO_MERGE_WINDOW_MS) {
    const nodes = [...current.nodes, ...newNodes.filter((n) => !current.nodes.some((cn) => cn.id === n.id))];
    const edges = [...current.edges, ...newEdges.filter((e) => !current.edges.some((ce) => ce.id === e.id))];
    return { nodes, edges, label: undoLabel(nodes, edges), mode: "merge", at: current.at };
  }
  return { nodes: newNodes, edges: newEdges, label: undoLabel(newNodes, newEdges), mode: "merge", at: Date.now() };
}

/** One open documentation tab, keyed by componentId (not node id) — two node
 * instances of the same component share one tab rather than opening a
 * duplicate. `scrollTop` is written from an rAF-throttled onScroll handler
 * (see docs-panel/DocsTabContent.tsx), not on every pixel — same "changes
 * rarely enough to be cheap" reasoning that already applied to `minimized`
 * below, just now covering a value that changes continuously while
 * scrolling rather than on an explicit click, hence the throttle. This is
 * what lets minimizing and restoring the panel bring back the exact same
 * reading position instead of resetting to the top. */
export type DocsTab = {
  componentId: string;
  scrollTop: number;
};

export const MAX_DOCS_TABS = 8;

/** The docked documentation panel's whole state — tabs, which one is
 * active, minimized/focus-mode/width. Panel position/size are NOT
 * per-window anymore (this isn't a floating window): `minimized` removes it
 * from the layout entirely rather than collapsing it to a capsule, and
 * `width` is the drag-resized panel width, committed on mouseup (see
 * docs-panel/DocsPanel.tsx) so it survives a minimize/restore cycle. */
export type DocsPanelState = {
  tabs: DocsTab[];
  activeTabId: string | null;
  minimized: boolean;
  width: number;
  focusMode: boolean;
};

const DEFAULT_DOCS_PANEL_WIDTH = 420;

type CanvasStore = {
  nodes: AnyNodeType[];
  edges: ArchitectureEdgeType[];
  selectedEdgeId: string | null;
  selectedNodeId: string | null;

  /** Replaces the whole graph — used for seeding a demo/starter graph and,
   * later, loading a chapter's starterGraph or a persisted save. Zones
   * aren't part of ArchitectureGraph (see types.ts), so this never creates
   * any — it only ever replaces component nodes wholesale. */
  loadGraph: (graph: ArchitectureGraph) => void;
  /** Restores a raw canvas snapshot (see src/persistence/db.ts) — unlike
   * loadGraph, takes AnyNodeType[]/ArchitectureEdgeType[] directly instead
   * of mapping from ArchitectureGraph, so zones survive a restore. */
  loadCanvasState: (nodes: AnyNodeType[], edges: ArchitectureEdgeType[]) => void;
  addNode: (definition: ComponentDefinition, position: XY) => void;
  /** width/height default to the original fixed zone size — the
   * drag-to-draw gesture (see Canvas.tsx) passes explicit dimensions from
   * what the user drew; a plain click falls back to these defaults. Returns
   * the new node's id so the caller can immediately open its
   * AnnotationEditor popup (see editingAnnotation below). */
  addZone: (position: XY, width?: number, height?: number) => string;
  updateZone: (nodeId: string, patch: Partial<ZoneNodeData>) => void;
  /** width/height default to a fixed comment-note size — same drag-to-draw
   * vs. plain-click split as addZone. */
  addComment: (position: XY, width?: number, height?: number) => string;
  updateComment: (nodeId: string, patch: Partial<CommentNodeData>) => void;
  /** Flips `locked` on a zone/comment/flag — a locked annotation isn't
   * draggable, and a locked zone/comment also hides its NodeResizer handles
   * (see ZoneNode.tsx/CommentNode.tsx/StartNode.tsx), so it can't be bumped
   * or resized by accident once a diagram is arranged. A no-op on any other
   * node type. */
  toggleAnnotationLock: (nodeId: string) => void;
  /** Applies a NodeResizer result to a zone/comment/component — sets
   * position AND width/height together in one update. Resizing from a top
   * or left handle moves the node's anchor point (xyflow's NodeResizer
   * reports the new x/y for exactly this reason); a version that only wrote
   * width/height back (the original implementation) left the anchor stuck,
   * so resizing from those handles grew the box in the wrong direction —
   * the "weird movement" bug. Named for the mechanism (resize), not
   * "annotation" — component nodes use this too, see ComponentNode.tsx. */
  resizeNode: (nodeId: string, x: number, y: number, width: number, height: number) => void;
  /** Fixed size, no drag-to-draw — a flag never needs a drawn rectangle,
   * only a drop point. Returns the new node's id, same as addZone/addComment,
   * so the caller can open its AnnotationEditor popup right after placing it. */
  addStartMarker: (position: XY) => string;
  updateStartMarker: (nodeId: string, patch: Partial<StartNodeData>) => void;
  /** Which annotation the user is currently placing — set by the palette's
   * "Add zone"/"Add comment"/"Add flag" buttons, cleared on placement or
   * Escape. See Canvas.tsx. */
  placementMode: PlacementMode;
  setPlacementMode: (mode: PlacementMode) => void;
  /** Drives the AnnotationEditor popup (color + label/text for a single
   * Zone or Comment node) — opened automatically right after a Zone/Comment
   * is placed (see Canvas.tsx), and reopenable any time via the Pencil
   * button ZoneNode/CommentNode show while selected. `anchor` is a real
   * screen/viewport point (e.g. a click event's clientX/clientY), not a
   * flow-space position — the popup is a fixed-position overlay, not a
   * canvas node. Living in the store (not local component state) is what
   * lets a deeply-nested node component (ZoneNode's edit button) trigger it
   * directly, same reasoning as selectedNodeId/docsPanel. */
  editingAnnotation: { id: string; anchor: { x: number; y: number } } | null;
  openAnnotationEditor: (id: string, anchor: { x: number; y: number }) => void;
  closeAnnotationEditor: () => void;
  /** Drives NodeConfigPopover.tsx — the contextual popover that replaced
   * NodeInspector's permanent sidebar (see .claude/docs/pending.md Phase 2).
   * Mirrors editingAnnotation exactly: same anchor-point shape, same
   * cleanup-on-delete/undo/redo handling below, just for a component node's
   * name + config instead of a zone/comment/flag's color + label. */
  configPopover: { nodeId: string; anchor: { x: number; y: number } } | null;
  openConfigPopover: (nodeId: string, anchor: { x: number; y: number }) => void;
  closeConfigPopover: () => void;
  /** Drives the Phase 4 "Highlight Connections"/"Highlight Zone"
   * context-menu actions — Canvas.tsx derives the highlighted node/edge id
   * sets from this each render and dims everything else via node/edge
   * `style.opacity`, rather than having every node subscribe to this
   * directly (only a few nodes care at any one time). "connections" walks
   * the graph from one component node to its direct neighbors;
   * "zone" is spatial instead of graph-based — every node whose position
   * falls inside the given zone's rectangle, plus every edge between two
   * such nodes (see Canvas.tsx's highlightSets). Both variants share one
   * `id` field (the origin node's id) so cleanup logic doesn't need to
   * branch on `mode`. Cleared on pane click, Escape, right-clicking a
   * different node (see Canvas.tsx), and on delete/undo/redo/clearBoard
   * (mirrors configPopover's cleanup below) so it never points at a node
   * that no longer exists. */
  highlight: { mode: "connections" | "zone"; id: string } | null;
  setHighlight: (highlight: { mode: "connections" | "zone"; id: string } | null) => void;
  clearHighlight: () => void;
  onNodesChange: (changes: NodeChange<AnyNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange<ArchitectureEdgeType>[]) => void;
  /** `kind` is optional so any direct caller (tests, etc.) still gets the
   * old always-request-flow behavior — Canvas.tsx's onConnect wrapper is
   * what actually computes a category-aware default via
   * canvas/legal-edge-kinds.ts's pickDefaultKind before calling this,
   * rather than this store method reaching into the component registry
   * itself (which would import registry.ts, which itself imports this
   * store for custom components — see Canvas.tsx's onConnect wrapper). */
  onConnect: (connection: Connection, kind?: EdgeKind) => void;
  setEdgeKind: (edgeId: string, kind: EdgeKind) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  /** Independent of node selection/inspector state entirely — the docs
   * panel stays open across deselecting a node, collapsing another panel,
   * or selecting a different node. Tabs ordered by open time; capped at
   * MAX_DOCS_TABS. See NodeConfigPopover.tsx/ContextMenu.tsx for the two
   * trigger points, and docs-panel/DocsPanel.tsx for where this renders. */
  docsPanel: DocsPanelState;
  /** De-dupes by componentId (switches to the existing tab rather than
   * opening a duplicate) and always un-minimizes — this single action is
   * what makes reopening a doc from a node act as "restore." */
  openDocTab: (componentId: string) => void;
  /** Closing the active tab activates its left neighbor, or null if none
   * remain. */
  closeDocTab: (componentId: string) => void;
  closeAllDocTabs: () => void;
  setActiveDocTab: (componentId: string) => void;
  setDocTabScroll: (componentId: string, scrollTop: number) => void;
  setDocsPanelMinimized: (minimized: boolean) => void;
  setDocsPanelWidth: (width: number) => void;
  /** The toolbar Documentation button — flips `minimized`. */
  toggleDocsPanel: () => void;
  setFocusMode: (on: boolean) => void;
  toggleFocusMode: () => void;
  /** Config panel (milestone 2) writes here — kept separate from
   * onNodesChange since it's a data update, not a position/selection one. */
  updateNodeConfig: (nodeId: string, config: unknown) => void;
  /** A user-chosen instance label ("server-1-ind"), distinct from the
   * ComponentDefinition's fixed type label ("Application Server") — see
   * ComponentNodeData. Optional; shown on the canvas card when set, and
   * used to disambiguate same-type nodes in the Start marker's target
   * picker (see component-display-name.ts). */
  updateNodeName: (nodeId: string, name: string) => void;
  /** Per-instance description shown in NodeConfigPopover, seeded from
   * `ComponentDefinition.summary` there but editable per node — see
   * ComponentNodeData.description. */
  updateNodeDescription: (nodeId: string, description: string) => void;
  /** Explicit actions for the right-click context menu — a second path to
   * delete besides the deleteKeyCode shortcut, see EdgeInspector/ContextMenu. */
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  deleteEdge: (edgeId: string) => void;
  /** The one delete-safety-net this app has — not a full undo/redo stack,
   * just a short grace window after a delete (see UndoToast.tsx). Captured
   * by every delete path, including xyflow's own keyboard delete which
   * bypasses deleteNode/deleteNodes/deleteEdge entirely (see onNodesChange/
   * onEdgesChange below). */
  pendingUndo: PendingUndo | null;
  undoLastDelete: () => void;
  dismissUndo: () => void;
  /** General undo/redo history — see the HistoryEntry comment above.
   * Exposed as plain arrays (not a derived canUndo/canRedo boolean) so
   * components select `past.length > 0` themselves rather than the store
   * carrying redundant derived state that could drift out of sync. */
  past: HistoryEntry[];
  future: HistoryEntry[];
  undo: () => void;
  redo: () => void;
  /** Wipes the board — a no-op if it's already empty. Snapshots the prior
   * nodes/edges as a "replace"-mode pendingUndo first, so the same
   * UndoToast that covers delete also covers this. See BoardMenu.tsx. */
  clearBoard: () => void;
  /** Snapshots current nodes/edges as a "replace"-mode pendingUndo without
   * otherwise touching state — for a caller about to overwrite nodes/edges
   * itself (e.g. restoring the last save via loadCanvasState) so that
   * replacement is undoable too. A no-op if the board is already empty. */
  snapshotForUndo: (label: string) => void;
  duplicateNode: (nodeId: string) => void;
  /** Clones the whole set with an offset, remapping and preserving edges
   * that ran *between* duplicated nodes (not edges to nodes outside the
   * set — a partial duplicate shouldn't invent a new external connection). */
  duplicateNodes: (nodeIds: string[]) => void;
  reverseEdge: (edgeId: string) => void;
  /** User-created components (see CreateComponentModal.tsx) — the raw,
   * editable records, not derived ComponentDefinitions. registry.ts's
   * getComponent/getAllComponents build a real ComponentDefinition from a
   * record on demand (via content/components/custom.ts's
   * toComponentDefinition) — keeping the record as the source of truth
   * here, rather than a derived definition, is what makes editing
   * possible: a placed ComponentDefinition's live Zod configSchema can't be
   * un-rendered back into editable field specs. This is in-memory state
   * only — same convention as `nodes`/`edges`: the store doesn't do
   * persistence I/O itself. CreateComponentModal's submit handler writes to
   * src/persistence/db.ts's customComponents table AND calls
   * upsertCustomComponent in the same handler; the Sandbox page loads from
   * that table into here on mount (mirrors how it already restores a
   * canvas save). */
  customComponents: CustomComponentRecord[];
  upsertCustomComponent: (record: CustomComponentRecord) => void;
  deleteCustomComponent: (id: string) => void;
  loadCustomComponents: (records: CustomComponentRecord[]) => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedEdgeId: null,
  selectedNodeId: null,
  highlight: null,
  // Starts minimized — the panel shouldn't claim canvas space until the
  // user actually opens a doc (openDocTab un-minimizes) or clicks the
  // toolbar toggle; nothing should default to open on a fresh load.
  docsPanel: {
    tabs: [],
    activeTabId: null,
    minimized: true,
    width: DEFAULT_DOCS_PANEL_WIDTH,
    focusMode: false,
  },
  placementMode: null,
  editingAnnotation: null,
  configPopover: null,
  pendingUndo: null,
  past: [],
  future: [],
  customComponents: [],

  loadGraph: (graph) => {
    set((state) => ({
      nodes: graph.nodes.map((n) => ({
        id: n.id,
        type: "component",
        position: n.position,
        data: { componentId: n.componentId, config: n.config },
      })),
      edges: graph.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        data: { kind: e.kind },
        ...edgeStyle(e.kind),
      })),
      selectedEdgeId: null,
      selectedNodeId: null,
      // Skipped when the board is already empty — the common case is
      // seeding the initial demo graph on mount, which shouldn't be a step
      // Ctrl+Z can walk back into.
      past:
        state.nodes.length === 0 && state.edges.length === 0
          ? state.past
          : pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  loadCanvasState: (nodes, edges) => {
    set((state) => ({
      nodes: nodes.map((n) => ({ ...n, selected: false })),
      edges: edges.map((e) => ({ ...e, selected: false })),
      selectedEdgeId: null,
      selectedNodeId: null,
      past:
        state.nodes.length === 0 && state.edges.length === 0
          ? state.past
          : pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  addNode: (definition, position) => {
    const node: ComponentNodeType = {
      id: crypto.randomUUID(),
      type: "component",
      position,
      data: { componentId: definition.id, config: definition.defaultConfig },
    };
    set((state) => ({
      nodes: [...state.nodes, node],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  addZone: (position, width = 320, height = 220) => {
    const id = crypto.randomUUID();
    // Negative zIndex keeps zones rendered behind component nodes
    // regardless of array order, so grouped components always sit "on top."
    const zone: AnyNodeType = {
      id,
      type: "zone",
      position,
      zIndex: -1,
      // Empty by default (not "Zone") — a pre-filled bold uppercase-tracked
      // value reads as a rendering glitch at a glance ("ZO NE"); the muted
      // placeholder text does the same job without that risk.
      data: { label: "", width, height, color: DEFAULT_ZONE_COLOR },
    };
    set((state) => ({
      nodes: [...state.nodes, zone],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
    return id;
  },

  updateZone: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "zone" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `zone:${nodeId}`),
      future: [],
    }));
  },

  addComment: (position, width = 176, height = 60) => {
    const id = crypto.randomUUID();
    const comment: AnyNodeType = {
      id,
      type: "comment",
      position,
      data: { text: "", width, height, color: DEFAULT_COMMENT_COLOR },
    };
    set((state) => ({
      nodes: [...state.nodes, comment],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
    return id;
  },

  updateComment: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "comment" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `comment:${nodeId}`),
      future: [],
    }));
  },

  toggleAnnotationLock: (nodeId) => {
    // Branched per literal node type, not a generic `||` guard — narrowing
    // a discriminated union only works one member at a time (see
    // AnnotationEditor.tsx's identical comment); spreading ZoneNodeData |
    // CommentNodeData | StartNodeData back doesn't type-check against any
    // one member alone.
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        if (n.type === "zone") return { ...n, data: { ...n.data, locked: !n.data.locked } };
        if (n.type === "comment") return { ...n, data: { ...n.data, locked: !n.data.locked } };
        if (n.type === "start") return { ...n, data: { ...n.data, locked: !n.data.locked } };
        return n;
      }),
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  resizeNode: (nodeId, x, y, width, height) => {
    set((state) => ({
      nodes: state.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        if (n.type === "zone") return { ...n, position: { x, y }, data: { ...n.data, width, height } };
        if (n.type === "comment") return { ...n, position: { x, y }, data: { ...n.data, width, height } };
        if (n.type === "component") return { ...n, position: { x, y }, data: { ...n.data, width, height } };
        return n;
      }),
      past: pushHistory(state.past, state.nodes, state.edges, `resize:${nodeId}`),
      future: [],
    }));
  },

  addStartMarker: (position) => {
    const id = crypto.randomUUID();
    const marker: AnyNodeType = {
      id,
      type: "start",
      position,
      data: { label: "", targetId: null, color: DEFAULT_FLAG_COLOR },
    };
    set((state) => ({
      nodes: [...state.nodes, marker],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
    return id;
  },

  updateStartMarker: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "start" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `start:${nodeId}`),
      future: [],
    }));
  },

  setPlacementMode: (mode) => set({ placementMode: mode }),

  openAnnotationEditor: (id, anchor) => set({ editingAnnotation: { id, anchor } }),
  closeAnnotationEditor: () => set({ editingAnnotation: null }),

  openConfigPopover: (nodeId, anchor) => set({ configPopover: { nodeId, anchor } }),
  closeConfigPopover: () => set({ configPopover: null }),

  setHighlight: (highlight) => set({ highlight }),
  clearHighlight: () => set({ highlight: null }),

  onNodesChange: (changes) => {
    set((state) => {
      const removedIds = changes.filter((c) => c.type === "remove").map((c) => c.id);
      const isDrag = changes.some((c) => c.type === "position");
      // Same fixed key ("remove") as onEdgesChange below — deleting a
      // connected node dispatches two separate calls (this one for the
      // node, a separate onEdgesChange for its edge), and the shared key
      // lets the merge-window coalescing in pushHistory collapse them into
      // one undo step regardless of which fires first, mirroring the
      // existing pendingUndo dedup logic just below.
      const historyKey = removedIds.length > 0 ? "remove" : isDrag ? "move" : null;
      const past = historyKey ? pushHistory(state.past, state.nodes, state.edges, historyKey) : state.past;
      const future = historyKey ? [] : state.future;
      const nextNodes = applyNodeChanges(changes, state.nodes);
      if (removedIds.length === 0) return { nodes: nextNodes, past, future };
      const removedIdSet = new Set(removedIds);
      const removedNodes = state.nodes.filter((n) => removedIdSet.has(n.id));
      // Connected edges are removed via a separate onEdgesChange call, not
      // this one — capture them here too (from pre-change state.edges) so
      // "delete a connected node" is one undo entry, not just the node.
      const removedEdges = state.edges.filter((e) => removedIdSet.has(e.source) || removedIdSet.has(e.target));
      return {
        nodes: pruneStartTargets(nextNodes, removedIdSet),
        editingAnnotation:
          state.editingAnnotation && removedIdSet.has(state.editingAnnotation.id)
            ? null
            : state.editingAnnotation,
        configPopover:
          state.configPopover && removedIdSet.has(state.configPopover.nodeId) ? null : state.configPopover,
        highlight: state.highlight && removedIdSet.has(state.highlight.id) ? null : state.highlight,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
        past,
        future,
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const removedIds = changes.filter((c) => c.type === "remove").map((c) => c.id);
      const past =
        removedIds.length > 0 ? pushHistory(state.past, state.nodes, state.edges, "remove") : state.past;
      const future = removedIds.length > 0 ? [] : state.future;
      const nextEdges = applyEdgeChanges(changes, state.edges);
      if (removedIds.length === 0) return { edges: nextEdges };
      const removedIdSet = new Set(removedIds);
      // If a concurrent node deletion already captured these exact edges
      // (see onNodesChange), skip — merging again would double-count them.
      const alreadyCaptured =
        state.pendingUndo &&
        Date.now() - state.pendingUndo.at < UNDO_MERGE_WINDOW_MS &&
        removedIds.every((id) => state.pendingUndo!.edges.some((e) => e.id === id));
      if (alreadyCaptured) return { edges: nextEdges, past, future };
      const removedEdges = state.edges.filter((e) => removedIdSet.has(e.id));
      return {
        edges: nextEdges,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, [], removedEdges),
        past,
        future,
      };
    });
  },

  onConnect: (connection, kind = "request-flow") => {
    set((state) => ({
      edges: rfAddEdge<ArchitectureEdgeType>(
        {
          ...connection,
          id: crypto.randomUUID(),
          data: { kind },
          ...edgeStyle(kind),
        },
        state.edges,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  setEdgeKind: (edgeId, kind) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { kind }, ...edgeStyle(kind) } : e,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  openDocTab: (componentId) => {
    set((state) => {
      const exists = state.docsPanel.tabs.some((t) => t.componentId === componentId);
      const atCap = state.docsPanel.tabs.length >= MAX_DOCS_TABS;
      const tabs =
        exists || atCap ? state.docsPanel.tabs : [...state.docsPanel.tabs, { componentId, scrollTop: 0 }];
      return {
        docsPanel: {
          ...state.docsPanel,
          tabs,
          // Switches to it regardless of whether it already existed —
          // "selecting an already-open document switches to that tab."
          activeTabId: exists || !atCap ? componentId : state.docsPanel.activeTabId,
          minimized: false,
        },
      };
    });
  },

  closeDocTab: (componentId) => {
    set((state) => {
      const index = state.docsPanel.tabs.findIndex((t) => t.componentId === componentId);
      if (index === -1) return {};
      const tabs = state.docsPanel.tabs.filter((t) => t.componentId !== componentId);
      const wasActive = state.docsPanel.activeTabId === componentId;
      const activeTabId = wasActive
        ? (tabs[Math.max(0, index - 1)]?.componentId ?? null)
        : state.docsPanel.activeTabId;
      return { docsPanel: { ...state.docsPanel, tabs, activeTabId } };
    });
  },

  closeAllDocTabs: () => {
    set((state) => ({ docsPanel: { ...state.docsPanel, tabs: [], activeTabId: null } }));
  },

  setActiveDocTab: (componentId) => {
    set((state) => ({ docsPanel: { ...state.docsPanel, activeTabId: componentId } }));
  },

  setDocTabScroll: (componentId, scrollTop) => {
    set((state) => ({
      docsPanel: {
        ...state.docsPanel,
        tabs: state.docsPanel.tabs.map((t) => (t.componentId === componentId ? { ...t, scrollTop } : t)),
      },
    }));
  },

  setDocsPanelMinimized: (minimized) => {
    set((state) => ({ docsPanel: { ...state.docsPanel, minimized } }));
  },

  setDocsPanelWidth: (width) => {
    set((state) => ({ docsPanel: { ...state.docsPanel, width } }));
  },

  toggleDocsPanel: () => {
    set((state) => ({ docsPanel: { ...state.docsPanel, minimized: !state.docsPanel.minimized } }));
  },

  setFocusMode: (on) => {
    set((state) => ({ docsPanel: { ...state.docsPanel, focusMode: on } }));
  },

  toggleFocusMode: () => {
    set((state) => ({ docsPanel: { ...state.docsPanel, focusMode: !state.docsPanel.focusMode } }));
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "component" ? { ...n, data: { ...n.data, config } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `config:${nodeId}`),
      future: [],
    }));
  },

  updateNodeName: (nodeId, name) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "component" ? { ...n, data: { ...n.data, name } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `name:${nodeId}`),
      future: [],
    }));
  },

  updateNodeDescription: (nodeId, description) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "component" ? { ...n, data: { ...n.data, description } } : n,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, `description:${nodeId}`),
      future: [],
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => {
      const removedNodes = state.nodes.filter((n) => n.id === nodeId);
      const removedEdges = state.edges.filter((e) => e.source === nodeId || e.target === nodeId);
      const idSet = new Set([nodeId]);
      return {
        nodes: pruneStartTargets(
          state.nodes.filter((n) => n.id !== nodeId),
          idSet,
        ),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        editingAnnotation: state.editingAnnotation?.id === nodeId ? null : state.editingAnnotation,
        configPopover: state.configPopover?.nodeId === nodeId ? null : state.configPopover,
        highlight: state.highlight?.id === nodeId ? null : state.highlight,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
        past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
        future: [],
      };
    });
  },

  deleteNodes: (nodeIds) => {
    const idSet = new Set(nodeIds);
    set((state) => {
      const removedNodes = state.nodes.filter((n) => idSet.has(n.id));
      const removedEdges = state.edges.filter((e) => idSet.has(e.source) || idSet.has(e.target));
      return {
        nodes: pruneStartTargets(
          state.nodes.filter((n) => !idSet.has(n.id)),
          idSet,
        ),
        edges: state.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
        selectedNodeId: state.selectedNodeId && idSet.has(state.selectedNodeId) ? null : state.selectedNodeId,
        editingAnnotation:
          state.editingAnnotation && idSet.has(state.editingAnnotation.id) ? null : state.editingAnnotation,
        configPopover:
          state.configPopover && idSet.has(state.configPopover.nodeId) ? null : state.configPopover,
        highlight: state.highlight && idSet.has(state.highlight.id) ? null : state.highlight,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
        past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
        future: [],
      };
    });
  },

  deleteEdge: (edgeId) => {
    set((state) => {
      const removedEdges = state.edges.filter((e) => e.id === edgeId);
      return {
        edges: state.edges.filter((e) => e.id !== edgeId),
        selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, [], removedEdges),
        past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
        future: [],
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.past.length === 0) return {};
      const entry = state.past[state.past.length - 1];
      return {
        nodes: entry.nodes,
        edges: entry.edges,
        past: state.past.slice(0, -1),
        future: [...state.future, { nodes: state.nodes, edges: state.edges, key: entry.key, at: Date.now() }].slice(
          -MAX_HISTORY,
        ),
        selectedNodeId: null,
        selectedEdgeId: null,
        editingAnnotation: null,
        configPopover: null,
        highlight: null,
      };
    });
  },

  redo: () => {
    set((state) => {
      if (state.future.length === 0) return {};
      const entry = state.future[state.future.length - 1];
      return {
        nodes: entry.nodes,
        edges: entry.edges,
        future: state.future.slice(0, -1),
        past: [...state.past, { nodes: state.nodes, edges: state.edges, key: entry.key, at: Date.now() }].slice(
          -MAX_HISTORY,
        ),
        selectedNodeId: null,
        selectedEdgeId: null,
        editingAnnotation: null,
        configPopover: null,
        highlight: null,
      };
    });
  },

  undoLastDelete: () => {
    set((state) => {
      if (!state.pendingUndo) return {};
      if (state.pendingUndo.mode === "replace") {
        return { nodes: state.pendingUndo.nodes, edges: state.pendingUndo.edges, pendingUndo: null };
      }
      return {
        nodes: [...state.nodes, ...state.pendingUndo.nodes],
        edges: [...state.edges, ...state.pendingUndo.edges],
        pendingUndo: null,
      };
    });
  },

  dismissUndo: () => set({ pendingUndo: null }),

  clearBoard: () => {
    set((state) => {
      if (state.nodes.length === 0 && state.edges.length === 0) return {};
      return {
        nodes: [],
        edges: [],
        selectedNodeId: null,
        selectedEdgeId: null,
        editingAnnotation: null,
        configPopover: null,
        highlight: null,
        pendingUndo: { nodes: state.nodes, edges: state.edges, label: "Board cleared", mode: "replace", at: Date.now() },
        past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
        future: [],
      };
    });
  },

  snapshotForUndo: (label) => {
    set((state) => {
      if (state.nodes.length === 0 && state.edges.length === 0) return {};
      return {
        pendingUndo: { nodes: state.nodes, edges: state.edges, label, mode: "replace", at: Date.now() },
      };
    });
  },

  duplicateNode: (nodeId) => {
    const source = get().nodes.find((n) => n.id === nodeId);
    if (!source) return;
    const clone: AnyNodeType = {
      ...source,
      id: crypto.randomUUID(),
      position: { x: source.position.x + 32, y: source.position.y + 32 },
      selected: false,
    };
    set((state) => ({
      nodes: [...state.nodes, clone],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  duplicateNodes: (nodeIds) => {
    const idSet = new Set(nodeIds);
    const { nodes, edges } = get();
    const idMap = new Map<string, string>();
    const clones = nodes
      .filter((n) => idSet.has(n.id))
      .map((n) => {
        const newId = crypto.randomUUID();
        idMap.set(n.id, newId);
        return {
          ...n,
          id: newId,
          position: { x: n.position.x + 32, y: n.position.y + 32 },
          selected: false,
        };
      });
    const clonedEdges = edges
      .filter((e) => idSet.has(e.source) && idSet.has(e.target))
      .map((e) => ({
        ...e,
        id: crypto.randomUUID(),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }));
    set((state) => ({
      nodes: [...state.nodes, ...clones],
      edges: [...state.edges, ...clonedEdges],
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  reverseEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, source: e.target, target: e.source } : e,
      ),
      past: pushHistory(state.past, state.nodes, state.edges, crypto.randomUUID()),
      future: [],
    }));
  },

  upsertCustomComponent: (record) => {
    set((state) => {
      const exists = state.customComponents.some((c) => c.id === record.id);
      return {
        customComponents: exists
          ? state.customComponents.map((c) => (c.id === record.id ? record : c))
          : [...state.customComponents, record],
      };
    });
  },

  deleteCustomComponent: (id) => {
    set((state) => ({ customComponents: state.customComponents.filter((c) => c.id !== id) }));
  },

  loadCustomComponents: (records) => {
    set({ customComponents: records });
  },
}));

/** Pure — the store's RF-shaped state translated to the domain graph the
 * validation engine (and, later, persistence) operate on. See
 * .claude/docs/ARCHITECTURE.md ("Architecture Graph"). Zone/comment/start
 * nodes are a canvas presentation concept, not part of the domain model —
 * filtered out here rather than ever reaching the validation engine. A Start
 * marker's pointer arrow (see StartNode.tsx/Canvas.tsx) isn't in `edges` at
 * all — it's a derived, canvas-only visual computed straight from the
 * marker's `targetId` field, so there's nothing from it to filter here. */
export function toArchitectureGraph(
  nodes: AnyNodeType[],
  edges: ArchitectureEdgeType[],
): ArchitectureGraph {
  const componentNodes = nodes.filter((n): n is ComponentNodeType => n.type === "component");
  const componentIds = new Set(componentNodes.map((n) => n.id));
  const componentEdges = edges.filter((e) => componentIds.has(e.source) && componentIds.has(e.target));
  // A Start marker's targetId is a canvas-only pointer, never a real edge
  // (see the comment above) — surfaced separately so an orphan check can
  // treat the node it points at as connected without needing a fake edge.
  const entryPointIds = nodes
    .filter((n): n is AnyNodeType & { type: "start"; data: StartNodeData } => n.type === "start")
    .map((n) => n.data.targetId)
    .filter((id): id is string => typeof id === "string" && componentIds.has(id));
  return {
    nodes: componentNodes.map((n) => ({
      id: n.id,
      componentId: n.data.componentId,
      position: n.position,
      config: n.data.config,
    })),
    edges: componentEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      kind: e.data?.kind ?? "request-flow",
    })),
    entryPointIds,
  };
}
