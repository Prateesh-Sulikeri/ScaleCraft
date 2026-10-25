"use client";

import { Code2 } from "lucide-react";
import { allEntries, getCourse } from "@/curriculum";
import type { CourseId } from "@/curriculum/types";
import { getAllComponents } from "@/content/components/registry";
import { ModeCard } from "./ModeCard";
import { ModeHelpPopover } from "./ModeHelpPopover";
import type { CourseProgress } from "./home-data";

type ModeSectionProps = {
  progressByCourse: Record<CourseId, CourseProgress>;
};

/** The three mode routes, in the order Home has always listed them. Sandbox
 *  last: it is the unconstrained one, and the curriculum comes first. */
const MODES = [
  { mode: "building-blocks", href: "/building-blocks" },
  { mode: "real-world-extraction", href: "/real-world-extraction" },
  { mode: "sandbox", href: "/sandbox" },
] as const;

const SHOWN = 3;

function preview(names: readonly string[]) {
  return { items: names.slice(0, SHOWN), more: Math.max(0, names.length - SHOWN) };
}

/** Building Blocks names its sections from Part 2 on - Parts 0-1 are
 *  orientation, the rest name what you build. RWE names its first briefs. */
const INCLUDES = {
  "building-blocks": preview(getCourse("building-blocks").sections.slice(2).map((s) => s.title)),
  "real-world-extraction": preview(allEntries(getCourse("real-world-extraction")).map((c) => c.title)),
  sandbox: { items: [`${getAllComponents().length} components`, "Blank canvas", "No objectives"], more: 0 },
} as const;

export function ModeSection({ progressByCourse }: ModeSectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
          <Code2 size={16} className="text-foreground/40" aria-hidden="true" />
          Choose your mode
        </h2>
        <ModeHelpPopover />
      </div>

      {/* Two-up on a tablet-width window before three-up on a real desktop -
       * three 300px cards side by side at 768px would crush every tagline to
       * four lines. */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {MODES.map(({ mode, href }) => (
          <ModeCard
            key={mode}
            mode={mode}
            href={href}
            progress={mode === "sandbox" ? undefined : progressByCourse[mode]}
            includes={INCLUDES[mode]}
          />
        ))}
      </div>
    </section>
  );
}
