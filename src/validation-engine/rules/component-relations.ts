import type { ArchitectureGraph } from "@/lib/graph";
import type { MatchResult, ValidationRule } from "../types";
import { componentLookup } from "../component-lookup";
import { legalKindsFor } from "@/canvas/legal-edge-kinds";

/**
 * Checks every edge against its endpoints' own declared relational
 * contracts (`ComponentDefinition.relations`, see content/components/types.ts)
 * — replaces what used to be three separate, coarser cross-cutting rules
 * (category-adjacency.ts, backwards-request-flow.ts, illegal-edge-kind.ts),
 * each independently approximating a property that really belongs to one
 * specific component. See .claude/docs/validation_agent_design.md for the
 * full rationale behind this collapse.
 *
 * Precedence, per edge:
 *   1. If either endpoint declares a relevant `relations` contract for this
 *      direction, that contract alone decides the edge — pass or fail.
 *   2. If NEITHER endpoint declares one (every custom component, and any
 *      base-pack component someone forgot to contract — see registry.ts's
 *      "adding a component" comment), fall back to the coarse category+kind
 *      matrix in canvas/legal-edge-kinds.ts. This is what keeps custom
 *      components meaningfully validated without ever needing their own
 *      authored contract (there is deliberately no UI for that — see
 *      .claude/docs/OPEN_QUESTIONS.md).
 *
 * Does NOT check "does this component have a connection at all" — that's
 * missing-input-connection.ts's job, unconditional on whether a contract
 * exists, so it stays a separate rule rather than folding in here.
 */
export const componentRelations: ValidationRule = {
  id: "component-relations",
  severity: "error",
  match: (graph: ArchitectureGraph) => {
    const defsById = componentLookup(graph);
    const results: MatchResult[] = [];

    for (const e of graph.edges) {
      const sourceDef = defsById.get(e.source);
      const targetDef = defsById.get(e.target);
      if (!sourceDef || !targetDef) continue; // unknown componentId — nothing to check against

      const outputContract = sourceDef.relations?.outputs;
      const inputContract = targetDef.relations?.inputs;

      if (outputContract || inputContract) {
        // At least one endpoint has an opinion — that opinion wins,
        // regardless of what the coarse matrix would've said.
        const outputCategoryOk =
          !outputContract?.allowedCategories || outputContract.allowedCategories.includes(targetDef.category);
        const outputKindOk = !outputContract?.allowedKinds || outputContract.allowedKinds.includes(e.kind);
        const inputCategoryOk =
          !inputContract?.allowedCategories || inputContract.allowedCategories.includes(sourceDef.category);
        const inputKindOk = !inputContract?.allowedKinds || inputContract.allowedKinds.includes(e.kind);

        if (outputCategoryOk && outputKindOk && inputCategoryOk && inputKindOk) continue;

        const detail = !outputCategoryOk
          ? `${sourceDef.label}'s own declared output rules don't allow connecting to a ${targetDef.label} (category "${targetDef.category}").`
          : !outputKindOk
            ? `${sourceDef.label}'s own declared output rules don't allow a "${e.kind}"-kind connection.`
            : !inputCategoryOk
              ? `${targetDef.label}'s own declared input rules don't allow a connection from a ${sourceDef.label} (category "${sourceDef.category}").`
              : `${targetDef.label}'s own declared input rules don't allow a "${e.kind}"-kind connection.`;

        results.push({ offendingNodeIds: [e.source, e.target], offendingEdgeIds: [e.id], detail });
        continue;
      }

      // Neither endpoint declared a contract for this direction — coarse
      // category-pair fallback (see legal-edge-kinds.ts's default-deny
      // policy).
      if (!legalKindsFor(sourceDef.category, targetDef.category).includes(e.kind)) {
        results.push({
          offendingNodeIds: [e.source, e.target],
          offendingEdgeIds: [e.id],
          detail: `Neither ${sourceDef.label} nor ${targetDef.label} declares a specific contract, and a "${e.kind}"-kind connection from ${sourceDef.category} to ${targetDef.category} isn't in the general compatibility table.`,
        });
      }
    }

    return results;
  },
  message: () => "This connection isn't valid between these two components.",
  explanation: (match) =>
    (match.detail ?? "This connection's kind and endpoints aren't a compatible pairing.") +
    " Check the Edge Inspector — either the edge's kind needs to change, or this isn't a legitimate " +
    "connection between these two component types at all.",
};
