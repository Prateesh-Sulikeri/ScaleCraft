import { describe, it, expect } from "vitest";
import { acceptImage, dragCarriesFiles, formatBytes, imageFromTransfer } from "./image-input";
import { MAX_IMAGE_BYTES } from "./types";

function fakeFile(name: string, type: string, size: number): File {
  const file = new File(["x"], name, { type });
  // File size is derived from content, so it is stubbed rather than built at
  // 2 MB - the rule under test is the comparison, not the allocation.
  Object.defineProperty(file, "size", { value: size });
  return file;
}

/** Enough of a DataTransfer for the two shapes the browser actually hands us:
 *  a populated `files` list, or bitmap-only `items`. */
function transfer({ files = [], items = [], types = [] }: {
  files?: File[];
  items?: Array<{ kind: string; type: string; file: File | null }>;
  types?: string[];
}) {
  return {
    files,
    items: items.map((i) => ({ kind: i.kind, type: i.type, getAsFile: () => i.file })),
    types,
  } as unknown as DataTransfer;
}

describe("acceptImage", () => {
  it("accepts an image inside the size budget", () => {
    const png = fakeFile("shot.png", "image/png", 1024);
    expect(acceptImage(png)).toEqual({ file: png, rejection: null });
  });

  it("treats nothing as nothing - no file and no complaint", () => {
    expect(acceptImage(null)).toEqual({ file: null, rejection: null });
    expect(acceptImage(undefined)).toEqual({ file: null, rejection: null });
  });

  it("refuses a non-image", () => {
    expect(acceptImage(fakeFile("notes.pdf", "application/pdf", 1024)).rejection).toBe("not-an-image");
  });

  it("refuses an image past the budget, and accepts one exactly at it", () => {
    expect(acceptImage(fakeFile("big.png", "image/png", MAX_IMAGE_BYTES + 1)).rejection).toBe("too-large");
    expect(acceptImage(fakeFile("edge.png", "image/png", MAX_IMAGE_BYTES)).rejection).toBeNull();
  });
});

describe("imageFromTransfer", () => {
  it("takes the first image from a drop's file list", () => {
    const png = fakeFile("shot.png", "image/png", 10);
    expect(imageFromTransfer(transfer({ files: [png] }))).toBe(png);
  });

  it("falls back to data-transfer items for a clipboard bitmap", () => {
    const png = fakeFile("image.png", "image/png", 10);
    const data = transfer({ items: [{ kind: "file", type: "image/png", file: png }] });
    expect(imageFromTransfer(data)).toBe(png);
  });

  it("returns null for a plain-text paste, so the text still lands in the field", () => {
    const data = transfer({ items: [{ kind: "string", type: "text/plain", file: null }], types: ["text/plain"] });
    expect(imageFromTransfer(data)).toBeNull();
  });

  it("skips non-image files rather than picking the first of anything", () => {
    const pdf = fakeFile("notes.pdf", "application/pdf", 10);
    const png = fakeFile("shot.png", "image/png", 10);
    expect(imageFromTransfer(transfer({ files: [pdf, png] }))).toBe(png);
    expect(imageFromTransfer(transfer({ files: [pdf] }))).toBeNull();
  });

  it("is null-safe when there is no payload at all", () => {
    expect(imageFromTransfer(null)).toBeNull();
  });
});

describe("dragCarriesFiles", () => {
  it("is true only when the drag advertises files", () => {
    expect(dragCarriesFiles(transfer({ types: ["Files"] }))).toBe(true);
    expect(dragCarriesFiles(transfer({ types: ["text/plain"] }))).toBe(false);
    expect(dragCarriesFiles(null)).toBe(false);
  });
});

describe("formatBytes", () => {
  it("scales its unit to the size", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(2048)).toBe("2 KB");
    expect(formatBytes(MAX_IMAGE_BYTES)).toBe("2.0 MB");
  });
});
