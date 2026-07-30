import "fake-indexeddb/auto";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { db } from "@/persistence/db";
import {
  createProfile,
  updateProfile,
  deleteProfile,
  listProfiles,
  getActiveProfile,
  getActiveProfileId,
  setActiveProfileId,
  isProfileUsable,
  type AiProfileDraft,
} from "./profiles";
import { DEFAULT_AI_SETTINGS } from "./settings";

function draft(overrides: Partial<AiProfileDraft> = {}): AiProfileDraft {
  return { ...DEFAULT_AI_SETTINGS, name: "My Profile", apiKey: "sk-test", ...overrides };
}

beforeEach(async () => {
  await db.aiProfiles.clear();
  await db.aiActiveProfile.clear();
});

describe("ai/profiles", () => {
  it("has no profiles and no active profile initially", async () => {
    expect(await listProfiles()).toEqual([]);
    expect(await getActiveProfileId()).toBeNull();
    expect(await getActiveProfile()).toBeNull();
  });

  it("creates a profile and auto-activates it as the first one", async () => {
    const profile = await createProfile(draft());

    expect(profile.id).toBeTruthy();
    expect(profile.name).toBe("My Profile");
    expect(await getActiveProfileId()).toBe(profile.id);
    expect(await getActiveProfile()).toEqual(profile);
  });

  it("does not re-activate on a second create once a profile is already active", async () => {
    const first = await createProfile(draft({ name: "First" }));
    const second = await createProfile(draft({ name: "Second" }));

    expect(second.id).not.toBe(first.id);
    expect(await getActiveProfileId()).toBe(first.id);
  });

  it("lists profiles oldest-created first", async () => {
    // Date.now spy only, not vi.useFakeTimers() — the latter also replaces
    // the timer/microtask machinery Dexie's own async internals rely on,
    // which hangs every IndexedDB operation (and, worse, every later test's
    // beforeEach in this file once a test times out mid-fake-timers).
    const nowSpy = vi.spyOn(Date, "now");
    nowSpy.mockReturnValueOnce(1000);
    const first = await createProfile(draft({ name: "First" }));
    nowSpy.mockReturnValueOnce(2000);
    const second = await createProfile(draft({ name: "Second" }));
    nowSpy.mockRestore();

    expect(await listProfiles()).toEqual([first, second]);
  });

  it("updates a profile in place, preserving id and createdAt", async () => {
    const created = await createProfile(draft({ name: "Original" }));

    const updated = await updateProfile(created.id, draft({ name: "Renamed", model: "grok-4" }));

    expect(updated.id).toBe(created.id);
    expect(updated.createdAt).toBe(created.createdAt);
    expect(updated.name).toBe("Renamed");
    expect(updated.model).toBe("grok-4");
    expect(updated.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);
    expect(await db.aiProfiles.get(created.id)).toEqual(updated);
  });

  it("deletes a profile without touching the active-profile pointer", async () => {
    const profile = await createProfile(draft());
    expect(await getActiveProfileId()).toBe(profile.id);

    await deleteProfile(profile.id);

    expect(await db.aiProfiles.get(profile.id)).toBeUndefined();
    // Still points at the now-deleted id — reassignment is the caller's job.
    expect(await getActiveProfileId()).toBe(profile.id);
  });

  it("setActiveProfileId can be pointed at null (no active profile)", async () => {
    const profile = await createProfile(draft());
    await setActiveProfileId(null);

    expect(await getActiveProfileId()).toBeNull();
    expect(await getActiveProfile()).toBeNull();
    expect(await db.aiProfiles.get(profile.id)).toBeDefined();
  });

  it("isProfileUsable requires a non-empty API key", () => {
    expect(isProfileUsable(null)).toBe(false);
    expect(isProfileUsable({ ...draft(), id: "x", apiKey: "", createdAt: 0, updatedAt: 0 })).toBe(false);
    expect(isProfileUsable({ ...draft(), id: "x", apiKey: "  ", createdAt: 0, updatedAt: 0 })).toBe(false);
    expect(isProfileUsable({ ...draft(), id: "x", apiKey: "sk-real", createdAt: 0, updatedAt: 0 })).toBe(true);
  });
});
