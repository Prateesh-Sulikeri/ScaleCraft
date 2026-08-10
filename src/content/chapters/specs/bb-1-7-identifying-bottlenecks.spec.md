# Chapter spec - 1.7 Identifying Bottlenecks

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-7-identifying-bottlenecks`)
- Lesson body: `public/content/chapters/bb-1-7-identifying-bottlenecks.md`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-7-identifying-bottlenecks` (`chapterDefinitionId` flipped from `null` to
  the id above)

**Wave.** First chapter of a new authoring session on the Wave 2 branch
(`feature/content-1-1-understanding-the-problem` at the time this branch was
cut), continuing directly after 1.6. This chapter's own branch,
`feature/content-1-7-identifying-bottlenecks`, stacks on top of that work
(1.1-1.6 all present) so 1.6 is available as real prerequisite content, not
just a CURRICULUM row - see `pending-chapters.md`'s ledger entry for the
branch topology decision.

**Type reverts to Process.** 1.6 was Building Block because it introduced
components; §14's Part 1 header names the whole part Process by default and
1.1-1.5 already resolved to Process under `pending-chapters.md`'s open
decision #6 (§14 wins when it conflicts with another section). 1.7
introduces no components (§16's audit lists it under "Concept chapters with
no component," alongside 1.1-1.5 and 1.8-1.11), so it reverts to the part
default rather than continuing 1.6's exception.

## 0. Open decision #7 hits this chapter directly, as already flagged

`pending-chapters.md`'s open decision #7 (raised by 1.6's Opus pass) already
names this: "§14's 1.7 row ('predict-then-check ... then simulate') makes the
same promise [as 1.6's unfulfilled simulator-trace row], so 1.7's author hits
this before the decision can keep being deferred." That prediction is
confirmed here. `pending-content.md`'s own dependency note covers exactly
this case: "Simulator-dependent beats (trace/predict exercises) degrade
gracefully: where the simulator prompt UI is missing, author the prediction
as a quiz question instead and note the intended upgrade." Applied directly:
the "predict-then-check on three presented graphs" exercise is realized as
three `diagram`-kind quiz questions (§10 below) - the *predict* half is real
(a shown graph, a question demanding a prediction before the explanation
resolves it); the *check* half is the question's own explanation text
standing in for a live simulator run. Not a stages-UI degradation (no staged
gate exists to substitute for); a simulator-UI degradation, the same class
pending-content.md names, not a new one. Intended upgrade: once a simulator
prompt component exists in the Reader/Editor, these three could become real
trace-and-confirm interactions instead of static quiz predictions - noted
here, not built.

This does not resolve decision #7 (whether to amend §14's two rows or build
the simulator work) - it is the second data point the decision itself
predicted, recorded so the eventual "decide once, for both rows" call has
both chapters' evidence.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Apply "what breaks first" systematically: trace a request path, compare each component's throughput ceiling, and find the lowest one - a mechanical check, not a guess by reputation. Distinguish a component that is merely slow from one that is genuinely at capacity. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + knowledge check, no build), per CURRICULUM §14's own row and `manifest.ts`. |
| Prerequisites | 1.6 Drawing the First Architecture. |
| Unlocks | 1.8 Engineering Trade-offs directly (diagnosis before decision); 2.2, which CURRICULUM §14 itself names as reapplying "1.7's skill applied spatially" to a request's network journey; every later Building Block/RWE chapter's failure-modes and scaling sections, which all assume this method rather than re-teaching it. |
| Building blocks introduced | None. §16's audit places 1.7 in the no-component list (with 1.1-1.5, 1.8-1.11) - the three primitives stay homed at 1.6, nothing new to introduce. |
| Stages trained | Part 1's default (§2: stages 1, 4, 5) - no new stage claimed. Stage 7 (Critique: "finds what breaks first") is *not* claimed here despite the verbal overlap; §2's own table homes stage 7's proving ground at Fix-the-Architecture-at-scale and RWE debriefs, not Part 1's no-build chapters, and this chapter has no build to critique. |
| Interview relevance | High - loop step 6 (§10.1): bottlenecks and failure. |
| Production relevance | The question every on-call engineer answers first during an incident: which component is actually out of capacity, versus which one just looks suspicious. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's range is 3-7); all five categories represented (Process
chapters don't get the Concept-only Practical carve-out, same as 1.1-1.5).

1. **Knowledge** - State the method: a system's throughput ceiling is the
   lowest per-component ceiling on the request path, not an average and not
   a guess by reputation.
2. **Engineering** - Distinguish a component that is slow (higher per-request
   latency, ceiling unchanged) from one that is unscalable (at its throughput
   ceiling, queuing regardless of how long you wait).
3. **Engineering** - Given two components' ceilings, identify which is the
   bottleneck today, and explain why that answer can flip as the ceilings
   change (an app tier scales close to linearly by adding instances; a single
   database primary's ceiling does not move the same way).
4. **Interview** - Answer "what breaks first?" for a shown design in under a
   minute, naming the mechanism (a ceiling comparison) rather than a
   memorized answer.
5. **Communication** - State, out loud, the trade-off between adding capacity
   before a ceiling is reached versus waiting until it's real.

Each objective is exercised: 1 by "The method" + "Tracing it on a real path" +
quiz Q1/Q2; 2 by "Slow is not the same as unscalable" + quiz Q4; 3 by "Why the
bottleneck moves" + "What changes at 10x and 100x" + quiz Q3/Q5; 4 by "In an
interview"; 5 by "Preempt it or wait for it."

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Felt pressure: 1.6 answered "what breaks first" for one specific shape; the interviewer's next design won't match it, and guessing by reputation isn't a method. Beat 2: every path has a narrowest point, and finding it is mechanical, not intuitive. |
| 3 Think first | "Think first" callout | Reuses 1.6's exact shape deliberately (client, one app-server instance, one database) so the prediction has a concrete, already-known target rather than an abstract one. Never graded. |
| 4-5 Mental model + visual explanation | "The method" | One-sentence anchor (system ceiling = lowest component ceiling on the path) + primary diagram. No everyday analogy, same choice 0.3/0.4/1.1-1.6 made - the ceiling framing is already concrete and a physical-object analogy (pipes, chains) would add a translation step the diagram doesn't need. |
| 6 Core mechanics | "Tracing it on a real path" | Maps the generic 3-stage diagram onto 1.6's actual client/app-server/database shape; states plainly that 1.6's specific answer was a fact about that chapter's numbers, not a rule. |
| 7 Internal mechanics | "Slow is not the same as unscalable" + "Why the bottleneck moves" | Two beats merged under §6's "adjacent short sections" allowance - the slow/unscalable distinction and the stateless-vs-single-primary asymmetry are one continuous idea (why the same design can have different bottlenecks at different capacities). |
| 8 Trade-offs | "Preempt it or wait for it" | Genuine two-sided call: add capacity ahead of a known ceiling (cost paid now, might be wasted) vs. wait and fix it when real (cost paid as a scramble under load). No default answer stated - the trade-off itself is the content. |
| 9-10 Failure modes + Scaling | "What changes at 10x and 100x" | Optional for Process (§6) but included - lens 7 explicit, applying the moving-bottleneck mechanism from beat 7 to concrete multipliers rather than restating it (tightened in the density pass below). |
| 11 Production examples | "In production" | Twitter's early, publicly well-documented database bottleneck (one relational database serving both writes and timeline reads). Format per §13: who, why it mattered, what the diagnosis-before-fix ordering was - the *fix* itself is out of scope (3.x material), only the diagnosis step belongs to this chapter. |
| 12 Common mistakes | "Common mistakes" | Four: guessing by reputation; conflating slow with unscalable; fixing the first suspected component without checking its ceiling; assuming today's bottleneck is permanent. |
| 13 Interview lens | "In an interview" | High relevance, loop step 6 (0.4). Mandatory §10.3 senior-answer line built only from this chapter's and 1.6's own vocabulary ("ceiling," "headroom"). |
| 14 Connections + Preview of next | "Next" | Backward (>=2, §19): 1.6 (the three-box shape and its one specific answer) and 1.4/1.5 (the numbers any real ceiling comparison needs). Forward: mandatory immediate-next preview to 1.8 (diagnosis vs. decision). One further-out tease to 2.2 (§19's "at most one"), directly supported by CURRICULUM §14's own text describing 2.2 as reapplying "1.7's skill applied spatially" - not an invented connection. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No CTA into the Editor (`hasEditorExercise: false`) - states plainly that the palette is unchanged from 1.6 and names what the knowledge check actually asks (predict the saturating component on three shown designs, then read the reasoning), matching 1.5's precedent for how a no-build chapter's "Your turn" reads. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No everyday analogy in the mental-model beat** - same choice
  0.3/0.4/1.1-1.6 made. A pipe/chain-link analogy was considered and cut: the
  ceiling framing plus the diagram are already concrete, and a physical
  metaphor would need its own orientation caveat (which end is the
  "bottleneck," which the diagram already states directly), costing more
  than it earns per the standing note 1.5's Opus pass left about metaphor
  words needing a fixed orientation.
- **No topology-styled primary diagram.** Unlike 1.6, the primary diagram
  does not render client/app-server/database as a labeled architecture
  graph. `pending-chapters.md`'s open decision #3 records that 1.6's
  Mermaid-as-topology exception was scoped narrowly to that chapter and
  should not be assumed to extend silently to later chapters. Rather than
  re-raise that call, the primary diagram here is deliberately generic
  ("Stage 1/2/3" with ceiling numbers, no component styling) - a capacity
  concept diagram, not an architecture-graph rendering - and the very next
  section maps it onto the real client/app-server/database names in prose.
  This sidesteps needing its own §7.2 exception call entirely. Flagged for a
  second reader to confirm this reads as a clean sidestep rather than an
  evasion of the same question 1.6 had to answer directly.
- **Quiz diagram questions do carry real component graphs** (client,
  app-server, sql-database as actual `ArchitectureGraph` JSON) - this is not
  the same rendering path as the lesson-body Reader limitation. `QuizQuestion.graph`
  renders through the quiz UI's own `ReadOnlyGraphSummary` component, already
  verified functional and already used by 1.6's own Q2 (see
  `pending-chapters.md`'s 0.2 entry for the original Playwright verification
  and 1.6's entry for the first real chapter usage). No new capability
  needed, no exception to declare.
- **Failure modes and Scaling merged into one section**, same §6 allowance
  1.6 used for its own "What breaks first," though for a different reason
  here: 1.6 merged because the two ideas were one continuous fact about a
  fixed shape; 1.7 keeps "What changes at 10x and 100x" separate from the
  slow/unscalable and moving-bottleneck content (beat 7) specifically so the
  10x/100x section can apply the mechanism rather than restate it - see the
  density note below.

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- Ceiling numbers throughout (in the lesson's diagram and the quiz's diagram
  questions) are stated, round, illustrative figures for teaching the
  comparison - not measurements of any real system or component. The
  comparison (which number is smaller) is the durable fact; the specific
  figures are not.
- "Ceiling" is used as this chapter's own term for a component's maximum
  sustained throughput. It is not a component config field or an engine
  concept - purely instructional vocabulary, same status as 1.5's "rung."
- The app-tier-scales-linearly claim is qualitative and deliberately
  incomplete: real linear scaling requires something to distribute traffic
  across instances, which does not exist yet (3.4). The chapter names this
  as the *reason* app-tier capacity can grow without claiming the mechanism
  is already built - 1.6's own `instances` config field is real, but nothing
  in 1.6 or 1.7 explains how requests are actually distributed across
  instances greater than one on today's palette. Not glossed over: "Why the
  bottleneck moves" only claims the ceiling *can* grow with more instances,
  never that request distribution is a solved problem at this stage.

## 6. Component budget (§16)

No components introduced. `availableComponentIds`/`requiredComponentIds`:
both `[]`, matching 1.1-1.5's precedent exactly (§16 homes the three
primitives at 1.6 and introduces nothing further until 3.1). `blueprints: []`,
no `starterGraph`, `hasEditorExercise: false` - the same no-build mechanism
0.2 built and 1.1-1.5 reused.

## 7. Validation rules (deliverable 4)

None - no canvas exercise, nothing to validate. `validationRuleIds: []`, same
justification 1.1-1.5 and 0.2-0.4 recorded.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None. `blueprints: []`, no `starterGraph` - consistent with `hasEditorExercise:
false` above.

## 9. Hints (deliverable 3, part of it)

None authored. Every prior no-build chapter (0.2-0.4, 1.1-1.5) that shipped
without a canvas exercise also shipped without hints - there is no picker
gesture or Fix exercise for a hint to orient toward, and the quiz's own
per-option `explanationMd` already carries the directional content a hint
would otherwise duplicate. `hints: []`.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3 (matching 0.2-1.6's
convention). Three are `diagram`-kind, directly realizing CURRICULUM §14's
"predict-then-check on three presented graphs" exercise text (see §0 above)
- each shows a small graph with stated per-component ceilings and asks which
component saturates first, with the correct option's explanation standing in
for the "then simulate" half of the row.

**Q1 · diagram · 1**. Graph: client -> app-server (1 instance) ->
sql-database, both edges `request-flow`. Prompt states ceilings: app server
1,000 req/s, database 5,000 req/s. Traffic is climbing steadily. Which
component saturates first? Correct: the app server - the lower of the two
real ceilings on the path, directly reusing 1.6's own shape and its own
stated answer, now reframed as an instance of the general method rather than
a one-off fact.

**Q2 · single · 1**. A system has three components on one request path, each
with a different maximum sustained throughput. Which one determines when the
whole system starts failing under rising load? Correct: whichever has the
lowest throughput ceiling. Distractors: the one with the highest per-request
latency (conflates slow with unscalable - the chapter's own central
distinction); the first component in the path (position on the path doesn't
determine the ceiling); the most expensive component to run (cost is
unrelated to capacity).

**Q3 · diagram · 2**. Same shape as Q1, but the app server's config now
states `instances: 5` (aggregate ceiling 5,000 req/s) and the database's
stated ceiling is 3,000 req/s - lower than Q1's, representing heavier queries
on this graph. Which saturates first now? Correct: the database - the exact
reversal of Q1's answer, on the same topology, because the numbers changed.
Distractors: the app server again (the plausible-but-now-wrong pattern-match
this question exists to catch); "both at once" (the two ceilings differ, so
one is strictly lower); "neither, the client is the bottleneck" (the client
issues requests, it has no throughput ceiling of its own in this shape).

**Q4 · single · 2**. A database's query latency has been climbing as its
largest table grows - queries that used to return in 5ms now take 40ms - but
its measured requests-per-second ceiling under load testing hasn't moved.
Is the database now the system's bottleneck? Correct: not necessarily - this
is a *slow* problem (higher per-request latency), not evidence the database
is at its throughput ceiling; the two are different failures with different
fixes. Distractors: yes, any slowdown means it's now the bottleneck
(conflates the chapter's own central distinction); it doesn't matter since
the queries still return (dismisses a real problem, just the wrong one);
the app server must now be the bottleneck instead (unsupported leap - nothing
in the scenario says anything about the app server's ceiling).

**Q5 · diagram · 3**. Same shape again, app server now at `instances: 10`
(aggregate ceiling far above the database's fixed number), database ceiling
unchanged from Q3. Traffic keeps climbing toward that database ceiling. What
happens if the app server adds a further 10 instances? Correct: nothing
changes for the system's overall ceiling - the database's ceiling is fixed
regardless of app-tier capacity, so more app-server instances stop helping
once the database is already the binding constraint. Distractors: the system
ceiling rises proportionally (contradicts the chapter's own asymmetry claim);
the database's ceiling also rises with more app-server capacity in front of
it (no mechanism supports this - nothing about the database changed);
the app server becomes the bottleneck again (backwards - more app-server
capacity moves further from being the constraint, not toward it).

**Position-clustering check** (the bug 0.1/0.2 shipped once). Two
single-kind questions (Q2, Q4); correct options sit at `b` and `a` -
distinct positions. Three diagram-kind questions are excluded from the
single-choice clustering check per the invariant test's own scope (it
applies to single-kind questions), but checked by eye anyway: Q1 and Q5
correct options are effectively "app server" / "nothing changes" (not a
literal a/b/c/d position claim, since diagram options are authored per
question, not from a shared option set) - no shared-position pattern across
them.

Scope check: every question draws on this chapter's own material plus 1.6
(the shape, the `instances` field, the specific "app server first" fact
being generalized) and 1.4/1.5 (the numbers-comparison habit). No question
requires anything from 1.8 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Read a shown graph and reason about it (no interaction, just interpretation) | 1.6's own quiz Q2, the first `diagram`-kind question this curriculum shipped - same UI, same skill, this chapter's three questions are the second real usage |
| Compare two stated numbers and pick the smaller | 1.4/1.5 (order-of-magnitude comparison is the whole point of both chapters) |
| Recognize the client/app-server/database shape and the `instances` config field | 1.6 (both introduced there; this chapter's diagrams vary `instances` the same way 1.6's own "One instance, for now" section discussed it) |
| Distinguish latency from throughput | 0.2 (the five forces name both as distinct) and 1.5 (the latency ladder is entirely about per-operation latency, never throughput) - the raw material this chapter's slow-vs-unscalable distinction sharpens into a design decision |
| State a trade-off with both costs named, not just one | Every chapter since 0.2 has done this at least once; 1.6's "One instance, for now" is the most recent, same-shape precedent |
| Recall "the app server runs out of headroom first" as a fact from 1.6 | 1.6 itself, directly, reused as this chapter's Q1 to demonstrate the general method subsumes the specific prior answer |

No move is unsourced.

## 12. Items flagged for a second pass

- **Word count (1,352).** Above 1.4's 1,106 for the same 25-minute estimate
  and above 1.5's 1,185/1,226 for 20 minutes. One density pass was already
  run during drafting (tightened the 10x/100x section's restatement of the
  moving-bottleneck mechanism, the trade-off section, and one sentence in
  "Tracing it on a real path" - cut roughly 30 words). The remaining length
  is a judgment call: CURRICULUM §14's own row for 1.7 names three distinct
  required ideas (single points of failure, saturation order, slow vs.
  unscalable) plus a mandatory Trade-offs section (§6, Process) - more
  required content than 1.4's single estimation-shortcut idea. Flagged for a
  second reader to confirm this is proportionate rather than under-cut,
  per every prior chapter's own precedent of flagging a self-assessed
  density claim rather than trusting it.
- **Generic (non-topology) primary diagram (§4).** A deliberate sidestep of
  re-raising open decision #3, not a resolution of it. A second reader
  should confirm labeling the diagram "Stage 1/2/3" rather than
  "client/app-server/database" reads as a clean, honest choice rather than
  as avoiding a question that should have been asked directly, the way 1.6's
  author asked it.
- **Three diagram-kind questions in one chapter's quiz** - a new shape (every
  prior chapter used at most one). §2's schema and §3's authoring rules place
  no cap on this, and QUIZ_FRAMEWORK's own bank sizes (10-14 per section) show
  diagram questions repeating within a bank already. Flagged because it is
  new, not because anything found is actually wrong.
- **Twitter production example (§13, beat 11).** Deliberately high-level -
  "one relational database serving both writes and timeline reads" is
  accurate, widely and publicly documented, and states the diagnosis-before-
  fix ordering without naming the specific technology they built afterward
  (out of scope, 3.x material). A second reader should confirm this doesn't
  drift into implementation tourism (§13's own banned pattern) given how
  much more is publicly known about this story than what's used here.
- **2.2 forward tease (§3, beat 14).** Directly textually supported by
  CURRICULUM §14's own 2.2 row ("Prepares for: 1.7's skill applied
  spatially"), not an invented connection - but this is the first chapter to
  spend a further-out tease on 2.2, so a second reader should confirm no
  earlier ledger entry already has (checked at draft time against every
  entry through 1.6: none do).
