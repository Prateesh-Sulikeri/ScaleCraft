import type { TourContext } from "./types";

/** True once the SQL Database from this chapter's starter graph is present -
 * role-based (componentId, not node instance id), so it stays true however
 * the component got there. Shared between `picker-tour`'s `waitFor` (has the
 * learner placed it) and its `requires` (has it since been removed again
 * while the step is still active) - they describe the same structural fact. */
export function hasSqlDatabase(ctx: TourContext): boolean {
  return ctx.presentComponentIds.includes("sql-database") && ctx.connectedComponentIds.includes("sql-database");
}

/** True once a request-flow edge connects Client and Application Server, in
 * either direction - role-based (componentIds, not the starter graph's own
 * edge instance id), so deleting the wrong edge and drawing a correct new
 * one still satisfies this. See pending-guided-tour.md's resilience
 * addendum, "A live bug that proves the diagnosis": the previous version of
 * this predicate was keyed to `bb-0-1-edge-client-app` directly and could
 * never become true again once that specific edge was deleted. Shared
 * between `fix-edge`'s `waitFor` and `requires` for the same reason as
 * `hasSqlDatabase` above. */
export function hasClientAppRequestFlowEdge(ctx: TourContext): boolean {
  return ctx.edges.some(
    (e) =>
      e.kind === "request-flow" &&
      ((e.sourceComponentId === "client" && e.targetComponentId === "app-server") ||
        (e.sourceComponentId === "app-server" && e.targetComponentId === "client")),
  );
}
