import { describe, it, expect } from "vitest";
import { getCourse, allEntries, findEntry, findSection, slugForChapterDefinitionId } from "./index";
import { courses } from "./manifest";

describe("curriculum/index", () => {
  it("getCourse returns the course for a known id", () => {
    expect(getCourse("building-blocks")).toBe(courses["building-blocks"]);
    expect(getCourse("real-world-extraction")).toBe(courses["real-world-extraction"]);
  });

  it("allEntries flattens every section's chapters in order", () => {
    const course = courses["building-blocks"];
    const entries = allEntries(course);
    const expectedCount = course.sections.reduce((n, s) => n + s.chapters.length, 0);
    expect(entries).toHaveLength(expectedCount);
    expect(entries[0]).toBe(course.sections[0].chapters[0]);
  });

  it("findEntry finds a real slug within a course", () => {
    const firstSlug = courses["building-blocks"].sections[0].chapters[0].slug;
    expect(findEntry("building-blocks", firstSlug)?.slug).toBe(firstSlug);
  });

  it("findEntry returns undefined for an unknown slug", () => {
    expect(findEntry("building-blocks", "not-a-real-slug")).toBeUndefined();
  });

  it("findSection returns the section containing a given slug", () => {
    const section = courses["building-blocks"].sections[0];
    const slug = section.chapters[0].slug;
    expect(findSection("building-blocks", slug)?.id).toBe(section.id);
  });

  it("findSection returns undefined for an unknown slug", () => {
    expect(findSection("building-blocks", "not-a-real-slug")).toBeUndefined();
  });

  it("slugForChapterDefinitionId reverse-looks-up an authored entry's slug", () => {
    const authored = allEntries(courses["building-blocks"]).find((e) => e.chapterDefinitionId !== null);
    expect(authored).toBeDefined();
    expect(slugForChapterDefinitionId(authored!.chapterDefinitionId!)).toBe(authored!.slug);
  });

  it("slugForChapterDefinitionId returns undefined for an id with no curriculum entry", () => {
    expect(slugForChapterDefinitionId("not-a-real-definition-id")).toBeUndefined();
  });
});
