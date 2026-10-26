"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

type CanvasHintProps = {
  children: ReactNode;
  onCancel: () => void;
  tone?: "neutral" | "error";
};

/**
 * The pill at the top of the canvas naming the gesture in progress
 * (placing, connecting). Carries its own Cancel so nothing depends on Esc,
 * which a tablet without a keyboard doesn't have.
 */
export function CanvasHint({ children, onCancel, tone = "neutral" }: CanvasHintProps) {
  return (
    <div
      role="status"
      className={`absolute left-1/2 top-4 z-[var(--z-canvas-overlay)] flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-2 rounded-full border bg-panel py-1 pl-3 pr-1 text-xs shadow-lg ${
        tone === "error" ? "border-state-error text-state-error" : "border-border text-foreground/80"
      }`}
    >
      <span className="min-w-0">{children}</span>
      <button
        type="button"
        onClick={onCancel}
        className="flex h-7 touch:h-9 shrink-0 items-center gap-1 rounded-full border border-border px-2.5 text-foreground/80 hover:bg-border hover:text-foreground"
      >
        <X size={12} aria-hidden="true" />
        Cancel
        <span className="sr-only"> (Esc)</span>
      </button>
    </div>
  );
}
