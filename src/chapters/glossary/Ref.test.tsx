import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { HOVER_CLOSE_DELAY_MS, Ref } from "./Ref";
import * as pointerHoverModule from "./use-pointer-hover";

// jsdom has no ResizeObserver — Radix's Arrow observes its owning element's
// size, which throws without this. Same scoping rationale as popover.test.tsx.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

function mockPointerHover(canHover: boolean) {
  vi.spyOn(pointerHoverModule, "usePointerHover").mockReturnValue(canHover);
}

describe("Ref", () => {
  it("renders the trigger text for a known glossary id", () => {
    mockPointerHover(false);
    render(<Ref id="round-robin">round robin</Ref>);
    expect(screen.getByText("round robin")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "round robin" })).toBeInTheDocument();
  });

  it("renders children plain and warns for an unregistered id", () => {
    mockPointerHover(false);
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Ref id="not-a-real-term">some concept</Ref>);
    expect(screen.getByText("some concept")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("not-a-real-term"));
  });

  it("opens on trigger click and closes again on a second click", async () => {
    mockPointerHover(false);
    render(<Ref id="round-robin">round robin</Ref>);

    expect(screen.queryByText("Round Robin")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "round robin" }));
    await waitFor(() => expect(screen.getByText("Round Robin")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "round robin" }));
    await waitFor(() => expect(screen.queryByText("Round Robin")).not.toBeInTheDocument());
  });

  it("does not open on hover when the device has no real hover capability", async () => {
    mockPointerHover(false);
    render(<Ref id="round-robin">round robin</Ref>);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "round robin" }));
    // Give any (incorrect) async open a chance to happen before asserting absence.
    await new Promise((r) => setTimeout(r, 0));
    expect(screen.queryByText("Round Robin")).not.toBeInTheDocument();
  });

  it("opens on hover without a click when the device supports real hover", async () => {
    mockPointerHover(true);
    render(<Ref id="round-robin">round robin</Ref>);

    fireEvent.mouseEnter(screen.getByRole("button", { name: "round robin" }));
    await waitFor(() => expect(screen.getByText("Round Robin")).toBeInTheDocument());
  });

  it("keeps the popover open if the pointer re-enters before the close delay elapses", () => {
    vi.useFakeTimers();
    mockPointerHover(true);
    render(<Ref id="round-robin">round robin</Ref>);

    const trigger = screen.getByRole("button", { name: "round robin" });
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText("Round Robin")).toBeInTheDocument();

    // Simulates the pointer crossing the gap between trigger and content -
    // a mouseLeave immediately followed by a mouseEnter within the delay
    // window should cancel the pending close, not let it fire.
    fireEvent.mouseLeave(trigger);
    fireEvent.mouseEnter(trigger);
    act(() => {
      vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS + 50);
    });

    expect(screen.getByText("Round Robin")).toBeInTheDocument();
  });

  it("closes after the hover-close delay when the pointer leaves without re-entering", () => {
    vi.useFakeTimers();
    mockPointerHover(true);
    render(<Ref id="round-robin">round robin</Ref>);

    const trigger = screen.getByRole("button", { name: "round robin" });
    fireEvent.mouseEnter(trigger);
    expect(screen.getByText("Round Robin")).toBeInTheDocument();

    fireEvent.mouseLeave(trigger);
    act(() => {
      vi.advanceTimersByTime(HOVER_CLOSE_DELAY_MS + 50);
    });

    expect(screen.queryByText("Round Robin")).not.toBeInTheDocument();
  });
});
