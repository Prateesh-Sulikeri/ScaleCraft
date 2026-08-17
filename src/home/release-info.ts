import { releaseNotes } from "@/content/release-notes";

/** Most recent first (see content/release-notes.ts), so the head is current. */
export const LATEST_RELEASE = releaseNotes[0];

/** How long a release keeps its "NEW" marker. There is no per-user "have you
 *  read the changelog" record - and inventing one for a marker this small
 *  isn't worth a synced table - so freshness is plain recency. */
export const RELEASE_NEW_FOR_DAYS = 21;

/** `dateISO` is the `YYYY-MM-DD` string release notes carry. An unparseable
 *  date is treated as not-new rather than throwing on a typo in content. */
export function isRecentRelease(dateISO: string, now: number, withinDays: number = RELEASE_NEW_FOR_DAYS): boolean {
  const released = Date.parse(`${dateISO}T00:00:00Z`);
  if (Number.isNaN(released)) return false;
  const ageDays = (now - released) / 86_400_000;
  return ageDays >= 0 && ageDays <= withinDays;
}
