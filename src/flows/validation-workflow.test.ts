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

let store: ReturnType<typeof createCanvasStore>;

describe("Validation workflow — build, validate, fix", () => {
  beforeEach(() => {
    store = createCanvasStore();
  });

  it("catches direct Client→Database anti-pattern", () => {
    const clientDef = component("client");
    const dbDef = component("sql-database");

    store.getState().addNode(clientDef, { x: 0, y: 0 });
    store.getState().addNode(dbDef, { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "no-direct-client-database")).toBe(true);
  });

  it("catches single-instance load balancer", () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);
  });

  it("fixes single-instance by updating config", () => {
    store.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    store.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    let violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);

    store.getState().updateNodeConfig(nodes[1].id, { instances: 2 });

    graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(false);
  });

  it("detects request-flow cycles", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    store.getState().addNode(component("cache"), { x: 300, y: 0 });
    store.getState().addNode(component("message-queue"), { x: 600, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    store.getState().onConnect({ source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null }, "request-flow");
    store.getState().onConnect({ source: nodes[2].id, target: nodes[0].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "request-flow-cycle")).toBe(true);
  });

  it("catches orphan read replica", () => {
    store.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(true);
  });

  it("fixes orphan replica by changing edge kind", () => {
    store.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    store.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = store.getState().nodes;
    store.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    let violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(true);

    // Change the edge kind
    const edges = store.getState().edges;
    store.getState().setEdgeKind(edges[0].id, "replication");

    graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);
    violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(false);
  });
});
