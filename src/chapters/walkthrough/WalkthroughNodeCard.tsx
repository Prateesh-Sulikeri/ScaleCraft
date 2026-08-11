import { Server } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "@/canvas/category-colors";
import { iconMap } from "@/canvas/icon-map";
import { HIGHLIGHT_GOLD_RING } from "@/canvas/selection-style";
import type { WalkthroughNode } from "./types";

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
 */
export function WalkthroughNodeCard({
  node,
  left,
  top,
  highlighted,
  dimmed,
}: {
  node: WalkthroughNode;
  left: number;
  top: number;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const resolved =
    node.kind === "component"
      ? (() => {
          const def = getComponent(node.componentId);
          return def ? { icon: def.icon, label: def.label, category: def.category } : null;
        })()
      : { icon: node.icon, label: node.label, category: node.category };

  if (!resolved) return null;

  const Icon = iconMap[resolved.icon] ?? Server;
  const categoryColor = categoryColorVar[resolved.category];

  return (
    <div
      className="absolute flex items-center gap-2 rounded-xl border border-border bg-panel px-3 py-2 shadow-sm transition-[box-shadow,opacity] duration-200 ease-out motion-reduce:transition-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: "translate(-50%, -50%)",
        boxShadow: highlighted ? HIGHLIGHT_GOLD_RING : undefined,
        opacity: dimmed ? 0.4 : 1,
      }}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 20%, transparent)` }}
      >
        <Icon size={16} style={{ color: categoryColor }} />
      </div>
      <div className="whitespace-nowrap text-sm font-semibold leading-tight text-foreground">{resolved.label}</div>
    </div>
  );
}
