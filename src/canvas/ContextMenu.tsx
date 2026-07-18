"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, Copy, FileText, Flag, Lock, MessageSquare, RotateCw, Server, Settings, Trash2, Unlock } from "lucide-react";
import { useCanvasStore } from "./store";
import { componentRegistry } from "@/content/components/registry";
import { toComponentDefinition } from "@/content/components/custom";
import { categoryColorVar, categoryLabel, categoryOrder } from "./category-colors";
import { iconMap } from "./icon-map";
import type { ComponentDefinition } from "@/content/components/types";
import type { XY } from "@/lib/graph";

export type ContextMenuTarget =
  | { type: "node"; id: string; x: number; y: number }
  | { type: "edge"; id: string; x: number; y: number }
  | { type: "selection"; ids: string[]; x: number; y: number }
  | { type: "pane"; flowPosition: XY; x: number; y: number };

type ContextMenuProps = {
  target: ContextMenuTarget | null;
  onClose: () => void;
};

function MenuItem({
  icon: Icon,
  label,
  danger,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-border ${
        danger ? "text-state-error" : "text-foreground"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

const FLYOUT_WIDTH = 190;

/**
 * A hover-opened nested panel, portaled to document.body and positioned off
 * the trigger row's own measured rect (flips to the left edge if there's no
 * room on the right) — same reasoning as PaletteItem's tooltip in
 * Palette.tsx: a fixed-position ancestor can clip an in-flow flyout, so it
 * can't just be an absolutely-positioned child. Used twice, nested: once for
 * "Add component" -> category, again for category -> individual component,
 * so a 27-item registry never renders as one flat scrolling list (see
 * ContextMenu's pane case below).
 */
function Flyout({
  icon: Icon,
  iconColor,
  label,
  panel,
}: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  iconColor?: string;
  label: string;
  panel: React.ReactNode;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const open = () => {
    cancelClose();
    const rect = rowRef.current?.getBoundingClientRect();
    if (!rect) return;
    const fitsRight = rect.right + FLYOUT_WIDTH <= window.innerWidth;
    setPos({ top: rect.top, left: fitsRight ? rect.right - 2 : rect.left - FLYOUT_WIDTH + 2 });
  };
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setPos(null), 120);
  };

  return (
    <div ref={rowRef} onMouseEnter={open} onMouseLeave={scheduleClose}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-sm text-foreground hover:bg-border"
      >
        <span className="flex items-center gap-2">
          <Icon size={14} style={iconColor ? { color: iconColor } : undefined} />
          {label}
        </span>
        <ChevronRight size={12} className="text-foreground/40" />
      </button>

      {pos &&
        createPortal(
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="fixed z-40 max-h-[70vh] min-w-[180px] overflow-y-auto rounded-md border border-border bg-panel py-1 shadow-lg"
            style={{ top: pos.top, left: pos.left, width: FLYOUT_WIDTH }}
          >
            {panel}
          </div>,
          document.body,
        )}
    </div>
  );
}

/**
 * Right-click menu, shape depends on what was clicked. Delete was the
 * original (and only) option; this adds Duplicate, a Docs-tab shortcut,
 * edge direction reversal, and a quick-add menu on empty canvas — the set
 * proposed after the layout-restructure round, now built rather than left
 * as an open question.
 *
 * A multi-node selection is a distinct case from a single node: xyflow's
 * selection bounding-box overlay intercepts the right-click before it
 * reaches an individual node underneath, so it needs its own handler
 * (onSelectionContextMenu, wired in Canvas.tsx) rather than reusing
 * onNodeContextMenu.
 */
export function ContextMenu({ target, onClose }: ContextMenuProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteNodes = useCanvasStore((s) => s.deleteNodes);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const duplicateNode = useCanvasStore((s) => s.duplicateNode);
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes);
  const reverseEdge = useCanvasStore((s) => s.reverseEdge);
  const toggleAnnotationLock = useCanvasStore((s) => s.toggleAnnotationLock);
  const openDocTab = useCanvasStore((s) => s.openDocTab);
  const addNode = useCanvasStore((s) => s.addNode);
  const addComment = useCanvasStore((s) => s.addComment);
  const addStartMarker = useCanvasStore((s) => s.addStartMarker);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const openConfigPopover = useCanvasStore((s) => s.openConfigPopover);
  // Custom components (see CreateComponentModal.tsx) live in the store as
  // raw records, not the static registry array — combined here, same as
  // Palette.tsx, so a newly-created component shows up in this list
  // immediately too.
  const customComponents = useCanvasStore((s) => s.customComponents);
  const allComponents = [...componentRegistry, ...customComponents.map(toComponentDefinition)];

  // Unlike Flyout (fixed FLYOUT_WIDTH, so it can flip with just the
  // trigger row's rect), this panel's height varies a lot by target.type
  // (node/edge/selection/pane each show a different item count) — real
  // measurement after render, not an assumed size, is what's needed to
  // keep it fully on-screen when the right-clicked target sits near a
  // viewport edge. Mutates the element's own style directly (not React
  // state) so clamping doesn't trigger a second render — it runs before
  // paint (useLayoutEffect either way), so there's no visible jump from
  // the unclamped position to the corrected one.
  const menuRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!target || !el) return;
    const margin = 8;
    const left = Math.max(margin, Math.min(target.x, window.innerWidth - el.offsetWidth - margin));
    const top = Math.max(margin, Math.min(target.y, window.innerHeight - el.offsetHeight - margin));
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }, [target]);

  if (!target) return null;

  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };

  // Docs tabs are keyed by componentId (see store.ts), not node id — the
  // menu only has the clicked node's id, so resolve it here.
  const viewDocsForNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.type === "component") openDocTab(node.data.componentId);
  };

  return (
    <>
      {/* Full-screen catcher to close the menu on the next click anywhere else. */}
      <div className="fixed inset-0 z-20" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        ref={menuRef}
        className="fixed z-30 min-w-[180px] rounded-md border border-border bg-panel py-1 shadow-lg"
        style={{ left: target.x, top: target.y }}
      >
        {target.type === "node" && (() => {
          const node = nodes.find((n) => n.id === target.id);
          const isAnnotation = node?.type === "zone" || node?.type === "comment" || node?.type === "start";
          const locked = isAnnotation && node.data.locked;
          return (
            <>
              <MenuItem icon={Copy} label="Duplicate" onClick={act(() => duplicateNode(target.id))} />
              {isAnnotation ? (
                <MenuItem
                  icon={locked ? Unlock : Lock}
                  label={locked ? "Unlock" : "Lock"}
                  onClick={act(() => toggleAnnotationLock(target.id))}
                />
              ) : (
                <>
                  <MenuItem
                    icon={Settings}
                    label="Configure"
                    onClick={act(() => openConfigPopover(target.id, { x: target.x, y: target.y }))}
                  />
                  <MenuItem
                    icon={FileText}
                    label="Open Documentation"
                    onClick={act(() => viewDocsForNode(target.id))}
                  />
                </>
              )}
              <MenuItem icon={Trash2} label="Delete" danger onClick={act(() => deleteNode(target.id))} />
            </>
          );
        })()}

        {target.type === "edge" && (
          <>
            <MenuItem
              icon={RotateCw}
              label="Reverse direction"
              onClick={act(() => reverseEdge(target.id))}
            />
            <MenuItem icon={Trash2} label="Delete" danger onClick={act(() => deleteEdge(target.id))} />
          </>
        )}

        {target.type === "selection" && (
          <>
            <MenuItem
              icon={Copy}
              label={`Duplicate ${target.ids.length} components`}
              onClick={act(() => duplicateNodes(target.ids))}
            />
            <MenuItem
              icon={Trash2}
              label={`Delete ${target.ids.length} components`}
              danger
              onClick={act(() => deleteNodes(target.ids))}
            />
          </>
        )}

        {target.type === "pane" && (
          <>
            <MenuItem
              icon={MessageSquare}
              label="Add comment here"
              onClick={act(() => {
                const id = addComment(target.flowPosition);
                openAnnotationEditor(id, { x: target.x, y: target.y });
              })}
            />
            <MenuItem
              icon={Flag}
              label="Add flag here"
              onClick={act(() => {
                const id = addStartMarker(target.flowPosition);
                openAnnotationEditor(id, { x: target.x, y: target.y });
              })}
            />
            <div className="my-1 border-t border-border" />
            <Flyout
              icon={Server}
              label="Add component"
              panel={
                <>
                  {categoryOrder
                    .filter((category) => allComponents.some((d) => d.category === category))
                    .map((category) => {
                      const items = allComponents.filter(
                        (d): d is ComponentDefinition => d.category === category,
                      );
                      return (
                        <Flyout
                          key={category}
                          icon={Server}
                          iconColor={categoryColorVar[category]}
                          label={categoryLabel[category]}
                          panel={
                            <>
                              {items.map((definition) => {
                                const Icon = iconMap[definition.icon] ?? Server;
                                return (
                                  <MenuItem
                                    key={definition.id}
                                    icon={Icon}
                                    label={definition.label}
                                    onClick={act(() => addNode(definition, target.flowPosition))}
                                  />
                                );
                              })}
                            </>
                          }
                        />
                      );
                    })}
                </>
              }
            />
          </>
        )}
      </div>
    </>
  );
}
