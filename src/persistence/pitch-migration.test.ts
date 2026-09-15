import { describe, expect, it } from "vitest";
import { CURRENT_PITCH_VERSION, migrateNodesToCurrentPitch, needsPitchMigration } from "./pitch-migration";
import type { AnyNodeType } from "@/canvas/types";

describe("needsPitchMigration", () => {
  it("treats a missing version as the oldest pitch, needing migration", () => {
    expect(needsPitchMigration(undefined)).toBe(true);
    expect(needsPitchMigration(null)).toBe(true);
  });

  it("does not re-migrate a save already at the current version", () => {
    expect(needsPitchMigration(CURRENT_PITCH_VERSION)).toBe(false);
  });

  it("migrates a save at an older version than current", () => {
    expect(needsPitchMigration(1)).toBe(true);
  });
});

describe("migrateNodesToCurrentPitch", () => {
  it("returns an empty array unchanged", () => {
    expect(migrateNodesToCurrentPitch([])).toEqual([]);
  });

  it("scales component node positions relative to the graph's own bounding-box origin, never touching width/height", () => {
    const nodes: AnyNodeType[] = [
      { id: "a", type: "component", position: { x: 60, y: 160 }, data: { componentId: "client", config: {} } },
      { id: "b", type: "component", position: { x: 380, y: 160 }, data: { componentId: "app-server", config: {} } },
    ];
    const result = migrateNodesToCurrentPitch(nodes);
    // origin is (60, 160) - the graph's own min x/y - so it stays put.
    expect(result[0].position).toEqual({ x: 60, y: 160 });
    // 380 is one old pitch (320) to the right of the origin; that becomes
    // one new pitch (260) to the right: 60 + 260 = 320.
    expect(result[1].position).toEqual({ x: 320, y: 160 });
  });

  it("scales zone width/height along with position", () => {
    const nodes: AnyNodeType[] = [
      { id: "z", type: "zone", position: { x: 32, y: 112 }, data: { label: "Client", width: 256, height: 137 } },
    ];
    const [result] = migrateNodesToCurrentPitch(nodes);
    expect(result.position).toEqual({ x: 32, y: 112 });
    expect(result.type).toBe("zone");
    if (result.type === "zone") {
      expect(result.data.width).toBeCloseTo(208, 5);
      expect(result.data.height).toBeCloseTo(166.96875, 5);
    }
  });

  it("scales comment width/height along with position", () => {
    const nodes: AnyNodeType[] = [
      { id: "c", type: "comment", position: { x: 980, y: 272 }, data: { text: "note", width: 240, height: 100 } },
    ];
    const [result] = migrateNodesToCurrentPitch(nodes);
    expect(result.type).toBe("comment");
    if (result.type === "comment") {
      expect(result.data.width).toBeCloseTo(195, 5);
      expect(result.data.height).toBeCloseTo(121.875, 5);
    }
  });

  it("leaves component node width/height alone (D11 - an explicit resize is not pitch-derived)", () => {
    const nodes: AnyNodeType[] = [
      {
        id: "a",
        type: "component",
        position: { x: 60, y: 160 },
        data: { componentId: "client", config: {} },
        width: 180,
        height: 130,
      },
    ];
    const [result] = migrateNodesToCurrentPitch(nodes);
    expect(result.width).toBe(180);
    expect(result.height).toBe(130);
  });
});
