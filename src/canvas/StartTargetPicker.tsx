"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Search, Server, X } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { componentDisplayNames } from "./component-display-name";
import { categoryColorVar } from "./category-colors";
import { iconMap } from "./icon-map";
import type { ComponentNodeType } from "./types";

const POPUP_WIDTH = 240;
const POPUP_MAX_HEIGHT = 280;

type StartTargetPickerProps = {
  anchorRect: DOMRect;
  componentNodes: ComponentNodeType[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onClose: () => void;
};

/**
 * Replaces the old native `<select>` for a Start marker's "Points to…"
 * target — a searchable popover matching the app's existing floating-panel
 * language (ContextMenu's Flyout, AnnotationEditor), positioned via a
 * portal + fixed coordinates so it can't be clipped by an ancestor's
 * overflow (the trigger sits inside a small, tightly-clipped node card).
 * Each row's label comes from componentDisplayNames — a custom instance
 * name, or an auto ordinal ("App Server #2") when more than one node shares
 * a component type, so picking a target among several identical-looking
 * nodes is actually possible.
 */
export function StartTargetPicker({
  anchorRect,
  componentNodes,
  selectedId,
  onSelect,
  onClose,
}: StartTargetPickerProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const displayNames = useMemo(() => componentDisplayNames(componentNodes), [componentNodes]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return componentNodes
      .map((n) => ({ node: n, label: displayNames.get(n.id) ?? n.data.componentId }))
      .filter(({ label }) => !q || label.toLowerCase().includes(q));
  }, [componentNodes, displayNames, query]);

  const left = Math.min(Math.max(anchorRect.left, 8), window.innerWidth - POPUP_WIDTH - 8);
  const top = Math.min(anchorRect.bottom + 6, window.innerHeight - POPUP_MAX_HEIGHT - 8);

  return createPortal(
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        className="fixed z-50 flex flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-lg"
        style={{ left, top, width: POPUP_WIDTH, maxHeight: POPUP_MAX_HEIGHT }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 border-b border-border px-2.5 py-2">
          <Search size={13} className="shrink-0 text-foreground/40" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a component…"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-foreground/40"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto py-1">
          {selectedId && (
            <button
              type="button"
              onClick={() => {
                onSelect(null);
                onClose();
              }}
              className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-xs text-foreground/60 hover:bg-border hover:text-foreground"
            >
              <X size={13} />
              Clear target
            </button>
          )}

          {rows.length === 0 && (
            <p className="px-2.5 py-3 text-xs text-foreground/50">
              {componentNodes.length === 0 ? "No components on the canvas yet." : "No match."}
            </p>
          )}

          {rows.map(({ node, label }) => {
            const definition = getComponent(node.data.componentId);
            const Icon = (definition && iconMap[definition.icon]) ?? Server;
            const color = definition ? categoryColorVar[definition.category] : "var(--foreground)";
            const selected = node.id === selectedId;
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => {
                  onSelect(node.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-sm hover:bg-border ${
                  selected ? "text-foreground" : "text-foreground/80"
                }`}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)` }}
                >
                  <Icon size={11} style={{ color }} />
                </span>
                <span className="min-w-0 flex-1 truncate">{label}</span>
                {selected && <Check size={13} className="shrink-0 text-foreground/60" />}
              </button>
            );
          })}
        </div>
      </div>
    </>,
    document.body,
  );
}
