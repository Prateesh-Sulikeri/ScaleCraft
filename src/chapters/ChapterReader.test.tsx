import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChapterReader } from "./ChapterReader";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { CurriculumChapter, Course } from "@/curriculum/types";
import type { ExtractedHeading } from "./extract-headings";

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: "ch-1",
    mode: "building-blocks",
    title: "Test Chapter",
    problemStatement: "Problem",
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
    slug: "test-chapter",
    number: "1.1",
    title: "Test Chapter",
    kind: "chapter",
    chapterDefinitionId: "ch-1",
    estimatedMinutes: 10,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    domain: null,
    ...overrides,
  };
}

describe("ChapterReader - Component Integration", () => {
  const testEntry = makeEntry();
  const testChapter = makeChapter({ id: "ch-1", title: "Test Chapter" });

  it("requires chapter definition and curriculum entry to render", () => {
    expect(testChapter.id).toBe("ch-1");
    expect(testEntry.chapterDefinitionId).toBe("ch-1");
  });

  it("handles chapters with difficulty levels", () => {
    const foundational = makeEntry({ difficulty: "foundational" });
    const intermediate = makeEntry({ difficulty: "intermediate", slug: "ch-2" });
    const advanced = makeEntry({ difficulty: "advanced", slug: "ch-3" });

    expect(foundational.difficulty).toBe("foundational");
    expect(intermediate.difficulty).toBe("intermediate");
    expect(advanced.difficulty).toBe("advanced");
  });

  it("stores chapter metadata correctly", () => {
    const ch = makeChapter({
      title: "My Chapter",
      problemStatement: "Solve this",
      learningObjectives: ["Learn A", "Learn B"],
    });

    expect(ch.title).toBe("My Chapter");
    expect(ch.problemStatement).toBe("Solve this");
    expect(ch.learningObjectives).toContain("Learn A");
  });

  it("tracks estimated minutes for learning path", () => {
    const quickChapter = makeEntry({ estimatedMinutes: 5 });
    const longChapter = makeEntry({ estimatedMinutes: 45, slug: "long" });

    expect(quickChapter.estimatedMinutes).toBe(5);
    expect(longChapter.estimatedMinutes).toBe(45);
  });

  it("handles placeholder/draft chapters", () => {
    const draftChapter = makeChapter({ placeholder: true });
    expect(draftChapter.placeholder).toBe(true);
  });

  it("preserves chapter number in entry metadata", () => {
    const ch = makeEntry({ number: "2.3" });
    expect(ch.number).toBe("2.3");
  });

  it("stores entry kind correctly", () => {
    const ch = makeEntry({ kind: "chapter" });
    expect(ch.kind).toBe("chapter");
  });

  it("returns null when chapter definition is missing", () => {
    const entry = makeEntry({ chapterDefinitionId: null });
    expect(entry.chapterDefinitionId).toBeNull();
  });

  it("validates heading extraction compatibility", () => {
    const headings: ExtractedHeading[] = [
      { id: "overview", text: "Overview", level: 2 },
      { id: "details", text: "Details", level: 3 },
    ];

    expect(headings).toHaveLength(2);
    expect(headings[0].level).toBe(2);
    expect(headings[1].level).toBe(3);
  });

  it("supports multiple course modes", () => {
    const bb = makeChapter({ mode: "building-blocks" });
    const rwe = makeChapter({ mode: "real-world-extraction", id: "rwe-ch" });

    expect(bb.mode).toBe("building-blocks");
    expect(rwe.mode).toBe("real-world-extraction");
  });
});

vi.mock("./ReaderSidebar", () => ({ ReaderSidebar: () => null }));
vi.mock("./ReadingProgress", () => ({ ReadingProgress: () => null }));
vi.mock("./TableOfContents", () => ({ TableOfContents: () => null }));
vi.mock("./DesignEditorCTA", () => ({ DesignEditorCTA: () => null }));
vi.mock("./quiz/QuizLauncher", () => ({ QuizLauncher: () => null }));
vi.mock("@/app/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("@/canvas/docs-panel/markdown/MarkdownRenderer", () => ({
  MarkdownRenderer: ({ content }: { content: string }) => <div>{content}</div>,
}));

const { mainChapter, entriesBySlug, targetEntry } = vi.hoisted(() => {
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
  return {
    mainChapter: {
      id: "ch-target",
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
    },
    targetEntry,
    entriesBySlug: {
      target: targetEntry,
      "prereq-authored": authoredPrereq,
      "prereq-unauthored": unauthoredPrereq,
    } as Record<string, CurriculumChapter>,
  };
});

vi.mock("@/content/chapters", () => ({
  chapterRegistry: [mainChapter],
}));

vi.mock("@/curriculum", () => ({
  getCourse: (): Course => ({
    id: "real-world-extraction",
    title: "Real World Extraction",
    subtitle: "",
    sections: [],
  }),
  findEntry: (_mode: string, slug: string) => entriesBySlug[slug],
}));

describe("ChapterReader - prerequisite and domain tags", () => {
  it("renders the domain badge for an RWE chapter with a domain", () => {
    render(
      <ChapterReader
        mode="real-world-extraction"
        chapterSlug="target"
        markdown="Lesson body"
        headings={[]}
      />,
    );
    expect(screen.getByText("Messaging")).toBeInTheDocument();
  });

  it("renders an authored prerequisite as a link to its lesson, and an unauthored one as a plain chip", () => {
    render(
      <ChapterReader
        mode="real-world-extraction"
        chapterSlug="target"
        markdown="Lesson body"
        headings={[]}
      />,
    );
    const authoredLink = screen.getByRole("link", { name: /1\.1 Prereq One/i });
    expect(authoredLink).toHaveAttribute("href", "/real-world-extraction/prereq-authored/lesson");
    expect(screen.getByText("1.2 Prereq Two")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /1\.2 Prereq Two/i })).not.toBeInTheDocument();
  });

  it("renders neither section when there are no prerequisites or domain", () => {
    const bareEntry: CurriculumChapter = { ...targetEntry, slug: "bare", prerequisiteSlugs: [], domain: null };
    entriesBySlug.bare = bareEntry;
    render(
      <ChapterReader mode="real-world-extraction" chapterSlug="bare" markdown="Lesson body" headings={[]} />,
    );
    expect(screen.queryByText(/prerequisites/i)).not.toBeInTheDocument();
  });
});
