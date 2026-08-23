/**
 * The alpha feedback survey - grouped questions, two free-text boxes, optional
 * screenshots, and an optional reply address, mailed to the author on submit.
 *
 * This module is the *pure* half: the question content, the plain-text
 * formatting, the attachment limits, and the client-side submit. Delivery
 * itself happens server-side in `src/app/api/feedback/route.ts`, because Brevo
 * authenticates with a secret API key that must never reach the browser - the
 * client only ever POSTs the answers to our own route.
 *
 * Nothing here touches `window` outside `collectContext` and `submitFeedback`,
 * so the route imports the formatter and the limits from this same file rather
 * than keeping a second copy of either.
 *
 * When the server reports no mail service configured the survey still works: it
 * falls back to opening the visitor's mail client with the whole response
 * pre-filled. That fallback cannot carry files, which is why
 * `isFeedbackEmailConfigured` exists - the dialog says so up front rather than
 * silently dropping attachments.
 *
 * See .env.example for the values Brevo needs.
 */

/** The project's own inbox, not a personal address - it is both the Brevo
 *  sender and where submissions land, and it is what the dialog and the About
 *  modal show publicly. Overridable per-deployment with FEEDBACK_RECIPIENT_EMAIL. */
export const FEEDBACK_RECIPIENT = "noreplay.scalecraft@gmail.com";

/** Questions are grouped so the dialog reads as a short interview rather than
 *  a wall of radio buttons. */
export type FeedbackSection = {
  id: string;
  title: string;
  /** One line on why this section is being asked. */
  blurb: string;
  questions: readonly FeedbackQuestion[];
};

export type FeedbackQuestion = {
  id: string;
  prompt: string
  /** Optional clarification under the prompt - what the answer is used for, or
   *  how to read an ambiguous option. */
  helper?: string;
  options: readonly string[];
  /** Multi-select, capped at `maxChoices`. Used where forcing one answer
   *  would throw away the real signal ("improve first" is genuinely a
   *  ranking, not a single choice). */
  multi?: true;
  maxChoices?: number;
};

export const FEEDBACK_SECTIONS: readonly FeedbackSection[] = [
  {
    id: "experience",
    title: "Your experience",
    blurb: "Sets the baseline - a rough patch reads very differently from a first look around.",
    questions: [
      {
        id: "overall",
        prompt: "How is ScaleCraft working out so far?",
        options: ["Really well", "Good, with rough edges", "Mixed", "Frustrating"],
      },
      {
        id: "depth",
        prompt: "How far have you got?",
        helper: "Answers from someone deep in the curriculum weigh differently to first impressions.",
        options: ["Just looking around", "A chapter or two", "Several chapters", "Deep into the curriculum"],
      },
    ],
  },
  {
    id: "usage",
    title: "What you have been using",
    blurb: "Tells the author which part of the app your answers are actually about.",
    questions: [
      {
        id: "mode",
        prompt: "Which mode have you spent the most time in?",
        options: ["Building Blocks", "Real World Extraction", "Sandbox", "Haven't really started"],
      },
      {
        id: "clarity",
        prompt: "How clear are the lessons and the validation explanations?",
        helper: "Validation is meant to explain the reasoning, never just pass or fail. Say if it doesn't.",
        options: ["Very clear", "Mostly clear", "Sometimes confusing", "Hard to follow"],
      },
    ],
  },
  {
    id: "direction",
    title: "What should change",
    blurb: "This is the part that decides what gets built next.",
    questions: [
      {
        id: "priority",
        prompt: "What should be improved first?",
        helper: "Pick up to two.",
        options: [
          "More chapters",
          "Validation feedback",
          "Canvas usability",
          "Lesson depth",
          "Speed and polish",
          "Progress and stats",
        ],
        multi: true,
        maxChoices: 2,
      },
      {
        id: "recommend",
        prompt: "Would you recommend ScaleCraft to someone learning system design?",
        options: ["Yes", "Not yet", "No"],
      },
    ],
  },
];

/** Flattened, for formatting and for tests that do not care about grouping. */
export const FEEDBACK_QUESTIONS: readonly FeedbackQuestion[] = FEEDBACK_SECTIONS.flatMap((s) => s.questions);

export type FeedbackWrittenField = {
  id: string;
  label: string;
  placeholder: string;
};

/** Free-text ceiling. Generous rather than tight - the written answers are the
 *  most useful part of the form - but bounded, so the box can show a live
 *  count instead of letting someone paste a page into an email body. */
export const MAX_WRITTEN_CHARS = 1000;

export const FEEDBACK_WRITTEN_FIELDS: readonly FeedbackWrittenField[] = [
  {
    id: "working",
    label: "What is working well?",
    placeholder: "Optional. Worth saying - it decides what does not get changed.",
  },
  {
    id: "broken",
    label: "What is missing, confusing, or broken?",
    placeholder: "Optional. Specifics help most: what you were doing, what you expected, what happened.",
  },
];

/** Attachment limits. Brevo caps a whole message near 10 MB and base64 inflates
 *  a file by about a third, so 5 MB of images stays comfortably inside that.
 *  Rejecting at the input beats failing at send time with an opaque error - the
 *  route re-checks both, since a limit only the client enforces is no limit. */
export const MAX_IMAGES = 3;
export const MAX_IMAGE_BYTES_TOTAL = 5 * 1024 * 1024;

export type FeedbackResponse = {
  /** Question id -> chosen option, or options for a multi-select. Unanswered
   *  questions are simply absent. */
  answers: Record<string, string | string[]>;
  /** Free-text field id -> what they wrote. */
  written: Record<string, string>;
  /** Optional reply address. Empty string when left blank. */
  replyTo: string;
  /** Screenshots, in selection order. */
  images: readonly File[];
};

/** Environment facts attached to every submission, shown in the dialog before
 *  sending so nothing goes out that the sender has not seen. */
export type FeedbackContext = {
  version: string;
  page: string;
  viewport: string;
  browser: string;
};

export function collectContext(version: string): FeedbackContext {
  return {
    version,
    page: window.location.pathname,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    browser: navigator.userAgent,
  };
}

/** A readable name for the technical-details panel, e.g. "Chrome 151". The raw
 *  user agent is what actually travels with the submission and is shown
 *  underneath this - it is a label on that string, never a substitute for it.
 *  Falls back to the agent itself when nothing matches, rather than guessing. */
export function describeBrowser(userAgent: string): string {
  /* Order matters: Chromium forks all carry "Chrome/", and every Chrome UA
     also carries "Safari/", so the specific tokens are tested first. */
  const rules: readonly [string, RegExp][] = [
    ["Edge", /Edg(?:e|A|iOS)?\/(\d+)/],
    ["Opera", /OPR\/(\d+)/],
    ["Samsung Internet", /SamsungBrowser\/(\d+)/],
    ["Firefox", /(?:Firefox|FxiOS)\/(\d+)/],
    ["Chrome", /(?:Chrome|CriOS)\/(\d+)/],
    ["Safari", /Version\/(\d+)[.\d]* (?:Mobile\/\S+ )?Safari\//],
  ];

  for (const [name, pattern] of rules) {
    const match = pattern.exec(userAgent);
    if (match) return `${name} ${match[1]}`;
  }
  return userAgent;
}

/** Where a submission actually went, so the dialog can tell the truth about
 *  it rather than claiming "sent" either way. */
export type FeedbackDelivery = "email" | "mail-client";

/** Our own route, not Brevo's - the API key stays on the server. */
const FEEDBACK_ENDPOINT = "/api/feedback";

/** Shared with the route so the subject line has one definition. */
export function feedbackSubject(version: string): string {
  return `ScaleCraft feedback (${version})`;
}

function formatAnswer(value: string | string[] | undefined): string {
  if (value == null) return "(no answer)";
  return Array.isArray(value) ? value.join(", ") : value;
}

/** Plain text, because it is read in an inbox - grouped the same way the
 *  dialog groups it, so a reply can quote a section by name. */
export function formatFeedbackBody(response: FeedbackResponse, context: FeedbackContext): string {
  const blocks: string[] = [];

  for (const section of FEEDBACK_SECTIONS) {
    const lines = section.questions.map(
      (question) => `${question.prompt}\n  ${formatAnswer(response.answers[question.id])}`,
    );
    blocks.push(`== ${section.title}\n\n${lines.join("\n\n")}`);
  }

  const written = FEEDBACK_WRITTEN_FIELDS.map((field) => {
    const value = response.written[field.id]?.trim();
    return `${field.label}\n  ${value && value.length > 0 ? value : "(nothing added)"}`;
  });
  blocks.push(`== In their words\n\n${written.join("\n\n")}`);

  const reply = response.replyTo.trim();
  blocks.push(
    [
      "== Context",
      "",
      `Reply to: ${reply.length > 0 ? reply : "(not given)"}`,
      `Version: ${context.version}`,
      `Page: ${context.page}`,
      `Viewport: ${context.viewport}`,
      `Browser: ${context.browser}`,
      `Screenshots: ${response.images.length}`,
    ].join("\n"),
  );

  return blocks.join("\n\n");
}

/**
 * Whether the server has a mail service configured, asked once on mount so the
 * dialog can warn about attachments *before* anything is typed. It cannot be
 * read synchronously the way the old client-side key was - the Brevo key is a
 * server secret - so this is a cheap GET against our own route.
 *
 * Any failure reads as "not configured", which is the conservative answer: it
 * warns that screenshots may not travel rather than promising they will.
 */
export async function isFeedbackEmailConfigured(): Promise<boolean> {
  try {
    const res = await fetch(FEEDBACK_ENDPOINT, { method: "GET" });
    if (!res.ok) return false;
    const data: unknown = await res.json();
    return typeof data === "object" && data !== null && (data as { configured?: unknown }).configured === true;
  } catch {
    return false;
  }
}

/**
 * How long the whole `mailto:` URL is allowed to get. Windows hands the URL to
 * ShellExecute, which cuts it around 2,048 characters and does it *silently* -
 * the draft simply opens with the end missing and nobody is told. So the
 * fallback decides where to trim rather than leaving it to the platform, with
 * headroom under that limit for the recipient and subject.
 */
export const MAILTO_MAX_URL = 1900;

/** Left in the draft at the cut, so the person about to send it can see what
 *  happened and paste the rest in themselves. */
const TRIM_NOTE = "\n[Trimmed here - a mail draft cannot carry the whole answer.]";

/** Percent-encoding, not `URLSearchParams`. That builds an
 *  application/x-www-form-urlencoded query, where a space becomes `+` - but a
 *  mailto URI (RFC 6068) is plain percent-encoding, so a mail client hands
 *  those pluses straight through and the draft arrives reading
 *  "How+is+ScaleCraft+working+out". */
function mailtoHref(body: string, subject: string): string {
  return `mailto:${FEEDBACK_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** The response with every written answer capped at `limit` characters. The
 *  free text is the only part that trims: the questions and the environment
 *  context are short, fixed, and the parts a reply depends on. */
function capWritten(response: FeedbackResponse, limit: number): FeedbackResponse {
  const written: Record<string, string> = {};
  for (const [id, value] of Object.entries(response.written)) {
    const trimmed = value.trim();
    written[id] = trimmed.length > limit ? `${trimmed.slice(0, limit).trimEnd()}${TRIM_NOTE}` : trimmed;
  }
  return { ...response, written };
}

export function feedbackMailtoHref(
  response: FeedbackResponse,
  context: FeedbackContext,
  subject: string,
): string {
  const full = mailtoHref(formatFeedbackBody(response, context), subject);
  if (full.length <= MAILTO_MAX_URL) return full;

  /* Binary search the largest per-answer cap that still fits. Percent-encoding
     makes the URL cost of a character vary (a newline costs three, a letter
     one), so the length cannot simply be divided out - but it is monotonic in
     the cap, which is all a search needs. ~10 iterations at this size. */
  let low = 0;
  let high = Math.max(...Object.values(response.written).map((v) => v.trim().length), 0);
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if (mailtoHref(formatFeedbackBody(capWritten(response, mid), context), subject).length <= MAILTO_MAX_URL) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }
  // At cap 0 this is the questions and context alone (~1kB) - already inside
  // the limit in practice, and the best that can be offered if it ever is not.
  return mailtoHref(formatFeedbackBody(capWritten(response, low), context), subject);
}

/** Thrown when the route turns a submission away for coming too fast, so the
 *  dialog can say that instead of a generic failure - the answers are still in
 *  the form and the send is worth retrying. */
export class FeedbackRateLimitError extends Error {
  constructor() {
    super("Too many feedback submissions from this address");
    this.name = "FeedbackRateLimitError";
  }
}

/**
 * Sends the survey to `/api/feedback`, which relays it through Brevo. Throws on
 * a failed call so the dialog can show a real error instead of a false "thanks"
 * - it deliberately does not silently downgrade to the mail client on failure,
 * which would look identical to success from the caller's side.
 *
 * The one exception is 501, which is the route saying it has no Brevo
 * credentials. That is a deployment fact rather than an error, so it takes the
 * mail-client path - and the caller is told which of the two happened.
 *
 * Multipart rather than JSON: screenshots are `File`s, and base64-ing them into
 * a JSON body would inflate the payload by a third for no gain.
 */
export async function submitFeedback(
  response: FeedbackResponse,
  context: FeedbackContext,
): Promise<FeedbackDelivery> {
  const form = new FormData();
  form.append(
    "payload",
    JSON.stringify({
      answers: response.answers,
      written: response.written,
      replyTo: response.replyTo.trim(),
      context,
    }),
  );
  for (const image of response.images) form.append("image", image, image.name);

  const res = await fetch(FEEDBACK_ENDPOINT, { method: "POST", body: form });

  if (res.status === 501) {
    // A mailto URL cannot carry files. The dialog has already said so, and
    // formatFeedbackBody records how many were selected, so the author knows
    // to ask for them.
    window.location.href = feedbackMailtoHref(response, context, feedbackSubject(context.version));
    return "mail-client";
  }
  if (res.status === 429) throw new FeedbackRateLimitError();
  if (!res.ok) throw new Error(`Feedback send failed (${res.status})`);
  return "email";
}

export type ImageRejection = "not-an-image" | "too-many" | "too-large";

/** Validates a new selection against what is already attached. Pure, so the
 *  limits are testable without a file picker. */
export function acceptImages(
  existing: readonly File[],
  incoming: readonly File[],
): { accepted: File[]; rejection: ImageRejection | null } {
  const accepted = [...existing];
  let rejection: ImageRejection | null = null;

  for (const file of incoming) {
    if (!file.type.startsWith("image/")) {
      rejection = "not-an-image";
      continue;
    }
    if (accepted.length >= MAX_IMAGES) {
      rejection = "too-many";
      continue;
    }
    const total = accepted.reduce((sum, f) => sum + f.size, 0) + file.size;
    if (total > MAX_IMAGE_BYTES_TOTAL) {
      rejection = "too-large";
      continue;
    }
    accepted.push(file);
  }

  return { accepted, rejection };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
