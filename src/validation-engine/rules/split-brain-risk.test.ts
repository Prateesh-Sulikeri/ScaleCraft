import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { splitBrainRisk } from "./split-brain-risk";

const leader1 = { id: "leader-1", componentId: "leader", position: { x: 0, y: 0 }, config: { electionTimeoutMs: 1000 } };
const leader2 = { id: "leader-2", componentId: "leader", position: { x: 0, y: 1 }, config: { electionTimeoutMs: 1000 } };
const coordinator = {
  id: "coord-1",
  componentId: "coordinator",
  position: { x: 1, y: 0 },
  config: { consensusProtocol: "raft" },
};

describe("splitBrainRisk", () => {
  it("flags two Leaders with no Coordinator", () => {
    const graph: ArchitectureGraph = { nodes: [leader1, leader2], edges: [] };

    const violations = runValidation(graph, [splitBrainRisk]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("warning");
    expect(violations[0].offendingNodeIds).toEqual(["leader-1", "leader-2"]);
  });

  it("passes when a Coordinator is present", () => {
    const graph: ArchitectureGraph = { nodes: [leader1, leader2, coordinator], edges: [] };
    expect(runValidation(graph, [splitBrainRisk])).toHaveLength(0);
  });

  it("passes with a single Leader", () => {
    const graph: ArchitectureGraph = { nodes: [leader1], edges: [] };
    expect(runValidation(graph, [splitBrainRisk])).toHaveLength(0);
  });
});
