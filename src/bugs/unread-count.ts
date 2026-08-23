import { and, count, eq, ne } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";

/**
 * How many of a user's reports have moved since they last looked - the number
 * on the Report a Bug badge.
 *
 * Server-side only (it touches the db), shared by the badge endpoint and the
 * mark-seen endpoint so the count the client renders after acknowledging a
 * report comes from the same query that produced it, not from a client-side
 * decrement that can drift.
 *
 * "Unread" is `seenStatus <> status`, not a timestamp comparison. That keeps
 * triage a plain `UPDATE bug_reports SET status = ..., closing_notes = ...`:
 * there is no bookkeeping column an author has to remember to touch for the
 * reporter's badge to light up.
 */
export async function countUnreadBugs(userId: string): Promise<number> {
  const [row] = await getDb()
    .select({ value: count() })
    .from(bugReports)
    .where(and(eq(bugReports.userId, userId), ne(bugReports.seenStatus, bugReports.status)));
  return row?.value ?? 0;
}
