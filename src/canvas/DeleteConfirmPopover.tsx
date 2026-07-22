"use client";

import type { CustomComponentRecord } from "@/content/components/custom";

/**
 * The 4th instance of the app's one documented floating-menu visual
 * language (raised-panel, hairline-border, 6px radius, floating-menu
 * shadow — see DESIGN.md's "Dropdown / Context Menus"), not a new pattern —
 * a full-viewport click-catcher backdrop closes it on any outside click,
 * same as ProjectMenu/ContextMenu. Deleting a custom component removes its
 * definition, not an instance, so this is deliberately a harder stop than
 * node/edge delete's toast-based undo: no confirm dialogs exist elsewhere in
 * this app, but nothing here is undoable after the fact, which is exactly
 * the case that safety net doesn't cover. Originally lived in Palette.tsx —
 * moved to its own file when ComponentPicker.tsx (Palette's replacement,
 * see .claude/docs/UI_OVERHAUL_PART2_SPEC.md) became its only consumer.
 */
export function DeleteConfirmPopover({
  target,
  usageCount,
  onCancel,
  onConfirm,
}: {
  target: { record: CustomComponentRecord; x: number; y: number };
  usageCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const left = Math.min(target.x, window.innerWidth - 272);
  const top = Math.min(target.y + 8, window.innerHeight - 140);

  return (
    <>
      <div className="fixed inset-0 z-[var(--z-modal-backdrop)]" onClick={onCancel} />
      <div
        className="fixed z-[var(--z-modal)] w-64 rounded-md border border-border bg-panel p-3 shadow-lg"
        style={{ left, top }}
      >
        {usageCount > 0 ? (
          <>
            <p className="text-sm text-foreground">
              &ldquo;{target.record.label}&rdquo; is used by {usageCount} node{usageCount === 1 ? "" : "s"} on the
              canvas.
            </p>
            <p className="mt-1 text-xs text-foreground/60">Remove those first, then delete it.</p>
            <button
              onClick={onCancel}
              className="mt-3 w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
            >
              OK
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-foreground">
              Delete &ldquo;{target.record.label}&rdquo;? This can&rsquo;t be undone.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={onCancel}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium hover:bg-border"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-sm font-medium text-state-error hover:bg-border"
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
