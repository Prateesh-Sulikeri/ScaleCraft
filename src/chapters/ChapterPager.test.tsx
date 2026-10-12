import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterPager } from "./ChapterPager";
import type { CurriculumChapter } from "@/curriculum/types";

const entry = (slug: string, title: string, authored = true): CurriculumChapter => ({
  slug,
  number: null,
  title,
  kind: "chapter",
  chapterDefinitionId: authored ? `def-${slug}` : null,
  estimatedMinutes: 20,
  difficulty: "foundational",
  prerequisiteSlugs: [],
  domain: null,
});

const neighbours: Record<string, { prev?: CurriculumChapter; next?: CurriculumChapter }> = {
  middle: { prev: entry("first", "First"), next: entry("last", "Last") },
  "before-gap": { prev: entry("draft", "Draft", false), next: entry("gap", "Gap", false) },
  alone: {},
};

vi.mock("@/curriculum", () => ({
  previousEntry: (_c: string, slug: string) => neighbours[slug]?.prev,
  nextEntry: (_c: string, slug: string) => neighbours[slug]?.next,
}));

vi.mock("@/app/HeldTransitionLink", () => ({
  HeldTransitionLink: ({ children, href, ...rest }: { children: React.ReactNode; href: string; "aria-label"?: string }) => (
    <a href={href} aria-label={rest["aria-label"]}>
      {children}
    </a>
  ),
}));

describe("ChapterPager", () => {
  it("links to the previous and next lessons", () => {
    render(<ChapterPager courseId="building-blocks" chapterSlug="middle" />);
    expect(screen.getByRole("link", { name: "Previous: First" })).toHaveAttribute("href", "/building-blocks/first/lesson");
    expect(screen.getByRole("link", { name: "Next chapter: Last" })).toHaveAttribute("href", "/building-blocks/last/lesson");
  });

  it("hides an unauthored previous chapter and shows an unauthored next one as coming soon", () => {
    render(<ChapterPager courseId="building-blocks" chapterSlug="before-gap" />);
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/Coming soon/)).toBeInTheDocument();
  });

  it("renders nothing with no neighbours", () => {
    const { container } = render(<ChapterPager courseId="building-blocks" chapterSlug="alone" />);
    expect(container).toBeEmptyDOMElement();
  });
});
