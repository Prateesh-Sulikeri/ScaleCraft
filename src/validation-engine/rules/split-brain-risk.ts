import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/** Purely a node-count/topology check (no config involved) — more than one
 * Leader with nothing coordinating them is a split-brain risk regardless of
 * how either is configured. */
export const splitBrainRisk: ValidationRule = {
  id: "split-brain-risk",
  severity: "warning",
  match: (graph: ArchitectureGraph) => {
    const leaders = graph.nodes.filter((n) => n.componentId === "leader");
    const hasCoordinator = graph.nodes.some((n) => n.componentId === "coordinator");

    if (leaders.length > 1 && !hasCoordinator) {
      return [{ offendingNodeIds: leaders.map((n) => n.id), offendingEdgeIds: [] }];
    }
    return [];
  },
  message: () => "Multiple Leader nodes with no Coordinator managing them.",
  explanation: () =>
    "More than one Leader can each independently accept writes and diverge from each other — a " +
    "split-brain. A Coordinator running a consensus protocol (Raft/Paxos/ZAB) is what ensures only one " +
    "Leader is active at a time; without one here, nothing is preventing that.",
};
