import type { ArchitectureGraph } from "@/lib/graph";
import type { Engine } from "../types";
import { runValidation } from "@/validation-engine/engine";
import type { ValidationRule, ValidationViolation } from "@/validation-engine/types";

export type ValidationEngineInput = {
  graph: ArchitectureGraph;
  rules: ValidationRule[];
};

/** Wraps the existing sync `runValidation` in a resolved Promise to conform
 * to `Engine` - validation itself stays synchronous under the hood. */
export const validationEngine: Engine<ValidationEngineInput, void, ValidationViolation[]> = {
  id: "validation",
  label: "Validation",
  async run({ graph, rules }) {
    return runValidation(graph, rules);
  },
};
