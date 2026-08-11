import type { WalkthroughAlgorithm } from "./types";

/** A small segmented toggle for comparing algorithm outcomes on the same
 * diagram (e.g. round-robin vs. least-connections) - reuses
 * WalkthroughControls.tsx's button language (rounded-md border ...) for one
 * consistent button style across the component, active state filled rather
 * than outlined, matching this app's other active/inactive button pairs
 * (e.g. ExamQuestionNav's active dot). */
export function WalkthroughAlgorithmToggle({
  algorithms,
  selectedId,
  onSelect,
}: {
  algorithms: WalkthroughAlgorithm[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Routing algorithm">
      {algorithms.map((algorithm) => {
        const selected = algorithm.id === selectedId;
        return (
          <button
            key={algorithm.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(algorithm.id)}
            className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
              selected
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-background text-foreground hover:bg-border/40"
            }`}
          >
            {algorithm.label}
          </button>
        );
      })}
    </div>
  );
}
