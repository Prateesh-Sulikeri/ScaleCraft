import { beforeEach, describe, it, expect } from "vitest";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
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

describe("Component configuration workflow", () => {
  beforeEach(() => {
    useCanvasStore.getState().clearBoard();
  });

  it("opens inspector when clicking a component", () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().setSelectedNodeId(nodeId);

    expect(useCanvasStore.getState().selectedNodeId).toBe(nodeId);
  });

  it("updates config and reflects in store", () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodeConfig(nodeId, { algorithm: "least-connections" });

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const node = graph.nodes.find((n) => n.id === nodeId);

    expect(configOf(node?.config).algorithm).toBe("least-connections");
  });

  it("validates based on updated config", () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore
      .getState()
      .onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    let violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);

    useCanvasStore.getState().updateNodeConfig(nodes[1].id, { instances: 3 });

    graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(false);
  });

  it("handles different config field types", () => {
    useCanvasStore.getState().addNode(component("cache"), { x: 0, y: 0 });
    const cacheId = useCanvasStore.getState().nodes[0].id;
    useCanvasStore.getState().updateNodeConfig(cacheId, { ttlSeconds: 7200 });

    const graph1 = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const cacheNode = graph1.nodes.find((n) => n.id === cacheId);
    expect(configOf(cacheNode?.config).ttlSeconds).toBe(7200);

    useCanvasStore.getState().addNode(component("firewall"), { x: 300, y: 0 });
    const fwId = useCanvasStore.getState().nodes[1].id;
    useCanvasStore.getState().updateNodeConfig(fwId, { defaultPolicy: "deny" });

    const graph2 = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const fwNode = graph2.nodes.find((n) => n.id === fwId);
    expect(configOf(fwNode?.config).defaultPolicy).toBe("deny");
  });

  it("config changes don't affect other nodes", () => {
    useCanvasStore.getState().addNode(component("app-server"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().updateNodeConfig(nodes[0].id, { instances: 5 });

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const n1 = graph.nodes.find((n) => n.id === nodes[0].id);
    const n2 = graph.nodes.find((n) => n.id === nodes[1].id);

    expect(configOf(n1?.config).instances).toBe(5);
    expect(configOf(n2?.config).instances).toBe(1);
  });

  it("supports component naming", () => {
    useCanvasStore.getState().addNode(component("app-server"), { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodeName(nodeId, "API Server A");

    const node = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);
    expect(node && "data" in node ? (node.data as Record<string, unknown>).name : undefined).toBe("API Server A");
  });

  it("config persists through save/load", () => {
    useCanvasStore.getState().addNode(component("app-server"), { x: 0, y: 0 });
    const nodeId = useCanvasStore.getState().nodes[0].id;

    useCanvasStore.getState().updateNodeConfig(nodeId, { instances: 8 });
    useCanvasStore.getState().updateNodeName(nodeId, "Main App Server");

    const nodes = useCanvasStore.getState().nodes;
    const edges = useCanvasStore.getState().edges;

    useCanvasStore.getState().clearBoard();
    useCanvasStore.getState().loadCanvasState(nodes, edges);

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const loaded = graph.nodes[0];
    const loadedNode = useCanvasStore.getState().nodes.find((n) => n.id === nodeId);

    expect(configOf(loaded.config).instances).toBe(8);
    expect(loadedNode && "data" in loadedNode ? (loadedNode.data as Record<string, unknown>).name : undefined).toBe(
      "Main App Server",
    );
  });
});
