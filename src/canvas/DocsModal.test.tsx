import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { DocsModal } from "./DocsModal";

describe("DocsModal", () => {
  it("renders the title and docs body when not minimized", () => {
    render(
      <DocsModal
        title="About ScaleCraft"
        docs="Some longer docs text."
        index={0}
        minimized={false}
        onMinimizedChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("About ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText("Some longer docs text.")).toBeInTheDocument();
  });

  it("renders as a minimized capsule (no docs body) when minimized is true", () => {
    render(
      <DocsModal
        title="About ScaleCraft"
        docs="Some longer docs text."
        index={0}
        minimized
        onMinimizedChange={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: /About ScaleCraft/ })).toBeInTheDocument();
    expect(screen.queryByText("Some longer docs text.")).not.toBeInTheDocument();
  });

  it("clicking Minimize calls onMinimizedChange(true)", () => {
    const onMinimizedChange = vi.fn();
    render(
      <DocsModal
        title="Docs"
        docs="body"
        index={0}
        minimized={false}
        onMinimizedChange={onMinimizedChange}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Minimize docs"));
    expect(onMinimizedChange).toHaveBeenCalledWith(true);
  });

  it("clicking Close calls onClose", () => {
    const onClose = vi.fn();
    render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText("Close docs"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the minimized capsule (without dragging) restores it via onMinimizedChange(false)", () => {
    const onMinimizedChange = vi.fn();
    render(
      <DocsModal
        title="Docs"
        docs="body"
        index={0}
        minimized
        onMinimizedChange={onMinimizedChange}
        onClose={vi.fn()}
      />,
    );
    const capsule = screen.getByRole("button", { name: /Docs/ });
    fireEvent.mouseDown(capsule, { clientX: 0, clientY: 0 });
    fireEvent.click(capsule);
    expect(onMinimizedChange).toHaveBeenCalledWith(false);
  });

  it("dragging the title bar moves the window (position tracks the mouse delta)", () => {
    const { container } = render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const titleBar = win.querySelector(".cursor-move") as HTMLElement;
    const startLeft = parseInt(win.style.left, 10);
    const startTop = parseInt(win.style.top, 10);

    fireEvent.mouseDown(titleBar, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 130, clientY: 140 });
    fireEvent.mouseUp(window);

    expect(parseInt(win.style.left, 10)).toBe(startLeft + 30);
    expect(parseInt(win.style.top, 10)).toBe(startTop + 40);
  });

  it("clicking a title-bar control (Minimize/Close) does not start a drag", () => {
    const onMinimizedChange = vi.fn();
    const { container } = render(
      <DocsModal
        title="Docs"
        docs="body"
        index={0}
        minimized={false}
        onMinimizedChange={onMinimizedChange}
        onClose={vi.fn()}
      />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const startLeft = win.style.left;
    const minimizeButton = screen.getByLabelText("Minimize docs");

    fireEvent.mouseDown(minimizeButton, { clientX: 100, clientY: 100 });
    fireEvent.mouseMove(window, { clientX: 200, clientY: 200 });
    fireEvent.mouseUp(window);

    // Position is untouched — startDrag bailed out via the data-window-control guard.
    expect(win.style.left).toBe(startLeft);
  });

  it("dragging the resize handle grows the window, clamped within min/max bounds", () => {
    const { container } = render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const handle = screen.getByLabelText("Resize docs window");

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 50, clientY: 30 });
    fireEvent.mouseUp(window);

    expect(win.style.width).toBe("470px"); // 420 + 50
    expect(win.style.height).toBe("370px"); // 340 + 30
  });

  it("clamps resize to MIN_WIDTH/MIN_HEIGHT when dragged smaller than the floor", () => {
    const { container } = render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const handle = screen.getByLabelText("Resize docs window");

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: -1000, clientY: -1000 });
    fireEvent.mouseUp(window);

    expect(win.style.width).toBe("300px"); // MIN_WIDTH floor
    expect(win.style.height).toBe("200px"); // MIN_HEIGHT floor
  });

  it("clamps resize to MAX_WIDTH/MAX_HEIGHT when dragged larger than the ceiling", () => {
    const { container } = render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const handle = screen.getByLabelText("Resize docs window");

    fireEvent.mouseDown(handle, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 5000, clientY: 5000 });
    fireEvent.mouseUp(window);

    expect(win.style.width).toBe("640px"); // MAX_WIDTH ceiling
    expect(win.style.height).toBe("640px"); // MAX_HEIGHT ceiling
  });

  it("stops responding to mousemove after mouseup (listeners are torn down)", () => {
    const { container } = render(
      <DocsModal title="Docs" docs="body" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win = container.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const titleBar = win.querySelector(".cursor-move") as HTMLElement;

    fireEvent.mouseDown(titleBar, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 10, clientY: 10 });
    fireEvent.mouseUp(window);
    const leftAfterUp = win.style.left;

    // A further move after mouseup shouldn't move the window any further.
    fireEvent.mouseMove(window, { clientX: 500, clientY: 500 });
    expect(win.style.left).toBe(leftAfterUp);
  });

  it("a drag under DRAG_THRESHOLD still moves the window but doesn't count as a 'real' drag", () => {
    const onMinimizedChange = vi.fn();
    render(
      <DocsModal
        title="Docs"
        docs="body"
        index={0}
        minimized
        onMinimizedChange={onMinimizedChange}
        onClose={vi.fn()}
      />,
    );
    const capsule = screen.getByRole("button", { name: /Docs/ });
    fireEvent.mouseDown(capsule, { clientX: 0, clientY: 0 });
    // 2px is under DRAG_THRESHOLD (4) on both axes.
    fireEvent.mouseMove(window, { clientX: 2, clientY: 1 });
    fireEvent.mouseUp(window);
    fireEvent.click(capsule);
    // Since didDragRef never crossed the threshold, the click still restores.
    expect(onMinimizedChange).toHaveBeenCalledWith(false);
  });

  it("a drag past DRAG_THRESHOLD suppresses the following click-to-restore", () => {
    const onMinimizedChange = vi.fn();
    render(
      <DocsModal
        title="Docs"
        docs="body"
        index={0}
        minimized
        onMinimizedChange={onMinimizedChange}
        onClose={vi.fn()}
      />,
    );
    const capsule = screen.getByRole("button", { name: /Docs/ });
    fireEvent.mouseDown(capsule, { clientX: 0, clientY: 0 });
    fireEvent.mouseMove(window, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(window);
    fireEvent.click(capsule);
    expect(onMinimizedChange).not.toHaveBeenCalled();
  });

  it("cascades default window position further right/down for a higher index", () => {
    const { container: c0 } = render(
      <DocsModal title="A" docs="a" index={0} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const { container: c2 } = render(
      <DocsModal title="B" docs="b" index={2} minimized={false} onMinimizedChange={vi.fn()} onClose={vi.fn()} />,
    );
    const win0 = c0.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const win2 = c2.querySelector(".fixed.z-\\[var\\(--z-modal\\)\\]") as HTMLElement;
    const top0 = parseInt(win0.style.top, 10);
    const top2 = parseInt(win2.style.top, 10);
    expect(top2).toBeGreaterThan(top0);
  });
});
