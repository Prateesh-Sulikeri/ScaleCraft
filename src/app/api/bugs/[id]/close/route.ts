import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireAuthorToken } from "@/bugs/author-auth";
import { closeBugSchema } from "@/bugs/types";

/**
 * Closes a report: sets its status and closing notes and starts the retention
 * clocks (7 days to the screenshot, 15 to the report).
 *
 * This is the author's path, not the reporter's - guarded by CRON_SECRET rather
 * than `requireUserId`, and with no ownership filter in the WHERE clause,
 * because closing someone else's report is the entire function. Every other
 * /api/bugs route does the opposite; that asymmetry is the point.
 *
 * It deletes nothing itself. With a grace window there is nothing to do in this
 * request that the nightly sweep will not do on the right day, and the sweep
 * has to handle a hand-SQL close correctly regardless - so having one code path
 * do the deleting beats two that must agree. What this route buys is an exact
 * `closedAt` (rather than one rounded up to the next sweep) and closing notes
 * written through app code. It is also the seam the eventual triage UI calls
 * instead of a shell. See .claude/docs/pending-bug-retention.md.
 *
 * `seenStatus` is deliberately untouched - leaving it behind the new status is
 * what lights up the reporter's unread badge, with no extra bookkeeping.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAuthorToken(request);
  if (unauthorized) return unauthorized;

  const parsed = closeBugSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { status, closingNotes } = parsed.data;

  const now = new Date();
  const [updated] = await getDb()
    .update(bugReports)
    .set({
      status,
      closedAt: now,
      updatedAt: now,
      // Absent from the body means "leave what is there", not "clear it" - a
      // second close that only corrects the status must not silently wipe a
      // write-up from the first.
      ...(closingNotes === undefined ? {} : { closingNotes: closingNotes ?? null }),
    })
    .where(eq(bugReports.id, (await params).id))
    .returning({ id: bugReports.id });

  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ id: updated.id, status, closedAt: now.toISOString() });
}
