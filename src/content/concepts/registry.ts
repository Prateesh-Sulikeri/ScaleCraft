import type { GlossaryTermDefinition } from "./types";

/**
 * The global glossary term registry - src/chapters/glossary/Ref.tsx resolves
 * `<Ref id="...">` against this by id. Same barrel convention as
 * componentRegistry (src/content/components/registry.ts): a flat array is
 * the sole source of truth other modules import from. Starts as a single
 * literal array (no config/*.ts split) - split by category the same way
 * componentRegistry did, but only once file size actually warrants it.
 */
export function buildGlossaryRegistry(terms: GlossaryTermDefinition[]): GlossaryTermDefinition[] {
  const counts = new Map<string, number>();
  for (const t of terms) counts.set(t.id, (counts.get(t.id) ?? 0) + 1);
  const duplicates = [...counts.entries()].filter(([, n]) => n > 1).map(([id]) => id);
  if (duplicates.length > 0) {
    throw new Error(`Duplicate glossary term id(s) in registry: ${duplicates.join(", ")}`);
  }
  return terms;
}

export const glossaryRegistry: GlossaryTermDefinition[] = buildGlossaryRegistry([
  {
    id: "round-robin",
    title: "Round Robin",
    body:
      "Round robin is a load-balancing algorithm that rotates requests evenly across " +
      "every healthy instance in sequence, regardless of how busy each instance " +
      "currently is.\n\nIt's cheap to run (the load balancer only tracks whose turn is " +
      "next, not live connection counts), which makes it the right default when " +
      "requests are short and roughly uniform in cost.",
  },
]);

export function getGlossaryTerm(id: string): GlossaryTermDefinition | undefined {
  return glossaryRegistry.find((t) => t.id === id);
}
