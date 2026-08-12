import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { savedGraphs } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { savesBodySchema } from "@/db/sync/schemas";

/**
 * Cloud sync for the Dexie `saves` table (src/persistence/db.ts), scoped by
 * `scopeId` (SANDBOX_SAVE_ID or chapterSaveId(id)). `id` is derived
 * server-side as `${userId}:${scopeId}` — deterministic and never trusted
 * from the client — so POST is a plain upsert keyed on it.
 */

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const scopeId = new URL(request.url).searchParams.get("scopeId");
  if (!scopeId) {
    return NextResponse.json({ error: "scopeId is required" }, { status: 400 });
  }

  const db = getDb();
  const [row] = await db
    .select()
    .from(savedGraphs)
    .where(and(eq(savedGraphs.userId, userId), eq(savedGraphs.scopeId, scopeId)))
    .limit(1);

  if (!row) return NextResponse.json({ save: null });
  return NextResponse.json({
    save: { scopeId: row.scopeId, canvasState: row.canvasState, updatedAt: row.updatedAt.getTime() },
  });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const scopeId = new URL(request.url).searchParams.get("scopeId");
  if (!scopeId) {
    return NextResponse.json({ error: "scopeId is required" }, { status: 400 });
  }

  const db = getDb();
  await db.delete(savedGraphs).where(and(eq(savedGraphs.userId, userId), eq(savedGraphs.scopeId, scopeId)));

  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = savesBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { scopeId, canvasState } = parsed.data;
  const id = `${userId}:${scopeId}`;

  const db = getDb();
  const updatedAt = new Date();
  await db
    .insert(savedGraphs)
    .values({ id, userId, scopeId, canvasState, updatedAt })
    .onConflictDoUpdate({ target: savedGraphs.id, set: { canvasState, updatedAt } });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}
