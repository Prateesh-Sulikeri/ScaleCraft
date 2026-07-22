"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Search, Server } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { componentRegistry } from "@/content/components/registry";
import { toComponentDefinition } from "@/content/components/custom";
import type { ComponentDefinition } from "@/content/components/types";
import { categoryColorVar, categoryLabel } from "./category-colors";
import { filterAndGroupComponents } from "./component-search";
import { iconMap } from "./icon-map";
import { useCanvasStore } from "./store";

/**
 * Centered command-palette-style dialog that replaces the palette's search +
 * grid as the app's component-insertion surface (see
 * .claude/docs/UI_OVERHAUL_PART2_SPEC.md). Phase 2: additive only — reachable
 * via `/`, inserts at the viewport center or a remembered click point. The
 * Tools group (zone/comment/flag/new-component) and custom-component
 * edit/delete rows land in Phase 3 once this replaces the pane right-click
 * menu; adding them earlier would mean shipping controls with no way to
 * reach them via the still-active old palette.
 */
export function ComponentPicker() {
  const picker = useCanvasStore((s) => s.componentPicker);
  const closeComponentPicker = useCanvasStore((s) => s.closeComponentPicker);
  const addNode = useCanvasStore((s) => s.addNode);
  const customComponents = useCanvasStore((s) => s.customComponents);
  const { screenToFlowPosition } = useReactFlow();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastQuery, setLastQuery] = useState(query);
  const [wasOpen, setWasOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const isOpen = picker !== null;

  const allComponents = useMemo(
    () => [...componentRegistry, ...customComponents.map(toComponentDefinition)],
    [customComponents],
  );

  const groups = useMemo(() => filterAndGroupComponents(allComponents, query), [allComponents, query]);
  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Adjusting state during render (React's recommended pattern for
  // "reset state when a value changes") rather than an effect for both
  // resets below — a fresh open/search should show its reset state on the
  // very same render, not one render later.
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setQuery("");
      setLastQuery("");
      setActiveIndex(0);
    }
  }
  if (query !== lastQuery) {
    setLastQuery(query);
    setActiveIndex(0);
  }

  useEffect(() => {
    if (!isOpen) return;
    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    // Focus after the dialog paints, not synchronously — the input isn't
    // in the DOM yet on the render that flips `isOpen` true.
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || flatItems.length === 0) return;
    const active = flatItems[Math.min(activeIndex, flatItems.length - 1)];
    if (!active) return;
    itemRefs.current.get(active.id)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flatItems, isOpen]);

  const close = () => {
    closeComponentPicker();
    // Falls back to the react-flow pane wrapper (not just window focus) so
    // Delete/arrow-key node operations resume without an extra click — the
    // pane wrapper is what actually owns those key handlers.
    const fallback = document.querySelector<HTMLElement>(".react-flow__pane");
    (lastFocusedRef.current ?? fallback)?.focus();
  };

  const insert = (definition: ComponentDefinition) => {
    const flowPosition = picker?.flowPosition ?? resolveViewportCenter();
    addNode(definition, flowPosition);
    close();
  };

  function resolveViewportCenter() {
    const rect = document.querySelector(".react-flow")?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const y = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    return screenToFlowPosition({ x, y });
  }

  if (!isOpen) return null;

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      setActiveIndex(flatItems.length - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const active = flatItems[activeIndex];
      if (active) insert(active);
    }
  };

  const activeItem = flatItems[activeIndex];

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[var(--z-modal-backdrop)]"
        onClick={close}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div className="fixed inset-0 z-[var(--z-modal)] grid place-items-center px-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Add a component"
          onKeyDown={onKeyDown}
          className="motion-reduce:transition-none flex max-h-[70vh] w-[560px] max-w-full flex-col rounded-md border border-border bg-panel shadow-lg transition-opacity duration-150"
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="component-picker-listbox"
                aria-activedescendant={activeItem ? `picker-item-${activeItem.id}` : undefined}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-foreground/40"
              />
            </div>
            <p aria-live="polite" className="sr-only">
              {flatItems.length} component{flatItems.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div
            ref={listRef}
            id="component-picker-listbox"
            role="listbox"
            aria-label="Components"
            className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3"
          >
            {groups.length === 0 ? (
              <p className="text-sm text-foreground/70">No components match &ldquo;{query}&rdquo;.</p>
            ) : (
              groups.map(({ category, items }) => (
                <div key={category}>
                  <h3 className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                    {categoryLabel[category]}
                  </h3>
                  <div className="mt-1 space-y-0.5">
                    {items.map((definition) => {
                      const Icon = iconMap[definition.icon] ?? Server;
                      const color = categoryColorVar[definition.category];
                      const index = flatItems.indexOf(definition);
                      const active = index === activeIndex;
                      return (
                        <div
                          key={definition.id}
                          id={`picker-item-${definition.id}`}
                          ref={(el) => {
                            if (el) itemRefs.current.set(definition.id, el);
                            else itemRefs.current.delete(definition.id);
                          }}
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => setActiveIndex(index)}
                          onClick={() => insert(definition)}
                          className={`flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 ${
                            active ? "bg-border" : ""
                          }`}
                        >
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border-2"
                            style={{
                              borderColor: color,
                              backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                            }}
                          >
                            <Icon size={16} style={{ color }} />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm text-foreground">{definition.label}</div>
                            <div className="truncate text-xs text-foreground/60">{definition.summary}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
