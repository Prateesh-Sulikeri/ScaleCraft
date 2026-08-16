import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { QuestionPane } from "./QuestionPane";
import { chapterDisplayViolations } from "./chapter-outcome-violations";
import { CanvasStoreProvider, useCanvasStoreApi } from "@/canvas/store";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { ChapterDefinition, Hint, Blueprint, QuizQuestion } from "@/content/chapters/types";
import type { ChapterOutcome } from "@/validation-engine/chapter-outcome";
import type { BlueprintDriftReport } from "@/validation-engine/blueprint-drift";
import type { ValidationViolation } from "@/validation-engine/types";
import type { ComponentNodeType } from "@/canvas/types";
import type { CurriculumChapter } from "@/curriculum/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function makeEntry(overrides: Partial<CurriculumChapter> = {}): CurriculumChapter {
  return {
    slug: "1-2-load-balancing",
    number: "1.2",
    title: "Load Balancing",
    kind: "chapter",
    chapterDefinitionId: "ch-1",
    estimatedMinutes: 35,
    difficulty: "foundational",
    prerequisiteSlugs: [],
    domain: null,
    ...overrides,
  };
}

// Deliberately returns a full ChapterOutcome — it's a structural superset of
// ChapterValidationOutcome, so the same fixture works for both the
// `validationOutcome` and `submitOutcome` props below.
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

function makeDrift(overrides: Partial<BlueprintDriftReport> = {}): BlueprintDriftReport {
  return {
    blueprintId: "bp-1",
    blueprintLabel: "The taught approach",
    missingComponents: [],
    extraComponentIds: [],
    mismatchedConnections: [],
    ...overrides,
  };
}

function makeChapter(overrides: Partial<ChapterDefinition> = {}): ChapterDefinition {
  return {
    id: "ch-1",
    mode: "building-blocks",
    title: "Load Balancing 101",
    problemStatement: "Balance the load across servers.",
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

const hint: Hint = { id: "hint-1", body: "Try adding a load balancer." };

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    kind: "single",
    difficulty: 1,
    prompt: "What is a load balancer for?",
    options: [{ id: "a", label: "Distributes traffic", explanationMd: "Correct.", correct: true }],
    ...overrides,
  };
}

beforeEach(() => {
  useCurriculumProgressStore.setState({ examAttemptsByDefinition: new Map() });
});

/** Seeds the shared canvas store with component nodes before rendering
 * QuestionPane inside it — QuestionPane reads `nodes` via useCanvasStore to
 * compute the required-components progress line. */
function Harness({
  chapter,
  nodes,
  entry = makeEntry(),
  status = "NOT_STARTED",
  validationOutcome = null,
  isValidationStale = false,
  submitOutcome = null,
  isSubmitStale = false,
}: {
  chapter: ChapterDefinition;
  nodes: ComponentNodeType[];
  entry?: CurriculumChapter;
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  validationOutcome?: ChapterOutcome | null;
  isValidationStale?: boolean;
  submitOutcome?: ChapterOutcome | null;
  isSubmitStale?: boolean;
}) {
  const storeApi = useCanvasStoreApi();
  storeApi.setState({ nodes });
  // Mirrors ChapterWorkspace's own wiring exactly (validate-scoped: no drift
  // report) rather than hand-building a list, so these tests can't drift from
  // what the header actually counts — the mismatch that produced punch list
  // item #3 in the first place.
  const displayViolations = validationOutcome
    ? chapterDisplayViolations({ ...validationOutcome, driftReport: null }, nodes)
    : null;
  return (
    <QuestionPane
      chapter={chapter}
      entry={entry}
      status={status}
      validationOutcome={validationOutcome}
      isValidationStale={isValidationStale}
      displayViolations={displayViolations}
      submitOutcome={submitOutcome}
      isSubmitStale={isSubmitStale}
    />
  );
}

function renderQuestionPane(props: Parameters<typeof Harness>[0]) {
  return render(
    <CanvasStoreProvider>
      <Harness {...props} />
    </CanvasStoreProvider>,
  );
}

describe("QuestionPane", () => {
  it("renders the chapter title, problem statement, and learning objectives", () => {
    const chapter = makeChapter({ learningObjectives: ["Understand round robin"] });
    renderQuestionPane({ chapter, nodes: [] });

    expect(screen.getByRole("heading", { name: "Load Balancing 101" })).toBeInTheDocument();
    expect(screen.getByText("Balance the load across servers.")).toBeInTheDocument();
    expect(screen.getByText("Understand round robin")).toBeInTheDocument();
  });

  it("omits the learning objectives section entirely when there are none", () => {
    renderQuestionPane({ chapter: makeChapter({ learningObjectives: [] }), nodes: [] });
    expect(screen.queryByText(/learning objectives/i)).not.toBeInTheDocument();
  });

  it("computes required-components progress from the live canvas nodes", () => {
    const chapter = makeChapter({ requiredComponentIds: ["client", "load-balancer", "app-server"] });
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
      { id: "n2", type: "component", position: { x: 0, y: 0 }, data: { componentId: "load-balancer", config: {} } },
    ];
    renderQuestionPane({ chapter, nodes });

    expect(screen.getByText(/2 \/ 3 required components present/)).toBeInTheDocument();
  });

  it("does not double-count two nodes of the same required component", () => {
    const chapter = makeChapter({ requiredComponentIds: ["client", "app-server"] });
    const nodes: ComponentNodeType[] = [
      { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
      { id: "n2", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
    ];
    renderQuestionPane({ chapter, nodes });

    expect(screen.getByText(/1 \/ 2 required components present/)).toBeInTheDocument();
  });

  it("omits the required-components line entirely when the chapter requires none", () => {
    renderQuestionPane({ chapter: makeChapter({ requiredComponentIds: [] }), nodes: [] });
    expect(screen.queryByText(/required components present/)).not.toBeInTheDocument();
  });

  describe("validation summary line (Validate-driven, never mentions blueprints)", () => {
    const chapter = makeChapter({ requiredComponentIds: ["client"] });

    it("reads 'Not yet validated' when validationOutcome is null", () => {
      renderQuestionPane({ chapter, nodes: [], validationOutcome: null, isValidationStale: false });
      expect(screen.getByText(/not yet validated/i)).toBeInTheDocument();
    });

    it("reads 'Not yet validated' when results are stale, even if a prior outcome exists", () => {
      const violations: ValidationViolation[] = [
        {
          ruleId: "r1",
          severity: "error",
          message: "Bad",
          explanation: "Because reasons.",
          offendingNodeIds: [],
          offendingEdgeIds: [],
        },
      ];
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ violations, errorCount: 1 }),
        isValidationStale: true,
      });
      expect(screen.getByText(/not yet validated/i)).toBeInTheDocument();
    });

    it("reads 'passing' when the outcome has zero violations and is not stale, even for a chapter with blueprints", () => {
      const bp: Blueprint = { id: "bp-1", label: "The taught approach", require: { nodes: [] }, commentary: "" };
      const chapterWithBlueprint = makeChapter({ requiredComponentIds: ["client"], blueprints: [bp] });
      renderQuestionPane({
        chapter: chapterWithBlueprint,
        nodes: [],
        validationOutcome: makeOutcome({ passed: true }),
        isValidationStale: false,
      });
      // Validate never checks blueprints — a clean rules-only result reads
      // "passing" regardless of whether the chapter declares any.
      expect(screen.getByText(/last validated: passing/i)).toBeInTheDocument();
    });

    it("reads 'not yet complete - see Submit' when Validate is clean but Submit found a blueprint drift", () => {
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ passed: true }),
        submitOutcome: makeOutcome({ passed: false, driftReport: makeDrift() }),
      });

      expect(screen.queryByText(/last validated: passing/i)).not.toBeInTheDocument();
      const summary = screen.getByText(/not yet complete - see submit for details/i);
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveClass("text-state-warning");
    });

    it("ignores a stale submitOutcome when deciding the allowed-but-not-correct warning", () => {
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ passed: true }),
        submitOutcome: makeOutcome({ passed: false, driftReport: makeDrift() }),
        isSubmitStale: true,
      });

      // The graph changed since that Submit ran — its drift report no
      // longer describes the current canvas, so it must not gate the
      // summary line.
      expect(screen.getByText(/last validated: passing/i)).toBeInTheDocument();
    });

    it("counts a disconnected required component as an issue, matching the header exactly", () => {
      // Punch list #3: outcome.violations (raw rule violations) is empty
      // here, so counting it made the sidebar read "Last validated: 1 issue"
      // while the header read "2 ISSUES" on the very same run. The
      // disconnected-required-component reason exists only in the merged
      // display list, which is now what both surfaces count.
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ passed: false, disconnectedRequiredComponentIds: ["client"] }),
        isValidationStale: false,
      });

      expect(screen.queryByText(/last validated: passing/i)).not.toBeInTheDocument();
      const summary = screen.getByText(/last validated: 1 issue$/i);
      expect(summary).toBeInTheDocument();
      expect(summary).toHaveClass("text-state-warning");
    });

    it("counts rule violations and synthesised required-component issues together", () => {
      // The exact shape of the reported mismatch: one real rule violation
      // plus one missing required component reads as two issues, not one.
      const violations: ValidationViolation[] = [
        {
          ruleId: "r1",
          severity: "error",
          message: "Bad",
          explanation: "Because reasons.",
          offendingNodeIds: [],
          offendingEdgeIds: [],
        },
      ];
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({
          passed: false,
          violations,
          errorCount: 1,
          missingRequiredComponentIds: ["client"],
        }),
        isValidationStale: false,
      });

      expect(screen.getByText(/last validated: 2 issues/i)).toBeInTheDocument();
    });

    it("pluralizes the issue count correctly for one issue", () => {
      const violations: ValidationViolation[] = [
        {
          ruleId: "r1",
          severity: "error",
          message: "Bad",
          explanation: "Because reasons.",
          offendingNodeIds: [],
          offendingEdgeIds: [],
        },
      ];
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ violations, errorCount: 1 }),
        isValidationStale: false,
      });
      expect(screen.getByText(/last validated: 1 issue$/i)).toBeInTheDocument();
    });

    it("pluralizes the issue count correctly for multiple issues", () => {
      const violation: ValidationViolation = {
        ruleId: "r1",
        severity: "error",
        message: "Bad",
        explanation: "Because reasons.",
        offendingNodeIds: [],
        offendingEdgeIds: [],
      };
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ violations: [violation, violation], errorCount: 2 }),
        isValidationStale: false,
      });
      expect(screen.getByText(/last validated: 2 issues/i)).toBeInTheDocument();
    });
  });

  describe("required-components count, Validate-driven", () => {
    it("falls back to a live presence-only count before the first Validate click", () => {
      const chapter = makeChapter({ requiredComponentIds: ["client", "load-balancer"] });
      const nodes: ComponentNodeType[] = [
        { id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
      ];
      renderQuestionPane({ chapter, nodes, validationOutcome: null });
      expect(screen.getByText(/1 \/ 2 required components present$/)).toBeInTheDocument();
    });

    it("upgrades to a present-and-connected count once a fresh outcome exists", () => {
      const chapter = makeChapter({ requiredComponentIds: ["client", "load-balancer"] });
      renderQuestionPane({
        chapter,
        nodes: [],
        validationOutcome: makeOutcome({ disconnectedRequiredComponentIds: ["load-balancer"] }),
      });
      expect(screen.getByText(/1 \/ 2 required components present and connected/)).toBeInTheDocument();
    });
  });

  describe("completion and Debrief (Submit-driven only)", () => {
    const blueprintA: Blueprint = {
      id: "bp-a",
      label: "Cache-aside",
      require: { nodes: [] },
      commentary: "Reads check the cache first.",
    };
    const blueprintB: Blueprint = {
      id: "bp-b",
      label: "Queue-based",
      require: { nodes: [] },
      commentary: "Writes go through a queue.",
    };

    it("shows no completion line or Debrief when the submit outcome has not passed", () => {
      const chapter = makeChapter({ blueprints: [blueprintA] });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: false }) });
      expect(screen.queryByText(/chapter complete/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/debrief/i)).not.toBeInTheDocument();
    });

    it("shows no completion line even when Validate alone is clean — only Submit can mark a chapter complete", () => {
      const chapter = makeChapter({ blueprints: [blueprintA] });
      renderQuestionPane({ chapter, nodes: [], validationOutcome: makeOutcome({ passed: true }), submitOutcome: null });
      expect(screen.queryByText(/chapter complete/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/debrief/i)).not.toBeInTheDocument();
    });

    it("shows a plain completion line and a closed-by-default Debrief once Submit passes", () => {
      const chapter = makeChapter({ blueprints: [blueprintA, blueprintB] });
      renderQuestionPane({
        chapter,
        nodes: [],
        submitOutcome: makeOutcome({ passed: true, matchedBlueprintId: "bp-a" }),
      });

      expect(screen.getByText(/chapter complete/i)).toBeInTheDocument();
      const debriefButton = screen.getByRole("button", { name: /debrief/i });
      expect(debriefButton).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText(blueprintA.commentary)).not.toBeInTheDocument();

      fireEvent.click(debriefButton);
      expect(screen.getByText(blueprintA.commentary)).toBeInTheDocument();
      expect(screen.getByText(blueprintB.commentary)).toBeInTheDocument();
      expect(screen.getByText(/your approach/i)).toBeInTheDocument();
    });

    it("omits the Debrief entirely when the chapter declares no blueprints", () => {
      const chapter = makeChapter({ blueprints: [] });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: true }) });
      expect(screen.getByText(/chapter complete/i)).toBeInTheDocument();
      expect(screen.queryByText(/debrief/i)).not.toBeInTheDocument();
    });

    it("hides the completion line once the submit outcome goes stale", () => {
      const chapter = makeChapter({ blueprints: [blueprintA] });
      renderQuestionPane({
        chapter,
        nodes: [],
        submitOutcome: makeOutcome({ passed: true, matchedBlueprintId: "bp-a" }),
        isSubmitStale: true,
      });
      expect(screen.queryByText(/chapter complete/i)).not.toBeInTheDocument();
    });
  });

  describe("'Knowledge check remaining' note (exam-mode, Submit-driven)", () => {
    it("shows the note when Submit passed but the chapter's exam isn't passed yet", () => {
      const chapter = makeChapter({ id: "ch-1", quiz: [makeQuestion({ id: "q1" }), makeQuestion({ id: "q2" })] });
      useCurriculumProgressStore.setState({
        examAttemptsByDefinition: new Map([
          ["ch-1", [{ chapterDefinitionId: "ch-1", attemptNumber: 1, submittedAt: Date.now(), score: 50, answers: [], dirty: false, syncedAt: null }]],
        ]),
      });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: true }) });

      expect(screen.getByText("Knowledge check remaining.")).toBeInTheDocument();
    });

    it("omits the note once the exam is passed", () => {
      const chapter = makeChapter({ id: "ch-1", quiz: [makeQuestion({ id: "q1" })] });
      useCurriculumProgressStore.setState({
        examAttemptsByDefinition: new Map([
          ["ch-1", [{ chapterDefinitionId: "ch-1", attemptNumber: 1, submittedAt: Date.now(), score: 80, answers: [], dirty: false, syncedAt: null }]],
        ]),
      });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: true }) });

      expect(screen.queryByText("Knowledge check remaining.")).not.toBeInTheDocument();
    });

    it("omits the note when the chapter has no quiz at all", () => {
      const chapter = makeChapter({ id: "ch-1", quiz: undefined });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: true }) });

      expect(screen.queryByText("Knowledge check remaining.")).not.toBeInTheDocument();
    });

    it("omits the note when Submit hasn't passed, even with an unmastered quiz", () => {
      const chapter = makeChapter({ id: "ch-1", quiz: [makeQuestion({ id: "q1" })] });
      renderQuestionPane({ chapter, nodes: [], submitOutcome: makeOutcome({ passed: false }) });

      expect(screen.queryByText("Knowledge check remaining.")).not.toBeInTheDocument();
    });
  });

  describe("hints (never auto-surfaced)", () => {
    it("renders a 'Show hint' disclosure, not the hint body, until the user reveals it", () => {
      renderQuestionPane({ chapter: makeChapter({ hints: [hint] }), nodes: [] });

      expect(screen.getByRole("button", { name: /show hint/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /show hint/i })).toHaveAttribute("aria-expanded", "false");
      expect(screen.queryByText(hint.body)).not.toBeInTheDocument();
    });

    it("reveals the hint body only after an explicit click, and stays revealed", () => {
      renderQuestionPane({ chapter: makeChapter({ hints: [hint] }), nodes: [] });

      fireEvent.click(screen.getByRole("button", { name: /show hint/i }));

      expect(screen.getByText(hint.body)).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /show hint/i })).not.toBeInTheDocument();
    });

    it("omits the Hints section entirely when the chapter has none", () => {
      renderQuestionPane({ chapter: makeChapter({ hints: [] }), nodes: [] });
      expect(screen.queryByText(/hints/i)).not.toBeInTheDocument();
    });

    it("reveals multiple hints independently of each other", () => {
      const hint2: Hint = { id: "hint-2", body: "Second hint body." };
      renderQuestionPane({ chapter: makeChapter({ hints: [hint, hint2] }), nodes: [] });

      const showButtons = screen.getAllByRole("button", { name: /show hint/i });
      expect(showButtons).toHaveLength(2);

      fireEvent.click(showButtons[0]);
      expect(screen.getByText(hint.body)).toBeInTheDocument();
      // The second hint must still be collapsed — revealing one must not
      // auto-reveal the other.
      expect(screen.getByRole("button", { name: /show hint/i })).toBeInTheDocument();
      expect(screen.queryByText(hint2.body)).not.toBeInTheDocument();
    });
  });

  it("renders reading links with target=_blank and rel=noreferrer", () => {
    renderQuestionPane({
      chapter: makeChapter({ readingLinks: [{ label: "Load Balancing Primer", url: "https://example.com/lb" }] }),
      nodes: [],
    });

    const link = screen.getByRole("link", { name: "Load Balancing Primer" });
    expect(link).toHaveAttribute("href", "https://example.com/lb");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("omits the Further reading section entirely when there are no links", () => {
    renderQuestionPane({ chapter: makeChapter({ readingLinks: [] }), nodes: [] });
    expect(screen.queryByText(/further reading/i)).not.toBeInTheDocument();
  });

  it("shows the entry's difficulty and the current status next to the title", () => {
    renderQuestionPane({
      chapter: makeChapter(),
      nodes: [],
      entry: makeEntry({ difficulty: "advanced" }),
      status: "IN_PROGRESS",
    });
    expect(screen.getByText("advanced")).toBeInTheDocument();
    expect(screen.getByText("In progress")).toBeInTheDocument();
  });
});
