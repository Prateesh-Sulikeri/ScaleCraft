import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { exportCanvasAsJson } from "./export-json";
import type { ComponentNodeType, ArchitectureEdgeType } from "./types";

describe("exportCanvasAsJson", () => {
  let createObjectURLSpy: ReturnType<typeof vi.fn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.fn>;
  let clickSpy: ReturnType<typeof vi.fn<() => void>>;
  let anchor: HTMLAnchorElement;

  beforeEach(() => {
    createObjectURLSpy = vi.fn(() => "blob:mock-url");
    revokeObjectURLSpy = vi.fn();
    // jsdom doesn't implement createObjectURL/revokeObjectURL.
    // @ts-expect-error partial URL stub for this test only
    global.URL.createObjectURL = createObjectURLSpy;
    // @ts-expect-error partial URL stub for this test only
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    clickSpy = vi.fn<() => void>();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
      const el = realCreateElement(tagName);
      if (tagName === "a") anchor = el as HTMLAnchorElement;
      if (tagName === "a") el.click = clickSpy;
      return el;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("builds a JSON blob containing the given nodes/edges and triggers a download", () => {
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n1" }];

    exportCanvasAsJson(nodes, edges);

    expect(createObjectURLSpy).toHaveBeenCalledTimes(1);
    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("application/json");

    expect(anchor.href).toBe("blob:mock-url");
    expect(anchor.download).toMatch(/^scalecraft-canvas-\d+\.json$/);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
  });

  it("serializes the exact nodes/edges passed in (round-trips through the Blob)", async () => {
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 5, y: 10 }, data: { componentId: "app-server", config: { instances: 3 } } },
    ];
    const edges: ArchitectureEdgeType[] = [];

    exportCanvasAsJson(nodes, edges);

    const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
    const text = await blob.text();
    expect(JSON.parse(text)).toEqual({ nodes, edges });
  });

  it("exports an empty graph without throwing", () => {
    expect(() => exportCanvasAsJson([], [])).not.toThrow();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});
