import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { releaseNotes } from "@/content/release-notes";
import { SeeWhatsNewButton } from "./SeeWhatsNewButton";

const RELEASED_AT = Date.parse(`${releaseNotes[0].date}T00:00:00Z`);
const DAY = 86_400_000;

describe("SeeWhatsNewButton", () => {
  it("opens the changelog, latest release first", () => {
    render(<SeeWhatsNewButton now={RELEASED_AT} />);
    expect(screen.queryByText("Release notes")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Check Updates/ }));
    expect(screen.getByText("Release notes")).toBeInTheDocument();
    expect(screen.getByText(`Alpha ${releaseNotes[0].version}`)).toBeInTheDocument();
    expect(screen.getByText(releaseNotes[0].highlights[0])).toBeInTheDocument();
  });

  it("closes the changelog again", () => {
    render(<SeeWhatsNewButton now={RELEASED_AT} />);
    fireEvent.click(screen.getByRole("button", { name: /Check Updates/ }));
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByText("Release notes")).not.toBeInTheDocument();
  });

  it("marks a fresh release NEW", () => {
    render(<SeeWhatsNewButton now={RELEASED_AT} />);
    expect(screen.getByText("New")).toBeInTheDocument();
  });

  it("drops the NEW marker once the release is old", () => {
    render(<SeeWhatsNewButton now={RELEASED_AT + 90 * DAY} />);
    expect(screen.queryByText("New")).not.toBeInTheDocument();
  });

  it("holds the NEW marker back until the client knows the date", () => {
    render(<SeeWhatsNewButton now={null} />);
    expect(screen.queryByText("New")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Check Updates/ })).toBeInTheDocument();
  });
});
