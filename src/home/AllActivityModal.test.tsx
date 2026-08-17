import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AllActivityModal } from "./AllActivityModal";
import type { ActivityEntry } from "./home-data";

const NOW = Date.parse("2026-08-17T12:00:00");

const entry = (id: string, mode: ActivityEntry["mode"], daysAgo: number): ActivityEntry => ({
  id,
  mode,
  title: `Item ${id}`,
  status: "In progress",
  at: NOW - daysAgo * 86_400_000,
  href: mode === "sandbox" ? null : `/${mode}/${id}/lesson`,
});

const activity: ActivityEntry[] = [
  entry("a", "building-blocks", 1),
  entry("b", "building-blocks", 2),
  entry("c", "real-world-extraction", 3),
  entry("d", "sandbox", 4),
];

describe("AllActivityModal", () => {
  it("lists every tracked row, not just the card's preview", () => {
    render(<AllActivityModal activity={activity} now={NOW} onClose={vi.fn()} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(activity.length + 3); // + the donut legend's three modes
    for (const id of ["a", "b", "c", "d"]) expect(screen.getByText(`Item ${id}`)).toBeInTheDocument();
  });

  it("counts the split by mode, with percentages that add up to 100", () => {
    render(<AllActivityModal activity={activity} now={NOW} onClose={vi.fn()} />);
    // 2/1/1 of four -> 50 / 25 / 25.
    expect(screen.getByText("50%")).toBeInTheDocument();
    expect(screen.getAllByText("25%")).toHaveLength(2);
    expect(screen.getByRole("img", { name: /4 items total/ })).toBeInTheDocument();
  });

  it("says nothing is tracked rather than drawing an empty ring", () => {
    render(<AllActivityModal activity={[]} now={NOW} onClose={vi.fn()} />);
    expect(screen.getByText(/Nothing tracked yet/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<AllActivityModal activity={activity} now={NOW} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });
});
