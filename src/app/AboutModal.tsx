"use client";

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
 * Static product explainer, extracted from the old floating AboutButton so
 * the trigger and the content are separable - Home's footer now opens it as a
 * plain text link rather than a bordered button parked in a screen corner.
 *
 * Reuses CenteredModal (shared with ReleaseNotesModal.tsx) instead of
 * hand-rolling a backdrop+panel.
 */
export function AboutModal({ onClose }: { onClose: () => void }) {
  return (
    <CenteredModal title="About ScaleCraft" onClose={onClose}>
      <p className="text-base leading-7 text-foreground/80">{ABOUT_TEXT}</p>
    </CenteredModal>
  );
}
