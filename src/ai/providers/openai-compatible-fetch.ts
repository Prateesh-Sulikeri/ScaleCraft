import type { z } from "zod";
import { AiProviderError } from "./types";

/** `z.toJSONSchema()`'s output for `aiCritiqueSchema` already satisfies
 * OpenAI's "strict" structured-outputs constraints unmodified (every
 * property listed in `required`, `additionalProperties: false` at every
 * object level — confirmed by inspecting the actual output, not assumed)
 * except for the top-level `$schema` key, which providers don't expect
 * inside a `json_schema.schema` body and which is dropped here. */
function toResponseFormatSchema(schema: z.ZodType): Record<string, unknown> {
  const json = schema.toJSONSchema() as Record<string, unknown>;
  delete json.$schema;
  return json;
}

/** Handles both observed error-body shapes: OpenAI's `{error:{message}}`
 * and xAI's `{error:"..."}` (a bare string, not an object) — confirmed
 * against the real xAI API, which returns *400*, not 401, for a bad key
 * (`{"code":"invalid-argument","error":"Incorrect API key provided..."}"`). */
function extractErrorMessage(body: unknown): string | undefined {
  const error = (body as { error?: unknown } | null)?.error;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return undefined;
}

/** Shared request/response shape behind openai, xai, and openai-compatible —
 * all three speak the OpenAI chat-completions wire format. */
export async function chatCompletionsComplete(opts: {
  baseUrl: string;
  apiKey: string;
  model: string;
  system: string;
  user: string;
  signal?: AbortSignal;
  /** When present, sent as a real `json_schema` response_format (strict
   * mode) instead of generic `json_object` mode — this is what actually
   * closes the gap with Anthropic's API-level structured outputs (see
   * anthropic.ts) rather than relying on the prompt's prose description
   * alone. Confirmed against `aiCritiqueSchema`'s own toJSONSchema() output
   * that its shape already satisfies strict mode's constraints (every
   * property required, `additionalProperties: false` throughout). */
  schema?: z.ZodType;
}): Promise<string> {
  const baseUrl = opts.baseUrl.replace(/\/+$/, "");

  function buildBody(useSchema: boolean): string {
    return JSON.stringify({
      model: opts.model,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      response_format:
        useSchema && opts.schema
          ? {
              type: "json_schema",
              json_schema: {
                name: "deep_check_critique",
                strict: true,
                schema: toResponseFormatSchema(opts.schema),
              },
            }
          : { type: "json_object" },
    });
  }

  async function doFetch(body: string): Promise<Response> {
    try {
      return await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${opts.apiKey}`,
        },
        body,
        signal: opts.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new AiProviderError("network", "Could not reach the provider.", { cause: error });
    }
  }

  let response = await doFetch(buildBody(true));

  // Not every OpenAI-compatible endpoint supports strict json_schema mode
  // (self-hosted servers reached via the Base URL field especially) — a
  // rejection there isn't an auth or rate-limit problem, so fall back once
  // to plain json_object mode rather than surfacing a hard failure. The
  // prompt's own spelled-out shape (see prompt.ts) is the backstop for
  // whatever provider ends up on this path.
  if (!response.ok && opts.schema && ![401, 403, 429].includes(response.status)) {
    response = await doFetch(buildBody(false));
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
    // Some OpenAI-shaped providers (confirmed: xAI) report a bad key as a
    // plain 400, not 401/403 — a bad key is the most likely failure by far
    // (§10.1), so it must not fall through to a generic "unexpected error"
    // just because the status code alone doesn't say "auth".
    if (response.status === 400) {
      const body = await response.json().catch(() => null);
      const message = extractErrorMessage(body);
      if (message && /api[ -]?key/i.test(message)) {
        throw new AiProviderError("auth", message, { cause: response });
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
  const content = (body as { choices?: { message?: { content?: unknown } }[] })?.choices?.[0]
    ?.message?.content;
  if (typeof content !== "string") {
    throw new AiProviderError("unknown", "The provider returned a response with no content.");
  }
  return content;
}
