import type { ValidationRule } from "../types";
import { noDirectClientDatabase } from "./no-direct-client-database";
import { singleInstanceLoadBalancer } from "./single-instance-load-balancer";
import { permissiveFirewall } from "./permissive-firewall";
import { splitBrainRisk } from "./split-brain-risk";
import { queueWithoutDeadLetterQueue } from "./queue-without-dead-letter-queue";
import { orphanReadReplica } from "./orphan-read-replica";

/** The global rule registry. Chapters opt a subset in by id, same pattern as
 * the component registry — see .claude/docs/ARCHITECTURE.md. */
export const ruleRegistry: ValidationRule[] = [
  noDirectClientDatabase,
  singleInstanceLoadBalancer,
  permissiveFirewall,
  splitBrainRisk,
  queueWithoutDeadLetterQueue,
  orphanReadReplica,
];

export function getRules(ids: string[]): ValidationRule[] {
  return ruleRegistry.filter((r) => ids.includes(r.id));
}
