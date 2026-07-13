"use client";

import { useCanvasStore } from "./store";

export type ContextMenuTarget = { type: "node" | "edge"; id: string; x: number; y: number };

type ContextMenuProps = {
  target: ContextMenuTarget | null;
  onClose: () => void;
};

/**
 * A second, discoverable path to delete besides the keyboard shortcut —
 * right-clicking a node or edge previously did nothing but suppress the
 * browser's own menu, which read as broken rather than intentional.
 */
export function ContextMenu({ target, onClose }: ContextMenuProps) {
  const deleteNode = useCanvasStore((s) => s.deleteNode);
  const deleteEdge = useCanvasStore((s) => s.deleteEdge);

  if (!target) return null;

  return (
    <>
      {/* Full-screen catcher to close the menu on the next click anywhere else. */}
      <div className="fixed inset-0 z-20" onClick={onClose} onContextMenu={(e) => e.preventDefault()} />
      <div
        className="fixed z-30 min-w-[140px] rounded-md border border-border bg-panel py-1 shadow-lg"
        style={{ left: target.x, top: target.y }}
      >
        <button
          className="w-full px-3 py-1.5 text-left text-sm text-state-error hover:bg-border"
          onClick={() => {
            if (target.type === "node") deleteNode(target.id);
            else deleteEdge(target.id);
            onClose();
          }}
        >
          Delete
        </button>
      </div>
    </>
  );
}
