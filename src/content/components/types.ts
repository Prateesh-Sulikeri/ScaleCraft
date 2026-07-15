import type { ZodType } from "zod";

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
};
