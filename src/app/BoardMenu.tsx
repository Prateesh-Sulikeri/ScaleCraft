"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, RotateCcw, Trash2 } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";
import { Tooltip } from "@/app/Tooltip";
import { db } from "@/persistence/db";

type BoardMenuProps = {
  /** Which save slot "Restore last save" reads from (see persistence/db.ts's
   * SANDBOX_SAVE_ID / chapterSaveId). `null` means there's no save target
   * yet (e.g. chapter-mode's Chapter List view, nothing selected) — the
   * whole control is disabled rather than acting on an ambiguous target. */
  saveId: string | null;
};

/**
 * Groups the board's two one-off destructive actions behind a dropdown —
 * same click-outside-backdrop convention as ProjectMenu.tsx, so a second
 * dropdown-style header control doesn't introduce a third pattern. Both
 * actions go through store.ts's pendingUndo/UndoToast safety net rather
 * than a confirm() dialog, matching this app's existing aversion to modal
 * dialogs (see UndoToast.tsx's own doc comment). Icon-only trigger (Tooltip,
 * not a text label) — matches every other header control now that the
 * whole toolbar was made consistent in one pass.
 */
export function BoardMenu({ saveId }: BoardMenuProps) {
  const [open, setOpen] = useState(false);
  const [hasSave, setHasSave] = useState(false);
  // Arms a same-dropdown confirm step for Clear board, the one action here
  // that's instant and (per .claude/docs/CRITIQUE.md P1) needs a stop at the
  // moment of loss, not just the pendingUndo toast after the fact. Reset
  // whenever the dropdown closes so re-opening always starts from the plain
  // label - no app-wide modal confirm() dialog, matching this menu's existing
  // click-outside convention instead.
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);
  const isEmpty = useCanvasStore((s) => s.nodes.length === 0 && s.edges.length === 0);
  const clearBoard = useCanvasStore((s) => s.clearBoard);
  const snapshotForUndo = useCanvasStore((s) => s.snapshotForUndo);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);

  // Checked fresh each time the dropdown opens rather than once on mount —
  // a Save can happen at any point while this stays closed.
  useEffect(() => {
    if (!open || !saveId) return;
    db.saves.get(saveId).then((save) => setHasSave(!!save));
  }, [open, saveId]);

  // Reset during render (same pattern as ComponentPicker.tsx's wasOpen check)
  // rather than an effect - a closed-then-reopened dropdown should show the
  // plain "Clear board" label on the very same render, not one render later.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (!open) setConfirmingClear(false);
  }

  const handleClear = () => {
    if (isEmpty) return;
    if (!confirmingClear) {
      setConfirmingClear(true);
      return;
    }
    clearBoard();
    setConfirmingClear(false);
    setOpen(false);
  };

  const handleRestore = async () => {
    if (!saveId) return;
    const save = await db.saves.get(saveId);
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
      <Tooltip label={saveId ? "Board" : "Select a chapter to enable Board actions"}>
        <button
          onClick={() => setOpen((o) => !o)}
          disabled={!saveId}
          aria-label="Board"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-foreground/70"
        >
          <LayoutGrid size={16} />
        </button>
      </Tooltip>

      {open && (
        <>
          <div className="fixed inset-0 z-[var(--z-dropdown-backdrop)]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-56 rounded-md border border-border bg-panel p-1 shadow-lg">
            <button
              onClick={handleClear}
              disabled={isEmpty}
              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-state-error hover:bg-border disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
            >
              <Trash2 size={14} />
              {confirmingClear ? "Click again to confirm" : "Clear board"}
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
