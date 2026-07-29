import type { AiProvider } from "./types";
import { chatCompletionsComplete } from "./openai-compatible-fetch";

export const openaiProvider: AiProvider = {
  id: "openai",
  label: "OpenAI",
  defaultModel: "gpt-5",
  suggestedModels: ["gpt-5", "gpt-5-mini"],
  complete(req) {
    return chatCompletionsComplete({
      baseUrl: "https://api.openai.com/v1",
      apiKey: req.apiKey,
      model: req.model,
      system: req.system,
      user: req.user,
      signal: req.signal,
      schema: req.schema,
    });
  },
};
