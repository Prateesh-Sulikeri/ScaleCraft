import { describe, expect, it } from "vitest";
import { isConfigured } from "./config-state";

describe("isConfigured", () => {
  it("is false when every set value still matches the default", () => {
    expect(isConfigured({ instances: 1 }, { instances: 1 })).toBe(false);
  });

  it("is true when any value has been moved off its default", () => {
    expect(isConfigured({ instances: 3 }, { instances: 1 })).toBe(true);
  });

  it("is false for an empty config - nothing was ever set", () => {
    expect(isConfigured({}, { instances: 1 })).toBe(false);
  });

  it("ignores keys the component does not declare", () => {
    // A stale key left behind by an earlier component version is not a
    // configuration the learner made.
    expect(isConfigured({ removedField: "x" }, { instances: 1 })).toBe(false);
  });

  it("detects a change in any one field of several", () => {
    const defaults = { instances: 1, strategy: "round-robin", sticky: false };
    expect(isConfigured({ ...defaults, sticky: true }, defaults)).toBe(true);
    expect(isConfigured({ ...defaults }, defaults)).toBe(false);
  });

  it("handles each primitive field kind", () => {
    expect(isConfigured({ s: "b" }, { s: "a" })).toBe(true);
    expect(isConfigured({ n: 0 }, { n: 1 })).toBe(true);
    expect(isConfigured({ b: true }, { b: false })).toBe(true);
  });

  it("is false for a component with no configurable fields at all", () => {
    expect(isConfigured({}, {})).toBe(false);
  });

  it("is false rather than throwing for null/undefined/non-object input", () => {
    expect(isConfigured(undefined, { instances: 1 })).toBe(false);
    expect(isConfigured(null, { instances: 1 })).toBe(false);
    expect(isConfigured("nonsense", { instances: 1 })).toBe(false);
    expect(isConfigured({ instances: 3 }, undefined)).toBe(false);
  });
});
