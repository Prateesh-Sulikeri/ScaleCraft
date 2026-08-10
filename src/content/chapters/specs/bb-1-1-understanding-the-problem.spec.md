# Chapter spec - 1.1 Understanding the Problem

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-1-understanding-the-problem`)
- Lesson body: `public/content/chapters/bb-1-1-understanding-the-problem.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-1-understanding-the-problem`

**Wave.** First chapter of Wave 2 (Part 1, per `pending-content.md`). Wave 1
(Part 0, 0.1-0.4) is merged into `develop` and `main` (verified 2026-08-08
before drafting - `origin/develop` and `origin/main` both contain `e3a4074`
via PR #88/#87), so the wave-gate in `pending-content.md` ("do not start a
wave until the previous wave's chapters are merged") is satisfied.

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Turn an ambiguous one-line brief into scoped intent, by teaching the one test that separates a clarifying question worth asking from one that isn't. |
| Type | Process |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + knowledge check; no build - see §4). |
| Prerequisites | 0.4 The System Design Lifecycle. |
| Unlocks | 1.2 Functional Requirements directly; every later Part 1 chapter and every RWE project brief indirectly (every one opens with clarifying). |
| Building blocks introduced | None. §16 homes the three primitives at 1.6. |
| Stages trained | Part 1's default (§2): stage 1 continuing (naming what a clarifying question is for), stage 4 (choosing which questions are worth the interview's limited time), stage 5 (starting to shape scope from an ambiguous brief - this chapter's whole subject). |
| Interview relevance | High - this is loop step 1 (§10.1), the first thing a candidate does in every design interview. |
| Production relevance | The same filter (would a different answer change the design) is what a good requirements-gathering conversation or a PRFAQ's "who is this for" section is doing, just spoken instead of written. |

## 2. Learning objectives (§5.2)

Five objectives, all five §5.2 categories represented (Process chapters do
not get the Concept-only Practical carve-out - see §5 below for how Practical
is honestly exercised without a canvas).

1. **Knowledge** - State the test that decides whether a candidate clarifying
   question is worth asking: would a different answer change the design.
2. **Engineering** - Apply the test to a list of candidate questions for a
   brief and identify which ones would materially change the architecture.
3. **Interview** - Ask two or three targeted clarifying questions inside the
   interview's small clarify-and-scope budget (0.4), instead of reciting a
   checklist or skipping the step and drawing first.
4. **Practical** - Given a brief and a list of candidate clarifying
   questions, select exactly the ones that pass the test - the chapter's
   quiz-realized version of CURRICULUM §14's staged exercise (see §5 below).
5. **Communication** - Name, out loud, which specific design decision a
   clarifying question's answer would flip - the senior move "In an
   interview" demonstrates.

Each objective is exercised: 1 by "The test" + quiz Q2; 2 by Q1 (multi-select)
and Q4; 3 by "In an interview" + quiz Q3; 4 by quiz Q1 itself; 5 by the
senior-answer line + quiz Q5.

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 6 sentences | A candidate given "design a URL shortener" draws a full system in under 5 minutes; the interviewer's first question (scale, read vs. write) forces a redraw. Same product (URL shortener) QUIZ_FRAMEWORK.md §6's own Q1 uses, for continuity, not copied verbatim. |
| 3 Think first | "Think first" callout | Prediction prompt: with only three questions available, what's the test for picking them - stated as a question, not given away. |
| 4 Mental model | "The test" | One-sentence anchor: a clarifying question earns its place only if a different answer would change the design. No everyday analogy - same choice 0.3/0.4 made for the same reason (the test is already the clearest frame for itself; a forced metaphor would be decorative). |
| 5 Visual explanation | Mermaid decision-tree, same section | The test as a two-branch flowchart (yes -> ask it; no -> drop it). Decision-tree diagram type per §7.1's inventory ("Selection procedures"), Mermaid per open decision 3 (no topology exists yet to render as graph JSON). Captioned per §7.2/§20.3. |
| 6 Core mechanics | "Where to look" | Four-category table (scope, scale, usage pattern, non-negotiables) with one example question each, plus a caveat paragraph: a question can sit in a category and still fail the test - the category is where to look, the test in beat 5's diagram still decides. |
| 7 Internal mechanics | "What a good question actually does" | The one level down: a good question collapses *part* of the design space - the ratio decides which path the design work goes into, but not which fix, because 0.2 splits cache (same rows read repeatedly) from read replica (out of read capacity) on a different axis. Reuses 0.2's material by name, per §19's double-appearance convention. Corrected in the Opus pass (§13). |
| 8 Trade-offs | "The cost of asking" | Both costs named: too few questions costs a redraw (cold open's own failure); too many eats the design time, sized against 0.3's ~45 minutes divided over 0.4's eight loop steps. |
| 9 Failure modes | omitted | Optional for Process (§6). See §4 below. |
| 10 Scaling | omitted | Optional for Process (§6). See §4 below. |
| 11 Production examples | omitted | Optional for Process (§6). See §4 below. |
| 12 Common mistakes | "Common mistakes" | Four: drawing before asking (cold open callback), asking questions that fail the test, reciting the four categories as a fixed script instead of reading the brief, treating clarify as one-and-done instead of a step the loop can reopen (0.4's dotted arrow, named). |
| 13 Interview lens | "In an interview" | High relevance. What a follow-up ("why does that matter?") is actually asking, then the mandatory §10.3 senior-answer line, built only from this chapter's own vocabulary (three questions, each justified by what it would flip). |
| 14 Connections | merged into "Next" | Backward: 0.2 (five forces / cache / read-replica, used substantively in beat 7 *and* named again in "Next", the established double-appearance pattern) and 0.4 (the loop, clarify as step 1, named twice the same way). The Opus pass added a third, 0.3 (the ~45-minute interview register), in beat 8. Meets §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States plainly there is no canvas build (components arrive at 1.6), names the quiz's multi-select question as the actual exercise, and states what's withheld: which candidate questions qualify is not told in advance. |
| Preview of next | folded into "Next" | Previews **1.2** (turns today's clarifying answers into a functional-requirements list). Opus pass rewrote the pull, which was descriptive rather than tense: the unresolved pressure is now §14's own "scope ruthlessly" - cutting features that sound essential before they become architecture. Further-out marked tease to **1.6** (first canvas build), matching 0.4's own tease to the same chapter. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Failure modes and scaling behavior - omitted**, permitted for Process
  chapters by §6 (both "o"). Neither applies: there is no system yet to fail
  or scale, only a step in a design conversation.
- **Production examples - omitted**, also "o" for Process. The natural
  production-register example for this exact idea (design docs stating
  goals/non-goals before any design) is 0.4's own "Same loop, on paper"
  section, already shipped with Google and Amazon as the examples. Repeating
  it here would be restatement, which §20.6 cuts on sight; a *different*
  production example would need its own real decision, and clarifying
  questions specifically (as opposed to requirements-gathering broadly) do
  not have a distinct, load-bearing public example beyond what 0.4 already
  used. Flagged here rather than silently dropped.
- **No everyday analogy in the mental-model beat**, same choice 0.3 and 0.4
  made for the same reason: the test itself (would a different answer change
  the design) is already the clearest available frame - a forced comparison
  (a doctor's intake questions, a mechanic's diagnostic questions) would be
  decorative, not clarifying.

## 5. The staged exercise, degraded per `pending-content.md`

CURRICULUM §14's own 1.1 row: "Exercise: staged - given a vague brief, pick
the 4 highest-value clarifying questions from 10; feedback explains what each
answer would change." The `stages` mechanism this implies does not exist yet
(`pending-content.md`: "Stages UI does not exist... Part 1 chapters can be
authored (prose + quiz + a small non-staged exercise where honest) but their
staged exercises stay in the spec, flagged").

Realized here as quiz Q1 (`multi`, 8 candidate questions instead of 10, 4
correct instead of exactly-4-of-10) - the same skill (apply the test, pick
the ones that pass), a smaller candidate pool so the format stays a normal
multi-select rather than needing a custom UI. Per-option `explanationMd`
already gives "feedback that explains what each answer would change" per
option, which is what the staged version's feedback promises - the gap
between this and the real staged exercise is entirely about UI (a dedicated
stage with a 10-item picker and richer per-choice branching), not about
teaching content. Flagged for a revisit once the stages UI lands (triggers
Wave 2 per `pending-content.md`) - at that point this chapter is the first
candidate to receive its originally-specified staged exercise.

No `availableComponentIds`/`requiredComponentIds` beyond `[]`, no
`starterGraph`, `blueprints: []` - same as 0.2/0.3/0.4, for the same reason
(§16 homes the three primitives at 1.6, so there is nothing to build with
that wouldn't be a forward dependency).

## 6. `hasEditorExercise: false` - reused, not re-derived

0.2's spec fixed the underlying mechanism
(`ChapterDefinition.hasEditorExercise`, `ChapterReader.tsx`'s CTA
suppression, `deriveStatus`'s completion gating) and flagged reuse for every
future Part 0/1 chapter without a build. 1.1 is the first Part 1 chapter to
actually reuse it - no new engineering work. Completion is the exam pass
alone.

## 7. Component budget (§16)

None introduced. `availableComponentIds: []` - no exceptions to declare.

## 8. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 9. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2/0.3/0.4's
convention). Q1 models and expands QUIZ_FRAMEWORK.md §6's own Q1 (the "design
a URL shortener, select all clarifying questions that matter" multi-select) -
same product, same mechanic, more candidate options (8 vs. 4) since Q1 here
also stands in for the staged exercise (§5 above). Q2-Q5 are original,
written for this chapter's own material.

**Q1 · multi · 1.** "Design a URL shortener." 8 candidate clarifying
questions, 4 correct: read:write ratio, links/day (scale), expiry (a
non-negotiable that decides whether a cleanup subsystem exists), click
analytics (adds an async subsystem). 4 distractors, each a real thing a
candidate might ask that still fails the test: language, short-code length
(6 vs. 8 chars), product name, cloud provider. Every option's
`explanationMd` states what the answer would or would not change, per
QUIZ_FRAMEWORK §1 point 2.

**Q2 · single · 1** (correct at `c`). Tests recognizing a plausible-sounding
non-clarifying question (testing framework choice) and, specifically, the
*reasoning* for rejecting it (fails the test), not just the conclusion -
option `d` reaches the same "no" via the wrong mental model (category
membership instead of the test itself), which is the caveat the lesson's
"Where to look" section states explicitly.

**Q3 · single · 2** (correct at `a`). The cost-of-over-asking scenario: 15 of
45 interview minutes spent clarifying. Distractor `d` is the same
appearances-vs-substance trap 0.4's own Q2 used ("the interviewer will
assume...") rather than naming the real mechanism (the budget itself).

**Q4 · single · 2** (correct at `d`). A chat-app scenario testing that
"sounds like a security detail" is not the same as "fails the test" -
end-to-end encryption changes what the server can do with message content
(search, moderation, storage), a real architecture fork, even though it
initially reads as an implementation question the way `database choice` and
`language` genuinely are.

**Q5 · single · 3** (correct at `b`). Synthesis question bridging this
chapter to 0.2: a 1000:1 read:write answer is read against 0.2's five
forces, landing on latency and throughput (what caching/read-replica trade
against) rather than durability or cost-only. Placed last (difficulty 3)
since it requires both 0.2's and this chapter's material at once, the same
placement logic 0.4's own Q5 used for its register-synthesis question.

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four
single-kind questions (Q2, Q3, Q4, Q5); correct options sit at c, a, d, b -
four distinct positions, checked by eye, not just against
`quiz-invariants.test.ts`'s floor (which only catches full clustering, not
this kind of even-spread verification).

Scope check: every question draws on this chapter's own material plus 0.2
(five forces, cache, read replica - already taught, referenced by name) and
0.4 (the loop, the clarify-and-scope time budget). No question requires
anything from 1.2 onward.

## 10. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a Mermaid decision-tree diagram | New diagram *shape* this chapter (0.1-0.4 used process-flow/five-force diagrams, not a yes/no branch) - the two-branch structure is self-explanatory without prior exposure, the same bar 0.4's playtest pass applied to its own new `ordering` format |
| Recognize "cache" and "read replica" as concepts and reason about when each helps | Directly taught in 0.2's own cold open and core-mechanics section, reused here by name |
| Reason about a fixed, small time budget for one step of a larger process | Directly taught in 0.4's "How far back to go" and the loop-timing framing 0.4 established |
| Answer a `multi` "select all that apply" quiz question | New format for *this chapter*, but not new to the registry - 0.3 already introduced `multi`, so the mechanic itself is familiar even though this is the first chapter to *also* use it as an exercise stand-in (§5 above) |
| Apply "would a different answer change the design" to an unfamiliar system (chat app, Q4) | Directly taught in this chapter's own "The test" and "Where to look", exercised once already in Q1 on a different system (URL shortener) before the quiz asks for it again on a new one |

No move is unsourced.

## 11. Comparison to CURRICULUM §14's own row

0.4's row: "Purpose: turn an ambiguous one-line brief into scoped intent via
clarifying questions. Assumes: Part 0. Prepares for: 1.2, every RWE brief.
Interview: High: step 1. Exercise: staged - given a vague brief, pick the 4
highest-value clarifying questions from 10; feedback explains what each
answer would change. Est: 20." The shipped chapter matches this row's
purpose, assumes/prepares-for, and interview relevance directly. The one
divergence is the exercise mechanic (quiz multi-select standing in for a
staged UI that doesn't exist yet), recorded in §5 above as a flagged
degradation, not a silent one.

## 12. Items flagged for the second pass (all resolved - see §13)

Raised by the Sonnet draft for a second reader:

- **The Q1-as-staged-exercise substitution (§5).** Not re-examined: the Opus
  pass was scoped to content, content-structure, blueprints, component lists,
  submit validations, and diagrams; the quiz was explicitly out of scope. The
  flag stands for whoever runs the quiz pass.
- **Word count** against 0.4's pre-pass draft. Checked: 0.4 ships at 1102
  words for a 15-minute estimate; 1.1 came in at 1063 and left the pass at
  1153 for a 20-minute estimate. The +90 is one added paragraph in beat 7 (the
  accuracy correction below), not padding.
- **Production examples omission (§4).** Confirmed, with reasoning in §13.

## 13. Opus proofread pass (2026-08-08)

Content, content-structure, blueprints, component lists, submit validations,
and diagrams only. Quiz, hints, and `problemStatement` /
`learningObjectives` / `curriculumContext` were out of scope and untouched.

**Accuracy fixes (the substantive ones).**

1. **The cache / read-replica claim in beat 7 was wrong.** The draft read: "a
   1000:1 read:write ratio makes 0.2's cache and read replica close to
   mandatory." 0.2's own text splits those two on *different* axes - "a cache
   helps when the same rows are read over and over: it buys latency, and
   cost. A read replica helps when the database is simply out of read
   capacity: it buys throughput" - two competing diagnoses for one slow
   endpoint, not a pair that both become more necessary as read skew rises. A
   bare ratio establishes neither repeated-row reuse nor absolute read volume,
   so it cannot make either fix mandatory (1000:1 at ten requests a day needs
   nothing). Rewritten so the ratio decides *which path* the design work goes
   into, and a second paragraph states what the answer explicitly does not
   settle. This is a strictly better beat 7: the "one level down" is now the
   real distinction (locality vs. volume) rather than a bundling, and it earns
   the word *part* in "collapses part of the design space".
2. **"0.4's ~5-10 minutes of 45" was an invented attribution.** 0.4 never
   states a clarify budget; the ~45-minute interview figure is 0.3's (0.4
   restates it once). Rewritten to derive the size from material actually
   taught - 0.3's ~45 minutes over 0.4's eight steps - and to own the "a
   couple of minutes, not ten" figure as this chapter's own claim. Also
   satisfies §18.2 rule 1 properly and adds 0.3 as a third backward
   connection.
3. **"0.4's dotted arrow starts right here" was wrong.** 0.4's diagram is
   `H -.-> B`: the arrow runs step 8 to step 2, so it neither starts nor ends
   at clarify. Reworded to 0.4's actual "How far back to go" teaching (the
   loop reopens whichever step moved, sometimes step 1).
4. **"What database should I use?" - "nothing about the design changes based
   on the answer"** is false in the curriculum's own terms (3.11 is SQL vs.
   NoSQL and changes design substantially). Reframed to the reason that
   actually holds and is forward-compatible: it isn't a fact about the problem,
   it's a decision that's yours to make. The "Common mistakes" bullet carrying
   the same overclaim was aligned. Note: `hints[1]` still says database choice
   and language "don't change the shape of the architecture" - defensible at
   Part 1's three-primitive palette, but out of scope here and worth a look in
   the hints pass.

**Diagram (§7.1 decision tree, §7.2).** Caption present and accurate ("the
branch is the whole mechanism"), and the two branches match the surrounding
prose. Two node labels used `\n` for line breaks, which Mermaid does not
document as a label line break (`<br/>` is the documented form, and this
renderer runs `securityLevel: "strict"`); no other chapter in the curriculum
uses either. Labels shortened so no break is needed, which removes the risk
without depending on unverified renderer behavior.

**Voice and density (§20.1, §20.6).** Cold open payoff, the "Where to look"
opener, the category-caveat paragraph, the "In an interview" opening move,
and the senior-answer tag line were each carrying more clause-stacking than
the idea needed; all shortened or split. The beat 7 closing sentence ("One
answer, and an entire branch of the design either becomes central or drops
out") restated the paragraph's own topic sentence and was cut per §20.6.

**Preview of next (§6).** The 1.2 preview was a table of contents, not pull.
Rewritten around §14's own 1.2 brief ("scope ruthlessly").

**Confirmed and deliberately left alone.**

- `blueprints: []`, `availableComponentIds: []`, `requiredComponentIds: []`,
  `validationRuleIds: []` - all correct. §16 homes `client`, `app-server`,
  `sql-database` at 1.6, so there is nothing to place, nothing to require, and
  no graph to validate. Confirmation only; nothing invented.
- **Production examples omission (§4) - confirmed, not rubber-stamped.** §13's
  format demands *who / why they chose it / when it applies / what trade-off
  they accepted*. For clarifying questions specifically, no public, load-bearing
  example clears that bar without collapsing into "state goals before
  designing", which 0.4 already shipped with Google's design docs and Amazon's
  6-pager. A second telling one chapter later is restatement (§20.6). Standing
  risk for the next author, though: if 1.2-1.5 each make the same call, Part 1
  ships with no production register at all, which §1.5 does not want. Worth
  deciding deliberately at 1.3 or 1.4 rather than by four independent
  omissions.
- **Structure against §5.3 / §6 for Process type.** All mandatory sections
  present in order: cold open, think-first, mental model, visual explanation,
  core mechanics, internal mechanics, trade-offs, common mistakes, interview
  lens, connections, recap, transition brief, preview. Failure modes and
  scaling omitted with §4's justification, both "o" for Process. No reordering.
- **"Next" chapter identity.** `src/curriculum/manifest.ts` has
  `1-2-functional-requirements` immediately after `1-1-understanding-the-problem`
  and `1-6-drawing-the-first-architecture` as the first build; both references
  are correct.
- **Recap.** Four retrieval anchors, not a chapter restatement. Bullet 3 was
  updated to carry beat 7's corrected claim; the rest stand.
