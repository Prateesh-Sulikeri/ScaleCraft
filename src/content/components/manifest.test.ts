import { describe, it, expect } from "vitest";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { componentRegistry } from "./registry";
import { componentDocsManifest, getComponentDocsEntry } from "./manifest";

describe("componentDocsManifest", () => {
  it("has exactly one entry per component with a docsFile", () => {
    const expectedIds = componentRegistry.filter((c) => c.docsFile).map((c) => c.id);
    expect(componentDocsManifest.map((e) => e.id).sort()).toEqual(expectedIds.sort());
  });

  it("has no duplicate ids", () => {
    const ids = componentDocsManifest.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every entry's docsFile points at a file that actually exists under public/", () => {
    for (const entry of componentDocsManifest) {
      const filePath = path.resolve(process.cwd(), "public", entry.docsFile.replace(/^\//, ""));
      expect(existsSync(filePath)).toBe(true);
    }
  });

  it("covers every .md file in public/content/components/", () => {
    const docsDir = path.resolve(process.cwd(), "public/content/components");
    const mdFiles = readdirSync(docsDir).filter((f) => f.endsWith(".md"));
    expect(componentDocsManifest.length).toBe(mdFiles.length);
  });
});

describe("getComponentDocsEntry", () => {
  it("finds a known component's manifest entry", () => {
    expect(getComponentDocsEntry("load-balancer")?.docsFile).toBe("/content/components/load-balancer.md");
  });

  it("returns undefined for an unknown id", () => {
    expect(getComponentDocsEntry("not-a-real-id")).toBeUndefined();
  });
});
