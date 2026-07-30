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
