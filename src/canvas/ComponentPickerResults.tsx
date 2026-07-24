"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import type { ComponentCategory, ComponentDefinition } from "@/content/components/types";
import { categoryLabel } from "./category-colors";
import type { ComponentGroup } from "./component-search";
import { ComponentPickerRow } from "./ComponentPickerRow";
import { ComponentPickerTools, type ToolAction } from "./ComponentPickerTools";

export const DECORATION_SECTION_ID = "picker-section-decoration";
export function categorySectionId(category: string) {
  return `picker-section-${category}`;
}

/**
 * The picker's listbox body — Decoration first (product direction, matches
 * the tree nav's own order), then category-grouped component tiles, or the
 * empty-state message. Extracted from ComponentPicker.tsx so that file
 * stays focused on state/keyboard-nav orchestration rather than also
 * owning this much markup. Each section carries an id so
 * ComponentPickerCategoryNav.tsx can scroll straight to it.
 */
export function ComponentPickerResults({
  query,
  flatCount,
  groups,
  collapsedCategories,
  onToggleCategory,
  customIds,
  componentIndex,
  activeIndex,
  onSelectComponent,
  onActivate,
  onEditCustom,
  onDeleteCustom,
  tools,
  onSelectTool,
  registerRef,
}: {
  query: string;
  flatCount: number;
  groups: ComponentGroup[];
  /** Display-only — never affects which components are in `groups` or the
   * flat keyboard-nav index; a collapsed category's items still exist, they
   * just don't render until expanded (by this toggle, the category-jump
   * rail, or arrow-key navigation reaching one, see ComponentPicker.tsx). */
  collapsedCategories: Set<ComponentCategory>;
  onToggleCategory: (category: ComponentCategory) => void;
  customIds: Set<string>;
  componentIndex: Map<string, number>;
  activeIndex: number;
  onSelectComponent: (definition: ComponentDefinition) => void;
  onActivate: (index: number) => void;
  onEditCustom: (definition: ComponentDefinition) => void;
  onDeleteCustom: (definition: ComponentDefinition, event: React.MouseEvent) => void;
  tools: ToolAction[];
  onSelectTool: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  if (flatCount === 0) {
    return <p className="text-sm text-foreground/70">No components match &ldquo;{query}&rdquo;.</p>;
  }

  return (
    <>
      <div id={DECORATION_SECTION_ID}>
        <ComponentPickerTools
          tools={tools}
          activeIndex={activeIndex}
          baseIndex={0}
          onActivate={onActivate}
          onSelectTool={onSelectTool}
          registerRef={registerRef}
        />
      </div>

      {groups.map(({ category, items }) => {
        const expanded = !collapsedCategories.has(category);
        return (
          <div key={category} id={categorySectionId(category)}>
            <button
              type="button"
              onClick={() => onToggleCategory(category)}
              // The picker's window-level keydown listener (ComponentPicker.tsx)
              // intercepts Enter/Space unconditionally to fire the roving
              // activeIndex item, regardless of real DOM focus — this is the
              // one native, always-present button in the results area that
              // isn't part of that roving model, so Tab-then-Enter here must
              // stop the event before it reaches that listener, or Enter
              // silently activates a totally different (and invisible) item.
              // The native button still handles its own onClick on Enter/Space.
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") e.stopPropagation();
              }}
              aria-expanded={expanded}
              className="flex w-full items-center gap-1 px-0.5 text-[11px] font-semibold tracking-wide text-foreground/70 uppercase hover:text-foreground"
            >
              {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              {categoryLabel[category]}
              <span className="font-normal normal-case text-foreground/40">({items.length})</span>
            </button>
            {expanded && (
              <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
                {items.map((definition) => {
                  const isCustom = customIds.has(definition.id);
                  const index = componentIndex.get(definition.id) ?? -1;
                  return (
                    <ComponentPickerRow
                      key={definition.id}
                      id={`picker-item-${definition.id}`}
                      definition={definition}
                      active={index === activeIndex}
                      isCustom={isCustom}
                      onSelect={() => onSelectComponent(definition)}
                      onActivate={() => onActivate(index)}
                      onEdit={isCustom ? () => onEditCustom(definition) : undefined}
                      onDelete={isCustom ? (event) => onDeleteCustom(definition, event) : undefined}
                      ref={(el) => registerRef(definition.id, el)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
