export { deepCheckEngine } from "./engine";

// runDeepCheck kept alongside deepCheckEngine (which wraps it) for call
// sites that haven't moved to the generic Engine interface yet.
// testConnection is a settings-validation utility, not "running" the engine
// against a design - a plain named export, same reasoning as evaluateChapter
// in ../validation/index.ts.
export { runDeepCheck, testConnection, type DeepCheckResult, type TestConnectionResult } from "@/ai/run-deep-check";

// Re-export provider metadata (id/label/defaultModel/suggestedModels) only,
// without the SDK implementations. This lets UI code (settings, profiles,
// help panels) show available providers and their models without pulling in
// the actual AI SDK packages (which are only needed by runDeepCheck itself).
// Metadata is in a separate file that doesn't import the provider SDKs.
export { providersMetadata } from "@/ai/providers/metadata";
export type { AiProviderId } from "@/ai/providers";
