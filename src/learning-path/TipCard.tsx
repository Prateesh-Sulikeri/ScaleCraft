import { Lightbulb } from "lucide-react";
import { modeTagline } from "@/lib/modes";
import type { CourseId } from "@/curriculum/types";

/** How the course itself works, not encouragement. The lead line is the
 *  mode's own tagline (lib/modes.ts - the same copy Home's mode card and its
 *  popover show), and the line under it states the two rules that actually
 *  change how a learner should use the page: chapters assume the ones before
 *  them (CURRICULUM.md §17's strict sequence), and hints are never forced on
 *  a failure. No streak talk, no motivation. */
const ORDER_NOTE: Record<CourseId, string> = {
  "building-blocks": "Work through chapters in order - each one assumes the ones before it.",
  "real-world-extraction":
    "Each tier assumes the Building Blocks chapters behind it, so work across a domain in order.",
};

export function TipCard({ courseId }: { courseId: CourseId }) {
  return (
    <section className="rounded-xl border border-border bg-panel p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
        <Lightbulb size={15} className="text-foreground/40" aria-hidden="true" />
        How this works
      </h2>
      <p className="mt-2.5 text-[13px] leading-relaxed text-foreground/60">{modeTagline[courseId]}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">{ORDER_NOTE[courseId]}</p>
      <p className="mt-2 text-[13px] leading-relaxed text-foreground/60">
        A failed check always explains why. Hints stay optional - ask for one only if you want it.
      </p>
    </section>
  );
}
