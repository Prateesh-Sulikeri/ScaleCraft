# Author mode

You are the sole author for this pass - no subagent, model-independent
(whatever model this session is running on). Write the content yourself and
self-check it against the checklist in §3 below before calling it done;
there is no second reader waiting to catch what you miss.

**You are a content author, not an engineer, and not a test writer.** Do not
write tests, run `tsc`/`lint`/`vitest`/`build`, or run Playwright. Author the
deliverables, self-check them, and stop - verification is the user's call,
not this pass's job.

## Writing register (binding for every lesson-scope pass)

**Assume engineering literacy, not prerequisite knowledge.** Write like a
senior engineer explaining system design to another engineer, not like a
textbook introducing a field to a novice. The reader already knows what a
cache, a server, an API, or a database is - don't define general
engineering vocabulary from scratch. What the reader has NOT necessarily
been taught is ScaleCraft's own curriculum: named models, numbered loops,
components, and terms that have a home chapter later in `manifest.ts`'s
sequence. These two categories get different treatment:

- **General engineering terms with no ScaleCraft home chapter** (a DNS
  resolver, a TCP handshake, a hash ring) - introduce just-in-time, in a
  clause, then go straight back to the reasoning. Don't write a mini-lesson.
  Compare: "The resolver checks its cache before querying the authoritative
  server" (assumes too much) vs. three paragraphs on how DNS works
  (over-explains, talks down) vs. "It asks a recursive resolver - a DNS
  service that looks up answers on the client's behalf and caches them for
  future requests - which checks its cache before querying the
  authoritative server" (right level: enough to follow the reasoning, not a
  detour). Trust the reader to Google anything they want to go deeper on.
- **ScaleCraft-taught vocabulary with a later home chapter** (a named loop,
  a numbered law, anything in a future chapter's `curriculumContext`) - this
  stays forbidden inline per the vocabulary trap below; it needs a marked
  forward tease, never a quiet definition, because the curriculum itself
  hasn't earned the term yet. Don't confuse the two categories - a general
  engineering term is not a forward-reference violation just because
  ScaleCraft hasn't formally taught it.

Density (§20.6) and this register reinforce each other, they don't trade
off: cutting a sentence that over-explains a term the reader already knows
IS a density win, not a separate concern.

The prose itself: technically dense but concise, conversational but not
casual, confident and precise, reasoning-driven rather than
definition-driven. Prefer causal chains over inventories - X creates a
problem, so the system needs Z; Z solves it but introduces a new constraint
- over a flat list of facts about X. Make trade-offs explicit, use concrete
failure scenarios rather than abstract properties. No generic AI prose: cut
hedging, throat-clearing, and transitions that carry no information ("Let's
explore why this matters", "As we will see", "It's worth noting that").
Do not dumb concepts down to compensate for the terse register - density and
simplicity are different axes; §20.2's depth calibration still governs how
deep to go, this section only governs how much you spend explaining what's
already assumed.

## 1. Gather context, scoped to what `--scope` actually needs

Two of the standing reference docs are big enough that a blanket full-read
on every invocation is real waste - extract just the target chapter's own
material instead of reading either cover to cover.

1. **This chapter's own ledger entry, not the whole ledger.**
   `pending-chapters.md` is 5,000+ lines covering ~70 chapters; only one of
   them is this pass's business. `grep -n '^## ' .claude/docs/pending-chapters.md`
   to find this chapter's own `## <number> <title>` heading and the next
   `## ` heading after it, then read only that range - that's this chapter's
   full history (judgment calls, open items, prior revisions). Separately,
   always read the **"Open decisions blocking or shaping later chapters"**
   and **"Cross-cutting revisions (post-authoring)"** sections near the end
   (both short) - a live blocker or an unnoticed structural change (a
   starter-graph layout standard, a new required `ChapterDefinition` field)
   can affect any chapter regardless of scope. Do not read the other ~70
   chapters' entries.
2. **`.claude/docs/pending-content.md`** - full read, it's short (~180
   lines): which wave this chapter belongs to, the "Per-chapter
   deliverables" contract (seven items, `full` scope owes all of them; a
   narrower scope owes its one deliverable to the same standard).
3. **`.claude/docs/CURRICULUM.md`, scoped to `--scope`.** It has ~20
   top-level `## N.` sections; most passes need five or six of them, not all
   twenty. Run `grep -n '^## ' .claude/docs/CURRICULUM.md` once to get every
   section's line number, then read only the ranges below (plus always the
   chapter's own row in §14 Building Blocks or §15 Real World Extraction -
   that row is its brief: Purpose / Type / New / Assumes / Prepares for /
   Interview / Exercise / Est):

   | `--scope` | Sections to read, beyond the chapter's own §14/§15 row |
   |---|---|
   | `full` | §4 (chapter types), §5 (blueprint), §6 (mandatory sections), §7 (diagram standards), §8 (visual learning), §9/§10 (engineering/interview lenses, if this chapter's row calls for one), §11 (Design Editor integration), §12 (reinforcement placement), §16 (component budget), §18 (sequencing), §19 (cross-chapter connections), §20 (all - author instructions) |
   | `lesson` | §6, §7, §8, §9/§10 (if called for), §12, §18.2, §19, §20 |
   | `spec` | §5, §6, §16, §18.2 |
   | `quiz` | §20.6 only (density still governs question prose) - the real framework is `QUIZ_FRAMEWORK.md`, read separately below |
   | `hints` | §11.3 (hint philosophy), §20.1 (voice) |
   | `blueprints` | §5, §11.2, §16 |
   | `definition` | §11 (all of it - especially §11.2's brief-calibration rule), §16, §5.2 (objective categories) |

   This map is a floor for a routine pass, not a ceiling - if the chapter's
   own §14/§15 row or ledger entry points at something outside the table
   (an Interview relevance of High when `lesson` scope's default list
   doesn't include §10, a component that isn't in §16's usual place), read
   that too. Skimping on a section the chapter genuinely needs to save a few
   hundred lines is the wrong trade.
4. `.claude/docs/QUIZ_FRAMEWORK.md` if scope includes `quiz` - §1-4
   (authoring rules) plus whichever numbered bank covers this chapter's
   section, for questions to model on or draw from.
5. **One already-shipped chapter as a structure/voice precedent.** Read its
   lesson and its spec together (e.g. `bb-0-1-welcome.md` +
   `bb-0-1-welcome.spec.md`, or `bb-0-2-what-is-system-design.md` + its
   spec). Match its register and section conventions; don't reinvent
   formatting per chapter.
6. Orient in code with `graphify` before reading source files (repo hook,
   see `CLAUDE.md`) - `src/content/chapters/types.ts` (`ChapterDefinition`),
   `src/content/chapters/lessons.ts` (lesson-file wiring), `src/content/
   components/registry.ts` (the component ids and their `docsFile`/configs
   this chapter may reference).

## 2. Author, per scope

**`full`** - all seven items from `pending-content.md`'s deliverable list:
spec, lesson, `ChapterDefinition`, validation rules (only if the exercise
needs one that doesn't exist - check `src/validation-engine/rules/index.ts`
first), quiz, playtest pass (written into the spec), ledger entry. Follow
§5.3's beat order and §6's mandatory-section table for the chapter's type
exactly; any section you judge inapplicable needs written justification in
the spec, not silent omission.

**`lesson`** - the Reader prose only. Concrete traps, from real defects
already shipped once each:
- **"Preview of next" must name the chapter that actually comes next**
  (check `src/curriculum/manifest.ts`'s `prerequisiteSlugs` / row order, not
  memory) and create pull, not a table of contents. A tease to a chapter
  further out is a *separate*, explicitly-marked "further out" mention, not
  a replacement for the immediate one.
- **Never reference ScaleCraft-taught vocabulary the learner hasn't been
  taught yet** (§18.2 rule 1, §20.5's "never" list) - a term with a home
  chapter later needs a marked forward tease, not inline use as if already
  known. Check every proper-noun/numbered-thing you use (a named loop, a
  named model, a named law) against `curriculumContext.masteredConcepts`
  for chapters already assumed, not against your own knowledge of the whole
  curriculum. This is separate from general engineering vocabulary (see the
  "Writing register" section above) - a term like "resolver" or "hash ring"
  is not a forward-reference violation, it just needs a just-in-time gloss
  if it's not universally known.
- **Every diagram gets a one-line caption naming what to notice** (§7.2,
  §20.3) - a diagram with no caption is incomplete, not merely terse. See
  "Diagrams: make them inform, not decorate" below for more than the
  caption bar.
- **Interview lens ends with a "what a senior answer sounds like" line**
  (§10.3) whenever the chapter's Interview relevance is Medium or High -
  built only from vocabulary the chapter itself teaches.
- **A cold open's tension must get paid off somewhere in the chapter**, not
  left as unresolved scene-setting - if beat 1 poses a question, some later
  beat needs to answer it using the chapter's own material.
- Run the density pass (§20.6) as a distinct step against your own draft,
  not folded into first-draft writing - re-read every sentence and ask
  whether it introduces, clarifies, or reinforces. Cut what doesn't.
- No em dash, "-" only (repo-wide, CI-enforced but check by eye too).

**`spec`** - fill in §5's blueprint fields (metadata table, learning
objectives with category tags, per-beat outline referencing the lesson's
actual section headings, declared omissions with real justification,
component-budget note per §16, validation-rules note, quiz note, and the
playtest pass answering §18.2's binding question: "which prior chapter
taught each move this exercise requires?" - every move needs a named
source or the chapter has a sequencing bug to fix, not paper over).

**`quiz`** - QUIZ_FRAMEWORK §1-4: reasoning over recall, every option
(chosen or not) explains itself, distractors are real positions a
reasonable engineer might hold, ramp roughly 30/45/25 across difficulty
1/2/3. **Before finishing, check the three shapes that have already shipped
as bugs once:**
1. Single-choice correct answers are not clustered on one letter across the
   chapter's own single-kind questions (vary the position; there's a CI
   test but eyeball it too, and glance at sibling chapters - the test is
   per-chapter, not registry-wide).
2. A matching question's `pairs[i]`'s correct option is not `options[i]`
   for every `i` (a full derangement is the safe target, not just "not
   fully diagonal").
3. An `ordering` question's authored `options` array is not already the
   correct sequence - `Ordering.tsx` displays it in exactly that order with
   no shuffle, so a naturally-ordered author draft ships pre-solved.

**`hints`** - 2-4, orienting before directional, never the answer itself
(re-read each one and ask: does this tell the learner what's wrong, or does
it just point at where to look? Only the latter belongs here - "what's
wrong" is the validation explanation's job, never a hint's).

**`blueprints`** - at least one `require` pattern; multiple only when the
chapter honestly has more than one right answer (not as padding).
`commentary` is debrief-only content - it will render only after a pass,
never used to justify a design choice pre-pass. If you change or add a
blueprint, re-check (or update) `starterGraph`: a starter graph that
already satisfies the new blueprint hands the exercise over solved (CI
catches this via `authoring-invariants.test.ts`, but design it correctly
rather than relying on the test to bounce you).

**`definition`** - `problemStatement` and `learningObjectives` must be
testable statements (not "understand X"), one category per objective, every
§5.2 category present except Practical in a justified no-build Concept
chapter. `curriculumContext` must accurately transcribe what the chapter
actually assumes/teaches/simplifies - Deep Check depends on its honesty,
not on it sounding complete. Cross-check `availableComponentIds` against
§16: nothing appears in a palette before its home chapter without a
declared, narrow, spec-recorded exception.

For any chapter with a real canvas exercise (`starterGraph` present,
`hasEditorExercise !== false`), also write `exerciseGoal` (one or two
sentences) and `successCriteria` (2-4 observable, system-level outcomes -
"requests reach either server; killing one instance doesn't drop traffic",
not implementation steps). These render in the Design Editor's sidebar under
"Goal" / "You're done when" - `learningObjectives` does not render there at
all, so it is not a substitute. Follow CURRICULUM.md §11.2's brief-
calibration rule: name the symptom and the goal, never the component, field,
or edge kind that fixes it. A Config-type chapter (§11.1) may name the
component under scrutiny but not the direction or target value. Before
finalizing, check `successCriteria`/`exerciseGoal` against
`availableComponentIds` minus the components already in `starterGraph` - if
that text names one of those components by its display label, it just
spoiled the exercise; rephrase around the symptom instead
(`authoring-invariants.test.ts` gates this, but design it correctly rather
than relying on the test to bounce you). Keep `problemStatement` to a short
scenario (2-3 sentences) - it is not the place for the calibrated ask
either, that's what the new fields are for (§11.2, §20.6 information
density both apply: a brief that re-narrates the lesson's thesis is a
density bug, not scene-setting).

## Diagrams: make them inform, not decorate

A diagram that is one static picture with a caption clears CURRICULUM.md
§7.2's letter but can still read as a gimmick - a box-and-line snapshot the
learner glances at and moves past, not something that taught them anything
the prose hadn't already said. Two levers §7.2 already licenses and this
pass should actually use:

- **Prefer a `<Walkthrough>` over a flat static diagram whenever the
  topology has a story to step through** - a request tracing a path, an
  algorithm choosing between instances, a failure unfolding over time (§7.2:
  "if the same nodes/edges benefit from stepping through... author it as a
  `<Walkthrough>`, otherwise author it as a static diagram"). When that
  applies, invoke the `walkthrough-diagram` skill to build it - it owns the
  layout/normalize pipeline and its own invariants test; don't hand-roll
  `<Walkthrough>` JSON here. A chapter whose primary diagram (beat 5) is a
  genuine multi-step trace teaches more per pixel than the same topology
  shown once, static, with a caption describing what the arrows would have
  shown if they'd moved. Don't default to static out of habit - check
  whether this chapter's own topology has a sequence in it before choosing.
- **When a diagram does stay static, give it real progression, not one
  final-state snapshot.** §7.2's "start minimal, evolve" rule already says
  never open with the finished 12-node architecture - apply that across the
  *whole* diagram sequence, not just its opening frame: a v1 -> v2 -> v3 set
  of small diagrams, each with its own one-line caption naming what changed
  and why, teaches the reasoning chain. One diagram of the final shape only
  shows the destination, not how the system got there - that's the gap that
  reads as a gimmick.

This is forward guidance for chapters authored from here on. Auditing and
fixing diagrams already shipped is a separate, later pass - out of scope for
this skill invocation unless the user names a specific chapter's diagram as
the thing to revise.

## 3. Self-check before calling it done

There is no second reader on this pass anymore, so this replaces what the
old Opus audit used to catch. Re-read your own draft cold, once, hunting
specifically for these six things - not a first-draft self-congratulation
pass:

1. **Content** - accuracy of any factual/production claims; density (§20.6
   - both directions: cut what doesn't earn its place, and flag anything now
   under-explained); voice (§20.1, no em dash) and writing register (see
   above); reasoning-driven rather than definition-driven; every "Next"/
   preview names the chapter that actually comes next; no ScaleCraft-taught
   vocabulary used before its home chapter.
2. **Content-structure** - structural completeness against §5.3's beat
   order and §6's mandatory-section table for the chapter's type; any
   declared omission has real written justification, not silent absence.
3. **Blueprints** - at least one honest `require` pattern; multiple only
   when there's genuinely more than one right answer; `commentary` stays
   debrief-only; the blueprint isn't already satisfied by `starterGraph`.
4. **Component-lists** - `availableComponentIds`/`requiredComponentIds`
   against §16's component budget: nothing appears before its home chapter
   without a declared, narrow, spec-recorded exception.
5. **Submit validations** - `validationRuleIds` actually gate what the
   exercise claims to test, and reference real rules in
   `src/validation-engine/rules/index.ts`.
6. **Diagrams** - every diagram has a one-line caption naming what to
   notice, the diagram itself is accurate to the prose around it, and it
   was built the way the "Diagrams" section above asks (a `<Walkthrough>`
   where the topology has a sequence, real progression where it stays
   static) rather than defaulted to a single static snapshot out of habit.

## 4. Definition of done for this pass

- Every touched deliverable meets its own bar above, including the §3
  self-check.
- Lesson-scoped work matches the writing register above: no inline
  definitions of general engineering terms an engineer would already know,
  no un-glossed ScaleCraft-taught vocabulary, reasoning-driven rather than
  definition-driven throughout.
- `placeholder` flag absent (or explicitly still `true` if this is a
  deliberately partial draft - say so out loud, don't leave it ambiguous).
- No pipeline run required - this is a content-only pass. Don't run
  `tsc`/`lint`/`vitest`/`build`; that's outside this skill's scope.
- `.claude/docs/pending-chapters.md` updated - a new chapter gets a full
  entry (status table row + detail section); a scoped revision to an
  existing chapter gets a dated addition to that chapter's existing entry,
  not a silent overwrite of prior judgment calls.
