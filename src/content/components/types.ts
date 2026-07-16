import type { ZodType } from "zod";
import type { EdgeKind } from "@/lib/graph";

/**
 * Matches the category color system in .claude/docs/DESIGN_LANGUAGE.md —
 * keep these two in sync if a category is ever added.
 */
export type ComponentCategory =
  | "networking"
  | "compute"
  | "data"
  | "caching"
  | "messaging"
  | "distributed-systems";

export type PortSpec = {
  id: string;
  label: string;
};

/**
 * One direction's worth of a component's relational contract — see
 * `ComponentRelations` below for the full rationale. Both fields are
 * independently optional: a component can constrain kind without
 * constraining category, or vice versa, or neither (falls back to the
 * coarse category-level check in validation-engine/rules/component-relations.ts).
 */
export type PortRelationConstraint = {
  /** Legal categories for the *other* endpoint of a connection through this
   * side — for `inputs`, which categories may be the connection's source;
   * for `outputs`, which categories may be the connection's target.
   * Omitted = unconstrained by category (falls back to the coarse
   * category-pair matrix in canvas/legal-edge-kinds.ts). */
  allowedCategories?: ComponentCategory[];
  /** Legal EdgeKinds for a connection through this side. Omitted =
   * unconstrained by kind (same fallback as above). */
  allowedKinds?: EdgeKind[];
};

/**
 * A component's own declared relational contract — "explicitly have valid
 * and invalid relations," authored once, where the component itself is
 * defined, instead of approximated after the fact by cross-cutting rules
 * that have to guess at what a specific component should allow. See
 * validation-engine/rules/component-relations.ts for how this is checked,
 * and .claude/docs/validation_agent_design.md for the full rationale this
 * superseded (a flat category-pair matrix plus several separate rules for
 * adjacency/ordering/kind-legality/missing-input, each an imprecise
 * approximation of what's really a property of one component).
 *
 * Deliberately NODE-level, not per-port: `GraphEdge` (see lib/graph.ts) has
 * no concept of which specific port an edge attaches to, only source/target
 * node ids — so a component with multiple input or output ports gets one
 * aggregate contract across all of them, not one per port. If the graph
 * model ever gains port-level edges, this can be split per-port without
 * changing its shape much.
 *
 * Only meaningful for base-pack components — see registry.ts's "adding a
 * component" comment for the authoring convention this implies. Custom,
 * user-authored components (content/components/custom.ts) never populate
 * this; there is deliberately no UI for a user to author their own
 * contract (see .claude/docs/OPEN_QUESTIONS.md) — they fall back entirely
 * to the coarse category-level checks, which still apply to them since
 * `category` is something every component (custom or not) always declares.
 */
export type ComponentRelations = {
  /** Only meaningful if `inputs` is non-empty. A component with a declared
   * input port always needs at least one incoming connection regardless of
   * whether this is specified — that check (missing-input-connection's old
   * job, now folded into component-relations.ts) doesn't depend on a
   * contract existing at all, only on the port existing. */
  inputs?: PortRelationConstraint;
  outputs?: PortRelationConstraint;
};

/**
 * The concrete form of INITIAL_THOUGHTS.md's "Component Philosophy."
 * Registered once in the global registry (see registry.ts); chapters opt a
 * subset in by id, they never redefine a component. See
 * .claude/docs/ARCHITECTURE.md ("Component Definition").
 */
export type ComponentDefinition<Config = unknown> = {
  id: string;
  category: ComponentCategory;
  label: string;
  /** Lucide icon name, e.g. "server" — see DESIGN_LANGUAGE.md iconography. */
  icon: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  configSchema: ZodType<Config>;
  defaultConfig: Config;
  /** One short line (roughly 40-60 chars) shown directly on the canvas node,
   * under the label — a caption, not documentation. Keep it terse; the full
   * explanation belongs in `docs`, not here. */
  summary: string;
  /** Markdown, shown in the contextual docs panel. */
  docs: string;
  /** See `ComponentRelations` above. Omitted entirely (not just empty
   * fields) for any component with no declared contract — base-pack
   * components should populate this (see registry.ts); custom components
   * never do. */
  relations?: ComponentRelations;
};

/**
 * One config field on a declaratively-authored component (see
 * src/content/components/config/*.ts and CreateComponentModal.tsx). A
 * discriminated union, not a single shape with optional fields — `kind`
 * picks which of `min`/`max`/`int`/`options` are even meaningful, mirroring
 * how ConfigForm.tsx reads a real ComponentDefinition's Zod schema by
 * instanceof-checking ZodEnum/ZodNumber/ZodBoolean/ZodString.
 */
export type ConfigFieldSpec =
  | { kind: "string"; name: string; label: string; default: string }
  | {
      kind: "number";
      name: string;
      label: string;
      default: number;
      min?: number;
      max?: number;
      /** Every built-in numeric field is integer-only; user-authored custom
       * components default to plain (non-integer) numbers. */
      int?: boolean;
    }
  | { kind: "boolean"; name: string; label: string; default: boolean }
  | { kind: "enum"; name: string; label: string; default: string; options: string[] };

/**
 * The declarative, JSON-shaped source a `ComponentDefinition` is generated
 * from (see generate.ts's `generateComponentDefinition`) — data only, no
 * live Zod schema. This is what src/content/components/config/*.ts files
 * export; adding a built-in component means adding one of these to the
 * right category file, nothing else.
 */
export type ComponentConfigSpec = {
  id: string;
  category: ComponentCategory;
  label: string;
  icon: string;
  inputs: PortSpec[];
  outputs: PortSpec[];
  fields: ConfigFieldSpec[];
  summary: string;
  docs: string;
  /** See `ComponentRelations` above — threaded through unchanged into the
   * generated `ComponentDefinition` by generate.ts. Every base-pack
   * component (one object in a `config/*.ts` file) should populate this —
   * see registry.ts's "adding a component" comment. */
  relations?: ComponentRelations;
};
