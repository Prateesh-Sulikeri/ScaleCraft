import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReports } from "@/db/schema";
import { requireUserId } from "@/db/sync/auth";
import { getBugImage } from "@/bugs/image-storage";

/**
 * Serves a bug's attachment as real image bytes so the details view can point
 * an <img> straight at this URL. Ownership is proved against the bug row
 * first, then again inside getBugImage - the ref is opaque and unguessable,
 * but neither of those is the thing keeping another user out.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const { id } = await params;
  const [row] = await getDb()
    .select({ imageRef: bugReports.imageRef })
    .from(bugReports)
    .where(and(eq(bugReports.id, id), eq(bugReports.userId, userId)))
    .limit(1);

  if (!row?.imageRef) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const image = await getBugImage(userId, row.imageRef);
  if (!image) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(image.bytes), {
    headers: {
      "content-type": image.mimeType,
      // Private: this is one user's screenshot, and it never changes once
      // written, so the browser may keep it but no shared cache may.
      "cache-control": "private, max-age=3600, immutable",
    },
  });
}
