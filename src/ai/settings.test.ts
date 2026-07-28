import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { db } from "@/persistence/db";
import { DEFAULT_AI_SETTINGS, getAiSettings, saveAiSettings, type AiSettings } from "./settings";

describe("ai settings", () => {
  it("returns the default settings (disabled) when nothing has been saved", async () => {
    const settings = await getAiSettings();
    expect(settings).toEqual(DEFAULT_AI_SETTINGS);
    expect(settings.enabled).toBe(false);
  });

  it("returns a fresh copy of the defaults each call, not a shared reference", async () => {
    const first = await getAiSettings();
    first.apiKey = "mutated-in-place";

    const second = await getAiSettings();

    expect(second.apiKey).toBe("");
    expect(DEFAULT_AI_SETTINGS.apiKey).toBe("");
  });

  it("round-trips saved settings", async () => {
    const settings: AiSettings = {
      id: "default",
      enabled: true,
      providerId: "xai",
      model: "grok-4",
      apiKey: "sk-test",
      depth: "deep",
      tone: "encouraging",
      level: "advanced",
    };

    await saveAiSettings(settings);
    const restored = await getAiSettings();

    expect(restored).toEqual(settings);
    // confirm it actually went through Dexie, not some in-memory shortcut
    expect(await db.aiSettings.get("default")).toEqual(settings);
  });
});
