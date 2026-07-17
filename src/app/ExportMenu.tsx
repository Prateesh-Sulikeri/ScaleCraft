"use client";

import { useState, type RefObject } from "react";
import { ChevronDown, Download } from "lucide-react";
import { exportCanvasAsJson } from "@/canvas/export-json";
import type { CanvasHandle } from "@/canvas/Canvas";

type ExportMenuProps = {
  canvasRef: RefObject<CanvasHandle | null>;
};

type ImageFormat = "png" | "jpg";
type Background = "transparent" | "white" | "black" | "custom";

const BG_HEX: Record<Exclude<Background, "transparent" | "custom">, string> = {
  white: "#ffffff",
  black: "#000000",
};

/**
 * The header's Export control — was a single JSON-only button, now a
 * dropdown offering the raw JSON snapshot (unchanged) alongside a PNG/JPG
 * image render of the current graph. Follows the same backdrop
 * click-outside-to-close convention already used by ValidationIndicator/
 * ContextMenu, so opening a second dropdown-style control doesn't
 * introduce a third pattern.
 */
export function ExportMenu({ canvasRef }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [background, setBackground] = useState<Background>("transparent");
  const [customColor, setCustomColor] = useState("#1a1a1a");

  const handleExportJson = () => {
    exportCanvasAsJson();
    setOpen(false);
  };

  const handleExportImage = async () => {
    const backgroundColor =
      background === "transparent" ? undefined : background === "custom" ? customColor : BG_HEX[background];
    await canvasRef.current?.exportImage({ format, backgroundColor });
    setOpen(false);
  };

  const selectFormat = (next: ImageFormat) => {
    setFormat(next);
    // JPEG has no alpha channel — a "transparent" choice would silently
    // render as black in most encoders, which is surprising. Fall back to
    // white instead of leaving a choice that quietly does the wrong thing.
    if (next === "jpg" && background === "transparent") setBackground("white");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium hover:bg-border"
      >
        <Download size={14} />
        Export
        <ChevronDown size={12} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-64 rounded-md border border-border bg-panel p-3 shadow-lg">
            <button
              onClick={handleExportJson}
              className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-border"
            >
              Export as JSON
            </button>

            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-foreground/70">
                Export as image
              </p>

              <div className="mt-2 flex gap-1 rounded-md border border-border p-0.5">
                {(["png", "jpg"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => selectFormat(f)}
                    className={`flex-1 rounded px-2 py-1 text-xs uppercase ${
                      format === f ? "bg-border text-foreground" : "text-foreground/60 hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs text-foreground/70">Background</p>
              <div className="mt-1.5 flex items-center gap-2">
                {format === "png" && (
                  <button
                    onClick={() => setBackground("transparent")}
                    aria-label="Transparent background"
                    title="Transparent"
                    className={`h-6 w-6 rounded-full border-2 bg-[repeating-conic-gradient(#8883_0_25%,transparent_0_50%)] bg-[length:8px_8px] ${
                      background === "transparent" ? "border-foreground" : "border-border"
                    }`}
                  />
                )}
                <button
                  onClick={() => setBackground("white")}
                  aria-label="White background"
                  title="White"
                  className={`h-6 w-6 rounded-full border-2 bg-white ${
                    background === "white" ? "border-foreground" : "border-border"
                  }`}
                />
                <button
                  onClick={() => setBackground("black")}
                  aria-label="Black background"
                  title="Black"
                  className={`h-6 w-6 rounded-full border-2 bg-black ${
                    background === "black" ? "border-foreground" : "border-border"
                  }`}
                />
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => {
                    setCustomColor(e.target.value);
                    setBackground("custom");
                  }}
                  aria-label="Custom background color"
                  title="Custom"
                  className={`h-6 w-6 cursor-pointer rounded-full border-2 p-0 ${
                    background === "custom" ? "border-foreground" : "border-border"
                  }`}
                />
              </div>

              <button
                onClick={handleExportImage}
                className="mt-3 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
              >
                Download {format.toUpperCase()}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
