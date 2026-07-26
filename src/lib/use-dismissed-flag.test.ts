import React from "react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDismissedFlag } from "./use-dismissed-flag";

afterEach(() => {
  localStorage.clear();
});

function Probe({ storageKey }: { storageKey: string }) {
  const [dismissed] = useDismissedFlag(storageKey);
  return React.createElement("div", null, String(dismissed));
}

describe("useDismissedFlag", () => {
  it("is false when nothing has been dismissed yet", () => {
    const { result } = renderHook(() => useDismissedFlag("hint-a"));
    expect(result.current[0]).toBe(false);
  });

  it("reflects a previously dismissed flag already in localStorage", () => {
    localStorage.setItem("hint-b", "1");
    const { result } = renderHook(() => useDismissedFlag("hint-b"));
    expect(result.current[0]).toBe(true);
  });

  it("becomes true after calling dismiss, and persists to localStorage", () => {
    const { result } = renderHook(() => useDismissedFlag("hint-c"));
    expect(result.current[0]).toBe(false);

    act(() => {
      result.current[1]();
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem("hint-c")).toBe("1");
  });

  it("notifies other subscribers via the shared listener set without corrupting their key's value", () => {
    const hookA = renderHook(() => useDismissedFlag("hint-d"));
    const hookB = renderHook(() => useDismissedFlag("hint-e"));
    expect(hookA.result.current[0]).toBe(false);
    expect(hookB.result.current[0]).toBe(false);

    act(() => {
      hookA.result.current[1](); // dismiss hint-d only
    });

    expect(hookA.result.current[0]).toBe(true);
    expect(hookB.result.current[0]).toBe(false); // unaffected — different key
  });

  it("defaults to dismissed=true on the server (getServerSnapshot), never flashing a hint that's already dismissed", () => {
    const html = renderToString(React.createElement(Probe, { storageKey: "ssr-key" }));
    expect(html).toContain("true");
  });
});
