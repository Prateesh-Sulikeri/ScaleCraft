import { describe, it, expect, vi } from "vitest";
import type { ArchitectureGraph, GraphNode } from "@/lib/graph";
import type { Blueprint, ChapterDefinition } from "@/content/chapters/types";
import type { ValidationRule } from "./types";

const { getRulesMock } = vi.hoisted(() => ({ getRulesMock: vi.fn() }));
vi.mock("./rules", () => ({ getRules: getRulesMock }));

import { evaluateChapter } from "./chapter-outcome";

function node(id: string, componentId: string): GraphNode {
  return { id, componentId, position: { x: 0, y: 0 }, config: {} };
}

function chapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
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

function blueprint(overrides: Partial<Blueprint> = {}): Blueprint {
  return {
    id: "bp-1",
    label: "Blueprint",
    require: { nodes: [] },
    commentary: "",
    ...overrides,
  };
}

function rule(id: string, severity: ValidationRule["severity"]): ValidationRule {
  return {
    id,
    severity,
    match: () => [{ offendingNodeIds: [], offendingEdgeIds: [] }],
    message: () => `${id} message`,
    explanation: () => `${id} explanation`,
  };
}

describe("evaluateChapter", () => {
  it("passes a zero-error graph when the chapter declares no blueprints (rules alone decide)", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [], edges: [], entryPointIds: [] };

    const outcome = evaluateChapter(graph, chapter());

    expect(outcome.passed).toBe(true);
    expect(outcome.matchedBlueprintId).toBeNull();
    expect(outcome.errorCount).toBe(0);
  });

  it("fails when a required component is entirely missing from the canvas", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [], edges: [], entryPointIds: [] };

    const outcome = evaluateChapter(graph, chapter({ requiredComponentIds: ["load-balancer"] }));

    expect(outcome.passed).toBe(false);
    expect(outcome.missingRequiredComponentIds).toEqual(["load-balancer"]);
    expect(outcome.disconnectedRequiredComponentIds).toEqual([]);
  });

  it("fails when a required component is present but has no incident edge and is not an entry point", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "load-balancer")], edges: [], entryPointIds: [] };

    const outcome = evaluateChapter(graph, chapter({ requiredComponentIds: ["load-balancer"] }));

    expect(outcome.passed).toBe(false);
    expect(outcome.disconnectedRequiredComponentIds).toEqual(["load-balancer"]);
    expect(outcome.missingRequiredComponentIds).toEqual([]);
  });

  it("counts a required component connected only via an entryPointIds marker as connected", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "client")], edges: [], entryPointIds: ["n1"] };

    const outcome = evaluateChapter(graph, chapter({ requiredComponentIds: ["client"] }));

    expect(outcome.passed).toBe(true);
    expect(outcome.missingRequiredComponentIds).toEqual([]);
    expect(outcome.disconnectedRequiredComponentIds).toEqual([]);
  });

  it("passes and reports the matched blueprint id when the graph contains its required shape", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "cache")], edges: [], entryPointIds: [] };
    const bp = blueprint({ id: "cache-aside", require: { nodes: [{ alias: "c", componentId: "cache" }] } });

    const outcome = evaluateChapter(graph, chapter({ blueprints: [bp] }));

    expect(outcome.passed).toBe(true);
    expect(outcome.matchedBlueprintId).toBe("cache-aside");
  });

  it("passes with the second blueprint's id when only the second of two declared blueprints matches", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "cache")], edges: [], entryPointIds: [] };
    const bpQueue = blueprint({ id: "queue-based", require: { nodes: [{ alias: "q", componentId: "queue" }] } });
    const bpCache = blueprint({ id: "cache-aside", require: { nodes: [{ alias: "c", componentId: "cache" }] } });

    const outcome = evaluateChapter(graph, chapter({ blueprints: [bpQueue, bpCache] }));

    expect(outcome.passed).toBe(true);
    expect(outcome.matchedBlueprintId).toBe("cache-aside");
  });

  it("fails on a single error-severity violation even when a blueprint would otherwise match", () => {
    getRulesMock.mockReturnValue([rule("r-error", "error")]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "cache")], edges: [], entryPointIds: [] };
    const bp = blueprint({ require: { nodes: [{ alias: "c", componentId: "cache" }] } });

    const outcome = evaluateChapter(graph, chapter({ validationRuleIds: ["r-error"], blueprints: [bp] }));

    expect(outcome.passed).toBe(false);
    expect(outcome.errorCount).toBe(1);
    expect(outcome.matchedBlueprintId).toBe(bp.id);
  });

  it("passes with only warning/note severity violations present, zero errors, and a matching blueprint", () => {
    getRulesMock.mockReturnValue([rule("r-warn", "warning"), rule("r-note", "note")]);
    const graph: ArchitectureGraph = { nodes: [node("n1", "cache")], edges: [], entryPointIds: [] };
    const bp = blueprint({ require: { nodes: [{ alias: "c", componentId: "cache" }] } });

    const outcome = evaluateChapter(
      graph,
      chapter({ validationRuleIds: ["r-warn", "r-note"], blueprints: [bp] }),
    );

    expect(outcome.passed).toBe(true);
    expect(outcome.errorCount).toBe(0);
    expect(outcome.violations).toHaveLength(2);
  });

  it("does not count a blueprint as matched when the graph also matches one of its forbid patterns", () => {
    getRulesMock.mockReturnValue([]);
    const graph: ArchitectureGraph = {
      nodes: [node("n1", "cache"), node("n2", "queue")],
      edges: [],
      entryPointIds: [],
    };
    const bp = blueprint({
      require: { nodes: [{ alias: "c", componentId: "cache" }] },
      forbid: [{ nodes: [{ alias: "q", componentId: "queue" }] }],
    });

    const outcome = evaluateChapter(graph, chapter({ blueprints: [bp] }));

    expect(outcome.passed).toBe(false);
    expect(outcome.matchedBlueprintId).toBeNull();
  });
});
