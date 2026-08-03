import type { Engine } from "./types";
import type { ValidationEngineInput } from "./validation/engine";
import type { DeepCheckContext } from "@/ai/prompt";
import type { AiSettings } from "@/ai/settings";
import type { DeepCheckResult } from "@/ai/run-deep-check";
import type { ValidationViolation } from "@/validation-engine/types";

type EngineMap = {
  validation: Engine<ValidationEngineInput, void, ValidationViolation[]>;
  "deep-check": Engine<DeepCheckContext, AiSettings, DeepCheckResult>;
};

/** Each entry is a dynamic import so an engine's dependency tree (rules,
 * provider adapters, schema validation) only enters the bundle once
 * something actually calls getEngine() for it. */
const engineLoaders: { [K in keyof EngineMap]: () => Promise<EngineMap[K]> } = {
  validation: () => import("./validation/engine").then((m) => m.validationEngine),
  "deep-check": () => import("./deep-check/engine").then((m) => m.deepCheckEngine),
};

export type EngineId = keyof EngineMap;

export function getEngine<K extends EngineId>(id: K): Promise<EngineMap[K]> {
  return engineLoaders[id]();
}
