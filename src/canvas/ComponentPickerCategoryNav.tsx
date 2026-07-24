"use client";

import type { ComponentCategory } from "@/content/components/types";
import { categoryLabel } from "./category-colors";
import { categorySectionId, DECORATION_SECTION_ID } from "./ComponentPickerResults";

/**
 * Left-column jump list — one click scrolls the results grid straight to a
 * category's section instead of hand-scrolling through the whole registry.
 * Purely a navigation aid: it doesn't filter, select, or participate in the
 * flat keyboard-nav array search/arrows/Enter already cover. Decoration is
 * listed first, matching ComponentPickerResults' render order. `onJump`
 * (owned by ComponentPicker.tsx) also expands the target category first if
 * it's currently collapsed — jumping to a collapsed category must reveal
 * it, not scroll to an empty spot.
 */
export function ComponentPickerCategoryNav({
  categories,
  hasDecoration,
  onJump,
}: {
  categories: ComponentCategory[];
  hasDecoration: boolean;
  onJump: (sectionId: string, category?: ComponentCategory) => void;
}) {
  if (!hasDecoration && categories.length === 0) return null;

  return (
    <nav
      aria-label="Component categories"
      className="w-28 shrink-0 space-y-0.5 overflow-y-auto border-r border-border p-2"
    >
      {hasDecoration && (
        <button
          type="button"
          onClick={() => onJump(DECORATION_SECTION_ID)}
          // See the matching comment in ComponentPickerResults.tsx: these
          // rail buttons sit ahead of the results section in tab order and
          // are just as reachable by Tab, so they need the same guard
          // against the picker's window-level Enter/Space listener.
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.stopPropagation();
          }}
          title="Decoration"
          className="block w-full rounded px-2 py-1 text-left text-xs leading-tight text-foreground/70 hover:bg-border hover:text-foreground"
        >
          Decoration
        </button>
      )}
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onJump(categorySectionId(category), category)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") e.stopPropagation();
          }}
          title={categoryLabel[category]}
          className="block w-full rounded px-2 py-1 text-left text-xs leading-tight text-foreground/70 hover:bg-border hover:text-foreground"
        >
          {categoryLabel[category]}
        </button>
      ))}
    </nav>
  );
}
