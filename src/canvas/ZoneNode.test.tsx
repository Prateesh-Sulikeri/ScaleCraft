import { beforeAll, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { ZoneNode } from "./ZoneNode";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import { DEFAULT_ZONE_COLOR } from "./annotation-colors";
import type { ZoneNodeType } from "./types";

beforeAll(() => {
  stubResizeObserver();
});

function baseProps(overrides: Partial<ZoneNodeType["data"]> = {}, selected = false) {
  return {
    id: "z1",
    type: "zone" as const,
    selected,
    dragging: false,
    zIndex: -1,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { label: "", width: 320, height: 220, ...overrides },
  };
}

/** ZoneNode's action handlers (updateZone/toggleAnnotationLock/...) look the
 * node up by id in the store's own `nodes` array — a store seeded with
 * nothing means every store-round-trip assertion silently no-ops (the
 * `.map` finds no match), so this seeds a matching zone node via
 * loadCanvasState before returning, mirroring what Canvas.tsx actually has
 * in the store whenever this node is rendered for real. */
function renderZone(props: ReturnType<typeof baseProps>) {
  const utils = renderWithCanvasStore(
    <ReactFlowProvider>
      <ZoneNode {...props} />
    </ReactFlowProvider>,
  );
  utils.api.getState().loadCanvasState(
    [{ id: props.id, type: "zone", position: { x: 0, y: 0 }, data: props.data }],
    [],
  );
  return utils;
}

describe("ZoneNode", () => {
  it("renders an empty label placeholder by default (not literal 'Zone')", () => {
    renderZone(baseProps());
    expect(screen.getByPlaceholderText("Zone label")).toHaveValue("");
  });

  it("does not render lock/edit controls or the disclaimer text when not selected", () => {
    renderZone(baseProps({ label: "Backend" }, false));
    expect(screen.queryByLabelText("Lock zone")).not.toBeInTheDocument();
    expect(screen.queryByText(/Visual grouping only/)).not.toBeInTheDocument();
  });

  it("renders the zone's label text and lock/edit controls while selected", () => {
    renderZone(baseProps({ label: "Backend" }, true));
    expect(screen.getByDisplayValue("Backend")).toBeInTheDocument();
    expect(screen.getByLabelText("Lock zone")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit zone")).toBeInTheDocument();
    expect(screen.getByText(/Visual grouping only/)).toBeInTheDocument();
  });

  it("typing in the label input calls updateZone via the store", () => {
    const { api } = renderZone(baseProps({}, false));
    fireEvent.change(screen.getByPlaceholderText("Zone label"), { target: { value: "Frontend" } });
    const node = api.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.label).toBe("Frontend");
  });

  it("clicking the lock button toggles locked via the store, without navigating away from selected state", () => {
    const { api } = renderZone(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Lock zone"));
    const node = api.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(true);
  });

  it("shows the Locked badge when data.locked is true, regardless of selection", () => {
    renderZone(baseProps({ locked: true }, false));
    expect(screen.getByLabelText("Locked")).toBeInTheDocument();
    // Locked state flips the button's label the next time it's shown selected.
  });

  it("clicking Unlock (when already locked) flips it back off", () => {
    const { api } = renderZone(baseProps({ locked: true }, true));
    expect(screen.getByLabelText("Unlock zone")).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText("Unlock zone"));
    const node = api.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.locked).toBe(false);
  });

  it("clicking the edit (pencil) button opens the annotation editor at the click point", () => {
    const { api } = renderZone(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Edit zone"), { clientX: 42, clientY: 84 });
    expect(api.getState().editingAnnotation).toEqual({ id: "z1", anchor: { x: 42, y: 84 } });
  });

  it("falls back to DEFAULT_ZONE_COLOR when no color is set", () => {
    const { container } = renderZone(baseProps());
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("stroke")).toBe(`color-mix(in srgb, ${DEFAULT_ZONE_COLOR} 80%, transparent)`);
  });

  it("uses HIGHLIGHT_GOLD for the border stroke when highlighted", () => {
    const { container } = renderZone(baseProps({ highlighted: true }));
    const rect = container.querySelector("rect");
    expect(rect?.getAttribute("stroke")).toBe("#f2b90a");
  });
});
