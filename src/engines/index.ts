/**
 * The single import surface for engines (validation, deep check, and
 * eventually simulation - .claude/docs/pending-simulation-engine.md). UI
 * code imports from here, never from @/validation-engine/* or
 * @/ai/{run-deep-check,providers} directly - see eslint.config.mjs's
 * no-restricted-imports rule, which enforces this.
 */
export type { Engine } from "./types";
export { engineRegistry, getEngine, type EngineId } from "./registry";
export * from "./validation";
export * from "./deep-check";
