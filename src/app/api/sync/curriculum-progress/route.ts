import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { curriculumProgress } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { curriculumProgressBodySchema } from "@/db/sync/schemas";

function serialize(row: typeof curriculumProgress.$inferSelect) {
  return {
    slug: row.slug,
    manuallyCompletedAt: row.manuallyCompletedAt?.getTime() ?? null,
    lastVisitedAt: row.lastVisitedAt?.getTime() ?? null,
    updatedAt: row.updatedAt.getTime(),
  };
}

/**
 * Cloud sync for the Dexie `curriculumProgress` table. With `?slug=`,
 * returns that one row. Without it, returns every row for the user
 * (progress-store's bulk hydrate() on first load).
 */

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const slug = new URL(request.url).searchParams.get("slug");
  const db = getDb();

  if (!slug) {
    const rows = await db.select().from(curriculumProgress).where(eq(curriculumProgress.userId, userId));
    return NextResponse.json({ progress: rows.map(serialize) });
  }

  const [row] = await db
    .select()
    .from(curriculumProgress)
    .where(and(eq(curriculumProgress.userId, userId), eq(curriculumProgress.slug, slug)))
    .limit(1);

  return NextResponse.json({ progress: row ? serialize(row) : null });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = curriculumProgressBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { slug, manuallyCompletedAt, lastVisitedAt } = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  const manuallyCompletedAtDate = manuallyCompletedAt !== null ? new Date(manuallyCompletedAt) : null;
  const lastVisitedAtDate = lastVisitedAt !== null ? new Date(lastVisitedAt) : null;
  await db
    .insert(curriculumProgress)
    .values({
      userId,
      slug,
      manuallyCompletedAt: manuallyCompletedAtDate,
      lastVisitedAt: lastVisitedAtDate,
      updatedAt,
    })
    .onConflictDoUpdate({
      target: [curriculumProgress.userId, curriculumProgress.slug],
      set: { manuallyCompletedAt: manuallyCompletedAtDate, lastVisitedAt: lastVisitedAtDate, updatedAt },
    });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}
