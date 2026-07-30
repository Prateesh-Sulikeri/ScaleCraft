import type { Difficulty } from "@/curriculum/types";

const TIERS: readonly Difficulty[] = ["foundational", "intermediate", "advanced"];

const TIER_COLOR: Record<Difficulty, string> = {
  foundational: "bg-state-valid",
  intermediate: "bg-state-warning",
  advanced: "bg-state-error",
};

/** A 3-dot meter (1/2/3 filled) colored by tier — green/amber/red, easiest
 *  to hardest. aria-hidden because the adjacent text label ("foundational"
 *  etc.) already carries the same information for screen readers. */
export function DifficultyDots({ difficulty }: { difficulty: Difficulty }) {
  const filled = TIERS.indexOf(difficulty) + 1;
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden="true">
      {TIERS.map((tier, i) => (
        <span
          key={tier}
          className={`h-1.5 w-1.5 rounded-full ${i < filled ? TIER_COLOR[difficulty] : "bg-border"}`}
        />
      ))}
    </span>
  );
}
