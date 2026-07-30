import type { AiProvider, AiProviderId } from "./types";
import { anthropicProvider } from "./anthropic";
import { openaiProvider } from "./openai";
import { googleProvider } from "./google";
import { xaiProvider } from "./xai";
import { openaiCompatibleProvider } from "./openai-compatible";

export const providers: Record<AiProviderId, AiProvider> = {
  anthropic: anthropicProvider,
  openai: openaiProvider,
  google: googleProvider,
  xai: xaiProvider,
  "openai-compatible": openaiCompatibleProvider,
};

export function getProvider(id: AiProviderId): AiProvider {
  return providers[id];
}

export * from "./types";
