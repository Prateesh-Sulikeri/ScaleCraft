import { db } from "@/persistence/db";
import { providers, type AiProviderId } from "./providers";

/** Per §10.2 — three knobs plus provider/model, deliberately not "many
 * settings." `enabled` stays false until a key is actually saved, so Deep
 * Check is absent by default rather than present-but-broken. */
export type AiSettings = {
  id: "default";
  enabled: boolean;
  providerId: AiProviderId;
  model: string;
  /** openai-compatible only. */
  baseUrl?: string;
  apiKey: string;
  depth: "brief" | "standard" | "deep";
  tone: "direct" | "socratic" | "encouraging";
  level: "beginner" | "intermediate" | "advanced";
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  id: "default",
  enabled: false,
  providerId: "anthropic",
  model: providers.anthropic.defaultModel,
  apiKey: "",
  depth: "standard",
  tone: "direct",
  level: "intermediate",
};

export async function getAiSettings(): Promise<AiSettings> {
  const existing = await db.aiSettings.get("default");
  return existing ?? DEFAULT_AI_SETTINGS;
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await db.aiSettings.put(settings);
}
