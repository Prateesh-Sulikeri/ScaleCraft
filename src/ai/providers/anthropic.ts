import Anthropic, {
  APIConnectionError,
  APIConnectionTimeoutError,
  APIUserAbortError,
  AuthenticationError,
  RateLimitError,
} from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type { AiProvider } from "./types";
import { AiProviderError } from "./types";

export const anthropicProvider: AiProvider = {
  id: "anthropic",
  label: "Anthropic",
  defaultModel: "claude-opus-5",
  suggestedModels: ["claude-opus-5", "claude-sonnet-5", "claude-haiku-4-5"],
  async complete(req) {
    const client = new Anthropic({ apiKey: req.apiKey, dangerouslyAllowBrowser: true });
    try {
      if (req.schema) {
        const message = await client.messages.parse(
          {
            model: req.model,
            max_tokens: 16000,
            system: req.system,
            messages: [{ role: "user", content: req.user }],
            output_config: { format: zodOutputFormat(req.schema) },
          },
          { signal: req.signal },
        );
        return JSON.stringify(message.parsed_output);
      }
      const message = await client.messages.create(
        {
          model: req.model,
          max_tokens: 16000,
          system: req.system,
          messages: [{ role: "user", content: req.user }],
        },
        { signal: req.signal },
      );
      return message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("");
    } catch (error) {
      if (error instanceof APIUserAbortError) throw error;
      if (error instanceof AuthenticationError) {
        throw new AiProviderError("auth", "The API key was rejected.", { cause: error });
      }
      if (error instanceof RateLimitError) {
        throw new AiProviderError(
          "rate-limit",
          "The provider rate-limited this request.",
          { cause: error },
        );
      }
      if (error instanceof APIConnectionError || error instanceof APIConnectionTimeoutError) {
        throw new AiProviderError("network", "Could not reach the provider.", { cause: error });
      }
      throw new AiProviderError(
        "unknown",
        "The provider returned an unexpected error.",
        { cause: error },
      );
    }
  },
};
