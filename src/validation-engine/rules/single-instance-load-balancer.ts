import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/**
 * Config-aware, not just structural: an App Server's `instances` count feeds
 * directly into whether this fires, so bumping instances in the config panel
 * can turn the warning on/off without touching the graph's shape at all.
 */
export const singleInstanceLoadBalancer: ValidationRule = {
  id: "single-instance-load-balancer",
  severity: "warning",
  match: (graph: ArchitectureGraph) => {
    const results = [];

    for (const lb of graph.nodes.filter((n) => n.componentId === "load-balancer")) {
      const targetIds = graph.edges
        .filter((e) => e.kind === "request-flow" && e.source === lb.id)
        .map((e) => e.target);
      if (targetIds.length === 0) continue;

      const capacity = targetIds.reduce((sum, targetId) => {
        const target = graph.nodes.find((n) => n.id === targetId);
        if (!target) return sum;
        if (target.componentId !== "app-server") return sum + 1;
        const config = target.config as { instances?: number } | undefined;
        return sum + (config?.instances ?? 1);
      }, 0);

      if (capacity < 2) {
        results.push({ offendingNodeIds: [lb.id, ...targetIds], offendingEdgeIds: [] });
      }
    }

    return results;
  },
  message: () => "Load Balancer distributes to a single backend instance.",
  explanation: () =>
    "A Load Balancer in front of only one instance total (or one App Server configured with a single " +
    "instance) provides no load distribution and no failover if that instance goes down — it's a " +
    "pass-through, not a load balancer. Add a second instance or a second backend.",
};
