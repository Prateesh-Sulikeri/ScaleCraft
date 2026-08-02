import "fake-indexeddb/auto";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { RefObject } from "react";
import { CanvasStoreProvider } from "@/canvas/store";
import { AppHeader } from "./AppHeader";
import type { CanvasHandle } from "@/canvas/Canvas";
import type { DeepCheckContext } from "@/ai/prompt";

const emptyDeepCheckCtx: DeepCheckContext = {
  graph: { nodes: [], edges: [], entryPointIds: [] },
  components: [],
  violations: [],
  passed: false,
};

function renderHeader(overrides: Partial<Parameters<typeof AppHeader>[0]> = {}) {
  const canvasRef = { current: null } as RefObject<CanvasHandle | null>;
  const onUndo = vi.fn();
  const onRedo = vi.fn();
  const onValidate = vi.fn();
  const onSave = vi.fn();
  const toggleDocsPanel = vi.fn();
  const baseProps: Parameters<typeof AppHeader>[0] = {
    mode: "sandbox",
    canvasRef,
    canUndo: false,
    canRedo: false,
    onUndo,
    onRedo,
    violations: null,
    isStale: false,
    onValidate,
    saveId: "sandbox",
    onSave,
    saveStatus: "saved",
    docsPanelOpen: false,
    toggleDocsPanel,
    deepCheckCtx: emptyDeepCheckCtx,
    ...overrides,
  };

  const view = render(
    <CanvasStoreProvider>
      <AppHeader {...baseProps} />
    </CanvasStoreProvider>,
  );

  const rerenderWith = (moreOverrides: Partial<Parameters<typeof AppHeader>[0]>) =>
    view.rerender(
      <CanvasStoreProvider>
        <AppHeader {...baseProps} {...moreOverrides} />
      </CanvasStoreProvider>,
    );

  return { onUndo, onRedo, onValidate, onSave, toggleDocsPanel, rerenderWith };
}

describe("AppHeader", () => {
  it("renders the ScaleCraft logo link, mode badge, and every header control", () => {
    renderHeader();
    expect(screen.getByRole("link", { name: /ScaleCraft/ })).toHaveAttribute("href", "/");
    expect(screen.getByRole("button", { name: "Sandbox" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Undo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Redo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Validate" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deep Check" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Project" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Board" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show documentation panel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keyboard shortcuts" })).toBeInTheDocument();
  });

  it("disables Undo/Redo when canUndo/canRedo are false, and wires clicks through when enabled", () => {
    const { onUndo, onRedo } = renderHeader({ canUndo: true, canRedo: true });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onRedo).toHaveBeenCalledTimes(1);
  });

  it("disables Undo/Redo when their flags are false", () => {
    renderHeader({ canUndo: false, canRedo: false });
    expect(screen.getByRole("button", { name: "Undo" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Redo" })).toBeDisabled();
  });

  it("disables Save, Project, and Board together when saveId is null", () => {
    renderHeader({ saveId: null });
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Project" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Board" })).toBeDisabled();
  });

  it("calls onSave when Save is clicked, and shows a check icon state when just saved", () => {
    const { onSave } = renderHeader({ saveStatus: "saved-recent" });
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton.className).toContain("border-state-valid");
    fireEvent.click(saveButton);
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("toggles the docs panel button's pressed state and label from the docsPanelOpen prop", () => {
    renderHeader({ docsPanelOpen: true });
    const button = screen.getByRole("button", { name: "Hide documentation panel" });
    expect(button).toHaveAttribute("aria-pressed", "true");
  });

  it("calls toggleDocsPanel when the documentation button is clicked", () => {
    const { toggleDocsPanel } = renderHeader();
    fireEvent.click(screen.getByRole("button", { name: "Show documentation panel" }));
    expect(toggleDocsPanel).toHaveBeenCalledTimes(1);
  });

  it("calls onValidate the first time Validate is clicked with no results yet", () => {
    const { onValidate } = renderHeader({ violations: null });
    fireEvent.click(screen.getByRole("button", { name: "Validate" }));
    expect(onValidate).toHaveBeenCalledTimes(1);
  });

  it("carries no permanent visible save-status text - only an icon on the button and a sr-only echo", () => {
    renderHeader({ saveStatus: "saved" });
    // sr-only text exists in the DOM for screen readers...
    expect(screen.getByText("Saved")).toHaveClass("sr-only");
    // ...but there's nothing else visibly labeling the button as "Saved".
    expect(screen.queryAllByText("Saved")).toHaveLength(1);
  });

  it("hides the sr-only save-status echo entirely when saveId is null", () => {
    renderHeader({ saveId: null, saveStatus: "saved" });
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("reflects each save status as a data attribute and icon/color on the Save button itself", () => {
    const { rerenderWith } = renderHeader({ saveStatus: "saved" });
    const saveButton = screen.getByRole("button", { name: "Save" });
    expect(saveButton).toHaveAttribute("data-save-status", "saved");

    rerenderWith({ saveStatus: "saving" });
    expect(saveButton.querySelector("svg")).toHaveClass("animate-spin");

    rerenderWith({ saveStatus: "saved-recent" });
    expect(saveButton.className).toContain("border-state-valid");

    rerenderWith({ saveStatus: "error" });
    expect(saveButton.className).toContain("border-state-error");
    expect(screen.getByText("Save failed")).toHaveClass("sr-only");
  });

  it("colors the header border per mode via modeColorVar", () => {
    const { container } = render(
      <CanvasStoreProvider>
        <AppHeader
          mode="real-world-extraction"
          canvasRef={{ current: null } as RefObject<CanvasHandle | null>}
          canUndo={false}
          canRedo={false}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          violations={null}
          isStale={false}
          onValidate={vi.fn()}
          saveId="sandbox"
          onSave={vi.fn()}
          saveStatus="saved"
          docsPanelOpen={false}
          toggleDocsPanel={vi.fn()}
          deepCheckCtx={emptyDeepCheckCtx}
        />
      </CanvasStoreProvider>,
    );
    const header = container.querySelector("header")!;
    expect(header.style.borderBottomColor).toBe("var(--mode-real-world-extraction)");
  });
});
