import { beforeEach, describe, it, expect } from "vitest";
import { createCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { getComponent } from "@/content/components/registry";
import type { AnyNodeType } from "@/canvas/types";

function component(id: string) {
  const def = getComponent(id);
  if (!def) throw new Error(`Unknown component id: ${id}`);
  return def;
}

function dataOf(node: AnyNodeType | undefined): Record<string, unknown> {
  return node?.data as Record<string, unknown>;
}

let store: ReturnType<typeof createCanvasStore>;

describe("Annotation workflow — zones, comments, start markers", () => {
  beforeEach(() => {
    store = createCanvasStore();
  });

  it("creates and manages zones", () => {
    store.getState().addZone({ x: 0, y: 0 }, 500, 250);

    expect(store.getState().nodes.some((n) => n.type === "zone")).toBe(true);
  });

  it("zones are excluded from architecture graph", () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    store.getState().addZone({ x: -100, y: -100 }, 200, 200);

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].componentId).toBe("client");
  });

  it("resizes zones", () => {
    const zoneId = store.getState().addZone({ x: 0, y: 0 }, 400, 300);

    store.getState().updateZone(zoneId, { width: 600, height: 400 });

    const updated = store.getState().nodes.find((n) => n.id === zoneId);
    expect(dataOf(updated).width).toBe(600);
  });

  it("zones can be labeled", () => {
    const zoneId = store.getState().addZone({ x: 0, y: 0 }, 400, 300);

    store.getState().updateZone(zoneId, { label: "Frontend Services" });

    const updated = store.getState().nodes.find((n) => n.id === zoneId);
    expect(dataOf(updated).label).toBe("Frontend Services");
  });

  it("adds and manages comments", () => {
    store.getState().addComment({ x: 100, y: 100 });

    expect(store.getState().nodes.some((n) => n.type === "comment")).toBe(true);
  });

  it("comments are excluded from graph", () => {
    store.getState().addNode(component("app-server"), { x: 0, y: 0 });
    store.getState().addComment({ x: 200, y: 0 });

    const graph = toArchitectureGraph(store.getState().nodes, store.getState().edges);

    expect(graph.nodes).toHaveLength(1);
  });

  it("updates comment text", () => {
    const commentId = store.getState().addComment({ x: 0, y: 0 });
    const text = "High load here";

    store.getState().updateComment(commentId, { text });

    const updated = store.getState().nodes.find((n) => n.id === commentId);
    expect(dataOf(updated).text).toBe(text);
  });

  it("adds and labels start markers", () => {
    const startId = store.getState().addStartMarker({ x: 0, y: 0 });

    expect(store.getState().nodes.some((n) => n.type === "start")).toBe(true);

    store.getState().updateStartMarker(startId, { label: "User Request" });

    const updated = store.getState().nodes.find((n) => n.id === startId);
    expect(dataOf(updated).label).toBe("User Request");
  });

  it("all annotations persist through save/load", async () => {
    store.getState().addNode(component("client"), { x: 0, y: 0 });
    const zoneId = store.getState().addZone({ x: -100, y: -100 }, 300, 200);
    const commentId = store.getState().addComment({ x: 200, y: 200 });
    const startId = store.getState().addStartMarker({ x: -200, y: 0 });

    store.getState().updateZone(zoneId, { label: "API Layer" });
    store.getState().updateComment(commentId, { text: "High load here" });
    store.getState().updateStartMarker(startId, { label: "Entry" });

    const nodes = store.getState().nodes;
    const edges = store.getState().edges;

    store.getState().clearBoard();
    store.getState().loadCanvasState(nodes, edges);

    expect(store.getState().nodes.some((n) => n.type === "zone")).toBe(true);
    expect(store.getState().nodes.some((n) => n.type === "comment")).toBe(true);
    expect(store.getState().nodes.some((n) => n.type === "start")).toBe(true);

    const loadedZone = store.getState().nodes.find((n) => n.type === "zone");
    expect(dataOf(loadedZone).label).toBe("API Layer");
  });
});
