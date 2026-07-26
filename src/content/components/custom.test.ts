import { describe, it, expect } from "vitest";
import { toComponentDefinition, type CustomComponentRecord } from "./custom";

function baseRecord(overrides: Partial<CustomComponentRecord> = {}): CustomComponentRecord {
  return {
    id: "my-custom",
    category: "compute",
    label: "My Custom",
    icon: "server",
    summary: "A custom thing",
    docs: "Docs for my custom thing.",
    hasInput: true,
    hasOutput: true,
    fields: [],
    ...overrides,
  };
}

describe("toComponentDefinition", () => {
  it("gives it one input and one output port when both are enabled", () => {
    const def = toComponentDefinition(baseRecord());
    expect(def.inputs).toEqual([{ id: "in", label: "In" }]);
    expect(def.outputs).toEqual([{ id: "out", label: "Out" }]);
  });

  it("omits the input port when hasInput is false", () => {
    const def = toComponentDefinition(baseRecord({ hasInput: false }));
    expect(def.inputs).toEqual([]);
  });

  it("omits the output port when hasOutput is false", () => {
    const def = toComponentDefinition(baseRecord({ hasOutput: false }));
    expect(def.outputs).toEqual([]);
  });

  it("never populates relations — custom components always fall back to the coarse matrix", () => {
    const def = toComponentDefinition(baseRecord());
    expect(def.relations).toBeUndefined();
  });

  it("builds a real, usable config schema from the record's fields", () => {
    const def = toComponentDefinition(
      baseRecord({ fields: [{ kind: "number", name: "count", label: "Count", default: 3 }] }),
    );
    expect(def.defaultConfig).toEqual({ count: 3 });
    expect(def.configSchema.parse({ count: 7 })).toEqual({ count: 7 });
  });
});
