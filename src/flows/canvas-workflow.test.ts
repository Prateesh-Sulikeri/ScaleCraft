import { beforeEach, describe, it, expect } from "vitest";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

describe("Canvas workflow — drag, connect, delete", () => {
  beforeEach(() => {
    useCanvasStore.getState().clearBoard();
  });

  it("creates a basic architecture: Client → LoadBalancer → AppServer → Database", () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 300, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 600, y: 0 });
    useCanvasStore.getState().addNode(component("sql-database"), { x: 900, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    expect(nodes).toHaveLength(4);

    useCanvasStore.getState().onConnect(
      { source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );
    useCanvasStore.getState().onConnect(
      { source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );
    useCanvasStore.getState().onConnect(
      { source: nodes[2].id, target: nodes[3].id, sourceHandle: null, targetHandle: null },
      "request-flow",
    );

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    expect(graph.nodes).toHaveLength(4);
    expect(graph.edges).toHaveLength(3);
    expect(graph.edges.every((e) => e.kind === "request-flow")).toBe(true);
  });

  it("supports edge kind changes", () => {
    useCanvasStore.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    const edge = useCanvasStore.getState().edges[0];
    expect(edge.data?.kind).toBe("request-flow");

    useCanvasStore.getState().setEdgeKind(edge.id, "replication");
    const updated = useCanvasStore.getState().edges.find((e) => e.id === edge.id);
    expect(updated?.data?.kind).toBe("replication");
  });

  it("deletes nodes and their connected edges", () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });
    useCanvasStore.getState().addNode(component("sql-database"), { x: 600, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null }, "request-flow");

    expect(useCanvasStore.getState().edges).toHaveLength(2);

    useCanvasStore.getState().deleteNode(nodes[1].id);

    expect(useCanvasStore.getState().nodes).toHaveLength(2);
    expect(useCanvasStore.getState().edges).toHaveLength(0);
  });

  it("supports undo/redo", () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    useCanvasStore.getState().undo();
    expect(useCanvasStore.getState().edges).toHaveLength(0);

    useCanvasStore.getState().redo();
    expect(useCanvasStore.getState().edges).toHaveLength(1);
  });
});
