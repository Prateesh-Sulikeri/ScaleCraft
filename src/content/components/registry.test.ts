import { describe, it, expect, afterEach } from "vitest";
import { componentRegistry, getAllComponents, getComponent } from "./registry";
import { useCustomComponentsStore } from "@/canvas/custom-components-store";

afterEach(() => {
  useCustomComponentsStore.getState().loadCustomComponents([]);
});

describe("getComponent", () => {
  it("finds a built-in component by id", () => {
    expect(getComponent("client")?.label).toBe("Client");
  });

  it("returns undefined for an unknown id", () => {
    expect(getComponent("not-a-real-id")).toBeUndefined();
  });

  it("falls back to a custom component record when there's no built-in match", () => {
    useCustomComponentsStore.getState().upsertCustomComponent({
      id: "my-widget",
      category: "compute",
      label: "My Widget",
      icon: "server",
      summary: "s",
      docs: "d",
      hasInput: true,
      hasOutput: true,
      fields: [],
    });
    expect(getComponent("my-widget")?.label).toBe("My Widget");
  });

  it("prefers the built-in definition over a same-id custom record", () => {
    useCustomComponentsStore.getState().upsertCustomComponent({
      id: "client",
      category: "compute",
      label: "Shadowed",
      icon: "server",
      summary: "s",
      docs: "d",
      hasInput: true,
      hasOutput: true,
      fields: [],
    });
    expect(getComponent("client")?.label).toBe("Client");
  });
});

describe("getAllComponents", () => {
  it("returns just the built-in registry when there are no custom components", () => {
    expect(getAllComponents()).toHaveLength(componentRegistry.length);
  });

  it("appends custom components after the built-in registry", () => {
    useCustomComponentsStore.getState().upsertCustomComponent({
      id: "my-widget",
      category: "compute",
      label: "My Widget",
      icon: "server",
      summary: "s",
      docs: "d",
      hasInput: false,
      hasOutput: false,
      fields: [],
    });
    const all = getAllComponents();
    expect(all).toHaveLength(componentRegistry.length + 1);
    expect(all.at(-1)?.id).toBe("my-widget");
  });
});
