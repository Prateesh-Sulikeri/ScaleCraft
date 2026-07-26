import { beforeAll, describe, expect, it } from "vitest";
import { act, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { ComponentNode } from "./ComponentNode";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import type { ComponentNodeType } from "./types";

beforeAll(() => {
  stubResizeObserver();
});

function baseProps(overrides: Partial<ComponentNodeType["data"]> = {}, selected = false) {
  return {
    id: "n1",
    type: "component" as const,
    selected,
    dragging: false,
    zIndex: 0,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { componentId: "client", config: {}, ...overrides },
  };
}

function renderNode(props: ReturnType<typeof baseProps>) {
  return renderWithCanvasStore(
    <ReactFlowProvider>
      <ComponentNode {...props} />
    </ReactFlowProvider>,
  );
}

describe("ComponentNode", () => {
  it("renders the definition's label and summary for a known component (client: no input handle)", () => {
    const { container } = renderNode(baseProps());
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Issues requests into the system")).toBeInTheDocument();
    // Client has no declared inputs (it's always an origin, never a
    // destination) — no visible Position.Left target handle, even though it
    // does have an output (Position.Right source handle).
    expect(container.querySelector(".react-flow__handle-left")).not.toBeInTheDocument();
    expect(container.querySelector(".react-flow__handle-right")).toBeInTheDocument();
  });

  it("renders both input and output handles for a component with both ports (app-server)", () => {
    const { container } = renderNode(baseProps({ componentId: "app-server" }));
    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(container.querySelector(".react-flow__handle-left")).toBeInTheDocument();
    expect(container.querySelector(".react-flow__handle-right")).toBeInTheDocument();
  });

  it("renders nothing for an unknown componentId (deleted custom component)", () => {
    const { container } = renderNode(baseProps({ componentId: "does-not-exist" }));
    expect(container.firstChild).toBeNull();
  });

  it("shows the user-set instance name alongside the type label when present", () => {
    renderNode(baseProps({ name: "server-1-ind" }));
    expect(screen.getByText("server-1-ind")).toBeInTheDocument();
  });

  it("does not show an instance name element when name is unset", () => {
    renderNode(baseProps());
    expect(screen.queryByText(/server-1-ind/)).not.toBeInTheDocument();
  });

  it("does not show an instance name element when name is whitespace-only", () => {
    renderNode(baseProps({ name: "   " }));
    // Only the type label itself should render, no extra whitespace node.
    expect(screen.getAllByText("Client")).toHaveLength(1);
  });

  it("prefers data.description over the definition's summary when set", () => {
    renderNode(baseProps({ description: "Custom per-instance note" }));
    expect(screen.getByText("Custom per-instance note")).toBeInTheDocument();
    expect(screen.queryByText("Issues requests into the system")).not.toBeInTheDocument();
  });

  it("defaults to width 200 when data.width is unset, and uses data.width when set", () => {
    const { container: c1 } = renderNode(baseProps());
    const card1 = c1.firstChild as HTMLElement;
    expect(card1.style.width).toBe("200px");

    const { container: c2 } = renderNode(baseProps({ width: 260 }));
    const card2 = c2.firstChild as HTMLElement;
    expect(card2.style.width).toBe("260px");
  });

  it("shows a validation-state outline color matching stateRingVar for the given state", () => {
    const { container } = renderNode(baseProps({ validationState: "error" }));
    const card = container.firstChild as HTMLElement;
    expect(card.style.outline).toContain("var(--state-error)");
  });

  it("falls back to the neutral --border outline color when no validationState is set", () => {
    const { container } = renderNode(baseProps());
    const card = container.firstChild as HTMLElement;
    expect(card.style.outline).toContain("var(--border)");
  });

  it("shows the highlight-gold ring when data.highlighted is true, taking priority over plain selection", () => {
    const { container } = renderNode(baseProps({ highlighted: true }, true));
    const card = container.firstChild as HTMLElement;
    expect(card.style.boxShadow).toContain("#f2b90a");
  });

  it("shows the plain selection glow when selected but not highlighted", () => {
    const { container } = renderNode(baseProps({}, true));
    const card = container.firstChild as HTMLElement;
    expect(card.style.boxShadow).toContain("var(--foreground)");
  });

  it("shows no boxShadow when neither selected nor highlighted", () => {
    const { container } = renderNode(baseProps({}, false));
    const card = container.firstChild as HTMLElement;
    expect(card.style.boxShadow).toBe("");
  });

  it("clamps description lines via ResizeObserver once manually resized (data.height set)", () => {
    // Exercises the isManuallyResized branch — data.height becomes a real
    // number only after a user drags the resize handle (see resizeNode in
    // store.ts); this stubs ResizeObserver's callback to simulate one
    // measurement pass instead of relying on a real layout engine in jsdom.
    let capturedCallback: ResizeObserverCallback | undefined;
    class CapturingResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        capturedCallback = cb;
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    const original = global.ResizeObserver;
    global.ResizeObserver = CapturingResizeObserver;

    renderNode(baseProps({ height: 140 }));
    expect(capturedCallback).toBeDefined();

    act(() => {
      capturedCallback!(
        [{ contentRect: { height: 30 } } as ResizeObserverEntry],
        {} as ResizeObserver,
      );
    });

    expect(screen.getByText("Issues requests into the system")).toBeInTheDocument();
    global.ResizeObserver = original;
  });
});
