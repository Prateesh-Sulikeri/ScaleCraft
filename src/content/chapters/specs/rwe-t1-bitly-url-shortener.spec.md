# Chapter spec - RWE Tier 1: Bitly (URL Shortener)

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§15 (the Real World Extraction curriculum), §20 (author instructions), and
QUIZ_FRAMEWORK.md §16 (the RWE bank). Deliverable 1 of the 6 in
pending-content.md's "Per-chapter deliverables".

- Chapter definition: `src/content/chapters/index.ts`
  (`rwe-t1-bitly-url-shortener`)
- Lesson body: `public/content/chapters/rwe-t1-bitly-url-shortener.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `rwe-t1-bitly-url-shortener` (`chapterDefinitionId` flipped from
  `rwe-dummy-1` to the id above; the dummy definition and its lesson file are
  deleted, per that fixture's own instruction to replace rather than extend)

**Wave.** `pending-content.md`'s Wave 2, the only item in it still outstanding.
Authored out of wave order relative to Waves 3-5, which is the same note every
chapter since 2.1 has carried: the real prerequisite chain (3.1-3.16 and R1) is
authored and in the tree, so no §18.2 sequencing rule is violated.

**This is the curriculum's first Real World Extraction project.** The other 31
will inherit whatever ships here, so the precedent-setting decisions are in §2
and §4 below rather than buried. The largest - one exercise, no phases - is §2.

## 0. Type classification

**RWE Project**, per §4 ("A real system taught, then built": lesson + one editor
exercise + optional prose Stretch). Consequences that differ from every
Building Blocks chapter authored so far:

- §6's RWE column marks Visual explanation, Trade-offs, Failure modes, Scaling,
  Production examples, Common mistakes, Interview lens, Connections,
  Recap/debrief and the Transition brief mandatory; Think-first, Mental model,
  Core/internal mechanics and Preview of next are optional. Nothing is
  prohibited. All ten mandatory sections are present; three of the four
  optional ones are used (§4).
- §5.3's compressed variant for RWE: "Acts 1 and 5 around one exercise, with a
  debrief after".
- **No `curriculumContext`.** `CurriculumContext`'s own doc comment says RWE
  chapters do not carry one: by RWE, every concept the brief needs is taught,
  so there is no learner stage for Deep Check to scope against. This is the
  AI-layer counterpart of `evaluateChapter` running RWE unscoped.
- **`validationRuleIds` is ignored.** `runChapterValidation` runs the full rule
  registry for `mode: "real-world-extraction"` regardless of the field, which
  is §18.1's "anti-pattern + warnings" posture. The field is left empty rather
  than populated with a list that would read as if it governed something; §7
  below records which rules actually bite.
- **New concepts: 2**, inside §15.1's "≤2-3" budget - short-key generation
  (hash vs. counter, collisions) and 301-vs-302 redirect semantics, exactly as
  §15.2's Tier 1 row specifies.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Produce a whole architecture from a brief whose requirements do not name their own answers, and defend a store choice on the query shape rather than on the technology. |
| Type | RWE Project (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"`. |
| Estimated time | 75 minutes, per §15.2's Tier 1 "est 60-75 min each" and `manifest.ts`'s existing `estimatedMinutes: 75`. Lesson is ~1,900 words; the rest is Editor time. |
| Prerequisites | Checkpoint R1. `manifest.ts`'s `prerequisiteSlugs` already pointed at `checkpoint-r1-a-site-that-stays-up`. |
| Unlocks | Nothing gates on it. Tier 1's four projects are unordered peers behind R1, and Tier 2 gates on Checkpoint R2, not on any Tier 1 project. |
| Building blocks introduced | None. §16's audit lists no row for any RWE project, and its closing note is explicit that RWE needs no new components. |
| Reinforces (§15.1) | LB + stateless tier (3.4, 3.6, 3.8), cache-aside (3.14), replicas (3.12), SQL-vs-NoSQL (3.11). §15.2's own Tier 1 row, unchanged. |
| Stages trained | §2's stage 5 (Design) and stage 6 (Trade-off articulation) - the second is what separates this from R1, which is pure composition. |
| Interview relevance | High. This is the canonical warm-up prompt, and it feeds interview-loop steps 3 (estimate - the read/write ratio), 4 (high-level design), 5 (deep dive on key generation) and 7 (the 301/302 trade-off). |
| Production relevance | The read/write asymmetry and the hot-key problem are the two properties that most often decide a real read-heavy service's shape, and both are visible here at the smallest scale they ever occur at. |
| Interview-canon note (§15.1) | Trains the "tiny surface, all trade-offs" archetype: a system a candidate can draw in four minutes and then be questioned on for thirty. |

## 2. One exercise, no phases (precedent-setting)

Authored against an earlier §15.1 that split every project into a guided Phase A
and an open Phase B. `ChapterDefinition` has one `starterGraph`, one `blueprints`
array, one Validate and one Submit, so Bitly shipped both as one exercise and
raised the gap as open decision 25. **Resolved 2026-10-07:** §15.1 now defines
every RWE project as a lesson that teaches plus one editor exercise, which is the
shape Bitly already has. The brief no longer names phases.

| §15.1 calls for | Realized as |
|---|---|
| Lesson that teaches before the canvas | The lesson's reading teaches both new concepts, the Think-first prompt and the figures table walk requirements and estimation |
| One exercise, multiple valid solutions | The three-node `starterGraph`, `requiredComponentIds`, the 14-component palette, two blueprints, and RWE mode's full-registry validation |
| Trade-off notes that never block | `orphan-component`, `single-instance-load-balancer` and `permissive-firewall` are warnings and inform without blocking |
| Stretch - prose, never graded | The transition brief points at the two Tier 1 projects that own those problems |
| Debrief - ≥2 reference solutions with commentary | The two blueprints, each with a `referenceGraph` and commentary mapping its parts to the chapters that taught them (§13's RWE rule) |
| Retrospective quiz | The five-question `quiz` (§10) |

## 3. Learning objectives (§5.2)

Five, one per category. Objectives 2 and 3 are the chapter's two declared new
concepts, so the novelty budget and the objective list agree by construction.

1. **Knowledge** - State a shortener's read-to-write ratio from its stated
   volumes, and name which of the two paths each component on the canvas is
   serving.
2. **Engineering** - Choose between hashing the long URL and counting when
   generating a short key, naming the specific failure each choice accepts.
3. **Interview** - Answer "why not a 301?" by naming what a permanent redirect
   deletes along with the traffic, in under a minute.
4. **Practical** - Build a redirect path that answers a repeated lookup without
   the store that owns the links doing any work, and pass Submit.
5. **Communication** - Defend a store choice by naming the query shape it serves
   and the cost it accepts, rather than by naming the technology.

Each is exercised: 1 by quiz Q1 and by the brief's two rates; 2 by quiz Q2 and
Q4; 3 by quiz Q3 and Q4; 4 by the build, which cannot pass without it; 5 by the
two blueprints' commentary, which is the only place the learner is told that the
answer they did not pick was also correct.

## 4. Per-beat outline (§5.3's RWE variant, §6's RWE column)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Deliberately contrasted against R1 rather than against a production incident: R1's brief named its own answers, this one does not. Two sentences of scene, per §20.6's cap on atmosphere. |
| 3 Think first (optional, used) | `> [!NOTE]` block | Poses the read/write question the whole chapter answers, before any figure is interpreted. |
| 4 Mental model (optional, used) | "The numbers pick the shape" | The anchor is one sentence: the data is too big to be interesting and the working set is small enough to be free. Delivered as a four-row table per §20.6's scan-value rule. |
| 5 Visual explanation (mandatory) | `<Walkthrough>` "Shorten once, redirect a thousand times" | See §5. |
| 6-7 Core + internal mechanics (optional, used) | "Making a short key" | The first new concept, one level down: collision arithmetic for the hash, block allocation and enumerability for the counter. Carries the chapter's Engineering nugget (§12). |
| 8 Trade-offs (mandatory) | "301 or 302" and "Trade-offs" | Split in two on purpose. The redirect code is a trade-off large enough to be its own section and is the second new concept; the table then covers the remaining four decisions at one row each. |
| 9 Failure modes (mandatory) | "What breaks" | Four, each a concrete symptom rather than a property. |
| 10 Scaling (mandatory) | "What changes at scale" | §9's 10x/100x/1000x ladder. The 1000x rung deliberately reopens the 301 decision, so the chapter's two new concepts collide once before it ends. |
| 11 Production examples (mandatory) | "In production" | Two, both decision-first per §13: Bitly's 302 and Twitter's `t.co` scope bet. |
| 12 Common mistakes (mandatory) | "Common mistakes" | Four bullets, all four drawn from the failure modes and trade-offs above rather than invented. |
| 13 Interview lens (mandatory) | "In an interview" | Ends with the "what a senior answer sounds like" paragraph §10.3 requires, built only from this chapter's own vocabulary. |
| 14 Connections (mandatory) | "Connections" | Four explicit back-references (3.11, 3.14, 3.4/3.6/3.8), past §19's ≥2 floor, plus exactly one forward tease - to Tier 1's Rate Limiter, which is a peer project rather than a later chapter. |
| 15 Recap + debrief (mandatory) | "Recap" | Five retrieval anchors. The debrief half is the two blueprints' commentary, which only renders after a pass (§8.4). |
| 16 Transition brief (mandatory) | "Your turn" | One section, one exercise. See §2. |
| Preview of next (optional, used) | "Next" | Tier 1's three remaining projects, framed as unordered and as problems this system raised without solving. |

## 5. Diagrams (§7)

**One primary diagram, a `<Walkthrough>`, and nothing else.** §7.2's rule is
that a topology which benefits from being stepped through is authored as a
walkthrough rather than a static picture, and that a chapter draws a given
topology exactly once. This chapter's topology has two paths over the same five
nodes at a 1,000:1 ratio, which is the chapter's whole thesis and is invisible in
a static drawing of it.

- **Purpose**: read off the diagram that the write path and the read path
  diverge one hop after the application tier, and that everything added past
  that point exists for the read path.
- **Two algorithms** (`redirect`, `shorten`) rather than two diagrams, so the
  comparison is a toggle over one topology instead of a second drawing of the
  same nodes - which §7.2 names as a maintenance liability.
- **DNS is deliberately absent from it**, stated in the diagram's own
  description. It resolves once and is cached; drawing it on a per-request trace
  would teach the wrong thing about where per-request cost goes. It is still
  required on the canvas, because the brief's "one public hostname" requirement
  is real.
- Captions name the highlighted node in prose, per `WalkthroughStep`'s
  accessibility contract (the diagram is `aria-hidden`; the caption is the only
  description a screen reader gets). All eleven captions are inside the 220-char
  budget.
- The one-line "Note:" caption follows the diagram, naming what to notice: the
  write path never touches the fast tier, and why.

No static topology diagram is authored, because it would be the same five nodes
the walkthrough already draws. Two tables carry the comparisons instead (§20.6's
scan-value rule).

## 6. Component budget (§16) and cross-reference checks

- **`availableComponentIds` is the full Group A-D palette**, identical to R1's
  14. RWE Tier 1 unlocks at R1, so Groups A-D is exactly what a learner arriving
  here has been taught, and §15.3 is explicit that Tier 1 briefs need nothing
  beyond it. Group E (3.17-3.19) is authored in the tree but sits *after* R1 in
  the manifest, so it is not assumed. Nothing appears before its home chapter; no
  §16 exception is needed.
- **`requiredComponentIds` is five**: `browser`, `dns`, `load-balancer`,
  `app-server`, `cache`. Deliberately less than half of R1's twelve, per §15.2's
  Tier 1 instruction ("tiny surfaces, one crisp new problem each"). Each maps to
  a brief line: `browser` + `dns` (one public hostname reached from a browser),
  `load-balancer` + `app-server` (losing the machine that runs application code
  drops no requests), `cache` (the redirect must not reach the store that owns
  the links on most requests).
- **No store is required, and that is the design.** The two honest answers
  disagree about which store this is, so requiring either would foreclose the
  decision the exercise exists to force. A graph with no store passes Validate
  and fails Submit, because both blueprints require one - which is exactly the
  RWE posture split (Validate is anti-pattern, Submit is blueprint).
- **`firewall`, `reverse-proxy`, `api-gateway`, `cdn`, `search-engine`,
  `distributed-cache` and `read-replica` are available and not required.** Five
  of them have no requirement in this brief at all; that is the same
  justify-the-omission move R1's objective 5 made, and it is the reason the
  palette is not trimmed to the required five. `read-replica` is motivated only
  inside blueprint 2. `cdn` is discussed in the trade-off table specifically
  because it cannot help a 302, which makes its absence an argued decision
  rather than an oversight.
- **Sharding is taught (3.13), available as a concept, and actively
  counter-indicated.** Quiz Q1 and Q5 both turn that into the point rather than
  leaving it implicit.

## 7. Validation rules (deliverable 4)

**No new rule authored.** `validationRuleIds` is empty and inert (§0); the full
registry runs. Verified against `src/validation-engine/rules/index.ts`, these
are the rules that can actually fire on this canvas:

| Rule | Severity | What it catches here |
|---|---|---|
| `component-relations` | error | The two likeliest wiring errors on this brief: wiring the fast tier's miss path back into the application tier rather than at a store, and feeding the load balancer from compute. |
| `missing-input-connection` | error | A store or fast tier placed with an outgoing edge and nothing feeding it. |
| `orphan-read-replica` | error | A replica with no `replication` edge in - reachable only on the blueprint-2 path. |
| `request-flow-cycle` | error | The replica's read edge back to the application tier is the one place a learner can close a loop by accident. |
| `orphan-component` | warning | A component dropped on the canvas and never wired, which on an open brief is the "I know I need one of these" failure. |
| `single-instance-load-balancer` | warning | A load balancer whose backends total one instance - the redundancy requirement failed while looking correct. Fires before Submit, which is what makes the `instances >= 2` predicate's drift report avoidable (§8). |
| `permissive-firewall` | warning | Only if a firewall is placed at all, which this brief does not require. |
| `no-direct-client-database` | error | **Inert.** It keys on `client`, which is not in this palette. Same carry as 3.14-3.16 and R1; flagged once for all of them under R1's spec §12, not re-decided here. |
| `queue-without-dead-letter-queue`, `split-brain-risk` | - | Key on Group E/G components that are not in this palette. Unreachable, and unlike the curated Building Blocks lists there is no field to omit them from. |

Two notes a reviewer should weigh:

- **The full registry running unscoped is the first time a learner can be shown
  a violation from a chapter they have not read.** In practice the unreachable
  rules above mean it cannot happen on this brief, because every rule that can
  fire keys on a Group A-D component. That will stop being true at Tier 2. The
  design doc's own position is that by RWE everything is taught, which is true
  in the recommended order and not guaranteed by the manifest's gates - Tier 1
  unlocks at R1, before Groups E-G.
- **Nothing in the registry fires on a design that ignores the read/write
  asymmetry entirely.** A graph with no fast tier is legal, connected and
  rule-clean. What stops it is `requiredComponentIds` plus the blueprints. That
  is intended: the asymmetry is a judgment, and judgments are graded by
  blueprint, not by rule.

## 8. Blueprints, starter graph and decorators (deliverable 3, part of it)

**Starter graph: three nodes, the system as it exists today** - browser,
application server at one instance, relational primary. Authored at the 260px
pitch in one row, one column per tier (§11.5). It cannot already pass:
`dns`, `load-balancer` and `cache` are all required and all absent.

It deliberately starts on the relational store. That is not a nudge toward
blueprint 2 - keeping that store *is* blueprint 2, and it is a correct answer -
so the starting position does not resolve the chapter's central decision in
either direction. It does mean a learner who changes nothing about the data tier
and only adds the read path lands on a passing design, which is the honest
outcome of "this store is defensible", not a shortcut.

**Two blueprints, and unlike R1's pair they are not the same system.**

1. `rwe-t1-bitly-blueprint-keyvalue` - a key-value store with the redirect path
   absorbed in front of it. The `model` predicate accepts `key-value` **or**
   `wide-column`: both are honest answers for 2.4 billion rows fetched one key
   at a time, and grading a preference between them would be scoring taste. Its
   cost, named in commentary, is that click aggregation stops being a query.
2. `rwe-t1-bitly-blueprint-relational` - the existing primary plus a read
   replica. Its cost, named in commentary, is replication lag arriving as a
   user-visible 404 on a link that exists, which is the one brief requirement
   that names a second.

Both require `instances >= 2` on the application tier, because the
no-dropped-requests requirement is common to both and is not a matter of taste.

**Open decision 11 (config-predicate drift), carried forward from R1.** Two
predicates here are on config fields (`instances`, `model`), so "Submit reports a
component missing while it is visibly on the canvas" is reachable. R1's
three-part mitigation is reused where it applies: the threshold is `gte 2` so
the only failing value is the one `single-instance-load-balancer` already warned
about in prose during Validate, and hint 3 names the failure shape without
naming the component or the field. The `model` predicate has no equivalent
prose warning ahead of it, which is a **new instance of decision 11 that is
mitigated only by the hint**. Recorded in `pending-chapters.md`.

**Decorators: three tier zones, one comment, no gap zone.** §11.6 permits one
"Build here" zone where the fix is a missing node in identifiable empty space.
Here the missing nodes span three tiers, and choosing which gaps to draw would
hand over the shape of the answer. An open brief is the one exercise type where
marking the slots defeats the exercise; Tier 2 onward should inherit that. The
single comment carries today's measured rates, which are public information in
the brief and name no component.

## 9. Hints (deliverable 3, part of it)

Four, ramping orienting to directional, none naming a component (§11.3):

1. Orienting, and it is the chapter's actual method: write down the two rates
   first and classify every addition by which one it serves.
2. Structural. Splits "resolve a key" into three questions without saying they
   map to three tiers or naming any of them.
3. Directional, about the drift-report failure shape (§8).
4. Directional, about the one-second-old-link requirement. Says the answer is a
   routing decision rather than another component, which rules out a wrong class
   of fix without supplying the right one.

Deliberately **not** included: any hint naming a store, any hint stating the
read/write ratio (that is the learner's to derive from the brief), and any hint
about which redirect code to serve - the exercise does not grade the status code
at all, and a hint about it would imply it did.

## 10. Quiz (deliverable 5)

Five questions, inside QUIZ_FRAMEWORK §16's "4-6 per project" for retrospective
quizzes. Q1 and Q3 are the bank's own Bitly entries (§16 Q1 and Q2) rewritten to
this chapter's figures and re-cast as review-room scenarios rather than
statements; Q2, Q4 and Q5 are new and keyed to decisions this brief forces.

| # | Kind | Difficulty | Under test |
|---|---|---|---|
| 1 | single | 1 | Read/write asymmetry decides where effort goes |
| 2 | single | 2 | What block allocation does and does not fix about a counter |
| 3 | single | 2 | 301's cost is a product cost, not a latency one |
| 4 | matching | 3 | Four choices, four costs - the chapter's trade-off table as retrieval |
| 5 | single | 3 | A single hot key is the shape partitioning cannot help |

Ramp is 1/2/2/3/3 against §3's rough 30/45/25 target - on five questions that is
20/40/40, heavier at the top than the target, which is deliberate for a
retrospective quiz sitting after a 60-minute build rather than after a first
reading.

The three positional-bias shapes were checked by hand as well as by CI:

- Single-choice correct answers sit at positions 1, 2, 0 and 3 across the four
  single questions - no clustering. No sibling RWE chapter exists yet to compare
  against, so the cross-chapter check the reference doc asks for by eye is not
  yet applicable; the second Tier 1 project should run it against this one.
- Q4's pairs are a full derangement: pair *i*'s correct option is never
  `options[i]`, for any *i*.
- No ordering question, so the pre-solved-sequence shape cannot occur.

Every option carries an explanation that teaches, including the three near-miss
distractors that are *correct observations leading to the wrong conclusion* (Q1
option A, Q2 option D, Q5 option B) - QUIZ_FRAMEWORK §1's "wrong options are
real positions" taken literally.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

"Which prior chapter taught each move this exercise requires?"

| Move | Taught in |
|---|---|
| Derive a read/write ratio from stated volumes before designing | 1.1 Framing the Problem |
| Place a Browser as the origin and give the system one public hostname | 3.2 |
| Resolve that hostname to whatever fronts the request tier | 3.2 |
| Load balancer in front of the application tier | 3.4 |
| Application tier stateless, so any instance may answer any redirect | 3.6, 3.7 |
| Raise the instance count so losing one drops no requests | 3.8 |
| Put a fast tier on the read path, with its miss edge pointing at the origin store | 3.14 |
| Choose a store from the shape of the query rather than from the technology | 3.11 |
| Keep the relational primary and add a replica, with the `replication` edge in and the read edge back | 3.12 |
| Recognize that one hot key is not helped by partitioning | 3.13 |
| Decide against a search tier, an edge tier, a gateway and a perimeter because the brief motivates none of them | 3.16, 3.15, 3.5, 3.1 |
| Assemble a whole system from a brief with no per-requirement prompt | Checkpoint R1 |

Two moves are **not** sourced from a prior chapter, by design: generating a
short key and choosing a redirect status code. Both are this project's declared
new concepts (§15.1: taught in the lesson before the canvas opens),
and both are taught in the lesson before the brief. Neither is graded by the
build - the canvas has no field for either - so a learner who misreads them
still passes, and is corrected by the quiz. That split is worth naming: this
project's two new concepts are assessed entirely by quiz, which is a first.

§18.2 rule 3 ("every advanced topic emerges from a felt limitation") holds
through the cold open: R1's brief named its own answers, this one does not.
Rule 1 holds: nothing in the brief needs an untaught component.

**Failure modes a playtester should watch for**, in likelihood order: the
instance count left at 1 (warned in prose during Validate, then a confusing
drift report at Submit if ignored); a NoSQL store placed with `model` left at
its `document` default, which fails the predicate with no prose warning ahead of
it; the fast tier wired to the application tier in both directions, closing a
cycle; a replica placed with no `replication` edge; and a design that adds a
perimeter and a gateway out of R1 habit, which passes and is worth a reviewer's
attention only because the lesson argues against it.

## 12. Items flagged for a second pass

- **This chapter sets the RWE precedent.** ~~The Phase A/B collapse (§2) should
  not harden silently.~~ Resolved 2026-10-07: §15.1 now defines one exercise per
  project, matching what ships here.
- **`src/content/chapters/index.test.ts` and
  `src/content/content-service.test.ts` both fail until updated.** The first
  asserts the RWE registry holds exactly one chapter with id `rwe-dummy-1`; the
  second searches for the title "placeholder project". Both are direct
  consequences of replacing the dummy, both are test edits, and this skill does
  not write tests - flagged rather than done. (The two
  `real-world-extraction/[chapterSlug]` page tests also mention `rwe-dummy-1`,
  but they mock `@/curriculum` and `chapterRegistry` outright, so the string is
  an opaque fixture there and nothing breaks.)
- **Full-registry validation on a Tier 1 palette is safe today and will not stay
  safe** (§7). Tier 1 unlocks at R1, ahead of Groups E-G, so a Tier 2 project
  reached the same way could surface a violation from an unread chapter. Worth
  deciding before Tier 2 is authored, not after.
- **The two new concepts are assessed only by the quiz** (§11). Neither key
  generation nor the redirect code has a canvas representation, so the build
  cannot test them. If that is unacceptable, the fix is a config field on a
  component, which is a registry change and out of this skill's scope.
- **`readingLinks` is empty**, as in every chapter so far - the private textbook
  has no citable section for this project yet.
