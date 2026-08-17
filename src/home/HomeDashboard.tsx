"use client";

import { PageEnter } from "@/app/PageEnter";
import { AtAGlanceCard } from "./AtAGlanceCard";
import { HomeFooter } from "./HomeFooter";
import { HomeHeader } from "./HomeHeader";
import { HomeHero } from "./HomeHero";
import { HOME_CONTAINER } from "./layout";
import { ModeSection } from "./ModeSection";
import { RecentActivityCard } from "./RecentActivityCard";
import { useHomeData } from "./use-home-data";

/**
 * Home, as a product dashboard: orient, continue, choose a mode, see what
 * changed. It replaces the react-flow mode-selector canvas that used to live
 * here (HomeCanvas/ModeNode) - a single static graph was a striking first
 * screen but it could only ever hold three cards, with nowhere to put
 * progress, activity, or release news.
 *
 * `useHomeData` is called once, here, and every card receives its slice as
 * props. That keeps one hydrate pass and one `now` for the whole page instead
 * of six components each subscribing to the progress store and reading the
 * clock at slightly different moments.
 *
 * Home owns its own vertical scroll: `body` is `h-full`/`overflow-hidden`
 * (layout.tsx's fixed-viewport app shell), so there is no page-level scroll to
 * inherit. The dotted plane is a CSS radial-gradient rather than react-flow's
 * <Background>, since nothing on this page is a canvas anymore - same motif,
 * none of the graph machinery.
 */
export function HomeDashboard() {
  const { progressByCourse, continueTarget, activity, allActivity, stats, now, isSignedIn } = useHomeData();

  return (
    <PageEnter>
      <div
        className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden"
        style={{
          backgroundImage: "radial-gradient(color-mix(in srgb, var(--border) 85%, transparent) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      >
        <HomeHeader />

        {/* justify-center, not top-packed: on a 1440p-tall window the content is
           * far shorter than the viewport, and packing it to the top left a
           * dead band above the footer. Safe when content is taller than the
           * viewport too - a column flex item never shrinks below its content,
           * so there is no spare space left for centering to distribute and
           * nothing can be pushed out of reach above the scroll origin. */}
        <main className={`${HOME_CONTAINER} flex flex-1 flex-col justify-center gap-6 py-6`}>
          <HomeHero continueTarget={continueTarget} now={now} />
          <ModeSection progressByCourse={progressByCourse} />

          {/* Activity is the narrower of the two - four stat tiles need more
           * horizontal room than three activity rows do. */}
          <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.35fr)]">
            <RecentActivityCard activity={activity} allActivity={allActivity} now={now} isSignedIn={isSignedIn} />
            <AtAGlanceCard stats={stats} />
          </section>
        </main>

        <HomeFooter />
      </div>
    </PageEnter>
  );
}
