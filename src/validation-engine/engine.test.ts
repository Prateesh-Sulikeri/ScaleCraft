import { describe, it, expect } from "vitest";
import { runValidation, hasErrors } from "./engine";
import type { ValidationRule, ValidationViolation } from "./types";
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
