import {
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  type FeedbackContext,
  type FeedbackResponse,
} from "@/home/feedback";

/**
 * The HTML half of a feedback email. Brevo gets this *and* the plain-text body
 * from `formatFeedbackBody`; clients that refuse HTML fall back to the text, so
 * neither is a substitute for the other.
 *
 * Written for mail clients, not browsers: tables instead of flex, inline styles
 * instead of a stylesheet (Gmail strips <style> from forwarded mail), and a
 * fixed light palette. Dark-mode inversion in mail clients is guesswork, so the
 * colours are stated once and left alone rather than fought over.
 *
 * Order differs from the dialog on purpose. The free text is the most useful
 * part of a submission, so it leads; the multiple-choice answers follow as
 * context, and the environment details sit at the bottom where they belong.
 */

/* Light-theme tokens from globals.css - values, not variables, since no mail
   client resolves custom properties. */
const INK = "#171717";
const MUTED = "#5c5c66";
const PANEL = "#ffffff";
const CANVAS = "#f6f6f7";
const BORDER = "#d4d4d8";
const ACCENT = "#1d4ed8";

/* Single quotes around the multi-word family, not double: this is interpolated
   into style="..." attributes, and a double quote there closes the attribute
   early and silently drops every declaration after it. */
const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;

/** Every dynamic value passes through this. The written answers are attacker-
 *  controlled free text going into an HTML document - unescaped, a submission
 *  could rewrite the email around it. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped, with the sender's own line breaks kept - a paragraph typed as three
 *  lines should not arrive as one. */
function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br />");
}

function sectionHeading(text: string): string {
  return `<tr><td style="padding:26px 0 10px 0;font:600 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};">${escapeHtml(text)}</td></tr>`;
}

/** One chosen option. Multi-selects render as several, which is why this is a
 *  chip rather than a line of comma-joined text. */
function chip(text: string): string {
  return `<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 11px;border:1px solid ${BORDER};border-radius:999px;background:${CANVAS};font:500 13px/1.3 ${FONT};color:${INK};">${escapeHtml(text)}</span>`;
}

function answerHtml(value: string | string[] | undefined): string {
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return `<span style="font:400 13px/1.4 ${FONT};color:#9a9aa3;font-style:italic;">No answer</span>`;
  }
  return (Array.isArray(value) ? value : [value]).map(chip).join("");
}

export function formatFeedbackHtml(
  response: Pick<FeedbackResponse, "answers" | "written" | "replyTo"> & { images: readonly unknown[] },
  context: FeedbackContext,
): string {
  const rows: string[] = [];

  // Reply address first: it is the only part of a submission that is
  // immediately actionable, and burying it under the answers means scrolling
  // back up to find out whether a reply is even possible.
  const reply = response.replyTo.trim();
  rows.push(
    `<tr><td style="padding:0 0 4px 0;">` +
      (reply
        ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;"><tr>` +
          `<td style="padding:12px 16px;background:#eff4ff;border:1px solid #c7d7fe;border-radius:8px;font:400 13px/1.5 ${FONT};color:${INK};">` +
          `Reply to <a href="mailto:${escapeHtml(reply)}" style="color:${ACCENT};font-weight:600;text-decoration:none;">${escapeHtml(reply)}</a>` +
          `</td></tr></table>`
        : `<div style="padding:12px 16px;background:${CANVAS};border:1px solid ${BORDER};border-radius:8px;font:400 13px/1.5 ${FONT};color:${MUTED};">No reply address given - this one is anonymous.</div>`) +
      `</td></tr>`,
  );

  // The free text leads: it is where the actual signal is.
  rows.push(sectionHeading("In their words"));
  for (const field of FEEDBACK_WRITTEN_FIELDS) {
    const value = response.written[field.id]?.trim();
    rows.push(
      `<tr><td style="padding:0 0 12px 0;">` +
        `<div style="font:600 13px/1.5 ${FONT};color:${INK};padding-bottom:5px;">${escapeHtml(field.label)}</div>` +
        (value
          ? `<div style="padding:12px 14px;background:${PANEL};border:1px solid ${BORDER};border-left:3px solid ${ACCENT};border-radius:6px;font:400 14px/1.65 ${FONT};color:${INK};white-space:normal;">${escapeMultiline(value)}</div>`
          : `<div style="font:400 13px/1.5 ${FONT};color:#9a9aa3;font-style:italic;">Nothing added.</div>`) +
        `</td></tr>`,
    );
  }

  for (const section of FEEDBACK_SECTIONS) {
    rows.push(sectionHeading(section.title));
    for (const question of section.questions) {
      rows.push(
        `<tr><td style="padding:0 0 14px 0;">` +
          `<div style="font:400 13px/1.5 ${FONT};color:${MUTED};padding-bottom:6px;">${escapeHtml(question.prompt)}</div>` +
          `<div>${answerHtml(response.answers[question.id])}</div>` +
          `</td></tr>`,
      );
    }
  }

  const facts: [string, string][] = [
    ["Version", context.version],
    ["Page", context.page],
    ["Viewport", context.viewport],
    ["Screenshots", String(response.images.length)],
    ["Browser", context.browser],
  ];
  rows.push(sectionHeading("Context"));
  rows.push(
    `<tr><td style="padding:0;">` +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border:1px solid ${BORDER};border-radius:8px;background:${PANEL};">` +
      facts
        .map(
          ([label, value], i) =>
            `<tr>` +
            `<td style="padding:9px 14px;${i > 0 ? `border-top:1px solid ${BORDER};` : ""}font:400 12px/1.5 ${FONT};color:${MUTED};white-space:nowrap;width:96px;">${escapeHtml(label)}</td>` +
            `<td style="padding:9px 14px 9px 0;${i > 0 ? `border-top:1px solid ${BORDER};` : ""}font:400 12px/1.5 ${FONT};color:${INK};word-break:break-word;">${escapeHtml(value)}</td>` +
            `</tr>`,
        )
        .join("") +
      `</table></td></tr>`,
  );

  return `<!doctype html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>ScaleCraft feedback</title></head>
<body style="margin:0;padding:0;background:${CANVAS};">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;background:${CANVAS};">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="border-collapse:collapse;width:100%;max-width:600px;">
  <tr><td style="padding:0 0 18px 0;border-bottom:2px solid ${INK};">
    <div style="font:700 19px/1.3 ${FONT};color:${INK};letter-spacing:-.01em;">ScaleCraft feedback</div>
    <div style="font:400 13px/1.5 ${FONT};color:${MUTED};padding-top:3px;">Alpha ${escapeHtml(context.version)} &middot; submitted from ${escapeHtml(context.page)}</div>
  </td></tr>
  <tr><td style="padding:18px 0 0 0;">
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">${rows.join("")}</table>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
