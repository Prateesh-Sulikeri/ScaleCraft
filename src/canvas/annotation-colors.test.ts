import { describe, expect, it } from "vitest";
import {
  ANNOTATION_COLOR_PRESETS,
  DEFAULT_ZONE_COLOR,
  DEFAULT_COMMENT_COLOR,
  DEFAULT_FLAG_COLOR,
} from "./annotation-colors";

const HEX_RE = /^#[0-9a-f]{6}$/i;

describe("ANNOTATION_COLOR_PRESETS", () => {
  it("every preset has a name and a valid 6-digit hex value", () => {
    expect(ANNOTATION_COLOR_PRESETS.length).toBeGreaterThan(0);
    for (const preset of ANNOTATION_COLOR_PRESETS) {
      expect(preset.name).toEqual(expect.any(String));
      expect(preset.name.length).toBeGreaterThan(0);
      expect(preset.value).toMatch(HEX_RE);
    }
  });

  it("has no duplicate names or values", () => {
    const names = ANNOTATION_COLOR_PRESETS.map((p) => p.name);
    const values = ANNOTATION_COLOR_PRESETS.map((p) => p.value.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("default colors", () => {
  it("DEFAULT_ZONE_COLOR is a valid hex and matches the Pink preset", () => {
    expect(DEFAULT_ZONE_COLOR).toMatch(HEX_RE);
    expect(ANNOTATION_COLOR_PRESETS.some((p) => p.value === DEFAULT_ZONE_COLOR)).toBe(true);
  });

  it("DEFAULT_COMMENT_COLOR is a valid hex and matches the Blue preset", () => {
    expect(DEFAULT_COMMENT_COLOR).toMatch(HEX_RE);
    expect(ANNOTATION_COLOR_PRESETS.some((p) => p.value === DEFAULT_COMMENT_COLOR)).toBe(true);
  });

  it("DEFAULT_FLAG_COLOR is a valid hex, distinct from every annotation preset", () => {
    expect(DEFAULT_FLAG_COLOR).toMatch(HEX_RE);
    // Deliberately gold, distinct from the zone/comment defaults and every
    // other preset — see the doc comment in annotation-colors.ts.
    expect(ANNOTATION_COLOR_PRESETS.some((p) => p.value.toLowerCase() === DEFAULT_FLAG_COLOR.toLowerCase())).toBe(
      false,
    );
  });

  it("zone, comment, and flag defaults are all distinct from each other", () => {
    const defaults = [DEFAULT_ZONE_COLOR, DEFAULT_COMMENT_COLOR, DEFAULT_FLAG_COLOR].map((c) => c.toLowerCase());
    expect(new Set(defaults).size).toBe(3);
  });
});
