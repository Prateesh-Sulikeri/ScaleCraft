import { memo } from "react";
import { ChevronDown } from "lucide-react";
import { CARD_WIDTH } from "@/canvas/card-geometry";
import type { Node, NodeTypes } from "@xyflow/react";

export const START_BADGE_WIDTH = 64;
export const START_BADGE_HEIGHT = 34;
export const START_BADGE_GAP = 16;

export type ReferenceStartBadgeData = Record<string, never>;
export type ReferenceStartBadgeType = Node<ReferenceStartBadgeData, "referenceStart">;

/**
 * The read-only counterpart to StartNode.tsx's Flag, for a referenceGraph's
 * entryPointIds - stripped to a label and a direction arrow, since nothing
 * here is ever edited (no color, no target picker, no lock/pencil chrome).
 * Positioned by ReferenceGraphCanvas directly above the entry node it marks;
 * `left` centers it over CARD_WIDTH rather than reusing the live Flag's own
 * 180px width, which would overhang a 120px-wide reference card badly.
 */
function ReferenceStartBadgeInner() {
  return (
    <div
      className="flex flex-col items-center text-foreground/60"
      style={{ width: START_BADGE_WIDTH, marginLeft: (CARD_WIDTH - START_BADGE_WIDTH) / 2 }}
    >
      <span className="rounded-full border border-border bg-panel px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        Start
      </span>
      <ChevronDown size={14} className="opacity-70" />
    </div>
  );
}

export const ReferenceStartBadge = memo(ReferenceStartBadgeInner);

export const referenceStartNodeTypes: NodeTypes = { referenceStart: ReferenceStartBadge };
