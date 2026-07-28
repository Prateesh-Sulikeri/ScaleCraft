import type { AiProvider } from "./types";
import { AiProviderError } from "./types";
import { chatCompletionsComplete } from "./openai-compatible-fetch";

export const openaiCompatibleProvider: AiProvider = {
  id: "openai-compatible",
  label: "OpenAI-compatible",
  defaultModel: "",
  suggestedModels: [],
  async complete(req) {
    if (!req.baseUrl) {
      throw new AiProviderError(
        "unknown",
        "A base URL is required for the OpenAI-compatible provider.",
      );
    }
    return chatCompletionsComplete({
      baseUrl: req.baseUrl,
      apiKey: req.apiKey,
      model: req.model,
      system: req.system,
      user: req.user,
      signal: req.signal,
    });
  },
};
