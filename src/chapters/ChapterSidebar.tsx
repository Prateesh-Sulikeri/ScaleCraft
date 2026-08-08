"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { findEntry } from "@/curriculum";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import { deriveStatus, type ProgressInputs } from "@/curriculum/progress";
import { chapterRegistry } from "@/content/chapters";
import type { CourseId } from "@/curriculum/types";
import type { ChapterOutcome, ChapterValidationOutcome, ValidationViolation } from "@/engines";

// Always rendered, so this keeps SSR (no ssr:false) - it's still a real
// chunk-splitting win since QuestionPane pulls in Debrief,
// ReadOnlyGraphSummary, and every quiz question renderer.
const QuestionPane = dynamic(() => import("./QuestionPane").then((m) => m.QuestionPane));

type ChapterSidebarProps = {
  courseId: CourseId;
  chapterSlug: string;
  /** Validate's own last result — the quick "N issues" / required-
   * components feedback line, updated every Validate click. */
  validationOutcome: ChapterValidationOutcome | null;
  isValidationStale: boolean;
  /** The merged display list the header's Validation pane renders — passed
   * straight through to QuestionPane so both surfaces count the same
   * things. See QuestionPane's own prop doc for what went wrong when it
   * counted `outcome.violations` itself. */
  displayViolations: ValidationViolation[] | null;
  /** Submit's own last result — the only thing that marks the chapter
   * complete (Debrief only ever follows a Submit pass, never a bare
   * Validate). */
  submitOutcome: ChapterOutcome | null;
  isSubmitStale: boolean;
  /** Ref callback for the footer slot the guided tour portals its idle
   * controls into (see TourController's `idleSlot`). Rendered empty and
   * hidden for every chapter without a tour, so it costs a non-tour chapter
   * nothing. */
  tourSlotRef?: (node: HTMLDivElement | null) => void;
};

/**
 * The in-workspace sidebar — a "Back to lesson" link above the
 * always-rendered QuestionPane. The Design Editor's own route to a chapter
 * is now reached exclusively through the Chapter Reader (`/<mode>/<slug>/
 * lesson`'s Design Editor CTA), so this is the one way back out: no
 * standalone curriculum browser or "View full Learning Path" link here
 * anymore (that's the Reader's ReaderSidebar's job) — going back always
 * means going back to the lesson this canvas belongs to, not jumping
 * sideways to a different chapter or the full Learning Path.
 */
export function ChapterSidebar({
  courseId,
  chapterSlug,
  validationOutcome,
  isValidationStale,
  displayViolations,
  submitOutcome,
  isSubmitStale,
  tourSlotRef,
}: ChapterSidebarProps) {
  // Guaranteed non-null by the route guard in practice ([chapterSlug]/
  // page.tsx 404s first) — kept as a real lookup so a stale/bad slug
  // degrades to `null` -> the defensive early return below.
  const entry = findEntry(courseId, chapterSlug);
  const chapter = entry?.chapterDefinitionId
    ? (chapterRegistry.find((c) => c.id === entry.chapterDefinitionId) ?? null)
    : null;

  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);
  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition],
  );

  if (!chapter || !entry) return null;

  return (
    <div data-tour="question-pane" className="flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-t border-b border-border px-3 py-2">
        <HeldTransitionLink
          href={`/${courseId}/${chapterSlug}/lesson`}
          label="Returning to the lesson…"
          className="inline-flex items-center gap-1 text-xs text-foreground/70 hover:text-foreground"
        >
          <ChevronLeft size={12} aria-hidden="true" />
          Back to lesson
        </HeldTransitionLink>
      </div>
      <QuestionPane
        chapter={chapter}
        entry={entry}
        status={deriveStatus(entry, inputs)}
        validationOutcome={validationOutcome}
        isValidationStale={isValidationStale}
        displayViolations={displayViolations}
        submitOutcome={submitOutcome}
        isSubmitStale={isSubmitStale}
      />
      {/* empty:hidden — no border, no padding, no gap unless the tour has
          actually portalled its controls in here. */}
      <div ref={tourSlotRef} className="shrink-0 border-t border-border px-3 py-2 empty:hidden" />
    </div>
  );
}
