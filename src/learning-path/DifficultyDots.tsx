import type { Difficulty } from "@/curriculum/types";

const TIERS: readonly Difficulty[] = ["foundational", "intermediate", "advanced"];

/** A neutral, monochrome 3-dot meter (1/2/3 filled) — deliberately not a
 *  color-coded chip. DESIGN.md reserves the category hues for component
 *  identity and the green/amber/red trio for validation state; reusing
 *  either for difficulty would alias with one of those two channels.
 *  aria-hidden because the adjacent text label ("foundational" etc.)
 *  already carries the same information for screen readers. */
export function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const filled = TIERS.indexOf(difficulty) + 1;
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {TIERS.map((tier, i) => (
        <span key={tier} className={`h-1.5 w-1.5 rounded-full ${i < filled ? "bg-foreground/70" : "bg-border"}`} />
      ))}
    </span>
  );
}
