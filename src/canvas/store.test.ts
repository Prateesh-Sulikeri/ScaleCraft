import { beforeEach, describe, expect, it } from "vitest";
import { MAX_DOCS_TABS, toArchitectureGraph, useCanvasStore } from "./store";
import type { ComponentNodeType, ArchitectureEdgeType, ZoneNodeType, CommentNodeType } from "./types";

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

describe("general undo/redo history", () => {
  it("undo reverts the last discrete action (addNode) and redo replays it", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    const definition = { id: "client", defaultConfig: {} } as Parameters<
      ReturnType<typeof useCanvasStore.getState>["addNode"]
    >[0];

    useCanvasStore.getState().addNode(definition, { x: 0, y: 0 });
    expect(useCanvasStore.getState().nodes).toHaveLength(1);

    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().nodes).toHaveLength(0);
    expect(useCanvasStore.getState().future).toHaveLength(1);

    useCanvasStore.getState().redo();
    expect(useCanvasStore.getState().nodes).toHaveLength(1);
    expect(useCanvasStore.getState().future).toHaveLength(0);
  });

  it("coalesces rapid same-field edits (e.g. typing a zone label) into one undo step", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    const zoneId = useCanvasStore.getState().addZone({ x: 0, y: 0 });
    const pastAfterAdd = useCanvasStore.getState().past.length;

    useCanvasStore.getState().updateZone(zoneId, { label: "B" });
    useCanvasStore.getState().updateZone(zoneId, { label: "Ba" });
    useCanvasStore.getState().updateZone(zoneId, { label: "Bac" });
    useCanvasStore.getState().updateZone(zoneId, { label: "Back" });

    // Four rapid calls to the same field only ever added ONE history entry
    // on top of the add, not four — that's the coalescing window doing its
    // job (see pushHistory in store.ts).
    expect(useCanvasStore.getState().past.length).toBe(pastAfterAdd + 1);

    useCanvasStore.getState().undo();
    const zone = useCanvasStore.getState().nodes.find((n) => n.id === zoneId);
    // Reverts the whole burst back to pre-edit ("" label), not one
    // keystroke at a time.
    expect(zone?.type === "zone" && zone.data.label).toBe("");
  });

  it("a new action after undo clears redo history", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    useCanvasStore.getState().addZone({ x: 0, y: 0 });
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().future.length).toBeGreaterThan(0);

    useCanvasStore.getState().addComment({ x: 0, y: 0 });
    expect(useCanvasStore.getState().future).toHaveLength(0);
  });

  it("undo on an empty history is a no-op", () => {
    useCanvasStore.getState().loadCanvasState([], []);
    // Draining any history left over from loadCanvasState itself.
    while (useCanvasStore.getState().past.length > 0) useCanvasStore.getState().undo();
    const before = useCanvasStore.getState();
    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().nodes).toBe(before.nodes);
  });
});

describe("resizeNode", () => {
  it("updates position AND width/height together (the top/left-handle anchor fix)", () => {
    const comment: CommentNodeType = {
      id: "c1",
      type: "comment",
      position: { x: 100, y: 100 },
      data: { text: "", width: 220, height: 140 },
    };
    useCanvasStore.getState().loadCanvasState([comment], []);

    // Simulates dragging the top-left resize handle: xyflow's NodeResizer
    // reports a new x/y (the anchor moves) alongside width/height.
    useCanvasStore.getState().resizeNode("c1", 40, 60, 280, 180);

    const node = useCanvasStore.getState().nodes.find((n) => n.id === "c1");
    expect(node?.position).toEqual({ x: 40, y: 60 });
    expect(node?.type === "comment" && node.data.width).toBe(280);
    expect(node?.type === "comment" && node.data.height).toBe(180);
  });

  it("also resizes a component node", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    useCanvasStore.getState().loadCanvasState([client], []);

    useCanvasStore.getState().resizeNode("n1", 10, 20, 260, 90);

    const node = useCanvasStore.getState().nodes.find((n) => n.id === "n1");
    expect(node?.position).toEqual({ x: 10, y: 20 });
    expect(node?.type === "component" && node.data.width).toBe(260);
    expect(node?.type === "component" && node.data.height).toBe(90);
  });
});

describe("toggleAnnotationLock", () => {
  it("flips locked on a zone and leaves other node types untouched", () => {
    const zone: ZoneNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    useCanvasStore.getState().loadCanvasState([zone], []);

    useCanvasStore.getState().toggleAnnotationLock("z1");
    let node = useCanvasStore.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(true);

    useCanvasStore.getState().toggleAnnotationLock("z1");
    node = useCanvasStore.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(false);
  });
});

describe("updateNodeName", () => {
  it("sets a component's custom instance name without touching its config", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: { foo: "bar" } },
    };
    useCanvasStore.getState().loadCanvasState([client], []);

    useCanvasStore.getState().updateNodeName("n1", "server-1-ind");

    const node = useCanvasStore.getState().nodes.find((n) => n.id === "n1");
    expect(node?.type === "component" && node.data.name).toBe("server-1-ind");
    expect(node?.type === "component" && node.data.config).toEqual({ foo: "bar" });
  });
});

describe("updateNodeDescription", () => {
  it("sets a component's custom description without touching its config", () => {
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: { foo: "bar" } },
    };
    useCanvasStore.getState().loadCanvasState([client], []);

    useCanvasStore.getState().updateNodeDescription("n1", "Handles mobile traffic only");

    const node = useCanvasStore.getState().nodes.find((n) => n.id === "n1");
    expect(node?.type === "component" && node.data.description).toBe("Handles mobile traffic only");
    expect(node?.type === "component" && node.data.config).toEqual({ foo: "bar" });
  });
});

describe("docs panel", () => {
  beforeEach(() => {
    // No shared reset helper for docsPanel across the file (see other
    // describe blocks' reliance on loadCanvasState for nodes/edges) — set
    // it back to its initial shape directly so tests don't leak tabs into
    // each other via the shared store singleton.
    useCanvasStore.setState({
      docsPanel: { tabs: [], activeTabId: null, minimized: false, width: 420, focusMode: false },
    });
  });

  it("openDocTab opens a new tab and makes it active", () => {
    useCanvasStore.getState().openDocTab("load-balancer");
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["load-balancer"]);
    expect(state.docsPanel.activeTabId).toBe("load-balancer");
  });

  it("openDocTab de-dupes by componentId instead of opening a second tab", () => {
    useCanvasStore.getState().openDocTab("load-balancer");
    useCanvasStore.getState().openDocTab("sql-database");
    useCanvasStore.getState().openDocTab("load-balancer");

    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["load-balancer", "sql-database"]);
    // Switches to the existing tab rather than duplicating it.
    expect(state.docsPanel.activeTabId).toBe("load-balancer");
  });

  it("openDocTab restores the panel from minimized", () => {
    useCanvasStore.getState().openDocTab("load-balancer");
    useCanvasStore.getState().setDocsPanelMinimized(true);
    expect(useCanvasStore.getState().docsPanel.minimized).toBe(true);

    useCanvasStore.getState().openDocTab("sql-database");
    expect(useCanvasStore.getState().docsPanel.minimized).toBe(false);
  });

  it("openDocTab is capped at MAX_DOCS_TABS", () => {
    for (let i = 0; i < MAX_DOCS_TABS + 2; i++) {
      useCanvasStore.getState().openDocTab(`component-${i}`);
    }
    expect(useCanvasStore.getState().docsPanel.tabs).toHaveLength(MAX_DOCS_TABS);
  });

  it("closeDocTab removes the tab and activates its left neighbor when it was active", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().openDocTab("b");
    useCanvasStore.getState().openDocTab("c");
    useCanvasStore.getState().setActiveDocTab("b");

    useCanvasStore.getState().closeDocTab("b");
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["a", "c"]);
    expect(state.docsPanel.activeTabId).toBe("a");
  });

  it("closeDocTab on a non-active tab leaves the active tab untouched", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().openDocTab("b");
    useCanvasStore.getState().setActiveDocTab("b");

    useCanvasStore.getState().closeDocTab("a");
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["b"]);
    expect(state.docsPanel.activeTabId).toBe("b");
  });

  it("closeDocTab on the last remaining tab clears activeTabId", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().closeDocTab("a");
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs).toHaveLength(0);
    expect(state.docsPanel.activeTabId).toBeNull();
  });

  it("closeAllDocTabs empties the tab list and clears activeTabId", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().openDocTab("b");
    useCanvasStore.getState().closeAllDocTabs();
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs).toHaveLength(0);
    expect(state.docsPanel.activeTabId).toBeNull();
  });

  it("setDocTabScroll updates only the matching tab's scrollTop", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().openDocTab("b");

    useCanvasStore.getState().setDocTabScroll("a", 240);
    const state = useCanvasStore.getState();
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(240);
    expect(state.docsPanel.tabs.find((t) => t.componentId === "b")?.scrollTop).toBe(0);
  });

  it("minimize/restore preserves tabs, active tab, and scroll position", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().openDocTab("b");
    useCanvasStore.getState().setDocTabScroll("a", 150);
    useCanvasStore.getState().setActiveDocTab("a");

    useCanvasStore.getState().setDocsPanelMinimized(true);
    let state = useCanvasStore.getState();
    expect(state.docsPanel.minimized).toBe(true);
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(150);

    useCanvasStore.getState().setDocsPanelMinimized(false);
    state = useCanvasStore.getState();
    expect(state.docsPanel.minimized).toBe(false);
    expect(state.docsPanel.activeTabId).toBe("a");
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(150);
  });

  it("toggleDocsPanel flips minimized without touching tabs", () => {
    useCanvasStore.getState().openDocTab("a");
    useCanvasStore.getState().toggleDocsPanel();
    expect(useCanvasStore.getState().docsPanel.minimized).toBe(true);
    useCanvasStore.getState().toggleDocsPanel();
    expect(useCanvasStore.getState().docsPanel.minimized).toBe(false);
    expect(useCanvasStore.getState().docsPanel.tabs).toHaveLength(1);
  });

  it("toggleFocusMode flips focusMode", () => {
    expect(useCanvasStore.getState().docsPanel.focusMode).toBe(false);
    useCanvasStore.getState().toggleFocusMode();
    expect(useCanvasStore.getState().docsPanel.focusMode).toBe(true);
    useCanvasStore.getState().setFocusMode(false);
    expect(useCanvasStore.getState().docsPanel.focusMode).toBe(false);
  });

  it("setDocsPanelWidth stores the committed width", () => {
    useCanvasStore.getState().setDocsPanelWidth(500);
    expect(useCanvasStore.getState().docsPanel.width).toBe(500);
  });
});
