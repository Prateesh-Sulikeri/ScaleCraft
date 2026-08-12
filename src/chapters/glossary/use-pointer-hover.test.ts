import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePointerHover } from "./use-pointer-hover";

type HoverMock = {
  matches: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
  fire: () => void;
};

function createHoverMock(initial: boolean): HoverMock {
  const listeners = new Set<() => void>();
  return {
    matches: initial,
    addEventListener: (_type, cb) => {
      listeners.add(cb);
    },
    removeEventListener: (_type, cb) => {
      listeners.delete(cb);
    },
    fire() {
      listeners.forEach((l) => l());
    },
  };
}

let hoverMock: HoverMock;

function installMatchMedia(initial: boolean) {
  hoverMock = createHoverMock(initial);
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    if (query === "(hover: hover)") return hoverMock;
    return { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
  }) as unknown as typeof window.matchMedia;
}

describe("usePointerHover", () => {
  it("is false when the device has no real hover capability", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => usePointerHover());
    expect(result.current).toBe(false);
  });

  it("is true when the device supports real hover", () => {
    installMatchMedia(true);
    const { result } = renderHook(() => usePointerHover());
    expect(result.current).toBe(true);
  });

  it("re-evaluates on a hover-capability change (e.g. a 2-in-1 switching modes)", () => {
    installMatchMedia(false);
    const { result } = renderHook(() => usePointerHover());
    expect(result.current).toBe(false);

    hoverMock.matches = true;
    act(() => {
      hoverMock.fire();
    });
    expect(result.current).toBe(true);
  });

  it("falls back to false when window.matchMedia is unavailable", () => {
    const original = window.matchMedia;
    // @ts-expect-error - simulating a non-browser/older environment
    delete window.matchMedia;

    expect(() => renderHook(() => usePointerHover())).not.toThrow();
    const { result } = renderHook(() => usePointerHover());
    expect(result.current).toBe(false);

    window.matchMedia = original;
  });

  it("cleans up listeners on unmount without throwing", () => {
    installMatchMedia(true);
    const { unmount } = renderHook(() => usePointerHover());
    expect(() => unmount()).not.toThrow();
  });
});
