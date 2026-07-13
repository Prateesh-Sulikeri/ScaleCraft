"use client";

import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Monitor, Shuffle, Server, Database, type LucideIcon } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "./category-colors";

const iconMap: Record<string, LucideIcon> = {
  monitor: Monitor,
  shuffle: Shuffle,
  server: Server,
  database: Database,
};

export type ValidationState = "valid" | "warning" | "error";

export type ComponentNodeData = {
  componentId: string;
  validationState?: ValidationState;
};

export type ComponentNodeType = Node<ComponentNodeData, "component">;

const stateRingVar: Record<ValidationState, string> = {
  valid: "var(--state-valid)",
  warning: "var(--state-warning)",
  error: "var(--state-error)",
};

/**
 * The node "anatomy" described in .claude/docs/DESIGN_LANGUAGE.md: icon +
 * label + category color accent (left border) + validation state ring
 * (whole-card outline) — the two color channels stay visually distinct.
 */
export function ComponentNode({ data }: NodeProps<ComponentNodeType>) {
  const definition = getComponent(data.componentId);
  if (!definition) return null;

  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const ringColor = data.validationState ? stateRingVar[data.validationState] : "var(--border)";

  return (
    <div
      className="rounded-lg bg-panel px-4 py-3 min-w-[160px] shadow-sm"
      style={{
        borderLeft: `3px solid ${categoryColor}`,
        outline: `2px solid ${ringColor}`,
        outlineOffset: "1px",
      }}
    >
      {definition.inputs.length > 0 && (
        <Handle type="target" position={Position.Left} />
      )}
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: categoryColor }} />
        <span className="text-sm font-medium text-foreground">{definition.label}</span>
      </div>
      {definition.outputs.length > 0 && (
        <Handle type="source" position={Position.Right} />
      )}
    </div>
  );
}
