import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";

/**
 * Category-agnostic on purpose — keys on "has any incident edge," never a
 * specific componentId, so a user-authored custom component (see
 * src/content/components/custom.ts) is covered automatically, unlike a rule
 * keyed to a literal component id. `entryPointIds` (see lib/graph.ts) is
 * consulted so a component whose only connection is a Start marker isn't
 * falsely flagged — a Start marker's pointer is canvas-only presentation,
 * never a real edge.
 */
export const orphanComponent: ValidationRule = {
  id: "orphan-component",
  severity: "warning",
  match: (graph: ArchitectureGraph) => {
    const connected = new Set<string>();
    for (const e of graph.edges) {
      connected.add(e.source);
      connected.add(e.target);
    }
    for (const id of graph.entryPointIds) connected.add(id);

    return graph.nodes
      .filter((n) => !connected.has(n.id))
      .map((n) => ({ offendingNodeIds: [n.id], offendingEdgeIds: [] }));
  },
  message: () => "Component is not connected to anything.",
  explanation: () =>
    "This component has no incoming or outgoing connections at all, so it plays no part in " +
    "the architecture as drawn — traffic can never reach it and it can never send anything " +
    "onward. Either connect it to the rest of the diagram or remove it.",
};
