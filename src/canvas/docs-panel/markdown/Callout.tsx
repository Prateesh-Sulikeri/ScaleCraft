import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb, ShieldAlert, TriangleAlert } from "lucide-react";

const CALLOUT_KINDS = {
  NOTE: { icon: Info, colorVar: "var(--edge-request-flow)", label: "Note" },
  TIP: { icon: Lightbulb, colorVar: "var(--state-valid)", label: "Tip" },
  IMPORTANT: { icon: AlertTriangle, colorVar: "var(--category-compute)", label: "Important" },
  WARNING: { icon: TriangleAlert, colorVar: "var(--state-warning)", label: "Warning" },
  CAUTION: { icon: ShieldAlert, colorVar: "var(--state-error)", label: "Caution" },
} as const;

type CalloutKind = keyof typeof CALLOUT_KINDS;

function isCalloutKind(value: unknown): value is CalloutKind {
  return typeof value === "string" && value in CALLOUT_KINDS;
}

/**
 * `blockquote` override — renders a styled callout box when
 * remarkCallouts (see remark-callouts.ts) tagged this node with
 * `data-callout`, otherwise falls back to a plain blockquote.
 */
export function Callout({
  "data-callout": dataCallout,
  children,
}: {
  "data-callout"?: string;
  children?: ReactNode;
}) {
  if (!isCalloutKind(dataCallout)) {
    return (
      <blockquote className="border-l-2 border-border pl-3 text-foreground/70 italic">{children}</blockquote>
    );
  }

  const { icon: Icon, colorVar, label } = CALLOUT_KINDS[dataCallout];
  // Full tinted border + wash, not a left stripe (DESIGN.md bans side-stripe
  // accents). Mixed from the kind's own hue so every kind reads the same way.
  return (
    <div
      className="my-5 flex gap-3 rounded-lg border p-4"
      style={{
        borderColor: `color-mix(in srgb, ${colorVar} 32%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${colorVar} 6%, transparent)`,
      }}
    >
      <Icon size={16} aria-hidden="true" className="mt-[0.3em] shrink-0" style={{ color: colorVar }} />
      <div className="min-w-0 [&>p:last-child]:mb-0 [&>p]:mb-2">
        <p className="mb-1 text-sm font-semibold" style={{ color: colorVar }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}
