"use client";

import { useRef, useState, type RefObject } from "react";
import { FolderOpen, Upload } from "lucide-react";
import { exportCanvasAsJson } from "@/canvas/export-json";
import { canvasImportSchema } from "@/canvas/import-schema";
import { useCanvasStore } from "@/canvas/store";
import { Tooltip } from "@/app/Tooltip";
import type { CanvasHandle } from "@/canvas/Canvas";
import type { AnyNodeType, ArchitectureEdgeType } from "@/canvas/types";

type ProjectMenuProps = {
  canvasRef: RefObject<CanvasHandle | null>;
};

type ImageFormat = "png" | "jpg";
type Background = "transparent" | "white" | "black" | "custom";

const BG_HEX: Record<Exclude<Background, "transparent" | "custom">, string> = {
  white: "#ffffff",
  black: "#000000",
};

/**
 * The header's Import/Export control (Phase 5 of the UI overhaul, see
 * .claude/docs/pending.md) — replaces ExportMenu.tsx, folding in Import
 * (previously a plain button + hidden <input> inlined in sandbox/page.tsx)
 * so Import/Export JSON/Export image all live behind one "Project" trigger
 * instead of three separate header controls. Same backdrop
 * click-outside-to-close convention already used by ValidationIndicator/
 * BoardMenu/ContextMenu, so this doesn't introduce a fourth pattern. The
 * trigger itself is icon-only (Tooltip, not a text label) — matches every
 * other header control (Docs/Shortcuts/Theme/Save/Board/Validate) now that
 * the whole toolbar was made consistent in one pass.
 */
export function ProjectMenu({ canvasRef }: ProjectMenuProps) {
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [background, setBackground] = useState<Background>("transparent");
  const [customColor, setCustomColor] = useState("#1a1a1a");
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  const handleImportFile = async (file: File) => {
    setImportError(null);
    try {
      const parsed = canvasImportSchema.parse(JSON.parse(await file.text()));
      loadCanvasState(parsed.nodes as AnyNodeType[], parsed.edges as ArchitectureEdgeType[]);
      setOpen(false);
    } catch {
      setImportError("Couldn't import that file — not a valid ScaleCraft canvas export.");
    }
  };

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
      <Tooltip label="Project">
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Project"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 hover:text-foreground"
        >
          <FolderOpen size={16} />
        </button>
      </Tooltip>

      {open && (
        <>
          <div className="fixed inset-0 z-[var(--z-dropdown-backdrop)]" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-[var(--z-dropdown)] mt-2 w-64 rounded-md border border-border bg-panel p-3 shadow-lg">
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-border"
            >
              <Upload size={14} />
              Import Project
            </button>
            {importError && <p className="mt-1 px-2 text-xs text-state-error">{importError}</p>}
            <input
              ref={importInputRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = "";
              }}
            />

            <div className="mt-3 border-t border-border pt-3">
              <button
                onClick={handleExportJson}
                className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-border"
              >
                Export as JSON
              </button>
            </div>

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
