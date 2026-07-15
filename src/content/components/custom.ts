import { z, type ZodTypeAny } from "zod";
import type { ComponentDefinition, ComponentCategory, PortSpec } from "./types";

/**
 * One config field a user defines when creating their own component (see
 * CreateComponentModal.tsx). A discriminated union, not a single shape with
 * optional fields — `kind` picks which of `min`/`max`/`options` are even
 * meaningful, mirroring how ConfigForm.tsx already reads a real
 * ComponentDefinition's Zod schema by instanceof-checking ZodEnum/ZodNumber/
 * ZodBoolean/ZodString.
 */
export type CustomFieldSpec =
  | { kind: "string"; name: string; label: string; default: string }
  | { kind: "number"; name: string; label: string; default: number; min?: number; max?: number }
  | { kind: "boolean"; name: string; label: string; default: boolean }
  | { kind: "enum"; name: string; label: string; default: string; options: string[] };

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
 * Builds a real ComponentDefinition from a stored record — the `configSchema`
 * is constructed here, at runtime, via `z.object(...)` from the field specs.
 * Zod schemas are ordinary runtime values, not a static-only construct, so
 * this works exactly like any hand-authored registry entry's schema; the
 * rest of the app (ComponentNode, ConfigForm, Palette, ContextMenu) can't
 * tell a custom component's definition apart from a built-in one.
 */
export function toComponentDefinition(record: CustomComponentRecord): ComponentDefinition {
  const shape: Record<string, ZodTypeAny> = {};
  const defaultConfig: Record<string, unknown> = {};

  for (const field of record.fields) {
    switch (field.kind) {
      case "string":
        shape[field.name] = z.string();
        break;
      case "number": {
        let schema = z.number();
        if (field.min !== undefined) schema = schema.min(field.min);
        if (field.max !== undefined) schema = schema.max(field.max);
        shape[field.name] = schema;
        break;
      }
      case "boolean":
        shape[field.name] = z.boolean();
        break;
      case "enum":
        // Enforced non-empty by CreateComponentModal's own form validation
        // before this ever runs — z.enum requires at least one option.
        shape[field.name] = z.enum(field.options as [string, ...string[]]);
        break;
    }
    defaultConfig[field.name] = field.default;
  }

  const inputs: PortSpec[] = record.hasInput ? [{ id: "in", label: "In" }] : [];
  const outputs: PortSpec[] = record.hasOutput ? [{ id: "out", label: "Out" }] : [];

  return {
    id: record.id,
    category: record.category,
    label: record.label,
    icon: record.icon,
    inputs,
    outputs,
    configSchema: z.object(shape),
    defaultConfig,
    summary: record.summary,
    docs: record.docs,
  };
}
