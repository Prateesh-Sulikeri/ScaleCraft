import { describe, expect, it } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { AnnotationEditor } from "./AnnotationEditor";
import { renderWithCanvasStore } from "./canvas-test-utils";
import { DEFAULT_COMMENT_COLOR, DEFAULT_ZONE_COLOR } from "./annotation-colors";
import type { AnyNodeType } from "./types";

describe("AnnotationEditor", () => {
  it("renders nothing when editingAnnotation is null", () => {
    const { container } = renderWithCanvasStore(<AnnotationEditor />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when editingAnnotation points at a node that no longer exists", () => {
    const { api, container } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => api.getState().openAnnotationEditor("missing", { x: 10, y: 10 }));
    expect(container).toBeEmptyDOMElement();
  });

  it("shows a text input for a zone's label, seeded with its current value and color", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "Backend", width: 320, height: 220, color: "#a855f7" },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([zone], []);
      api.getState().openAnnotationEditor("z1", { x: 10, y: 10 });
    });

    expect(screen.getByText("Zone label")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Zone label")).toHaveValue("Backend");
  });

  it("editing a zone's label input calls updateZone", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([zone], []);
      api.getState().openAnnotationEditor("z1", { x: 10, y: 10 });
    });

    fireEvent.change(screen.getByPlaceholderText("Zone label"), { target: { value: "Frontend" } });
    const node = api.getState().nodes.find((n) => n.id === "z1");
    expect(node?.type === "zone" && node.data.label).toBe("Frontend");
  });

  it("shows a textarea for a comment's text", () => {
    const comment: AnyNodeType = {
      id: "c1",
      type: "comment",
      position: { x: 0, y: 0 },
      data: { text: "hello", width: 176, height: 60 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([comment], []);
      api.getState().openAnnotationEditor("c1", { x: 10, y: 10 });
    });

    expect(screen.getByText("Comment")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Comment…")).toHaveValue("hello");
  });

  it("editing a comment's textarea calls updateComment", () => {
    const comment: AnyNodeType = {
      id: "c1",
      type: "comment",
      position: { x: 0, y: 0 },
      data: { text: "", width: 176, height: 60 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([comment], []);
      api.getState().openAnnotationEditor("c1", { x: 10, y: 10 });
    });

    fireEvent.change(screen.getByPlaceholderText("Comment…"), { target: { value: "note text" } });
    const node = api.getState().nodes.find((n) => n.id === "c1");
    expect(node?.type === "comment" && node.data.text).toBe("note text");
  });

  it("shows only a color picker (no label/text field) for a start marker", () => {
    const start: AnyNodeType = {
      id: "s1",
      type: "start",
      position: { x: 0, y: 0 },
      data: { label: "", targetId: null },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([start], []);
      api.getState().openAnnotationEditor("s1", { x: 10, y: 10 });
    });

    expect(screen.getByText("Flag color")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Zone label")).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Comment…")).not.toBeInTheDocument();
  });

  it("changing the color picker for a start marker calls updateStartMarker", () => {
    const start: AnyNodeType = {
      id: "s1",
      type: "start",
      position: { x: 0, y: 0 },
      data: { label: "", targetId: null },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([start], []);
      api.getState().openAnnotationEditor("s1", { x: 10, y: 10 });
    });

    const colorInput = screen.getByTitle("Custom color").querySelector("input[type='color']") as HTMLInputElement;
    fireEvent.change(colorInput, { target: { value: "#123456" } });
    const node = api.getState().nodes.find((n) => n.id === "s1");
    expect(node?.type === "start" && node.data.color).toBe("#123456");
  });

  it("clicking Done closes the editor", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([zone], []);
      api.getState().openAnnotationEditor("z1", { x: 10, y: 10 });
    });

    fireEvent.click(screen.getByText("Done"));
    expect(api.getState().editingAnnotation).toBeNull();
  });

  it("pressing Escape closes the editor", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([zone], []);
      api.getState().openAnnotationEditor("z1", { x: 10, y: 10 });
    });

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(api.getState().editingAnnotation).toBeNull();
  });

  it("falls back to DEFAULT_ZONE_COLOR when a zone has no color set", () => {
    const zone: AnyNodeType = {
      id: "z1",
      type: "zone",
      position: { x: 0, y: 0 },
      data: { label: "", width: 320, height: 220 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([zone], []);
      api.getState().openAnnotationEditor("z1", { x: 10, y: 10 });
    });
    const n = parseInt(DEFAULT_ZONE_COLOR.slice(1), 16);
    const expectedRgb = `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    const swatch = screen.getByTitle("Custom color") as HTMLElement;
    expect(swatch.style.backgroundColor).toBe(expectedRgb);
  });

  it("falls back to DEFAULT_COMMENT_COLOR when a comment has no color set", () => {
    const comment: AnyNodeType = {
      id: "c1",
      type: "comment",
      position: { x: 0, y: 0 },
      data: { text: "", width: 176, height: 60 },
    };
    const { api } = renderWithCanvasStore(<AnnotationEditor />);
    act(() => {
      api.getState().loadCanvasState([comment], []);
      api.getState().openAnnotationEditor("c1", { x: 10, y: 10 });
    });
    const n = parseInt(DEFAULT_COMMENT_COLOR.slice(1), 16);
    const expectedRgb = `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
    const swatch = screen.getByTitle("Custom color") as HTMLElement;
    expect(swatch.style.backgroundColor).toBe(expectedRgb);
  });
});
