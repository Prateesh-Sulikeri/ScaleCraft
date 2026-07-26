import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import {
  DESKTOP_MIN_WIDTH,
  TABLET_MIN_WIDTH,
  useIsLargeScreen,
  useRequiredWidth,
  useViewportWidth,
} from "./use-large-screen";

type PointerMock = {
  matches: boolean;
  addEventListener: (type: string, cb: () => void) => void;
  removeEventListener: (type: string, cb: () => void) => void;
  fire: () => void;
};

function createPointerMock(initialCoarse: boolean): PointerMock {
  const listeners = new Set<() => void>();
  return {
    matches: initialCoarse,
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

let pointerMock: PointerMock;

function installMatchMedia(initialCoarse: boolean) {
  pointerMock = createPointerMock(initialCoarse);
  window.matchMedia = vi.fn().mockImplementation((query: string) => {
    if (query === "(pointer: coarse)") return pointerMock;
    return { matches: false, addEventListener: () => {}, removeEventListener: () => {} };
  }) as unknown as typeof window.matchMedia;
}

function setViewport(opts: { width: number; screenWidth: number; screenHeight: number }) {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: opts.width,
  });
  Object.defineProperty(window.screen, "width", { configurable: true, value: opts.screenWidth });
  Object.defineProperty(window.screen, "height", { configurable: true, value: opts.screenHeight });
}

describe("useIsLargeScreen", () => {
  it("is true on a desktop-sized fine-pointer window", () => {
    installMatchMedia(false);
    setViewport({ width: 1280, screenWidth: 1280, screenHeight: 800 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(true);
  });

  it("is false on a fine-pointer window narrower than the desktop minimum", () => {
    installMatchMedia(false);
    setViewport({ width: 900, screenWidth: 900, screenHeight: 700 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(false);
  });

  it("is true on a tablet-sized coarse-pointer device", () => {
    installMatchMedia(true);
    setViewport({ width: 800, screenWidth: 800, screenHeight: 1200 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(true);
  });

  it("is false on a phone-sized coarse-pointer device even rotated to landscape", () => {
    installMatchMedia(true);
    // Viewport width alone looks tablet-sized, but the device's short side
    // (screen height here) is phone-sized — this is the loophole the
    // orientation-independent deviceMin check is meant to close.
    setViewport({ width: 900, screenWidth: 900, screenHeight: 430 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(false);
  });

  it("re-evaluates on window resize", () => {
    installMatchMedia(false);
    setViewport({ width: 900, screenWidth: 900, screenHeight: 700 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(false);

    setViewport({ width: 1280, screenWidth: 1280, screenHeight: 800 });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    expect(result.current).toBe(true);
  });

  it("re-evaluates on orientation change", () => {
    installMatchMedia(true);
    setViewport({ width: 800, screenWidth: 430, screenHeight: 800 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(false);

    setViewport({ width: 800, screenWidth: 800, screenHeight: 800 });
    act(() => {
      window.dispatchEvent(new Event("orientationchange"));
    });
    expect(result.current).toBe(true);
  });

  it("re-evaluates on pointer type change (e.g. a 2-in-1 switching modes)", () => {
    installMatchMedia(false);
    setViewport({ width: 900, screenWidth: 900, screenHeight: 900 });
    const { result } = renderHook(() => useIsLargeScreen());
    expect(result.current).toBe(false); // fine pointer, width 900 < DESKTOP_MIN_WIDTH

    pointerMock.matches = true;
    act(() => {
      pointerMock.fire();
    });
    // now coarse: width 900 >= TABLET_MIN_WIDTH and deviceMin 900 >= TABLET_MIN_WIDTH
    expect(result.current).toBe(true);
  });

  it("cleans up all listeners on unmount without throwing", () => {
    installMatchMedia(false);
    setViewport({ width: 1280, screenWidth: 1280, screenHeight: 800 });
    const { unmount } = renderHook(() => useIsLargeScreen());
    expect(() => unmount()).not.toThrow();
  });
});

describe("useViewportWidth", () => {
  it("returns the current window.innerWidth", () => {
    installMatchMedia(false);
    setViewport({ width: 1337, screenWidth: 1337, screenHeight: 800 });
    const { result } = renderHook(() => useViewportWidth());
    expect(result.current).toBe(1337);
  });

  it("falls back to DESKTOP_MIN_WIDTH on the server (getServerSnapshot)", () => {
    function Probe() {
      return React.createElement("div", null, String(useViewportWidth()));
    }
    const html = renderToString(React.createElement(Probe));
    expect(html).toContain(String(DESKTOP_MIN_WIDTH));
  });
});

describe("useRequiredWidth", () => {
  it("returns DESKTOP_MIN_WIDTH for a fine (mouse/trackpad) pointer", () => {
    installMatchMedia(false);
    setViewport({ width: 1280, screenWidth: 1280, screenHeight: 800 });
    const { result } = renderHook(() => useRequiredWidth());
    expect(result.current).toBe(DESKTOP_MIN_WIDTH);
  });

  it("returns TABLET_MIN_WIDTH for a coarse (touch) pointer", () => {
    installMatchMedia(true);
    setViewport({ width: 800, screenWidth: 800, screenHeight: 1200 });
    const { result } = renderHook(() => useRequiredWidth());
    expect(result.current).toBe(TABLET_MIN_WIDTH);
  });

  it("falls back to DESKTOP_MIN_WIDTH on the server (getServerSnapshot)", () => {
    function Probe() {
      return React.createElement("div", null, String(useRequiredWidth()));
    }
    const html = renderToString(React.createElement(Probe));
    expect(html).toContain(String(DESKTOP_MIN_WIDTH));
  });
});
