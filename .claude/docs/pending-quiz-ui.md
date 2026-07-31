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
