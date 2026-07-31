import { SingleChoice } from "../quiz/SingleChoice";
import { EstimateChoice } from "../quiz/EstimateChoice";
import { MultiChoice } from "../quiz/MultiChoice";
import { Ordering } from "../quiz/Ordering";
import { Matching } from "../quiz/Matching";
import { DiagramQuestion } from "../quiz/DiagramQuestion";
import type { QuizQuestion } from "@/content/chapters/types";
import type { QuizAnswer } from "../quiz/evaluate";

type ExamQuestionBodyProps = {
  question: QuizQuestion;
  /** Undefined = not yet answered — reported to ExamShell's lifted
   * answersByQuestionId only once the learner actually interacts, so an
   * untouched question (of any kind, including ordering's always-valid
   * default sequence) counts as "unanswered" for the submit-confirmation
   * count, not "answered with whatever the default happens to be". */
  value: QuizAnswer | undefined;
  onChange: (answer: QuizAnswer) => void;
  disabled: boolean;
  revealed: boolean;
};

/** Converts the exam's lifted QuizAnswer to/from each of the six pure
 * kind-body components' own prop shapes — those components are unchanged
 * from the inline Knowledge Check (Phase 3), just driven by lifted state
 * here instead of local useState (see .claude/docs/pending-quiz-ui.md
 * addendum: "answer state must survive navigating away and back"). */
export function ExamQuestionBody({ question, value, onChange, disabled, revealed }: ExamQuestionBodyProps) {
  switch (question.kind) {
    case "single":
      return (
        <SingleChoice
          question={question}
          selectedId={value?.kind === "single" ? value.optionId : null}
          onSelect={(optionId) => onChange({ kind: "single", optionId })}
          disabled={disabled}
          revealed={revealed}
        />
      );
    case "estimate":
      return (
        <EstimateChoice
          question={question}
          selectedId={value?.kind === "estimate" ? value.optionId : null}
          onSelect={(optionId) => onChange({ kind: "estimate", optionId })}
          disabled={disabled}
          revealed={revealed}
        />
      );
    case "diagram":
      return (
        <DiagramQuestion
          question={question}
          selectedId={value?.kind === "diagram" ? value.optionId : null}
          onSelect={(optionId) => onChange({ kind: "diagram", optionId })}
          disabled={disabled}
          revealed={revealed}
        />
      );
    case "multi":
      return (
        <MultiChoice
          question={question}
          selectedIds={value?.kind === "multi" ? value.optionIds : []}
          onToggle={(id) => {
            const current = value?.kind === "multi" ? value.optionIds : [];
            const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
            onChange({ kind: "multi", optionIds: next });
          }}
          disabled={disabled}
          revealed={revealed}
        />
      );
    case "ordering":
      return (
        <Ordering
          question={question}
          order={value?.kind === "ordering" ? value.order : question.options.map((o) => o.id)}
          onReorder={(order) => onChange({ kind: "ordering", order })}
          disabled={disabled}
          revealed={revealed}
        />
      );
    case "matching":
      return (
        <Matching
          question={question}
          selections={value?.kind === "matching" ? value.selections : {}}
          onSelect={(leftLabel, optionId) => {
            const current = value?.kind === "matching" ? value.selections : {};
            onChange({ kind: "matching", selections: { ...current, [leftLabel]: optionId } });
          }}
          disabled={disabled}
          revealed={revealed}
        />
      );
  }
}
