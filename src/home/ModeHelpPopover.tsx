"use client";

import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";
import { modeColorVar, modeDescription, modeLabel, modeTagline, type AppMode } from "@/lib/modes";

const MODES: readonly AppMode[] = ["building-blocks", "real-world-extraction", "sandbox"];

/**
 * "Which mode should I use?" - the answer, opt-in, from the same strings
 * ModeBadge.tsx uses in the workspace (`modeTagline` + `modeDescription` in
 * lib/modes.ts). No second page and no duplicated copy: one source for what
 * each mode is, rendered wherever the question comes up.
 *
 * Click to open, click anywhere outside or press Escape to close - never
 * hover, since it holds three paragraphs a reader needs time with.
 */
export function ModeHelpPopover() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as HTMLElement)) return;
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-xs text-foreground/50 transition-colors duration-150 ease-out hover:text-foreground/80"
      >
        Which mode should I use?
        <HelpCircle size={14} aria-hidden="true" />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Which mode should I use?"
          className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-[22rem] rounded-lg border border-border bg-panel p-4 shadow-lg motion-safe:animate-[dropdown-enter_150ms_ease-out]"
        >
          <ul className="flex flex-col gap-3.5">
            {MODES.map((mode) => (
              <li key={mode} className="flex flex-col gap-1">
                <span style={{ color: modeColorVar[mode] }} className="text-sm font-semibold">
                  {modeLabel[mode]}
                </span>
                <span className="text-sm leading-snug text-foreground/80">{modeTagline[mode]}</span>
                <span className="text-xs leading-relaxed text-foreground/55">{modeDescription[mode]}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
