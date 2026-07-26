import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Tooltip } from "./Tooltip";

describe("Tooltip", () => {
  it("does not render the label until hovered", () => {
    render(
      <Tooltip label="Undo (Ctrl+Z)">
        <button>Undo</button>
      </Tooltip>,
    );
    expect(screen.queryByText("Undo (Ctrl+Z)")).not.toBeInTheDocument();
  });

  it("shows the label on mouse enter and hides it on mouse leave", () => {
    render(
      <Tooltip label="Undo (Ctrl+Z)">
        <button>Undo</button>
      </Tooltip>,
    );
    const trigger = screen.getByRole("button", { name: "Undo" });

    fireEvent.mouseEnter(trigger);
    expect(screen.getByText("Undo (Ctrl+Z)")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByText("Undo (Ctrl+Z)")).not.toBeInTheDocument();
  });

  it("passes through children unmodified when given a non-element child", () => {
    // isValidElement guard: anything other than a single ReactElement child
    // renders as-is with no tooltip wiring attached.
    const { container } = render(<Tooltip label="whatever">{"plain text" as unknown as never}</Tooltip>);
    expect(container.textContent).toBe("plain text");
  });
});
