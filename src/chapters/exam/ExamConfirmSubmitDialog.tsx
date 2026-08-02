type ExamConfirmSubmitDialogProps = {
  unansweredCount: number;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Styled in-app dialog, not native `window.confirm` (same precedent as
 * DeleteConfirmPopover.tsx) — rendered inside ExamShell's own portal
 * subtree, so it stacks above the exam content by DOM order alone at the
 * same z-modal tier. */
export function ExamConfirmSubmitDialog({ unansweredCount, onCancel, onConfirm }: ExamConfirmSubmitDialogProps) {
  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)]" onClick={onCancel} />
      <div className="pointer-events-none fixed inset-0 z-[var(--z-modal)] grid place-items-center px-4">
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label="Confirm submit"
          className="pointer-events-auto w-80 max-w-full rounded-md border border-border bg-panel p-4 shadow-lg"
        >
          <p className="text-sm text-foreground">
            {unansweredCount} question{unansweredCount === 1 ? "" : "s"} unanswered - submit anyway?
          </p>
          <p className="mt-1 text-xs text-foreground/60">Unanswered questions are scored as incorrect.</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border/40"
            >
              Keep going
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-foreground hover:bg-border/40"
            >
              Submit anyway
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
