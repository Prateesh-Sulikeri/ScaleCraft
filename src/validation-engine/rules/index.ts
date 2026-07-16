import type { ValidationRule } from "../types";
import { noDirectClientDatabase } from "./no-direct-client-database";
import { singleInstanceLoadBalancer } from "./single-instance-load-balancer";
import { permissiveFirewall } from "./permissive-firewall";
import { splitBrainRisk } from "./split-brain-risk";
import { queueWithoutDeadLetterQueue } from "./queue-without-dead-letter-queue";
import { orphanReadReplica } from "./orphan-read-replica";
import { orphanComponent } from "./orphan-component";
import { requestFlowCycle } from "./request-flow-cycle";
import { missingInputConnection } from "./missing-input-connection";
import { componentRelations } from "./component-relations";

/** The global rule registry. Chapters opt a subset in by id, same pattern as
 * the component registry — see .claude/docs/ARCHITECTURE.md.
 *
 * `componentRelations` replaced three earlier separate rules
 * (category-adjacency, backwards-request-flow, illegal-edge-kind) — each
 * was a coarse, hand-approximated cross-cutting check; components now
 * declare their own valid connections directly (see
 * content/components/types.ts's `ComponentRelations`), and componentRelations
 * checks those, falling back to the coarse category+kind matrix
 * (canvas/legal-edge-kinds.ts) only when a component hasn't declared one
 * (every custom component, by design). See
 * .claude/docs/validation_agent_design.md for the full rationale. */
export const ruleRegistry: ValidationRule[] = [
  noDirectClientDatabase,
  singleInstanceLoadBalancer,
  permissiveFirewall,
  splitBrainRisk,
  queueWithoutDeadLetterQueue,
  orphanReadReplica,
  orphanComponent,
  requestFlowCycle,
  missingInputConnection,
  componentRelations,
];

export function getRules(ids: string[]): ValidationRule[] {
  return ruleRegistry.filter((r) => ids.includes(r.id));
}
