import { ChevronLeft, ChevronRight } from "lucide-react";

type ExamQuestionNavProps = {
  total: number;
  currentIndex: number;
  /** Which question indices already have a recorded answer — drives dot
   * fill and the Skip/Next label, not a score. */
  answeredIndices: ReadonlySet<number>;
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
};

/** "Question X of N" + jumpable progress dots + Back/Skip-or-Next — free
 * navigation is the point of the exam pivot (unlike the old inline
 * Knowledge Check's fixed per-question flow), so every dot is clickable,
 * not just a passive progress indicator. */
export function ExamQuestionNav({ total, currentIndex, answeredIndices, onJump, onBack, onNext }: ExamQuestionNavProps) {
  const isLast = currentIndex === total - 1;
  const isCurrentAnswered = answeredIndices.has(currentIndex);

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs text-foreground/60">
        Question {currentIndex + 1} of {total}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Questions">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === currentIndex}
            aria-label={`Question ${i + 1}${answeredIndices.has(i) ? ", answered" : ""}`}
            onClick={() => onJump(i)}
            className={`h-2.5 w-2.5 rounded-full border transition-colors ${
              i === currentIndex
                ? "border-foreground bg-foreground"
                : answeredIndices.has(i)
                  ? "border-foreground/40 bg-foreground/40"
                  : "border-border bg-transparent"
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
        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
          >
            {isCurrentAnswered ? "Next" : "Skip"}
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
