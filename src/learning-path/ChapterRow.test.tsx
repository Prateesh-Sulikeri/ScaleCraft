import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChapterRow } from "./ChapterRow";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { db } from "@/persistence/db";
import type { CurriculumChapter } from "@/curriculum/types";

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
  it("renders an authored chapter as a real link to its route", () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="NOT_STARTED" completedByValidation={false} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/building-blocks/1-2-load-balancing");
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
    expect(screen.getByText("Not yet authored")).toBeInTheDocument();
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

  it("disables the toggle and shows a tooltip when the chapter was completed by validation", () => {
    render(<ChapterRow entry={entry()} courseId="building-blocks" status="COMPLETED" completedByValidation={true} />);
    const toggle = screen.getByRole("button", { name: "Mark Load Balancing incomplete" });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("title", "Completed by validation");
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
