import { ChevronLeft, ChevronRight } from "lucide-react";

/** Step counter + jump-dots + Prev/Next, matching
 * src/chapters/exam/ExamQuestionNav.tsx's visual language (not the same
 * component - different context - but the same classes/icons so stepped UI
 * reads as one consistent pattern app-wide, not two competing patterns). */
export function WalkthroughControls({
  total,
  currentIndex,
  onJump,
  onBack,
  onNext,
}: {
  total: number;
  currentIndex: number;
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-foreground/60">
        Step {currentIndex + 1} of {total}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Walkthrough steps">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Step ${i + 1}`}
            onClick={() => onJump(i)}
            className={`h-2.5 w-2.5 rounded-full border transition-colors ${
              i === currentIndex ? "border-foreground bg-foreground" : "border-border bg-transparent"
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={currentIndex === 0}
          className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:enabled:bg-border/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ChevronLeft size={14} aria-hidden="true" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={currentIndex === total - 1}
          className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:enabled:bg-border/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ChevronRight size={14} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
