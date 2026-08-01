import { Check, X } from "lucide-react";
import { MarkdownRenderer } from "@/canvas/docs-panel/markdown/MarkdownRenderer";
import type { QuizOption } from "@/content/chapters/types";

type OptionRowProps = {
  option: QuizOption;
  inputType: "radio" | "checkbox";
  name: string;
  checked: boolean;
  disabled: boolean;
  /** Post-submit — every option's explanation always shows, chosen or not,
   * right or wrong (.claude/docs/QUIZ_FRAMEWORK.md §1). */
  revealed: boolean;
  monospace?: boolean;
  onChange: () => void;
};

/** Shared row rendering for single/multi/estimate/diagram question bodies —
 * ordering and matching have their own layouts and don't use this. */
export function OptionRow({ option, inputType, name, checked, disabled, revealed, monospace, onChange }: OptionRowProps) {
  const state = !revealed ? "neutral" : option.correct ? "correct" : checked ? "incorrect" : "neutral";

  return (
    <div
      className={`rounded-md border p-2 ${
        state === "correct" ? "border-state-valid" : state === "incorrect" ? "border-state-error" : "border-border"
      }`}
    >
      <label className="flex cursor-pointer items-start gap-2 text-sm">
        <input
          type={inputType}
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="mt-0.5 shrink-0"
        />
        <span className={`flex-1 ${monospace ? "font-mono" : ""}`}>{option.label}</span>
        {revealed && state === "correct" && <Check size={14} className="mt-0.5 shrink-0 text-state-valid" />}
        {revealed && state === "incorrect" && <X size={14} className="mt-0.5 shrink-0 text-state-error" />}
      </label>
      {revealed && (
        <div className="mt-1.5 pl-6 text-xs text-foreground/70">
          <MarkdownRenderer content={option.explanationMd} />
        </div>
      )}
    </div>
  );
}
