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

export type ArchitectureEdgeData = { kind: EdgeKind };
export type ArchitectureEdgeType = Edge<ArchitectureEdgeData>;
