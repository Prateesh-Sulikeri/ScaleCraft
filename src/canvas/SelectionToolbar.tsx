"use client";

import { NodeToolbar, Position } from "@xyflow/react";
import { Cable, Copy, Lock, MoreHorizontal, Palette, Settings, Trash2, Unlock } from "lucide-react";
import { useCanvasStore } from "./store";
import type { ContextMenuTarget } from "./ContextMenu";

type SelectionToolbarProps = {
  /** Hidden while another gesture owns the canvas (placement, connecting). */
  hidden: boolean;
  onConnectFrom: (nodeId: string) => void;
  onMore: (target: ContextMenuTarget) => void;
};

const BUTTON =
  "flex h-8 touch:h-11 min-w-8 touch:min-w-11 items-center justify-center gap-1.5 rounded px-2 text-sm text-foreground/80 transition-colors duration-150 hover:bg-border hover:text-foreground motion-reduce:transition-none";

/** Screen point just under a toolbar button, where its popover opens. */
function anchorOf(event: React.MouseEvent) {
  const r = event.currentTarget.getBoundingClientRect();
  return { x: r.left, y: r.bottom + 6 };
}

/**
 * Actions for whatever is selected, shown on the canvas above it - the
 * primary route to Configure / Connect / Duplicate / Delete for every input.
 * Right-click, double-click and keyboard shortcuts still work; this is what
 * makes them optional. "More" opens the same ContextMenu right-click does.
 */
export function SelectionToolbar({ hidden, onConnectFrom, onMore }: SelectionToolbarProps) {
  const nodes = useCanvasStore((s) => s.nodes);
  const configPopover = useCanvasStore((s) => s.configPopover);
  const editingAnnotation = useCanvasStore((s) => s.editingAnnotation);
  const openConfigPopover = useCanvasStore((s) => s.openConfigPopover);
  const openAnnotationEditor = useCanvasStore((s) => s.openAnnotationEditor);
  const toggleAnnotationLock = useCanvasStore((s) => s.toggleAnnotationLock);
  const duplicateNodes = useCanvasStore((s) => s.duplicateNodes);
  const deleteNodes = useCanvasStore((s) => s.deleteNodes);

  const selected = nodes.filter((n) => n.selected);
  if (hidden || selected.length === 0) return null;
  const ids = selected.map((n) => n.id);
  // Its own popover is open on it: the toolbar would sit on top of it.
  if (selected.length === 1 && (configPopover?.nodeId === ids[0] || editingAnnotation?.id === ids[0])) return null;

  const single = selected.length === 1 ? selected[0] : null;
  const isAnnotation = single !== null && single.type !== "component";
  const locked = isAnnotation && single.data.locked === true;

  return (
    // Own z-index: NodeToolbar defaults to the node's z + 1, and zones sit at
    // -1 (behind components), so their toolbar rendered under the pane -
    // visible but every tap landed on the canvas.
    <NodeToolbar nodeId={ids} isVisible position={Position.Top} offset={10} style={{ zIndex: 1001 }}>
      <div
        role="toolbar"
        aria-label="Selection actions"
        data-tour="selection-toolbar"
        className="flex items-center gap-0.5 rounded-md border border-border bg-panel p-0.5 shadow-lg"
      >
        {single?.type === "component" && (
          <>
            <button type="button" className={BUTTON} onClick={(e) => openConfigPopover(single.id, anchorOf(e))}>
              <Settings size={15} aria-hidden="true" />
              <span>Configure</span>
            </button>
            <button type="button" className={BUTTON} onClick={() => onConnectFrom(single.id)}>
              <Cable size={15} aria-hidden="true" />
              <span>Connect</span>
            </button>
          </>
        )}
        {isAnnotation && (
          <>
            <button type="button" className={BUTTON} onClick={(e) => openAnnotationEditor(single.id, anchorOf(e))}>
              <Palette size={15} aria-hidden="true" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              className={BUTTON}
              aria-label={locked ? "Unlock" : "Lock"}
              title={locked ? "Unlock" : "Lock"}
              onClick={() => toggleAnnotationLock(single.id)}
            >
              {locked ? <Unlock size={15} aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
            </button>
          </>
        )}
        <button
          type="button"
          className={BUTTON}
          aria-label={single ? "Duplicate" : `Duplicate ${ids.length} items`}
          title="Duplicate"
          onClick={() => duplicateNodes(ids)}
        >
          <Copy size={15} aria-hidden="true" />
          {!single && <span>{ids.length}</span>}
        </button>
        <button
          type="button"
          className={`${BUTTON} text-state-error hover:text-state-error`}
          aria-label={single ? "Delete" : `Delete ${ids.length} items`}
          title="Delete"
          onClick={() => deleteNodes(ids)}
        >
          <Trash2 size={15} aria-hidden="true" />
        </button>
        {single && (
          <button
            type="button"
            className={BUTTON}
            aria-label="More actions"
            title="More actions"
            onClick={(e) => {
              const { x, y } = anchorOf(e);
              onMore({ type: "node", id: single.id, x, y });
            }}
          >
            <MoreHorizontal size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </NodeToolbar>
  );
}
