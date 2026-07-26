import { describe, it, expect, beforeAll } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { renderWithCanvasStore } from "../canvas-test-utils";
import { FocusModeBar } from "./FocusModeBar";

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
    })) as unknown as typeof window.matchMedia;
});

function renderBar() {
  return renderWithCanvasStore(
    <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme="dark">
      <FocusModeBar />
    </NextThemesProvider>,
  );
}

describe("FocusModeBar", () => {
  it("renders the exit button and the theme toggle", () => {
    renderBar();
    expect(screen.getByRole("button", { name: /exit focus mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to (light|dark) theme/i })).toBeInTheDocument();
  });

  it("turns off focus mode when Exit is clicked", () => {
    const { api } = renderBar();
    api.getState().setFocusMode(true);
    fireEvent.click(screen.getByRole("button", { name: /exit focus mode/i }));
    expect(api.getState().docsPanel.focusMode).toBe(false);
  });
});
