import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNow } from "./use-now";

afterEach(() => {
  vi.useRealTimers();
});

describe("useNow", () => {
  it("returns a real timestamp on the client", () => {
    const { result } = renderHook(() => useNow());
    expect(typeof result.current).toBe("number");
    expect(result.current).toBeGreaterThan(0);
  });

  it("is stable between ticks, so it cannot loop a render", () => {
    const { result, rerender } = renderHook(() => useNow());
    const first = result.current;
    rerender();
    rerender();
    expect(result.current).toBe(first);
  });

  it("advances once the interval fires", () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useNow());
    const before = result.current!;
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current!).toBeGreaterThan(before);
  });

  it("shares one timer across subscribers and clears it on the last unmount", () => {
    vi.useFakeTimers();
    const setSpy = vi.spyOn(globalThis, "setInterval");
    const clearSpy = vi.spyOn(globalThis, "clearInterval");

    const a = renderHook(() => useNow());
    const b = renderHook(() => useNow());
    expect(setSpy).toHaveBeenCalledTimes(1);

    a.unmount();
    expect(clearSpy).not.toHaveBeenCalled();
    b.unmount();
    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
