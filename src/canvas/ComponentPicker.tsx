"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, MessageSquare, Plus, Search, SquareDashedBottom } from "lucide-react";
import { componentRegistry } from "@/content/components/registry";
import { toComponentDefinition, type CustomComponentRecord } from "@/content/components/custom";
import type { ComponentDefinition } from "@/content/components/types";
import { db } from "@/persistence/db";
import { filterAndGroupComponents } from "./component-search";
import { useCanvasStore } from "./store";
import { type ToolAction } from "./ComponentPickerTools";
import { ComponentPickerResults } from "./ComponentPickerResults";
import { ComponentPickerCategoryNav } from "./ComponentPickerCategoryNav";
import { DeleteConfirmPopover } from "./DeleteConfirmPopover";
import { CreateComponentModal } from "./CreateComponentModal";

/**
 * Centered command-palette-style dialog — the app's one component-insertion
 * surface, replacing Palette.tsx's sidebar grid entirely (see
 * .claude/docs/UI_OVERHAUL_PART2_SPEC.md). Reachable via `/` or right-click
 * on empty canvas. Search filters both built-in and custom components; a
 * trailing Tools group covers zone/comment/flag placement and custom
 * component authoring, replacing the old palette toolbar one-for-one.
 */
export function ComponentPicker() {
  const isOpen = useCanvasStore((s) => s.componentPicker);
  const closeComponentPicker = useCanvasStore((s) => s.closeComponentPicker);
  const setPendingComponentPlacement = useCanvasStore((s) => s.setPendingComponentPlacement);
  const customComponents = useCanvasStore((s) => s.customComponents);
  const upsertCustomComponent = useCanvasStore((s) => s.upsertCustomComponent);
  const deleteCustomComponent = useCanvasStore((s) => s.deleteCustomComponent);
  const nodes = useCanvasStore((s) => s.nodes);
  const setPlacementMode = useCanvasStore((s) => s.setPlacementMode);

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [lastQuery, setLastQuery] = useState(query);
  const [wasOpen, setWasOpen] = useState(false);
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; record: CustomComponentRecord } | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<{ record: CustomComponentRecord; x: number; y: number } | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  const allComponents = useMemo(
    () => [...componentRegistry, ...customComponents.map(toComponentDefinition)],
    [customComponents],
  );
  const customIds = useMemo(() => new Set(customComponents.map((r) => r.id)), [customComponents]);

  // Deleting a custom component removes its *definition*, not one instance
  // — every placed node using it would silently stop rendering. Counted
  // here so the confirm popover can block the delete with an explanation.
  const customUsageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      if (n.type === "component") counts.set(n.data.componentId, (counts.get(n.data.componentId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);

  const groups = useMemo(() => filterAndGroupComponents(allComponents, query), [allComponents, query]);
  const flatComponentItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  const close = () => {
    closeComponentPicker();
    // Falls back to the react-flow pane wrapper (not just window focus) so
    // Delete/arrow-key node operations resume without an extra click — the
    // pane wrapper is what actually owns those key handlers.
    const fallback = document.querySelector<HTMLElement>(".react-flow__pane");
    (lastFocusedRef.current ?? fallback)?.focus();
  };

  // Arms click-to-place instead of inserting directly at a guessed position
  // — the user always confirms the exact landing spot with a real click on
  // the canvas (see Canvas.tsx's pendingComponentPlacement handling). The
  // picker's own remembered flowPosition (from a right-click open) is no
  // longer used for insertion, only as a reasonable place to open the
  // dialog itself.
  const insert = (definition: ComponentDefinition) => {
    close();
    setPendingComponentPlacement(definition);
  };

  // Replace the palette toolbar's four buttons one-for-one. Pure data, no
  // closures — dispatch happens by id in handleToolSelect below. Keeping
  // ref-touching logic (close()) out of this array is deliberate: React
  // Compiler's ref-safety lint conservatively taints an entire array/object
  // graph once any closure inside it reads a ref, and this array is read
  // during render (for flatCount/activeId) as well as passed to JSX.
  const tools: ToolAction[] = [
    {
      id: "tool-zone",
      label: "Add zone",
      description: "Visual grouping only — doesn't move or reparent components inside it",
      icon: SquareDashedBottom,
    },
    {
      id: "tool-comment",
      label: "Add comment",
      description: "Add a free-floating comment note",
      icon: MessageSquare,
    },
    {
      id: "tool-flag",
      label: "Add flag",
      description: "Add a labeled, recolorable flag pointing at a component",
      icon: Flag,
    },
    {
      id: "tool-new-component",
      label: "New component",
      description: "Create your own component",
      icon: Plus,
    },
  ];
  const q = query.trim().toLowerCase();
  const filteredTools = q ? tools.filter((t) => t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)) : tools;

  // Decoration renders first (product direction), so its items occupy the
  // front of the single flat keyboard-nav array; component tiles are
  // offset by filteredTools.length.
  const componentIndex = useMemo(() => {
    const m = new Map<string, number>();
    flatComponentItems.forEach((d, i) => m.set(d.id, i + filteredTools.length));
    return m;
  }, [flatComponentItems, filteredTools.length]);

  // Zone/comment/flag hand off to the existing placementMode drag-to-draw
  // gesture (same as the old toolbar); the picker must close FIRST so its
  // backdrop isn't still capturing pointer events when that gesture's own
  // crosshair overlay activates (see the spec's "Risks" section).
  const handleToolSelect = (id: string) => {
    close();
    if (id === "tool-zone") setPlacementMode("zone");
    else if (id === "tool-comment") setPlacementMode("comment");
    else if (id === "tool-flag") setPlacementMode("start");
    else if (id === "tool-new-component") setModal({ mode: "create" });
  };

  const flatCount = flatComponentItems.length + filteredTools.length;

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
    if (!isOpen || flatCount === 0) return;
    const clamped = Math.min(activeIndex, flatCount - 1);
    const activeId =
      clamped < filteredTools.length
        ? filteredTools[clamped]?.id
        : flatComponentItems[clamped - filteredTools.length]?.id;
    if (activeId) itemRefs.current.get(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, flatCount, flatComponentItems, filteredTools, isOpen]);

  const activateItem = (index: number) => {
    if (index < filteredTools.length) {
      const tool = filteredTools[index];
      if (tool) handleToolSelect(tool.id);
    } else {
      insert(flatComponentItems[index - filteredTools.length]);
    }
  };

  // A window-level listener, not a React onKeyDown on the dialog — the
  // latter only fires when the event's focus target is a DESCENDANT of the
  // dialog div. Double-clicking a plain (non-focusable) text node inside
  // the dialog — a category heading, say — blurs the search input and
  // moves document.activeElement to <body>, which is an ANCESTOR of the
  // dialog, not a descendant, so a dialog-scoped onKeyDown silently stops
  // receiving every keystroke including Escape. Window-level is
  // focus-independent by construction, matching the same pattern
  // Canvas.tsx's own Escape handling already uses.
  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, flatCount - 1));
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
        setActiveIndex(flatCount - 1);
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        if (flatCount > 0) activateItem(activeIndex);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, flatCount, activeIndex, filteredTools, flatComponentItems]);

  const handleSaveCustom = (record: CustomComponentRecord) => {
    void db.customComponents.put(record);
    upsertCustomComponent(record);
    setModal(null);
  };

  const handleDeleteCustom = (record: CustomComponentRecord) => {
    void db.customComponents.delete(record.id);
    deleteCustomComponent(record.id);
    setDeleteTarget(null);
  };

  const activeId =
    activeIndex < filteredTools.length
      ? filteredTools[activeIndex]?.id
      : flatComponentItems[activeIndex - filteredTools.length]?.id;

  return (
    <>
      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[var(--z-modal-backdrop)]"
              onClick={close}
              onContextMenu={(e) => e.preventDefault()}
            />
            {/* pointer-events-none here, re-enabled on the panel below — this
             * centering wrapper spans the full viewport (needed for
             * grid place-items-center), and without this it would sit on
             * TOP of the backdrop above and silently swallow every click
             * in the empty space around the panel (a click hits whichever
             * element is topmost at that point; the backdrop below never
             * sees it since these are siblings, not ancestor/descendant),
             * making "click outside to close" a dead affordance everywhere
             * except the few pixels the backdrop happens to show through. */}
            <div className="pointer-events-none fixed inset-0 z-[var(--z-modal)] grid place-items-center px-4">
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Add a component"
                className="motion-reduce:transition-none pointer-events-auto flex max-h-[70vh] w-[640px] max-w-full flex-col rounded-md border border-border bg-panel shadow-lg transition-opacity duration-150"
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
                      aria-activedescendant={activeId ? `picker-item-${activeId}` : undefined}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search components..."
                      className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-foreground/40"
                    />
                  </div>
                  <p aria-live="polite" className="sr-only">
                    {flatCount} result{flatCount === 1 ? "" : "s"} found
                  </p>
                </div>

                <div className="flex min-h-0 flex-1">
                  <ComponentPickerCategoryNav
                    categories={groups.map((g) => g.category)}
                    hasDecoration={filteredTools.length > 0}
                  />
                  <div
                    id="component-picker-listbox"
                    role="listbox"
                    aria-label="Components"
                    className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3"
                  >
                    <ComponentPickerResults
                      query={query}
                      flatCount={flatCount}
                      groups={groups}
                      customIds={customIds}
                      componentIndex={componentIndex}
                      activeIndex={activeIndex}
                      onSelectComponent={insert}
                      onActivate={setActiveIndex}
                      onEditCustom={(definition) => {
                        const record = customComponents.find((r) => r.id === definition.id);
                        if (record) {
                          close();
                          setModal({ mode: "edit", record });
                        }
                      }}
                      onDeleteCustom={(definition, event) => {
                        const record = customComponents.find((r) => r.id === definition.id);
                        if (record) {
                          const { clientX: x, clientY: y } = event;
                          close();
                          setDeleteTarget({ record, x, y });
                        }
                      }}
                      tools={filteredTools}
                      onSelectTool={handleToolSelect}
                      registerRef={(id, el) => {
                        if (el) itemRefs.current.set(id, el);
                        else itemRefs.current.delete(id);
                      }}
                    />
                  </div>
                </div>

                <p className="border-t border-border px-3 py-2 text-center text-[11px] text-foreground/50">
                  Tip: right-click the canvas or press / to add a component
                </p>
              </div>
            </div>
          </>,
          document.body,
        )}

      {modal &&
        createPortal(
          <CreateComponentModal
            onClose={() => setModal(null)}
            onSave={handleSaveCustom}
            initialRecord={modal.mode === "edit" ? modal.record : undefined}
          />,
          document.body,
        )}

      {deleteTarget &&
        createPortal(
          <DeleteConfirmPopover
            target={deleteTarget}
            usageCount={customUsageCounts.get(deleteTarget.record.id) ?? 0}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => handleDeleteCustom(deleteTarget.record)}
          />,
          document.body,
        )}
    </>
  );
}
