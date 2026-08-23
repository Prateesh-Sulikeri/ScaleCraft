"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "react";
import {
  BookOpen,
  ChartColumn,
  Check,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  CircleMinus,
  CircleSlash,
  CircleX,
  CloudUpload,
  Eye,
  Frown,
  Info,
  Laugh,
  Layers,
  Loader2,
  Lock,
  MessageSquareText,
  MousePointerClick,
  Rocket,
  Send,
  ShieldCheck,
  Smile,
  Sun,
  ThumbsDown,
  ThumbsUp,
  Timer,
  X,
  Zap,
} from "lucide-react";
import { CenteredModal } from "@/app/CenteredModal";
import { modeIcon, modeLabel, type AppMode } from "@/lib/modes";
import { FeedbackIllustration } from "./FeedbackIllustration";
import { LATEST_RELEASE } from "./release-info";
import {
  acceptImages,
  collectContext,
  describeBrowser,
  FEEDBACK_RECIPIENT,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  FeedbackRateLimitError,
  formatBytes,
  isFeedbackEmailConfigured,
  MAX_IMAGE_BYTES_TOTAL,
  MAX_IMAGES,
  MAX_WRITTEN_CHARS,
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
  | { kind: "error"; reason: ErrorReason };

/** "rate-limited" is not a failure the sender caused and not one retrying now
 *  will fix, so it gets its own message rather than "check your connection". */
type ErrorReason = "failed" | "rate-limited";

type Glyph = ComponentType<{ size?: number; className?: string }>;

const REJECTION_MESSAGE: Record<ImageRejection, string> = {
  "not-an-image": "Only image files can be attached.",
  "too-many": `Up to ${MAX_IMAGES} images.`,
  "too-large": `Images have to come to under ${formatBytes(MAX_IMAGE_BYTES_TOTAL)} in total.`,
};

const ERROR_MESSAGE: Record<ErrorReason, string> = {
  failed: `That did not send. Check your connection and try again - or mail ${FEEDBACK_RECIPIENT} directly.`,
  "rate-limited": `That is a few submissions in a short window. Give it ten minutes, or mail ${FEEDBACK_RECIPIENT} directly.`,
};

/* Type scale for the dialog, named once so the two columns stay in step. */
const SECTION_TITLE = "text-[12px] font-semibold uppercase tracking-[0.14em] text-foreground/75";
const SECTION_BLURB = "text-[11.5px] leading-relaxed text-foreground/45";
const FIELD_LABEL = "text-[13px] font-medium text-foreground/90";

/** Glyph per option, keyed by the option's own label. Kept here rather than in
 *  feedback.ts for the same reason release-notes.ts declares an icon *key* and
 *  the dialog maps it: the content file stays free of UI imports. The mode
 *  question reuses `modeIcon`, the app's one source for those three glyphs -
 *  a second, hand-picked set would drift from Home's mode cards. An option
 *  with no entry simply renders without a glyph. */
const OPTION_ICON: Record<string, Glyph> = {
  // How is ScaleCraft working out so far?
  "Really well": Laugh,
  "Good, with rough edges": Smile,
  Mixed: CircleMinus,
  Frustrating: Frown,
  // How far have you got?
  "Just looking around": Eye,
  "A chapter or two": BookOpen,
  "Several chapters": Layers,
  "Deep into the curriculum": Rocket,
  // Which mode have you spent the most time in?
  ...Object.fromEntries((Object.keys(modeLabel) as AppMode[]).map((mode) => [modeLabel[mode], modeIcon[mode]])),
  "Haven't really started": CircleSlash,
  // How clear are the lessons and the validation explanations?
  "Very clear": Sun,
  "Mostly clear": CircleCheck,
  "Sometimes confusing": CircleHelp,
  "Hard to follow": CircleX,
  // What should be improved first?
  "More chapters": BookOpen,
  "Validation feedback": ShieldCheck,
  "Canvas usability": MousePointerClick,
  "Lesson depth": Layers,
  "Speed and polish": Zap,
  "Progress and stats": ChartColumn,
  // Would you recommend ScaleCraft?
  Yes: ThumbsUp,
  "Not yet": Timer,
  No: ThumbsDown,
};

/** How many chips sit on a row at the widest breakpoint. Driven by the option
 *  count so a six-option question reads as two rows of three rather than a
 *  four-and-two remainder; Tailwind needs whole class names, hence the map. */
const CHIP_COLUMNS: Record<number, string> = {
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
  6: "sm:grid-cols-3",
};

/** Numbered marker in front of a section heading. The number is decorative -
 *  the sections are not steps and can be answered in any order - so it is
 *  hidden from assistive tech and the heading text carries the meaning. */
function SectionHeading({ index, title, blurb }: { index: number; title: string; blurb: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        aria-hidden="true"
        className="flex size-[26px] shrink-0 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--hero-accent)_40%,transparent)] bg-hero-accent/[0.07] text-[11.5px] font-semibold text-hero-accent"
      >
        {index}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <h3 className={SECTION_TITLE}>{title}</h3>
        <p className={SECTION_BLURB}>{blurb}</p>
      </div>
    </div>
  );
}

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
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-[13px] font-medium text-foreground">
        <span>{question.prompt}</span>
        {question.helper && (
          <span className="ml-2 text-[11.5px] font-normal text-foreground/45">{question.helper}</span>
        )}
      </legend>
      <div className={`mt-1 grid grid-cols-2 gap-2 ${CHIP_COLUMNS[question.options.length] ?? "sm:grid-cols-3"}`}>
        {question.options.map((option) => {
          const Icon = OPTION_ICON[option];
          const on = selected(option);
          return (
            <button
              key={option}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(option)}
              className={`flex items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-[12.5px] leading-[1.25] transition-colors duration-150 ease-out ${
                on
                  ? "border-[color:color-mix(in_srgb,var(--hero-accent)_55%,transparent)] bg-hero-accent/[0.10] text-hero-accent"
                  : "border-border bg-panel text-foreground/70 hover:border-foreground/25 hover:text-foreground"
              }`}
            >
              {Icon && (
                <Icon
                  size={15}
                  aria-hidden="true"
                  className={`shrink-0 ${on ? "" : "text-foreground/40"}`}
                />
              )}
              <span className="min-w-0">{option}</span>
            </button>
          );
        })}
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
    <ul className="grid grid-cols-3 gap-2">
      {attachments.map(({ file, url }, index) => (
        <li key={url} className="relative">
          <span className="flex flex-col gap-1 overflow-hidden rounded-md border border-border bg-background p-1">
            {/* eslint-disable-next-line @next/next/no-img-element -- a blob:
             * URL for a file the visitor just picked; next/image optimizes
             * remote/static sources and cannot handle this one. */}
            <img src={url} alt={file.name} className="h-14 w-full rounded-sm object-cover" />
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
 *  cannot read first, which is also why the full user agent sits under the
 *  readable browser name instead of replacing it. */
function ContextDisclosure({ context }: { context: FeedbackContext }) {
  const rows: [string, string][] = [
    ["Version", context.version],
    ["Page", context.page],
    ["Viewport", context.viewport],
    ["Browser", describeBrowser(context.browser)],
  ];

  return (
    <details open className="group rounded-md border border-border bg-background">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3 px-3.5 py-3">
        <span className="flex flex-col gap-0.5">
          <span className={SECTION_TITLE}>Technical details</span>
          <span className={SECTION_BLURB}>Automatically included with this feedback.</span>
        </span>
        <ChevronDown
          size={14}
          aria-hidden="true"
          className="mt-0.5 shrink-0 text-foreground/40 transition-transform duration-150 ease-out group-open:rotate-180"
        />
      </summary>

      <dl className="flex flex-col divide-y divide-border border-t border-border px-3.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 py-2">
            <dt className="shrink-0 text-[11.5px] text-foreground/50">{label}</dt>
            <dd className="truncate font-mono text-[11px] text-foreground/75" title={value}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="break-all border-t border-border px-3.5 py-2 font-mono text-[10px] leading-relaxed text-foreground/35">
        {context.browser}
      </p>

      <p className="flex items-start gap-2 border-t border-border px-3.5 py-2.5 text-[11px] leading-relaxed text-foreground/45">
        <Lock size={13} aria-hidden="true" className="mt-px shrink-0 text-foreground/35" />
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
 * Laid out as a numbered form on a near-viewport panel (the same chromeless
 * `CenteredModal` shell as About and Release notes): the questions run down
 * the wide left column, and everything optional that is *about* the
 * submission rather than part of it - screenshots, reply address, the
 * environment disclosure - sits in a narrower right column. The two halves
 * stack below `lg`.
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
  const [dragging, setDragging] = useState(false);
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

  /* Whether the server can actually mail attachments. Unlike the client-side
     key this replaced, it takes a round trip - so it starts optimistic and the
     warning appears only if the probe comes back negative. The other way round
     would flash "screenshots will not be sent" on a install where they will. */
  const [canAttach, setCanAttach] = useState(true);
  useEffect(() => {
    let live = true;
    void isFeedbackEmailConfigured().then((configured) => {
      if (live) setCanAttach(configured);
    });
    return () => {
      live = false;
    };
  }, []);

  const hasWritten = Object.values(written).some((v) => v.trim().length > 0);
  const isEmpty = Object.keys(answers).length === 0 && !hasWritten && images.length === 0;
  const atImageCap = images.length >= MAX_IMAGES;

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
    } catch (error) {
      setPhase({ kind: "error", reason: error instanceof FeedbackRateLimitError ? "rate-limited" : "failed" });
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

  /* Numbering runs straight through both columns, so "5" on the right reads as
     the step after "4" on the left rather than a second list restarting. */
  const writtenNumber = FEEDBACK_SECTIONS.length + 1;

  return (
    <CenteredModal title="Feedback" onClose={onClose} size="viewport" hideHeader>
      <div className="flex h-full min-h-0 flex-col">
        <header className="relative shrink-0 overflow-hidden border-b border-border px-6 py-5 sm:px-8 sm:py-6">
          {/* The same dotted plane Home rests on (1px dot, 26px pitch), faded
              out downward so it sits behind the headline without competing
              with the form below it. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--border) 85%, transparent) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "linear-gradient(to bottom, black, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />

          <div className="relative flex items-start justify-between gap-8">
            <div className="flex min-w-0 flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-hero-accent">
                  <MessageSquareText size={15} aria-hidden="true" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">Feedback</span>
                </span>
                <span className="rounded-full border border-border px-1.5 py-0.5 text-[10.5px] font-medium text-foreground/55">
                  Alpha {LATEST_RELEASE.version}
                </span>
              </div>

              <h2 className="text-[clamp(22px,3.4vh,34px)] font-bold leading-[1.08] tracking-tight text-foreground">
                Help shape ScaleCraft.
              </h2>
              <p className="max-w-[62ch] text-[13px] leading-relaxed text-foreground/65">
                This goes straight to the one person building ScaleCraft - there is no support queue behind it. It is
                an alpha, so what you say here genuinely decides what gets built next.
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-[11.5px] leading-relaxed text-foreground/45">
                <Info size={13} aria-hidden="true" className="shrink-0 text-foreground/35" />
                Nothing is required. Answer what you feel like and skip the rest.
              </p>
            </div>

            <div className="hidden h-[clamp(104px,15vh,164px)] w-[clamp(240px,26vw,400px)] shrink-0 lg:block">
              <FeedbackIllustration />
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-6 sm:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)]">
            {/* Left: the questions themselves. */}
            <div className="flex flex-col gap-7">
              {FEEDBACK_SECTIONS.map((section, i) => (
                <section key={section.id} className="flex flex-col gap-4">
                  <SectionHeading index={i + 1} title={section.title} blurb={section.blurb} />
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
                <SectionHeading
                  index={writtenNumber}
                  title="In your words"
                  blurb="The most useful part of the whole form. Two sentences beat a perfect essay."
                />
                {FEEDBACK_WRITTEN_FIELDS.map((field) => {
                  const value = written[field.id] ?? "";
                  return (
                    <div key={field.id} className="flex flex-col gap-1.5">
                      <label htmlFor={`feedback-${field.id}`} className={FIELD_LABEL}>
                        {field.label}
                      </label>
                      <div className="relative">
                        <textarea
                          id={`feedback-${field.id}`}
                          value={value}
                          onChange={(e) => setWritten((prev) => ({ ...prev, [field.id]: e.target.value }))}
                          rows={4}
                          maxLength={MAX_WRITTEN_CHARS}
                          placeholder={field.placeholder}
                          className="w-full resize-y rounded-md border border-border bg-background px-3 py-2.5 pb-7 text-[13px] leading-relaxed outline-none transition-colors duration-150 ease-out placeholder:text-foreground/30 focus:border-[color:color-mix(in_srgb,var(--hero-accent)_55%,transparent)]"
                        />
                        <span className="pointer-events-none absolute bottom-2 right-3 font-mono text-[10.5px] text-foreground/35">
                          {value.length} / {MAX_WRITTEN_CHARS}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </section>
            </div>

            {/* Right: everything optional that is about the submission rather
                than part of it. */}
            <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
              <section className="flex flex-col gap-3">
                <SectionHeading
                  index={writtenNumber + 1}
                  title="Screenshots (optional)"
                  blurb={`Up to ${MAX_IMAGES} images under ${formatBytes(MAX_IMAGE_BYTES_TOTAL)} total. A picture of the thing that looked wrong saves a lot of back and forth.`}
                />

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (!atImageCap) setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    if (!atImageCap) addFiles(e.dataTransfer.files);
                  }}
                  className={`rounded-md border border-dashed transition-colors duration-150 ease-out ${
                    dragging ? "border-hero-accent bg-hero-accent/[0.06]" : "border-border bg-background"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => fileInput.current?.click()}
                    disabled={atImageCap}
                    className="flex w-full flex-col items-center gap-1.5 px-4 py-7 text-center transition-colors duration-150 ease-out disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <CloudUpload size={22} aria-hidden="true" className="text-foreground/35" />
                    <span className="text-[12.5px] text-foreground/70">Drop images here</span>
                    <span className="text-[12px] text-foreground/45">
                      or <span className="text-hero-accent">click to browse</span>
                    </span>
                    <span className="mt-1 font-mono text-[11px] text-foreground/40">
                      {images.length} / {MAX_IMAGES} images
                    </span>
                  </button>
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => addFiles(e.target.files)}
                  className="sr-only"
                  aria-label="Attach screenshots"
                />

                {rejection && <p className="text-[11.5px] text-state-warning">{REJECTION_MESSAGE[rejection]}</p>}
                {!canAttach && images.length > 0 && (
                  <p className="text-[11.5px] leading-relaxed text-state-warning">
                    This install has no mail service configured, so the survey opens your mail app instead - and a mail
                    draft cannot carry attachments. You will need to paste these in yourself.
                  </p>
                )}

                <ImageStrip attachments={attachments} onRemove={removeImage} />
              </section>

              <section className="flex flex-col gap-3">
                <SectionHeading
                  index={writtenNumber + 2}
                  title="Your email (optional)"
                  blurb="Only used to reply to you about this - never added to a list."
                />
                <label htmlFor="feedback-reply" className="sr-only">
                  Your email
                </label>
                <input
                  id="feedback-reply"
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-[13px] outline-none transition-colors duration-150 ease-out placeholder:text-foreground/30 focus:border-[color:color-mix(in_srgb,var(--hero-accent)_55%,transparent)]"
                />
              </section>

              <ContextDisclosure context={context} />
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-6 py-4 sm:px-8">
          {/* Empty rather than absent between sends, so the failure is
              announced in place instead of shifting the row when it appears. */}
          <p role="status" className="min-w-0 flex-1 text-[12px] leading-relaxed text-state-error">
            {phase.kind === "error" ? ERROR_MESSAGE[phase.reason] : ""}
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border bg-panel px-3.5 py-2 text-[13px] font-medium text-foreground/70 transition-colors duration-150 ease-out hover:border-foreground/25 hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={isEmpty || phase.kind === "sending"}
              className="flex items-center gap-2 rounded-md border border-hero-accent bg-hero-accent/15 px-4 py-2 text-[13px] font-semibold text-hero-accent transition-colors duration-150 ease-out hover:bg-hero-accent/25 disabled:cursor-not-allowed disabled:border-border disabled:bg-transparent disabled:text-foreground/40"
            >
              {phase.kind === "sending" ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Send size={14} aria-hidden="true" />
              )}
              Send feedback
            </button>
          </div>
        </div>
      </div>
    </CenteredModal>
  );
}
