import { beforeEach, describe, it, expect } from "vitest";
import { createCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import { getComponent } from "@/content/components/registry";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

function configOf(config: unknown): Record<string, unknown> {
  return config as Record<string, unknown>;
}

let store: ReturnType<typeof createCanvasStore>;

describe("Component configuration workflow", () => {
  beforeEach(() => {
    store = createCanvasStore();
  });

  it("opens inspector when clicking a component", () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    const nodeId = store.getState().nodes[0].id;

    store.getState().setSelectedNodeId(nodeId);

    expect(store.getState().selectedNodeId).toBe(nodeId);
  });

  it("updates config and reflects in store", () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    const nodeId = store.getState().nodes[0].id;

    store.getState().updateNodeConfig(nodeId, { algorithm: "least-connections" });

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const node = graph.nodes.find((n) => n.id === nodeId);

    expect(configOf(node?.config).algorithm).toBe("least-connections");
  });

  it("validates based on updated config", () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    let violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);

    store.getState().updateNodeConfig(nodes[1].id, { instances: 3 });

    graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(false);
  });

  it("handles different config field types", () => {
    store.getState().addNode(component("cache"), { x: 0, y: 0 });
    const cacheId = store.getState().nodes[0].id;
    store.getState().updateNodeConfig(cacheId, { ttlSeconds: 7200 });

    const graph1 = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const cacheNode = graph1.nodes.find((n) => n.id === cacheId);
    expect(configOf(cacheNode?.config).ttlSeconds).toBe(7200);

    store.getState().addNode(component("firewall"), { x: 300, y: 0 });
    const fwId = store.getState().nodes[1].id;
    store.getState().updateNodeConfig(fwId, { defaultPolicy: "deny" });

    const graph2 = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const fwNode = graph2.nodes.find((n) => n.id === fwId);
    expect(configOf(fwNode?.config).defaultPolicy).toBe("deny");
  });

  it("config changes don't affect other nodes", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().updateNodeConfig(nodes[0].id, { instances: 5 });

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const n1 = graph.nodes.find((n) => n.id === nodes[0].id);
    const n2 = graph.nodes.find((n) => n.id === nodes[1].id);

    expect(configOf(n1?.config).instances).toBe(5);
    expect(configOf(n2?.config).instances).toBe(1);
  });

  it("supports component naming", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    const nodeId = store.getState().nodes[0].id;

    store.getState().updateNodeName(nodeId, "API Server A");

    const node = store.getState().nodes.find((n) => n.id === nodeId);
    expect(node && "data" in node ? (node.data as Record<string, unknown>).name : undefined).toBe("API Server A");
  });

  it("config persists through save/load", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    const nodeId = store.getState().nodes[0].id;

    store.getState().updateNodeConfig(nodeId, { instances: 8 });
    store.getState().updateNodeName(nodeId, "Main App Server");

    const nodes = store.getState().nodes;
    const edges = store.getState().edges;

    store.getState().clearBoard();
    store.getState().loadCanvasState(nodes, edges);

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const loaded = graph.nodes[0];
    const loadedNode = store.getState().nodes.find((n) => n.id === nodeId);

    expect(configOf(loaded.config).instances).toBe(8);
    expect(loadedNode && "data" in loadedNode ? (loadedNode.data as Record<string, unknown>).name : undefined).toBe(
      "Main App Server",
    );
  });
});
