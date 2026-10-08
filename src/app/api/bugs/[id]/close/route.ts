import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireAuthorToken } from "@/bugs/author-auth";
import { closeBugSchema } from "@/bugs/types";

/**
 * Closes a report: sets its status, closing notes and `closedAt`.
 *
 * This is the author's path, not the reporter's - guarded by CRON_SECRET rather
 * than `requireUserId`, and with no ownership filter in the WHERE clause,
 * because closing someone else's report is the entire function. Every other
 * /api/bugs route does the opposite; that asymmetry is the point.
 *
 * It deletes nothing. Automatic cleanup was removed 2026-10-01 pending a
 * redesign, see .claude/docs/pending-bug-retention.md.
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
