import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { db, SANDBOX_SAVE_ID, type CanvasSave } from "./db";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";

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
});
