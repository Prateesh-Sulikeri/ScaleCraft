import { describe, expect, it } from "vitest";
import { canvasImportSchema } from "./import-schema";

function validExport() {
  return {
    nodes: [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
      { id: "z1", type: "zone", position: { x: 10, y: 10 }, data: { label: "Backend", width: 320, height: 220 } },
    ],
    edges: [{ id: "e1", source: "n1", target: "n1", data: { kind: "request-flow" } }],
  };
}

describe("canvasImportSchema", () => {
  it("accepts a well-formed export", () => {
    const result = canvasImportSchema.safeParse(validExport());
    expect(result.success).toBe(true);
  });

  it("accepts extra React Flow bookkeeping fields on nodes/edges (selected, zIndex, measured)", () => {
    const data = validExport();
    // @ts-expect-error deliberately adding extra fields real exports carry
    data.nodes[0].selected = true;
    // @ts-expect-error deliberately adding extra fields real exports carry
    data.nodes[0].zIndex = 3;
    // @ts-expect-error deliberately adding extra fields real exports carry
    data.nodes[0].measured = { width: 200, height: 80 };
    // @ts-expect-error deliberately adding extra fields real exports carry
    data.edges[0].selected = false;

    const result = canvasImportSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("rejects a node missing position (would otherwise crash the React Flow renderer)", () => {
    const data = validExport();
    // @ts-expect-error intentionally malformed
    delete data.nodes[0].position;
    const result = canvasImportSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects a node with an unrecognized type", () => {
    const data = validExport();
    data.nodes[0].type = "banana";
    const result = canvasImportSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it("rejects a node missing id", () => {
    const data = validExport();
    // @ts-expect-error intentionally malformed
    delete data.nodes[0].id;
    expect(canvasImportSchema.safeParse(data).success).toBe(false);
  });

  it("rejects an edge with an unrecognized kind", () => {
    const data = validExport();
    data.edges[0].data.kind = "teleport";
    expect(canvasImportSchema.safeParse(data).success).toBe(false);
  });

  it("rejects an edge missing source/target", () => {
    const data = validExport();
    // @ts-expect-error intentionally malformed
    delete data.edges[0].source;
    expect(canvasImportSchema.safeParse(data).success).toBe(false);
  });

  it("rejects a top-level shape missing nodes or edges arrays", () => {
    expect(canvasImportSchema.safeParse({ nodes: [] }).success).toBe(false);
    expect(canvasImportSchema.safeParse({ edges: [] }).success).toBe(false);
    expect(canvasImportSchema.safeParse({}).success).toBe(false);
    expect(canvasImportSchema.safeParse(null).success).toBe(false);
  });

  it("accepts an empty nodes/edges export (a cleared board)", () => {
    expect(canvasImportSchema.safeParse({ nodes: [], edges: [] }).success).toBe(true);
  });

  it("accepts every documented edge kind", () => {
    for (const kind of ["request-flow", "control", "replication", "async"]) {
      const data = validExport();
      data.edges[0].data.kind = kind;
      expect(canvasImportSchema.safeParse(data).success, kind).toBe(true);
    }
  });

  it("accepts every documented node type", () => {
    for (const type of ["component", "zone", "comment", "start"]) {
      const result = canvasImportSchema.safeParse({
        nodes: [{ id: "x", type, position: { x: 0, y: 0 }, data: {} }],
        edges: [],
      });
      expect(result.success, type).toBe(true);
    }
  });
});
