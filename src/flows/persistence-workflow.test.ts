import "fake-indexeddb/auto";
import { beforeEach, describe, it, expect, afterEach } from "vitest";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { ScaleCraftDB } from "@/persistence/db";
import type { CanvasSave } from "@/persistence/db";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

describe("Persistence workflow — save, load, export, import", () => {
  let db: ScaleCraftDB;

  beforeEach(async () => {
    db = new ScaleCraftDB();
    await db.delete();
    await db.open();
    useCanvasStore.getState().clearBoard();
  });

  afterEach(async () => {
    await db.close();
  });

  it("saves and loads a basic architecture", async () => {
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

    const original = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    expect(original.nodes).toHaveLength(3);
    expect(original.edges).toHaveLength(2);

    const canvasSave: CanvasSave = {
      id: "test-save",
      updatedAt: Date.now(),
      nodes: useCanvasStore.getState().nodes,
      edges: useCanvasStore.getState().edges,
    };

    await db.saves.put(canvasSave);

    useCanvasStore.getState().clearBoard();
    const loaded = await db.saves.get("test-save");

    expect(loaded).toBeDefined();
    useCanvasStore.getState().loadCanvasState(loaded!.nodes, loaded!.edges);

    const restored = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    expect(restored.nodes).toHaveLength(3);
    expect(restored.edges).toHaveLength(2);
  });

  it("preserves node config across save/load", async () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().updateNodeConfig(nodes[1].id, { instances: 4 });

    const canvasSave: CanvasSave = {
      id: "config-test",
      updatedAt: Date.now(),
      nodes: useCanvasStore.getState().nodes,
      edges: useCanvasStore.getState().edges,
    };

    await db.saves.put(canvasSave);

    useCanvasStore.getState().clearBoard();
    const loaded = await db.saves.get("config-test");

    useCanvasStore.getState().loadCanvasState(loaded!.nodes, loaded!.edges);
    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);

    const asNode = graph.nodes.find((n) => n.componentId === "app-server");
    expect((asNode?.config as Record<string, unknown>)?.instances).toBe(4);
  });

  it("export produces valid JSON", async () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const exportData = {
      nodes: useCanvasStore.getState().nodes,
      edges: useCanvasStore.getState().edges,
    };

    const json = JSON.stringify(exportData);
    expect(json).toBeTruthy();

    const imported = JSON.parse(json);
    useCanvasStore.getState().clearBoard();
    useCanvasStore.getState().loadCanvasState(imported.nodes, imported.edges);

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
  });
});
