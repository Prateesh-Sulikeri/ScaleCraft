import { describe, it, expect } from "vitest";
import { providers, getProvider } from "./index";

describe("ai/providers/index", () => {
  it("registers all five provider ids", () => {
    expect(Object.keys(providers).sort()).toEqual(
      ["anthropic", "google", "openai", "openai-compatible", "xai"].sort(),
    );
  });

  it("getProvider returns the matching provider by id", () => {
    expect(getProvider("anthropic")).toBe(providers.anthropic);
    expect(getProvider("google")).toBe(providers.google);
    expect(getProvider("openai")).toBe(providers.openai);
    expect(getProvider("xai")).toBe(providers.xai);
    expect(getProvider("openai-compatible")).toBe(providers["openai-compatible"]);
  });

  it("each provider has an id matching its registry key", () => {
    for (const [key, provider] of Object.entries(providers)) {
      expect(provider.id).toBe(key);
    }
  });
});
