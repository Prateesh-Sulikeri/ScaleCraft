import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootPage from "./page";

vi.mock("@/app/ThemeToggle", () => ({ ThemeToggle: () => <div data-testid="theme-toggle" /> }));
vi.mock("@/app/HomeCanvas", () => ({ HomeCanvas: () => <div data-testid="home-canvas" /> }));
vi.mock("@/app/AboutButton", () => ({ AboutButton: () => <div data-testid="about-button" /> }));
vi.mock("@/app/ReleaseNotesButton", () => ({ ReleaseNotesButton: () => <div data-testid="release-notes-button" /> }));

describe("RootPage", () => {
  it("composes the home canvas with theme toggle, about, and release notes controls", () => {
    render(<RootPage />);
    expect(screen.getByTestId("home-canvas")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
    expect(screen.getByTestId("about-button")).toBeInTheDocument();
    expect(screen.getByTestId("release-notes-button")).toBeInTheDocument();
  });
});
