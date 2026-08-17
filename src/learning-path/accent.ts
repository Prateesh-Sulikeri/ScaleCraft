import type { CSSProperties } from "react";
import type { CourseId } from "@/curriculum/types";

/**
 * The Learning Path's accent, per course.
 *
 * Building Blocks reads `--hero-accent`, the same blue as Home's hero (v7.0's
 * reference design for this page). Real World Extraction keeps its own
 * identity colour instead - the mode is indigo everywhere else in the app
 * (mode badge, Home's mode card, its progress bar), and a blue Learning Path
 * for it would be the one surface that disagrees.
 *
 * Everything on the page reads these vars rather than a fixed utility class,
 * so "which colour is this course" is answered once, here.
 */
const COURSE_ACCENT: Record<CourseId, string> = {
  "building-blocks": "var(--hero-accent)",
  "real-world-extraction": "var(--mode-real-world-extraction)",
};

/**
 * The accent plus its two derived intensities, as inline custom properties for
 * the page root.
 *
 * The derived ones have to be declared on the same element that sets
 * `--course-accent`: a `color-mix()` written into `globals.css` substitutes
 * against the value of `--course-accent` *there*, and descendants inherit that
 * already-computed colour - overriding the base var further down would not
 * recompute them. globals.css still carries a `:root` default of all three, so
 * a component rendered outside this page (a test, a future surface) resolves
 * to the hero accent rather than to nothing.
 */
export function courseAccentStyle(courseId: CourseId): CSSProperties {
  const accent = COURSE_ACCENT[courseId];
  return {
    "--course-accent": accent,
    /** Borders at rest. */
    "--course-accent-line": `color-mix(in srgb, ${accent} 40%, transparent)`,
    /** Filled chips and tiles. */
    "--course-accent-soft": `color-mix(in srgb, ${accent} 12%, transparent)`,
    /** Row and card surfaces - a tint you notice only next to an untinted one. */
    "--course-accent-wash": `color-mix(in srgb, ${accent} 6%, transparent)`,
  } as CSSProperties;
}
