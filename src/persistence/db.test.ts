import "fake-indexeddb/auto";
import Dexie from "dexie";
import { describe, expect, it } from "vitest";
import { db, ScaleCraftDB, SANDBOX_SAVE_ID, type CanvasSave, type ChapterProgress, type DeepCheckSession } from "./db";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";
import type { CustomComponentRecord } from "@/content/components/custom";

describe("persistence db", () => {
  it("round-trips a canvas save through IndexedDB", async () => {
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    const edges: ArchitectureEdgeType[] = [{ id: "e1", source: "n1", target: "n1" }];
    const save: CanvasSave = { id: SANDBOX_SAVE_ID, updatedAt: Date.now(), nodes, edges };

    await db.saves.put(save);
    const restored = await db.saves.get(SANDBOX_SAVE_ID);

    expect(restored).toEqual(save);
  });

  it("round-trips a custom component record through IndexedDB (schema v2)", async () => {
    const record: CustomComponentRecord = {
      id: "custom-1",
      category: "networking",
      label: "Rate Limiter",
      icon: "gauge",
      summary: "Throttles requests per client",
      docs: "Limits request rate per client to protect downstream services.",
      hasInput: true,
      hasOutput: true,
      fields: [
        { kind: "number", name: "requestsPerSecond", label: "Requests Per Second", default: 100, min: 1 },
        {
          kind: "enum",
          name: "strategy",
          label: "Strategy",
          default: "token-bucket",
          options: ["token-bucket", "sliding-window"],
        },
      ],
    };

    await db.customComponents.put(record);
    const restored = await db.customComponents.get("custom-1");

    expect(restored).toEqual(record);
  });

  it("round-trips a chapter progress record through IndexedDB (schema v3)", async () => {
    const progress: ChapterProgress = {
      chapterId: "ch-1",
      completedAt: Date.now(),
      matchedBlueprintId: "cache-aside",
    };

    await db.chapterProgress.put(progress);
    let restored = await db.chapterProgress.get("ch-1");
    expect(restored).toEqual(progress);

    const updated: ChapterProgress = { ...progress, completedAt: progress.completedAt + 1000 };
    await db.chapterProgress.put(updated);
    restored = await db.chapterProgress.get("ch-1");
    expect(restored).toEqual(updated);
  });

  it("round-trips a deepCheckSession through IndexedDB with an auto-assigned id (schema v5)", async () => {
    const session: DeepCheckSession = {
      saveId: SANDBOX_SAVE_ID,
      createdAt: Date.now(),
      critique: { summary: "s", sections: [], tradeoffs: [] },
    };

    const id = await db.deepCheckSessions.add(session);
    const restored = await db.deepCheckSessions.get(id);
    expect(restored).toEqual({ ...session, id });
  });

  it("round-trips an aiProfiles record and the aiActiveProfile pointer through IndexedDB (schema v6)", async () => {
    const profile = {
      id: "profile-1",
      name: "Work",
      providerId: "xai" as const,
      model: "grok-4",
      apiKey: "sk-test",
      depth: "deep" as const,
      tone: "encouraging" as const,
      level: "advanced" as const,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.aiProfiles.put(profile);
    expect(await db.aiProfiles.get("profile-1")).toEqual(profile);

    await db.aiActiveProfile.put({ id: "default", profileId: profile.id });
    expect(await db.aiActiveProfile.get("default")).toEqual({ id: "default", profileId: profile.id });
  });
});

/**
 * The v6 bump is the first one that migrates real data out of a store being
 * dropped (`aiSettings`), not just adds an empty one — worth a dedicated,
 * real version-to-version upgrade test rather than trusting the migrate-
 * then-drop logic by inspection alone. Each test opens its own uniquely
 * named database (via ScaleCraftDB's optional name param) so it can't
 * collide with `db`, the shared "scalecraft"-named singleton other tests in
 * this file already opened at v6.
 */
describe("scalecraft db v6 migration (aiSettings -> aiProfiles)", () => {
  // Mirrors db.ts's own v1-v5 chain exactly, to simulate a real pre-v6
  // install. Any drift here would make the "real migration" claim false, so
  // this must be kept in sync with db.ts's version history by hand.
  function legacyV5Schema(name: string): Dexie {
    const legacy = new Dexie(name);
    legacy.version(1).stores({ saves: "id" });
    legacy.version(2).stores({ saves: "id", customComponents: "id" });
    legacy.version(3).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId" });
    legacy.version(4).stores({ saves: "id", customComponents: "id", chapterProgress: "chapterId", aiSettings: "id" });
    legacy.version(5).stores({
      saves: "id",
      customComponents: "id",
      chapterProgress: "chapterId",
      aiSettings: "id",
      deepCheckSessions: "++id, saveId, [saveId+createdAt]",
    });
    return legacy;
  }

  async function withFreshDbName<T>(fn: (name: string) => Promise<T>): Promise<T> {
    const name = `scalecraft-migration-test-${crypto.randomUUID()}`;
    try {
      return await fn(name);
    } finally {
      await Dexie.delete(name);
    }
  }

  it("migrates a real configured aiSettings row into the first profile, and activates it", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV5Schema(name);
      await legacy.open();
      await legacy.table("aiSettings").put({
        id: "default",
        enabled: true,
        providerId: "xai",
        model: "grok-4",
        apiKey: "sk-legacy",
        depth: "deep",
        tone: "encouraging",
        level: "advanced",
      });
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      const profiles = await upgraded.aiProfiles.toArray();
      expect(profiles).toHaveLength(1);
      expect(profiles[0]).toMatchObject({
        name: "Default",
        providerId: "xai",
        model: "grok-4",
        apiKey: "sk-legacy",
        depth: "deep",
        tone: "encouraging",
        level: "advanced",
      });
      expect(profiles[0].id).toBeTruthy();
      expect(profiles[0].createdAt).toBeTypeOf("number");

      const active = await upgraded.aiActiveProfile.get("default");
      expect(active?.profileId).toBe(profiles[0].id);

      // The dropped store is really gone, not just unused.
      expect((upgraded as unknown as Record<string, unknown>).aiSettings).toBeUndefined();

      upgraded.close();
    });
  });

  it("migrates nothing when the prior aiSettings row was never actually configured", async () => {
    await withFreshDbName(async (name) => {
      const legacy = legacyV5Schema(name);
      await legacy.open();
      await legacy.table("aiSettings").put({
        id: "default",
        enabled: false,
        providerId: "anthropic",
        model: "claude-opus-5",
        apiKey: "",
        depth: "standard",
        tone: "direct",
        level: "intermediate",
      });
      legacy.close();

      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.get("default")).toBeUndefined();

      upgraded.close();
    });
  });

  it("starts with no profiles and no active profile on a fresh install (no prior aiSettings row at all)", async () => {
    await withFreshDbName(async (name) => {
      const upgraded = new ScaleCraftDB(name);
      await upgraded.open();

      expect(await upgraded.aiProfiles.toArray()).toEqual([]);
      expect(await upgraded.aiActiveProfile.get("default")).toBeUndefined();

      upgraded.close();
    });
  });
});
