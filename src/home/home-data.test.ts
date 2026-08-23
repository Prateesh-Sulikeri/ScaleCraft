import { describe, it, expect } from "vitest";
import type { CurriculumProgress, ExamAttempt } from "@/persistence/db";
import type { ProgressInputs } from "@/curriculum/progress";
import { allEntries, getCourse } from "@/curriculum";
import { chapterRegistry } from "@/content/chapters";
import {
  buildRecentActivity,
  computeDayStreak,
  localDayIndex,
  computeLongestStreak,
  computeStats,
  courseProgress,
  formatRelativeTime,
  modeSplit,
  resolveContinueTarget,
  type ActivityEntry,
} from "./home-data";

const DAY = 86_400_000;

function row(slug: string, fields: Partial<CurriculumProgress> = {}): CurriculumProgress {
  return {
    slug,
    manuallyCompletedAt: null,
    lastVisitedAt: null,
    dirty: false,
    syncedAt: null,
    ...fields,
  };
}

function inputs(rows: CurriculumProgress[] = [], attempts: ExamAttempt[] = []): ProgressInputs {
  const examAttemptsByDefinition = new Map<string, ExamAttempt[]>();
  for (const attempt of attempts) {
    examAttemptsByDefinition.set(attempt.chapterDefinitionId, [
      ...(examAttemptsByDefinition.get(attempt.chapterDefinitionId) ?? []),
      attempt,
    ]);
  }
  return {
    validationPassedDefinitionIds: new Set(),
    rowsBySlug: new Map(rows.map((r) => [r.slug, r])),
    examAttemptsByDefinition,
  };
}

/** The first two curriculum slugs, whatever the manifest currently says - the
 *  derivations below are about ordering and status, not about any one
 *  chapter's identity. */
const bbEntries = allEntries(getCourse("building-blocks"));
const authoredEntries = bbEntries.filter((e) => e.chapterDefinitionId != null);

describe("courseProgress", () => {
  it("reports 0% with an empty progress store", () => {
    const progress = courseProgress("building-blocks", inputs());
    expect(progress.completed).toBe(0);
    expect(progress.percent).toBe(0);
    expect(progress.total).toBe(bbEntries.length);
  });

  it("counts a manually completed chapter", () => {
    const progress = courseProgress("building-blocks", inputs([row(bbEntries[0].slug, { manuallyCompletedAt: 1 })]));
    expect(progress.completed).toBe(1);
    expect(progress.percent).toBe(Math.round((1 / bbEntries.length) * 100));
  });
});

describe("resolveContinueTarget", () => {
  it("starts at the first authored chapter for a brand-new learner", () => {
    const target = resolveContinueTarget(inputs());
    expect(target.kind).toBe("fresh");
    expect(target.href).toBe(`/building-blocks/${authoredEntries[0].slug}/lesson`);
    expect(target.chapterDefinitionId).toBe(authoredEntries[0].chapterDefinitionId);
  });

  it("resumes the most recently visited unfinished chapter", () => {
    const [first, second] = authoredEntries;
    const target = resolveContinueTarget(
      inputs([row(first.slug, { lastVisitedAt: 1_000 }), row(second.slug, { lastVisitedAt: 9_000 })]),
    );
    expect(target.kind).toBe("resume");
    expect(target.href).toBe(`/building-blocks/${second.slug}/lesson`);
  });

  it("skips a visited chapter that is already complete", () => {
    const [first, second] = authoredEntries;
    const target = resolveContinueTarget(
      inputs([
        row(first.slug, { lastVisitedAt: 1_000 }),
        row(second.slug, { lastVisitedAt: 9_000, manuallyCompletedAt: 9_500 }),
      ]),
    );
    expect(target.href).toBe(`/building-blocks/${first.slug}/lesson`);
  });

  it("never points at an unauthored chapter, which would 404", () => {
    const target = resolveContinueTarget(inputs());
    const slug = target.href.split("/")[2];
    const entry = bbEntries.find((e) => e.slug === slug);
    expect(entry?.chapterDefinitionId).not.toBeNull();
    expect(chapterRegistry.some((c) => c.id === entry?.chapterDefinitionId)).toBe(true);
  });

  it("says 'next', not 'fresh', for a learner who finished chapters and left nothing half-done", () => {
    const [first, second] = authoredEntries;
    const target = resolveContinueTarget(
      inputs([row(first.slug, { lastVisitedAt: 1_000, manuallyCompletedAt: 2_000 })]),
    );
    // Nothing is mid-progress, so this is not a resume - but the learner has
    // plainly started, so it must not read as a first visit either.
    expect(target.kind).toBe("next");
    expect(target.href).toBe(`/building-blocks/${second.slug}/lesson`);
  });

  it("counts an exam attempt alone as having started", () => {
    const attempt: ExamAttempt = {
      chapterDefinitionId: "some-definition",
      attemptNumber: 1,
      submittedAt: 5_000,
      score: 40,
      answers: [],
      dirty: false,
      syncedAt: null,
    };
    expect(resolveContinueTarget(inputs([], [attempt])).kind).toBe("next");
  });

  it("falls back to the Learning Path once every authored chapter is complete", () => {
    const target = resolveContinueTarget(
      inputs(
        [...allEntries(getCourse("building-blocks")), ...allEntries(getCourse("real-world-extraction"))]
          .filter((e) => e.chapterDefinitionId != null)
          .map((e) => row(e.slug, { manuallyCompletedAt: 1 })),
      ),
    );
    expect(target.href).toBe("/building-blocks");
    expect(target.chapterLabel).toBeNull();
    expect(target.chapterDefinitionId).toBeNull();
  });
});

describe("buildRecentActivity", () => {
  it("is empty when nothing has been touched", () => {
    expect(buildRecentActivity(inputs(), { sandboxUpdatedAt: null })).toEqual([]);
  });

  it("sorts newest first and caps the list", () => {
    const [a, b, c, d] = bbEntries;
    const activity = buildRecentActivity(
      inputs([
        row(a.slug, { lastVisitedAt: 1_000 }),
        row(b.slug, { lastVisitedAt: 4_000 }),
        row(c.slug, { lastVisitedAt: 3_000 }),
        row(d.slug, { lastVisitedAt: 2_000 }),
      ]),
      { sandboxUpdatedAt: null },
    );
    expect(activity).toHaveLength(3);
    expect(activity.map((e) => e.at)).toEqual([4_000, 3_000, 2_000]);
  });

  it("includes the Sandbox board when it has been saved", () => {
    const activity = buildRecentActivity(inputs(), { sandboxUpdatedAt: 5_000 });
    expect(activity).toEqual([
      { id: "sandbox", mode: "sandbox", title: "Sandbox board", status: "Edited", at: 5_000, href: null },
    ]);
  });

  it("uses the completion timestamp when it is newer than the last visit", () => {
    const [entry] = bbEntries;
    const [activity] = buildRecentActivity(
      inputs([row(entry.slug, { lastVisitedAt: 1_000, manuallyCompletedAt: 7_000 })]),
      { sandboxUpdatedAt: null },
    );
    expect(activity.at).toBe(7_000);
    expect(activity.status).toBe("Completed");
  });

  it("skips a row whose slug is no longer in the manifest", () => {
    const activity = buildRecentActivity(inputs([row("gone-in-a-rename", { lastVisitedAt: 1_000 })]), {
      sandboxUpdatedAt: null,
    });
    expect(activity).toEqual([]);
  });
});

describe("computeDayStreak", () => {
  const now = Date.parse("2026-08-17T12:00:00");

  it("is 0 with no timestamps", () => {
    expect(computeDayStreak([], now)).toBe(0);
  });

  it("counts consecutive days ending today", () => {
    expect(computeDayStreak([now, now - DAY, now - 2 * DAY], now)).toBe(3);
  });

  it("still counts a streak that ends yesterday", () => {
    expect(computeDayStreak([now - DAY, now - 2 * DAY], now)).toBe(2);
  });

  it("breaks once a full day is missed", () => {
    expect(computeDayStreak([now, now - 2 * DAY, now - 3 * DAY], now)).toBe(1);
  });

  it("is 0 when the last activity is older than yesterday", () => {
    expect(computeDayStreak([now - 5 * DAY], now)).toBe(0);
  });

  it("counts one day once, no matter how many timestamps land in it", () => {
    expect(computeDayStreak([now, now - 1_000, now - 2_000], now)).toBe(1);
  });
});

describe("computeLongestStreak", () => {
  const now = Date.parse("2026-08-17T12:00:00");

  it("is 0 with no timestamps", () => {
    expect(computeLongestStreak([])).toBe(0);
  });

  it("finds the longest run, not the most recent one", () => {
    // A 4-day run three weeks ago, and a 2-day run ending today.
    const old = [20, 19, 18, 17].map((d) => now - d * DAY);
    const recent = [now, now - DAY];
    expect(computeLongestStreak([...old, ...recent])).toBe(4);
  });

  it("counts a run once regardless of the order timestamps arrive in", () => {
    const days = [now - 2 * DAY, now, now - DAY];
    expect(computeLongestStreak(days)).toBe(3);
    expect(computeLongestStreak([...days].reverse())).toBe(3);
  });

  it("collapses several timestamps on one day into a single day", () => {
    expect(computeLongestStreak([now, now - 1_000, now - 2_000])).toBe(1);
  });

  it("never comes out below the current streak", () => {
    const days = [now, now - DAY, now - 2 * DAY];
    expect(computeLongestStreak(days)).toBeGreaterThanOrEqual(computeDayStreak(days, now));
  });

  it("counts a long-broken run the current streak has already forgotten", () => {
    const stale = [10, 9, 8].map((d) => now - d * DAY);
    expect(computeDayStreak(stale, now)).toBe(0);
    expect(computeLongestStreak(stale)).toBe(3);
  });
});

describe("computeStats", () => {
  const now = Date.parse("2026-08-17T12:00:00");

  it("splits chapters from checkpoints and reports both totals", () => {
    const stats = computeStats(inputs(), now);
    expect(stats.chaptersCompleted).toBe(0);
    expect(stats.checkpointsCompleted).toBe(0);
    expect(stats.chaptersTotal + stats.checkpointsTotal).toBe(
      allEntries(getCourse("building-blocks")).length + allEntries(getCourse("real-world-extraction")).length,
    );
  });

  it("reports both streaks as zero with no recorded activity", () => {
    const stats = computeStats(inputs(), now);
    expect(stats.dayStreak).toBe(0);
    expect(stats.longestStreak).toBe(0);
  });

  it("counts a completed chapter against the chapter tally only", () => {
    const chapter = allEntries(getCourse("building-blocks")).find((e) => e.kind === "chapter")!;
    const stats = computeStats(inputs([row(chapter.slug, { manuallyCompletedAt: now })]), now);
    expect(stats.chaptersCompleted).toBe(1);
    expect(stats.checkpointsCompleted).toBe(0);
  });

  it("derives the streak from visits and exam submissions together", () => {
    const [entry] = allEntries(getCourse("building-blocks"));
    const attempt: ExamAttempt = {
      chapterDefinitionId: "any-definition",
      attemptNumber: 1,
      submittedAt: now - DAY,
      score: 90,
      answers: [],
      dirty: false,
      syncedAt: null,
    };
    const stats = computeStats(inputs([row(entry.slug, { lastVisitedAt: now })], [attempt]), now);
    expect(stats.dayStreak).toBe(2);
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-08-17T12:00:00");

  it("collapses the first minute to 'Just now'", () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe("Just now");
  });

  it("reports minutes, then hours within the same day", () => {
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5m ago");
    expect(formatRelativeTime(now - 2 * 3_600_000, now)).toBe("2h ago");
  });

  it("names yesterday rather than counting hours across midnight", () => {
    expect(formatRelativeTime(Date.parse("2026-08-16T23:30:00"), now)).toBe("Yesterday");
  });

  it("counts days, then months, then years", () => {
    expect(formatRelativeTime(now - 3 * DAY, now)).toBe("3d ago");
    expect(formatRelativeTime(now - 60 * DAY, now)).toBe("2mo ago");
    expect(formatRelativeTime(now - 800 * DAY, now)).toBe("2y ago");
  });

  it("never renders a negative age for a clock skewed into the future", () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe("Just now");
  });
});

describe("modeSplit", () => {
  const at = (mode: ActivityEntry["mode"], id: string): ActivityEntry => ({
    id,
    mode,
    title: id,
    status: "In progress",
    at: 1_000,
    href: null,
  });

  it("returns all three modes in a fixed order, zeros included", () => {
    expect(modeSplit([]).map((s) => [s.mode, s.count, s.percent])).toEqual([
      ["building-blocks", 0, 0],
      ["real-world-extraction", 0, 0],
      ["sandbox", 0, 0],
    ]);
  });

  it("counts entries per mode", () => {
    const split = modeSplit([at("building-blocks", "a"), at("building-blocks", "b"), at("sandbox", "c")]);
    expect(split.map((s) => s.count)).toEqual([2, 0, 1]);
    expect(split.map((s) => s.percent)).toEqual([67, 0, 33]);
  });

  it("keeps percentages summing to exactly 100 where naive rounding would not", () => {
    const thirds = modeSplit([at("building-blocks", "a"), at("real-world-extraction", "b"), at("sandbox", "c")]);
    expect(thirds.reduce((sum, s) => sum + s.percent, 0)).toBe(100);
    expect(thirds.map((s) => s.percent)).toEqual([34, 33, 33]);
  });

  it("gives a single-mode history the whole ring", () => {
    expect(modeSplit([at("sandbox", "a")]).map((s) => s.percent)).toEqual([0, 0, 100]);
  });
});

describe("preserved streak days", () => {
  const DAY_MS = 86_400_000;
  // Midday, so the local-day conversion can't straddle a boundary in
  // whatever timezone the suite runs in.
  const at = (dayIndex: number) => dayIndex * DAY_MS + 12 * 3_600_000;

  it("keeps the streak alive when a reset has wiped every timestamp", () => {
    const today = localDayIndex(Date.now());
    const preserved = [today - 2, today - 1, today];

    expect(computeDayStreak([], Date.now())).toBe(0);
    expect(computeDayStreak([], Date.now(), preserved)).toBe(3);
  });

  it("lets today's fresh activity extend a preserved run rather than restarting it", () => {
    const today = localDayIndex(Date.now());
    // The reset happened yesterday; the learner has just done one chapter.
    const preserved = [today - 3, today - 2, today - 1];

    expect(computeDayStreak([at(today)], Date.now(), preserved)).toBe(4);
  });

  it("does not double-count a day that is both preserved and still live", () => {
    const today = localDayIndex(Date.now());
    const preserved = [today - 1, today];

    expect(computeDayStreak([at(today), at(today - 1)], Date.now(), preserved)).toBe(2);
  });

  it("carries the longest streak across a reset too", () => {
    const today = localDayIndex(Date.now());
    const preserved = [today - 20, today - 19, today - 18, today - 17, today - 16];

    expect(computeLongestStreak([], preserved)).toBe(5);
    // Current streak is 0 (the run ended long ago), longest is not.
    expect(computeDayStreak([], Date.now(), preserved)).toBe(0);
  });

  it("breaks the streak on a real gap, preserved days included", () => {
    const today = localDayIndex(Date.now());
    const preserved = [today - 5, today - 4];

    expect(computeDayStreak([], Date.now(), preserved)).toBe(0);
  });
});
