"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { CenteredModal } from "./CenteredModal";

const ABOUT_TEXT =
  "ScaleCraft is an interactive system-design lab, not a game. You assemble real-world " +
  "architectures - load balancers, databases, caches, queues, and more - from reusable " +
  "components on a canvas, and validation explains the architectural reasoning behind " +
  "every result instead of a bare pass or fail. " +
  "There are three modes. Building Blocks introduces one concept at a time through " +
  "guided, constrained exercises. Real World Extraction applies what you've learned to a " +
  "full system design problem, with multiple valid solutions. Sandbox is free exploration " +
  "with the full component library and no objectives. " +
  "Hints are always optional and never forced on you - you can fail, read the " +
  "explanation, and work out your own fix. The same components are reused across every " +
  "chapter and mode, so what you learn in one place carries into the next. " +
  "ScaleCraft is single-player, permanently - a self-paced course, not a shared workspace.";

/**
 * Reuses CenteredModal (shared with ReleaseNotesButton.tsx) with static
 * content instead of a component's registry docs. Local state rather than
 * the canvas store's docsPanel: this isn't component documentation and Home
 * doesn't touch the canvas store at all. Mounted on Home only, per the
 * request.
 */
export function AboutButton() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        aria-label="About ScaleCraft"
        className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
      >
        <Info size={14} />
        About
      </button>
    );
  }

  return (
    <CenteredModal title="About ScaleCraft" onClose={() => setOpen(false)}>
      <p className="text-base leading-7 text-foreground/80">{ABOUT_TEXT}</p>
    </CenteredModal>
  );
}
