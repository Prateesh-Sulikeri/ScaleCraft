import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutButton } from "./AboutButton";

describe("AboutButton", () => {
  it("renders the closed trigger button by default", () => {
    render(<AboutButton />);
    expect(screen.getByRole("button", { name: "About ScaleCraft" })).toBeInTheDocument();
    expect(screen.queryByText("ScaleCraft is an interactive system-design lab", { exact: false })).not.toBeInTheDocument();
  });

  it("opens the DocsModal with the About content when clicked", () => {
    render(<AboutButton />);
    fireEvent.click(screen.getByRole("button", { name: "About ScaleCraft" }));

    expect(screen.getByText("About ScaleCraft", { selector: "h2, [class]" })).toBeInTheDocument();
    expect(screen.getByText(/ScaleCraft is an interactive system-design lab/)).toBeInTheDocument();
    // The trigger button itself is replaced by the modal, not left mounted underneath.
    expect(screen.queryByRole("button", { name: "About ScaleCraft" })).not.toBeInTheDocument();
  });

  it("closes back to the trigger button when the modal's close control is used", () => {
    render(<AboutButton />);
    fireEvent.click(screen.getByRole("button", { name: "About ScaleCraft" }));

    fireEvent.click(screen.getByRole("button", { name: "Close docs" }));

    expect(screen.getByRole("button", { name: "About ScaleCraft" })).toBeInTheDocument();
    expect(screen.queryByText(/ScaleCraft is an interactive system-design lab/)).not.toBeInTheDocument();
  });
});
