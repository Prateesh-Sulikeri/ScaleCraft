import { describe, expect, it } from "vitest";
import type { ComponentNodeType } from "@/canvas/types";
import type { Blueprint, ChapterDefinition } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";
import type { ValidationViolation } from "@/validation-engine/types";
import { chapterDisplayViolations } from "./chapter-outcome-violations";

function makeOutcome(overrides: Partial<ChapterOutcome> = {}): ChapterOutcome {
  return {
    passed: false,
    matchedBlueprintId: null,
    violations: [],
    errorCount: 0,
    missingRequiredComponentIds: [],
    disconnectedRequiredComponentIds: [],
    ...overrides,
  };
}

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: "ch-1",
    mode: "building-blocks",
    title: "Test Chapter",
    problemStatement: "",
    learningObjectives: [],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
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
    const result = chapterDisplayViolations(makeOutcome({ violations: [violation] }), makeChapter(), []);
    expect(result).toEqual([violation]);
  });

  it("synthesizes a specific, error-severity entry for a missing required component", () => {
    const outcome = makeOutcome({ missingRequiredComponentIds: ["client"] });
    const result = chapterDisplayViolations(outcome, makeChapter(), []);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("missing-required-component:client");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/client/i);
    expect(result[0].offendingNodeIds).toEqual([]);
  });

  it("synthesizes an entry pointing at the real offending node for a disconnected required component", () => {
    const nodes = [componentNode("n1", "client"), componentNode("n2", "load-balancer")];
    const outcome = makeOutcome({ disconnectedRequiredComponentIds: ["client"] });
    const result = chapterDisplayViolations(outcome, makeChapter(), nodes);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("disconnected-required-component:client");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/client/i);
    expect(result[0].message).toMatch(/not connected/i);
    expect(result[0].offendingNodeIds).toEqual(["n1"]);
  });

  it("synthesizes a blueprint-mismatch entry when every other check is clean but no blueprint matched", () => {
    const bp: Blueprint = { id: "bp-1", label: "Taught approach", require: { nodes: [] }, commentary: "" };
    const outcome = makeOutcome({ passed: false, matchedBlueprintId: null, violations: [] });
    const result = chapterDisplayViolations(outcome, makeChapter({ blueprints: [bp] }), []);

    expect(result).toHaveLength(1);
    expect(result[0].ruleId).toBe("blueprint-mismatch");
    expect(result[0].severity).toBe("error");
    expect(result[0].message).toMatch(/doesn't match/i);
  });

  it("omits the blueprint-mismatch entry when the chapter declares no blueprints", () => {
    const outcome = makeOutcome({ passed: false, violations: [] });
    const result = chapterDisplayViolations(outcome, makeChapter({ blueprints: [] }), []);
    expect(result).toEqual([]);
  });

  it("omits the blueprint-mismatch entry once the chapter has actually passed", () => {
    const bp: Blueprint = { id: "bp-1", label: "Taught approach", require: { nodes: [] }, commentary: "" };
    const outcome = makeOutcome({ passed: true, matchedBlueprintId: "bp-1", violations: [] });
    const result = chapterDisplayViolations(outcome, makeChapter({ blueprints: [bp] }), []);
    expect(result).toEqual([]);
  });

  it("does not synthesize a blueprint-mismatch entry when a missing/disconnected component is the real reason", () => {
    const bp: Blueprint = { id: "bp-1", label: "Taught approach", require: { nodes: [] }, commentary: "" };
    const outcome = makeOutcome({ missingRequiredComponentIds: ["client"], violations: [] });
    const result = chapterDisplayViolations(outcome, makeChapter({ blueprints: [bp] }), []);

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

    const result = chapterDisplayViolations(outcome, makeChapter(), nodes);

    expect(result).toHaveLength(3);
    expect(result[0]).toBe(violation);
    expect(result.map((v) => v.ruleId)).toEqual(
      expect.arrayContaining(["missing-required-component:client", "disconnected-required-component:load-balancer"]),
    );
  });
});
