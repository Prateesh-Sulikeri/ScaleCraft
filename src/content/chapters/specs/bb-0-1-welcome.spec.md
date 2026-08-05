# Chapter spec - 0.1 Welcome to ScaleCraft

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-0-1-welcome`)
- Lesson body: `public/content/chapters/bb-0-1-welcome.md`
- Manifest row: `src/curriculum/manifest.ts`, slug `0-1-welcome-to-scalecraft`

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Know how the product teaches: the Reader-to-Editor loop, validation that explains itself, hints only on request, and what completing a chapter actually requires. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 10 minutes (Reader + Editor combined) |
| Prerequisites | None. This is the first chapter in the curriculum. |
| Unlocks | 0.2, and by transitivity everything. |
| Building blocks introduced | None formally. See §6 note below on the three primitives appearing as scenery. |
| Stages trained | Stage 1 (orientation). |
| Interview relevance | Low. No interview-loop step is taught here; 0.3 and 0.4 own that. |
| Production relevance | None directly. The chapter's subject is the product, not a system. |

## 2. Learning objectives (§5.2)

Five objectives, one category each, every §5.2 category represented. The code
field `learningObjectives` is a bare `string[]`, so the category tags live here
rather than being invented as a new schema field (§20.5).

1. **Knowledge** - Describe the Reader-to-Editor loop and state what Validate and Submit each check.
2. **Engineering** - Decide when to run Validate rather than Submit while a design is still in progress.
3. **Practical** - Diagnose and fix the two faults in the starter design, then pass Submit.
4. **Interview** - Explain why being told what is wrong without being told the fix is the same position an interviewer puts you in.
5. **Communication** - Restate a validation failure in your own words: which rule fired, on which components, and why it matters.

Each objective is exercised: 1 by the quiz (Q2, Q4) and the lesson; 2 by the
quiz (Q2) and the build; 3 by the build itself; 4 by the Interview lens section
and quiz Q4; 5 by the build's validate-read-fix cycle.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | The felt pressure is recognition-without-production: you can follow the article and still freeze at a blank canvas. |
| 3 Think first | "Think first" callout | Prediction prompt on what "wrong" means for a diagram. Never graded. |
| 4 Mental model | "The loop" | One anchor sentence: a loop, not a book. |
| 5 Visual explanation | Mermaid loop diagram | Primary diagram, placed before the prose that explains it (§8.1). Captioned on what to notice (the two backward arrows). |
| 6 Core mechanics | "The editor" | One paragraph naming the whole surface. The tour does the walkthrough; the lesson does not duplicate 21 steps. |
| 7 Internal mechanics | "Validate and Submit" | A comparison table plus the two-stage short-circuit and the explain-always commitment. Table chosen over prose per §20.6's scan-value rule. |
| 8 Trade-offs | "Hints stay closed" | Genuine two-sided decision, costs named both ways. |
| 9 Failure modes | omitted | Optional for Concept (§6). No system under discussion to fail. |
| 10 Scaling | omitted | Optional for Concept (§6). Not applicable. |
| 11 Production examples | **omitted - justified below** | Mandatory for Concept; see §4. |
| 12 Common mistakes | "Four ways to make this harder" | Four real first-session errors, as bullets. |
| 13 Interview lens | "Why this resembles an interview" | Two sentences; chapter is Interview: Low and padding it would violate §20.6. |
| 14 Connections | merged into "Next" | §6 permits merging adjacent short sections. Backward half is impossible (see §4); the forward tease is all that remains, so it lives with the preview rather than in a near-empty section of its own. |
| 15 Recap + knowledge check | "Recap" | 3 retrieval anchors, deliberately not a restatement of the chapter (§20.6). QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Names the exercise, the success condition, and the self-diagnosis path if the tour is paused. |
| Preview of next | "Next" | Pull into 0.2 by naming the five forces concretely, not a table of contents. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Production examples (mandatory for Concept) - omitted.** §13 requires real
  companies chosen for a decision they made, not implementation tourism. This
  chapter's subject is ScaleCraft's own teaching loop; no company made a
  decision about it. Any example would be a strained analogy to CI or code
  review, which §20.1's zero-filler rule and §20.4's overload budget both
  forbid. The section returns in 0.2 onward, where there is real subject matter.
- **Connections, backward half (§19 requires >=2 prior-chapter references) -
  not possible.** 0.1 is chapter 1 of 44; nothing precedes it. The Connections
  beat is present and carries the forward half (one tease to 0.2, per §19's
  one-per-chapter limit).
- **Failure modes and scaling behavior - omitted**, which §6 permits outright
  for Concept chapters.

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- The starter design is deliberately broken. This chapter teaches the editor's
  fix-it loop, not architecture design - the learner is not expected to have an
  opinion about whether the three-tier shape is *right*.
- Validation is described as "rules that run against your design". The rule
  engine's pattern matching, severity model, and the blueprint-drift comparison
  are not opened up at this stage.
- The three primitive components are named, not taught. What an application
  server *is* remains 1.6's job.

## 6. Component budget (§16)

§16 assigns `client`, `app-server` and `sql-database` a home chapter of 1.6, and
§16's rule is that a component is not in any palette before its home chapter.
0.1 palette: `["client", "app-server", "sql-database"]`.

**This is a declared, narrow exception, not an oversight.** 0.1's exercise is
the editor's fix-it loop, and the loop needs something concrete on the canvas to
fix. The three primitives appear as *scenery*: the tour and the validation
explanation name the missing one outright, the learner is never asked to choose
between components or to justify the topology, and 1.6 still performs the formal
introduction. Nothing in 0.1 depends on understanding what these components do.

Track A's earlier palette also carried `load-balancer` and `cache` (homes 3.4
and 3.14) to give the picker more to browse. Those are removed here: they are
Group A/D components a first-session learner has no context for, and browsing
variety is not worth two additional §16 violations. The picker still groups the
remaining three by category, and the `fix-component` tour step narrows to
`sql-database` regardless.

## 7. Validation rules (deliverable 4)

No new rules authored. The chapter curates four existing structural rules:
`orphan-component`, `missing-input-connection`, `request-flow-cycle`,
`component-relations`. These are the correct set because they are the only rules
that fire on graph coherence rather than on a specific component's semantics, so
none of them can surface a concept the curriculum has not introduced. The two
authored faults map onto them directly:

1. `sql-database` absent - a required component, surfaced as a synthesized
   missing-required-component entry rather than a rule violation.
2. The `client -> app-server` edge is `kind: "async"`, which Client's own
   `relations.outputs.allowedKinds` (`["request-flow"]` only) forbids, so
   `component-relations` fires with its explanation.

A chapter about the editor does not need chapter-scoped architectural rules;
authoring some would mean teaching architecture in a chapter whose declared
purpose is the tool.

## 8. Quiz (deliverable 5)

Four questions, ids permanent. Ramp 1/2/2/3 against §3's rough 30/45/25 target.
Drawn from or modeled on QUIZ_FRAMEWORK §5 (Foundations bank): Q3 below is the
bank's Q9 (think-first / productive failure) authored to full option form.

Scope check: every question draws only on 0.1's own material (the loop, Validate
vs. Submit, hints, what a clean validation does and does not promise). No
question requires architecture knowledge, which the learner does not have yet.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

There are no prior chapters, so every move must be taught in-chapter or by the
tour. Each required move and its source:

| Move | Taught by |
|---|---|
| Open the component picker | Tour step `open-picker`, which states both gestures (`/` or right-click) |
| Place a component on the canvas | Tour step `picker-tour` explains arm-then-click; `fix-component` walks it |
| Connect two components | Tour step `fix-component` asks for it explicitly |
| Change an edge's kind | Tour step `fix-edge`, anchored to the Edge Inspector |
| Run Validate and read the result | Lesson "What validation actually does" + tour steps `validate-intro`/`validate-click` |
| Know that Submit is the completion gate | Lesson "Validate and Submit answer different questions" + tour `submit-intro` |

No move is unsourced. The chapter is self-contained by construction, which is
the only way a first chapter can satisfy §18.2 rule 4.

**Sequencing risk noted:** the tour is skippable and pausable, so a learner who
skips it relies on the lesson plus the validation explanations alone. That path
was checked: the missing-component entry names the component, and
`component-relations` explains the illegal edge kind, so a skipper still has
enough to finish. The hint (opt-in) points at the tour replay pill for anyone
who wants the walkthrough back.

## 10. Divergence from CURRICULUM §14 - needs a doc decision

§14's 0.1 row reads **"Exercise: none (the tour is the chapter)"** and **"New:
none (tour of the seed graph, read-only)"**. The chapter as built has a real
fix exercise on a deliberately broken graph, gated by Submit.

The built behavior is kept: it is shipped, tested, and pedagogically stronger
than a read-only tour, because it makes the learner run the product's core loop
once before anything is at stake. Per pending-content.md's working process,
this is proposed as an edit to CURRICULUM.md §14 in its own commit rather than
authored around silently. Until that edit is reviewed, this spec and §14
disagree, and this section is the record of it.
