"use client";

import { useState } from "react";
import { PageEnter } from "@/app/PageEnter";
import { DiagramQuestion } from "@/chapters/quiz/DiagramQuestion";
import { DIAGRAM_QUESTION_FIXTURES } from "./fixtures";
import type { QuizQuestion } from "@/content/chapters/types";

/** `disabled={false}` so clicking a different option live-moves the
 * incorrect-state highlight (revealed={true} already shows every
 * explanation regardless of selection) — useful for eyeballing every
 * option's styling without a submit/review cycle. */
function FixtureCard({ question }: { question: QuizQuestion }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <div className="rounded-md border border-border p-3">
      <p className="text-sm text-foreground/90">{question.prompt}</p>
      <div className="mt-3">
        <DiagramQuestion
          question={question}
          selectedId={selectedId}
          onSelect={setSelectedId}
          disabled={false}
          revealed={true}
        />
      </div>
    </div>
  );
}

/**
 * Dev-only visual check for diagram quiz questions — not linked from any
 * nav, reached by typing the URL directly (same posture as
 * /dev/blueprint-lab). Renders DiagramQuestion directly (no submit/review
 * cycle) rather than through the exam shell — this page exists purely to
 * eyeball ReadOnlyGraphSummary's category-color/edge-kind styling (Phase 5),
 * not to exercise the exam flow or persistence (see
 * .claude/docs/pending-quiz-ui.md addendum).
 */
export function DiagramQuestionLabContent() {
  return (
    <PageEnter>
      <main className="mx-auto flex max-w-2xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Diagram question lab</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Dev-only fixtures (not curriculum content) — see fixtures.ts. Checks category colors and edge-kind
            color/dash styling in ReadOnlyGraphSummary render correctly across request-flow, async, and replication.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {DIAGRAM_QUESTION_FIXTURES.map((question) => (
            <FixtureCard key={question.id} question={question} />
          ))}
        </div>
      </main>
    </PageEnter>
  );
}
