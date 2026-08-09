import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CanvasStoreProvider } from "@/canvas/store";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { CurriculumChapter } from "@/curriculum/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";

function makeOutcome(overrides: Partial<ChapterOutcome> = {}): ChapterOutcome {
  return {
    passed: false,
    matchedBlueprintId: null,
    driftReport: null,
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
    domain: null,
    ...overrides,
  };
}

const entryA = makeEntry({ slug: "a", title: "Alpha", chapterDefinitionId: "ch-1" });

vi.mock("@/content/chapters", () => ({
  chapterRegistry: [makeChapter({ id: "ch-1", title: "Chapter One" })],
}));

const findEntryMock = vi.fn((_courseId: string, slug: string) => (slug === "a" ? entryA : undefined));
vi.mock("@/curriculum", () => ({
  findEntry: (courseId: string, slug: string) => findEntryMock(courseId, slug),
  // No test in this file asserts on "Next chapter" (see NextChapterLink.test.tsx
  // for that) - undefined keeps it a no-op so it doesn't affect this file's DOM.
  nextEntry: () => undefined,
}));

vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      validationPassedDefinitionIds: new Set<string>(),
      rowsBySlug: new Map(),
      examAttemptsByDefinition: new Map(),
    }),
}));

const routerPushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const { ChapterSidebar } = await import("./ChapterSidebar");

beforeEach(() => {
  routerPushMock.mockClear();
});

function renderSidebar(
  overrides: {
    validationOutcome?: ChapterOutcome | null;
    isValidationStale?: boolean;
    submitOutcome?: ChapterOutcome | null;
    isSubmitStale?: boolean;
  } = {},
) {
  return render(
    <CanvasStoreProvider>
      <ChapterSidebar
        courseId="building-blocks"
        chapterSlug="a"
        validationOutcome={overrides.validationOutcome ?? null}
        isValidationStale={overrides.isValidationStale ?? false}
        displayViolations={overrides.validationOutcome?.violations ?? null}
        submitOutcome={overrides.submitOutcome ?? null}
        isSubmitStale={overrides.isSubmitStale ?? false}
      />
    </CanvasStoreProvider>,
  );
}

describe("ChapterSidebar", () => {
  it("renders QuestionPane for the chapter the route slug resolves to", async () => {
    renderSidebar();
    // QuestionPane is next/dynamic-loaded (see ChapterSidebar.tsx) - findBy
    // waits out that chunk resolution instead of asserting synchronously.
    expect(await screen.findByRole("heading", { name: "Chapter One" })).toBeInTheDocument();
  });

  it("renders nothing when the slug resolves to no ChapterDefinition", () => {
    const { container } = render(
      <CanvasStoreProvider>
        <ChapterSidebar
          courseId="building-blocks"
          chapterSlug="does-not-exist"
          validationOutcome={null}
          isValidationStale={false}
          displayViolations={null}
          submitOutcome={null}
          isSubmitStale={false}
        />
      </CanvasStoreProvider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("shows QuestionPane's 'Not yet validated' when isValidationStale is true even with prior violations", async () => {
    renderSidebar({
      isValidationStale: true,
      validationOutcome: makeOutcome({
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
    expect(await screen.findByText(/not yet validated/i)).toBeInTheDocument();
  });

  it("links back to the chapter's Reader, not a curriculum browser", () => {
    renderSidebar();
    const link = screen.getByRole("link", { name: /back to lesson/i });
    expect(link).toHaveAttribute("href", "/building-blocks/a/lesson");
    expect(screen.queryByRole("button", { name: /curriculum/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /learning path/i })).not.toBeInTheDocument();
  });
});
