import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { db, SANDBOX_SAVE_ID, type CanvasSave } from "./db";
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
});
