import { beforeEach, describe, expect, it } from "vitest";
import { MAX_DOCS_TABS, toArchitectureGraph, createCanvasStore } from "./store";
import type { ComponentNodeType, ArchitectureEdgeType, ZoneNodeType, CommentNodeType } from "./types";

// A fresh store per test, not a shared singleton — store.ts no longer
// exports one module-level instance (see CanvasStoreProvider), and a fresh
// instance per test is strictly better isolation than the old convention of
// each test calling loadCanvasState to reset nodes/edges itself.
let store: ReturnType<typeof createCanvasStore>;
beforeEach(() => {
  store = createCanvasStore();
});

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

    store.getState().loadCanvasState([zone, node], edges);
    const state = store.getState();

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
    store.getState().loadCanvasState([client, db], edges);

    store.getState().deleteNode("n1");
    let state = store.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n2"]);
    expect(state.edges).toHaveLength(0);
    expect(state.pendingUndo?.nodes.map((n) => n.id)).toEqual(["n1"]);
    expect(state.pendingUndo?.edges.map((e) => e.id)).toEqual(["e1"]);
    expect(state.pendingUndo?.label).toBe("1 item and 1 connection deleted");

    store.getState().undoLastDelete();
    state = store.getState();
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
    store.getState().loadCanvasState([client, db], edges);

    // Mirrors what xyflow actually dispatches for a keyboard delete of a
    // connected node: a "remove" node change AND a separate "remove" edge
    // change for the edge it was attached to.
    store.getState().onNodesChange([{ type: "remove", id: "n1" }]);
    store.getState().onEdgesChange([{ type: "remove", id: "e1" }]);

    const state = store.getState();
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
    store.getState().loadCanvasState([client], []);

    store.getState().deleteNode("n1");
    expect(store.getState().pendingUndo).not.toBeNull();

    store.getState().dismissUndo();
    const state = store.getState();
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
    store.getState().loadCanvasState([client], edges);

    store.getState().clearBoard();
    let state = store.getState();
    expect(state.nodes).toHaveLength(0);
    expect(state.edges).toHaveLength(0);
    expect(state.pendingUndo?.label).toBe("Board cleared");
    expect(state.pendingUndo?.mode).toBe("replace");

    store.getState().undoLastDelete();
    state = store.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n1"]);
    expect(state.edges.map((e) => e.id)).toEqual(["e1"]);
    expect(state.pendingUndo).toBeNull();
  });

  it("clearBoard on an already-empty board is a no-op (no pendingUndo set)", () => {
    store.getState().loadCanvasState([], []);
    store.getState().clearBoard();
    expect(store.getState().pendingUndo).toBeNull();
  });

  it("snapshotForUndo followed by loadCanvasState (restore-last-save) undoes back to the pre-restore state, not a merge of both", () => {
    const original: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };
    store.getState().loadCanvasState([original], []);

    const restored: ComponentNodeType = {
      id: "n2",
      type: "component",
      position: { x: 100, y: 0 },
      data: { componentId: "sql-database", config: {} },
    };
    // Mirrors BoardMenu's "Restore last save" handler: snapshot the current
    // (unsaved) state, then overwrite with the saved one.
    store.getState().snapshotForUndo("Restore reverted");
    store.getState().loadCanvasState([restored], []);

    let state = store.getState();
    expect(state.nodes.map((n) => n.id)).toEqual(["n2"]);
    expect(state.pendingUndo?.mode).toBe("replace");

    store.getState().undoLastDelete();
    state = store.getState();
    // Must revert to exactly the pre-restore state — a merge would leave
    // both n1 and n2 on the board.
    expect(state.nodes.map((n) => n.id)).toEqual(["n1"]);
  });
});

describe("comment and start annotations", () => {
  it("placementMode toggles independently of the three annotation types", () => {
    store.getState().setPlacementMode("zone");
    expect(store.getState().placementMode).toBe("zone");
    store.getState().setPlacementMode("comment");
    expect(store.getState().placementMode).toBe("comment");
    store.getState().setPlacementMode("start");
    expect(store.getState().placementMode).toBe("start");
    store.getState().setPlacementMode(null);
    expect(store.getState().placementMode).toBeNull();
  });

  it("addComment/addStartMarker add annotation nodes excluded from toArchitectureGraph", () => {
    store.getState().loadCanvasState([], []);
    store.getState().addComment({ x: 0, y: 0 });
    store.getState().addStartMarker({ x: 10, y: 10 });

    const state = store.getState();
    expect(state.nodes.map((n) => n.type).sort()).toEqual(["comment", "start"]);

    const graph = toArchitectureGraph(state.nodes, state.edges);
    expect(graph.nodes).toHaveLength(0);
  });

  it("updateComment/updateStartMarker patch only the matching node's data", () => {
    store.getState().loadCanvasState([], []);
    store.getState().addComment({ x: 0, y: 0 });
    store.getState().addStartMarker({ x: 10, y: 10 });

    const [comment, start] = store.getState().nodes;
    store.getState().updateComment(comment.id, { text: "check the source" });
    store.getState().updateStartMarker(start.id, { label: "Entry point" });

    const state = store.getState();
    const updatedComment = state.nodes.find((n) => n.id === comment.id);
    const updatedStart = state.nodes.find((n) => n.id === start.id);
    expect(updatedComment?.type === "comment" && updatedComment.data.text).toBe("check the source");
    expect(updatedStart?.type === "start" && updatedStart.data.label).toBe("Entry point");
  });
});

describe("general undo/redo history", () => {
  it("undo reverts the last discrete action (addNode) and redo replays it", () => {
    store.getState().loadCanvasState([], []);
    const definition = { id: "client", defaultConfig: {} } as Parameters<
      ReturnType<typeof store.getState>["addNode"]
    >[0];

    store.getState().addNode(definition, { x: 0, y: 0 });
    expect(store.getState().nodes).toHaveLength(1);

    store.getState().undo();
    expect(store.getState().nodes).toHaveLength(0);
    expect(store.getState().future).toHaveLength(1);

    store.getState().redo();
    expect(store.getState().nodes).toHaveLength(1);
    expect(store.getState().future).toHaveLength(0);
  });

  it("coalesces rapid same-field edits (e.g. typing a zone label) into one undo step", () => {
    store.getState().loadCanvasState([], []);
    const zoneId = store.getState().addZone({ x: 0, y: 0 });
    const pastAfterAdd = store.getState().past.length;

    store.getState().updateZone(zoneId, { label: "B" });
    store.getState().updateZone(zoneId, { label: "Ba" });
    store.getState().updateZone(zoneId, { label: "Bac" });
    store.getState().updateZone(zoneId, { label: "Back" });

    // Four rapid calls to the same field only ever added ONE history entry
    // on top of the add, not four — that's the coalescing window doing its
    // job (see pushHistory in store.ts).
    expect(store.getState().past.length).toBe(pastAfterAdd + 1);

    store.getState().undo();
    const zone = store.getState().nodes.find((n) => n.id === zoneId);
    // Reverts the whole burst back to pre-edit ("" label), not one
    // keystroke at a time.
    expect(zone?.type === "zone" && zone.data.label).toBe("");
  });

  it("a new action after undo clears redo history", () => {
    store.getState().loadCanvasState([], []);
    store.getState().addZone({ x: 0, y: 0 });
    store.getState().undo();
    expect(store.getState().future.length).toBeGreaterThan(0);

    store.getState().addComment({ x: 0, y: 0 });
    expect(store.getState().future).toHaveLength(0);
  });

  it("undo on an empty history is a no-op", () => {
    store.getState().loadCanvasState([], []);
    // Draining any history left over from loadCanvasState itself.
    while (store.getState().past.length > 0) store.getState().undo();
    const before = store.getState();
    store.getState().undo();
    expect(store.getState().nodes).toBe(before.nodes);
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
    store.getState().loadCanvasState([comment], []);

    // Simulates dragging the top-left resize handle: xyflow's NodeResizer
    // reports a new x/y (the anchor moves) alongside width/height.
    store.getState().resizeNode("c1", 40, 60, 280, 180);

    const node = store.getState().nodes.find((n) => n.id === "c1");
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
    store.getState().loadCanvasState([client], []);

    store.getState().resizeNode("n1", 10, 20, 260, 90);

    const node = store.getState().nodes.find((n) => n.id === "n1");
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
    store.getState().loadCanvasState([zone], []);

    store.getState().toggleAnnotationLock("z1");
    let node = store.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(true);

    store.getState().toggleAnnotationLock("z1");
    node = store.getState().nodes.find((n) => n.id === "z1");
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
    store.getState().loadCanvasState([client], []);

    store.getState().updateNodeName("n1", "server-1-ind");

    const node = store.getState().nodes.find((n) => n.id === "n1");
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
    store.getState().loadCanvasState([client], []);

    store.getState().updateNodeDescription("n1", "Handles mobile traffic only");

    const node = store.getState().nodes.find((n) => n.id === "n1");
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
    store.setState({
      docsPanel: { tabs: [], activeTabId: null, minimized: false, width: 420, focusMode: false },
    });
  });

  it("openDocTab opens a new tab and makes it active", () => {
    store.getState().openDocTab("load-balancer");
    const state = store.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["load-balancer"]);
    expect(state.docsPanel.activeTabId).toBe("load-balancer");
  });

  it("openDocTab de-dupes by componentId instead of opening a second tab", () => {
    store.getState().openDocTab("load-balancer");
    store.getState().openDocTab("sql-database");
    store.getState().openDocTab("load-balancer");

    const state = store.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["load-balancer", "sql-database"]);
    // Switches to the existing tab rather than duplicating it.
    expect(state.docsPanel.activeTabId).toBe("load-balancer");
  });

  it("openDocTab restores the panel from minimized", () => {
    store.getState().openDocTab("load-balancer");
    store.getState().setDocsPanelMinimized(true);
    expect(store.getState().docsPanel.minimized).toBe(true);

    store.getState().openDocTab("sql-database");
    expect(store.getState().docsPanel.minimized).toBe(false);
  });

  it("openDocTab is capped at MAX_DOCS_TABS", () => {
    for (let i = 0; i < MAX_DOCS_TABS + 2; i++) {
      store.getState().openDocTab(`component-${i}`);
    }
    expect(store.getState().docsPanel.tabs).toHaveLength(MAX_DOCS_TABS);
  });

  it("closeDocTab removes the tab and activates its left neighbor when it was active", () => {
    store.getState().openDocTab("a");
    store.getState().openDocTab("b");
    store.getState().openDocTab("c");
    store.getState().setActiveDocTab("b");

    store.getState().closeDocTab("b");
    const state = store.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["a", "c"]);
    expect(state.docsPanel.activeTabId).toBe("a");
  });

  it("closeDocTab on a non-active tab leaves the active tab untouched", () => {
    store.getState().openDocTab("a");
    store.getState().openDocTab("b");
    store.getState().setActiveDocTab("b");

    store.getState().closeDocTab("a");
    const state = store.getState();
    expect(state.docsPanel.tabs.map((t) => t.componentId)).toEqual(["b"]);
    expect(state.docsPanel.activeTabId).toBe("b");
  });

  it("closeDocTab on the last remaining tab clears activeTabId", () => {
    store.getState().openDocTab("a");
    store.getState().closeDocTab("a");
    const state = store.getState();
    expect(state.docsPanel.tabs).toHaveLength(0);
    expect(state.docsPanel.activeTabId).toBeNull();
  });

  it("closeAllDocTabs empties the tab list and clears activeTabId", () => {
    store.getState().openDocTab("a");
    store.getState().openDocTab("b");
    store.getState().closeAllDocTabs();
    const state = store.getState();
    expect(state.docsPanel.tabs).toHaveLength(0);
    expect(state.docsPanel.activeTabId).toBeNull();
  });

  it("setDocTabScroll updates only the matching tab's scrollTop", () => {
    store.getState().openDocTab("a");
    store.getState().openDocTab("b");

    store.getState().setDocTabScroll("a", 240);
    const state = store.getState();
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(240);
    expect(state.docsPanel.tabs.find((t) => t.componentId === "b")?.scrollTop).toBe(0);
  });

  it("minimize/restore preserves tabs, active tab, and scroll position", () => {
    store.getState().openDocTab("a");
    store.getState().openDocTab("b");
    store.getState().setDocTabScroll("a", 150);
    store.getState().setActiveDocTab("a");

    store.getState().setDocsPanelMinimized(true);
    let state = store.getState();
    expect(state.docsPanel.minimized).toBe(true);
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(150);

    store.getState().setDocsPanelMinimized(false);
    state = store.getState();
    expect(state.docsPanel.minimized).toBe(false);
    expect(state.docsPanel.activeTabId).toBe("a");
    expect(state.docsPanel.tabs.find((t) => t.componentId === "a")?.scrollTop).toBe(150);
  });

  it("toggleDocsPanel flips minimized without touching tabs", () => {
    store.getState().openDocTab("a");
    store.getState().toggleDocsPanel();
    expect(store.getState().docsPanel.minimized).toBe(true);
    store.getState().toggleDocsPanel();
    expect(store.getState().docsPanel.minimized).toBe(false);
    expect(store.getState().docsPanel.tabs).toHaveLength(1);
  });

  it("toggleFocusMode flips focusMode", () => {
    expect(store.getState().docsPanel.focusMode).toBe(false);
    store.getState().toggleFocusMode();
    expect(store.getState().docsPanel.focusMode).toBe(true);
    store.getState().setFocusMode(false);
    expect(store.getState().docsPanel.focusMode).toBe(false);
  });

  it("openShortcutsModal/closeShortcutsModal/toggleShortcutsModal drive shortcutsModalOpen", () => {
    expect(store.getState().shortcutsModalOpen).toBe(false);
    store.getState().openShortcutsModal();
    expect(store.getState().shortcutsModalOpen).toBe(true);
    store.getState().closeShortcutsModal();
    expect(store.getState().shortcutsModalOpen).toBe(false);
    store.getState().toggleShortcutsModal();
    expect(store.getState().shortcutsModalOpen).toBe(true);
    store.getState().toggleShortcutsModal();
    expect(store.getState().shortcutsModalOpen).toBe(false);
  });

  it("setDocsPanelWidth stores the committed width", () => {
    store.getState().setDocsPanelWidth(500);
    expect(store.getState().docsPanel.width).toBe(500);
  });
});

// The actual guarantee CanvasStoreProvider (see store.tsx) relies on to fix
// the cross-mode canvas leak (.claude/docs/pending.md I.6): each mode's
// Provider calls createCanvasStore() once per mount, and that instance must
// never see another instance's state, no matter what either one does.
describe("createCanvasStore instance independence", () => {
  it("two instances start with separate empty state, not a shared one", () => {
    const a = createCanvasStore();
    const b = createCanvasStore();

    expect(a.getState().nodes).toEqual([]);
    expect(b.getState().nodes).toEqual([]);
    expect(a.getState().nodes).not.toBe(b.getState().nodes);
  });

  it("mutating one instance's nodes/edges never appears on another instance", () => {
    const a = createCanvasStore();
    const b = createCanvasStore();
    const client: ComponentNodeType = {
      id: "n1",
      type: "component",
      position: { x: 0, y: 0 },
      data: { componentId: "client", config: {} },
    };

    a.getState().loadCanvasState([client], []);

    expect(a.getState().nodes).toHaveLength(1);
    expect(b.getState().nodes).toHaveLength(0);
  });

  it("mutating one instance's UI state (docs panel, undo history, selection) never appears on another", () => {
    const a = createCanvasStore();
    const b = createCanvasStore();

    a.getState().openDocTab("load-balancer");
    a.getState().addZone({ x: 0, y: 0 });
    a.getState().setSelectedNodeId("z1");

    expect(a.getState().docsPanel.tabs).toHaveLength(1);
    expect(a.getState().past.length).toBeGreaterThan(0);
    expect(a.getState().selectedNodeId).toBe("z1");

    expect(b.getState().docsPanel.tabs).toHaveLength(0);
    expect(b.getState().past).toHaveLength(0);
    expect(b.getState().selectedNodeId).toBeNull();
  });
});
