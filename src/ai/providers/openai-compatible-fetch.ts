import { AiProviderError } from "./types";

/** Shared request/response shape behind openai, xai, and openai-compatible —
 * all three speak the OpenAI chat-completions wire format. */
export async function chatCompletionsComplete(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  signal?: AbortSignal;
}): Promise<string> {
  let response: Response;
  try {
    response = await fetch(`${opts.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${opts.apiKey}`,
      },
      body: JSON.stringify({
        model: opts.model,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
        response_format: { type: "json_object" },
      }),
      signal: opts.signal,
    });
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
    throw new AiProviderError(
      "unknown",
      `The provider returned an unexpected error (${response.status}).`,
      { cause: response },
    );
  }

  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  if (typeof content !== "string") {
    throw new AiProviderError("unknown", "The provider returned a response with no content.");
  }
  return content;
}
