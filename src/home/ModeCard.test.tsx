import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { ModeCard } from "./ModeCard";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, prefetch: vi.fn() }),
  usePathname: () => "/",
}));

beforeEach(() => {
  push.mockClear();
  vi.useRealTimers();
  vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
});

describe("ModeCard", () => {
  it("renders the mode's identity, tagline, short code, and progress", () => {
    render(
      <ModeCard mode="building-blocks" href="/building-blocks" progress={{ completed: 3, total: 40, percent: 8 }} />,
    );
    expect(screen.getByRole("link", { name: /Building Blocks/ })).toHaveAttribute("href", "/building-blocks");
    expect(screen.getByText("Guided, constrained lessons - one concept at a time.")).toBeInTheDocument();
    expect(screen.getByText("BUILD")).toBeInTheDocument();
    expect(screen.getByText("3 / 40 chapters")).toBeInTheDocument();
    expect(screen.getByText("8%")).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: "Building Blocks progress: 8%" })).toBeInTheDocument();
  });

  it("shows freeform metadata instead of progress for Sandbox", () => {
    render(<ModeCard mode="sandbox" href="/sandbox" />);
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText(/Free-Form/i)).toBeInTheDocument();
  });

  it("navigates a course card natively, with no held overlay", () => {
    render(<ModeCard mode="real-world-extraction" href="/real-world-extraction" progress={{ completed: 0, total: 32, percent: 0 }} />);
    fireEvent.click(screen.getByRole("link", { name: /Real World Extraction/ }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.queryByText(/Crafting your/)).not.toBeInTheDocument();
  });

  it("holds the branded transition before pushing Sandbox", () => {
    vi.useFakeTimers();
    render(<ModeCard mode="sandbox" href="/sandbox" />);
    fireEvent.click(screen.getByRole("link", { name: /Sandbox/ }));
    expect(screen.getByText("Crafting your Sandbox…")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    vi.advanceTimersByTime(700);
    expect(push).toHaveBeenCalledWith("/sandbox");
  });

  it("prompts a signed-out visitor instead of bouncing them into the route guard", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<ModeCard mode="sandbox" href="/sandbox" />);
    fireEvent.click(screen.getByRole("link", { name: /Sandbox/ }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Sign in / sign up" })).toBeInTheDocument();
  });

  it("falls through to navigation while Clerk is still resolving the session", () => {
    vi.useFakeTimers();
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: undefined } as ReturnType<typeof useAuth>);
    render(<ModeCard mode="sandbox" href="/sandbox" />);
    fireEvent.click(screen.getByRole("link", { name: /Sandbox/ }));
    vi.advanceTimersByTime(700);
    expect(push).toHaveBeenCalledWith("/sandbox");
  });

  it("leaves a modifier-click to the browser", () => {
    render(<ModeCard mode="sandbox" href="/sandbox" />);
    fireEvent.click(screen.getByRole("link", { name: /Sandbox/ }), { metaKey: true });
    expect(screen.queryByText(/Crafting your/)).not.toBeInTheDocument();
  });
});
