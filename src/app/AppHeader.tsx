"use client";

import type { RefObject } from "react";
import Link from "next/link";
import { BookOpen, Check, Redo2, Save, Undo2 } from "lucide-react";
import type { CanvasHandle } from "@/canvas/Canvas";
import { Tooltip } from "@/app/Tooltip";
import { ThemeToggle } from "@/app/ThemeToggle";
import { ValidationIndicator } from "@/app/ValidationIndicator";
import { DeepCheckButton } from "@/app/DeepCheckButton";
import { ProjectMenu } from "@/app/ProjectMenu";
import { BoardMenu } from "@/app/BoardMenu";
import { ModeBadge } from "@/app/ModeBadge";
import { ShortcutsButton } from "@/app/ShortcutsButton";
import type { ValidationViolation } from "@/validation-engine/types";
import type { DeepCheckContext } from "@/ai/prompt";
import type { AppMode } from "@/lib/modes";
import { modeColorVar } from "@/lib/modes";
import type { AutosaveStatus } from "@/persistence/use-autosave";

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
  /** Which save slot Save/Project/Board act on (persistence/db.ts's
   * SANDBOX_SAVE_ID / chapterSaveId). `null` disables all three together —
   * there's no well-defined target yet (chapter mode's Chapter List view). */
  saveId: string | null;
  onSave: () => void;
  justSaved: boolean;
  /** Background autosave status, distinct from the explicit Save button's
   *  own justSaved flash — rendered as a quiet text indicator, never shown
   *  for an idle canvas. */
  autosaveStatus: AutosaveStatus;
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
  saveId,
  onSave,
  justSaved,
  autosaveStatus,
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
        {autosaveStatus !== "idle" && (
          <span aria-live="polite" className="text-xs text-foreground/40">
            {autosaveStatus === "saving" ? "Saving..." : "Saved"}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {/* One split button, not two separate ones — bg-panel on the
         * shared container is what makes this actually match Save/Export/
         * Board (the prior merged version omitted it and rendered
         * transparent against the header, which read as "doesn't match"). */}
        <div className="flex h-8 items-center overflow-hidden rounded-md border border-border bg-panel">
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
        <DeepCheckButton ctx={deepCheckCtx} saveId={saveId} />
        <Tooltip label={saveId ? "Save (Ctrl+S)" : "Select a chapter to enable Save"}>
          <button
            onClick={onSave}
            disabled={!saveId}
            aria-label="Save"
            className={`flex h-8 w-8 items-center justify-center rounded-md border bg-panel hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:text-foreground/70 ${
              justSaved ? "border-state-valid text-state-valid" : "border-border text-foreground/70"
            }`}
          >
            {justSaved ? <Check size={16} /> : <Save size={16} />}
          </button>
        </Tooltip>
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
        <ThemeToggle />
      </div>
    </header>
  );
}
