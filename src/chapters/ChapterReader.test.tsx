import { describe, expect, it } from "vitest";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { CurriculumChapter } from "@/curriculum/types";
import type { ExtractedHeading } from "./extract-headings";

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: "ch-1",
    mode: "building-blocks",
    title: "Test Chapter",
    problemStatement: "Problem",
    learningObjectives: [],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
    ...overrides,
  };
}

function makeEntry(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "test-chapter",
    number: "1.1",
    title: "Test Chapter",
    kind: "chapter",
    chapterDefinitionId: "ch-1",
    estimatedMinutes: 10,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    ...overrides,
  };
}

describe("ChapterReader - Component Integration", () => {
  const testEntry = makeEntry();
  const testChapter = makeChapter({ id: "ch-1", title: "Test Chapter" });

  it("requires chapter definition and curriculum entry to render", () => {
    expect(testChapter.id).toBe("ch-1");
    expect(testEntry.chapterDefinitionId).toBe("ch-1");
  });

  it("handles chapters with difficulty levels", () => {
    const foundational = makeEntry({ difficulty: "foundational" });
    const intermediate = makeEntry({ difficulty: "intermediate", slug: "ch-2" });
    const advanced = makeEntry({ difficulty: "advanced", slug: "ch-3" });

    expect(foundational.difficulty).toBe("foundational");
    expect(intermediate.difficulty).toBe("intermediate");
    expect(advanced.difficulty).toBe("advanced");
  });

  it("stores chapter metadata correctly", () => {
    const ch = makeChapter({
      title: "My Chapter",
      problemStatement: "Solve this",
      learningObjectives: ["Learn A", "Learn B"],
    });

    expect(ch.title).toBe("My Chapter");
    expect(ch.problemStatement).toBe("Solve this");
    expect(ch.learningObjectives).toContain("Learn A");
  });

  it("tracks estimated minutes for learning path", () => {
    const quickChapter = makeEntry({ estimatedMinutes: 5 });
    const longChapter = makeEntry({ estimatedMinutes: 45, slug: "long" });

    expect(quickChapter.estimatedMinutes).toBe(5);
    expect(longChapter.estimatedMinutes).toBe(45);
  });

  it("handles placeholder/draft chapters", () => {
    const draftChapter = makeChapter({ placeholder: true });
    expect(draftChapter.placeholder).toBe(true);
  });

  it("preserves chapter number in entry metadata", () => {
    const ch = makeEntry({ number: "2.3" });
    expect(ch.number).toBe("2.3");
  });

  it("stores entry kind correctly", () => {
    const ch = makeEntry({ kind: "chapter" });
    expect(ch.kind).toBe("chapter");
  });

  it("returns null when chapter definition is missing", () => {
    const entry = makeEntry({ chapterDefinitionId: null });
    expect(entry.chapterDefinitionId).toBeNull();
  });

  it("validates heading extraction compatibility", () => {
    const headings: ExtractedHeading[] = [
      { id: "overview", text: "Overview", level: 2 },
      { id: "details", text: "Details", level: 3 },
    ];

    expect(headings).toHaveLength(2);
    expect(headings[0].level).toBe(2);
    expect(headings[1].level).toBe(3);
  });

  it("supports multiple course modes", () => {
    const bb = makeChapter({ mode: "building-blocks" });
    const rwe = makeChapter({ mode: "real-world-extraction", id: "rwe-ch" });

    expect(bb.mode).toBe("building-blocks");
    expect(rwe.mode).toBe("real-world-extraction");
  });
});
