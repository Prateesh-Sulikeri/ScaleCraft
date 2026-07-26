import { describe, expect, it } from "vitest";
import { iconMap } from "./icon-map";

describe("iconMap", () => {
  it("maps every key to a component (Lucide icon), not undefined", () => {
    for (const [key, Icon] of Object.entries(iconMap)) {
      expect(Icon, `iconMap["${key}"] should be defined`).toBeTruthy();
    }
  });

  it("has no duplicate icon components across different keys (each key -> distinct glyph)", () => {
    const values = Object.values(iconMap);
    expect(new Set(values).size).toBe(values.length);
  });

  it("includes the fallback icon used by ComponentNode/ComponentPickerRow (server)", () => {
    expect(iconMap.server).toBeTruthy();
  });

  it("resolves a known set of component icon keys actually used by the registry", () => {
    for (const key of ["monitor", "database", "shield", "zap", "layers", "lock"]) {
      expect(iconMap[key]).toBeTruthy();
    }
  });

  it("returns undefined for an unregistered key (callers fall back to Server, see ComponentNode.tsx)", () => {
    expect(iconMap["not-a-real-icon"]).toBeUndefined();
  });
});
