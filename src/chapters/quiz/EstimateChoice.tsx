import { SingleChoice, type SingleChoiceProps } from "./SingleChoice";

/** Visually identical to SingleChoice except monospaced labels, for
 * bucket-style capacity-estimate options (e.g. "~10K QPS", "~1M QPS"). A
 * separate component per .claude/docs/pending-quiz-ui.md Phase 3, not a prop
 * callers have to remember to pass. */
export function EstimateChoice(props: Omit<SingleChoiceProps, "monospace">) {
  return <SingleChoice {...props} monospace />;
}
