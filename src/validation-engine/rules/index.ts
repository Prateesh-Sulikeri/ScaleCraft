import type { ValidationRule } from "../types";
import { noDirectClientDatabase } from "./no-direct-client-database";

/** The global rule registry. Chapters opt a subset in by id, same pattern as
 * the component registry — see .claude/docs/ARCHITECTURE.md. */
export const ruleRegistry: ValidationRule[] = [noDirectClientDatabase];

export function getRules(ids: string[]): ValidationRule[] {
  return ruleRegistry.filter((r) => ids.includes(r.id));
}
