"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Server } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import type { ComponentNodeType, ValidationState } from "./types";

const stateRingVar: Record<ValidationState, string> = {
  valid: "var(--state-valid)",
  warning: "var(--state-warning)",
  error: "var(--state-error)",
};

/**
 * The node "anatomy" described in .claude/docs/DESIGN_LANGUAGE.md: icon +
 * label + category color accent + validation state ring (whole-card
 * outline) — the two color channels stay visually distinct. Category color
 * now drives a tinted icon badge rather than a left border stripe, and each
 * node carries its one-line `summary` so the canvas is legible without
 * opening the inspector for every component.
 */
export function ComponentNode({ data }: NodeProps<ComponentNodeType>) {
  const definition = getComponent(data.componentId);
  if (!definition) return null;

  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const ringColor = data.validationState ? stateRingVar[data.validationState] : "var(--border)";

  return (
    <div
      className="w-[200px] rounded-xl border border-border bg-panel px-3 py-2.5 shadow-sm transition-[outline-color] duration-150 ease-out"
      style={{ outline: `2px solid ${ringColor}`, outlineOffset: "1px" }}
    >
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
          <div className="mt-0.5 text-xs leading-snug text-foreground/60">{definition.summary}</div>
        </div>
      </div>
      {definition.outputs.length > 0 && <Handle type="source" position={Position.Right} />}
    </div>
  );
}
