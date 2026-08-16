import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import type { NodeProps } from "@xyflow/react";
import { ModeNode } from "./ModeNode";
import type { ModeNodeType } from "./HomeCanvas";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  // useRequireAuthAction (pulled in transitively via the Sandbox auth gate)
  // needs this to build the sign-in redirect's return URL.
  usePathname: () => "/",
}));

function makeNodeProps(data: ModeNodeType["data"]): NodeProps<ModeNodeType> {
  return {
    id: "n1",
    type: "mode",
    data,
    selected: false,
    isConnectable: true,
    zIndex: 0,
    dragging: false,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
  } as unknown as NodeProps<ModeNodeType>;
}

describe("ModeNode", () => {
  afterEach(() => {
    push.mockClear();
    vi.useRealTimers();
    // Restores (rather than mockReset()) the vitest.setup.ts default -
    // other tests in this file rely on that default implicitly instead of
    // setting it themselves, so a bare reset would leave them destructuring
    // `useAuth()`'s return value off `undefined` depending on run order.
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true } as ReturnType<typeof useAuth>);
  });

  it("renders as a disabled, non-navigable card when there's no href", () => {
    render(<ModeNode {...makeNodeProps({ mode: "building-blocks" })} />);
    expect(screen.getByText("Building Blocks")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Building Blocks").closest("[aria-disabled]")).toHaveAttribute("aria-disabled", "true");
  });

  it("renders a real link with an arrow affordance when href is present", () => {
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });
    expect(link).toHaveAttribute("href", "/sandbox");
    expect(link).toHaveTextContent("→");
  });

  it("shows a status badge when provided", () => {
    render(<ModeNode {...makeNodeProps({ mode: "real-world-extraction", status: "not started" })} />);
    expect(screen.getByText("not started")).toBeInTheDocument();
  });

  it("shows a muted x / y progress label when provided", () => {
    render(
      <ModeNode
        {...makeNodeProps({ mode: "building-blocks", status: "in progress", progressLabel: "1 / 26" })}
      />,
    );
    expect(screen.getByText("1 / 26 chapters")).toBeInTheDocument();
  });

  it("omits the progress label for Sandbox, which has no status", () => {
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    expect(screen.queryByText(/chapters/)).not.toBeInTheDocument();
  });

  it("intercepts a plain left-click, shows the loading transition, then navigates after the hold", () => {
    vi.useFakeTimers();
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });

    fireEvent.click(link, { button: 0 });
    expect(screen.getByText(/Crafting your Sandbox/)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1250);
    expect(push).toHaveBeenCalledWith("/sandbox");
  });

  it("lets modifier-clicks through natively, without intercepting navigation", () => {
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });

    fireEvent.click(link, { button: 0, metaKey: true });
    expect(screen.queryByText(/Crafting your Sandbox/)).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  // Sandbox is the one mode still route-gated (auth.protect()) - a
  // signed-out click used to hit that guard directly, an unexplained hard
  // bounce with no context, unlike every other progress-writing action in
  // the app.
  it("shows the sign-in prompt instead of navigating when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });

    fireEvent.click(link, { button: 0 });

    expect(screen.getByRole("alertdialog", { name: /sign in required/i })).toBeInTheDocument();
    expect(screen.queryByText(/Crafting your Sandbox/)).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  // Regression: the dialog is portaled to document.body, and React portals
  // bubble events through the React tree, not the DOM tree - with the
  // portal nested inside <Link onClick={handleClick}>, clicking "Not now"
  // also reached handleClick, which (still signed out) immediately reopened
  // the dialog it had just closed. The portal now renders as a sibling of
  // Link instead.
  it("closes the sign-in prompt on 'Not now' and does not reopen it", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });

    fireEvent.click(link, { button: 0 });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /not now/i }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  // Regression (found via a real CI e2e failure, not speculative): Clerk's
  // isSignedIn reads `undefined`, not `false`, for a brief window right
  // after a page load while the client SDK is still resolving the session -
  // a signed-in visitor whose click lands in that window must not see the
  // sign-in prompt just because isSignedIn hasn't resolved to `true` yet.
  it("falls through to normal navigation while auth is still loading, rather than assuming signed out", () => {
    vi.useFakeTimers();
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: undefined } as ReturnType<typeof useAuth>);
    render(<ModeNode {...makeNodeProps({ mode: "sandbox", href: "/sandbox" })} />);
    const link = screen.getByRole("link", { name: /Sandbox/ });

    fireEvent.click(link, { button: 0 });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByText(/Crafting your Sandbox/)).toBeInTheDocument();
    vi.advanceTimersByTime(1250);
    expect(push).toHaveBeenCalledWith("/sandbox");
  });
});
