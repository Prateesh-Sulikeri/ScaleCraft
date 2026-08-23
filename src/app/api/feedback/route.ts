import { NextResponse } from "next/server";
import { z } from "zod";
import {
  FEEDBACK_RECIPIENT,
  MAX_IMAGES,
  MAX_IMAGE_BYTES_TOTAL,
  MAX_WRITTEN_CHARS,
  feedbackSubject,
  formatFeedbackBody,
} from "@/home/feedback";
import { formatFeedbackHtml } from "./feedback-email";

/**
 * Delivery for Home's feedback survey, relayed through Brevo's transactional
 * API. This exists as a route rather than a browser call because Brevo
 * authenticates with a secret key - unlike the EmailJS public key it replaced,
 * it cannot ship to the client.
 *
 * The route is deliberately unauthenticated: feedback is reachable from a
 * public Home, and requiring a sign-in would silence exactly the first-look
 * visitors the survey is aimed at. `rateLimited` below is what keeps that from
 * being a free relay.
 *
 * GET reports whether credentials are present, so the dialog can warn about
 * attachments before anything is typed. POST with no credentials answers 501,
 * which the client reads as "fall back to the visitor's mail client" rather
 * than as a failure.
 */

export const runtime = "nodejs";

const BREVO_SEND = "https://api.brevo.com/v3/smtp/email";

type BrevoConfig = {
  apiKey: string;
  senderEmail: string;
  senderName: string;
  recipient: string;
};

/** Key and sender together or nothing: Brevo rejects a send from an unverified
 *  sender, so a key without one cannot deliver and is treated as unconfigured
 *  rather than failing at send time. */
function brevoConfig(): BrevoConfig | null {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) return null;
  return {
    apiKey,
    senderEmail,
    senderName: process.env.BREVO_SENDER_NAME || "ScaleCraft Feedback",
    recipient: process.env.FEEDBACK_RECIPIENT_EMAIL || FEEDBACK_RECIPIENT,
  };
}

/* Caps mirror the dialog's own, plus a ceiling on every string the client
   controls - the client checks these too, but a limit only the client enforces
   is not a limit. */
const payloadSchema = z.object({
  answers: z.record(z.string().max(80), z.union([z.string().max(200), z.array(z.string().max(200)).max(10)])),
  written: z.record(z.string().max(80), z.string().max(MAX_WRITTEN_CHARS)),
  replyTo: z.string().max(200),
  context: z.object({
    version: z.string().max(40),
    page: z.string().max(200),
    viewport: z.string().max(40),
    browser: z.string().max(400),
  }),
});

/** Good enough to keep Brevo from rejecting the whole message over a malformed
 *  Reply-To. An address that fails this is still written into the body, so a
 *  typo costs the reply link, not the submission. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT = 3;
const RATE_WINDOW_MS = 10 * 60_000;

/** Send times per client, newest last. In-memory and therefore per instance -
 *  which is the right size for this: it stops a script from draining the Brevo
 *  quota without adding a datastore to a survey that gets a handful of real
 *  submissions a week. */
const recentSends = new Map<string, number[]>();

function rateLimited(client: string, now: number): boolean {
  const cutoff = now - RATE_WINDOW_MS;

  // Prune every caller, not just this one, so a long-lived instance does not
  // accumulate an entry per IP that ever posted.
  for (const [key, times] of recentSends) {
    const live = times.filter((t) => t > cutoff);
    if (live.length === 0) recentSends.delete(key);
    else recentSends.set(key, live);
  }

  const times = recentSends.get(client) ?? [];
  if (times.length >= RATE_LIMIT) return true;
  recentSends.set(client, [...times, now]);
  return false;
}

/** Left-most x-forwarded-for entry - on Vercel the proxy sets it and a client
 *  cannot forge past it. Unknown callers share a bucket, which is stricter than
 *  letting them through unmetered. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

export async function GET() {
  return NextResponse.json({ configured: brevoConfig() != null });
}

export async function POST(request: Request) {
  const config = brevoConfig();
  if (!config) {
    return NextResponse.json({ error: "Mail service is not configured" }, { status: 501 });
  }

  if (rateLimited(clientKey(request), Date.now())) {
    return NextResponse.json({ error: "Too many submissions, try again shortly" }, { status: 429 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const raw = form.get("payload");
  if (typeof raw !== "string") {
    return NextResponse.json({ error: "payload is required" }, { status: 400 });
  }

  let parsed: z.infer<typeof payloadSchema>;
  try {
    parsed = payloadSchema.parse(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "payload is malformed" }, { status: 400 });
  }

  /* A FormData value is a string or a File, so the negative test is the whole
     check - and it survives the request crossing realms, where `instanceof
     File` does not (the runtime's File constructor is not the one the entry
     was built with). */
  const images = form.getAll("image").filter((entry): entry is File => typeof entry !== "string");
  const imageError = checkImages(images);
  if (imageError) return NextResponse.json({ error: imageError }, { status: 400 });

  const { context } = parsed;
  const body = formatFeedbackBody({ ...parsed, images }, context);
  const reply = parsed.replyTo.trim();

  /* Built before the request body so the key can be omitted entirely when
     there is nothing to attach - Brevo rejects `attachment: []` with
     "attachment is missing" rather than treating it as none. */
  const attachment = await Promise.all(
    images.map(async (image, index) => ({
      name: image.name || `screenshot-${index + 1}.png`,
      content: Buffer.from(await image.arrayBuffer()).toString("base64"),
    })),
  );

  const res = await fetch(BREVO_SEND, {
    method: "POST",
    headers: {
      "api-key": config.apiKey,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: { name: config.senderName, email: config.senderEmail },
      to: [{ email: config.recipient }],
      ...(EMAIL_SHAPE.test(reply) ? { replyTo: { email: reply } } : {}),
      subject: feedbackSubject(context.version),
      // Both, deliberately: HTML for readability, and the plain text as the
      // fallback every client that refuses HTML falls back to.
      htmlContent: formatFeedbackHtml({ ...parsed, images }, context),
      textContent: body,
      ...(attachment.length > 0 ? { attachment } : {}),
    }),
  });

  if (!res.ok) {
    // Brevo's message names the real cause (unverified sender, bad key, quota).
    // It goes to the server log, never to the client, which gets a flat 502 -
    // this endpoint should not narrate our mail configuration to the internet.
    console.error(`Brevo send failed (${res.status}): ${await res.text().catch(() => "no body")}`);
    return NextResponse.json({ error: "Could not send feedback" }, { status: 502 });
  }

  return NextResponse.json({ sent: true });
}

function checkImages(images: readonly File[]): string | null {
  if (images.length > MAX_IMAGES) return `At most ${MAX_IMAGES} images`;
  if (images.some((image) => !image.type.startsWith("image/"))) return "Attachments must be images";
  const total = images.reduce((sum, image) => sum + image.size, 0);
  if (total > MAX_IMAGE_BYTES_TOTAL) return "Images are too large";
  return null;
}
