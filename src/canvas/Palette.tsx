"use client";

import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Flag, MessageSquare, Pencil, Plus, Search, Server, SquareDashedBottom, Trash2 } from "lucide-react";
import { componentRegistry } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";
import { toComponentDefinition, type CustomComponentRecord } from "@/content/components/custom";
import { db } from "@/persistence/db";
import { categoryColorVar, categoryLabel, categoryOrder } from "./category-colors";
import { iconMap } from "./icon-map";
import { useCanvasStore } from "./store";
import { CreateComponentModal } from "./CreateComponentModal";

/** The MIME type used to identify a drag as "a component from our palette"
 * vs. an arbitrary browser drag (e.g. dragging a link/image onto the page). */
export const PALETTE_DRAG_TYPE = "application/scalecraft-component";

const TOOLTIP_WIDTH = 176;
// Rough upper bound for a two-line label + two-line summary at this padding
// — used only to decide whether the tooltip fits below the item or needs to
// flip above it, not for exact layout.
const TOOLTIP_EST_HEIGHT = 90;

function PaletteItem({
  definition,
  isCustom,
  onEdit,
  onDelete,
}: {
  definition: ComponentDefinition;
  isCustom?: boolean;
  onEdit?: () => void;
  onDelete?: (event: React.MouseEvent) => void;
}) {
  const Icon = iconMap[definition.icon] ?? Server;
  const color = categoryColorVar[definition.category];
  const boxRef = useRef<HTMLDivElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  // Portaled to document.body and positioned via a measured rect, rather
  // than a plain absolute/group-hover child — the palette list below is a
  // scrolling container, and CSS couples overflow-x to overflow-y's
  // non-visible value (there's no way to scroll one axis while leaving the
  // other visible), so an in-flow tooltip gets silently clipped exactly
  // where it'd otherwise need to show.
  const showTooltip = () => {
    const rect = boxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const margin = 8;
    const left = Math.min(
      Math.max(center, TOOLTIP_WIDTH / 2 + margin),
      window.innerWidth - TOOLTIP_WIDTH / 2 - margin,
    );
    // Flip above the tile when there isn't room below. The reported case
    // isn't the viewport edge — it's the tile's OWN category group ending
    // right below it, so the tooltip spills into the next group's tiles.
    // Measure against the specific group container's own bottom (not just
    // window.innerHeight) so this actually detects that case.
    const groupRect = boxRef.current?.closest("[data-palette-group]")?.getBoundingClientRect();
    const roomInGroup = groupRect ? groupRect.bottom - rect.bottom : Infinity;
    const roomInViewport = window.innerHeight - rect.bottom;
    const fitsBelow = Math.min(roomInGroup, roomInViewport) >= TOOLTIP_EST_HEIGHT;
    const top = fitsBelow ? rect.bottom + 6 : rect.top - 6 - TOOLTIP_EST_HEIGHT;
    setTooltipPos({ top, left });
  };

  return (
    <div
      ref={boxRef}
      onMouseEnter={showTooltip}
      onMouseLeave={() => setTooltipPos(null)}
      className="group/item relative flex flex-col items-center gap-1"
    >
      {isCustom && (
        <div className="absolute -right-1.5 -top-1.5 z-10 hidden gap-0.5 group-hover/item:flex">
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            aria-label={`Edit ${definition.label}`}
            className="rounded border border-border bg-panel p-0.5 text-foreground/60 shadow-sm hover:text-foreground"
          >
            <Pencil size={10} />
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(e);
            }}
            aria-label={`Delete ${definition.label}`}
            className="rounded border border-border bg-panel p-0.5 text-foreground/60 shadow-sm hover:text-state-error"
          >
            <Trash2 size={10} />
          </button>
        </div>
      )}
      <div
        draggable
        onDragStart={(event) => {
          event.dataTransfer.setData(PALETTE_DRAG_TYPE, definition.id);
          event.dataTransfer.effectAllowed = "move";
        }}
        className="flex h-10 w-10 cursor-grab items-center justify-center rounded-lg border-2 active:cursor-grabbing"
        style={{
          borderColor: color,
          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
        }}
      >
        <Icon size={22} style={{ color }} />
      </div>
      <span className="w-16 text-center text-xs leading-tight text-foreground/70">{definition.label}</span>

      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-border bg-panel px-2.5 py-2 shadow-lg"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-xs font-semibold text-foreground">{definition.label}</div>
            <div className="mt-0.5 text-xs leading-snug text-foreground/70">{definition.summary}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * A toolbar button that's icon-only, always — no hover-expand width
 * animation. Name + short description live together in a portaled hover
 * tooltip (same positioning approach as PaletteItem's tooltip below) instead
 * of the native `title` attribute, so the two can be styled distinctly
 * (bold name, muted description) rather than a single plain-text line.
 */
function ToolbarButton({
  icon: Icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  description: string;
  active?: boolean;
  onClick: () => void;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const showTooltip = () => {
    const rect = btnRef.current?.getBoundingClientRect();
    if (!rect) return;
    const center = rect.left + rect.width / 2;
    const margin = 8;
    const left = Math.min(
      Math.max(center, TOOLTIP_WIDTH / 2 + margin),
      window.innerWidth - TOOLTIP_WIDTH / 2 - margin,
    );
    setTooltipPos({ top: rect.bottom + 6, left });
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={onClick}
        onMouseEnter={showTooltip}
        onMouseLeave={() => setTooltipPos(null)}
        aria-label={label}
        className={`flex items-center justify-center rounded-md border p-1.5 ${
          active
            ? "border-foreground/40 text-foreground"
            : "border-border text-foreground/60 hover:text-foreground"
        }`}
      >
        <Icon size={14} className="shrink-0" />
      </button>

      {tooltipPos &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 rounded-md border border-border bg-panel px-2.5 py-2 shadow-lg"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: TOOLTIP_WIDTH,
              transform: "translateX(-50%)",
            }}
          >
            <div className="text-xs font-semibold text-foreground">{label}</div>
            <div className="mt-0.5 text-xs leading-snug text-foreground/70">{description}</div>
          </div>,
          document.body,
        )}
    </>
  );
}

/**
 * A searchable grid, grouped by category, living inside the left panel (see
 * QuestionPanel.tsx) rather than a horizontal tray under the canvas. Each
 * card is icon+name only (Clapet-style) — the description moves to a
 * hover-only detail card so the grid stays compact as the registry grows
 * (two Building Blocks chapters plus one Real World Extraction chapter each
 * add components — see .claude/docs/MILESTONES.md). No own collapse
 * toggle — the containing QuestionPanel aside already has one.
 */
export function Palette() {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<{ mode: "create" } | { mode: "edit"; record: CustomComponentRecord } | null>(
    null,
  );
  const placementMode = useCanvasStore((s) => s.placementMode);
  const setPlacementMode = useCanvasStore((s) => s.setPlacementMode);
  const customComponents = useCanvasStore((s) => s.customComponents);
  const upsertCustomComponent = useCanvasStore((s) => s.upsertCustomComponent);
  const deleteCustomComponent = useCanvasStore((s) => s.deleteCustomComponent);
  const nodes = useCanvasStore((s) => s.nodes);
  const togglePlacement = (mode: "zone" | "comment" | "start") =>
    setPlacementMode(placementMode === mode ? null : mode);

  const handleSave = (record: CustomComponentRecord) => {
    void db.customComponents.put(record);
    upsertCustomComponent(record);
    setModal(null);
  };

  // Deleting a custom component removes its *definition*, not one instance
  // — every placed node using it would silently stop rendering (see
  // ComponentNode.tsx: it returns null when getComponent can't find a
  // definition). Counted here so the confirm popover below can block the
  // delete with an explanation instead of letting that happen silently.
  const customUsageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of nodes) {
      if (n.type === "component") counts.set(n.data.componentId, (counts.get(n.data.componentId) ?? 0) + 1);
    }
    return counts;
  }, [nodes]);

  // One shared target rather than per-tile state — same "one target, one
  // portaled overlay, click-outside backdrop" shape as ContextMenu's own
  // menu state, just scoped to this one confirm popover instead of a menu.
  const [deleteTarget, setDeleteTarget] = useState<{ record: CustomComponentRecord; x: number; y: number } | null>(
    null,
  );

  const handleDelete = (record: CustomComponentRecord) => {
    void db.customComponents.delete(record.id);
    deleteCustomComponent(record.id);
    setDeleteTarget(null);
  };

  // Custom components (see CreateComponentModal.tsx) live in the store as
  // raw editable records, not the static registry array — combined here so
  // search/grouping treats both as one list, and a newly-created or edited
  // component shows up immediately with no reload.
  const customIds = useMemo(() => new Set(customComponents.map((r) => r.id)), [customComponents]);
  const allComponents = useMemo(
    () => [...componentRegistry, ...customComponents.map(toComponentDefinition)],
    [customComponents],
  );

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? allComponents.filter(
          (d) => d.label.toLowerCase().includes(q) || d.summary.toLowerCase().includes(q),
        )
      : allComponents;
    return categoryOrder
      .map((category) => ({ category, items: matches.filter((d) => d.category === category) }))
      .filter((g) => g.items.length > 0);
  }, [query, allComponents]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5 px-3 pt-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Components</h2>
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={SquareDashedBottom}
            label={placementMode === "zone" ? "Cancel" : "Add zone"}
            description="Visual grouping only — a zone doesn't move or reparent the components inside it"
            active={placementMode === "zone"}
            onClick={() => togglePlacement("zone")}
          />
          <ToolbarButton
            icon={MessageSquare}
            label={placementMode === "comment" ? "Cancel" : "Add comment"}
            description="Add a free-floating comment note"
            active={placementMode === "comment"}
            onClick={() => togglePlacement("comment")}
          />
          <ToolbarButton
            icon={Flag}
            label={placementMode === "start" ? "Cancel" : "Add start"}
            description="Add a start-here marker"
            active={placementMode === "start"}
            onClick={() => togglePlacement("start")}
          />
          <ToolbarButton
            icon={Plus}
            label="New component"
            description="Create your own component"
            onClick={() => setModal({ mode: "create" })}
          />
        </div>
      </div>

      <div className="px-3 pt-2">
        {/* The icon centers against THIS relative wrapper's box — it must
         * hug the input with no extra padding of its own, or `top-1/2`
         * centers against the padded box instead of the input and the icon
         * reads as vertically off relative to the placeholder text. */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-2 text-sm outline-none focus:border-foreground/40"
          />
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1 space-y-4 overflow-y-auto p-3">
        {grouped.length === 0 ? (
          <p className="text-sm text-foreground/70">No components match &ldquo;{query}&rdquo;.</p>
        ) : (
          grouped.map(({ category, items }) => (
            <div key={category}>
              <h3 className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">
                {categoryLabel[category]}
              </h3>
              <div data-palette-group className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
                {items.map((definition) => {
                  const isCustom = customIds.has(definition.id);
                  return (
                    <PaletteItem
                      key={definition.id}
                      definition={definition}
                      isCustom={isCustom}
                      onEdit={
                        isCustom
                          ? () => {
                              const record = customComponents.find((r) => r.id === definition.id);
                              if (record) setModal({ mode: "edit", record });
                            }
                          : undefined
                      }
                      onDelete={
                        isCustom
                          ? (event) => {
                              const record = customComponents.find((r) => r.id === definition.id);
                              if (record) setDeleteTarget({ record, x: event.clientX, y: event.clientY });
                            }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {modal && (
        <CreateComponentModal
          onClose={() => setModal(null)}
          onSave={handleSave}
          initialRecord={modal.mode === "edit" ? modal.record : undefined}
        />
      )}

      {deleteTarget &&
        createPortal(
          <DeleteConfirmPopover
            target={deleteTarget}
            usageCount={customUsageCounts.get(deleteTarget.record.id) ?? 0}
            onCancel={() => setDeleteTarget(null)}
            onConfirm={() => handleDelete(deleteTarget.record)}
          />,
          document.body,
        )}
    </div>
  );
}

/**
 * The 4th instance of the app's one documented floating-menu visual
 * language (raised-panel, hairline-border, 6px radius, floating-menu
 * shadow — see DESIGN.md's "Dropdown / Context Menus"), not a new pattern —
 * a full-viewport click-catcher backdrop closes it on any outside click,
 * same as ExportMenu/ContextMenu. Deleting a custom component removes its
 * definition, not an instance, so this is deliberately a harder stop than
 * node/edge delete's toast-based undo: no confirm dialogs exist elsewhere in
 * this app, but nothing here is undoable after the fact (see
 * customUsageCounts's comment in Palette above), which is exactly the case
 * that safety net doesn't cover.
 */
function DeleteConfirmPopover({
  target,
  usageCount,
  onCancel,
  onConfirm,
}: {
  target: { record: CustomComponentRecord; x: number; y: number };
  usageCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const left = Math.min(target.x, window.innerWidth - 272);
  const top = Math.min(target.y + 8, window.innerHeight - 140);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onCancel} />
      <div
        className="fixed z-50 w-64 rounded-md border border-border bg-panel p-3 shadow-lg"
        style={{ left, top }}
      >
        {usageCount > 0 ? (
          <>
            <p className="text-sm text-foreground">
              &ldquo;{target.record.label}&rdquo; is used by {usageCount} node{usageCount === 1 ? "" : "s"} on the
              canvas.
            </p>
            <p className="mt-1 text-xs text-foreground/60">Remove those first, then delete it.</p>
            <button
              onClick={onCancel}
              className="mt-3 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
            >
              OK
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">
              Delete &ldquo;{target.record.label}&rdquo;? This can&rsquo;t be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-state-error hover:bg-border"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
