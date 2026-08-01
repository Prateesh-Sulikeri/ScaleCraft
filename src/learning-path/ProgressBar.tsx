export type ProgressBarProps = {
  /** 0-100. */
  percent: number;
  /** "sm" for sections, "md" for the course header. */
  size?: "sm" | "md";
  /** Required, for aria-label — e.g. "Group A progress: 50%". */
  label: string;
  /** CSS color value for the fill. Omit for the deliberately neutral default
   *  (DESIGN.md: a progress bar is not a validation result, so it never uses
   *  --state-valid green). The course header's bar passes modeColorVar[id]
   *  instead — that's the mode-identity channel, not the state channel. */
  accentColor?: string;
};

/** The one progress primitive in the Learning Path — no text inside;
 *  callers label it (DESIGN.md's Flat Canvas Rule: no shadow, just track +
 *  fill). */
export function ProgressBar({ percent, size = "md", label, accentColor }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`w-full overflow-hidden rounded-full bg-border ${height}`}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none ${
          accentColor ? "" : "bg-foreground/70"
        }`}
        style={{ width: `${clamped}%`, ...(accentColor ? { backgroundColor: accentColor } : {}) }}
      />
    </div>
  );
}
