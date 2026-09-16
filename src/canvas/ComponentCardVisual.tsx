"use client";

import { Server } from "lucide-react";
import { categoryColorVar, categoryShortCode } from "./category-colors";
import { iconMap } from "./icon-map";
import { stateGlyph, stateLabel, stateRingVar } from "./validation-visuals";
import type { ComponentDefinition } from "@/content/components/types";
import type { ValidationState } from "./types";

type ComponentCardVisualProps = {
  definition: ComponentDefinition;
  configured: boolean;
  instanceName?: string;
  validationState?: ValidationState;
};

/**
 * The card's visual anatomy only - meta row, icon plate, label, instance
 * name (DESIGN.md "Node Card"). No Handle, NodeResizer, or store
 * dependency, so the live, editable ComponentNode and the read-only
 * ReferenceComponentNode (chapters/ReferenceComponentNode.tsx, Debrief's
 * reference graph render) share one definition of what a card looks like
 * without either one owning the other's interactive chrome. Pulled out of
 * ComponentNode.tsx rather than duplicated, so a future anatomy change can't
 * drift between the two renderers the way card-geometry.ts's constants were
 * pulled out to stop dimension drift.
 *
 * The caller owns the outer box (size, border, outline, `--accent`) since
 * that part differs: ComponentNode's ring reflects live validation state and
 * resize handles, ReferenceComponentNode's is a plain static border.
 */
export function ComponentCardVisual({
  definition,
  configured,
  instanceName,
  validationState,
}: ComponentCardVisualProps) {
  const Icon = iconMap[definition.icon] ?? Server;
  const categoryColor = categoryColorVar[definition.category];
  const StateIcon = validationState ? stateGlyph[validationState] : null;

  return (
    <>
      <div className="flex h-3 shrink-0 items-center justify-between gap-1">
        {/* Neutral ink, category-colored border. The word is the identity
         * channel here; coloring it would put 9px text at 4.35:1 for
         * compute-on-dark (measured), below the 4.5:1 floor. */}
        <span className="shrink-0 rounded-sm border border-[color:color-mix(in_srgb,var(--accent)_45%,transparent)] px-1 py-px font-mono text-[8px] font-semibold uppercase leading-none tracking-wide text-foreground/70">
          {categoryShortCode[definition.category]}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {configured && (
            <span
              className="h-1.5 w-1.5 rounded-full bg-[color:var(--accent)]"
              title="Configured"
              aria-label="Configured"
              role="img"
            />
          )}
          {StateIcon && validationState && (
            <StateIcon
              size={11}
              strokeWidth={2}
              style={{ color: stateRingVar[validationState] }}
              aria-label={stateLabel[validationState]}
              role="img"
            />
          )}
        </span>
      </div>

      {/* flex-1 so the card's spare height frames the icon rather than
       * pooling under the text. */}
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[color:color-mix(in_srgb,var(--accent)_35%,transparent)] bg-[color:color-mix(in_srgb,var(--accent)_12%,transparent)]"
          aria-hidden="true"
        >
          <Icon size={24} strokeWidth={1.5} style={{ color: categoryColor }} />
        </div>
      </div>

      <span className="line-clamp-2 shrink-0 text-center text-[11px] font-semibold leading-[1.15] tracking-tight text-foreground">
        {definition.label}
      </span>

      {instanceName && (
        <span className="mt-0.5 shrink-0 truncate text-center font-mono text-[9px] leading-none text-foreground/55">
          {instanceName}
        </span>
      )}
    </>
  );
}
