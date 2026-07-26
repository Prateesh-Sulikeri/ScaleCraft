import React from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import { useHasMounted } from "./use-has-mounted";

function Probe() {
  const mounted = useHasMounted();
  return React.createElement("div", null, String(mounted));
}

describe("useHasMounted", () => {
  it("is true once mounted on the client", () => {
    const { result } = renderHook(() => useHasMounted());
    expect(result.current).toBe(true);
  });

  it("is false on the server (getServerSnapshot), avoiding a hydration mismatch", () => {
    const html = renderToString(React.createElement(Probe));
    expect(html).toContain("false");
  });
});
