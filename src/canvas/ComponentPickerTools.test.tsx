import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Flag, MessageSquare } from "lucide-react";
import { ComponentPickerTools, type ToolAction } from "./ComponentPickerTools";

const tools: ToolAction[] = [
  { id: "tool-zone", label: "Add zone", description: "Visual grouping only", icon: MessageSquare },
  { id: "tool-flag", label: "Add flag", description: "Points at a component", icon: Flag },
];

describe("ComponentPickerTools", () => {
  it("renders nothing when there are no tools (e.g. every tool filtered out by search)", () => {
    const { container } = render(
      <ComponentPickerTools
        tools={[]}
        activeIndex={0}
        baseIndex={0}
        onActivate={vi.fn()}
        onSelectTool={vi.fn()}
        registerRef={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a tile per tool with its label", () => {
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={0}
        baseIndex={0}
        onActivate={vi.fn()}
        onSelectTool={vi.fn()}
        registerRef={vi.fn()}
      />,
    );
    expect(screen.getByText("Add zone")).toBeInTheDocument();
    expect(screen.getByText("Add flag")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });

  it("marks the tile at activeIndex (offset by baseIndex) as aria-selected", () => {
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={1}
        baseIndex={0}
        onActivate={vi.fn()}
        onSelectTool={vi.fn()}
        registerRef={vi.fn()}
      />,
    );
    const options = screen.getAllByRole("option");
    expect(options[0]).toHaveAttribute("aria-selected", "false");
    expect(options[1]).toHaveAttribute("aria-selected", "true");
  });

  it("respects a non-zero baseIndex when computing which tile is active", () => {
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={5}
        baseIndex={5}
        onActivate={vi.fn()}
        onSelectTool={vi.fn()}
        registerRef={vi.fn()}
      />,
    );
    expect(screen.getAllByRole("option")[0]).toHaveAttribute("aria-selected", "true");
  });

  it("hovering a tile calls onActivate with its computed index", () => {
    const onActivate = vi.fn();
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={0}
        baseIndex={3}
        onActivate={onActivate}
        onSelectTool={vi.fn()}
        registerRef={vi.fn()}
      />,
    );
    fireEvent.mouseEnter(screen.getByText("Add flag").closest('[role="option"]')!);
    expect(onActivate).toHaveBeenCalledWith(4);
  });

  it("clicking a tile calls onSelectTool with its id", () => {
    const onSelectTool = vi.fn();
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={0}
        baseIndex={0}
        onActivate={vi.fn()}
        onSelectTool={onSelectTool}
        registerRef={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Add zone").closest('[role="option"]')!);
    expect(onSelectTool).toHaveBeenCalledWith("tool-zone");
  });

  it("calls registerRef with the mounted element on mount", () => {
    const registerRef = vi.fn();
    render(
      <ComponentPickerTools
        tools={tools}
        activeIndex={0}
        baseIndex={0}
        onActivate={vi.fn()}
        onSelectTool={vi.fn()}
        registerRef={registerRef}
      />,
    );
    expect(registerRef).toHaveBeenCalledWith("tool-zone", expect.any(HTMLElement));
    expect(registerRef).toHaveBeenCalledWith("tool-flag", expect.any(HTMLElement));
  });
});
