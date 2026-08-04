import { describe, it, expect, vi, beforeAll } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";
import { renderWithCanvasStore, stubResizeObserver } from "@/canvas/canvas-test-utils";
import { BlueprintLabContent } from "./BlueprintLabContent";
import type { ComponentNodeType, ArchitectureEdgeType } from "@/canvas/types";

/** One client -> load-balancer -> app-server chain, satisfying
 * EXAMPLE_BLUEPRINT's require pattern exactly once - node/edge ids suffixed
 * so multiple chains can coexist on the same board without colliding. */
function chain(suffix: string): { nodes: ComponentNodeType[]; edges: ArchitectureEdgeType[] } {
  const client: ComponentNodeType = {
    id: `client-${suffix}`,
    type: "component",
    position: { x: 0, y: 0 },
    data: { componentId: "client", config: {} },
  };
  const lb: ComponentNodeType = {
    id: `lb-${suffix}`,
    type: "component",
    position: { x: 200, y: 0 },
    data: { componentId: "load-balancer", config: {} },
  };
  const app: ComponentNodeType = {
    id: `app-${suffix}`,
    type: "component",
    position: { x: 400, y: 0 },
    data: { componentId: "app-server", config: {} },
  };
  return {
    nodes: [client, lb, app],
    edges: [
      { id: `e1-${suffix}`, source: client.id, target: lb.id, kind: "request-flow" },
      { id: `e2-${suffix}`, source: lb.id, target: app.id, kind: "request-flow" },
    ],
  };
}

vi.mock("@/canvas/Canvas", () => ({ Canvas: () => null }));

beforeAll(() => {
  stubResizeObserver();
});

describe("BlueprintLabContent", () => {
  it("renders the header and a pre-filled example blueprint", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByRole("heading", { name: "Blueprint Lab" })).toBeInTheDocument();
    const textarea = screen.getByLabelText(/Blueprint JSON/) as HTMLTextAreaElement;
    expect(textarea.value).toContain("example-client-lb-app");
  });

  it("shows 'not matched' against an empty canvas (no nodes to satisfy require)", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText("Blueprint not matched")).toBeInTheDocument();
    expect(screen.getByText("require: 0 match(es)")).toBeInTheDocument();
  });

  it("shows a parse error for invalid JSON", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/);
    fireEvent.change(textarea, { target: { value: "not valid json" } });
    expect(screen.getByText(/Invalid JSON|Unexpected token/)).toBeInTheDocument();
  });

  it("shows a shape error for JSON missing a require field", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/);
    fireEvent.change(textarea, { target: { value: "{}" } });
    expect(screen.getByText(/Expected an object with at least a `require`/)).toBeInTheDocument();
  });

  it("reports no rule violations against an empty canvas", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText(/Rule violations \(0, full registry\)/)).toBeInTheDocument();
    expect(screen.getByText("None.")).toBeInTheDocument();
  });

  it("'Load example' resets the textarea back to the example blueprint", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const textarea = screen.getByLabelText(/Blueprint JSON/) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "{}" } });
    expect(textarea.value).toBe("{}");
    fireEvent.click(screen.getByRole("button", { name: "Load example" }));
    expect(textarea.value).toContain("example-client-lb-app");
  });

  it("lists component ids/categories in the cheat sheet", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    expect(screen.getByText("Component ids / categories cheat sheet")).toBeInTheDocument();
    expect(screen.getByText("client")).toBeInTheDocument();
  });

  it("shows 'MATCHED' with a resolved binding once the canvas actually satisfies the example blueprint", () => {
    const { api } = renderWithCanvasStore(<BlueprintLabContent />);
    const { nodes, edges } = chain("1");
    act(() => api.getState().loadCanvasState(nodes, edges));

    expect(screen.getByText("Blueprint MATCHED")).toBeInTheDocument();
    expect(screen.getByText("require: 1 match(es)")).toBeInTheDocument();
    // Each binding row: "<alias> = <componentId> (<node id prefix>)", split
    // across a <span> and trailing text nodes - matched by full textContent.
    const bindingRow = (text: string) =>
      screen.getByText((_, el) => el?.tagName === "DIV" && el.textContent === text);
    expect(bindingRow("client = client (client-1)")).toBeInTheDocument();
    expect(bindingRow("lb = load-balancer (lb-1)")).toBeInTheDocument();
    expect(bindingRow("app = app-server (app-1)")).toBeInTheDocument();
  });

  it("truncates the binding list to 5 with an '...and N more' summary beyond that", () => {
    const { api } = renderWithCanvasStore(<BlueprintLabContent />);
    const chains = Array.from({ length: 6 }, (_, i) => chain(String(i)));
    act(() =>
      api.getState().loadCanvasState(chains.flatMap((c) => c.nodes), chains.flatMap((c) => c.edges)),
    );

    expect(screen.getByText("require: 6 match(es)")).toBeInTheDocument();
    expect(screen.getByText("…and 1 more.")).toBeInTheDocument();
  });

  it("blocks a match when a forbid pattern also matches", () => {
    const { api } = renderWithCanvasStore(<BlueprintLabContent />);
    const { nodes, edges } = chain("1");
    act(() => api.getState().loadCanvasState(nodes, edges));

    const textarea = screen.getByLabelText(/Blueprint JSON/);
    fireEvent.change(textarea, {
      target: {
        value: JSON.stringify({
          id: "test",
          require: {
            nodes: [
              { alias: "client", componentId: "client" },
              { alias: "lb", componentId: "load-balancer" },
            ],
            edges: [{ from: "client", to: "lb" }],
          },
          forbid: [
            {
              id: "no-direct-lb",
              nodes: [{ alias: "lb", componentId: "load-balancer" }],
            },
          ],
        }),
      },
    });

    expect(screen.getByText("Blueprint not matched")).toBeInTheDocument();
    expect(screen.getByText(/forbid\[0\] \(no-direct-lb\): blocks match/)).toBeInTheDocument();
  });

  it("a JSON.parse throw that isn't an Error instance still surfaces a fallback message", () => {
    renderWithCanvasStore(<BlueprintLabContent />);
    const parseSpy = vi.spyOn(JSON, "parse").mockImplementation(() => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw "not an Error instance";
    });

    fireEvent.change(screen.getByLabelText(/Blueprint JSON/), { target: { value: "anything" } });

    expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
    parseSpy.mockRestore();
  });
});
