import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

/**
 * The guard on the two author-side bug routes (the retention cron and the close
 * endpoint). Deliberately not `requireUserId`: closing somebody else's report
 * and purging every user's expired rows are the whole point of these routes, so
 * a Clerk session is the wrong credential entirely.
 *
 * `CRON_SECRET` is the same variable Vercel sends as `Authorization: Bearer ...`
 * on every cron invocation, so the cron route needs no special case - it
 * authenticates exactly like a manual call does.
 */

/** Fails closed when the secret is unset. An unconfigured deployment must not
 *  expose a route that deletes rows to anyone who finds the path - and the cron
 *  cannot authenticate without it either, so allowing it through would buy
 *  nothing. */
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
