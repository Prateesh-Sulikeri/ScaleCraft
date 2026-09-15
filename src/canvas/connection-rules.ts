import { getComponent } from "@/content/components/registry";
import type { AnyNodeType } from "./types";

/**
 * Whether a dragged connection may become an edge.
 *
 * This exists because the canvas runs `connectionMode="loose"`. Loose mode
 * lets a drop land on whichever handle is nearest - including a *source*
 * handle on the destination node - which is what makes the whole card a drop
 * target rather than one 9px dot, and what stops a drag near the bottom edge
 * of a card from dying silently on that card's bottom source handle. The cost
 * is that handle *type* no longer enforces direction, so the rule it used to
 * enforce geometrically is restated here.
 *
 * Deliberately narrow: it rejects only connections that have nowhere to
 * attach (a Client declares no inputs at all), never ones that merely look
 * like bad architecture. Judging the architecture is the validation engine's
 * job, and it owes the user an explanation - silently refusing the drag would
 * be exactly the bare "invalid" the product principles forbid.
 */
export function canConnect(
  source: AnyNodeType | undefined,
  target: AnyNodeType | undefined,
): boolean {
  if (!source || !target || source.id === target.id) return false;

  // A Start marker points at a component rather than wiring into it. Its
  // pointer edge is canvas-only and derived, never routed through here, but a
  // user-initiated drag off one should still land.
  if (source.type === "start") return target.type === "component";

  if (source.type !== "component" || target.type !== "component") return false;

  const sourceDef = getComponent(source.data.componentId);
  const targetDef = getComponent(target.data.componentId);
  return (sourceDef?.outputs.length ?? 0) > 0 && (targetDef?.inputs.length ?? 0) > 0;
}
