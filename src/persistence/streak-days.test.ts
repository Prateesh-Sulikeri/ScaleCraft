import { describe, expect, it } from "vitest";
import { decodeStreakDays, encodeStreakDays, mergeStreakDays } from "./streak-days";

const roundTrip = (days: number[]) => decodeStreakDays(encodeStreakDays(days));

describe("encodeStreakDays / decodeStreakDays", () => {
  it("round-trips a contiguous run", () => {
    expect(roundTrip([20500, 20501, 20502])).toEqual([20500, 20501, 20502]);
  });

  it("round-trips a set with gaps", () => {
    expect(roundTrip([20500, 20507, 20530])).toEqual([20500, 20507, 20530]);
  });

  it("sorts and dedupes on the way in", () => {
    expect(roundTrip([20507, 20500, 20507])).toEqual([20500, 20507]);
  });

  it("encodes an empty set as null rather than a zero-day record", () => {
    expect(encodeStreakDays([])).toBeNull();
  });

  it("survives a bit-boundary span (byte-aligned and not)", () => {
    // Off-by-one in the >>3 / &7 packing shows up exactly here.
    for (const span of [7, 8, 9, 15, 16, 17]) {
      const days = Array.from({ length: span }, (_, i) => 20500 + i);
      expect(roundTrip(days)).toEqual(days);
    }
  });

  it("keeps a decade of daily activity far inside Clerk's 8KB metadata cap", () => {
    // The reason for bit-packing at all - a plain number[] of this set is
    // ~22KB, nearly 3x the entire per-user budget.
    const days = Array.from({ length: 3650 }, (_, i) => 20000 + i);
    const encoded = encodeStreakDays(days);
    expect(JSON.stringify(encoded).length).toBeLessThan(1024);
    expect(decodeStreakDays(encoded)).toEqual(days);
  });

  it("stays compact on the every-other-day pattern that defeats run-length encoding", () => {
    const days = Array.from({ length: 1825 }, (_, i) => 20000 + i * 2);
    const encoded = encodeStreakDays(days);
    expect(JSON.stringify(encoded).length).toBeLessThan(1024);
    expect(decodeStreakDays(encoded)).toEqual(days);
  });

  it("drops negative and non-integer days instead of corrupting the bitmap", () => {
    expect(roundTrip([20500, -3, 20501.5])).toEqual([20500]);
  });
});

describe("decodeStreakDays on untrusted metadata", () => {
  // Clerk metadata is schemaless, so this reads whatever an older build or a
  // dashboard hand-edit left behind. Every branch must degrade to [], never
  // throw - a throw here would take down Home and the Learning Path.
  it.each([
    ["null", null],
    ["undefined", undefined],
    ["a number", 42],
    ["a string", "20500,20501"],
    ["an array (the pre-bitmap shape)", [20500, 20501]],
    ["an object missing bits", { base: 20500 }],
    ["an object missing base", { bits: "AQ==" }],
    ["a non-integer base", { base: 1.5, bits: "AQ==" }],
    ["a negative base", { base: -1, bits: "AQ==" }],
    ["bits of the wrong type", { base: 20500, bits: 12 }],
  ])("returns [] for %s", (_label, value) => {
    expect(decodeStreakDays(value)).toEqual([]);
  });
});

describe("mergeStreakDays", () => {
  it("unions, dedupes and sorts", () => {
    expect(mergeStreakDays([20502, 20500], [20501, 20502])).toEqual([20500, 20501, 20502]);
  });

  it("is idempotent, so a retried reset costs nothing", () => {
    const days = [20500, 20501];
    expect(mergeStreakDays(days, days)).toEqual(days);
  });

  it("never shrinks - a preserved day is a historical fact", () => {
    expect(mergeStreakDays([20500, 20501], [])).toEqual([20500, 20501]);
  });
});
