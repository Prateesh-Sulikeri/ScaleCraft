import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ChapterList } from "./ChapterList";
import type { ChapterDefinition } from "@/content/chapters/types";

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: overrides.id ?? "ch-1",
    mode: "building-blocks",
    title: overrides.title ?? "Chapter One",
    problemStatement: "Do the thing.",
    learningObjectives: [],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    hints: [],
    readingLinks: [],
    ...overrides,
  };
}

describe("ChapterList", () => {
  it("renders a flat list of chapters when none declare a group", () => {
    const chapters = [makeChapter({ id: "a", title: "Alpha" }), makeChapter({ id: "b", title: "Beta" })];
    render(<ChapterList chapters={chapters} onSelect={vi.fn()} />);

    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    // No group headers should appear in the flat-list branch.
    expect(screen.queryByRole("button", { name: /ungrouped/i })).not.toBeInTheDocument();
  });

  it("calls onSelect with the chapter id when a row is clicked", () => {
    const onSelect = vi.fn();
    const chapters = [makeChapter({ id: "a", title: "Alpha" })];
    render(<ChapterList chapters={chapters} onSelect={onSelect} />);

    fireEvent.click(screen.getByText("Alpha"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("groups chapters sharing a `group` under one expandable section", () => {
    const chapters = [
      makeChapter({ id: "a", title: "Alpha", group: "Networking" }),
      makeChapter({ id: "b", title: "Beta", group: "Networking" }),
      makeChapter({ id: "c", title: "Gamma" }), // no group -> its own "Ungrouped" section
    ];
    render(<ChapterList chapters={chapters} onSelect={vi.fn()} />);

    expect(screen.getByRole("button", { name: /networking/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ungrouped/i })).toBeInTheDocument();
    // Expanded by default.
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();

    // Collapsing a section hides its rows without touching the other section.
    fireEvent.click(screen.getByRole("button", { name: /networking/i }));
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.queryByText("Beta")).not.toBeInTheDocument();
    expect(screen.getByText("Gamma")).toBeInTheDocument();

    // Expanding it again restores the rows.
    fireEvent.click(screen.getByRole("button", { name: /networking/i }));
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("marks a placeholder chapter with a Draft badge and shows the caption", () => {
    const chapters = [makeChapter({ id: "a", title: "Alpha", placeholder: true })];
    render(<ChapterList chapters={chapters} onSelect={vi.fn()} />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText(/placeholder content — real chapters are coming soon/i)).toBeInTheDocument();
  });

  it("omits the Draft badge and caption for chapters with no placeholders", () => {
    const chapters = [makeChapter({ id: "a", title: "Alpha" })];
    render(<ChapterList chapters={chapters} onSelect={vi.fn()} />);

    expect(screen.queryByText("Draft")).not.toBeInTheDocument();
    expect(screen.queryByText(/placeholder content/i)).not.toBeInTheDocument();
  });

  it("shows the placeholder caption in the grouped branch too", () => {
    const chapters = [makeChapter({ id: "a", title: "Alpha", group: "G", placeholder: true })];
    render(<ChapterList chapters={chapters} onSelect={vi.fn()} />);

    expect(screen.getByText("Draft")).toBeInTheDocument();
    expect(screen.getByText(/placeholder content — real chapters are coming soon/i)).toBeInTheDocument();
  });
});
