import type { AiProviderId } from "./types";

export const providersMetadata: Record<AiProviderId, { id: AiProviderId; label: string; defaultModel: string; suggestedModels: string[] }> = {
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    defaultModel: "claude-opus-5",
    suggestedModels: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    defaultModel: "gpt-5",
    suggestedModels: ["gpt-5", "gpt-5-mini"],
  },
  google: {
    id: "google",
    label: "Google",
    defaultModel: "gemini-3-pro",
    suggestedModels: ["gemini-3-pro", "gemini-2-pro", "gemini-2-flash"],
  },
  xai: {
    id: "xai",
    label: "xAI",
    defaultModel: "grok-4",
    suggestedModels: ["grok-4", "grok-4-fast"],
  },
  "openai-compatible": {
    id: "openai-compatible",
    label: "OpenAI-compatible",
    defaultModel: "",
    suggestedModels: [],
  },
};
