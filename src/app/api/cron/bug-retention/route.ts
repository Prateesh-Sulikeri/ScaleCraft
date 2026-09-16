import { NextResponse } from "next/server";
import { requireAuthorToken } from "@/bugs/author-auth";
import { runBugRetentionSweep } from "@/bugs/retention";

/**
 * The nightly bug-report cleanup, scheduled from vercel.json's `crons` entry.
 * See .claude/docs/pending-bug-retention.md for what each step does and why
 * they run in that order.
 *
 * A thin caller by design - every rule lives in src/bugs/retention.ts so it can
 * be tested without an HTTP round trip, and so the close route can reuse one
 * step of it.
 *
 * GET because that is what Vercel Cron issues. It is not a safe method here,
 * which is a wart of that contract rather than a choice; re-running it is
 * harmless because every step is idempotent.
 */
export async function GET(request: Request) {
  const unauthorized = requireAuthorToken(request);
  if (unauthorized) return unauthorized;

  const result = await runBugRetentionSweep();
  // Echoed back rather than logged silently: this is the only visibility into a
  // job whose whole output is rows that no longer exist.
  return NextResponse.json(result);
}
