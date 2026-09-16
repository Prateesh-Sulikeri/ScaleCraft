# Chapter spec - Checkpoint R1: A Site That Stays Up

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§14 Part 4 (the R1 brief), §20 (author instructions). Deliverable 1 of the 6 in
pending-content.md's "Per-chapter deliverables". Lives beside the lesson so a
reviewer can check the prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-r1-a-site-that-stays-up`)
- Lesson body: `public/content/chapters/bb-r1-a-site-that-stays-up.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `checkpoint-r1-a-site-that-stays-up` (`chapterDefinitionId` flipped from
  `null` to the id above)

**Wave.** Authored immediately after 3.16 in the same working tree, closing the
Group D + R1 half of `pending-content.md`'s Wave 5. Same out-of-wave-plan note
every Wave 3/4/5 chapter's spec has carried: the real prerequisite chain
(3.1-3.16) is authored and shipped, so no §18.2 sequencing rule is violated -
only the wave grouping is out of order relative to actual authoring order.

**This is the curriculum's first Checkpoint.** Several contract questions are
answered here for the first time, and R2 and R3 will inherit the answers: what
a Checkpoint's §6 section inventory actually looks like in a file, that a
checkpoint ships no quiz and completes on Submit alone, and how a blank-canvas
brief stays inside §11.2's calibration rule. §12 of this spec lists what a
reviewer should confirm before that precedent hardens.

## 0. Type classification

**Checkpoint**, per §4 ("Blank-canvas re-demonstration, no new material",
examples "R1-R3", exercise "The chapter IS the exercise") and §14 Part 4's own
R1 entry. Consequences, all of which differ from every chapter authored so far:

- §6's Checkpoint column marks only four sections mandatory: Motivation / cold
  open (beats 1-2), Connections (14), Transition brief (16), Preview of next.
  Every other section in the table is **prohibited** (`-`), not optional -
  including Visual explanation, so this chapter has no diagram (§5 below).
- §5.3's own compressed-variant note: "Checkpoints have only beats 1, 16."
  Beat 14 is added back by §6's table, which is the stricter of the two, so the
  lesson runs beats 1-2, 14, 16 plus the preview.
- §22: checkpoints have no quiz. The build is the assessment.
- §14: no starter graph. That also means no `starterDecorators` (§11.6 applies
  only to a chapter that has a `starterGraph`).
- No new components, no new edge kinds, no new validation rules (§4: "no new
  material").

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Re-derive the full Group A-D stack from a product description instead of a starter graph. The first spaced-retrieval event in the curriculum: proves assembly from memory of what was, until now, mostly completed-from-scaffolds. |
| Type | Checkpoint (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"`. |
| Estimated time | 45 minutes, per §14 Part 4's own `Est: 45` and `manifest.ts`'s existing `estimatedMinutes: 45`. Almost all of it is Editor time; the Reader half is ~770 words. |
| Prerequisites | 3.16 Search Systems. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-16-search-systems`. |
| Unlocks | Group E (3.17), Group F (3.20) and Real World Extraction Tier 1, all four projects. Verified in `manifest.ts`: those rows carry `prerequisiteSlugs: ["checkpoint-r1-a-site-that-stays-up"]`. Group G is gated on E and F, not directly on R1. |
| Building blocks introduced | None. §16's audit lists no row for R1, and §4 forbids new material in a checkpoint. |
| Stages trained | §2's stage 5 (Design - "assembles a whole system from an ambiguous brief"), which §2's own table names checkpoints as the vehicle for. Stages 2-4 are exercised in passing. |
| Interview relevance | High, but indirectly: this is the first time the learner produces a whole design in one pass, which is what interview step 4 actually asks for. No Interview lens section, because §6 prohibits one in a Checkpoint - the interview framing lives in the cold open instead, in two sentences. |
| Production relevance | The composition itself. Every requirement in the brief is a line a real product's rebuild would carry. |

## 2. Learning objectives (§5.2)

Five objectives, one per §5.2 category. Practical is not exempted: a checkpoint
is nothing but its build. Every objective is a composition or retrieval
objective over Groups A-D - a checkpoint that claimed to teach something new
would be a type error (§4).

1. **Knowledge** - Name, for each requirement in a product brief, which taught
   component answers it and which chapter established that.
2. **Engineering** - Order the request path from browser to data tier so that
   each stop only receives traffic a component upstream of it has already
   handled.
3. **Practical** - Assemble the full Group A-D stack on an empty canvas, with no
   starter graph and no per-requirement prompt, and pass Submit.
4. **Communication** - Answer "walk me through your design" as one pass over the
   request path rather than a list of components, naming what each stop is there
   to do.
5. **Interview** - Justify leaving a taught component out of a design by
   pointing at the requirement that would have motivated it and showing the
   brief does not contain one.

Each objective is exercised: 1 and 3 by the build itself, which cannot pass
without both; 2 by the blueprint's edge set, which fails on any out-of-order
path; 4 by the passing blueprint's debrief `commentary`, which reads the graph
back in request order; 5 by `nosql-database`, `distributed-cache` and sharding
being available, taught and unmotivated by this brief (§6 below). There is no
quiz to exercise them through, which is §22's intent, not a gap.

## 3. Per-beat outline (§5.3 compressed variant, Checkpoint type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 3 paragraphs | The felt pressure is structural rather than a production incident, because that is what actually changed: twelve chapters of starter graphs, then an empty canvas. Names the specific skill being tested (producing a system vs. extending one) and why it is worth failing here rather than in RWE. Two sentences of interview framing, since §6 prohibits an Interview lens section. |
| 14 Connections | "Connections" | Four-row table, one row per group, each row phrased as the *question* the group answered rather than the components it introduced - a retrieval cue that does not hand over the mapping the exercise is testing. Then two carry-forward rules named with their source chapters: an inert component earns nothing (3.1, 3.14), and an unmotivated component is worse than none. Past §19's ">=2 explicit prior-chapter connections" by a wide margin. |
| 16 Transition brief | "Your turn" | The chapter's substance. Product scenario in one paragraph, then nine requirements as bullets, then an explicit "what you are not told" paragraph. Calibration is discussed in §4 below. |
| Preview of next | "Next" | Names the branch R1 unlocks (Groups E and F, RWE Tier 1) in one clause, then spends the pull on 3.17 alone, via the arrow 3.16 could not draw. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **Eleven of §6's fifteen sections are absent, and none of them is a
  judgment call.** §6's Checkpoint column marks Think-first, Mental model,
  Visual explanation, Core/internal mechanics, Trade-offs, Failure modes,
  Scaling considerations, Production examples, Common mistakes, Interview lens
  and Recap/knowledge-check as `-`, which the table's own legend defines as
  **prohibited**, not optional. They are omitted because the type forbids them.
  Recorded here rather than left silent because every prior chapter in this
  repo has shipped ten-plus sections, so their absence would otherwise read as
  an unfinished draft.
- **No diagram, for the same reason** (§5 below).
- **No quiz** (§22: "checkpoints have none - the build is the assessment"). The
  `quiz` field is simply absent, which `ChapterDefinition`'s own doc comment
  anticipates ("Absent means the chapter has no quiz - checkpoints never have
  one"). Checked in `src/curriculum/progress.ts`: `deriveStatus` completes a
  chapter that has an editor exercise and no quiz on the validation pass alone,
  so this does not strand the chapter as permanently incomplete.
- **The brief is longer than §11.2's "short scenario (2-3 sentences)" norm for
  `problemStatement`, deliberately.** §14's R1 entry defines the checkpoint as
  "a described mid-size web product" and §4 says the chapter *is* the exercise:
  there is no lesson body carrying the requirements separately, so the
  requirement list has to be in the Editor with the learner. It is authored as
  one scenario paragraph plus nine requirement bullets, mirrored verbatim in the
  lesson's transition brief. Calibration is unaffected and was checked line by
  line: every bullet states a symptom or an outcome ("the work of answering it
  does not grow with the 2.1 million listings"), and none names a component, a
  config field, an edge kind or a count.
- **No Interview lens section, but the interview framing survives in two
  sentences of the cold open.** §6 prohibits the section in a Checkpoint;
  dropping the framing entirely would lose the reason this exercise exists
  (§2's stage 5, and interview step 4's "produce a design in one pass"). Two
  sentences is the smallest honest version.
- **No `readingLinks`.** Same as every chapter authored so far - the private
  textbook has no citable section for "assemble what you already know".

## 5. Diagrams (§7)

**None, and this is the one chapter type where that is correct.** §6's
Checkpoint column marks Visual explanation `-`. The reason holds up on its own:
the diagram this chapter would draw is the answer to its own exercise. Showing
the learner the assembled twelve-node system before asking them to assemble it
would delete the chapter.

The lesson does carry one table (the four groups and their questions), which is
§20.6's "prefer the format with the highest scan value" rather than a diagram
under §7.

## 6. Component budget (§16) and cross-reference checks

- **`availableComponentIds` is the full palette through Group D**, identical to
  3.16's list of 14: `browser`, `dns`, `cdn`, `firewall`, `reverse-proxy`,
  `api-gateway`, `load-balancer`, `app-server`, `sql-database`,
  `nosql-database`, `read-replica`, `cache`, `distributed-cache`,
  `search-engine`. §14 Part 4's own R1 line: "Palette: everything through Group
  D." Nothing appears before its home chapter, so no §16 exception is needed -
  the first checkpoint is the first chapter in the curriculum that introduces
  nothing at all.
- **`requiredComponentIds` is 12 of those 14.** Each maps to a requirement in
  the brief: `browser` + `dns` (one public domain name, reached in a browser),
  `cdn` (a third of the audience on another continent downloading identical
  bytes), `firewall` (default closed at the perimeter), `reverse-proxy`
  (certificate terminated in one place), `api-gateway` (one place authenticates
  and rate-limits), `load-balancer` + `app-server` (peak exceeds one machine,
  and losing one drops nothing), `sql-database` (one store owns a listing),
  `read-replica` (recruiter reports must not slow the seekers), `cache` (the
  same few thousand listings, opened over and over), `search-engine` (free-text
  search whose cost must not track 2.1 million listings).
- **`nosql-database` and `distributed-cache` are available and deliberately not
  required.** Nothing in the brief describes a document-shaped workload or a
  cache tier that has outgrown one machine. Requiring either would teach exactly
  the cargo-culting §9's lens 9 exists to inoculate against, and it is the same
  call 3.14 made in its own spec when it left `distributed-cache` out of its
  required list while teaching it. Objective 5 makes the omission the point
  rather than an accident.
- **Sharding (3.13) is taught, available as config on the data components, and
  unmotivated here.** 2.1 million listings fit on one primary. Recorded in
  `curriculumContext.simplifications` so Deep Check does not read its absence as
  a gap.
- **Cross-chapter check on the numbers.** The brief's 2.1 million listings sit
  deliberately close to 3.16's 4.2 million products without reusing them: same
  order of magnitude, so the same reasoning transfers, different product so the
  learner cannot pattern-match the previous chapter's canvas from memory of a
  number.

## 7. Validation rules (deliverable 4)

**No new rule authored.** §4 forbids new material in a checkpoint, and every
failure this exercise can produce is already covered by a rule Groups A-D
curated at least once. The curated set is the widest any Building Blocks chapter
ships (8 of the registry's 10), which is what "prescriptive validation" on a
composition gate means - verified against
`src/validation-engine/rules/index.ts`:

| Rule | Severity | What it catches here | Where it was taught |
|---|---|---|---|
| `component-relations` | error | Any edge the components themselves refuse: a database wired into the search engine, a load balancer fed from compute, the browser wired straight into the data tier. | Curated in every editor chapter since 0.1 |
| `missing-input-connection` | error | A component with an output edge and nothing feeding it - the "looks wired, cannot be reached" build, which on a 12-node blank canvas is the single likeliest mistake. | Curated since 0.1; 3.14's own starter fault |
| `orphan-read-replica` | error | A replica with no replication edge from a primary. | 3.12 |
| `request-flow-cycle` | error | A path that loops back on itself, easy to draw when the replica's read edge returns to the app tier. | 0.1 through 3.9. **Restored here**: 3.10-3.16 dropped it because their starter graphs made a cycle unreachable, which a blank canvas does not. |
| `no-direct-client-database` | error | A Client wired straight to a store. **Inert here**: it keys on `client`, and `client` is not in this chapter's palette, so nothing on the canvas can trigger it. True of 3.14-3.16 too, which all carry it against the same palette. Kept for continuity rather than making R1 the one chapter that drops it; flagged in §12. | 1.2 |
| `orphan-component` | warning | A component dropped on the canvas and never wired. On a blank canvas this is the "I know I need one of these" failure. | 0.1 |
| `single-instance-load-balancer` | warning | A load balancer whose backends total one instance - the "stays up" requirement failed while looking correct. | 3.4, 3.6, 3.8, 3.9 |
| `permissive-firewall` | warning | `defaultPolicy: "allow-all"` - the perimeter drawn but not closed, which the lesson's Connections section names by hand. | 3.1 |

Two notes a reviewer should weigh:

- **The two warnings do not block Submit** (`runChapterValidation` gates on
  `errorCount`). `single-instance-load-balancer` is therefore not what enforces
  the redundancy requirement - the blueprint's config predicate is (§8). The
  warning's job is to explain the failure in teaching-quality prose *before* the
  learner reaches Submit, which is the sequence that defuses open decision 11
  here (see §8).
- **Nothing in this set fires on a design that answers only eight of the nine
  requirements.** A learner who forgets the cache builds a graph that is legal,
  connected and passes every rule; what stops it is `requiredComponentIds` plus
  the blueprint. That is the intended posture for a prescriptive checkpoint, and
  it is why the required list is 12 rather than a smaller "core".

## 8. Blueprints and starter graph (deliverable 3, part of it)

**No starter graph** (§14: blank canvas). Consequences worth stating because
they are what makes this chapter structurally different from the other 16 editor
chapters: `authoring-invariants.test.ts`'s starter-graph gates (the 320x160
pitch, the 2.5:1 aspect ceiling, "a starter graph must not already complete the
chapter", the `exerciseGoal`/`successCriteria` spoiler check) all skip this
chapter, because each one is guarded on `chapter.starterGraph` being present.
The brief was therefore checked against §11.2 by hand rather than by CI, line by
line - see §4.

`exerciseGoal` and `successCriteria` are authored anyway. The invariants test
does not require them here, but `QuestionPane` renders them under "Goal" and
"You're done when", and a blank-canvas exercise needs the success statement more
than a completion exercise does, not less.

**Two blueprints, and they are the same system.** §14 says prescriptive, and the
reference-doc rule is that multiple blueprints are only honest when the chapter
genuinely has more than one right answer. It does here, on exactly one axis: the
redundancy requirement has two correct expressions on this canvas.

1. `bb-r1-blueprint-instances` - one `app-server` node with
   `instances >= 2`. The shape 3.4 through 3.16 all drew, and the shape 3.8
   taught explicitly ("duplicating is a config change, not new architecture").
2. `bb-r1-blueprint-two-nodes` - two distinct `app-server` nodes, both fed by
   the load balancer. Pattern matching binds aliases injectively
   (`pattern.ts`'s `backtrack`: "injective bindings - no opt-out"), so this
   genuinely requires two nodes. It is also what `single-instance-load-balancer`
   itself counts as capacity 2, so accepting it keeps the blueprint and the
   rule agreeing about what redundancy means.

Both carry the same twelve required components and the same request path; only
the application tier differs. The second blueprint's `commentary` names what the
drawing cannot say (that two nodes are identical) rather than pretending the two
answers are equivalent in every respect.

**Open decision 11 (config-predicate drift), handled deliberately.** A failed
config predicate reports through `nearestBlueprintDrift` as
`missingComponents: ["Application Server"]` while an Application Server is
visibly on the canvas - a confusing failure, and worse here than anywhere so far
because a learner reaching Submit has just spent 40 minutes on a 12-node build.
Three things were done about it rather than one:

- **The predicate threshold is `gte 2`, not an N+1 figure.** 3.8 used `gte 3`
  against a stated peak-load arithmetic; R1 states no per-instance capacity, so
  the only value that fails is 1. That is exactly the value
  `single-instance-load-balancer` warns about, in prose that names the problem,
  during Validate - so the confusing drift report is unreachable for a learner
  who read the warning they were already shown.
- **The second blueprint** removes the other route into the same trap: two nodes
  at one instance each fails the predicate but matches blueprint 2.
- **Hint 3 names the failure shape directly** ("if Submit says a component is
  missing while you are looking straight at it") without naming the component or
  the field, converting the one remaining path into it from a mystery into a
  prompt.

This does not resolve decision 11. It is the fourth instance, handled, and the
first one where the mitigation is designed rather than accepted.

## 9. Hints (deliverable 3, part of it)

Three, ramping orienting to directional, none naming a component (§11.3):

1. Orienting, and it answers the question a blank canvas actually raises
   (Validate has nothing to say yet). Points at ordering the request path first
   and notes that four of the nine requirements are about that path alone.
2. Structural: sorts the remaining requirements by *what kind of read* each one
   describes, and says there are four kinds needing four different answers. This
   is the chapter's real difficulty, and it stops short of the mapping.
3. Directional, and specifically about the drift-report failure shape (§8).

Deliberately **not** included: any hint listing components, any hint naming the
chapter that answers a requirement, and any hint about the order of the edge
tier. A checkpoint whose hints hand back the recall it is testing is not a
checkpoint.

## 10. Quiz (deliverable 5)

**None.** §22: "checkpoints have none (the build is the assessment)". See §4.

`authoring-invariants.test.ts`'s quiz block filters on
`c.quiz && c.quiz.length > 0`, so an absent quiz is skipped rather than failed.
The positional-bias check that the reference doc asks for by eye is not
applicable for the same reason.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

"Which prior chapter taught each move this exercise requires?" Every move, in
build order:

| Move | Taught in |
|---|---|
| Place a Browser as the origin, draw it to DNS | 3.2 (and 2.1's request-path map) |
| DNS to CDN rather than DNS to origin | 3.15, which closed 3.2's DNS-steering foreshadow |
| CDN in front of the origin for identical bytes | 3.15 |
| Firewall at the perimeter, policy not `allow-all` | 3.1 |
| Reverse proxy terminating TLS once | 3.3 |
| API gateway authenticating and rate-limiting in one place | 3.5 |
| Load balancer in front of the app tier | 3.4 |
| App tier stateless, so any instance may answer | 3.6, 3.7 |
| More than one instance, so losing one drops nothing | 3.8 |
| SQL database as the one store that owns a listing | 3.10 |
| Read replica plus the `replication` edge, and its read edge back to the app tier | 3.12 |
| Cache on the read path, with its miss path to the origin | 3.14 |
| Search engine fed from the application tier | 3.16 |
| Deciding *not* to add a document store, a distributed cache or sharding | 3.11, 3.13, 3.14 (each taught the motivating condition, none of which this brief contains) |

No move is unsourced, so §18.2 rule 4 holds: a learner who has done only the
prerequisite chain can solve this with no outside knowledge. Rule 3 ("every
advanced topic emerges from a felt limitation") does not apply - a checkpoint
introduces no topic. Rule 1 holds trivially: nothing here is untaught.

**Failure modes a playtester should watch for**, in likelihood order: the edge
tier drawn in the wrong order (nothing catches an ordering that is still legal
per-component, only the blueprint does, and the drift report will name the
mismatched connection); a cache wired to the primary but with nothing asking it,
which is 3.14's own starter fault reproduced from memory; a replica placed with
no replication edge; and the instance count left at 1.

## 12. Items flagged for a second pass

- **This chapter sets the Checkpoint precedent.** R2 and R3 will copy whatever
  ships here. The four-section lesson, the requirement-list `problemStatement`,
  the no-quiz completion path and the widest-curated rule set are all first
  instances. Worth one deliberate review pass before R2 inherits them.
- **A 45-minute build with a single Submit at the end has no intermediate
  feedback**, and nothing in the product currently offers a way to check
  progress mid-build other than Validate, which cannot see missing
  requirements. Not a content problem and not fixed here; flagged because R1 is
  the first exercise long enough for it to matter.
- **The two warning-severity rules cannot fail this chapter.** A design with an
  `allow-all` firewall passes R1 while the lesson's own Connections section says
  a firewall that filters nothing earns nothing. Making that an error is a rule
  change (a scoped severity override does not exist), not a content change, so
  it is flagged rather than done. Same shape as open decision 11's severity
  question.
- **`no-direct-client-database` cannot fire in any Group D chapter or in R1**
  (§7): it keys on `client`, which left the palette after Part 1. It is either a
  harmless continuity carry or noise in four curated lists; a reviewer should
  decide once, for 3.14-3.16 and R1 together, rather than per chapter.
