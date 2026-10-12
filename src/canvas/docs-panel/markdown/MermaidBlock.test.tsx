import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { MermaidBlock } from "./MermaidBlock";

const initialize = vi.fn();
const renderFn = vi.fn().mockResolvedValue({ svg: "<svg>diagram</svg>" });

vi.mock("mermaid", () => ({
  default: {
    initialize: (...args: unknown[]) => initialize(...args),
    render: (...args: unknown[]) => renderFn(...args),
  },
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
  initialize.mockClear();
  renderFn.mockClear();
  renderFn.mockResolvedValue({ svg: "<svg>diagram</svg>" });
});

function renderBlock(code: string, theme: "light" | "dark" = "dark") {
  return render(
    <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme={theme}>
      <MermaidBlock code={code} />
    </NextThemesProvider>,
  );
}

describe("MermaidBlock", () => {
  it("shows the loading placeholder before mermaid resolves", () => {
    renderFn.mockReturnValue(new Promise(() => {})); // never resolves
    renderBlock("graph TD; A-->B;");
    expect(screen.getByText(/rendering diagram/i)).toBeInTheDocument();
  });

  it("renders the resolved SVG once mermaid succeeds", async () => {
    const { container } = renderBlock("graph TD; A-->B;");
    await waitFor(() => expect(container.querySelector("svg")).toBeInTheDocument());
    expect(container.textContent).toContain("diagram");
  });

  it("initializes mermaid's base theme from the app's color tokens", async () => {
    document.documentElement.style.setProperty("--foreground", "#ededed");
    document.documentElement.style.setProperty("--background", "#0a0a0a");
    renderBlock("graph TD; A-->B;", "dark");
    await waitFor(() =>
      expect(initialize).toHaveBeenCalledWith(
        expect.objectContaining({
          theme: "base",
          startOnLoad: false,
          securityLevel: "strict",
          themeVariables: expect.objectContaining({ primaryTextColor: "#ededed", background: "#0a0a0a" }),
        }),
      ),
    );
    document.documentElement.removeAttribute("style");
  });

  it("uses the base theme in light mode too", async () => {
    renderBlock("graph TD; A-->B;", "light");
    await waitFor(() => expect(initialize).toHaveBeenCalledWith(expect.objectContaining({ theme: "base" })));
  });

  it("shows an error message when mermaid.render rejects", async () => {
    renderFn.mockRejectedValue(new Error("bad syntax"));
    renderBlock("not a real diagram");
    expect(await screen.findByText(/couldn't render this diagram: bad syntax/i)).toBeInTheDocument();
  });

  it("clears a stale error once a later render succeeds", async () => {
    renderFn.mockRejectedValueOnce(new Error("bad syntax"));
    const { rerender, container } = renderBlock("broken");
    expect(await screen.findByText(/couldn't render this diagram/i)).toBeInTheDocument();

    renderFn.mockResolvedValue({ svg: "<svg>fixed</svg>" });
    rerender(
      <NextThemesProvider attribute="data-theme" enableSystem={false} defaultTheme="dark">
        <MermaidBlock code="fixed diagram" />
      </NextThemesProvider>,
    );
    await waitFor(() => expect(container.querySelector("svg")).toBeInTheDocument());
    expect(screen.queryByText(/couldn't render this diagram/i)).not.toBeInTheDocument();
  });
});
