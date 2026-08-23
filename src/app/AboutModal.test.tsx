import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutModal } from "./AboutModal";

describe("AboutModal", () => {
  it("explains the product's non-negotiables, not just its features", () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getAllByText("About ScaleCraft").length).toBeGreaterThan(0);
    expect(screen.getByText("Hints, not hand-holding")).toBeInTheDocument();
    expect(screen.getByText("Single-player, always")).toBeInTheDocument();
    expect(screen.getByText(/Why I built this/i)).toBeInTheDocument();
  });

  it("closes on the dialog's close control", () => {
    const onClose = vi.fn();
    render(<AboutModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
