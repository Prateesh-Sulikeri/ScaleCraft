import { ReadOnlyGraphSummary } from "../ReadOnlyGraphSummary";
import { SingleChoice, type SingleChoiceProps } from "./SingleChoice";
import type { QuizQuestion } from "@/content/chapters/types";

type DiagramQuestionProps = Omit<SingleChoiceProps, "monospace"> & { question: QuizQuestion };

/** Read-only render of the question's graph above a single-choice body.
 * Reuses the same lightweight, non-canvas graph summary Debrief's reference
 * graphs use (see ReadOnlyGraphSummary's doc comment) — no palette, no
 * selection, and no pan/zoom, since the reused component doesn't offer any
 * (fit-to-graph/category-color polish is deferred to Phase 5). */
export function DiagramQuestion(props: DiagramQuestionProps) {
  return (
    <div className="flex flex-col gap-3">
      {props.question.graph && <ReadOnlyGraphSummary graph={props.question.graph} />}
      <SingleChoice {...props} />
    </div>
  );
}
