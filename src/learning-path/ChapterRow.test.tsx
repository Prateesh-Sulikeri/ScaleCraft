import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChapterRow } from "./ChapterRow";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";
import type { CurriculumChapter } from "@/curriculum/types";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function entry(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "1-2-load-balancing",
    number: "1.2",
    title: "Load Balancing",
    kind: "chapter",
    chapterDefinitionId: "bb-dummy-1",
    estimatedMinutes: 35,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    domain: null,
    ...overrides,
  };
}

beforeEach(async () => {
  useCurriculumProgressStore.setState({
    hydrated: false,
    hydrating: false,
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(),
  });
  await db.curriculumProgress.clear();
});

describe("ChapterRow", () => {
  it("renders an authored chapter as a real link to its lesson (Chapter Reader) route", () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/building-blocks/1-2-load-balancing/lesson");
  });

  it("renders a domain chip for RWE entries, and nothing for entries with no domain", () => {
    const { rerender } = render(
      <ChapterRow
        entry={entry({ domain: "Messaging" })}
        courseId="building-blocks"
        status="NOT_STARTED"
        completedByValidation={false}
      />,
    );
    expect(screen.getByText("Messaging")).toBeInTheDocument();

    rerender(
      <ChapterRow entry={entry({ domain: null })} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />,
    );
    expect(screen.queryByText("Messaging")).not.toBeInTheDocument();
  });

  it("renders an unauthored chapter as a non-interactive row with a chip, not a link", () => {
    render(
      <ChapterRow
        entry={entry({ chapterDefinitionId: null })}
        courseId="building-blocks"
        status="NOT_STARTED"
        completedByValidation={false}
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Coming soon")).toBeInTheDocument();
  });

  it("the manual toggle sits outside the link and does not navigate when clicked", async () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);

    const toggle = screen.getByRole("button", { name: "Mark Load Balancing complete" });
    expect(screen.getByRole("link")).not.toContainElement(toggle);

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(
        useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt,
      ).toBeTypeOf("number"),
    );
  });

  it("resets the chapter's progress (manual flag + validation-pass record) when completed by validation", async () => {
    useCurriculumProgressStore.setState({
      validationPassedDefinitionIds: new Set(["bb-dummy-1"]),
    });
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="COMPLETED" completedByValidation={true} />);
    const toggle = screen.getByRole("button", { name: "Reset Load Balancing progress" });
    expect(toggle).not.toBeDisabled();
    expect(toggle).toHaveAttribute("title", "Completed by validation - click to reset and redo this chapter");

    fireEvent.click(toggle);
    await waitFor(() => {
      expect(useCurriculumProgressStore.getState().validationPassedDefinitionIds.has("bb-dummy-1")).toBe(false);
      expect(
        useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt,
      ).toBeNull();
    });
  });

  it("leaves the toggle enabled when COMPLETED came from a manual override, not validation", async () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="COMPLETED" completedByValidation={false} />);
    const toggle = screen.getByRole("button", { name: "Mark Load Balancing incomplete" });
    expect(toggle).not.toBeDisabled();

    fireEvent.click(toggle);
    await waitFor(() =>
      expect(useCurriculumProgressStore.getState().rowsBySlug.get("1-2-load-balancing")?.manuallyCompletedAt).toBeNull(),
    );
  });
});
