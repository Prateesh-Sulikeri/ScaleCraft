import { and, eq, isNotNull, lt, notInArray } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReportImages, bugReports } from "@/db/schema";
import { MAX_IMAGE_BYTES, type CreateBugInput } from "./types";

/**
 * The single seam between a bug report and wherever its screenshot physically
 * lives. `bugReports.imageRef` is an opaque string only this module reads or
 * writes; nothing else in the codebase parses it.
 *
 * Today it resolves to a `bug_report_images` row, because ScaleCraft has no
 * object-storage provider and adding one for an optional screenshot would be
 * a dependency bought ahead of its need. When one arrives (Vercel Blob is the
 * obvious fit given the deploy target), the swap is: mint `blob:<url>` refs in
 * putBugImage, teach getBugImage to recognise the prefix, and leave the
 * `db:` branch in place for rows already written. No route contract, no
 * client code, and no bug record changes.
 *
 * Deletion lives here too (deleteBugImage / deleteOrphanBugImages) for exactly
 * that reason: the retention sweep in retention.ts decides *which* reports have
 * lost the right to their screenshot, and this module is the only thing that
 * knows where the bytes are. A Postgres trigger doing the same job would have
 * had to parse `db:<uuid>` in SQL and would silently stop working the day refs
 * become `blob:` - see .claude/docs/pending-bug-retention.md.
 */

const DB_REF_PREFIX = "db:";

export type StoredImage = { mimeType: string; bytes: Buffer };

type BugImageInput = NonNullable<CreateBugInput["image"]>;

/** Rejects rather than truncates - a silently half-stored screenshot is worse
 *  than a report with none. Returns the ref to persist on the bug row. */
export async function putBugImage(userId: string, image: BugImageInput): Promise<string> {
  const bytes = Buffer.from(image.dataBase64, "base64");
  if (bytes.byteLength === 0) {
    throw new Error("Attachment could not be decoded.");
  }
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new Error("Attachment is larger than the 2 MB limit.");
  }

  const id = crypto.randomUUID();
  await getDb().insert(bugReportImages).values({
    id,
    userId,
    mimeType: image.mimeType,
    data: bytes.toString("base64"),
  });

  return `${DB_REF_PREFIX}${id}`;
}

/** `userId` is a second ownership check on top of the caller's own: the image
 *  route already proved the bug belongs to this user, and this makes a future
 *  caller that forgets to fail closed rather than leak. */
export async function getBugImage(userId: string, ref: string): Promise<StoredImage | null> {
  if (!ref.startsWith(DB_REF_PREFIX)) return null;
  const id = ref.slice(DB_REF_PREFIX.length);

  const [row] = await getDb()
    .select()
    .from(bugReportImages)
    .where(and(eq(bugReportImages.id, id), eq(bugReportImages.userId, userId)))
    .limit(1);

  if (!row) return null;
  return { mimeType: row.mimeType, bytes: Buffer.from(row.data, "base64") };
}

/** Deletes the bytes behind a ref. Silent no-op on a prefix this build does
 *  not recognise: the retention sweep calls this for every terminal report, and
 *  a ref written by a future storage backend is that backend's problem to
 *  clean up, not a reason to fail the whole sweep.
 *
 *  Note the caller's ordering obligation - delete the bytes *first*, then null
 *  `imageRef`. A crash between the two leaves a dangling ref, which the image
 *  route already serves as a 404 and the next sweep retries harmlessly.
 *  Nulling the ref first would orphan the bytes with nothing left pointing at
 *  them to find them by. */
export async function deleteBugImage(ref: string): Promise<void> {
  if (!ref.startsWith(DB_REF_PREFIX)) return;
  const id = ref.slice(DB_REF_PREFIX.length);
  await getDb().delete(bugReportImages).where(eq(bugReportImages.id, id));
}

/**
 * Deletes stored images that no bug report references. These are real and
 * expected, not a theoretical leak: POST /api/bugs writes the image before the
 * bug row on purpose (see its comment - a stored image with no bug row is the
 * harmless half of that failure), so every abandoned submit leaves bytes
 * behind that nothing will ever ask for again.
 *
 * `olderThan` is not optional and callers pass something like 24h ago: without
 * an age floor this races a submit that is between its two writes and deletes
 * the attachment out from under a report being created right now.
 *
 * Building the `db:` refs here rather than in SQL keeps this module the only
 * place that knows the encoding, which is the whole point of the seam.
 */
export async function deleteOrphanBugImages(olderThan: Date): Promise<number> {
  const db = getDb();

  const referenced = await db
    .select({ imageRef: bugReports.imageRef })
    .from(bugReports)
    .where(isNotNull(bugReports.imageRef));

  const liveIds = referenced
    .map((row) => row.imageRef)
    .filter((ref): ref is string => ref != null && ref.startsWith(DB_REF_PREFIX))
    .map((ref) => ref.slice(DB_REF_PREFIX.length));

  const stale = lt(bugReportImages.createdAt, olderThan);
  // notInArray with an empty list is not valid SQL, and "no images are
  // referenced" is a legitimate state (every report closed, every attachment
  // already dropped), so the condition is dropped rather than passed empty.
  const deleted = await db
    .delete(bugReportImages)
    .where(liveIds.length === 0 ? stale : and(stale, notInArray(bugReportImages.id, liveIds)))
    .returning({ id: bugReportImages.id });

  return deleted.length;
}
