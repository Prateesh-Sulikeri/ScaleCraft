import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ComponentPickerCategoryNav } from "./ComponentPickerCategoryNav";
import { DECORATION_SECTION_ID, categorySectionId } from "./ComponentPickerResults";

describe("ComponentPickerCategoryNav", () => {
  it("renders nothing when there's no decoration and no categories", () => {
    const { container } = render(
      <ComponentPickerCategoryNav categories={[]} hasDecoration={false} onJump={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a Decoration entry when hasDecoration is true", () => {
    render(<ComponentPickerCategoryNav categories={[]} hasDecoration onJump={vi.fn()} />);
    expect(screen.getByText("Decoration")).toBeInTheDocument();
  });

  it("renders one button per category, labeled via categoryLabel", () => {
    render(
      <ComponentPickerCategoryNav categories={["networking", "compute"]} hasDecoration={false} onJump={vi.fn()} />,
    );
    expect(screen.getByText("Networking")).toBeInTheDocument();
    expect(screen.getByText("Compute")).toBeInTheDocument();
  });

  it("clicking Decoration jumps to the decoration section id", () => {
    const onJump = vi.fn();
    render(<ComponentPickerCategoryNav categories={[]} hasDecoration onJump={onJump} />);
    fireEvent.click(screen.getByText("Decoration"));
    expect(onJump).toHaveBeenCalledWith(DECORATION_SECTION_ID);
  });

  it("clicking a category button jumps to that category's section id, passing the category", () => {
    const onJump = vi.fn();
    render(
      <ComponentPickerCategoryNav categories={["caching"]} hasDecoration={false} onJump={onJump} />,
    );
    fireEvent.click(screen.getByText("Caching"));
    expect(onJump).toHaveBeenCalledWith(categorySectionId("caching"), "caching");
  });

  it("stops propagation on Enter/Space so the picker's global keydown listener doesn't also fire", () => {
    const onJump = vi.fn();
    render(<ComponentPickerCategoryNav categories={["data"]} hasDecoration={false} onJump={onJump} />);
    const button = screen.getByText("Data");
    const event = new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    button.dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();
  });

  it("does not stop propagation for a non-Enter/Space key on a category button", () => {
    render(<ComponentPickerCategoryNav categories={["data"]} hasDecoration={false} onJump={vi.fn()} />);
    const button = screen.getByText("Data");
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    button.dispatchEvent(event);
    expect(stopSpy).not.toHaveBeenCalled();
  });

  it("stops propagation on Enter/Space over the Decoration button too", () => {
    render(<ComponentPickerCategoryNav categories={[]} hasDecoration onJump={vi.fn()} />);
    const button = screen.getByText("Decoration");
    const event = new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, "stopPropagation");
    button.dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();
  });
});
