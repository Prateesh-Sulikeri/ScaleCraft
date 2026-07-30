import { describe, it, expect } from "vitest";
import { chapterRegistry, getChaptersForMode } from "./index";

describe("getChaptersForMode", () => {
  it("returns only building-blocks chapters for that mode", () => {
    const chapters = getChaptersForMode("building-blocks");
    expect(chapters).toHaveLength(1);
    expect(chapters[0].id).toBe("bb-dummy-1");
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
