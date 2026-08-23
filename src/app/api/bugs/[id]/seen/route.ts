import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { countUnreadBugs } from "@/bugs/unread-count";

/**
 * Acknowledges a status change: copies `status` into `seenStatus`, which is
 * what clears this report's share of the badge.
 *
 * A POST rather than a side effect of GET /api/bugs/[id] - reading a report
 * must stay safe to retry, and a prefetch or a double-render would otherwise
 * silently mark an update read that nobody saw.
 *
 * `updatedAt` is deliberately not bumped: this is the reporter looking, not
 * the report changing, and "Last updated" means the latter.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  // Ownership in the WHERE clause, same rule as every other bug route: a
  // foreign id updates nothing and returns the caller's own unchanged count.
  await getDb()
    .update(bugReports)
    .set({ seenStatus: bugReports.status })
    .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)));

  return NextResponse.json({ count: await countUnreadBugs(userId) });
}
