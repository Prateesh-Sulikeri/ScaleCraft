"use client";

import { useEffect, useState } from "react";
import { Undo2, X } from "lucide-react";
import { useCanvasStore } from "@/canvas/store";

const AUTO_DISMISS_MS = 6000;

/**
 * The one delete-safety-net this app has (see store.ts's `pendingUndo`) —
 * a non-blocking toast rather than a confirm dialog, matching the app's
 * general aversion to modal-as-first-thought. Covers both delete paths:
 * the right-click/context-menu actions and xyflow's own keyboard delete,
 * which bypasses those actions entirely (see store.ts's onNodesChange/
 * onEdgesChange).
 */
export function UndoToast() {
  const pendingUndo = useCanvasStore((s) => s.pendingUndo);
  const undoLastDelete = useCanvasStore((s) => s.undoLastDelete);
  const dismissUndo = useCanvasStore((s) => s.dismissUndo);

  if (!pendingUndo) return null;

  // Keyed by the snapshot's own timestamp — each distinct delete mounts a
  // fresh instance below, so its enter transition always replays instead
  // of needing a manual "reset visibility" effect on the way out.
  return (
    <ToastContent
      key={pendingUndo.at}
      label={pendingUndo.label}
      onUndo={undoLastDelete}
      onDismiss={dismissUndo}
    />
  );
}

function ToastContent({
  label,
  onUndo,
  onDismiss,
}: {
  label: string;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    const timeout = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timeout);
    };
    // Runs once per mount (this instance is remounted per delete via the
    // key above); onDismiss is a stable store action.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-1/2 z-[var(--z-toast)] flex items-center gap-3 rounded-md border border-border bg-panel px-4 py-2.5 text-sm shadow-lg transition-[transform,opacity] duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translateX(-50%) translateY(${visible ? "0" : "0.5rem"})` }}
    >
      <span>{label}</span>
      <button onClick={onUndo} className="flex items-center gap-1 font-medium text-foreground hover:underline">
        <Undo2 size={14} />
        Undo
      </button>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-foreground/40 hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
