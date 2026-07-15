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
import { DEFAULT_ZONE_COLOR, DEFAULT_COMMENT_COLOR } from "./annotation-colors";

/** What the palette's "Add zone"/"Add comment"/"Add start" buttons put the
 * canvas into — one mutually-exclusive placement mode rather than three
 * parallel booleans, so Canvas.tsx's drag-gesture/Escape-cancel/preview
 * logic branches once instead of tripling itself per annotation type. */
export type PlacementMode = "zone" | "comment" | "start" | null;

function edgeStyle(kind: EdgeKind) {
  return {
    animated: kind === "request-flow",
    style: kind !== "request-flow" ? { strokeDasharray: "4 4" } : undefined,
  };
}

/** A scoped alternative to a full undo/redo history stack — only delete is
 * risky enough (permanent, one click, no confirmation) to need a safety
 * net; every other mutation stays a plain, un-undoable action. */
export type PendingUndo = {
  nodes: AnyNodeType[];
  edges: ArchitectureEdgeType[];
  label: string;
  at: number;
};

const UNDO_MERGE_WINDOW_MS = 200;

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
  if (current && Date.now() - current.at < UNDO_MERGE_WINDOW_MS) {
    const nodes = [...current.nodes, ...newNodes.filter((n) => !current.nodes.some((cn) => cn.id === n.id))];
    const edges = [...current.edges, ...newEdges.filter((e) => !current.edges.some((ce) => ce.id === e.id))];
    return { nodes, edges, label: undoLabel(nodes, edges), at: current.at };
  }
  return { nodes: newNodes, edges: newEdges, label: undoLabel(newNodes, newEdges), at: Date.now() };
}

/** Keyed by componentId (not node id) — two node instances of the same
 * component share one docs window rather than opening a duplicate. Position
 * and size are deliberately NOT tracked here: they change continuously
 * during drag/resize, and routing that through the store would re-render
 * every subscriber on every pixel of movement. `minimized` toggles rarely
 * (an explicit click), so it's cheap to keep here — that's what lets
 * re-opening an already-open, minimized window restore it instead of
 * no-op'ing. See DocsWindows.tsx/DocsModal.tsx. */
export type DocsWindowState = {
  componentId: string;
  minimized: boolean;
};

export const MAX_DOCS_WINDOWS = 4;

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
  /** Fixed size, no drag-to-draw — a start marker never needs a drawn
   * rectangle, only a drop point. */
  addStartMarker: (position: XY) => void;
  updateStartMarker: (nodeId: string, patch: Partial<StartNodeData>) => void;
  /** Which annotation the user is currently placing — set by the palette's
   * "Add zone"/"Add comment"/"Add start" buttons, cleared on placement or
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
   * directly, same reasoning as selectedNodeId/docsWindows. */
  editingAnnotation: { id: string; anchor: { x: number; y: number } } | null;
  openAnnotationEditor: (id: string, anchor: { x: number; y: number }) => void;
  closeAnnotationEditor: () => void;
  onNodesChange: (changes: NodeChange<AnyNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange<ArchitectureEdgeType>[]) => void;
  onConnect: (connection: Connection) => void;
  setEdgeKind: (edgeId: string, kind: EdgeKind) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  /** Independent of node selection/inspector state entirely — a docs
   * window stays open across deselecting a node, collapsing a panel, or
   * selecting a different node. Ordered by open time; capped at
   * MAX_DOCS_WINDOWS. See NodeInspector.tsx/ContextMenu.tsx for the two
   * trigger points, and DocsWindows.tsx for where these actually render. */
  docsWindows: DocsWindowState[];
  openDocsWindow: (componentId: string) => void;
  closeDocsWindow: (componentId: string) => void;
  setDocsWindowMinimized: (componentId: string, minimized: boolean) => void;
  /** Config panel (milestone 2) writes here — kept separate from
   * onNodesChange since it's a data update, not a position/selection one. */
  updateNodeConfig: (nodeId: string, config: unknown) => void;
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
  docsWindows: [],
  placementMode: null,
  editingAnnotation: null,
  pendingUndo: null,
  customComponents: [],

  loadGraph: (graph) => {
    set({
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
    });
  },

  loadCanvasState: (nodes, edges) => {
    set({
      nodes: nodes.map((n) => ({ ...n, selected: false })),
      edges: edges.map((e) => ({ ...e, selected: false })),
      selectedEdgeId: null,
      selectedNodeId: null,
    });
  },

  addNode: (definition, position) => {
    const node: ComponentNodeType = {
      id: crypto.randomUUID(),
      type: "component",
      position,
      data: { componentId: definition.id, config: definition.defaultConfig },
    };
    set((state) => ({ nodes: [...state.nodes, node] }));
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
    set((state) => ({ nodes: [...state.nodes, zone] }));
    return id;
  },

  updateZone: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "zone" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    }));
  },

  addComment: (position, width = 220, height = 140) => {
    const id = crypto.randomUUID();
    const comment: AnyNodeType = {
      id,
      type: "comment",
      position,
      data: { text: "", width, height, color: DEFAULT_COMMENT_COLOR },
    };
    set((state) => ({ nodes: [...state.nodes, comment] }));
    return id;
  },

  updateComment: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "comment" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    }));
  },

  addStartMarker: (position) => {
    const marker: AnyNodeType = {
      id: crypto.randomUUID(),
      type: "start",
      position,
      data: { label: "", targetId: null },
    };
    set((state) => ({ nodes: [...state.nodes, marker] }));
  },

  updateStartMarker: (nodeId, patch) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "start" ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    }));
  },

  setPlacementMode: (mode) => set({ placementMode: mode }),

  openAnnotationEditor: (id, anchor) => set({ editingAnnotation: { id, anchor } }),
  closeAnnotationEditor: () => set({ editingAnnotation: null }),

  onNodesChange: (changes) => {
    set((state) => {
      const removedIds = changes.filter((c) => c.type === "remove").map((c) => c.id);
      const nextNodes = applyNodeChanges(changes, state.nodes);
      if (removedIds.length === 0) return { nodes: nextNodes };
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
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
      };
    });
  },

  onEdgesChange: (changes) => {
    set((state) => {
      const removedIds = changes.filter((c) => c.type === "remove").map((c) => c.id);
      const nextEdges = applyEdgeChanges(changes, state.edges);
      if (removedIds.length === 0) return { edges: nextEdges };
      const removedIdSet = new Set(removedIds);
      // If a concurrent node deletion already captured these exact edges
      // (see onNodesChange), skip — merging again would double-count them.
      const alreadyCaptured =
        state.pendingUndo &&
        Date.now() - state.pendingUndo.at < UNDO_MERGE_WINDOW_MS &&
        removedIds.every((id) => state.pendingUndo!.edges.some((e) => e.id === id));
      if (alreadyCaptured) return { edges: nextEdges };
      const removedEdges = state.edges.filter((e) => removedIdSet.has(e.id));
      return {
        edges: nextEdges,
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, [], removedEdges),
      };
    });
  },

  onConnect: (connection) => {
    set((state) => ({
      edges: rfAddEdge<ArchitectureEdgeType>(
        {
          ...connection,
          id: crypto.randomUUID(),
          data: { kind: "request-flow" },
          ...edgeStyle("request-flow"),
        },
        state.edges,
      ),
    }));
  },

  setEdgeKind: (edgeId, kind) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { kind }, ...edgeStyle(kind) } : e,
      ),
    }));
  },

  setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  openDocsWindow: (componentId) => {
    set((state) => {
      const existing = state.docsWindows.find((w) => w.componentId === componentId);
      if (existing) {
        // Already open — a repeat "View docs" click restores it if it was
        // minimized, rather than doing nothing.
        return {
          docsWindows: state.docsWindows.map((w) =>
            w.componentId === componentId ? { ...w, minimized: false } : w,
          ),
        };
      }
      if (state.docsWindows.length >= MAX_DOCS_WINDOWS) return {};
      return { docsWindows: [...state.docsWindows, { componentId, minimized: false }] };
    });
  },

  closeDocsWindow: (componentId) => {
    set((state) => ({ docsWindows: state.docsWindows.filter((w) => w.componentId !== componentId) }));
  },

  setDocsWindowMinimized: (componentId, minimized) => {
    set((state) => ({
      docsWindows: state.docsWindows.map((w) => (w.componentId === componentId ? { ...w, minimized } : w)),
    }));
  },

  updateNodeConfig: (nodeId, config) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId && n.type === "component" ? { ...n, data: { ...n.data, config } } : n,
      ),
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
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
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
        pendingUndo: mergeIntoPendingUndo(state.pendingUndo, removedNodes, removedEdges),
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
      };
    });
  },

  undoLastDelete: () => {
    set((state) => {
      if (!state.pendingUndo) return {};
      return {
        nodes: [...state.nodes, ...state.pendingUndo.nodes],
        edges: [...state.edges, ...state.pendingUndo.edges],
        pendingUndo: null,
      };
    });
  },

  dismissUndo: () => set({ pendingUndo: null }),

  duplicateNode: (nodeId) => {
    const source = get().nodes.find((n) => n.id === nodeId);
    if (!source) return;
    const clone: AnyNodeType = {
      ...source,
      id: crypto.randomUUID(),
      position: { x: source.position.x + 32, y: source.position.y + 32 },
      selected: false,
    };
    set((state) => ({ nodes: [...state.nodes, clone] }));
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
    set((state) => ({ nodes: [...state.nodes, ...clones], edges: [...state.edges, ...clonedEdges] }));
  },

  reverseEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, source: e.target, target: e.source } : e,
      ),
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
  };
}
