import type { Engine } from "../types";
import { runDeepCheck, type DeepCheckResult } from "@/ai/run-deep-check";
import type { DeepCheckContext } from "@/ai/prompt";
import type { AiSettings } from "@/ai/settings";

export const deepCheckEngine: Engine<DeepCheckContext, AiSettings, DeepCheckResult> = {
  id: "deep-check",
  label: "Deep Check",
  async run(ctx, settings, signal) {
    return runDeepCheck(ctx, settings, signal);
  },
};
