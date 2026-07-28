import type { AiProvider } from "./types";
import { chatCompletionsComplete } from "./openai-compatible-fetch";

export const xaiProvider: AiProvider = {
  id: "xai",
  label: "xAI",
  defaultModel: "grok-4",
  suggestedModels: ["grok-4", "grok-4-fast"],
  complete(req) {
    return chatCompletionsComplete({
      baseUrl: "https://api.x.ai/v1",
      apiKey: req.apiKey,
      model: req.model,
      system: req.system,
      user: req.user,
      signal: req.signal,
    });
  },
};
