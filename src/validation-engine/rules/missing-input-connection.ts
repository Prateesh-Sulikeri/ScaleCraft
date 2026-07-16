import type { ArchitectureGraph } from "@/lib/graph";
import type { ValidationRule } from "../types";
import { getComponent } from "@/content/components/registry";

/**
 * Catches a component that declares it needs an incoming connection
 * (`ComponentDefinition.inputs.length > 0` — e.g. API Gateway's "in" port)
 * but has zero incoming edges, even though it has at least one outgoing
 * edge. A pure origin (Client, Browser, Cron Job) declares `inputs: []` and
 * is never flagged by this rule — the check is "did you wire in what this
 * component itself says it needs," not "does every node have an edge."
 *
 * Deliberately excludes the fully-isolated case (zero edges in AND out) —
 * that's orphan-component.ts's job. This rule is specifically for the more
 * misleading case: a component that looks wired up (it has an outgoing
 * edge) but can never actually receive anything, which reads as "working"
 * at a glance in a way a fully disconnected node doesn't.
 */
export const missingInputConnection: ValidationRule = {
  id: "missing-input-connection",
  severity: "error",
  match: (graph: ArchitectureGraph) => {
    const entrySet = new Set(graph.entryPointIds);
    const results = [];

    for (const n of graph.nodes) {
      const def = getComponent(n.componentId);
      if (!def || def.inputs.length === 0) continue;

      const hasIncoming = entrySet.has(n.id) || graph.edges.some((e) => e.target === n.id);
      if (hasIncoming) continue;

      const hasOutgoing = graph.edges.some((e) => e.source === n.id);
      if (!hasOutgoing) continue; // fully isolated — orphan-component.ts's job, not this rule's

      results.push({ offendingNodeIds: [n.id], offendingEdgeIds: [] });
    }

    return results;
  },
  message: () => "Component has no incoming connection, despite requiring one.",
  explanation: () =>
    "This component declares that it needs an incoming connection, but nothing feeds into it — " +
    "only outgoing connections exist. It looks wired into the diagram, but no request can ever " +
    "actually reach it. Connect something upstream of it, or remove it if it isn't meant to be " +
    "part of this path.",
};
