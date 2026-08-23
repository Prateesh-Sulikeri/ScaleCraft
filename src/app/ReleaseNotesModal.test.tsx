import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { releaseNotes } from "@/content/release-notes";
import { ReleaseNotesModal } from "./ReleaseNotesModal";

const LATEST = releaseNotes[0];
const SECOND = releaseNotes[1];
const OLDEST = releaseNotes[releaseNotes.length - 1];

function currentSlide(): HTMLElement {
  return screen.getByRole("group");
}

describe("ReleaseNotesModal", () => {
  it("opens on the latest release", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const slide = currentSlide();
    expect(within(slide).getByText(`v${LATEST.version}`)).toBeInTheDocument();
    expect(within(slide).getByRole("heading", { name: LATEST.title })).toBeInTheDocument();
    for (const highlight of LATEST.highlights) {
      expect(within(slide).getByText(highlight.title)).toBeInTheDocument();
      expect(within(slide).getByText(highlight.body)).toBeInTheDocument();
    }
  });

  it("lists every release in the rail, newest marked latest", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const rail = screen.getByRole("navigation", { name: "Releases" });
    for (const note of releaseNotes) {
      expect(within(rail).getByText(note.version)).toBeInTheDocument();
    }
    expect(within(rail).getByText("Latest")).toBeInTheDocument();
  });

  it("shows one release at a time", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const slide = currentSlide();
    expect(within(slide).queryByText(SECOND.highlights[0].title)).not.toBeInTheDocument();
  });

  it("pages to the next older release and back", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Older release" }));
    expect(within(currentSlide()).getByText(`v${SECOND.version}`)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Newer release" }));
    expect(within(currentSlide()).getByText(`v${LATEST.version}`)).toBeInTheDocument();
  });

  it("stops at both ends of the timeline", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Newer release" })).toBeDisabled();

    const rail = screen.getByRole("navigation", { name: "Releases" });
    fireEvent.click(within(rail).getByText(OLDEST.version));
    expect(within(currentSlide()).getByText(`v${OLDEST.version}`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Older release" })).toBeDisabled();
  });

  it("jumps straight to a release picked from the rail", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const rail = screen.getByRole("navigation", { name: "Releases" });
    fireEvent.click(within(rail).getByText(OLDEST.version));

    const slide = currentSlide();
    expect(within(slide).getByRole("heading", { name: OLDEST.title })).toBeInTheDocument();
    expect(slide).toHaveAttribute(
      "aria-label",
      `Release ${releaseNotes.length} of ${releaseNotes.length}: ${OLDEST.version}`,
    );
  });

  it("pages with the arrow keys", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(within(currentSlide()).getByText(`v${SECOND.version}`)).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(within(currentSlide()).getByText(`v${LATEST.version}`)).toBeInTheDocument();
  });

  it("renders quality-of-life notes only for releases that have them", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const withQol = releaseNotes.findIndex((note) => note.qualityOfLife);
    const withoutQol = releaseNotes.findIndex((note) => !note.qualityOfLife);
    const rail = screen.getByRole("navigation", { name: "Releases" });

    fireEvent.click(within(rail).getByText(releaseNotes[withQol].version));
    expect(within(currentSlide()).getByText("Quality of life")).toBeInTheDocument();
    for (const item of releaseNotes[withQol].qualityOfLife ?? []) {
      expect(within(currentSlide()).getByText(item)).toBeInTheDocument();
    }

    fireEvent.click(within(rail).getByText(releaseNotes[withoutQol].version));
    expect(within(currentSlide()).queryByText("Quality of life")).not.toBeInTheDocument();
  });

  it("closes on the dialog's close control", () => {
    const onClose = vi.fn();
    render(<ReleaseNotesModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape", () => {
    const onClose = vi.fn();
    render(<ReleaseNotesModal onClose={onClose} />);
    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("draws one blueprint for the dialog, not one per release", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    const sheets = () => document.querySelectorAll('[data-illustration="release-line"]');
    expect(sheets()).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: "Older release" }));
    expect(sheets()).toHaveLength(1);
  });
});
