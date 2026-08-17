import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UpNextCard } from "./UpNextCard";
import type { ContinueTarget } from "@/home/home-data";
import type { CurriculumChapter } from "@/curriculum/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/building-blocks",
}));

const entry: CurriculumChapter = {
  slug: "3-4-load-balancer",
  number: "3.4",
  title: "Load Balancer",
  kind: "chapter",
  chapterDefinitionId: "bb-load-balancer",
  estimatedMinutes: 35,
  difficulty: "foundational",
  prerequisiteSlugs: [],
  domain: null,
};

const target: ContinueTarget = {
  href: "/building-blocks/3-4-load-balancer/lesson",
  courseId: "building-blocks",
  slug: entry.slug,
  chapterLabel: "3.4 Load Balancer",
  chapterDefinitionId: entry.chapterDefinitionId,
  kind: "next",
};

describe("UpNextCard", () => {
  it("is one link covering the whole card, pointing at the chapter's lesson route", () => {
    render(<UpNextCard courseId="building-blocks" target={target} entry={entry} />);

    const link = screen.getByRole("link", { name: "Up next: 3.4 Load Balancer" });
    expect(link).toHaveAttribute("href", "/building-blocks/3-4-load-balancer/lesson");
    expect(link).toHaveTextContent("Load Balancer");
    expect(link).toHaveTextContent("foundational");
    expect(link).toHaveTextContent("~35 min");
  });

  it("names why this chapter, per the target's kind", () => {
    const { rerender } = render(<UpNextCard courseId="building-blocks" target={target} entry={entry} />);
    expect(screen.getByText("Next in the curriculum")).toBeInTheDocument();

    rerender(<UpNextCard courseId="building-blocks" target={{ ...target, kind: "resume" }} entry={entry} />);
    expect(screen.getByText("Picking up where you left off")).toBeInTheDocument();
  });

  it("renders a non-link end state when there is no chapter left to open", () => {
    render(
      <UpNextCard
        courseId="building-blocks"
        target={{ ...target, href: "/building-blocks", slug: null, chapterLabel: null }}
        entry={null}
      />,
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText(/every authored chapter in this course is complete/i)).toBeInTheDocument();
  });
});
