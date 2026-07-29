import { providers, type AiProviderId } from "./providers";

/** Per §10.2 — three knobs plus provider/model, deliberately not "many
 * settings." The resolved config for one Deep Check run — used as-is by
 * every provider/prompt/orchestration module, and as the field set an
 * `AiProfile` (see @/ai/profiles.ts, @/persistence/db.ts) wraps with an id,
 * a name, and timestamps. Carries no notion of "which profile" or "is this
 * usable" itself — that's @/ai/profiles.ts's job now. */
export type AiSettings = {
  providerId: AiProviderId;
  model: string;
  /** openai-compatible only. */
  baseUrl?: string;
  apiKey: string;
  depth: "brief" | "standard" | "deep";
  tone: "direct" | "socratic" | "encouraging";
  level: "beginner" | "intermediate" | "advanced";
};

/** Neutral starting point for a brand-new profile, and a safe fallback when
 * no profile is configured yet. */
export const DEFAULT_AI_SETTINGS: AiSettings = {
  providerId: "anthropic",
  model: providers.anthropic.defaultModel,
  apiKey: "",
  depth: "standard",
  tone: "direct",
  level: "intermediate",
};
