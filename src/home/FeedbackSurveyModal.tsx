"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, ImagePlus, Loader2, X } from "lucide-react";
import { CenteredModal } from "@/app/CenteredModal";
import { LATEST_RELEASE } from "./release-info";
import {
  acceptImages,
  collectContext,
  FEEDBACK_RECIPIENT,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  formatBytes,
  isEmailJsConfigured,
  MAX_IMAGE_BYTES_TOTAL,
  MAX_IMAGES,
  submitFeedback,
  type FeedbackContext,
  type FeedbackDelivery,
  type FeedbackQuestion,
  type ImageRejection,
} from "./feedback";

type Phase =
  | { kind: "editing" }
  | { kind: "sending" }
  | { kind: "sent"; delivery: FeedbackDelivery }
  | { kind: "error" };

const REJECTION_MESSAGE: Record<ImageRejection, string> = {
  "not-an-image": "Only image files can be attached.",
  "too-many": `Up to ${MAX_IMAGES} images.`,
  "too-large": `Images have to come to under ${formatBytes(MAX_IMAGE_BYTES_TOTAL)} in total.`,
};

/** One question: prompt, optional helper line, and its option chips. Multi-
 *  select questions cap at `maxChoices` and say so in their helper. */
function QuestionField({
  question,
  value,
  onChange,
}: {
  question: FeedbackQuestion;
  value: string | string[] | undefined;
  onChange: (next: string | string[] | undefined) => void;
}) {
  const selected = (option: string) =>
    Array.isArray(value) ? value.includes(option) : value === option;

  const toggle = (option: string) => {
    if (!question.multi) {
      // Clicking the chosen option clears it - the only way back to "no
      // answer" without reopening the dialog.
      onChange(value === option ? undefined : option);
      return;
    }
    const current = Array.isArray(value) ? value : [];
    if (current.includes(option)) {
      const next = current.filter((o) => o !== option);
      onChange(next.length > 0 ? next : undefined);
      return;
    }
    const cap = question.maxChoices ?? question.options.length;
    // At the cap, the oldest choice makes room for the new one rather than the
    // click doing nothing - a dead chip with no explanation reads as broken.
    onChange(current.length >= cap ? [...current.slice(1), option] : [...current, option]);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-medium text-foreground">{question.prompt}</legend>
      {question.helper && <p className="-mt-0.5 text-xs leading-relaxed text-foreground/45">{question.helper}</p>}
      <div className="mt-0.5 flex flex-wrap gap-2">
        {question.options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={selected(option)}
            onClick={() => toggle(option)}
            className={`rounded-md border px-3 py-1.5 text-sm transition-colors duration-150 ease-out ${
              selected(option)
                ? "border-hero-accent bg-hero-accent/12 text-hero-accent"
                : "border-border bg-panel text-foreground/70 hover:border-foreground/25 hover:text-foreground"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

/** An attached screenshot plus its preview URL. The URL is minted in the
 *  change handler rather than in an effect: creating one is a side effect on an
 *  external resource, so it belongs in the event that caused it, and deriving
 *  it in render (or setting it from an effect, which this repo lints against)
 *  would mint a fresh URL on every pass and leak the previous one. */
type Attachment = { file: File; url: string };

function ImageStrip({
  attachments,
  onRemove,
}: {
  attachments: readonly Attachment[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {attachments.map(({ file, url }, index) => (
        <li key={url} className="relative">
          <span className="flex w-28 flex-col gap-1 overflow-hidden rounded-md border border-border bg-background p-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- a blob:
             * URL for a file the visitor just picked; next/image optimizes
             * remote/static sources and cannot handle this one. */}
            <img src={url} alt={file.name} className="h-16 w-full rounded-sm object-cover" />
            <span className="truncate px-0.5 text-[10px] text-foreground/50" title={file.name}>
              {formatBytes(file.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(index)}
            aria-label={`Remove ${file.name}`}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-panel text-foreground/60 hover:text-foreground"
          >
            <X size={11} />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Exactly what leaves the browser, on demand. Shown rather than described, so
 *  sending is an informed act - nothing here is collected that the sender
 *  cannot read first. */
function ContextDisclosure({ context }: { context: FeedbackContext }) {
  return (
    <details className="rounded-md border border-border bg-background px-3 py-2">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-foreground/60 hover:text-foreground">
        <ChevronDown size={13} aria-hidden="true" />
        What gets sent along with this
      </summary>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 font-mono text-[11px] text-foreground/50">
        <dt>version</dt>
        <dd className="truncate">{context.version}</dd>
        <dt>page</dt>
        <dd className="truncate">{context.page}</dd>
        <dt>viewport</dt>
        <dd className="truncate">{context.viewport}</dd>
        <dt>browser</dt>
        <dd className="break-all">{context.browser}</dd>
      </dl>
      <p className="mt-2 text-[11px] leading-relaxed text-foreground/40">
        No progress data, canvas contents, or account details are included.
      </p>
    </details>
  );
}

/**
 * The alpha feedback survey: six grouped questions, two free-text boxes,
 * optional screenshots, an optional reply address, and a disclosure of the
 * environment facts that travel with it. See feedback.ts for how it sends and
 * what happens before EmailJS is configured.
 *
 * Nothing is required. A survey that blocks on completeness collects fewer and
 * worse answers than one that takes whatever the person felt like saying - the
 * only gate is that *something* was filled in.
 */
export function FeedbackSurveyModal({ onClose }: { onClose: () => void }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [written, setWritten] = useState<Record<string, string>>({});
  const [replyTo, setReplyTo] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [rejection, setRejection] = useState<ImageRejection | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "editing" });
  const fileInput = useRef<HTMLInputElement>(null);
  // Mirrors `attachments`, written only from handlers, so the unmount cleanup
  // below can release whatever is still held without depending on state (and
  // without revoking URLs that a later render still points at).
  const liveUrls = useRef<string[]>([]);

  const images = attachments.map((a) => a.file);

  useEffect(() => () => liveUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  // Read once, on mount: the values are shown to the sender before they submit,
  // so they must not drift between the disclosure and the send.
  const [context] = useState<FeedbackContext>(() => collectContext(LATEST_RELEASE.version));
  const canAttach = isEmailJsConfigured();

  const hasWritten = Object.values(written).some((v) => v.trim().length > 0);
  const isEmpty = Object.keys(answers).length === 0 && !hasWritten && images.length === 0;

  const setAnswer = (id: string, next: string | string[] | undefined) => {
    setAnswers((prev) => {
      const copy = { ...prev };
      if (next == null) delete copy[id];
      else copy[id] = next;
      return copy;
    });
  };

  const commit = (next: Attachment[]) => {
    liveUrls.current = next.map((a) => a.url);
    setAttachments(next);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { accepted, rejection: why } = acceptImages(images, Array.from(files));
    // Keep the URL already minted for a file that survived; mint one only for
    // the genuinely new files.
    const next = accepted.map(
      (file) => attachments.find((a) => a.file === file) ?? { file, url: URL.createObjectURL(file) },
    );
    commit(next);
    setRejection(why);
    // Clear the input so re-picking the same file still fires a change event.
    if (fileInput.current) fileInput.current.value = "";
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(attachments[index].url);
    commit(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setPhase({ kind: "sending" });
    try {
      const delivery = await submitFeedback({ answers, written, replyTo, images }, context);
      setPhase({ kind: "sent", delivery });
    } catch {
      setPhase({ kind: "error" });
    }
  };

  if (phase.kind === "sent") {
    const viaEmail = phase.delivery === "email";
    return (
      <CenteredModal title="Feedback" onClose={onClose}>
        <div className="flex flex-col items-start gap-3 py-2">
          <span className="flex items-center gap-2 text-sm font-semibold text-state-valid">
            <Check size={16} aria-hidden="true" />
            {viaEmail ? "Sent. Thank you." : "Your mail app is opening."}
          </span>
          <p className="text-sm leading-relaxed text-foreground/70">
            {viaEmail
              ? "Your answers are on their way. Every one of these actually gets read - ScaleCraft is one person, so alpha feedback goes straight into what gets built next."
              : `Your answers are pre-filled in a draft to ${FEEDBACK_RECIPIENT} - send it and it lands with the author.`}
          </p>
          {!viaEmail && images.length > 0 && (
            <p className="text-sm leading-relaxed text-state-warning">
              A mail draft cannot carry attachments, so your {images.length === 1 ? "screenshot" : "screenshots"} were
              not included. Paste {images.length === 1 ? "it" : "them"} into the draft before sending.
            </p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-1 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/80 hover:text-foreground"
          >
            Close
          </button>
        </div>
      </CenteredModal>
    );
  }

  return (
    <CenteredModal
      title="Feedback"
      titleAdornment={
        <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[11px] font-medium text-foreground/60">
          Alpha {LATEST_RELEASE.version}
        </span>
      }
      onClose={onClose}
    >
      <p className="text-sm leading-relaxed text-foreground/70">
        This goes straight to the one person building ScaleCraft - there is no support queue behind it. It is an alpha,
        so what you say here genuinely decides what gets built next.
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-foreground/45">
        Nothing is required. Answer what you feel like and skip the rest.
      </p>

      <div className="mt-6 flex flex-col gap-6">
        {FEEDBACK_SECTIONS.map((section) => (
          <section key={section.id} className="flex flex-col gap-4">
            <div className="flex flex-col gap-0.5 border-b border-border pb-2">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-foreground/70">{section.title}</h3>
              <p className="text-xs leading-relaxed text-foreground/45">{section.blurb}</p>
            </div>
            {section.questions.map((question) => (
              <QuestionField
                key={question.id}
                question={question}
                value={answers[question.id]}
                onChange={(next) => setAnswer(question.id, next)}
              />
            ))}
          </section>
        ))}

        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-0.5 border-b border-border pb-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-foreground/70">In your words</h3>
            <p className="text-xs leading-relaxed text-foreground/45">
              The most useful part of the whole form. Two sentences beat a perfect essay.
            </p>
          </div>
          {FEEDBACK_WRITTEN_FIELDS.map((field) => (
            <div key={field.id} className="flex flex-col gap-2">
              <label htmlFor={`feedback-${field.id}`} className="text-sm font-medium text-foreground">
                {field.label}
              </label>
              <textarea
                id={`feedback-${field.id}`}
                value={written[field.id] ?? ""}
                onChange={(e) => setWritten((prev) => ({ ...prev, [field.id]: e.target.value }))}
                rows={3}
                placeholder={field.placeholder}
                className="w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-foreground/40"
              />
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-0.5 border-b border-border pb-2">
            <h3 className="text-[13px] font-semibold uppercase tracking-wide text-foreground/70">Screenshots</h3>
            <p className="text-xs leading-relaxed text-foreground/45">
              Optional, up to {MAX_IMAGES} images under {formatBytes(MAX_IMAGE_BYTES_TOTAL)} total. A picture of the
              thing that looked wrong saves a lot of back and forth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={images.length >= MAX_IMAGES}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/75 hover:border-foreground/25 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ImagePlus size={14} aria-hidden="true" />
              Attach image
            </button>
            <span className="text-xs text-foreground/40">
              {images.length} / {MAX_IMAGES}
            </span>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="sr-only"
              aria-label="Attach screenshots"
            />
          </div>

          {rejection && <p className="text-xs text-state-warning">{REJECTION_MESSAGE[rejection]}</p>}
          {!canAttach && images.length > 0 && (
            <p className="text-xs leading-relaxed text-state-warning">
              This install has no mail service configured, so the survey opens your mail app instead - and a mail draft
              cannot carry attachments. You will need to paste these in yourself.
            </p>
          )}

          <ImageStrip attachments={attachments} onRemove={removeImage} />
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <label htmlFor="feedback-reply" className="text-sm font-medium text-foreground">
              Your email
            </label>
            <p className="-mt-1 text-xs leading-relaxed text-foreground/45">
              Optional, and only used to reply to you about this - never added to a list.
            </p>
            <input
              id="feedback-reply"
              type="email"
              value={replyTo}
              onChange={(e) => setReplyTo(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40"
            />
          </div>
          <ContextDisclosure context={context} />
        </section>

        {phase.kind === "error" && (
          <p className="text-sm text-state-error">
            That did not send. Check your connection and try again - or mail {FEEDBACK_RECIPIENT} directly.
          </p>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isEmpty || phase.kind === "sending"}
            className="flex items-center gap-2 rounded-md border border-hero-accent bg-hero-accent/15 px-3.5 py-1.5 text-sm font-semibold text-hero-accent transition-colors duration-150 ease-out hover:bg-hero-accent/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-foreground/40"
          >
            {phase.kind === "sending" && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            Send feedback
          </button>
        </div>
      </div>
    </CenteredModal>
  );
}
