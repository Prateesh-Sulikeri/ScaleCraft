import { beforeEach, describe, it, expect } from "vitest";
import { createCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

let store: ReturnType<typeof createCanvasStore>;

describe("Canvas workflow — drag, connect, delete", () => {
  beforeEach(() => {
    store = createCanvasStore();
  });

  it("creates a basic architecture: Client → LoadBalancer → AppServer → Database", () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    store.getState().addNode(component("load-balancer"), { x: 300, y: 0 });
    store.getState().addNode(component("app-server"), { x: 600, y: 0 });
    store.getState().addNode(component("sql-database"), { x: 900, y: 0 });

    const nodes = store.getState().nodes;
    expect(nodes).toHaveLength(4);

    store.getState().onConnect(
      { source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );
    store.getState().onConnect(
      { source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );
    store.getState().onConnect(
      { source: nodes[2].id, target: nodes[3].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(3);
    expect(graph.edges.every((e) => e.kind === "request-flow")).toBe(true);
  });

  // A drag records the port it landed on, and rfAddEdge de-dupes on
  // source/target/sourceHandle/targetHandle - so wiring A -> B a second time
  // from a different port used to be a *different* connection to it. Two
  // edges, identical once routed, stacked on one line, only the top one
  // selectable or deletable.
  it("refuses a second edge between a pair that already connects", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    store.getState().addNode(component("sql-database"), { x: 300, y: 0 });
    const [a, b] = store.getState().nodes;

    store.getState().onConnect(
      { source: a.id, target: b.id, sourceHandle: "port-right", targetHandle: "port-left" },
      "request-flow",
    );
    const historyAfterFirst = store.getState().past.length;
    store.getState().onConnect(
      { source: a.id, target: b.id, sourceHandle: "port-bottom", targetHandle: "port-top" },
      "request-flow",
    );

    expect(store.getState().edges).toHaveLength(1);
    // And the rejected one leaves no undo step behind that undoes nothing.
    expect(store.getState().past).toHaveLength(historyAfterFirst);
  });

  // The whole point of the change: a legal connection attaches where the user
  // put it. Any port may join any port - right to top, bottom to left - and
  // the router does not get a second opinion.
  it("keeps the ports a drag landed on", () => {
    store.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 0, y: 320 });
    const [db, replica] = store.getState().nodes;

    store.getState().onConnect(
      { source: db.id, target: replica.id, sourceHandle: "port-right", targetHandle: "port-top" },
      "replication",
    );

    const edge = store.getState().edges[0];
    expect(edge.sourceHandle).toBe("port-right");
    expect(edge.targetHandle).toBe("port-top");
  });

  it("hands an edge back to the router on request, and leaves authored ones alone", () => {
    store.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 0, y: 320 });
    const [db, replica] = store.getState().nodes;
    store.getState().onConnect(
      { source: db.id, target: replica.id, sourceHandle: "port-right", targetHandle: "port-top" },
      "replication",
    );
    const edgeId = store.getState().edges[0].id;

    store.getState().autoRouteEdge(edgeId);
    expect(store.getState().edges[0].sourceHandle).toBeNull();
    expect(store.getState().edges[0].targetHandle).toBeNull();

    // Already routed - nothing to clear, so no undo step either.
    const history = store.getState().past.length;
    store.getState().autoRouteEdge(edgeId);
    expect(store.getState().past).toHaveLength(history);
  });

  // The reverse direction is a different edge - a replica reading back to the
  // app server is a real, separate connection.
  it("still allows the opposite direction", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 300, y: 0 });
    const [a, b] = store.getState().nodes;

    store.getState().onConnect({ source: a.id, target: b.id, sourceHandle: null, targetHandle: null }, "request-flow");
    store.getState().onConnect({ source: b.id, target: a.id, sourceHandle: null, targetHandle: null }, "request-flow");

    expect(store.getState().edges).toHaveLength(2);
  });

  it("supports edge kind changes", () => {
    store.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    const edge = store.getState().edges[0];
    expect(edge.data?.kind).toBe("request-flow");

    store.getState().setEdgeKind(edge.id, "replication");
    const updated = store.getState().edges.find((e) => e.id === edge.id);
    expect(updated?.data?.kind).toBe("replication");
  });

  it("deletes nodes and their connected edges", () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });
    store.getState().addNode(component("sql-database"), { x: 600, y: 0 });

    const nodes = store.getState().nodes;
    store
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    store
      .getState()
      .onConnect({ source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null }, "request-flow");

    expect(store.getState().edges).toHaveLength(2);

    store.getState().deleteNode(nodes[1].id);

    expect(store.getState().nodes).toHaveLength(2);
    expect(store.getState().edges).toHaveLength(0);
  });

  it("supports undo/redo", () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    store.getState().undo();
    expect(store.getState().edges).toHaveLength(0);

    store.getState().redo();
    expect(store.getState().edges).toHaveLength(1);
  });
});
