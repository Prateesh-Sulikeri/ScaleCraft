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
import type { ArchitectureGraph, EdgeKind, XY } from "@/lib/graph";
import type { ComponentNodeType, ArchitectureEdgeType } from "./types";

function edgeStyle(kind: EdgeKind) {
  return {
    animated: kind === "request-flow",
    style: kind !== "request-flow" ? { strokeDasharray: "4 4" } : undefined,
  };
}

type CanvasStore = {
  nodes: ComponentNodeType[];
  edges: ArchitectureEdgeType[];
  selectedEdgeId: string | null;
  selectedNodeId: string | null;

  /** Replaces the whole graph — used for seeding a demo/starter graph and,
   * later, loading a chapter's starterGraph or a persisted save. */
  loadGraph: (graph: ArchitectureGraph) => void;
  addNode: (definition: ComponentDefinition, position: XY) => void;
  onNodesChange: (changes: NodeChange<ComponentNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange<ArchitectureEdgeType>[]) => void;
  onConnect: (connection: Connection) => void;
  setEdgeKind: (edgeId: string, kind: EdgeKind) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  inspectorTab: "config" | "docs";
  setInspectorTab: (tab: "config" | "docs") => void;
  /** Used by the right-click "View docs" shortcut — selects the node AND
   * forces the inspector to the Docs tab in one action. */
  openDocsFor: (nodeId: string) => void;
  /** Config panel (milestone 2) writes here — kept separate from
   * onNodesChange since it's a data update, not a position/selection one. */
  updateNodeConfig: (nodeId: string, config: unknown) => void;
  /** Explicit actions for the right-click context menu — a second path to
   * delete besides the deleteKeyCode shortcut, see EdgeInspector/ContextMenu. */
  deleteNode: (nodeId: string) => void;
  deleteNodes: (nodeIds: string[]) => void;
  deleteEdge: (edgeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  /** Clones the whole set with an offset, remapping and preserving edges
   * that ran *between* duplicated nodes (not edges to nodes outside the
   * set — a partial duplicate shouldn't invent a new external connection). */
  duplicateNodes: (nodeIds: string[]) => void;
  reverseEdge: (edgeId: string) => void;
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  nodes: [],
  edges: [],
  selectedEdgeId: null,
  selectedNodeId: null,
  inspectorTab: "config",

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

  addNode: (definition, position) => {
    const node: ComponentNodeType = {
      id: crypto.randomUUID(),
      type: "component",
      position,
      data: { componentId: definition.id, config: definition.defaultConfig },
    };
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  onNodesChange: (changes) => {
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) }));
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
  setInspectorTab: (tab) => set({ inspectorTab: tab }),
  openDocsFor: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null, inspectorTab: "docs" }),

  updateNodeConfig: (nodeId, config) => {
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, config } } : n)),
    }));
  },

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  deleteNodes: (nodeIds) => {
    const idSet = new Set(nodeIds);
    set((state) => ({
      nodes: state.nodes.filter((n) => !idSet.has(n.id)),
      edges: state.edges.filter((e) => !idSet.has(e.source) && !idSet.has(e.target)),
      selectedNodeId: state.selectedNodeId && idSet.has(state.selectedNodeId) ? null : state.selectedNodeId,
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    }));
  },

  duplicateNode: (nodeId) => {
    const source = get().nodes.find((n) => n.id === nodeId);
    if (!source) return;
    const clone: ComponentNodeType = {
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
}));

/** Pure — the store's RF-shaped state translated to the domain graph the
 * validation engine (and, later, persistence) operate on. See
 * .claude/docs/ARCHITECTURE.md ("Architecture Graph"). */
export function toArchitectureGraph(
  nodes: ComponentNodeType[],
  edges: ArchitectureEdgeType[],
): ArchitectureGraph {
  return {
    nodes: nodes.map((n) => ({
      id: n.id,
      componentId: n.data.componentId,
      position: n.position,
      config: n.data.config,
    })),
    edges: edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      kind: e.data?.kind ?? "request-flow",
    })),
  };
}
