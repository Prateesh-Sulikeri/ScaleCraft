"use client";

import { useEffect, useState } from "react";
import { CheckCheck, X } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { NextChapterLink } from "./NextChapterLink";
import type { CourseId } from "@/curriculum/types";

type ChapterPassedToastProps = {
  mode: CourseId;
  chapterSlug: string;
  /** Timestamp of the Submit that passed, or `null` if none has yet this
   *  mount. The caller re-sets this to `Date.now()` inside handleSubmit's
   *  own passed branch only — never from the chapterProgress hydration
   *  effect — so this fires once per fresh pass, not on every visit to an
   *  already-completed chapter. */
  at: number | null;
  onDismiss: () => void;
};

/**
 * The in-canvas counterpart to ChapterSidebar's "Back to lesson" / "Next
 * chapter" row — that row lives in the sidebar, easy to miss with focus on
 * the board, and until now there was no cue in the canvas itself that a
 * Submit had just passed. Fires once, right where the learner is looking.
 * Persistent (no auto-dismiss, unlike SaveToast/UndoToast) since this is a
 * real navigation decision, not a fire-and-forget confirmation; dismissing
 * it only clears the toast; it never un-marks the chapter. Sits at
 * bottom-20, a tier above UndoToast's bottom-4 - a delete right before a
 * passing Submit can leave both on screen at once (UndoToast's own 6s
 * auto-dismiss window), so this stacks above it instead of overlapping.
 */
export function ChapterPassedToast({ mode, chapterSlug, at, onDismiss }: ChapterPassedToastProps) {
  if (!at) return null;

  return <ToastContent key={at} mode={mode} chapterSlug={chapterSlug} onDismiss={onDismiss} />;
}

function ToastContent({
  mode,
  chapterSlug,
  onDismiss,
}: {
  mode: CourseId;
  chapterSlug: string;
  onDismiss: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="status"
      className={`fixed bottom-20 left-1/2 z-[var(--z-toast)] flex items-center gap-3 rounded-md border border-state-valid bg-panel px-4 py-2.5 text-sm shadow-lg transition-[transform,opacity] duration-150 ease-out ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      style={{ transform: `translateX(-50%) translateY(${visible ? "0" : "0.5rem"})` }}
    >
      <CheckCheck size={14} className="text-state-valid" aria-hidden="true" />
      <span>Chapter complete</span>
      <HeldTransitionLink
        href={`/${mode}/${chapterSlug}/lesson`}
        label="Returning to the lesson…"
        className="font-medium text-foreground hover:underline"
      >
        Back to lesson
      </HeldTransitionLink>
      <NextChapterLink
        courseId={mode}
        chapterSlug={chapterSlug}
        className="font-medium text-foreground hover:underline"
      />
      <button onClick={onDismiss} aria-label="Dismiss" className="text-foreground/40 hover:text-foreground">
        <X size={14} />
      </button>
    </div>
  );
}
