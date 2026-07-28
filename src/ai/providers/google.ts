import type { AiProvider } from "./types";
import { AiProviderError } from "./types";

export const googleProvider: AiProvider = {
  id: "google",
  label: "Google",
  defaultModel: "gemini-3-pro",
  suggestedModels: ["gemini-3-pro", "gemini-3-flash"],
  async complete(req) {
    let response: Response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${req.model}:generateContent?key=${req.apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: req.system }] },
            contents: [{ role: "user", parts: [{ text: req.user }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
          signal: req.signal,
        },
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new AiProviderError("network", "Could not reach the provider.", { cause: error });
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new AiProviderError("auth", "The API key was rejected.", { cause: response });
      }
      if (response.status === 429) {
        throw new AiProviderError(
          "rate-limit",
          "The provider rate-limited this request.",
          { cause: response },
        );
      }
      if (response.status === 400) {
        const body = await response.json().catch(() => null);
        const status = body?.error?.status;
        if (status === "UNAUTHENTICATED" || status === "PERMISSION_DENIED") {
          throw new AiProviderError("auth", "The API key was rejected.", { cause: response });
        }
      }
      throw new AiProviderError(
        "unknown",
        `The provider returned an unexpected error (${response.status}).`,
        { cause: response },
      );
    }

    let body: unknown;
    try {
      body = await response.json();
    } catch (error) {
      throw new AiProviderError(
        "unknown",
        "The provider returned a response that could not be parsed.",
        { cause: error },
      );
    }
    const text = (
      body as { candidates?: { content?: { parts?: { text?: unknown }[] } }[] }
    )?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string") {
      throw new AiProviderError("unknown", "The provider returned a response with no content.");
    }
    return text;
  },
};
