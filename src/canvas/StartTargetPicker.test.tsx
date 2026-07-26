import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { StartTargetPicker } from "./StartTargetPicker";
import type { ComponentNodeType } from "./types";

const clientNode: ComponentNodeType = {
  id: "n1",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "client", config: {} },
};
const appServerNode: ComponentNodeType = {
  id: "n2",
  type: "component",
  position: { x: 0, y: 0 },
  data: { componentId: "app-server", config: {} },
};

function anchorRect(): DOMRect {
  return { left: 10, bottom: 20, top: 0, right: 0, width: 0, height: 0, x: 10, y: 0, toJSON: () => "" } as DOMRect;
}

describe("StartTargetPicker", () => {
  it("shows the empty-canvas message when there are no component nodes", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("No components on the canvas yet.")).toBeInTheDocument();
  });

  it("lists every component node by its display name", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode, appServerNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Application Server")).toBeInTheDocument();
  });

  it("does not show 'Clear target' when nothing is selected", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByText("Clear target")).not.toBeInTheDocument();
  });

  it("shows 'Clear target' when a target is selected, and clicking it calls onSelect(null) + onClose", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId="n1"
        onSelect={onSelect}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("Clear target"));
    expect(onSelect).toHaveBeenCalledWith(null);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking a row selects that node and closes the popup", () => {
    const onSelect = vi.fn();
    const onClose = vi.fn();
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode, appServerNode]}
        selectedId={null}
        onSelect={onSelect}
        onClose={onClose}
      />,
    );
    fireEvent.click(screen.getByText("Application Server"));
    expect(onSelect).toHaveBeenCalledWith("n2");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("filters rows by the search query, case-insensitively", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode, appServerNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Find a component…"), { target: { value: "APP" } });
    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(screen.queryByText("Client")).not.toBeInTheDocument();
  });

  it("shows a 'No match' message when the query matches nothing", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("Find a component…"), { target: { value: "zzz" } });
    expect(screen.getByText("No match.")).toBeInTheDocument();
  });

  it("pressing Escape calls onClose", () => {
    const onClose = vi.fn();
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("clicking the backdrop calls onClose", () => {
    // Rendered via createPortal straight onto document.body, not inside RTL's
    // own container — query the document directly to reach it.
    const onClose = vi.fn();
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={onClose}
      />,
    );
    const backdrop = document.body.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("prevents the default context menu on the backdrop (right-click doesn't open a native menu)", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    const backdrop = document.body.querySelector(".fixed.inset-0") as HTMLElement;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, "preventDefault");
    backdrop.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it("disambiguates two nodes of the same type with ordinal suffixes", () => {
    render(
      <StartTargetPicker
        anchorRect={anchorRect()}
        componentNodes={[clientNode, { ...clientNode, id: "n3" }]}
        selectedId={null}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Client #1")).toBeInTheDocument();
    expect(screen.getByText("Client #2")).toBeInTheDocument();
  });
});
