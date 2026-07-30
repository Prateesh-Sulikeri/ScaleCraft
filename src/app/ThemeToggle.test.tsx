import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ThemeToggle } from "./ThemeToggle";

beforeAll(() => {
  // jsdom has no matchMedia; next-themes' provider watches system theme
  // changes via it unconditionally, even with enableSystem={false}.
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

// enableSystem={false} matches the app's own root layout usage (see
// theme-provider.tsx's doc comment: dark is the declared default, not tied
// to OS preference).
function renderToggle(defaultTheme: "light" | "dark" = "dark") {
  return render(
    <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme={defaultTheme}>
      <ThemeToggle />
    </NextThemesProvider>,
  );
}

describe("ThemeToggle", () => {
  it("shows the Sun icon and a switch-to-light label while in dark theme", () => {
    renderToggle("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });

  it("shows the Moon icon and a switch-to-dark label while in light theme", () => {
    renderToggle("light");
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });

  it("flips the label after a click, reflecting the new resolved theme", () => {
    renderToggle("dark");
    const button = screen.getByRole("button", { name: "Switch to light theme" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Switch to dark theme" })).toBeInTheDocument();
  });
});
