import { z } from "zod";
import { iconMap } from "@/canvas/icon-map";
import type { ComponentConfigSpec, ComponentDefinition, ConfigFieldSpec } from "./types";

/**
 * Turns a flat field-spec list into a live Zod object schema plus its
 * matching default config — the one place that knows how each `kind` maps
 * to a Zod type. Shared by built-in components (config/*.ts) and
 * user-created custom components (custom.ts) so there's exactly one
 * field-spec-to-schema mapping in the codebase.
 */
export function buildConfigSchema(fields: ConfigFieldSpec[]): {
  configSchema: z.ZodObject<Record<string, z.ZodTypeAny>>;
  defaultConfig: Record<string, unknown>;
} {
  const shape: Record<string, z.ZodTypeAny> = {};
  const defaultConfig: Record<string, unknown> = {};

  for (const field of fields) {
    switch (field.kind) {
      case "string":
        shape[field.name] = z.string();
        break;
      case "number": {
        let schema = field.int ? z.number().int() : z.number();
        if (field.min !== undefined) schema = schema.min(field.min);
        if (field.max !== undefined) schema = schema.max(field.max);
        shape[field.name] = schema;
        break;
      }
      case "boolean":
        shape[field.name] = z.boolean();
        break;
      case "enum":
        if (field.options.length === 0) {
          throw new Error(`Config field "${field.name}": enum must have at least one option`);
        }
        shape[field.name] = z.enum(field.options as [string, ...string[]]);
        break;
    }
    defaultConfig[field.name] = field.default;
  }

  return { configSchema: z.object(shape), defaultConfig };
}

/**
 * Builds a real ComponentDefinition from a declarative spec, validating the
 * spec's own invariants first (bad icon key, duplicate field name, empty
 * enum) so a typo in a config/*.ts file — or a hand-rolled
 * CustomComponentRecord — fails loudly at load time instead of silently
 * rendering broken.
 */
export function generateComponentDefinition(spec: ComponentConfigSpec): ComponentDefinition {
  if (!spec.id) {
    throw new Error(`Component spec is missing an id (label: "${spec.label}")`);
  }
  if (!(spec.icon in iconMap)) {
    throw new Error(`Component "${spec.id}": icon "${spec.icon}" is not in icon-map.ts`);
  }
  const seenFieldNames = new Set<string>();
  for (const field of spec.fields) {
    if (seenFieldNames.has(field.name)) {
      throw new Error(`Component "${spec.id}": duplicate config field name "${field.name}"`);
    }
    seenFieldNames.add(field.name);
  }

  const { configSchema, defaultConfig } = buildConfigSchema(spec.fields);

  return {
    id: spec.id,
    category: spec.category,
    label: spec.label,
    icon: spec.icon,
    inputs: spec.inputs,
    outputs: spec.outputs,
    configSchema,
    defaultConfig,
    summary: spec.summary,
    docs: spec.docs,
    // Threaded through unchanged — same shape on both sides (see types.ts's
    // ComponentRelations), no transformation needed.
    relations: spec.relations,
  };
}

export function generateComponentRegistry(specs: ComponentConfigSpec[]): ComponentDefinition[] {
  const definitions = specs.map(generateComponentDefinition);

  const seenIds = new Map<string, number>();
  for (const definition of definitions) {
    seenIds.set(definition.id, (seenIds.get(definition.id) ?? 0) + 1);
  }
  const duplicates = [...seenIds.entries()].filter(([, count]) => count > 1).map(([id]) => id);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate component id(s) in registry: ${duplicates.join(", ")}`);
  }

  return definitions;
}
