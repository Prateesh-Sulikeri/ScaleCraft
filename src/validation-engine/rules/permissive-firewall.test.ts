import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "../engine";
import { permissiveFirewall } from "./permissive-firewall";

describe("permissiveFirewall", () => {
  it("flags a Firewall configured with defaultPolicy: allow-all", () => {
    const fw = {
      id: "fw-1",
      componentId: "firewall",
      position: { x: 0, y: 0 },
      config: { defaultPolicy: "allow-all" },
    };
    const graph: ArchitectureGraph = { nodes: [fw], edges: [] };

    const violations = runValidation(graph, [permissiveFirewall]);
    expect(violations).toHaveLength(1);
    expect(violations[0].severity).toBe("warning");
    expect(violations[0].offendingNodeIds).toEqual(["fw-1"]);
  });

  it("passes for a default-deny or allow-listed policy", () => {
    const denyAll = {
      id: "fw-1",
      componentId: "firewall",
      position: { x: 0, y: 0 },
      config: { defaultPolicy: "deny-all" },
    };
    const allowListed = {
      id: "fw-2",
      componentId: "firewall",
      position: { x: 1, y: 0 },
      config: { defaultPolicy: "allow-listed" },
    };
    const graph: ArchitectureGraph = { nodes: [denyAll, allowListed], edges: [] };

    expect(runValidation(graph, [permissiveFirewall])).toHaveLength(0);
  });
});
