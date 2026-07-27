import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ChapterDefinition } from "@/content/chapters/types";
import type { ValidationViolation } from "@/validation-engine/types";
import { db, chapterSaveId } from "@/persistence/db";

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
    Canvas: React.forwardRef(function MockCanvas(_props: unknown, ref: React.Ref<unknown>) {
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
      React.useImperativeHandle(ref, () => ({}));
      return React.createElement(
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

async function renderWorkspace() {
  const utils = render(<ChapterWorkspace mode="building-blocks" />);
  // Let the initial "no chapter selected -> clear canvas" effect settle.
  await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
  return utils;
}

beforeEach(async () => {
  await db.saves.clear();
  await db.chapterProgress.clear();
  runValidationMock.mockReset();
  runValidationMock.mockReturnValue([]);
  getRulesMock.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("ChapterWorkspace", () => {
  it("renders the Chapter List view by default, with no chapter selected", async () => {
    await renderWorkspace();
    expect(screen.getByText("Chapter One")).toBeInTheDocument();
    expect(screen.getByText("Chapter Two")).toBeInTheDocument();
    expect(screen.getByTestId("save-id")).toHaveTextContent("none");
  });

  it("selecting a chapter switches to the QuestionPane view and loads its starterGraph", async () => {
    await renderWorkspace();
    fireEvent.click(screen.getByText("Chapter One"));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Chapter One" })).toBeInTheDocument());
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

    await renderWorkspace();
    fireEvent.click(screen.getByText("Chapter One"));

    // The save has BOTH required components present, unlike the starterGraph
    // (which only has one) — this is what proves the save took priority.
    await waitFor(() => expect(screen.getByText(/2 \/ 2 required components present/)).toBeInTheDocument());
  });

  it("clears the canvas when backing out to the Chapter List", async () => {
    await renderWorkspace();
    fireEvent.click(screen.getByText("Chapter One"));
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /all chapters/i }));
    await waitFor(() => expect(screen.getByText("Chapter One")).toBeInTheDocument());
    expect(screen.getByTestId("save-id")).toHaveTextContent("none");
  });

  describe("validation wiring", () => {
    it("is a no-op when no chapter is selected", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByTestId("validate-btn"));
      expect(runValidationMock).not.toHaveBeenCalled();
      expect(screen.getByTestId("violations-count")).toHaveTextContent("null");
    });

    it("marks every present component node valid when validation passes with zero violations", async () => {
      runValidationMock.mockReturnValue([]);
      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("0"));
      expect(screen.getByTestId("is-stale")).toHaveTextContent("false");
    });

    it("runs validation scoped to the selected chapter's own validationRuleIds and surfaces every violation, unconditionally", async () => {
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

      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      // getRules was scoped to exactly this chapter's own rule ids — never
      // the full global registry (see CLAUDE.md: chapters validate only
      // what they teach).
      expect(getRulesMock).toHaveBeenCalledWith(["rule-a"]);
      // The violation reaches the header unconditionally — nothing in
      // ChapterWorkspace filters or hides it. (The actual explanation text
      // rendering lives in ValidationIndicator, outside this task's scope,
      // but the wiring up to that point must not drop or gate it.)
      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("1"));
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

      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());
      fireEvent.click(screen.getByTestId("validate-btn"));
      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("1"));
      expect(screen.getByTestId("is-stale")).toHaveTextContent("false");

      fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

      await waitFor(() => expect(screen.getByTestId("is-stale")).toHaveTextContent("true"));
      // Still 1 — going stale doesn't clear the last result, it just flags it.
      expect(screen.getByTestId("violations-count")).toHaveTextContent("1");
    });
  });

  describe("chapter progress wiring", () => {
    it("writes exactly one chapterProgress row with the matched blueprint id when validation passes", async () => {
      const putSpy = vi.spyOn(db.chapterProgress, "put");
      runValidationMock.mockReturnValue([]);

      await renderWorkspace();
      // Chapter Two has no required components and no blueprints declared,
      // so with zero rule violations evaluateChapter passes trivially.
      fireEvent.click(screen.getByText("Chapter Two"));
      await waitFor(() => expect(screen.getByRole("heading", { name: "Chapter Two" })).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(putSpy).toHaveBeenCalledTimes(1));
      expect(putSpy).toHaveBeenCalledWith(
        expect.objectContaining({ chapterId: "ch-2", matchedBlueprintId: null }),
      );
      const stored = await db.chapterProgress.get("ch-2");
      expect(stored?.matchedBlueprintId).toBeNull();

      putSpy.mockRestore();
    });

    it("writes nothing when validation fails", async () => {
      const putSpy = vi.spyOn(db.chapterProgress, "put");
      runValidationMock.mockReturnValue([]);

      await renderWorkspace();
      // Chapter One's starterGraph has only one of its two required
      // components, and it's disconnected — evaluateChapter fails on that
      // alone, independent of the (mocked, zero) rule violations.
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("validate-btn"));

      await waitFor(() => expect(screen.getByTestId("violations-count")).toHaveTextContent("0"));
      expect(putSpy).not.toHaveBeenCalled();
      expect(await db.chapterProgress.get("ch-1")).toBeUndefined();

      putSpy.mockRestore();
    });
  });

  describe("save wiring", () => {
    it("shows a 'select a chapter' notice instead of saving when no chapter is selected", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByTestId("save-btn"));
      await waitFor(() =>
        expect(screen.getByText(/select a chapter to save its progress/i)).toBeInTheDocument(),
      );
    });

    it("dismisses the 'select a chapter' notice via its close button", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByTestId("save-btn"));
      await waitFor(() =>
        expect(screen.getByText(/select a chapter to save its progress/i)).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByRole("button", { name: /dismiss/i }));
      await waitFor(() =>
        expect(screen.queryByText(/select a chapter to save its progress/i)).not.toBeInTheDocument(),
      );
    });

    it("persists the live canvas to the chapter's own save slot and flashes justSaved", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
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

  describe("unsaved-changes chapter switch guard", () => {
    it("does not prompt when switching chapters with no edits made", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /next chapter/i }));
      await waitFor(() => expect(screen.getByRole("heading", { name: "Chapter Two" })).toBeInTheDocument());
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });

    it("prompts before discarding an unsaved edit, and Cancel keeps the current chapter", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

      fireEvent.click(screen.getByRole("button", { name: /all chapters/i }));
      expect(await screen.findByText(/unsaved changes/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /^cancel$/i }));
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
      // Still on Chapter One's QuestionPane, not the list.
      expect(screen.getByRole("heading", { name: "Chapter One" })).toBeInTheDocument();
    });

    it("discards and switches when the user confirms", async () => {
      await renderWorkspace();
      fireEvent.click(screen.getByText("Chapter One"));
      await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

      fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
      fireEvent.click(screen.getByRole("button", { name: /all chapters/i }));
      expect(await screen.findByText(/unsaved changes/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: /discard & switch/i }));

      await waitFor(() => expect(screen.getByText("Chapter One")).toBeInTheDocument());
      expect(screen.queryByText(/unsaved changes/i)).not.toBeInTheDocument();
    });
  });

  it("toggles the docs panel open/closed via the header control", async () => {
    await renderWorkspace();
    expect(screen.queryByTestId("docs-panel")).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId("toggle-docs-btn"));
    expect(await screen.findByTestId("docs-panel")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("toggle-docs-btn"));
    await waitFor(() => expect(screen.queryByTestId("docs-panel")).not.toBeInTheDocument());
  });

  it("persists the in-progress attempt to its chapter's save slot on unmount", async () => {
    const { unmount } = await renderWorkspace();
    fireEvent.click(screen.getByText("Chapter One"));
    await waitFor(() => expect(screen.getByText(/required components present/)).toBeInTheDocument());

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));

    await act(async () => {
      unmount();
    });

    const saved = await db.saves.get(chapterSaveId("ch-1"));
    // Starter node (n1) plus the node the mutate button added.
    expect(saved?.nodes.length).toBe(2);
  });
});
