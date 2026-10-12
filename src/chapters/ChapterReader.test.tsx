// ChapterReader's markVisited effect writes Dexie on mount (signed-in is the
// setup file's default), so the store needs a real IndexedDB backend here.
import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterReader } from "./ChapterReader";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { CurriculumChapter, Course } from "@/curriculum/types";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

vi.mock("./ReaderSidebar", () => ({ ReaderSidebar: () => null }));
vi.mock("./ReadingProgress", () => ({ ReadingProgress: () => null }));
vi.mock("./TableOfContents", () => ({ TableOfContents: () => null }));
vi.mock("./YourTurnCard", () => ({
  YourTurnCard: ({ chapter, mode, chapterSlug }: { chapter: { id: string }; mode: string; chapterSlug: string }) => (
    <div data-testid="your-turn-card" data-chapter-id={chapter.id} data-mode={mode} data-chapter-slug={chapterSlug} />
  ),
}));
vi.mock("@/app/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/home/HomeHeader", () => ({ HomeHeader: () => null }));
vi.mock("@/canvas/docs-panel/markdown/MarkdownRenderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

const {
  mainChapter,
  placeholderChapter,
  freshMarkdownChapter,
  nextSectionChapter,
  noEditorExerciseChapter,
  entriesBySlug,
  targetEntry,
} = vi.hoisted(() => {
  const targetEntry = {
    slug: "target",
    number: "2.3",
    title: "Target Chapter",
    kind: "chapter" as const,
    chapterDefinitionId: "ch-target",
    estimatedMinutes: 30,
    difficulty: "intermediate" as const,
    prerequisiteSlugs: ["prereq-authored", "prereq-unauthored"],
    domain: "Messaging" as string | null,
  };
  const authoredPrereq = {
    slug: "prereq-authored",
    number: "1.1",
    title: "Prereq One",
    kind: "chapter" as const,
    chapterDefinitionId: "ch-prereq",
    estimatedMinutes: 20,
    difficulty: "foundational" as const,
    prerequisiteSlugs: [] as string[],
    domain: null as string | null,
  };
  const unauthoredPrereq = {
    slug: "prereq-unauthored",
    number: "1.2",
    title: "Prereq Two",
    kind: "chapter" as const,
    chapterDefinitionId: null,
    estimatedMinutes: 15,
    difficulty: "foundational" as const,
    prerequisiteSlugs: [] as string[],
    domain: null as string | null,
  };
  const baseChapter = {
    mode: "real-world-extraction" as const,
    title: "Target Chapter",
    problemStatement: "Problem",
    learningObjectives: [] as string[],
    availableComponentIds: [] as string[],
    requiredComponentIds: [] as string[],
    validationRuleIds: [] as string[],
    blueprints: [] as ChapterDefinition["blueprints"],
    hints: [] as ChapterDefinition["hints"],
    readingLinks: [] as ChapterDefinition["readingLinks"],
  };
  const mainChapter = { ...baseChapter, id: "ch-target" };
  const placeholderChapter = { ...baseChapter, id: "ch-placeholder", title: "Draft Chapter", placeholder: true };
  const freshMarkdownChapter = { ...baseChapter, id: "ch-fresh-markdown", title: "Fresh Markdown Chapter" };
  const nextSectionChapter = { ...baseChapter, id: "ch-next-section", title: "Next Section Chapter" };
  const noEditorExerciseChapter = {
    ...baseChapter,
    id: "ch-no-editor-exercise",
    title: "No Editor Exercise Chapter",
    hasEditorExercise: false,
  };

  const placeholderEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "placeholder-slug",
    chapterDefinitionId: "ch-placeholder",
  };
  const orphanedDefinitionEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "orphaned-definition-slug",
    chapterDefinitionId: "no-such-chapter-in-registry",
  };
  const crossCourseEntry: CurriculumChapter = { ...targetEntry, slug: "cross-course-slug", prerequisiteSlugs: ["bb-checkpoint"] };
  const noNumberEntry: CurriculumChapter = { ...targetEntry, slug: "no-number-slug", number: null };
  const missingPrereqEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "missing-prereq-slug",
    prerequisiteSlugs: ["truly-missing-slug"],
  };
  const freshMarkdownEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "fresh-markdown-slug",
    chapterDefinitionId: "ch-fresh-markdown",
  };
  const nextSectionEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "next-section-slug",
    chapterDefinitionId: "ch-next-section",
  };
  const noEditorExerciseEntry: CurriculumChapter = {
    ...targetEntry,
    slug: "no-editor-exercise-slug",
    chapterDefinitionId: "ch-no-editor-exercise",
  };

  return {
    mainChapter,
    placeholderChapter,
    freshMarkdownChapter,
    nextSectionChapter,
    noEditorExerciseChapter,
    targetEntry,
    entriesBySlug: {
      target: targetEntry,
      "prereq-authored": authoredPrereq,
      "prereq-unauthored": unauthoredPrereq,
      "placeholder-slug": placeholderEntry,
      "orphaned-definition-slug": orphanedDefinitionEntry,
      "no-number-slug": noNumberEntry,
      "cross-course-slug": crossCourseEntry,
      "missing-prereq-slug": missingPrereqEntry,
      "fresh-markdown-slug": freshMarkdownEntry,
      "next-section-slug": nextSectionEntry,
      "no-editor-exercise-slug": noEditorExerciseEntry,
    } as Record<string, CurriculumChapter>,
  };
});

vi.mock("@/content/chapters", () => ({
  chapterRegistry: [mainChapter, placeholderChapter, freshMarkdownChapter, nextSectionChapter, noEditorExerciseChapter],
}));

vi.mock("@/curriculum", () => ({
  getCourse: (id = "real-world-extraction"): Course => ({
    id: id as Course["id"],
    title: id === "building-blocks" ? "Building Blocks" : "Real World Extraction",
    subtitle: "",
    sections: [],
  }),
  findEntry: (_mode: string, slug: string) => entriesBySlug[slug],
  // No test in this file asserts on "Next chapter" (see NextChapterLink.test.tsx
  // for that) - undefined keeps it a no-op so it doesn't affect this file's DOM.
  nextEntry: () => undefined,
  previousEntry: () => undefined,
  findSection: () => undefined,
  locateEntry: (slug: string) =>
    slug === "bb-checkpoint"
      ? { courseId: "building-blocks", entry: { ...entriesBySlug["prereq-authored"], slug, number: null, title: "R1 Checkpoint" } }
      : entriesBySlug[slug]
        ? { courseId: "real-world-extraction", entry: entriesBySlug[slug] }
        : undefined,
  allEntries: () => [],
}));

describe("ChapterReader - prerequisite and domain tags", () => {
  // ChapterReader now fetches its own lesson markdown (useMarkdownFile) —
  // stub fetch to 404 so it falls back to chapter.problemStatement rather
  // than hitting a real, unparseable relative URL in the test environment.
  // These tests only assert on the domain/prerequisite chrome around the
  // markdown body, not its content, so the fallback is fine.
  function stubFetchNotFound() {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 }),
    );
  }

  it("renders the domain badge for an RWE chapter with a domain", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="target" />);
    expect(screen.getByText("Messaging")).toBeInTheDocument();
  });

  it("renders an authored prerequisite as a link to its lesson, and an unauthored one as a plain chip", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="target" />);
    const authoredLink = screen.getByRole("link", { name: /1\.1 Prereq One/i });
    expect(authoredLink).toHaveAttribute("href", "/real-world-extraction/prereq-authored/lesson");
    expect(screen.getByText("1.2 Prereq Two")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /1\.2 Prereq Two/i })).not.toBeInTheDocument();
  });

  it("renders neither section when there are no prerequisites or domain", () => {
    stubFetchNotFound();
    const bareEntry: CurriculumChapter = { ...targetEntry, slug: "bare", prerequisiteSlugs: [], domain: null };
    entriesBySlug.bare = bareEntry;
    render(<ChapterReader mode="real-world-extraction" chapterSlug="bare" />);
    expect(screen.queryByText(/prerequisites/i)).not.toBeInTheDocument();
  });

  it("shows the chapter number, time estimate, and what the chapter ends with", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="target" />);
    expect(screen.getByRole("heading", { level: 1, name: "Target Chapter" })).toBeInTheDocument();
    expect(screen.getAllByText("2.3").length).toBeGreaterThan(0);
    expect(screen.getByText(/~30 min/)).toBeInTheDocument();
    expect(screen.getByText("Design exercise")).toBeInTheDocument();
  });

  it("renders nothing for an unknown chapter slug", () => {
    stubFetchNotFound();
    const { container } = render(<ChapterReader mode="real-world-extraction" chapterSlug="no-such-slug" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a curriculum entry with no authored chapter yet", () => {
    stubFetchNotFound();
    entriesBySlug["unauthored-slug"] = { ...targetEntry, slug: "unauthored-slug", chapterDefinitionId: null };
    const { container } = render(<ChapterReader mode="real-world-extraction" chapterSlug="unauthored-slug" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the entry's chapterDefinitionId has no registry match", () => {
    stubFetchNotFound();
    const { container } = render(
      <ChapterReader mode="real-world-extraction" chapterSlug="orphaned-definition-slug" />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("omits the number prefix for an entry with no number", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="no-number-slug" />);
    expect(screen.getByText("Real World Extraction")).toBeInTheDocument();
    expect(screen.queryByText(/·/)).not.toBeInTheDocument();
  });

  it("shows a Draft badge for a placeholder chapter", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="placeholder-slug" />);
    expect(screen.getByText("Draft")).toBeInTheDocument();
  });

  it("links a prerequisite from the other course, naming that course", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="cross-course-slug" />);
    expect(screen.getByRole("link", { name: "R1 Checkpoint (Building Blocks)" })).toHaveAttribute(
      "href",
      "/building-blocks/bb-checkpoint/lesson",
    );
  });

  it("drops the prerequisites row when no slug resolves", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="missing-prereq-slug" />);
    expect(screen.queryByText("Prerequisites")).not.toBeInTheDocument();
    expect(screen.queryByText(/truly-missing-slug/)).not.toBeInTheDocument();
  });

  it("renders fetched lesson markdown instead of falling back to the problem statement", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("Fresh fetched lesson body") }),
    );
    render(<ChapterReader mode="real-world-extraction" chapterSlug="fresh-markdown-slug" />);
    expect(await screen.findByText("Fresh fetched lesson body")).toBeInTheDocument();
    expect(screen.queryByText("Problem")).not.toBeInTheDocument();
  });

  it("renders the Your turn card with the current chapter, mode, and slug", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="target" />);
    const card = screen.getByTestId("your-turn-card");
    expect(card).toHaveAttribute("data-chapter-id", "ch-target");
    expect(card).toHaveAttribute("data-mode", "real-world-extraction");
    expect(card).toHaveAttribute("data-chapter-slug", "target");
  });

  it("renders the Next section after knowledge check and design exercise", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Before\n\nContent\n\n## Next\n\nNext chapter preview") }),
    );
    render(<ChapterReader mode="real-world-extraction" chapterSlug="next-section-slug" />);

    const content = await screen.findByText(/Content/);
    const nextHeading = screen.getByText(/Next chapter preview/);
    expect(content.compareDocumentPosition(nextHeading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the Your turn card for a chapter with hasEditorExercise: false too (the card itself decides what to show)", () => {
    stubFetchNotFound();
    render(<ChapterReader mode="real-world-extraction" chapterSlug="no-editor-exercise-slug" />);
    expect(screen.getByTestId("your-turn-card")).toHaveAttribute("data-chapter-id", "ch-no-editor-exercise");
  });
});
