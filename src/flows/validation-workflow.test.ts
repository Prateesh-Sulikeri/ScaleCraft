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

describe("Validation workflow — build, validate, fix", () => {
  beforeEach(() => {
    useCanvasStore.getState().clearBoard();
  });

  it("catches direct Client→Database anti-pattern", () => {
    const clientDef = component("client");
    const dbDef = component("sql-database");

    useCanvasStore.getState().addNode(clientDef, { x: 0, y: 0 });
    useCanvasStore.getState().addNode(dbDef, { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "no-direct-client-database")).toBe(true);
  });

  it("catches single-instance load balancer", () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);
  });

  it("fixes single-instance by updating config", () => {
    useCanvasStore.getState().addNode(component("load-balancer"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("app-server"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    let violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(true);

    useCanvasStore.getState().updateNodeConfig(nodes[1].id, { instances: 2 });

    graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "single-instance-load-balancer")).toBe(false);
  });

  it("detects request-flow cycles", () => {
    useCanvasStore.getState().addNode(component("app-server"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("cache"), { x: 300, y: 0 });
    useCanvasStore.getState().addNode(component("message-queue"), { x: 600, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");
    useCanvasStore.getState().onConnect({ source: nodes[1].id, target: nodes[2].id, sourceHandle: null, targetHandle: null }, "request-flow");
    useCanvasStore.getState().onConnect({ source: nodes[2].id, target: nodes[0].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "request-flow-cycle")).toBe(true);
  });

  it("catches orphan read replica", () => {
    useCanvasStore.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    const violations = runValidation(graph, ruleRegistry);

    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(true);
  });

  it("fixes orphan replica by changing edge kind", () => {
    useCanvasStore.getState().addNode(component("sql-database"), { x: 0, y: 0 });
    useCanvasStore.getState().addNode(component("read-replica"), { x: 300, y: 0 });

    const nodes = useCanvasStore.getState().nodes;
    useCanvasStore.getState().onConnect({ source: nodes[0].id, target: nodes[1].id, sourceHandle: null, targetHandle: null }, "request-flow");

    let graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    let violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(true);

    // Change the edge kind
    const edges = useCanvasStore.getState().edges;
    useCanvasStore.getState().setEdgeKind(edges[0].id, "replication");

    graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);
    violations = runValidation(graph, ruleRegistry);
    expect(violations.some((v) => v.ruleId === "orphan-read-replica")).toBe(false);
  });
});
