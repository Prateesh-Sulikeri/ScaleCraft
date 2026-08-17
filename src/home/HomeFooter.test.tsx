import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeFooter } from "./HomeFooter";

describe("HomeFooter", () => {
  it("carries ownership and attribution", () => {
    render(<HomeFooter />);
    expect(screen.getByText("© 2026 ScaleCraft. All rights reserved.")).toBeInTheDocument();
    expect(screen.getByText(/by Prateesh/)).toBeInTheDocument();
  });

  it("does not link GitHub", () => {
    render(<HomeFooter />);
    expect(screen.queryByText(/GitHub/i)).not.toBeInTheDocument();
  });

  it("marks ScaleDocs upcoming rather than linking it", () => {
    render(<HomeFooter />);
    expect(screen.getByText("ScaleDocs")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /ScaleDocs/ })).not.toBeInTheDocument();
    expect(screen.getByText("Soon")).toBeInTheDocument();
  });

  it("opens the About dialog", () => {
    render(<HomeFooter />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    expect(screen.getByText("About ScaleCraft")).toBeInTheDocument();
    expect(screen.getByText(/interactive system-design lab/)).toBeInTheDocument();
  });

  it("opens the feedback survey", () => {
    render(<HomeFooter />);
    fireEvent.click(screen.getByRole("button", { name: "Feedback" }));
    expect(screen.getByText("How is ScaleCraft working out so far?")).toBeInTheDocument();
  });

  it("closes a dialog again", () => {
    render(<HomeFooter />);
    fireEvent.click(screen.getByRole("button", { name: "About" }));
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(screen.queryByText("About ScaleCraft")).not.toBeInTheDocument();
  });
});
