import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurriculumSectionList } from "./CurriculumSectionList";
import type { Course, CurriculumChapter } from "@/curriculum/types";
import type { ProgressInputs } from "@/curriculum/progress";

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

const emptyInputs: ProgressInputs = {
  validationPassedDefinitionIds: new Set(),
  rowsBySlug: new Map(),
  examAttemptsByDefinition: new Map(),
};

const course: Course = {
  id: "building-blocks",
  title: "Building Blocks",
  subtitle: "subtitle",
  sections: [
    {
      id: "part-0",
      label: "Part 0",
      title: "Intro",
      summary: "summary",
      chapters: [
        chapter({ slug: "authored", title: "Authored Chapter", chapterDefinitionId: "bb-dummy-1" }),
        chapter({ slug: "unauthored", title: "Unauthored Chapter", number: null }),
      ],
    },
  ],
};

describe("CurriculumSectionList", () => {
  it("renders each section label and its chapters' titles", () => {
    render(<CurriculumSectionList course={course} currentSlug="authored" inputs={emptyInputs} />);
    expect(screen.getByText("Part 0")).toBeInTheDocument();
    expect(screen.getByText(/Authored Chapter/)).toBeInTheDocument();
    expect(screen.getByText("Unauthored Chapter")).toBeInTheDocument();
  });

  it("links an authored chapter to its lesson route and marks it current", () => {
    render(<CurriculumSectionList course={course} currentSlug="authored" inputs={emptyInputs} />);
    const link = screen.getByRole("link", { name: /Authored Chapter/ });
    expect(link).toHaveAttribute("href", "/building-blocks/authored/lesson");
    expect(link).toHaveAttribute("aria-current", "page");
  });

  it("renders an unauthored chapter as a non-link, non-current row", () => {
    render(<CurriculumSectionList course={course} currentSlug="authored" inputs={emptyInputs} />);
    expect(screen.queryByRole("link", { name: /Unauthored Chapter/ })).not.toBeInTheDocument();
    expect(screen.getByText("Unauthored Chapter")).toBeInTheDocument();
  });

  it("does not mark a non-current authored chapter as aria-current", () => {
    render(<CurriculumSectionList course={course} currentSlug="unauthored" inputs={emptyInputs} />);
    const link = screen.getByRole("link", { name: /Authored Chapter/ });
    expect(link).not.toHaveAttribute("aria-current");
  });
});
