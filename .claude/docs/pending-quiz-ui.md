# Quiz UI - Plan of Action (for Sonnet)

You are acting as the **implementation engineer** for ScaleCraft's quiz system UI.
Your job is engineering only: schema, persistence, components, integration, tests.
You do NOT write quiz content (Opus owns that, see `pending-content.md`) and you do
NOT change the curriculum or quiz specifications (propose doc edits instead if you
hit a contradiction).

This plan is complete for the full quiz system. Release 3 only needs Phases 1-4;
Phases 5-6 may land in a later release, but implement to this plan so nothing is
rework. Work phase by phase, in order - each phase leaves the app shippable.

## Read first, in this order

1. `.claude/docs/CURRICULUM.md` - §0 (learning flow), §5.3 beat 15 (where the quiz
   lives in a lesson), §21.1 (schema ask), §22 (assessment contract).
2. `.claude/docs/QUIZ_FRAMEWORK.md` - §1 (philosophy: it constrains UI directly),
   §2 (question kinds + target schema), §4 (diagram questions), §17 (question ids
   are persistence keys).
3. `DESIGN.md` (root) - the live design system. All new UI uses its tokens.
4. `.claude/docs/CRITIQUE.md` - known friction; don't add more of it.
5. Orient in code with graphify BEFORE reading files (mandatory repo hook):
   `graphify query "chapter reader lesson rendering"`, `graphify explain
   "ChapterDefinition"`, etc.

## Product constraints (non-negotiable, from CURRICULUM/ARCHITECTURE)

- **No scores, percentages, streaks, timers, XP, or celebration animation.**
  Motion communicates state only. A correct answer gets a quiet confirmed state,
  not confetti.
- **Every option always shows its explanation after an attempt** - chosen or not,
  right or wrong. A bare "wrong" is a bug.
- **Unlimited retries.** Mastery per question = answered correctly at least once,
  ever. Re-attempting a mastered question never un-masters it.
- **No auto-surfaced help.** No "want a hint?" prompts on wrong answers. The
  explanation IS the teaching.
- **Single-player, local persistence.** Dexie only (note the existing memory:
  session history moves to Clerk-synced storage later - keep the persistence
  surface small and migratable, don't design for sync now).

## Phase 1 - Data model

Add to `src/content/chapters/types.ts` (this is the schema ask CURRICULUM §21.1
reserves; QUIZ_FRAMEWORK §2 is the source of truth for the shape):

```ts
export type QuizQuestionKind =
  | "single" | "multi" | "matching" | "ordering" | "diagram" | "estimate";

export type QuizOption = {
  id: string;                 // stable within the question
  label: string;              // markdown
  explanationMd: string;      // shown after any attempt, always
  correct: boolean;
};

export type QuizQuestion = {
  id: string;                 // persistence key - never reuse (QUIZ_FRAMEWORK §17)
  kind: QuizQuestionKind;
  difficulty: 1 | 2 | 3;
  prompt: string;             // markdown
  graph?: ArchitectureGraph;  // kind "diagram" only, rendered read-only
  options: QuizOption[];
  /** kind "ordering": correct sequence of option ids. */
  correctOrder?: string[];
  /** kind "matching": pairs of [leftLabel, correctOptionId]. */
  pairs?: [string, string][];
};
```

`ChapterDefinition` gains `quiz?: QuizQuestion[]` (absent = chapter has no quiz;
checkpoints never have one).

Deliverables: types + a registry-level test (mirror `registry.test.ts` patterns)
asserting question id uniqueness per chapter, ≥2 options, ≥1 correct option for
single/multi, `graph` present iff kind is diagram, `correctOrder`/`pairs` present
iff their kind. `stages` (Process chapters) is explicitly OUT of scope here - it
gets its own brief later; do not build it speculatively.

## Phase 2 - Persistence and progress semantics

- Dexie **version 8** in `src/persistence/db.ts`: new table `quizProgress`,
  primary key `[chapterDefinitionId+questionId]`, row
  `{ chapterDefinitionId, questionId, answeredCorrectlyAt: number }`. Additive
  migration only - follow the version(7) pattern and its comment style.
- `src/curriculum/progress-store.ts`: hydrate the new table alongside the other
  two; add `correctQuestionIdsByDefinition: Map<string, Set<string>>`, a
  `recordQuizCorrect(chapterDefinitionId, questionId)` mutator (Dexie put +
  in-memory update in the same action, new Map/Set instances per the store's
  comment), and include quiz rows in `resetChapter` (delete the chapter's
  quizProgress rows so redo means redo).
- `src/curriculum/progress.ts` (`deriveStatus`): COMPLETED now requires
  validation pass AND quiz complete **when the definition has a quiz**; chapters
  without a quiz keep current behavior; the manual-complete override still wins
  (it is an override). Quiz attempted but build not passed (or vice versa) =
  IN_PROGRESS. Update `summarizeCourse` only if its math reads statuses (it
  should be unaffected).
- Watch the trap the store's comments document: statuses must re-derive
  identically on the Learning Path and in the workspace sidebar from the same
  store.

## Phase 3 - Quiz components (the Knowledge Check section)

Location: the **Reader**, as the last content section before `DesignEditorCTA`
(CURRICULUM §5.3: recap -> knowledge check -> transition brief -> CTA). The
canvas route / QuestionPane is untouched - quizzes never render there.

New components under `src/chapters/quiz/`:

- `QuizSection.tsx` - heading ("Knowledge check"), question list, per-question
  state from the progress store. Renders nothing if the chapter has no quiz.
  Shows a quiet "all questions answered" state when every question is mastered
  (text + check, no celebration).
- `QuizQuestionCard.tsx` - shell: prompt (MarkdownRenderer), difficulty as the
  existing DifficultyDots pattern (subtle, not a score), kind-specific body,
  submit, then the post-attempt state: every option marked correct/incorrect
  with its explanationMd revealed, and a "Try again" affordance that resets the
  card locally (mastery, once earned, stays).
- Kind bodies:
  - `SingleChoice` (radio) / `MultiChoice` (checkbox; correct = exact set).
  - `EstimateChoice` - visually identical to single; separate component so
    bucket-style prompts can style options monospaced.
  - `Ordering` - list the options in a scrambled fixed order with up/down
    controls (keyboard-first; no drag dependency). Correct = exact sequence.
  - `Matching` - left column of prompts, each with a select of right-side
    options. Correct = all pairs right.
  - `DiagramQuestion` - read-only render of `question.graph` above a
    single-choice body. Reuse the existing read-only graph rendering used by
    the Debrief's reference graphs (find it via graphify; do NOT build a second
    graph renderer). Canvas is non-interactive: no palette, no selection, pan
    and zoom only if the reused component already provides them.
- Submission logic is pure and unit-testable: `evaluateAnswer(question,
  selection) -> { correct: boolean }` in `src/chapters/quiz/evaluate.ts`.

Interaction rules: submit disabled until a selection exists; after submit, the
card locks into review state until "Try again"; on first correct,
`recordQuizCorrect` fires exactly once. All states keyboard-reachable, focus
moves to the result region on submit (a11y), `prefers-reduced-motion` respected
(state changes swap instantly).

## Phase 4 - Integration and status surfaces

- `ChapterReader.tsx`: render `QuizSection` (needs the chapter's definition,
  already looked up there) between the lesson article and `DesignEditorCTA`.
  Add "Knowledge check" to the extracted headings so the TOC includes it.
- Status chips: `ReaderSidebar`, `ChapterSidebar`, `ChapterRow`,
  `OverallProgress` all read `deriveStatus` - verify they reflect the new
  COMPLETED semantics with no per-component changes (that is the point of
  Phase 2's design). Where a chapter is IN_PROGRESS with build passed but quiz
  open, the workspace sidebar may show a one-line "Knowledge check remaining"
  note - copy only, no nagging, no badges.
- Draft chapters (`placeholder: true`): quiz renders with the existing Draft
  badge treatment so dummy content never reads as finished curriculum.

## Phase 5 - Diagram question polish (post-release-3 acceptable)

- Fit-to-graph initial viewport, correct category colors/edge-kind styling from
  the registry (free if Phase 3 truly reused the existing renderer).
- Graph JSON in QUIZ_FRAMEWORK banks becomes fixture data for a storybook-less
  visual check page under `src/app/dev/` (follow `blueprint-lab`'s pattern) so
  content authors can eyeball diagram questions without a full chapter.

## Phase 6 - Retrospective quizzes (RWE) and Review affordance (deferred)

- RWE retrospective quizzes reuse everything above; the only new piece is
  gating: the quiz section renders only after the project's Phase B pass
  (`evaluateChapter` outcome). Build nothing bespoke until the first real RWE
  project content lands.
- The Home "Review" affordance (CURRICULUM §12) is out of scope entirely.

## Design and process requirements

- Use `/impeccable` for the visual design of the question cards before writing
  styles ("clarify" for copy, "layout" for the card grid); follow DESIGN.md
  tokens; update DESIGN.md inline when new component patterns land; run
  `/impeccable critique` after Phase 4.
- Tests: vitest + RTL following `QuestionPane.test.tsx` conventions. Minimum:
  evaluate.ts unit tests per kind (including multi's exact-set and ordering's
  exact-sequence), progress-store quiz mutators + resetChapter, deriveStatus
  matrix (quiz/no-quiz × build/no-build × manual), QuizSection render states,
  one DiagramQuestion smoke test.
- Git: branch per phase off the current release branch
  (`feature/quiz-data-model`, `feature/quiz-persistence`,
  `feature/quiz-components`, `feature/quiz-integration`), full local pipeline
  (`npm run typecheck && npm run lint && npm test && npm run build`) green
  before every push, ask before pushing, never merge anything yourself.
- After each significant session, spawn the progress-log subagent per
  CLAUDE.md. Run `graphify update .` after code changes.

## Definition of done (release-3 slice = Phases 1-4)

- A chapter with a `quiz` array shows a Knowledge Check in its Reader; all six
  kinds render and evaluate; every attempt reveals all explanations; mastery
  persists across reloads; COMPLETED requires build + quiz for quizzed
  chapters; zero regressions in the 958-test suite; no new scores/streaks/
  timers anywhere; pipeline green.

## Open questions (resolve with the user before the affected phase, not before)

1. Phase 2: should manual-complete also require quiz completion, or stay an
   unconditional override? (Plan assumes: stays an override.)
2. Phase 3: ordering UI - up/down buttons chosen over drag for a11y and zero
   dependencies; confirm before building if drag feels required.
3. Phase 4: exact copy for the "Knowledge check remaining" sidebar note - run
   through `/impeccable clarify`.

## Addendum (2026-07-31) - Exam pivot supersedes Phases 4-6's delivery UI

Phases 1-6 above shipped an inline "Knowledge Check": per-question immediate feedback,
unlimited retries, no scores - matching QUIZ_FRAMEWORK.md's original v1.0 philosophy.
After reviewing the live UI, the user deliberately pivoted away from that model entirely
to a full-screen, proctored-style exam. **Confirmed via direct Q&A this session - not a
misunderstanding, do not revert to the inline model without asking first.**

**Status: implemented (2026-07-31, branch `feature/quiz-exam-mode`).** Everything below
has been built: db.ts v9, progress-store.ts/progress.ts's exam gating, `src/chapters/
exam/` (exam-attempt, exam-fullscreen, ExamShell, ExamQuestionNav, ExamQuestionBody,
ExamConfirmSubmitDialog, ExamResults), `QuizLauncher.tsx` (replacing `QuizSection.tsx`/
`QuizQuestionCard.tsx`, both deleted), Reader integration, the dev-lab fixup, the full
test plan below, and the doc edits. Full pipeline (typecheck/lint/test/build) green.
Not yet pushed - awaiting user go-ahead per CLAUDE.md's push-confirmation rule.

### What changes

Not an inline quiz - a "Take the quiz" launcher (same slot in the Reader, before
`DesignEditorCTA`, unchanged placement) opens a full-screen exam:

1. Real Fullscreen API (`element.requestFullscreen()`), best-effort, with a CSS
   `fixed inset-0` fallback if unsupported/denied. Be honest in the UI and in DESIGN.md
   that this is NOT anti-cheat - browsers don't allow preventing Escape-exit or
   detecting tab-switches from a normal page. "Proctored" means full-screen, focused,
   distraction-free presentation only.
2. Question navigation: skip, back, forward. Answer state must survive navigating away
   and back (today's per-question local state resets on unmount - this is a real change,
   not just new chrome).
3. Submit-all-at-the-end, not per-question. Unanswered questions at submit: a styled
   confirm dialog ("N unanswered - submit anyway?"), then allow, scoring unanswered as
   incorrect.
4. Results screen: score/percentage shown prominently, plus a full per-question review
   (your answer, correct answer, every option's explanation) - reuses "every option
   always explains," just deferred to this end screen instead of per-question-immediately.
5. Up to 3 attempts per chapter. Passing (>=80%) on any attempt immediately locks
   further attempts ("Take the quiz" becomes "View your result"). Exhausting 3 attempts
   without passing also locks to "view your best attempt's summary."
6. 80% pass threshold displayed upfront, before starting, plus attempts-used/best-score
   once attempts exist.
7. Chapter COMPLETED requires the existing build-validation pass AND best exam score
   >= 80% (chapters with no `quiz` array stay ungated on quiz, same as today) -
   replaces the "every quiz question ever answered correctly" mastery check.

### What survives unchanged

- `QuizQuestion`/`QuizOption`/`ChapterDefinition.quiz` schema (Phase 1) - the pivot only
  changes how questions are answered/scored/persisted, not their shape.
- `evaluate.ts`'s `QuizAnswer` type and `evaluateAnswer()` - pure, reused as-is for exam
  scoring.
- The six kind-body input components (Phase 3: `SingleChoice`, `MultiChoice`,
  `EstimateChoice`, `Ordering`, `Matching`, `DiagramQuestion`) - pure, controlled,
  `disabled`/`revealed`-gated; fully reusable unchanged inside the exam shell (mid-exam:
  `disabled=false revealed=false`; on results: `disabled=true revealed=true`).
- `ReadOnlyGraphSummary.tsx` + `src/canvas/edge-styles.ts` (Phase 5's category-color +
  edge-kind styling) - unchanged, still used by `DiagramQuestion`.
- `extract-headings.ts`'s `appendKnowledgeCheckHeading` - unchanged; the
  `id="knowledge-check"` anchor just moves from the old `QuizSection`'s heading to the
  new launcher's heading.
- The Dexie migration *pattern* (compound-key table + secondary index + progress-store
  selector + `deriveStatus` gating) - the pattern survives; `quizProgress`'s specific
  schema does not (see below).

### What gets replaced/removed

- `src/chapters/quiz/QuizSection.tsx` + `.test.tsx` -> replaced by a new
  `QuizLauncher.tsx`.
- `src/chapters/quiz/QuizQuestionCard.tsx` + `.test.tsx` -> removed; its per-question
  immediate-submit/retry state machine doesn't fit "navigate freely, submit once at the
  end."
- `quizProgress` Dexie table + `correctQuestionIdsByDefinition` (progress-store) +
  `recordQuizCorrect` action -> dropped outright (Dexie `tableName: null`, precedent
  already exists in `db.ts`'s v6 migration) since no real user data exists yet
  (pre-beta) and the mastery model they backed no longer exists.
- `/src/app/dev/diagram-question-lab/DiagramQuestionLabContent.tsx` - needs updating
  once `QuizQuestionCard` is gone (its fixtures are all `kind: "diagram"`, so it can
  render `DiagramQuestion` directly with `disabled={false} revealed={true}`, no
  submit/review cycle).
- The RWE-gating rule just added to `QuizSection` (render nothing for `mode:
  "real-world-extraction"` chapters until `validationPassedDefinitionIds.has(chapter.id)`)
  moves verbatim to `QuizLauncher`.

### New engineering surface (design for the implementer)

**1. Persistence - `src/persistence/db.ts`, Dexie v9.** Remove the `QuizProgress`
type/table. Add:

```ts
export type ExamQuestionAnswer = { questionId: string; answer: QuizAnswer | null; correct: boolean };

export type ExamAttempt = {
  chapterDefinitionId: string;
  attemptNumber: 1 | 2 | 3;
  submittedAt: number;
  score: number; // 0-100, rounded - same convention as ProgressSummary.percent
  answers: ExamQuestionAnswer[];
};
```

`examAttempts` table: compound key `[chapterDefinitionId+attemptNumber]`, secondary
index `chapterDefinitionId` (mirrors `quizProgress`'s own shape exactly, so
`resetChapter` can delete a chapter's attempts without a full scan). `answer:
QuizAnswer | null` distinguishes "left blank at submit" (scored incorrect, but rendered
as "Not answered" not "Wrong") from an actual wrong guess.

```ts
this.version(9).stores({
  // ...all 8 prior tables, unchanged...
  quizProgress: null, // dropped - no upgrade callback needed, no real data exists yet
  examAttempts: "[chapterDefinitionId+attemptNumber], chapterDefinitionId",
});
```

**2. Store + status derivation.** `src/curriculum/progress-store.ts`: remove
`correctQuestionIdsByDefinition`/`recordQuizCorrect`; add `examAttemptsByDefinition:
Map<string, ExamAttempt[]>` and `recordExamAttempt(chapterDefinitionId, attempt)`
(Dexie `put` + memory update, replace-by-`attemptNumber` semantics matching Dexie's own
replace-by-key `put`). `resetChapter` deletes `examAttempts` rows for the chapter
instead of `quizProgress` rows - "redo means redo, attempts included, so a redo gives a
learner a fresh 3 attempts."

`src/curriculum/progress.ts`: `ProgressInputs.correctQuestionIdsByDefinition` ->
`examAttemptsByDefinition: ReadonlyMap<string, readonly ExamAttempt[]>`. New pure
helpers:

```ts
export const EXAM_PASS_THRESHOLD = 80;
export const MAX_EXAM_ATTEMPTS = 3;
export function bestExamScore(attempts: readonly ExamAttempt[]): number; // 0 for empty
export function examPassed(attempts): boolean; // bestExamScore >= EXAM_PASS_THRESHOLD
export function examLocked(attempts): boolean; // examPassed || attempts.length >= MAX_EXAM_ATTEMPTS
```

`deriveStatus`'s quiz-gating block becomes: `!quiz?.length ? COMPLETED :
examPassed(attempts) ? COMPLETED : ...` (best-score-wins, not last-attempt-wins).

Four other files hand-build `ProgressInputs` for their own `useMemo` deps and need the
same field rename: `src/app/HomeCanvas.tsx`, `src/chapters/ReaderSidebar.tsx`,
`src/chapters/ChapterSidebar.tsx`, `src/learning-path/LearningPath.tsx`.

**3. Exam shell - new `src/chapters/exam/` folder.**

- `exam-attempt.ts` (pure): `buildAttempt(chapter, answersByQuestionId, attemptNumber)
  -> ExamAttempt`, iterates `chapter.quiz`, calls `evaluateAnswer` per answered
  question, scores unanswered as incorrect with `answer: null`, computes rounded
  percentage score.
- `exam-fullscreen.ts`: isolates all direct Fullscreen API calls so components stay
  mockable in tests (jsdom has no real Fullscreen API). `requestFullscreenBestEffort(el):
  Promise<boolean>` (swallows any failure/unsupported case), `exitFullscreenIfActive(el)`.
- `ExamShell.tsx`: portaled (`createPortal(..., document.body)`), `role="dialog"
  aria-modal`, reusing `z-[var(--z-modal-backdrop)]`/`z-[var(--z-modal)]` tiers and the
  window-level-`keydown` rationale already documented in `src/canvas/ComponentPicker.tsx`
  (a dialog-scoped `onKeyDown` stops receiving events once a click moves
  `document.activeElement` to `<body>`). Owns the lifted `answersByQuestionId:
  Record<string, QuizAnswer>` state (the actual fix for "navigate away and back loses
  your answer") plus `currentIndex`. Props: `{ chapter, attemptNumber, onSubmitted,
  onExit }` - Dexie/store-agnostic, unit-testable with plain props.
- `ExamQuestionNav.tsx`: progress dots/"Question X of N", Back/Skip/Next.
- `ExamQuestionBody.tsx`: renders the current question's kind-body component
  (`disabled=false revealed=false`), converting the lifted `QuizAnswer` to/from each
  kind-body's own prop shape.
- `ExamConfirmSubmitDialog.tsx`: styled in-app dialog (not native `window.confirm`,
  matching the existing `DeleteConfirmPopover.tsx` precedent) - "N unanswered - submit
  anyway?".
- `ExamResults.tsx`: `{ chapter, attempt, onReturn }` - score banner + pass/fail +
  per-question review reusing every kind-body component with `disabled=true
  revealed=true` (free "every option explains" reuse) plus a Correct/Incorrect/
  Not-answered chip per question.

**4. `QuizLauncher.tsx` (replaces `QuizSection.tsx`).** Same slot/anchor/Draft-badge/
RWE-gating as today's `QuizSection`. Always shows `"{quiz.length} questions · 80% to
pass"` upfront. Four states: never attempted -> "Take the quiz"; attempts remain, not
passed -> "Attempt N of 3 used · Best score X%" + "Take the quiz"; passed -> "Passed ·
X%" + "View your result"; exhausted without passing -> "3 of 3 attempts used · Best
score X%" + "View your best attempt". Owns `view: null | "exam" | "results"` and is the
only caller of `recordExamAttempt`.

### Doc edits needed (deferred to the implementation session)

- **QUIZ_FRAMEWORK.md §1** point 4 - rewrite "no scoring theater" framing to describe
  the scored/attempt-capped/threshold model; keep points 1-3/5/6 (reasoning over
  recall, every answer explains, wrong options are real positions, progressively
  harder, scope-honest) as still-valid *authoring* rules, unaffected by the *delivery*
  pivot.
- **Root CLAUDE.md** "Non-negotiable product principles" - add one carve-out sentence
  after the "not a game" rule, modeled on DESIGN.md's existing "Progress-Is-Not-
  Validation Rule" exception pattern (state the rule -> the one exception -> why,
  "confirmed with the user").
- **CURRICULUM.md** §22 (assessment contract) and §5.3 beat 15 - update mastery/
  completion wording to the score-threshold model; beat *ordering* itself stays
  unchanged.
- **DESIGN.md** - replace the "Knowledge Check (quiz)" section (added this session, now
  describing a design that's being replaced) with the launcher/exam-shell/results
  visual spec, incl. the honest "not real anti-cheat" framing; update the one
  "Knowledge check remaining" sentence in "Chapter Sidebar" to score-based gating
  language.

### Test plan for the implementation session

- New: `exam-attempt.test.ts` (pure scoring, per-kind, unanswered-as-incorrect, score
  rounding, `total === 0` guard), `exam-fullscreen.test.ts` (mocked Fullscreen API),
  `ExamShell.test.tsx` (answer state survives navigation - the core bug-fix
  requirement; arrow-key nav; unanswered-confirm dialog; well-formed `onSubmitted`
  payload), `ExamResults.test.tsx` (score + full per-question review, at least one
  non-`single` kind), `ExamConfirmSubmitDialog.test.tsx`, `QuizLauncher.test.tsx` (all
  four states + RWE gating ported from the deleted `QuizSection.test.tsx`).
- Updated: `db.test.ts` (v9 chain - `quizProgress` gone, `examAttempts` present/empty,
  no upgrade callback to test), `progress-store.test.ts` (attempt-cap, resetChapter
  clears attempts), `progress.test.ts` (`deriveStatus` matrix rebuilt around
  `examAttemptsByDefinition`, best-score-wins not last-attempt-wins), `QuestionPane.
  test.tsx`/`ChapterSidebar.test.tsx`/`ChapterWorkspace.test.tsx`/
  `CurriculumSectionList.test.tsx`/`SectionCard.test.tsx` (mechanical field rename in
  mocks/fixtures).
- Deleted: `QuizSection.test.tsx`, `QuizQuestionCard.test.tsx` (superseded).

### Suggested implementation order

Schema (db.ts v9) and store/derivation (progress-store.ts, progress.ts) land together
first - this repo's own convention is small independently-shippable phases, but steps
1-2 here leave the app non-compiling if split, since `progress-store.ts` can't drop
`correctQuestionIdsByDefinition` without `db.ts`'s table already being gone. Then: pure
exam scoring (`exam-attempt.ts`, testable standalone) -> exam-taking components
bottom-up (`ExamQuestionBody`/`ExamQuestionNav`/`ExamConfirmSubmitDialog`/
`exam-fullscreen` -> `ExamShell`) -> `ExamResults.tsx` -> `QuizLauncher.tsx` -> Reader
integration + dev-lab-page fixup + deletions -> docs -> full pipeline
(`typecheck && lint && test && build`) green before any push.

One branch for the whole pivot (`feature/quiz-exam-mode` or similar, off whatever branch
`feature/quiz-components` has landed on by then) rather than the original phase-per-
branch cadence - unlike Phases 1-6 (each independently shippable), this pivot's steps 1-2
alone leave the app in a broken intermediate state if merged separately.

## Addendum (2026-07-31) - Unlimited attempts supersedes the 3-attempt cap

The 3-attempt cap above (§"What changes" point 5, `MAX_EXAM_ATTEMPTS = 3`) is removed.
Attempts are now unlimited until the learner passes (>=80%). `examLocked` is now just
`examPassed` - passing is the only thing that locks the exam to view-only. Wrong
answers no longer cost anything; the learner can retake as many times as needed.
`QuizLauncher` drops the "N of 3 attempts used" copy in favor of "Attempt N · Best
score X%" while unlocked, and "Retake the quiz" replaces "Take the quiz" once at least
one attempt exists. `attemptNumber` is typed `number` (was `1 | 2 | 3`) throughout
(`ExamAttempt`, `buildAttempt`, `ExamShell`).
