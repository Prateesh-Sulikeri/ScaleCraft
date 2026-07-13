import type { Node, Edge } from "@xyflow/react";
import type { EdgeKind } from "@/lib/graph";

/** Derived/display-only — never persisted, never stored in the canvas store.
 * Computed fresh from validation results each render. See page.tsx. */
export type ValidationState = "valid" | "warning" | "error";

export type ComponentNodeData = {
  componentId: string;
  config: unknown;
  validationState?: ValidationState;
};
export type ComponentNodeType = Node<ComponentNodeData, "component">;

/**
 * A labeled grouping rectangle (see .claude/docs/ARCHITECTURE.md-adjacent
 * discussion — not part of ArchitectureGraph/the domain model, purely a
 * canvas presentation aid). v1 is visual-only: resizable and labeled, but
 * does not reparent contained component nodes or move them together. See
 * ZoneNode.tsx.
 */
export type ZoneNodeData = {
  label: string;
  width: number;
  height: number;
  validationState?: ValidationState;
};
export type ZoneNodeType = Node<ZoneNodeData, "zone">;

export type AnyNodeType = ComponentNodeType | ZoneNodeType;

export type ArchitectureEdgeData = { kind: EdgeKind };
export type ArchitectureEdgeType = Edge<ArchitectureEdgeData>;
