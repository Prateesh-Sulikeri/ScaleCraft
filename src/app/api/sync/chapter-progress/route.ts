import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { chapterProgress } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { chapterProgressBodySchema } from "@/db/sync/schemas";

function serialize(row: typeof chapterProgress.$inferSelect) {
  return {
    chapterId: row.chapterId,
    completedAt: row.completedAt.getTime(),
    matchedBlueprintId: row.matchedBlueprintId,
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Cloud sync for the Dexie `chapterProgress` table. With `?chapterId=`,
 * returns that one row (ChapterWorkspace's per-chapter hydrate-on-empty).
 * Without it, returns every row for the user (progress-store's bulk
 * hydrate() on first load).
 */

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  const db = getDb();

  if (!chapterId) {
    const rows = await db.select().from(chapterProgress).where(eq(chapterProgress.userId, userId));
    return NextResponse.json({ progress: rows.map(serialize) });
  }

  const [row] = await db
    .select()
    .from(chapterProgress)
    .where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.chapterId, chapterId)))
    .limit(1);

  return NextResponse.json({ progress: row ? serialize(row) : null });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const chapterId = new URL(request.url).searchParams.get("chapterId");
  if (!chapterId) {
    return NextResponse.json({ error: "chapterId is required" }, { status: 400 });
  }

  const db = getDb();
  await db
    .delete(chapterProgress)
    .where(and(eq(chapterProgress.userId, userId), eq(chapterProgress.chapterId, chapterId)));

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = chapterProgressBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { chapterId, completedAt, matchedBlueprintId } = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  const completedAtDate = new Date(completedAt);
  await db
    .insert(chapterProgress)
    .values({ userId, chapterId, completedAt: completedAtDate, matchedBlueprintId, updatedAt })
    .onConflictDoUpdate({
      target: [chapterProgress.userId, chapterProgress.chapterId],
      set: { completedAt: completedAtDate, matchedBlueprintId, updatedAt },
    });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}
