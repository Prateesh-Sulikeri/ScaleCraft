import { getProvider, AiProviderError, type AiProviderErrorKind } from "./providers";
import type { AiSettings } from "./settings";
import { buildSystemPrompt, DEEP_CHECK_USER_TRIGGER, type DeepCheckContext } from "./prompt";
import { parseAiResponse, aiCritiqueSchema, type AiCritique } from "./schema";

export type DeepCheckResult =
  | { status: "ok"; critique: AiCritique }
  | { status: "error"; kind: AiProviderErrorKind; message: string };

/**
 * Ties Phases 1–3 together: resolves the adapter, builds the prompt (the
 * untrusted payload lives entirely in the system string — see prompt.ts —
 * so `user` is always the static DEEP_CHECK_USER_TRIGGER), calls
 * `provider.complete()`, then runs the response through `parseAiResponse`.
 * One tagged result either way, so Phase 5's UI only ever branches on one
 * shape instead of a provider error vs. a parse error being differently
 * typed.
 *
 * An aborted call is deliberately *not* mapped to `{ status: "error" }` —
 * every adapter re-throws its abort error unwrapped (not as
 * AiProviderError), and this function lets that propagate rather than
 * forcing a result through, so a cancel button can tell "the user cancelled"
 * apart from "the provider failed" without inspecting `kind`.
 */
export async function runDeepCheck(
  ctx: DeepCheckContext,
  settings: AiSettings,
  signal?: AbortSignal,
): Promise<DeepCheckResult> {
  const provider = getProvider(settings.providerId);
  const system = buildSystemPrompt(settings, ctx);

  let raw: string;
  try {
    raw = await provider.complete({
      apiKey: settings.apiKey,
      model: settings.model,
      system,
      user: DEEP_CHECK_USER_TRIGGER,
      baseUrl: settings.baseUrl,
      signal,
      schema: aiCritiqueSchema,
    });
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { status: "error", kind: error.kind, message: error.message };
    }
    throw error;
  }

  const realNodeIds = ctx.graph.nodes.map((node) => node.id);
  const parsed = parseAiResponse(raw, realNodeIds);
  if (parsed.status === "error") {
    return { status: "error", kind: "unknown", message: parsed.message };
  }
  return { status: "ok", critique: parsed.critique };
}

export type TestConnectionResult =
  | { status: "ok" }
  | { status: "error"; kind: AiProviderErrorKind; message: string };

/** One trivial round-trip, reusing the same adapter and error mapping
 * runDeepCheck uses — for Phase 5's Settings modal "Test Connection"
 * button. No schema, no real payload: just confirms the key/model/baseUrl
 * combination actually reaches the provider. */
export async function testConnection(settings: AiSettings): Promise<TestConnectionResult> {
  const provider = getProvider(settings.providerId);
  try {
    await provider.complete({
      apiKey: settings.apiKey,
      model: settings.model,
      system: "Respond with only the word OK.",
      user: "OK?",
      baseUrl: settings.baseUrl,
    });
    return { status: "ok" };
  } catch (error) {
    if (error instanceof AiProviderError) {
      return { status: "error", kind: error.kind, message: error.message };
    }
    throw error;
  }
}
