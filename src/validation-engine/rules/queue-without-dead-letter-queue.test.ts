import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { queueWithoutDeadLetterQueue } from "./queue-without-dead-letter-queue";

describe("queueWithoutDeadLetterQueue", () => {
  it("flags an at-least-once queue with no connected Dead Letter Queue", () => {
    const queue = {
      id: "q-1",
      componentId: "message-queue",
      position: { x: 0, y: 0 },
      config: { deliveryGuarantee: "at-least-once" },
    };
    const graph: ArchitectureGraph = { nodes: [queue], edges: [] };

    const violations = runValidation(graph, [queueWithoutDeadLetterQueue]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("warning");
    expect(violations[0].offendingNodeIds).toEqual(["q-1"]);
  });

  it("passes when a Dead Letter Queue is connected", () => {
    const queue = {
      id: "q-1",
      componentId: "message-queue",
      position: { x: 0, y: 0 },
      config: { deliveryGuarantee: "at-least-once" },
    };
    const dlq = { id: "dlq-1", componentId: "dead-letter-queue", position: { x: 1, y: 0 }, config: { maxRetries: 5 } };
    const graph: ArchitectureGraph = {
      nodes: [queue, dlq],
      edges: [{ id: "e1", source: "q-1", target: "dlq-1", kind: "async" }],
    };

    expect(runValidation(graph, [queueWithoutDeadLetterQueue])).toHaveLength(0);
  });

  it("does not flag an at-most-once queue even with no Dead Letter Queue", () => {
    const queue = {
      id: "q-1",
      componentId: "message-queue",
      position: { x: 0, y: 0 },
      config: { deliveryGuarantee: "at-most-once" },
    };
    const graph: ArchitectureGraph = { nodes: [queue], edges: [] };

    expect(runValidation(graph, [queueWithoutDeadLetterQueue])).toHaveLength(0);
  });
});
