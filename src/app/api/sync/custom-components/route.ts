import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { customComponents } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { customComponentBodySchema } from "@/db/sync/schemas";

/**
 * Cloud sync for the Dexie `customComponents` table (src/persistence/db.ts)
 * — the user's whole custom-component palette, not scoped to a single save.
 * GET returns every row for the user; POST upserts one component keyed on
 * its own id (already a real client-generated crypto.randomUUID()).
 */

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const db = getDb();
  const rows = await db.select().from(customComponents).where(eq(customComponents.userId, userId));

  return NextResponse.json({
    components: rows.map((row) => ({
      id: row.id,
      category: row.category,
      label: row.label,
      icon: row.icon,
      summary: row.summary,
      docs: row.docs,
      hasInput: row.hasInput,
      hasOutput: row.hasOutput,
      fields: row.fields,
      updatedAt: row.updatedAt.getTime(),
    })),
  });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = customComponentBodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }
  const body = parsed.data;

  const db = getDb();
  const updatedAt = new Date();
  await db
    .insert(customComponents)
    .values({ ...body, userId, updatedAt })
    .onConflictDoUpdate({ target: customComponents.id, set: { ...body, updatedAt } });

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
  await db.delete(customComponents).where(and(eq(customComponents.userId, userId), eq(customComponents.id, id)));

  return NextResponse.json({ ok: true });
}
