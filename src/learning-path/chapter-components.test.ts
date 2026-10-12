import { describe, it, expect } from "vitest";
import { chapterRegistry } from "@/content/chapters";
import { getComponent } from "@/content/components/registry";
import { allEntries, getCourse } from "@/curriculum";
import { chapterComponents } from "./chapter-components";

const ids = (courseId: Parameters<typeof chapterComponents>[0], slug: string) =>
  chapterComponents(courseId, slug).map((d) => d.id);

describe("chapterComponents", () => {
  it("prefers the authored focus", () => {
    // Sharding adds nothing new to the palette, so only its focus can say
    // what it is about.
    expect(ids("building-blocks", "3-13-sharding")).toEqual(["sql-database", "nosql-database"]);
    expect(ids("building-blocks", "3-14-caching")).toEqual(["cache"]);
  });

  it("every focus is 1-5 real components from that chapter's own palette", () => {
    const available = new Map(chapterRegistry.map((c) => [c.id, new Set(c.availableComponentIds)]));
    for (const courseId of ["building-blocks", "real-world-extraction"] as const) {
      for (const entry of allEntries(getCourse(courseId))) {
        if (!entry.focusComponentIds) continue;
        expect(entry.focusComponentIds.length, entry.slug).toBeGreaterThan(0);
        expect(entry.focusComponentIds.length, entry.slug).toBeLessThanOrEqual(5);
        const palette = entry.chapterDefinitionId ? available.get(entry.chapterDefinitionId) : undefined;
        for (const id of entry.focusComponentIds) {
          expect(getComponent(id), `${entry.slug}: ${id}`).toBeDefined();
          if (palette) expect(palette.has(id), `${entry.slug}: ${id} not in its palette`).toBe(true);
        }
      }
    }
  });

  it("shows nothing for a lesson-only chapter", () => {
    expect(ids("building-blocks", "0-2-what-is-system-design")).toEqual([]);
  });

  it("shows everything an RWE brief requires", () => {
    expect(ids("real-world-extraction", "rwe-t1-bitly-url-shortener")).toEqual([
      "browser",
      "dns",
      "load-balancer",
      "app-server",
      "cache",
    ]);
  });
});
