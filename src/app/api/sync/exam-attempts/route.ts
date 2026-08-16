import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { examAttempts } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { examAttemptBodySchema } from "@/db/sync/schemas";

function serialize(row: typeof examAttempts.$inferSelect) {
  return {
    chapterDefinitionId: row.chapterDefinitionId,
    attemptNumber: row.attemptNumber,
    submittedAt: row.submittedAt.getTime(),
    score: row.score,
    answers: row.answers,
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Cloud sync for the Dexie `examAttempts` table. With `?chapterDefinitionId=`,
 * returns every attempt for that chapter (unlimited attempts per chapter).
 * Without it, returns every attempt for the user across all chapters
 * (progress-store's bulk hydrate() on first load).
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

/** Bulk delete — mirrors Dexie's `.where("chapterDefinitionId").equals(id).delete()`
 * in progress-store.ts's resetChapter. */
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
  const { chapterDefinitionId, attemptNumber, submittedAt, score, answers } = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  const submittedAtDate = new Date(submittedAt);
  await db
    .insert(examAttempts)
    .values({ userId, chapterDefinitionId, attemptNumber, submittedAt: submittedAtDate, score, answers, updatedAt })
    .onConflictDoUpdate({
      target: [examAttempts.userId, examAttempts.chapterDefinitionId, examAttempts.attemptNumber],
      set: { submittedAt: submittedAtDate, score, answers, updatedAt },
    });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}
