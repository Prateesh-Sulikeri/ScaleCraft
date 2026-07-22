"use client";

import { useLayoutEffect, useRef } from "react";
import {
  Copy,
  FileText,
  Focus,
  Frame,
  Lock,
  RotateCw,
  Settings,
  Trash2,
  Unlock,
  Waypoints,
} from "lucide-react";
import { useCanvasStore } from "./store";

export type ContextMenuTarget =
  | { type: "node"; id: string; x: number; y: number }
  | { type: "edge"; id: string; x: number; y: number }
  | { type: "selection"; ids: string[]; x: number; y: number };

type ContextMenuProps = {
  target: ContextMenuTarget | null;
  onClose: () => void;
  /** Frames the given node in the viewport (xyflow's imperative `fitView`,
   * scoped to one node) — lives in Canvas.tsx since that's where the
   * `useReactFlow()` hook the action needs is already destructured, so it's
   * passed down as a plain prop rather than duplicating the hook here. */
  centerOnNode: (nodeId: string) => void;
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

/**
 * Right-click menu, shape depends on what was clicked. Delete was the
 * original (and only) option; this adds Duplicate, a Docs-tab shortcut, and
 * edge direction reversal. The empty-canvas quick-add menu that used to live
 * here (pane target) was replaced by ComponentPicker.tsx, which right-click
 * on empty canvas now opens directly (see Canvas.tsx's onPaneContextMenu and
 * .claude/docs/UI_OVERHAUL_PART2_SPEC.md) — so this component only ever
 * targets a node, edge, or multi-selection now.
 *
 * A multi-node selection is a distinct case from a single node: xyflow's
 * selection bounding-box overlay intercepts the right-click before it
 * reaches an individual node underneath, so it needs its own handler
 * (onSelectionContextMenu, wired in Canvas.tsx) rather than reusing
 * onNodeContextMenu.
 */
export function ContextMenu({ target, onClose, centerOnNode }: ContextMenuProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteNodes = useCanvasStore((s) => s.deleteNodes);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);
  const duplicateNode = useCanvasStore((s) => s.duplicateNode);
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes);
  const reverseEdge = useCanvasStore((s) => s.reverseEdge);
  const toggleAnnotationLock = useCanvasStore((s) => s.toggleAnnotationLock);
  const openDocTab = useCanvasStore((s) => s.openDocTab);
  const openConfigPopover = useCanvasStore((s) => s.openConfigPopover);
  const setHighlight = useCanvasStore((s) => s.setHighlight);

  // This panel's height varies a lot by target.type (node/edge/selection
  // each show a different item count) — real measurement after render, not
  // an assumed size, is what's needed to keep it fully on-screen when the
  // right-clicked target sits near a viewport edge. Mutates the element's
  // own style directly (not React state) so clamping doesn't trigger a
  // second render — it runs before paint (useLayoutEffect either way), so
  // there's no visible jump from the unclamped position to the corrected
  // one.
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

  // Pointer edges (flag arrows) should not have any context menu — they're
  // visual indicators only, not interactive elements. Return null to prevent
  // even an empty menu box from appearing.
  if (!target || (target.type === "edge" && target.id.startsWith("start-pointer:"))) return null;

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
      <div className="fixed inset-0 z-[var(--z-dropdown-backdrop)]" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        ref={menuRef}
        className="fixed z-[var(--z-dropdown)] min-w-[180px] rounded-md border border-border bg-panel py-1 shadow-lg"
        style={{ left: target.x, top: target.y }}
      >
        {target.type === "node" && (() => {
          const node = nodes.find((n) => n.id === target.id);
          const isAnnotation = node?.type === "zone" || node?.type === "comment" || node?.type === "start";
          const locked = isAnnotation && node.data.locked;
          return (
            <>
              <MenuItem icon={Copy} label="Duplicate" onClick={act(() => duplicateNode(target.id))} />
              <MenuItem icon={Focus} label="Center View" onClick={act(() => centerOnNode(target.id))} />
              {isAnnotation ? (
                <>
                  <MenuItem
                    icon={locked ? Unlock : Lock}
                    label={locked ? "Unlock" : "Lock"}
                    onClick={act(() => toggleAnnotationLock(target.id))}
                  />
                  {/* Zones only — spatial containment (see Canvas.tsx's
                   * highlightSets "zone" branch) only makes sense for a
                   * node with an area other nodes can sit inside; a comment
                   * or flag is a point marker, nothing can be "inside" one. */}
                  {node?.type === "zone" && (
                    <MenuItem
                      icon={Frame}
                      label="Highlight Zone"
                      onClick={act(() => setHighlight({ mode: "zone", id: target.id }))}
                    />
                  )}
                </>
              ) : (
                <>
                  <MenuItem
                    icon={Settings}
                    label="Configure"
                    onClick={act(() => openConfigPopover(target.id, { x: target.x, y: target.y }))}
                  />
                  {/* Component nodes only — zones/comments/flags never
                   * appear in the real domain graph's edges (see
                   * store.ts's toArchitectureGraph), so highlighting one
                   * would always dim the entire canvas with nothing to
                   * spare. */}
                  <MenuItem
                    icon={Waypoints}
                    label="Highlight Connections"
                    onClick={act(() => setHighlight({ mode: "connections", id: target.id }))}
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

        {/* Real edges only (not pointer edges from flags to their targets) —
         * flags/comments/zones are point markers with no direction. Pointer
         * edges start with "start-pointer:" so we skip them here. */}
        {target.type === "edge" && !target.id.startsWith("start-pointer:") && (
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
      </div>
    </>
  );
}
