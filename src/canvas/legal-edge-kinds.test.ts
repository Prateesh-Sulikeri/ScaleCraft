import { describe, expect, it } from "vitest";
import { legalKindsFor, pickDefaultKind } from "./legal-edge-kinds";

describe("legalKindsFor", () => {
  it("returns the listed kinds for a known pair", () => {
    expect(legalKindsFor("networking", "compute")).toEqual(["request-flow"]);
  });

  it("default-denies an unlisted pair (returns empty, not everything)", () => {
    expect(legalKindsFor("networking", "distributed-systems")).toEqual([]);
    expect(legalKindsFor("data", "networking")).toEqual([]);
  });
});

describe("pickDefaultKind", () => {
  it("picks the first legal kind for an allowed pair", () => {
    expect(pickDefaultKind("compute", "data")).toBe("request-flow");
  });

  it("falls back to request-flow for a pair with nothing legal", () => {
    expect(pickDefaultKind("networking", "distributed-systems")).toBe("request-flow");
  });
});
