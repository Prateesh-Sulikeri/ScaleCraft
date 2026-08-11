import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { Walkthrough } from "./Walkthrough";
import { STEP_HOLD_MS } from "./player";
import type { WalkthroughEdge, WalkthroughNode, WalkthroughStep } from "./types";

const nodes: WalkthroughNode[] = [
  { id: "client", kind: "component", componentId: "client", position: { x: 70, y: 125 } },
  { id: "lb", kind: "component", componentId: "load-balancer", position: { x: 280, y: 125 } },
  { id: "app1", kind: "component", componentId: "app-server", position: { x: 520, y: 60 } },
];

const edges: WalkthroughEdge[] = [
  { id: "e1", source: "client", target: "lb", kind: "request-flow" },
  { id: "e2", source: "lb", target: "app1", kind: "request-flow" },
];

const steps: WalkthroughStep[] = [
  { caption: "The client sends a request to the Load Balancer.", highlightNodeIds: ["client", "lb"], highlightEdgeIds: ["e1"] },
  {
    caption: "Round-robin picks App Server 1.",
    highlightNodeIds: ["lb", "app1"],
    highlightEdgeIds: ["e2"],
    variants: {
      "least-connections": {
        caption: "Least-connections also picks App Server 1 here - it's the only healthy instance.",
        highlightNodeIds: ["lb", "app1"],
        highlightEdgeIds: ["e2"],
      },
    },
  },
];

const viewBoxWidth = 600;
const viewBoxHeight = 250;

const algorithms = [
  { id: "round-robin", label: "Round Robin" },
  { id: "least-connections", label: "Least Connections" },
];

function renderWalkthrough(props: Partial<React.ComponentProps<typeof Walkthrough>> = {}) {
  return render(
    <Walkthrough
      nodes={nodes}
      edges={edges}
      steps={steps}
      viewBoxWidth={viewBoxWidth}
      viewBoxHeight={viewBoxHeight}
      {...props}
    />,
  );
}

describe("Walkthrough", () => {
  it("renders step 1's caption and node labels on mount", () => {
    renderWalkthrough();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText(steps[0].caption)).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Load Balancer")).toBeInTheDocument();
  });

  it("advances to the next step's caption and disables Previous at the start", () => {
    renderWalkthrough();
    expect(screen.getByRole("button", { name: /previous step/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /next step/i }));

    expect(screen.getByText("2 / 2")).toBeInTheDocument();
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next step/i })).toBeDisabled();
  });

  it("navigates via arrow keys while focused", () => {
    renderWalkthrough();
    const group = screen.getByRole("group");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();

    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(screen.getByText(steps[0].caption)).toBeInTheDocument();
  });

  it("exposes the caption in an aria-live region", () => {
    renderWalkthrough();
    expect(screen.getByText(steps[0].caption)).toHaveAttribute("aria-live", "polite");
  });

  it("seeks directly to a step via the scrubber", () => {
    renderWalkthrough();
    fireEvent.change(screen.getByRole("slider", { name: "Step" }), { target: { value: "1" } });
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();
  });

  it("switches to a step's variant caption when a different algorithm is selected", () => {
    renderWalkthrough({ algorithms });
    fireEvent.change(screen.getByRole("slider", { name: "Step" }), { target: { value: "1" } });
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("combobox", { name: "Routing algorithm" }), {
      target: { value: "least-connections" },
    });
    expect(screen.getByText(steps[1].variants!["least-connections"].caption)).toBeInTheDocument();
  });

  it("autoplays to the next step and stops at the end", () => {
    vi.useFakeTimers();
    try {
      renderWalkthrough();
      fireEvent.click(screen.getByRole("button", { name: /play walkthrough/i }));

      act(() => void vi.advanceTimersByTime(STEP_HOLD_MS));
      expect(screen.getByText("2 / 2")).toBeInTheDocument();

      // Last step reached - playback stops rather than looping.
      expect(screen.getByRole("button", { name: /play walkthrough/i })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("resets to step 1", () => {
    renderWalkthrough();
    fireEvent.click(screen.getByRole("button", { name: /next step/i }));
    expect(screen.getByText("2 / 2")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /reset walkthrough/i }));
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("draws a packet on a highlighted request-flow edge, and nowhere else", () => {
    // Regression guard: the first implementation used SMIL animateMotion,
    // which mounts already past its own document-timeline begin time and so
    // drew nothing at all.
    const { container } = renderWalkthrough({
      steps: [
        steps[0],
        { caption: "Nothing is in flight here.", highlightNodeIds: ["app1"], highlightEdgeIds: [] },
      ],
    });
    // Attribute-scoped, not "any circle in the diagram" - the node cards'
    // own lucide icons are SVGs too.
    const packets = () => container.querySelectorAll("[data-walkthrough-packet]");

    expect(packets().length).toBeGreaterThan(0);

    fireEvent.change(screen.getByRole("slider", { name: "Step" }), { target: { value: "1" } });
    expect(packets()).toHaveLength(0);
  });

  it("cycles playback speed", () => {
    renderWalkthrough();
    fireEvent.click(screen.getByRole("button", { name: /playback speed 1x/i }));
    expect(screen.getByRole("button", { name: /playback speed 1.5x/i })).toBeInTheDocument();
  });
});
