# Chapter spec - 0.4 The System Design Lifecycle

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-0-4-the-system-design-lifecycle`)
- Lesson body: `public/content/chapters/bb-0-4-the-system-design-lifecycle.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `0-4-the-system-design-lifecycle`

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Preview the Interview Loop (§10.1) as a map of Part 1, so the learner sees the whole eight-step workflow once before living each step in its own chapter. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 15 minutes (Reader + knowledge check; no build - see §4). |
| Prerequisites | 0.3 Interview Design vs. Production Engineering. |
| Unlocks | All of Part 1 (1.1-1.11), which is one loop step per chapter. |
| Building blocks introduced | None. §16 homes the first three components at 1.6. |
| Stages trained | Stage 1 (orientation). |
| Interview relevance | High - the loop itself is interview vocabulary the rest of Part 1 assumes. |
| Production relevance | The same loop runs formalized as a written design doc (Google) or narrative memo (Amazon), not just spoken in an interview. |

## 2. Learning objectives (§5.2)

Four objectives. Practical omitted, same justified Concept-chapter carve-out
0.2 and 0.3 used - no components introduced, no construction-family exercise.

1. **Knowledge** - Name the Interview Loop's eight steps in order and state
   what each one produces.
2. **Engineering** - Decide, given a mid-design follow-up, how much of the
   loop needs to be re-run versus patched locally.
3. **Interview** - Recognize which loop step a follow-up question is
   targeting, and answer inside that step rather than defending the whole
   design.
4. **Communication** - Narrate which step of the loop you're in during a
   design conversation, the way a senior candidate does.

Each objective is exercised: 1 by "What each step produces" + the ordering
quiz question (Q3); 2 by "How far back to go" + quiz Q4; 3 by "In an
interview" + quiz Q2/Q5; 4 by the senior-answer example.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 6 sentences | A candidate designing "Twitter" draws a full system in 15 minutes before the interviewer asks the scale question - half the diagram now has to be redrawn. The failure is order, not content, which is the chapter's whole thesis stated as a scene rather than a claim. |
| 3 Think first | "Think first" callout | Prediction prompt: what's the very first move on an open-ended prompt? |
| 4 Mental model | "The loop" | One-sentence anchor (fixed sequence, each step producing what the next needs) plus the framing that this is not interview-specific. No external analogy forced - §5.3 marks the analogy "where honest"; 0.3 set the same precedent of a purely definitional anchor over a strained metaphor. |
| 5 Visual explanation | Mermaid diagram, same section | Eight-node left-to-right flow with a dotted return edge from step 8 to step 2 - the loop's namesake. Captioned per §7.2/§20.3, the caption naming what the dotted arrow means rather than restating the node labels. Process-flow diagram authored as Mermaid, not ScaleCraft graph JSON, consistent with `pending-chapters.md` open decision 3 ("Part 0 is unaffected - process flows are Mermaid by spec anyway"). |
| 6 Core mechanics | "What each step produces" | Eight-row table (step / what it produces / which Part 1 chapter teaches it) - this table *is* the "map of Part 1" the chapter's own purpose line promises, so it carries most of the chapter's information density by design. Step 2's row explicitly names 0.2's five forces (a deliberate second, concrete appearance of a backward connection already used substantively, matching 0.3's own precedent for this pattern) without re-listing the five individual force names, sidestepping `pending-chapters.md` open decision 4 (the §14/§10.1 force-list contradiction) entirely rather than taking a side in it. |
| 7 Internal mechanics | Paragraph following the table | The causal-dependency argument: each row needs the one above it, illustrated against the cold open's own failure (skipped straight to step 4 without step 3's scale). |
| 8 Trade-offs | "How far back to go" | The re-entry cost when step 8 reopens an earlier step: restart-from-scratch (safe, costs time) vs. patch-only-what-changed (fast, risks a silently wrong assumption) - both costs named, resolved with a concrete judgment call (check requirements first). |
| 9 Failure modes | omitted | Optional for Concept (§6); no single system under discussion to fail. |
| 10 Scaling | omitted | Optional for Concept (§6); not applicable without a system. |
| 11 Production examples | "Same loop, on paper" | Google's design-doc convention and Amazon's "6-pager", per §13's public-decision rule - both are documented practices that run this exact loop, formalized and slowed down rather than narrated live. Ties directly back to 0.3's two-registers thesis instead of introducing a new frame. |
| 12 Common mistakes | "Common mistakes" | Three: drawing before clarifying (the cold open's own mistake), silently picking a design without naming the alternative (skipping step 7), and treating a step-8 follow-up as an attack rather than the loop's own re-entry mechanism. |
| 13 Interview lens | "In an interview" | High relevance, so this section carries real weight: interviewer silence and follow-up targeting explained in loop-step terms, then the mandatory §10.3 "senior answer" line, built only from this chapter's own step names. |
| 14 Connections | merged into "Next" | Backward: 0.2 (named twice - once substantively in the step-2 table row, once again in "Next" per §19's placement rule, mirroring 0.3's own precedent for a deliberate double-appearance) and 0.3 (the two-registers frame, reused as the organizing idea of "Same loop, on paper" and named again in "Next"). Two explicit backward connections, satisfying §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States there is no build and that the ordering quiz question is the actual exercise CURRICULUM §14's own row promises ("Exercise: ordering exercise") - same no-build pattern 0.2/0.3 established. |
| Preview of next | folded into "Next" | Previews **1.1** (Understanding the Problem - living step 1, Clarify) with an unresolved pull (most candidates ask questions that don't change anything; 1.1 is about the four that do). Further-out marked tease to **1.6** (the first real canvas build, matching step 4's "High-level design"). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** Same exception
  0.2 and 0.3 recorded (§11.1): no components are introduced (§16 homes the
  first three at 1.6), so there is nothing to build with that wouldn't be a
  forward dependency. CURRICULUM §14's own 0.4 row states "New: none" and
  gives the exercise as "ordering exercise (arrange the eight steps;
  explanation per placement)" - realized here as the quiz's `ordering`
  question (Q3), exactly the pattern 0.2 used for its matching question and
  0.3 flagged as reusable for every no-build Part 0/1 chapter.
  `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`.
- **Failure modes and scaling behavior - omitted**, permitted outright for
  Concept chapters by §6. Neither applies without a concrete system to fail
  or scale; this chapter's subject is a process, not a system.
- **No everyday analogy in the mental-model beat.** §5.3 marks the analogy
  "where honest" - a forced comparison (checklists, pre-flight routines)
  would have been decorative rather than clarifying, since the loop's own
  structure (numbered, causally dependent steps) is already the clearest
  available frame for itself. 0.3 made the same choice for the same reason.

## 5. `hasEditorExercise: false` - reused, not re-derived

0.2's spec fixed the underlying mechanism
(`ChapterDefinition.hasEditorExercise`, `ChapterReader.tsx`'s CTA
suppression, `deriveStatus`'s completion gating) and explicitly flagged that
"every future Part 0/1 Concept chapter without a build (0.3, 0.4, 1.2, 1.3,
1.5) reuses this field." 0.4 does exactly that - no new engineering work,
just setting the field. Completion for this chapter is the exam pass alone.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3, matching 0.2's and 0.3's
convention (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK
§3's rough 30/45/25 target). Q1 and Q2 model QUIZ_FRAMEWORK §5's Q6 (the
"strongest first move" scenario, tagged "0.4 -> 1.1" in the bank) and the
general causal-dependency idea respectively - neither is a verbatim copy. Q3
is modeled directly on that bank's own Q5, the ordering question explicitly
written for this chapter ("the Interview Loop is the map of Part 1; ordering
it is the first retrieval of the whole workflow"). Q4 and Q5 are original.

**First `ordering`-kind question in the registry (Q3).** Options are the
eight step names with slug ids (`clarify`, `requirements`, `estimate`,
`high-level-design`, `deep-dive`, `bottlenecks`, `trade-offs`,
`evolve-defend`), each carrying `correct: true` and a standalone
explanation, following the `matching`-kind convention 0.2 established (every
option is a real, correct thing - `correct` marks pool membership, not
per-option rightness; the question's actual correctness is the sequence,
checked against `correctOrder` in `evaluate.ts`). The authored `options`
array is a full derangement against `correctOrder` (no option sits at its
own correct index) - `Ordering.tsx` displays `options` in exactly that
order with no shuffle, so anything short of a real scramble risks shipping
pre-solved, the same discipline 0.2's matching questions used for `pairs`
vs. `options`.

**Position-clustering check** (the bug 0.1/0.2 shipped once, see
`pending-chapters.md`). Four single-kind questions (Q1, Q2, Q4, Q5); correct
options sit at b, d, a, c respectively - four distinct positions, checked by
eye, not just against `quiz-invariants.test.ts`'s floor.

Scope check: every question draws on 0.4's own material plus 0.2 (the five
forces, already taught, referenced only by name) and 0.3 (the two
registers) - no question requires anything from Part 1, none of which has
been taught yet. Q5 deliberately synthesizes the loop with 0.3's registers,
placed last (difficulty 3) since it requires both chapters' material at
once.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid process diagram in the lesson body | 0.1, 0.2, and 0.3 all already used one - not a new skill |
| Answer an `ordering` quiz question (drag-free, up/down reorder) | New format this chapter (0.1 was `single`, 0.2 added `matching`, 0.3 added `multi`) - the prompt states the mechanic explicitly and `Ordering.tsx`'s up/down controls are self-explanatory without prior exposure, the same bar 0.3's playtest pass applied to its own new `multi` format |
| Apply "no force under pressure, no justified complexity" to a design's complexity level (implicit in Q1/Q2) | Directly taught in 0.2, already exercised once more in 0.3's own quiz |
| Recognize a register switch and answer inside it (Q5) | Directly taught in 0.3's "Why this resembles an interview" section, which this chapter's "Same loop, on paper" explicitly reuses before the quiz asks for it |
| Decide how much of a design to re-run after a follow-up (Q4) | Directly taught in this chapter's own "How far back to go" section before the quiz asks for it in a fresh scenario |

No move is unsourced.

## 10. Comparison to CURRICULUM §14's own row

0.4's row: "Purpose: preview the Interview Loop (§10.1) as a map of Part 1;
the learner sees the whole workflow once before living each step. New: none.
Prepares for: Part 1 in its entirety. Interview: High: the loop itself.
Exercise: ordering exercise (arrange the eight steps; explanation per
placement). Est: 15." The shipped chapter matches this row directly - no
divergence to reconcile or flag, unlike 0.1's built-vs-spec gap.

## 11. Note for the Opus pass

Not yet run - this is the Sonnet draft only (user direction: draft quickly,
no pipeline run this pass). Two things worth a second reader's attention in
particular:

- **Word count (1085, `wc -w`) sits above 0.2's and 0.3's own *pre-pass*
  drafts (808, 896) and close to their *post-pass* numbers (1092, 1156) for
  the same 15-minute estimate**, without having had a pass yet. The
  justification recorded here: this chapter's job is literally to be a map
  (eight named steps, each with a produced artifact and a home chapter,
  plus two production examples), which is inherently more discrete facts
  than 0.2's five forces or 0.3's single two-register contrast. Flagged
  per 0.2/0.3's own precedent of flagging a self-assessed density claim
  for the next reviewer to check rather than trusting it - if a reviewer
  disagrees, the table and the two production examples are the first place
  to look for a cut, not the connective prose (already trimmed once in this
  pass - see the working history: an early draft carried a standalone "Why
  the order isn't optional" section, folded into the table's own paragraph
  after being judged redundant with "Common mistakes"' first bullet).
- **`pending-chapters.md` open decision 4** (the §14/§10.1 five-forces
  contradiction) was sidestepped rather than resolved: the step-2 table row
  names "0.2's five forces" without re-listing them, so this chapter takes
  no position on which list is canonical. Worth confirming that reads as
  deliberate rather than evasive.
