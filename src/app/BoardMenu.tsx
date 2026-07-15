"use client";

import { useEffect, useState } from "react";
import { ChevronDown, RotateCcw, Trash2 } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import { db, SANDBOX_SAVE_ID } from "@/persistence/db";

/**
 * Groups the board's two one-off destructive actions behind a dropdown —
 * same click-outside-backdrop convention as ExportMenu.tsx, so a second
 * dropdown-style header control doesn't introduce a third pattern. Both
 * actions go through store.ts's pendingUndo/UndoToast safety net rather
 * than a confirm() dialog, matching this app's existing aversion to modal
 * dialogs (see UndoToast.tsx's own doc comment).
 */
export function BoardMenu() {
  const [open, setOpen] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  const isEmpty = useCanvasStore((s) => s.nodes.length === 0 && s.edges.length === 0);
  const clearBoard = useCanvasStore((s) => s.clearBoard);
  const snapshotForUndo = useCanvasStore((s) => s.snapshotForUndo);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);

  // Checked fresh each time the dropdown opens rather than once on mount —
  // a Save can happen at any point while this stays closed.
  useEffect(() => {
    if (!open) return;
    db.saves.get(SANDBOX_SAVE_ID).then((save) => setHasSave(!!save));
  }, [open]);

  const handleClear = () => {
    if (isEmpty) return;
    clearBoard();
    setOpen(false);
  };

  const handleRestore = async () => {
    const save = await db.saves.get(SANDBOX_SAVE_ID);
    if (!save) {
      setHasSave(false);
      return;
    }
    snapshotForUndo("Restore reverted");
    loadCanvasState(save.nodes, save.edges);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
      >
        Board
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-56 rounded-md border border-border bg-panel p-1 shadow-lg">
            <button
              onClick={handleClear}
              disabled={isEmpty}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-state-error hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 size={14} />
              Clear board
            </button>
            <button
              onClick={handleRestore}
              disabled={!hasSave}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-foreground hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <RotateCcw size={14} />
              Restore last save
            </button>
            {!hasSave && (
              <p className="px-2 pb-1 pt-0.5 text-xs text-foreground/60">No saved version yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
