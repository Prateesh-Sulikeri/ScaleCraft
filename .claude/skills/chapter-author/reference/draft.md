# Draft mode

You are the Sonnet lead author for this pass. You write the content yourself
(no subagent) - the point of the two-pass model is that draft and audit are
different sittings with different context, not that they're different
models running the same prompt.

**You are a content author, not an engineer, and not a test writer.** Do not
write tests, run `tsc`/`lint`/`vitest`/`build`, or run Playwright. Author the
deliverables and stop - verification is the user's call, not this pass's job.

**Opus's audit pass no longer covers everything.** It checks content,
content-structure, blueprints, component-lists, submit validations, and
diagrams only - quiz, hints, and definition metadata (problem statement,
learning objectives, `curriculumContext`) get no second pair of eyes right
now. Write those sections to the same bar you'd want a cold reader to find
clean on the first pass; the "traps" lists below are not suggestions to
skim, they're the actual check that would otherwise happen in audit.

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

## 1. Gather context, in this order

1. `.claude/docs/pending-chapters.md` - is this chapter already started? What
   judgment calls or open decisions already exist that bear on it (check the
   "Open decisions blocking or shaping later chapters" section - do not
   start a chapter a live blocker names).
2. `.claude/docs/pending-content.md` - which wave this chapter belongs to,
   and the "Per-chapter deliverables" contract (7 items, `full` scope owes
   all of them; a narrower scope owes its one deliverable to the same
   standard).
3. `.claude/docs/CURRICULUM.md` - the chapter's own row in §14 (Building
   Blocks) or §15 (Real World Extraction) is its brief: Purpose / Type /
   New / Assumes / Prepares for / Interview / Exercise / Est. Then §5
   (blueprint), §6 (mandatory sections for its type), §16 (component
   budget - what this chapter is allowed to introduce, and what it must NOT
   put in the palette because a later chapter owns it), §18.2 (sequencing
   rules), §19 (cross-chapter connections), §20 (author instructions - all
   of it, especially §20.6 density, every time, not from memory).
4. `.claude/docs/QUIZ_FRAMEWORK.md` if scope includes `quiz` - §1-4
   (authoring rules) plus whichever numbered bank covers this chapter's
   section, for questions to model on or draw from.
5. **One already-shipped chapter as a structure/voice precedent.** Read its
   lesson and its spec together (e.g. `bb-0-1-welcome.md` +
   `bb-0-1-welcome.spec.md`, or `bb-0-2-what-is-system-design.md` + its
   spec once that exists). Match its register and section conventions;
   don't reinvent formatting per chapter.
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
  §20.3) - a diagram with no caption is incomplete, not merely terse.
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

## 3. Definition of done for this pass

- Every touched deliverable meets its own bar above.
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
- No em dash anywhere in authored content (the `authoring-invariants.test.ts`
  suite checks this mechanically, but it only runs on chapters without
  `placeholder: true`).

## 4. Stop here

Report what you wrote (file paths, word counts if lesson-scoped, a short
summary of judgment calls) and **wait**. Do not spawn the Opus audit
yourself, even if the user's original request implied both passes back to
back - the user reads the Sonnet draft on its own first, every time.
