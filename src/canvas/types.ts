import type { Node, Edge } from "@xyflow/react";
import type { EdgeKind } from "@/lib/graph";

/** Derived/display-only — never persisted, never stored in the canvas store.
 * Computed fresh from validation results each render. See page.tsx. */
export type ValidationState = "valid" | "warning" | "error";

export type ComponentNodeData = {
  componentId: string;
  config: unknown;
  validationState?: ValidationState;
  /** A user-chosen instance label ("server-1-ind"), separate from the
   * ComponentDefinition's fixed type label ("Application Server") — set via
   * NodeInspector, shown on the canvas card alongside the type label when
   * present. Also what disambiguates same-type nodes in the Start marker's
   * target picker (see component-display-name.ts). */
  name?: string;
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
  /** Disables dragging and hides the NodeResizer handles (see ZoneNode.tsx)
   * — a diagram someone has finished arranging can be protected from
   * accidental bumps. Toggled via the lock button (always visible) or the
   * right-click context menu; label/color stay editable while locked. */
  locked?: boolean;
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
  /** Same lock semantics as ZoneNodeData.locked. */
  locked?: boolean;
};
export type CommentNodeType = Node<CommentNodeData, "comment">;

/**
 * A "Flag" (see StartNode.tsx) — a labeled, user-colored marker pointing at
 * a component, general-purpose (not only "start reading here" anymore —
 * `color` lets one mean "known issue," another mean "verified path," etc).
 * `targetId` (a component node id, or null/unset) is picked from a
 * searchable popover (see StartTargetPicker.tsx), not drawn by dragging a
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
  /** Same optional/fallback reasoning as ZoneNodeData.color — falls back to
   * DEFAULT_FLAG_COLOR at render time. */
  color?: string;
  /** Same lock semantics as ZoneNodeData.locked. */
  locked?: boolean;
};
export type StartNodeType = Node<StartNodeData, "start">;

export type AnyNodeType = ComponentNodeType | ZoneNodeType | CommentNodeType | StartNodeType;

export type ArchitectureEdgeData = { kind: EdgeKind };
export type ArchitectureEdgeType = Edge<ArchitectureEdgeData>;
