import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { SaveToast } from "./SaveToast";

describe("SaveToast", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when savedAt is null", () => {
    render(<SaveToast savedAt={null} />);
    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });

  it("shows a 'Saved' confirmation once savedAt is set", () => {
    render(<SaveToast savedAt={Date.now()} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("re-shows on a new savedAt timestamp, remounting via the key", () => {
    const { rerender } = render(<SaveToast savedAt={1000} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    rerender(<SaveToast savedAt={1000} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    rerender(<SaveToast savedAt={2000} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();
  });

  it("auto-dismisses after the timeout elapses, leaving nothing in the DOM", () => {
    vi.useFakeTimers();
    render(<SaveToast savedAt={Date.now()} />);
    expect(screen.getByText("Saved")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1800);
    });

    expect(screen.queryByText("Saved")).not.toBeInTheDocument();
  });
});
