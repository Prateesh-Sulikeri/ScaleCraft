import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";
import { requireUserId } from "@/db/sync/auth";
import {
  STREAK_DAYS_KEY,
  decodeStreakDays,
  encodeStreakDays,
  mergeStreakDays,
} from "@/persistence/streak-days";

/**
 * The preserved active-day snapshot that survives a progress reset. Lives on
 * the Clerk user's `publicMetadata` rather than in Postgres — see
 * persistence/streak-days.ts for why that trade is worth making.
 *
 * Not under /api/sync/ deliberately: those routes all mirror a Dexie table
 * through the reconcile/dirty-flush machinery, and this has no table, no
 * SyncMeta, and no last-write-wins merge (it unions instead). Filing it there
 * would imply a contract it does not implement.
 *
 * Deliberately no DELETE. This exists precisely so that resetting progress
 * cannot destroy the streak; an endpoint that wiped it would hand back the
 * capability the whole design is built to withhold.
 */

const bodySchema = z.object({
  // Local day indices (epoch-days), not epoch-ms. Capped so a malformed or
  // hostile client cannot push an array big enough to blow Clerk's 8KB
  // metadata budget: 20,000 days is ~55 years, far past any real value, and
  // the bitmap encoding keeps even that well inside the limit.
  days: z.array(z.number().int().nonnegative()).max(20_000),
});

/** `publicMetadata`, not `privateMetadata`: a day streak is not sensitive,
 *  and public metadata rides along on the `User` object the client already
 *  loads for the UserButton — so a future read can come straight from
 *  `useUser()` with no request at all. Both are server-write-only, so this
 *  route is still the only writer either way. */
async function readDays(userId: string): Promise<number[]> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return decodeStreakDays(user.publicMetadata?.[STREAK_DAYS_KEY]);
}

export async function GET() {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  return NextResponse.json({ days: await readDays(userId) });
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (userId instanceof NextResponse) return userId;

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.message }, { status: 400 });
  }

  // Read-modify-write, because Clerk metadata updates replace rather than
  // merge — writing the incoming days straight through would drop both any
  // days another device preserved and any unrelated key sharing this
  // metadata object. `updateUserMetadata` merges at the top level, so only
  // STREAK_DAYS_KEY is touched, but the value under it still has to be
  // composed from the existing set by hand.
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const merged = mergeStreakDays(decodeStreakDays(user.publicMetadata?.[STREAK_DAYS_KEY]), parsed.data.days);

  await client.users.updateUserMetadata(userId, {
    publicMetadata: { [STREAK_DAYS_KEY]: encodeStreakDays(merged) },
  });

  return NextResponse.json({ days: merged });
}
