import { beforeAll, describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
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
  it("renders the definition's label and category short code", () => {
    renderNode(baseProps());
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("NET")).toBeInTheDocument();
  });

  // Every side carries a port on every component, including a Client, which
  // declares no inputs. A side-conditional handle used to mean an authored
  // edge into an input-less component resolved to no handle at all, and
  // xyflow dropped the edge without drawing anything.
  it("renders a port on all four sides, whatever the component declares", () => {
    for (const componentId of ["client", "app-server", "sql-database"]) {
      const { container, unmount } = renderNode(baseProps({ componentId }));
      for (const side of ["left", "top", "right", "bottom"]) {
        expect(
          container.querySelector(`.react-flow__handle-${side}`),
          `${componentId} is missing its ${side} port`,
        ).toBeInTheDocument();
      }
      unmount();
    }
  });

  // Every port is a `source` handle: under loose connectionMode that is the
  // only kind that can serve as either end of an edge, so it is what lets an
  // edge leave any side. See canvas/edge-routing.ts.
  it("makes every port a source handle with an explicit id", () => {
    const { container } = renderNode(baseProps({ componentId: "app-server" }));
    const handles = [...container.querySelectorAll(".react-flow__handle")];
    expect(handles).toHaveLength(4);
    expect(handles.every((h) => h.classList.contains("source"))).toBe(true);
    expect(handles.map((h) => h.getAttribute("data-handleid")).sort()).toEqual([
      "port-bottom",
      "port-left",
      "port-right",
      "port-top",
    ]);
  });

  // Direction is a semantic rule (connection-rules.ts), not a geometric one -
  // so a Client's ports stay connectable and a drag onto one is refused with
  // visible feedback, rather than dying silently on an inert handle.
  it("leaves every port connectable, and lets connection-rules judge direction", () => {
    const { container } = renderNode(baseProps());
    const handles = [...container.querySelectorAll(".react-flow__handle")];
    expect(handles.every((h) => h.classList.contains("connectable"))).toBe(true);
  });

  it("no longer renders the definition summary - the description moved to the inspector", () => {
    renderNode(baseProps());
    expect(screen.queryByText("Issues requests into the system")).not.toBeInTheDocument();
  });

  it("ignores data.description, which is now inspector-only", () => {
    renderNode(baseProps({ description: "Custom per-instance note" }));
    expect(screen.queryByText("Custom per-instance note")).not.toBeInTheDocument();
  });

  it("renders nothing for an unknown componentId (deleted custom component)", () => {
    const { container } = renderNode(baseProps({ componentId: "does-not-exist" }));
    expect(container.firstChild).toBeNull();
  });

  it("shows the user-set instance name alongside the type label when present", () => {
    renderNode(baseProps({ name: "server-1-ind" }));
    expect(screen.getByText("server-1-ind")).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
  });

  it("does not show an instance name when name is unset or whitespace-only", () => {
    renderNode(baseProps());
    expect(screen.queryByText(/server-1-ind/)).not.toBeInTheDocument();

    const { container } = renderNode(baseProps({ name: "   " }));
    expect(container.textContent).not.toMatch(/\S\s{3,}\S/);
  });

  it("defaults to 120x96 and honors data.width / data.height when set", () => {
    const { container: c1 } = renderNode(baseProps());
    const card1 = c1.firstChild as HTMLElement;
    expect(card1.style.width).toBe("120px");
    expect(card1.style.height).toBe("96px");

    const { container: c2 } = renderNode(baseProps({ width: 260, height: 180 }));
    const card2 = c2.firstChild as HTMLElement;
    expect(card2.style.width).toBe("260px");
    expect(card2.style.height).toBe("180px");
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

  // DESIGN.md §2 "Color Blindness Support" — state must not be carried by hue
  // alone. The ring color is the at-a-glance channel; this glyph is the
  // redundant one, and it is what makes valid distinguishable from error.
  it.each([
    ["valid", "Valid"],
    ["warning", "Has a warning"],
    ["error", "Has an error"],
  ] as const)("pairs the %s ring with a labelled glyph, not hue alone", (state, label) => {
    renderNode(baseProps({ validationState: state }));
    expect(screen.getByLabelText(label)).toBeInTheDocument();
  });

  it("shows no state glyph when the node has not been validated", () => {
    renderNode(baseProps());
    expect(screen.queryByLabelText(/Valid|warning|error/i)).not.toBeInTheDocument();
  });

  it("marks a node whose config differs from the component default as configured", () => {
    // app-server's only field is `instances`, default 1.
    renderNode(baseProps({ componentId: "app-server", config: { instances: 3 } }));
    expect(screen.getByLabelText("Configured")).toBeInTheDocument();
  });

  it("does not mark a node still sitting on its component defaults", () => {
    renderNode(baseProps({ componentId: "app-server", config: { instances: 1 } }));
    expect(screen.queryByLabelText("Configured")).not.toBeInTheDocument();
  });

  it("treats an empty config (nothing ever set) as unconfigured", () => {
    renderNode(baseProps({ componentId: "app-server", config: {} }));
    expect(screen.queryByLabelText("Configured")).not.toBeInTheDocument();
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
});
