import { describe, it, expect } from "vitest";
import { chapterRegistry, getChaptersForMode } from "./index";

describe("getChaptersForMode", () => {
  it("returns only building-blocks chapters for that mode", () => {
    const chapters = getChaptersForMode("building-blocks");
    expect(chapters.map((c) => c.id)).toEqual([
      "bb-0-1-welcome",
      "bb-0-2-what-is-system-design",
      "bb-0-3-interview-design-vs-production-engineering",
      "bb-0-4-the-system-design-lifecycle",
      "bb-1-1-understanding-the-problem",
      "bb-1-2-functional-requirements",
      "bb-1-3-non-functional-requirements",
      "bb-1-4-estimating-scale",
      "bb-1-5-numbers-every-engineer-should-know",
      "bb-1-6-drawing-the-first-architecture",
      "bb-1-7-identifying-bottlenecks",
      "bb-1-8-engineering-trade-offs",
      "bb-1-9-deep-dive-methodology",
      "bb-3-4-load-balancer",
    ]);
  });

  it("returns only real-world-extraction chapters for that mode", () => {
    const chapters = getChaptersForMode("real-world-extraction");
    expect(chapters).toHaveLength(1);
    expect(chapters[0].id).toBe("rwe-dummy-1");
  });

  it("every registered chapter's mode is reachable through the filter", () => {
    for (const chapter of chapterRegistry) {
      expect(getChaptersForMode(chapter.mode)).toContainEqual(chapter);
    }
  });
});
