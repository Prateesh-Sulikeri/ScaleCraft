import type { ComponentDefinition, ComponentCategory, ConfigFieldSpec } from "./types";
import { generateComponentDefinition } from "./generate";

/**
 * One config field a user defines when creating their own component (see
 * CreateComponentModal.tsx) — the same declarative shape built-in
 * components use, see `ConfigFieldSpec` in types.ts. Re-exported under this
 * name since it's what this module's own field is called and what
 * CreateComponentModal.tsx already imports.
 */
export type CustomFieldSpec = ConfigFieldSpec;

/**
 * What actually gets stored (src/persistence/db.ts's customComponents
 * table) — a plain-data description of a component, not a ComponentDefinition
 * itself. A real ComponentDefinition needs a live Zod `configSchema`
 * instance, which isn't JSON-serializable; `toComponentDefinition` below
 * builds one at runtime instead of trying to persist it directly.
 */
export type CustomComponentRecord = {
  id: string;
  category: ComponentCategory;
  label: string;
  /** A lucide-react icon key — see src/canvas/icon-map.ts's existing set. */
  icon: string;
  summary: string;
  docs: string;
  hasInput: boolean;
  hasOutput: boolean;
  fields: CustomFieldSpec[];
};

/**
 * Builds a real ComponentDefinition from a stored record via the same
 * generator built-in components go through (see generate.ts) — the rest of
 * the app (ComponentNode, ConfigForm, Palette, ContextMenu) can't tell a
 * custom component's definition apart from a built-in one.
 */
export function toComponentDefinition(record: CustomComponentRecord): ComponentDefinition {
  return generateComponentDefinition({
    id: record.id,
    category: record.category,
    label: record.label,
    icon: record.icon,
    inputs: record.hasInput ? [{ id: "in", label: "In" }] : [],
    outputs: record.hasOutput ? [{ id: "out", label: "Out" }] : [],
    fields: record.fields,
    summary: record.summary,
    docs: record.docs,
  });
}
