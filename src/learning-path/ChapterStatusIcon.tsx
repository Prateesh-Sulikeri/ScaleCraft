import { CheckCircle2, CircleDashed, Circle } from "lucide-react";
import type { ChapterStatus } from "@/curriculum/types";

/** The signal is never hue-only (DESIGN.md §6) — shape differs per status
 *  (check / dashed circle / plain circle) and each carries its own
 *  aria-label, since color alone wouldn't reach screen-reader users. */
const CONFIG: Record<ChapterStatus, { Icon: typeof CheckCircle2; className: string; label: string }> = {
  COMPLETED: { Icon: CheckCircle2, className: "text-state-valid", label: "Completed" },
  IN_PROGRESS: { Icon: CircleDashed, className: "text-foreground/70", label: "In progress" },
  NOT_STARTED: { Icon: Circle, className: "text-foreground/30", label: "Not started" },
};

export function ChapterStatusIcon({ status }: { status: ChapterStatus }) {
  const { Icon, className, label } = CONFIG[status];
  return (
    <span role="img" aria-label={label} className="inline-flex shrink-0">
      <Icon size={16} className={className} aria-hidden="true" />
    </span>
  );
}
