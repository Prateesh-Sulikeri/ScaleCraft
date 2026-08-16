import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { deepCheckSessions } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { deepCheckSessionBodySchema } from "@/db/sync/schemas";

/**
 * Cloud sync for the Dexie `deepCheckSessions` table, scoped by `saveId`
 * (SANDBOX_SAVE_ID or chapterSaveId(id), same slot key as saves/
 * chapterProgress). `id` is client-supplied — Dexie's local auto-increment
 * id is device-local and meaningless across devices, so whoever wires the
 * write path must assign a stable crypto.randomUUID() once per session
 * before the first sync (see schema.ts's deepCheckSessions comment). GET
 * returns the full session history for that scope.
 */

export async function GET(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const saveId = new URL(request.url).searchParams.get("saveId");
  if (!saveId) {
    return NextResponse.json({ error: "saveId is required" }, { status: 400 });
  }

  const db = getDb();
  const rows = await db
    .select()
    .from(deepCheckSessions)
    .where(and(eq(deepCheckSessions.userId, userId), eq(deepCheckSessions.saveId, saveId)));

  return NextResponse.json({
    sessions: rows.map((row) => ({
      id: row.id,
      saveId: row.saveId,
      createdAt: row.createdAt.getTime(),
      critique: row.critique,
      updatedAt: row.updatedAt.getTime(),
    })),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = deepCheckSessionBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const { id, saveId, createdAt, critique } = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  const createdAtDate = new Date(createdAt);
  await db
    .insert(deepCheckSessions)
    .values({ id, userId, saveId, createdAt: createdAtDate, critique, updatedAt })
    .onConflictDoUpdate({ target: deepCheckSessions.id, set: { saveId, createdAt: createdAtDate, critique, updatedAt } });

  return NextResponse.json({ updatedAt: updatedAt.getTime() });
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const db = getDb();
  await db.delete(deepCheckSessions).where(and(eq(deepCheckSessions.userId, userId), eq(deepCheckSessions.id, id)));

  return NextResponse.json({ ok: true });
}
