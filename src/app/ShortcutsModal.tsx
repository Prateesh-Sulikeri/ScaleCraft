"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import { useViewportWidth } from "@/lib/use-large-screen";
import { CenteredModal } from "./CenteredModal";

type Shortcut = { keys: string; label: string };
type ShortcutSection = { title: string; shortcuts: Shortcut[] };

// Grouped by use case (not by modifier key) so a user scanning for "how do I
// pan around" or "how do I undo" finds the whole cluster of related
// shortcuts in one place, rather than one flat alphabetical list.
const SHORTCUT_SECTIONS: ShortcutSection[] = [
  {
    title: "Canvas navigation",
    shortcuts: [
      { keys: "Space + Drag", label: "Pan canvas" },
      { keys: "Middle-click + Drag", label: "Pan canvas" },
      { keys: "Ctrl/Cmd + Scroll", label: "Zoom towards cursor" },
      { keys: "Shift + Scroll", label: "Pan horizontally" },
      { keys: "Trackpad pinch", label: "Zoom in / out" },
      { keys: "Ctrl/Cmd+=", label: "Zoom in" },
      { keys: "Ctrl/Cmd+-", label: "Zoom out" },
      { keys: "Ctrl/Cmd+0", label: "Reset zoom to 100%" },
      { keys: "Shift+1", label: "Fit entire graph to view" },
      { keys: "Shift+2", label: "Fit selection to view" },
      { keys: "Arrow keys", label: "Nudge selected node(s)" },
      { keys: "Shift+Arrow", label: "Nudge selected node(s) (4x)" },
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      { keys: "Ctrl/Cmd+Z", label: "Undo" },
      { keys: "Ctrl/Cmd+Shift+Z", label: "Redo" },
      { keys: "Ctrl/Cmd+D", label: "Duplicate selection" },
      { keys: "Ctrl/Cmd+A", label: "Select all" },
      { keys: "Ctrl/Cmd+Shift+L", label: "Lock/unlock selection" },
      { keys: "Delete / Backspace", label: "Delete selection" },
    ],
  },
  {
    title: "Components & documentation",
    shortcuts: [
      { keys: "/", label: "Add component" },
      { keys: "Ctrl/Cmd+/", label: "Open documentation for selected component" },
      { keys: "?", label: "Open keyboard shortcuts" },
      { keys: "Esc", label: "Close keyboard shortcuts" },
    ],
  },
  {
    title: "File",
    shortcuts: [
      { keys: "Ctrl/Cmd+S", label: "Save" },
      { keys: "Ctrl/Cmd+E", label: "Export JSON" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: "Esc", label: "Cancel placement / close popovers" },
      { keys: "Esc", label: "Exit focus notes mode" },
    ],
  },
];

/**
 * Splits sections across `columnCount` columns by running total weight, not
 * document order — CSS multi-column's own `balance` algorithm was tried
 * first and rejected: with Canvas Navigation alone holding 12 shortcuts
 * against General's 2, the browser packed the whole first section into
 * column 1 and left column 2 mostly empty, since it can't split a
 * `break-inside-avoid` block and has no per-section size hint to balance
 * against. Greedily assigning each section to the currently lightest column
 * (a section's "weight" is its shortcut count plus a fixed header/spacing
 * allowance) keeps the same content genuinely level across columns instead.
 */
function distributeIntoColumns(sections: ShortcutSection[], columnCount: number): ShortcutSection[][] {
  const HEADER_WEIGHT = 2;
  const columns: ShortcutSection[][] = Array.from({ length: columnCount }, () => []);
  const weights = new Array(columnCount).fill(0);
  for (const section of sections) {
    const lightest = weights.indexOf(Math.min(...weights));
    columns[lightest].push(section);
    weights[lightest] += section.shortcuts.length + HEADER_WEIGHT;
  }
  return columns.filter((column) => column.length > 0);
}

/**
 * Centered modal listing every keyboard shortcut, sections grouped by use
 * case — reuses CenteredModal (shared with AboutButton/ReleaseNotesButton)
 * instead of ShortcutsButton's old hand-rolled dropdown, so it opens the
 * same way from the header button AND from the global Shift+/ shortcut (see
 * use-canvas-shortcuts.ts), which a locally-scoped dropdown couldn't reach.
 *
 * Search matches a section title (e.g. "navigation" shows the whole Canvas
 * Navigation section) OR an individual shortcut's label/keys (e.g. "undo" or
 * "ctrl+z" narrows to just that row) - either way of looking for a shortcut
 * should work, per the request for "section wise and shortcut wise"
 * searching.
 */
export function ShortcutsModal() {
  const open = useCanvasStore((s) => s.shortcutsModalOpen);
  const close = useCanvasStore((s) => s.closeShortcutsModal);
  const [search, setSearch] = useState("");

  // Resets the search whenever the modal closes, regardless of *how* it
  // closed (backdrop click, the CenteredModal X, or Escape, all of which
  // just flip shortcutsModalOpen to false) - the component itself stays
  // mounted the whole time (see sandbox/page.tsx), so without this the next
  // open would silently resume the last search instead of the full list.
  // Adjusted during render (React's documented pattern for state derived
  // from a prop/store change - https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes)
  // rather than a useEffect, which would call setState after an extra
  // committed render instead of before the closed state ever paints.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setSearch("");
  }

  // Below 768 the app doesn't render at all (see ScreenSizeGate.tsx / MVP
  // scope's desktop-first call), so 1 column never actually happens in
  // practice — kept as a safe floor rather than assumed away.
  const viewportWidth = useViewportWidth();
  const columnCount = viewportWidth >= 1024 ? 3 : viewportWidth >= 768 ? 2 : 1;

  const sections = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (query === "") return SHORTCUT_SECTIONS;
    return SHORTCUT_SECTIONS.map((section) => {
      const titleMatches = section.title.toLowerCase().includes(query);
      const shortcuts = titleMatches
        ? section.shortcuts
        : section.shortcuts.filter(
            (s) => s.label.toLowerCase().includes(query) || s.keys.toLowerCase().includes(query),
          );
      return { ...section, shortcuts };
    }).filter((section) => section.shortcuts.length > 0);
  }, [search]);

  const columns = useMemo(
    () => distributeIntoColumns(sections, columnCount),
    [sections, columnCount],
  );

  if (!open) return null;

  return (
    <CenteredModal title="Keyboard shortcuts" onClose={close} size="wide">
      <div className="relative mb-6">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground/40" />
        <input
          type="text"
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search sections or shortcuts..."
          className="w-full rounded-md border border-border bg-background py-1.5 pl-7 pr-7 text-sm outline-none focus:border-foreground/40"
        />
        {search !== "" && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-foreground/40 hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {sections.length === 0 ? (
        <p className="py-6 text-center text-sm text-foreground/50">No shortcuts match &quot;{search}&quot;.</p>
      ) : (
        <div className="flex gap-x-10">
          {columns.map((column, columnIndex) => (
            <div key={columnIndex} className="flex flex-1 flex-col gap-8">
              {column.map((section) => (
                <div key={section.title}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
                    {section.title}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {section.shortcuts.map((s, i) => (
                      <div key={`${s.label}-${i}`} className="flex items-center justify-between gap-3 py-0.5">
                        <span className="text-sm text-foreground/80">{s.label}</span>
                        <kbd className="shrink-0 rounded border border-border bg-panel px-1.5 py-0.5 font-mono text-[11px] text-foreground/70">
                          {s.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </CenteredModal>
  );
}
