import { OptionRow } from "./OptionRow";
import type { QuizQuestion } from "@/content/chapters/types";

type MultiChoiceProps = {
  question: QuizQuestion;
  selectedIds: string[];
  onToggle: (id: string) => void;
  disabled: boolean;
  revealed: boolean;
};

/** "Select all that apply" — correct only on an exact set match, evaluated by
 * evaluate.ts, not here. */
export function MultiChoice({ question, selectedIds, onToggle, disabled, revealed }: MultiChoiceProps) {
  return (
    <div className="flex flex-col gap-2">
      {question.options.map((option) => (
        <OptionRow
          key={option.id}
          option={option}
          inputType="checkbox"
          name={question.id}
          checked={selectedIds.includes(option.id)}
          disabled={disabled}
          revealed={revealed}
          onChange={() => onToggle(option.id)}
        />
      ))}
    </div>
  );
}
