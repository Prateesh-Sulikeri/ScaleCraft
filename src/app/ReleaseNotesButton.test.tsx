import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReleaseNotesButton } from "./ReleaseNotesButton";
import { releaseNotes } from "@/content/release-notes";

describe("ReleaseNotesButton", () => {
  it("renders the trigger and keeps the modal closed by default", () => {
    render(<ReleaseNotesButton />);
    expect(screen.getByRole("button", { name: "Release notes" })).toBeInTheDocument();
    expect(screen.queryByText("Release notes", { selector: "h2" })).not.toBeInTheDocument();
  });

  it("opens the modal on click, showing the latest version and every release's highlights", () => {
    render(<ReleaseNotesButton />);
    fireEvent.click(screen.getByRole("button", { name: "Release notes" }));

    expect(screen.getByText(`Alpha ${releaseNotes[0].version}`)).toBeInTheDocument();
    for (const note of releaseNotes) {
      expect(screen.getByText(note.version)).toBeInTheDocument();
      for (const highlight of note.highlights) {
        expect(screen.getByText(highlight)).toBeInTheDocument();
      }
    }
  });

  it("closes on the close (X) control", () => {
    render(<ReleaseNotesButton />);
    fireEvent.click(screen.getByRole("button", { name: "Release notes" }));
    fireEvent.click(screen.getByRole("button", { name: "Close docs" }));
    expect(screen.queryByText(`Alpha ${releaseNotes[0].version}`)).not.toBeInTheDocument();
  });
});
