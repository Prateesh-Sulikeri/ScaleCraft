import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WalkthroughLabContent } from "./WalkthroughLabContent";
import { WALKTHROUGH_LAB_FIXTURES } from "./fixtures";

describe("WalkthroughLabContent", () => {
  it("renders the lab heading", () => {
    render(<WalkthroughLabContent />);
    expect(screen.getByRole("heading", { name: "Walkthrough authoring lab" })).toBeInTheDocument();
  });

  it("renders the first fixture by default", () => {
    render(<WalkthroughLabContent />);
    expect(screen.getByText(WALKTHROUGH_LAB_FIXTURES[0].props.title!)).toBeInTheDocument();
  });

  it("switching fixtures swaps the rendered walkthrough", () => {
    render(<WalkthroughLabContent />);
    expect(screen.getByText(WALKTHROUGH_LAB_FIXTURES[0].props.title!)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Fixture" }), {
      target: { value: WALKTHROUGH_LAB_FIXTURES[1].id },
    });

    expect(screen.getByText(WALKTHROUGH_LAB_FIXTURES[1].props.title!)).toBeInTheDocument();
    expect(screen.queryByText(WALKTHROUGH_LAB_FIXTURES[0].props.title!)).not.toBeInTheDocument();
  });

  it("invalid JSON shows the parse error and keeps the previous render", () => {
    render(<WalkthroughLabContent />);
    const previousTitle = WALKTHROUGH_LAB_FIXTURES[0].props.title!;
    expect(screen.getByText(previousTitle)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Walkthrough props JSON"), { target: { value: "{ not valid json" } });

    expect(screen.getByText(/Parse error/)).toBeInTheDocument();
    expect(screen.getByText(previousTitle)).toBeInTheDocument();
  });

  it("the broken fixture lists its issues", () => {
    render(<WalkthroughLabContent />);
    const broken = WALKTHROUGH_LAB_FIXTURES.find((f) => f.id === "broken")!;

    fireEvent.change(screen.getByRole("combobox", { name: "Fixture" }), { target: { value: broken.id } });

    // The dev banner inside Walkthrough itself also renders these codes -
    // getAllByText, not getByText, since both surfaces are expected to agree.
    expect(screen.getAllByText(/unknown-component/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/focus-edge-missing/).length).toBeGreaterThan(0);
  });

  it("the layout debug overlay toggles on", () => {
    render(<WalkthroughLabContent />);
    expect(screen.queryByText(/viewBox \d+x\d+/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("checkbox", { name: "Layout debug overlay" }));

    expect(screen.getByText(/viewBox \d+x\d+/)).toBeInTheDocument();
  });
});
