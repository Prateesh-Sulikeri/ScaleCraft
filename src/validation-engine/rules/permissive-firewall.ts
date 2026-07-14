import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/** Reads the Firewall's own `defaultPolicy` config directly — no topology
 * involved at all, purely a config-value check. */
export const permissiveFirewall: ValidationRule = {
  id: "permissive-firewall",
  severity: "warning",
  match: (graph: ArchitectureGraph) => {
    return graph.nodes
      .filter((n) => n.componentId === "firewall")
      .filter((n) => (n.config as { defaultPolicy?: string } | undefined)?.defaultPolicy === "allow-all")
      .map((n) => ({ offendingNodeIds: [n.id], offendingEdgeIds: [] }));
  },
  message: () => "Firewall is configured to allow all traffic.",
  explanation: () =>
    'A Firewall with defaultPolicy set to "allow-all" doesn\'t filter anything — it\'s present in the ' +
    "diagram but not actually restricting traffic. Set a default-deny policy (deny-all or allow-listed) " +
    "and open only what needs to be reachable.",
};
