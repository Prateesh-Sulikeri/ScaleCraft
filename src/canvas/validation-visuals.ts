import { AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import type { ValidationState } from "./types";

/**
 * Shared between ComponentNode's state ring and the Step 3 inspectors
 * (NodeConfigPopover, EdgeInspector) - previously declared locally in
 * ComponentNode.tsx only. Pulled out so the card and the inspector that
 * describes it can never drift onto two different color/glyph/label sets
 * for the same three states.
 */
export const stateRingVar: Record<ValidationState, string> = {
  valid: "var(--state-valid)",
  warning: "var(--state-warning)",
  error: "var(--state-error)",
};

/** The second, non-hue channel DESIGN.md §2 ("Color Blindness Support")
 * requires for validation state - see ComponentNode.tsx for the fuller
 * rationale. */
export const stateGlyph: Record<ValidationState, LucideIcon> = {
  valid: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
};

export const stateLabel: Record<ValidationState, string> = {
  valid: "Valid",
  warning: "Has a warning",
  error: "Has an error",
};
