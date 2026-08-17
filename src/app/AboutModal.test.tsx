import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AboutModal } from "./AboutModal";

describe("AboutModal", () => {
  it("explains the product's non-negotiables, not just its features", () => {
    render(<AboutModal onClose={vi.fn()} />);
    expect(screen.getByText("About ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText(/not a game/)).toBeInTheDocument();
    expect(screen.getByText(/Hints are always optional/)).toBeInTheDocument();
    expect(screen.getByText(/single-player, permanently/)).toBeInTheDocument();
  });

  it("closes on the dialog's close control", () => {
    const onClose = vi.fn();
    render(<AboutModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
