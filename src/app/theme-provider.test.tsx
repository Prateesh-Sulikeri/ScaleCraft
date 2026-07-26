import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThemeProvider } from "./theme-provider";

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
});

// A thin pass-through client wrapper around next-themes' own ThemeProvider
// (see the doc comment: it exists only so the server-component root layout
// doesn't itself need "use client"). No branching logic of its own, so this
// is a smoke test that it renders children and forwards props through.
describe("ThemeProvider", () => {
  it("renders its children", () => {
    render(
      <ThemeProvider attribute="data-theme" enableSystem={false} defaultTheme="dark">
        <p>child content</p>
      </ThemeProvider>,
    );
    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
