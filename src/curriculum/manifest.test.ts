import { describe, it, expect } from "vitest";
import { courses } from "./manifest";
import { allEntries } from "./index";
import { chapterRegistry } from "@/content/chapters/index";
import type { CourseId } from "./types";

const courseIds = Object.keys(courses) as CourseId[];

describe("curriculum manifest invariants", () => {
  it("has globally unique slugs across both courses", () => {
    const slugs = courseIds.flatMap((id) => allEntries(courses[id]).map((c) => c.slug));
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every non-null chapterDefinitionId against chapterRegistry", () => {
    const registryIds = new Set(chapterRegistry.map((c) => c.id));
    for (const id of courseIds) {
      for (const entry of allEntries(courses[id])) {
        if (entry.chapterDefinitionId !== null) {
          expect(registryIds.has(entry.chapterDefinitionId)).toBe(true);
        }
      }
    }
  });

  it("matches mode between a course and its entries' ChapterDefinition", () => {
    const byId = new Map(chapterRegistry.map((c) => [c.id, c]));
    for (const courseId of courseIds) {
      for (const entry of allEntries(courses[courseId])) {
        if (entry.chapterDefinitionId === null) continue;
        const def = byId.get(entry.chapterDefinitionId);
        expect(def?.mode).toBe(courseId);
      }
    }
  });

  it("has 26 Building Blocks entries", () => {
    expect(allEntries(courses["building-blocks"])).toHaveLength(26);
  });

  it("has 5 Real World Extraction entries", () => {
    expect(allEntries(courses["real-world-extraction"])).toHaveLength(5);
  });

  it("has every prerequisiteSlugs entry reference a real slug", () => {
    const allSlugs = new Set(courseIds.flatMap((id) => allEntries(courses[id]).map((c) => c.slug)));
    for (const id of courseIds) {
      for (const entry of allEntries(courses[id])) {
        for (const prereq of entry.prerequisiteSlugs) {
          expect(allSlugs.has(prereq)).toBe(true);
        }
      }
    }
  });
});
