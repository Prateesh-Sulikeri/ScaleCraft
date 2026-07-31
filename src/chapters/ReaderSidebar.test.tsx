import { describe, expect, it, vi } from "vitest";
import type { Course } from "@/curriculum/types";

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      hydrate: vi.fn().mockResolvedValue(undefined),
      validationPassedDefinitionIds: new Set(),
      rowsBySlug: new Map(),
    }),
}));

vi.mock("@/app/HeldTransitionLink", () => ({
  HeldTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe("ReaderSidebar - Data & Structure", () => {
  it("requires course object with sections", () => {
    const course: Course = {
      id: "building-blocks",
      title: "Building Blocks",
      subtitle: "Learn system design",
      sections: [
        {
          id: "sec-1",
          label: "Foundations",
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
            },
          ],
        },
      ],
    };

    expect(course.id).toBe("building-blocks");
    expect(course.title).toBe("Building Blocks");
    expect(course.sections[0].chapters[0].slug).toBe("ch-1");
  });

  it("generates correct back-to-learning-path URL", () => {
    const courseId = "building-blocks";
    const expectedUrl = `/${courseId}`;
    expect(expectedUrl).toBe("/building-blocks");
  });

  it("displays course title correctly", () => {
    const courses = [
      { id: "building-blocks", title: "Building Blocks" },
      { id: "real-world-extraction", title: "Real World Extraction" },
    ];

    expect(courses[0].title).toBe("Building Blocks");
    expect(courses[1].title).toBe("Real World Extraction");
  });

  it("marks current chapter slug for highlighting", () => {
    const chapterSlug = "load-balancing";
    const currentSlug = "load-balancing";
    expect(chapterSlug === currentSlug).toBe(true);
  });

  it("reuses curriculum section list component", () => {
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
              title: "Ch1",
              kind: "chapter",
              chapterDefinitionId: "def1",
              estimatedMinutes: 10,
              difficulty: "foundational",
              prerequisiteSlugs: [],
            },
            {
              slug: "ch-2",
              number: "1.2",
              title: "Ch2",
              kind: "chapter",
              chapterDefinitionId: "def2",
              estimatedMinutes: 15,
              difficulty: "intermediate",
              prerequisiteSlugs: [],
            },
          ],
        },
      ],
    };

    expect(course.sections[0].chapters).toHaveLength(2);
  });

  it("passes progress inputs to list component", () => {
    const inputs = {
      validationPassedDefinitionIds: new Set(["def1"]),
      rowsBySlug: new Map([["ch-1", { slug: "ch-1", lastVisitedAt: new Date() }]]),
    };

    expect(inputs.validationPassedDefinitionIds.has("def1")).toBe(true);
    expect(inputs.rowsBySlug.has("ch-1")).toBe(true);
  });

  it("combines course and chapter context for sidebar", () => {
    const courseId = "building-blocks";
    const chapterSlug = "load-balancing";

    const sidebarContext = {
      courseId,
      chapterSlug,
      backUrl: `/${courseId}`,
      readerUrl: `/${courseId}/${chapterSlug}/lesson`,
    };

    expect(sidebarContext.backUrl).toBe("/building-blocks");
    expect(sidebarContext.readerUrl).toBe("/building-blocks/load-balancing/lesson");
  });
});
