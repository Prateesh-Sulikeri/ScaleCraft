export { deepCheckEngine } from "./engine";

// runDeepCheck kept alongside deepCheckEngine (which wraps it) for call
// sites that haven't moved to the generic Engine interface yet.
// testConnection is a settings-validation utility, not "running" the engine
// against a design - a plain named export, same reasoning as evaluateChapter
// in ../validation/index.ts.
export { runDeepCheck, testConnection, type DeepCheckResult, type TestConnectionResult } from "@/ai/run-deep-check";

export { providers, getProvider } from "@/ai/providers";
export type { AiProvider, AiProviderId, AiCompleteRequest, AiProviderErrorKind } from "@/ai/providers";
export { AiProviderError } from "@/ai/providers";
