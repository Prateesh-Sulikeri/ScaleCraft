"use client";

import type { ComponentCategory } from "@/content/components/types";
import { categoryLabel } from "./category-colors";
import { categorySectionId, DECORATION_SECTION_ID } from "./ComponentPickerResults";

/**
 * Left-column jump list — one click scrolls the results grid straight to a
 * category's section instead of hand-scrolling through the whole registry.
 * Purely a navigation aid: it doesn't filter, select, or participate in the
 * flat keyboard-nav array search/arrows/Enter already cover. Decoration is
 * listed first, matching ComponentPickerResults' render order.
 */
export function ComponentPickerCategoryNav({
  categories,
  hasDecoration,
}: {
  categories: ComponentCategory[];
  hasDecoration: boolean;
}) {
  if (!hasDecoration && categories.length === 0) return null;

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ block: "start" });
  };

  return (
    <nav
      aria-label="Component categories"
      className="w-24 shrink-0 space-y-0.5 overflow-y-auto border-r border-border p-2"
    >
      {hasDecoration && (
        <button
          type="button"
          onClick={() => jumpTo(DECORATION_SECTION_ID)}
          className="block w-full truncate rounded px-2 py-1 text-left text-xs text-foreground/70 hover:bg-border hover:text-foreground"
        >
          Decoration
        </button>
      )}
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => jumpTo(categorySectionId(category))}
          className="block w-full truncate rounded px-2 py-1 text-left text-xs text-foreground/70 hover:bg-border hover:text-foreground"
        >
          {categoryLabel[category]}
        </button>
      ))}
    </nav>
  );
}
