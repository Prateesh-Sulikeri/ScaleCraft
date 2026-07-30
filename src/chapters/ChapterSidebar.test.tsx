import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { ChapterSidebar } from "./ChapterSidebar";
import { CanvasStoreProvider } from "@/canvas/store";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";

function makeOutcome(overrides: Partial<ChapterOutcome> = {}): ChapterOutcome {
  return {
    passed: false,
    matchedBlueprintId: null,
    violations: [],
    errorCount: 0,
    missingRequiredComponentIds: [],
    disconnectedRequiredComponentIds: [],
    ...overrides,
  };
}

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: overrides.id ?? "ch-1",
    mode: "building-blocks",
    title: overrides.title ?? "Chapter One",
    problemStatement: "Problem statement.",
    learningObjectives: [],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
    ...overrides,
  };
}

const chapters = [
  makeChapter({ id: "a", title: "Alpha" }),
  makeChapter({ id: "b", title: "Beta" }),
  makeChapter({ id: "c", title: "Gamma" }),
];

// QuestionPane (rendered once a chapter is selected) reads from the canvas
// store via useCanvasStore, so every render needs a real provider — a
// deliberately thin wrapper, not a mock, since exercising the real
// ChapterList <-> QuestionPane switch is the point of this component.
function renderSidebar(props: Partial<ComponentProps<typeof ChapterSidebar>> = {}) {
  const defaults: ComponentProps<typeof ChapterSidebar> = {
    chapters,
    selectedChapterId: null,
    onSelect: vi.fn(),
    onBack: vi.fn(),
    chapterOutcome: null,
    isStale: false,
  };
  return render(
    <CanvasStoreProvider>
      <ChapterSidebar {...defaults} {...props} />
    </CanvasStoreProvider>,
  );
}

describe("ChapterSidebar", () => {
  it("renders the ChapterList view when no chapter is selected", () => {
    renderSidebar({ selectedChapterId: null });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
    // QuestionPane's "Back to Learning Path" back link should not be present.
    expect(screen.queryByRole("button", { name: /back to learning path/i })).not.toBeInTheDocument();
  });

  it("renders the QuestionPane view for the selected chapter", () => {
    renderSidebar({ selectedChapterId: "b" });
    expect(screen.getByRole("heading", { name: "Beta" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /back to learning path/i })).toBeInTheDocument();
  });

  it("falls back to the ChapterList view when selectedChapterId matches no chapter", () => {
    renderSidebar({ selectedChapterId: "does-not-exist" });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /back to learning path/i })).not.toBeInTheDocument();
  });

  it("wires prev/next to the chapter immediately before/after the selected one", () => {
    const onSelect = vi.fn();
    renderSidebar({ selectedChapterId: "b", onSelect });

    fireEvent.click(screen.getByRole("button", { name: /previous chapter/i }));
    expect(onSelect).toHaveBeenCalledWith("a");

    fireEvent.click(screen.getByRole("button", { name: /next chapter/i }));
    expect(onSelect).toHaveBeenCalledWith("c");
  });

  it("disables Previous on the first chapter and Next on the last", () => {
    const { rerender } = render(
      <CanvasStoreProvider>
        <ChapterSidebar
          chapters={chapters}
          selectedChapterId="a"
          onSelect={vi.fn()}
          onBack={vi.fn()}
          chapterOutcome={null}
          isStale={false}
        />
      </CanvasStoreProvider>,
    );
    expect(screen.getByRole("button", { name: /previous chapter/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next chapter/i })).toBeEnabled();

    rerender(
      <CanvasStoreProvider>
        <ChapterSidebar
          chapters={chapters}
          selectedChapterId="c"
          onSelect={vi.fn()}
          onBack={vi.fn()}
          chapterOutcome={null}
          isStale={false}
        />
      </CanvasStoreProvider>,
    );
    expect(screen.getByRole("button", { name: /next chapter/i })).toBeDisabled();
  });

  it("forwards onSelect from ChapterList when a chapter row is clicked", () => {
    const onSelect = vi.fn();
    renderSidebar({ selectedChapterId: null, onSelect });
    fireEvent.click(screen.getByText("Alpha"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });

  it("forwards onBack from QuestionPane's 'Back to Learning Path' button", () => {
    const onBack = vi.fn();
    renderSidebar({ selectedChapterId: "a", onBack });
    fireEvent.click(screen.getByRole("button", { name: /back to learning path/i }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows QuestionPane's 'Not yet validated' when isStale is true even with prior violations", () => {
    const chaptersWithRequirement = [makeChapter({ id: "a", title: "Alpha", requiredComponentIds: ["client"] })];
    render(
      <CanvasStoreProvider>
        <ChapterSidebar
          chapters={chaptersWithRequirement}
          selectedChapterId="a"
          onSelect={vi.fn()}
          onBack={vi.fn()}
          chapterOutcome={makeOutcome({
            violations: [
              {
                ruleId: "r1",
                severity: "error",
                message: "Bad",
                explanation: "Because reasons.",
                offendingNodeIds: [],
                offendingEdgeIds: [],
              },
            ],
            errorCount: 1,
          })}
          isStale={true}
        />
      </CanvasStoreProvider>,
    );
    expect(screen.getByText(/not yet validated/i)).toBeInTheDocument();
  });
});
