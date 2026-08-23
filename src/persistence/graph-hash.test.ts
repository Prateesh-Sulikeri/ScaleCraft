import { describe, it, expect } from "vitest";
import { hashCanvasState } from "./graph-hash";
import type { AnyNodeType, ArchitectureEdgeType, ComponentNodeType } from "@/canvas/types";

function node(overrides: Partial<ComponentNodeType> = {}): ComponentNodeType {
  return {
    id: "a",
    type: "component",
    position: { x: 0, y: 0 },
    data: { componentId: "client", config: {} },
    ...overrides,
  } as ComponentNodeType;
}

const noEdges: ArchitectureEdgeType[] = [];

describe("hashCanvasState", () => {
  it("is stable for the same graph", () => {
    expect(hashCanvasState([node()], noEdges)).toBe(hashCanvasState([node()], noEdges));
  });

  it("changes when a node moves", () => {
    const moved = node({ position: { x: 40, y: 0 } });
    expect(hashCanvasState([moved], noEdges)).not.toBe(hashCanvasState([node()], noEdges));
  });

  it("changes when config changes", () => {
    const configured = node({ data: { componentId: "client", config: { instances: 2 } } });
    expect(hashCanvasState([configured], noEdges)).not.toBe(hashCanvasState([node()], noEdges));
  });

  it("changes when an edge is added", () => {
    const edge = { id: "e1", source: "a", target: "b" } as ArchitectureEdgeType;
    expect(hashCanvasState([node()], [edge])).not.toBe(hashCanvasState([node()], noEdges));
  });

  // These are the false positives the hash exists to filter out: without them
  // every selection and every hover would look like an edit worth pushing.
  it("ignores selection and drag state", () => {
    const selected = { ...node(), selected: true, dragging: true } as AnyNodeType;
    expect(hashCanvasState([selected], noEdges)).toBe(hashCanvasState([node()], noEdges));
  });

  it("ignores validation and highlight state, which are rendered not stored", () => {
    const decorated = node({ data: { componentId: "client", config: {}, validationState: "error", highlighted: true } });
    expect(hashCanvasState([decorated], noEdges)).toBe(hashCanvasState([node()], noEdges));
  });

  it("ignores sub-pixel drift from a drag", () => {
    const nudged = node({ position: { x: 0.3, y: -0.2 } });
    expect(hashCanvasState([nudged], noEdges)).toBe(hashCanvasState([node()], noEdges));
  });

  it("distinguishes an empty board from a populated one", () => {
    expect(hashCanvasState([], noEdges)).not.toBe(hashCanvasState([node()], noEdges));
  });
});
