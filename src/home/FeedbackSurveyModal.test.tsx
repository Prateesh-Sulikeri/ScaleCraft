import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  FEEDBACK_QUESTIONS,
  FEEDBACK_RECIPIENT,
  FEEDBACK_SECTIONS,
  FEEDBACK_WRITTEN_FIELDS,
  MAX_IMAGES,
} from "./feedback";
import { FeedbackSurveyModal } from "./FeedbackSurveyModal";

const SEND = { name: "Send feedback" };
const singleQuestion = FEEDBACK_QUESTIONS.find((q) => !q.multi)!;
const multiQuestion = FEEDBACK_QUESTIONS.find((q) => q.multi)!;

function png(name: string, size = 1024): File {
  const file = new File(["x"], name, { type: "image/png" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function attach(files: File[]) {
  const input = screen.getByLabelText("Attach screenshots");
  fireEvent.change(input, { target: { files } });
}

describe("FeedbackSurveyModal", () => {
  const originalLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: { href: "", pathname: "/" } });
    // jsdom has no object-URL implementation; the image strip needs one.
    if (!URL.createObjectURL) {
      Object.defineProperty(URL, "createObjectURL", { configurable: true, value: () => "blob:mock" });
      Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: () => {} });
    }
  });

  afterEach(() => {
    Object.defineProperty(window, "location", { configurable: true, value: originalLocation });
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("explains where the feedback goes before asking for any of it", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    expect(screen.getByText(/goes straight to the one person building ScaleCraft/)).toBeInTheDocument();
    expect(screen.getByText(/Nothing is required/)).toBeInTheDocument();
  });

  it("renders every section, question, and written field", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    for (const section of FEEDBACK_SECTIONS) expect(screen.getByText(section.title)).toBeInTheDocument();
    for (const question of FEEDBACK_QUESTIONS) expect(screen.getByText(question.prompt)).toBeInTheDocument();
    for (const field of FEEDBACK_WRITTEN_FIELDS) expect(screen.getByLabelText(field.label)).toBeInTheDocument();
    expect(screen.getByLabelText("Your email")).toBeInTheDocument();
  });

  it("discloses exactly what travels with the submission", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    expect(screen.getByText("What gets sent along with this")).toBeInTheDocument();
    expect(screen.getByText(/No progress data, canvas contents, or account details/)).toBeInTheDocument();
  });

  it("cannot be sent empty", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    expect(screen.getByRole("button", SEND)).toBeDisabled();
  });

  it("enables sending on a single answer, free text alone, or an image alone", () => {
    const { unmount } = render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    expect(screen.getByRole("button", SEND)).toBeEnabled();
    unmount();

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(FEEDBACK_WRITTEN_FIELDS[0].label), { target: { value: "A note." } });
    expect(screen.getByRole("button", SEND)).toBeEnabled();
  });

  it("toggles a single-select choice off on a second click", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    const option = screen.getByRole("button", { name: singleQuestion.options[0] });
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(option);
    expect(option).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", SEND)).toBeDisabled();
  });

  it("replaces the previous choice within a single-select question", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[1] }));
    expect(screen.getByRole("button", { name: singleQuestion.options[0] })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: singleQuestion.options[1] })).toHaveAttribute("aria-pressed", "true");
  });

  it("keeps multiple choices on the multi-select question", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: multiQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", { name: multiQuestion.options[1] }));
    expect(screen.getByRole("button", { name: multiQuestion.options[0] })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: multiQuestion.options[1] })).toHaveAttribute("aria-pressed", "true");
  });

  it("drops the oldest choice at the cap instead of ignoring the click", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    const cap = multiQuestion.maxChoices!;
    for (let i = 0; i <= cap; i++) {
      fireEvent.click(screen.getByRole("button", { name: multiQuestion.options[i] }));
    }
    expect(screen.getByRole("button", { name: multiQuestion.options[0] })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: multiQuestion.options[cap] })).toHaveAttribute("aria-pressed", "true");
  });

  it("attaches images and shows a running count", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    expect(screen.getByText(`0 / ${MAX_IMAGES}`)).toBeInTheDocument();
    attach([png("shot.png")]);
    expect(screen.getByText(`1 / ${MAX_IMAGES}`)).toBeInTheDocument();
    expect(screen.getByRole("button", SEND)).toBeEnabled();
  });

  it("removes an attached image", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach([png("shot.png")]);
    fireEvent.click(screen.getByRole("button", { name: "Remove shot.png" }));
    expect(screen.getByText(`0 / ${MAX_IMAGES}`)).toBeInTheDocument();
  });

  it("explains a rejected attachment rather than dropping it silently", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    const notAnImage = new File(["x"], "notes.pdf", { type: "application/pdf" });
    attach([notAnImage]);
    expect(screen.getByText("Only image files can be attached.")).toBeInTheDocument();
    expect(screen.getByText(`0 / ${MAX_IMAGES}`)).toBeInTheDocument();
  });

  it("disables the attach button at the cap", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach(Array.from({ length: MAX_IMAGES }, (_, i) => png(`s${i}.png`)));
    expect(screen.getByRole("button", { name: /Attach image/ })).toBeDisabled();
  });

  it("warns that a mail draft cannot carry the attachments when no service is configured", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach([png("shot.png")]);
    expect(screen.getByText(/cannot carry attachments/)).toBeInTheDocument();
  });

  it("says the mail app is opening when EmailJS is not configured", async () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/Your mail app is opening/)).toBeInTheDocument());
    expect(screen.getByText(new RegExp(FEEDBACK_RECIPIENT))).toBeInTheDocument();
    expect(window.location.href.startsWith(`mailto:${FEEDBACK_RECIPIENT}`)).toBe(true);
  });

  it("confirms a real send when EmailJS is configured", async () => {
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "key");
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/Sent. Thank you./)).toBeInTheDocument());
  });

  it("surfaces a failed send instead of a false thank-you", async () => {
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_SERVICE_ID", "service");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_TEMPLATE_ID", "template");
    vi.stubEnv("NEXT_PUBLIC_EMAILJS_PUBLIC_KEY", "key");
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/That did not send/)).toBeInTheDocument());
    expect(screen.getByRole("button", SEND)).toBeEnabled();
  });

  it("closes on Cancel without sending", () => {
    const onClose = vi.fn();
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<FeedbackSurveyModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
