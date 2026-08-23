import { NextResponse } from "next/server";
import { requireUserId } from "@/db/sync/auth";
import { countUnreadBugs } from "@/bugs/unread-count";

/**
 * Just the badge number. Its own route rather than a field on GET /api/bugs
 * because it is fetched by every mounted Report a Bug button on page load,
 * where the full list would be an unused payload - the list is only ever
 * needed once the modal opens.
 */
export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  return NextResponse.json({ count: await countUnreadBugs(userId) });
}
