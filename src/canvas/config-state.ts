/**
 * Whether a node's config has been moved off the component's defaults.
 *
 * The canvas card shows this as a small dot (DESIGN.md Node Card). It exists
 * because the card no longer carries a description line - a learner scanning
 * a graph needs some way to tell "I set this up" from "this is stock",
 * without opening every node's inspector.
 *
 * Compared against `ComponentDefinition.defaultConfig` rather than the field
 * specs: every component (built-in and custom) is generated with one by
 * generate.ts, and it is already the exact shape `data.config` is seeded
 * from. A key missing from `config` means the node never set it, which is
 * "using the default", not "configured".
 *
 * Field values are flat primitives (see ConfigFieldSpec - string/number/
 * boolean/enum), so `Object.is` is a complete comparison here. A nested
 * object field would need a deep compare, and would also need a real
 * recursive ConfigForm renderer first.
 */
export function isConfigured(config: unknown, defaultConfig: unknown): boolean {
  if (!config || typeof config !== "object") return false;
  if (!defaultConfig || typeof defaultConfig !== "object") return false;

  const current = config as Record<string, unknown>;
  const defaults = defaultConfig as Record<string, unknown>;

  return Object.keys(defaults).some(
    (key) => key in current && !Object.is(current[key], defaults[key]),
  );
}
