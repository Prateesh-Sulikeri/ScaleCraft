import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { CodeBlock } from "./CodeBlock";

const codeToHtml = vi.fn((code: string) => `<pre><code>HIGHLIGHTED:${code}</code></pre>`);
const getLoadedLanguages = vi.fn(() => [] as string[]);
const loadLanguage = vi.fn().mockResolvedValue(undefined);

vi.mock("shiki", () => ({
  getSingletonHighlighter: vi.fn(() =>
    Promise.resolve({ getLoadedLanguages, loadLanguage, codeToHtml }),
  ),
}));

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

afterEach(() => {
  codeToHtml.mockClear();
  getLoadedLanguages.mockClear();
  loadLanguage.mockClear();
});

function renderCodeBlock(code: string, lang?: string, theme: "light" | "dark" = "dark") {
  return render(
    <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme={theme}>
      <CodeBlock code={code} lang={lang} />
    </NextThemesProvider>,
  );
}

describe("CodeBlock", () => {
  it("renders the plain fallback immediately when there's no language", () => {
    const { container } = renderCodeBlock("const x = 1;");
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(container.querySelector("pre code")?.className).toBe("");
    expect(codeToHtml).not.toHaveBeenCalled();
  });

  it("renders the highlighted HTML once Shiki resolves for a known language", async () => {
    renderCodeBlock("const x = 1;", "ts");
    await waitFor(() => expect(screen.getByText("HIGHLIGHTED:const x = 1;")).toBeInTheDocument());
    expect(codeToHtml).toHaveBeenCalledWith("const x = 1;", { lang: "ts", theme: "github-dark" });
  });

  it("loads the language first when it isn't already loaded", async () => {
    renderCodeBlock("print(1)", "python");
    await waitFor(() => expect(loadLanguage).toHaveBeenCalledWith("python"));
    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());
  });

  it("skips loadLanguage when the language is already loaded", async () => {
    getLoadedLanguages.mockReturnValue(["ts"]);
    renderCodeBlock("const x = 1;", "ts");
    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());
    expect(loadLanguage).not.toHaveBeenCalled();
  });

  it("picks the light Shiki theme when resolvedTheme is light", async () => {
    renderCodeBlock("const x = 1;", "ts", "light");
    await waitFor(() =>
      expect(codeToHtml).toHaveBeenCalledWith("const x = 1;", { lang: "ts", theme: "github-light" }),
    );
  });

  it("falls back to the plain block if highlighting throws", async () => {
    codeToHtml.mockImplementation(() => {
      throw new Error("boom");
    });
    renderCodeBlock("const x = 1;", "ts");
    await waitFor(() => expect(codeToHtml).toHaveBeenCalled());
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });
});
