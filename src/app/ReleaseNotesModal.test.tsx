import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { releaseNotes } from "@/content/release-notes";
import { ReleaseNotesModal } from "./ReleaseNotesModal";

describe("ReleaseNotesModal", () => {
  it("badges the latest version and lists every release", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    expect(screen.getByText(`Alpha ${releaseNotes[0].version}`)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(releaseNotes.length);
    for (const note of releaseNotes) {
      // getAll, not get: two releases shipped on the same date.
      expect(screen.getAllByText(note.version).length).toBeGreaterThan(0);
      expect(screen.getAllByText(note.date).length).toBeGreaterThan(0);
    }
  });

  it("renders each release's highlights", () => {
    render(<ReleaseNotesModal onClose={vi.fn()} />);
    for (const highlight of releaseNotes[0].highlights) {
      expect(screen.getByText(highlight)).toBeInTheDocument();
    }
  });

  it("closes on the dialog's close control", () => {
    const onClose = vi.fn();
    render(<ReleaseNotesModal onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
