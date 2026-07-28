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

  render(
    <CanvasStoreProvider>
      <AppHeader
        mode="sandbox"
        canvasRef={canvasRef}
        canUndo={false}
        canRedo={false}
        onUndo={onUndo}
        onRedo={onRedo}
        violations={null}
        isStale={false}
        onValidate={onValidate}
        saveId="sandbox"
        onSave={onSave}
        justSaved={false}
        docsPanelOpen={false}
        toggleDocsPanel={toggleDocsPanel}
        deepCheckCtx={emptyDeepCheckCtx}
        {...overrides}
      />
    </CanvasStoreProvider>,
  );

  return { onUndo, onRedo, onValidate, onSave, toggleDocsPanel };
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
    expect(screen.getByRole("button", { name: "AI Settings" })).toBeInTheDocument();
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

  it("calls onSave when Save is clicked, and shows a check icon state when justSaved", () => {
    const { onSave } = renderHeader({ justSaved: true });
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
          justSaved={false}
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
