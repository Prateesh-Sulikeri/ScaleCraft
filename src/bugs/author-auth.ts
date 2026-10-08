import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * The guard on the author-side close route. Deliberately not `requireUserId`:
 * closing somebody else's report is the whole point, so a Clerk session is the
 * wrong credential. The variable keeps its `CRON_SECRET` name from the removed
 * retention cron.
 */

/** Fails closed when the secret is unset, so an unconfigured deployment never
 *  exposes an author-only write. */
export function requireAuthorToken(request: Request): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured." }, { status: 503 });
  }

  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  const presented = header.startsWith(prefix) ? header.slice(prefix.length) : "";

  if (!matches(presented, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

/** Length is compared first because timingSafeEqual throws on a mismatch
 *  rather than returning false. That leaks the secret's length, which is not
 *  the secret. */
function matches(presented: string, secret: string): boolean {
  const a = Buffer.from(presented);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}
