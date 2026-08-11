import { ChevronDown } from "lucide-react";
import type { WalkthroughAlgorithm } from "./types";

/**
 * Algorithm picker for the diagram header (e.g. round-robin vs.
 * least-connections - see WalkthroughStep.variants).
 *
 * A native `<select>`, not the segmented button row this replaced: the row
 * grew with the number of options and wrapped at narrow widths, which moved
 * everything below it - the exact layout instability the fixed-height
 * transport bar was built to remove. A select is one constant-width control
 * no matter how many algorithms a chapter compares, and comes with keyboard
 * and screen-reader behavior for free.
 */
export function WalkthroughAlgorithmSelect({
  algorithms,
  selectedId,
  onSelect,
}: {
  algorithms: WalkthroughAlgorithm[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      <select
        aria-label="Routing algorithm"
        value={selectedId ?? ""}
        onChange={(event) => onSelect(event.target.value)}
        className="w-full appearance-none rounded-md border border-border bg-background py-1.5 pl-2.5 pr-7 text-xs font-medium text-foreground outline-none hover:bg-border/30 focus-visible:ring-2 focus-visible:ring-foreground/40"
      >
        {algorithms.map((algorithm) => (
          <option key={algorithm.id} value={algorithm.id}>
            {algorithm.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={13}
        aria-hidden="true"
        className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-foreground/60"
      />
    </div>
  );
}
