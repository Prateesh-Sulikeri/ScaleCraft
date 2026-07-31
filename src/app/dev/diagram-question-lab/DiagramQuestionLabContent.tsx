"use client";

import { PageEnter } from "@/app/PageEnter";
import { QuizQuestionCard } from "@/chapters/quiz/QuizQuestionCard";
import { DIAGRAM_QUESTION_FIXTURES } from "./fixtures";

/**
 * Dev-only visual check for diagram quiz questions — not linked from any
 * nav, reached by typing the URL directly (same posture as
 * /dev/blueprint-lab). Not wired to the real progress store: `mastered` is
 * always false and `onCorrect` is a no-op, since this page exists purely to
 * eyeball ReadOnlyGraphSummary's category-color/edge-kind styling (Phase 5)
 * against real QuizQuestionCard rendering, not to exercise persistence.
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
            <QuizQuestionCard key={question.id} question={question} mastered={false} onCorrect={() => {}} />
          ))}
        </div>
      </main>
    </PageEnter>
  );
}
