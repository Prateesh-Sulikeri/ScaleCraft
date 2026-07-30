import { beforeAll, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { ReactFlowProvider } from "@xyflow/react";
import { CommentNode } from "./CommentNode";
import { renderWithCanvasStore, stubResizeObserver } from "./canvas-test-utils";
import { DEFAULT_COMMENT_COLOR } from "./annotation-colors";
import type { CommentNodeType } from "./types";

beforeAll(() => {
  stubResizeObserver();
});

function baseProps(overrides: Partial<CommentNodeType["data"]> = {}, selected = false) {
  return {
    id: "c1",
    type: "comment" as const,
    selected,
    dragging: false,
    zIndex: -1,
    selectable: true,
    deletable: true,
    draggable: true,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    data: { text: "", width: 176, height: 60, ...overrides },
  };
}

/** jsdom's CSSStyleDeclaration normalizes any hex color it parses to
 * rgb(...) form (and, inside color-mix(), even drops an unrecognized
 * percentage token) — so a literal "#rrggbb" never appears verbatim in a
 * rendered style string inside this environment. Converting the expected
 * hex to the same rgb(...) form jsdom would produce is what makes these
 * assertions meaningful instead of chasing jsdom's own CSS parsing quirks. */
function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
}

function renderComment(props: ReturnType<typeof baseProps>) {
  const utils = renderWithCanvasStore(
    <ReactFlowProvider>
      <CommentNode {...props} />
    </ReactFlowProvider>,
  );
  utils.api
    .getState()
    .loadCanvasState([{ id: props.id, type: "comment", position: { x: 0, y: 0 }, data: props.data }], []);
  return utils;
}

describe("CommentNode", () => {
  it("renders the comment text in a placeholder textarea", () => {
    renderComment(baseProps());
    expect(screen.getByPlaceholderText("Comment…")).toHaveValue("");
  });

  it("hides lock/edit controls when not selected", () => {
    renderComment(baseProps({ text: "hello" }, false));
    expect(screen.queryByLabelText("Lock comment")).not.toBeInTheDocument();
  });

  it("shows lock/edit controls and the text value when selected", () => {
    renderComment(baseProps({ text: "check the source" }, true));
    expect(screen.getByDisplayValue("check the source")).toBeInTheDocument();
    expect(screen.getByLabelText("Lock comment")).toBeInTheDocument();
    expect(screen.getByLabelText("Edit comment")).toBeInTheDocument();
  });

  it("typing updates the comment's text via the store", () => {
    const { api } = renderComment(baseProps());
    fireEvent.change(screen.getByPlaceholderText("Comment…"), { target: { value: "a new note" } });
    const node = api.getState().nodes.find((n) => n.id === "c1");
    expect(node?.type === "comment" && node.data.text).toBe("a new note");
  });

  it("clicking the lock button toggles locked via the store", () => {
    const { api } = renderComment(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Lock comment"));
    const node = api.getState().nodes.find((n) => n.id === "c1");
    expect(node?.type === "comment" && node.data.locked).toBe(true);
  });

  it("shows the Locked badge when data.locked is true", () => {
    renderComment(baseProps({ locked: true }));
    expect(screen.getByLabelText("Locked")).toBeInTheDocument();
  });

  it("clicking the edit (pencil) button opens the annotation editor at the click point", () => {
    const { api } = renderComment(baseProps({}, true));
    fireEvent.click(screen.getByLabelText("Edit comment"), { clientX: 12, clientY: 34 });
    expect(api.getState().editingAnnotation).toEqual({ id: "c1", anchor: { x: 12, y: 34 } });
  });

  it("falls back to DEFAULT_COMMENT_COLOR when no color is set", () => {
    const { container } = renderComment(baseProps());
    const el = container.querySelector(".relative.flex.flex-col") as HTMLElement;
    expect(el.style.borderColor).toContain(hexToRgb(DEFAULT_COMMENT_COLOR));
  });

  it("uses HIGHLIGHT_GOLD for the border when highlighted", () => {
    const { container } = renderComment(baseProps({ highlighted: true }));
    const el = container.querySelector(".relative.flex.flex-col") as HTMLElement;
    expect(el.style.borderColor).toBe(hexToRgb("#f2b90a"));
  });
});
