import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { putBugImage } from "@/bugs/image-storage";
import {
  asCategory,
  asPriority,
  asStatus,
  createBugSchema,
  DEFAULT_BUG_STATUS,
  DEFAULT_SEEN_STATUS,
  type BugSummary,
} from "@/bugs/types";

/**
 * The reporter's own bug list and the create endpoint. Not under /api/sync/:
 * those routes all mirror a Dexie table through reconcile/dirty-flush, and a
 * bug report has no local table and no merge semantics (see schema.ts).
 *
 * Both handlers filter on the session's userId - a user only ever sees bugs
 * they filed, and there is no query parameter that can widen that.
 */

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const rows = await getDb()
    .select({
      id: bugReports.id,
      category: bugReports.category,
      title: bugReports.title,
      priority: bugReports.priority,
      status: bugReports.status,
      seenStatus: bugReports.seenStatus,
      createdAt: bugReports.createdAt,
    })
    .from(bugReports)
    .where(eq(bugReports.userId, userId))
    .orderBy(desc(bugReports.createdAt));

  const bugs: BugSummary[] = rows.map((row) => ({
    id: row.id,
    category: asCategory(row.category),
    title: row.title,
    priority: asPriority(row.priority),
    status: asStatus(row.status),
    createdAt: row.createdAt.getTime(),
    unread: row.seenStatus !== row.status,
  }));

  return NextResponse.json({ bugs });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = createBugSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { category, title, description, priority, image, pagePath, appVersion } = parsed.data;

  // Image first: a stored image with no bug row is a harmless orphan, while a
  // bug row pointing at a ref that failed to write is a broken record the user
  // can see. The failure is reported as 400 because every way this throws is
  // something about the file the client sent.
  let imageRef: string | null = null;
  if (image) {
    try {
      imageRef = await putBugImage(userId, image);
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Attachment could not be stored." },
        { status: 400 },
      );
    }
  }

  const id = crypto.randomUUID();
  const now = new Date();
  await getDb().insert(bugReports).values({
    id,
    userId,
    category,
    title,
    description,
    priority,
    status: DEFAULT_BUG_STATUS,
    seenStatus: DEFAULT_SEEN_STATUS,
    imageRef,
    pagePath: pagePath ?? null,
    appVersion: appVersion ?? null,
    createdAt: now,
    updatedAt: now,
  });

  // Returns the summary shape so the client can prepend it to the list it
  // already holds instead of refetching (and so the new bug is visible with
  // no page refresh).
  const bug: BugSummary = {
    id,
    category,
    title,
    priority,
    status: DEFAULT_BUG_STATUS,
    createdAt: now.getTime(),
    unread: false,
  };
  return NextResponse.json({ bug }, { status: 201 });
}
