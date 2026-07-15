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
  /** Hex string, user-customizable via ZoneNode's ColorPicker (see
   * annotation-colors.ts for presets). Optional, not defaulted here, because
   * a zone saved before this field existed won't have one — ZoneNode falls
   * back to DEFAULT_ZONE_COLOR at render time rather than this type lying
   * about what's actually in old persisted data. */
  color?: string;
  validationState?: ValidationState;
};
export type ZoneNodeType = Node<ZoneNodeData, "zone">;

/**
 * A free-floating annotation note (see CommentNode.tsx) — meta-commentary
 * about the diagram, not part of it. Deliberately not the same visual
 * treatment as Zone: a comment isn't "part of the live system" the way a
 * zone grouping or a request-flow edge is, so it gets a plain static border,
 * no dashed motion.
 */
export type CommentNodeData = {
  text: string;
  width: number;
  height: number;
  /** Same optional/fallback reasoning as ZoneNodeData.color. */
  color?: string;
};
export type CommentNodeType = Node<CommentNodeData, "comment">;

/**
 * A fixed-size "entry point" marker (see StartNode.tsx) — points a reader at
 * where to start reading the diagram. `targetId` (a component node id, or
 * null/unset) is picked from an inline dropdown, not drawn by dragging a
 * handle — a real draggable edge would imply this is a request-flow
 * connection, and would also only reach components with an existing target
 * handle (e.g. Client has none, since it never receives requests). The
 * pointer arrow itself is a derived, canvas-only visual computed in
 * Canvas.tsx from this field — it's never added to `edges`/ArchitectureGraph
 * at all, so there's nothing for toArchitectureGraph to filter out.
 */
export type StartNodeData = {
  label: string;
  targetId?: string | null;
};
export type StartNodeType = Node<StartNodeData, "start">;

export type AnyNodeType = ComponentNodeType | ZoneNodeType | CommentNodeType | StartNodeType;

export type ArchitectureEdgeData = { kind: EdgeKind };
export type ArchitectureEdgeType = Edge<ArchitectureEdgeData>;
