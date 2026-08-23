import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  acceptImages,
  describeBrowser,
  FEEDBACK_QUESTIONS,
  FEEDBACK_RECIPIENT,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  feedbackMailtoHref,
  formatBytes,
  FeedbackRateLimitError,
  feedbackSubject,
  formatFeedbackBody,
  isFeedbackEmailConfigured,
  MAILTO_MAX_URL,
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
    expect(href).toContain("subject=ScaleCraft%20feedback%20(1.0.0)");
    expect(href).toContain("body=");
    expect(href).not.toContain("\n");
  });

  it("percent-encodes spaces rather than form-encoding them to +", () => {
    // A mailto URI is not a form query: a mail client hands `+` through
    // literally, so the draft would read "The+canvas+felt+great."
    const href = feedbackMailtoHref(response(), context, "ScaleCraft feedback (1.0.0)");
    expect(href).toContain("The%20canvas%20felt%20great.");
    expect(href).not.toContain("+");
  });

  it("keeps the URL inside the limit a mail handler will silently cut at", () => {
    const long = feedbackMailtoHref(
      response({ written: { working: "x".repeat(4000), broken: "y".repeat(4000) } }),
      context,
      "ScaleCraft feedback (1.0.0)",
    );
    expect(long.length).toBeLessThanOrEqual(MAILTO_MAX_URL);
  });

  it("marks the cut in the draft instead of trailing off mid-sentence", () => {
    const long = feedbackMailtoHref(
      response({ written: { working: "x".repeat(4000) } }),
      context,
      "ScaleCraft feedback (1.0.0)",
    );
    expect(decodeURIComponent(long)).toContain("[Trimmed here");
  });

  it("trims the free text but keeps the questions and the environment context", () => {
    const body = decodeURIComponent(
      feedbackMailtoHref(
        response({ written: { working: "x".repeat(4000) } }),
        context,
        "ScaleCraft feedback (1.0.0)",
      ),
    );
    for (const question of FEEDBACK_QUESTIONS) expect(body).toContain(question.prompt);
    expect(body).toContain(`Browser: ${context.browser}`);
  });

  it("leaves a response that already fits completely untouched", () => {
    const href = feedbackMailtoHref(response(), context, "ScaleCraft feedback (1.0.0)");
    expect(href.length).toBeLessThan(MAILTO_MAX_URL);
    expect(decodeURIComponent(href)).not.toContain("[Trimmed here");
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

describe("describeBrowser", () => {
  it("names the browser and its major version", () => {
    const chrome =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36";
    expect(describeBrowser(chrome)).toBe("Chrome 151");
    expect(describeBrowser("Mozilla/5.0 (X11; Linux x86_64; rv:129.0) Gecko/20100101 Firefox/129.0")).toBe(
      "Firefox 129",
    );
  });

  it("picks the fork over the Chromium it reports underneath", () => {
    expect(describeBrowser(`${"Chrome/151.0.0.0"} Safari/537.36 Edg/151.0.2903.51`)).toBe("Edge 151");
    expect(describeBrowser("Chrome/151.0.0.0 Safari/537.36 OPR/123.0.0.0")).toBe("Opera 123");
  });

  it("reads Safari's own version rather than the WebKit build", () => {
    const safari =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Safari/605.1.15";
    expect(describeBrowser(safari)).toBe("Safari 18");
  });

  it("falls back to the agent itself rather than guessing", () => {
    expect(describeBrowser("SomeCrawler/1.0")).toBe("SomeCrawler/1.0");
  });
});

describe("isFeedbackEmailConfigured", () => {
  afterEach(() => vi.restoreAllMocks());

  it("reports what the route says", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ configured: true }));
    await expect(isFeedbackEmailConfigured()).resolves.toBe(true);
  });

  it("reads an unreachable or failing route as not configured", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    await expect(isFeedbackEmailConfigured()).resolves.toBe(false);

    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 500 }));
    await expect(isFeedbackEmailConfigured()).resolves.toBe(false);
  });
});

describe("submitFeedback", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: { href: "" } });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    vi.restoreAllMocks();
  });

  function mockRoute(status: number) {
    return vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status }));
  }

  it("posts the answers to our own route, never to a mail provider", async () => {
    const fetchSpy = mockRoute(200);

    await expect(submitFeedback(response({ replyTo: "a@b.com" }), context)).resolves.toBe("email");

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe("/api/feedback");
    expect(init?.method).toBe("POST");

    const form = init?.body as FormData;
    expect(form).toBeInstanceOf(FormData);
    const payload = JSON.parse(String(form.get("payload")));
    expect(payload.replyTo).toBe("a@b.com");
    expect(payload.answers).toEqual(response().answers);
    expect(payload.context).toEqual(context);
    expect(window.location.href).toBe("");
  });

  it("attaches each image as its own form entry", async () => {
    const fetchSpy = mockRoute(200);

    await expect(
      submitFeedback(response({ images: [image("one.png", 10), image("two.png", 10)] }), context),
    ).resolves.toBe("email");

    const form = (fetchSpy.mock.calls[0][1]?.body as FormData).getAll("image");
    expect(form).toHaveLength(2);
  });

  it("falls back to the visitor's mail client when the route reports no mail service", async () => {
    mockRoute(501);
    await expect(submitFeedback(response(), context)).resolves.toBe("mail-client");
    expect(window.location.href.startsWith(`mailto:${FEEDBACK_RECIPIENT}`)).toBe(true);
    expect(window.location.href).toContain(encodeURIComponent(feedbackSubject(context.version)));
  });

  it("distinguishes a rate limit from a failure, so the dialog can say which", async () => {
    mockRoute(429);
    await expect(submitFeedback(response(), context)).rejects.toBeInstanceOf(FeedbackRateLimitError);
  });

  it("throws on a failed send instead of quietly reporting success", async () => {
    mockRoute(502);
    await expect(submitFeedback(response(), context)).rejects.toThrow(/502/);
    // Not the mail-client path: a failure must not look like a success.
    expect(window.location.href).toBe("");
  });
});
