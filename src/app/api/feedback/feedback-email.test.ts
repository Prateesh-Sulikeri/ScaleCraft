import { describe, it, expect } from "vitest";
import { formatFeedbackHtml } from "./feedback-email";
import {
  FEEDBACK_QUESTIONS,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  type FeedbackContext,
} from "@/home/feedback";

const context: FeedbackContext = {
  version: "7.1.0-alpha",
  page: "/building-blocks",
  viewport: "1512x950",
  browser: "TestBrowser/1.0",
};

const multiQuestion = FEEDBACK_QUESTIONS.find((q) => q.multi)!;

function html(overrides: Partial<Parameters<typeof formatFeedbackHtml>[0]> = {}) {
  return formatFeedbackHtml(
    {
      answers: { [FEEDBACK_QUESTIONS[0].id]: FEEDBACK_QUESTIONS[0].options[0] },
      written: { [FEEDBACK_WRITTEN_FIELDS[0].id]: "The canvas felt great." },
      replyTo: "",
      images: [],
      ...overrides,
    },
    context,
  );
}

describe("formatFeedbackHtml", () => {
  it("escapes free text, so a submission cannot rewrite the email around it", () => {
    const out = html({
      written: { [FEEDBACK_WRITTEN_FIELDS[0].id]: '</div><script>alert("x")</script>' },
      replyTo: '"><b>not-an-address',
    });
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
    expect(out).not.toContain('"><b>not-an-address');
  });

  it("keeps the line breaks someone typed", () => {
    const out = html({ written: { [FEEDBACK_WRITTEN_FIELDS[0].id]: "line one\nline two" } });
    expect(out).toContain("line one<br />line two");
  });

  it("leads with the reply address when there is one, and says so when there is not", () => {
    expect(html({ replyTo: "visitor@example.com" })).toContain("mailto:visitor@example.com");
    expect(html()).toContain("anonymous");
  });

  it("renders every section, question, and written field", () => {
    const out = html();
    for (const section of FEEDBACK_SECTIONS) expect(out).toContain(section.title);
    for (const question of FEEDBACK_QUESTIONS) expect(out).toContain(question.prompt);
    for (const field of FEEDBACK_WRITTEN_FIELDS) expect(out).toContain(field.label);
  });

  it("renders each option of a multi-select as its own chip", () => {
    const picked = multiQuestion.options.slice(0, 2);
    const out = html({ answers: { [multiQuestion.id]: [...picked] } });
    for (const option of picked) expect(out).toContain(option);
  });

  it("marks an unanswered question rather than leaving a blank", () => {
    expect(html({ answers: {} })).toContain("No answer");
    expect(html({ written: {} })).toContain("Nothing added.");
  });

  it("carries the environment context, including the screenshot count", () => {
    const out = html({ images: [{}, {}] });
    expect(out).toContain("7.1.0-alpha");
    expect(out).toContain("/building-blocks");
    expect(out).toContain("1512x950");
    expect(out).toContain("TestBrowser/1.0");
    expect(out).toMatch(/Screenshots<\/td>[\s\S]*?>2</);
  });

  it("never closes a style attribute early - a quoted font family would", () => {
    // Every style="..." must run to its closing quote with no double quote
    // inside it; one there truncates the attribute and drops the rest.
    for (const [, body] of html().matchAll(/style="([^"]*)"/g)) {
      expect(body).not.toContain("Segoe UI\"");
    }
    expect(html()).not.toContain('"Segoe UI"');
    expect(html()).toContain("'Segoe UI'");
  });

  it("uses no stylesheet or custom properties - mail clients resolve neither", () => {
    const out = html();
    expect(out).not.toContain("<style");
    expect(out).not.toContain("var(--");
    expect(out).not.toContain("color-mix");
  });
});
