import "fake-indexeddb/auto";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { CurriculumChapter } from "@/curriculum/types";
import type { ValidationViolation } from "@/validation-engine/types";
import { db, chapterSaveId } from "@/persistence/db";
import { AUTOSAVE_DEBOUNCE_MS } from "@/persistence/use-autosave";

// ---------------------------------------------------------------------------
// Mocks for everything ChapterWorkspace.tsx pulls in from OUTSIDE this task's
// scope (src/chapters + src/components/ui). None of these files are modified
// — this only stubs their exports for this test file, per the "only touch
// src/chapters and src/components/ui" boundary. ChapterSidebar/ChapterList/
// QuestionPane are deliberately left real (in-scope, already covered by
// their own test files) so this suite exercises the real chapter-selection
// wiring, not a mock of it.
// ---------------------------------------------------------------------------

vi.mock("@/canvas/Canvas", async () => {
  const React = await import("react");
  const { useCanvasStore } = await import("@/canvas/store");
  return {
    Canvas: React.forwardRef(function MockCanvas(
      props: { nodeStates?: Record<string, string> },
      ref: React.Ref<unknown>,
    ) {
      // A test-only control standing in for a real user gesture on the
      // canvas (e.g. dropping a new component) — enough to dirty the store
      // and change the graph's topology deterministically, without
      // rendering the real xyflow Canvas (heavy, and owned by another
      // agent's test scope). Uses addNode (a real component node) rather
      // than addComment/addZone so it also changes toArchitectureGraph's
      // output — annotation nodes are filtered out of that graph entirely
      // (see store.ts's toArchitectureGraph), so they'd never flip
      // isStale on their own.
      const addNode = useCanvasStore((s) => s.addNode);
      const nodeCount = useCanvasStore((s) => s.nodes.length);
      React.useImperativeHandle(ref, () => ({}));
      return React.createElement(
        React.Fragment,
        null,
        React.createElement(
          "button",
          {
            "data-testid": "mutate-canvas-btn",
            onClick: () =>
              addNode(
                { id: "test-added-component", defaultConfig: {} } as unknown as Parameters<typeof addNode>[0],
                { x: 100, y: 100 },
              ),
          },
          "mutate canvas",
        ),
        // Surfaces the per-node coloring ChapterWorkspace computes so tests
        // can assert on it without rendering the real xyflow node chrome.
        React.createElement("pre", { "data-testid": "node-states" }, JSON.stringify(props.nodeStates ?? {})),
        // Distinguishes "restored the save" from "fell back to starterGraph"
        // in cases where both happen to satisfy the same required-component
        // count text (e.g. an extra, non-required node added before saving).
        React.createElement("span", { "data-testid": "node-count" }, String(nodeCount)),
      );
    }),
  };
});

vi.mock("@/canvas/docs-panel/DocsPanel", () => ({
  DocsPanel: () => <div data-testid="docs-panel" />,
}));

vi.mock("@/canvas/docs-panel/FocusModeBar", () => ({
  FocusModeBar: () => <div data-testid="focus-mode-bar" />,
}));

vi.mock("@/app/UndoToast", () => ({
  UndoToast: () => null,
}));

vi.mock("@/app/AppHeader", () => ({
  // A minimal stand-in that surfaces every prop ChapterWorkspace passes
  // through, as clickable controls / readable text — enough to prove the
  // wiring (validate/save/undo/redo/docs-toggle callbacks, violations,
  // isStale, saveId, justSaved) without pulling in the real header's own
  // dependency tree (ValidationIndicator, ProjectMenu, BoardMenu, ...),
  // which belongs to another agent's test scope (src/app).
  AppHeader: (props: {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    violations: ValidationViolation[] | null;
    isStale: boolean;
    onValidate: () => void;
    saveId: string | null;
    onSave: () => void;
    justSaved: boolean;
    docsPanelOpen: boolean;
    toggleDocsPanel: () => void;
  }) => (
    <div data-testid="app-header">
      <button onClick={props.onValidate} data-testid="validate-btn">
        Validate
      </button>
      <button onClick={props.onSave} data-testid="save-btn">
        Save
      </button>
      <button onClick={props.onUndo} disabled={!props.canUndo} data-testid="undo-btn">
        Undo
      </button>
      <button onClick={props.onRedo} disabled={!props.canRedo} data-testid="redo-btn">
        Redo
      </button>
      <button onClick={props.toggleDocsPanel} data-testid="toggle-docs-btn">
        {props.docsPanelOpen ? "Close docs" : "Open docs"}
      </button>
      <span data-testid="save-id">{props.saveId ?? "none"}</span>
      <span data-testid="just-saved">{String(props.justSaved)}</span>
      <span data-testid="violations-count">{props.violations ? props.violations.length : "null"}</span>
      <span data-testid="is-stale">{String(props.isStale)}</span>
    </div>
  ),
}));

const chapterOne: ChapterDefinition = {
  id: "ch-1",
  mode: "building-blocks",
  title: "Chapter One",
  problemStatement: "Balance the load.",
  learningObjectives: [],
  availableComponentIds: ["client", "load-balancer"],
  requiredComponentIds: ["client", "load-balancer"],
  validationRuleIds: ["rule-a"],
  blueprints: [],
  hints: [],
  readingLinks: [],
  starterGraph: {
    nodes: [{ id: "n1", componentId: "client", position: { x: 0, y: 0 }, config: {} }],
    edges: [],
    entryPointIds: [],
  },
};

const chapterTwo: ChapterDefinition = {
  id: "ch-2",
  mode: "building-blocks",
  title: "Chapter Two",
  problemStatement: "Cache it.",
  learningObjectives: [],
  availableComponentIds: ["client", "cache"],
  requiredComponentIds: [],
  validationRuleIds: [],
  blueprints: [],
  hints: [],
  readingLinks: [],
};

vi.mock("@/content/chapters", () => ({
  getChaptersForMode: vi.fn(() => [chapterOne, chapterTwo]),
  chapterRegistry: [chapterOne, chapterTwo],
}));

// The curriculum manifest entries backing each ChapterDefinition above —
// ChapterWorkspace resolves the open chapter via findEntry(mode, slug), not
// a direct id lookup, so these are what the workspace actually keys off of.
const entryOne: CurriculumChapter = {
  slug: "slug-one",
  number: "1.1",
  title: "Chapter One",
  kind: "chapter",
  chapterDefinitionId: "ch-1",
  estimatedMinutes: 20,
  difficulty: "foundational",
  prerequisiteSlugs: [],
};
const entryTwo: CurriculumChapter = {
  ...entryOne,
  slug: "slug-two",
  title: "Chapter Two",
  chapterDefinitionId: "ch-2",
};

const findEntryMock = vi.fn((_mode: string, slug: string) =>
  slug === "slug-one" ? entryOne : slug === "slug-two" ? entryTwo : undefined,
);
vi.mock("@/curriculum", () => ({
  findEntry: (mode: string, slug: string) => findEntryMock(mode, slug),
}));

const markVisitedMock = vi.fn();
const hydrateProgressMock = vi.fn();
const recordValidationPassMock = vi.fn();
vi.mock("@/curriculum/progress-store", () => ({
  useCurriculumProgressStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      markVisited: markVisitedMock,
      hydrate: hydrateProgressMock,
      validationPassedDefinitionIds: new Set<string>(),
      rowsBySlug: new Map(),
      recordValidationPass: recordValidationPassMock,
    }),
}));

const routerPushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: routerPushMock }),
}));

const runValidationMock = vi.fn();
vi.mock("@/validation-engine/engine", () => ({
  runValidation: (...args: unknown[]) => runValidationMock(...args),
}));

const getRulesMock = vi.fn((ids: string[]) => {
  void ids;
  return [];
});
vi.mock("@/validation-engine/rules", () => ({
  getRules: (ids: string[]) => getRulesMock(ids),
}));

// Imported after the mocks above so the mocked modules are what it resolves.
const { ChapterWorkspace } = await import("./ChapterWorkspace");

async function renderWorkspace(chapterSlug = "slug-one") {
  const utils = render(<ChapterWorkspace mode="building-blocks" chapterSlug={chapterSlug} />);
  await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
  return utils;
}

beforeEach(async () => {
  await db.saves.clear();
  await db.chapterProgress.clear();
  runValidationMock.mockReset();
  runValidationMock.mockReturnValue([]);
  getRulesMock.mockClear();
  findEntryMock.mockClear();
  markVisitedMock.mockClear();
  hydrateProgressMock.mockClear();
  recordValidationPassMock.mockClear();
  routerPushMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ChapterWorkspace", () => {
  it("renders the chapter for the given route slug and loads its starterGraph", async () => {
    await renderWorkspace("slug-one");
    expect(screen.getByRole("heading", { name: "Chapter One" })).toBeInTheDocument();
    // starterGraph has one of the two required components present.
    await waitFor(() => expect(screen.getByText(/1 \/ 2 required components present/)).toBeInTheDocument());
    expect(screen.getByTestId("save-id")).toHaveTextContent(chapterSaveId("ch-1"));
  });

  it("restores a previously saved attempt instead of the starterGraph when one exists", async () => {
    await db.saves.put({
      id: chapterSaveId("ch-1"),
      updatedAt: Date.now(),
      nodes: [
        { id: "a", type: "component", position: { x: 0, y: 0 }, data: { componentId: "client", config: {} } },
        {
          id: "b",
          type: "component",
          position: { x: 0, y: 0 },
          data: { componentId: "load-balancer", config: {} },
        },
      ],
      edges: [],
    });

    await renderWorkspace("slug-one");

    // The save has BOTH required components present, unlike the starterGraph
    // (which only has one) — this is what proves the save took priority.
    await waitFor(() => expect(screen.getByText(/2 \/ 2 required components present/)).toBeInTheDocument());
  });

  it("marks the curriculum slug visited on mount", async () => {
    await renderWorkspace("slug-one");
    expect(markVisitedMock).toHaveBeenCalledWith("slug-one");
  });

  it("hydrates the curriculum progress store on mount", async () => {
    await renderWorkspace("slug-one");
    expect(hydrateProgressMock).toHaveBeenCalled();
  });

  describe("navigation", () => {
    it("links back to the chapter's Reader via ChapterSidebar's 'Back to lesson', held before navigating", async () => {
      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());
      vi.useFakeTimers();

      const link = screen.getByRole("link", { name: /back to lesson/i });
      expect(link).toHaveAttribute("href", "/building-blocks/slug-one/lesson");
      fireEvent.click(link, { button: 0 });
      expect(routerPushMock).not.toHaveBeenCalled();
      vi.advanceTimersByTime(1250);
      expect(routerPushMock).toHaveBeenCalledWith("/building-blocks/slug-one/lesson");
      vi.useRealTimers();
    });
  });

  describe("validation wiring", () => {
    it("surfaces missing/disconnected required components as synthetic violations, even when real rule violations are zero", async () => {
      // slug-one's starterGraph is a single, disconnected Client node —
      // present but not wired to anything — and load-balancer is missing
      // entirely. Real rule violations (mocked here) are zero, but the
      // merged, display-facing violations list (see
      // chapter-outcome-violations.ts) still surfaces both chapter-level
      // reasons in the same header dropdown a learner already checks —
      // "No violations" must never be shown when the chapter still fails.
      runValidationMock.mockReturnValue([]);
      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("2"));
      expect(screen.getByTestId("is-stale")).toHaveTextContent("false");
    });

    it("does not mark a required-but-disconnected node valid just because there are zero rule violations", async () => {
      // Same fixture as above — the disconnected Client node must ring as a
      // real, blocking issue (error), not the muted "warning" this used to
      // render as, and never green as if the chapter passed.
      runValidationMock.mockReturnValue([]);
      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("2"));
      const nodeStates = JSON.parse(screen.getByTestId("node-states").textContent ?? "{}");
      expect(nodeStates.n1).toBe("error");
      expect(Object.values(nodeStates)).not.toContain("valid");
    });

    it("marks every present component node valid once the chapter actually passes", async () => {
      // Chapter Two has no required components and no blueprints, so with
      // zero rule violations evaluateChapter passes outright — this is the
      // one case that should still paint nodes green.
      runValidationMock.mockReturnValue([]);
      await renderWorkspace("slug-two");
      await waitFor(() => expect(screen.getByRole("heading", { name: "Chapter Two" })).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("0"));
      const nodeStates = JSON.parse(screen.getByTestId("node-states").textContent ?? "{}");
      expect(Object.values(nodeStates)).toEqual(["valid"]);
    });

    it("runs validation scoped to the open chapter's own validationRuleIds and surfaces every violation, unconditionally", async () => {
      const violations: ValidationViolation[] = [
        {
          ruleId: "rule-a",
          severity: "error",
          message: "Missing a load balancer",
          explanation: "A single app server is a single point of failure under load.",
          offendingNodeIds: ["n1"],
          offendingEdgeIds: [],
        },
      ];
      runValidationMock.mockReturnValue(violations);

      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      // getRules was scoped to exactly this chapter's own rule ids — never
      // the full global registry (see CLAUDE.md: chapters validate only
      // what they teach).
      expect(getRulesMock).toHaveBeenCalledWith(["rule-a"]);
      // The violation reaches the header unconditionally — nothing in
      // ChapterWorkspace filters or hides it. Total is 3, not 1 — slug-one's
      // starterGraph is always missing load-balancer and has a disconnected
      // Client, so the merged list (see chapter-outcome-violations.ts) adds
      // those two chapter-level reasons on top of this one real rule
      // violation.
      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("3"));
      expect(screen.getByTestId("is-stale")).toHaveTextContent("false");
    });

    it("marks results stale once the graph changes after a validation run, without discarding the prior violations", async () => {
      runValidationMock.mockReturnValue([
        {
          ruleId: "rule-a",
          severity: "warning",
          message: "Heads up",
          explanation: "Just a warning.",
          offendingNodeIds: [],
          offendingEdgeIds: [],
        },
      ]);

      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("validate-btn"));
      // 3, not 1 — see the comment in the previous test: slug-one's
      // starterGraph always contributes 2 chapter-level synthetic entries
      // alongside this one real rule violation.
      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("3"));
      expect(screen.getByTestId("is-stale")).toHaveTextContent("false");

      fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

      await waitFor(() => expect(screen.getByTestId("is-stale")).toHaveTextContent("true"));
      // Still 3 — going stale doesn't clear the last result, it just flags it.
      expect(screen.getByTestId("violations-count")).toHaveTextContent("3");
    });
  });

  describe("chapter progress wiring", () => {
    it("writes exactly one chapterProgress row and mirrors it into the curriculum progress store when validation passes", async () => {
      const putSpy = vi.spyOn(db.chapterProgress, "put");
      runValidationMock.mockReturnValue([]);

      // Chapter Two has no required components and no blueprints declared,
      // so with zero rule violations evaluateChapter passes trivially.
      await renderWorkspace("slug-two");
      await waitFor(() => expect(screen.getByRole("heading", { name: "Chapter Two" })).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(putSpy).toHaveBeenCalledTimes(1));
      expect(putSpy).toHaveBeenCalledWith(
        expect.objectContaining({ chapterId: "ch-2", matchedBlueprintId: null }),
      );
      const stored = await db.chapterProgress.get("ch-2");
      expect(stored?.matchedBlueprintId).toBeNull();
      await waitFor(() => expect(recordValidationPassMock).toHaveBeenCalledWith("ch-2"));

      putSpy.mockRestore();
    });

    it("writes nothing when validation fails", async () => {
      const putSpy = vi.spyOn(db.chapterProgress, "put");
      runValidationMock.mockReturnValue([]);

      // slug-one's starterGraph has only one of its two required
      // components, and it's disconnected — evaluateChapter fails on that
      // alone, independent of the (mocked, zero) rule violations.
      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("2"));
      expect(putSpy).not.toHaveBeenCalled();
      expect(await db.chapterProgress.get("ch-1")).toBeUndefined();
      expect(recordValidationPassMock).not.toHaveBeenCalled();

      putSpy.mockRestore();
    });
  });

  describe("save wiring", () => {
    it("persists the live canvas to the chapter's own save slot and flashes justSaved", async () => {
      await renderWorkspace("slug-one");
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("save-btn"));

      await waitFor(() => expect(screen.getByTestId("just-saved")).toHaveTextContent("true"));
      const saved = await db.saves.get(chapterSaveId("ch-1"));
      expect(saved?.nodes).toHaveLength(1);
      expect(saved?.nodes[0]).toMatchObject({ id: "n1" });

      await waitFor(() => expect(screen.getByTestId("just-saved")).toHaveTextContent("false"), {
        timeout: 3000,
      });
    });
  });

  it("toggles the docs panel open/closed via the header control", async () => {
    await renderWorkspace("slug-one");
    expect(screen.queryByTestId("docs-panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("toggle-docs-btn"));
    expect(await screen.findByTestId("docs-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("toggle-docs-btn"));
    await waitFor(() => expect(screen.queryByTestId("docs-panel")).not.toBeInTheDocument());
  });

  it("persists the in-progress attempt to its chapter's save slot on unmount", async () => {
    const { unmount } = await renderWorkspace("slug-one");
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

    await act(async () => {
      unmount();
    });

    const saved = await db.saves.get(chapterSaveId("ch-1"));
    // Starter node (n1) plus the node the mutate button added.
    expect(saved?.nodes.length).toBe(2);
  });

  it("restores an explicitly-saved attempt across a full unmount and fresh remount (close-and-reopen)", async () => {
    // End-to-end regression for the reported "save, close the browser,
    // reopen -> blank canvas" bug: draw, click Save, tear the whole
    // workspace down (not just navigate — a real unmount, same as closing
    // the tab), then mount a brand new instance for the same chapter, the
    // way a fresh page load would.
    const { unmount } = await renderWorkspace("slug-one");
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
    fireEvent.click(screen.getByTestId("save-btn"));
    await waitFor(() => expect(screen.getByTestId("just-saved")).toHaveTextContent("true"));

    await act(async () => {
      unmount();
    });

    await renderWorkspace("slug-one");
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());
    // starterGraph alone has 1 node; the saved attempt (starter node + the
    // mutate button's added node) has 2 — this is what actually proves the
    // fresh mount restored the save instead of silently falling back to
    // starterGraph (both satisfy the same "1/2 required components" text).
    expect(screen.getByTestId("node-count")).toHaveTextContent("2");

    const saved = await db.saves.get(chapterSaveId("ch-1"));
    expect(saved?.nodes.length).toBe(2);
  });

  it("restores the saved attempt across close-and-reopen under React.StrictMode (matches next dev)", async () => {
    // The bug this guards: Next's dev server runs React.StrictMode, which
    // double-invokes every effect on mount (mount -> cleanup -> mount) as a
    // synchronous "phantom" cycle. The unmount-save effect a few lines up
    // used to fire unconditionally on that phantom cleanup, writing
    // whatever nodes/edges the store held AT THAT INSTANT — which is always
    // [] on a phantom cleanup, since the async restore below hasn't had any
    // chance to resolve yet. That silently overwrote a real prior save with
    // an empty one on every single dev-mode chapter visit, independent of
    // the autosave work in this file: a plain (non-StrictMode) render, like
    // the "close-and-reopen" test above, never exercised this path at all.
    const { unmount } = render(
      <StrictMode>
        <ChapterWorkspace mode="building-blocks" chapterSlug="slug-one" />
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
    // Wait for the starterGraph to actually finish loading (node-count
    // becomes 1) before interacting — not just for the "N / 2 required
    // components present" text, which reads "0 / 2" just as validly and so
    // can pass BEFORE the async restore/starterGraph load resolves.
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("1"));

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
    fireEvent.click(screen.getByTestId("save-btn"));
    await waitFor(() => expect(screen.getByTestId("just-saved")).toHaveTextContent("true"));
    expect(screen.getByTestId("node-count")).toHaveTextContent("2");

    await act(async () => {
      unmount();
    });

    render(
      <StrictMode>
        <ChapterWorkspace mode="building-blocks" chapterSlug="slug-one" />
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("2"));

    // Give autosave's debounce a full window past the phantom mount/cleanup
    // cycle to prove nothing subsequently clobbers the restored state back
    // to empty.
    await new Promise((r) => setTimeout(r, AUTOSAVE_DEBOUNCE_MS + 400));
    expect(screen.getByTestId("node-count")).toHaveTextContent("2");

    const saved = await db.saves.get(chapterSaveId("ch-1"));
    expect(saved?.nodes.length).toBe(2);
  });

  it("autosaves an edit to the chapter's save slot without an explicit Save click or unmount", async () => {
    // Regression test: before autosave-on-edit, closing/refreshing the tab
    // without clicking Save or navigating in-app lost the in-progress
    // attempt entirely (MILESTONES.md #9). Deliberately does NOT click
    // save-btn and does NOT unmount — only the debounced autosave effect
    // (src/persistence/use-autosave.ts) can produce this write.
    await renderWorkspace("slug-one");
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

    await waitFor(
      async () => {
        const saved = await db.saves.get(chapterSaveId("ch-1"));
        expect(saved?.nodes.length).toBe(2);
      },
      { timeout: 2000 },
    );
  });
});
