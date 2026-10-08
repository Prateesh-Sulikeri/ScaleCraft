import { Server } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "@/canvas/category-colors";
import { iconMap } from "@/canvas/icon-map";
import { HIGHLIGHT_GOLD_RING } from "@/canvas/selection-style";
import { NODE_HEIGHT, NODE_WIDTH } from "./geometry";
import type { ResolvedWalkthroughNode } from "./normalize";

const FAULT_RING = "0 0 0 2px var(--state-error)";

/**
 * A read-only, non-interactive rendering of one WalkthroughNode - a
 * simplified sibling of canvas/ComponentNode.tsx's card anatomy (icon badge
 * + label, category-tinted) with none of that component's live-canvas
 * machinery (no resize handle, no React Flow Handle, no config popover).
 * Both node kinds resolve to the same { icon, label, category } shape and
 * render through this one path, per the Final Plan's "never reads as a
 * second system" requirement - `component` nodes look identical to their
 * sandbox counterpart, `custom` nodes look like a component that just
 * doesn't happen to be in the registry.
 *
 * Sized in percentages derived from NODE_WIDTH/NODE_HEIGHT against the
 * diagram's viewBox, NOT fixed CSS pixels: the edge anchors in geometry.ts
 * are computed in viewBox units, so a fixed-px card only lines up with them
 * when the container happens to render at exactly viewBox size. Percentages
 * keep the card and its anchors locked together at every container width.
 */
export function WalkthroughNodeCard({
  node,
  left,
  top,
  highlighted,
  faulted = false,
  dimmed,
  viewBoxWidth,
  viewBoxHeight,
}: {
  node: ResolvedWalkthroughNode;
  left: number;
  top: number;
  highlighted: boolean;
  faulted?: boolean;
  dimmed: boolean;
  viewBoxWidth: number;
  viewBoxHeight: number;
}) {
  const resolved =
    node.kind === "component"
      ? (() => {
          const def = getComponent(node.componentId);
          return def ? { icon: def.icon, label: node.label ?? def.label, category: def.category } : null;
        })()
      : { icon: node.icon, label: node.label, category: node.category };

  if (!resolved) return null;

  const Icon = iconMap[resolved.icon] ?? Server;
  const categoryColor = categoryColorVar[resolved.category];

  return (
    <div
      className="@container absolute flex items-center gap-1.5 overflow-hidden rounded-xl border border-border bg-panel px-2 shadow-sm @max-[8rem]:gap-1 @max-[8rem]:px-1.5 transition-[box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: `${(NODE_WIDTH / viewBoxWidth) * 100}%`,
        height: `${(NODE_HEIGHT / viewBoxHeight) * 100}%`,
        transform: "translate(-50%, -50%)",
        boxShadow: faulted ? FAULT_RING : highlighted ? HIGHLIGHT_GOLD_RING : undefined,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg @max-[8rem]:h-6 @max-[8rem]:w-6"
        style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 20%, transparent)` }}
      >
        <Icon size={15} style={{ color: categoryColor }} />
      </div>
      <div className="line-clamp-2 min-w-0 text-xs font-semibold leading-tight break-words text-foreground @max-[8rem]:text-[10px]">{resolved.label}</div>
    </div>
  );
}
