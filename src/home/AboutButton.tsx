"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { AboutModal } from "@/app/AboutModal";

/**
 * Hero-row trigger for AboutModal, styled as the system's standard bordered
 * button (DESIGN.md §5) - not accent-filled, so it doesn't compete with the
 * Continue/Start Learning CTA for primary-action weight.
 */
export function AboutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-panel px-4 text-sm font-medium text-foreground/80 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
      >
        <Info size={14} aria-hidden="true" />
        About
      </button>
      {open && <AboutModal onClose={() => setOpen(false)} />}
    </>
  );
}
