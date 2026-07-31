const DIFFICULTY_COLOR: Record<1 | 2 | 3, string> = {
  1: "bg-state-valid",
  2: "bg-state-warning",
  3: "bg-state-error",
};

/** Same 3-dot meter convention as learning-path/DifficultyDots, but that
 * component is typed against the curriculum's Difficulty enum
 * ("foundational"/"intermediate"/"advanced") — quiz questions rank 1|2|3
 * instead, so this mirrors the visual pattern rather than the component
 * itself. Ramp position, not a score. Shared by the exam shell and results
 * screen (formerly local to the now-removed QuizQuestionCard). */
export function QuizDifficultyDots({ difficulty }: { difficulty: 1 | 2 | 3 }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {([1, 2, 3] as const).map((tier) => (
        <span
          key={tier}
          className={`h-1.5 w-1.5 rounded-full ${tier <= difficulty ? DIFFICULTY_COLOR[difficulty] : "bg-border"}`}
        />
      ))}
    </span>
  );
}
