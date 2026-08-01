import "fake-indexeddb/auto";
import { StrictMode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { db, SANDBOX_SAVE_ID } from "@/persistence/db";
import { AUTOSAVE_DEBOUNCE_MS } from "@/persistence/use-autosave";

// ---------------------------------------------------------------------------
// Same mocking approach as src/chapters/ChapterWorkspace.test.tsx — stub
// everything SandboxPage pulls in that isn't the persistence wiring under
// test, so this exercises the real save/restore/autosave path against a
// real (fake-indexeddb-backed) Dexie instance.
// ---------------------------------------------------------------------------

vi.mock("@/canvas/Canvas", async () => {
  const React = await import("react");
  const { useCanvasStore } = await import("@/canvas/store");
  return {
    Canvas: React.forwardRef(function MockCanvas(_props: unknown, ref: React.Ref<unknown>) {
      const addNode = useCanvasStore((s) => s.addNode);
      const nodeCount = useCanvasStore((s) => s.nodes.length);
      React.useImperativeHandle(ref, () => ({}));
      return React.createElement(
        React.Fragment,
        null,
        React.createElement("button", {
          "data-testid": "mutate-canvas-btn",
          onClick: () =>
            addNode(
              { id: "test-added-component", defaultConfig: {} } as unknown as Parameters<typeof addNode>[0],
              { x: 100, y: 100 },
            ),
        }),
        React.createElement("span", { "data-testid": "node-count" }, String(nodeCount)),
      );
    }),
  };
});

vi.mock("@/canvas/docs-panel/DocsPanel", () => ({ DocsPanel: () => null }));
vi.mock("@/canvas/docs-panel/FocusModeBar", () => ({ FocusModeBar: () => null }));
vi.mock("@/app/UndoToast", () => ({ UndoToast: () => null }));

vi.mock("@/app/AppHeader", () => ({
  AppHeader: (props: { onSave: () => void; saveId: string | null }) => (
    <div data-testid="app-header">
      <button onClick={props.onSave} data-testid="save-btn">
        Save
      </button>
      <span data-testid="save-id">{props.saveId ?? "none"}</span>
    </div>
  ),
}));

vi.mock("@/validation-engine/engine", () => ({ runValidation: vi.fn(() => []) }));
vi.mock("@/validation-engine/rules", () => ({ ruleRegistry: [] }));

const { default: SandboxPage } = await import("./page");

beforeEach(async () => {
  await db.saves.clear();
});

async function renderSandbox() {
  const utils = render(<SandboxPage />);
  await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
  return utils;
}

describe("SandboxPage", () => {
  it("autosaves an edit to the sandbox save slot without an explicit Save click", async () => {
    // Regression test for MILESTONES.md #9: before autosave-on-edit, closing
    // or refreshing the tab without clicking Save lost sandbox work.
    // Deliberately does NOT click save-btn — only the debounced autosave
    // effect (src/persistence/use-autosave.ts) can produce this write.
    await renderSandbox();
    expect(screen.getByTestId("save-id")).toHaveTextContent(SANDBOX_SAVE_ID);
    // Wait for the seed graph to actually load before mutating — its own
    // db.saves.get() is async, and racing it would make the click's node
    // vanish under the seed-load's own "don't clobber existing nodes" guard.
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("4"));

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("5"));

    // Seed graph (4 nodes) is loaded on mount; mutate-canvas-btn adds a 5th
    // via the real store's addNode, which assigns its own random node id
    // (the "test-added-component" name only lands in data.componentId) —
    // asserting on the resulting count/shape, same as ChapterWorkspace's
    // equivalent unmount-save test.
    await waitFor(
      async () => {
        const saved = await db.saves.get(SANDBOX_SAVE_ID);
        expect(saved?.nodes.length).toBe(5);
      },
      { timeout: 2000 },
    );
  });

  it("restores the saved board across close-and-reopen under React.StrictMode (matches next dev)", async () => {
    // Same bug/fix as ChapterWorkspace's equivalent StrictMode test: Next's
    // dev server runs React.StrictMode, which double-invokes effects on
    // mount as a synchronous phantom mount/cleanup cycle. The unmount-save
    // effect's cleanup used to fire on that phantom cleanup with whatever
    // nodes/edges the store held at that instant — always [] before the
    // async restore below has any chance to resolve — silently overwriting
    // a real prior save with an empty one on every dev-mode Sandbox visit.
    const { unmount } = render(
      <StrictMode>
        <SandboxPage />
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("4"));

    fireEvent.click(screen.getByTestId("mutate-canvas-btn"));
    fireEvent.click(screen.getByTestId("save-btn"));
    await waitFor(async () => {
      const saved = await db.saves.get(SANDBOX_SAVE_ID);
      expect(saved?.nodes.length).toBe(5);
    });

    await act(async () => {
      unmount();
    });

    render(
      <StrictMode>
        <SandboxPage />
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByTestId("app-header")).toBeInTheDocument());
    await waitFor(() => expect(screen.getByTestId("node-count")).toHaveTextContent("5"));

    // Give autosave's debounce a full window past the phantom mount/cleanup
    // cycle to prove nothing subsequently clobbers the restored board back
    // to empty.
    await new Promise((r) => setTimeout(r, AUTOSAVE_DEBOUNCE_MS + 400));
    expect(screen.getByTestId("node-count")).toHaveTextContent("5");

    const saved = await db.saves.get(SANDBOX_SAVE_ID);
    expect(saved?.nodes.length).toBe(5);
  });
});
