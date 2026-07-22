"use client";

import type { ComponentDefinition } from "@/content/components/types";
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

      {groups.map(({ category, items }) => (
        <div key={category} id={categorySectionId(category)}>
          <h3 className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
            {categoryLabel[category]}
          </h3>
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
        </div>
      ))}
    </>
  );
}
