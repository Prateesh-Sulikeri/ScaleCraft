import { describe, expect, it } from "vitest";
import { filterAndGroupComponents } from "./component-search";
import type { ComponentDefinition } from "@/content/components/types";

function def(id: string, category: ComponentDefinition["category"], label: string, summary = ""): ComponentDefinition {
  return {
    id,
    category,
    label,
    summary,
    icon: "server",
    inputs: [],
    outputs: [],
  } as unknown as ComponentDefinition;
}

const fixtures: ComponentDefinition[] = [
  def("cache-1", "caching", "Redis Cache", "In-memory key-value store"),
  def("lb-1", "networking", "Load Balancer", "Distributes traffic across servers"),
  def("db-1", "data", "Postgres", "Relational database"),
  def("compute-1", "compute", "App Server", "Runs application logic"),
];

describe("filterAndGroupComponents", () => {
  it("matches on label, case-insensitively", () => {
    const groups = filterAndGroupComponents(fixtures, "redis");
    expect(groups).toHaveLength(1);
    expect(groups[0].items.map((d) => d.id)).toEqual(["cache-1"]);
  });

  it("matches on summary text", () => {
    const groups = filterAndGroupComponents(fixtures, "relational");
    expect(groups.flatMap((g) => g.items.map((d) => d.id))).toEqual(["db-1"]);
  });

  it("matches every component in a category by the category's display name", () => {
    // "Load Balancer" / "Distributes traffic across servers" contain neither
    // "network" nor "networking" — this only matches because its category
    // ("networking") displays as "Networking".
    const groups = filterAndGroupComponents(fixtures, "network");
    expect(groups).toHaveLength(1);
    expect(groups[0].category).toBe("networking");
    expect(groups[0].items.map((d) => d.id)).toEqual(["lb-1"]);
  });

  it("matches a category display name that's two words (distributed systems)", () => {
    const withDistSys = [...fixtures, def("dist-1", "distributed-systems", "Message Queue", "Async delivery")];
    const groups = filterAndGroupComponents(withDistSys, "distributed");
    expect(groups.flatMap((g) => g.items.map((d) => d.id))).toEqual(["dist-1"]);
  });

  it("returns no groups when nothing matches", () => {
    expect(filterAndGroupComponents(fixtures, "nonexistent-xyz")).toEqual([]);
  });

  it("groups results by categoryOrder, dropping empty categories", () => {
    const groups = filterAndGroupComponents(fixtures, "");
    expect(groups.map((g) => g.category)).toEqual(["networking", "compute", "data", "caching"]);
  });

  it("restricts to availableComponentIds when provided", () => {
    const groups = filterAndGroupComponents(fixtures, "", ["cache-1", "db-1"]);
    expect(groups.flatMap((g) => g.items.map((d) => d.id)).sort()).toEqual(["cache-1", "db-1"]);
  });

  it("treats a null availableComponentIds as unrestricted", () => {
    const groups = filterAndGroupComponents(fixtures, "", null);
    expect(groups.flatMap((g) => g.items.map((d) => d.id))).toHaveLength(fixtures.length);
  });
});
