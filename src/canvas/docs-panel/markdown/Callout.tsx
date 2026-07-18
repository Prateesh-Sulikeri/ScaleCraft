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
  return (
    <div
      className="flex gap-2 rounded-md border-l-[3px] bg-border/20 p-3"
      style={{ borderLeftColor: colorVar }}
    >
      <Icon size={16} className="mt-0.5 shrink-0" style={{ color: colorVar }} />
      <div className="min-w-0 [&>p]:m-0">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: colorVar }}>
          {label}
        </p>
        {children}
      </div>
    </div>
  );
}
