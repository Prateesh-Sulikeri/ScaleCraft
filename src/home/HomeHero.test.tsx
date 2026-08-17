import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeHero } from "./HomeHero";
import type { ContinueTarget } from "./home-data";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), prefetch: vi.fn() }) }));

const chapterTarget: ContinueTarget = {
  href: "/building-blocks/load-balancers/lesson",
  courseId: "building-blocks",
  chapterLabel: "1.2 Load Balancers",
  chapterDefinitionId: "bb-load-balancers",
  kind: "resume",
};

describe("HomeHero", () => {
  it("states what ScaleCraft is", () => {
    render(<HomeHero continueTarget={chapterTarget} now={Date.now()} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Design real systems.Understand every trade-off.");
    expect(screen.getByText(/system design playground/)).toBeInTheDocument();
  });

  it("points the primary CTA at the resume target and names it", () => {
    render(<HomeHero continueTarget={chapterTarget} now={Date.now()} />);
    const cta = screen.getByRole("link", { name: /Continue Learning: 1.2 Load Balancers/ });
    expect(cta).toHaveAttribute("href", "/building-blocks/load-balancers/lesson");
    expect(screen.getByText("Picking up at")).toBeInTheDocument();
  });

  it("says Start only for a learner with no history at all", () => {
    render(<HomeHero continueTarget={{ ...chapterTarget, kind: "fresh" }} now={Date.now()} />);
    expect(screen.getByRole("link", { name: /Start Learning: 1.2 Load Balancers/ })).toBeInTheDocument();
    expect(screen.getByText("Starting with")).toBeInTheDocument();
  });

  it("still says Continue when the next chapter is untouched but progress exists", () => {
    render(<HomeHero continueTarget={{ ...chapterTarget, kind: "next" }} now={Date.now()} />);
    expect(screen.getByRole("link", { name: /Continue Learning: 1.2 Load Balancers/ })).toBeInTheDocument();
    expect(screen.getByText("Up next")).toBeInTheDocument();
  });

  it("omits the chapter hint when the target is a Learning Path", () => {
    render(
      <HomeHero
        continueTarget={{
          href: "/building-blocks",
          courseId: "building-blocks",
          chapterLabel: null,
          chapterDefinitionId: null,
          kind: "resume",
        }}
        now={Date.now()}
      />,
    );
    expect(screen.getByRole("link", { name: /the Learning Path/ })).toHaveAttribute("href", "/building-blocks");
    expect(screen.queryByText("Picking up at")).not.toBeInTheDocument();
  });

  it("offers exactly one hero action - the changelog lives on the announcement card", () => {
    render(<HomeHero continueTarget={chapterTarget} now={Date.now()} />);
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /Check Updates/ })).toHaveLength(1);
  });

  it("includes the alpha announcement", () => {
    render(<HomeHero continueTarget={chapterTarget} now={Date.now()} />);
    expect(screen.getByText("Alpha is live")).toBeInTheDocument();
  });
});
