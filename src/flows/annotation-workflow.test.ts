import { beforeEach, describe, it, expect } from "vitest";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
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

describe("Annotation workflow — zones, comments, start markers", () => {
  beforeEach(() => {
    useCanvasStore.getState().clearBoard();
  });

  it("creates and manages zones", () => {
    useCanvasStore.getState().addZone({ x: 0, y: 0 }, 500, 250);

    expect(useCanvasStore.getState().nodes.some((n) => n.type === "zone")).toBe(true);
  });

  it("zones are excluded from architecture graph", () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    useCanvasStore.getState().addZone({ x: -100, y: -100 }, 200, 200);

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);

    expect(graph.nodes).toHaveLength(1);
    expect(graph.nodes[0].componentId).toBe("client");
  });

  it("resizes zones", () => {
    const zoneId = useCanvasStore.getState().addZone({ x: 0, y: 0 }, 400, 300);

    useCanvasStore.getState().updateZone(zoneId, { width: 600, height: 400 });

    const updated = useCanvasStore.getState().nodes.find((n) => n.id === zoneId);
    expect(dataOf(updated).width).toBe(600);
  });

  it("zones can be labeled", () => {
    const zoneId = useCanvasStore.getState().addZone({ x: 0, y: 0 }, 400, 300);

    useCanvasStore.getState().updateZone(zoneId, { label: "Frontend Services" });

    const updated = useCanvasStore.getState().nodes.find((n) => n.id === zoneId);
    expect(dataOf(updated).label).toBe("Frontend Services");
  });

  it("adds and manages comments", () => {
    useCanvasStore.getState().addComment({ x: 100, y: 100 });

    expect(useCanvasStore.getState().nodes.some((n) => n.type === "comment")).toBe(true);
  });

  it("comments are excluded from graph", () => {
    useCanvasStore.getState().addNode(component("app-server"), { x: 0, y: 0 });
    useCanvasStore.getState().addComment({ x: 200, y: 0 });

    const graph = toArchitectureGraph(useCanvasStore.getState().nodes, useCanvasStore.getState().edges);

    expect(graph.nodes).toHaveLength(1);
  });

  it("updates comment text", () => {
    const commentId = useCanvasStore.getState().addComment({ x: 0, y: 0 });
    const text = "High load here";

    useCanvasStore.getState().updateComment(commentId, { text });

    const updated = useCanvasStore.getState().nodes.find((n) => n.id === commentId);
    expect(dataOf(updated).text).toBe(text);
  });

  it("adds and labels start markers", () => {
    const startId = useCanvasStore.getState().addStartMarker({ x: 0, y: 0 });

    expect(useCanvasStore.getState().nodes.some((n) => n.type === "start")).toBe(true);

    useCanvasStore.getState().updateStartMarker(startId, { label: "User Request" });

    const updated = useCanvasStore.getState().nodes.find((n) => n.id === startId);
    expect(dataOf(updated).label).toBe("User Request");
  });

  it("all annotations persist through save/load", async () => {
    useCanvasStore.getState().addNode(component("client"), { x: 0, y: 0 });
    const zoneId = useCanvasStore.getState().addZone({ x: -100, y: -100 }, 300, 200);
    const commentId = useCanvasStore.getState().addComment({ x: 200, y: 200 });
    const startId = useCanvasStore.getState().addStartMarker({ x: -200, y: 0 });

    useCanvasStore.getState().updateZone(zoneId, { label: "API Layer" });
    useCanvasStore.getState().updateComment(commentId, { text: "High load here" });
    useCanvasStore.getState().updateStartMarker(startId, { label: "Entry" });

    const nodes = useCanvasStore.getState().nodes;
    const edges = useCanvasStore.getState().edges;

    useCanvasStore.getState().clearBoard();
    useCanvasStore.getState().loadCanvasState(nodes, edges);

    expect(useCanvasStore.getState().nodes.some((n) => n.type === "zone")).toBe(true);
    expect(useCanvasStore.getState().nodes.some((n) => n.type === "comment")).toBe(true);
    expect(useCanvasStore.getState().nodes.some((n) => n.type === "start")).toBe(true);

    const loadedZone = useCanvasStore.getState().nodes.find((n) => n.type === "zone");
    expect(dataOf(loadedZone).label).toBe("API Layer");
  });
});
