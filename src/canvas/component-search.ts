import type { ComponentDefinition } from "@/content/components/types";
import { categoryOrder } from "./category-colors";

export interface ComponentGroup {
  category: ComponentDefinition["category"];
  items: ComponentDefinition[];
}

/**
 * Filters `all` by `query` (case-insensitive match on label or summary),
 * optionally restricts to `availableComponentIds` (chapter-mode filtering,
 * `null`/`undefined` = no restriction), then groups the result by category in
 * `categoryOrder`. Empty groups are dropped. Extracted from Palette's
 * `grouped` memo so the picker (and any future consumer) share one
 * implementation.
 */
export function filterAndGroupComponents(
  all: ComponentDefinition[],
  query: string,
  availableComponentIds?: string[] | null,
): ComponentGroup[] {
  const allowed = availableComponentIds ? new Set(availableComponentIds) : null;
  const inScope = allowed ? all.filter((d) => allowed.has(d.id)) : all;

  const q = query.trim().toLowerCase();
  const matches = q
    ? inScope.filter((d) => d.label.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q))
    : inScope;

  return categoryOrder
    .map((category) => ({ category, items: matches.filter((d) => d.category === category) }))
    .filter((g) => g.items.length > 0);
}
