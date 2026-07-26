import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import type { RefObject } from "react";
import { CanvasStoreProvider, useCanvasStoreApi } from "@/canvas/store";
import { ProjectMenu } from "./ProjectMenu";
import type { CanvasHandle } from "@/canvas/Canvas";

const exportCanvasAsJson = vi.fn();
vi.mock("@/canvas/export-json", () => ({
  exportCanvasAsJson: (...args: unknown[]) => exportCanvasAsJson(...args),
}));

function renderProjectMenu(props: { disabled?: boolean } = {}) {
  const canvasRef = { current: { exportImage: vi.fn() } } as RefObject<CanvasHandle | null>;
  render(
    <CanvasStoreProvider>
      <ProjectMenu canvasRef={canvasRef} disabled={props.disabled} />
    </CanvasStoreProvider>,
  );
  return canvasRef;
}

function makeJsonFile(content: unknown) {
  return new File([JSON.stringify(content)], "export.json", { type: "application/json" });
}

const validExport = {
  nodes: [{ id: "n1", type: "component", position: { x: 0, y: 0 }, data: {} }],
  edges: [{ id: "e1", source: "n1", target: "n1", data: { kind: "request-flow" } }],
};

describe("ProjectMenu", () => {
  beforeEach(() => {
    exportCanvasAsJson.mockClear();
  });

  it("disables the trigger when disabled", () => {
    renderProjectMenu({ disabled: true });
    expect(screen.getByRole("button", { name: "Project" })).toBeDisabled();
  });

  it("does not open the dropdown while disabled", () => {
    renderProjectMenu({ disabled: true });
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.queryByText("Import Project")).not.toBeInTheDocument();
  });

  it("opens the dropdown on click, showing import/export controls", () => {
    renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.getByText("Import Project")).toBeInTheDocument();
    expect(screen.getByText("Export as JSON")).toBeInTheDocument();
    expect(screen.getByText("Export as image")).toBeInTheDocument();
  });

  it("exports as JSON with the current store's nodes/edges and closes the dropdown", () => {
    renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.click(screen.getByText("Export as JSON"));

    expect(exportCanvasAsJson).toHaveBeenCalledTimes(1);
    expect(exportCanvasAsJson).toHaveBeenCalledWith([], []);
    expect(screen.queryByText("Export as JSON")).not.toBeInTheDocument();
  });

  it("imports a valid canvas JSON file, loading it into the store and closing the dropdown", async () => {
    let api!: ReturnType<typeof useCanvasStoreApi>;
    function Capture() {
      api = useCanvasStoreApi();
      return null;
    }
    const canvasRef = { current: { exportImage: vi.fn() } } as RefObject<CanvasHandle | null>;
    render(
      <CanvasStoreProvider>
        <Capture />
        <ProjectMenu canvasRef={canvasRef} />
      </CanvasStoreProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    const input = screen.getByText("Import Project").closest("div")!.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [makeJsonFile(validExport)] } });

    await waitFor(() => expect(api.getState().nodes).toHaveLength(1));
    expect(api.getState().nodes[0].id).toBe("n1");
    await waitFor(() => expect(screen.queryByText("Import Project")).not.toBeInTheDocument());
  });

  it("shows an error and keeps the dropdown open when the imported file isn't a valid export", async () => {
    renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    const input = screen.getByText("Import Project").closest("div")!.querySelector('input[type="file"]')!;
    fireEvent.change(input, { target: { files: [makeJsonFile({ not: "a canvas export" })] } });

    await waitFor(() =>
      expect(
        screen.getByText("Couldn't import that file — not a valid ScaleCraft canvas export."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByText("Import Project")).toBeInTheDocument();
  });

  it("falls back JPEG's background to white when transparent was selected", () => {
    renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));

    // Default format is PNG with a transparent background swatch selected.
    expect(screen.getByLabelText("Transparent background")).toHaveClass("border-foreground");

    fireEvent.click(screen.getByText("jpg"));
    // Transparent swatch (PNG-only) is no longer rendered, and white becomes
    // the selected background as a safe fallback.
    expect(screen.queryByLabelText("Transparent background")).not.toBeInTheDocument();
    expect(screen.getByLabelText("White background")).toHaveClass("border-foreground");
  });

  it("triggers the canvas ref's exportImage with the selected format/background on Download", () => {
    const canvasRef = renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.click(screen.getByText("Download PNG"));

    expect(canvasRef.current!.exportImage).toHaveBeenCalledWith({
      format: "png",
      backgroundColor: undefined,
    });
  });

  it("resolves a solid black background to its hex value on export", () => {
    const canvasRef = renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.click(screen.getByLabelText("Black background"));
    fireEvent.click(screen.getByText("Download PNG"));

    expect(canvasRef.current!.exportImage).toHaveBeenCalledWith({
      format: "png",
      backgroundColor: "#000000",
    });
  });

  it("resolves a custom background color on export", () => {
    const canvasRef = renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.change(screen.getByLabelText("Custom background color"), { target: { value: "#336699" } });
    fireEvent.click(screen.getByText("Download PNG"));

    expect(canvasRef.current!.exportImage).toHaveBeenCalledWith({
      format: "png",
      backgroundColor: "#336699",
    });
  });

  it("re-selecting transparent after black restores the transparent swatch as selected", () => {
    renderProjectMenu();
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    fireEvent.click(screen.getByLabelText("Black background"));
    fireEvent.click(screen.getByLabelText("Transparent background"));
    expect(screen.getByLabelText("Transparent background")).toHaveClass("border-foreground");
  });

  it("closes the dropdown when the backdrop is clicked", () => {
    const { container } = render(
      <CanvasStoreProvider>
        <ProjectMenu canvasRef={{ current: { exportImage: vi.fn() } } as RefObject<CanvasHandle | null>} />
      </CanvasStoreProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Project" }));
    expect(screen.getByText("Import Project")).toBeInTheDocument();

    fireEvent.click(container.querySelector(".fixed.inset-0")!);
    expect(screen.queryByText("Import Project")).not.toBeInTheDocument();
  });
});
