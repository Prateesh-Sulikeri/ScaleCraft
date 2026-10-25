"use client";

import { ArrowRight } from "lucide-react";
import { HeldTransitionLink } from "@/app/HeldTransitionLink";
import { preloadChapterLesson } from "@/content/content-service";
import { AboutButton } from "./AboutButton";
import { BlueprintPreview } from "./BlueprintPreview";
import type { ContinueTarget } from "./home-data";
import { SeeWhatsNewButton } from "./SeeWhatsNewButton";

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
      className="group inline-flex h-11 items-center gap-2 rounded-md border border-hero-accent bg-hero-accent/15 px-5 text-[15px] font-semibold text-hero-accent transition-[background-color,border-color] duration-150 ease-out hover:bg-hero-accent/25"
    >
      {CTA_LABEL[target.kind]}
      <ArrowRight
        size={16}
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
    <section className="grid grid-cols-1 items-center gap-8 py-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] xl:gap-12">
      <div className="flex flex-col items-start gap-5">
        <SeeWhatsNewButton now={now} />

        <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-tight xl:text-[2.75rem] min-[2200px]:text-5xl">
          Design real systems.
          <br />
          {/* `--hero-accent` is the one hue for this section: this line, the
           * CTA, and the release chip. Not a mode hue - see globals.css. */}
          <span className="text-hero-accent">
            Understand every <span className="whitespace-nowrap">trade-off.</span>
          </span>
        </h1>

        <p className="max-w-[34rem] text-pretty text-base leading-relaxed text-foreground/70">
          Build architectures from real components, validate them, and get told exactly why a design breaks. Learn
          the fundamentals, then apply them to full systems.
        </p>

        {/* Continue/Start Learning stays the only accent-filled control. */}
        <div className="flex flex-col items-start gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <ContinueButton target={continueTarget} />
            <AboutButton />
          </div>
          {continueTarget.chapterLabel && (
            <p className="text-xs text-foreground/50">
              {CTA_HINT[continueTarget.kind]}{" "}
              <span className="font-medium text-foreground/80">{continueTarget.chapterLabel}</span>
            </p>
          )}
        </div>
      </div>

      <BlueprintPreview />
    </section>
  );
}
