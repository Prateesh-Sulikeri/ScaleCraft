import { MAX_IMAGE_BYTES } from "./types";

/**
 * Turning whatever the browser hands us - a file picker, a drop, a clipboard
 * paste - into either one accepted image or one reason it was refused. Pure,
 * so the three entry points share exactly one set of rules and none of it
 * needs a real drag or a real clipboard to test.
 */

export type ImageRejection = "not-an-image" | "too-large";

export const IMAGE_REJECTION_MESSAGE: Record<ImageRejection, string> = {
  "not-an-image": "That is not an image. Attach a screenshot instead.",
  "too-large": `Images have to be under ${formatBytes(MAX_IMAGE_BYTES)}.`,
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export type ImageAccept = { file: File; rejection: null } | { file: null; rejection: ImageRejection | null };

/** One image, not a list: the form takes a single attachment, and quietly
 *  keeping the first of five dropped files would be worse than saying so.
 *  A `null` input is "nothing happened" - no file, no complaint. */
export function acceptImage(file: File | null | undefined): ImageAccept {
  if (!file) return { file: null, rejection: null };
  if (!file.type.startsWith("image/")) return { file: null, rejection: "not-an-image" };
  if (file.size > MAX_IMAGE_BYTES) return { file: null, rejection: "too-large" };
  return { file, rejection: null };
}

/**
 * The first image in a clipboard or drop payload.
 *
 * `files` covers a screen snip in every current browser and a drag from the
 * file system. The `items` sweep behind it is the fallback for clipboard
 * payloads that expose the bitmap only as a data-transfer item - and it is
 * also what filters out a plain-text paste, which arrives with an empty
 * `files` list and a `text/plain` item, so this returns null and the paste
 * lands in the textarea untouched.
 */
export function imageFromTransfer(data: DataTransfer | null | undefined): File | null {
  if (!data) return null;

  for (const file of Array.from(data.files ?? [])) {
    if (file.type.startsWith("image/")) return file;
  }

  for (const item of Array.from(data.items ?? [])) {
    if (item.kind !== "file" || !item.type.startsWith("image/")) continue;
    const file = item.getAsFile();
    if (file) return file;
  }

  return null;
}

/** True when a drag is carrying files at all - `dragover` exposes types but
 *  not contents, so this is the most the browser will tell us before the
 *  drop. Used only to decide whether to light up the drop zone. */
export function dragCarriesFiles(data: DataTransfer | null | undefined): boolean {
  return Array.from(data?.types ?? []).includes("Files");
}
