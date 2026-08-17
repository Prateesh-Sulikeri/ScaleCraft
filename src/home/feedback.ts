/**
 * The alpha feedback survey - grouped questions, two free-text boxes, optional
 * screenshots, and an optional reply address, mailed to the author on submit.
 *
 * Delivery is deliberately the simplest thing that actually sends: EmailJS's
 * REST endpoints, called straight from the browser with its *public* key (that
 * key is designed to ship client-side - there is no secret here, no server
 * route, and no new dependency). When those env vars are absent the survey
 * still works: it falls back to opening the visitor's mail client with the
 * whole response pre-filled. That fallback cannot carry files, which is why
 * `isEmailJsConfigured` is exported - the dialog says so up front rather than
 * silently dropping attachments.
 *
 * See .env.example for the three values EmailJS needs.
 */

export const FEEDBACK_RECIPIENT = "sulikeriprateesh7@gmail.com";

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

/** Attachment limits. EmailJS caps a message's attachments well below what a
 *  browser will happily hand over, so this rejects oversized files at the
 *  input instead of failing at send time with an opaque error. */
export const MAX_IMAGES = 3;
export const MAX_IMAGE_BYTES_TOTAL = 2 * 1024 * 1024;

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

/** Where a submission actually went, so the dialog can tell the truth about
 *  it rather than claiming "sent" either way. */
export type FeedbackDelivery = "email" | "mail-client";

const EMAILJS_SEND = "https://api.emailjs.com/api/v1.0/email/send";
const EMAILJS_SEND_FORM = "https://api.emailjs.com/api/v1.0/email/send-form";

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

type EmailJsConfig = { serviceId: string; templateId: string; publicKey: string };

/** All three or nothing - a partial config cannot send, so it is treated the
 *  same as none and falls through to the mail-client path. */
function emailJsConfig(): EmailJsConfig | null {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  if (!serviceId || !templateId || !publicKey) return null;
  return { serviceId, templateId, publicKey };
}

/** Lets the dialog warn, before anything is typed, that screenshots cannot be
 *  attached on this install. */
export function isEmailJsConfigured(): boolean {
  return emailJsConfig() != null;
}

export function feedbackMailtoHref(
  response: FeedbackResponse,
  context: FeedbackContext,
  subject: string,
): string {
  const query = new URLSearchParams({ subject, body: formatFeedbackBody(response, context) });
  return `mailto:${FEEDBACK_RECIPIENT}?${query.toString()}`;
}

function templateParams(response: FeedbackResponse, context: FeedbackContext, subject: string) {
  return {
    subject,
    to_email: FEEDBACK_RECIPIENT,
    reply_to: response.replyTo.trim(),
    message: formatFeedbackBody(response, context),
    version: context.version,
  };
}

/**
 * Sends the survey. Throws on a failed EmailJS call so the dialog can show a
 * real error instead of a false "thanks" - it deliberately does not silently
 * downgrade to the mail client on failure, which would look identical to
 * success from the caller's side.
 *
 * With screenshots attached this uses the multipart `send-form` endpoint
 * (`send` accepts JSON only, so it has no way to carry a file); each image is
 * appended under the `attachment` field, which the EmailJS template has to
 * declare as a variable attachment parameter of that name.
 */
export async function submitFeedback(
  response: FeedbackResponse,
  context: FeedbackContext,
): Promise<FeedbackDelivery> {
  const subject = `ScaleCraft feedback (${context.version})`;
  const config = emailJsConfig();

  if (!config) {
    // A mailto URL cannot carry files. The dialog has already said so, and
    // formatFeedbackBody records how many were selected, so the author knows
    // to ask for them.
    window.location.href = feedbackMailtoHref(response, context, subject);
    return "mail-client";
  }

  const params = templateParams(response, context, subject);

  const res =
    response.images.length > 0
      ? await fetch(EMAILJS_SEND_FORM, { method: "POST", body: buildFormBody(config, params, response.images) })
      : await fetch(EMAILJS_SEND, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            service_id: config.serviceId,
            template_id: config.templateId,
            user_id: config.publicKey,
            template_params: params,
          }),
        });

  if (!res.ok) throw new Error(`Feedback send failed (${res.status})`);
  return "email";
}

function buildFormBody(
  config: EmailJsConfig,
  params: Record<string, string>,
  images: readonly File[],
): FormData {
  const form = new FormData();
  form.append("service_id", config.serviceId);
  form.append("template_id", config.templateId);
  form.append("user_id", config.publicKey);
  for (const [key, value] of Object.entries(params)) form.append(key, value);
  for (const image of images) form.append("attachment", image, image.name);
  return form;
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
