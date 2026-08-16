import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/**
 * Every /api/sync/* route is a Route Handler, not a page under
 * src/app/(protected)/ — so it isn't covered by that route group's
 * auth.protect() layout (route groups only gate pages, not src/app/api/).
 * Each sync route must check auth itself; this is the shared check.
 */
export async function requireUserId(): Promise<string | NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return userId;
}
