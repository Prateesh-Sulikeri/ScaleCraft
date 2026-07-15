import { describe, expect, it } from "vitest";
import { toArchitectureGraph, useCanvasStore } from "./store";
import type { ComponentNodeType, ArchitectureEdgeType, ZoneNodeType } from "./types";

describe("toArchitectureGraph", () => {
  it("translates RF-shaped nodes/edges to the domain ArchitectureGraph", () => {
    const nodes: ComponentNodeType[] = [
      {
        id: "n1",
        type: "component",
        position: { x: 10, y: 20 },
        data: { componentId: "client", config: {} },
      },
    ];
    const edges: ArchitectureEdgeType[] = [
      { id: "e1", source: "n1", target: "n1", data: { kind: "control" } },
    ];

    const graph = toArchitectureGraph(nodes, edges);

    expect(graph.nodes).toEqual([
      { id: "n1", componentId: "client", position: { x: 10, y: 20 }, config: {} },
    ]);
    expect(graph.edges).toEqual([{ id: "e1", source: "n1", target: "n1", kind: "control" }]);
  });

  it("defaults edges with no data to request-flow", () => {
    const nodes: ComponentNodeType[] = [
      { id: "a", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
      { id: "b", type: "component", position: { x: 200, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "a", target: "b" }];
    expect(toArchitectureGraph(nodes, edges).edges[0].kind).toBe("request-flow");
  });

  it("drops edges where either endpoint isn't a real component node (e.g. a Start marker's connectable handle)", () => {
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    // "s1" (a start marker, or any non-component id) isn't in `nodes` above.
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "s1", target: "n1" }];
    expect(toArchitectureGraph(nodes, edges).edges).toHaveLength(0);
  });
});

describe("loadCanvasState", () => {
  it("restores nodes and edges verbatim, including zones (unlike loadGraph)", () => {
    const zone: ZoneNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "Zone", width: 320, height: 220 },
    };
    const node: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 10, y: 20 },
      selected: true,
      data: { componentId: "client", config: {} },
    };
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n1", selected: true }];

    useCanvasStore.getState().loadCanvasState([zone, node], edges);
    const state = useCanvasStore.getState();

    expect(state.nodes).toHaveLength(2);
    expect(state.nodes.find((n) => n.id === "z1")?.type).toBe("zone");
    expect(state.nodes.every((n) => n.selected === false)).toBe(true);
    expect(state.edges[0].selected).toBe(false);
    expect(state.selectedNodeId).toBeNull();
    expect(state.selectedEdgeId).toBeNull();
  });
});

describe("delete undo safety net", () => {
  it("deleteNode captures the node and its connected edges as one pendingUndo, restorable via undoLastDelete", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    const db: ComponentNodeType = {
      id: "n2",
      type: "component",
      position: { x: 200, y: 0 },
      data: { componentId: "sql-database", config: {} },
    };
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    useCanvasStore.getState().loadCanvasState([client, db], edges);

    useCanvasStore.getState().deleteNode("n1");
    let state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n2"]);
    expect(state.edges).toHaveLength(0);
    expect(state.pendingUndo?.nodes.map((n) => n.id)).toEqual(["n1"]);
    expect(state.pendingUndo?.edges.map((e) => e.id)).toEqual(["e1"]);
    expect(state.pendingUndo?.label).toBe("1 item and 1 connection deleted");

    useCanvasStore.getState().undoLastDelete();
    state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.id).sort()).toEqual(["n1", "n2"]);
    expect(state.edges.map((e) => e.id)).toEqual(["e1"]);
    expect(state.pendingUndo).toBeNull();
  });

  it("merges a node-removal onNodesChange call with the connected-edge onEdgesChange call into one undo entry (xyflow's keyboard-delete path, which never calls deleteNode)", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    const db: ComponentNodeType = {
      id: "n2",
      type: "component",
      position: { x: 200, y: 0 },
      data: { componentId: "sql-database", config: {} },
    };
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n2" }];
    useCanvasStore.getState().loadCanvasState([client, db], edges);

    // Mirrors what xyflow actually dispatches for a keyboard delete of a
    // connected node: a "remove" node change AND a separate "remove" edge
    // change for the edge it was attached to.
    useCanvasStore.getState().onNodesChange([{ type: "remove", id: "n1" }]);
    useCanvasStore.getState().onEdgesChange([{ type: "remove", id: "e1" }]);

    const state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n2"]);
    expect(state.edges).toHaveLength(0);
    // One combined entry, not two separate ones overwriting each other.
    expect(state.pendingUndo?.nodes.map((n) => n.id)).toEqual(["n1"]);
    expect(state.pendingUndo?.edges.map((e) => e.id)).toEqual(["e1"]);
  });

  it("dismissUndo clears the pending entry without restoring anything", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    useCanvasStore.getState().loadCanvasState([client], []);

    useCanvasStore.getState().deleteNode("n1");
    expect(useCanvasStore.getState().pendingUndo).not.toBeNull();

    useCanvasStore.getState().dismissUndo();
    const state = useCanvasStore.getState();
    expect(state.pendingUndo).toBeNull();
    expect(state.nodes).toHaveLength(0);
  });
});

describe("clearBoard / snapshotForUndo (replace-mode undo)", () => {
  it("clearBoard wipes nodes/edges and undoLastDelete restores exactly the pre-clear state", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n1" }];
    useCanvasStore.getState().loadCanvasState([client], edges);

    useCanvasStore.getState().clearBoard();
    let state = useCanvasStore.getState();
    expect(state.nodes).toHaveLength(0);
    expect(state.edges).toHaveLength(0);
    expect(state.pendingUndo?.label).toBe("Board cleared");
    expect(state.pendingUndo?.mode).toBe("replace");

    useCanvasStore.getState().undoLastDelete();
    state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n1"]);
    expect(state.edges.map((e) => e.id)).toEqual(["e1"]);
    expect(state.pendingUndo).toBeNull();
  });

  it("clearBoard on an already-empty board is a no-op (no pendingUndo set)", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    useCanvasStore.getState().clearBoard();
    expect(useCanvasStore.getState().pendingUndo).toBeNull();
  });

  it("snapshotForUndo followed by loadCanvasState (restore-last-save) undoes back to the pre-restore state, not a merge of both", () => {
    const original: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    useCanvasStore.getState().loadCanvasState([original], []);

    const restored: ComponentNodeType = {
      id: "n2",
      type: "component",
      position: { x: 100, y: 0 },
      data: { componentId: "sql-database", config: {} },
    };
    // Mirrors BoardMenu's "Restore last save" handler: snapshot the current
    // (unsaved) state, then overwrite with the saved one.
    useCanvasStore.getState().snapshotForUndo("Restore reverted");
    useCanvasStore.getState().loadCanvasState([restored], []);

    let state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n2"]);
    expect(state.pendingUndo?.mode).toBe("replace");

    useCanvasStore.getState().undoLastDelete();
    state = useCanvasStore.getState();
    // Must revert to exactly the pre-restore state — a merge would leave
    // both n1 and n2 on the board.
    expect(state.nodes.map((n) => n.id)).toEqual(["n1"]);
  });
});

describe("comment and start annotations", () => {
  it("placementMode toggles independently of the three annotation types", () => {
    useCanvasStore.getState().setPlacementMode("zone");
    expect(useCanvasStore.getState().placementMode).toBe("zone");
    useCanvasStore.getState().setPlacementMode("comment");
    expect(useCanvasStore.getState().placementMode).toBe("comment");
    useCanvasStore.getState().setPlacementMode("start");
    expect(useCanvasStore.getState().placementMode).toBe("start");
    useCanvasStore.getState().setPlacementMode(null);
    expect(useCanvasStore.getState().placementMode).toBeNull();
  });

  it("addComment/addStartMarker add annotation nodes excluded from toArchitectureGraph", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    useCanvasStore.getState().addComment({ x: 0, y: 0 });
    useCanvasStore.getState().addStartMarker({ x: 10, y: 10 });

    const state = useCanvasStore.getState();
    expect(state.nodes.map((n) => n.type).sort()).toEqual(["comment", "start"]);

    const graph = toArchitectureGraph(state.nodes, state.edges);
    expect(graph.nodes).toHaveLength(0);
  });

  it("updateComment/updateStartMarker patch only the matching node's data", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    useCanvasStore.getState().addComment({ x: 0, y: 0 });
    useCanvasStore.getState().addStartMarker({ x: 10, y: 10 });

    const [comment, start] = useCanvasStore.getState().nodes;
    useCanvasStore.getState().updateComment(comment.id, { text: "check the source" });
    useCanvasStore.getState().updateStartMarker(start.id, { label: "Entry point" });

    const state = useCanvasStore.getState();
    const updatedComment = state.nodes.find((n) => n.id === comment.id);
    const updatedStart = state.nodes.find((n) => n.id === start.id);
    expect(updatedComment?.type === "comment" && updatedComment.data.text).toBe("check the source");
    expect(updatedStart?.type === "start" && updatedStart.data.label).toBe("Entry point");
  });
});
