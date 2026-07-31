import { describe, it, expect, vi } from "vitest";
import { deriveStatus, summarizeEntries, summarizeSection, summarizeCourse, type ProgressInputs } from "./progress";
import type { CurriculumChapter, CurriculumSection, Course } from "./types";
import type { CurriculumProgress } from "@/persistence/db";
import type { ChapterDefinition } from "@/content/chapters/types";

// Fixed, test-only registry — deriveStatus looks up a definition by id to
// check for a quiz. bb-dummy-1/a/b/c mirror real ids with no quiz (so
// existing validation-only COMPLETED behavior is unaffected); with-quiz-def
// is the only entry the quiz-gating tests below actually exercise.
vi.mock("@/content/chapters", () => ({
  chapterRegistry: [
    { id: "bb-dummy-1" },
    { id: "a" },
    { id: "b" },
    { id: "c" },
    {
      id: "with-quiz-def",
      quiz: [
        { id: "q1", kind: "single", difficulty: 1, prompt: "p1", options: [{ id: "o1", label: "l", explanationMd: "e", correct: true }] },
        { id: "q2", kind: "single", difficulty: 1, prompt: "p2", options: [{ id: "o1", label: "l", explanationMd: "e", correct: true }] },
      ],
    },
  ] satisfies Partial<ChapterDefinition>[],
}));

function chapter(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "test-slug",
    number: "1.1",
    title: "Test Chapter",
    kind: "chapter",
    chapterDefinitionId: null,
    estimatedMinutes: 20,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    domain: null,
    ...overrides,
  };
}

function inputs(overrides: Partial<ProgressInputs> = {}): ProgressInputs {
  return {
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
    correctQuestionIdsByDefinition: new Map(),
    ...overrides,
  };
}

function row(overrides: Partial<CurriculumProgress> = {}): CurriculumProgress {
  return { slug: "test-slug", manuallyCompletedAt: null, lastVisitedAt: null, ...overrides };
}

describe("deriveStatus", () => {
  it("returns NOT_STARTED when there is no row and no validation pass", () => {
    expect(deriveStatus(chapter(), inputs())).toBe("NOT_STARTED");
  });

  it("returns IN_PROGRESS when lastVisitedAt is set but nothing is completed", () => {
    const rowsBySlug = new Map([["test-slug", row({ lastVisitedAt: Date.now() })]]);
    expect(deriveStatus(chapter(), inputs({ rowsBySlug }))).toBe("IN_PROGRESS");
  });

  it("returns COMPLETED when manuallyCompletedAt is set", () => {
    const rowsBySlug = new Map([["test-slug", row({ manuallyCompletedAt: Date.now() })]]);
    expect(deriveStatus(chapter(), inputs({ rowsBySlug }))).toBe("COMPLETED");
  });

  it("returns COMPLETED when the backing ChapterDefinition has a validation pass", () => {
    const entry = chapter({ chapterDefinitionId: "bb-dummy-1" });
    const validationPassedDefinitionIds = new Set(["bb-dummy-1"]);
    expect(deriveStatus(entry, inputs({ validationPassedDefinitionIds }))).toBe("COMPLETED");
  });

  it("manual completion wins over IN_PROGRESS (COMPLETED beats IN_PROGRESS)", () => {
    const rowsBySlug = new Map([
      ["test-slug", row({ manuallyCompletedAt: Date.now(), lastVisitedAt: Date.now() })],
    ]);
    expect(deriveStatus(chapter(), inputs({ rowsBySlug }))).toBe("COMPLETED");
  });

  it("a validation pass for a different chapterDefinitionId does not complete this entry", () => {
    const entry = chapter({ chapterDefinitionId: "bb-dummy-1" });
    const validationPassedDefinitionIds = new Set(["some-other-id"]);
    expect(deriveStatus(entry, inputs({ validationPassedDefinitionIds }))).toBe("NOT_STARTED");
  });

  it("an unauthored entry (chapterDefinitionId: null) is never completed by validation", () => {
    const entry = chapter({ chapterDefinitionId: null });
    const validationPassedDefinitionIds = new Set(["bb-dummy-1"]);
    expect(deriveStatus(entry, inputs({ validationPassedDefinitionIds }))).toBe("NOT_STARTED");
  });

  it("validation pass alone is IN_PROGRESS (not COMPLETED) when the definition has a quiz not yet fully mastered", () => {
    const entry = chapter({ chapterDefinitionId: "with-quiz-def" });
    const rowsBySlug = new Map([["test-slug", row({ lastVisitedAt: Date.now() })]]);
    const result = deriveStatus(
      entry,
      inputs({
        validationPassedDefinitionIds: new Set(["with-quiz-def"]),
        correctQuestionIdsByDefinition: new Map([["with-quiz-def", new Set(["q1"])]]),
        rowsBySlug,
      }),
    );
    expect(result).toBe("IN_PROGRESS");
  });

  it("COMPLETED once validation passes and every quiz question has been mastered at least once", () => {
    const entry = chapter({ chapterDefinitionId: "with-quiz-def" });
    const result = deriveStatus(
      entry,
      inputs({
        validationPassedDefinitionIds: new Set(["with-quiz-def"]),
        correctQuestionIdsByDefinition: new Map([["with-quiz-def", new Set(["q1", "q2"])]]),
      }),
    );
    expect(result).toBe("COMPLETED");
  });
});

describe("summarizeEntries", () => {
  it("returns percent 0 and no NaN when total is 0", () => {
    expect(summarizeEntries([], inputs())).toEqual({ completed: 0, total: 0, percent: 0 });
  });

  it("rounds percent to the nearest integer", () => {
    const entries = [
      chapter({ slug: "a", chapterDefinitionId: "a" }),
      chapter({ slug: "b" }),
      chapter({ slug: "c" }),
    ];
    const validationPassedDefinitionIds = new Set(["a"]);
    // 1 / 3 = 33.33...% -> rounds to 33
    expect(summarizeEntries(entries, inputs({ validationPassedDefinitionIds }))).toEqual({
      completed: 1,
      total: 3,
      percent: 33,
    });
  });

  it("counts every entry, including checkpoints", () => {
    const entries = [
      chapter({ slug: "a", kind: "checkpoint", chapterDefinitionId: "a" }),
      chapter({ slug: "b" }),
    ];
    const validationPassedDefinitionIds = new Set(["a"]);
    expect(summarizeEntries(entries, inputs({ validationPassedDefinitionIds }))).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
    });
  });
});

describe("summarizeSection", () => {
  it("summarizes only the section's own chapters", () => {
    const section: CurriculumSection = {
      id: "sec-1",
      label: "Unit 1",
      title: "Test Unit",
      summary: "Test summary.",
      chapters: [chapter({ slug: "a", chapterDefinitionId: "a" }), chapter({ slug: "b" })],
    };
    const validationPassedDefinitionIds = new Set(["a"]);
    expect(summarizeSection(section, inputs({ validationPassedDefinitionIds }))).toEqual({
      completed: 1,
      total: 2,
      percent: 50,
    });
  });
});

describe("summarizeCourse", () => {
  const course: Course = {
    id: "building-blocks",
    title: "Building Blocks",
    subtitle: "Test subtitle",
    sections: [
      {
        id: "sec-1",
        label: "Unit 1",
        title: "Unit One",
        summary: "Summary.",
        chapters: [chapter({ slug: "a", chapterDefinitionId: "a" }), chapter({ slug: "b", chapterDefinitionId: "b" })],
      },
      {
        id: "sec-2",
        label: "Unit 2",
        title: "Unit Two",
        summary: "Summary.",
        chapters: [chapter({ slug: "c", chapterDefinitionId: "c" })],
      },
    ],
  };

  it("counts a section as complete only when every one of its entries is COMPLETED", () => {
    const validationPassedDefinitionIds = new Set(["a"]); // section 1 half-done, section 2 untouched
    const summary = summarizeCourse(course, inputs({ validationPassedDefinitionIds }));
    expect(summary.sectionsCompleted).toBe(0);
    expect(summary.sectionsTotal).toBe(2);
    expect(summary.completed).toBe(1);
    expect(summary.total).toBe(3);
  });

  it("counts a fully-completed section", () => {
    const validationPassedDefinitionIds = new Set(["a", "b"]); // section 1 fully done
    const summary = summarizeCourse(course, inputs({ validationPassedDefinitionIds }));
    expect(summary.sectionsCompleted).toBe(1);
    expect(summary.completed).toBe(2);
  });
});
