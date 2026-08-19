"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { LATEST_RELEASE } from "@/home/release-info";
import { ImageAttachField } from "./ImageAttachField";
import { createBug, readImageAsBase64 } from "./client";
import { clearBugDraft, loadBugDraft, saveBugDraft } from "./draft-storage";
import {
  BUG_CATEGORIES,
  BUG_CATEGORY_LABELS,
  BUG_PRIORITIES,
  BUG_PRIORITY_LABELS,
  DESCRIPTION_MAX,
  TITLE_MAX,
  type BugCategory,
  type BugPriority,
  type BugSummary,
} from "./types";

/** Same version string the feedback survey reports (home/feedback.ts
 *  collectContext) - the changelog head, not VERSION, because that is the
 *  build a user can actually name back to you. */
const APP_VERSION = LATEST_RELEASE.version;

const inputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors duration-150 ease-out focus:border-foreground/40";

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

/**
 * Category, title, description, priority, one optional screenshot.
 *
 * One description field rather than the what-happened/what-you-expected
 * triple: three boxes is three chances to abandon the form, and a reporter
 * who has something to say about all three says it in one box anyway. The
 * placeholder prompts for the parts that matter instead.
 *
 * On failure the entered values are untouched - the error renders beside a
 * still-live form, never in place of it. That is the whole reason this holds
 * its own state rather than unmounting into a result screen.
 *
 * Closing the modal does not lose the report either: what is typed is
 * mirrored into a draft (draft-storage.ts) and restored the next time the
 * form opens. Leaving mid-report to take the screenshot is the normal way to
 * write one of these, not an edge case. Only submitting or an explicit
 * Discard clears it - Cancel is the deliberate "I am not filing this", and
 * everything else is an interruption.
 */
export function BugForm({
  onSubmitted,
  onCancel,
}: {
  onSubmitted: (bug: BugSummary) => void;
  onCancel: () => void;
}) {
  const pathname = usePathname();

  // Read once, at mount. `useState(loadBugDraft)` rather than an effect: the
  // restored values have to be the fields' initial state, or the form paints
  // empty for a frame and a fast typist races the restore.
  const [restored] = useState(loadBugDraft);

  const [category, setCategory] = useState<BugCategory>(restored?.category ?? "ui");
  const [title, setTitle] = useState(restored?.title ?? "");
  const [description, setDescription] = useState(restored?.description ?? "");
  const [priority, setPriority] = useState<BugPriority>(restored?.priority ?? "medium");
  // Dismissing the notice does not touch the draft - it says "yes, I know",
  // not "throw it away". Discard is the button that does that.
  const [noticeShown, setNoticeShown] = useState(restored != null);
  const [image, setImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Validation messages appear only after a submit attempt - flagging an
  // empty title the moment the field is touched scolds someone who has not
  // finished typing yet.
  const [attempted, setAttempted] = useState(false);

  // Mirrors every keystroke into storage. Cheap enough not to debounce (one
  // small JSON string), and debouncing would reintroduce the exact window
  // this closes: text typed in the last N ms lost to a close.
  useEffect(() => {
    saveBugDraft({ category, title, description, priority });
  }, [category, title, description, priority]);

  const discardDraft = () => {
    setCategory("ui");
    setTitle("");
    setDescription("");
    setPriority("medium");
    setImage(null);
    setAttempted(false);
    setNoticeShown(false);
    clearBugDraft();
  };

  const titleValid = title.trim().length > 0;
  const descriptionValid = description.trim().length > 0;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    if (!titleValid || !descriptionValid) return;
    // The guard that makes a double-click (or a second Enter) a no-op rather
    // than a second bug row.
    if (submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const encoded = image ? await readImageAsBase64(image) : null;
      const bug = await createBug({
        category,
        title: title.trim(),
        description: description.trim(),
        priority,
        image: encoded,
        pagePath: pathname,
        appVersion: APP_VERSION,
      });
      clearBugDraft();
      onSubmitted(bug);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your report.");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {noticeShown && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-md border border-border bg-foreground/[0.03] px-3 py-2"
        >
          <p className="text-sm text-foreground/70">Restored the report you had not sent yet.</p>
          <button
            type="button"
            onClick={discardDraft}
            className="shrink-0 text-sm font-medium text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground"
          >
            Discard
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bug-category">Category</Label>
          <select
            id="bug-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as BugCategory)}
            className={inputClass}
          >
            {BUG_CATEGORIES.map((value) => (
              <option key={value} value={value}>
                {BUG_CATEGORY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="bug-priority">Priority</Label>
          <select
            id="bug-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as BugPriority)}
            className={inputClass}
          >
            {BUG_PRIORITIES.map((value) => (
              <option key={value} value={value}>
                {BUG_PRIORITY_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-title">Title</Label>
        <input
          id="bug-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          placeholder="Progress resets after refreshing the chapter"
          aria-invalid={attempted && !titleValid}
          className={inputClass}
        />
        {attempted && !titleValid && <p className="text-xs text-state-error">A title is required.</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bug-description">Description</Label>
        <textarea
          id="bug-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={DESCRIPTION_MAX}
          rows={6}
          placeholder="What you were doing, what you expected, and what happened instead. Steps to reproduce it help most."
          aria-invalid={attempted && !descriptionValid}
          className={`${inputClass} resize-y leading-relaxed`}
        />
        {attempted && !descriptionValid && (
          <p className="text-xs text-state-error">A description is required.</p>
        )}
      </div>

      <ImageAttachField image={image} onChange={setImage} />

      {error && <p className="text-sm text-state-error">{error}</p>}

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <button
          type="button"
          onClick={() => {
            // Cancel is the explicit "not filing this", so it is also the one
            // navigation that drops the draft.
            clearBugDraft();
            onCancel();
          }}
          disabled={submitting}
          className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 transition-colors duration-150 ease-out hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-md border border-foreground/20 bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity duration-150 ease-out hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {submitting ? "Submitting…" : "Submit report"}
        </button>
      </div>
    </form>
  );
}
