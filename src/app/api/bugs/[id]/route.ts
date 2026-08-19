import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { asCategory, asPriority, asStatus, type BugDetail } from "@/bugs/types";

/**
 * One bug's full record. Scoped by userId in the WHERE clause rather than
 * fetched-then-checked, so another user's id returns an ordinary 404 and does
 * not confirm the row exists.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const [row] = await getDb()
    .select()
    .from(bugReports)
    .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const bug: BugDetail = {
    id: row.id,
    category: asCategory(row.category),
    title: row.title,
    description: row.description,
    closingNotes: row.closingNotes,
    priority: asPriority(row.priority),
    status: asStatus(row.status),
    createdAt: row.createdAt.getTime(),
    updatedAt: row.updatedAt.getTime(),
    // Reported as it is at read time: marking it seen is a separate POST the
    // details view makes once it has actually rendered the update.
    unread: row.seenStatus !== row.status,
    // The ref itself never leaves the server - the client only needs to know
    // whether to request /image.
    hasImage: row.imageRef != null,
    pagePath: row.pagePath,
    appVersion: row.appVersion,
  };

  return NextResponse.json({ bug });
}
