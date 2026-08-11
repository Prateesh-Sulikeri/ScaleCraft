"use client";

import { useRef, useState, type ReactNode } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { getGlossaryTerm } from "@/content/content-service";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import { Popover, PopoverArrow, PopoverContent } from "@/components/ui/popover";
import { usePointerHover } from "./use-pointer-hover";

const REF_POPOVER_WIDTH = 320;
export const HOVER_CLOSE_DELAY_MS = 150;

/**
 * Inline glossary reference - `<Ref id="round-robin">round robin</Ref>` in
 * lesson MDX (see mdx-components.tsx). Renders an inline, focusable
 * `<button>` (never a block element - this sits mid-paragraph) that opens an
 * anchored Popover with the term's title + Markdown body.
 *
 * Tap-to-open works everywhere (click toggles `tapOpen`); hover-preview is
 * layered on top only when usePointerHover() is true, gating a second
 * `hovering` flag with a short close delay so moving the pointer from the
 * trigger onto the popover content (to read a longer definition) doesn't
 * close it mid-crossing. `open` is the OR of both flags, fully controlled -
 * same controlled-Popover pattern as NodeConfigPopover.tsx.
 */
export function Ref({ id, children }: { id: string; children: ReactNode }) {
  const term = getGlossaryTerm(id);
  const canHover = usePointerHover();
  const [tapOpen, setTapOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  if (!term) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Ref id="${id}">: no glossary term registered with this id`);
    }
    return <>{children}</>;
  }

  const open = tapOpen || hovering;

  function cancelClose() {
    clearTimeout(closeTimer.current);
  }
  function openOnHover() {
    if (!canHover) return;
    cancelClose();
    setHovering(true);
  }
  function scheduleHoverClose() {
    if (!canHover) return;
    cancelClose();
    closeTimer.current = setTimeout(() => setHovering(false), HOVER_CLOSE_DELAY_MS);
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setTapOpen(false);
          setHovering(false);
          cancelClose();
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          className="underline decoration-dotted decoration-foreground/40 underline-offset-2 hover:decoration-foreground/70"
          onClick={() => setTapOpen((o) => !o)}
          onMouseEnter={openOnHover}
          onMouseLeave={scheduleHoverClose}
        >
          {children}
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverContent
        style={{ width: REF_POPOVER_WIDTH }}
        className="max-h-[60vh] overflow-y-auto"
        onMouseEnter={openOnHover}
        onMouseLeave={scheduleHoverClose}
      >
        <PopoverArrow />
        <h3 className="text-sm font-semibold text-foreground">{term.title}</h3>
        <div className="mt-1 text-sm">
          <MarkdownRenderer content={term.body} />
        </div>
      </PopoverContent>
    </Popover>
  );
}
