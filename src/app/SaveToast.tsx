"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const AUTO_DISMISS_MS = 1800;

/**
 * Confirmation toast for an explicit manual save (Save button or Ctrl+S) -
 * see useAutosave's lastManualSaveAt doc comment for why this is scoped to
 * manual saves only, not the debounced autosave path. The Save button's own
 * icon swap (AppHeader.tsx) already reflects save state, but it's a small
 * icon in the header corner and easy to miss when focus is on the canvas;
 * this is a louder, transient confirmation for the deliberate action.
 *
 * Anchored top-right, under the header, rather than UndoToast's bottom-center
 * spot - the two can legitimately appear at once (delete, then Ctrl+S), and
 * this position stays visually tied to the Save button that triggered it.
 * Non-actionable and auto-dismissing only - a "saved" confirmation has
 * nothing to undo or configure, unlike UndoToast's Undo action.
 */
export function SaveToast({ savedAt }: { savedAt: number | null }) {
  if (!savedAt) return null;

  // Keyed by the save's own timestamp - each new manual save mounts a fresh
  // instance so its enter transition always replays, same convention as
  // UndoToast's pendingUndo.at key.
  return <ToastContent key={savedAt} />;
}

function ToastContent() {
  const [visible, setVisible] = useState(false);
  // Unlike UndoToast, nothing external ever clears this component's trigger
  // (savedAt only ever advances to a new timestamp, never back to null) - so
  // this has to remove itself from the DOM once shown, rather than fading to
  // opacity-0 and sitting there invisible-but-present until the next save.
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timeout = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
  }, []);

  if (dismissed) return null;

  return (
    <div
      role="status"
      className={`pointer-events-none fixed right-6 top-16 z-[var(--z-toast)] flex items-center gap-2 rounded-md border border-state-valid bg-panel px-3 py-2 text-sm text-state-valid shadow-lg transition-[transform,opacity] duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translateY(${visible ? "0" : "-0.5rem"})` }}
    >
      <Check size={14} />
      <span>Saved</span>
    </div>
  );
}
