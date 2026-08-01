import { OptionRow } from "./OptionRow";
import type { QuizQuestion } from "@/content/chapters/types";

export type SingleChoiceProps = {
  question: QuizQuestion;
  selectedId: string | null;
  onSelect: (id: string) => void;
  disabled: boolean;
  revealed: boolean;
  monospace?: boolean;
};

/** The default question body — a plain radio group. */
export function SingleChoice({ question, selectedId, onSelect, disabled, revealed, monospace }: SingleChoiceProps) {
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((option) => (
        <OptionRow
          key={option.id}
          option={option}
          inputType="radio"
          name={question.id}
          checked={selectedId === option.id}
          disabled={disabled}
          revealed={revealed}
          monospace={monospace}
          onChange={() => onSelect(option.id)}
        />
      ))}
    </div>
  );
}
