import { describe, expect, it } from "vitest";
import { componentRegistry } from "./registry";
import type { EdgeKind } from "@/lib/graph";

const ALL_KINDS: EdgeKind[] = ["request-flow", "control", "replication", "async"];

/**
 * Catches exactly the class of bug reported live: a component's own output
 * contract declares a target category/kind that no other component's input
 * contract reciprocates (or vice versa) — meaning that port can NEVER be
 * legally used by anything, despite looking like a normal connection in the
 * UI. Four real instances of this existed the first time relations were
 * authored across all 27 components (see the individual fix commits/comments
 * in content/components/config/*.ts): Cache -> Database, Read Replica ->
 * compute, Follower -> compute, and Coordinator being completely
 * unreachable. This test exists so a fifth one gets caught here, not by a
 * confused user staring at an unexplained rejection in the Sandbox.
 */
describe("component relations consistency", () => {
  it("every component with a declared input port can be legally satisfied by at least one other component's output", () => {
    const unsatisfiable: string[] = [];

    for (const target of componentRegistry) {
      if (target.inputs.length === 0) continue; // no input port — nothing to satisfy
      const inputContract = target.relations?.inputs;
      // No declared contract at all falls back to the coarse category
      // matrix (canvas/legal-edge-kinds.ts) elsewhere — that fallback path
      // is covered by its own tests, not this one, which only checks
      // components that DID declare a contract.
      if (!inputContract) continue;

      const canBeSatisfied = componentRegistry.some((source) => {
        if (source.outputs.length === 0) return false;
        const outputContract = source.relations?.outputs;

        const categoryOk =
          (!inputContract.allowedCategories || inputContract.allowedCategories.includes(source.category)) &&
          (!outputContract?.allowedCategories || outputContract.allowedCategories.includes(target.category));
        if (!categoryOk) return false;

        return ALL_KINDS.some(
          (kind) =>
            (!inputContract.allowedKinds || inputContract.allowedKinds.includes(kind)) &&
            (!outputContract?.allowedKinds || outputContract.allowedKinds.includes(kind)),
        );
      });

      if (!canBeSatisfied) unsatisfiable.push(target.id);
    }

    expect(unsatisfiable).toEqual([]);
  });

  it("every component with a declared output port can legally reach at least one other component's input", () => {
    const unreachable: string[] = [];

    for (const source of componentRegistry) {
      if (source.outputs.length === 0) continue;
      const outputContract = source.relations?.outputs;
      if (!outputContract) continue;

      const canReachSomething = componentRegistry.some((target) => {
        if (target.inputs.length === 0) return false;
        const inputContract = target.relations?.inputs;

        const categoryOk =
          (!outputContract.allowedCategories || outputContract.allowedCategories.includes(target.category)) &&
          (!inputContract?.allowedCategories || inputContract.allowedCategories.includes(source.category));
        if (!categoryOk) return false;

        return ALL_KINDS.some(
          (kind) =>
            (!outputContract.allowedKinds || outputContract.allowedKinds.includes(kind)) &&
            (!inputContract?.allowedKinds || inputContract.allowedKinds.includes(kind)),
        );
      });

      if (!canReachSomething) unreachable.push(source.id);
    }

    expect(unreachable).toEqual([]);
  });
});
