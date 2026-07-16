import type { ArchitectureGraph } from "@/lib/graph";
import { getComponent } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";

/**
 * Resolves every node's full ComponentDefinition once per validation run —
 * shared so rules that need more than just a componentId string (category,
 * declared `relations`, port lists) don't each independently re-derive the
 * same map. Superseded the narrower category-only version of this helper
 * once component-relations.ts needed the full definition, not just category.
 */
export function componentLookup(graph: ArchitectureGraph): Map<string, ComponentDefinition> {
  const defsById = new Map<string, ComponentDefinition>();
  for (const n of graph.nodes) {
    const def = getComponent(n.componentId);
    if (def) defsById.set(n.id, def);
  }
  return defsById;
}
