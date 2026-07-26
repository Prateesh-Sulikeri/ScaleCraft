import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentPickerRow } from "./ComponentPickerRow";
import { getComponent } from "@/content/components/registry";

const clientDef = getComponent("client")!;

describe("ComponentPickerRow", () => {
  it("renders the component's label and an accessible summary", () => {
    render(
      <ComponentPickerRow
        id="row-client"
        definition={clientDef}
        active={false}
        isCustom={false}
        onSelect={vi.fn()}
        onActivate={vi.fn()}
      />,
    );
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByRole("option")).toHaveAttribute(
      "aria-label",
      `Client: ${clientDef.summary}`,
    );
  });

  it("does not show edit/delete controls for a built-in (non-custom) component", () => {
    render(
      <ComponentPickerRow
        id="row-client"
        definition={clientDef}
        active={false}
        isCustom={false}
        onSelect={vi.fn()}
        onActivate={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText(/^Edit /)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Delete /)).not.toBeInTheDocument();
  });

  it("shows edit/delete controls for a custom component and wires them up", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onSelect = vi.fn();
    render(
      <ComponentPickerRow
        id="row-client"
        definition={clientDef}
        active={false}
        isCustom
        onSelect={onSelect}
        onActivate={vi.fn()}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );

    // mousedown on either control stops propagation so it never bubbles up
    // to the tile's own onClick (which would insert the component instead
    // of editing/deleting it).
    const editButton = screen.getByLabelText("Edit Client");
    const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(mouseDownEvent, "stopPropagation");
    editButton.dispatchEvent(mouseDownEvent);
    expect(stopSpy).toHaveBeenCalled();

    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledTimes(1);

    const deleteButton = screen.getByLabelText("Delete Client");
    fireEvent.mouseDown(deleteButton);
    fireEvent.click(deleteButton);
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("marks the tile aria-selected when active", () => {
    render(
      <ComponentPickerRow
        id="row-client"
        definition={clientDef}
        active
        isCustom={false}
        onSelect={vi.fn()}
        onActivate={vi.fn()}
      />,
    );
    expect(screen.getByRole("option")).toHaveAttribute("aria-selected", "true");
  });

  it("clicking the tile calls onSelect; hovering calls onActivate", () => {
    const onSelect = vi.fn();
    const onActivate = vi.fn();
    render(
      <ComponentPickerRow
        id="row-client"
        definition={clientDef}
        active={false}
        isCustom={false}
        onSelect={onSelect}
        onActivate={onActivate}
      />,
    );
    const option = screen.getByRole("option");
    fireEvent.mouseEnter(option);
    expect(onActivate).toHaveBeenCalledTimes(1);
    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it("falls back to the Server icon for an unmapped icon key without crashing", () => {
    const weirdDef = { ...clientDef, icon: "not-a-real-icon" };
    expect(() =>
      render(
        <ComponentPickerRow
          id="row-weird"
          definition={weirdDef}
          active={false}
          isCustom={false}
          onSelect={vi.fn()}
          onActivate={vi.fn()}
        />,
      ),
    ).not.toThrow();
  });
});
