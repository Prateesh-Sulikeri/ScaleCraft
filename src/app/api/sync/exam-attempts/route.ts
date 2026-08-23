import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { examAttempts } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { examAttemptBodySchema } from "@/db/sync/schemas";

function serialize(row: typeof examAttempts.$inferSelect) {
  return {
    chapterDefinitionId: row.chapterDefinitionId,
    totalAttempts: row.totalAttempts,
    submittedAt: row.submittedAt.getTime(),
    score: row.score,
    answers: row.answers,
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Cloud sync for the Dexie `examBest` table - one row per chapter, holding
 * that chapter's best attempt and how many have been taken. With
 * `?chapterDefinitionId=` it returns that chapter's row; without it, every
 * chapter's (progress-store's bulk hydrate() on first load).
 */

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const chapterDefinitionId = new URL(request.url).searchParams.get("chapterDefinitionId");
  const db = getDb();

  const rows = await db
    .select()
    .from(examAttempts)
    .where(
      chapterDefinitionId
        ? and(eq(examAttempts.userId, userId), eq(examAttempts.chapterDefinitionId, chapterDefinitionId))
        : eq(examAttempts.userId, userId),
    );

  return NextResponse.json({ attempts: rows.map(serialize) });
}

/** Deletes a chapter's exam record - one row now, but still keyed only by
 * chapter, mirroring Dexie's delete in progress-store.ts's resetChapter. */
export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const chapterDefinitionId = new URL(request.url).searchParams.get("chapterDefinitionId");
  if (!chapterDefinitionId) {
    return NextResponse.json({ error: "chapterDefinitionId is required" }, { status: 400 });
  }

  const db = getDb();
  await db
    .delete(examAttempts)
    .where(and(eq(examAttempts.userId, userId), eq(examAttempts.chapterDefinitionId, chapterDefinitionId)));

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = examAttemptBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { chapterDefinitionId, totalAttempts, submittedAt, score, answers } = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  const submittedAtDate = new Date(submittedAt);
  // Best-preserving, not last-write-wins: the row is one slot per chapter, so
  // a device pushing a worse best (an old attempt flushed late, or one from a
  // device that never saw the better score) must not overwrite a better one.
  // The count only ever goes up. The client converges on the next pull.
  const keepIncoming = sql`excluded.score > ${examAttempts.score}`;
  await db
    .insert(examAttempts)
    .values({ userId, chapterDefinitionId, totalAttempts, submittedAt: submittedAtDate, score, answers, updatedAt })
    .onConflictDoUpdate({
      target: [examAttempts.userId, examAttempts.chapterDefinitionId],
      set: {
        totalAttempts: sql`greatest(${examAttempts.totalAttempts}, excluded.total_attempts)`,
        submittedAt: sql`case when ${keepIncoming} then excluded.submitted_at else ${examAttempts.submittedAt} end`,
        score: sql`greatest(${examAttempts.score}, excluded.score)`,
        answers: sql`case when ${keepIncoming} then excluded.answers else ${examAttempts.answers} end`,
        updatedAt,
      },
    });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}
