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
  /** Markdown, shown in the contextual docs panel. */
  docs: string;
};
