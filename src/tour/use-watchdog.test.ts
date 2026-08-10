import { describe, it, expect, vi, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useWatchdog } from "./use-watchdog";

/** jsdom's document.visibilityState is a getter with no setter — stub it per
 * test, restore it afterwards so one test's "hidden" doesn't leak into the
 * next. */
function setVisibility(state: DocumentVisibilityState) {
  Object.defineProperty(document, "visibilityState", { value: state, configurable: true });
}

function fireVisibilityChange() {
  document.dispatchEvent(new Event("visibilitychange"));
}

afterEach(() => {
  vi.useRealTimers();
  setVisibility("visible");
});

describe("useWatchdog", () => {
  it("has not fired before the threshold elapses", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWatchdog(true, "step-1", 1000));
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(false);
  });

  it("fires once the threshold elapses while enabled", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWatchdog(true, "step-1", 1000));
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);
  });

  it("never fires while disabled", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWatchdog(false, "step-1", 1000));
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(false);
  });

  it("resets the budget and clears a prior fire when resetKey changes", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ key }) => useWatchdog(true, key, 1000), {
      initialProps: { key: "step-1" },
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);

    rerender({ key: "step-2" });
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(false);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe(true);
  });

  it("does not accumulate time while the document is hidden — a backgrounded tab never fires it", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useWatchdog(true, "step-1", 1000));

    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(result.current).toBe(false);

    act(() => {
      setVisibility("hidden");
      fireVisibilityChange();
      // A 20-minute tab-switch — would fire many times over if visibility
      // weren't respected.
      vi.advanceTimersByTime(20 * 60 * 1000);
    });
    expect(result.current).toBe(false);

    act(() => {
      setVisibility("visible");
      fireVisibilityChange();
    });
    expect(result.current).toBe(false); // only 600ms of the 1000ms budget spent so far

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe(true);
  });

  it("starts paused when the document is already hidden at mount", () => {
    setVisibility("hidden");
    vi.useFakeTimers();
    const { result } = renderHook(() => useWatchdog(true, "step-1", 1000));

    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current).toBe(false);

    act(() => {
      setVisibility("visible");
      fireVisibilityChange();
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBe(true);
  });
});
