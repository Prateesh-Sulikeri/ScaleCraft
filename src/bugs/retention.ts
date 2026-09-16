import { and, eq, inArray, isNotNull, isNull, lt, notInArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { deleteBugImage, deleteOrphanBugImages } from "./image-storage";
import { bugImageRetentionCutoff, bugRetentionCutoff, TERMINAL_BUG_STATUSES } from "./types";

/**
 * Automatic cleanup for bug reports - see
 * .claude/docs/pending-bug-retention.md.
 *
 * Two rules, both stated to the reporter in the details view rather than
 * applied quietly:
 *
 * 1. A report that reaches a terminal status (`resolved` or `closed`) loses its
 *    screenshot 7 days later. The bytes are the expensive part of a report and
 *    stop being evidence first, but not the moment the status flips - the
 *    screenshot is what you re-read while writing the closing notes.
 * 2. The report itself is deleted 15 days after that same close, unconditionally
 *    - read or not, acknowledged or not.
 *
 * Both windows run off one column, `closedAt`, so a report cannot be due for
 * one and not the other in a way nobody predicted, and reopening it stops both
 * clocks with a single write.
 *
 * Every step here is idempotent and safe to re-run. The nightly cron is the
 * only thing that drives them; POST /api/bugs/[id]/close just starts the clock,
 * because with a grace window there is nothing left for it to do immediately.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** Orphaned attachments younger than this are left alone - POST /api/bugs
 *  writes the image before the bug row, so a submit in flight briefly looks
 *  exactly like an orphan. */
const ORPHAN_GRACE_MS = DAY_MS;

/** Spread into a mutable array because `status` is a plain text column and
 *  drizzle's inArray wants `string[]`, not a readonly tuple of the union. */
const terminalStatuses: string[] = [...TERMINAL_BUG_STATUSES];

export type RetentionResult = {
  /** Terminal reports that had no `closedAt` and just got one - i.e. closed by
   *  hand SQL since the last sweep. */
  clockStarted: number;
  /** Reports reopened since the last sweep, taken back off the clock. */
  clockCleared: number;
  imagesDeleted: number;
  reportsPurged: number;
  orphanImagesDeleted: number;
};

/** Step 1. Starts the retention clock on anything sitting terminal without
 *  one. This is what makes a plain `UPDATE bug_reports SET status = 'closed'`
 *  a complete action - the author never has to remember a second column, the
 *  same property the `seenStatus` design was built for. */
export async function startRetentionClocks(now: Date): Promise<number> {
  const rows = await getDb()
    .update(bugReports)
    .set({ closedAt: now })
    .where(and(inArray(bugReports.status, terminalStatuses), isNull(bugReports.closedAt)))
    .returning({ id: bugReports.id });
  return rows.length;
}

/** Step 2. A reopened report goes back off both clocks, and starts fresh ones
 *  if it is closed again later. Reopening inside the 7-day window keeps the
 *  screenshot; reopening after it does not bring the bytes back - that is the
 *  accepted cost of counting `resolved` as terminal. */
export async function clearRetentionClocks(): Promise<number> {
  const rows = await getDb()
    .update(bugReports)
    .set({ closedAt: null })
    .where(and(notInArray(bugReports.status, terminalStatuses), isNotNull(bugReports.closedAt)))
    .returning({ id: bugReports.id });
  return rows.length;
}

/**
 * Step 3. Drops the attachments of reports that closed more than 7 days ago.
 *
 * The `closedAt` bound is what makes the grace window real: step 1 stamps a
 * hand-SQL close with `now`, so the same sweep that discovers a closed report
 * cannot also strip it. A report is only ever eligible here on a later run.
 *
 * Bytes first, then the ref - deliberately, and the two writes are not in a
 * transaction because the HTTP driver may put each statement on its own
 * connection anyway. Crashing between them leaves a ref pointing at nothing,
 * which the image route already answers with a 404 and the next sweep tidies
 * up. Doing it the other way round would strand the bytes permanently with
 * nothing left pointing at them to find them by.
 */
export async function deleteClosedReportImages(now: Date): Promise<number> {
  const db = getDb();
  const rows = await db
    .select({ id: bugReports.id, imageRef: bugReports.imageRef })
    .from(bugReports)
    .where(
      and(
        inArray(bugReports.status, terminalStatuses),
        isNotNull(bugReports.imageRef),
        isNotNull(bugReports.closedAt),
        lt(bugReports.closedAt, bugImageRetentionCutoff(now)),
      ),
    );

  let deleted = 0;
  for (const row of rows) {
    if (!row.imageRef) continue;
    await deleteBugImage(row.imageRef);
    await db
      .update(bugReports)
      .set({ imageRef: null, imageDeletedAt: now })
      .where(eq(bugReports.id, row.id));
    deleted += 1;
  }
  return deleted;
}

/** Step 4. The purge. Runs after step 3 in the same sweep, so every row it
 *  deletes has already had its attachment dropped and there is nothing left
 *  behind in `bug_report_images`. */
export async function purgeExpiredReports(now: Date): Promise<number> {
  const rows = await getDb()
    .delete(bugReports)
    .where(and(isNotNull(bugReports.closedAt), lt(bugReports.closedAt, bugRetentionCutoff(now))))
    .returning({ id: bugReports.id });
  return rows.length;
}

/**
 * The whole nightly sweep, in the one order that is safe:
 *
 * - stamp before purging, or a report closed by hand SQL never gets a clock to
 *   expire and lives forever;
 * - unstamp before purging, or a report reopened on day 16 is deleted on the
 *   very sweep that should have rescued it;
 * - drop images before purging, so the purge only ever deletes rows whose
 *   bytes are already gone (7 days < 15, so every row the purge reaches has
 *   passed through step 3 on an earlier sweep anyway - this only matters if
 *   the two windows are ever brought closer together);
 * - orphan sweep last, since step 3 has just created the newest batch of them
 *   (a ref nulled after its bytes were deleted leaves nothing, but a crash in
 *   a *previous* run might have).
 */
export async function runBugRetentionSweep(now = new Date()): Promise<RetentionResult> {
  const clockStarted = await startRetentionClocks(now);
  const clockCleared = await clearRetentionClocks();
  const imagesDeleted = await deleteClosedReportImages(now);
  const reportsPurged = await purgeExpiredReports(now);
  const orphanImagesDeleted = await deleteOrphanBugImages(
    new Date(now.getTime() - ORPHAN_GRACE_MS),
  );

  return { clockStarted, clockCleared, imagesDeleted, reportsPurged, orphanImagesDeleted };
}
