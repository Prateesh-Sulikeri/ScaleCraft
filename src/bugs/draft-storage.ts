"use client";

import {
  BUG_CATEGORY_LABELS,
  BUG_PRIORITY_LABELS,
  type BugCategory,
  type BugPriority,
} from "./types";

/**
 * The unsent report, kept across a close of the modal.
 *
 * The form is the one place in the app where closing a dialog can destroy
 * minutes of typing, and it is closed for the most ordinary reason there is:
 * going to take the screenshot the report is about. Losing the text there
 * teaches people to write the report somewhere else first, which is worse
 * than not having the field at all.
 *
 * localStorage rather than sessionStorage because "step away and come back"
 * includes closing the tab (or the browser) to grab the shot. The attached
 * image is deliberately not persisted - a File is not serialisable, and it is
 * the one part the user is usually leaving to go fetch anyway.
 */

const KEY = "sc-bug-draft";

export type BugDraft = {
  category: BugCategory;
  title: string;
  description: string;
  priority: BugPriority;
};

/** A draft with nothing typed in it is not a draft - only the two free-text
 *  fields count, since category and priority always have a value. */
export function isDraftEmpty(draft: BugDraft): boolean {
  return draft.title.trim().length === 0 && draft.description.trim().length === 0;
}

export function loadBugDraft(): BugDraft | null {
  if (typeof window === "undefined") return null;
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    // Private-mode / disabled storage. The form still works, it just does not
    // survive a close.
    return null;
  }
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    const value = parsed as Partial<BugDraft>;
    const draft: BugDraft = {
      // Both enums are narrowed rather than trusted: a draft written by a
      // build that had a category this one has since dropped must not put an
      // unselectable value in the <select>.
      category: value.category && value.category in BUG_CATEGORY_LABELS ? value.category : "ui",
      title: typeof value.title === "string" ? value.title : "",
      description: typeof value.description === "string" ? value.description : "",
      priority: value.priority && value.priority in BUG_PRIORITY_LABELS ? value.priority : "medium",
    };
    return isDraftEmpty(draft) ? null : draft;
  } catch {
    return null;
  }
}

export function saveBugDraft(draft: BugDraft) {
  if (typeof window === "undefined") return;
  try {
    if (isDraftEmpty(draft)) {
      localStorage.removeItem(KEY);
      return;
    }
    localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Quota or disabled storage - never worth failing a keystroke over.
  }
}

export function clearBugDraft() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignored, same reason as saveBugDraft
  }
}
