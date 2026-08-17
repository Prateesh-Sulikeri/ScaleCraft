import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  acceptImages,
  FEEDBACK_QUESTIONS,
  FEEDBACK_RECIPIENT,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  feedbackMailtoHref,
  formatBytes,
  formatFeedbackBody,
  isEmailJsConfigured,
  MAX_IMAGES,
  MAX_IMAGE_BYTES_TOTAL,
  submitFeedback,
  type FeedbackContext,
  type FeedbackResponse,
} from "./feedback";

const context: FeedbackContext = {
  version: "6.1.1-alpha",
  page: "/",
  viewport: "1512x950",
  browser: "TestBrowser/1.0",
};

const multiQuestion = FEEDBACK_QUESTIONS.find((q) => q.multi)!;

function response(overrides: Partial<FeedbackResponse> = {}): FeedbackResponse {
  return {
    answers: { [FEEDBACK_QUESTIONS[0].id]: FEEDBACK_QUESTIONS[0].options[0] },
    written: { [FEEDBACK_WRITTEN_FIELDS[0].id]: "The canvas felt great." },
    replyTo: "",
    images: [],
    ...overrides,
  };
}

function image(name: string, size: number, type = "image/png"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("survey shape", () => {
  it("groups every question under a section, with no duplicate ids", () => {
    const ids = FEEDBACK_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(FEEDBACK_SECTIONS.flatMap((s) => s.questions)).toEqual(FEEDBACK_QUESTIONS);
    expect(FEEDBACK_SECTIONS.every((s) => s.blurb.length > 0)).toBe(true);
  });

  it("caps the multi-select question", () => {
    expect(multiQuestion.maxChoices).toBeGreaterThan(1);
    expect(multiQuestion.maxChoices).toBeLessThan(multiQuestion.options.length);
  });
});

describe("formatFeedbackBody", () => {
  it("includes every section heading and question, answered or not", () => {
    const body = formatFeedbackBody(response(), context);
    for (const section of FEEDBACK_SECTIONS) expect(body).toContain(section.title);
    for (const question of FEEDBACK_QUESTIONS) expect(body).toContain(question.prompt);
  });

  it("marks skipped questions rather than omitting them silently", () => {
    const body = formatFeedbackBody(response({ answers: {}, written: {} }), context);
    expect(body.match(/\(no answer\)/g)).toHaveLength(FEEDBACK_QUESTIONS.length);
    expect(body.match(/\(nothing added\)/g)).toHaveLength(FEEDBACK_WRITTEN_FIELDS.length);
  });

  it("joins a multi-select answer instead of printing an array", () => {
    const picks = [multiQuestion.options[0], multiQuestion.options[1]];
    const body = formatFeedbackBody(response({ answers: { [multiQuestion.id]: picks } }), context);
    expect(body).toContain(picks.join(", "));
    expect(body).not.toContain("[");
  });

  it("carries both written fields through", () => {
    const body = formatFeedbackBody(
      response({ written: { working: "Lessons are clear.", broken: "Zoom felt jumpy." } }),
      context,
    );
    expect(body).toContain("Lessons are clear.");
    expect(body).toContain("Zoom felt jumpy.");
  });

  it("records the environment context and the attachment count", () => {
    const body = formatFeedbackBody(response({ images: [image("a.png", 10)] }), context);
    expect(body).toContain("6.1.1-alpha");
    expect(body).toContain("1512x950");
    expect(body).toContain("TestBrowser/1.0");
    expect(body).toContain("Screenshots: 1");
  });

  it("says when no reply address was given, rather than leaving it blank", () => {
    expect(formatFeedbackBody(response(), context)).toContain("Reply to: (not given)");
    expect(formatFeedbackBody(response({ replyTo: "a@b.com" }), context)).toContain("Reply to: a@b.com");
  });
});

describe("feedbackMailtoHref", () => {
  it("addresses the author and encodes subject and body", () => {
    const href = feedbackMailtoHref(response(), context, "ScaleCraft feedback (1.0.0)");
    expect(href.startsWith(`mailto:${FEEDBACK_RECIPIENT}?`)).toBe(true);
    expect(href).toContain("subject=ScaleCraft+feedback+%281.0.0%29");
    expect(href).toContain("body=");
    expect(href).not.toContain("\n");
  });
});

describe("acceptImages", () => {
  it("accepts images up to the count cap", () => {
    const { accepted, rejection } = acceptImages([], [image("a.png", 10), image("b.png", 10)]);
    expect(accepted).toHaveLength(2);
    expect(rejection).toBeNull();
  });

  it("rejects a non-image and keeps the rest", () => {
    const { accepted, rejection } = acceptImages([], [image("a.pdf", 10, "application/pdf"), image("b.png", 10)]);
    expect(accepted.map((f) => f.name)).toEqual(["b.png"]);
    expect(rejection).toBe("not-an-image");
  });

  it("rejects past the count cap without dropping what was already there", () => {
    const existing = Array.from({ length: MAX_IMAGES }, (_, i) => image(`e${i}.png`, 10));
    const { accepted, rejection } = acceptImages(existing, [image("extra.png", 10)]);
    expect(accepted).toHaveLength(MAX_IMAGES);
    expect(rejection).toBe("too-many");
  });

  it("rejects a file that would push the total over the byte cap", () => {
    const { accepted, rejection } = acceptImages([image("big.png", MAX_IMAGE_BYTES_TOTAL - 1)], [image("more.png", 100)]);
    expect(accepted).toHaveLength(1);
    expect(rejection).toBe("too-large");
  });
});

describe("formatBytes", () => {
  it("scales the unit to the size", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(3 * 1024 * 1024)).toBe("3.0 MB");
  });
});

describe("submitFeedback", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  function configure() {
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "public-key");
  }

  it("reports whether a mail service is configured", () => {
    expect(isEmailJsConfigured()).toBe(false);
    configure();
    expect(isEmailJsConfigured()).toBe(true);
  });

  it("falls back to the visitor's mail client when EmailJS is not configured", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(submitFeedback(response(), context)).resolves.toBe("mail-client");
    expect(window.location.href.startsWith(`mailto:${FEEDBACK_RECIPIENT}`)).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("falls back when the EmailJS config is only partly present", async () => {
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "service");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    await expect(submitFeedback(response(), context)).resolves.toBe("mail-client");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts JSON when there are no attachments", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    await expect(submitFeedback(response({ replyTo: "a@b.com" }), context)).resolves.toBe("email");

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("/email/send");
    expect(String(url)).not.toContain("send-form");
    const body = JSON.parse(String(init?.body));
    expect(body.service_id).toBe("service");
    expect(body.template_id).toBe("template");
    expect(body.user_id).toBe("public-key");
    expect(body.template_params.to_email).toBe(FEEDBACK_RECIPIENT);
    expect(body.template_params.reply_to).toBe("a@b.com");
    expect(body.template_params.message).toContain("The canvas felt great.");
    expect(window.location.href).toBe("");
  });

  it("posts multipart with each image attached when there are screenshots", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    await expect(
      submitFeedback(response({ images: [image("one.png", 10), image("two.png", 10)] }), context),
    ).resolves.toBe("email");

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("send-form");
    const form = init?.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    expect(form.get("service_id")).toBe("service");
    expect(form.getAll("attachment")).toHaveLength(2);
    expect(String(form.get("message"))).toContain("Screenshots: 2");
  });

  it("throws on a failed send instead of quietly reporting success", async () => {
    configure();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    await expect(submitFeedback(response(), context)).rejects.toThrow(/500/);
  });
});
