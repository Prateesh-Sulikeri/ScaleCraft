"use client";

import { Copy, FileText, RotateCw, Server, Trash2 } from "lucide-react";
import { useCanvasStore } from "./store";
import { componentRegistry } from "@/content/components/registry";
import { iconMap } from "./icon-map";
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
  const openDocsWindow = useCanvasStore((s) => s.openDocsWindow);
  const addNode = useCanvasStore((s) => s.addNode);

  if (!target) return null;

  const act = (fn: () => void) => () => {
    fn();
    onClose();
  };

  // Docs windows are keyed by componentId (see store.ts), not node id — the
  // menu only has the clicked node's id, so resolve it here.
  const viewDocsForNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (node?.type === "component") openDocsWindow(node.data.componentId);
  };

  return (
    <>
      {/* Full-screen catcher to close the menu on the next click anywhere else. */}
      <div className="fixed inset-0 z-20" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        className="fixed z-30 min-w-[180px] rounded-md border border-border bg-panel py-1 shadow-lg"
        style={{ left: target.x, top: target.y }}
      >
        {target.type === "node" && (
          <>
            <MenuItem icon={Copy} label="Duplicate" onClick={act(() => duplicateNode(target.id))} />
            <MenuItem icon={FileText} label="View docs" onClick={act(() => viewDocsForNode(target.id))} />
            <MenuItem icon={Trash2} label="Delete" danger onClick={act(() => deleteNode(target.id))} />
          </>
        )}

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
            <div className="px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground/70">
              Add component
            </div>
            {componentRegistry.map((definition) => {
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
        )}
      </div>
    </>
  );
}
