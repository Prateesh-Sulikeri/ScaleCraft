import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StatusFilter } from "./StatusFilter";

describe("StatusFilter", () => {
  it("marks exactly one option pressed and reports the value it was clicked with", () => {
    const onChange = vi.fn();
    render(<StatusFilter value="ALL" onChange={onChange} />);

    expect(screen.getByRole("button", { name: "All" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Completed" })).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(screen.getByRole("button", { name: "In progress" }));
    expect(onChange).toHaveBeenCalledWith("IN_PROGRESS");
  });
});
