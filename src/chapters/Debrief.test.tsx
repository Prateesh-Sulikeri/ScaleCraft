import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Debrief } from "./Debrief";
import type { Blueprint } from "@/content/chapters/types";

const cacheAside: Blueprint = {
  id: "cache-aside",
  label: "Cache-aside",
  require: { nodes: [] },
  commentary: "Reads check the cache first, falling back to the database on a miss.",
  referenceGraph: {
    nodes: [
      { id: "n1", componentId: "app-server", position: { x: 0, y: 0 }, config: {} },
      { id: "n2", componentId: "cache", position: { x: 0, y: 0 }, config: {} },
    ],
    edges: [{ id: "e1", source: "n1", target: "n2", kind: "request-flow" }],
    entryPointIds: [],
  },
};

const queueBased: Blueprint = {
  id: "queue-based",
  label: "Queue-based writes",
  require: { nodes: [] },
  commentary: "Writes are enqueued and processed asynchronously.",
};

describe("Debrief", () => {
  it("renders nothing when the chapter declared no blueprints", () => {
    const { container } = render(<Debrief blueprints={[]} matchedBlueprintId={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("is closed by default and never auto-opens", () => {
    render(<Debrief blueprints={[cacheAside]} matchedBlueprintId={null} />);
    const toggle = screen.getByRole("button", { name: /debrief/i });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText(cacheAside.commentary)).not.toBeInTheDocument();
  });

  it("reveals every declared blueprint's label and commentary once opened", () => {
    render(<Debrief blueprints={[cacheAside, queueBased]} matchedBlueprintId="cache-aside" />);
    fireEvent.click(screen.getByRole("button", { name: /debrief/i }));

    expect(screen.getByText("Cache-aside")).toBeInTheDocument();
    expect(screen.getByText(cacheAside.commentary)).toBeInTheDocument();
    expect(screen.getByText("Queue-based writes")).toBeInTheDocument();
    expect(screen.getByText(queueBased.commentary)).toBeInTheDocument();
  });

  it("visually distinguishes the matched blueprint without hiding the others", () => {
    render(<Debrief blueprints={[cacheAside, queueBased]} matchedBlueprintId="cache-aside" />);
    fireEvent.click(screen.getByRole("button", { name: /debrief/i }));

    const badges = screen.getAllByText(/your approach/i);
    expect(badges).toHaveLength(1);
    // Both blueprints' commentary is still visible — the payoff of seeing
    // alternate valid shapes isn't limited to the one that matched.
    expect(screen.getByText(cacheAside.commentary)).toBeInTheDocument();
    expect(screen.getByText(queueBased.commentary)).toBeInTheDocument();
  });

  it("renders a referenceGraph as a component-label edge summary", () => {
    render(<Debrief blueprints={[cacheAside]} matchedBlueprintId={null} />);
    fireEvent.click(screen.getByRole("button", { name: /debrief/i }));

    expect(screen.getByText("Application Server")).toBeInTheDocument();
    expect(screen.getByText("Cache")).toBeInTheDocument();
  });
});
