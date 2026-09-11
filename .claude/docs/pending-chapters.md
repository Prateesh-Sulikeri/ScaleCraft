# Authored Chapters - Completion Ledger

The running record of which curriculum chapters are actually authored, by whom,
on which branch, and what was left open. Started 2026-08-05.

This exists because "is 3.4 done?" is otherwise only answerable by reading git
log and grepping `placeholder: true`. The manifest tells you a chapter row
exists; `chapterRegistry` tells you a definition exists; neither tells you the
content met the authoring bar or what got flagged along the way.

> **Instruction for future sessions.** Append an entry here the moment a chapter
> is complete, as the last step before committing it. "Complete" means all six
> deliverables in `pending-content.md` are in, the pipeline is green, and the
> chapter is committed. Do not batch entries at the end of a wave - the details
> worth recording (divergences, judgment calls, what was checked and found
> stale) are exactly what gets forgotten. If a chapter is started and abandoned,
> record that too, with the reason.

**Scope of the curriculum:** 40 Building Blocks entries (37 chapters + 3
checkpoints) + 32 Real World Extraction projects = 72 manifest rows, after
Release 6.1.0-alpha Phase 10 condensed Part 1 from 11 chapters to 4
(2026-08-16; was 47/44/79 before). The engineering pass (manifest.ts,
`index.ts` registry, CURRICULUM.md, QUIZ_FRAMEWORK.md, e2e/test assertions,
and removal of the eleven superseded spec/lesson files) landed the same day,
full CI green. See `.claude/docs/pending-6.1.0-poa.md` Phase 10.

> **Information density is the standing bar for every chapter.** CURRICULUM.md
> §20.6 is binding and outranks every other style rule: optimize for knowledge
> per minute, cut any sentence that does not introduce, clarify, or reinforce,
> prefer tables and bullets where they scan better, and let length follow
> content rather than the time estimate. Every entry below records its lesson
> word count so drift is visible. Do a density revision pass before calling a
> chapter done - a complete first draft is not a finished one.

---

## Status at a glance

| Chapter | Status | Date | Branch |
|---|---|---|---|
| 0.1 Welcome to ScaleCraft | **Authored** | 2026-08-05 | `feature/content-0-1-welcome` |
| 0.2 What is System Design? | **Authored (Opus proofread pass done)** | 2026-08-06 | `feature/content-0-1-welcome` (commit `d290339`) |
| 0.3 Interview Design vs. Production Engineering | **Authored + Opus pass (lesson scope)** | 2026-08-06 | `feature/content-0-1-welcome` |
| 0.4 The System Design Lifecycle | **Authored + Opus pass (lesson scope)** | 2026-08-06 | `feature/content-0-1-welcome` |
| 1.1 Understanding the Problem | **Superseded 2026-08-16** by new 1.1 Framing the Problem (Phase 10) - record kept below | 2026-08-08 | `feature/content-1-1-understanding-the-problem` |
| 1.2 Functional Requirements | **Superseded 2026-08-16** by new 1.1 Framing the Problem (Phase 10) - record kept below | 2026-08-08 | `feature/content-1-1-understanding-the-problem` |
| 1.3 Non-functional Requirements | **Superseded 2026-08-16** by new 1.1 Framing the Problem (Phase 10) - record kept below | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.4 Estimating Scale | **Superseded 2026-08-16** by new 1.1 Framing the Problem (Phase 10) - record kept below | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.5 Numbers Every Engineer Should Know | **Superseded 2026-08-16** by new 1.1 Framing the Problem (Phase 10) - record kept below | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.6 Drawing the First Architecture | **Superseded 2026-08-16** by new 1.2 Designing the System (Phase 10) - build/validation/blueprint carried forward intact, record kept below | 2026-08-09 | `feature/content-1-1-understanding-the-problem` |
| 1.7 Identifying Bottlenecks | **Superseded 2026-08-16** by new 1.2 Designing the System (Phase 10) - record kept below | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 1.8 Engineering Trade-offs | **Superseded 2026-08-16** by new 1.3 Defending the Design (Phase 10) - record kept below | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 1.9 Deep Dive Methodology | **Superseded 2026-08-16** by new 1.2 Designing the System (Phase 10) - record kept below | 2026-08-10 | `feature/content-1-7-identifying-bottlenecks` |
| 3.4 Load Balancer | **Authored (Sonnet draft, no Opus pass yet)** - unaffected by Phase 10, `prerequisiteSlugs` repointed from old `1-9-deep-dive-methodology` to new `1-2-designing-the-system` | 2026-08-11 | `feature/lesson-3-4-load-balancer` |
| 1.10 Communicating & Defending a Design | **Superseded 2026-08-16** by new 1.3 Defending the Design (Phase 10) - record kept below | 2026-08-11 | `feature/content-1-10-communicating-and-defending-a-design` |
| 1.11 Driving a System Design Interview | **Authored (manual chapter-author-style pass, no cold audit yet)** | 2026-08-11 | `feature/content-1-10-communicating-and-defending-a-design` |
| RWE T1 Bitly | Placeholder (`rwe-dummy-1`), moved to Wave 2 | - | - |
| **1.1 Framing the Problem** (Phase 10 condense, replaces old 1.1-1.5) | **Authored, wired into manifest.ts, old sources removed, full CI green - no Opus pass yet** | 2026-08-16 | `feature/cloud-sync-reconciliation` |
| **1.2 Designing the System** (Phase 10 condense, replaces old 1.6/1.7/1.9) | **Authored, wired into manifest.ts, old sources removed, full CI green - no Opus pass yet** | 2026-08-16 | `feature/cloud-sync-reconciliation` |
| **1.3 Defending the Design** (Phase 10 condense, replaces old 1.8/1.10) | **Authored, wired into manifest.ts (incl. 2.1's repoint), old sources removed, full CI green - no Opus pass yet** | 2026-08-16 | `feature/cloud-sync-reconciliation` |
| **1.4 Driving the Interview** (Phase 10 renumber of old 1.11, optional) | **Authored, wired into manifest.ts, old source removed, full CI green - no Opus pass yet** | 2026-08-16 | `feature/cloud-sync-reconciliation` |
| **2.1 From Browser to Backend** (Wave 3, first Part 2 chapter) | **Authored + Opus proofread pass** - manifest row repointed off `null`, `lessonVersion: 2`, pipeline not run (content-only pass) | 2026-08-18 | uncommitted, working tree |
| **2.2 Where Can Things Go Wrong?** (Wave 3, second Part 2 chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, pipeline not run (content-only pass) | 2026-08-20 | uncommitted, working tree |
| **2.3 Evolution of Modern Architectures** (Wave 3, third Part 2 chapter - Part 2 complete) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.1 Networking Fundamentals** (Wave 3, first Group A chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.2 DNS** (Wave 3, second Group A chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, self-caught cross-chapter bug fixed mid-draft (see own entry), pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.3 Reverse Proxy** (Wave 3, third Group A chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.5 API Gateway** (Wave 3, fourth Group A chapter - Group A complete) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, multi-service build/fix partially realized via lesson+quiz (engine limitation, see own entry), pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.6 Stateless Services** (first Group B chapter, authored ahead of `pending-content.md`'s own Wave 4 plan on explicit user request) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, first purely config-only Fix exercise this curriculum has shipped, reuses 3.4's own namesake rule for a second, deliberately opposite blueprint shape, pipeline not run (content-only pass) | 2026-08-22 | uncommitted, working tree (`fix/streak-counter`) |
| **3.7 Sessions & State Management** (second Group B chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, first chapter to use `orphan-component` as its own namesake fault (third instance of the warning-severity-namesake-rule pattern, see open decision 11), realizes CURRICULUM's own "Trade-off scenario" exercise type as lesson table + quiz rather than a new Editor affordance, pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.8 Horizontal Scaling** (third Group B chapter - Group B's own 3.6-3.9 span now three of four authored) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, first chapter whose Editor exercise is gated entirely by the blueprint with `single-instance-load-balancer` deliberately not firing on the starter (headroom bar above the rule's own capacity-2 floor), realizes CURRICULUM's own "predict (kill an instance mid-simulation)" exercise as a `diagram`-kind quiz question adapting QUIZ_FRAMEWORK's own bank Q6, new doc-drift finding on CURRICULUM §6's own "engineered-cliffhanger" example (see open decision 16), pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.9 Service Discovery** (fourth and final Group B chapter - Group B's own 3.6-3.9 span now complete) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, Config exercise reuses `dns`'s own `ttlSeconds` field (3.2) rather than a new registry component, third confirmed instance of open decision 8's `control`-edge canvas gap (anticipated by that decision when raised at 3.4), closes out open decision 15's Group B row, pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.10 Databases** (first Group C chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, no Editor exercise at all (`hasEditorExercise: false`) since the engine has no `indexes` config field or query-cost simulation for CURRICULUM's own row's exercise, six-question quiz instead (new open decision 17), opens open decision 15's Group C row, pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.11 SQL vs. NoSQL** (second Group C chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, first Group C chapter with a real Editor exercise (introduces `nosql-database`), starter graph's NoSQL node deliberately pre-configured wrong (`model: "key-value"`) so the fix is genuine, second of open decision 15's Group C rows checked, pipeline not run (content-only pass). *Row added 2026-08-23 alongside 3.12's own entry - this chapter's detail section already existed but its status-table row was missed at authoring time; added now for an accurate at-a-glance table, no content changed.* | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.12 Replication** (third Group C chapter) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, introduces `read-replica` + edge kind `replication` (both already fully wired in the engine, no gap), starter graph's one overdetermined wrong edge trips `orphan-read-replica` and `component-relations` at once, new open decision 18 (QUIZ_FRAMEWORK §10 Q5's own diagram JSON draws the replica read edge backwards - corrected in this chapter's own quiz, not the bank), third of open decision 15's Group C rows checked, pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.13 Sharding** (fourth and final Group C chapter - Group C now complete) | **Authored (Sonnet draft, no Opus pass yet)** - manifest row repointed off `null`, no Editor exercise at all (`hasEditorExercise: false`) since no component has a shard-key config field despite CURRICULUM §14 AND §11.1 both promising one (new open decision 19, a stronger-than-17 confirmed gap), six-question quiz adapting all four of QUIZ_FRAMEWORK §10's bank questions reserved for this chapter, closes out open decision 15's Group C row entirely, pipeline not run (content-only pass) | 2026-08-23 | uncommitted, working tree (`fix/streak-counter`) |
| **3.14 Caching** (first Group D chapter) | **Authored (one-shot `chapter-author` pass, no cold second read yet)** - manifest row repointed off `null`, introduces `cache` + `distributed-cache` (both already fully wired in the engine, no gap), first chapter whose `requiredComponentIds` deliberately omits an available component, first Editor exercise in Part 3 whose graded fault is **error**-severity (`missing-input-connection`) so Validate genuinely fails on the starter (evidence for open decision 11), TTL config beat deliberately left ungated to avoid a misleading "Missing: Cache" drift message (new argument under decision 11), opens open decision 15's Group D row, spends all five of QUIZ_FRAMEWORK §11's bank questions reserved for this chapter, pipeline not run (content-only pass) | 2026-08-26 | uncommitted, working tree (`feat/content-audit`) |

Everything else in the 72 rows is unauthored (`chapterDefinitionId: null`).

**Wave 1 progress: 4 of 4 authored, all four through an Opus pass, merged into
`develop`/`main` (verified 2026-08-08 via PR #87/#88).** Wave 2 (Part 1)
started 2026-08-08 with 1.1; 1.2 followed the same day; 1.3 followed
2026-08-09; 1.4 followed the same day; 1.5 followed the same day; 1.6
followed the same day, closing Part 1. 1.1 and 1.2 have had their Opus pass
(content/structure/blueprints/component-lists/validations/diagrams scope;
quiz, hints and definition metadata not audited - see their own entries
below); this status line previously said otherwise and was corrected
2026-08-09 to match the detail sections and `index.ts`'s `lessonVersion: 2`.
1.3 has also had its Opus pass (lesson/spec scope). 1.4 and 1.5 are both
Sonnet drafts with no Opus pass yet. 1.6 has had its Opus pass (full
six-area scope) - it needed one more than any chapter so far this wave: it's
the first Building Block chapter (real components, a real starter graph, a
real Fix exercise), unlike every Concept/Process chapter before it, and the
pass found two factual errors in the draft's own account of its validation
rules plus a diagram caption making a false general claim about edge kinds.
1.7 followed on 2026-08-10, on its own branch
(`feature/content-1-7-identifying-bottlenecks`, stacked on top of this same
in-progress work so 1.1-1.6 are present as real prerequisite content - see
its own entry for the branch-topology decision). Sonnet draft, no Opus pass
yet. 1.8 followed the same day on the same branch. Sonnet draft, no Opus
pass yet. 1.9 followed the same day on the same branch. Sonnet draft, no
Opus pass yet.

**3.4 Load Balancer authored 2026-08-11**, pulled forward per
`pending-content.md`'s own Wave 2 definition, on its own branch
(`feature/lesson-3-4-load-balancer`, cut from
`release/v5.0.0-content-platform` rather than the Part 1 branch above - this
is Release 5.0.0-alpha content-platform work needing a real chapter to pilot
against, not a Part 1 continuation). Sonnet draft, no Opus pass yet. Real
prerequisite (3.3) isn't authored - see its own entry for the declared
exception.

**1.10 Communicating & Defending a Design followed 2026-08-11**, continuing
Part 1 directly after 1.9 on its own new branch
(`feature/content-1-10-communicating-and-defending-a-design`, cut from
`release/v5.0.0-content-platform` - the original 1.7-1.9 branch no longer
exists in this session, see its own entry above). Sonnet draft, no Opus pass
yet. Part 1's eight-step interview loop (0.4/§10.1) is now covered end to
end by 1.1-1.11. 1.11 is optional and intentionally gates nothing.

---

## 0.1 Welcome to ScaleCraft

- **Authored** 2026-08-05 · commit `250b5eb` · branch `feature/content-0-1-welcome`
  (stacked on `feature/guided-tour-track-a`, because 0.1's content builds on
  Track A's chapter definition and lesson file)
- Definition id `bb-0-1-welcome` · manifest slug `0-1-welcome-to-scalecraft`
- Type: Concept · foundational · 10 min · no prerequisites
- **Lesson length: 667 words** (down from 1262 in the first draft)
- Pipeline green at commit: typecheck, lint, 1552 tests, build

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-1-welcome.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-1-welcome.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new. Four existing structural rules curated; justified in spec §7 |
| 5 | Quiz | 4 questions, difficulty ramp 1/2/2/3 |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **Cut 47% for density (2026-08-05, user direction).** The first draft stretched
  single ideas across multiple paragraphs, restated points in fresher words, and
  used prose where a table scanned better. The Validate/Submit contrast became a
  4-row comparison table, the recap became 3 retrieval anchors instead of a
  restatement, and the near-empty Connections section merged into "Next" (§6
  permits merging short adjacent sections). Every mandatory beat survived. This
  produced CURRICULUM.md §20.6, now the highest-priority style rule.
- Palette narrowed from 5 components to the 3 primitives. `load-balancer` and
  `cache` existed only to give the guided tour's picker step more to browse,
  which did not justify putting Group A/D components in front of a learner in
  their first session. Nothing depended on the palette size.
- Production examples (mandatory for Concept per §6) omitted with written
  justification: the chapter's subject is the product's own teaching loop, and
  §13 requires real companies chosen for a decision they made. Any example
  would have been a strained CI analogy, which §20.1's zero-filler rule
  forbids.
- Backward connections (§19 wants >=2) not possible - 0.1 is chapter 1 of 44.
  Recorded rather than faked.

**Carried forward:** see "Open decisions" below - items 1 and 2 originate here.

---

## 0.2 What is System Design?

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1; a separate `feature/content-0-2-*` branch was
  not cut for this one chapter - see the process note below).
- Definition id `bb-0-2-what-is-system-design` · manifest slug
  `0-2-what-is-system-design`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build -
  see below) · prerequisite: 0.1
- **Lesson length: 808 words** (including Mermaid syntax; up from 696 after
  the user caught the forces going named-but-unexplained - see "User review
  caught two real gaps" below). **Now 1092 after the Opus proofread pass** -
  see that subsection for the breakdown.
- Pipeline green at latest revision: typecheck, lint, 1563 tests, build

**User review caught two real gaps before the Opus pass (2026-08-06).** Both
fixed in this same session, not deferred:

1. **The forces were named, never explained.** The first draft's "The five
   forces" section had a Mermaid diagram labeling each force in ~3 words and
   then moved straight to trade-off examples - beat 6 (core mechanics) was
   effectively skipped. Fixed by adding a 5-row table (force / what it
   measures / what failing looks like) right after the diagram, so each force
   gets a real definition plus a concrete symptom before the lesson uses it in
   an example. Diagram simplified to names-only now that the table carries
   the definitions, avoiding saying each one twice.
2. **`DesignEditorCTA` always showed "Begin exercise" with nothing behind
   it, and worse, the chapter could never be marked complete.** The first
   version of this spec (see git history) flagged this as a rough edge for a
   future pass. On the user asking "why do we even have the button", closer
   inspection found it was not just a UX wart: `deriveStatus`
   (`src/curriculum/progress.ts`) gated `COMPLETED` on a `chapterProgress` row
   that only a Submit press writes, and with `hasEditorExercise` not existing
   yet, 0.2 had no reachable Submit - the chapter could never complete on the
   Learning Path at all. Fixed with a new `ChapterDefinition.hasEditorExercise?:
   boolean` field (default true, every prior chapter unaffected):
   `ChapterReader` suppresses the CTA when it's `false`, and `deriveStatus`
   gates completion on the exam pass alone instead of a validation pass that
   can never be written. See spec §5 for the full before/after. Every future
   Part 0/1 Concept chapter without a build (0.3, 0.4, 1.2, 1.3, 1.5) reuses
   this field.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-2-what-is-system-design.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-2-what-is-system-design.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `matching` kind |
| 6 | Playtest pass | Spec §9 |

**Process note, 2026-08-06 (experiment, user-directed):** authored directly by
Sonnet in this session rather than delegated to a fresh Opus lead-author pass,
as an explicit one-chapter experiment: the user wants to read Sonnet's draft
first, then have an Opus subagent proofread/correct it, then read that too,
before deciding whether this becomes the standing process for 0.3 onward. This
entry, the spec, the lesson, and the registry/quiz code are Sonnet's draft as
of this commit's parent state. **If the Opus pass changes the lesson or the
quiz, update this entry and `lessonVersion` rather than treating the Opus edit
as a silent fixup** - the point of the experiment is a visible before/after.

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception
  (§11.1).** 0.2 introduces no components (all three primitives stay homed at
  1.6), so there is nothing to build with that wouldn't be a forward
  dependency. `availableComponentIds`/`requiredComponentIds` are both `[]`,
  `blueprints: []`, no `starterGraph`. The chapter's "trade-off pick" exercise
  (CURRICULUM §14's own words) is realized as the quiz's Q3 matching question
  instead - five described systems, each matched to its dominant force.
- **`hasEditorExercise: false` added and wired through** - see "User review
  caught two real gaps" above. Not left as a flagged rough edge: the CTA issue
  turned out to also break completion tracking entirely for this chapter,
  which is a functional bug, not cosmetic friction. **Every other Part 0/1
  chapter without a build (0.3, 0.4, 1.2, 1.3, 1.5) reuses this field** rather
  than needing its own fix.
- **Practical objective category omitted, per §5.2's own explicit carve-out**
  for pure Concept chapters with no construction-family exercise. Four
  objectives instead of five (Knowledge, Engineering, Interview,
  Communication).
- **Backward connections: 1, not §19's ≥2.** Same category of declared
  exception 0.1 recorded (there, zero were possible - 0.2 is chapter 2, so
  exactly one prior chapter, 0.1, exists to reference). Recorded honestly
  rather than padded.
- **Quiz introduces the `matching` kind** (Q2, Q3) - the first chapter to use
  anything other than `single`. Verified against the real scoring path
  (`evaluate.ts`'s `matching` branch, `Matching.tsx`'s dropdown-per-row UI)
  rather than assumed from the schema alone.
- **Quiz-wide positional bias, caught by the user across both authored
  chapters (2026-08-06), fixed in this session:**
  1. **Single-choice correct answers clustered on "b".** 6 of the 7
     single-kind questions across 0.1 and 0.2 had their correct option in
     position b - not by design, an authoring habit neither pass noticed
     until pointed out. Reordered options (content unchanged, only array
     position) to a:2/b:2/c:2/d:1 across the 7. Ids relabeled a-d to match
     new display order, matching the existing convention.
  2. **Both matching questions (Q2, Q3) were a diagonal identity mapping** -
     pair *i*'s correct option was `options[i]` for every *i*, so the
     dropdown position alone answered the question without reading it.
     Reordered each question's `options` array to a full derangement against
     its `pairs` order (`pairs` themselves unchanged).
  3. **Ordering questions have the same latent risk, unauthored so far.**
     Neither chapter uses `kind: "ordering"` yet, so there was nothing to fix
     in content, but `Ordering.tsx`'s initial displayed sequence is exactly
     the authored `options` array order (`ExamQuestionBody.tsx:78`) - an
     author who writes options in already-correct order (natural to do, and
     exactly what QUIZ_FRAMEWORK.md §5's own bank text does for readability)
     would ship a pre-solved exercise.
  4. **Diagram-kind questions (`graph` + `ReadOnlyGraphSummary`) were checked
     against a real-browser claim ("never really worked") and found to
     actually render and work** - navigated `/dev/diagram-question-lab` with
     Playwright, zero console errors, radios interactive, screenshot
     confirms category-color dots + edge-kind glyphs render per fixture.
     Neither chapter authors a diagram question, so this wasn't a content
     bug to fix - noted here because the claim didn't reproduce and is worth
     asking the user what they actually saw, rather than silently treating it
     as resolved.

  **Systemic fix, not just content patches:** added three registry-wide
  invariant tests to `src/content/chapters/quiz-invariants.test.ts` so this
  class of bug fails CI rather than shipping again - a chapter's single-choice
  correct answers can't all share one position (once it has ≥3 such
  questions), a matching question's correct-option sequence can't be an
  index-for-index copy of its options array, and an ordering question's
  authored array can't already equal `correctOrder`. These are mechanical
  shape checks, not content-quality judgments - a human still has to check
  whether the distractors are any good.
- **No new density revision pass performed as a distinct step.** Unlike 0.1
  (a documented 47% cut from a bloated first draft), this draft was written
  once, directly against §20.6's density rule rather than drafted long and
  then trimmed - 696 words for 15 minutes of Reader-only content is
  proportionate to 0.1's 667 words for 10 combined minutes. Flagged here so a
  reviewer checks this claim rather than trusting it, since the same claim
  self-assessed on a first draft is exactly what 0.1's process warns against.

**Opus proofread pass (2026-08-06, uncommitted working tree).** The experiment
above, run. Not a rubber stamp and not a rewrite: Sonnet's structure, section
order, and voice were kept intact, and six framework defects were fixed. Full
before/after reasoning lives in the chapter spec's new §10; the short version:

| # | Defect | Framework rule | Fix |
|---|---|---|---|
| 1 | "Next" previewed 1.3 and never mentioned 0.3, the chapter that actually follows | §6 (Preview of next chapter is mandatory, must create pull) | Rewrote "Next" to preview 0.3's interview-vs-production tension; 1.3 kept as the separate, explicitly-further-out beat-14 tease |
| 2 | Interview lens opened with "Loop step 2, Requirements" | §18.2 rule 1 / §20.5 (no forward dependencies) | The numbered Interview Loop (§10.1) is not introduced until 0.4 and not taught until 1.2-1.3. It also collides with 0.1, which used "the loop" for the Reader-to-Editor loop. Rewritten in this chapter's own vocabulary |
| 3 | No "what a senior answer sounds like" line | §10.3 (binding on every Interview lens) | Added one, built only from vocabulary this chapter teaches |
| 4 | Primary diagram had no caption | §7.2 / §20.3 (every diagram captions what to notice) | Added; 0.1 already complied, 0.2 did not |
| 5 | Cold open (cache vs. read replica) was never paid off | §5.3 beat 1-2 | Resolved in the core-mechanics section as latency-vs-throughput, which is both the answer and a real distinction worth teaching |
| 6 | Two loose trade-off claims | §20.2 (honest simplification), internal consistency | The cache example claimed a cache "cuts cost" while "Ways to misread this" said a cache *costs* - both true, contradictory as written. And the synchronous-replication example named only the latency cost, when unreachable-replica write stalls also spend availability - the same distinction Q5 tests two sections later. Also dropped "consistency-first" from the Stripe example: consistency is undefined here and deferred to 3.22 |

Also added an in-lesson honesty note that five is the working set rather than
an exhaustive list of design concerns, with the matching
`curriculumContext.simplifications` entry (§20.2 requires stated simplifications
to be recorded there, since Deep Check reads them).

- **Lesson length: 1092 words** by `wc -w` (the 808 above is the pre-pass figure
  from Sonnet's entry; measured the same way the delta is roughly +240 words, and
  0.1's 667 words for 10 minutes scales to about 1000 for this chapter's 15, so
  the result is still proportionate). Net additions, not padding: the cold-open
  payoff, the diagram caption, the senior-answer line, the 0.3 preview, and the
  scope-honesty note are all beats §6/§7/§10 require and the draft was missing or
  under-weight on. Each was written to the §20.6 test before it went in.
- **Quiz: one reorder, nothing else.** Q5's correct option moved to `d`. Q1's
  sits at `b` and Q4's at `c`; leaving Q5 at `b` put 2 of this chapter's 3
  single-kind questions on the same letter - which passes the new invariant test
  but reproduces the exact habit the test was added to catch. Both matching
  questions were re-verified by hand as full derangements (Q2 and Q3 both hold;
  no pair's correct option sits at its own index). Distractors, the 1/1/2/2/3
  ramp, and every `explanationMd` were read fresh as if taking the exam and left
  alone. Q1's weakest distractor ("It is mostly about databases") is verbatim
  from QUIZ_FRAMEWORK §5's own bank Q1, so it stays.
- **`lessonVersion` 1 -> 2**, with the revision comment in `index.ts` per 0.1's
  convention.
- **Checked and deliberately left alone:** the Stripe and Netflix examples are
  defensible public decisions rather than implementation tourism (§13), and the
  lens-9 "neither is universal" closer is present; the availability/durability
  distinction is technically sound; `curriculumContext`'s mastered /
  not-yet-introduced lists are accurate (1.3 NFRs, 1.6 components, 3.22
  consistency each verified against §14); spec §4's declared omissions all still
  hold; the `hasEditorExercise` mechanism, `progress.ts`, `ChapterReader.tsx`
  and the manifest wiring were out of scope and untouched.
- **Verdict on the experiment:** the draft was structurally sound and would not
  have embarrassed anyone, but items 1 and 2 are real sequencing bugs of exactly
  the kind §18.2 calls spec bugs, and both would have shipped. Two new
  cross-chapter issues also surfaced only because a second reader came at it
  cold (open decisions 4 and 5 below).

---

## 0.3 Interview Design vs. Production Engineering

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1/0.2 - no separate `feature/content-0-3-*` branch cut,
  consistent with 0.2's precedent).
- Definition id `bb-0-3-interview-design-vs-production-engineering` · manifest slug
  `0-3-interview-design-vs-production-engineering`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build) ·
  prerequisite: 0.2
- **Lesson length: 1156 words after the Opus pass** (896 as drafted; 15 min.
  Against 0.2's post-pass 1092 for the same estimate and 0.1's 667 for 10 min -
  see the density note below and the Opus-pass subsection for why it grew)
- Pipeline green at this revision: typecheck, lint, 1566 tests, build

**Wave-order note (2026-08-06, user-directed).** Drafted out of the previously
documented wave order - Wave 1 originally owned 1.6/3.4/RWE Bitly, not Part 0's
remainder. The user redefined Wave 1 as Part 0 only (0.1-0.4) in this same session;
see `pending-content.md`'s wave section and this file's "Wave 1 progress" line above
for the corrected plan. 1.6, 3.4, and RWE Bitly moved to Wave 2.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-3-interview-design-vs-production-engineering.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-3-interview-design-vs-production-engineering.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `multi` kind |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception (§11.1),
  same as 0.2.** No components introduced (all three primitives stay homed at 1.6).
  `availableComponentIds`/`requiredComponentIds` both `[]`, `blueprints: []`, no
  `starterGraph`. CURRICULUM §14's own row for 0.3 already states "Exercise: none
  (quiz-weighted)" - no divergence to flag here, unlike 0.1's built-vs-spec gap.
- **`hasEditorExercise: false` reused, not re-derived.** 0.2's spec fixed the
  underlying CTA/completion mechanism and explicitly flagged 0.3 as a future reuse
  case. No new engineering work this chapter - just setting the field.
- **Practical objective category omitted**, same explicit §5.2 carve-out 0.2 used.
  Four objectives (Knowledge, Engineering, Interview, Communication).
- **Backward connections: 2, meeting §19's ≥2** (0.1 and 0.2 - unlike 0.1 and 0.2
  themselves, which each had fewer prior chapters available to cite). 0.2's
  "justified complexity" test is used substantively in the lesson body (the "Same
  brief, two registers" section) *and* named explicitly again in "Next" per §19's
  literal "beat 14" placement requirement - a deliberate double-appearance, not
  padding: one use is applying the concept, the other is the explicit cross-reference
  signpost the rule asks for.
- **Chose `multi` over `matching` for quiz kind variety (Q3).** A "classify each
  scenario as interview-register or production-register" question was drafted as
  `matching` first, then rejected: with only two real categories, matching's
  per-row dropdown becomes a disguised binary guess rather than the genuine n-to-n
  mapping 0.2's Q2/Q3 used (five *distinct* forces). `multi`'s "select all that
  apply" format (QUIZ_FRAMEWORK §2) tests the same content without the disguised-coin-flip
  problem. First chapter to use `multi`.
- **Quiz position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. Four single-kind questions (Q1/Q2/Q4/Q5) have correct
  options at c/b/a/d - four distinct positions, not just "not all identical."
- **Cold open deliberately avoids "the interviewer is impressed by boldness."**
  An early draft-in-my-head had the interviewer nod approvingly at the unjustified
  sharded proposal before the reveal - cut before it reached the file, because it
  would have taught the exact naive "interview rewards bold, production rewards
  boring" mental model this chapter argues against. The shipped cold open has the
  interviewer ask "why sixteen, why now" instead, so the failure is legible as
  *unjustified complexity failing in both registers*, not "wrong register."
- **Two production examples instead of one**, unlike 0.2's paired
  Stripe/Netflix contrast (which contrasted two companies on the same axis).
  Stack Overflow (restraint) and Discord (justified complexity) are deliberately
  opposite moves within the *same* register, to head off "production always avoids
  complexity" as a follow-on misreading of "production favors boring" - flagged in
  spec §3 and reinforced in "Ways to misread this."
- **No density revision pass performed as a distinct drafting round** - written
  once against §20.6 directly (896 words), then one targeted trim pass removed a
  three-way restatement of the same idea (diagram caption, a standalone paragraph,
  and the worked-example conclusion were all independently saying "registers differ
  in what's rewarded, not necessarily the architecture" - cut the caption's second
  clause and the standalone paragraph entirely, kept the concrete worked-example
  version as the one place the claim lands). Flagged here per 0.2's own precedent of
  flagging self-assessed density claims for the next reviewer to check rather than
  trusting them.

**Opus proofread pass (2026-08-06, lesson scope).** Run after the user read the
Sonnet draft and reported: *"the language used is either too specific for the point
where this chapter is present or too vague. I want you to audit and balance it out
such that it doesn't lose people trying to read the chapter."* Full itemization in
the chapter spec's §11; summary here.

**Lesson length: 896 -> 1156 words.** Above 0.2's post-pass 1092 for the same
15-minute estimate, and the increase is deliberate: every added word replaces an
assertion with a worked instance (§20.6 explicitly prefers concrete over abstract
even at slightly greater length). Three offsetting density cuts were made in the
same pass so the growth is net of trimming, not on top of it: the diagram caption
no longer restates beat 4's definition, the Discord closer no longer duplicates the
Common-mistakes bullet that generalizes it, and the cold open, "Next" and the
Stack Overflow example were each tightened.

*Too specific for chapter 3 of 44* (§18.2 rule 1 - the argument, not just the
flavor, rested on untaught vocabulary in each case):

- Cold open's "sharded, multi-region database... why sixteen shards" -> "split the
  database across sixteen machines in three regions - minute one, before anyone has
  said how many users there are." Three untaught terms in one sentence, in the one
  sentence the reader must grasp to feel the complexity is unjustified.
- Senior-answer line's "I'd shard only once replication lag or write throughput
  actually forces it" -> replication lag has no home chapter and was carrying the
  exemplar's trigger condition. Line rewritten entirely (see the thesis defect
  below, which was in the same sentence).
- Discord's "moved a core datastore off MongoDB onto Cassandra" -> "replaced the
  database under its message history," with the real pain named instead (messages
  stopped fitting in memory at ~100 million; reads turned slow and unpredictable).
  Two product names spent on a claim that needs neither; §13 calls that tourism.
- "An unjustified sharded design" in Common mistakes -> "a design built for a
  hundred times the traffic that exists," which is what the bullet is about.
  Unglossed on-call idiom went too: "paged at 3am"/"owning the pager" -> "woken at
  3am"/"being the person who has to keep it alive".
- Left as flavor on purpose: "regions"/"machines" (self-describing), "cache" (0.2
  grounded it), latency/throughput (0.2 taught them).

*Too vague / under-earning:*

- **"Register" was never defined** - the chapter's own central term, in the title,
  every section heading, the diagram and the quiz, and the draft never said what one
  is. Beat 4 now defines it before asserting the split. Biggest single fix.
- **The senior-answer line contradicted the chapter's thesis.** The draft's exemplar
  opened *"For the interview, I'd propose the sharded design to show I understand the
  scaling path"* - i.e. it modelled proposing unjustified complexity in the interview
  register, the exact failure the cold open punishes and the exact naive framing this
  ledger records the cold open as having been written to avoid. Rewritten so the
  senior move is naming the register you're in, with the design unchanged across the
  switch and only instrumentation added.
- **The "it depends" fix was missing.** Spec §9's playtest table claimed the lens
  taught it; it didn't, and Q5 tests it. Two sentences added (name the variable,
  commit on both sides, with a worked branch).
- **The diagram was abstract scaffolding** - "Same design decision" -> "Interview
  register"/"Production register" restated the table's first two rows in boxes. Root
  is now the cold open's actual decision and each leaf states what that register
  rewards for it, so the picture carries a worked instance.
- **"Boring, reversible, well-understood choices"** was a terse cell carrying the
  whole production register, never unpacked. One paragraph now defines both words
  operationally (failures already documented; wrong costs an afternoon, not a
  migration).
- **"At this scale nothing forces more"** referred to a scale the brief never stated.
  The worked brief now carries a number (a link shortener, 500 new links a day), and
  that number anchors the senior-answer line three sections later.

**Checked and left alone:** the two-register thesis, the cold open's framing, and
the Stack Overflow / Discord pairing (all three are the recorded judgment calls
above and all three survive scrutiny); §6's Concept section inventory complete and
in §5.3 order; §19's two backward connections intact; "Next" correctly previews 0.4
(verified against `manifest.ts`) with 1.11 as the one marked further-out tease;
§4's declared omissions still hold; both production examples' public numbers are
accurate and load-bearing to the decision.

**Open note for a later quiz-scope pass (not edited - lesson scope):** Q1's stem and
correct option use "breadth-first," which comes from CURRICULUM §1.5's phrasing and
appears nowhere in the lesson. The question is answerable without the term, so it
was left as-is, but it is the one remaining lesson/quiz vocabulary seam in this
chapter.

---

## 0.4 The System Design Lifecycle

- **Authored 2026-08-06 · not yet committed · branch `feature/content-0-1-welcome`**
  (same stacked branch as 0.1/0.2/0.3 - no separate `feature/content-0-4-*` branch
  cut, consistent with precedent).
- Definition id `bb-0-4-the-system-design-lifecycle` · manifest slug
  `0-4-the-system-design-lifecycle`
- Type: Concept · foundational · 15 min (Reader + knowledge check, no build) ·
  prerequisite: 0.3
- **Lesson length: 1102 words after the Opus pass** (1085 as drafted). Against
  0.2's post-pass 1092 and 0.3's 1156 for the same 15-minute estimate; unlike
  those two, this chapter needed no length change - see the Opus-pass subsection.
- Pipeline green at this revision: typecheck, lint, tests, build. (The Sonnet
  drafting pass deliberately skipped it per user direction; the Opus pass ran it.)

**Wave-completion note (2026-08-06).** Closes Wave 1 / Part 0 (0.1-0.4) as
redefined earlier in this same session. Sonnet draft plus a lesson-scope Opus
proofread pass, the same shape 0.3 got (0.2 got a full-scope pass).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-0-4-the-system-design-lifecycle.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-0-4-the-system-design-lifecycle.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `ordering` kind |
| 6 | Playtest pass | Spec §9 |

**Judgment calls made:**

- **No construction-family exercise - justified Concept-chapter exception (§11.1),
  same as 0.2/0.3.** No components introduced (all three primitives stay homed at
  1.6). `availableComponentIds`/`requiredComponentIds` both `[]`, `blueprints: []`,
  no `starterGraph`. CURRICULUM §14's own 0.4 row gives the exercise as "ordering
  exercise (arrange the eight steps; explanation per placement)" - realized as the
  quiz's `ordering` question (Q3), the same pattern 0.2 used for its matching
  question and 0.3 flagged as reusable.
- **`hasEditorExercise: false` reused, not re-derived.** Same mechanism 0.2's spec
  fixed and 0.3 already reused; no new engineering work.
- **Practical objective category omitted**, same explicit §5.2 carve-out 0.2/0.3
  used. Four objectives (Knowledge, Engineering, Interview, Communication).
- **First chapter to use `ordering` as a quiz kind.** Options authored as a full
  derangement against `correctOrder` (no option sits at its own correct index) -
  `Ordering.tsx` shows the authored `options` array with no shuffle
  (`src/chapters/quiz/Ordering.tsx`), so anything less than a real scramble risks
  shipping pre-solved. Same discipline 0.2 applied to its `matching` questions'
  `pairs` vs. `options` ordering.
- **Backward connections: 2, meeting §19's ≥2** (0.2 and 0.3). 0.2's five forces
  are named (not re-listed individually) in the step-2 table row *and* again in
  "Next," a deliberate double-appearance mirroring 0.3's own precedent for this
  pattern. 0.3's two-registers frame is reused as the organizing idea of "Same
  loop, on paper" and named again in "Next."
- **Production examples chosen to extend 0.3's frame rather than introduce a new
  one.** Google's design-doc convention and Amazon's "6-pager" are both public,
  documented practices (§13) that run the same eight-step loop, formalized and
  slowed down instead of narrated live - the direct production-side payoff of
  0.3's interview/production distinction, rather than an unrelated pair of
  examples.
- **`pending-chapters.md` open decision 4 (the §14/§10.1 five-forces
  contradiction) sidestepped, not resolved.** The step-2 table row says
  "0.2's five forces" without re-listing the five names, so this chapter takes
  no position on which list (§14's or §10.1's) is canonical. Flagged in spec §11
  for a second reader to confirm this reads as deliberate.
- **Diagram is Mermaid, not ScaleCraft graph JSON** - a process-flow sequence
  (eight steps plus one dotted return edge), consistent with open decision 3
  below ("Part 0 is unaffected - process flows are Mermaid by spec anyway").
- **No everyday analogy in the mental-model beat**, same choice 0.3 made and for
  the same reason: the loop's own numbered, causally-dependent structure is
  already the clearest available frame for itself; a forced external metaphor
  (checklists, pre-flight routines) would have been decorative.
- **One density-revision cut made during drafting, not left to a later pass.**
  An early draft carried a standalone "Why the order isn't optional" section
  (~40 words) that was judged redundant with "Common mistakes"' first bullet and
  folded into the paragraph following the core-mechanics table instead. The
  post-table paragraph and the "In an interview" opening were each tightened
  once more after that. No further density pass was run distinctly from
  drafting - flagged in spec §11 for a reviewer to check, per 0.2/0.3's own
  precedent of flagging a self-assessed density claim rather than trusting it.

**Opus proofread pass (2026-08-06, lesson scope).** Run after the user read the
Sonnet draft and reported: *"I like this chapter layout, go ahead and check the
grammer and ambiguiety of sentence."* Explicitly a line-level copy-edit, not a
revision: the user approved the structure and section order as drafted, so no
section was added, cut, reordered, or reframed. Lesson length effectively
unchanged (1085 -> 1102 words); every edit trades the same number of words for
a sentence that can only be read one way.

*Grammar / ambiguity fixes (the pass's actual subject):*

- **Cold open, unresolvable "one answer / the other."** "Half the diagram
  assumed one answer, the other half assumed the other" - the interviewer had
  just asked two questions (how many users; read-heavy or write-heavy), and only
  the second has two answers, so the sentence has no recoverable referent. Now
  "Half the diagram assumes read-heavy, the other half assumes write-heavy."
- **Cold open, tense shift inside one sentence.** "...assumed... and the next ten
  minutes go to redrawing it" mixed past and present in a single clause chain.
  Now present throughout, matching the paragraph's narration.
- **Cold open, unquoted direct question.** "The interviewer stops them: how many
  users, and is this read-heavy or write-heavy?" now carries quotation marks,
  matching 0.3's own precedent for interviewer speech.
- **Think-first callout, stacked imperatives.** "Think first: before reading on,
  guess - what's the very first thing..." piled three commands before the
  question. Now the question first, "Commit to an answer before reading on"
  after - 0.2's precedent exactly.
- **"The fixed sequence that stops this."** "This" pointed at a whole scene with
  three plausible referents. Now "what prevents that failure."
- **Comma splice after the mechanics table.** "the diagram was fine, the ground
  under it was guessed" -> semicolon.
- **"How far back to go," appositive pile-up.** "might only touch step 4, a new
  entry point, or it might reopen step 2, a new requirement that forces the deep
  dive too" reads momentarily as a three-item list. Appositives moved into
  parentheses; "the deep dive" (a definite article with no antecedent) -> "a
  fresh deep dive."
- **Pronoun number on "requirements."** "that's usually what actually moved. If
  it didn't" -> "they're usually what actually moved. If they didn't."
- **Dangling "narrated aloud."** "compresses all eight steps into one sitting,
  narrated aloud" attached the participle to "one sitting." Now "compresses all
  eight steps into one sitting and narrates them aloud," parallel with
  production's "stretches them... and writes them down."
- **"Does the same job as a narrative memo."** Reads as a comparison (the memo
  is a separate thing doing the same job) when the intent is a form. Now "does
  the same job in the form of a narrative memo."
- **"Silence... usually means keep going."** Bare imperative after "means"; now
  quoted, matching §10.2's own phrasing.
- **""10x the writes" is steps 3 and 5 again."** Singular verb against a plural
  complement. Now "reopens steps 3 and 5."
- **Recap bullet 2.** "Skipping a step doesn't save time - it becomes rework" -
  "it" resolves to the skipping, which is not what becomes rework. Now "the step
  comes back as rework later."
- **"Next," two loose demonstratives and one misattribution.** "the two registers
  those forces get judged in" - 0.3 defines a register as what a *decision* is
  judged in, not a force; now "the two registers a design decision gets judged
  in." "the order everything else gets gathered in" -> "the order the work
  happens in." "where this stops being a conversation" -> "where the loop stops
  being a conversation."
- **Table row 2 parse.** "Functional (what it does) + non-functional (how well)
  promises" delayed its head noun past two parentheticals and used "+" where
  rows 1 and 3 use "Noun: expansion." Now "Promises: functional (what it does)
  and non-functional (how well)."

*Safety-net fixes (outside the grammar remit, flagged as such):*

- **§18.2 rule 1 - QPS was unglossed.** "users to QPS to storage to bandwidth"
  in the estimate row. QPS appears nowhere in 0.1, 0.2 or 0.3 (grepped), and
  0.2 teaches the concept as "throughput," never the abbreviation. Glossed
  inline at first use per §20.1: "users to QPS (queries per second) to storage
  to bandwidth."
- **§20.1 banned word.** "It sounds like the easy step - just ask questions -"
  -> "ask a few questions and move on." The other three "just"s in the file are
  the "not just X" sense, which the rule doesn't reach.
- **"Instance" was untaught vocabulary.** ""what if this instance dies?"" ->
  "server," which the cold open already puts on the board.
- **Mild gamified framing.** "1.1 puts you on the loop's first square" -> "1.1
  drops you into step 1." Board-game idiom against the not-a-game principle,
  and "step" is the chapter's own noun anyway.

**Checked and deliberately left alone:**

- **Structure, section order, and all section headings** - the user approved the
  layout explicitly; nothing was added, cut, moved, or retitled.
- **Word count (1085 -> 1102), spec §11's first flagged item.** Re-derived rather
  than trusted: the table is eight discrete facts x three columns and *is* the
  chapter's stated purpose (a map of Part 1), and the two production examples are
  one sentence each. Nothing is padded; no cut was made purely to hit a number,
  per §20.6's "length follows content" clause. The self-assessed density claim in
  spec §11 holds.
- **Open decision 4 (five-forces contradiction), spec §11's second flagged item.**
  The step-2 row names "0.2's five forces" without re-listing them. Confirmed as
  deliberate and correct, not evasive: 0.2 is the only chapter that has taught a
  list, the row points at it by chapter number, and re-listing would force this
  chapter to pick a side in a contradiction that is still open. Leave as is when
  the decision is finally resolved - this row needs no edit either way.
- **Google design doc and Amazon 6-pager claims.** Both accurate as stated:
  goals/non-goals, the design, and alternatives-considered are the publicly
  documented Google structure; the 6-pager is a narrative memo read silently at
  the start of the meeting. Only the sentence's grammar was touched, not the
  claim.
- **Em dashes: zero.** Grepped the file for "—" directly, not eyeballed.
- **"Next" targets verified against `manifest.ts`.** 1.1 (`1-1-understanding-the-problem`)
  has `prerequisiteSlugs: ["0-4-the-system-design-lifecycle"]`, so it is genuinely
  the immediate next chapter; 1.6 is the single marked further-out tease, the same
  one-tease pattern 0.2 (1.3) and 0.3 (1.11) used.
- **Table's "You'll live it in" column checked row by row against `manifest.ts`.**
  All eight map correctly, including the two non-sequential ones (deep dive ->
  1.9, bottlenecks -> 1.7, which are out of numeric order in the table because
  the loop's order and Part 1's chapter order genuinely differ there).
- **Lesson vs. quiz eight-step consistency.** The table's order matches the
  ChapterDefinition's `correctOrder` exactly (clarify, requirements, estimate,
  high-level-design, deep-dive, bottlenecks, trade-offs, evolve-defend). No
  mismatch to flag.
- **Diagram, mermaid source untouched.** Only the caption was reworded
  ("the loop's namesake" -> "why it's a loop," plainer per §20.1).
- **§6 Concept section inventory** complete and in §5.3 order; §19's two backward
  connections (0.2, 0.3) intact; §4's declared omissions still hold.

**Open note for a later quiz-scope pass (not edited - lesson scope):** Q2's
options and explanations use "QPS" three times. The lesson now glosses it at
first use, so a reader who read the chapter is fine, but the quiz-side
vocabulary seam is worth the same look 0.3's "breadth-first" note got.

**`lessonVersion` bumped 1 -> 2** in `src/content/chapters/index.ts` with a
revision comment, per the 0.2/0.3 convention.

---

## 1.1 Framing the Problem (Phase 10 condense - NEW)

- **Authored 2026-08-16 · not yet committed · branch
  `feature/cloud-sync-reconciliation`** (per the standing rule for this
  release: every 6.1.0 phase lands on one branch, not one per phase - see
  `.claude/docs/pending-6.1.0-poa.md`'s Status line).
- Definition id `bb-1-1-framing-the-problem` · manifest slug
  `1-1-framing-the-problem` (wired into `manifest.ts` by the Phase 10
  engineering pass, 2026-08-16)
- Type: Process · foundational · ~15 min (Reader + knowledge check, no
  build) · prerequisite: 0.4
- **Replaces old 1.1 Understanding the Problem, 1.2 Functional Requirements,
  1.3 Non-functional Requirements, 1.4 Estimating Scale, and 1.5 Numbers
  Every Engineer Should Know.** Their `ChapterDefinition`s, manifest rows,
  specs, and lesson files were removed by the Phase 10 engineering pass
  (2026-08-16); their detail sections stay below, unchanged, as the
  source-material record only.
- **Lesson length: not yet measured with `wc -w`** (content-authoring pass
  only, no shell commands run per the `chapter-author` skill's scope) -
  visibly longer than a typical 15-minute chapter, justified in the spec §12
  as proportionate to a 5-chapters-into-1 compression ratio plus two
  mandatory content requirements (the landmark table must survive per POA
  §10.3; functional and non-functional requirements each need their own
  table). Flagged for a second reader, same as every prior Part 1 chapter's
  own precedent.
- Pipeline run by the Phase 10 engineering pass (2026-08-16):
  `tsc`/`lint`/`vitest`/`build` all green, including the registry-wiring
  touches (`index.test.ts`'s hardcoded id list, `authoring-invariants.test.ts`'s
  quiz-size assertion).

**Deliverables (6 of 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-1-framing-the-problem.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-1-framing-the-problem.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (new entry; old 1.1-1.5 entries removed) |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 12 questions (Process-chapter exception, QUIZ_FRAMEWORK.md §2), ramp 4/6/2 across difficulty 1/2/3, at least one question per absorbed topic |
| 6 | Playtest pass | Spec §10 - still a manual click-through, not run this pass |

**Done (Phase 10 engineering pass, 2026-08-16):** manifest.ts wiring (slug,
`prerequisiteSlugs` for downstream chapters, `estimatedMinutes`).

**Judgment calls made:**

- **One unifying test replaces four separate ones.** Old 1.1/1.2/1.3/1.4
  each taught their own single-purpose test (clarifying-question test,
  Must-have test, number-not-adjective distinction, order-of-magnitude
  discipline). This chapter states one general test - "a decision earns its
  time only if a different answer would change what you build" - and applies
  it three times. This is new synthesis, not restatement of any one source
  chapter, and is the chapter's main §20.6 density win over stapling five
  lessons together. Flagged in spec §0/§3 for a second reader to confirm it
  reads as a genuine unifying insight rather than a forced one.
- **A single continuous cold open replaces five separate ones**, following
  the interviewer through clarify -> requirements -> estimate in one scene,
  mirroring the loop's own progression instead of five separate URL-shortener
  vignettes.
- **New beat 7 ("What ties the three steps together") has no precedent in
  any source chapter.** Each old chapter's own "Next" section gestured at
  continuity (e.g. old 1.4 confirming 1.1's ratio as "the real number"), but
  none of them stated the general principle that loop steps consume each
  other's outputs. Added because five separate chapters compressing into one
  makes this connective tissue newly visible and newly worth stating
  explicitly - exercised by quiz Q11.
- **Only one production example kept** (Amazon S3's two numbers, from old
  1.3), cutting old 1.2's Basecamp example and old 1.4's WhatsApp example.
  Justified in spec §4: three examples for ~15 minutes of content would be
  disproportionate, and S3's example ties most directly to this chapter's
  own NFR material. Flagged in spec §12 for a second reader to confirm
  neither cut example was doing load-bearing work.
- **1.5's landmark ratio table survives as a table, not a diagram**, per the
  Phase 10 resolved decision (POA §10.6.2) - compressed rather than promoted
  to a standing reference page, landing inside this chapter as originally
  decided.
- **Quiz Q11/Q12 are new question types** testing the beat-7 synthesis point
  directly - no direct precedent in any of the five source chapters' own
  quizzes, since none of them individually had cross-step synthesis to test.
  Flagged in spec §12 for a second reader to confirm they test real
  understanding rather than trivia about this chapter's own narrative
  choices.
- **Position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. 11 single/estimate-kind questions (Q2-Q12); correct
  options land at a×3, b×2, c×3, d×3 - no clustering.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, aiming for maximum compression from
  the outset given the 5-to-1 ratio. Flagged here per every prior Part 1
  chapter's own precedent of flagging a self-assessed density claim for the
  next reviewer to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope, still open):** no
Opus audit pass. Everything else - `tsc`/`lint`/`vitest`/`build`, manifest.ts
wiring, and removal of old 1.1-1.5's `ChapterDefinition`s, specs, and lesson
files - was completed by the Phase 10 engineering pass (2026-08-16); their
own ledger entries below stay in place as a source-material record only.

---

## 1.2 Designing the System (Phase 10 condense - NEW)

- **Authored 2026-08-16 · not yet committed · branch
  `feature/cloud-sync-reconciliation`**.
- Definition id `bb-1-2-designing-the-system` · manifest slug
  `1-2-designing-the-system` (wired into `manifest.ts` by the Phase 10
  engineering pass, 2026-08-16)
- Type: **Building Block** (not Process - see spec §0). ~25 minutes (Reader
  + a real Editor build) · prerequisite: new 1.1.
- **Replaces old 1.6 Drawing the First Architecture, 1.7 Identifying
  Bottlenecks, and 1.9 Deep Dive Methodology.** Their `ChapterDefinition`s,
  manifest rows, specs, and lesson files were removed by the Phase 10
  engineering pass (2026-08-16); their detail sections stay below unchanged,
  as source-material record only.
- Pipeline run by the Phase 10 engineering pass (2026-08-16):
  `tsc`/`lint`/`vitest`/`build` all green.

**Deliverables (6 of 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-2-designing-the-system.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-2-designing-the-system.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (new entry; old 1.6/1.7/1.9 entries removed) |
| 4 | Validation rules | Unchanged from old 1.6 - same five rules, same blueprint, same `starterGraph` (§10.3 must-survive) |
| 5 | Quiz | 13 questions (condensed-chapter exception), ramp 4/6/3, at least one question per absorbed topic |
| 6 | Playtest pass | Spec §9 - still a manual click-through, not run this pass |

**Done (Phase 10 engineering pass, 2026-08-16):** manifest.ts wiring, same
as new 1.1.

**Judgment calls made:**

- **§10.3's must-survive requirement honored literally.** Old 1.6's
  `availableComponentIds`, `requiredComponentIds`, `validationRuleIds`,
  `blueprints`, and `starterGraph` all carried forward unchanged (only ids
  renamed from `bb-1-6-*` to `bb-1-2-*`). Old 1.6's quiz Q1-Q5 also carried
  forward essentially verbatim (Q5 renumbered to Q11). Full accounting in
  spec §1.
- **Chapter type changed from Process to Building Block**, since the
  combined chapter still ships a real canvas exercise (old 1.6's), which
  makes Failure modes, Scaling, and Production examples all mandatory per
  §6 - all three are genuinely present, not merged away. Documented in spec
  §0.
- **The topology diagram and the abstract ceiling diagram merged into one.**
  Old 1.6's plain three-box Mermaid diagram now carries example ceiling
  numbers on the app server and database, doing the job of both old 1.6's
  topology diagram and old 1.7's separate abstract "Stage 1/2/3" ceiling
  diagram - without redrawing the same topology twice, which §7.2
  prohibits. Flagged in spec §11 for a second reader to confirm this reads
  as doing double duty cleanly.
- **New synthesis beat ("Two methods for looking closer")** states that old
  1.7's bottleneck method and old 1.9's deep-dive targeting method are the
  same underlying comparison asked as two different questions - no
  precedent in either source chapter individually. Exercised by quiz Q13.
  Same pattern new 1.1's own beat 7 established for this release.
  Flagged in spec §11 for a second reader.
- **Estimated time set to ~25 minutes, not the flat ~15-minute Phase 10
  planning average** - honestly reflects that this is the only one of the
  four new chapters carrying a real build, the same way old 1.6 alone ran
  30 minutes against 1.1-1.5's 15-25. Flagged prominently in spec §11 for
  the user to confirm the deviation is intentional, not a miss.
- **Only one production example kept** (Instagram, from old 1.6), cutting
  old 1.7's Twitter and old 1.9's Amazon examples - same reasoning new
  1.1's own cuts used (§5 of this chapter's spec).
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged per every prior chapter's
  own precedent.

**Not done (still open):** no Opus audit pass. Everything else was completed
by the Phase 10 engineering pass (2026-08-16).

---

## 1.3 Defending the Design (Phase 10 condense - NEW)

- **Authored 2026-08-16 · not yet committed · branch
  `feature/cloud-sync-reconciliation`**.
- Definition id `bb-1-3-defending-the-design` · manifest slug
  `1-3-defending-the-design` (wired into `manifest.ts` by the Phase 10
  engineering pass, 2026-08-16, **including 2.1's `prerequisiteSlugs`
  repoint** from old `1-10-communicating-and-defending-a-design`).
- Type: Process. ~15 minutes (Reader + knowledge check, no build) ·
  prerequisite: new 1.2.
- **Replaces old 1.8 Engineering Trade-offs and 1.10 Communicating &
  Defending a Design.** Their `ChapterDefinition`s, manifest rows, specs,
  and lesson files were removed by the Phase 10 engineering pass
  (2026-08-16); detail sections stay below unchanged, as source-material
  record only.
- Pipeline run by the Phase 10 engineering pass (2026-08-16):
  `tsc`/`lint`/`vitest`/`build` all green.

**Deliverables (6 of 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-3-defending-the-design.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-3-defending-the-design.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (new entry; old 1.8/1.10 entries removed) |
| 4 | Validation rules | None - no canvas exercise |
| 5 | Quiz | 13 questions (condensed-chapter exception), ramp 4/6/3 |
| 6 | Playtest pass | Spec §6 - still a manual click-through, not run this pass |

**Judgment calls made:**

- **The chapter's synthesis was already present in the source material,
  not invented this pass.** Old 1.10's own text states "defending reuses
  1.8's own trade-off reflex, extended one clause" - this chapter's beat 7
  structure follows that existing connection directly, unlike new 1.1's and
  1.2's beat 7 sections, which had to state a genuinely new unifying idea
  across source chapters that didn't reference each other that way.
  Flagged in spec §7 so a reviewer doesn't over-credit this chapter for
  synthesis the source material already did.
- **Only Dropbox kept as the production example**, cutting old 1.8's Uber
  example - Dropbox alone covers both loop steps (naming a trade-off,
  defending it under public challenge) where Uber illustrated only one
  dimension. Same cut-to-one-example pattern as new 1.1/1.2.
- **Failure modes/scaling omitted** - optional for Process, no system to
  fail or scale on its own, same as both source chapters.
- **Trade-offs (§6 beat 8) folded into core mechanics and internal
  mechanics rather than given a separate section** - the chapter's whole
  subject already is trade-offs, so a dedicated beat-8 section would
  restate rather than add anything (permitted under §6's adjacent-sections
  merge rule).
- **2.1's `prerequisiteSlugs` repointed** from old
  `1-10-communicating-and-defending-a-design` to new
  `1-3-defending-the-design` - done by the Phase 10 engineering pass
  (2026-08-16), per the POA's Phase 10 §10.5 checklist.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly.

**Not done (still open):** no Opus audit pass. Everything else was
completed by the Phase 10 engineering pass (2026-08-16).

---

## 1.4 Driving the Interview (Phase 10 renumber - NEW)

- **Authored 2026-08-16 · not yet committed · branch
  `feature/cloud-sync-reconciliation`**.
- Definition id `bb-1-4-driving-the-interview` · manifest slug
  `1-4-driving-the-interview` (wired into `manifest.ts` by the Phase 10
  engineering pass, 2026-08-16).
- Type: Process. 30 minutes · prerequisite: new 1.3. **Optional, gates
  nothing** - unchanged from old 1.11.
- **Renumbers old 1.11 Driving a System Design Interview - not a
  multi-chapter condense** (single source, single destination), so content
  carried forward nearly verbatim rather than rewritten. Old 1.11's
  `ChapterDefinition`, manifest row, spec, and lesson file were removed by
  the Phase 10 engineering pass (2026-08-16); its detail section stays
  below unchanged, as source-material record only.
- Pipeline run by the Phase 10 engineering pass (2026-08-16):
  `tsc`/`lint`/`vitest`/`build` all green.

**Deliverables (6 of 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-4-driving-the-interview.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-4-driving-the-interview.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (new entry; old 1.11 entry removed) |
| 4 | Validation rules | None - no canvas exercise |
| 5 | Quiz | 5 questions, unchanged from old 1.11 (see below) |
| 6 | Playtest pass | Spec §5 - still a manual click-through, not run this pass |

**Judgment calls made:**

- **Quiz deliberately NOT resized to 10-15.** The condensed-chapter
  exception in QUIZ_FRAMEWORK.md §2 applies to chapters absorbing multiple
  prior source chapters; this one absorbs exactly one (old 1.11), so the
  ordinary 3-6 range governs and old 1.11's already-correct 5 questions
  carried forward with only ids renamed and two explanation strings'
  old-chapter-number references updated to name new chapters by title.
- **Estimated time kept at 30 minutes**, not shortened to Phase 10's
  "~10-15 for optional" planning language - this chapter has real content
  of its own (running all eight loop steps under a clock), not five
  chapters' worth of material to compress. Flagged in spec §1 as a
  deliberate choice, not an oversight.
- **`curriculumContext.masteredConcepts` rewritten** to cite new 1.1-1.3
  instead of old 1.1-1.10, condensed to name what those three chapters
  actually teach.

**Not done (still open):** no Opus audit pass. Everything else was
completed by the Phase 10 engineering pass (2026-08-16).

---

## 2.1 From Browser to Backend (Wave 3, first Part 2 chapter)

- **Authored 2026-08-18 · not committed · working tree on `main`** (no branch
  cut - the `/chapter-author draft` pass never commits or branches; the user
  reviews the uncommitted diff and decides where it lands)
- Definition id `bb-2-1-from-browser-to-backend` · manifest slug
  `2-1-from-browser-to-backend` (`chapterDefinitionId` repointed from `null`)
- Type: Concept · foundational · 20 min · prerequisite `1-3-defending-the-design`
- **Lesson length: 1804 words** prose (2100 including the `<Walkthrough>` prop
  block) after the Opus pass; 1727/2023 as drafted
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-2-1-from-browser-to-backend.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-2-1-from-browser-to-backend.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 1.4 and 3.4) |
| 4 | Validation rules | None new, none needed. `validationRuleIds: []` - no graph to validate |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (ordering, single, diagram, single, single) |
| 6 | Playtest pass | Spec §9 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line
`chapterDefinitionId` repoint) and `index.ts`'s file-header comment, which
still enumerated only Part 0 + 1.1 as authored and is now accurate.

**Judgment calls made:**

- **The `<Walkthrough>` is the chapter's primary diagram, and it satisfies
  §14's "simulated token" promise rather than degrading it.** §7.2 names "a
  request tracing a path" as exactly the case the component exists for, and
  2.1's §14 row asks the learner to "follow a simulated token through a
  presented graph." Every prior chapter that hit a simulator-shaped beat
  degraded it to a quiz question (open decision 7: 1.6, 1.7, 3.4). This one
  does not: release 5.1.0-alpha's diagram pipeline shipped the capability and
  2.1 is the first chapter whose §14 row it directly answers. **Recorded as a
  partial resolution of open decision 7, for trace-shaped exercises only** -
  the predict-then-check beats 1.7 and 3.4 wanted still have no mechanism.
- **Failure modes and scaling behavior both omitted, declared in spec §4.**
  Optional for Concept by §6, but the reason here is sequencing rather than
  convenience: §14 defines 2.2 as this identical journey walked failure-first
  and 2.3 as the scaling-evolution story. Authoring either here would consume
  the next chapter's reason to exist. QUIZ_FRAMEWORK §7's Q3/Q4/Q6/Q10 are all
  tagged 2.2 and were deliberately left unused.
- **Seven un-unlocked components presented, and this is not an exception being
  carved.** §14's own Part 2 header sanctions it ("presented diagrams use
  components the learner hasn't unlocked yet - explicitly labeled as a guided
  tour") and §18.2 rule 2 calls Part 2's tour "the one sanctioned larger
  exception." The palette stays empty (`availableComponentIds: []`); the lesson
  discharges the labeling requirement in the paragraph immediately before the
  walkthrough. Different in kind from 0.1's scenery exception, which needed one.
- **The stop table pre-commits a one-line job description for 3.1, 3.2, 3.3,
  3.4 and 3.5.** Unavoidable for a chapter whose whole purpose is the spatial
  map, but it is a real constraint on Group A's authors: 3.4 already exists and
  matches, the other four should be checked against this table rather than
  diverging from it silently. Flagged in spec §6 and in the new open decision
  below.
- **Quiz Q3's graph deliberately differs from the walkthrough's topology** (it
  adds a firewall) so §7.2's draw-a-topology-once rule is respected in spirit,
  not just on the technicality that one is a lesson diagram and the other is
  assessment.
- **Q4 reframed from the bank's recall phrasing to judgment.** QUIZ_FRAMEWORK
  §7 Q9 asks "where does TLS typically terminate"; §1's reasoning-over-recall
  rule makes that a weak question, so it became "what is the strongest reason
  for putting it there."
- **§12 nugget devices omitted and declared** (spec §4). Fourth chapter to omit,
  third to declare. See open decision 5, now overdue.
- **Cross-chapter answer-position check done by eye**, per the chapter-author
  skill's note that `quiz-invariants.test.ts` is per-chapter only: 0.4, 1.3, 1.4
  and 3.4 all put their Q1 answer at "b", so 2.1's first lettered question is
  deliberately at "c". Full spread c/a/d/b across the four lettered questions;
  Q1's `ordering` options are a full derangement against `correctOrder`.
- **Stale line corrected while in the file:** "Everything else in the 79 rows"
  now reads 72, matching this document's own header after Phase 10's condense.

**Opus proofread pass (2026-08-18):**

Full record in spec §12. Scoped to the six areas of the chapter-author contract;
quiz, hints and `problemStatement`/`learningObjectives`/`curriculumContext` were
off-limits by instruction. Structure and voice kept. `lessonVersion` 1 -> 2.

Seven changes, all defects against the framework:

- **Three false claims about the curriculum's own shape**, the material
  findings. (a) The cold open's stakes sentence said "almost every component in
  Part 3 installs itself somewhere along that arrow" - only Group A does;
  Groups B-G hang off the far end. (b) "Group A of Part 3 is nothing but that
  segment, one chapter per stop" is contradicted by the chapter's own thesis
  two paragraphs earlier - 3.2 is a Group A chapter and DNS is beside the path,
  and 3.1 is Networking Fundamentals, broader than one stop. (c) The stop
  table's TCP+TLS row said "no chapter of its own" while §14 gives 3.1 "TCP vs.
  UDP at concept level, TLS termination" - it now reads "Not a component - the
  connect phase, everywhere; 3.1 covers it", which keeps the phase-not-a-box
  distinction without under-promising 3.1.
- **Two factual corrections.** QUIC was described as "now standardized as
  HTTP/3", conflating the transport (RFC 9000) with HTTP over it (RFC 9114);
  and the handshake cost quoted the TLS 1.2 worst case ("a third of a second")
  as *the* figure right after offering a one-or-two-round-trip range - now "one
  more on TLS 1.3, two on 1.2 ... 200 to 300 ms", which is correct and names
  what a version upgrade actually buys.
- **Two register fixes.** `recursive resolver` carried a whole paragraph's
  argument with no gloss (§20.1 requires one at first use); and the swap from
  1.2's Client card to the walkthrough's Browser card was silent, so one clause
  now bridges it. That same paragraph is what discharges §18.2 rule 2's
  tour-labeling requirement, so it also picked up "where you build it yourself".

**Checked and left alone, with reasons** (fuller in spec §12):

- **"Before your code runs" is not over-depth.** The draft nominated it as the
  first cut. Judged correct as written: TTL caching, per-connection handshake
  cost and connection reuse are one level of internal mechanics, not three, and
  each changes a decision. Beat 7 is mandatory for Concept - cutting it leaves
  the chapter with no internal mechanics at all.
- **No section has spent 2.2's failure material.** "Common mistakes" is four
  map-reading errors, not failures. The only failure mention in the chapter is
  one clause about Cloudflare's own outages, attached to a production example as
  its cost. The "Next" tease is intact.
- **The tour label does carry its weight**, and is now slightly stronger. It
  sits immediately before the diagram, names Part 3 as where each stop gets
  built, and states the palette is untouched. No later section assumes a tour
  component as taught: every use is either "you'll build this in 3.x" or a
  property the chapter itself just established.
- **Stop table rows re-verified against §14 and, for 3.4, against the authored
  `bb-3-4-load-balancer.mdx`** (its "one address, many identical backends"
  thesis matches). 3.1/3.2/3.3/3.5 match §14's purpose lines. The one
  under-promise found is the TCP/TLS row above.
- **`<Walkthrough>` checked by reading `types.ts`/`normalize.ts`/`layout.ts`,
  not by running the suite.** All node/edge ids resolve, every `focus` and
  highlight reference is declared, six steps clears the two-step minimum,
  longest caption is 157 of 220, every caption names its highlighted node/edge
  in prose (required - the diagram is `aria-hidden`), no `request-flow` cycle,
  all `componentId`s in the registry, captions use the registry's own labels.
  Auto-layout puts `dns` in column 0 beside `browser` because it touches no
  `request-flow` edge, which is exactly the "beside the path" read the chapter
  wants. Edge kinds semantically correct.
- **`blueprints`/`availableComponentIds`/`requiredComponentIds`/
  `validationRuleIds` all `[]` is the honest call**, not a convenient one, and
  §16 wants no declared exception for it - the palette is genuinely empty and
  §14's Part 2 header sanctions the presented tour. Rule ids confirmed empty
  against `src/validation-engine/rules/index.ts`: all ten rules need a graph.
- **Length: 1804 prose words**, up 77 from the draft (the gloss and the
  Client/Browser bridge cost more than a "Your turn" tightening returned). At
  the top of the budget but not padded. The honest comparison is not 1.2's 1755
  words for 25 minutes - a third of those minutes are canvas work, so 2.1 is the
  heavier *read* of the two. If a later pass must cut, cut prose, not the table.

**Still open:**

- **Pipeline not run** (content-only pass). `walkthrough-invariants.test.ts`
  in particular has never seen this diagram - the captions, node ids, edge ids
  and highlight references were authored against `normalize.ts`'s issue list by
  reading, not by running it. Caption lengths were checked by hand (max 157 of
  220 allowed).
- **Wave ordering note:** `pending-content.md` puts 2.1 in Wave 3 and says not
  to start a wave until the previous one's chapters are merged. Wave 2 is not
  complete - RWE Tier 1 Bitly is still the `rwe-dummy-1` placeholder. Authored
  anyway on explicit user request; flagged rather than silently ignored.

---

## 2.2 Where Can Things Go Wrong? (Wave 3, second Part 2 chapter)

- **Authored 2026-08-20 · not committed · working tree on
  `feature/report-a-bug`** (no branch cut - the `/chapter-author draft` pass
  never commits or branches; the user reviews the uncommitted diff and decides
  where it lands)
- Definition id `bb-2-2-where-can-things-go-wrong` · manifest slug
  `2-2-where-can-things-go-wrong` (`chapterDefinitionId` repointed from `null`)
- Type: Concept · foundational · 20 min · prerequisite
  `2-1-from-browser-to-backend`
- **Lesson length: 2230 words** prose (2573 including the `<Walkthrough>` prop
  block), of which 258 words are table cells
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-2-2-where-can-things-go-wrong.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-2-2-where-can-things-go-wrong.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 2.1 and 3.4) |
| 4 | Validation rules | None new, none needed. `validationRuleIds: []` - no graph to validate |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (matching, single ×4) |
| 6 | Playtest pass | Spec §9 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line `chapterDefinitionId`
repoint) and `index.ts`'s file-header comment, which named 2.1 as the end of
authored Part 2 content and now reads "Part 2 through
`bb-2-2-where-can-things-go-wrong`".

**Judgment calls made:**

- **The `<Walkthrough>` reuses 2.1's exact topology, deliberately.** §7.2's
  draw-a-topology-once rule is per-chapter, and this chapter contains exactly
  one diagram. Reusing 2.1's picture is the chapter's thesis made visible - the
  map you just built is also a map of failure - and the lesson says so in its
  own prose rather than leaving the repetition unexplained.
- **The failure-diagram rule was worked around, not met.** §7.2 requires a
  failure diagram to show the failure (crossed-out node, red path).
  `<Walkthrough>` has no faulted state: `WalkthroughStep` offers only
  `focus`/`highlightNodeIds`/`highlightEdgeIds` and `WalkthroughNodeCard` has
  no fault variant (checked directly, not assumed). Compensated by inverting
  the highlight semantics - each step lights only the segment the request
  actually traversed, so the break is where the lit path stops and the dark
  remainder is exactly the stops that never hear about it - and by naming that
  convention in the diagram caption. Full reasoning in spec §5. **Raised as
  open decision 14 below**; this is an engine gap found by content, same class
  as decisions 3 and 8, not a content decision.
- **Beats 9 and 10 merged into one "Partly down" section rather than beat 10
  being declared omitted.** §6 permits merging adjacent sections. 2.1 declared
  both omitted (correctly, since 2.2 and 2.3 owned them); this chapter owns
  beat 9 outright and pays beat 10 with a real §9 lens 7 answer (at one server
  up and down are the only states; at a hundred something is always broken and
  the question becomes what fraction, for which users). 2.3 still owns the
  scaling-*evolution* story, which is a different claim.
- **Interview relevance treated as High** per §14's row, so the interview lens
  is fuller than 2.1's Medium one: what step 6's standard question is testing,
  the weak answer, the three-part shape of a strong one, then §10.3's mandatory
  senior line.
- **§19's "name which RWE projects exercise this material" declared as an
  omission** rather than skipped silently the way 2.1 skipped it. No RWE
  project is authored, so naming one is a forward reference to content that
  does not exist.
- **Bank Q10 deliberately not authored as a quiz question.** QUIZ_FRAMEWORK §7
  tags four bank questions to 2.2 (Q3, Q4, Q6, Q10) and three are used. Q10
  ranks four items with one obvious answer, which §1's reasoning-over-recall
  rule makes weak; its insight is carried by the "How long to wait" trade-off
  and by Q1's fourth option instead. Recorded in spec §8 so a later author does
  not read the gap as an oversight.
- **Q2's difficulty lowered from the bank's 2 to 1.** Within 2.2 the DNS
  outage is the chapter's own opening scene rather than a cross-part inference,
  and the ramp needs two level-1 questions to match the 0.2/0.3/0.4/2.1
  convention.
- **Cross-chapter answer-position check done by eye**, per the chapter-author
  skill's note that `quiz-invariants.test.ts` is per-chapter only: 0.4, 1.3,
  1.4 and 3.4 all open at "b" and 2.1 deliberately opened at "c", so this
  chapter's first lettered question opens at "d". Full spread d/b/a/c across
  the four lettered questions. Q1's `options` are a full derangement against
  its `pairs`.
- **2.1's "walks this exact path again, backwards" read as failure-first, not
  reverse-order.** The same sentence's next clause names DNS - the *first*
  stop - as where 2.2 starts, and §14 phrases it as "revisit the same journey
  failure-first". The chapter walks forward from DNS. No edit made to 2.1; only
  the one word is loose and both readings of the sentence point the same way
  once the next clause is included. Recorded in spec §10.
- **The error / hang / disagreement taxonomy is invented for this chapter** and
  declared in `curriculumContext.simplifications`. It is used in the beat-6
  table, the recap, and Q1's option set, so renaming it later is a four-place
  edit.
- **Both production examples are real incidents** (Meta October 2021, GitHub
  October 2018), stated at decision level from public postmortem material per
  §13. Flagged for the Opus pass to check for factual drift, especially the
  43-second and six-hour figures - the argument does not depend on either
  number being exact.

**Wave ordering note:** unchanged from 2.1's entry. `pending-content.md` puts
Part 2 in Wave 3 and Wave 2 is still incomplete (RWE Tier 1 Bitly is still the
`rwe-dummy-1` placeholder). Authored anyway on explicit user request, flagged
rather than silently ignored.

**Opus proofread pass: not yet run.** Spec §11 lists five things worth a cold
reader's attention, the material ones being the word count (~24% above 2.1 for
the same 20-minute estimate), whether "How long until you find out" is
over-depth at three sub-points, and whether the failure-diagram workaround
reads as a genuine failure visualization or as the happy path with a
disclaimer.

---

## 2.3 Evolution of Modern Architectures (Wave 3, third Part 2 chapter - Part 2 complete)

- **Authored 2026-08-22 · not committed · working tree on `fix/streak-counter`**
  (no branch cut - the `/chapter-author draft` pass never commits or branches;
  the user reviews the uncommitted diff and decides where it lands)
- Definition id `bb-2-3-evolution-of-modern-architectures` · manifest slug
  `2-3-evolution-of-modern-architectures` (`chapterDefinitionId` repointed from
  `null`)
- Type: Concept · foundational · 20 min · prerequisite
  `2-2-where-can-things-go-wrong`
- **Lesson length: 2250 words** prose (2321 including the four Mermaid blocks),
  of which ~150 words are table cells
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-2-3-evolution-of-modern-architectures.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-2-3-evolution-of-modern-architectures.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 2.2 and 3.4) |
| 4 | Validation rules | None new, none needed. `validationRuleIds: []` - no graph to validate |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (ordering, single ×4) |
| 6 | Playtest pass | Spec §9 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line `chapterDefinitionId`
repoint) and `index.ts`'s file-header comment, which named 2.2 as the end of
authored Part 2 content and now reads "Part 2 (`bb-2-1-from-browser-to-backend`
through `bb-2-3-evolution-of-modern-architectures`, complete)".

**Judgment calls made:**

- **Four Mermaid stage diagrams, not a `<Walkthrough>` - a capability limit,
  not a preference.** Both sibling Part 2 chapters use `<Walkthrough>`, so the
  divergence needs a reason. Checked directly against
  `src/chapters/walkthrough/types.ts`: `WalkthroughProps` takes one fixed
  `nodes`/`edges` set and a step can only highlight within it, so a node cannot
  not-yet-exist on an early step. A walkthrough here would render the final
  services topology on step one, dimmed - showing the destination before the
  first pressure is felt, which §7.2 ("never open with the final 12-node
  architecture") and §20.4 (manufacture the problem first) both forbid. 2.2's
  inverted-highlight workaround does not transfer either: these are four
  genuinely different topologies, not one topology examined at four points.
  §7.1's own inventory names "Scaling evolution (v1 -> v2 -> v3)" with typical
  home **2.3**, and §8.6 asks for it as 2-4 evolutionary diagrams. Full
  reasoning in spec §5.
- **Third live instance of open decision 3's Mermaid-as-topology exception.**
  The Reader still cannot render graph JSON. Cited precedent is **1.2** (whose
  three-box `flowchart LR` is shipped), not the retired 1.6 - and 3.4 is no
  longer a Mermaid precedent either, since its diagram is a `<Walkthrough>`.
  Applied with 1.6's own lesson learned: each caption describes only its own
  diagram, none generalizes about edge kinds, and edge labels carry the real
  `request-flow` kind.
- **The group table pre-commits a motivating pressure for all seven Part 3
  groups.** Inherent to §14's purpose line for this chapter ("so Part 3's
  sequence reads as one system growing rather than a parts catalog"), but it is
  a real constraint on twenty-six unwritten chapters. Each row was written
  against §14's group briefs. **Raised as open decision 15 below** - same class
  as decision 12 (2.1's stop table), one level up.
- **§14's arrow has no data-tier stop; the chapter adds one without adding a
  fifth shape.** The row reads "one server -> tiers -> horizontal scale ->
  services", but a real system relieves the database before it splits the
  application. Resolved by naming that move where it actually happens ("Where
  the ceiling went", immediately after shape three) and handing the mechanism to
  3.12/3.13/3.14 rather than authoring a fifth shape. Keeps §14's four states
  intact and does not spend Groups C and D's material. Recorded in spec §10.
- **Beats 9 and 10 both distributed rather than sectioned, and declared.** Both
  optional for Concept. Failure modes are paid in every shape's "Spends" line
  (a section would either duplicate 2.2 or bury the point that new failure modes
  are part of a move's price); scaling behavior *is* the chapter's spine, so a
  "scaling considerations" section would restate it. Spec §4.
- **Monolith/services glossed inline, deliberately, as general engineering
  vocabulary.** Neither term has a home chapter in §16 or §14, so per the
  chapter-author writing register it gets a one-clause gloss at first use rather
  than a marked forward tease. Quiz Q5 depends on the learner having it, and Q5
  is bank §7 Q8, which uses both words.
- **Bank Q7's and Q8's distractors rewritten wholesale.** As written the bank
  offers "big machines stopped being manufactured", "fashion", "programming
  languages required it" and "microservices are always wrong" - joke options
  that QUIZ_FRAMEWORK §1 rule 3 forbids. Replaced with real positions a
  reasonable engineer might hold (scaling up is obsolete on price; splitting is
  a latency win; more machines is more availability by construction; migrating
  later costs more than starting split). Q7's level lowered from 2 to 1, same
  reasoning 2.2 used for its own bank borrow: inside the owning chapter it is
  comprehension, not cross-part inference, and the ramp needs two level-1s.
- **§12 nugget devices omitted and declared** (spec §4). Sixth chapter to omit,
  fifth to declare. See open decision 5, overdue - this entry is a pointer, not
  a fresh argument.
- **§19's "name which RWE projects exercise this material" declared as an
  omission**, unchanged from 2.2: no RWE project is authored.
- **Cross-chapter answer-position check done by eye**, per the chapter-author
  skill's note that `quiz-invariants.test.ts` is per-chapter only: 0.4, 1.3, 1.4
  and 3.4 open at "b", 2.1 at "c", 2.2 at "d", so this chapter's first lettered
  question opens at "a". Full spread a/c/d/b across the four lettered questions,
  and the set of four distinct chapter-opening positions is now complete. Q1's
  `options` are a full derangement against `correctOrder`.
- **Both production examples are real and public** (Stack Overflow's small-fleet
  monolith; Amazon's early-2000s services split), stated at decision level per
  §13 with no figures the argument depends on - a deliberate response to 2.2's
  flag about the 43-second and six-hour numbers.

**Wave ordering note:** unchanged from 2.1 and 2.2. `pending-content.md` puts
Part 2 in Wave 3 and Wave 2 is still incomplete (RWE Tier 1 Bitly is still the
`rwe-dummy-1` placeholder). Authored anyway on explicit user request, flagged
rather than silently ignored. **Part 2 is now complete** (2.1, 2.2, 2.3), which
makes Group A the next real content in curriculum order - and open decisions 9,
12, 13 and 15 all come due there.

**Opus proofread pass: not yet run.** Spec §11 lists five things worth a cold
reader's attention, the material ones being the four-Mermaid decision, the group
table's claims about seven unwritten groups, and whether the prose earns
"compute copies for free" or leans on the `simplifications` disclaimer.

---

## 1.1 Understanding the Problem (superseded by Phase 10's new 1.1 above - prose kept as source-material record; spec/lesson files removed 2026-08-16)

- **Authored 2026-08-08 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (cut from
  `release/v4.1.0-part-1-curriculum`, itself cut from `develop`).
- Definition id `bb-1-1-understanding-the-problem` · manifest slug
  `1-1-understanding-the-problem`
- Type: Process · foundational · 20 min (Reader + knowledge check, no build -
  see below) · prerequisite: 0.4
- **Lesson length: 1063 words**, against 0.4's 1085-word pre-pass draft for a
  15-minute estimate - proportionately fuller for the 5 extra minutes, not
  padded (§20.6's own test; no Opus pass has run yet to confirm this
  independently).
- Pipeline green at this revision: typecheck, lint, 1570 tests, build (one
  pre-existing test, `src/content/chapters/index.test.ts`'s hardcoded chapter-
  id list, updated to include the new id - not a new test, a registry-wiring
  fixture every new chapter has to touch).

**Wave-gate check before drafting (2026-08-08).** `pending-content.md`'s wave
rule ("do not start a wave until the previous wave's chapters are merged")
was checked and found satisfied only after a `git fetch`: local branches were
stale and made it look unmet, but `origin/develop` and `origin/main` both
already contain Wave 1 (`e3a4074`) via PR #87/#88. Confirmed with the user
before proceeding. See the "Wave 1 progress" line above.

**Branch cleanup, same session (user-directed).** All branches other than
`main`/`develop` (`feature/content-0-1-welcome`, `feature/guided-tour-track-a`,
`fix/tour-highlight-clipping`, `release/v4.0.0-guided-tour-and-curriculum`)
were confirmed fully merged into `develop` and deleted, locally and on
`origin`. `release/v4.1.0-part-1-curriculum` was then cut from `develop` for
this wave, version bumped to `4.1.0-alpha` (`VERSION`, `package.json`) plus a
new `.claude/docs/ScaleCraft_Future_Roadmap.md` on a separate
`chore/version-4.1.0-and-roadmap` branch (also cut from the release branch,
uncommitted to `feature/content-1-1-understanding-the-problem` - the two
branches are independent, per repo convention, and both still need pushing
and review).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-1-understanding-the-problem.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-1-understanding-the-problem.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use `multi` as its primary/exercise-standing-in question |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged exercise CURRICULUM §14 specifies for 1.1 does not exist as
  built UI and was degraded to a quiz question, per `pending-content.md`'s
  own documented plan for Part 1 ("stages UI does not exist... a small non-
  staged exercise where honest"), not an improvisation.** The row's exact
  wording: "given a vague brief, pick the 4 highest-value clarifying
  questions from 10; feedback explains what each answer would change."
  Realized as quiz Q1: `multi` kind, 8 candidate questions (not 10) about a
  URL shortener, 4 correct, every option carrying its own `explanationMd`.
  Flagged in spec §5 and §12 as the first candidate to receive its originally
  -specified staged exercise once the stages UI lands (which is itself one of
  Wave 2's stated triggers in `pending-content.md`).
- **Practical objective included, not carved out.** §5.2's Practical
  exception is explicitly scoped to "pure Concept chapters" - 1.1 is Process
  type, so the carve-out 0.2/0.3/0.4 used doesn't literally apply here. Wrote
  a Practical objective honestly tied to the quiz-realized exercise above
  (spec §2) instead of silently reusing the Concept-chapter exception on a
  chapter it wasn't written for.
- **Production examples (optional for Process, unlike Concept where it's
  mandatory) omitted with written justification**, not silently dropped: the
  natural production-register example for "state scope and goals before
  designing" is 0.4's own Google-design-doc / Amazon-6-pager section,
  already shipped. A second telling of the same point would be restatement,
  which §20.6 cuts on sight; no distinct, load-bearing public example of
  *clarifying questions specifically* was found that wouldn't just repeat
  0.4's point in different clothes. Spec §4 flags this for a second reader
  rather than asserting it's settled.
- **Failure modes and scaling - omitted**, both optional for Process (§6),
  same reasoning 0.4 used for Concept: no system exists yet to fail or scale,
  only a step in a design conversation.
- **No everyday analogy in the mental-model beat** - same choice 0.3 and 0.4
  made, for the same reason: the test itself ("would a different answer
  change the design") is already the clearest available frame; a forced
  comparison would be decorative.
- **New Mermaid diagram shape: a two-branch decision tree**, not a process-
  flow sequence like 0.4's loop diagram. First use of the "Decision tree"
  entry from CURRICULUM §7.1's diagram inventory (previously unused across
  0.1-0.4). Still Mermaid, not ScaleCraft graph JSON - open decision 3 below
  is unaffected (no topology exists yet to render as a graph).
- **Backward connections: 2 named explicitly (0.2, 0.4), meeting §19's >=2**,
  plus 0.2's cache/read-replica material reused substantively in "What a good
  question actually does" (the deliberate double-appearance pattern 0.3/0.4
  established: use it in the body, name the chapter again in "Next").
- **Quiz Q1 reuses QUIZ_FRAMEWORK.md §6's own Q1 scenario (URL shortener,
  multi-select clarifying questions) rather than inventing a fresh product**,
  both for continuity with the bank and because it's also standing in for the
  staged exercise (above) - expanded from the bank's 4 options to 8 so the
  "pick from many candidates" shape survives the degradation. Not a verbatim
  copy: all 8 options, explanations, and 4 correct answers are original to
  this chapter.
- **Position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. Four single-kind questions (Q2/Q3/Q4/Q5) have
  correct options at c/a/d/b - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, then two small cuts made during self-
  review (a closing meta-sentence in "What a good question actually does",
  two non-"not just X" uses of "just" reworded per §20.1). Flagged here per
  0.2/0.3/0.4's own precedent of flagging a self-assessed density claim for
  the next reviewer to check rather than trusting it.

**Opus proofread pass (2026-08-08, uncommitted).** Scope: content,
content-structure, blueprints, component lists, submit validations, diagrams.
Quiz, hints, and `problemStatement`/`learningObjectives`/`curriculumContext`
were explicitly out of scope and untouched. `lessonVersion` 1 -> 2. Lesson
1063 -> 1153 words. Full detail in spec §13.

*Four accuracy fixes, all in prerequisite-chapter material:*

- **The cache/read-replica claim was wrong, as the user suspected.** Draft:
  "a 1000:1 read:write ratio makes 0.2's cache and read replica close to
  mandatory." 0.2 teaches those two as *competing* diagnoses on different
  axes - "a cache helps when the same rows are read over and over: it buys
  latency, and cost. A read replica helps when the database is simply out of
  read capacity: it buys throughput" - not a pair that both get more
  mandatory as read skew rises. A bare ratio proves neither repeated-row
  reuse nor absolute read volume (1000:1 at ten requests a day needs
  neither), so it cannot make either mandatory. Rewritten: the ratio decides
  which *path* the design work goes into, and a new second paragraph states
  what it explicitly does not settle. The correction improves the beat rather
  than patching it - beat 7's "one level down" is now the real locality-vs-
  volume distinction, and it earns the word *part* in "collapses part of the
  design space". A milder form of the same conflation in the cold open
  ("almost all reads wants caching and read replicas up front") was fixed the
  same way.
- **"0.4's ~5-10 minutes of 45" was invented.** 0.4 never states a clarify
  budget; ~45 minutes is 0.3's figure. Re-derived from taught material (0.3's
  ~45 minutes over 0.4's eight steps) and the "couple of minutes" figure is
  now owned by this chapter instead of misattributed. Side effect: 0.3 is now
  a third named backward connection.
- **"0.4's dotted arrow starts right here" was wrong.** 0.4's diagram is
  `H -.-> B` - step 8 to step 2, so it neither starts nor ends at clarify.
  Reworded to 0.4's actual "How far back to go" teaching.
- **"What database should I use? - nothing about the design changes"** is
  false in the curriculum's own terms; 3.11 is SQL vs. NoSQL. Reframed to the
  reason that actually holds and survives 3.11: it isn't a fact about the
  problem, it's a decision that's yours to make. The matching "Common
  mistakes" bullet was aligned.

*Diagram.* Two Mermaid node labels used `\n` for line breaks. Mermaid
documents `<br/>`, not `\n`, and this renderer runs `securityLevel: "strict"`;
no other chapter uses either form. Labels shortened so no break is needed -
removes the risk without betting on unverified renderer behavior. Caption and
branch accuracy were already fine.

*Voice/density (the user's other flag).* Five over-built sentences shortened
or split (cold-open payoff, "Where to look" opener, the category caveat, the
"In an interview" opening move, the senior-answer tag line). One §20.6
restatement cut: beat 7's closing "One answer, and an entire branch of the
design either becomes central or drops out" repeated its own topic sentence.

*Confirmed, not changed.* `blueprints`, `availableComponentIds`,
`requiredComponentIds`, `validationRuleIds` all correctly `[]` per §16 (three
primitives home at 1.6, no graph to validate). §5.3/§6 structure complete for
Process type with no reordering. Manifest order verified: 1.2 is next, 1.6 is
the first build - both references correct. **Production examples omission
confirmed**, and not by deferring to the draft's own argument: §13 requires
*who / why / when it applies / what trade-off*, and no public example of
clarifying-questions-specifically clears that bar without collapsing back into
"state goals before designing", which 0.4 already shipped (Google design docs,
Amazon 6-pager).

*New open notes (not acted on):*

- **Part 1 may end up with no production register at all.** 1.1's Production-
  examples omission is individually correct, but if 1.2-1.5 each reach the
  same conclusion for the same reason, Part 1 ships without the production
  half of §1.5's two registers. Decide this deliberately at 1.3 or 1.4, not
  by four independent omissions.
- **Quiz Q5 and `hints[1]` carry the same overclaims the lesson just lost**
  (out of scope for this pass, flagged for the quiz/hints owner). Q5's correct
  option b says the ratio "decides whether caching and a read replica are
  worth the added complexity" and its explanation calls a heavy read skew
  "exactly the signal 0.2 used for when a cache pays for itself" - 0.2's
  signal was repeated reads of the same rows, not skew. `hints[1]` says
  database choice "doesn't change the shape of the architecture", defensible
  at Part 1's three-primitive palette but contradicted by 3.11.

---

## 1.2 Functional Requirements

- **Authored 2026-08-08 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1 - no wave-gate re-check needed, this is a continuation of an
  already-started wave, not a new one).
- Definition id `bb-1-2-functional-requirements` · manifest slug
  `1-2-functional-requirements`
- Type: Process · foundational · 15 min (Reader + knowledge check, no build -
  see below) · prerequisite: 1.1
- **Lesson length: 992 words**, against 0.4's comparable pre-pass 1085 for the
  same 15-minute estimate and 1.1's 1063 for a 20-minute estimate -
  proportionate by the same ratio test 1.1's own entry used (no Opus pass has
  run yet to confirm this independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope -
  `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was updated
  to include the new id, same registry-wiring touch 1.1 needed, but `tsc`/
  `lint`/`vitest`/`build` were not run).

**Scope-target detour before drafting (2026-08-08, resolved before any file
was touched).** The user's invocation included "should be < 5 min reads" as a
parenthetical. Asked to clarify scope; the user's first answer was "all of
Part 1 (1.1-1.11) should be <5 min" as a standing policy - which would have
meant revising already-authored 1.1 (20 min/1153 words) and the manifest's
`estimatedMinutes` across eleven chapters. Before any file was touched, the
user reversed this ("I take back that 5 min rule... do as you would
normally"). This chapter was drafted against CURRICULUM §14's actual 1.2 row
(15 min) instead, matching 0.2-0.4/1.1's established density pattern. Recorded
so a future session doesn't need to re-litigate whether Part 1 has a <5-minute
target - it does not.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-2-functional-requirements.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-2-functional-requirements.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, continues 1.1's URL shortener brief for Q1 |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged checklist exercise CURRICULUM §14 specifies for 1.2 does not
  exist as built UI and was degraded to a quiz question**, the same
  documented pattern 1.1 used (`pending-content.md`'s Part 1 plan). Realized
  as quiz Q1: `multi` kind, 8 candidate features about the same URL shortener
  brief 1.1 used (now with two facts confirmed rather than left hypothetical),
  3 correct. Flagged in spec §5 and §12 as a candidate for its originally
  specified staged exercise once the stages UI lands.
- **Production examples included, reversing 1.1's omission.** 1.1's own
  ledger entry flagged a risk: if every Part 1 chapter independently omits
  production examples for defensible individual reasons, Part 1 ends up with
  no production register at all, contradicting CURRICULUM §1.5's two-registers
  framing. Basecamp's Shape Up "no-gos" practice is genuinely distinct from
  0.4's design-doc examples (cutting functional scope under a deadline, not
  stating goals broadly), clears §13's who/why/when/trade-off format in two
  sentences, and resolves the flagged risk at the first chapter where a
  non-repetitive example was available - one chapter earlier than 1.1's own
  "decide this at 1.3 or 1.4" suggestion.
- **Deliberate structural echo of 1.1's diagram.** Both chapters use a
  two-branch Mermaid decision tree testing "does a different answer/this
  feature change something load-bearing" - the same test shape, applied to
  clarifying questions in 1.1 and to feature scope here. A considered choice
  (Part 1's first two chapters share a test-shaped mental model on purpose),
  not an oversight, but flagged in spec §12 for a second reader to confirm it
  reads as reinforcement rather than repetition.
- **No further-out forward tease to 1.6.** 1.1 and 0.4 already tease 1.6 as
  the first build; §19 requires "at most one" tease per chapter, not exactly
  one, so this chapter's "Next" only previews the immediate next chapter
  (1.3). Flagged as a judgment call, not a silent omission.
- **No construction-family exercise - justified Process-chapter carry-over
  from 1.1's own precedent**, not a fresh Concept-only exception (§11.1's
  carve-out is explicitly for Concept chapters; 1.1 already established that
  Process chapters without a build state their `hasEditorExercise: false`
  reuse plainly instead of invoking §11.1). No components introduced (§16
  homes the three primitives at 1.6). `availableComponentIds`/
  `requiredComponentIds` both `[]`, `blueprints: []`, no `starterGraph`.
- **`hasEditorExercise: false` reused, not re-derived** - same mechanism 0.2's
  spec fixed and 1.1 already reused.
- **Quiz position-clustering checked by eye and corrected during drafting**
  (not just checked after the fact). The first pass of Q2-Q5 landed 3 of 4
  correct answers at position `b` - the exact clustering bug 0.1/0.2 shipped
  once and the standing instruction exists to catch. Reordered options
  (content unchanged) to `b, a, c, d` before finalizing, rather than writing
  the questions once and checking after.
- **One density cut made during drafting, not deferred to a later pass**: a
  closing sentence in "Why the write-down matters" restated the paragraph's
  own point ("The category decides what to build; only the write-down keeps a
  Could from silently becoming a Must again") - cut per the exact pattern the
  Opus pass caught once already in 1.1's beat 7 closing sentence. Flagged in
  spec §12, per 0.2/0.3/0.4/1.1's own precedent, for a reviewer to check the
  self-assessed density claim rather than trust it.

**Opus proofread pass (2026-08-08, uncommitted).** Scope: content,
content-structure, blueprints, component lists, submit validations, diagrams.
Quiz, hints, and `problemStatement`/`learningObjectives`/`curriculumContext`
were explicitly out of scope and untouched. `lessonVersion` 1 -> 2. Lesson
992 -> 1129 words. Full detail in spec §13.

Triggered by direct user feedback on the draft: *"the chapter feels dragged
out, the In production section is just un-understandable. a more jarring
chapter for some reason I didn't really get a clear picture out of this
chapter."* All three reproduced on a fresh read; all three had real causes.
This was not a rubber-stamp pass - the draft had a structural defect, not a
line-edit one.

*Complaint 1, "dragged out" - the cause was restatement, not length.* The
chapter's one idea appeared six times before doing any new work: the cold
open's closing sentence, the think-first prompt, "The test"'s opening line,
the diagram, the diagram caption, and the MoSCoW table's first row. §20.6's
first cut-on-sight item names exactly this. The load-bearing fix: the cold
open ended on "Not everything that occurs to you is a requirement - only what
the system cannot ship without", which is the chapter thesis stated one line
before a think-first prompt that asks the reader to derive it - a §5.3 beat-3
violation (the prediction prompt must precede any revealed answer). Cold open
now ends on the felt cost instead. Two related bugs in the same beat: it said
"Five features in" over a list of seven, and "the interview's design time is
already gone" was an overclaim (listing seven features costs under a minute).
The think-first prompt was also unanswerable as written - it asked which *one*
feature to keep, when the chapter's own answer is two (create and redirect).
Word count went *up* ~140, which is the honest outcome: the drag was
redundancy, and cutting it freed room for the diagram and the production
example to carry real content.

*Complaint 2, "In production is un-understandable" - rewritten, not cut.* Read
cold by someone who has never heard of Shape Up, the draft assumed the entire
frame: *Shape Up*, *six-week*, *pitch* and *mid-cycle* all used without
introduction, and a trade-off sentence that was a comparative between two
abstractions ("naming them protects the deadline more than including them
would help the release"). §13's *when it applies to you* leg was missing
outright. **The Basecamp claim itself was verified as accurate**, not accepted
from the draft - fixed six-week cycles, work shaped into a written pitch
before it is bet on, "no-gos" a named ingredient of that pitch for
functionality deliberately excluded to fit the fixed appetite. So the example
was sound and only its telling was broken; it was kept and rewritten to
introduce the cycle and the pitch before using them, state the mechanism
plainly, carry the when-it-applies leg, and end on the cost. **1.1's flagged
"Part 1 may ship with no production register" risk therefore stays resolved.**

*Complaint 3, "jarring / no clear picture" - two structural causes, both
fixed.* (a) The chapter taught **two** mental models and left the reader to
stitch them: "The test" gave a binary Must/not-Must decision tree, then
"Sorting the list" introduced a four-bucket scheme the diagram never mentioned.
The primary diagram is now a three-question router with four leaves, so the
test *is* the sort and the MoSCoW table names outcomes already seen. That also
adds an idea the draft lacked - Could versus Won't is a call about this pass's
capacity, not a property of the feature - which makes the write-down section
follow rather than arrive. (b) **"In production" was out of §5.3's beat
order**, sitting between beat 7 and beat 8; §5.3/§20.3 permit merging adjacent
sections but not reordering. Moved after "Must, or just useful?", restoring
7 -> 8 -> 11 -> 12 -> 13.

*On the draft's flagged diagram echo of 1.1: it was contributing to the
retread feeling, and it is gone.* Two consecutive chapters opening with a
section titled "The test", the same URL-shortener interview cast, and a
two-node yes/no tree with the branches relabelled reads as a re-run of 1.1.
The reinforcement argument would have held if the second diagram carried new
information; it did not - it restated the sentence directly above it. The
four-outcome router stays inside §7.1's "Decision tree" family while doing
work 1.1's diagram did not. **Standing note for 1.3-1.5: shared structure
across Part 1 is only reinforcement when the repeated element carries new
content. A repeated diagram shape whose only change is the labels is a
retread, and the reader feels it before they can name it.**

*Smaller content fixes.* The expiry justification now closes the loop with the
test (the confirmed answer changed what the job *is*) instead of reading as an
exception to it; a garden-path sentence in "Must, or just useful?" was split;
"In an interview" moved to second person and shortened; the weakest "Common
mistakes" bullet ("building Could-have before Must-have is solid" - no
explanation, no new information) was replaced with sorting by product category
instead of by the brief, which is what quiz Q3/Q4 actually test.

*Confirmed, not changed.* `blueprints`, `availableComponentIds`,
`requiredComponentIds`, `validationRuleIds` all correctly `[]` - §16 homes the
three primitives at 1.6, this chapter introduces none, there is no
`starterGraph` and no graph to validate, so there is nothing for a blueprint
or a rule to gate. §5.3/§6 coverage complete for Process type after the
reorder; failure modes and scaling stay omitted with their written §4
justification. Manifest checked: `1-3-non-functional-requirements` really is
next, so "Next" names the right chapter. No untaught vocabulary (§18.2 rule 1)
- "non-functional" never appears, MoSCoW is defined at first use, no component
names. Backward connections still >= 2. No further-out forward tease - the
draft's judgment call stands (§19 says "at most one"; 1.1 and 0.4 both already
tease 1.6).

*New open notes (not acted on):*

- **`hints[2]` duplicates the lesson's beat-7 sentence almost verbatim**
  ("Should, Could, and Won't aren't 'no' - they're 'not this pass'"). Fine for
  a hint, flagged for the hints owner rather than changed (out of scope).
- **Quiz Q1 option f** ("Should, not Must" for malformed-URL rejection) now
  lines up exactly with the diagram's second branch - noted so a quiz owner
  knows the alignment is deliberate, not coincidence.
- **Pipeline not run this pass** (content-only scope). The chapter still needs
  `typecheck`/`lint`/`vitest`/`build` before commit, same as 1.1.

---

## 1.3 Non-functional Requirements

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1/1.2 - no wave-gate re-check needed, this is a continuation of
  an already-started wave, not a new one).
- Definition id `bb-1-3-non-functional-requirements` · manifest slug
  `1-3-non-functional-requirements`
- Type: Process (a real §4-vs-§14 contradiction was found and resolved in
  favor of §14 - see the chapter spec's §0 and the open decision below) ·
  foundational · 20 minutes (Reader + knowledge check; no build) ·
  prerequisite: 1.2
- **Lesson length: 1043 words**, against 1.1's comparable pre-pass 1063 for
  the same 20-minute estimate (no Opus pass has run yet to confirm this
  independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope -
  `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1/1.2 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Type contradiction found and resolved (2026-08-09, doc-only, see spec §0).**
CURRICULUM §4's chapter-types table lists 1.3 as a worked example of the
**Concept** type, but §14's Part 1 section header states unambiguously that
the whole part (1.1-1.11) is Process type, with no per-chapter exception
named. Resolved as **Process**, by the same precedent open decision 4 below
already set (§14 wins when it conflicts with another section) and for
consistency with 1.1/1.2, both already authored as Process on this branch.
Flagged as a new item under "Open decisions" below - §4's example list should
drop "1.3."

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-3-non-functional-requirements.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-3-non-functional-requirements.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter whose §14-specified exercise (a matching question) needed no stages-UI degradation |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The exercise is not a degradation, unlike 1.1/1.2.** CURRICULUM §14's own
  1.3 row - "match NFRs to three described products; explanation per match" -
  was never described as "staged," and QUIZ_FRAMEWORK §2's format table names
  exactly this use case for `matching`. Realized directly as quiz Q1 (3
  pairs, no stages-UI gap to flag). The first Part 1 chapter where the
  §14-specified exercise is achievable as authored rather than a documented
  substitute for missing UI.
- **Production examples included** (Amazon S3's own published
  99.999999999%-durability / 99.9%-availability numbers), continuing 1.2's
  resolution of 1.1's flagged "Part 1 may ship with no production register"
  risk. Chosen specifically because it reinforces 0.2's durability/
  availability distinction with real public figures rather than restating it
  in the abstract - a distinct contribution, not a repeat of 1.2's Basecamp
  example.
- **New diagram shape, not a retread.** The primary diagram is a fan-out
  mapping (each of 0.2's five forces to the shape of number it becomes), not
  a yes/no decision tree - deliberately different from 1.1's and 1.2's
  diagrams, per the standing note 1.2's Opus pass left in this ledger:
  "shared structure across Part 1 is only reinforcement when the repeated
  element carries new content." Flagged in spec §12 for a second reader to
  confirm it reads as genuinely new rather than merely differently labeled.
- **Quiz Q1 (matching) deliberately avoids 0.2's own Q3 domains** (a bank
  ledger, a hospital alert, a checkout flash sale, autocomplete, a weekly
  report) - three fresh products (ride-hailing driver-match, a hospital MRI
  archive, a conference Q&A app's up-vote spike) reuse the matching *shape*
  0.2 already validated while using numeric NFR statements as the options
  instead of bare force names, since this chapter's whole point is the
  number, not the force name alone.
- **Forward tease to 1.4, not 1.6.** 1.1 and 0.4 already tease 1.6 as the
  first build; per §19's "at most one," 1.3 previews 1.4 instead (numbers
  feed estimation) - the first Part 1 chapter to tease something other than
  1.6, consistent with 1.2's own judgment call not to repeat a third
  mechanical 1.6 tease.
- **Discovered-and-fixed cross-chapter defect in 1.2, not 1.3's own content.**
  1.2's "Next" section (drafted 2026-08-08) said 1.3 would cover "how fast,
  how available, how consistent." Open decision 4 below was resolved
  2026-08-09 - after 1.2 was drafted - in favor of §14's throughput-inclusive,
  consistency-excluded five forces. Since 1.2 is still uncommitted, the
  stale word was corrected to "how durable" in this same session, so 1.2's
  own forward tease doesn't contradict what 1.3 actually teaches. See spec
  §12.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged here per 0.2/0.3/0.4/1.1/1.2's
  own precedent of flagging a self-assessed density claim for the next
  reviewer to check rather than trust.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Four single-kind questions (Q2/Q3/Q4/Q5) have correct
options at b/c/a/d - four distinct positions.

**Opus proofread pass (2026-08-09).** Scope: lesson body, content-structure,
blueprints, component lists, validation rules, diagrams. Quiz, hints and
definition metadata were out of scope and untouched. `lessonVersion` 1 -> 2.
Full breakdown in the spec's new §13; summary:

- **Confirmed and left alone:** the Process resolution actually holds in the
  shipped text (Practical objective present, failure-modes/scaling omitted
  with written justification, production examples present); the diagram-
  novelty claim is true on inspection (1.1 = one yes/no branch, 1.2 = a
  three-question router, 1.3 = five parallel one-hop mappings with no
  decision node, and distinct from 0.2's one-root fan-out too); all four
  in-scope definition fields are correctly empty (no `starterGraph` and no
  components means nothing for a blueprint to describe, §16 needs no
  exception without a canvas, no graph exists to validate); the
  nines-to-downtime figures are arithmetically right on a 365.25-day year;
  "Next" names 1.4, which the manifest confirms, with no further-out tease;
  "QPS" needs no gloss because 0.4 already defined it.
- **Nine changes, all content-side.** The material one: **the primary
  diagram and the core-mechanics table stated the same force-to-number-shape
  mapping twice**, six lines apart - a §20.6 violation the draft's
  self-flagged "no distinct density pass was run" had let through. The
  table's middle column was cut (diagram keeps the shapes, table keeps the
  worked examples); the two nuances only the column carried were preserved.
  Same collision 0.2 hit and resolved in the opposite direction, because
  there the diagram was expendable and here it is the mandatory beat-5
  visual.
- The other eight: p99 used before being defined (nothing in 0.1-1.2
  introduces it, so §20.1's define-at-first-use applies); a bridge sentence
  claiming availability "compounds the same way" as latency percentiles,
  which is not a real mechanism; "buys back roughly 10x less downtime"
  (body + recap), which reads as a worse deal on a careful pass; the senior
  interview line saying "a fifth nine" while standing at 99.9%, where the
  next purchase is the fourth and is exactly what the trade-offs section
  just priced; S3's bare "99.9% availability", now labelled as its
  service-agreement figure since AWS also publishes a designed-for-99.99%
  number; a missing withheld-information line in "Your turn" that spec §3
  claimed was there and 1.1/1.2 both carry; a cold-open stage direction;
  and "provable" -> "defensible" in the 1.4 tease.
- **Lesson length after the pass: 1036 words** (1048 before, by the same
  `wc -w`; the entry above's 1043 was counted differently). Roughly flat -
  the pass traded duplicated table text for a p99 definition and a withheld-
  information line, which is the intended shape of a density pass, not a
  word-count cut.
- **New standing note for later chapters:** when a chapter's mandatory
  beat-5 visual and its beat-6 table both want to carry the same mapping,
  the visual keeps it and the table moves to worked examples. 0.2 solved
  this the other way (diagram went names-only) because its diagram was not
  load-bearing; state which side is carrying content in the spec so the
  next reader doesn't have to re-derive it.

---

## 1.4 Estimating Scale

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1/1.2/1.3 - no wave-gate re-check needed, this is a
  continuation of an already-started wave, not a new one).
- Definition id `bb-1-4-estimating-scale` · manifest slug
  `1-4-estimating-scale`
- Type: Process (CURRICULUM §4's own worked example for this type is "1.4
  Estimating Scale" itself - no contradiction to resolve here, unlike 1.3) ·
  foundational · 25 minutes (Reader + knowledge check; no build) ·
  prerequisite: 1.3
- **Lesson length: 1,106 words**, against 1.1's 1,063 and 1.3's 1,043 for
  20-minute estimates - proportionately fuller for the extra 5 minutes and
  this chapter's heavier worked-number content (no Opus pass has run yet to
  confirm this independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1/1.2/1.3
  needed, but `tsc`/`lint`/`vitest`/`build` were not run).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-4-estimating-scale.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-4-estimating-scale.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to use the `estimate` quiz kind |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **The staged estimation exercise CURRICULUM §14 specifies for 1.4 does not
  exist as built UI and was degraded to a quiz question**, the same
  documented pattern 1.1/1.2 used (`pending-content.md`'s Part 1 plan).
  Realized as quiz Q1-Q2: two `estimate`-kind questions (QUIZ_FRAMEWORK §2's
  own bucket-choice format) on a fresh product - a photo-sharing app, not
  the lesson's own URL-shortener numbers - so the check tests transfer
  rather than recall. Flagged in spec §5 and §12 as a candidate for its
  originally specified multi-step staged version once the stages UI lands.
- **First chapter to use the `estimate` quiz kind.** Verified against the
  real rendering path before relying on it: `EstimateChoice.tsx` is
  `SingleChoice` with monospaced labels, and `evaluate.ts` scores it
  identically to `single`/`diagram` (one selected option id) - no new
  interaction pattern for the learner, only bucket-style content.
- **1.1's 1000:1 read:write ratio treated as the URL shortener brief's
  confirmed real number, not just its illustrative example.** 1.1 used
  1000:1 only to demonstrate its clarifying-question test in the abstract;
  this chapter reuses that exact figure as the actual scale for the running
  case study (10 million redirects/day, 10,000 creates/day). A deliberate
  continuity choice for a unified running example across 1.1-1.4, not an
  invented fact contradicting 1.1 - flagged in spec §12 for a second reader
  to confirm it reads as intentional.
- **Diagram-shape novelty check**, per the standing note 1.2's Opus pass
  left in this ledger ("shared structure across Part 1 is only
  reinforcement when the repeated element carries new content"). 1.4's
  diagram is a branching conversion chain (requests/day -> average QPS ->
  peak QPS, and separately -> storage / bandwidth) - distinct in kind from
  1.1's yes/no tree, 1.2's three-question router, and 1.3's one-hop
  fan-out. Flagged in spec §12 for a second reader to confirm.
- **Scaling behavior (§9 lens 7) folded into "When precision earns its
  keep" as one sentence rather than given its own section.** Optional for
  Process chapters (§6), and a dedicated section would have mostly repeated
  the worked example at two more multipliers - a density choice, not a
  hidden omission. Justified in spec §4.
- **Production example: WhatsApp's per-connection capacity measurement**,
  chosen because it's directly about estimation informing an infrastructure
  decision (not a generic "this company is big" example) and pairs with the
  URL shortener's own modest numbers per §9 lens 9, rather than reading as
  "so you should do this too."
- **Backward connections: 3 named (0.4, 1.1, 1.3), exceeding §19's >=2** -
  0.4's loop step 3 is the chapter's whole organizing frame, 1.1's ratio is
  used substantively in the core-mechanics worked example and named again
  in "Next," and 1.3's NFRs open the cold open and are named again in "Your
  turn."
- **Forward tease: 1.5 only**, the immediate next chapter. No further-out
  tease to 1.6 - already teased twice (1.1, 0.4), and per §19's "at most
  one" a third would be mechanical, the same judgment call 1.2/1.3 made.
- **One density cut made during drafting, not deferred to a later pass**: a
  paragraph in "When precision earns its keep" restated the prior section's
  specific numbers ("peak QPS here, since a few hundred and a couple
  thousand aren't the same build...") before generalizing - cut down to the
  general principle plus the new 10x/1000x content once noticed, per the
  exact pattern the Opus pass caught in 1.3's diagram/table collision.
  Flagged in spec §12, per standing precedent, for a reviewer to check the
  self-assessed density claim rather than trust it.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Three single-kind questions (Q3/Q4/Q5) have correct
options at c/a/d - three distinct positions.

**Opus proofread pass (2026-08-09).** Scope: lesson body, content-structure,
blueprints, component lists, validation rules, diagrams. Quiz, hints and
definition metadata were out of scope and untouched. `lessonVersion` 1 -> 2.
Full breakdown in the spec's new §13; summary:

- **Confirmed and left alone:** every number in the lesson is
  arithmetically right (115.74 from 86,400; ~100 QPS from 10^5; 10,000
  creates/day at 1,000x rarer, 0.1 QPS; 500-1,000 peak; 3.65M records x
  500 B = 1.83 GB, "under 2 GB"; ~200 KB/s bandwidth at peak). The 1000:1
  continuity call holds - 1.1 already applies the ratio to this brief ("At
  1000:1, the read path is where the design work goes") and 1.2's cold open
  confirms "heavy read skew," so promoting it reads as a callback, not an
  invented fact; the explicit "confirmed here as the real number" clause was
  kept because it makes the promotion visible. The diagram-novelty claim is
  true on inspection (1.1 one yes/no branch, 1.2 a three-question router,
  1.3 five parallel one-hop mappings; 1.4 is the first with
  operator-labelled edges and the first to fork one source into two branches
  of different lengths). All four in-scope definition fields are correctly
  empty. Structure is complete against §5.3/§6 for Process, matching 1.3's
  shipped heading sequence exactly. Vocabulary is sourced: QPS from 0.4, p99
  from 1.3, expiry from 1.2. "Next" names 1.5, which the manifest confirms.
  No em dash anywhere (grepped, not eyeballed).
- **Nine changes, all content-side. The material one: the primary diagram
  contradicted the prose on two of its four edges.** It derived storage as
  `Requests/day x bytes per record`, but the lesson computes storage from
  *creates* (10,000/day) times a year's retention, not from the 10M
  redirects; and it derived bandwidth from average QPS while the prose
  computes it at peak. Redrawn as two branches - `Requests/day -> Average
  QPS -> Peak QPS -> Peak bandwidth` and `Requests/day -> Writes/day ->
  Storage` - with the retention window on the edge label where the prose
  applies it. §7.2's "diagram accurate to the prose" rule; the shape stayed,
  so the novelty claim above is unaffected.
- Second material one: **the caption asserted something false** - "bandwidth
  flows from the steady average, and neither one spikes the way a request
  rate does." Bandwidth is QPS x bytes per response, so it spikes exactly
  the way the request rate does, and the lesson's own next section computes
  it at peak. Replaced with what actually deserves noticing: storage is the
  only number that accumulates.
- The other seven: the §9 lens-7 sentence was hand-wavy and wrong about what
  changes at 1000x (the shortcut keeps working; the answers stop being
  trivial), now carrying real figures - ~20 GB at 10x, a couple of terabytes
  and near a million peak QPS at 1000x; **"Your turn" promised buckets for
  "QPS, storage, and bandwidth" when the quiz asks only two** (Q1 QPS, Q2
  storage - the lesson was the wrong side, and the quiz was left untouched);
  a contentless transitional sentence in the trade-offs section cut per
  §20.6; WhatsApp's "millions of connections" made concrete as "past two
  million," the published figure; "still a couple of gigabytes" -> "still
  gigabytes, not terabytes" (halving 500 B gives ~0.9 GB); 10,000 creates/day
  now stated explicitly so the 3.65M-record step is traceable; and the
  mental-model sentence realigned with the corrected diagram.
- **Lesson length after the pass: 1,136 words** (1,106 before, same `wc -w`).
  Up slightly - a diagram node, an explicit creates/day figure and three real
  numbers in the scaling sentence, against one cut sentence. §12's density
  claim holds; nothing found was padding.
- **New standing note for later chapters:** when a beat-5 diagram encodes a
  formula, check every edge label against the arithmetic the prose actually
  performs, not against the concept the diagram illustrates. Both defects
  here were plausible-looking simplifications ("storage comes from traffic",
  "bandwidth comes from the average rate") that the chapter's own worked
  numbers contradicted six lines later. 1.5 and 1.7 onward are formula-heavy
  and will hit the same trap.
- **Noted, not touched (out of scope):** `learningObjectives` #4 still reads
  "QPS, storage, and bandwidth" and `problemStatement` says "each output in
  turn," both written against the three-bucket exercise the quiz doesn't
  contain. Harmless as objective statements, but if the quiz ever gains a
  bandwidth question, or if a later pass tightens the objective, these two
  fields and "Your turn" should be reconciled together.

---

## 1.5 Numbers Every Engineer Should Know

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1-1.4 - no wave-gate re-check needed, this is a continuation of
  an already-started wave, not a new one).
- Definition id `bb-1-5-numbers-every-engineer-should-know` · manifest slug
  `1-5-numbers-every-engineer-should-know` (`chapterDefinitionId` flipped
  from `null` to this id in the same pass)
- Type: Process (§14's Part 1 header names no per-chapter exception for 1.5;
  no §4/§14 contradiction to resolve here, unlike 1.3) · foundational · 20
  minutes (Reader + knowledge check; no build) · prerequisite: 1.4
- **Lesson length: 1,185 words at draft, 1,226 after the Opus pass**, above
  1.1's comparable 1,063 and 1.3's 1,043 for the same 20-minute estimate,
  closer to 1.4's 1,106 for 25 minutes (the Opus pass confirmed the length is
  the second visual element, not restatement - see its subsection below).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1-1.4 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-5-numbers-every-engineer-should-know.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-5-numbers-every-engineer-should-know.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §8 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to combine `ordering` and `estimate` kinds in the same quiz |
| 6 | Playtest pass | Spec §10 |

**Judgment calls made:**

- **§14's "throughput/storage landmark numbers" narrowed to latency-only
  ratios.** 1.5's own §14 row asks for latency/throughput/storage landmark
  numbers, "more importantly, their ratios (RAM vs. disk vs. network; a
  datacenter round trip vs. cross-continent)." 1.4 already owns
  throughput/storage order-of-magnitude estimation; re-deriving fresh
  throughput or storage figures here would restate 1.4 rather than add to
  it, and the row's own "more importantly, their ratios" clause points
  specifically at the RAM/disk/network comparison. Narrowed the chapter to
  that latency ladder alone. Flagged in spec §11-12 for a second reader to
  confirm this reads as a defensible interpretation rather than a silent
  scope cut.
- **The exercise is not a degradation, unlike 1.1/1.2/1.4.** CURRICULUM
  §14's own 1.5 row - "Exercise: ranking + estimation drills" - is never
  described as "staged," the same distinction 1.3's spec drew for its own
  matching exercise. Realized directly as quiz Q1 (`ordering`: rank five
  operations fastest to slowest) and Q2 (`estimate`: order-of-magnitude
  latency of a two-operation request) - no stages-UI gap to flag.
- **The chapter's central teaching point is the one place the ladder is
  counter-intuitive**: a same-datacenter network round trip (~0.5-1 ms) is
  typically faster than a local disk seek (~10 ms) - engineers who assume
  "local always beats network" have it backwards. This is a real,
  well-established fact (it's the reason large-scale services put a memory
  cache between the app tier and the disk-backed database at all), not an
  invented twist for pedagogical drama. Built the whole lesson around it:
  the think-first prompt asks it directly, the diagram's caption states it,
  quiz Q1's ordering and Q3's scenario both test it.
- **Quiz ratios deliberately matched to QUIZ_FRAMEWORK §6's own already-
  shipped Q5/Q6 rather than a more commonly cited alternative figure.** Q5
  states SSD is "on the order of 10-100x slower" than RAM; some published
  latency tables put a random SSD read closer to ~1,000x a RAM reference.
  Since the framework's Q5/Q6 are pre-existing content this pass doesn't
  own, and chapter quizzes are meant to draw from or model on the section
  banks, the lesson teaches the bank's own ratio rather than introducing a
  conflicting one. Flagged in spec §12 for a second reader to confirm this
  deference is the right call.
- **New diagram shape: a single ascending ladder chain**, not branching and
  with no arithmetic operators on its edges (only ratio factors) - per the
  standing note 1.2's Opus pass left in this ledger ("shared structure
  across Part 1 is only reinforcement when the repeated element carries new
  content"). Distinct from 1.1's yes/no tree, 1.2's three-question router,
  1.3's one-hop fan-out, and 1.4's branching conversion chain. Flagged in
  spec §12 for a second reader to confirm.
- **Diagram and table deliberately carry different content**, per the
  standing note 1.3's Opus pass left about a beat-5 diagram and beat-6 table
  restating the same mapping twice. The diagram carries the ladder's shape
  and ratio jumps; the table carries a concrete worked example per rung (a
  cache hit, an uncached database row, a nearby service call, a
  spinning-disk database, a cross-region call). Flagged in spec §12 for a
  second reader to confirm these don't collide.
- **Scaling folded into "When the ratio is worth paying for" as one
  sentence**, same pattern 1.4 used for the same §9 lens-7 content:
  the ratios are physical constants that don't shift with traffic, but how
  often they're paid does, tying back to 1.4's own peak-QPS estimate.
  Optional for Process per §6, a density choice rather than a hidden
  omission.
- **No everyday analogy in the mental-model beat**, same choice
  0.3/0.4/1.1-1.4 made. A physical-distance analogy (pocket vs. warehouse)
  was drafted and cut - it would have needed its own caveat about the
  ladder's one swap, costing more words than it earned. The diagram's own
  ascending order plus its caption already carries the point.
- **Backward connections: 3 named (1.4, 0.2, 1.3), exceeding §19's >=2** -
  1.4's shortcut-vs-memorize framing organizes the whole chapter, 0.2's
  cache force is used substantively in "When the ratio is worth paying for"
  *and* named again in "Next," and 1.3's latency budgets are named in
  "Next."
- **Forward tease: 1.6 only**, the immediate next chapter. No further-out
  tease - 1.1, 0.4, and 1.4 have all already teased 1.6, and per §19's "at
  most one" a fourth would be mechanical, the same judgment call 1.2/1.3/1.4
  made for their own third-plus tease.
- **One density pass performed during drafting, not deferred**: tightened a
  vague "SSDs... built to hold far more" physics sentence into a concrete
  reason (flash cells cost more to read than a memory circuit, which is
  where the 10-100x gap comes from) once noticed, and cut a filler "just" in
  the landmark table. Flagged here per 0.2-1.4's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust - word count (1,185 for a 20-minute estimate) is above 1.1/1.3's
  ~1,050 for the same estimate, justified in spec §12 as proportionate to
  carrying two visual elements (a diagram and a worked-example table) where
  1.1-1.4 each carried one, but flagged for a second reader to confirm
  rather than trusted.

**Position-clustering checked by eye**, per the standing instruction from
0.1/0.2's shipped bug. Three single-kind questions (Q3/Q4/Q5) have correct
options at c/a/d - three distinct positions.

**Opus proofread pass (2026-08-09).** Scope: content, content-structure,
blueprints, component lists, submit validations, diagrams. Quiz, hints, and
definition metadata (`problemStatement`/`learningObjectives`/
`curriculumContext`) stayed out of scope and were not touched. `lessonVersion`
bumped 1 -> 2. Full detail in spec §13; the material points:

- **Requested off specific user feedback**, not a routine sweep: the chapter
  reads as the best-written Part 1 chapter so far, but "rung" is never
  defined and several sentences take more than one read. Both complaints were
  real.
- **"rung" was undefined and the ladder had no fixed orientation.** The word
  debuted in a section heading with no gloss anywhere, and "above" meant two
  opposite things in the same lesson: the caption's "the same-datacenter
  network hop sits above (faster than) the disk seek" (above = faster) versus
  the trade-off section's "Every rung above RAM exists because..." (above =
  slower, since RAM is the fastest rung). Fixed by defining both at first
  use - "Line the five operations up as a ladder, fastest at the top: each
  rung is one kind of operation, and each step down costs roughly 10 to 100
  times the rung above it" - and rewording every later use to that one
  orientation. Heading "What's actually at each rung" -> "Each rung, in
  practice".
- **The diagram was `flowchart LR`** while the prose called it a ladder with
  a top. Flipped to `TD`. Still a single unbranched chain with ratio-only
  edge labels, so the diagram-novelty claim is unaffected.
- **The ratio chain did not compose** - 1.4's own standing note hitting a
  second time. RAM ~100 ns, then "10-100x" to SSD, then "~10x" to a 0.5-1 ms
  datacenter round trip gives at most 100 us, not 0.5-1 ms; and the SSD node
  read "~10s of microseconds", which is 200-900x a 100 ns reference and
  contradicts the "10-100x" edge one node earlier (it also parses for a beat
  as "ten seconds"). Resolved **without** disturbing the deliberate deference
  to QUIZ_FRAMEWORK §6 Q5: the 10-100x RAM->SSD ratio is untouched, SSD
  becomes "~10 microseconds" (100x of 100 ns, top of that band, and a
  defensible modern NVMe landmark), and the SSD -> datacenter edge becomes
  "~50x". The chain now composes: 100 ns -> 10 us -> 0.5-1 ms -> 10 ms ->
  150 ms. No quiz question asserts the SSD -> datacenter ratio, so nothing
  conflicts.
- **"RAM is electrical - a few nanoseconds" contradicted the table's ~100 ns**
  two lines above it. Fixed as part of splitting the five-sentence physics
  paragraph (§20.1 caps at four) into two, organized by the actual physics -
  electrical rungs, then physical ones - so the disk-loses-to-network fact
  falls out of the structure instead of being asserted.
- **Roughly ten multi-clause sentences split or rewritten**, each one a
  place the pass genuinely re-read on a cold pass: the cold open's compound
  "2x faster or 200x faster changes whether..." (singular verb, unmarked
  shift into the candidate's head), "These ratios" with no antecedent, "it
  skips a layer" with no referent, "In production"'s 45-word who/why/callback
  sentence, "costs the same trust as guessing wrong", "Your turn"'s stranded
  "to estimate the rough total latency of", "cash out against the ladder
  above", and Recap bullet 1's "except one pair that swaps".
- **Common mistakes bullet 1 contradicted itself** ("the rung before it" in
  bold, "the next rung" in the explanation). Now one direction.
- **Confirmed and left alone:** `blueprints: []`,
  `availableComponentIds: []`, `requiredComponentIds: []`,
  `validationRuleIds: []` are all correct with no undeclared exception (no
  `starterGraph`, `hasEditorExercise: false`, the lesson names no component
  and §16 homes the three primitives at 1.6); §5.3/§6 structure complete for
  Process with both renamed headings still in beat order; the diagram/table
  content split does not collide (the examples column has no counterpart in
  the diagram); the §14 throughput/storage narrowing is defensible; "Next"
  names 1.6, confirmed against `manifest.ts`; no em dash; vocabulary all
  sourced except "app tier", replaced with "their application servers".
- **Length 1,185 -> 1,226 (+41)**, the same direction and size as 1.4's own
  Opus pass (1,106 -> 1,136). The growth is the "rung" definition, the
  caption's orientation gloss and the paragraph splits; six sentences were
  cut or compressed to pay for part of it.
- **Out of scope, noted not fixed:** quiz Q1's RAM explanation still says "a
  few nanoseconds" (the same contradiction fixed in the lesson body), and
  Q1's explanations now depend on the lesson's "rung"/"ladder" vocabulary -
  safe today because the lesson defines it, but a real dependency.

**New standing note for later chapters.** A metaphor word that becomes a
chapter's organizing vocabulary ("rung", and any future "tier", "layer",
"hop", "budget") needs two things at first use, not one: a gloss saying what
it means, and a fixed orientation if the metaphor has a direction. 1.5 had
neither, and the missing orientation is what let "above" mean faster in one
section and slower in another without anyone catching it at draft time. The
gloss is already a §20.1 requirement; the orientation check is the new part.

---

## 1.6 Drawing the First Architecture

- **Authored 2026-08-09 · not yet committed · branch
  `feature/content-1-1-understanding-the-problem`** (same in-progress Wave 2
  branch as 1.1-1.5 - no wave-gate re-check needed, this closes the wave
  rather than starting one).
- Definition id `bb-1-6-drawing-the-first-architecture` · manifest slug
  `1-6-drawing-the-first-architecture` (`chapterDefinitionId` flipped from
  `null` to this id in the same pass)
- Type: **Building Block** - the first chapter in this wave that isn't
  Concept or Process. Foundational · 30 minutes (Reader + real Editor build,
  the first Part 1 estimate that isn't Reader-only) · prerequisite: 1.5.
- **Lesson length: 1,209 words**, leaner per estimated minute than 1.5's
  1,226 for 20 minutes even though 1.6's own estimate is 30 - proportionate
  once read correctly: most of the extra 10 minutes is real Editor build
  time, not Reader time, so the Reader portion did not need to scale
  linearly with the estimate (no Opus pass has run yet to confirm this
  independently).
- Pipeline not run this pass (content-authoring only, per the skill's scope
  - `src/content/chapters/index.test.ts`'s hardcoded chapter-id list was
  updated to include the new id, same registry-wiring touch 1.1-1.5 needed,
  but `tsc`/`lint`/`vitest`/`build` were not run).

**Blocking decision resolved before drafting (user-directed, 2026-08-09).**
Open decision #3 below names 1.6 specifically as blocked: CURRICULUM §7.2
requires topology diagrams to render as ScaleCraft graph JSON, but
`MarkdownRenderer.tsx` was checked directly and has no block type for
`ArchitectureGraph` JSON - only `MermaidBlock` exists. 1.6 is the first
Building Block chapter, and its primary diagram (beat 5, mandatory) is
exactly a topology. Asked the user directly rather than working around it
silently, per this ledger's own standing policy for open decisions. **Chosen:
Mermaid exception for 1.6's lesson-body diagram only**, justified because the
*real* interactive topology already exists and is what the learner actually
builds - the chapter's `starterGraph` and `blueprints[0]` are genuine
`ArchitectureGraph`/`GraphPattern` values that render, simulate, and validate
for real in the Editor. The lesson diagram is a static preview shown before
the prose that explains it, not the chapter's only encounter with the shape.
**This resolves the blocker for 1.6 only, not §7.2 in general** - 3.4 (Load
Balancer, later this wave) will need its own version of this same call when
it's authored; see open decision #3's update below.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-6-drawing-the-first-architecture.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-6-drawing-the-first-architecture.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 5 existing rules curated; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter to author a `diagram`-kind question (modeled on QUIZ_FRAMEWORK §6's own published Q7 for this exact chapter/rule) |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **First real construction-family exercise in this wave.** 1.1-1.5 all
  declared `hasEditorExercise: false` with empty `availableComponentIds`/
  `blueprints`/`validationRuleIds`, reusing 0.2's mechanism. 1.6 needs none
  of that - it has a real Fix exercise, so `hasEditorExercise` is left
  absent (defaults to `true`, matching every chapter authored before that
  field existed).
- **§16's formal introduction, not another borrowed exception.** 0.1 used
  `client`/`app-server`/`sql-database` as narrow, undeclared-choice scenery
  (open decision #2 below), explicitly deferring the real introduction to
  1.6. This chapter is that introduction: `availableComponentIds` equals
  `requiredComponentIds` equals all three, no exception to declare. Open
  decision #2 is resolved by this chapter existing, not left open.
- **Starter graph reuses 0.1's "two real, distinct issues" pattern, not "find
  the bug" blind (§11.1).** Missing `app-server` (a required component with
  nothing satisfying it) plus a `client -> sql-database` edge kept at kind
  `request-flow` deliberately, not an illegal kind - the more instructive
  fault, since it shows the rule fires on *what* an edge connects, not on
  its label. This also means the edge trips **two** rules at once
  (`no-direct-client-database` and `component-relations`, the latter via
  `sql-database`'s own already-documented category restriction) - not a new
  coincidence, `content/components/config/data.ts`'s own comment already
  calls this overlap deliberate belt-and-suspenders. Flagged in spec §12 for
  a second reader to confirm two stacked messages on one edge reads as
  reinforcing rather than confusing on a first real, unguided Fix exercise.
- **No guided tour, unlike 0.1.** 0.1's Fix exercise is walked by
  `design-editor-tour.ts`; 1.6's is not (`editorTourId` left absent). This is
  the deliberate difficulty step from a tour-guided first fix to a real,
  unguided one - the hint stack and the validation explanations are the only
  support, which is what a Building Block chapter's higher stage-2
  (construction) demand actually looks like in practice.
- **Failure modes and Scaling are mandatory content for the first time in
  this wave.** §6 makes both "M" for Building Block, "o" for Concept/Process
  - 1.1-1.5 all justified omitting or folding them; 1.6 can't and doesn't.
  Merged into one section ("What breaks first") since app-server-crash vs.
  database-crash and the 10x/100x story are one continuous idea here, which
  §6 permits for adjacent short sections.
- **§9 lenses 1, 5, 7 made explicit, per the binding rule for every Building
  Block chapter** ("at least lenses 1, 5, and 7 appear explicitly"). Lens 1
  (why this exists) is beat 2's own framing; lens 5 (what breaks first) names
  the app server explicitly as the first failure; lens 7 (10x/100x) states
  both multipliers with qualitative, specific outcomes rather than hand-wavy
  ones, per 1.4/1.5's own standing note about checking scale-ladder claims
  against real arithmetic (there is no arithmetic to check here - both claims
  are qualitative by design, not computed figures that could drift).
- **One further-out forward tease, to 3.4** (§19's "at most one"), spent in
  the Scaling half of "What breaks first": splitting traffic across more
  than one app-server instance needs a load balancer, which 3.4 introduces.
  Checked against every prior Part 1 entry in this ledger - none has already
  teased 3.4, so this is the first spend of that particular tease, not a
  repeat. The mandatory immediate-next preview (1.7) is separate and sits in
  "Next".
- **Production example: Instagram's early monolith** (one app tier, one
  primary Postgres database, millions of users), chosen to be distinct from
  every other Part 1 production example so far (1.2 Basecamp, 1.3 S3, 1.5
  Meta) and to land §9 lens 9 (how would a two-person startup solve this)
  without needing exotic infrastructure - the point is that the minimal
  shape is a genuine production answer at real scale, not a toy.
- **Quiz Q2 is a `diagram`-kind question**, the first one actually authored
  in the registry (0.2's ledger confirmed the UI itself renders and works via
  a direct Playwright check, but no chapter had used it yet). Modeled on
  QUIZ_FRAMEWORK §6's own Q7, which is explicitly written as "the first
  validation rule the learner ever meets (1.6, `no-direct-client-database`)"
  - reworded and re-laid-out, not copied verbatim, matching every other
  chapter's practice of modeling on bank content rather than reproducing it.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1/Q3/Q4/Q5) have
  correct options at b/a/c/d - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged here per 0.2-1.5's own
  precedent of flagging a self-assessed density claim for the next reviewer
  to check rather than trust, though the word-count comparison above (1,209
  words, leaner per minute than 1.5) is at least a rough check against
  padding.

**Opus proofread pass (2026-08-09).** Content-only, no pipeline run. Scope was
the six audit areas (content, content-structure, blueprints, component lists,
submit validations, diagrams); quiz, hints and
`problemStatement`/`learningObjectives`/`curriculumContext` were left
untouched. `lessonVersion` 1 -> 2. Full detail in spec §13.

- **Checked by tracing source, not by trusting the draft's narrative.** Read
  all five rule implementations, `chapter-outcome.ts`, and the three
  components' `relations`, then ran the starter graph through them by hand.
- **Two factual errors found in the draft's account of its own validation.**
  (a) `component-relations` was attributed solely to `sql-database`'s input
  contract. In fact *both* endpoint contracts reject the edge, and because
  `component-relations.ts` tests `!outputCategoryOk` first, the message the
  learner reads names the **Client's output rules**
  (`outputs.allowedCategories: ["networking","compute"]`, no `data`) - not the
  database's. (b) The draft claimed `missing-input-connection` reports the
  absent `app-server`. It cannot: the rule iterates `graph.nodes` and
  `app-server` isn't in the starter graph, so it returns zero findings there.
  The absent component is reported by `runChapterValidation`'s
  `missingRequiredComponentIds` check, independent of any rule. **The curation
  itself was right both times** - the exercise is correctly gated, and all
  three structural rules earn their place as guards on the intermediate states
  the fix passes through. Only the spec's and the code comment's explanations
  were wrong; both corrected.
- **Four lesson edits.** (1) The diagram caption claimed `request-flow` "only
  ever" runs client -> app -> db, which is false as a general claim about the
  edge kind and is contradicted by 3.4's own topology - a real risk under
  §7.2's "learners absorb edge semantics from every diagram" warning; it also
  claimed the exercise checks "one rule" (five are curated, two fire on the
  one bad edge), which the learner disproves on their first Validate and which
  contradicted the chapter's own deliberate withholding of that count.
  (2) The Instagram example overclaimed - "a single primary Postgres database,
  serving millions of users" and "the trade-off they accepted ... a single
  point of failure" are not defensible, since by that scale Instagram ran many
  app servers behind a load balancer with Postgres split across machines.
  Rewritten to the launched-on-this-shape-and-grew-on-it framing, which is
  both accurate and a stronger version of the chapter's actual point.
  (3) "Next" carried **no** backward references; §19 requires >=2 in beat 14,
  and 1.4/1.5 both put them there. Added 0.4/1.4/1.5, matching their shape.
  Note the draft spec claimed §19 was cleared by references in beats 8 and 13,
  which is not what §19 says - worth watching for in later chapters.
  (4) "the first thing to saturate" -> "run out of headroom", so the
  senior-answer line uses only this chapter's own vocabulary as §10.3 and the
  spec's own beat-13 note require ("saturate" is 1.7's word and appears
  nowhere else in Part 1).
- **Confirmed and left alone:** blueprint is honest and not pre-satisfied by
  the starter graph; component lists match §16's 1.6 row exactly; all five
  rule ids resolve; Failure modes and Scaling are genuinely present, not
  gestured at; §9 lenses 1/5/7 explicit; "Next" names 1.7 per the manifest;
  no em dash; one diagram only, with nothing claiming a graph-JSON diagram
  exists. The two-stacked-messages concern flagged in spec §12 was reviewed
  and deliberately not changed - two findings on one edge is correct product
  behavior, the two explanations say different things, and the lesson's
  choice not to preview the count is declared, not accidental.
- **New drift found: §14's 1.6 row says "Exercise: build + fix + simulator
  trace"; the chapter ships build + fix only.** Not resolved (adding a trace
  is exercise/engineering work, not content) and now declared in spec §4. This
  is the same class of doc-vs-shipped mismatch as open decision #1's 0.1 row -
  see the new open decision #7 below.
- **Note for the quiz pass (out of this pass's scope, not acted on):** Q3's
  stem asks why `no-direct-client-database` fires "regardless of what kind the
  edge is given". That is accurate to the rule, but the starter graph's edge
  is `request-flow` and the learner never sees the rule fire on any other
  kind, so the question tests a claim the chapter asserts rather than one the
  exercise demonstrates. Worth a look by whoever owns the quiz.

**Open note for a later pass (not resolved here):** the Mermaid-exception
decision (above) was scoped narrowly to 1.6 on purpose. When 3.4 is authored
later this wave, it hits the identical §7.2 gap and needs its own explicit
call - don't assume 1.6's precedent silently extends to it without asking
again, since 3.4's diagram needs (multiple instances, health-check `control`
edges) are more complex than 1.6's straight-line shape and the trade-off
might land differently.

---

## 1.7 Identifying Bottlenecks

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (cut from `feature/content-
  1-1-understanding-the-problem` at the point it had 1.1-1.6, rather than
  from the bare release branch - see "Branch topology" below).
- Definition id `bb-1-7-identifying-bottlenecks` · manifest slug
  `1-7-identifying-bottlenecks` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: **Process** (reverts from 1.6's Building Block exception - no
  components introduced, back to Part 1's default per open decision #6's
  precedent). Foundational · 25 minutes (Reader + knowledge check, no build)
  · prerequisite: 1.6.
- **Lesson length: 1,352 words** at draft, after one density pass already
  folded in (see "Judgment calls" below). Above 1.4's 1,106 for the same
  25-minute estimate; flagged for a second reader rather than trusted - see
  spec §12.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**Branch topology, decided with the user before drafting (2026-08-10).** The
checked-out branch at the start of this session was
`feature/content-1-1-understanding-the-problem` (containing 1.1-1.6, itself
cut from `release/v4.1.0-part-1-curriculum` at commit `0f8f96a`, not yet
merged there). The user asked for a new branch "off the release branch" for
this chapter; asked to confirm which base was intended given the release
branch itself doesn't yet contain 1.1-1.6, and the user chose stacking on the
current checkout (matching every prior Part 0/1 chapter's own precedent of
stacking on one wave branch rather than cutting per-chapter branches off the
literal release line). `feature/content-1-7-identifying-bottlenecks` is the
result - 1.6 is present as real prerequisite content, not just a CURRICULUM
row, and the "already-shipped chapter as structure precedent" step of the
draft workflow used 1.5 and 1.6 for real.

**Open decision #7 confirmed, not just predicted.** That decision (raised by
1.6's Opus pass) named 1.7 in advance: "§14's 1.7 row ... makes the same
[simulator-trace] promise, so 1.7's author hits this before the decision can
keep being deferred." Confirmed here. `pending-content.md`'s own dependency
note already covers this exact case (simulator-dependent beats degrade to a
quiz question, with the intended upgrade noted) - applied directly rather
than treated as a new problem. See spec §0 for the full reasoning. Still not
resolved: whether to amend CURRICULUM §14's 1.6/1.7 rows or build the
simulator work - this chapter is the second data point for that eventual
single decision, not a resolution of it.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-7-identifying-bottlenecks.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-7-identifying-bottlenecks.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; **three** `diagram`-kind questions (Q1/Q3/Q5) sharing one topology with varying `instances` config and ceilings, the first chapter to author more than one diagram question |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **Predict-then-check realized as three diagram questions, not one.**
  CURRICULUM §14's row is specific: "predict-then-check on three presented
  graphs." Rather than the usual one diagram question per chapter (1.6's
  precedent), authored three, all reusing 1.6's exact three-component
  topology with only the `instances` config and stated ceilings changed
  between them - Q1 and Q3 give opposite correct answers on identical
  topology, which is the chapter's own point (the bottleneck is a
  comparison between today's numbers, not a fixed property of a component)
  made structurally, not just asserted in prose. Flagged in spec §12 as a
  new shape for a second reader to confirm rather than assume is fine by
  precedent.
- **No topology-styled primary diagram in the lesson body**, unlike 1.6.
  Open decision #3 records that 1.6's Mermaid-as-topology exception was
  scoped narrowly and shouldn't be assumed to extend silently. Rather than
  re-raise that call for this chapter, the primary diagram uses generic
  "Stage 1/2/3" labels with ceiling numbers - a capacity concept diagram,
  not an architecture-graph rendering - and the next section maps it onto
  the real component names in prose. The quiz's own diagram questions do
  carry real component graphs (client/app-server/sql-database), which is a
  different rendering path (`QuizQuestion.graph` via the quiz UI, already
  verified functional, already used by 1.6's Q2) and needed no exception.
  Flagged in spec §4/§12 for a second reader to confirm this reads as a
  clean sidestep rather than avoiding the question 1.6 answered directly.
- **No construction-family exercise - justified Process/no-component
  chapter, same pattern 1.1-1.5 used.** §16 places 1.7 in the no-component
  list. `availableComponentIds`/`requiredComponentIds` both `[]`,
  `blueprints: []`, no `starterGraph`, `hasEditorExercise: false`, no hints
  (nothing for a hint to orient toward with no build) - all matching
  1.1-1.5's precedent exactly, not 1.6's.
- **1.6's shape and its own specific answer reused as Q1**, deliberately: the
  chapter's whole argument is that "the app server runs out of headroom
  first" was a fact about 1.6's numbers, not a rule, and testing that by
  reproducing 1.6's exact shape and asking the same question through the new
  method is a stronger demonstration than a fresh, unconnected example would
  have been.
- **The slow-vs-unscalable distinction and the moving-bottleneck mechanism
  merged into one internal-mechanics beat** (§6's adjacent-short-sections
  allowance) - they are one continuous idea here (different capacities
  producing different current answers to the same question), not two
  separate topics competing for space.
- **Trade-off section (preempt vs. wait) kept genuinely two-sided**, per
  §11.1's rule against secretly-correct trade-off content - no default
  answer is stated; the chapter states the two costs and stops.
- **One further-out forward tease, to 2.2** (§19's "at most one"), directly
  textually supported by CURRICULUM §14's own 2.2 row ("Prepares for: 1.7's
  skill applied spatially") rather than invented. Checked against every
  entry through 1.6: none has already spent a tease on 2.2.
- **Production example: Twitter's early database bottleneck**, chosen as a
  fresh company (not yet used this wave: 1.2 Basecamp, 1.3 S3, 1.5 Meta, 1.6
  Instagram) and because it's a genuine diagnosis-before-fix story at the
  right depth - the specific fix they built afterward is 3.x material and
  deliberately left out, per §13's rule against implementation tourism.
  Flagged in spec §12 for a second reader to confirm the boundary held.
- **One density pass performed during drafting, not deferred**: tightened
  the 10x/100x section (which had restated the moving-bottleneck mechanism
  from the section immediately above it almost verbatim), the trade-off
  section, and one sentence in "Tracing it on a real path" - cut roughly 30
  words. Word count (1,352) is still above 1.4's comparable-estimate figure;
  flagged in spec §12 rather than treated as settled, per every prior
  chapter's own precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Only two single-kind questions this chapter
  (Q2, Q4) - correct options at `b` and `a`, distinct positions. The three
  diagram questions are outside the invariant test's scope (it applies to
  single-kind questions) but checked by eye anyway; no shared-position
  pattern found across them.

**Open note for a later pass (not resolved here):** the generic
non-topology primary diagram (§4 of the spec) is a judgment call to sidestep
open decision #3 rather than answer it. If a future chapter needs an actual
topology diagram in the lesson body again (3.4 already will), that's still
open decision #3's job to resolve properly, not something this chapter's
sidestep quietly settles.

---

## 1.8 Engineering Trade-offs

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (continues directly after
  1.7 on the same branch - no new branch cut, same topology decision 1.7
  already recorded).
- Definition id `bb-1-8-engineering-trade-offs` · manifest slug
  `1-8-engineering-trade-offs` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7, 1.9-1.11 -
  no type-reversion call needed, unlike 1.6/1.7). Foundational · 20 minutes
  (Reader + knowledge check, no build) · prerequisite: 1.7.
- **Lesson length: 1,234 words** (by `wc -w`, including table/Mermaid syntax
  overhead) after one density pass folded into drafting. Within range of
  1.1's 1,153 (post-Opus-pass) and 1.5's 1,185-1,226, both the same
  20-minute estimate; flagged for a second reader rather than trusted - see
  spec §12.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, unlike 1.7.** §14's 1.8 row
promises "trade-off scenarios x3" - a `Trade-off scenario` exercise per
§11.1's own taxonomy, already natively expressible as `single`/`multi` quiz
questions with no simulator or stages-UI dependency. Realized directly, no
degradation needed and no new entry required in the "Open decisions" list
below. See spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-8-engineering-trade-offs.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-8-engineering-trade-offs.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2/Q4/Q5 directly realize CURRICULUM §14's "trade-off scenarios x3" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A real Practical objective included, correcting an apparent gap in
  1.7's own spec.** 1.7's spec text claimed "all five categories
  represented" but its actual five objectives (Knowledge, Engineering x2,
  Interview, Communication) omit Practical entirely - contradicting
  1.1/1.2/1.4/1.5's own precedent of a real, quiz-tied Practical objective
  for Process chapters (they don't get the Concept-only carve-out). 1.8
  follows 1.1/1.2/1.4/1.5's actual pattern, not 1.7's apparent slip; flagged
  in spec §2 and §12 so this isn't mistaken for a shared convention, and so
  1.7's gap doesn't go unnoticed by a future reader auditing that chapter's
  definition metadata (which is outside Opus's audit scope per the
  chapter-author skill, so nothing else will catch it).
- **"Consistency" introduced as vocabulary for the first time, deliberately
  kept mechanism-free.** CURRICULUM §14's own 1.8 row lists "consistency" as
  one of the cost dimensions to introduce, but 3.12's row separately claims
  "replication lag and read-your-writes as the first consistency encounter."
  Resolved by layering, not by picking one: 1.8 introduces the *word*
  ("does everyone asking right now get the same answer") with no mechanism
  attached (no replica, no cache, no specific technique named), so 3.12
  remains honestly the first encounter with the *mechanism*. Recorded as a
  simplification in `curriculumContext.simplifications` and flagged in spec
  §5/§12 for a second reader to confirm the boundary holds rather than
  reading as a collision with 3.12's own claim.
- **Primary diagram reuses 1.1's decision-tree Mermaid shape**, not a
  topology diagram - consistent with `pending-chapters.md`'s open decision
  #3 (1.6's Mermaid-as-topology exception is narrow, not a standing
  license). The diagram (bottleneck decision branching into "add instances"
  vs. "bigger machine," each leaf naming Buys/Spends) is introduced early
  (beat 5) and unpacked in full prose at beat 8 ("Bigger machine or more of
  them"), the same shown-before-explained pattern 1.6/1.7 used for their own
  primary diagrams.
- **Worked trade-off (vertical vs. horizontal scaling) is a new decision,
  not a repeat of 1.7's "preempt vs. wait."** 1.7 already owns the
  preempt-vs-wait trade-off; reusing it here would restate rather than
  extend. The vertical/horizontal choice is genuinely two-sided (money,
  complexity, operability all cut differently across the two branches) and
  builds directly on 1.6's `instances` field and 1.7's "ceiling" vocabulary
  without needing anything from 1.9 onward.
- **Cold open is a direct continuation of 1.7's own "Next" section**, which
  named this exact gap in advance ("knowing what breaks first only tells
  you what's wrong... naming the cost of that decision out loud is next").
  Not an invented connection - 1.7's own text predicted it.
- **No topology-styled component diagram, no canvas exercise - justified
  Process/no-component chapter**, same pattern 1.1-1.5/1.7 used. §16 places
  1.8 in the no-component list. `availableComponentIds`/`requiredComponentIds`
  both `[]`, `blueprints: []`, no `starterGraph`, `hasEditorExercise: false`,
  no hints.
- **Failure modes and Scaling omitted, not merged** (unlike 1.7, which
  merged them). Optional for Process per §6; no system exists in this
  chapter to fail or scale - the chapter teaches a reasoning reflex applied
  to decisions whose actual failure/scaling behavior belongs to 1.6/1.7, so
  re-covering it here would restate rather than add. Justified in spec §4.
- **Production example: Uber's driver-location staleness**, chosen as a
  fresh company this wave (not yet used: 1.2 Basecamp, 1.3 Amazon S3, 1.5
  Meta, 1.6 Instagram, 1.7 Twitter) and because it's a genuine, publicly
  documented consistency-for-responsiveness trade-off at the right depth -
  no specific mechanism named, per §13's rule against implementation
  tourism.
- **One further-out forward tease, to 3.22** (§19's "at most one"), directly
  supported by CURRICULUM's own description of 3.22 as "the curriculum's
  consistency home." Checked against every entry through 1.7: none has
  already spent a tease there.
- **One density pass performed during drafting, not deferred**: tightened
  "Finding what you spent," "Bigger machine or more of them," "In
  production," and "Next" - cut roughly 60 words. Word count (1,234) is
  proportionate to 1.1/1.5's own figures for the same estimate; flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1, Q2, Q4, Q5) -
  correct options at `c`, `a`, `d`, `b`, four distinct positions, matching
  1.1's own precedent. Q3 (`multi`) is outside the invariant test's scope by
  definition.

**Open note for a later pass (not resolved here):** the "consistency"
layering judgment call above (word introduced here, mechanism still owned by
3.12) is a new pattern - not yet tested by a second chapter the way open
decision #7 was confirmed by 1.7. If a future chapter's own vocabulary
introduction runs into the same word-vs-mechanism question, treat this
chapter's approach as a precedent to confirm, not an automatically-settled
rule.

---

## 1.9 Deep Dive Methodology

- **Authored 2026-08-10 · not yet committed · branch
  `feature/content-1-7-identifying-bottlenecks`** (continues directly after
  1.8 on the same branch - no new branch cut, same topology decision 1.7
  already recorded).
- Definition id `bb-1-9-deep-dive-methodology` · manifest slug
  `1-9-deep-dive-methodology` (`chapterDefinitionId` flipped from `null` to
  this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7-1.8,
  1.10-1.11 - no type-reversion call needed). Foundational · 20 minutes
  (Reader + knowledge check, no build) · prerequisite: 1.8.
- **Lesson length: 1,191 words** (by `wc -w`), written once against §20.6
  directly. Within range of 1.1's 1,153 (post-Opus-pass) and 1.8's 1,234,
  both the same 20-minute estimate; flagged for a second reader rather than
  trusted, per every prior chapter's own precedent.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, same shape as 1.8, unlike 1.7.**
§14's 1.9 row promises "given a design + requirements, pick the right
deep-dive target from four; explanation per option" - a single-choice quiz
question shape with no simulator/stages-UI dependency, the same native fit
1.8's trade-off scenarios had. Realized directly as quiz Q2 and Q4, no
degradation, no new entry required in the "Open decisions" list below. See
spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-9-deep-dive-methodology.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-9-deep-dive-methodology.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2/Q4 directly realize CURRICULUM §14's "pick the right deep-dive target from four" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A false attribution caught and removed during drafting, not left for
  audit.** An early draft of "Common mistakes" cited "deep-diving
  everything" as "(0.4's own named candidate mistake)." Grepped every
  shipped lesson (`public/content/chapters/*.md`) for the phrase before
  finalizing and found no chapter has actually taught it yet - CURRICULUM
  §10.2 is framework text describing the recurring candidate-mistakes
  callout box in the abstract, not a claim that 0.4's own shipped lesson
  uses this language. Fixed by stating the mistake on its own merit,
  unattributed, matching this chapter's other three mistakes and avoiding
  exactly the untaught-vocabulary/false-citation trap the chapter-author
  skill's draft reference calls out by name. See spec §12 for the full
  note.
- **A real Practical objective included**, per 1.1/1.2/1.4/1.5/1.8's actual
  precedent (Process chapters do not get the Concept-only Practical
  carve-out) - not 1.7's apparent slip, which 1.8's own ledger entry already
  flagged as worth a second reader's attention rather than a shared
  convention.
- **Primary diagram is a decision tree (Mermaid), not a topology diagram**,
  consistent with open decision #3 (1.6's Mermaid-as-topology exception is
  narrow) and with 1.1's and 1.8's own precedent of using this shape for a
  selection procedure. `Decision tree` is explicitly in §7.1's diagram
  inventory for exactly this use.
- **Cold open is a direct continuation of 1.8's own "Next" section**, which
  named this exact question in advance ("once you know what broke and what
  fixing it costs, which piece of a ten-component design is worth looking
  at closely?"). Not an invented connection - 1.8's own text predicted it,
  the same pattern 1.7's "Next" set up for 1.8 and 1.8's "Next" set up for
  this chapter.
- **Failure modes and Scaling omitted, not merged** (same choice 1.8 made,
  unlike 1.7's merge). Optional for Process per §6; no system exists in this
  chapter to fail or scale - the chapter teaches a judgment/communication
  skill applied to systems whose actual failure/scaling behavior belongs to
  1.6/1.7.
- **Three requirement-to-target examples (throughput, durability,
  cross-continent latency) all stay within the taught 1.6 palette and
  taught vocabulary** - no mechanism (cache, read replica, CDN) is named as
  a fix; `curriculumContext.notYetIntroducedConcepts` records all three as
  deliberately absent. The chapter finds the target, it does not solve it.
- **One further-out forward tease, to 3.12** (§19's "at most one"). Checked
  against every prior ledger entry: 3.4 (1.6), 2.2 (1.7), and 3.22 (1.8) are
  already spent; 3.12 (read replica) is unused. Chosen over 3.14 (cache)
  because this chapter's read-path example is framed as a throughput/volume
  problem, which 1.1's own Opus-pass correction assigned to read replicas,
  not caches (repeated-read latency). Flagged in spec §12 for a second
  reader to confirm the target, same caution 1.1's own correction was
  written to prevent recurring.
- **Amazon used as the production example**, in a role distinct from its
  0.4 appearance (the design-doc/6-pager convention, a different decision
  entirely) - the 100ms-latency-to-1%-sales figure is specifically about
  where engineering review time goes, which is this chapter's subject.
  Fresh company-in-this-role for the wave (1.2 Basecamp, 1.3 Amazon S3, 1.5
  Meta, 1.6 Instagram, 1.7 Twitter, 1.8 Uber). Flagged in spec §12 for a
  second reader to confirm this doesn't read as tourism given Amazon's
  other Part-0 appearance.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly at 1,191 words, proportionate to
  1.1's and 1.8's own figures for the same 20-minute estimate. Flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.
- **Quiz position-clustering checked by eye**, per the standing instruction
  from 0.1/0.2's shipped bug. Four single-kind questions (Q1, Q2, Q4, Q5) -
  correct options at `c`, `a`, `b`, `d`, four distinct positions. Q3
  (`multi`) is outside the invariant test's scope by definition.

**Open note for a later pass (not resolved here):** the 3.12-vs-3.14
forward-tease call above rests on 1.1's own prior correction distinguishing
throughput (read replicas) from repeated-read latency (caches). If a future
chapter's own read-path example blends both pressures again, the same
distinction needs to be applied by eye each time - it is a recurring
judgment call, not a rule any test enforces.

---

## 1.10 Communicating & Defending a Design

- **Authored 2026-08-11 · not yet committed · branch
  `feature/content-1-10-communicating-and-defending-a-design`** (cut from
  `release/v5.0.0-content-platform` - the branch 1.7-1.9 were authored on,
  `feature/content-1-7-identifying-bottlenecks`, no longer exists locally or
  on `origin` in this session; 1.1-1.9's content is already present on the
  current release branch, so continuing the sequence needed no merge, just a
  fresh branch for this one chapter).
- Definition id `bb-1-10-communicating-and-defending-a-design` · manifest
  slug `1-10-communicating-and-defending-a-design` (`chapterDefinitionId`
  flipped from `null` to this id in the same pass)
- Type: Process (§16's no-component list, alongside 1.1-1.5, 1.7-1.9, 1.11 -
  no type-reversion call needed). Foundational · 20 minutes (Reader +
  knowledge check, no build) · prerequisite: 1.9.
- **Lesson length: 1,227 words** (by `wc -w`), written once against §20.6
  directly. Within range of 1.8's 1,234 and 1.9's 1,191, both the same
  20-minute estimate; flagged for a second reader rather than trusted, per
  every prior chapter's own precedent.
- Pipeline not run this pass (content-authoring only, per the chapter-author
  skill's standing scope - `src/content/chapters/index.test.ts`'s hardcoded
  chapter-id list was updated to include the new id, same registry-wiring
  touch every prior chapter needed, but `tsc`/`lint`/`vitest`/`build` were
  not run).

**No open-decision collision this chapter, same shape as 1.8/1.9.** §14's
1.10 row promises "staged - given follow-up questions, choose the strongest
response and read why the others are weaker" - a single/multi-choice quiz
shape with no simulator/stages-UI dependency, the same native fit 1.8's and
1.9's own exercises had. Realized directly as the whole quiz (all five
questions present a follow-up and ask for the strongest response), no
degradation, no new entry required in the "Open decisions" list below. See
spec §0.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-10-communicating-and-defending-a-design.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-1-10-communicating-and-defending-a-design.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, nothing to validate; justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; the full set directly realizes CURRICULUM §14's "staged - given follow-up questions, choose the strongest response and read why the others are weaker" exercise text |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **A real quiz position-clustering bug caught and fixed during drafting,
  not left for a second reader.** The first-drafted option order put both
  Q1's and Q2's correct answer at position `a` - exactly the class of bug
  0.1/0.2 shipped once and the standing per-chapter eyeball check exists to
  catch, even though a sample of two matching letters wouldn't fail the
  registry-wide invariant test by itself. Caught by checking the shipped
  `index.ts` array directly rather than trusting the draft, fixed by
  reordering Q2's four options (content unchanged, only array position) so
  its correct answer moved to `b`. Final positions across the four
  single-kind questions (Q1, Q2, Q4, Q5): `a`, `b`, `c`, `d` - four distinct
  letters, re-verified after the fix. Full note in spec §10.
- **A real Practical objective included**, per 1.1/1.2/1.4/1.5/1.8/1.9's
  actual precedent (Process chapters do not get the Concept-only Practical
  carve-out).
- **Primary diagram is a decision tree (Mermaid), not a topology diagram**,
  consistent with open decision #3 (1.6's Mermaid-as-topology exception is
  narrow) and with 1.1/1.8/1.9's own precedent of using this shape for a
  selection procedure.
- **Cold open is a direct continuation of 1.9's own "Next" section**, which
  named this exact moment in advance ("now the follow-ups start, and the
  same 'name it, commit, defend without defensiveness' habit gets tested
  live"). Not an invented connection - 1.9's own text predicted it, the same
  pattern every chapter in this run of the ledger has used for its cold
  open.
- **Failure modes and Scaling omitted, not merged** (same choice 1.7-1.9
  made). Optional for Process per §6; no system exists in this chapter to
  fail or scale - the chapter teaches a judgment/communication skill applied
  to systems whose actual failure/scaling behavior belongs to 1.6/1.7.
- **The write-survives-a-restart gap (quiz Q4, and the lesson's applied
  table) is deliberately left unsolved**, not glossed over or quietly
  patched with an untaught mechanism - durability machinery is 3.20/3.26's
  territory. `curriculumContext.notYetIntroducedConcepts` and
  `simplifications` both record it, per §20.2's honesty requirement and
  `pending-chapters.md`'s own open decision #10 (a simplification must be
  stated in the prose, not just recorded in the list - this chapter does
  both).
- **One further-out forward tease, to 2.3 (§19's "at most one").** Checked
  against every prior ledger entry: 3.4 (1.6), 2.2 (1.7), 3.22 (1.8), and
  3.12 (1.9) are already spent; 2.3 (Evolution of Modern Architectures) is
  unused. Chosen because 2.3's own purpose - the one-server-to-services
  scaling story - is the direct continuation of this chapter's "evolve only
  the piece that breaks" idea, applied repeatedly over time. Flagged in spec
  §12 for a second reader to confirm the target.
- **Dropbox (2016 move off Amazon S3) used as the production example** -
  chosen specifically for a publicly defended trade-off under outside
  skepticism, not for its storage architecture, which this curriculum never
  explains. First appearance of Dropbox in this curriculum. Flagged in spec
  §12 for a second reader to confirm this reads as the defense, not
  implementation tourism.
- **"Treating every follow-up as an accusation" stated on its own merit,
  unattributed** - grepped every shipped lesson for related phrasing
  ("adversary," "defensive," "caving," "self-correct") before finalizing and
  found none of it taught yet, the same false-attribution check 1.9's own
  entry performed for "deep-diving everything." See spec §9.
- **"Connections + Preview of next" placed last in the file, after "Your
  turn," not before "Recap."** Matches the standing convention every
  chapter since 0.2 has actually shipped under (the combined section
  carries both beat 14's connections and the separate mandatory "Preview of
  next chapter" row) rather than treated as a fresh per-chapter choice.
  Named explicitly in spec §4 so a second reader doesn't mistake it for a
  beat-order violation.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly at 1,227 words, proportionate to
  1.8's and 1.9's own figures for the same 20-minute estimate. Flagged in
  spec §12 rather than treated as settled, per every prior chapter's own
  precedent for a self-assessed density claim.

**Open note for a later pass (not resolved here):** the 2.3 forward-tease
call above is the first time this curriculum has teased a Part 2 chapter
from Part 1. Every prior further-out tease pointed into Part 3 (3.4, 3.12,
3.22) or stayed within-part (2.2 from 1.7). If a future chapter's own
forward tease also reaches across a Part boundary, this is worth confirming
as an established pattern rather than assumed fine by default.

---

## 1.11 Driving a System Design Interview

- **Authored 2026-08-11 · not yet committed · branch
  `feature/content-1-10-communicating-and-defending-a-design`**. This is the
  current branch, which already contains the immediate prerequisite 1.10.
- Definition id `bb-1-11-driving-a-system-design-interview` · manifest slug
  `1-11-driving-a-system-design-interview` (`chapterDefinitionId` changed from
  `null` in the same pass).
- Type: Process. Foundational · 30 minutes (Reader + knowledge check, no
  build) · prerequisite: 1.10. Optional by curriculum design and gates no
  later chapter.
- **Lesson length: 1,208 words** (by `wc -w`). A density pass removed a
  second restatement of the time budget and left the table as the single
  source of the minute-by-minute structure.
- `typecheck`, `lint`, the chapter-specific invariant/wiring suites (28 tests),
  and `build` pass. The repository-wide `npm test` was attempted twice but
  exceeded this environment's 60-second command cap while emitting existing
  React `act(...)` warnings; it was terminated by the runner before a final
  suite result. It needs a normal local/CI run for the ledger's full-pipeline
  standard.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-1-11-driving-a-system-design-interview.spec.md` |
| 2 | Lesson MDX | `public/content/chapters/bb-1-11-driving-a-system-design-interview.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no canvas exercise, justified in spec §5 |
| 5 | Quiz | Five sequenced questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §7 |

**Judgment calls made:**

- **The full staged walkthrough is quiz-realized, not silently omitted.** The
  stages UI required by Part 1 remains absent. `pending-content.md` explicitly
  allows this degradation: scenarios become quiz questions while the UI is
  missing. The lesson's "Your turn" says so, the spec records the limitation,
  and the quiz forms one miniature interview instead of five disconnected
  recall checks.
- **No component, canvas, validation rule, blueprint, or hint.** §16 places
  1.11 in the no-component list. `hasEditorExercise: false` prevents progress
  from requiring an unreachable Submit action, matching 1.1-1.5 and 1.7-1.10.
- **Time allocation is an adaptable budget, not a script.** The 45-minute
  table protects the order of evidence: scope, requirements, estimate,
  architecture, pressure, then follow-ups and close. The lesson states that a
  dangerous requirement can earn more deep-dive time.
- **The decision-tree Mermaid is an interviewer-intent diagram, not a
  topology.** It is within the ordinary process-flow diagram allowance and is
  captioned with what to notice.
- **Immediate-next preview is 2.1, verified against `manifest.ts`.** No
  further-out tease is spent: the optional chapter closes Part 1 cleanly and
  needs no additional forward promise.
- **Quiz positional checks completed.** The four single-choice correct
  positions are `b`, `a`, `d`, `c`; the ordering question is a full
  derangement from its `correctOrder`. Every option has its own explanation.

**Second-reader checks:** read the time budget as a flexible reasoning budget
rather than memorized interview choreography; confirm the scenarios work as a
single walkthrough; and re-check the 2.1 preview if manifest order changes.

---

## 3.4 Load Balancer

- **Authored 2026-08-11 · not yet committed · branch
  `feature/lesson-3-4-load-balancer`** (cut from
  `release/v5.0.0-content-platform`, not from Wave 2's Part 1 branch - this
  chapter is Release 5.0.0-alpha content-platform work, see
  `.claude/docs/pending.md`, which needed a real chapter to pilot the MDX
  migration and walkthrough diagram renderer against). Pulled forward per
  `pending-content.md`'s own Wave 2 definition, replacing the `bb-dummy-1`
  placeholder.
- Definition id `bb-3-4-load-balancer` · manifest slug `3-4-load-balancer`
  (`chapterDefinitionId` flipped from `bb-dummy-1` to this id in the same
  pass).
- Type: **Building Block**. Foundational · 35 minutes · prerequisite:
  **1.9 (declared exception, see below - curriculum-order prerequisite is
  3.3, not yet authored)**.
- **Lesson length: 1,242 words** for a 35-minute estimate (1.6 was 1,209 for
  30 minutes) - proportionate; this chapter covers two algorithms plus a
  failure-mode shift 1.6 didn't need to.
- Pipeline not run this pass (content-authoring only, per the skill's
  scope).

**Blocking decisions resolved before drafting (2026-08-11):**

1. **Pulled forward with no real prerequisite.** Group A (3.1-3.3) is
   entirely unauthored, and 3.3 - CURRICULUM §14's stated "Assumes" for
   3.4 - doesn't exist as content. Left as `manifest.ts` originally had it
   (`prerequisiteSlugs: ["3-3-reverse-proxy"]`), this chapter would be
   permanently unreachable in the app. **Resolved:** author the lesson
   assuming only what's actually shipped (Part 0, Part 1 through 1.9, and
   1.6's three components) - the motivation is built entirely from 1.6's
   own planted seed, never from reverse-proxy vocabulary. `manifest.ts`'s
   `prerequisiteSlugs` repointed to `1-9-deep-dive-methodology`, commented
   inline as a declared, temporary exception to revert once Group A lands
   in Wave 3. Full reasoning in spec §0.1.
2. **Topology diagram renderer, 3.4's own call (not an assumed extension of
   1.6's).** Open decision #3 below named this explicitly: 3.4's diagram
   (multiple instances, health-check `control` edges) is more complex than
   1.6's straight line. Resolved the same way, for the same reason -
   Mermaid, styled as the target topology, captioned narrowly for this
   diagram only. See spec §0.2.
3. **New finding, not anticipated by any prior doc: `control` edges aren't
   buildable yet.** CURRICULUM §16 assigns 3.4 as introducing edge kind
   `control`. Checked directly against the registry
   (`content/components/config/networking.ts` and `compute.ts`): neither
   `load-balancer.relations.outputs.allowedKinds` nor
   `app-server.relations.inputs.allowedKinds` includes `"control"` - both
   declare `["request-flow"]` only for this direction. A load-balancer
   health-check edge to a backend fails `component-relations` on both
   ends, today, for every chapter, not just this one. **Not hacked
   around** - per this skill's own instruction to flag rather than patch
   engine gaps during a content pass. `control` edges are taught and shown
   in the lesson diagram (Mermaid, not engine-validated) but are absent
   from the graded `starterGraph`/`blueprint`, which use `request-flow`
   only. Recorded honestly in `curriculumContext.simplifications`, not
   silently omitted. **Needs an engineering follow-up**, separate from this
   ledger: add `"control"` to `load-balancer.relations.outputs.allowedKinds`
   and to `app-server.relations.inputs.allowedKinds` (or a narrower,
   load-balancer-specific contract). See open decisions below.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-4-load-balancer.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-4-load-balancer.md` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 6 existing rules curated (`single-instance-load-balancer` is the namesake); justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3; Q2 and Q4 modeled on QUIZ_FRAMEWORK §8's own published Q5 and Q7 for this exact chapter |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **Required blueprint includes `sql-database`, not just the LB layer.**
  `availableComponentIds` equals `requiredComponentIds` equals `client`,
  `load-balancer`, `app-server`, `sql-database` - the full realistic stack
  (two app-server instances sharing one database) rather than scoping the
  exercise to just client/LB/app-server. Reinforces 1.6's mediation lesson
  (the database is still only reachable through an app server) while
  teaching the new distribution layer on top, not padding.
- **Starter graph is under-provisioned, not mis-wired** - same "fix ships
  symptoms" precedent as 1.6/0.1, but the fault this time is pure capacity
  (`single-instance-load-balancer`), not an illegal edge. Everything in the
  starter graph is legally connected; the learner adds a second instance
  and wires it identically.
- **One forward tease, to 3.8** (Horizontal Scaling) - checked against this
  ledger; not already spent by an earlier chapter this wave besides 1.6's
  own tease to 3.4 itself.
- **Production example: Cloudflare**, chosen specifically to avoid the
  Instagram-overclaim class of bug 1.6's Opus pass caught - a
  decision-not-company claim ("load balancing is Cloudflare's literal core
  product, at global scale") that doesn't require asserting anything about
  a specific company's internal architecture.
- **Quiz Q2 and Q4 modeled on QUIZ_FRAMEWORK §8's own Q5 and Q7** - the
  bank's already-published examples for this exact chapter and rule -
  reworded with a fresh graph/workload pairing, not copied verbatim.
- **Quiz position-clustering checked by eye**: four single-kind questions
  (Q1/Q3/Q4/Q5), correct options at b/a/c/d - four distinct positions.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, same as 1.6. Flagged for the next
  reviewer to check against padding, though the word-count comparison above
  is at least a rough sanity check.

**Opus proofread pass (2026-08-11) - run, six changes, uncommitted.**

Scope: content, content-structure, blueprints, component lists, submit
validations, diagrams. Quiz, hints and the `problemStatement` /
`learningObjectives` / `curriculumContext` fields were out of scope and are
untouched. No CI/typecheck/lint/test/build run (content-only pass). Full
detail in the chapter spec's new §13.

*Changed* (`lessonVersion` 1 -> 2, spec §13 lists all six):

1. **The `control`-edge gap was disclosed to the AI but not to the learner.**
   `curriculumContext.simplifications` is consumed only by `src/ai/prompt.ts`
   (the Deep Check prompt) - it is never rendered in the Reader. So the draft
   taught `control` edges, drew them dashed in the diagram, said "the load
   balancer pings each instance over a `control` edge", and gave the learner
   nothing about their being unbuildable. A learner who tried to draw one
   would have hit a `component-relations` error with no explanation. §20.2
   requires the honest statement in the prose *and* the `simplifications`
   entry, not either/or. Two sentences added under the diagram caption. This
   was the pass's strongest finding, and it generalises: **any future
   chapter recording a limitation only in `simplifications` has disclosed it
   to nobody who can read.**
2. Diagram caption taught the picture as the mechanism ("losing a `control`
   edge takes it out of rotation"). A failed health check does that; the edge
   does not vanish. Corrected.
3. Cloudflare example rewritten to §13's who / why / when / trade-off format.
   "Cloudflare's core product is this exact pattern" is an overclaim (its
   core is a global edge network; load balancing is a product it sells), and
   "route each request to a healthy *nearby* server" smuggled in geographic
   steering, which this chapter never teaches. **The ledger's own guard held
   only halfway:** picking Cloudflare did avoid an internal-architecture
   claim, but the sentence still overclaimed and skipped three quarters of
   §13's format. Replacement is a public-product decision claim, ties
   least-outstanding-requests back to least-connections, and names the
   trade-off (a third party in front of every request).
4. "Add a second app-server instance" was ambiguous against the product:
   `app-server` has a literal `instances` config field, and
   `single-instance-load-balancer` sums it - so bumping it to 2 clears the
   warning, yields a clean Validate, then fails Submit with "Missing:
   Application Server" while an Application Server is visibly on canvas.
   Hint 2 disambiguated, but hints are never auto-surfaced. Brief now says
   "a second box, not a higher Instances count".
5. Cold-open restatement cut (§20.6) - paragraph 1's "something still has to
   decide which instance gets each request" was restated whole by paragraph
   2. Kept the stronger one.
6. "the same cargo-cult shape the lesson just named" pointed at nothing -
   "cargo cult" is §14's phrase, not the lesson's. Repointed at the "Common
   mistakes" bullet that does name it.

*Verified against the two documented judgment calls:*

- **Vocabulary boundary (call 1) holds.** No reverse-proxy / DNS / firewall /
  API-gateway vocabulary anywhere, including in teases. "instance", "single
  point of failure" and "hop" all appear in 1.6's body first; "loop step 4
  (0.4)" matches both 1.6's identical attribution and §14's "steps 4, 6";
  `round-robin` / `least-connections` are the `load-balancer` config field's
  literal option strings. `manifest.ts` read but not edited.
- **`control` gap (call 2) is real and correctly diagnosed.** Re-checked the
  registry directly: `load-balancer.relations.outputs.allowedKinds` and
  `app-server.relations.inputs.allowedKinds` are both `["request-flow"]`.
  The diagram-only treatment is a legitimate disclosed limitation - it just
  was not actually disclosed anywhere the learner could see it, until now.

*Verified and left alone:* blueprint is a single honest `require` (one right
shape; a second would be invented variety), `commentary` is debrief-only, and
the starter graph provably cannot satisfy it - `pattern.ts` binds aliases
injectively, so one `app-server` node can never fill both `app1` and `app2`.
The ledger's "under-provisioned, not mis-wired" claim holds: every starter
edge passes `component-relations`. Component lists match §16. All six
`validationRuleIds` resolve in `src/validation-engine/rules/index.ts`.

*Three structural omissions were undeclared and are now declared in spec §4
(§6 requires written justification, and silence is the thing §6 forbids):*
the "Preview of next chapter" section previews 3.8 rather than the manifest's
actual next chapter 3.5 (justified - §0.1 forbids the vocabulary, §19 allows
one tease, §14's own 3.4 row names 3.8); §12's nugget devices are absent
again; and §14's 3.4 row promises "build + config + trace" against a
build/fix-only chapter.

*Spec fact corrected:* the word-count comparison was wrong in both places -
this ledger said 1.6 was 1,209 words and the spec said 950; `wc -w` gives
**1,279**. The draft was therefore never long relative to 1.6, it was
slightly thinner per minute. Post-pass body is 1,333 words for 35 minutes vs.
1.6's 1,279 for 30 - proportionate. **Do not carry the 950/1,209 figures
forward into another chapter's density comparison.**

**New open notes raised by this pass** (numbered items below where they need
a decision; recorded here where they are just observations):

- **`single-instance-load-balancer` is severity `warning`, and
  `runChapterValidation` derives `passed` from `errorCount` alone.** The
  starter graph passes Validate structurally while listing one issue. The
  exercise still works (`QuestionPane` counts every violation above `note`,
  so the learner reads "Last validated: 1 issue" and the header pane carries
  the full explanation, and Submit holds the line via the blueprint), but it
  works differently from 1.6, whose fault was error-severity and failed
  Validate outright. Not changed - severity is engine work with
  cross-chapter reach. Worth a deliberate call: should a chapter's *namesake
  fault* ever be warning-severity?
- **Blueprint-drift copy is confusing for a duplicate-node blueprint.**
  Failing Submit with one `app-server` present reports "Missing:
  Application Server" while an Application Server is on the canvas. Correct
  in engine terms (the second alias is unbound), misleading in learner
  terms. Engineering note, first surfaced by this chapter because it is the
  first blueprint requiring two nodes of one component.
- **Resolved 2026-08-11 (post-audit, user-directed):** `problemStatement`
  re-synced with the "Your turn" brief - now reads "Add a second App Server
  to the canvas - a second box, not a higher Instances count on the one
  already there," matching change 4 above instead of the stale "add a second
  app-server instance" wording.

---

## 3.1 Networking Fundamentals (Wave 3, first Group A chapter)

- **Authored 2026-08-22 · not committed · working tree on
  `fix/streak-counter`** (no branch cut - the `/chapter-author draft` pass
  never commits or branches; the user reviews the uncommitted diff and
  decides where it lands).
- Definition id `bb-3-1-networking-fundamentals` · manifest slug
  `3-1-networking-fundamentals` (`chapterDefinitionId` repointed from `null`)
- Type: **Building Block** (not Concept - see spec §0; CURRICULUM §14's own
  row calls it "Concept with a small build," which isn't one of §4's five
  literal types). 25 min (Reader + a real Editor build) · prerequisite: 2.3
  Evolution of Modern Architectures.
- **First Group A chapter authored with no pulled-forward prerequisite
  exception needed.** Unlike 3.4 (open decision 9), 3.1's real
  curriculum-order prerequisite (2.3) is already shipped, so
  `manifest.ts`'s `prerequisiteSlugs` needed no repoint - it already pointed
  at `2-3-evolution-of-modern-architectures`.
- **Lesson length: 1,398 words** (`wc -w` on the raw `.mdx`, no embedded
  JSON/JSX to inflate the count). Proportionate to 3.4's ~1,333 prose words
  for 35 minutes, scaled for this chapter's 25.
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-1-networking-fundamentals.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-1-networking-fundamentals.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 2.3 and 3.4) |
| 4 | Validation rules | None new - `permissive-firewall` already existed in the engine (implemented and tested), curated alongside five structural rules. `validationRuleIds: []` not used here; see spec §7 |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (all `single`-kind) |
| 6 | Playtest pass | Spec §11 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line `chapterDefinitionId`
repoint, no `prerequisiteSlugs` change needed).

**Judgment calls made:**

- **Classified Building Block, diverging from §14's literal "Concept with a
  small build" wording - same class of call 1.2 made for itself.** `firewall`
  is a real registry component with a genuine construction-family exercise
  (completion + a Submit-gated config check), which is §4's Building Block
  definition, not Concept's "no (or minimal) new topology." This also makes
  Failure modes and Scaling considerations mandatory rather than optional
  (§6), and both are genuinely present, not padding. Full reasoning in spec
  §0.
- **The blueprint's Submit gate includes a real `ConfigPredicate`, not just
  topology - a first for this curriculum.** `pattern.ts`'s
  `nodeMatchesPredicates` was read directly (not assumed) to confirm a
  Firewall node whose `defaultPolicy` equals `"allow-all"` can't bind the
  blueprint's `fw` alias, so the pattern fails to match even with otherwise-
  correct wiring. This is a deliberate departure from 3.4's own precedent
  (its `algorithm` config choice was left ungated because both options were
  defensible - open decision 11). Here there is exactly one correct answer,
  so gating Submit on it is honest rather than arbitrary. Full reasoning in
  spec §8.
- **The Firewall component's own default (`defaultPolicy: "allow-listed"`)
  is already safe**, so a learner who places one and wires it correctly
  without touching config passes both Validate and Submit without ever
  triggering `permissive-firewall`. Declared as an honest design property,
  not a gap: the "Common mistakes" bullet and quiz Q2 both carry the failure
  mode for a learner who never meets it on canvas. Flagged for a second
  reader in spec §12.
- **Fourth instance of open decision 3's Mermaid-as-topology exception, and
  the first where every node in the diagram is a real, unlocked registry
  component.** The Reader still can't render a markdown graph-JSON block, so
  the primary diagram is Mermaid styled as the target topology (client ->
  firewall -> app-server -> sql-database, with an outside/inside subgraph
  boundary), same captioning discipline 1.6/3.4 set. Noted in spec §5 that
  the limitation is in the rendering pipeline, not in whether the components
  are real - a distinction worth keeping precise now that it's actually true
  for the first time.
- **TLS termination location deliberately not re-taught.** 2.1 already
  shipped the full edge-vs-app-server trade-off table for where TLS should
  end. This chapter states only what a handshake buys (encryption, server
  identity) and explicitly names the split ("2.1 already priced the round
  trips; what matters here is what the handshake buys"), rather than
  restating 2.1's material under §20.6's cut-on-sight rule for repetition.
- **Only one production example (AWS Security Groups), not §13's allowed
  up to three.** Both 2.1's and 3.4's own "In production" sections already
  used Cloudflare; a third use in as many chapters would read as reaching
  for the same company rather than the best fit for this specific decision
  (default-deny by default). AWS's security-group default is a complete,
  public, decision-level claim on its own.
- **Confirms, rather than diverges from, what 2.1 and 2.3 already
  pre-committed.** Open decision 12's stop-table row for the firewall
  ("Drops traffic that has no business reaching you, at the perimeter") and
  the TCP+TLS handshake row ("Not a component - the connect phase,
  everywhere; 3.1 covers it") both match this chapter's actual content
  without needing a change to either row. Open decision 15's Group A pressure
  ("traffic has to be resolved, admitted and routed before your code sees
  it") is picked up verbatim in the cold open ("Admitted is this chapter").
  See the updates to decisions 12 and 15 below.
- **Backward connections: three** (2.1, 2.3, 1.2), exceeding §19's >=2 - see
  spec §3's per-beat table for where each lands.
- **Forward tease: 3.2 DNS**, which is also the manifest's actual next
  chapter - no divergence to declare here, unlike 3.4's pulled-forward tease
  to 3.8.
- **Quiz Q1 and Q2 modeled on QUIZ_FRAMEWORK.md §8's own Q1 and Q2** (the
  bank's published examples for this exact chapter and rule), reworded with
  fresh distractors. Q3-Q5 are original: TCP vs. UDP judgment, the TLS
  handshake at concept level, and a defense-in-depth judgment question at
  difficulty 3.
- **Position-clustering checked by eye.** Correct options sit at b, c, a, d,
  b - all four positions used across the chapter's five (all `single`-kind)
  questions, "b" the only repeat. Q1's own opening letter ("b") is a repeat
  of every sibling chapter's own most-used letter (0.4/1.3/1.4/3.4), which
  was unavoidable since every other letter was already a repeat too by this
  point - flagged in spec §12 as a real constraint, not a skipped check.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged per every prior chapter's own
  precedent of flagging a self-assessed density claim for the next reviewer
  to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope, still open):** no
Opus audit pass. `tsc`/`lint`/`vitest`/`build` not run.

---

## 3.2 DNS (Wave 3, second Group A chapter)

- **Authored 2026-08-22 · not committed · working tree on
  `fix/streak-counter`** (no branch cut - same shape as 3.1, drafted in the
  same session immediately after it).
- Definition id `bb-3-2-dns` · manifest slug `3-2-dns` (`chapterDefinitionId`
  repointed from `null`)
- Type: **Building Block** (§14's own row names no explicit `Type:` field,
  unlike 3.1's; classified the same way 1.2/3.1 were for the identical
  tension - see spec §0). 20 min (Reader + a real Editor build) ·
  prerequisite: 3.1 Networking Fundamentals, already shipped in this same
  working tree, no repoint needed.
- **Lesson length: 1,159 words** (`wc -w` on the raw `.mdx`). Proportionate
  to 3.1's 1,398 for 25 minutes, scaled for this chapter's 20 - runs
  slightly over the naive ratio (~1,118 expected) because of the
  cross-chapter fix below, not padding; see the chapter's own spec §12.
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-2-dns.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-2-dns.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 3.1 and 3.4) |
| 4 | Validation rules | None new - the same structural set 3.1 curated, minus `permissive-firewall` (this chapter's own content doesn't teach firewall config); see spec §7 |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (Q1/Q2/Q3/Q5 `single`, Q4 `ordering`) |
| 6 | Playtest pass | Spec §11 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line `chapterDefinitionId`
repoint, no `prerequisiteSlugs` change needed - already pointed at
`3-1-networking-fundamentals`).

**Self-caught cross-chapter bug, before user review or an Opus pass - the
most significant thing about this chapter's authoring.** The first drafting
pass wrote the TTL/caching content as if it were new. It wasn't: 2.1's
already-shipped "Before your code runs" section states both "DNS answers
are cached with a TTL" and "a DNS change is never instant" explicitly, and
closes with "Both phases are compressed here... 3.2 opens up the first of
them" - an explicit, already-shipped promise. The first draft's spec §4 had
also declared the root/TLD/authoritative hierarchy an omission, directly
contradicting that promise. Caught by rereading 2.1's actual lesson body
(not just its own ledger entry) before finalizing, not by the user or a
cold second reader. Fixed by rewriting: "Finding an answer nobody has
cached" now teaches the resolver hierarchy 2.1 deferred; "The cost of
choosing a TTL" reframes from 2.1's already-stated fact to this chapter's
own decision-level content; the quiz's Q2 swapped from a second
propagation-lag question (duplicating 2.1) to a hierarchy question. Full
before/after in the chapter spec's own process note at the top. Recorded
here at length because this is exactly the class of bug the Opus audit pass
exists to catch, and a future reader should know it was checked, not just
assumed clean because no audit ran yet.

**Judgment calls made:**

- **A real registry/content tension: the browser-to-DNS edge can't be
  built as a `control` edge today, even though 2.1 taught it as one.**
  Checked directly against `src/content/components/config/networking.ts`:
  both `browser.relations.outputs.allowedKinds` and `dns.relations.inputs.
  allowedKinds` declare only `["request-flow"]`, and `component-relations`
  is `severity: "error"` - a learner drawing the semantically correct edge
  kind would fail Validate for it. **Not hacked around**, same discipline
  open decision 8 established for load-balancer health checks: the
  blueprint/starter graph use `request-flow` (the only kind that
  validates), the lesson's diagram caption states the simplification
  honestly, and `curriculumContext.simplifications` records it. Recorded
  below as a second instance of open decision 8, not a new decision - the
  underlying engineering fix is the same piece of work either way.
- **Two forward teases, diverging from 3.1's own single-tease shape.**
  CURRICULUM §14's row for 3.2 names two forward connections (an "advance
  organizer for 3.14" and "Prepares for: 3.15"). Followed the sanctioned
  one-immediate-plus-one-marked-further-out pattern 0.2 (1.3) and 0.3
  (1.11) already established: 3.3 stays the single immediate "Next" tease
  (matches the manifest, no divergence), 3.15 is named once, explicitly
  marked "several chapters out." The 3.14 advance-organizer connection is
  realized implicitly (the TTL content itself does the scaffolding) rather
  than as a third named chapter, which would be excessive even under the
  two-tease pattern's own precedent.
- **No config predicate on the DNS blueprint node**, unlike 3.1's firewall.
  A TTL choice has no universally wrong default - same reasoning 3.4's spec
  gave for leaving its algorithm choice ungated (open decision 11).
- **`permissive-firewall` deliberately excluded from `validationRuleIds`**,
  unlike 3.1's own curated set - the inherited Firewall node is already
  safely configured and this chapter doesn't teach firewall config.
- **`client` excluded from the palette even though cumulatively
  available**, matching 1.6/3.4/3.1's "no optional piece" precedent -
  Browser is required and does the same job more specifically.
- **Starter graph reuses 3.1's own blueprint minus its client node** -
  firewall, app server, database, correctly wired, nothing feeding the
  firewall. `entryPointIds: []`, since no entry-capable node exists until
  the learner adds one (matches an existing empty-array precedent already
  in `index.ts`).
- **Decision 12 checked for this chapter's own row, 2026-08-22 - matches.**
  2.1's stop table gives DNS "Turns a hostname into an IP address, before
  any connection exists | 3.2" - this chapter's own content (and quiz Q1)
  states exactly that. See the update to decision 12 below.
- **Backward connections: three** (2.1, 2.2, 3.1) - matches 3.1's own
  count, exceeding §19's >=2.
- **Forward tease: 3.3 Reverse Proxy** (immediate, matches manifest) plus
  3.15 (marked further-out) - see the two-tease judgment call above.
- **Position-clustering checked by eye.** Correct options (single-kind
  only, Q1/Q2/Q3/Q5) sit at c, a, d, b - all four positions used, zero
  repeats, an improvement on 3.1's own b/c/a/d/b (one repeat).
- **Density**: written once against §20.6, then substantially rewritten for
  the cross-chapter fix above (a correctness pass, not a density pass) -
  flagged per every prior chapter's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope, still open):** no
Opus audit pass. `tsc`/`lint`/`vitest`/`build` not run.

---

## 3.3 Reverse Proxy (Wave 3, third Group A chapter - Group A complete)

- **Authored 2026-08-22 · not committed · working tree on
  `fix/streak-counter`** (no branch cut - same shape as 3.1/3.2, drafted in
  the same session immediately after them).
- Definition id `bb-3-3-reverse-proxy` · manifest slug `3-3-reverse-proxy`
  (`chapterDefinitionId` repointed from `null`)
- Type: **Building Block** (§14's own row names no explicit `Type:` field,
  same shape as 3.2's row; classified the same way 1.2/3.1/3.2 were for the
  identical tension - see spec §0). 20 min (Reader + a real Editor build) ·
  prerequisite: 3.2 DNS, already shipped in this same working tree, no
  repoint needed.
- **Group A (3.1-3.3) is now fully authored**, closing the group open
  decision 9 named for 3.4's own pulled-forward exception. See that open
  decision's own update below for what this does and does not resolve.
- **Lesson length: 1,227 words** (`wc -w` on the raw `.mdx`). Proportionate
  to 3.2's 1,159 for the same 20-minute estimate - slightly higher,
  consistent with carrying one more failure-mode paragraph than 3.2 needed.
- **Pipeline NOT run** - content-only authoring pass per the chapter-author
  skill's scope. `tsc`/`lint`/`vitest`/`build` are the user's call.

**Deliverables (all 6 + ledger):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-3-reverse-proxy.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-3-reverse-proxy.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` (inserted between 3.2 and 3.4) |
| 4 | Validation rules | None new - the same structural set 3.1/3.2 curated, minus `permissive-firewall`; see spec §7 |
| 5 | Quiz | 5 questions, ramp 1/1/2/2/3 (all `single`-kind) |
| 6 | Playtest pass | Spec §11 |
| 7 | Ledger entry | This section |

Also touched: `src/curriculum/manifest.ts` (the one-line `chapterDefinitionId`
repoint, no `prerequisiteSlugs` change needed - already pointed at
`3-2-dns`).

**Checked 2.1's own lesson body before drafting core mechanics, avoiding a
repeat of 3.2's own self-caught bug rather than catching it after a first
draft.** 2.1's walkthrough already shows the Reverse Proxy terminating TLS
and forwarding inward, and its own "Where TLS ends" section already carries
the full termination trade-off table. This chapter's "What happens when a
request arrives" section states that fact and moves straight to what it
adds (compression, static serving, the host/path routing decision) instead
of re-deriving a table 2.1 already shipped. Caught by reading 2.1's actual
lesson body first, before writing a word of this chapter's core mechanics -
same discipline 3.2's spec recommends for the next chapter after a real
instance of the opposite went briefly unshipped.

**Judgment calls made:**

- **No `control`-edge tension, unlike every other Group A chapter.**
  `reverse-proxy`'s registry contract (`src/content/components/config/
  networking.ts`) accepts only `request-flow` on both inputs and outputs -
  checked directly, not assumed. Unlike 3.2 (browser-to-dns) and 3.4
  (load-balancer-to-app-server health checks), this chapter's diagram and
  buildable blueprint agree completely; there is nothing to disclose as a
  simplification here. First Group A chapter without an instance of open
  decision 8.
- **No config predicate on the `terminatesTls` blueprint node**, matching
  3.2's own reasoning for its ungated DNS TTL (open decision 11's
  precedent) rather than 3.1's gated `defaultPolicy`. 2.1's own trade-off
  table presents both termination choices as genuinely defensible - gating
  Submit on one would contradict that even-handed framing, and the
  component's own default already matches what 2.1's walkthrough showed.
- **"Build from skeleton" (§14's own exercise wording for 3.3) realized as
  a Completion exercise with the gap in the middle of an existing chain**,
  rather than at either end the way 3.1's and 3.2's own gaps sat. No new
  exercise taxonomy needed - full reasoning in spec §0 and §8.
- **A learner who reconnects the firewall straight to the app server,
  skipping the proxy entirely, passes every curated Validate rule but
  fails Submit on the blueprint.** First chapter where the Validate/Submit
  divergence is topological (a whole node bypassed) rather than a single
  config value (3.1's `allow-all`). Not hacked around with a new rule -
  the blueprint alone is what enforces the front-door pattern. Flagged in
  spec §7 and §12 for a second reader to confirm the resulting
  blueprint-drift message is legible.
- **Production example: Google's Front End (GFE)**, not Cloudflare (spent
  twice, per 3.4's own ledger note), AWS (3.1) or Netflix (3.2, immediately
  prior). Google itself was already used once, in 2.1, for QUIC - judged
  acceptable since it's a different decision with two fresh companies
  (AWS, Netflix) authored in between, unlike a third Cloudflare use would
  have been. Flagged in spec §12 for a second reader to confirm this reads
  as diversity, not a repeat.
- **Two forward teases, both inside "Next", diverging from 3.1's own
  single-tease shape - same pattern 3.2 used.** CURRICULUM §14's row names
  two forward connections (3.4, quoting its own "an LB is a reverse proxy
  with a job"; 3.5). 3.4 stays the immediate tease (matches the manifest);
  3.5 is named in the same section but marked "two chapters out" -
  honestly closer than 3.2's own "several chapters out" to 3.15. Flagged
  in spec §12 for a second reader to confirm "two chapters out" still
  reads as clearly non-immediate.
- **Decision 12 checked for this chapter's own row, 2026-08-22 - matches,
  no change needed.** 2.1's stop table gives the reverse proxy "The single
  front door: terminates TLS, routes by host or path | 3.3" - this
  chapter's mental model and core-mechanics section both state exactly
  that. Third and final of the four Group A rows resolved; only 3.5
  remains open. See the update to decision 12 below.
- **Decision 15 checked for this chapter, 2026-08-22 - matches.** 2.3's
  Group A pressure line reads "traffic has to be resolved, admitted and
  routed before your code sees it." This chapter's cold open states
  "Routed is this chapter" - the third and final word of the triple, after
  3.1's "Admitted" and 3.2's "resolved." All three words are now
  individually spent, one per chapter, in 2.3's own order. See the update
  to decision 15 below.
- **Backward connections: at least four** (2.1, 2.2, 2.3, 1.3, plus 3.1/3.2
  woven through the starter graph and prose) - exceeding §19's >=2, same
  count class 3.1/3.2 each hit.
- **Position-clustering checked by eye.** Correct options sit at c, a, d,
  b, c - all four positions used, "c" the only repeat (twice of five),
  matching 3.1's own one-repeat pattern rather than 3.2's zero-repeat one.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly, deliberately referencing rather
  than restating 2.1's TLS content from the first draft. Flagged per every
  prior chapter's own precedent of flagging a self-assessed density claim
  for the next reviewer to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope, still open):** no
Opus audit pass. `tsc`/`lint`/`vitest`/`build` not run.

---

## 3.5 API Gateway (Wave 3, fourth Group A chapter - Group A complete)

- **Authored 2026-08-22 · not yet committed · branch `fix/streak-counter`**
  (same working tree as 3.1-3.3, continuing directly after 3.4).
- Definition id `bb-3-5-api-gateway` · manifest slug `3-5-api-gateway`
  (`chapterDefinitionId` flipped from `null`)
- Type: Building Block · foundational · 25 min · prerequisite: 3.4 (already
  shipped in this same working tree - no pulled-forward exception needed,
  `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-4-load-balancer`
  before this chapter was authored)
- **Lesson length: 1,356 words** (`wc -w` on the raw `.mdx`). Below the
  25-minute chapter's proportionate estimate against 3.3's 1,227/20min ratio
  (would predict ~1,535) - flagged in the spec's §12 for a second reader to
  confirm nothing load-bearing was cut short rather than trusting the
  density claim.
- Pipeline not run - content-only pass, per the `chapter-author` skill's
  scope.

**Deliverables (6 of 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-5-api-gateway.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-5-api-gateway.mdx` |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - same five-rule structural set 3.1-3.3 curated, justified in spec §7 |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3, first chapter since 0.2 to use `matching` again |
| 6 | Playtest pass | Spec §11 |

**Judgment call: CURRICULUM §14's own "completion (multi-service skeleton) +
fix (the three roles scrambled)" exercise line only partially maps onto a
buildable Editor exercise - full reasoning in spec §0, not silently
narrowed:**

- **Completion realized as designed** - the same "fault is pure absence in
  the middle of an already-correct chain" shape 3.3 used, extended one stop:
  browser/DNS/firewall/reverse-proxy (3.3's own chain, wired) and
  app-server/database (wired), gap between the proxy and the app tier is
  exactly where the gateway goes.
- **"Multi-service skeleton" not realized on the buildable graph.**
  `GraphNode` (`src/lib/graph.ts`) has no per-instance label field - a
  second, visually generic `app-server` node on canvas would render
  identically to the first and would actually teach the *wrong*
  disambiguation (it would look like the load balancer's own "identical
  instances" shape from 3.4, not "a different service"). The multi-service
  picture is carried instead by the lesson's primary diagram (Mermaid, which
  can label two boxes "Orders Service" / "Users Service" as text) and by
  quiz Q2. The graded build fronts one service. Same class of finding as
  open decision 3 (diagram can show more than the buildable graph) and
  decision 8 (control edges shown in a diagram, not exercised on canvas) -
  declared, not hacked around.
- **"Fix (the three roles scrambled)" not realized as a second Editor
  action.** There's no engine concept of a "role" distinct from which
  registry component a node literally is, so "scrambled roles" isn't a graph
  fault the validation engine can express without bespoke logic outside a
  normal Completion/Fix shape. Realized instead through the lesson's "Three
  components, three jobs" table, the first two Common-mistakes bullets, and
  quiz Q2 (matching, modeled on QUIZ_FRAMEWORK.md §8's own Q8 - the bank's
  own published trio-matching example for this exact chapter).

Same class of gap as **open decision 7** (3.4's "config + trace" promise
only partially mapping onto Editor mechanics) - a fourth instance of §14's
exercise line being a content brief rather than a literal Editor spec, this
time for a Building Block chapter's *first* exercise clause rather than a
later one.

**Other judgment calls:**

- **`load-balancer` deliberately excluded from this chapter's palette**,
  even though it's cumulatively available - referenced by name in prose and
  quiz only, matching 3.3's own precedent of naming 3.4/3.5 without
  requiring them on canvas.
- **No config predicate gates `requiresAuth` or `rateLimitPerMinute` on
  Submit** - both fields have defensible defaults (`true`, `600`), matching
  3.2/3.3's own precedent (open decision 11) of leaving a real,
  workload-dependent field ungated rather than treating it as a trap.
- **Uber chosen as the sole production example** - a fresh company from
  §13's canon list (Cloudflare spent twice, AWS/Netflix/Google once each, all
  four already used by 2.1/3.1-3.4). Stripe, Meta, Discord, LinkedIn, and
  Airbnb remain unused as of this chapter.
- **`component-relations` does new teaching work this chapter**, beyond the
  structural-guard role it played in 3.1-3.3: `api-gateway`'s own declared
  contract (`inputs: { allowedCategories: ["networking"] }`) means a learner
  cannot wire an app-server's output directly into the gateway - the same
  networking-only-input discipline the registry already enforced for
  `load-balancer` (3.4), now visible on a second component. Flagged in spec
  §12 for a second reader to confirm the resulting validation message is
  legible, not generic.
- **Quiz reintroduces the `matching` kind** (Q2), unused since 0.2 - modeled
  on QUIZ_FRAMEWORK.md §8's own Q8, reworded rather than reproduced.
  Derangement checked by hand: `pairs[0]`'s correct option sits at `options`
  index 2, `pairs[1]`'s at index 0, `pairs[2]`'s at index 1 - no pair's
  correct option sits at its own pair index.
- **Position-clustering checked by eye**, per the standing instruction from
  0.1/0.2's shipped bug. Four single-kind questions (Q1/Q3/Q4/Q5); correct
  options sit at c, a, d, b - all four positions used, no repeat.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged per every prior chapter's own
  precedent of flagging a self-assessed density claim for the next reviewer
  to check rather than trust.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 12's stop-table row - fourth and final of the four rows,
  now fully resolved.** 2.1's own row reads "Auth, rate limits, and request
  shaping in front of many services | 3.5." All three pieces hold as
  written: `requiresAuth`/`rateLimitPerMinute` are this chapter's own
  core-mechanics content verbatim, and "request shaping" is realized as
  path-based routing to a named service (the diagram's `/orders/*` /
  `/users/*` edges). See the update to decision 12 below.
- **3.4's own "Next" section does not tease 3.5** - checked directly. 3.4
  was authored standalone before Group A existed (open decision 9) and its
  "Next" points at 3.8 only. This chapter's cold open therefore quotes 3.3's
  own tease (which did name 3.5 explicitly) rather than inventing a
  connection to 3.4's "Next" that was never written. Not fixed in 3.4 - open
  decision 9 already names 3.4's prerequisite-revert and full re-read as
  separate, future work this draft pass does not touch.
- **No new instance of open decision 8 or 13 raised** - 3.5 introduces no
  new edge kind (`control` stays homed at 3.4 per §16).

---

## 3.6 Stateless Services

- **Authored 2026-08-22** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-6-stateless-services` · manifest slug
  `3-6-stateless-services` · spec
  `src/content/chapters/specs/bb-3-6-stateless-services.spec.md` · lesson
  `public/content/chapters/bb-3-6-stateless-services.mdx`
- Type: Concept (CURRICULUM §14's own row states this explicitly, no
  reclassification needed, unlike 1.2/3.1's ambiguous rows) · foundational ·
  20 min (shortest chapter in Group A/B) · assumes 3.5, already shipped
- **Authored ahead of `pending-content.md`'s own Wave 4 plan** (which
  schedules Group B for a later wave, paired with Group C), on explicit user
  request. No sequencing rule (§18.2) is actually violated - the real
  prerequisite (3.5) is already authored - only the wave-grouping plan is
  out of order relative to when this was written. Not resolved unilaterally;
  a future session may want to reconcile the wave plan with the ledger's
  actual authoring order.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-6-stateless-services.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-6-stateless-services.mdx` (1,272 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - `single-instance-load-balancer` (3.4's own namesake rule) reused for a second, deliberately different reason; see below |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **The curriculum's first purely config-only Fix exercise.** The starter
  graph is the full system as built through 3.5 - browser, DNS, firewall,
  reverse proxy, API gateway, load balancer, one app server, one database -
  every node and edge already correctly wired. The sole fault is the
  Application Server's own `Instances: 1`. No prior Fix exercise (1.2, 3.4)
  has shipped with zero topological faults; 3.1's `permissive-firewall`
  gate is also config-only, but paired with a missing node (a Completion
  exercise), not an otherwise-complete graph.
- **`single-instance-load-balancer` reused for a second, deliberately
  opposite blueprint shape than 3.4's.** 3.4's own blueprint requires two
  distinct app-server nodes (its problemStatement explicitly says "a second
  box, not a higher Instances count"). This chapter's blueprint requires
  the opposite: one app-server node with a `config` predicate
  (`instances >= 2`) - because proving that scaling out is "just a number"
  once a tier is stateless is this chapter's own point. Both blueprints
  clear the same underlying rule (which sums `instances` across all
  downstream targets) for two different teaching purposes - the same
  "same component, second job" pattern §19 names for components, applied
  here to a validation rule instead. The rule's own explanation text is
  3.4's framing (capacity/failover), not restated as if it were about
  statelessness; the lesson's own prose carries this chapter's reasoning
  separately so the rule isn't misrepresented. Full reasoning in the
  chapter spec §7.
- **A new finding for open decision 11, not a new numbered decision** -
  `blueprint-drift.ts`'s `missingComponents` check tests each blueprint
  node's config predicate against individual candidate nodes, not summed
  across multiple nodes the way the validation rule itself does. A learner
  who does 3.4's own fix here instead (adds a second Application Server
  node, each left at the default `instances: 1`) would clear the
  `single-instance-load-balancer` warning but fail this chapter's blueprint
  match, with a drift report reading "Missing: Application Server" despite
  two being present - the same class of confusing mismatch decision 11
  already named. Not hacked around: the lesson's "Your turn" section and
  hint 3 both explicitly instruct against adding a second node, the same
  mitigation 3.4's own problemStatement used for its own, opposite
  instinct. See the update to decision 11 below.
- **Primary diagram is a Mermaid sequence diagram, not the usual
  topology-Mermaid narrow exception (open decision 3).** Two requests, two
  app-server instances, routed differently by the load balancer - §7.1's
  own catalog homes sequence diagrams at "ordering between parties
  matters," which is exactly this case, so no open-decision-3 exception is
  being invoked. A `<Walkthrough>` was considered and deliberately not
  used - see spec §5.
- **Quiz scoped directly against QUIZ_FRAMEWORK.md §9's own per-question
  chapter tags**, not assumed. Bank Q1 is tagged "(3.6)" and was modeled on
  directly; bank Q2/Q3 (sticky-session cost accounting) are tagged "(3.7),"
  so this chapter's own Q4 tests the same pinning-vs-externalizing
  trade-off *without* the sticky-session cost specifics the bank reserves
  for 3.7; bank Q8 ("where did the state go") is tagged "(3.6-3.7)" and
  this chapter's own Q5 is a scoped-down version that stops at "a shared
  store" without naming which one.
- **Component budget carries the full chain through 3.5** (all 8
  components required, no optional piece), matching Part 3's own stated
  running-example philosophy rather than trimming to a minimal 4-node
  graph - see spec §6.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group B row - checked, matches.** 2.3's own row for
  Group B: "Copies of the app tier only work if a request can land
  anywhere | 3.6-3.9." This chapter's cold open and mental-model section
  state exactly that constraint, and paraphrase (not contradict) 2.3's own
  foreshadowing sentence ("nothing a user depends on may live in one
  instance's memory... that constraint is a chapter of its own (3.6)").
  First of the seven group-table rows checked; the other six remain open
  as their groups are authored. See the update to decision 15 below.
- **3.5's own "Next" section teases 3.6 directly** ("3.6 Stateless Services
  names the assumption Group A has been quietly making the whole time") -
  this chapter's cold open quotes it directly, continuing the chain 3.1-3.5
  already established.
- **No new instance of open decision 8 or 13 raised** - 3.6 introduces no
  new edge kind and no new component.

---

## 3.7 Sessions & State Management

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-7-sessions-and-state-management` · manifest slug
  `3-7-sessions-and-state-management` · spec
  `src/content/chapters/specs/bb-3-7-sessions-and-state-management.spec.md` ·
  lesson `public/content/chapters/bb-3-7-sessions-and-state-management.mdx`
- Type: Concept (per §16's own note that 3.6-3.10 are intentional
  no-component Concept chapters, same reasoning 3.6's own entry used) ·
  foundational · 25 min · assumes 3.6, already shipped in this working tree
- Second Group B chapter, authored immediately after 3.6 in the same
  session - same out-of-wave-plan note 3.6's own entry already carried
  forward (real prerequisite already shipped, only `pending-content.md`'s
  wave grouping is out of order).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-7-sessions-and-state-management.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-7-sessions-and-state-management.mdx` (1,214 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - `orphan-component` (already registered) is the namesake fault; see below |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **`orphan-component` as the namesake fault, not a new session-specific
  rule.** The starter graph's SQL Database node has zero incident edges -
  the same disconnected-component condition that generic, already-registered
  rule was built to catch, verified directly against
  `src/validation-engine/rules/orphan-component.ts`'s own predicate rather
  than assumed. No new rule authored; §14's row names none for this chapter
  and writing one is outside this pass's scope per the `chapter-author`
  skill. Full reasoning in the chapter spec §7.
- **Third instance for open decision 11's "namesake fault as warning
  severity" thread.** `orphan-component` is `severity: "warning"`, so this
  is now the third consecutive Group A/B chapter (3.4, 3.6, 3.7) whose
  graded fault doesn't flip `runChapterValidation`'s error-count-only
  `passed` flag on its own - Submit still gates correctly on the blueprint
  regardless. See the update to decision 11 below.
- **CURRICULUM §14's own "Trade-off scenario" exercise type (§11.1) is
  realized as an in-lesson two-product table plus a quiz question, not a
  new Editor-side "pick between two presented graphs" affordance.** §11.1
  names 3.7 as the first chapter using this exercise type; the taxonomy's
  own description ("2+ presented graphs/configs, pick per scenario, read
  reasoning") is satisfied without new engine work by presenting both
  products in the lesson and testing the judgment in quiz Q3, matching
  §11.1's own "trade-off exercises never have a secretly correct option"
  rule (both pairings' costs are stated, not just the "correct" one).
  Flagged in the chapter spec §12 for a second reader to confirm this
  reading doesn't under-deliver what the taxonomy table specifically named
  3.7 for.
- **The advance-organizer mention of 3.14 is authored as a separate,
  explicitly-marked "further out" note, not folded into the chapter's one
  real tease.** CURRICULUM's own row for 3.7 requires naming that a faster
  store arrives at 3.14; per the `chapter-author` skill's own draft
  instruction, this is a distinct, non-pull-generating mention (it forecloses
  an objection rather than manufacturing curiosity), kept separate from the
  chapter's single §19 tease to 3.8 in "Next." Full reasoning in spec §6.
- **Sticky routing's mechanism is explained one level deeper than 3.6's own
  treatment, still without a configurable canvas affordance.** No registry
  component exposes a session-affinity field (checked directly against
  `load-balancer`'s own config fields in
  `src/content/components/config/networking.ts` - only `algorithm` exists).
  Named honestly in the lesson prose per §20.2, not just recorded in
  `simplifications`, continuing the exact gap 3.6's own entry already
  declared rather than re-raising it as new.
- **Quiz Q2 draws directly on QUIZ_FRAMEWORK.md §9's own bank Q3**, which is
  explicitly tagged "(3.7)" - reserved for this chapter, unlike 3.6's own
  quiz which deliberately avoided that same bank question. Q5 goes one level
  past bank Q8 (tagged "3.6-3.7"), naming the specific store this chapter's
  own exercise builds, since 3.6's own Q5 deliberately stopped short of
  naming one.
- **Component budget carries the full chain through 3.6 unchanged** - no new
  component; `sql-database` (introduced 1.2) is reused for a second role as
  the session store, the exact "same component, second job" example §19
  names directly.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group B row - second chapter checked, still
  matches.** 2.3's row: "Copies of the app tier only work if a request can
  land anywhere | 3.6-3.9." This chapter doesn't restate that constraint
  (3.6 already did); it resolves the fork 3.6 left open, which is the
  correct job for a second chapter under the same motivating row. See the
  update to decision 15 below.
- **3.6's own "Next" section teases 3.7 directly** ("3.7 Sessions & State
  Management builds the missing half") - this chapter's cold open opens by
  quoting that fork directly, continuing the chain 3.1-3.6 already
  established.
- **No new instance of open decision 8 or 13 raised** - 3.7 introduces no
  new edge kind and no new component.

---

## 3.8 Horizontal Scaling

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-8-horizontal-scaling` · manifest slug
  `3-8-horizontal-scaling` · spec
  `src/content/chapters/specs/bb-3-8-horizontal-scaling.spec.md` · lesson
  `public/content/chapters/bb-3-8-horizontal-scaling.mdx`
- Type: Concept (per §16's own note that 3.6-3.10 are intentional
  no-component Concept chapters, same reasoning 3.6's and 3.7's own entries
  used) · foundational · 25 min · assumes 3.7, already shipped in this
  working tree
- Third Group B chapter, authored immediately after 3.7 in the same
  session - same out-of-wave-plan note 3.6's and 3.7's own entries already
  carried forward (real prerequisite already shipped, only
  `pending-content.md`'s wave grouping is out of order).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-8-horizontal-scaling.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-8-horizontal-scaling.mdx` (1,307 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - `single-instance-load-balancer` (3.4's own namesake rule) curated but deliberately not fired by the starter; see below |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **The Editor exercise is gated entirely by the blueprint, with no
  Validate-time warning at all.** The starter graph carries `instances: 2`
  (3.7's own passing config) - `single-instance-load-balancer` only fires
  below capacity 2, so Validate is clean from the start. This chapter's own
  bar (`instances >= 3`, headroom for one failure) is new territory above
  that rule's floor, gated by the blueprint's own config predicate alone -
  the same shape 3.4's own Config exercise used for its algorithm-choice fix
  (a real judgment call, not a rule violation). The lesson's "Your turn"
  section states outright that Validate starts clean so the learner isn't
  left hunting for a warning that was never coming. Full reasoning in the
  chapter spec §7, flagged in §12 for a second reader.
- **CURRICULUM's own "predict (kill an instance mid-simulation)" exercise is
  realized as a `diagram`-kind quiz question, not a literal simulator
  step.** No simulator UI exists (checked directly - see `pending-content.md`'s
  own named degradation path: "simulator-dependent beats degrade to a quiz
  question," and open decision 7's prior instances at 1.6/1.7/1.9). Quiz Q4
  adapts QUIZ_FRAMEWORK.md §9's own bank Q6 (LB + multiple app-server
  instances + shared database, one instance dies) to three instances and
  this chapter's own headroom numbers.
- **The quiz's diagram question uses `control`-kind edges for illustration,
  read directly against `QuizQuestion.graph`'s own documented contract
  ("rendered read-only, never used for matching") rather than assumed
  safe.** This is not treated as a new instance of open decision 8 (`control`
  edges aren't buildable on the real canvas) because a quiz diagram never
  passes through `component-relations`' edge-kind checks the way a
  learner-built graph does - QUIZ_FRAMEWORK's own bank Q6 already uses
  `control` edges the same way. Flagged in spec §12 for a second reader to
  confirm this reading rather than a quiet third instance of the gap.
- **New doc-drift finding: CURRICULUM.md §6's own "engineered-cliffhanger"
  example doesn't parse under current chapter numbering.** §6's "Rules of
  use" cites "3.8 ends with two servers and nothing routing between them;
  3.4 resolves it" as the gold-standard "Preview of next chapter" example -
  but 3.4 (Group A) is already taught by the time a learner reaches 3.8
  (Group B), so 3.4 cannot be something 3.8's own forward tease resolves.
  The chapter as authored instead continues the actually-shipped mechanism
  (3.6 sets up the fork, 3.7 resolves the state half, 3.8 resolves the
  routing/sizing half using 3.4's already-taught load balancer, re-motivated
  per CURRICULUM's own 3.8 row). Read as stale text from an earlier draft's
  numbering, the same class as open decisions 1, 4, 6, and 7 - logged as a
  new open decision (16) below rather than resolved unilaterally, since it's
  a doc edit, not a content decision this pass owns.
- **Component budget carries the full chain through 3.7 unchanged** - no new
  component; `load-balancer` (3.4) and the `app-server.instances` field
  (3.6) are both reused for a new job (sizing for a failure, not just
  proving duplication is safe), the same "same component, second job"
  pattern §19 names directly.
- **Netflix as the production example** - unused by any prior chapter
  (Stripe was 3.6's, Shopify was 3.7's), and on-topic: a large fleet of
  small, identical, stateless instances where single-instance loss is
  routine rather than incident-worthy.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group B row - third chapter checked, still
  matches.** 2.3's row: "Copies of the app tier only work if a request can
  land anywhere | 3.6-3.9." This chapter extends the same constraint one
  step further than 3.6/3.7 did - not just that a request can land anywhere,
  but that *enough* copies exist to survive losing one. Third of the four
  remaining rows named in open decision 15 to be checked against Group B;
  only 3.9 remains open. See the update to decision 15 below.
- **3.7's own "Next" section teases 3.8 directly** ("3.8 Horizontal Scaling
  picks up the other half of 3.6's own cliffhanger") - this chapter's cold
  open opens by quoting that fork directly, continuing the chain 3.1-3.7
  already established.
- **No new instance of open decision 8 or 13 raised by the graded content**
  - 3.8 introduces no new edge kind and no new component in its
  `starterGraph`/`blueprint`; the quiz diagram's `control`-edge usage is
  addressed separately above as not a canvas-buildability claim.

---

## 3.9 Service Discovery

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-9-service-discovery` · manifest slug
  `3-9-service-discovery` · spec
  `src/content/chapters/specs/bb-3-9-service-discovery.spec.md` · lesson
  `public/content/chapters/bb-3-9-service-discovery.mdx`
- Type: Concept with config exercise (CURRICULUM §14's own row states this
  explicitly for 3.9, unlike 3.6/3.7/3.8's bare "Concept") · foundational ·
  20 min · assumes 3.8, already shipped in this working tree
- Fourth and final Group B chapter, authored immediately after 3.8 in the
  same session - same out-of-wave-plan note 3.6/3.7/3.8's own entries already
  carried forward (real prerequisite already shipped, only
  `pending-content.md`'s wave grouping is out of order). Group B (3.6-3.9) is
  now fully authored.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-9-service-discovery.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-9-service-discovery.mdx` (1,212 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 3.8's own curated set carried forward unchanged; none of the five fire on this chapter's own gap (a `dns` config value), same Config-exercise-gated-by-blueprint-alone shape 3.4 and 3.8 both used |
| 5 | Quiz | 5 questions, difficulty ramp 1/1/2/2/3 |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **The graded Config exercise reuses `dns`'s own `ttlSeconds` field (3.2)
  rather than any new component - CURRICULUM's own row says "New: none."**
  The scenario is scoped narrowly to what DNS actually controls in this
  topology (the stack's public entry point), not to app-server membership -
  the load balancer already does real service discovery for the app tier
  (3.4). The lesson's own "Two ways to answer 'who's current'" section states
  this distinction directly rather than blurring the two. Flagged in spec §12
  for a second reader to confirm the distinction reads clearly and doesn't
  misteach DNS as the app tier's own discovery mechanism.
- **The primary lesson diagram deliberately does NOT depict this chapter's
  own starter graph** - unlike 3.4/3.6/3.7/3.8's own target-topology Mermaid
  diagrams, this chapter's diagram shows the general registry pattern
  (caller, registry, instances, health signal) as an explicitly illustrative
  abstraction, because the concept taught (the general pattern) and the
  graded exercise (a DNS TTL fix) are deliberately different scopes -
  showing the real topology here would misrepresent the exercise as building
  a registry, which it doesn't. Flagged in spec §12 for a second reader.
- **Third confirmed instance of open decision 8 (`control`-kind edges aren't
  buildable on canvas), not a new finding.** CURRICULUM's own 3.9 row states
  "control edges become load-bearing" - the health signal behind the
  registry pattern is the same `control`-kind edge 3.4 introduced and 3.8
  already disclosed as not buildable. Decision 8 itself named 3.9 as a
  chapter that would hit this wall when it was first raised at 3.4 - this is
  that prediction confirmed, handled with the same discipline (illustrative
  only, disclosed in `curriculumContext.simplifications`), not a fresh gap.
  See the update to decision 8 below.
- **Quiz reuses both bank questions explicitly reserved for this chapter.**
  QUIZ_FRAMEWORK.md §9's own bank Q7 (tagged "(3.9)": hardcoded addresses
  breaking once autoscaling exists) and Q9 (tagged "(3.9, 3.4)": the
  liveness-vs-readiness gap) were both untouched by 3.6/3.7/3.8's own quizzes
  - reworded with fresh option labels for Q3 and Q5 respectively rather than
  reproduced verbatim. Q4 (`diagram` kind) is original, realizing CURRICULUM's
  row's "trace" exercise element as a predict-then-check question (a newly
  autoscaled instance that hasn't passed its first health check yet) -
  distinct from bank Q6 (already used by 3.8's own Q4: an existing instance
  dying) and from this chapter's own Q5 (an instance that passes its check
  but is broken anyway).
- **Component budget carries the full chain through 3.8 unchanged** - no new
  component; `load-balancer` (3.4) is reused as the chapter's own worked
  example of an already-built registry-shaped mechanism, and `dns` (3.2) is
  reused for its `ttlSeconds` field, the same "same component, second job"
  pattern §19 names directly (a job DNS's own docs already anticipated: "a
  low TTL enables fast failover... at the cost of more lookup traffic").
- **Airbnb (SmartStack) as the production example** - unused by any prior
  chapter (Stripe was 3.6's, Shopify was 3.7's, Netflix was 3.8's), and
  on-topic: a real, public, load-bearing registry (Nerve + Synapse, backed by
  ZooKeeper) built because a growing service fleet outgrew a hand-maintained
  address list.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group B row - fourth and final chapter checked,
  2026-08-23 - matches, and closes the row.** 2.3's row: "Copies of the app
  tier only work if a request can land anywhere | 3.6-3.9." This chapter
  names the mechanism (the registry pattern, already running inside 3.4's
  load balancer) that makes "which copies currently exist" an answerable
  question at all - the precondition every one of 3.6, 3.7, and 3.8 silently
  assumed. All four Group B rows named in open decision 15 are now checked;
  see the update to that decision below.
- **3.8's own "Next" section teases 3.9 directly** ("once instance count
  stops being a number you pick by hand... something has to track which
  instances actually exist right now. 3.9 Service Discovery is that
  system.") - this chapter's cold open opens by quoting that bridge
  directly, continuing the chain 3.1-3.8 already established.
- **Third confirmed instance of open decision 8**, addressed above and in
  the decision's own update below - not a new instance requiring a fresh
  decision entry.

---

## 3.10 Databases

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-10-databases` · manifest slug `3-10-databases` · spec
  `src/content/chapters/specs/bb-3-10-databases.spec.md` · lesson
  `public/content/chapters/bb-3-10-databases.mdx`
- Type: Concept, per §16's own audit (CURRICULUM §14's own row omits an
  explicit `Type:` label - see spec §0) · intermediate · 25 min · assumes
  3.9, already shipped in this working tree
- First Group C chapter, authored immediately after Group B (3.6-3.9)
  completed in this session - same out-of-wave-plan note every Wave 3/4
  chapter's own entry already carried forward (real prerequisite already
  shipped, only `pending-content.md`'s wave grouping is out of order).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-10-databases.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-10-databases.mdx` (1,357 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no Editor exercise exists for this chapter (see below); `validationRuleIds: []` |
| 5 | Quiz | 6 questions (one heavier than the 5-question default), difficulty ramp 1/1/2/2/3/3 |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **No Editor exercise at all (`hasEditorExercise: false`) - the first
  Building Blocks chapter since 3.1 to ship with none.** CURRICULUM §14's
  own row for 3.10 names an exercise ("config (indexes; observe simulated
  query cost)") that the engine cannot support today: `sql-database`'s only
  field is `engine` (postgres/mysql), no component or validation rule
  anywhere inspects indexing or query cost, and §11.1's own "Config"
  exercise-type table doesn't list 3.10 among its "Where used" chapters
  either - CURRICULUM's own §11.1 and §14 already disagree with each other
  here. Not hacked around: adding an `indexes` field to the global
  `sql-database` registry entry is engineering work outside this pass's
  scope, and repurposing `engine` the way 3.9 repurposed DNS's `ttlSeconds`
  would misteach the concept (postgres vs. mysql has no honest
  relationship to indexing cost). CURRICULUM's own row's "+ quiz-weighted"
  phrase is read as license for the resolution: no build, a heavier
  six-question quiz including a diagram-kind predict-then-check (Q4) that
  realizes "observe simulated query cost" without a simulator - the same
  no-simulator workaround 3.9's own Q4 already established. Full reasoning
  and the new open decision this raises are in spec §0 and §6.
- **Primary diagram doubles as both the mental-model anchor and a real,
  unchanged topology diagram** - unlike 3.9's explicitly illustrative-only
  registry diagram, 3.10's diagram (three app-server nodes converging on one
  sql-database node) is this system's actual topology, isolating the fan-in
  shape rather than reproducing the full eight-node chain. Flagged in spec
  §12 for a second reader to confirm this doesn't read as a new starter
  graph the learner might expect to build.
- **CURRICULUM §14's own row for 3.10 omits an explicit `Type:` label**,
  unlike every sibling row in Groups A/B. Resolved via §16's own audit line
  (3.10 listed among "3.6-3.10... intentional" no-component Concept
  chapters) rather than left ambiguous. Same class as decisions 1, 4, 6, 7
  and 16 (CURRICULUM rows contradicting each other or omitting what a
  sibling row states) - a doc-only fix for later, not blocking.
- **Quiz leans on two bank questions explicitly reserved for this chapter
  and deliberately leaves three more untouched.** QUIZ_FRAMEWORK.md §10's
  own bank Q1 and Q2 are both tagged "(3.10)" (indexes turning scans into
  lookups; the 10k-vs-100M-rows scan symptom) and were adapted, reworded,
  into this chapter's own Q1 and Q3. Bank Q3/Q4 (tagged "(3.11)") and Q5
  (tagged "(3.12)") were left untouched, reserved for those chapters. Q2,
  Q4, Q5, and Q6 are original.
- **Component budget carries the full chain through 3.9 unchanged** - no new
  component; the diagrams and `CurriculumContext.masteredConcepts` still
  reference the full eight-component chain even though there's no Editor
  exercise to place them in, consistent with Part 3's own running-example
  philosophy.
- **Stack Overflow as the production example** - unused by any prior chapter
  (Stripe was 3.6's, Shopify was 3.7's, Netflix was 3.8's, Airbnb was 3.9's),
  and on-topic: a real, public example of a small number of powerful,
  heavily indexed relational database machines carrying serious load well
  past the point most teams reach for sharding or a new storage engine.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group C row - first of five remaining rows checked,
  2026-08-23 - matches.** 2.3's own row for Group C: "Every instance reaches
  one database, and it is now the ceiling | 3.10-3.13." This chapter's cold
  open and primary diagram state exactly that constraint, and its own "What
  changes at scale" section quotes 2.3's own follow-up roadmap sentence
  almost verbatim ("copies for reads (3.12)... splitting the data
  (3.13)... a faster layer in front (3.14)"). See the update to decision 15
  below.
- **3.9's own "Next" section teases 3.10 directly** ("Every service you've
  built so far ends at the same place: one SQL Database, taken for granted
  since 1.2. 3.10 Databases is where that assumption finally gets
  examined...") - this chapter's cold open opens by continuing that bridge
  directly, extending the chain 3.1-3.9 already established.
- **New open decision raised, not a confirmed instance of decision 8 or
  14** - see the new numbered entry below. Distinct in kind from both: 8 and
  14 name real capabilities (an edge kind, a failure-state field) missing
  from an otherwise-relevant part of the schema; here, CURRICULUM's own row
  names an exercise mechanism (`indexes` config, query-cost simulation)
  with no corresponding schema anywhere in the engine to extend.

---

## 3.11 SQL vs. NoSQL

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-11-sql-vs-nosql` · manifest slug `3-11-sql-vs-nosql` ·
  spec `src/content/chapters/specs/bb-3-11-sql-vs-nosql.spec.md` · lesson
  `public/content/chapters/bb-3-11-sql-vs-nosql.mdx`
- Type: **Building Block**, per §4/§16 (introduces `nosql-database`) - the
  first Group C chapter to carry that classification; 3.10 was Concept · 
  intermediate · 25 min · assumes 3.10, already shipped in this working tree
- Second Group C chapter, authored immediately after 3.10 in this session -
  same out-of-wave-plan note every Wave 3/4 chapter's own entry has carried
  forward (real prerequisite already shipped, only `pending-content.md`'s
  wave grouping is out of order).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-11-sql-vs-nosql.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-11-sql-vs-nosql.mdx` (1,368 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | `["no-direct-client-database", "component-relations", "orphan-component", "missing-input-connection"]` - standard curated set, gates the wiring half; the config half is gated by the blueprint's own `config` predicate |
| 5 | Quiz | 6 questions, difficulty ramp 1/1/2/2/3/3, matching 3.10's own ramp |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **Building Block, not Concept - the first Group C chapter with a real
  Editor exercise.** CURRICULUM §16's own audit gives 3.11 its own row
  ("3.11 | `nosql-database`") and it's absent from the "Concept chapters with
  no component" list 3.6-3.10 share. Consequence: Failure modes and Scaling
  considerations are mandatory sections here (§6's table), not optional the
  way 3.10's and 3.7's specs justified folding or omitting them. Full
  reasoning in spec §0.
- **Starter graph's NoSQL Database node is pre-configured to a deliberately
  *wrong* value (`model: "key-value"`), not the registry's own default
  (`"document"`).** If left at the default, the config half of the exercise
  (choosing the right `model` for the catalog's varying-attribute shape)
  would pass without the learner ever touching it - only the quiz would test
  that judgment. Setting it to a different, real, plausible-but-wrong NoSQL
  shape makes the fix genuine: recognize the mismatch, not just draw a wire.
  Flagged in spec §12 for a second reader to confirm this reads as a fair
  Completion fix, not a disguised trick.
- **The three CURRICULUM-mandated trade-off scenarios (one SQL, one NoSQL,
  one "either") are realized as an in-lesson table plus quiz, not a
  dedicated Editor "present two graphs, pick one" exercise.** Same reading
  3.7's own spec established for §11.1's "Trade-off scenario" exercise type
  (also reserved for 3.11 in that same taxonomy row) - no such Editor
  affordance exists in the engine, and building one is outside this pass's
  scope. Second independent application of that same judgment call since
  3.7; flagged in spec §12 for a second reader to confirm it still holds.
- **Quiz spends both bank questions reserved for this chapter and leaves the
  3.12-tagged one untouched.** QUIZ_FRAMEWORK.md §10's own bank Q3 and Q4 are
  both tagged "(3.11)" (the non-negotiable-relational-requirement question;
  the "we'll be big" teammate scenario) and were adapted, reworded, into this
  chapter's own Q3 and Q5. Bank Q5 (tagged "(3.12)": replication lag) was
  left untouched, reserved for that chapter. Q1, Q2, Q4, and Q6 are original.
- **Component budget adds exactly one new component, no new edge kind.**
  `nosql-database`'s own `relations` in `src/content/components/config/data.ts`
  already mirror `sql-database`'s exactly (same allowed categories/kinds on
  both ports) - no engine change was needed to support this chapter's
  exercise, unlike 3.4's `control`-edge gap (open decision 8) or 3.10's
  missing `indexes` field (open decision 17).
- **Discord as the production example** - unused by any prior chapter
  (Stripe 3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10),
  and on-topic: a real, public example of write volume and a simple
  channel-plus-time access pattern driving a wide-column NoSQL store, not a
  belief that NoSQL is generally faster.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group C row - second of five remaining rows checked,
  2026-08-23 - matches.** 2.3's own row for Group C: "Every instance reaches
  one database, and it is now the ceiling | 3.10-3.13." This chapter is a
  direct continuation of 3.10's own application of that row - 3.10 examined
  the ceiling itself, this chapter examines whether a relational store was
  the right shape to hit it with. See the update to decision 15 above (§6 of
  this chapter's spec).
- **3.10's own "Next" section teases 3.11 directly** ("3.10 assumed the
  answer was always a relational store. 3.11 SQL vs. NoSQL is where that
  assumption gets defended - or found wrong for the workload in front of
  you.") - this chapter's cold open opens by paying that off directly, word
  for word in its first sentence.
- **No new open decision raised.** `nosql-database`'s registry entry already
  supported this chapter's exercise with no engine gap (see the component
  budget note above) - the first Group C chapter, after 3.10's own new
  finding, to need nothing new from the engine.

---

## 3.12 Replication

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-12-replication` · manifest slug `3-12-replication` ·
  spec `src/content/chapters/specs/bb-3-12-replication.spec.md` · lesson
  `public/content/chapters/bb-3-12-replication.mdx`
- Type: **Building Block**, per §4/§16 (introduces `read-replica` + edge kind
  `replication`) - intermediate · 30 min · assumes 3.11, already shipped in
  this working tree.
- Third Group C chapter, authored immediately after 3.11 in this session -
  same out-of-wave-plan note every Wave 3/4 chapter's own entry has carried
  forward (real prerequisite already shipped, only `pending-content.md`'s
  wave grouping is out of order).

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-12-replication.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-12-replication.mdx` (1,375 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | `["no-direct-client-database", "component-relations", "orphan-component", "missing-input-connection", "orphan-read-replica"]` - 3.11's curated set plus `orphan-read-replica`, this chapter's own namesake rule |
| 5 | Quiz | 6 questions, difficulty ramp 1/1/2/2/3/3, matching 3.10's and 3.11's own ramp |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **`read-replica` and `orphan-read-replica` already existed, fully wired,
  before this chapter was authored - the second Group C chapter in a row
  (after 3.11) to need nothing new from the engine.** Checked directly
  against `src/content/components/config/data.ts` and
  `src/validation-engine/rules/orphan-read-replica.ts`. Unlike 3.4's
  `control`-edge gap (open decision 8) or 3.10's missing `indexes` field
  (open decision 17), both the component and its namesake rule were already
  built - evidently in anticipation of this exact chapter.
- **New finding: the correct read-path edge direction is Replica ->
  Application Server, not the reverse.** `compute.ts`'s own inline comment
  on `app-server` confirms it ("a Read Replica's own 'Read query' output
  targets compute"), and `read-replica`'s own `relations` only accept a
  `request-flow` edge going *out* toward `compute`, never *in* from it. This
  chapter's diagrams, blueprint, and starter graph all use that direction.
- **New open decision 18: QUIZ_FRAMEWORK.md §10's own bank Q5 (reserved for
  this exact chapter) draws that same edge backwards.** Its `e3` is
  authored `app-server -> read-replica`, which would fail
  `component-relations` today. Not hacked around - this chapter's own quiz
  Q4 adapts Q5's scenario with the corrected direction rather than
  reproducing the bank JSON verbatim. QUIZ_FRAMEWORK.md's own bank still
  needs a follow-up doc edit. Full reasoning in spec §6 and §10.
- **The starter graph's one wrong edge is deliberately overdetermined, not
  a single clean fault.** `app -> replica` (`request-flow`) is the same
  move that correctly wires every other data component in this system
  (`app -> db`, `app -> nosql`), pointed at a component whose input
  contract is different - it fails `component-relations` AND leaves the
  Replica `orphan-read-replica`-orphaned at once. Same one-fault-two-rules
  efficiency 3.9's own spec established reusing `dns`'s `ttlSeconds` field.
  Flagged in spec §12 for a second reader to confirm this reads as a fair
  Fix/Build hybrid, not a disguised trap.
- **The "trace" beat CURRICULUM's own row promises degrades to a
  `diagram`-kind quiz question (Q4), not a real interactive simulator
  trace.** Fourth confirmed instance of `pending-content.md`'s own named
  degradation path (open decision 7) - the same call 1.6, 1.7, and 3.4 each
  already made.
- **No `<Walkthrough>` authored for the replication-lag sequence**, despite
  it being a defensible candidate under §7.2's own "step-through" rule -
  stayed with a static Mermaid sequence diagram to keep this pass inside
  `chapter-author`'s own content-authoring scope. Flagged in spec §12 for a
  second reader or a dedicated `walkthrough-diagram` pass later.
- **Production example: GitHub** - unused by any prior chapter (Stripe 3.6,
  Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11),
  and on-topic: read volume dwarfing write volume drove a public,
  well-documented read-replica split.
- **Quiz Q6 reuses `read-replica`'s own `replicationLagBudgetMs` field by
  name in a wrong-answer distractor** - same component-field-reuse pattern
  3.9's own quiz used for `dns`'s `ttlSeconds`.
- **No density revision pass performed as a distinct drafting round** -
  matching every prior chapter's own precedent of flagging a self-assessed
  density claim for the next reviewer to check rather than trust.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group C row - third of five remaining rows checked,
  2026-08-23 - matches, and is the first to actually move the ceiling.**
  2.3's own row for Group C: "Every instance reaches one database, and it is
  now the ceiling | 3.10-3.13." 3.10 examined the ceiling itself, 3.11 asked
  whether the store's shape fit it; this chapter is the first concrete
  mechanism in the row that actually relieves it (for reads, not writes -
  named explicitly in "What changes at scale").
- **3.11's own "Next" section teases 3.12 directly** ("3.11 asked which
  store to reach for. 3.12 Replication is where copies of that store enter
  the picture - for reads, and for the first guarantee that isn't there for
  free: read-your-writes.") - this chapter's cold open opens by paying that
  off directly, in its first sentence.
- **One new open decision raised (18)**, detailed above and in the "Open
  decisions" list below - a doc-drift finding in QUIZ_FRAMEWORK.md, not an
  engine gap.

---

## 3.13 Sharding

- **Authored 2026-08-23** · Sonnet draft, no Opus pass yet · uncommitted,
  working tree (`fix/streak-counter`)
- Definition id `bb-3-13-sharding` · manifest slug `3-13-sharding` · spec
  `src/content/chapters/specs/bb-3-13-sharding.spec.md` · lesson
  `public/content/chapters/bb-3-13-sharding.mdx`
- Type: **Concept, config-weighted**, per CURRICULUM §14's own explicit label
  and §16's own audit row - intermediate · 30 min · assumes 3.12, already
  shipped in this working tree.
- Fourth and final Group C chapter, authored immediately after 3.12 in this
  session - Group C (3.10-3.13) is now complete. Same out-of-wave-plan note
  every Wave 3/4 chapter's own entry has carried forward.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-13-sharding.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-13-sharding.mdx` (1,267 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None - no Editor exercise (`validationRuleIds: []`) |
| 5 | Quiz | 6 questions, difficulty ramp 1/1/2/2/3/3, matching 3.10's, 3.11's, and 3.12's own ramp |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **No Editor exercise at all, a second Group C chapter in a row to lack
  one - but a stronger-than-3.10 confirmed gap.** CURRICULUM §14's own row
  promises "config (shard-key choice ×2 workloads; hot-partition
  explanations) + trade-off (range vs. hash)," and unlike 3.10 (where §11.1
  didn't even list the chapter), §11.1's own "Config" exercise table
  explicitly lists 3.13 - CURRICULUM's own two sections agree with each
  other on a promise the engine can't support. Checked directly against
  `src/content/components/config/data.ts`: neither `sql-database` nor
  `nosql-database` has a shard-key field. `search-engine`'s own `shards`
  field (index parallelism, a different mechanism) was checked and ruled out
  as a substitute. Resolved the same way 3.10's own gap was: no Editor
  exercise, six-question quiz-weighted assessment instead. New open decision
  19, distinct in kind from 17 because both CURRICULUM sections agree with
  each other here.
- **QUIZ_FRAMEWORK.md's own bank already had four questions reserved for
  this exact chapter (tagged "(3.13)"), all four spent.** Q8 (hot
  partition), Q9 (range-sharding's own moving hot spot), Q10 (when sharding
  is the wrong move), Q11 (cross-shard scatter-gather cost) map directly
  onto CURRICULUM's own three exercise elements - adapted with fresh option
  labels, not reproduced verbatim, per this chapter's own quiz Q2/Q3/Q5/Q6.
- **Primary diagram deliberately contrasts against 3.12's own replication
  diagram in its own caption** - copies of the same data (3.12) vs. slices
  of different data (3.13), the two mechanisms this curriculum could
  otherwise blur together.
- **Production example: Instagram** - unused by any prior chapter (Stripe
  3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10, Discord
  3.11, GitHub 3.12), and on-topic: a shard-encoding ID scheme chosen
  specifically to keep by-ID lookups confined to one shard.
- **Word count (1,267) is lower than 3.10's own 1,357** for the same
  no-build, six-question shape - flagged in spec §12 for a second reader to
  confirm this reflects genuinely narrower content (one central decision
  examined from several angles) rather than under-depth.
- **No density revision pass performed as a distinct drafting round** -
  matching every prior chapter's own precedent of flagging a self-assessed
  density claim for the next reviewer to check rather than trust.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group C row - fourth and final row checked,
  2026-08-23 - matches, and closes out the group.** 2.3's own row for Group
  C: "Every instance reaches one database, and it is now the ceiling |
  3.10-3.13." 3.10 examined the ceiling, 3.11 asked whether the store's
  shape fit it, 3.12 relieved it for reads, and this chapter is the last
  lever for writes. All four of Group C's own rows are now checked; Groups
  D-G remain open as their own chapters are authored.
- **3.12's own "Next" section teases 3.13 directly** ("3.12 gave every copy
  of the primary a job... 3.13 Sharding is what happens once that stops
  being enough - once even the primary's own writes have outgrown one
  machine, and the data itself has to split, not just copy.") - this
  chapter's cold open opens by paying that off directly, in its first
  sentence.
- **One new open decision raised (19)**, detailed above and in the "Open
  decisions" list below - an engine gap, same class as decision 17 but a
  stronger, more clearly unintentional instance of it.

---

## 3.14 Caching

- **Authored 2026-08-26** - one-shot `chapter-author` pass (Opus), no cold
  second read yet - uncommitted, working tree (`feat/content-audit`)
- Definition id `bb-3-14-caching` - manifest slug `3-14-caching` - spec
  `src/content/chapters/specs/bb-3-14-caching.spec.md` - lesson
  `public/content/chapters/bb-3-14-caching.mdx`
- Type: **Building Block**, per CURRICULUM §14's own "New: `cache`,
  `distributed-cache`" and §16's audit row - intermediate - 35 min - assumes
  3.13, already shipped in this working tree.
- First Group D chapter, authored immediately after Group C completed. Same
  out-of-wave-plan note every Wave 3/4 chapter has carried: `pending-content.md`
  puts Group D in Wave 5, but the real prerequisite chain is intact, so only the
  wave grouping is out of order, not the sequencing.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-14-caching.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-14-caching.mdx` (1,964 words) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 3.12's curated set unchanged; the chapter's fault is already `missing-input-connection`'s documented case |
| 5 | Quiz | 6 questions, ramp 1/1/2/2/3/3, matching 3.10-3.13's ramp |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **The whole exercise is one missing edge, and that is deliberate.** The
  starter is 3.12's passing system plus a Cache whose miss path to the primary
  is *already drawn*, with nothing feeding it. The learner adds `app -> cache`,
  and that single edge is the entire cache-aside read path - a cache with a
  correct origin and nobody reading from it is exactly the failure the chapter's
  thesis predicts. Flagged in spec §12 for a reviewer to confirm it doesn't read
  as thin next to 3.12's remove-one-add-two.
- **First Part 3 exercise whose graded fault is error-severity.** 3.4, 3.6 and
  3.7 all built on warning-severity faults, so their starter graphs *passed*
  Validate while listing an issue (open decision 11's standing complaint). This
  chapter's fault is `missing-input-connection` (error), so Validate genuinely
  fails on the starter. Chosen for that reason, not stumbled into - recorded
  under decision 11 as evidence.
- **CURRICULUM §14's "config (TTL)" beat is deliberately NOT gated by the
  blueprint.** It is expressible (`{ field: "ttlSeconds", op: "lte", value: 60 }`)
  and was drafted that way before being pulled. A failed config predicate makes
  the pattern node bind to nothing, so `blueprint-drift.ts` reports it as
  `missingComponents: ["Cache"]` - "Missing: Cache" while a Cache is plainly on
  the canvas. Shipping that as the chapter's *primary graded feedback* would
  knowingly put a misleading message on its own namesake beat. TTL is taught in
  the lesson and tested by quiz Q3 instead. **Recorded as a new argument under
  open decision 11, not as a new decision** - it is the same drift gap, hit from
  a third direction.
- **§14's "fix (per-instance caches)" is not drawable and is realized as quiz
  Q4.** A cache living inside an app server's own memory has no expression on
  this canvas - a `cache` node is always a separate box, and `app-server`'s
  `instances` field multiplies the server, not anything attached to it.
  **Deliberately not raised as an open decision**, unlike 17 and 19: this is a
  modelling boundary the canvas draws on purpose (a component is a box), not a
  missing schema.
- **First chapter where `requiredComponentIds` deliberately omits a component
  that is in `availableComponentIds`.** §16 homes both `cache` and
  `distributed-cache` here, so both are in the palette and both are taught;
  only `cache` is required. Forcing a Distributed Cache onto a system this size
  would teach the cargo-culting §9 lens 9 exists to inoculate against, and
  §11.1 forbids a secretly-correct option. Consequence worth knowing for future
  chapters: because `distributed-cache` is available-but-absent-from-the-starter,
  `authoring-invariants.test.ts`'s brief-spoiler gate forbids the string
  "Distributed Cache" anywhere in `exerciseGoal`/`successCriteria`.
- **Sixth instance of open decision 7** (§14 promises a simulator beat the
  product doesn't have): "the simulator's hit/miss branching" is realized as the
  lesson's sequence diagram plus quiz Q1/Q6, via `pending-content.md`'s own
  named degradation path. Nothing new raised.
- **Both new components needed nothing from the engine.** Checked directly
  against `src/content/components/config/caching.ts`: `cache` and
  `distributed-cache` both exist with full `relations` contracts matching what
  the build needs (`app -> cache -> primary`). Third consecutive chapter with no
  component gap.
- **The registry takes a position this chapter had to disclose.**
  `caching.ts`'s own comment on `cache.relations.outputs` says the miss edge
  points at the origin because "there's no realistic pattern where a cache calls
  back to the app server on a miss" - i.e. the canvas draws a read-through
  shape while the chapter teaches cache-aside (app-side miss logic). Disclosed
  in the lesson's own prose, not only in `simplifications`, per open decision
  10's standing ask.
- **Production example: Reddit** - unused by any prior chapter (AWS 3.1,
  Netflix 3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify
  3.7, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram
  3.13), and on-topic: memcached-backed listing/comment-tree reads, with the
  accepted staleness named.
- **Quiz spends all five of QUIZ_FRAMEWORK §11's bank questions tagged
  "(3.14)"** (Q1, Q2, Q3, Q4, Q10), adapted with fresh option labels. Q4's graph
  JSON gained `k1 -> d1` / `k2 -> d1` miss edges so the diagram matches the
  pattern this chapter teaches - an incomplete drawing, not a doc-drift bug like
  3.12's finding (the bank's own edges are all legal). The sixth question is
  original, covering the "where does cache-aside logic live" misconception the
  bank's Q1 note flags separately.
- **A density revision pass was performed as a distinct drafting round** (2,021
  words down to 1,909, before the canvas-vs-cache-aside disclosure paragraph
  brought it to 1,964) - the first chapter to do so rather than flag the claim
  for a reviewer. It should still be checked rather than trusted; 1,964 words
  for 35 minutes is a higher rate than 3.12's 1,375 for 30 or 3.13's 1,267 for
  30, defended in spec §12 as length following content.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group D row - opened 2026-08-26 - matches.** 2.3's row
  for Group D: "reads the database should not be answering | 3.14-3.16." This
  chapter's cold open is that sentence made concrete (one aggregate query the
  primary recomputes 4,999 times out of 5,000), and its thesis is removing those
  reads rather than redistributing them - which is exactly the distinction from
  Group C's row. First of the five remaining rows resolved; 3.15 and 3.16 keep
  Group D open.
- **3.7's forward promise checked and paid off in prose.** 3.7's lesson twice
  promises that 3.14 gives externalized sessions "a faster, purpose-built
  store," and §14 calls it "the promised payoff." Paid off in the "wrinkle"
  section and again in "Connections". **Not paid off in the build** - nothing on
  this canvas represents a session, since 3.7's own exercise externalized them
  onto the SQL Database that is still here. Flagged in spec §12: a reviewer
  should confirm a prose payoff satisfies a promise §14 calls "the promised
  payoff," or scope a starter-graph change.
- **3.13's own "Next" section teases 3.14 directly** ("3.14 Caching is the
  highest-leverage tool in this curriculum for the opposite problem - read load
  - cheap enough to reach for long before any of this chapter's own machinery is
  warranted"). This chapter's first two sentences pay it off in those terms.
- **No new open decisions raised.** Two existing ones gained evidence (11 and
  7); one candidate (the un-drawable per-instance cache) was examined and
  deliberately not raised, for the reason above.

---

## 3.15 CDN

- **Authored 2026-08-26** - one-shot `chapter-author` pass (Opus), no cold
  second read yet - uncommitted, working tree (`feat/content-audit`)
- Definition id `bb-3-15-cdn` - manifest slug `3-15-cdn` - spec
  `src/content/chapters/specs/bb-3-15-cdn.spec.md` - lesson
  `public/content/chapters/bb-3-15-cdn.mdx`
- Type: **Building Block**, per CURRICULUM §14's own "New: `cdn`" and §16's
  audit row - intermediate - 25 min - assumes 3.14, authored in this same
  working tree immediately before it.
- Second Group D chapter. Same out-of-wave-plan note every Wave 3/4 chapter has
  carried: `pending-content.md` puts Group D in Wave 5, but the real
  prerequisite chain is intact, so only the wave grouping is out of order.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-15-cdn.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-15-cdn.mdx` (1,721 prose words, excluding the walkthrough's prop literals) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 3.14's curated set unchanged, and deliberately not the feedback surface here (see below) |
| 5 | Quiz | 6 questions, ramp 1/1/2/2/3/3, matching 3.10-3.14's ramp; one `multi` |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **First authored chapter whose starter graph validates clean on purpose.**
  Every prior Part 3 exercise opened with a rule violation to read. This one is
  3.14's solved system, correct in every respect, and the problem is geography -
  which no validation rule measures. The transition brief and hint 1 both say
  outright that Validate will report nothing, so a learner doesn't read the
  silence as a broken button. Submit's blueprint drift is the graded feedback
  surface instead, and here it is accurate ("Missing: CDN" when the CDN really
  is missing) rather than the misleading form decision 11 tracks. **This is a
  third answer to decision 11's question** (which has so far only asked
  warning- vs. error-severity): a chapter can have no fault at all, only an
  absence. Flagged in spec §12 for a playtest read.
- **First chapter since 3.4 whose primary diagram is a `<Walkthrough>` rather
  than a Mermaid static, and the first authored under the chapter-author
  skill's own "prefer Walkthrough where the topology has a sequence" guidance.**
  Five nodes (Browser Sydney, DNS, two `cdn` edge nodes, an `app-server`
  origin), five steps, and **`pull` / `push` as the two algorithm variants** -
  which is where CURRICULUM §14's "push vs. pull" requirement is realized. Two
  edge nodes rather than one is deliberate: per-location caching (each location
  misses once for itself) is the most common misreading and one box can't show
  it. No second diagram, per §7.2's one-topology rule; two tables carry the
  comparative content.
- **`blueprint-drift.ts` is completely `forbid`-blind - a new, fourth shape of
  decision 11's drift gap, found while designing this exercise.** The cleanest
  build inserts the CDN and deletes the now-redundant `dns -> firewall` edge.
  Forcing that deletion would need a `Blueprint.forbid` pattern; `forbid` exists
  and `chapter-outcome.ts` honors it, but `blueprint-drift.ts` computes its
  entire report from `require` only. A learner who tripped a forbid pattern
  would fail Submit and get a drift report naming **nothing** missing and
  **nothing** mismatched - worse than the misleading "Missing: X" the decision
  already records. No authored chapter uses `forbid` today, and this one
  deliberately doesn't either: the blueprint requires `dns -> cdn` and
  `cdn -> fw` and does **not** require `dns -> fw`, so both the insert-and-delete
  build and the insert-and-keep build pass. Recorded under decision 11 below.
- **The blueprint deliberately drops a required edge its predecessor had.**
  3.14's blueprint required `dns -> fw`; this one doesn't, because a learner who
  removes that edge has built the better version of the same answer and would
  otherwise fail for it. Worth knowing for 3.16 and beyond: a carried-forward
  chain is not automatically still correct once a chapter inserts a node into
  it.
- **§14's "trade-off (which of five asset types belong on the CDN)" is quiz Q3,
  a five-option multi-select, not a canvas exercise.** A response type has no
  expression on this canvas - there is no asset or content-type object to
  present two graphs of - and QUIZ_FRAMEWORK §11's own bank Q5 already asks the
  question in exactly that form. **Deliberately not raised as an open decision**,
  unlike 17 and 19: nothing here is a missing engine capability, the canvas
  models components and this trade-off is not about a component.
- **The config beat (`cacheTtlSeconds`, `cacheDynamicContent`) is taught and
  quizzed, not gated.** Same reasoning and same underlying gap as 3.14's pulled
  `ttlSeconds` predicate (a failed config predicate reports as
  `missingComponents: ["CDN"]`). Both fields also already default to the right
  values for this exercise, so a predicate could only ever fire for a learner who
  changed them, and would then mislead. Another instance under decision 11, not
  a new decision.
- **First magenta "Build here" gap zone since 3.5.** Warranted here and
  deliberately absent on 3.14: the fix is a genuinely missing node in
  identifiable empty space (the unused middle slot of the second row), not a
  rewire of something already present. Node ids re-prefixed `bb-3-15-`, layout
  otherwise carried from 3.14 unchanged.
- **Component needed nothing from the engine.** Checked directly against
  `src/content/components/config/networking.ts`: `cdn` exists with
  `cacheTtlSeconds` (0-604800, default 3600) and `cacheDynamicContent` (default
  false), inputs restricted to category `networking` and outputs to
  `networking`/`compute`. That makes `dns -> cdn -> firewall` legal and
  `app-server -> cdn` illegal, which is exactly the right shape (a CDN is
  upstream of the origin, never behind it). Fourth consecutive chapter with no
  component gap.
- **Push provisioning is taught but not buildable** - the `cdn` component has no
  push/pull field, so the canvas build is pull-shaped. Realized in the
  walkthrough's variant selector, recorded in `simplifications`. No registry
  change proposed: a provisioning-model field in service of one chapter's prose
  is what §20.5's never-fork rule discourages.
- **Anycast disclosed in one clause, not taught.** Many real CDNs steer with
  anycast rather than DNS; §14 frames this chapter as closing 3.2's DNS-steering
  foreshadow, so DNS is the taught mechanism. Quiz Q4's option B leans on the
  same honesty (it is false *because* anycast exists).
- **Engineering nit found, flagged not fixed:**
  `src/chapters/walkthrough/WalkthroughAlgorithmSelect.tsx` hardcodes
  `aria-label="Routing algorithm"`. This chapter's selector chooses a
  provisioning model, so a screen-reader user hears the wrong noun. Sighted
  users are unaffected (the diagram's `description` prop names the choice).
  One-line prop change, out of scope for a content pass.
- **Production example: Wikipedia** - unused by any prior chapter (AWS 3.1,
  Netflix 3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify
  3.7, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram
  3.13, Reddit 3.14), and on-topic: anonymous page views served from caching
  data centres, signed-in readers bypassing them by design - this chapter's own
  cacheability rule in operational form.
- **Both of QUIZ_FRAMEWORK §11's bank questions tagged "(3.15)" are spent**
  (Q5 as this chapter's Q3, adapted into a multi-select; Q6 as Q4). The other
  four questions are original. Q7/Q8/Q9 (tagged 3.16) left untouched.
- **A density revision pass was performed as a distinct drafting round** (1,815
  words down to 1,685, then 1,721 once the anycast disclosure was added back),
  the second chapter to do so rather than flag the claim. 1,721 words for 25
  minutes is a higher rate than 3.14's 1,964 for 35;
  defended in spec §12 (two dense tables plus a walkthrough that costs reader
  time and no words) and flagged to be checked rather than trusted.

- **CI pipeline run and green** (typecheck, lint, 2,378 vitest tests, `next
  build`), against `chapter-author`'s content-only default but per CLAUDE.md's
  personal-preference note. One mechanical fix was needed:
  `src/content/chapters/index.test.ts` asserts the exact list of registered
  building-blocks chapter ids and **was already red on `bb-3-14-caching`** -
  3.14's own pass never ran the suite. Both `bb-3-14-caching` and `bb-3-15-cdn`
  were appended to that list. Worth knowing for the next chapter: registering a
  ChapterDefinition always requires that fixture update, and no invariants test
  catches the omission for you.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group D row - second of three checked, 2026-08-26 -
  matches.** 2.3's row for Group D: "reads the database should not be answering
  | 3.14-3.16." 3.14 removed the repeat read from the database; this chapter
  removes the request from the network before it can become a read at all - the
  same row one hop further out. 3.16 keeps Group D open.
- **3.2's forward promise checked and paid off in the build, not only in
  prose.** 3.2 names 3.15 twice ("why 3.15's CDN... is steered by DNS rather
  than by anything downstream of it", and its recap's "the mechanism 3.15's CDN
  builds on"). Paid off in the walkthrough's opening two steps, in "Connections"
  by name, and in the graded exercise itself - the edge the learner draws from
  DNS to the CDN *is* the steering decision. Stronger than 3.14's own 3.7
  payoff, which was prose-only and is still flagged in that chapter's spec.
- **3.14's own "Next" section teases 3.15 directly** ("that cache is 5 ms from
  your app server and 150 ms from a user in Sydney, and for the things everyone
  downloads identically, those 150 ms are now the entire latency budget"). This
  chapter's first three sentences pay it off in those terms, with the numbers
  restated rather than assumed.
- **No new open decisions raised.** Decision 11 gained two instances (the
  forbid-blind drift report, and the ungated config beat) plus a third answer to
  its original question; one candidate (a canvas form for per-response-type
  trade-offs) was examined and deliberately not raised, for the reason above.

---

## 3.16 Search Systems

- **Authored 2026-08-27** - one-shot `chapter-author` pass (Opus), no cold
  second read yet - uncommitted, working tree (`feat/content-audit`)
- Definition id `bb-3-16-search-systems` - manifest slug `3-16-search-systems` -
  spec `src/content/chapters/specs/bb-3-16-search-systems.spec.md` - lesson
  `public/content/chapters/bb-3-16-search-systems.mdx`
- Type: **Building Block**, per CURRICULUM §14's own "New: `search-engine`" and
  §16's audit row - intermediate - 30 min - assumes 3.15, authored in this same
  working tree immediately before it.
- Third and final Group D chapter; **Group D is complete** and Checkpoint R1 is
  next in `manifest.ts`. Same out-of-wave-plan note every Wave 3/4 chapter has
  carried: `pending-content.md` puts Group D in Wave 5, but the real prerequisite
  chain is intact, so only the wave grouping is out of order.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-16-search-systems.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-16-search-systems.mdx` (2,159 words incl. table cells, ~1,875 excluding, both excluding the walkthrough's prop literals) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 3.14's curated set unchanged for a third chapter |
| 5 | Quiz | 6 questions, ramp 1/1/2/2/3/3, matching 3.10-3.15's ramp; all `single` |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **§14's "search fed from the primary DB" is not drawable, and that is the
  chapter rather than a workaround.** Checked directly against
  `src/content/components/config/data.ts`: `search-engine.relations.inputs`
  allows category `compute` + kind `request-flow` only, and
  `sql-database.relations.outputs` allows category `data` + kind `replication`
  only, so a `sql-database -> search-engine` edge is rejected from **both** ends
  by `component-relations` in either kind. The only legal edge into a search
  engine is `app-server -> search-engine`, request-flow. §14's own parenthetical
  anticipates exactly this ("the sync arrow can't be request-flow, and doing it
  synchronously is wrong; the chapter lets the learner feel that before Group E
  names the machinery"), so registry and curriculum agree. The lesson says
  outright that the one edge is right for the query path and wrong for the
  indexing path, and that nothing in the palette yet means "after the response is
  sent" - the blueprint's debrief `commentary` repeats it. **Deliberately not
  raised as an open decision**, unlike 17 and 19: nothing is missing that should
  exist at 3.16. `async` is already in `EdgeKind` and arrives on schedule in
  3.17.
- **Second consecutive starter graph that validates clean on purpose.** 3.15 was
  the first (its own entry above); this one is 3.15's solved system with the CDN
  inserted and the redundant `dns -> firewall` edge removed. The problem is the
  shape of a query, which no rule measures. Both the transition brief and hint 1
  say Validate will be quiet, with a *different* argument than 3.15's ("look at
  what each component is organized around" rather than "distance isn't a wiring
  fault"). **Flagged in spec §12 as now a pattern rather than a novelty** - the
  playtest question is whether a learner who sees Validate stay quiet twice
  starts ignoring it, and a third clean starter in a row would need real
  justification.
- **The intuitive wrong build is a designed productive-failure moment, and its
  explanation is generic.** A learner who tries `sql-database -> search-engine` -
  literally what §14's row describes in prose - is stopped by
  `component-relations`, whose text names the component's own declared input
  contract. That is the chapter's thesis delivered by the validation engine,
  which is what §11.1 wants, but the message is the rule's generic one. Flagged
  in spec §7 and §12: a reviewer decides whether that suffices or whether this
  chapter warrants a scoped rule with teaching-quality text (new validation-rule
  work, not a content change). Hint 3 pre-empts the attempt without spoiling that
  it is available.
- **Second consecutive `<Walkthrough>` as the primary diagram, and the first
  authored with no algorithm variants.** Four component nodes (Browser, App
  Server, SQL Database, Search Engine), three request-flow edges, six steps: a
  write in 1-2, a read in 3-5 (including hydration - the index returns ids, the
  primary returns rows), and the dual-write divergence in step 6. The
  sync-path comparison was examined as a variant pair (dual write vs. change
  stream) and **rejected**: a variant can change captions and highlights but not
  edge kinds or endpoints, so both would be the same request-flow arrow described
  two ways, which is the exact misreading the chapter exists to prevent. The
  `app -> search` edge is drawn once and reused by three steps rather than
  duplicated per job.
- **Open decision 14 bites again, handled 2.2's way.** Step 6 is a failure step
  and `WalkthroughStep` still has no faulted node/edge state. The caption carries
  the failure explicitly and the highlight set is the two things that disagree
  (App Server, Search Engine, and the edge between them), with the SQL Database
  left dark because it is the one that is right. Recorded as a workaround, not a
  satisfied §7.2 rule. No new instance of the decision - same gap, same shape.
- **The `shards` config field is taught in the scaling section and not gated.**
  Same reasoning as 3.14's pulled `ttlSeconds` and 3.15's `cacheTtlSeconds`: a
  failed config predicate reports as `missingComponents: ["Search Engine"]`. It
  also defaults to 1, which is correct here, and gating it would teach a learner
  to shard an index at 4.2 million documents - the cargo-culting §9 lens 9 exists
  to inoculate against. Another instance under decision 11, not a new decision.
- **"Next" names Checkpoint R1; the single §19 forward tease is 3.17.** First
  chapter to face this, because no prior chapter has been the last before a
  checkpoint. §6 requires "Preview of next" to name what actually comes next
  (`manifest.ts` says R1); §14's row requires this chapter to bridge into Group
  E (which means 3.17). Resolved by putting the marked tease at the end of
  "Connections" (§19's own placement) and giving "Next" to R1 alone - R1 is a
  checkpoint over already-taught material, so it is a preview, not a forward
  reference, and §19's one-tease budget is not spent on it. Worth knowing for
  3.19, 3.22 and 3.26, which sit before R2/R3 in the same position.
- **`search-engine` has no output port**, so results returning to the app tier
  are implied, not drawn - the same convention every prior chapter's read paths
  use. Recorded in `simplifications`, not treated as a gap. Fifth consecutive
  chapter with no component gap.
- **The starter graph resolves 3.15's deliberately-open edge.** 3.15's blueprint
  required neither `dns -> fw` nor its absence, so both builds passed. A concrete
  starter has to pick one; this one picks the delete-it build, which is what
  3.15's own debrief commentary describes as the cleaner answer. Worth knowing
  generally: a chapter that leaves two passing builds still hands exactly one of
  them forward.
- **The `nosql` blueprint node keeps 3.15's `model: "document"` config
  predicate**, carried forward rather than re-litigated. It can only fail for a
  learner who changes a dropdown the exercise never mentions, and would then
  report "Missing: NoSQL Database" - decision 11's known drift shape, inherited
  rather than newly introduced.
- **No RWE cross-reference in the Interview lens, and this one is worth a
  cross-cutting pass.** §19 asks Interview lens sections to name which RWE
  projects exercise the chapter, and §15 lists six that lean on 3.16 (Metrics
  Monitoring, Price Tracking, News Aggregator, Facebook Post Search, Yelp,
  InShorts, Strava). Checked by grep across `public/content/chapters/*.mdx`: **no
  authored lesson names an RWE project.** Omitted and declared for the same
  reason §12's nuggets are - a device that starts in one chapter mid-curriculum
  diverges it from fifteen neighbours for no reader benefit. Same shape as
  decision 5; it belongs in one retrofit pass, not per chapter.
- **Production example: Slack** - unused by any prior chapter (AWS 3.1, Netflix
  3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify 3.7, Airbnb
  3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram 3.13, Reddit
  3.14, Wikipedia 3.15), and on-topic per §13's decision-not-company rule: a
  separately built and served message index, with the accepted freshness
  trade-off named, closing on §9 lens 9 (the same trade is wrong at 200,000
  documents).
- **All three of QUIZ_FRAMEWORK §11's bank questions tagged "(3.16)" are spent**
  (Q7 as this chapter's Q1, Q8 as Q3, Q9 as Q5). **Group D's bank is now fully
  consumed**: 3.14 took Q1-Q4 and Q10, 3.15 took Q5-Q6, 3.16 takes Q7-Q9. Bank
  Q7's own distractors ("LIKE is deprecated", "databases block the % character")
  were not carried over - they are joke options under §1 point 3 - and were
  replaced with three real diagnoses.
- **A density revision pass was performed as a distinct drafting round** (2,275
  words down to 2,159 across eleven rewritten passages), the third chapter to do
  so rather than flag the claim. ~1,875 words excluding table cells for 30
  minutes is 62 prose words/minute, between 3.14's 56 and 3.15's 69; defended in
  spec §12 (three tables plus a six-step walkthrough that costs reader time and
  no words) and flagged to be checked rather than trusted.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group D row - third of three checked, 2026-08-27 -
  matches, and closes the row.** 2.3's row for Group D: "reads the database
  should not be answering | 3.14-3.16." 3.14 removed the repeat read; 3.15
  removed the request before it could become a read; 3.16 removes the read the
  database was never the right shape to answer at all - the row's strongest case.
  **Group D is the third of the seven groups to fully resolve its own row**
  (after A and B, alongside C). Groups E-G remain open.
- **3.15's forward promise checked and paid off in the first two paragraphs.**
  3.15's "Connections" ends "Coming in 3.16: a read that no amount of copying
  helps," and its "Next" spells out the terms (a `waterproof` query answered by
  reading every row; a cache useless because every search is a different
  question). Both halves are paid off in this chapter's cold open in those exact
  terms, the Think-first callout rules out all three prior levers explicitly, and
  quiz Q2 grades the cache half.
- **3.2's DNS-steering payoff and 3.14's cache path both survive intact** in the
  carried-forward starter graph, so nothing 3.15 built is undone.
- **No new open decisions raised.** Decision 11 gained one instance (the ungated
  `shards` field); decision 14 was hit again with no new shape. Two candidates
  were examined and deliberately not raised: the undrawable `sql-database ->
  search-engine` edge (which is the chapter's own thesis, not a gap) and the
  missing RWE cross-reference (which is decision 5's shape and belongs in one
  cross-cutting pass).

---

## Checkpoint R1 - A Site That Stays Up

- **Authored 2026-09-07** - one-shot `chapter-author` pass (Opus), no cold
  second read yet - uncommitted, working tree (`feat/content-audit`)
- Definition id `bb-r1-a-site-that-stays-up` - manifest slug
  `checkpoint-r1-a-site-that-stays-up` - spec
  `src/content/chapters/specs/bb-r1-a-site-that-stays-up.spec.md` - lesson
  `public/content/chapters/bb-r1-a-site-that-stays-up.mdx`
- Type: **Checkpoint** (CURRICULUM §4, §14 Part 4) - intermediate - 45 min -
  assumes 3.16, authored in the same working tree immediately before it.
- **The curriculum's first checkpoint.** R2 and R3 will inherit whatever ships
  here, so the precedent-setting decisions are listed below rather than buried
  in the spec.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-r1-a-site-that-stays-up.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-r1-a-site-that-stays-up.mdx` (~770 words, four sections - the whole §6 Checkpoint inventory) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new. Widest curated set shipped so far: 8 of the registry's 10 |
| 5 | Quiz | **None** - §22, checkpoints have none, the build is the assessment |
| 6 | Playtest pass | Spec §11 (14-row move-to-chapter table, every move sourced) |

Also wired: `manifest.ts`'s R1 row (`chapterDefinitionId` null -> the id above)
and `src/content/chapters/index.test.ts`'s `getChaptersForMode` id list, which
is an ordered literal and fails without the new entry. Flagged to the user
rather than done silently, since this skill does not write tests.

**Judgment calls made:**

- **§6's Checkpoint column is a prohibition list, not an optional list, and the
  lesson is four sections long because of it.** Eleven of the fifteen sections
  are marked `-`, including Visual explanation, so R1 ships **no diagram** -
  the first authored chapter with none. The justification is stronger than
  "the table says so": the diagram this chapter would draw is the answer to its
  own exercise. Recorded in spec §4 and §5 rather than left as silent absence,
  because next to sixteen ten-plus-section chapters a four-section lesson
  otherwise reads as an unfinished draft.
- **`problemStatement` carries the full nine-bullet requirement list, against
  §11.2's "short scenario (2-3 sentences)" norm.** A checkpoint has no separate
  lesson content to hold the brief (§4: the chapter *is* the exercise), so the
  requirements have to be in the Editor with the learner. Calibration was
  checked bullet by bullet by hand: every one states a symptom or an outcome,
  none names a component, field, edge kind or count. This is the first
  deliberate departure from the 2-3 sentence rule and it should be reviewed
  before R2 copies it.
- **Two blueprints, both honest, on exactly one axis.** The redundancy
  requirement has two correct expressions: one `app-server` node with
  `instances >= 2` (3.8's taught shape, and the shape 3.4-3.16 all drew), or
  two distinct `app-server` nodes behind the load balancer, which is what
  `single-instance-load-balancer` itself counts as capacity 2. Aliases bind
  injectively (`pattern.ts`'s `backtrack`), so the second genuinely requires two
  nodes. Everything else about the two patterns is identical.
- **Open decision 11 mitigated by design rather than accepted, for the first
  time.** A failed config predicate reports as `missingComponents:
  ["Application Server"]` with an Application Server visibly on canvas, and R1
  is the worst place in the curriculum to hit that (40 minutes of build behind
  a single Submit). Three deliberate moves: the predicate threshold is `gte 2`,
  not an N+1 figure, so the only failing value is exactly the one
  `single-instance-load-balancer` already warned about in prose during Validate;
  the second blueprint absorbs the two-nodes-at-one-instance build that would
  otherwise hit the same report; and hint 3 names the failure shape ("if Submit
  says a component is missing while you are looking straight at it") without
  naming the component or the field. Fourth instance of the decision, first
  designed mitigation. Also covers the related engine note already recorded
  under decision 11 (drift reporting "Missing: Application Server" for a
  duplicate-node blueprint), which blueprint 2 reproduces by construction.
- **No new rules, and the curated set is deliberately the widest so far (8).**
  A composition gate should be able to fail everything Groups A-D taught.
  `request-flow-cycle` is **restored** after 3.10-3.16 dropped it - their starter
  graphs made a cycle unreachable, a blank canvas does not. `permissive-firewall`
  returns for the first time since 3.1. Both `single-instance-load-balancer` and
  `permissive-firewall` are warnings and therefore cannot fail Submit, which is
  flagged in spec §12: a design with an `allow-all` firewall passes R1 while the
  lesson's own Connections section says a firewall that filters nothing earns
  nothing. Severity is an engine change, not a content one.
- **`no-direct-client-database` cannot fire in this chapter, or in 3.14-3.16.**
  It keys on `client`, which left the palette after Part 1. Kept for continuity
  rather than making R1 the one chapter that drops it, and flagged in spec §12
  as one decision for all four chapters at once - not a per-chapter call.
- **Required 12 of the 14 available components; `nosql-database` and
  `distributed-cache` are available and unmotivated on purpose.** Nothing in the
  brief describes a document-shaped workload or a cache tier past one machine.
  Same call 3.14 made about `distributed-cache`, and objective 5 turns it into
  the point ("justify leaving a taught component out by showing the brief has no
  requirement for it"). Sharding is in the same position, recorded in
  `simplifications`.
- **The brief is a new product, not the system carried since 3.11.** A national
  job board, 2.1 million listings - deliberately the same order of magnitude as
  3.16's 4.2 million products so the reasoning transfers, deliberately a
  different product so the previous canvas cannot be recalled by its numbers.
  Nine requirements map one-to-one onto the 12 required components (spec §6).
- **"Next" names the branch and teases only 3.17.** R1 unlocks Group E, Group F
  and RWE Tier 1 simultaneously, which no prior chapter's Next has had to
  express. Resolved the same way 3.16 resolved its own R1-vs-3.17 split: the
  unlock is one factual clause, the pull is spent entirely on 3.17, via the
  arrow 3.16 could not draw. Worth knowing for R2 and R3.
- **No starter graph means four `authoring-invariants.test.ts` gates skip this
  chapter** (pitch, aspect ratio, "starter must not already pass", and the
  `exerciseGoal`/`successCriteria` spoiler check are all guarded on
  `chapter.starterGraph`). The brief was checked against §11.2 by hand instead.
  `exerciseGoal`/`successCriteria` are authored anyway - not required by CI
  here, but `QuestionPane` renders them and a blank canvas needs the success
  statement more than a completion exercise does.
- **Completion path verified, not assumed.** `deriveStatus`
  (`src/curriculum/progress.ts`) completes a chapter with an editor exercise and
  no quiz on the validation pass alone, so shipping R1 without a quiz does not
  strand it as permanently incomplete. `home-data.ts` already counts
  `kind: "checkpoint"` entries separately, so the Home page's checkpoint counter
  starts working with this chapter.
- **No new open decisions raised.** Decision 11 gained its fourth instance
  (mitigated, above) and its related drift note is now reproduced deliberately.
  Two candidates were examined and not raised: warning-severity rules being
  unable to fail a checkpoint (that is decision 11's own severity question, not
  a new one) and the absence of mid-build feedback on a 45-minute exercise
  (a product gap, flagged in spec §12, not a curriculum decision).

---

## 3.17 Message Queues

- **Authored 2026-09-10** - one-shot `chapter-author` pass (Opus), no cold
  second read yet - uncommitted, working tree (`feat/content-audit`)
- Definition id `bb-3-17-message-queues` - manifest slug `3-17-message-queues` -
  spec `src/content/chapters/specs/bb-3-17-message-queues.spec.md` - lesson
  `public/content/chapters/bb-3-17-message-queues.mdx`
- Type: **Building Block**, per CURRICULUM §14's own "New: `message-queue`,
  `worker`, `dead-letter-queue`; edge kind `async`" and §16's audit row -
  intermediate - 35 min - assumes Checkpoint R1, authored in this same working
  tree immediately before it.
- **First Group E chapter**, and the curriculum's only 3-component chapter
  (§18.1's "≤3 (3.17 only)"). `pending-content.md` puts Group E in Wave 6; the
  real prerequisite (R1) is authored and sits directly before it, so only the
  wave grouping is out of order, the same note every Wave 3/4/5 chapter carried.

**Deliverables (all 6):**

| # | Deliverable | Location |
|---|---|---|
| 1 | Chapter spec | `src/content/chapters/specs/bb-3-17-message-queues.spec.md` |
| 2 | Lesson markdown | `public/content/chapters/bb-3-17-message-queues.mdx` (2,371 words excluding the walkthrough's prop literals and the mermaid block, ~2,140 excluding table cells) |
| 3 | ChapterDefinition | `src/content/chapters/index.ts` |
| 4 | Validation rules | None new - 3.14's curated set plus the pre-existing `queue-without-dead-letter-queue` |
| 5 | Quiz | 6 questions, ramp 1/1/2/2/3/3; five `single` and one `diagram` |
| 6 | Playtest pass | Spec §11 |

**Judgment calls made:**

- **The three new components ship as one build, not three.** §14 already
  justifies the 3-component ceiling ("the trio is one cohesive pattern and the
  `queue-without-dead-letter-queue` rule enforces its unity"), and the build
  follows that literally: the learner adds a queue and a consumer, the rule
  fires with the poison-message explanation, and the third component is the
  learner's own response to a validation message rather than a separate task.
  That is also how §14's "fix (missing DLQ)" half is delivered - inside the
  build as productive failure, not as a second pre-broken starter graph.
- **`async` is the first new edge kind since 3.12 that does not hit open
  decision 8.** Checked directly against `src/content/components/config/`:
  `app-server.outputs` allows `messaging` + `async`, `message-queue.outputs`
  allows `compute`/`messaging` + `async`, `dead-letter-queue.inputs` allows
  `messaging` + `async`. Every edge this chapter teaches is buildable on canvas,
  unlike `control` (3.4, 3.2, 3.9). Worth recording precisely because three
  prior chapters had to route around the opposite finding.
- **`worker -> search-engine` is `request-flow`, and that is the chapter's
  sharpest point rather than a registry limitation.** `search-engine.inputs`
  allows `compute` + `request-flow` only, so the consumer's write into the index
  is a solid line. The blueprint commentary spends a paragraph on it: the call
  did not become asynchronous, it stopped happening while a user waited. This is
  the direct payoff of 3.16's undrawn arrow, and it is required by the
  blueprint - flagged in spec §12 as the most prescriptive edge the chapter
  grades.
- **Third consecutive starter graph that validates clean on purpose.** 3.16's
  spec said a third would need real justification; the justification is that
  this chapter's fault is behavioural (four jobs inside one request handler) and
  has no graph representation at all, since three of the four jobs have no
  component. The argument given to the learner is new each time (3.15: distance
  is not a wiring fault; 3.16: look at what each component is organized around;
  3.17: the fault is in what one request does). Flagged in spec §12 - Group F
  opens with 3.20, an explicit fix chapter, which breaks the streak naturally.
- **Third consecutive `<Walkthrough>` as the primary diagram, and the first
  chapter to ship a second diagram alongside it.** Six component nodes, six
  edges (three `async`), six steps: response on the wire at step 2, rates coming
  apart at 3-4, redelivery at 5, the exhausted message moving aside at 6. No
  algorithm variants (nothing branches on a selectable strategy). The second
  diagram is a Mermaid state diagram of the message lifecycle - §7.1's own table
  names both "Queue / stream topology" and "State transition" for 3.17, and the
  state diagram contains no components, so §7.2's one-topology-per-chapter rule
  is not in play.
- **Open decision 14 (no faulted state in `<Walkthrough>`) hit again, same
  workaround.** Step 5 is a failure step; the caption carries the failure and
  the highlight set is the queue, the consumer and the edge between them. Same
  gap, same shape as 2.2 and 3.16 - not a new instance.
- **The config half of §14's exercise line is taught, not gated.** The only
  canvas expression of "retry/backoff" is `dead-letter-queue.maxRetries`
  (default 5) and `message-queue.deliveryGuarantee` (default at-least-once), and
  both defaults are already what the lesson argues for. Gating them would grade
  a dropdown the learner never had reason to touch and would report as
  `missingComponents` on failure. Another instance under decision 11, not a new
  decision.
- **Three of the publish handler's four jobs are prose only.** Emails,
  thumbnails and analytics rows have no registry component; only the index
  update is drawable. The lesson describes all four and the canvas models the
  consumer once, rather than inventing components. Recorded in
  `simplifications`.
- **Production examples: Amazon (SQS) and Stripe (webhooks)** - Amazon unused by
  any prior chapter as a queueing example (AWS appears in 3.1 for its
  perimeter), Stripe last used in 3.6. Both are load-bearing and public per §13:
  order intake surviving downstream outages with compensating actions as the
  accepted cost, and at-least-once made a published contract with idempotency
  pushed onto the receiver. Closes on §9 lens 9 (the two-person team's `jobs`
  table, and the specific point at which it stops being enough).
- **All six of QUIZ_FRAMEWORK §12's bank questions tagged "(3.17)" are spent**
  (Q1-Q6 map one-to-one onto this chapter's Q1-Q6). Bank Q7-Q11 belong to 3.18
  and 3.19 and are untouched. Five of the bank's own distractors were joke
  options under §1 point 3 ("Emails are unimportant", "Email servers are always
  down", "HTTP cannot trigger email", "The queue deletes itself", "Adding CPU")
  and were replaced with real positions: reliability as the criterion for moving
  work off the path, priority as the criterion, a queue as a load shedder, and
  finishing inside the visibility timeout as a substitute for idempotence.
- **Answer letters b, d, c, a, d, b.** All four positions used, no letter twice
  in a row, and checked by eye against the three neighbours the per-chapter CI
  test cannot see: 3.14 opens on c, 3.15 on d, 3.16 on a.
- **A density revision pass was performed as a distinct drafting round** - cut a
  "What breaks" bullet that restated the retry storm the previous section had
  just argued (and said so in its own text, which §20.6 forbids), replaced a
  "Common mistakes" bullet that duplicated the failure-modes section with a
  distinct misconception ("exactly-once" on the label), and tightened the
  durability paragraph. 2,371 prose words for 35 minutes sits between 3.14's and
  3.15's rates; flagged in spec §12 to be checked rather than trusted.

**Cross-reference checks against other chapters' own pre-committed rows:**

- **Open decision 15's Group E row - first of three checked, 2026-09-10 -
  matches.** 2.3's row for Group E: "work that does not belong on the request
  path | 3.17-3.19." The cold open is that sentence made concrete (a 4.2 s
  publish of which 40 ms is the recruiter's own write) and the trade-offs
  section states the test in the row's own terms: not "is it slow" but "does the
  user's success depend on it". First of the five remaining rows checked; 3.18
  and 3.19 keep Group E open, and Groups F and G remain untouched.
- **3.16's forward promise and R1's Next both paid off.** 3.16 ends "Coming in
  3.17: the machinery for the arrow this chapter could not draw - the work that
  happens after the response is sent, and what happens when it fails"; R1's Next
  repeats it in its own words. Both halves land: the paragraph after the
  walkthrough names `async` as the edge 3.16 lacked, and the exercise redraws
  the indexing path through the consumer. The failure half is the dead letter
  queue.
- **R1's own reference system survives intact** as this chapter's starter graph -
  nothing the checkpoint asked the learner to build is undone or rearranged, so
  a learner recognizes their own R1 answer on the canvas.
- **"Next" names 3.18** (`manifest.ts`'s `prerequisiteSlugs: ["3-17-message-
  queues"]` confirms it), and the single §19 forward tease is also 3.18 - unlike
  3.16, this chapter is not sitting before a checkpoint, so the two coincide and
  the tease budget is spent once.
- **No new open decisions raised.** Decision 5 gained a sixth instance
  (§12's nuggets), decision 11 gained one (the ungated `maxRetries` /
  `deliveryGuarantee`), decision 14 was hit again with no new shape, and
  decision 15's Group E row is now open-and-checked for its first chapter.

---

## Cross-cutting revisions (post-authoring)

Entries here touch many already-authored chapters at once for a mechanical or
structural reason - not a per-chapter authoring pass, so one dated entry covers
all touched chapters rather than duplicating a row per chapter above.

- **2026-08-23, branch `fix/design-editor-bugs`: Design Editor layout + brief
  retrofit, all 13 editor chapters (0.1, 1.2, 3.1-3.9, 3.11, 3.12).** Followed
  `.claude/docs/pending-design-editor-exercise.md`'s audit + POA. Two fixes,
  content-only, no chapter's teaching content changed:
  - **Starter graph layout:** every chapter's `starterGraph` was retrofitted from
    the 200px x-pitch that made adjacent cards touch (0px gap, edges rendered as
    invisible dots) to a 320x160 pitch, tiered into rows by architectural layer
    for chapters of 4+ nodes. See DESIGN.md's Node Card section and CURRICULUM
    §11.5 for the standard, `authoring-invariants.test.ts` for the gate.
  - **Exercise brief:** added `exerciseGoal`/`successCriteria` to
    `ChapterDefinition`, rewrote all 13 briefs under CURRICULUM §11.2's new
    brief-calibration rule (D3: name the symptom and goal, never the
    component/field/direction that fixes it - Config chapters may name the
    component only), and removed QuestionPane's always-visible Learning
    Objectives block, which had been printing the exact fix above the opt-in
    hints on several chapters (1.2, 3.4, 3.6, 3.7, 3.9, 3.12).

- **2026-08-23, branch `feat/starter-decorators-and-reset`: starter-graph
  decorators + Reset to Default, same 13 editor chapters.** Follow-up to the
  above - the tiered layout fixed spacing but still read as "a loose grid of
  cards" rather than a real diagram. Two additions, content-only:
  - **Reset to Default:** a header button (BB and RWE both, one shared
    `AppHeader`) puts the canvas back to the chapter's `starterGraph` +
    `starterDecorators`, discarding the in-progress attempt. The underlying
    `handleResetToStarter` already existed (wired only to the guided tour's
    "Start over"); this exposes it generally.
  - **Starter decorators:** all 13 chapters now ship `starterDecorators` -
    labeled zone rectangles per architectural tier (client/edge blue,
    application purple, data emerald) plus, on the 6 chapters whose fix is a
    genuinely missing node in identifiable empty space (1.2, 3.1-3.5), a
    magenta "Build here" gap zone - skipped on 3.6-3.9/3.11/3.12, whose
    fixes are config/wiring changes to an already-present node. A handful
    of factual, non-spoiler comments (3.8 capacity numbers, 3.9 TTL
    definition, 3.11/3.12 storage-model notes). See CURRICULUM §11.6 for the
    convention and `.claude/docs/pending-starter-decorators.md` for the full
    build log.

- **2026-08-24, branch `staging/v7.1.0-progress-reset`: high-level lesson-copy
  audit, 15 release-7.1.0 chapters (2.1-2.3, 3.1-3.3, 3.5-3.13).** Skim pass for
  cross-chapter inconsistency and over-complication, not a per-chapter revision.
  No teaching content, structure, exercise, quiz or graph changed:
  - **Diagram caption prefix:** 3.9-3.13 used `Caption:`; every earlier chapter
    (and CURRICULUM §7's own example) uses `Note:`. Normalized to `Note:`.
  - **Think-first prompt:** 3.9-3.13 had dropped the `Think first:` opener and,
    in 3.11-3.13, moved "before reading on" to the front. Normalized all five to
    the 2.1-3.8 form. Also removed the doubled "before reading on ... before
    reading on" in 3.1 and 3.3.
  - **DNS on the request path (real error):** 3.3's mermaid labeled the
    browser->DNS edge `request-flow`, which is exactly the mistake 2.1's Common
    Mistakes section calls out ("claims it carries traffic it never sees"). Now
    `lookup`, with 3.2's canvas-shape caveat carried over.
  - **Verbatim quote openers:** 3.3 opened by block-quoting 3.2's Next
    paragraph; 3.5 opened by block-quoting 3.3's (including its parenthetical).
    Both rewritten to state the handoff directly; 3.3's Next parenthetical
    folded into prose.
  - **Author-scaffolding leaks:** 3.8/3.9 shipped reviewer asides in learner
    prose ("checked directly against `load-balancer` and `app-server`'s own
    `relations` fields"). Trimmed to the learner-facing fact.
  - **Count/heading mismatches:** 2.2's "Six break points" sat above a 7-row
    table; 2.1's "who owns it" heading over a "Where you build it" column;
    3.11's "Two philosophies" over a 3-row table; 3.12's caption ended "nothing
    but the primary ever accepts one" whose nearest antecedent was *reads*.
  - **Flagged, not fixed** (deep edits, out of a skim pass's scope): CURRICULUM
    §6 makes **Connections** a mandatory Building Block section, but only
    3.10-3.13 have one - 2.1-2.3 and 3.1-3.9 fold it into `Next` instead, and
    §6's merge allowance covers adjacent sections, which Connections (14) and
    Transition brief (16) are not. Separately, 3.6's and 3.9's `Your turn`
    exercises test a different thing than their lesson teaches (instance count;
    DNS TTL).

---

## Open decisions blocking or shaping later chapters

Raised during authoring, deliberately not resolved unilaterally. Each needs a
doc edit or a build decision.

1. **CURRICULUM §14's 0.1 row contradicts the shipped chapter.** §14 reads
   "Exercise: none (the tour is the chapter)" and "New: none (tour of the seed
   graph, read-only)". The chapter as built has a real fix exercise on a
   deliberately broken graph, gated by Submit. The built behavior was kept (it
   is shipped, tested, and stronger pedagogically); §14's row needs updating in
   its own commit. Detail in the chapter spec's §10.
   **Blocks:** nothing. Cosmetic doc drift, but it misleads the next author.

2. **§16 component budget exception at 0.1.** §16 homes `client`,
   `app-server` and `sql-database` at 1.6 and forbids a component appearing in
   any palette before its home chapter. 0.1 needs them on the canvas to have
   something to fix, so they appear as scenery: named, never taught, never a
   choice the learner makes. Handled as a declared exception in the spec's §6.
   Either §16 gains an explicit "scenery" carve-out or the exception stands as
   documented.
   **Resolved 2026-08-09.** 1.6 authored the formal introduction (see its own
   ledger entry above): `availableComponentIds` equals `requiredComponentIds`
   equals all three, no exception needed there. 0.1's own scenery exception
   still stands as documented and doesn't need retroactive changes - it was
   always framed as narrow-and-temporary, and 1.6 existing is exactly what
   makes it fully justified now rather than a promise. §16 itself still has no
   explicit "scenery" carve-out written into CURRICULUM.md; that doc edit
   remains optional, cosmetic, not blocking anything.

3. **The Reader cannot render topology diagrams.** CURRICULUM §7.2 says any
   diagram expressible as an architecture graph is authored as ScaleCraft graph
   JSON so it renders in the product's own visual language. `MarkdownRenderer`
   supports Mermaid (`MermaidBlock`), GFM, callouts and code blocks - and no
   graph-JSON block. There is no way to put a ScaleCraft topology diagram in a
   lesson body today.
   **Blocks: 3.4** still, whose primary diagram is a topology. Part 0 is
   unaffected (process flows are Mermaid by spec anyway). **Partially resolved
   for 1.6 only, 2026-08-09 (user-directed):** 1.6's own ledger entry above
   records the decision - author 1.6's lesson-body diagram as Mermaid, styled
   as the target topology, as a narrow declared exception, justified because
   the real interactive topology already exists via the chapter's
   `starterGraph`/`blueprints[0]` and is what the learner actually builds; the
   lesson diagram is only the static preview. **This is a per-chapter
   precedent, not a resolution of §7.2 itself** - 3.4 needs its own explicit
   call when authored, not an assumed extension of 1.6's, since 3.4's diagram
   (multiple instances, health-check `control` edges) is more complex than
   1.6's straight-line shape. Still needs an eventual decision either way:
   build a markdown graph-JSON block, or amend §7.2 to sanction a Mermaid
   exception for topology in the Reader more generally.
   **Opus pass confirmed the narrow application held for 1.6 (2026-08-09):**
   exactly one diagram in the chapter, nothing in the lesson claiming a
   graph-JSON diagram exists, and the "static preview of something the learner
   actually builds" framing is real rather than a rationalization - the same
   topology is reachable as a genuine `ArchitectureGraph` in the Editor. One
   concrete lesson for 3.4's author: 1.6's caption originally over-generalized
   from the Mermaid picture ("`request-flow` only ever runs client to app
   server to database"), which 3.4's own topology would have contradicted. A
   Mermaid topology is easier to overstate than a graph-JSON one, because it
   isn't constrained by the registry - caption it for *this* diagram only.
   **3.4 authored 2026-08-11, same resolution, made explicitly rather than
   assumed:** Mermaid, styled as the topology (client -> LB -> two app-server
   instances -> database), captioned narrowly for this diagram only (see its
   own spec §0.2). Still not a resolution of §7.2 itself - now two chapters'
   worth of the same narrow exception, growing evidence this should become
   either a sanctioned Mermaid-topology carve-out or real engineering work for
   a graph-JSON markdown block.

4. **CURRICULUM contradicts itself on what the five forces are.** §14's 0.2 row
   and §5.2 say latency / **throughput** / availability / durability / cost.
   §10.1's Interview Loop step 2 says latency / availability / **consistency** /
   durability / cost - throughput dropped, consistency added. 0.2 follows its own
   §14 row (correctly), and QUIZ_FRAMEWORK §5's bank Q1 and Q2 agree with §14, so
   nothing shipped is wrong. But 1.2/1.3 are authored against §10.1's list and
   will teach a different five unless one side is amended.
   **Blocks:** nothing today. Fix before Wave 2 authors 1.3, in a doc-only commit.
   Raised by the Opus pass on 0.2.
   **Resolved 2026-08-09, doc-only.** §14's throughput list is canonical: 0.2's
   shipped lesson and quiz bank commit to it in prose, and 1.2 never re-lists the
   five, so no shipped content moves. §10.1 step 2 and §14's 1.3 row amended to
   match; consistency stays a deferred concept (3.22), not one of the five.

5. **§12's nugget devices are absent from both authored chapters, undeclared.**
   §12 specifies Interview nuggets (1-2/chapter, Acts 2-3), Production nuggets
   (1-2/chapter, Act 3) and an Engineering nugget (1/chapter minimum, applying a
   §9 lens), each with a fixed placement "so learners build rhythm". Neither 0.1
   nor 0.2 has any, and neither spec declares the omission. Both chapters carry
   the equivalent content inline instead, which is arguably better for §20.6
   density - boxed one-liners next to a 700-word chapter are mostly chrome. Not
   fixed unilaterally in the Opus pass, because changing 0.2 alone would make it
   diverge from the already-reviewed 0.1 for no reader benefit.
   **Blocks:** nothing. Needs a call before Part 3, where chapters are long
   enough that the nuggets would actually earn their placement: either author
   them from 3.4 on, or amend §12 to make them optional for short Part 0/1
   chapters. Raised by the Opus pass on 0.2.
   **The trigger fired, 2026-08-11.** 3.4 is the first Part 3 chapter
   authored and it has no nuggets either. The Opus pass declared the omission
   in 3.4's spec §4 rather than authoring three boxed one-liners into one
   chapter and leaving every neighbour without them - a device with a "fixed
   placement so learners build rhythm" cannot start mid-curriculum in a
   single chapter. Still needs the call this decision has always asked for,
   now overdue rather than upcoming.
   **Fourth instance, 2026-08-18 (2.1).** Omitted again, declared in that
   chapter's spec §4. Nothing has changed about the reasoning - a device
   whose whole value is a fixed placement cannot begin partway through the
   curriculum - so this stays a doc call: make §12's nuggets optional for
   short Concept chapters, or schedule one retrofit pass across every
   authored chapter at once. Individual chapters should stop declaring this
   one by one.

6. **§4's chapter-types table lists 1.3 as a Concept-type example, contradicting
   §14's own Part 1 header ("Process type" for the whole part, 1.1-1.11, no
   per-chapter exception named).** Raised authoring 1.3 (2026-08-09). Resolved
   as Process for that chapter (see its ledger entry above and spec §0) by the
   same precedent decision 4 set - §14 wins when it conflicts with another
   section - and for consistency with 1.1/1.2, both already Process on this
   branch. **Blocks:** nothing today; the practical difference (Production
   examples mandatory-vs-optional, Practical objective carve-out) didn't change
   what 1.3 needed either way. Fix in a doc-only commit: drop "1.3" from §4's
   Concept examples list.

7. **§14's 1.6 row promises a simulator trace the chapter doesn't have.** The
   row reads "Exercise: build + fix + simulator trace"; 1.6 as authored ships
   build + fix only. Raised by the Opus pass on 1.6 (2026-08-09) and declared
   in that chapter's spec §4. The built behavior was kept - the Fix exercise
   already exercises every learning objective, and wiring a simulator step
   into the chapter flow is engineering work, not content authoring. Same
   class as decision #1 (§14's 0.1 row contradicting the shipped chapter).
   **Blocks:** nothing. Decide once, for both rows: either amend §14 to match
   what's shipped, or schedule the simulator-trace work. Note that §14's 1.7
   row ("predict-then-check ... then simulate") makes the same promise, so
   1.7's author hits this before the decision can keep being deferred.
   **Confirmed 2026-08-10.** 1.7 hit exactly this wall, as predicted. Applied
   `pending-content.md`'s own named degradation path (simulator-dependent
   beats become quiz questions) rather than treating it as a new problem -
   see 1.7's own ledger entry and spec §0. Still not resolved: this is now
   two chapters' worth of evidence for the same "decide once" call.
   **Third instance, 2026-08-11.** §14's 3.4 row promises "build + config +
   trace"; 3.4 ships build/fix only. The config beat degraded to lesson +
   quiz deliberately (both algorithms are defensible, so there is no correct
   config value to gate on - that one is a genuine content call, not a
   missing simulator); the trace beat hit the same wall as 1.6 and 1.7.
   Declared in 3.4's spec §4 by the Opus pass. Three chapters, one decision,
   still deferred.
   **Partially resolved 2026-08-18, for trace-shaped beats only (2.1).**
   2.1's §14 row asks the learner to "follow a simulated token through a
   presented graph"; it ships as a real six-step `<Walkthrough>` in the
   lesson body rather than degrading to a quiz question. Release
   5.1.0-alpha's diagram pipeline is what made that possible, and 2.1 is the
   first chapter whose §14 promise it directly answers. **This does not
   resolve the decision.** A `<Walkthrough>` is author-scripted: it can show
   a token following a path, but it cannot check a learner's prediction,
   which is what 1.7's predict-then-check and 3.4's config trace actually
   needed. The call is now narrower but still owed - either build a
   prediction-checking affordance, or amend §14's rows for 1.6, 1.7 and 3.4
   to promise what the product can actually do.
   **Sixth instance, 2026-08-26 (3.14).** §14's 3.14 row promises "build
   (cache-aside; **simulator's hit/miss branching**) + fix + config"; the
   branching ships as the lesson's own Mermaid sequence diagram (miss, then
   hit, same key) plus quiz Q1 and Q6. Same settled degradation path, applied
   without re-deciding. Note that 3.14 also declined the *other* two thirds of
   its own row for reasons unrelated to this decision (see its ledger entry:
   per-instance caches aren't drawable, and the TTL predicate was pulled over
   decision 11's drift message) - so this row is now the clearest single
   example of a §14 exercise line no part of which the product can deliver as
   written.

8. **`control`-kind edges aren't buildable on canvas - a real engine gap,
   found authoring 3.4 (2026-08-11).** CURRICULUM §16 assigns 3.4 as
   introducing edge kind `control` (health checks). Checked directly against
   `content/components/config/networking.ts` and `compute.ts`: neither
   `load-balancer.relations.outputs.allowedKinds` nor
   `app-server.relations.inputs.allowedKinds` includes `"control"` - both
   declare `["request-flow"]` only for this direction, so a load-balancer
   health-check edge to a backend fails `component-relations` on both ends.
   This isn't specific to 3.4's content; no registry component today accepts
   an incoming `control` edge from a load balancer at all.
   **Not hacked around** - 3.4's spec (§0.3) keeps `control` edges
   illustrative only (Mermaid diagram, prose), absent from the graded
   `starterGraph`/`blueprint`, and records the gap honestly in
   `curriculumContext.simplifications` rather than silently omitting it.
   **Blocks:** nothing today (3.4 shipped around it), but any later chapter
   wanting a learner-buildable health-check/liveness edge (e.g. a future
   revisit of 3.4, or 3.9 Service Discovery) hits the same wall. Needs an
   engineering fix, not a content one: add `"control"` to
   `load-balancer.relations.outputs.allowedKinds` and to
   `app-server.relations.inputs.allowedKinds` (or a narrower,
   load-balancer-specific contract) in `src/content/components/config/`.
   **Second instance, 2026-08-22 (3.2 DNS).** The same gap, independently:
   2.1 taught the browser-to-DNS lookup as a `control` edge, but
   `browser.relations.outputs.allowedKinds` and `dns.relations.inputs.
   allowedKinds` both declare `["request-flow"]` only. 3.2's buildable
   blueprint uses `request-flow` for that edge (the only kind that
   validates), same "not hacked around" discipline as 3.4: declared
   honestly in the lesson's diagram caption and in
   `curriculumContext.simplifications`, not silently drawn as `control` on
   canvas. Two independent findings now point at the same underlying fix -
   more component pairs need `"control"` added to their declared contracts,
   not just the load-balancer/app-server pair this decision originally
   named. Still no engineering work scheduled.
   **Third instance, 2026-08-23 (3.9 Service Discovery) - this decision's own
   prediction confirmed, not a new finding.** This decision named 3.9 as a
   chapter that would hit this wall when it was first raised at 3.4; 3.9's
   own Purpose (CURRICULUM §14) states "control edges become load-bearing" -
   the health signal behind the registry pattern is the same `control`-kind
   edge, still not buildable on canvas. Handled with the same discipline:
   illustrative only in the lesson's diagram and prose, absent from the
   graded `starterGraph`/`blueprint`, disclosed in
   `curriculumContext.simplifications`. Full reasoning in 3.9's spec §6.
   Three independent chapters now point at the same underlying fix; still no
   engineering work scheduled.

9. **3.4 Load Balancer authored standalone, ahead of its real prerequisite
   (2026-08-11).** CURRICULUM §14's 3.4 row reads "Assumes: 3.3", but Group A
   (3.1-3.3) is entirely unauthored (`chapterDefinitionId: null`), and 3.3's
   own prerequisite chain traces back through unauthored Part 2 as well. Left
   as `manifest.ts` originally had it, 3.4's `prerequisiteSlugs:
   ["3-3-reverse-proxy"]` would make the chapter permanently unreachable in
   the app (its prerequisite can never be "completed"). This is the same
   "pulled forward" situation `pending-content.md` already named for 3.4
   (Wave 2, ahead of Wave 3's Group A), just more literal than 1.6's version
   of the same pattern.
   **Resolved for 3.4:** authored assuming only Part 0, Part 1 (through 1.9),
   and 1.6's three components - no reverse-proxy/DNS/firewall vocabulary
   anywhere, motivation built entirely from 1.6's own planted seed instead.
   `manifest.ts`'s `prerequisiteSlugs` repointed to `1-9-deep-dive-methodology`,
   commented inline as a declared, temporary exception. Full reasoning in
   3.4's spec §0.1.
   **Blocks:** nothing today. **Needs a decision before Wave 3 authors
   3.1-3.3:** revert 3.4's `prerequisiteSlugs` back to `["3-3-reverse-proxy"]`
   once Group A is real, and confirm 3.4's lesson doesn't need a retroactive
   edit once the learner *can* arrive at 3.4 having actually taken 3.3 (it
   shouldn't - 3.4 never assumes 3.3's content, it just doesn't currently
   require it either - but worth a second look when Group A lands rather than
   assumed fine).
   **Trigger fired, 2026-08-22 - Group A is now fully authored (3.1, 3.2,
   3.3 all shipped in this working tree).** The revert and the retroactive-
   edit check named above are both still open and were **not** done as
   part of authoring 3.3 - reverting 3.4's `prerequisiteSlugs` is a change
   to 3.4's own manifest row and lesson, not something a draft pass on 3.3
   should touch silently. Checked directly (not assumed): 3.3's own lesson
   never uses 3.4's vocabulary in a way 3.4 doesn't already independently
   define, and 3.4's own lesson never references 3.3 by name, so the two
   chapters don't currently contradict each other - but the revert itself,
   and a full re-read of 3.4 with 3.3's actual content in hand, is real
   work for a future session, not discharged by this observation.

10. **`curriculumContext.simplifications` is not a disclosure surface -
    raised by the Opus pass on 3.4 (2026-08-11).** It is read by exactly one
    consumer, `src/ai/prompt.ts`, which folds it into the Deep Check prompt.
    Nothing renders it in the Reader. Every chapter authored so far has
    treated "recorded in `simplifications`" as discharging §20.2's honesty
    requirement; §20.2 actually asks for the simplification to be stated in
    the prose *and* recorded in the list. 3.4 was the first chapter where
    that mattered concretely (it taught an edge kind the canvas rejects), so
    it got a two-sentence in-lesson disclosure. **Blocks:** nothing, but
    every existing chapter's `simplifications` list is worth re-reading with
    "would a learner ever notice this, and if so, does the lesson say it?"
    in mind. Either that becomes an authoring-checklist line, or the Reader
    grows a real surface for it.

11. **Should a chapter's namesake fault ever be warning-severity? Raised by
    the Opus pass on 3.4 (2026-08-11).** `single-instance-load-balancer` is
    `severity: "warning"`, and `runChapterValidation` computes `passed` from
    `errorCount` alone - so 3.4's starter graph *passes* Validate while
    listing one issue, where 1.6's error-severity fault failed Validate
    outright. The chapter still works (the issue and its full explanation
    both render, and Submit gates on the blueprint), but two chapters now
    teach "run Validate, fix what it says" with structurally different
    feedback. **Blocks:** nothing. Needs a call before more Part 3 chapters
    build exercises on warning-severity rules: either accept the two shapes
    and word transition briefs accordingly, or let a chapter promote its own
    namesake rule's severity. Engine change, not content - deliberately not
    touched during a content pass.
    Related engine note from the same pass: blueprint drift reports "Missing:
    Application Server" when a blueprint needs two nodes of one component and
    the learner has one, which reads as false to the learner. First surfaced
    here because 3.4 is the first blueprint requiring a duplicate node.
    **Mirror-image instance, 2026-08-22 (3.6).** 3.6's own blueprint needs
    one app-server node with `config.instances >= 2` (deliberately the
    opposite shape from 3.4's, see its own ledger entry). `blueprint-
    drift.ts`'s config-predicate check is per-node, not summed - so a
    learner who instead adds a second node (each at the default
    `instances: 1`, matching 3.4's own fix) clears the validation rule but
    gets a drift report reading "Missing: Application Server" despite two
    being present. Same underlying gap as the note above, now confirmed in
    both directions (needs-two-has-one, and needs-one-config-N-has-two-
    unconfigured). Not hacked around in 3.6 - the lesson and hint 3 both
    instruct against the second-node instinct before it can bite - but the
    engine fix (aggregate config predicates across same-alias-eligible
    nodes, or a clearer drift message) is still unscheduled.
    **Third instance, 2026-08-23 (3.7).** 3.7's own namesake fault is
    `orphan-component` (a disconnected SQL Database node), also
    `severity: "warning"` - the third consecutive Group A/B chapter (3.4,
    3.6, 3.7) whose graded fault doesn't flip `runChapterValidation`'s
    error-count-only `passed` computation on its own. Submit still gates
    correctly on the blueprint in every case, so nothing is broken, but the
    "decide once" call this decision has asked for since 3.4 now has three
    independent instances behind it rather than two.
    **Counter-instance and a third drift finding, 2026-08-26 (3.14).** 3.14 is
    the first Part 3 chapter to build its exercise on an **error**-severity
    fault (`missing-input-connection`: a Cache with an outgoing miss path and
    nothing feeding it), chosen deliberately so Validate genuinely fails on the
    starter rather than passing with an issue listed. That is one data point
    for "accept the two shapes and word briefs accordingly" being avoidable in
    practice, at least where an error-severity rule fits the fault.
    Separately, the same chapter hit this decision's own drift-message note
    from a third direction: 3.14's `ttlSeconds` config beat was drafted as a
    blueprint predicate (`op: "lte", value: 60`) and then **pulled**, because a
    failed config predicate leaves the pattern node with zero candidates and
    `blueprint-drift.ts` reports it as `missingComponents: ["Cache"]` - a
    "Missing: Cache" message with a Cache plainly on the canvas, which would
    have been the chapter's own primary graded feedback. TTL moved to lesson +
    quiz instead (3.14's spec §4). Three independent shapes now
    (needs-two-has-one, needs-one-config-N-has-two, and config-predicate-fails)
    all produce the same misleading "Missing: X"; the fix (aggregate config
    predicates, or report a config mismatch as its own category rather than a
    missing component) is still unscheduled, and it is now actively costing
    authored content a beat CURRICULUM promises.
    **Fourth drift shape, and a third answer to the original question,
    2026-08-26 (3.15).** Two findings from the same chapter. (a) *Drift is
    completely `forbid`-blind.* `Blueprint.forbid` exists and
    `chapter-outcome.ts` honors it, but `blueprint-drift.ts` computes
    `missingComponents` / `extraComponentIds` / `mismatchedConnections` from
    `require` alone - so a learner who trips a forbid pattern fails Submit and
    receives a drift report naming nothing missing and nothing mismatched.
    That is strictly worse than the misleading "Missing: X" above, and it is
    why 3.15 does not require the learner to delete the `dns -> firewall` edge
    the new CDN makes redundant (its blueprint simply doesn't require that
    edge, so both builds pass). No authored chapter uses `forbid` today; the
    first one that wants to needs this fixed first. (b) *A chapter can have no
    fault at all.* 3.15's starter graph is 3.14's solved system and validates
    clean on purpose - the exercise's gap is an absent component, not a broken
    one, so Submit's drift is the feedback surface and its "Missing: CDN" is
    accurate rather than misleading. That is a third option alongside this
    decision's original warning-vs-error framing, and it costs nothing: the
    transition brief and hint 1 both say outright that Validate will report
    nothing, so the silence reads as a lesson rather than a broken button.
    Whether that lands is a playtest question, flagged in 3.15's spec §12.
    **Fourth config-predicate instance, and the clean starter repeated,
    2026-08-27 (3.16).** `search-engine`'s only field is `shards` (default 1),
    and it was not gated for the same reason 3.14's `ttlSeconds` and 3.15's
    `cacheTtlSeconds` were not: a failed config predicate reports as
    `missingComponents: ["Search Engine"]` with a Search Engine plainly on the
    canvas. Separately, 3.16's starter graph is the *second consecutive* one to
    validate clean on purpose, which turns 3.15's "a chapter can have no fault
    at all" from a one-off into a pattern for Group D specifically. Not a new
    answer to this decision's question, but it raises a playtest question
    3.15's single instance did not: whether a learner who watches Validate stay
    quiet twice in a row stops reading it. Flagged in 3.16's spec §12; a third
    clean starter in a row would need a real justification rather than a
    carried-forward one.
    **First designed mitigation, 2026-09-07 (Checkpoint R1).** R1 does gate a
    config predicate (`app-server.instances >= 2`), and it is the worst place
    in the curriculum to hit this decision's drift shape: a blank 12-node build
    behind a single Submit. Rather than dropping the gate or accepting the
    report, three things were arranged so the confusing message is effectively
    unreachable. The threshold is `gte 2`, not an N+1 figure, so the only
    failing value is exactly the one `single-instance-load-balancer` already
    warned about during Validate in teaching-quality prose. A second blueprint
    (two `app-server` nodes behind the load balancer) absorbs the other build
    that would land on the same report - which also deliberately reproduces
    this decision's own related engine note about duplicate-node blueprints
    reporting "Missing: Application Server". And hint 3 names the failure shape
    without naming the component or the field. The underlying question is still
    open; this is evidence that a chapter can design around it when the cost of
    hitting it is high, not that it no longer needs answering.

12. **2.1's stop table pre-commits a one-line job description for five
   unwritten chapters (2026-08-18).** 2.1 From Browser to Backend is Part 2's
   spatial map, so its core deliverable is a nine-row table naming every stop
   on the request path and the chapter that builds it: `firewall` (3.1),
   `browser`/`dns` (3.2), `reverse-proxy` (3.3), `load-balancer` (3.4),
   `api-gateway` (3.5). That is inherent to the chapter's purpose rather than
   an overreach, but it does mean five chapters now have their framing set by
   a chapter authored before them. 3.4 already exists and its "one address,
   many identical backends, health-checked" framing matches the row written
   for it.
   **Blocks:** nothing. **Needs checking when Group A is authored:** each of
   3.1, 3.2, 3.3 and 3.5 should either match its row or change the row
   deliberately, in the same commit - not diverge silently and leave 2.1
   teaching a description its own chapter no longer matches. Same class of
   drift as decision 1 (§14's 0.1 row vs. the shipped chapter), caught before
   it happens rather than after.
   **3.1 checked, 2026-08-22 - matches, no change needed.** Both of 2.1's
   rows for this chapter hold as written: the firewall row ("Drops traffic
   that has no business reaching you, at the perimeter") and the TCP+TLS
   handshake row ("Not a component - the connect phase, everywhere; 3.1
   covers it") both describe 3.1 as authored. First of the four rows
   resolved; 3.2, 3.3 and 3.5 remain open.
   **3.2 checked, 2026-08-22 - matches, no change needed.** 2.1's DNS row
   ("Turns a hostname into an IP address, before any connection exists")
   matches 3.2 exactly - it's the chapter's own Q1. The Browser row ("Holds
   the URL, runs resolve/connect/exchange, renders the response") is
   broader than 3.2's own scope (rendering is out of scope for a DNS-
   focused chapter and has no ScaleCraft mechanism to teach) - not treated
   as a mismatch, since the row is a pointer to Browser's home chapter, not
   a per-chapter content checklist. Second of the four rows resolved; 3.3
   and 3.5 remain open.
   **3.3 checked, 2026-08-22 - matches, no change needed.** 2.1's reverse-
   proxy row ("The single front door: terminates TLS, routes by host or
   path") matches 3.3 exactly - both halves are the chapter's own mental
   model and core-mechanics section, not a divergence. Third of the four
   rows resolved; only 3.5 remains open.
   **3.5 checked, 2026-08-22 - matches, no change needed. Group A's
   stop-table check is now complete across all four rows.** 2.1's API
   gateway row ("Auth, rate limits, and request shaping in front of many
   services") matches 3.5 exactly: `requiresAuth`/`rateLimitPerMinute` are
   the chapter's own core-mechanics content verbatim, and "request shaping"
   is realized as path-based routing to a named service. Fourth and final
   of the four rows resolved.

13. **2.1 uses and teaches the `control` edge kind before 3.4, which §16 says
   owns it. Raised by the Opus pass on 2.1 (2026-08-18).** §16's audit homes
   edge kind `control` in 3.4 ("`load-balancer` + edge `control`"). 2.1 draws
   one (browser -> DNS), explains what it means in the diagram's §7.2 caption,
   and tests it in quiz Q3 - which is teaching, not previewing. It is covered
   by the same Part 2 sanction the seven presented components rely on (a
   presented diagram is not a palette), but it goes further than they do, and
   the draft did not account for it at all. The prose stays as authored: "DNS
   is beside the request path, not on it" is 2.1's own thesis and the `control`
   edge is how the diagram states it - removing it would be worse pedagogy for
   a purely bookkeeping reason. Declared in the chapter spec §6 instead.
   **Blocks:** nothing. **Needs a call when Group A is authored:** either
   §16's audit row moves `control` to 2.1 and 3.4 reframes as "the edge kind
   you met in 2.1, now with a real job", or §16 gains an explicit note that
   Part 2's tour introduces it early. Either way it is a CURRICULUM.md edit in
   its own commit, not something a chapter author decides silently. Same class
   as decision 12, one level down: 2.1 pre-commits Group A's *vocabulary* as
   well as its framing.

14. **`<Walkthrough>` has no failure state, so a failure diagram cannot show
   the failure. Raised authoring 2.2 (2026-08-20).** CURRICULUM §7.2 requires
   that failure diagrams "show the failure (crossed-out node, red path), not
   just the happy path with a caption saying 'imagine this fails.'" Checked
   directly against `src/chapters/walkthrough/types.ts` and
   `WalkthroughNodeCard.tsx`: `WalkthroughStep` exposes only
   `focus`/`highlightNodeIds`/`highlightEdgeIds`, and the node card has no
   faulted variant. There is no way to cross out a node or redden a path in a
   walkthrough today, and no graph-JSON markdown block exists either (open
   decision 3), so a Mermaid diagram with hand-written `classDef` styling is
   currently the only way to satisfy the rule at all.
   **Not hacked around** - 2.2 inverted the highlight semantics instead: each
   step lights only the segment the request actually traversed, so the break
   point is where the lit path stops and the dark remainder is exactly the set
   of stops that never learn a request was coming. The diagram caption names
   that convention so it is readable rather than inferred. Recorded in that
   chapter's spec §5 as a workaround for a missing capability, not as a
   satisfied rule.
   **Blocks:** nothing today. **Bites Group G (3.23-3.26), which is entirely
   failure-diagram material**, and the Reliability group is where §7.1 homes
   the "failure scenario (before/during/after)" diagram in the first place.
   Needs an engineering fix rather than a content one: a per-step faulted
   node/edge state on `WalkthroughStep` (e.g. `faultNodeIds`/`faultEdgeIds`)
   rendered through the same `EDGE_COLOR_VAR`/validation-state tokens the
   canvas already uses for errors, so a failed stop looks the same everywhere
   ScaleCraft draws one. Same class as decisions 3 and 8: an engine gap found
   by content authoring.

15. **2.3's group table pre-commits a motivating pressure for all seven Part 3
   groups (2026-08-22).** CURRICULUM §14's purpose line for 2.3 is "so Part 3's
   sequence reads as one system growing rather than a parts catalog", and the
   chapter delivers it as a seven-row table naming, per group, the pressure that
   produces it: A the edge, B what copies of the app tier require, C one shared
   database as the new ceiling, D reads the database should not be answering, E
   work that does not belong on the request path, F blobs outgrowing rows, G
   enough boxes that something is always broken. Each row was written against
   §14's own group briefs, and the same chapter names 3.4, 3.5, 3.6, 3.7, 3.9,
   3.12, 3.13, 3.14 and 3.17 in prose as marked pointers.
   **Blocks:** nothing. **Needs checking as each group is authored:** a group's
   first chapter should either match its row or change the row deliberately, in
   the same commit. Identical in kind to decision 12 (2.1's stop table naming
   five chapters' framing), one level up - this table sets the *motivation* for
   twenty-six chapters rather than the job description for five. Also note the
   forward-reference volume itself is covered by §18.2 rule 2's Part 2 sanction
   and declared in the chapter spec §6, not silently taken.
   **Group A's own first chapter checked, 2026-08-22 - matches.** 3.1's cold
   open picks up the row's exact wording ("Admitted is this chapter," against
   the row's "traffic has to be resolved, admitted and routed before your
   code sees it"). First of the seven rows checked against a real chapter;
   the other six remain open as their groups are authored.
   **Group A now fully checked, 2026-08-22 - all three words of the row's
   own sentence are individually spent.** 3.2's cold open never explicitly
   claims "resolved" the way 3.1 claimed "Admitted," but its content is the
   resolve phase in full; 3.3's cold open explicitly states "Routed is this
   chapter," closing out the triple. Group A is the first of the seven
   groups to fully resolve its own row this way; the other six remain open
   as their groups are authored.
   **Group B's own first chapter checked, 2026-08-22 - matches.** 2.3's row
   for Group B: "Copies of the app tier only work if a request can land
   anywhere | 3.6-3.9." 3.6's cold open and mental-model section state
   exactly that constraint (any instance must be able to answer any
   request), and paraphrase rather than contradict 2.3's own foreshadowing
   sentence about it. First of the six remaining rows checked against a
   real chapter; Groups C-G remain open as their own first chapters are
   authored.
   **Group B's second chapter checked, 2026-08-23 - still matches.** 3.7
   doesn't restate 2.3's own row (3.6 already did); it resolves the fork 3.6
   left open, which is the correct job for a second chapter under the same
   motivating row rather than a repeat of the first chapter's job. Groups
   C-G, and the remaining two chapters of Group B (3.8, 3.9), remain open.
   **Group B's third chapter checked, 2026-08-23 - still matches.** 3.8
   extends 2.3's own row one step further than 3.6/3.7 did: not just that a
   request can land anywhere (3.6) or that displaced state has somewhere to
   go (3.7), but that *enough* copies exist to survive losing one - still
   the same motivating pressure, not a new one. Third of the six remaining
   rows resolved; Groups C-G and Group B's own final chapter (3.9) remain
   open.
   **Group B now fully checked, 2026-08-23 - all four chapters resolve the
   same row.** 3.9 closes out the arc 3.6-3.8 built: it names the mechanism
   (the registry pattern, already running inside 3.4's load balancer) that
   makes "which copies currently exist" an answerable question at all - the
   precondition every one of 3.6, 3.7 and 3.8 silently assumed. Group B is
   the second of the seven groups (after Group A) to fully resolve its own
   row; Groups C-G remain open as their own chapters are authored.
   **Group C's own first chapter checked, 2026-08-23 - matches.** 2.3's row
   for Group C: "Every instance reaches one database, and it is now the
   ceiling | 3.10-3.13." 3.10's cold open and primary diagram state exactly
   that constraint, and its own "What changes at scale" section quotes 2.3's
   own follow-up roadmap sentence almost verbatim. First of the five
   remaining rows checked; Groups D-G and the rest of Group C (3.11-3.13)
   remain open as their own chapters are authored.
   **Group C's second chapter checked, 2026-08-23 - still matches.** 3.11
   doesn't restate 2.3's own row (3.10 already did); it's a direct
   continuation of 3.10's own application - 3.10 examined the ceiling
   itself, 3.11 examines whether a relational store was the right shape to
   hit it with in the first place. Second of the five remaining rows
   resolved; Groups D-G and the rest of Group C (3.12, 3.13) remain open.
   **Group C's third chapter checked, 2026-08-23 - matches, and is the
   first to actually move the ceiling.** 3.10 examined it, 3.11 asked
   whether the store's shape fit it; 3.12 is the first concrete mechanism
   in this row that relieves it (for reads). Third of the five remaining
   rows resolved; Groups D-G and the last of Group C (3.13) remain open.
   **Group C's fourth and final chapter checked, 2026-08-23 - matches, and
   closes the group's own row entirely.** 3.13 is the last lever on 2.3's
   own ladder - the write half of the ceiling 3.12's replicas left
   untouched. All four of Group C's own rows (3.10-3.13) are now checked;
   Groups D-G remain open as their own first chapters are authored.
   **Group D's own first chapter checked, 2026-08-26 - matches.** 2.3's row
   for Group D: "reads the database should not be answering | 3.14-3.16."
   3.14's cold open is that sentence made concrete (one aggregate query the
   primary recomputes 4,999 times out of 5,000 requests), and the chapter's
   thesis is removing those reads entirely rather than redistributing them -
   which is precisely what separates the row from Group C's, where every
   mechanism still had the database answering. First of the five remaining
   rows checked; 3.15 and 3.16 keep Group D open, and Groups E-G remain
   untouched.
   **Group D's second chapter checked, 2026-08-26 - still matches.** 3.15
   doesn't restate the row (3.14 already did); it takes the same pressure one
   hop further out, removing the request from the network before it can become
   a read at all. **Group D now fully checked, 2026-08-27 - the third of the
   seven groups to close its own row entirely.** 3.16 is the row's strongest
   case: 3.14 and 3.15 both moved reads the database *could* have answered,
   while 3.16 removes the read the database was never the right shape to
   answer. Groups E-G remain open as their own chapters are authored.

16. **CURRICULUM.md §6's own "engineered-cliffhanger" example doesn't parse
    under current chapter numbering, raised authoring 3.8 (2026-08-23).**
    §6's "Rules of use" cites "3.8 ends with two servers and nothing routing
    between them; 3.4 resolves it" as the gold-standard "Preview of next
    chapter" example. Read literally, this can't describe 3.8's own forward
    tease: 3.4 (Group A) is already taught by the time a learner reaches 3.8
    (Group B), so 3.4 cannot be something 3.8 previews toward - a chapter
    can't tease material the learner already has. The actually-shipped
    mechanism instead spans three chapters: 3.6 sets up the fork (two
    instances exist, nothing decides how many or what happens on failure),
    3.7 resolves the state half, and 3.8 resolves the routing/sizing half by
    re-motivating 3.4's already-taught load balancer - exactly what 3.8's
    own §14 row says ("3.4 taught the tool, 3.8 makes it inevitable").
    **Not hacked around** - 3.8 was authored against the real, shipped
    mechanism (3.6/3.7's own "Next" sections, 3.8's own §14 row), not
    against §6's own stale parenthetical. Full reasoning in 3.8's spec §6.
    **Blocks:** nothing. Same class as decisions 1, 4, 6, and 7 (CURRICULUM
    rows contradicting each other or shipped content) - cosmetic doc drift,
    but worth fixing in its own commit so a future author doesn't try to
    author *toward* the stale example. Fix: either update §6's parenthetical
    to describe the real 3.6-3.7-3.8 arc, or replace it with a still-valid
    example from an already-shipped chapter.

17. **CURRICULUM §14's own 3.10 row names a Config exercise the engine has
    no schema for at all, raised authoring 3.10 (2026-08-23).** §14's own
    row: "Exercise: config (indexes; observe simulated query cost) +
    quiz-weighted." Checked directly against
    `src/content/components/config/data.ts`: `sql-database`'s only field is
    `engine` (postgres/mysql) - no `indexes` field exists. Checked against
    every file in `src/validation-engine/rules/`: none inspects indexing or
    simulates query cost. §11.1's own "Config" exercise-type table (`Where
    used: 3.4, 3.13, 3.14, 3.17, 3.24`) doesn't list 3.10 either, so §11.1
    and §14 already disagree with each other before any chapter gets
    authored against them.
    **Distinct in kind from decisions 8 and 14.** Decision 8 (`control`-kind
    edges) and decision 14 (no failure state in `<Walkthrough>`) both name a
    real capability that exists somewhere in the type system or schema but
    isn't wired to the specific place a chapter needs it. Here, there is no
    corresponding schema anywhere to extend - not a missing wire, a missing
    field and a missing mechanism, on a component (`sql-database`) that
    every chapter from 1.2 onward already depends on globally.
    **Not hacked around** - 3.10 was authored with no Editor exercise at all
    (`hasEditorExercise: false`) rather than adding a field to the global
    `sql-database` registry entry (engineering work outside the
    `chapter-author` skill's scope) or repurposing the existing `engine`
    field dishonestly (postgres vs. mysql has no real relationship to
    indexing cost - unlike 3.9's DNS `ttlSeconds` reuse, there is no
    legitimate reading available). CURRICULUM's own "+ quiz-weighted" phrase
    in the same row is read as license for this resolution. Full reasoning
    in 3.10's spec §0.
    **Blocks:** nothing today - 3.10 shipped without it. **Needs a decision
    before any later chapter assumes indexing is config-controllable**: add
    an `indexes` (or similar) field to `sql-database`'s global registry
    entry plus a query-cost-aware validation rule (real engineering, not a
    content-authoring pass), or update CURRICULUM §14's own row and §11.1's
    table to stop describing an exercise this component can't support -
    either way a decision for outside this skill, not something a chapter
    author should resolve unilaterally per chapter.

18. **QUIZ_FRAMEWORK.md §10's own bank Q5 diagram JSON draws the replica read
    edge backwards, raised authoring 3.12 (2026-08-23).** Q5's sample graph
    (the replication-lag diagram question reserved for 3.12) authors its `e3`
    edge as `app-server -> read-replica`, `kind: "request-flow"`. Checked
    directly against `src/content/components/config/data.ts`'s `read-replica`
    entry (`relations.inputs`: category `data` + kind `replication` only) and
    `src/content/components/config/compute.ts`'s own inline comment on
    `app-server` ("a Read Replica's own 'Read query' output targets
    compute"): the intended, shipped direction is the reverse -
    `read-replica -> app-server`. The bank's edge as written would fail
    `component-relations` if it were ever validated instead of rendered
    read-only. **Not hacked around** - 3.12's own chapter quiz (Q4) adapts
    Q5's scenario with the corrected direction rather than reproducing the
    bank JSON verbatim; full reasoning in 3.12's spec §6 and §10. **Blocks:**
    nothing - no chapter has consumed the bank's own broken JSON verbatim
    yet, and 3.12 didn't either. **Needs a doc edit**: correct
    QUIZ_FRAMEWORK.md §10 Q5's `e3` edge to `read-replica -> app-server`, so
    a future author copying the bank JSON verbatim doesn't inherit the
    mistake.

19. **CURRICULUM §14's own 3.13 row AND §11.1's own Config-exercise table
    both promise a shard-key config exercise the engine has no schema for,
    raised authoring 3.13 (2026-08-23).** §14's own row: "Exercise: config
    (shard-key choice ×2 workloads; hot-partition explanations) + trade-off
    (range vs. hash)." §11.1's own "Config" exercise-type table lists 3.13 in
    its "Where used" column (`3.4, 3.13, 3.14, 3.17, 3.24`) - unlike decision
    17 (3.10), where §11.1 didn't list the chapter at all, here both of
    CURRICULUM's own sections agree with each other on the promise. Checked
    directly against `src/content/components/config/data.ts`: neither
    `sql-database` (`engine` only) nor `nosql-database` (`model` only) has a
    shard-key field. Checked every file in `src/validation-engine/rules/`:
    none inspects a shard key, detects a hot partition, or simulates
    cross-shard cost. `search-engine`'s own `shards` field (index
    parallelism) was checked and ruled out as a substitute - a different
    mechanism solving a different problem, not primary-key partitioning of a
    transactional store.
    **Stronger than decision 17, not just a repeat of it.** 3.10's own gap
    was at least internally inconsistent (§11.1 silently disagreed with §14
    by omission); here CURRICULUM's own two sections actively agree with
    each other on a promise neither the component registry nor the
    validation engine can support - a cleaner, more clearly unintentional
    gap.
    **Not hacked around** - resolved the same way decision 17 was: 3.13 ships
    with no Editor exercise at all (`hasEditorExercise: false`), leaning on a
    six-question quiz-weighted assessment that adapts all four of
    QUIZ_FRAMEWORK.md §10's own bank questions already reserved for this
    chapter. Full reasoning in 3.13's spec §0.
    **Blocks:** nothing today - 3.13 shipped without it, same as 3.10 did.
    **Needs the same decision as 17, ideally resolved once for both**: add a
    `shardKey` (or similar) field to `sql-database`/`nosql-database`'s global
    registry entries plus shard-aware validation (real engineering, not a
    content-authoring pass), or update CURRICULUM §14's and §11.1's own rows
    to stop describing an exercise no component in the registry can support -
    either way, a decision for outside this skill, and one that should
    probably be made jointly with decision 17 rather than twice.

---

## Gates verified (so later sessions do not re-check them)

- **Manifest migration - resolved 2026-08-05, no work needed.**
  `pending-content.md`'s "manifest migration to v2 structure precedes Wave 1"
  is stale. `src/curriculum/manifest.ts` is already the v3 map (79 entries,
  migrated per §21.4). Every Wave 1 slug exists. Authoring 3.4 and Bitly means
  repointing those rows off the dummy definitions, which §21.4 explicitly
  permits (dummies "carry no migration weight").
- **Quiz UI - real, verified 2026-08-05.** `ChapterReader.tsx` renders
  `QuizLauncher` straight off `chapter.quiz`, and `appendKnowledgeCheckHeading`
  adds the TOC entry. Authoring the array is sufficient; no engineering work.
  Not yet exercised by a human click-through now that 0.1 has a live quiz.
- **Content invariants are enforced in CI** by
  `src/content/chapters/authoring-invariants.test.ts`: every authored chapter
  has a spec and a lesson body, no em dashes anywhere in authored content,
  component ids resolve and required is a subset of available, no starter graph
  already completes its chapter, quizzes are 3-6 questions with a real
  difficulty ramp, and every quiz option carries a non-empty explanation. A
  chapter that violates these fails the suite rather than shipping.
