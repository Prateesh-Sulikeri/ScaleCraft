import { describe, expect, it } from "vitest";
import { categoryColorVar, categoryLabel, categoryOrder } from "./category-colors";
import type { ComponentCategory } from "@/content/components/types";

const ALL_CATEGORIES: ComponentCategory[] = [
  "networking",
  "compute",
  "data",
  "caching",
  "messaging",
  "distributed-systems",
];

describe("categoryColorVar", () => {
  it("has an entry for every category, each a CSS var() referencing --category-<slug>", () => {
    for (const category of ALL_CATEGORIES) {
      expect(categoryColorVar[category]).toBe(`var(--category-${category})`);
    }
  });

  it("has no entries beyond the known category set", () => {
    expect(Object.keys(categoryColorVar).sort()).toEqual([...ALL_CATEGORIES].sort());
  });
});

describe("categoryLabel", () => {
  it("has a Title Case label for every category", () => {
    expect(categoryLabel.networking).toBe("Networking");
    expect(categoryLabel.compute).toBe("Compute");
    expect(categoryLabel.data).toBe("Data");
    expect(categoryLabel.caching).toBe("Caching");
    expect(categoryLabel.messaging).toBe("Messaging");
    expect(categoryLabel["distributed-systems"]).toBe("Distributed Systems");
  });

  it("has an entry for every category with no raw hyphenated slugs leaking through", () => {
    for (const category of ALL_CATEGORIES) {
      const label = categoryLabel[category];
      expect(label).toEqual(expect.any(String));
      expect(label).not.toContain("-");
    }
  });
});

describe("categoryOrder", () => {
  it("lists every category exactly once", () => {
    expect(categoryOrder.length).toBe(ALL_CATEGORIES.length);
    expect(new Set(categoryOrder).size).toBe(ALL_CATEGORIES.length);
    for (const category of ALL_CATEGORIES) {
      expect(categoryOrder).toContain(category);
    }
  });

  it("matches the documented DESIGN_LANGUAGE.md row order", () => {
    expect(categoryOrder).toEqual([
      "networking",
      "compute",
      "data",
      "caching",
      "messaging",
      "distributed-systems",
    ]);
  });
});
