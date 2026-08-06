import { describe, expect, it } from "vitest";
import type { ComponentNodeType } from "@/canvas/types";
import type { BlueprintDriftReport } from "@/validation-engine/blueprint-drift";
import type { ValidationViolation } from "@/validation-engine/types";
import { chapterDisplayViolations, type ViolationSource } from "./chapter-outcome-violations";

function makeOutcome(overrides: Partial<ViolationSource> = {}): ViolationSource {
  return {
    violations: [],
    missingRequiredComponentIds: [],
    disconnectedRequiredComponentIds: [],
    driftReport: null,
    ...overrides,
  };
}

function makeDrift(overrides: Partial<BlueprintDriftReport> = {}): BlueprintDriftReport {
  return {
    blueprintId: "bp-1",
    blueprintLabel: "Taught approach",
    missingComponents: [],
    extraComponentIds: [],
    mismatchedConnections: [],
    ...overrides,
  };
}

function componentNode(id: string, componentId: string): ComponentNodeType {
  return { id, type: "component", position: { x: 0, y: 0 }, data: { componentId, config: {} } };
}

describe("chapterDisplayViolations", () => {
  it("passes real rule violations through unchanged", () => {
    const violation: ValidationViolation = {
      ruleId: "r1",
      severity: "error",
      message: "Bad",
      explanation: "Because reasons.",
      offendingNodeIds: ["n1"],
      offendingEdgeIds: [],
    };
    const result = chapterDisplayViolations(makeOutcome({ violations: [violation] }), []);
    expect(result).toEqual([violation]);
  });

  it("synthesizes a specific, error-severity entry for a missing required component", () => {
    const outcome = makeOutcome({ missingRequiredComponentIds: ["client"] });
    const result = chapterDisplayViolations(outcome, []);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("missing-required-component:client");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/client/i);
    expect(result[0].offendingNodeIds).toEqual([]);
  });

  it("synthesizes an entry pointing at the real offending node for a disconnected required component", () => {
    const nodes = [componentNode("n1", "client"), componentNode("n2", "load-balancer")];
    const outcome = makeOutcome({ disconnectedRequiredComponentIds: ["client"] });
    const result = chapterDisplayViolations(outcome, nodes);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("disconnected-required-component:client");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/client/i);
    expect(result[0].message).toMatch(/not connected/i);
    expect(result[0].offendingNodeIds).toEqual(["n1"]);
  });

  it("synthesizes a blueprint-drift entry with the real deltas when driftReport is present", () => {
    const drift = makeDrift({
      missingComponents: ["Cache"],
      mismatchedConnections: ["Client -> Load Balancer"],
      extraComponentIds: ["message-queue"],
    });
    const outcome = makeOutcome({ driftReport: drift });
    const result = chapterDisplayViolations(outcome, []);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("blueprint-drift:bp-1");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/doesn't yet match/i);
    expect(result[0].explanation).toMatch(/Missing: Cache/);
    expect(result[0].explanation).toMatch(/Client -> Load Balancer/);
    expect(result[0].explanation).toMatch(/Message Queue/);
  });

  it("omits the blueprint-drift entry when driftReport is null", () => {
    const outcome = makeOutcome({ driftReport: null });
    const result = chapterDisplayViolations(outcome, []);
    expect(result).toEqual([]);
  });

  it("never synthesizes a blueprint-drift entry for a plain ChapterValidationOutcome (no driftReport field at all)", () => {
    // Mirrors what Validate actually passes — no `driftReport` key present,
    // as opposed to explicitly null. Both must produce the same "omit" result.
    const outcome: ViolationSource = {
      violations: [],
      missingRequiredComponentIds: [],
      disconnectedRequiredComponentIds: [],
    };
    const result = chapterDisplayViolations(outcome, []);
    expect(result).toEqual([]);
  });

  it("does not synthesize a blueprint-drift entry when a missing/disconnected component is the real reason", () => {
    const outcome = makeOutcome({ missingRequiredComponentIds: ["client"], driftReport: null });
    const result = chapterDisplayViolations(outcome, []);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("missing-required-component:client");
  });

  it("combines real violations with multiple synthetic entries in one list", () => {
    const violation: ValidationViolation = {
      ruleId: "r1",
      severity: "warning",
      message: "Meh",
      explanation: "Because reasons.",
      offendingNodeIds: [],
      offendingEdgeIds: [],
    };
    const outcome = makeOutcome({
      violations: [violation],
      missingRequiredComponentIds: ["client"],
      disconnectedRequiredComponentIds: ["load-balancer"],
    });
    const nodes = [componentNode("n1", "load-balancer")];

    const result = chapterDisplayViolations(outcome, nodes);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe(violation);
    expect(result.map((v) => v.ruleId)).toEqual(
      expect.arrayContaining(["missing-required-component:client", "disconnected-required-component:load-balancer"]),
    );
  });
});
