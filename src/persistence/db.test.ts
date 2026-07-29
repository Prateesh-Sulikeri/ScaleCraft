import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { db, SANDBOX_SAVE_ID, type CanvasSave, type ChapterProgress, type DeepCheckSession } from "./db";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";
import type { CustomComponentRecord } from "@/content/components/custom";
import type { AiSettings } from "@/ai/settings";

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

  it("round-trips an aiSettings record through IndexedDB (schema v4)", async () => {
    const settings: AiSettings = {
      id: "default",
      enabled: true,
      providerId: "anthropic",
      model: "claude-opus-5",
      apiKey: "sk-ant-test",
      depth: "standard",
      tone: "direct",
      level: "intermediate",
    };

    await db.aiSettings.put(settings);
    let restored = await db.aiSettings.get("default");
    expect(restored).toEqual(settings);

    const updated: AiSettings = { ...settings, tone: "socratic", enabled: false };
    await db.aiSettings.put(updated);
    restored = await db.aiSettings.get("default");
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
});
