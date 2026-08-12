import "fake-indexeddb/auto";
import { beforeEach, describe, it, expect, afterEach } from "vitest";
import { createCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { ScaleCraftDB } from "@/persistence/db";
import type { CanvasSave } from "@/persistence/db";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

let store: ReturnType<typeof createCanvasStore>;

describe("Persistence workflow — save, load, export, import", () => {
  let db: ScaleCraftDB;

  beforeEach(async () => {
    db = new ScaleCraftDB();
    await db.delete();
    await db.open();
    store = createCanvasStore();
  });

  afterEach(async () => {
    await db.close();
  });

  it("saves and loads a basic architecture", async () => {
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

    const original = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    expect(original.nodes).toHaveLength(3);
    expect(original.edges).toHaveLength(2);

    const canvasSave: CanvasSave = {
      id: "test-save",
      updatedAt: Date.now(),
      nodes: store.getState().nodes,
      edges: store.getState().edges,
      dirty: false,
      syncedAt: null,
    };

    await db.saves.put(canvasSave);

    store.getState().clearBoard();
    const loaded = await db.saves.get("test-save");

    expect(loaded).toBeDefined();
    store.getState().loadCanvasState(loaded!.nodes, loaded!.edges);

    const restored = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    expect(restored.nodes).toHaveLength(3);
    expect(restored.edges).toHaveLength(2);
  });

  it("preserves node config across save/load", async () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().updateNodeConfig(nodes[1].id, { instances: 4 });

    const canvasSave: CanvasSave = {
      id: "config-test",
      updatedAt: Date.now(),
      nodes: store.getState().nodes,
      edges: store.getState().edges,
      dirty: false,
      syncedAt: null,
    };

    await db.saves.put(canvasSave);

    store.getState().clearBoard();
    const loaded = await db.saves.get("config-test");

    store.getState().loadCanvasState(loaded!.nodes, loaded!.edges);
    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);

    const asNode = graph.nodes.find((n) => n.componentId === "app-server");
    expect((asNode?.config as Record<string, unknown>)?.instances).toBe(4);
  });

  it("export produces valid JSON", async () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const exportData = {
      nodes: store.getState().nodes,
      edges: store.getState().edges,
    };

    const json = JSON.stringify(exportData);
    expect(json).toBeTruthy();

    const imported = JSON.parse(json);
    store.getState().clearBoard();
    store.getState().loadCanvasState(imported.nodes, imported.edges);

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    expect(graph.nodes).toHaveLength(2);
    expect(graph.edges).toHaveLength(1);
  });
});
