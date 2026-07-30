import { beforeEach, describe, expect, it } from "vitest";
import { useCustomComponentsStore } from "./custom-components-store";
import type { CustomComponentRecord } from "@/content/components/custom";

function record(overrides: Partial<CustomComponentRecord> = {}): CustomComponentRecord {
  return {
    id: "custom-1",
    category: "compute",
    label: "My Service",
    icon: "server",
    summary: "A custom service",
    docs: "",
    hasInput: true,
    hasOutput: true,
    fields: [],
    ...overrides,
  };
}

// A plain global singleton (unlike canvas/store.ts) — reset explicitly
// between tests rather than via a fresh instance per test, since that's
// the actual contract this store makes: custom components stay loaded
// across every mode for the lifetime of the app.
beforeEach(() => {
  useCustomComponentsStore.setState({ customComponents: [] });
});

describe("custom components store", () => {
  it("upsertCustomComponent adds a new record", () => {
    useCustomComponentsStore.getState().upsertCustomComponent(record());
    expect(useCustomComponentsStore.getState().customComponents).toEqual([record()]);
  });

  it("upsertCustomComponent updates an existing record in place rather than duplicating it", () => {
    useCustomComponentsStore.getState().upsertCustomComponent(record({ label: "First" }));
    useCustomComponentsStore.getState().upsertCustomComponent(record({ label: "Renamed" }));

    const { customComponents } = useCustomComponentsStore.getState();
    expect(customComponents).toHaveLength(1);
    expect(customComponents[0].label).toBe("Renamed");
  });

  it("deleteCustomComponent removes only the matching record", () => {
    useCustomComponentsStore.getState().upsertCustomComponent(record({ id: "a" }));
    useCustomComponentsStore.getState().upsertCustomComponent(record({ id: "b" }));

    useCustomComponentsStore.getState().deleteCustomComponent("a");

    const { customComponents } = useCustomComponentsStore.getState();
    expect(customComponents.map((c) => c.id)).toEqual(["b"]);
  });

  it("loadCustomComponents replaces the whole list wholesale", () => {
    useCustomComponentsStore.getState().upsertCustomComponent(record({ id: "stale" }));

    useCustomComponentsStore.getState().loadCustomComponents([record({ id: "a" }), record({ id: "b" })]);

    expect(useCustomComponentsStore.getState().customComponents.map((c) => c.id)).toEqual(["a", "b"]);
  });
});
