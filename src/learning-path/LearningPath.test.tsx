import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LearningPath } from "./LearningPath";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
  });
  await db.curriculumProgress.clear();
  await db.chapterProgress.clear();
});

describe("LearningPath", () => {
  it("renders Building Blocks' 10 sections and all 47 chapter rows", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("heading", { level: 1, name: "Building Blocks" })).toBeInTheDocument();

    const sectionToggles = screen.getAllByRole("button", { name: /^(part|group) /i });
    expect(sectionToggles).toHaveLength(10);

    // Every section defaults expanded (D5) — every chapter's status icon is
    // present, one per curriculum entry (47 for BB).
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(47);
  });

  it("renders Real World Extraction's 5 sections and all 32 chapter rows", () => {
    render(<LearningPath courseId="real-world-extraction" />);
    expect(screen.getByRole("heading", { level: 1, name: "Real World Extraction" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /^tier /i })).toHaveLength(5);
    expect(screen.getAllByRole("img", { name: /completed|in progress|not started/i })).toHaveLength(32);
  });

  it("the authored Load Balancer row is a real link to its lesson (Chapter Reader) route; an unauthored row is not", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /load balancer/i })).toHaveAttribute(
      "href",
      "/building-blocks/3-4-load-balancer/lesson",
    );
    expect(screen.getAllByText("Coming soon").length).toBeGreaterThan(0);
  });

  it("includes a working Download Curriculum link", () => {
    render(<LearningPath courseId="building-blocks" />);
    expect(screen.getByRole("link", { name: /download curriculum/i })).toHaveAttribute(
      "href",
      "/docs/The_Crafters_Guide_to_System_Design.pdf",
    );
  });

  it("'Collapse all' collapses every section and flips to 'Expand all'; clicking again restores them", () => {
    render(<LearningPath courseId="building-blocks" />);
    const toggleAll = screen.getByRole("button", { name: /collapse all/i });

    fireEvent.click(toggleAll);
    expect(screen.getAllByRole("button", { name: /^(part|group) /i }).every((b) => b.getAttribute("aria-expanded") === "false")).toBe(true);
    expect(screen.getByRole("button", { name: /expand all/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /expand all/i }));
    expect(screen.getAllByRole("button", { name: /^(part|group) /i }).every((b) => b.getAttribute("aria-expanded") === "true")).toBe(true);
  });

  it("search filters chapter rows by title, hiding sections with no match", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "load balancer" },
    });

    expect(screen.getByText("Load Balancer")).toBeInTheDocument();
    expect(screen.queryByText("Vertical vs. Horizontal Scaling")).not.toBeInTheDocument();
  });

  it("search matches on completion status", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "not started" },
    });

    expect(screen.getAllByRole("img", { name: /not started/i }).length).toBeGreaterThan(0);
    expect(screen.queryAllByRole("img", { name: /^completed$/i })).toHaveLength(0);
  });

  it("shows a no-results message when nothing matches", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "zzz-no-such-chapter" },
    });

    expect(screen.getByText(/no chapters match/i)).toBeInTheDocument();
  });

  it("search matches a section's own title/label, showing all of that section's chapters", () => {
    render(<LearningPath courseId="building-blocks" />);
    fireEvent.change(screen.getByRole("textbox", { name: /search chapters/i }), {
      target: { value: "foundations" },
    });

    expect(screen.getByText("Welcome to ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText("What is System Design?")).toBeInTheDocument();
  });

  it("toggling a single section collapses just that section, independent of the others", () => {
    render(<LearningPath courseId="building-blocks" />);
    const toggles = screen.getAllByRole("button", { name: /^(part|group) /i });
    const first = toggles[0];
    const second = toggles[1];

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("shows a 'Scroll to top' button once scrolled past the threshold, which scrolls the pane back to 0", () => {
    const { container } = render(<LearningPath courseId="building-blocks" />);
    const scrollPane = container.querySelector(".overflow-y-auto")!;
    const scrollTo = vi.fn();
    Object.defineProperty(scrollPane, "scrollTop", { value: 500, configurable: true });
    // jsdom doesn't implement Element.scrollTo.
    (scrollPane as unknown as { scrollTo: typeof scrollTo }).scrollTo = scrollTo;

    fireEvent.scroll(scrollPane);
    const scrollTopBtn = screen.getByRole("button", { name: "Scroll to top" });
    expect(scrollTopBtn).toBeInTheDocument();

    fireEvent.click(scrollTopBtn);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });

    Object.defineProperty(scrollPane, "scrollTop", { value: 0, configurable: true });
    fireEvent.scroll(scrollPane);
    expect(screen.queryByRole("button", { name: "Scroll to top" })).not.toBeInTheDocument();
  });
});
