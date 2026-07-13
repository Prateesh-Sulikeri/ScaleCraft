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

  /** Replaces the whole graph — used for seeding a demo/starter graph and,
   * later, loading a chapter's starterGraph or a persisted save. */
  loadGraph: (graph: ArchitectureGraph) => void;
  addNode: (definition: ComponentDefinition, position: XY) => void;
  onNodesChange: (changes: NodeChange<ComponentNodeType>[]) => void;
  onEdgesChange: (changes: EdgeChange<ArchitectureEdgeType>[]) => void;
  onConnect: (connection: Connection) => void;
  setEdgeKind: (edgeId: string, kind: EdgeKind) => void;
  setSelectedEdgeId: (id: string | null) => void;
  /** Explicit actions for the right-click context menu — a second path to
   * delete besides the deleteKeyCode shortcut, see EdgeInspector/ContextMenu. */
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;
};

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [],
  edges: [],
  selectedEdgeId: null,

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

  deleteNode: (nodeId) => {
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
    }));
  },

  deleteEdge: (edgeId) => {
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
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
