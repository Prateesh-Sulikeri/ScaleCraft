import { z } from "zod";

/**
 * The one source of truth for a bug report's shape, shared by the API routes
 * and the modal. Categories/priorities/statuses are TS-owned lists validated
 * with zod rather than pg enums (see schema.ts's bugReports comment) - adding
 * a category is an edit to CATEGORY_LABELS below, with no migration.
 */

/** Ordered as they appear in the form's select. `other` stays last. */
export const BUG_CATEGORY_LABELS = {
  content: "Content bug",
  ui: "UI bug",
  save: "Save issue",
  progress: "Progress bug",
  quiz: "Quiz / exam bug",
  "design-editor": "Design Editor bug",
  account: "Authentication / account bug",
  performance: "Performance bug",
  responsive: "Mobile / responsive bug",
  other: "Other",
} as const;

export type BugCategory = keyof typeof BUG_CATEGORY_LABELS;

export const BUG_CATEGORIES = Object.keys(BUG_CATEGORY_LABELS) as BugCategory[];

export const BUG_PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export type BugPriority = keyof typeof BUG_PRIORITY_LABELS;

export const BUG_PRIORITIES = Object.keys(BUG_PRIORITY_LABELS) as BugPriority[];

/** No user-facing writer yet - every report starts `open` and only an author-
 *  side tool (which does not exist) moves it. Modelled now so adding that tool
 *  never has to touch the table. */
export const BUG_STATUS_LABELS = {
  open: "Open",
  "in-progress": "In progress",
  resolved: "Resolved",
  closed: "Closed",
} as const;

export type BugStatus = keyof typeof BUG_STATUS_LABELS;

export const DEFAULT_BUG_STATUS: BugStatus = "open";

/** The status the reporter is treated as having already seen the moment they
 *  file - a brand new report is not an unread update about itself. */
export const DEFAULT_SEEN_STATUS: BugStatus = DEFAULT_BUG_STATUS;

/** A closed bug is the only "finished" state - everything else is still
 *  moving, and the list's identifier dot only distinguishes those two. */
export function isBugActive(status: BugStatus): boolean {
  return status !== "closed";
}

/** The statuses that put a report on the retention clock: its screenshot is
 *  deleted on arrival here and the whole report 15 days later. See
 *  src/bugs/retention.ts.
 *
 *  Deliberately wider than `isBugActive` above, which stays as it is. The two
 *  answer different questions - "is this outstanding work" (which drives the
 *  list's dot colour) vs. "is this done being evidence" - and a resolved
 *  report is the case where they diverge. */
export const TERMINAL_BUG_STATUSES = ["resolved", "closed"] as const satisfies BugStatus[];

export function isBugTerminal(status: BugStatus): boolean {
  return (TERMINAL_BUG_STATUSES as readonly BugStatus[]).includes(status);
}

/** How long a terminal report survives before it is deleted outright. Days
 *  rather than a duration in ms because it is a stated policy the reporter
 *  reads in the details view, not a tuning knob. */
export const BUG_RETENTION_DAYS = 15;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a report closed at `closedAt` will be deleted, or null while it is
 *  still active. Server-side so the date the reporter is shown is the same
 *  one the sweep will act on, on every device. */
export function bugDeletesAt(closedAt: Date | null): Date | null {
  return closedAt ? new Date(closedAt.getTime() + BUG_RETENTION_DAYS * DAY_MS) : null;
}

/** The other end of the same rule: a report whose `closedAt` is before this is
 *  due for deletion. Kept next to `bugDeletesAt` rather than inlined in the
 *  sweep so the date the reporter was promised and the date the purge acts on
 *  cannot drift apart. */
export function bugRetentionCutoff(now: Date): Date {
  return new Date(now.getTime() - BUG_RETENTION_DAYS * DAY_MS);
}

export const TITLE_MAX = 120;
export const DESCRIPTION_MAX = 4000;

/** 2 MB, matching the feedback survey's attachment budget (home/feedback.ts).
 *  Measured on the raw file, not its base64 expansion - what the user picked
 *  in the file dialog is the number they can reason about. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

const categorySchema = z.enum(BUG_CATEGORIES as [BugCategory, ...BugCategory[]]);
const prioritySchema = z.enum(BUG_PRIORITIES as [BugPriority, ...BugPriority[]]);

/** The image travels as base64 rather than multipart: it is optional, capped
 *  at 2 MB, and one JSON body keeps the create path a single request with a
 *  single failure mode. The route hands it to image-storage.ts and never
 *  looks at the bytes itself. */
export const bugImageSchema = z.object({
  mimeType: z.string().regex(/^image\/[a-z0-9.+-]+$/i, "Attachment must be an image"),
  /** Base64 with no `data:` prefix. Capped at the base64-expanded equivalent
   *  of MAX_IMAGE_BYTES (4/3 + padding) so an oversized body is rejected
   *  before it is ever decoded. */
  dataBase64: z.string().min(1).max(Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 1024),
});

/** `userId` is deliberately absent - it comes from the session, never the
 *  body. Same rule as src/db/sync/schemas.ts. `status` is absent too: a
 *  reporter does not get to declare their own bug resolved. */
export const createBugSchema = z.object({
  category: categorySchema,
  title: z.string().trim().min(1).max(TITLE_MAX),
  description: z.string().trim().min(1).max(DESCRIPTION_MAX),
  priority: prioritySchema,
  image: bugImageSchema.nullish(),
  pagePath: z.string().max(512).nullish(),
  appVersion: z.string().max(64).nullish(),
});

export type CreateBugInput = z.infer<typeof createBugSchema>;

/** Body of POST /api/bugs/[id]/close - the author-side triage write. Only the
 *  two terminal statuses are accepted: this route's job is to *finish* a
 *  report (and drop its screenshot on the way), and reopening one is a plain
 *  UPDATE that the nightly sweep already picks up. `seenStatus` is absent
 *  because leaving it alone is exactly what raises the reporter's badge. */
export const closeBugSchema = z.object({
  status: z.enum(TERMINAL_BUG_STATUSES),
  closingNotes: z.string().trim().max(DESCRIPTION_MAX).nullish(),
});

export type CloseBugInput = z.infer<typeof closeBugSchema>;

/** What GET /api/bugs returns per row - enough to identify a bug in the list
 *  without shipping every description. */
export type BugSummary = {
  id: string;
  category: BugCategory;
  title: string;
  priority: BugPriority;
  status: BugStatus;
  createdAt: number;
  /** The status moved since the reporter last opened this report. Server-
   *  derived (`seenStatus <> status`) rather than computed client-side, so
   *  the badge is the same on every device. */
  unread: boolean;
};

/** What GET /api/bugs/[id] returns. `hasImage` rather than the image itself:
 *  the bytes come from /api/bugs/[id]/image on demand, so opening a detail
 *  view is never a 2 MB JSON payload. */
export type BugDetail = BugSummary & {
  description: string;
  /** The author's closing write-up, null until one is written. The details
   *  view renders nothing at all in that case - an empty "Closing notes"
   *  heading reads as a bug in the app rather than an untriaged report. */
  closingNotes: string | null;
  updatedAt: number;
  hasImage: boolean;
  /** When this report will be deleted outright, or null while it is still
   *  active. Sent so the details view can state the date rather than leave
   *  the reporter to discover the deletion - the retention rule is announced,
   *  not enforced quietly. */
  deletesAt: number | null;
  /** When this report's attachment was deleted on close, or null if it never
   *  had one. `hasImage: false` alone cannot tell those apart. */
  imageRemovedAt: number | null;
  pagePath: string | null;
  appVersion: string | null;
};

/** Narrows a DB text column back to its union, falling back rather than
 *  throwing - a row written by a future build with a category this one does
 *  not know about should still render. */
export function asCategory(value: string): BugCategory {
  return (value in BUG_CATEGORY_LABELS ? value : "other") as BugCategory;
}

export function asPriority(value: string): BugPriority {
  return (value in BUG_PRIORITY_LABELS ? value : "medium") as BugPriority;
}

export function asStatus(value: string): BugStatus {
  return (value in BUG_STATUS_LABELS ? value : "open") as BugStatus;
}
