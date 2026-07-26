import { describe, it, expect } from "vitest";
import { ruleRegistry, getRules } from "./index";

describe("getRules", () => {
  it("returns an empty list for no ids", () => {
    expect(getRules([])).toEqual([]);
  });

  it("returns only the rules matching the given ids, in registry order", () => {
    const twoIds = [ruleRegistry[2].id, ruleRegistry[0].id];
    const rules = getRules(twoIds);
    expect(rules.map((r) => r.id)).toEqual([ruleRegistry[0].id, ruleRegistry[2].id]);
  });

  it("ignores unknown ids", () => {
    expect(getRules(["not-a-real-rule-id"])).toEqual([]);
  });

  it("returns every rule when given every registered id", () => {
    const rules = getRules(ruleRegistry.map((r) => r.id));
    expect(rules).toHaveLength(ruleRegistry.length);
  });
});
