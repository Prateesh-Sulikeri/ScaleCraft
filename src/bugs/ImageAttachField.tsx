"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import {
  acceptImage,
  dragCarriesFiles,
  formatBytes,
  imageFromTransfer,
  IMAGE_REJECTION_MESSAGE,
  type ImageRejection,
} from "./image-input";
import { MAX_IMAGE_BYTES } from "./types";

/**
 * The optional screenshot, accepted three ways: the file picker, a drop, or a
 * paste straight from a screen snip.
 *
 * Paste is the one that matters most here - the whole point of a bug report is
 * the thing on screen right now, and making someone save a snip to disk first
 * just to re-select it is a detour with no purpose. It listens on the window
 * rather than on this field: a snip is followed by Ctrl+V, not by clicking
 * into a specific box first, and a field-scoped handler would only fire if the
 * user happened to have focus inside it.
 */
export function ImageAttachField({
  image,
  onChange,
}: {
  image: File | null;
  onChange: (file: File | null) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [rejection, setRejection] = useState<ImageRejection | null>(null);
  const [dragging, setDragging] = useState(false);
  // Counts enter/leave rather than tracking a boolean: dragging over a child
  // element fires `dragleave` on the parent, which would otherwise flicker the
  // highlight off while the pointer is still inside the zone.
  const dragDepth = useRef(0);

  // Mirrors `image`, written only from handlers, so the unmount cleanup can
  // release the live URL without depending on state - same approach as
  // home/FeedbackSurveyModal.tsx's attachment strip.
  const [preview, setPreview] = useState<string | null>(null);
  const livePreview = useRef<string | null>(null);
  useEffect(() => () => {
    if (livePreview.current) URL.revokeObjectURL(livePreview.current);
  }, []);

  const take = (file: File | null) => {
    const result = acceptImage(file);
    setRejection(result.rejection);
    if (!result.file) return;

    if (livePreview.current) URL.revokeObjectURL(livePreview.current);
    const url = URL.createObjectURL(result.file);
    livePreview.current = url;
    setPreview(url);
    onChange(result.file);
  };

  const clear = () => {
    if (livePreview.current) URL.revokeObjectURL(livePreview.current);
    livePreview.current = null;
    setPreview(null);
    setRejection(null);
    onChange(null);
    // Without this, re-picking the same file fires no change event.
    if (fileInput.current) fileInput.current.value = "";
  };

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const file = imageFromTransfer(event.clipboardData);
      // No image on the clipboard means an ordinary text paste - leave it
      // alone so it still lands in whichever field has focus.
      if (!file) return;
      event.preventDefault();
      take(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // `take` is recreated per render but closes over nothing that changes the
    // behaviour; re-subscribing on every render would be churn for no gain.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A file dropped anywhere outside the zone would otherwise navigate the tab
  // to it, throwing away a half-written report. Swallowed for the life of the
  // form; the zone's own handler stops propagation before this sees it.
  useEffect(() => {
    const swallow = (event: DragEvent) => {
      if (!dragCarriesFiles(event.dataTransfer)) return;
      event.preventDefault();
    };
    window.addEventListener("dragover", swallow);
    window.addEventListener("drop", swallow);
    return () => {
      window.removeEventListener("dragover", swallow);
      window.removeEventListener("drop", swallow);
    };
  }, []);

  const onDragEnter = (event: React.DragEvent) => {
    if (!dragCarriesFiles(event.dataTransfer)) return;
    dragDepth.current += 1;
    setDragging(true);
  };

  const onDragLeave = () => {
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragDepth.current = 0;
    setDragging(false);
    take(imageFromTransfer(event.dataTransfer));
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragEnter={onDragEnter}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        data-dragging={dragging || undefined}
        className={`flex flex-col items-center gap-1.5 rounded-md border border-dashed px-4 py-5 text-center transition-colors duration-150 ease-out ${
          dragging ? "border-foreground/40 bg-foreground/5" : "border-border"
        }`}
      >
        <ImagePlus size={16} className="text-foreground/35" aria-hidden="true" />
        <p className="text-sm text-foreground/70">
          Paste a screenshot, drop one here, or{" "}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="font-medium text-foreground underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            browse
          </button>
        </p>
        <p className="text-xs text-foreground/40">Optional · one image · up to {formatBytes(MAX_IMAGE_BYTES)}</p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          onChange={(e) => take(e.target.files?.[0] ?? null)}
          className="sr-only"
          aria-label="Attach a screenshot"
        />
      </div>

      {rejection && <p className="text-xs text-state-warning">{IMAGE_REJECTION_MESSAGE[rejection]}</p>}

      {image && preview && (
        <div className="flex items-center gap-2.5 rounded-md border border-border bg-background p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="h-12 w-16 shrink-0 rounded-sm border border-border object-cover"
          />
          <div className="flex min-w-0 flex-1 flex-col">
            {/* A pasted snip has no meaningful filename, so it says what it is
                instead of showing the browser's generic "image.png". */}
            <span className="truncate text-xs text-foreground/70">{image.name || "Pasted screenshot"}</span>
            <span className="text-xs text-foreground/40">{formatBytes(image.size)}</span>
          </div>
          <button
            type="button"
            onClick={clear}
            aria-label="Remove attached image"
            className="shrink-0 text-foreground/45 transition-colors hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
