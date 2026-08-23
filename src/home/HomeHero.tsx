"use client";

import { ArrowUpRight } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { AboutButton } from "./AboutButton";
import { AlphaAnnouncement } from "./AlphaAnnouncement";
import type { ContinueTarget } from "./home-data";

/**
 * "Continue Learning" is the page's one primary action, so it is the only
 * accent-filled control on Home - About sits beside it as the system's
 * standard bordered button (DESIGN.md §5), not a competing CTA.
 *
 * Uses HeldTransitionLink (the same component the Learning Path's rows use)
 * rather than a plain Link: a chapter mounts its own reader and lesson body,
 * and the branded hold is what keeps that from reading as a jump-cut. It also
 * preloads the lesson while the visitor is deciding to click.
 */
/** Only a learner with no recorded history at all is "starting"; someone who
 *  finished four chapters and left nothing half-done is continuing, even
 *  though the next chapter is untouched. See ContinueTarget.kind. */
const CTA_LABEL: Record<ContinueTarget["kind"], string> = {
  fresh: "Start Learning",
  resume: "Continue Learning",
  next: "Continue Learning",
};

/** The line under the CTA names *why* that chapter - "up next" is not the
 *  same claim as "picking up where you left off". */
const CTA_HINT: Record<ContinueTarget["kind"], string> = {
  fresh: "Starting with",
  resume: "Picking up at",
  next: "Up next",
};

function ContinueButton({ target }: { target: ContinueTarget }) {
  const label = target.chapterLabel ?? "the Learning Path";

  return (
    <HeldTransitionLink
      href={target.href}
      label={`Opening ${label}…`}
      preload={
        target.chapterDefinitionId
          ? () => preloadChapterLesson(target.chapterDefinitionId ?? undefined)
          : undefined
      }
      aria-label={`${CTA_LABEL[target.kind]}: ${label}`}
      className="group inline-flex h-10 items-center gap-2 rounded-md border border-hero-accent bg-hero-accent/15 px-4 text-sm font-semibold text-hero-accent transition-[background-color,border-color] duration-150 ease-out hover:bg-hero-accent/25"
    >
      {CTA_LABEL[target.kind]}
      <ArrowUpRight
        size={15}
        aria-hidden="true"
        className="transition-transform duration-150 ease-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
      />
    </HeldTransitionLink>
  );
}

type HomeHeroProps = {
  continueTarget: ContinueTarget;
  now: number | null;
};

export function HomeHero({ continueTarget, now }: HomeHeroProps) {
  return (
    <section className="grid items-stretch gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <div className="flex flex-col justify-center gap-3.5">
        <h1 className="text-balance text-4xl font-semibold leading-[1.12] tracking-tight xl:text-[2.75rem] min-[2200px]:text-5xl">
          Design real systems.
          <br />
          {/* The accent lands on the second line only - the promise the
           * product is actually about. `--hero-accent` (globals.css) is the
           * one hue for this whole section: this line, the CTA below, and the
           * announcement card's illustration. Not a mode hue - the three mode
           * colors own the cool band, and borrowing one made the hero read as
           * an accidental extension of that mode. */}
          <span className="text-hero-accent">Understand every trade-off.</span>
        </h1>

        <p className="max-w-xl text-pretty text-[15px] leading-relaxed text-foreground/65">
          ScaleCraft is your system design playground. 
          Learn the fundamentals. Architect real systems. Master the craft. 
          For interviews and beyond 
        
        </p>

        {/* Continue/Start Learning stays the only accent-filled control.
         * "See what's new" used to sit here too, which was the same button,
         * opening the same dialog, as the announcement card immediately to
         * the right - About is a distinct action, not that duplicate. */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <ContinueButton target={continueTarget} />
          <AboutButton />
        </div>

        {continueTarget.chapterLabel && (
          <p className="text-xs text-foreground/45">
            {CTA_HINT[continueTarget.kind]}{" "}
            <span className="text-foreground/70">{continueTarget.chapterLabel}</span>
          </p>
        )}
      </div>

      <AlphaAnnouncement now={now} />
    </section>
  );
}
