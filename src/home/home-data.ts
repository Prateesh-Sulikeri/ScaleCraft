import { allEntries, getCourse, locateEntry } from "@/curriculum";
import { chapterStatusLabel } from "@/learning-path/ChapterStatusIcon";
import { deriveStatus, summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import type { CourseId } from "@/curriculum/types";
import type { AppMode } from "@/lib/modes";

/**
 * Pure functions over plain data - zero React, zero Dexie, same split as
 * curriculum/progress.ts. Everything Home renders is derived here so the
 * components stay presentational and the derivations stay unit-testable
 * without mounting a page.
 *
 * Every number Home shows is derived from state the app already persists.
 * Nothing here is a placeholder, and no metric exists that would need a new
 * table to support it - where the available data can only support an
 * approximation (the day streak), the shape says so and the card labels it.
 */

/** Both learning courses, in the order Home lists them. Sandbox is
 *  deliberately absent: no curriculum, so no progress to summarize. */
export const COURSE_IDS: readonly CourseId[] = ["building-blocks", "real-world-extraction"];

export type CourseProgress = {
  completed: number;
  total: number;
  /** 0-100, rounded. */
  percent: number;
};

export function courseProgress(courseId: CourseId, inputs: ProgressInputs): CourseProgress {
  const { completed, total, percent } = summarizeCourse(getCourse(courseId), inputs);
  return { completed, total, percent };
}

export type ContinueTarget = {
  /** The public lesson route - the same destination the Learning Path's own
   *  rows use (see learning-path/ChapterRow.tsx), so "Continue Learning"
   *  lands where clicking the chapter would. Falls back to a course's
   *  Learning Path when no chapter can be opened. */
  href: string;
  courseId: CourseId;
  /** The manifest slug behind `href`, so a caller that needs the entry itself
   *  (difficulty, section, estimate) can look it up rather than re-deriving
   *  which chapter is next. Null whenever `href` is a Learning Path. */
  slug: string | null;
  /** e.g. "1.2 Load Balancers" - null when `href` is a Learning Path rather
   *  than a specific chapter. Checkpoints have no number, so those get just
   *  the title. */
  chapterLabel: string | null;
  /** For prefetching the lesson body behind the held transition. Null
   *  whenever `chapterLabel` is. */
  chapterDefinitionId: string | null;
  /** Which of three situations the learner is actually in, since "not a
   *  resume" is not the same as "has never started":
   *  - "fresh"  - no recorded curriculum activity at all
   *  - "resume" - this exact chapter was opened before and is unfinished
   *  - "next"   - there is progress elsewhere; this chapter is simply up next
   *  A learner who finished four chapters and left nothing half-done lands on
   *  "next", which is why the CTA cannot key off a single `fresh` boolean -
   *  that read "Start Learning" to someone plainly mid-course. */
  kind: "fresh" | "resume" | "next";
};

/** Has this learner recorded anything at all? Any visit, any manual
 *  completion, any exam attempt. Distinguishes a genuinely new learner from
 *  one who is between chapters. */
export function hasAnyProgress(inputs: ProgressInputs): boolean {
  for (const row of inputs.rowsBySlug.values()) {
    if (row.lastVisitedAt != null || row.manuallyCompletedAt != null) return true;
  }
  if (inputs.validationPassedDefinitionIds.size > 0) return true;
  for (const attempts of inputs.examAttemptsByDefinition.values()) {
    if (attempts.length > 0) return true;
  }
  return false;
}

/**
 * Where the hero's primary CTA goes. Preference order:
 *   1. the most recently opened chapter that is not COMPLETED (a real resume)
 *   2. the first not-yet-COMPLETED chapter in curriculum order
 *   3. the Building Blocks Learning Path
 *
 * Only *authored* entries are candidates. Most of the manifest has no lesson
 * behind it yet (curriculum/types.ts's `chapterDefinitionId`), and those
 * routes deliberately 404 rather than render an empty reader - so sending the
 * primary CTA at one would break it. Case 3 covers "everything authored is
 * finished" as well as "nothing is authored yet", and the Learning Path is
 * the honest answer to both: it shows what exists and what is coming.
 *
 * `kind` is derived independently of which case won: whether this is a resume
 * is about the target chapter, but whether the learner has *started* is about
 * their whole history (see ContinueTarget.kind).
 *
 * `courseIds` narrows the search: Home considers both courses, while a single
 * Learning Path's "Up next" card passes only its own. Scoping the candidates
 * rather than reimplementing the preference order is what keeps the two
 * surfaces from ever disagreeing about which chapter comes next.
 */
export function resolveContinueTarget(
  inputs: ProgressInputs,
  courseIds: readonly CourseId[] = COURSE_IDS,
): ContinueTarget {
  const started = hasAnyProgress(inputs);
  const authored = courseIds.flatMap((courseId) =>
    allEntries(getCourse(courseId))
      .filter((entry) => entry.chapterDefinitionId != null)
      .map((entry) => ({ courseId, entry })),
  );
  const open = authored.filter(({ entry }) => deriveStatus(entry, inputs) !== "COMPLETED");

  let resumed: (typeof open)[number] | null = null;
  let resumedAt = 0;
  for (const candidate of open) {
    const visitedAt = inputs.rowsBySlug.get(candidate.entry.slug)?.lastVisitedAt;
    if (visitedAt == null) continue;
    if (resumed == null || visitedAt > resumedAt) {
      resumed = candidate;
      resumedAt = visitedAt;
    }
  }
  if (resumed) return { ...toChapterTarget(resumed.courseId, resumed.entry), kind: "resume" };
  if (open.length > 0) {
    return { ...toChapterTarget(open[0].courseId, open[0].entry), kind: started ? "next" : "fresh" };
  }

  const fallbackCourse = courseIds[0] ?? "building-blocks";
  return {
    href: `/${fallbackCourse}`,
    courseId: fallbackCourse,
    slug: null,
    chapterLabel: null,
    chapterDefinitionId: null,
    kind: started ? "next" : "fresh",
  };
}

function toChapterTarget(
  courseId: CourseId,
  entry: { slug: string; number: string | null; title: string; chapterDefinitionId: string | null },
): Omit<ContinueTarget, "kind"> {
  return {
    href: `/${courseId}/${entry.slug}/lesson`,
    courseId,
    slug: entry.slug,
    chapterLabel: entry.number ? `${entry.number} ${entry.title}` : entry.title,
    chapterDefinitionId: entry.chapterDefinitionId,
  };
}

export type ActivityEntry = {
  /** Stable across renders - the slug, or "sandbox" for the board. */
  id: string;
  /** Which mode the activity happened in, for the row's colored label. */
  mode: AppMode;
  /** e.g. "1.2 Load Balancers" or "Sandbox board". */
  title: string;
  /** Human status - "In progress" / "Completed" / "Not started" / "Edited". */
  status: string;
  /** Epoch ms of the activity, formatted at render time. */
  at: number;
  /** Where the row goes when clicked - the chapter's lesson, the same target
   *  the hero CTA resumes to (see toChapterTarget). Null for the Sandbox
   *  board: it is a save slot, not a chapter, and there is nothing to
   *  "return to" that the Sandbox mode card above does not already offer. */
  href: string | null;
};

/** Extra timestamps Home needs that are not part of ProgressInputs, read
 *  from Dexie by the caller (see use-home-data.ts). */
export type LocalActivityInputs = {
  /** db.saves' Sandbox slot updatedAt, or null when it has never been saved. */
  sandboxUpdatedAt: number | null;
};

const DEFAULT_ACTIVITY_LIMIT = 3;

/**
 * The Recent activity list, assembled from state the app already writes:
 * curriculum rows (lastVisitedAt / manuallyCompletedAt) plus the Sandbox
 * save slot's updatedAt. There is no event log - these are current-state
 * timestamps, so the list shows the latest touch of each thing rather than a
 * full history. That is the honest shape of the data today; a real event
 * table would only need to replace this function.
 */
export function buildRecentActivity(
  inputs: ProgressInputs,
  local: LocalActivityInputs,
  limit: number = DEFAULT_ACTIVITY_LIMIT,
): ActivityEntry[] {
  const entries: ActivityEntry[] = [];

  for (const [slug, row] of inputs.rowsBySlug) {
    const at = Math.max(row.lastVisitedAt ?? 0, row.manuallyCompletedAt ?? 0);
    if (at === 0) continue;
    const located = locateEntry(slug);
    // A row whose slug is no longer in the manifest (a renamed chapter from
    // an older install) is skipped rather than rendered untitled.
    if (!located) continue;
    entries.push({
      id: slug,
      mode: located.courseId,
      title: located.entry.number ? `${located.entry.number} ${located.entry.title}` : located.entry.title,
      status: chapterStatusLabel(deriveStatus(located.entry, inputs)),
      at,
      href: `/${located.courseId}/${slug}/lesson`,
    });
  }

  if (local.sandboxUpdatedAt != null) {
    entries.push({
      id: "sandbox",
      mode: "sandbox",
      // One fixed save slot today (db.ts's SANDBOX_SAVE_ID), so there is no
      // per-board name to show yet.
      title: "Sandbox board",
      status: "Edited",
      at: local.sandboxUpdatedAt,
      href: null,
    });
  }

  return entries.sort((a, b) => b.at - a.at).slice(0, limit);
}

export type ModeSplitSlice = {
  mode: AppMode;
  count: number;
  /** 0-100 integers that sum to exactly 100 (see modeSplit). 0 when there is
   *  no activity at all. */
  percent: number;
};

/** Fixed slice order, so a mode keeps the same position and color as counts
 *  change - color follows the entity, never its rank. */
export const MODE_SPLIT_ORDER: readonly AppMode[] = ["building-blocks", "real-world-extraction", "sandbox"];

/**
 * How the tracked activity divides across the three modes, for the All
 * activity dialog's donut.
 *
 * Counts *items touched*, not time or effort - that is all the current-state
 * timestamps can support (see buildRecentActivity). Sandbox is therefore
 * capped at 1 by construction, since there is one save slot.
 *
 * Percentages use largest-remainder rounding so the three labels always add up
 * to 100 - independently rounding thirds prints 33/33/33 and reads as a bug.
 */
export function modeSplit(activity: readonly ActivityEntry[]): ModeSplitSlice[] {
  const total = activity.length;
  const counts = MODE_SPLIT_ORDER.map((mode) => ({
    mode,
    count: activity.filter((entry) => entry.mode === mode).length,
  }));
  if (total === 0) return counts.map((c) => ({ ...c, percent: 0 }));

  const exact = counts.map((c) => (c.count / total) * 100);
  const slices = counts.map((c, i) => ({ ...c, percent: Math.floor(exact[i]) }));
  let remaining = 100 - slices.reduce((sum, s) => sum + s.percent, 0);
  // Hand the leftover points to the largest fractional parts first.
  const byRemainder = slices.map((_, i) => i).sort((a, b) => (exact[b] % 1) - (exact[a] % 1));
  for (const i of byRemainder) {
    if (remaining === 0) break;
    slices[i].percent += 1;
    remaining -= 1;
  }
  return slices;
}

export type HomeStats = {
  chaptersCompleted: number;
  chaptersTotal: number;
  checkpointsCompleted: number;
  checkpointsTotal: number;
  /** Consecutive days with recorded activity, ending today or yesterday.
   *  Derived from the timestamps the app already keeps - see
   *  computeDayStreak for why it is a floor, not an exact count. */
  dayStreak: number;
  /** The longest such run anywhere in the recorded history, current run
   *  included, so it is always >= dayStreak. Same lossy source, one extra
   *  caveat - see computeLongestStreak. */
  longestStreak: number;
};

/* No "time spent" metric here, deliberately. Measuring real time on task needs
 * an active-tab heartbeat writing to a per-day counter, i.e. a new table -
 * Clerk has nothing for it either (its session fields are presence, not
 * duration, and they are overwritten rather than accumulated). Rather than ship
 * a placeholder dash or dress up the manifest's per-chapter *estimate* as a
 * measurement, the tile was removed. Add it back only alongside a real
 * writer. */

/** Local calendar day as an integer index, DST-safe (comparing raw epoch
 *  offsets is not - an hour shift moves a late-evening timestamp into the
 *  wrong day). */
export function localDayIndex(ts: number): number {
  const d = new Date(ts);
  return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000);
}

/** The distinct local days any activity was recorded on. Both streak
 *  functions reduce this same set, so they can never disagree about what
 *  counts as an active day. */
function activityDays(timestamps: readonly number[], preservedDays: readonly number[] = []): Set<number> {
  const days = new Set(timestamps.filter((t) => t > 0).map(localDayIndex));
  // Days carried across a progress reset (db.streakDays). A union, not a
  // replacement: a preserved day may also still be live if only one course
  // was reset, and Set membership makes that overlap free.
  for (const day of preservedDays) days.add(day);
  return days;
}

/**
 * Consecutive active days ending today (or yesterday - a streak is not
 * broken until a full day is missed).
 *
 * A known floor rather than an exact count: `curriculumProgress` keeps only
 * the *latest* visit per chapter, so re-reading one chapter across three days
 * leaves a single timestamp behind. Exam submissions add their own dated
 * points, which fills much of that gap in practice. An exact streak needs a
 * per-day activity log, which no table provides yet - deliberately not
 * invented here (see the note in Home's own summary).
 */
export function computeDayStreak(
  timestamps: readonly number[],
  now: number,
  preservedDays: readonly number[] = [],
): number {
  const days = activityDays(timestamps, preservedDays);
  if (days.size === 0) return 0;
  const today = localDayIndex(now);

  let cursor = days.has(today) ? today : days.has(today - 1) ? today - 1 : null;
  if (cursor == null) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 1;
  }
  return streak;
}

/**
 * The longest run of consecutive active days on record. Same input set as
 * computeDayStreak, so it always comes out >= the current streak.
 *
 * Carries the same lossiness as the current streak, plus one wrinkle worth
 * knowing: because only the *latest* visit per chapter is stored, re-opening
 * an old chapter moves its date forward and erases the day it originally sat
 * on. So this can shrink after a re-read, which for a "longest ever" figure is
 * a visible oddity rather than a mere undercount. Permanent timestamps
 * (manual completions, exam submissions) are never rewritten and anchor most
 * of the history in practice. Making it monotonic means persisting the maximum
 * - a new table - which is out of scope by choice; the tile's tooltip says
 * what the number is instead of overstating it.
 */
export function computeLongestStreak(
  timestamps: readonly number[],
  preservedDays: readonly number[] = [],
): number {
  const days = activityDays(timestamps, preservedDays);
  if (days.size === 0) return 0;

  let longest = 0;
  for (const day of days) {
    // Count only from a run's first day, so each run is measured once
    // regardless of Set iteration order.
    if (days.has(day - 1)) continue;
    let length = 0;
    let cursor = day;
    while (days.has(cursor)) {
      length += 1;
      cursor += 1;
    }
    longest = Math.max(longest, length);
  }
  return longest;
}

/** Every dated thing the app records, flattened for the streak functions.
 *  Exported because the Learning Path's header shows the same day streak and
 *  must read the same timestamps - a second gatherer would drift. */
export function activityTimestamps(inputs: ProgressInputs): number[] {
  const timestamps: number[] = [];
  for (const row of inputs.rowsBySlug.values()) {
    if (row.lastVisitedAt != null) timestamps.push(row.lastVisitedAt);
    if (row.manuallyCompletedAt != null) timestamps.push(row.manuallyCompletedAt);
  }
  for (const attempts of inputs.examAttemptsByDefinition.values()) {
    for (const attempt of attempts) timestamps.push(attempt.submittedAt);
  }
  return timestamps;
}

export function computeStats(
  inputs: ProgressInputs,
  now: number,
  preservedDays: readonly number[] = [],
): HomeStats {
  const entries = COURSE_IDS.flatMap((courseId) => allEntries(getCourse(courseId)));
  const chapters = entries.filter((e) => e.kind === "chapter");
  const checkpoints = entries.filter((e) => e.kind === "checkpoint");
  const isComplete = (slug: string) => {
    const located = locateEntry(slug);
    return located != null && deriveStatus(located.entry, inputs) === "COMPLETED";
  };

  const timestamps = activityTimestamps(inputs);

  return {
    chaptersCompleted: chapters.filter((e) => isComplete(e.slug)).length,
    chaptersTotal: chapters.length,
    checkpointsCompleted: checkpoints.filter((e) => isComplete(e.slug)).length,
    checkpointsTotal: checkpoints.length,
    dayStreak: computeDayStreak(timestamps, now, preservedDays),
    longestStreak: computeLongestStreak(timestamps, preservedDays),
  };
}

/** Compact relative time for activity rows - "2h ago", "Yesterday", "3d ago".
 *  Deliberately coarse: the exact minute of a chapter visit carries no
 *  meaning a learner acts on. */
export function formatRelativeTime(at: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const dayDelta = localDayIndex(now) - localDayIndex(at);
  if (dayDelta === 0) return `${Math.floor(minutes / 60)}h ago`;
  if (dayDelta === 1) return "Yesterday";
  if (dayDelta < 30) return `${dayDelta}d ago`;
  const months = Math.floor(dayDelta / 30);
  return months < 12 ? `${months}mo ago` : `${Math.floor(dayDelta / 365)}y ago`;
}
