import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Walkthrough } from "./Walkthrough";
import type { WalkthroughEdge, WalkthroughNode, WalkthroughStep } from "./types";

const nodes: WalkthroughNode[] = [
  { id: "client", kind: "component", componentId: "client", position: { x: 10, y: 50 } },
  { id: "lb", kind: "component", componentId: "load-balancer", position: { x: 50, y: 50 } },
  { id: "app1", kind: "component", componentId: "app-server", position: { x: 90, y: 50 } },
];

const edges: WalkthroughEdge[] = [
  { id: "e1", source: "client", target: "lb", kind: "request-flow" },
  { id: "e2", source: "lb", target: "app1", kind: "request-flow" },
];

const steps: WalkthroughStep[] = [
  { caption: "The client sends a request to the Load Balancer.", highlightNodeIds: ["client", "lb"], highlightEdgeIds: ["e1"] },
  { caption: "The Load Balancer forwards the request to App Server 1.", highlightNodeIds: ["lb", "app1"], highlightEdgeIds: ["e2"] },
];

describe("Walkthrough", () => {
  it("renders step 1's caption and node labels on mount", () => {
    render(<Walkthrough nodes={nodes} edges={edges} steps={steps} />);
    expect(screen.getByText("Step 1 of 2")).toBeInTheDocument();
    expect(screen.getByText(steps[0].caption)).toBeInTheDocument();
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Load Balancer")).toBeInTheDocument();
  });

  it("advances to the next step's caption on Next and disables Back at the start", () => {
    render(<Walkthrough nodes={nodes} edges={edges} steps={steps} />);
    expect(screen.getByRole("button", { name: /back/i })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Step 2 of 2")).toBeInTheDocument();
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("navigates via arrow keys while focused", () => {
    render(<Walkthrough nodes={nodes} edges={edges} steps={steps} />);
    const group = screen.getByRole("group");

    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();

    fireEvent.keyDown(group, { key: "ArrowLeft" });
    expect(screen.getByText(steps[0].caption)).toBeInTheDocument();
  });

  it("exposes the caption in an aria-live region", () => {
    render(<Walkthrough nodes={nodes} edges={edges} steps={steps} />);
    const caption = screen.getByText(steps[0].caption);
    expect(caption).toHaveAttribute("aria-live", "polite");
  });

  it("jumps directly to a step via its dot", () => {
    render(<Walkthrough nodes={nodes} edges={edges} steps={steps} />);
    fireEvent.click(screen.getByRole("tab", { name: "Step 2" }));
    expect(screen.getByText(steps[1].caption)).toBeInTheDocument();
  });
});
