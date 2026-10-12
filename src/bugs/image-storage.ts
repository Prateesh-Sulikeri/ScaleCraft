import { and, eq } from "drizzle-orm";
import { getDb } from "@/db/client";
import { bugReportImages } from "@/db/schema";
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
