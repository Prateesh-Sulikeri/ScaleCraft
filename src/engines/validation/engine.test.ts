import { describe, it, expect } from "vitest";
import { validationEngine } from "./engine";
import type { ArchitectureGraph } from "@/lib/graph";

describe("validationEngine", () => {
  it("has the expected id/label", () => {
    expect(validationEngine.id).toBe("validation");
    expect(validationEngine.label).toBe("Validation");
  });

  it("run() delegates to runValidation and resolves with its result", async () => {
    const graph: ArchitectureGraph = { nodes: [], edges: [], entryPointIds: [] };
    const result = await validationEngine.run({ graph, rules: [] });
    expect(result).toEqual([]);
  });
});
