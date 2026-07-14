import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/** Config-aware: only fires for a `deliveryGuarantee` that can actually
 * retry (at-least-once/exactly-once) — an at-most-once queue that drops a
 * failed message by design has nothing for a Dead Letter Queue to catch. */
export const queueWithoutDeadLetterQueue: ValidationRule = {
  id: "queue-without-dead-letter-queue",
  severity: "warning",
  match: (graph: ArchitectureGraph) => {
    const results = [];

    const queues = graph.nodes.filter((n) => {
      if (n.componentId !== "message-queue") return false;
      const config = n.config as { deliveryGuarantee?: string } | undefined;
      return config?.deliveryGuarantee !== "at-most-once";
    });

    for (const queue of queues) {
      const hasDlq = graph.edges.some((e) => {
        if (e.source !== queue.id) return false;
        const target = graph.nodes.find((n) => n.id === e.target);
        return target?.componentId === "dead-letter-queue";
      });
      if (!hasDlq) {
        results.push({ offendingNodeIds: [queue.id], offendingEdgeIds: [] });
      }
    }

    return results;
  },
  message: () => "Message Queue has no Dead Letter Queue.",
  explanation: () =>
    "This queue's deliveryGuarantee means a failed message gets retried rather than dropped once — " +
    "without a Dead Letter Queue connected, a message that keeps failing has nowhere to go: it either " +
    "retries forever or is eventually dropped silently. Connect a Dead Letter Queue to give failures " +
    "somewhere to land.",
};
