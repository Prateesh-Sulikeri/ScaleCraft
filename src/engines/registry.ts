import { validationEngine } from "./validation/engine";
import { deepCheckEngine } from "./deep-check/engine";

/** Eager for now - made lazy (dynamic import per entry) once code-splitting
 * lands, see feature/engine-lazy-load. */
export const engineRegistry = {
  validation: validationEngine,
  "deep-check": deepCheckEngine,
} as const;

export type EngineId = keyof typeof engineRegistry;

export function getEngine<K extends EngineId>(id: K): (typeof engineRegistry)[K] {
  return engineRegistry[id];
}
