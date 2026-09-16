import { describe, expect, it } from "vitest";
import { canConnect } from "./connection-rules";
import type { AnyNodeType } from "./types";

function component(id: string, componentId: string): AnyNodeType {
  return {
    id,
    type: "component",
    position: { x: 0, y: 0 },
    data: { componentId, config: {} },
  } as AnyNodeType;
}

function start(id: string): AnyNodeType {
  return { id, type: "start", position: { x: 0, y: 0 }, data: {} } as AnyNodeType;
}

function zone(id: string): AnyNodeType {
  return {
    id,
    type: "zone",
    position: { x: 0, y: 0 },
    data: { label: "z", color: "zone" },
  } as AnyNodeType;
}

describe("canConnect", () => {
  it("allows an output-bearing component into an input-bearing one", () => {
    expect(canConnect(component("a", "client"), component("b", "app-server"))).toBe(true);
  });

  it("rejects a target that declares no inputs", () => {
    // Client is always an origin, never a destination.
    expect(canConnect(component("a", "app-server"), component("b", "client"))).toBe(false);
  });

  it("rejects a node connecting to itself", () => {
    const node = component("a", "app-server");
    expect(canConnect(node, node)).toBe(false);
  });

  it("rejects a missing endpoint", () => {
    expect(canConnect(undefined, component("b", "app-server"))).toBe(false);
    expect(canConnect(component("a", "client"), undefined)).toBe(false);
  });

  it("rejects an unknown componentId on either end", () => {
    expect(canConnect(component("a", "does-not-exist"), component("b", "app-server"))).toBe(false);
    expect(canConnect(component("a", "client"), component("b", "does-not-exist"))).toBe(false);
  });

  it("lets a Start marker point at a component but not at an annotation", () => {
    expect(canConnect(start("s"), component("b", "app-server"))).toBe(true);
    expect(canConnect(start("s"), zone("z"))).toBe(false);
  });

  it("rejects annotations as either endpoint", () => {
    expect(canConnect(zone("z"), component("b", "app-server"))).toBe(false);
    expect(canConnect(component("a", "client"), zone("z"))).toBe(false);
  });
});
