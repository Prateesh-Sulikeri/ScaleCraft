import { describe, it, expect, vi } from "vitest";
import { runValidation, hasErrors } from "./engine";
import type { ValidationRule, ValidationViolation } from "./types";
import type { ArchitectureGraph, EdgeKind, GraphEdge, GraphNode } from "@/lib/graph";
import { emptyGraph } from "@/lib/graph";

function rule(id: string, severity: ValidationViolation["severity"], matches: number): ValidationRule {
  return {
    id,
    severity,
    match: () => Array.from({ length: matches }, () => ({ offendingNodeIds: [id], offendingEdgeIds: [] })),
    message: () => `${id} message`,
    explanation: () => `${id} explanation`,
  };
}

function node(id: string, componentId: string): GraphNode {
  return { id, componentId, position: { x: 0, y: 0 }, config: {} };
}

function edge(id: string, source: string, target: string, kind: EdgeKind = "request-flow"): GraphEdge {
  return { id, source, target, kind };
}

describe("runValidation", () => {
  it("returns no violations when no rules match", () => {
    expect(runValidation(emptyGraph(), [rule("r1", "error", 0)])).toEqual([]);
  });

  it("aggregates every match from every rule into one flat list", () => {
    const violations = runValidation(emptyGraph(), [rule("r1", "error", 2), rule("r2", "warning", 1)]);
    expect(violations).toHaveLength(3);
    expect(violations.map((v) => v.ruleId)).toEqual(["r1", "r1", "r2"]);
    expect(violations[2].severity).toBe("warning");
    expect(violations[0].message).toBe("r1 message");
    expect(violations[0].explanation).toBe("r1 explanation");
  });

  it("runs with an empty rule set", () => {
    expect(runValidation(emptyGraph(), [])).toEqual([]);
  });

  it("skips a rule that throws, keeps other rules' violations, and logs the failing rule's id", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const throwingRule: ValidationRule = {
      id: "throws",
      severity: "error",
      match: () => {
        throw new Error("boom");
      },
      message: () => "never shown",
      explanation: () => "never shown",
    };

    const violations = runValidation(emptyGraph(), [rule("r1", "error", 1), throwingRule, rule("r2", "warning", 1)]);

    expect(violations.map((v) => v.ruleId)).toEqual(["r1", "r2"]);
    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy.mock.calls[0][0]).toContain("throws");

    errorSpy.mockRestore();
  });

  it("dispatches a PatternRule through the matcher, producing violations with resolved node/edge ids", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer"), node("app-1", "app-server")],
      edges: [edge("e1", "lb-1", "app-1")],
      entryPointIds: [],
    };
    const patternRule: ValidationRule = {
      kind: "pattern",
      id: "lb-to-app",
      severity: "warning",
      forbid: {
        id: "lb-to-app",
        nodes: [
          { alias: "lb", componentId: "load-balancer" },
          { alias: "app", componentId: "app-server" },
        ],
        edges: [{ from: "lb", to: "app" }],
      },
      message: "pattern message",
      explanation: (m) => `explains ${m.offendingNodeIds.join(",")}`,
    };

    const violations = runValidation(graph, [patternRule]);

    expect(violations).toEqual([
      {
        ruleId: "lb-to-app",
        severity: "warning",
        message: "pattern message",
        explanation: "explains lb-1,app-1",
        offendingNodeIds: ["lb-1", "app-1"],
        offendingEdgeIds: ["e1"],
      },
    ]);
  });

  it("mixes an ImperativeRule and a PatternRule in one call into the same violation shape", () => {
    const graph: ArchitectureGraph = {
      nodes: [node("lb-1", "load-balancer"), node("app-1", "app-server")],
      edges: [edge("e1", "lb-1", "app-1")],
      entryPointIds: [],
    };
    const patternRule: ValidationRule = {
      kind: "pattern",
      id: "pattern-rule",
      severity: "warning",
      forbid: { nodes: [{ alias: "lb", componentId: "load-balancer" }] },
      message: "pattern message",
      explanation: "pattern explanation",
    };

    const violations = runValidation(graph, [rule("imperative-rule", "error", 1), patternRule]);

    expect(violations.map((v) => v.ruleId)).toEqual(["imperative-rule", "pattern-rule"]);
    for (const v of violations) {
      expect(v).toEqual(
        expect.objectContaining({
          ruleId: expect.any(String),
          severity: expect.any(String),
          message: expect.any(String),
          explanation: expect.any(String),
          offendingNodeIds: expect.any(Array),
          offendingEdgeIds: expect.any(Array),
        }),
      );
    }
  });
});

describe("hasErrors", () => {
  it("is false for an empty violation list", () => {
    expect(hasErrors([])).toBe(false);
  });

  it("is false when every violation is a warning", () => {
    const violations = runValidation(emptyGraph(), [rule("r1", "warning", 1)]);
    expect(hasErrors(violations)).toBe(false);
  });

  it("is true when at least one violation is an error", () => {
    const violations = runValidation(emptyGraph(), [rule("r1", "warning", 1), rule("r2", "error", 1)]);
    expect(hasErrors(violations)).toBe(true);
  });
});
