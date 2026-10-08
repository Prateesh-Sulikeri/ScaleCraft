import { describe, expect, it } from "vitest";
import { legalKindsFor, pickDefaultKind, pickDefaultKindFor } from "./legal-edge-kinds";
import { getComponent } from "@/content/components/registry";

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

describe("pickDefaultKindFor", () => {
  const def = (id: string) => {
    const d = getComponent(id);
    if (!d) throw new Error(id);
    return d;
  };

  it("defaults to the kind both contracts accept", () => {
    expect(pickDefaultKindFor(def("nosql-database"), def("coordinator"))).toBe("control");
    expect(pickDefaultKindFor(def("leader"), def("follower"))).toBe("replication");
  });

  it("keeps the category table's default when it is already legal", () => {
    expect(pickDefaultKindFor(def("load-balancer"), def("app-server"))).toBe("request-flow");
    expect(pickDefaultKindFor(def("app-server"), def("message-queue"))).toBe(
      pickDefaultKind("compute", "messaging"),
    );
  });
});
