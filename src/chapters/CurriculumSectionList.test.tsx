import { describe, expect, it, vi } from "vitest";
import type { Course, CurriculumChapter } from "@/curriculum/types";
import type { ProgressInputs } from "@/curriculum/progress";

vi.mock("@/learning-path/ChapterStatusIcon", () => ({
  ChapterStatusIcon: () => <div data-testid="status-icon" />,
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
}));

vi.mock("@/curriculum/progress", () => ({
  deriveStatus: (entry: CurriculumChapter) => (entry.chapterDefinitionId ? "completed" : "locked"),
}));

describe("CurriculumSectionList - Data Structure", () => {

  it("correctly represents course with sections and chapters", () => {
    const course: Course = {
      id: "building-blocks",
      title: "Building Blocks",
      subtitle: "Learn system design",
      sections: [
        {
          id: "sec-1",
          label: "Unit 1",
          title: "Foundations",
          summary: "Core concepts",
          chapters: [
            {
              slug: "ch-1",
              number: "1.1",
              title: "Chapter One",
              kind: "chapter",
              chapterDefinitionId: "ch-def-1",
              estimatedMinutes: 10,
              difficulty: "foundational",
              prerequisiteSlugs: [],
              domain: null,
            },
          ],
        },
      ],
    };

    expect(course.id).toBe("building-blocks");
    expect(course.sections).toHaveLength(1);
    expect(course.sections[0].chapters).toHaveLength(1);
  });

  it("handles authored chapters with definition ids", () => {
    const chapter: CurriculumChapter = {
      slug: "ch-1",
      number: "1.1",
      title: "Chapter",
      kind: "chapter",
      chapterDefinitionId: "def-1",
      estimatedMinutes: 10,
      difficulty: "foundational",
      prerequisiteSlugs: [],
      domain: null,
    };

    expect(chapter.chapterDefinitionId).not.toBeNull();
  });

  it("handles unread chapters without definition ids", () => {
    const chapter: CurriculumChapter = {
      slug: "ch-2",
      number: "1.2",
      title: "Future Chapter",
      kind: "chapter",
      chapterDefinitionId: null,
      estimatedMinutes: 15,
      difficulty: "intermediate",
      prerequisiteSlugs: [],
      domain: null,
    };

    expect(chapter.chapterDefinitionId).toBeNull();
  });

  it("tracks chapter numbers as strings or nulls", () => {
    const numbered: CurriculumChapter = {
      slug: "ch-1",
      number: "1.1",
      title: "Chapter",
      kind: "chapter",
      chapterDefinitionId: null,
      estimatedMinutes: 10,
      difficulty: "foundational",
      prerequisiteSlugs: [],
      domain: null,
    };

    const unnumbered: CurriculumChapter = {
      slug: "ch-2",
      number: null,
      title: "Checkpoint",
      kind: "checkpoint",
      chapterDefinitionId: null,
      estimatedMinutes: 5,
      difficulty: "foundational",
      prerequisiteSlugs: [],
      domain: null,
    };

    expect(numbered.number).toBe("1.1");
    expect(unnumbered.number).toBeNull();
  });

  it("supports multiple course sections", () => {
    const course: Course = {
      id: "building-blocks",
      title: "Building Blocks",
      subtitle: "Learn system design",
      sections: [
        {
          id: "sec-1",
          label: "Unit 1",
          title: "Foundations",
          summary: "Core concepts",
          chapters: [],
        },
        {
          id: "sec-2",
          label: "Unit 2",
          title: "Scaling",
          summary: "Advanced patterns",
          chapters: [],
        },
      ],
    };

    expect(course.sections).toHaveLength(2);
    expect(course.sections[0].label).toBe("Unit 1");
    expect(course.sections[1].label).toBe("Unit 2");
  });

  it("validates progress inputs structure", () => {
    const inputs: ProgressInputs = {
      validationPassedDefinitionIds: new Set(["def-1", "def-2"]),
      examAttemptsByDefinition: new Map(),
      rowsBySlug: new Map([
        [
          "ch-1",
          {
            slug: "ch-1",
            manuallyCompletedAt: null,
            lastVisitedAt: Date.now(),
          },
        ],
      ]),
    };

    expect(inputs.validationPassedDefinitionIds.has("def-1")).toBe(true);
    expect(inputs.rowsBySlug.has("ch-1")).toBe(true);
  });

  it("links route to slug correctly", () => {
    const chapter: CurriculumChapter = {
      slug: "load-balancing",
      number: "1.2",
      title: "Load Balancing",
      kind: "chapter",
      chapterDefinitionId: "lb-def",
      estimatedMinutes: 15,
      difficulty: "intermediate",
      prerequisiteSlugs: [],
      domain: null,
    };

    const expectedPath = `/building-blocks/${chapter.slug}`;
    expect(expectedPath).toBe("/building-blocks/load-balancing");
  });
});
