import { describe, it, expect } from "vitest";
import { buildConfigSchema, generateComponentDefinition, generateComponentRegistry } from "./generate";
import type { ComponentConfigSpec, ConfigFieldSpec } from "./types";

function baseSpec(overrides: Partial<ComponentConfigSpec> = {}): ComponentConfigSpec {
  return {
    id: "widget",
    category: "compute",
    label: "Widget",
    icon: "server",
    inputs: [],
    outputs: [],
    fields: [],
    summary: "A test widget",
    docs: "Test widget docs.",
    ...overrides,
  };
}

describe("buildConfigSchema", () => {
  it("builds a string field with its default", () => {
    const fields: ConfigFieldSpec[] = [{ kind: "string", name: "name", label: "Name", default: "hi" }];
    const { configSchema, defaultConfig } = buildConfigSchema(fields);
    expect(defaultConfig).toEqual({ name: "hi" });
    expect(configSchema.parse({ name: "world" })).toEqual({ name: "world" });
    expect(() => configSchema.parse({ name: 1 })).toThrow();
  });

  it("builds a boolean field", () => {
    const fields: ConfigFieldSpec[] = [{ kind: "boolean", name: "on", label: "On", default: true }];
    const { configSchema, defaultConfig } = buildConfigSchema(fields);
    expect(defaultConfig).toEqual({ on: true });
    expect(() => configSchema.parse({ on: "yes" })).toThrow();
  });

  it("builds a plain number field with no bounds", () => {
    const fields: ConfigFieldSpec[] = [{ kind: "number", name: "n", label: "N", default: 1.5 }];
    const { configSchema } = buildConfigSchema(fields);
    expect(configSchema.parse({ n: 1.5 })).toEqual({ n: 1.5 });
  });

  it("enforces int/min/max on a number field", () => {
    const fields: ConfigFieldSpec[] = [
      { kind: "number", name: "n", label: "N", default: 5, int: true, min: 1, max: 10 },
    ];
    const { configSchema } = buildConfigSchema(fields);
    expect(configSchema.parse({ n: 5 })).toEqual({ n: 5 });
    expect(() => configSchema.parse({ n: 1.5 })).toThrow();
    expect(() => configSchema.parse({ n: 0 })).toThrow();
    expect(() => configSchema.parse({ n: 11 })).toThrow();
  });

  it("builds an enum field restricted to its options", () => {
    const fields: ConfigFieldSpec[] = [
      { kind: "enum", name: "mode", label: "Mode", default: "a", options: ["a", "b"] },
    ];
    const { configSchema, defaultConfig } = buildConfigSchema(fields);
    expect(defaultConfig).toEqual({ mode: "a" });
    expect(configSchema.parse({ mode: "b" })).toEqual({ mode: "b" });
    expect(() => configSchema.parse({ mode: "c" })).toThrow();
  });

  it("throws for an enum field with no options", () => {
    const fields: ConfigFieldSpec[] = [{ kind: "enum", name: "mode", label: "Mode", default: "a", options: [] }];
    expect(() => buildConfigSchema(fields)).toThrow(/enum must have at least one option/);
  });

  it("builds multiple fields into one schema", () => {
    const fields: ConfigFieldSpec[] = [
      { kind: "string", name: "a", label: "A", default: "x" },
      { kind: "boolean", name: "b", label: "B", default: false },
    ];
    const { defaultConfig } = buildConfigSchema(fields);
    expect(defaultConfig).toEqual({ a: "x", b: false });
  });
});

describe("generateComponentDefinition", () => {
  it("builds a full definition from a valid spec", () => {
    const def = generateComponentDefinition(
      baseSpec({ relations: { outputs: { allowedCategories: ["compute"] } } }),
    );
    expect(def.id).toBe("widget");
    expect(def.relations).toEqual({ outputs: { allowedCategories: ["compute"] } });
    expect(def.defaultConfig).toEqual({});
  });

  it("threads docsFile through unchanged", () => {
    const def = generateComponentDefinition(baseSpec({ docsFile: "/docs/widget.md" }));
    expect(def.docsFile).toBe("/docs/widget.md");
  });

  it("throws when the spec has no id", () => {
    expect(() => generateComponentDefinition(baseSpec({ id: "" }))).toThrow(/missing an id/);
  });

  it("throws when the icon isn't in icon-map.ts", () => {
    expect(() => generateComponentDefinition(baseSpec({ icon: "not-a-real-icon" }))).toThrow(
      /is not in icon-map/,
    );
  });

  it("throws on a duplicate field name", () => {
    const fields: ConfigFieldSpec[] = [
      { kind: "string", name: "dup", label: "A", default: "x" },
      { kind: "boolean", name: "dup", label: "B", default: false },
    ];
    expect(() => generateComponentDefinition(baseSpec({ fields }))).toThrow(/duplicate config field name/);
  });
});

describe("generateComponentRegistry", () => {
  it("builds a definition per spec", () => {
    const defs = generateComponentRegistry([baseSpec({ id: "a" }), baseSpec({ id: "b" })]);
    expect(defs.map((d) => d.id)).toEqual(["a", "b"]);
  });

  it("throws when two specs share an id", () => {
    expect(() => generateComponentRegistry([baseSpec({ id: "dup" }), baseSpec({ id: "dup" })])).toThrow(
      /Duplicate component id/,
    );
  });
});
