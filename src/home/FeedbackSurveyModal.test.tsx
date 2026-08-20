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

/** The dropzone doubles as the browse control - one target for both ways in. */
const dropzone = () => screen.getByRole("button", { name: /click to browse/i });

/**
 * Stands in for /api/feedback, which the dialog hits twice: a GET on mount to
 * learn whether attachments can travel, and a POST on send. Both go through
 * one spy, keyed by method, so a test only states the two outcomes it cares
 * about. `send: null` makes the POST reject, standing for an offline browser.
 */
function mockRoute({ configured = true, send = 200 }: { configured?: boolean; send?: number | null } = {}) {
  return vi.spyOn(globalThis, "fetch").mockImplementation((_url, init) => {
    if (init?.method === "POST") {
      return send === null ? Promise.reject(new Error("offline")) : Promise.resolve(new Response(null, { status: send }));
    }
    return Promise.resolve(Response.json({ configured }));
  });
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
    expect(screen.getByText("Technical details")).toBeInTheDocument();
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
    expect(screen.getByText(`0 / ${MAX_IMAGES} images`)).toBeInTheDocument();
    attach([png("shot.png")]);
    expect(screen.getByText(`1 / ${MAX_IMAGES} images`)).toBeInTheDocument();
    expect(screen.getByRole("button", SEND)).toBeEnabled();
  });

  it("removes an attached image", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach([png("shot.png")]);
    fireEvent.click(screen.getByRole("button", { name: "Remove shot.png" }));
    expect(screen.getByText(`0 / ${MAX_IMAGES} images`)).toBeInTheDocument();
  });

  it("accepts a drop on the dropzone, not just a browse", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.drop(dropzone(), { dataTransfer: { files: [png("dropped.png")] } });
    expect(screen.getByText(`1 / ${MAX_IMAGES} images`)).toBeInTheDocument();
  });

  it("explains a rejected attachment rather than dropping it silently", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    const notAnImage = new File(["x"], "notes.pdf", { type: "application/pdf" });
    attach([notAnImage]);
    expect(screen.getByText("Only image files can be attached.")).toBeInTheDocument();
    expect(screen.getByText(`0 / ${MAX_IMAGES} images`)).toBeInTheDocument();
  });

  it("disables the dropzone at the cap", () => {
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach(Array.from({ length: MAX_IMAGES }, (_, i) => png(`s${i}.png`)));
    expect(dropzone()).toBeDisabled();
  });

  it("warns that a mail draft cannot carry the attachments when no service is configured", async () => {
    mockRoute({ configured: false });
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach([png("shot.png")]);
    await waitFor(() => expect(screen.getByText(/cannot carry attachments/)).toBeInTheDocument());
  });

  it("stays quiet about attachments when the server can actually send them", async () => {
    mockRoute({ configured: true });
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    attach([png("shot.png")]);
    await waitFor(() => expect(screen.getByAltText("shot.png")).toBeInTheDocument());
    expect(screen.queryByText(/cannot carry attachments/)).not.toBeInTheDocument();
  });

  it("says the mail app is opening when the server has no mail service", async () => {
    mockRoute({ configured: false, send: 501 });
    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/Your mail app is opening/)).toBeInTheDocument());
    expect(screen.getByText(new RegExp(FEEDBACK_RECIPIENT))).toBeInTheDocument();
    expect(window.location.href.startsWith(`mailto:${FEEDBACK_RECIPIENT}`)).toBe(true);
  });

  it("confirms a real send when the route accepts it", async () => {
    mockRoute({ send: 200 });

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/Sent. Thank you./)).toBeInTheDocument());
  });

  it("surfaces a failed send instead of a false thank-you", async () => {
    mockRoute({ send: null });

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/That did not send/)).toBeInTheDocument());
    expect(screen.getByRole("button", SEND)).toBeEnabled();
  });

  it("names a rate limit as one, rather than blaming the connection", async () => {
    mockRoute({ send: 429 });

    render(<FeedbackSurveyModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: singleQuestion.options[0] }));
    fireEvent.click(screen.getByRole("button", SEND));
    await waitFor(() => expect(screen.getByText(/a few submissions in a short window/)).toBeInTheDocument());
    expect(screen.queryByText(/Check your connection/)).not.toBeInTheDocument();
  });

  it("closes on Cancel without sending", () => {
    const onClose = vi.fn();
    const fetchSpy = mockRoute();
    render(<FeedbackSurveyModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalled();
    // The mount probe is a GET; nothing was submitted.
    expect(fetchSpy.mock.calls.every(([, init]) => init?.method !== "POST")).toBe(true);
  });
});
