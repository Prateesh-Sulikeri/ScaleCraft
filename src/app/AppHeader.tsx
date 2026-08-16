"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { AlertTriangle, BookOpen, Check, CheckCheck, Loader2, Redo2, Save, Undo2 } from "lucide-react";
import type { CanvasHandle } from "@/canvas/Canvas";
import { Tooltip } from "@/app/Tooltip";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ValidationIndicator } from "@/app/ValidationIndicator";
import { DeepCheckButton } from "@/app/DeepCheckButton";
import { ProjectMenu } from "@/app/ProjectMenu";
import { BoardMenu } from "@/app/BoardMenu";
import { ModeBadge } from "@/app/ModeBadge";
import { ShortcutsButton } from "@/app/ShortcutsButton";
import { AppUserButton } from "@/app/AppUserButton";
import { CloudSyncIndicator } from "@/app/CloudSyncIndicator";
import type { ValidationViolation } from "@/engines";
import type { DeepCheckContext } from "@/ai/prompt";
import type { AppMode } from "@/lib/modes";
import { modeColorVar } from "@/lib/modes";
import type { SaveStatus } from "@/persistence/use-autosave";

// Announced to screen readers only (see the sr-only <p> below) - the button
// itself carries this state visually via icon alone.
const saveStatusLabel: Record<SaveStatus, string> = {
  saved: "Saved",
  saving: "Saving...",
  "saved-recent": "Saved just now",
  error: "Save failed",
};

// Sighted users get this on hover instead of a permanent label.
const saveTooltipLabel: Record<SaveStatus, string> = {
  saved: "Save (Ctrl+S)",
  saving: "Saving...",
  "saved-recent": "Saved just now",
  error: "Save failed - click to retry",
};

type AppHeaderProps = {
  mode: AppMode;
  canvasRef: RefObject<CanvasHandle | null>;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  violations: ValidationViolation[] | null;
  isStale: boolean;
  onValidate: () => void;
  /** Submit checks the same violations as Validate, plus (once that
   * passes) blueprint matching — the chapter-completion gate. See
   * .claude/docs/pending.md Track A's Validate/Submit split. Omitted
   * entirely in Sandbox (no chapter, nothing to complete) — the button
   * only renders when this is provided. */
  onSubmit?: () => void;
  /** True once this chapter has a chapterProgress row — persisted
   * completion, independent of the current in-progress graph edits, so
   * this never goes stale the way `isStale` above does. */
  chapterPassed?: boolean;
  /** Which save slot Save/Project/Board act on (persistence/db.ts's
   * SANDBOX_SAVE_ID / chapterSaveId). `null` disables all three together —
   * there's no well-defined target yet (chapter mode's Chapter List view). */
  saveId: string | null;
  onSave: () => void;
  /** One shared status for both the explicit Save button/Ctrl+S and
   *  background autosave (see persistence/use-autosave.ts) - rendered on the
   *  Save button as an icon swap plus its tooltip text, with a sr-only echo
   *  for screen readers. No permanent visible label. */
  saveStatus: SaveStatus;
  docsPanelOpen: boolean;
  toggleDocsPanel: () => void;
  /** Assembled by the caller (sandbox/page.tsx always builds the pre-pass
   * shape; ChapterWorkspace.tsx builds it from the live ChapterOutcome) —
   * see ai/prompt.ts's own doc comment for why this isn't resolved here. */
  deepCheckCtx: DeepCheckContext;
};

/**
 * The one header shared by Sandbox and both chapter modes (item I.3) —
 * previously hand-duplicated between sandbox/page.tsx and
 * ChapterWorkspace.tsx because chapter-mode Save/persistence was expected to
 * diverge (see chapterSaveId in persistence/db.ts). Save/ProjectMenu/
 * BoardMenu are still mode-aware, just via the `saveId` prop rather than a
 * second copy of this JSX.
 */
export function AppHeader({
  mode,
  canvasRef,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  violations,
  isStale,
  onValidate,
  onSubmit,
  chapterPassed,
  saveId,
  onSave,
  saveStatus,
  docsPanelOpen,
  toggleDocsPanel,
  deepCheckCtx,
}: AppHeaderProps) {
  return (
    <header
      style={{ borderBottomColor: modeColorVar[mode] }}
      className="flex items-center justify-between border-b-2 px-6 py-3"
    >
      <div className="flex items-center gap-2.5">
        <Link href="/" className="flex items-center gap-2.5 opacity-100 transition-opacity hover:opacity-70">
          <div
            aria-hidden="true"
            style={{
              width: 32,
              height: 32,
              backgroundColor: "var(--foreground)",
              WebkitMaskImage: "url(/logo-mask.png)",
              maskImage: "url(/logo-mask.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          <h1 className="text-base font-semibold">ScaleCraft</h1>
        </Link>
        <ModeBadge mode={mode} />
      </div>
      <div className="flex items-center gap-2">
        {/* One split button, not two separate ones — bg-panel on the
         * shared container is what makes this actually match Save/Export/
         * Board (the prior merged version omitted it and rendered
         * transparent against the header, which read as "doesn't match"). */}
        <div data-tour="undo-redo" className="flex h-8 items-center overflow-hidden rounded-md border border-border bg-panel">
          <Tooltip label="Undo (Ctrl+Z)">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              aria-label="Undo"
              className="flex h-full items-center px-2.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Undo2 size={14} />
            </button>
          </Tooltip>
          <div className="h-4 w-px bg-border" />
          <Tooltip label="Redo (Ctrl+Shift+Z)">
            <button
              onClick={onRedo}
              disabled={!canRedo}
              aria-label="Redo"
              className="flex h-full items-center px-2.5 hover:bg-border disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
            >
              <Redo2 size={14} />
            </button>
          </Tooltip>
        </div>
        <ValidationIndicator violations={violations} isStale={isStale} onValidate={onValidate} />
        {onSubmit && (
          <Tooltip label="Submit - checks completion against this chapter's target design">
            <button
              onClick={onSubmit}
              aria-label="Submit"
              data-tour="submit"
              className={`flex h-8 w-8 items-center justify-center rounded-md border bg-panel hover:bg-border ${
                chapterPassed ? "border-state-valid text-state-valid" : "border-border text-foreground/70"
              }`}
            >
              <CheckCheck size={16} />
            </button>
          </Tooltip>
        )}
        <DeepCheckButton ctx={deepCheckCtx} saveId={saveId} />
        <div data-tour="header-tools" className="flex items-center gap-2">
          <Tooltip label={saveId ? saveTooltipLabel[saveStatus] : "Select a chapter to enable Save"}>
            <button
              onClick={onSave}
              disabled={!saveId}
              aria-label="Save"
              data-save-status={saveStatus}
              className={`flex h-8 w-8 items-center justify-center rounded-md border bg-panel hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-foreground/70 ${
                saveStatus === "error"
                  ? "border-state-error text-state-error"
                  : saveStatus === "saved-recent"
                    ? "border-state-valid text-state-valid"
                    : "border-border text-foreground/70"
              }`}
            >
              {saveStatus === "saving" ? (
                <Loader2 size={16} className="animate-spin" />
              ) : saveStatus === "saved-recent" ? (
                <Check size={16} />
              ) : saveStatus === "error" ? (
                <AlertTriangle size={16} />
              ) : (
                <Save size={16} />
              )}
            </button>
          </Tooltip>
          {/* Screen-reader-only echo of the icon-only save status above - no
           * visible text label (that used to sit here permanently, which read
           * as header clutter), but the state change is still announced. */}
          {saveId && (
            <p aria-live="polite" className="sr-only">
              {saveStatusLabel[saveStatus]}
            </p>
          )}
          <ProjectMenu canvasRef={canvasRef} disabled={!saveId} />
          <BoardMenu saveId={saveId} />
          <Tooltip label="Documentation">
            <button
              onClick={toggleDocsPanel}
              aria-label={docsPanelOpen ? "Hide documentation panel" : "Show documentation panel"}
              aria-pressed={docsPanelOpen}
              className={`flex h-8 w-8 items-center justify-center rounded-md border border-border hover:text-foreground ${
                docsPanelOpen ? "bg-border text-foreground" : "bg-panel text-foreground/70"
              }`}
            >
              <BookOpen size={16} />
            </button>
          </Tooltip>
          <ShortcutsButton />
          <CloudSyncIndicator />
          <ThemeToggle />
          <AppUserButton />
        </div>
      </div>
    </header>
  );
}
