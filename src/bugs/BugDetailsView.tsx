"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import {
  CategoryChip,
  PriorityChip,
  StatusChip,
  StatusDot,
  formatBugDateTime,
  formatBugFullDate,
} from "./BugChips";
import { bugImageUrl, fetchBug, markBugSeen } from "./client";
import { setUnreadBugCount } from "./unread-badge-store";
import { BUG_IMAGE_RETENTION_DAYS, BUG_RETENTION_DAYS, type BugDetail } from "./types";

/** One label/value row. Values stay `text-foreground/70` so the field names
 *  and the values do not compete for the same weight. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">{label}</p>
      <div className="text-sm text-foreground/80">{children}</div>
    </div>
  );
}

/**
 * A single report, fetched on open rather than carried over from the list -
 * the list only holds summaries, and refetching is also what makes the status
 * shown here current rather than as-of-last-list-load.
 */
export function BugDetailsView({
  bugId,
  onBack,
  onSeen,
}: {
  bugId: string;
  onBack: () => void;
  /** Lets the modal drop the row's unread marker without refetching the list
   *  it already holds. */
  onSeen?: (id: string) => void;
}) {
  const [bug, setBug] = useState<BugDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // No state reset here on a bugId change: the modal keys this component on
  // the id, so a different bug is a fresh mount that starts from the initial
  // state already. Resetting in the effect body instead would be a synchronous
  // setState inside an effect - a cascading render the lint rule rightly
  // flags, and unnecessary given the key.
  useEffect(() => {
    const controller = new AbortController();
    fetchBug(bugId, controller.signal)
      .then((next) => {
        setBug(next);
        // Acknowledging happens here, after the update has actually been
        // rendered to the person it is for - not on the GET, which has to
        // stay safe for a prefetch or a re-render to repeat.
        if (!next.unread) return;
        markBugSeen(next.id)
          .then((count) => {
            setUnreadBugCount(count);
            onSeen?.(next.id);
          })
          // A failed acknowledgement is not worth an error state over the
          // report the user came to read: the badge simply stays up and the
          // next open retries it.
          .catch(() => {});
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Could not load this bug.");
      });
    return () => controller.abort();
  }, [bugId, onSeen]);

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        All reports
      </button>

      {error ? (
        <p className="text-sm text-state-error">{error}</p>
      ) : !bug ? (
        <div className="flex items-center gap-2 py-8 text-sm text-foreground/60">
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          Loading report…
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <StatusDot status={bug.status} />
              <h3 className="text-base font-semibold text-foreground">{bug.title}</h3>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <CategoryChip category={bug.category} />
              <PriorityChip priority={bug.priority} />
              <StatusChip status={bug.status} />
            </div>
          </div>

          {/* Rendered only when the author has written one - the section is
              the answer to "what happened to my report?", and an empty one
              would pose the question without answering it. Above the
              description on purpose: it is the new information on the page,
              and the reporter already knows what they typed. */}
          {bug.closingNotes && (
            <div className="flex flex-col gap-1.5 rounded-md border border-border bg-foreground/[0.03] px-3 py-2.5">
              <p className="text-[11px] font-semibold tracking-wide text-foreground/45 uppercase">Closing notes</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/80">{bug.closingNotes}</p>
            </div>
          )}

          {/* The retention rule is stated, never discovered. A reporter whose
              report disappears on day 15 has to have been told the date, and
              told that reading it changes nothing - that was the explicit
              product call, not an inference from it. Sits directly under the
              closing notes because "here is the resolution" and "here is how
              long it stays" are one thought. */}
          {bug.deletesAt != null && (
            <p className="text-xs leading-relaxed text-foreground/55">
              This report will be deleted on {formatBugFullDate(bug.deletesAt)}. Closed reports are
              removed {BUG_RETENTION_DAYS} days after closing, whether or not they have been read.
            </p>
          )}

          <Field label="Description">
            {/* whitespace-pre-wrap, not a markdown render: this is the
                reporter's own typed text, and their line breaks are the only
                structure it has. */}
            <p className="whitespace-pre-wrap leading-relaxed">{bug.description}</p>
          </Field>

          {/* Where the screenshot used to be, which is where the question
              "what happened to it?" actually gets asked. Only rendered off
              imageRemovedAt - a report that never had an attachment must not
              be told about one. */}
          {!bug.hasImage && bug.imageRemovedAt != null && (
            <Field label="Attachment">
              <p className="text-foreground/55">
                Removed on {formatBugFullDate(bug.imageRemovedAt)},
                {" "}{BUG_IMAGE_RETENTION_DAYS} days after this report was closed.
              </p>
            </Field>
          )}

          {bug.hasImage && (
            <Field label="Attachment">
              {/* Plain <img>, not next/image: the bytes come from an
                  authenticated API route with no known dimensions, which is
                  exactly what the optimizer cannot help with. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={bugImageUrl(bug.id)}
                alt={`Screenshot attached to "${bug.title}"`}
                className="max-h-72 w-auto rounded-md border border-border object-contain"
              />
              {/* The same "stated, never discovered" rule as the report notice
                  above, while there is still something to state. A closed
                  report shows its remaining window under the screenshot it is
                  about to lose; an active one shows nothing, because no clock
                  is running. */}
              {bug.imageDeletesAt != null && (
                <p className="mt-1.5 text-xs leading-relaxed text-foreground/55">
                  This screenshot will be removed on {formatBugFullDate(bug.imageDeletesAt)},
                  {" "}{BUG_IMAGE_RETENTION_DAYS} days after closing. The report itself stays until{" "}
                  {bug.deletesAt != null && formatBugFullDate(bug.deletesAt)}.
                </p>
              )}
            </Field>
          )}

          <div className="grid grid-cols-1 gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <Field label="Reported">{formatBugDateTime(bug.createdAt)}</Field>
            {bug.updatedAt !== bug.createdAt && (
              <Field label="Last updated">{formatBugDateTime(bug.updatedAt)}</Field>
            )}
            {bug.pagePath && (
              <Field label="Page">
                <code className="font-mono text-xs text-foreground/70">{bug.pagePath}</code>
              </Field>
            )}
            {bug.appVersion && <Field label="Version">{bug.appVersion}</Field>}
          </div>
        </div>
      )}
    </div>
  );
}
