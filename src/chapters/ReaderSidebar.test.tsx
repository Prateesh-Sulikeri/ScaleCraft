import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReaderSidebar } from "./ReaderSidebar";
import type { Course } from "@/curriculum/types";

const hydrate = vi.fn().mockResolvedValue(undefined);

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      hydrate,
      validationPassedDefinitionIds: new Set(),
      rowsBySlug: new Map(),
      examAttemptsByDefinition: new Map(),
    }),
}));

vi.mock("@/app/HeldTransitionLink", () => ({
  HeldTransitionLink: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const course: Course = {
  id: "building-blocks",
  title: "Building Blocks",
  subtitle: "subtitle",
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

describe("ReaderSidebar", () => {
  it("hydrates curriculum progress on mount", () => {
    render(<ReaderSidebar course={course} chapterSlug="ch-1" />);
    expect(hydrate).toHaveBeenCalled();
  });

  it("links back to the course's Learning Path", () => {
    render(<ReaderSidebar course={course} chapterSlug="ch-1" />);
    expect(screen.getByRole("link", { name: /Learning Path/ })).toHaveAttribute("href", "/building-blocks");
  });

  it("shows the panel title and course name", () => {
    render(<ReaderSidebar course={course} chapterSlug="ch-1" />);
    expect(screen.getByRole("heading", { name: "Curriculum" })).toBeInTheDocument();
    expect(screen.getByText("Building Blocks")).toBeInTheDocument();
  });

  it("renders the course's curriculum section list", () => {
    render(<ReaderSidebar course={course} chapterSlug="ch-1" />);
    expect(screen.getByText("Unit 1")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Chapter One/ })).toHaveAttribute(
      "href",
      "/building-blocks/ch-1/lesson",
    );
  });
});
