import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { NodeProps } from "@xyflow/react";
import { ModeNode } from "./ModeNode";
import type { ModeNodeType } from "./HomeCanvas";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
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
});
