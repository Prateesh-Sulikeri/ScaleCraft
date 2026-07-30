import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { CanvasStoreProvider } from "@/canvas/store";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { Course, CurriculumChapter } from "@/curriculum/types";
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

function makeEntry(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "a",
    number: "1.1",
    title: "Alpha",
    kind: "chapter",
    chapterDefinitionId: "ch-1",
    estimatedMinutes: 10,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    ...overrides,
  };
}

const entryA = makeEntry({ slug: "a", title: "Alpha", chapterDefinitionId: "ch-1" });
const entryB = makeEntry({ slug: "b", title: "Beta", chapterDefinitionId: null });
const entryC = makeEntry({ slug: "c", title: "Gamma", chapterDefinitionId: "ch-3" });

const course: Course = {
  id: "building-blocks",
  title: "Building Blocks",
  subtitle: "Subtitle.",
  sections: [{ id: "unit-1", label: "Unit 1", title: "Unit One", summary: "Summary.", chapters: [entryA, entryB, entryC] }],
};

vi.mock("@/content/chapters", () => ({
  chapterRegistry: [
    makeChapter({ id: "ch-1", title: "Chapter One" }),
    makeChapter({ id: "ch-3", title: "Chapter Three" }),
  ],
}));

const getCourseMock = vi.fn(() => course);
const findEntryMock = vi.fn((_courseId: string, slug: string) =>
  [entryA, entryB, entryC].find((e) => e.slug === slug),
);
const adjacentAuthoredEntriesMock = vi.fn(
  () => ({}) as { prev?: CurriculumChapter; next?: CurriculumChapter },
);
vi.mock("@/curriculum", () => ({
  getCourse: () => getCourseMock(),
  findEntry: (courseId: string, slug: string) => findEntryMock(courseId, slug),
  adjacentAuthoredEntries: () => adjacentAuthoredEntriesMock(),
}));

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ validationPassedDefinitionIds: new Set<string>(), rowsBySlug: new Map() }),
}));

const routerPushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const { ChapterSidebar } = await import("./ChapterSidebar");

function renderSidebar(overrides: { chapterOutcome?: ChapterOutcome | null; isStale?: boolean } = {}) {
  return render(
    <CanvasStoreProvider>
      <ChapterSidebar
        courseId="building-blocks"
        chapterSlug="a"
        chapterOutcome={overrides.chapterOutcome ?? null}
        isStale={overrides.isStale ?? false}
      />
    </CanvasStoreProvider>,
  );
}

describe("ChapterSidebar", () => {
  it("renders QuestionPane for the chapter the route slug resolves to", () => {
    renderSidebar();
    expect(screen.getByRole("heading", { name: "Chapter One" })).toBeInTheDocument();
  });

  it("renders nothing when the slug resolves to no ChapterDefinition", () => {
    const { container } = render(
      <CanvasStoreProvider>
        <ChapterSidebar courseId="building-blocks" chapterSlug="does-not-exist" chapterOutcome={null} isStale={false} />
      </CanvasStoreProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("navigates to the course's Learning Path on 'Back to Learning Path'", () => {
    renderSidebar();
    fireEvent.click(screen.getByRole("button", { name: /back to learning path/i }));
    expect(routerPushMock).toHaveBeenCalledWith("/building-blocks");
  });

  it("disables Previous/Next when adjacentAuthoredEntries reports no neighbors", () => {
    adjacentAuthoredEntriesMock.mockReturnValue({});
    renderSidebar();
    expect(screen.getByRole("button", { name: /previous chapter/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /next chapter/i })).toBeDisabled();
  });

  it("navigates prev/next to the curriculum-adjacent authored slugs", () => {
    adjacentAuthoredEntriesMock.mockReturnValue({ prev: entryC, next: entryC });
    renderSidebar();

    fireEvent.click(screen.getByRole("button", { name: /previous chapter/i }));
    expect(routerPushMock).toHaveBeenCalledWith("/building-blocks/c");

    fireEvent.click(screen.getByRole("button", { name: /next chapter/i }));
    expect(routerPushMock).toHaveBeenCalledWith("/building-blocks/c");
  });

  it("shows QuestionPane's 'Not yet validated' when isStale is true even with prior violations", () => {
    renderSidebar({
      isStale: true,
      chapterOutcome: makeOutcome({
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
      }),
    });
    expect(screen.getByText(/not yet validated/i)).toBeInTheDocument();
  });

  describe("curriculum navigator", () => {
    it("is collapsed by default", () => {
      renderSidebar();
      expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    });

    it("expands to show every entry in the course, grouped by section", () => {
      renderSidebar();
      fireEvent.click(screen.getByRole("button", { name: /curriculum/i }));

      expect(screen.getByText("Unit 1")).toBeInTheDocument();
      expect(screen.getByText(/Alpha/)).toBeInTheDocument();
      expect(screen.getByText(/Beta/)).toBeInTheDocument();
      expect(screen.getByText(/Gamma/)).toBeInTheDocument();
    });

    it("renders unauthored entries as non-interactive, not links", () => {
      renderSidebar();
      fireEvent.click(screen.getByRole("button", { name: /curriculum/i }));

      expect(screen.queryByRole("link", { name: /Beta/ })).not.toBeInTheDocument();
      expect(screen.getByRole("link", { name: /Gamma/ })).toHaveAttribute("href", "/building-blocks/c");
    });

    it("marks the current chapter's row via aria-current", () => {
      renderSidebar();
      fireEvent.click(screen.getByRole("button", { name: /curriculum/i }));

      expect(screen.getByRole("link", { name: /Alpha/ })).toHaveAttribute("aria-current", "page");
      expect(screen.getByRole("link", { name: /Gamma/ })).not.toHaveAttribute("aria-current");
    });

    it("links to the full Learning Path for this course", () => {
      renderSidebar();
      expect(screen.getByRole("link", { name: /view full learning path/i })).toHaveAttribute(
        "href",
        "/building-blocks",
      );
    });
  });
});
