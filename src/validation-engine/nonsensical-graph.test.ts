import { describe, expect, it } from "vitest";
import type { ArchitectureGraph } from "@/lib/graph";
import { runValidation } from "./engine";
import { ruleRegistry } from "./rules";

/**
 * The exact failure mode that triggered milestone 5 (see MILESTONES.md /
 * NEXT_STEPS.md Step 3.2 and validation_agent_design.md §1's taxonomy): a
 * single graph combining several distinct "nonsensical" shapes, run through
 * the *full* registry at once (not one rule in isolation, like every other
 * rule's own `.test.ts`) — so a precedence or aggregation bug between rules
 * can't hide a case that each rule's isolated test would still catch on its
 * own. Rebuilding this from CLAUDE.md's non-negotiable "explanation always
 * shown on failure" principle: every violation below must also carry a
 * real explanation, not just fire.
 */
describe("full ruleRegistry against a visibly nonsensical graph", () => {
  const browser = { id: "browser-1", componentId: "browser", position: { x: 0, y: 0 }, config: {} };
  const leader = { id: "leader-1", componentId: "leader", position: { x: 1, y: 0 }, config: {} };
  const cdn = { id: "cdn-1", componentId: "cdn", position: { x: 2, y: 0 }, config: {} };
  const cron = { id: "cron-1", componentId: "cron-job", position: { x: 3, y: 0 }, config: {} };
  const appServer = { id: "app-1", componentId: "app-server", position: { x: 4, y: 0 }, config: {} };
  const cache = { id: "cache-1", componentId: "cache", position: { x: 5, y: 0 }, config: {} };

  const graph: ArchitectureGraph = {
    nodes: [browser, leader, cdn, cron, appServer, cache],
    edges: [
      // Browser wired straight into a Leader — category-illegal per the
      // Leader's own declared input contract (compute/distributed-systems
      // only), the literal "reported bug" this doc's design section cites.
      { id: "e1", source: "browser-1", target: "leader-1", kind: "request-flow" },
      // App Server -> Cache, right category (compute), wrong kind
      // ("async" instead of the Cache's only declared allowedKind,
      // "request-flow") — a kind-dodging edge: legal-looking pairing,
      // illegal specific connection.
      { id: "e2", source: "app-1", target: "cache-1", kind: "async" },
      // cdn-1 and cron-1 are deliberately given zero edges — disconnected
      // orphans, not wired to anything at all.
    ],
    entryPointIds: [],
  };

  const violations = runValidation(graph, ruleRegistry);

  it("reports at least one violation per distinct broken shape, not zero", () => {
    expect(violations.length).toBeGreaterThan(0);
  });

  it("flags the disconnected CDN and Cron Job as orphans", () => {
    const orphanIds = violations
      .filter((v) => v.ruleId === "orphan-component")
      .flatMap((v) => v.offendingNodeIds);
    expect(orphanIds).toContain("cdn-1");
    expect(orphanIds).toContain("cron-1");
  });

  it("flags Browser -> Leader via component-relations", () => {
    const hit = violations.find(
      (v) => v.ruleId === "component-relations" && v.offendingNodeIds.includes("leader-1"),
    );
    expect(hit).toBeDefined();
    expect(hit?.explanation).toContain("Leader");
  });

  it("flags the kind-dodging App Server -> Cache (async) edge via component-relations", () => {
    const hit = violations.find(
      (v) => v.ruleId === "component-relations" && v.offendingEdgeIds.includes("e2"),
    );
    expect(hit).toBeDefined();
  });

  it("every violation carries a non-empty message and explanation (CLAUDE.md: explanation always shown)", () => {
    for (const v of violations) {
      expect(v.message.length).toBeGreaterThan(0);
      expect(v.explanation.length).toBeGreaterThan(0);
    }
  });
});
