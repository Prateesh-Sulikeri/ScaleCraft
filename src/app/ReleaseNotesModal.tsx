"use client";

import { useCallback, useEffect, useState } from "react";
import type { ComponentType } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Brain,
  BookOpen,
  CalendarClock,
  Check,
  Compass,
  FileText,
  Gauge,
  KeyRound,
  LayoutGrid,
  Lightbulb,
  ListChecks,
  RefreshCw,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
} from "lucide-react";
import { releaseNotes, type ReleaseIconName } from "@/content/release-notes";
import { CenteredModal } from "./CenteredModal";
import { ReleaseIllustration } from "./ReleaseIllustration";

/* Sized off the viewport rather than in fixed pixels, the same approach
 * AboutModal.tsx takes: the panel is a fixed fraction of the screen and one
 * release fits it at any height from a 768px laptop to a 1440p display. The
 * slide keeps its own scroll for the rare release with four highlights *and*
 * four quality-of-life lines. Below `lg` the release rail turns from a left
 * column into a horizontal strip above the slide - a 260px rail and a column
 * of this much copy cannot share a phone screen at a legible size. */
const LABEL = "text-[clamp(9.5px,1.15vh,11px)] font-semibold uppercase tracking-[0.14em]";
const BODY = "text-[clamp(11px,1.4vh,13.5px)] leading-[1.55] text-foreground/60";

/* Parked with the footer link below, which is commented out while the GitHub
   releases page is still catching up. Restore both together, plus the
   `ExternalLink` lucide import.
   const CHANGELOG_URL = "https://github.com/Prateesh-Sulikeri/ScaleCraft/releases"; */

/** How many pagination dots render at once. The list runs to eighteen
 *  releases and counting; a full strip would be a grey smear, so it windows
 *  around the current slide the way a mobile carousel does. */
const DOT_WINDOW = 9;

/** Content declares a key (see release-notes.ts); the mapping to a real glyph
 *  lives here, so the changelog file stays free of UI imports. */
const HIGHLIGHT_ICON: Record<ReleaseIconName, ComponentType<{ size?: number }>> = {
  ai: Brain,
  auth: KeyRound,
  canvas: LayoutGrid,
  component: Box,
  content: BookOpen,
  docs: FileText,
  fix: Wrench,
  hint: Lightbulb,
  navigation: Compass,
  performance: Gauge,
  polish: Sparkles,
  progress: TrendingUp,
  quiz: ListChecks,
  sync: RefreshCw,
  validation: ShieldCheck,
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** `YYYY-MM-DD` -> `Aug 17, 2026`. Hand-rolled rather than `toLocaleDateString`
 *  so the output can't differ between the server render and the client's
 *  locale, and an unparseable date falls back to the raw string instead of
 *  printing "Invalid Date". */
function formatReleaseDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, year, month, day] = match;
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${Number(day)}, ${year}` : iso;
}

/** The slice of dots to render, clamped so the strip never runs past either
 *  end of the list. */
function dotWindow(index: number, total: number): { start: number; end: number } {
  if (total <= DOT_WINDOW) return { start: 0, end: total };
  const start = Math.min(Math.max(index - Math.floor(DOT_WINDOW / 2), 0), total - DOT_WINDOW);
  return { start, end: start + DOT_WINDOW };
}

/**
 * The changelog dialog - one release per slide, with the full release list as
 * a rail on the left. Opened from Home's alpha announcement
 * (SeeWhatsNewButton.tsx); each trigger owns its own open state rather than
 * sharing global state for a dialog.
 *
 * A slide rather than the old single scrolling list because the list had
 * grown to eighteen releases of unstructured bullets - the current release,
 * which is the only thing most readers open this for, was one paragraph among
 * seventy. Now it is the thing on screen, and the rail makes the rest one
 * click away rather than one scroll among many.
 *
 * Renders chromeless (`hideHeader`) because it carries its own headline; the
 * shared modal's title bar would have printed "Release notes" directly above
 * an h2 saying the same thing.
 */
export function ReleaseNotesModal({ onClose }: { onClose: () => void }) {
  /* Index and direction move as one value: the incoming slide enters from the
     side it came from, so which way you travelled is part of what is being
     rendered, not a detail alongside it. */
  const [slide, setSlide] = useState<{ index: number; direction: "forward" | "back" }>({
    index: 0,
    direction: "forward",
  });
  const { index } = slide;
  const total = releaseNotes.length;
  const release = releaseNotes[index];

  const go = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), total - 1);
      if (clamped === index) return;
      setSlide({ index: clamped, direction: clamped > index ? "forward" : "back" });
    },
    [index, total],
  );

  /* Escape closes and the arrow keys page, so the dialog is fully operable
     without reaching for the mouse. CenteredModal has no key handling of its
     own - each caller decides what its keys mean. */
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      } else if (event.key === "ArrowRight") {
        go(index + 1);
      } else if (event.key === "ArrowLeft") {
        go(index - 1);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [go, index, onClose]);

  /* Motion-safe only: with reduced motion the slide simply changes, per
     DESIGN.md's reduced-motion requirement. */
  const slideMotion =
    slide.direction === "forward"
      ? "motion-safe:animate-[release-slide-forward_260ms_ease-out]"
      : "motion-safe:animate-[release-slide-back_260ms_ease-out]";

  const { start, end } = dotWindow(index, total);

  return (
    <CenteredModal title="Release notes" onClose={onClose} size="viewport" hideHeader>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Release notes"
        className="flex h-full min-h-0 flex-col p-[clamp(18px,2.9vh,38px)]"
      >
        <header className="flex shrink-0 items-start justify-between gap-8">
          <div className="flex flex-col gap-[clamp(4px,0.8vh,10px)]">
            <div className="flex items-center gap-2 text-hero-accent">
              <ScrollText size={15} aria-hidden="true" />
              <span className={`${LABEL} tracking-[0.18em]`}>Release notes</span>
            </div>
            <h2 className="text-[clamp(24px,3.9vh,40px)] font-bold leading-[1.06] tracking-tight text-foreground">
              What&rsquo;s New in ScaleCraft
            </h2>
            <p className={`max-w-[46ch] ${BODY}`}>
              All the latest updates, improvements and features shipped to make your learning
              experience better.
            </p>
          </div>

          {/* One drawing for every release (see ReleaseIllustration.tsx), so
              it belongs to the dialog rather than the slide and stays put
              while slides move. Hidden below `lg`, where there is no room. */}
          <div className="hidden h-[clamp(112px,17vh,178px)] w-[clamp(260px,30vw,430px)] shrink-0 pr-[clamp(10px,2vw,30px)] lg:block">
            <ReleaseIllustration />
          </div>
        </header>

        <div className="mt-[clamp(12px,2vh,26px)] grid min-h-0 flex-1 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)] gap-x-[clamp(8px,1.3vw,20px)] gap-y-[clamp(10px,1.6vh,18px)] lg:grid-cols-[minmax(196px,262px)_auto_minmax(0,1fr)_auto] lg:grid-rows-1">
          {/* Release rail: a left column on `lg`, a horizontal strip above the
              slide below it. One list either way, so a release is directly
              reachable at every size. */}
          <nav
            aria-label="Releases"
            className="col-span-3 row-start-1 min-h-0 overflow-x-auto overscroll-contain pb-1 lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:overflow-x-hidden lg:overflow-y-auto lg:border-r lg:border-border lg:pr-[clamp(10px,1.2vw,18px)] lg:pb-0"
          >
            <ol className="relative flex gap-2 lg:flex-col lg:gap-1.5">
              {/* The timeline the markers sit on. Inside the scrolling
                  content so it travels with them, and `lg` only - it means
                  nothing on a horizontal strip. */}
              <span
                aria-hidden="true"
                className="absolute left-[17px] top-5 bottom-5 hidden w-px bg-border lg:block"
              />
              {releaseNotes.map((note, i) => {
                const active = i === index;
                return (
                  <li key={note.version} className="shrink-0 lg:shrink">
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-current={active ? "true" : undefined}
                      className={`relative flex w-full items-center gap-2.5 rounded-md border px-2.5 py-[clamp(5px,0.9vh,10px)] text-left transition-colors duration-150 ease-out ${
                        active
                          ? "border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] bg-hero-accent/[0.07]"
                          : "border-border hover:border-foreground/25"
                      }`}
                    >
                      <span
                        aria-hidden="true"
                        className={`size-[13px] shrink-0 rounded-full border-2 bg-panel ${
                          active ? "border-hero-accent" : "border-foreground/25"
                        }`}
                      />
                      <span className="flex min-w-0 flex-col gap-px">
                        <span className="flex items-center gap-1.5">
                          <span
                            className={`text-[clamp(11.5px,1.45vh,14px)] font-semibold ${
                              active ? "text-hero-accent" : "text-foreground/80"
                            }`}
                          >
                            {note.version}
                          </span>
                          {i === 0 && (
                            <span
                              className={`rounded-sm border border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-hero-accent ${
                                active ? "" : "opacity-70"
                              }`}
                            >
                              Latest
                            </span>
                          )}
                        </span>
                        <span className="text-[clamp(9.5px,1.15vh,11.5px)] text-foreground/45">
                          {formatReleaseDate(note.date)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <button
            type="button"
            onClick={() => go(index - 1)}
            disabled={index === 0}
            aria-label="Newer release"
            className="col-start-1 row-start-2 flex size-[clamp(34px,4.8vh,52px)] shrink-0 items-center justify-center self-center rounded-full border border-border text-foreground/60 transition-colors duration-150 ease-out hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-25 lg:col-start-2 lg:row-start-1"
          >
            <ArrowLeft size={18} aria-hidden="true" />
          </button>

          <section
            key={release.version}
            role="group"
            aria-roledescription="slide"
            aria-label={`Release ${index + 1} of ${total}: ${release.version}`}
            className={`col-start-2 row-start-2 flex min-h-0 flex-col gap-[clamp(7px,1.1vh,14px)] overflow-y-auto overscroll-contain pr-1 lg:col-start-3 lg:row-start-1 ${slideMotion}`}
          >
            <span className="w-fit rounded-md border border-[color:color-mix(in_srgb,var(--hero-accent)_45%,transparent)] px-2 py-0.5 text-[clamp(10px,1.25vh,12px)] font-medium text-hero-accent">
              v{release.version}
            </span>
            <h3 className="text-[clamp(21px,3.2vh,34px)] font-bold leading-[1.1] tracking-tight text-foreground">
              {release.title}
            </h3>
            <p className="text-[clamp(10.5px,1.35vh,13px)] text-foreground/45">
              {formatReleaseDate(release.date)}
            </p>

            <div className="flex flex-col gap-[clamp(7px,1.2vh,14px)] border-t border-border pt-[clamp(9px,1.5vh,18px)]">
              <h4 className={`${LABEL} text-hero-accent`}>What&rsquo;s new</h4>
              <ul className="flex flex-col gap-[clamp(7px,1.2vh,16px)]">
                {release.highlights.map((item) => {
                  const Icon = HIGHLIGHT_ICON[item.icon];
                  return (
                    <li key={item.title} className="flex items-start gap-[clamp(9px,1vw,15px)]">
                      <span className="flex size-[clamp(30px,3.9vh,44px)] shrink-0 items-center justify-center rounded-md border border-border bg-panel text-hero-accent">
                        <Icon size={17} />
                      </span>
                      <div className="flex flex-col gap-[clamp(1px,0.3vh,4px)]">
                        <p className="text-[clamp(12px,1.55vh,15px)] font-semibold text-foreground">
                          {item.title}
                        </p>
                        <p className={BODY}>{item.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {release.qualityOfLife && (
              <div className="flex flex-col gap-[clamp(6px,1vh,12px)] border-t border-border pt-[clamp(9px,1.5vh,18px)]">
                <h4 className={`${LABEL} text-hero-accent`}>Quality of life</h4>
                <ul className="grid gap-x-[clamp(16px,2vw,36px)] gap-y-[clamp(4px,0.8vh,9px)] sm:grid-cols-2">
                  {release.qualityOfLife.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check
                        size={13}
                        aria-hidden="true"
                        className="mt-[3px] shrink-0 text-hero-accent"
                      />
                      <span className="text-[clamp(10.5px,1.35vh,13px)] leading-[1.5] text-foreground/65">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <button
            type="button"
            onClick={() => go(index + 1)}
            disabled={index === total - 1}
            aria-label="Older release"
            className="col-start-3 row-start-2 flex size-[clamp(34px,4.8vh,52px)] shrink-0 items-center justify-center self-center rounded-full border border-border text-foreground/60 transition-colors duration-150 ease-out hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-25 lg:col-start-4 lg:row-start-1"
          >
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="flex shrink-0 items-center justify-center gap-1.5 pt-[clamp(9px,1.5vh,18px)]">
          {releaseNotes.slice(start, end).map((note, offset) => {
            const i = start + offset;
            const active = i === index;
            /* The outermost dot on a side that continues shrinks, so the
               strip reads as a window onto a longer list rather than the
               whole of it. */
            const edge = (i === start && start > 0) || (i === end - 1 && end < total);
            return (
              <button
                key={note.version}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${note.version}`}
                aria-current={active ? "true" : undefined}
                className={`rounded-full transition-all duration-150 ease-out ${
                  active
                    ? "size-[7px] bg-hero-accent"
                    : edge
                      ? "size-[4px] bg-foreground/20 hover:bg-foreground/40"
                      : "size-[6px] bg-foreground/25 hover:bg-foreground/45"
                }`}
              />
            );
          })}
        </div>

        <div className="mt-[clamp(8px,1.3vh,16px)] flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border pt-[clamp(9px,1.5vh,18px)]">
          <div className="flex items-center gap-2.5">
            <span className="flex size-[clamp(28px,3.5vh,38px)] shrink-0 items-center justify-center rounded-md border border-border text-foreground/50">
              <CalendarClock size={15} aria-hidden="true" />
            </span>
            <span className="text-[clamp(10.5px,1.35vh,13px)] text-foreground/50">
              We ship updates regularly. Stay tuned for more.
            </span>
          </div>
          {/* <a
            href={CHANGELOG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-[clamp(11px,1.4vh,13.5px)] font-medium text-foreground/75 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
          >
            Changelog
            <ExternalLink size={13} aria-hidden="true" />
          </a> */}
        </div>
      </div>
    </CenteredModal>
  );
}
