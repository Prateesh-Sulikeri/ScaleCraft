import { describe, expect, it } from "vitest";
import { componentDisplayNames } from "./component-display-name";
import type { ComponentNodeType } from "./types";

function node(id: string, componentId: string, name?: string): ComponentNodeType {
  return { id, type: "component", position: { x: 0, y: 0 }, data: { componentId, config: {}, name } };
}

describe("componentDisplayNames", () => {
  it("uses the plain type label when there's only one instance of a type", () => {
    const names = componentDisplayNames([node("n1", "client")]);
    expect(names.get("n1")).toBe("Client");
  });

  it("appends an ordinal suffix when multiple nodes share a componentId", () => {
    const names = componentDisplayNames([node("n1", "client"), node("n2", "client"), node("n3", "client")]);
    expect(names.get("n1")).toBe("Client #1");
    expect(names.get("n2")).toBe("Client #2");
    expect(names.get("n3")).toBe("Client #3");
  });

  it("prefers a custom instance name over the ordinal suffix", () => {
    const names = componentDisplayNames([node("n1", "client"), node("n2", "client", "browser-tab")]);
    expect(names.get("n1")).toBe("Client #1");
    expect(names.get("n2")).toBe("Client — browser-tab");
  });

  it("ignores a whitespace-only custom name", () => {
    const names = componentDisplayNames([node("n1", "client", "   ")]);
    expect(names.get("n1")).toBe("Client");
  });
});
