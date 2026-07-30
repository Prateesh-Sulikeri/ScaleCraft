import type { z } from "zod";

export type AiProviderId =
  | "anthropic"
  | "openai"
  | "google"
  | "xai"
  | "openai-compatible";

export type AiProviderErrorKind = "auth" | "rate-limit" | "network" | "unknown";

export class AiProviderError extends Error {
  readonly kind: AiProviderErrorKind;

  constructor(kind: AiProviderErrorKind, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "AiProviderError";
    this.kind = kind;
  }
}

export type AiCompleteRequest = {
  apiKey: string;
  model: string;
  system: string;
  user: string;
  baseUrl?: string;
  signal?: AbortSignal;
  /** Anthropic uses this via `messages.parse()` + `zodOutputFormat` and
   * stringifies the parsed result back into the uniform string return.
   * Other adapters ignore it and rely on their own JSON mode — the shared
   * Zod-validate pass in Phase 3 runs on every provider's output regardless
   * (see pending.md Phase 1's judgment call). */
  schema?: z.ZodType;
};

export type AiProvider = {
  id: AiProviderId;
  label: string;
  defaultModel: string;
  /** Suggestions only — the settings UI still allows free-text model entry. */
  suggestedModels: string[];
  complete(req: AiCompleteRequest): Promise<string>;
};
