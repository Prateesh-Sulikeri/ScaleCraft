"use client";

import { Handle, NodeResizer, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { useCanvasStore } from "./store";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import type { ComponentNodeType, ValidationState } from "./types";

const MIN_WIDTH = 160;
const MIN_HEIGHT = 65;

const stateRingVar: Record<ValidationState, string> = {
  valid: "var(--state-valid)",
  warning: "var(--state-warning)",
  error: "var(--state-error)",
};

/**
 * The node "anatomy" described in .claude/docs/DESIGN_LANGUAGE.md: icon +
 * label + category color accent + validation state ring (whole-card
 * outline) — the two color channels stay visually distinct. Category color
 * now drives a tinted icon badge rather than a left border stripe.
 *
 * Shows a one-line description under the name — the per-instance
 * `data.description` if the user edited it in NodeConfigPopover, else
 * `definition.summary` (Phase 3 tried a Default/Configured config-state
 * badge here instead; reverted per user feedback in favor of this, back to
 * always-a-description).
 *
 * Resizable like Zone/Comment (store.ts's `resizeNode`, same top/left-handle
 * anchor fix) — width defaults to the original fixed 200px, height stays
 * content-driven (`data.height` is undefined pre-resize) but is floored at
 * MIN_HEIGHT via a real CSS `min-height`, not just NodeResizer's `minHeight`
 * prop (that alone only bounds the *drag*, it doesn't apply on first render —
 * confirmed by raising MIN_HEIGHT and seeing no visual change until this was
 * added).
 */
export function ComponentNode({ id, data, selected }: NodeProps<ComponentNodeType>) {
  const resizeNode = useCanvasStore((s) => s.resizeNode);
  const definition = getComponent(data.componentId);
  if (!definition) return null;

  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const ringColor = data.validationState ? stateRingVar[data.validationState] : "var(--border)";

  return (
    <div
      className="rounded-xl border border-border bg-panel px-3 py-2.5 shadow-sm transition-[outline-color] duration-150 ease-out"
      style={{
        width: data.width ?? 200,
        height: data.height,
        minHeight: MIN_HEIGHT,
        outline: `2px solid ${ringColor}`,
        outlineOffset: "1px",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={MIN_WIDTH}
        minHeight={MIN_HEIGHT}
        onResize={(_, params) => resizeNode(id, params.x, params.y, params.width, params.height)}
        lineStyle={{ borderColor: categoryColor }}
        handleStyle={{ backgroundColor: categoryColor, width: 8, height: 8, borderRadius: 2 }}
      />
      {definition.inputs.length > 0 && <Handle type="target" position={Position.Left} />}
      {/* Unconditional, invisible — a Start marker's pointer arrow (see
       * StartNode.tsx/Canvas.tsx) needs a target anchor on every component,
       * including ones with no real inputs (e.g. Client), so it can't reuse
       * the conditional target handle above. */}
      <Handle
        type="target"
        id="start-target"
        position={Position.Top}
        isConnectable={false}
        style={{ opacity: 0, pointerEvents: "none" }}
      />
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `color-mix(in srgb, ${categoryColor} 20%, transparent)` }}
        >
          <Icon size={16} style={{ color: categoryColor }} />
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="text-sm font-semibold leading-tight text-foreground">{definition.label}</div>
          {data.name?.trim() && (
            // The user's own instance label ("server-1-ind") — monospace to
            // read as an identifier, distinct from the label above it (same
            // code-shaped-text convention as DESIGN_LANGUAGE.md's
            // config-value typography). Shown alongside the label now, not
            // instead of it.
            <div className="mt-0.5 truncate font-mono text-[11px] leading-snug text-foreground/70">
              {data.name}
            </div>
          )}
          <div className="mt-1 truncate text-[11px] leading-snug text-foreground/50">
            {data.description ?? definition.summary}
          </div>
        </div>
      </div>
      {definition.outputs.length > 0 && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
