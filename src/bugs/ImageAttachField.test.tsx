import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ImageAttachField } from "./ImageAttachField";
import { MAX_IMAGE_BYTES } from "./types";

function fakeImage(name = "shot.png", size = 1024, type = "image/png"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

function transfer(files: File[], types = ["Files"]) {
  return {
    files,
    items: files.map((f) => ({ kind: "file", type: f.type, getAsFile: () => f })),
    types,
  };
}

beforeEach(() => {
  // jsdom implements neither, and the field mints a preview URL per accepted
  // image.
  URL.createObjectURL = vi.fn(() => "blob:preview");
  URL.revokeObjectURL = vi.fn();
});

describe("ImageAttachField", () => {
  it("accepts a screen snip pasted anywhere on the page", () => {
    const onChange = vi.fn();
    render(<ImageAttachField image={null} onChange={onChange} />);

    const png = fakeImage();
    // Pasted at the window, not into this field - a snip is followed by
    // Ctrl+V, not by clicking into a box first.
    fireEvent.paste(window, { clipboardData: transfer([png]) });

    expect(onChange).toHaveBeenCalledWith(png);
  });

  it("leaves a plain-text paste alone so it still lands in the focused field", () => {
    const onChange = vi.fn();
    render(<ImageAttachField image={null} onChange={onChange} />);

    fireEvent.paste(window, {
      clipboardData: { files: [], items: [{ kind: "string", type: "text/plain", getAsFile: () => null }], types: ["text/plain"] },
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("accepts an image dropped on the zone", () => {
    const onChange = vi.fn();
    render(<ImageAttachField image={null} onChange={onChange} />);

    const png = fakeImage();
    const zone = screen.getByText(/Paste a screenshot/).closest("div")!;
    fireEvent.drop(zone, { dataTransfer: transfer([png]) });

    expect(onChange).toHaveBeenCalledWith(png);
  });

  it("highlights the zone while a file is dragged over it, and stops on leave", () => {
    render(<ImageAttachField image={null} onChange={vi.fn()} />);
    const zone = screen.getByText(/Paste a screenshot/).closest("div")!;

    expect(zone).not.toHaveAttribute("data-dragging");
    fireEvent.dragEnter(zone, { dataTransfer: transfer([fakeImage()]) });
    expect(zone).toHaveAttribute("data-dragging");

    fireEvent.dragLeave(zone);
    expect(zone).not.toHaveAttribute("data-dragging");
  });

  it("does not highlight for a drag carrying no files", () => {
    render(<ImageAttachField image={null} onChange={vi.fn()} />);
    const zone = screen.getByText(/Paste a screenshot/).closest("div")!;

    fireEvent.dragEnter(zone, { dataTransfer: { files: [], items: [], types: ["text/plain"] } });
    expect(zone).not.toHaveAttribute("data-dragging");
  });

  it("explains a refusal instead of silently dropping the file", () => {
    const onChange = vi.fn();
    render(<ImageAttachField image={null} onChange={onChange} />);
    const zone = screen.getByText(/Paste a screenshot/).closest("div")!;

    fireEvent.drop(zone, { dataTransfer: transfer([fakeImage("huge.png", MAX_IMAGE_BYTES + 1)]) });

    expect(screen.getByText(/have to be under/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("previews the attached image and clears it on remove", () => {
    const onChange = vi.fn();
    const png = fakeImage();
    const { rerender } = render(<ImageAttachField image={null} onChange={onChange} />);

    fireEvent.paste(window, { clipboardData: transfer([png]) });
    rerender(<ImageAttachField image={png} onChange={onChange} />);

    expect(screen.getByText("shot.png")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove attached image" }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
});
