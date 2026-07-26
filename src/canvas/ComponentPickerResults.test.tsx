import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Flag } from "lucide-react";
import { ComponentPickerResults, DECORATION_SECTION_ID, categorySectionId } from "./ComponentPickerResults";
import type { ComponentGroup } from "./component-search";
import type { ToolAction } from "./ComponentPickerTools";
import { getComponent } from "@/content/components/registry";

const clientDef = getComponent("client")!;
const appServerDef = getComponent("app-server")!;

const groups: ComponentGroup[] = [
  { category: "networking", items: [clientDef] },
  { category: "compute", items: [appServerDef] },
];

const tools: ToolAction[] = [{ id: "tool-flag", label: "Add flag", description: "desc", icon: Flag }];

function baseProps(overrides: Partial<Parameters<typeof ComponentPickerResults>[0]> = {}) {
  return {
    query: "",
    flatCount: 2,
    groups,
    collapsedCategories: new Set<string>() as Set<import("@/content/components/types").ComponentCategory>,
    onToggleCategory: vi.fn(),
    customIds: new Set<string>(),
    componentIndex: new Map([[clientDef.id, 1], [appServerDef.id, 2]]),
    activeIndex: 0,
    onSelectComponent: vi.fn(),
    onActivate: vi.fn(),
    onEditCustom: vi.fn(),
    onDeleteCustom: vi.fn(),
    tools,
    onSelectTool: vi.fn(),
    registerRef: vi.fn(),
    ...overrides,
  };
}

describe("ComponentPickerResults", () => {
  it("shows the 'no components match' message when flatCount is 0", () => {
    render(<ComponentPickerResults {...baseProps({ flatCount: 0, query: "zzz" })} />);
    expect(screen.getByText(/No components match/)).toBeInTheDocument();
    expect(screen.getByText(/zzz/)).toBeInTheDocument();
  });

  it("renders the Decoration section and every category section with its item count", () => {
    render(<ComponentPickerResults {...baseProps()} />);
    expect(document.getElementById(DECORATION_SECTION_ID)).toBeInTheDocument();
    expect(document.getElementById(categorySectionId("networking"))).toBeInTheDocument();
    expect(document.getElementById(categorySectionId("compute"))).toBeInTheDocument();
    expect(screen.getByText("Networking")).toBeInTheDocument();
    expect(screen.getAllByText("(1)")).toHaveLength(2); // one item in each of the two fixture categories
  });

  it("hides a category's items when it's in collapsedCategories, but still renders its header", () => {
    render(
      <ComponentPickerResults
        {...baseProps({ collapsedCategories: new Set(["networking"]) })}
      />,
    );
    expect(screen.getByText("Networking")).toBeInTheDocument();
    expect(screen.queryByText("Client")).not.toBeInTheDocument();
    // The other (expanded) category still shows its item.
    expect(screen.getByText("Application Server")).toBeInTheDocument();
  });

  it("clicking a category header calls onToggleCategory with that category", () => {
    const onToggleCategory = vi.fn();
    render(<ComponentPickerResults {...baseProps({ onToggleCategory })} />);
    fireEvent.click(screen.getByText("Compute"));
    expect(onToggleCategory).toHaveBeenCalledWith("compute");
  });

  it("clicking a component tile calls onSelectComponent with its definition", () => {
    const onSelectComponent = vi.fn();
    render(<ComponentPickerResults {...baseProps({ onSelectComponent })} />);
    fireEvent.click(screen.getByText("Client"));
    expect(onSelectComponent).toHaveBeenCalledWith(clientDef);
  });

  it("marks a component as active based on componentIndex matching activeIndex", () => {
    render(<ComponentPickerResults {...baseProps({ activeIndex: 1 })} />);
    const clientOption = screen.getByText("Client").closest('[role="option"]');
    expect(clientOption).toHaveAttribute("aria-selected", "true");
  });

  it("passes isCustom through so edit/delete controls only show for ids in customIds", () => {
    render(<ComponentPickerResults {...baseProps({ customIds: new Set([clientDef.id]) })} />);
    expect(screen.getByLabelText(`Edit ${clientDef.label}`)).toBeInTheDocument();
    expect(screen.queryByLabelText(`Edit ${appServerDef.label}`)).not.toBeInTheDocument();
  });

  it("hovering a component tile calls onActivate with its computed index", () => {
    const onActivate = vi.fn();
    render(<ComponentPickerResults {...baseProps({ onActivate })} />);
    fireEvent.mouseEnter(screen.getByText("Application Server").closest('[role="option"]')!);
    expect(onActivate).toHaveBeenCalledWith(2);
  });

  it("stops propagation on Enter/Space over a category header (so it doesn't also trigger the roving keyboard-nav listener)", () => {
    render(<ComponentPickerResults {...baseProps()} />);
    const header = screen.getByText("Compute").closest("button")!;
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    header.dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();
  });

  it("does not stop propagation for a non-Enter/Space key on a category header", () => {
    render(<ComponentPickerResults {...baseProps()} />);
    const header = screen.getByText("Compute").closest("button")!;
    const event = new KeyboardEvent("keydown", { key: "a", bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    header.dispatchEvent(event);
    expect(stopSpy).not.toHaveBeenCalled();
  });
});
