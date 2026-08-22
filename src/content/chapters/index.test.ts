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
      "bb-1-1-framing-the-problem",
      "bb-1-2-designing-the-system",
      "bb-1-3-defending-the-design",
      "bb-1-4-driving-the-interview",
      "bb-2-1-from-browser-to-backend",
      "bb-2-2-where-can-things-go-wrong",
      "bb-2-3-evolution-of-modern-architectures",
      "bb-3-1-networking-fundamentals",
      "bb-3-2-dns",
      "bb-3-3-reverse-proxy",
      "bb-3-4-load-balancer",
      "bb-3-5-api-gateway",
      "bb-3-6-stateless-services",
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
