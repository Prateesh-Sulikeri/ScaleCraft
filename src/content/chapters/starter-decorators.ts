/**
 * Zones/comments authored into a chapter's `starterGraph` - see
 * .claude/docs/pending-starter-decorators.md for why this is a field
 * separate from `ArchitectureGraph` rather than folded into it, and for the
 * color->demarcation convention and geometry formula chapter authors should
 * follow (`.claude/docs/CURRICULUM.md` §11.5 mirrors the same conventions
 * for future authoring).
 *
 * Deliberately a small authored union, not raw `AnyNodeType` React Flow
 * objects (`src/canvas/types.ts`) - authoring a chapter shouldn't require
 * knowing React Flow's node shape (`type`, `zIndex`, `data` nesting). See
 * `toDecoratorNodes` below for the one place that maps between them.
 */

import type { XY } from "@/lib/graph";
import type { AnyNodeType } from "@/canvas/types";

export type StarterZoneDecorator = {
  kind: "zone";
  id: string;
  label: string;
  position: XY;
  width: number;
  height: number;
  /** Hex string - should be one of ANNOTATION_COLOR_PRESETS
   * (src/canvas/annotation-colors.ts); enforced by authoring-invariants.test.ts. */
  color: string;
  /** Defaults to true - see pending-starter-decorators.md decision 2. An
   * authored zone is a diagram fixture, not something the learner is meant
   * to be nudged into rearranging first. */
  locked?: boolean;
};

export type StarterCommentDecorator = {
  kind: "comment";
  id: string;
  text: string;
  position: XY;
  width: number;
  height: number;
  color?: string;
  locked?: boolean;
};

/** Not authored into any starterGraph this pass (see pending doc's "Chapter
 * scope" section) - included for type completeness with AnyNodeType/the
 * canvas's own Flag concept, so a future chapter can use one without a type
 * change. */
export type StarterFlagDecorator = {
  kind: "flag";
  id: string;
  label: string;
  position: XY;
  targetId?: string;
  color?: string;
  locked?: boolean;
};

export type StarterDecorator = StarterZoneDecorator | StarterCommentDecorator | StarterFlagDecorator;

/**
 * Maps authored decorators to the canvas's React Flow node shape - the same
 * shape `loadCanvasState`/a persisted save uses, so a decorator that arrives
 * via `loadGraph` is indistinguishable on canvas from one a learner drew
 * themselves. `zIndex: -1` matches `store.tsx`'s `addZone`/`addComment` (zones
 * and comments always render behind component nodes, regardless of array
 * order).
 */
export function toDecoratorNodes(decorators: StarterDecorator[]): AnyNodeType[] {
  return decorators.map((d): AnyNodeType => {
    const locked = d.locked ?? true;
    switch (d.kind) {
      case "zone":
        return {
          id: d.id,
          type: "zone",
          position: d.position,
          zIndex: -1,
          data: { label: d.label, width: d.width, height: d.height, color: d.color, locked },
        };
      case "comment":
        return {
          id: d.id,
          type: "comment",
          position: d.position,
          zIndex: -1,
          data: { text: d.text, width: d.width, height: d.height, color: d.color, locked },
        };
      case "flag":
        return {
          id: d.id,
          type: "start",
          position: d.position,
          zIndex: -1,
          data: { label: d.label, targetId: d.targetId ?? null, color: d.color, locked },
        };
    }
  });
}
