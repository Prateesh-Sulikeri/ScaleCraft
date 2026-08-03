import { componentRegistry } from "./registry";

/**
 * On-demand content manifest for component docs - same shape/spirit as
 * chapterRegistry (src/content/chapters/index.ts): metadata in code, body
 * fetched on demand from public/content/. Not to be confused with
 * src/curriculum/manifest.ts (the course/section/chapter navigation map) -
 * this is scoped purely to "where does this id's doc body live."
 *
 * Derived from componentRegistry (the single source of truth for
 * `docsFile`) rather than hand-duplicated, so the two can never drift.
 * Components without a docsFile (falling back entirely to their inline
 * `docs` string) simply have no entry here.
 */
export type ComponentDocsManifestEntry = {
  id: string;
  docsFile: string;
  /** See `ComponentDefinition.docsVersion` — threaded through unchanged. */
  docsVersion?: number;
};

export const componentDocsManifest: ComponentDocsManifestEntry[] = componentRegistry
  .filter((component): component is typeof component & { docsFile: string } => Boolean(component.docsFile))
  .map((component) => ({ id: component.id, docsFile: component.docsFile, docsVersion: component.docsVersion }));

export function getComponentDocsEntry(id: string): ComponentDocsManifestEntry | undefined {
  return componentDocsManifest.find((entry) => entry.id === id);
}
