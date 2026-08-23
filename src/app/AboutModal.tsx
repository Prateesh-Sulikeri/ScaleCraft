"use client";

import type { ComponentType, ReactNode } from "react";
import {
  Box,
  Brain,
  Compass,
  Hammer,
  Lightbulb,
  Mail,
  MousePointerClick,
  Puzzle,
  RefreshCw,
  User,
  Zap,
} from "lucide-react";
import { releaseNotes } from "@/content/release-notes";
import { AboutIllustration } from "./AboutIllustration";
import { CenteredModal } from "./CenteredModal";

/* Everything in this dialog is sized off the viewport rather than in fixed
 * pixels: the panel is a fixed fraction of the screen and the content scales
 * to fill it, so the whole thing reads at once on a 768px-tall laptop and on a
 * 1440p display without ever scrolling. Below `lg` the two columns stack and
 * the panel falls back to scrolling - two columns of this much copy cannot fit
 * a phone screen at a legible size, and shrinking further would be worse than
 * a scrollbar. */
const LABEL = "text-[clamp(9.5px,1.15vh,11px)] font-semibold uppercase tracking-[0.14em] text-foreground/55";
const BODY = "text-[clamp(11.5px,1.5vh,14px)] leading-[1.6] text-foreground/70";

type Accent = "hero" | "compute" | "networking" | "teal";

/** Accent per row, kept to tokens the design system already defines rather
 *  than new hexes. These are text-only accents on flat chrome - no category
 *  fill or state ring is involved, so the two-channel rule is untouched. */
const ACCENT_CLASS: Record<Accent, string> = {
  hero: "text-hero-accent",
  compute: "text-[var(--category-compute)]",
  networking: "text-[var(--category-networking)]",
  teal: "text-[var(--mode-building-blocks)]",
};

const PHILOSOPHY: { label: string; caption: string; icon: ComponentType<{ size?: number }>; accent: Accent }[] = [
  { label: "Understand", caption: "Learn the why.", icon: Brain, accent: "teal" },
  { label: "Design", caption: "Plan the system.", icon: Compass, accent: "hero" },
  { label: "Build", caption: "Connect the pieces.", icon: Hammer, accent: "compute" },
  { label: "Break", caption: "Find the limits.", icon: Zap, accent: "networking" },
  { label: "Iterate", caption: "Refine, repeat.", icon: RefreshCw, accent: "teal" },
];

const DIFFERENTIATORS: { title: string; body: string; icon: ComponentType<{ size?: number }>; accent: Accent }[] = [
  {
    title: "Interactive by design",
    body: "Build systems on a real canvas. Validation explains the architectural reasoning behind every result, never a bare pass or fail.",
    icon: MousePointerClick,
    accent: "hero",
  },
  {
    title: "Hints, not hand-holding",
    body: "Hints stay optional and never surface on their own. Fail, read why, and reason your way to the fix on your own terms.",
    icon: Lightbulb,
    accent: "compute",
  },
  {
    title: "Consistent learning",
    body: "The same components and principles carry across every mode and chapter, so what you learn once keeps paying off.",
    icon: Puzzle,
    accent: "networking",
  },
  {
    title: "Single-player, always",
    body: "A self-paced environment built for deep, focused learning. No multiplayer, no distractions.",
    icon: User,
    accent: "teal",
  },
];

/** Minimal brand glyphs - lucide-react carries no brand icon set, and these
 *  are the only two the dialog needs. Plain path data, no new dependency. */
function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[45%] w-[45%]">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.1 3.29 9.42 7.86 10.95.57.1.79-.25.79-.55 0-.27-.01-1.15-.02-2.09-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.8.55A10.53 10.53 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedinGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-[42%] w-[42%]">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.45-2.14 2.94v5.66H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13ZM7.12 20.45H3.55V9h3.57v11.45ZM22.22 0H1.77C.8 0 0 .78 0 1.75v20.5C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.75V1.75C24 .78 23.2 0 22.22 0Z" />
    </svg>
  );
}

const SOCIALS: { label: string; href: string; glyph: ReactNode }[] = [
  { label: "GitHub", href: "https://github.com/Prateesh-Sulikeri", glyph: <GithubGlyph /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/prateesh-sulikeri/", glyph: <LinkedinGlyph /> },
  { label: "Email", href: "mailto:noreplay.scalecraft@gmail.com", glyph: <Mail size={16} /> },
];

/**
 * Product explainer - what ScaleCraft is, why it exists, the philosophy behind
 * it, and who built it.
 *
 * Deliberately not a feature tour: the three modes are already explained on
 * Home, so repeating them here would make this the same page twice. What this
 * dialog carries instead is the motivation and the non-negotiables (hints stay
 * optional, single-player permanently) that the mode cards cannot.
 *
 * Renders chromeless (`hideHeader`) because it carries its own headline - the
 * shared modal's title bar would have printed "About ScaleCraft" directly
 * above an h2 saying the same thing.
 */
export function AboutModal({ onClose }: { onClose: () => void }) {
  const version = releaseNotes[0].version;

  return (
    <CenteredModal title="About ScaleCraft" onClose={onClose} size="viewport" hideHeader>
      <div className="flex h-full min-h-0 flex-col gap-[clamp(12px,2.1vh,24px)] overflow-y-auto overscroll-contain p-[clamp(20px,3.1vh,40px)] lg:overflow-hidden">
        <header className="flex shrink-0 items-start justify-between gap-8">
          <div className="flex flex-col gap-[clamp(5px,0.9vh,11px)]">
            <div className={`flex items-center gap-2 ${ACCENT_CLASS.teal}`}>
              <Box size={15} aria-hidden="true" />
              <span className="text-[clamp(9.5px,1.15vh,11px)] font-semibold uppercase tracking-[0.18em]">
                About ScaleCraft
              </span>
            </div>
            <h2 className="text-[clamp(26px,4.1vh,42px)] font-bold leading-[1.06] tracking-tight text-foreground">
              About ScaleCraft
            </h2>
            <p className={`text-[clamp(14px,1.95vh,19px)] font-medium ${ACCENT_CLASS.teal}`}>
              Learn to think in systems.
            </p>
            <p className={`max-w-[54ch] ${BODY}`}>
              ScaleCraft is an interactive system design learning environment built for engineers who want
              to genuinely understand how large-scale systems are designed, and why they work.
            </p>
          </div>

          <div className="hidden h-[clamp(140px,23vh,232px)] w-[clamp(320px,33vw,500px)] shrink-0 lg:block">
            <AboutIllustration />
          </div>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-[clamp(16px,2.4vw,40px)] border-t border-border pt-[clamp(13px,2.1vh,26px)] lg:grid-cols-2">
          {/* Left: motivation, philosophy, authorship. */}
          <div className="flex min-h-0 flex-col gap-[clamp(12px,2vh,22px)]">
            <section className="flex flex-col gap-[clamp(5px,0.9vh,10px)]">
              <h3 className={LABEL}>Why I built this</h3>
              <p className={BODY}>
                System design resources are good at telling you what components to use, and much weaker on
                why those decisions work in the first place.
              </p>
              <p className={BODY}>
                I wanted somewhere to build, break, and understand systems for myself - without limits,
                without filler, and without being pushed down a fixed path.
              </p>
              <p className={`text-[clamp(11.5px,1.5vh,14px)] font-medium ${ACCENT_CLASS.teal}`}>
                ScaleCraft is my answer to that.
              </p>
            </section>

            <section className="flex flex-col gap-[clamp(8px,1.4vh,14px)]">
              <h3 className={LABEL}>My philosophy</h3>
              <ol className="flex items-start justify-between gap-[clamp(2px,0.5vw,8px)]">
                {PHILOSOPHY.map((step, i) => (
                  <li key={step.label} className="flex items-start gap-[clamp(2px,0.5vw,8px)]">
                    <div className="flex w-[clamp(48px,5.2vw,74px)] flex-col items-center gap-[clamp(3px,0.6vh,7px)] text-center">
                      <span
                        className={`flex size-[clamp(28px,3.7vh,40px)] items-center justify-center rounded-md border border-border bg-panel ${ACCENT_CLASS[step.accent]}`}
                      >
                        <step.icon size={15} />
                      </span>
                      <span className={`text-[clamp(9.5px,1.25vh,12px)] font-semibold ${ACCENT_CLASS[step.accent]}`}>
                        {step.label}
                      </span>
                      <span className="text-[clamp(8.5px,1.05vh,10.5px)] leading-[1.35] text-foreground/45">
                        {step.caption}
                      </span>
                    </div>
                    {i < PHILOSOPHY.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="mt-[clamp(12px,1.7vh,18px)] text-[clamp(10px,1.3vh,13px)] text-foreground/25"
                      >
                        &rarr;
                      </span>
                    )}
                  </li>
                ))}
              </ol>
              {/* Neutral left rule, not an accent stripe - DESIGN.md reserves
                  coloured side stripes out of the system entirely. */}
              <blockquote className="border-l-2 border-border bg-panel py-[clamp(4px,0.8vh,8px)] pl-[clamp(10px,1.2vw,16px)]">
                <p className="text-[clamp(11px,1.45vh,13.5px)] italic leading-[1.55] text-foreground/65">
                  System design isn&rsquo;t about memorizing architectures. It&rsquo;s about making better
                  decisions under real-world constraints.
                </p>
              </blockquote>
            </section>

            <section className="mt-auto flex flex-col gap-[clamp(6px,1vh,12px)] border-t border-border pt-[clamp(11px,1.8vh,22px)]">
              <h3 className={LABEL}>Built by</h3>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-[clamp(2px,0.4vh,5px)]">
                  <p className={`text-[clamp(14px,1.85vh,18px)] font-semibold ${ACCENT_CLASS.teal}`}>Prateesh Sulikeri</p>
                  <p className="text-[clamp(9.5px,1.15vh,11px)] font-medium uppercase tracking-[0.1em] text-foreground/50">
                    Engineer &middot; Builder &middot; Lifelong Learner
                  </p>
                  <p className={`max-w-[40ch] ${BODY}`}>
                    I build things, break them, and learn from what happens. I enjoy making tools that help
                    other engineers grow.
                  </p>
                </div>
                <div className="flex shrink-0 gap-[clamp(5px,0.7vw,10px)]">
                  {SOCIALS.map((social) => {
                    const external = !social.href.startsWith("mailto:");
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        aria-label={social.label}
                        className="flex size-[clamp(32px,4.2vh,46px)] items-center justify-center rounded-md border border-border bg-panel text-foreground/65 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
                      >
                        {social.glyph}
                      </a>
                    );
                  })}
                </div>
              </div>
            </section>
          </div>

          {/* Right: what sets the product apart, then the version footer. */}
          <div className="flex min-h-0 flex-col gap-[clamp(8px,1.4vh,14px)] lg:border-l lg:border-border lg:pl-[clamp(20px,2.4vw,40px)]">
            <h3 className={LABEL}>What makes ScaleCraft different</h3>
            <ul className="flex flex-col divide-y divide-border">
              {DIFFERENTIATORS.map((item) => (
                <li key={item.title} className="flex items-start gap-[clamp(10px,1.1vw,18px)] py-[clamp(8px,1.5vh,17px)] first:pt-0">
                  <span
                    className={`flex size-[clamp(34px,4.6vh,52px)] shrink-0 items-center justify-center rounded-md border border-border bg-panel ${ACCENT_CLASS[item.accent]}`}
                  >
                    <item.icon size={18} />
                  </span>
                  <div className="flex flex-col gap-[clamp(2px,0.4vh,5px)]">
                    <p className={`text-[clamp(12px,1.6vh,15px)] font-semibold ${ACCENT_CLASS[item.accent]}`}>
                      {item.title}
                    </p>
                    <p className="text-[clamp(11px,1.4vh,13.5px)] leading-[1.55] text-foreground/65">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-auto flex items-center justify-end gap-3 border-t border-border pt-[clamp(11px,1.8vh,22px)]">
              <span className="rounded-md border border-border px-2 py-1 text-[clamp(9.5px,1.2vh,11.5px)] font-medium text-foreground/60">
                v{version}
              </span>
              <span aria-hidden="true" className="text-foreground/25">
                &middot;
              </span>
              <span className="text-[clamp(10px,1.3vh,12.5px)] text-foreground/45">
                Alpha, and still being built.
              </span>
            </div>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
