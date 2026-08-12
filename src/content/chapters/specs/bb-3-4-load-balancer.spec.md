# Chapter spec - 3.4 Load Balancer

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-4-load-balancer`)
- Lesson body: `public/content/chapters/bb-3-4-load-balancer.md`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-4-load-balancer`
  (`chapterDefinitionId` flipped from `bb-dummy-1` to the id above)

**Wave.** Pulled forward per `pending-content.md`'s Wave 2 definition ("3.4
Load Balancer - replaces dummy `bb-dummy-1`; the flagship Building Block
chapter, pulled forward as originally planned"), authored 2026-08-11 as part
of Release 5.0.0-alpha's content-platform work (`.claude/docs/pending.md`),
which needs a real chapter to pilot the MDX migration and walkthrough
diagram renderer against - `bb-dummy-1` was placeholder content and couldn't
serve that purpose.

## 0. Blocking decisions resolved before drafting

### 0.1 Missing real prerequisite (3.1-3.3 not yet authored)

`pending-chapters.md`'s status table confirms Group A (3.1 Networking
Fundamentals, 3.2 DNS, 3.3 Reverse Proxy) is entirely unauthored
(`chapterDefinitionId: null`), and 3.3 is itself gated on 3.2 -> 3.1 -> Part
2 (also unauthored). CURRICULUM §14's 3.4 row reads "Assumes: 3.3" - that
prerequisite does not exist as real content, and `manifest.ts`'s
`prerequisiteSlugs: ["3-3-reverse-proxy"]` would make this chapter
permanently unreachable in the app (its prerequisite can never be
"completed").

**Resolved, following pending-content.md's own naming of this as a
deliberate pull-forward, not a new problem:**

1. **Content:** author the chapter assuming only what's actually shipped -
   Part 0, Part 1 (1.1-1.9), and 1.6's three primitive components. The
   lesson never references reverse proxies, DNS, firewalls, or API
   gateways, even as forward teases (this chapter's one allowed tease,
   §19, is spent on 3.8 instead - see §3 below). The motivation is built
   entirely from 1.6's own planted seed ("that something is a load
   balancer, which 3.4 introduces" - 1.6's Scaling section) rather than
   from "a reverse proxy already handles the front door, now give it a
   job." This reads as a clean, self-contained continuation of 1.6, not a
   chapter missing content.
2. **Manifest:** `prerequisiteSlugs` repointed from `3-3-reverse-proxy` to
   `1-9-deep-dive-methodology` (the actual authored frontier) so the
   chapter is reachable. Declared, temporary, commented inline in
   `manifest.ts` - revert once Group A is authored in Wave 3. This is the
   same class of manifest-layer maintenance pending-content.md's "Gates
   verified" section already sanctions ("repointing those rows off the
   dummy definitions, which §21.4 explicitly permits").

**Not yet resolved:** whether §14's "Assumes: 3.3" line itself needs a doc
note acknowledging this is a Wave-2-vs-Wave-3 ordering artifact, not a
content error. Flagged in `pending-chapters.md`'s open decisions rather than
edited unilaterally here (same discipline as 1.6's Mermaid exception).

### 0.2 Topology diagram renderer (pending-chapters.md open decision #3)

Named directly: "Blocks: 3.4 still... 3.4's diagram (multiple instances,
health-check `control` edges) is more complex than 1.6's straight-line
shape... 3.4 needs its own explicit call when authored, not an assumed
extension of 1.6's."

**Resolved the same way 1.6 was, for the same reason, with 3.4's own
caption discipline:** the primary diagram is authored as Mermaid, styled as
the target topology (client -> load balancer -> two app-server instances ->
database, `request-flow` edges solid, `control` edges dashed), captioned
narrowly for *this* diagram only - no claim that `request-flow` or
`control` behave a specific way in general. The real interactive version is
the chapter's own `starterGraph`/blueprint below (request-flow topology
only, see §0.3 for why `control` edges don't appear there). Not a
resolution of §7.2 itself; still open.

### 0.3 New finding: `control` edges aren't buildable yet (engine gap)

Discovered while designing the exercise, not anticipated by any existing
doc. CURRICULUM §16 assigns 3.4 as introducing edge kind `control` (health
checks). Checked directly against the registry
(`src/content/components/config/networking.ts`,
`src/content/components/config/compute.ts`):

- `load-balancer.relations.outputs.allowedKinds` = `["request-flow"]` only.
- `app-server.relations.inputs.allowedKinds` = `["request-flow"]` only
  (its `outputs.allowedKinds` does include `"control"`, but only for the
  opposite direction - a compute component announcing itself *to* a
  Coordinator/Lock Service, not a load balancer probing it).

A `load-balancer --control--> app-server` edge fails `component-relations`
on both ends today. No registry component currently accepts an incoming
`control` edge from a load balancer at all - this isn't specific to 3.4's
content, it's a real gap in the shipped component contracts.

**Not hacked around.** Per this skill's own instruction ("if a rule needs
engine capabilities that don't exist, write the rule as a spec and flag it
- do not hack the engine"), this content pass does not edit
`relations.allowedKinds` on either component (that's an engineering change
to validation-affecting contracts, outside content-authoring scope).
Resolved for this pass: `control` edges are taught and shown in the lesson
diagram (Mermaid, not engine-validated) but are **not** part of the graded
`starterGraph`/`blueprint`, which use `request-flow` edges only. Recorded
in `curriculumContext.simplifications` (honest, not silently omitted) and
flagged below in §12 and in `pending-chapters.md`'s open decisions for an
engineering follow-up: add `"control"` to `load-balancer.relations.outputs
.allowedKinds` and to `app-server.relations.inputs.allowedKinds` (or a
narrower contract scoped to load-balancer specifically) once someone picks
it up.

**Amended by the Opus pass (2026-08-11).** Recording the gap in
`curriculumContext.simplifications` alone was not enough to make it honest
*to the learner*: that field is consumed only by `src/ai/prompt.ts` (the
Deep Check prompt) and is never rendered in the Reader. As drafted, the
lesson taught `control` edges, drew them, and said nothing about their
being unbuildable - a learner who tried to draw one would have been
rejected by `component-relations` with an error and no explanation of why
the chapter showed them something the canvas refuses. §20.2 requires the
simplification be stated honestly in the prose *and* recorded in the
`simplifications` list, not either/or. The lesson body now carries a
two-sentence disclosure directly under the diagram caption. The
`simplifications` entry stays as it was.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Distribute traffic across identical instances, keep unhealthy ones out of rotation, and treat algorithm choice as a workload-dependent decision rather than a default. |
| Type | Building Block. |
| Difficulty | foundational |
| Estimated time | 35 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 1.9 Deep Dive Methodology (declared exception, §0.1 above - curriculum-order prerequisite is 3.3, not yet authored). |
| Unlocks | 3.8 Horizontal Scaling (this chapter's own forward tease); every later multi-instance topology, which all assume a load balancer is available without re-teaching it. |
| Building blocks introduced | `load-balancer`; edge kind `control` (taught/shown, not yet exercised on canvas - §0.3). Matches §16's audit row for 3.4. |
| Stages trained | Part 3's default plus stage 2 (construction) - second real build in the curriculum after 1.6. |
| Interview relevance | High - loop steps 4 (high-level design) and 6 (bottlenecks and failure), per §14's own note. |
| Production relevance | Every service running more than one instance sits behind some form of load balancer, self-hosted or managed - this is not an advanced pattern, it's table stakes past a single server. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented.

1. **Knowledge** - State the two jobs a load balancer does (route requests,
   remove unhealthy instances) and why routing alone isn't load balancing.
2. **Engineering** - Decide why a load balancer in front of a single
   instance adds a failure point without adding capacity.
3. **Engineering** - Choose round-robin vs. least-connections for a stated
   workload and justify the choice against that workload's request-duration
   variance.
4. **Practical** - Fix a starter graph with an under-provisioned load
   balancer: add a second instance, wire it identically, pass a clean
   Validate then Submit.
5. **Interview** - State what happens when one instance behind a load
   balancer dies, and name the follow-up risk the load balancer itself now
   carries, in under a minute.
6. **Communication** - Explain why the load balancer becomes a new single
   point of failure the moment it exists, and what production systems do
   about it.

Each objective is exercised: 1 by "One address, many identical backends" +
"Picking an instance, and knowing who's alive" + quiz Q1/Q3; 2 by the
lesson's cold open + quiz Q2; 3 by "Same rule doesn't fit every workload" +
quiz Q4; 4 by the build itself; 5 by "In an interview"; 6 by "The load
balancer is now load-bearing" + quiz Q5.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 3 short paragraphs | Directly continues 1.6's own planted seed (its Scaling section named "a load balancer, which 3.4 introduces"). The felt pressure: a second instance exists, nothing routes between them, one is still overloaded. |
| 3 Think first | "Think first" callout | Prediction prompt: simplest rule to decide which of two identical instances handles the next request. Never graded. |
| 4-5 Mental model + visual explanation | "One address, many identical backends" | One-sentence anchor (receptionist, not decision-maker) + the primary diagram, Mermaid per §0.2. Diagram precedes the prose that explains it (§8.1); captioned on the two distinct edge kinds. |
| 6 Core mechanics | "Picking an instance, and knowing who's alive" | Round-robin (cheap, fair under uniformity) + health checks (why routing alone isn't enough, an instance can go dark without the LB noticing). |
| 7 Internal mechanics | (folded into beat 6 - see §4 below) | Health-check depth (interval pings over `control`, pulled from rotation on failure) is already the "one level down" 1.6's precedent calls for; not split into a separate section at this chapter's density. |
| 8 Trade-offs | "Same rule doesn't fit every workload" | Genuine two-sided call: round-robin vs. least-connections, uniform-fast workload vs. variable-duration workload, both defensible, cost named both ways (round-robin cheaper to compute, least-connections costs a live per-instance count). |
| 9-10 Failure modes + Scaling | "The load balancer is now load-bearing" | **Both mandatory for Building Block (§6)**, merged into one section, same precedent 1.6 set. Names lens 5 explicitly (the load balancer itself becomes the new single point of failure) and lens 7 (10x: round-robin + a couple instances is enough; 100x: health checks and algorithm choice become the difference between degraded and down). One allowed further-out tease (§19), spent on 3.8 - checked against `pending-chapters.md`'s tease records at draft time, not yet spent elsewhere in this wave besides 1.6's own 3.4 tease. |
| 11 Production examples | "In production" | Cloudflare - load balancing as its literal core product, at global scale. Chosen over a company-specific internal-architecture claim (the Instagram overclaim 1.6's Opus pass caught) precisely because it's a decision-not-company claim that doesn't require guessing at anyone's internal topology. |
| 12 Common mistakes | "Common mistakes" | Four: LB over one instance; picking round-robin without checking workload uniformity; skipping health checks; treating the LB as immune to failure. |
| 13 Interview lens | "In an interview" | High relevance. Names loop steps 4 and 6 explicitly; mandatory §10.3 senior-answer line built only from this chapter's own vocabulary (round-robin, least-connections, health checks, redundancy - no reverse-proxy/gateway terms). |
| 14 Connections + Preview of next | "Next" | Backward: 1.6 (named and deferred this component) and 1.7 (its methodology now applies to a real multi-instance system), both named explicitly - satisfies §19's >=2. Forward: 3.8, this chapter's one tease - note this is *not* the manifest's next chapter (3.5), a declared deviation from §6's "Preview of next chapter" row, see §4. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph's fault (LB routing to one instance) without naming which rule fires, names the success condition (clean Validate, then Submit), states what's withheld: which specific rule(s) will fire and how many findings one under-provisioned LB produces are not previewed - same discipline 1.6 established. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate "internal mechanics" section.** §6 allows merging adjacent
  short sections; health-check depth is folded into beat 6 ("Picking an
  instance, and knowing who's alive") rather than split into its own
  section - at this chapter's density, splitting it would restate the same
  fact ("a check other than routing exists") across two headers instead of
  stating it once at full strength (§20.6).
- **No everyday analogy beyond the one-line "receptionist" framing** in the
  mental-model beat - same minimal-analogy choice 1.6 made; the diagram
  itself carries the concrete shape.
- **`control` edges shown, not exercised on canvas** - see §0.3. This is
  the one real content-vs-engine gap in this chapter; not a simplification
  choice, a flagged limitation.
- **No second (failure-scenario) diagram.** "The load balancer is now
  load-bearing" states the LB's own failure mode in two sentences, which
  reads faster than a second Mermaid diagram would justify at this
  chapter's density budget - same reasoning 1.6's spec §4 gave for the same
  omission.
- **"Preview of next chapter" (§6) previews 3.8, not 3.5.** §6 marks this
  section mandatory for Building Block and 0.1's own Opus pass established
  that it means the *actual* next chapter. The manifest's next chapter is
  3.5 API Gateway, which §0.1 forbids this lesson from naming (unauthored,
  and its vocabulary is outside the boundary this chapter was pulled
  forward under) and which §19's one-tease-per-chapter limit would collide
  with anyway. §14's own 3.4 row names 3.8 as what this chapter prepares
  for ("3.8, which manufactures the demand retroactively"), so the tease
  goes there. Declared, not silent: revisit when Group A lands and 3.5 is
  authored, alongside the `prerequisiteSlugs` revert (§0.1).
- **No §12 nugget devices** (Interview / Production / Engineering boxed
  one-liners). `pending-chapters.md` open decision #5 parked this call for
  "before Part 3, where chapters are long enough that the nuggets would
  actually earn their placement" - 3.4 is the first Part 3 chapter authored
  and the call still has not been made, so this chapter follows 0.1/0.2/1.6
  and carries the equivalent content inline (interview register in "In an
  interview", production in "In production", §9 lenses inside "The load
  balancer is now load-bearing"). Declared here rather than silently
  continued; the decision itself stays open.
- **§14's 3.4 row promises "build + config + trace"; this chapter ships
  build/fix only.** The config beat (algorithm choice across two workloads)
  is taught in the lesson and tested in the quiz rather than gated on a
  canvas config value - deliberately, since both algorithms are defensible
  and there is no correct value to check (see §5). The trace beat hits the
  same missing-simulator wall 1.6 and 1.7 already hit (open decision #7);
  same degradation path applied. Third instance of the same "§14 row vs.
  shipped chapter" drift - it needs one decision, not three per-chapter
  justifications.

## 5. Simplifications (transcribed to `curriculumContext.simplifications`)

- Exactly two app-server instances are ever in scope - how many is 3.8's
  job.
- `control` edges are conceptual only in this build (§0.3) - not a
  pedagogical simplification, an engine limitation, recorded honestly
  either way.
- Algorithm choice is a config decision discussed in the lesson and quiz,
  not enforced by a validation rule - both round-robin and least-connections
  are legitimate for different workloads, so there's no single correct
  config to gate on.

## 6. Component budget (§16)

§16's audit row for 3.4 is `load-balancer` + edge `control`. This chapter
is `load-balancer`'s home; `control` is introduced narratively (§0.3
qualifies how). `availableComponentIds`/`requiredComponentIds`: `client`,
`load-balancer`, `app-server`, `sql-database` (the first three already
available from 1.6, `load-balancer` newly introduced here), both lists
identical - matches 1.6's "no optional piece" precedent, since every
component has a specific job in the required blueprint. Nothing from 3.1-3.3
or 3.5+ leaks in even as scenery.

## 7. Validation rules (deliverable 4)

No new rules authored - all six needed already exist:

- **`single-instance-load-balancer`** - the chapter's namesake rule. Fires
  when a load balancer's total downstream `request-flow` capacity (summed
  across `app-server` targets, respecting each one's `instances` config) is
  below 2. The starter graph's one app-server instance (default
  `instances: 1`) trips this directly.
- **`no-direct-client-database`**, **`component-relations`**,
  **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same structural/reused-concept set 1.6
  curated, included here as guards on the *fixed* state (a learner could
  plausibly mis-wire the new instance straight to the client, or skip the
  load balancer on the new instance) rather than because this chapter
  teaches anything new about them.

`validationRuleIds`: `["single-instance-load-balancer",
"no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-4-blueprint`: `client -> load-balancer -> {app1,
app2} -> sql-database`, all edges `request-flow`. Single right answer at
this scale, matching 1.6's own "one target shape" precedent - this isn't a
multi-approach chapter.

Starter graph (deliberately under-provisioned, not a wiring mistake -
matches §11.1's "fix exercises ship symptoms, never find-the-bug-blind"):
client, load balancer, one app-server instance, and the database, all
correctly wired to each other with `request-flow` edges. Nothing here is
illegally connected; the fault is purely capacity
(`single-instance-load-balancer`). No `control` edges present (§0.3).

**Two engine behaviours the Opus pass verified, worth recording because
they shape the exercise's feel (2026-08-11):**

1. **`single-instance-load-balancer` is severity `warning`, and
   `runChapterValidation` derives `passed` from `errorCount` alone.** The
   starter graph therefore *passes* Validate structurally while still
   listing one issue - `QuestionPane`'s summary line counts every violation
   above `note`, so the learner reads "Last validated: 1 issue" and the
   header pane shows the rule's full explanation. The exercise works, but
   note it works via the issue list, not via a failed Validate the way
   1.6's error-severity fault did. Submit is what actually holds the line:
   the blueprint needs two distinct `app-server` nodes and `pattern.ts`
   binds aliases injectively, so one node can never satisfy both.
2. **"Add a second instance" was ambiguous against the product.**
   `app-server` has a literal `instances` config field (default 1, max 20),
   and the rule sums it - so setting Instances to 2 on the existing node
   clears the warning and yields a clean Validate, then fails Submit with a
   blueprint-drift message reading "Missing: Application Server" while an
   Application Server is plainly on the canvas. Hint 2 disambiguated, but
   hints are never auto-surfaced, so the lesson could not rely on it. The
   "Your turn" brief now says "a second box, not a higher Instances count".
   Naming the mechanic does not spoil the reasoning (§11.2) - the brief
   already states the fault outright; what stays withheld is which rules
   fire and how many findings appear.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate names what's connected and what isn't. The load
   balancer already routes to one instance - how many backends does it need
   before 'balancing' means anything?"
2. *Directional* - "Add a second App Server node from the picker (`/` or
   right-click), positioned like the first one."
3. *Directional* - "Wire the new instance exactly the way the existing one
   connects to the load balancer and the database - same edge kinds, same
   direction."

None states which validation rule fires or what the fix looks like once
found - matches 1.6's precedent.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3. Q2 and Q4 are modeled on
QUIZ_FRAMEWORK.md §8's own Q5 and Q7 (the bank's already-published examples
for this exact chapter and rule) - reworded with a fresh graph/workload
pairing rather than copied verbatim, matching every other chapter's
practice of modeling on, not reproducing, bank content.

**Q1 · single · 1** (correct at `b`). What does a load balancer do that
simply adding a second app-server instance doesn't? Distractors: making
instances individually faster (not this component's job), encrypting
traffic (out of scope), storing session state (3.7's problem).

**Q2 · diagram · 1** (modeled on QUIZ_FRAMEWORK §8 Q5). A shown graph:
client -> load balancer -> one app-server instance -> sql database. What
will Validate flag, and why? Correct: a load balancer over one backend adds
a hop and a failure point without adding capacity or redundancy - the same
fault the chapter's own starter graph ships with, so passing this question
and passing the build test the identical reasoning from two angles.

**Q3 · single · 2** (correct at `a`). What does a periodic health check
protect against? Correct: routing to an instance that's crashed, hung, or
stopped responding. Distractors: TLS between LB and backends (unrelated),
round-robin overloading one instance (a different mechanism entirely),
database connection exhaustion (outside the health check's visibility).

**Q4 · single · 2** (correct at `c`, modeled on QUIZ_FRAMEWORK §8 Q7).
Thumbnail generation (uniform, ~20ms) vs. report generation (200ms-40s,
wide variance) - best algorithm pairing? Correct: round-robin for the
uniform workload, least-connections for the variable one. Distractors:
round-robin for both (breaks under B's variance), least-connections for
both (unnecessary overhead for A), "whichever is fastest to compute" (both
are cheap; the real variable is workload shape, not compute cost).

**Q5 · single · 3** (correct at `d`). Two healthy, health-checked instances
behind a load balancer - what new failure mode was just introduced?
Correct: the load balancer itself is now a single point of failure - its
own outage takes down every healthy instance behind it at once.
Distractors: "no new failure mode" (directly contradicted by lens 5),
"instances can't reach each other" (never a capability that existed to
lose), "requests take measurably longer, that's the main risk" (a real but
minor effect - the taught risk is availability, not latency).

**Position-clustering check.** Four single-kind questions (Q1, Q3, Q4, Q5);
correct options sit at b, a, c, d - four distinct positions, checked by
eye.

Scope check: every question draws on this chapter's own material plus 1.6
(the three-tier shape, referenced not re-taught) and 1.7 (named, not
tested). No question requires anything from 3.1-3.3, 3.5, or 3.8.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | 0.1's tour, reused without a new tour in 1.6 and again here. |
| Connect two components and set an edge's kind | 0.1's tour - same gesture, no new UI. |
| Run Validate and read a structural explanation | 0.1's lesson and Fix exercise, reused by 1.6's Fix exercise, reused again here on a new fault (capacity, not wiring). |
| Reason about a component's job in a topology it hasn't been in before | 1.6 - the three-tier shape is the baseline this chapter extends, not replaces. |
| Reason about a new failure mode a new component introduces | New in this chapter (§9 lens 5) - 1.6 taught the *concept* of a single point of failure on the app server itself; this chapter applies the same lens to a different component. |
| Reason about what changes at 10x/100x for a load-balanced system specifically | New in this chapter (§9 lens 7), building directly on 1.6's own 10x/100x reasoning for the single-instance case. |
| Answer a `diagram`-kind quiz question | Verified real and working per `pending-chapters.md`'s 0.2/1.6 notes - reused pattern, not new UI. |

No move is unsourced. **Sequencing risk noted (§0.1):** this chapter's real
curriculum-order prerequisite (3.3) isn't authored, so the playtest above is
against the *actual* reachable chain (through 1.9), not CURRICULUM §14's
stated one - consistent with the declared exception, not a gap in this
table.

## 12. Items flagged for a second pass

- **The pulled-forward prerequisite (§0.1).** A second reader should
  confirm the lesson genuinely reads as self-contained against only Part
  0/1/1.6's material, with no accidental assumption of reverse-proxy/DNS/
  firewall vocabulary.
- **The `control`-edge engine gap (§0.3).** This is a real, verified
  finding (checked directly against `networking.ts`/`compute.ts`'s
  `relations` contracts, not inferred) that blocks §16's full intent for
  this chapter. A second reader should confirm the diagram-only treatment
  reads as an honest disclosed limitation, not a workaround dressed up as a
  design choice - and that `pending-chapters.md`'s open decisions correctly
  records it for an eventual engineering fix.
- **Cloudflare production example (§11, beat 11).** A second reader should
  confirm this stays a decision-not-company claim and doesn't drift toward
  implementation-tourism the way 1.6's first Instagram draft did.
- **3.8 forward tease (§3, beat 9-10).** Confirm no earlier chapter this
  wave has already spent a tease on 3.8.
- **Word count.** 1,242 words at draft. **Corrected by the Opus pass:** the
  1.6 comparison here was wrong in both directions - this spec said 950 and
  `pending-chapters.md` said 1,209, but `wc -w` on
  `bb-1-6-drawing-the-first-architecture.md` gives 1,279 for a 30-minute
  chapter. So the draft was never long relative to 1.6; if anything it was
  slightly *thinner* per minute. Post-pass the body is 1,333 words (a
  cold-open restatement cut, the §0.3 disclosure and the §13-format
  production example added), which is proportionate to 1.6 at 35 vs. 30
  minutes.

## 13. Opus proofread pass (2026-08-11)

Second-opinion editorial pass over content, content-structure, blueprints,
component lists, submit validations and diagrams. Quiz, hints and the
`problemStatement`/`learningObjectives`/`curriculumContext` fields were
explicitly out of scope and untouched.

**Changed** (lesson body, `lessonVersion` 1 -> 2):

1. **Control-edge disclosure moved into the prose** (§0.3 amendment above,
   §20.2). The strongest finding of the pass.
2. **Diagram caption mechanic corrected.** "Losing a `control` edge to an
   instance takes it out of rotation" taught the graph picture as the
   mechanism; a failed *health check* removes an instance, the edge does
   not disappear. Now: "A failed health check takes that instance out of
   rotation."
3. **Cloudflare example rewritten to §13's who / why / when / trade-off
   format.** "Cloudflare's core product is this exact pattern" is an
   overclaim (its core is a global edge/CDN network; load balancing is a
   product it sells), and "route each request to a healthy *nearby*
   server" quietly introduced geographic steering, which this chapter does
   not teach and which is not the pattern being taught. The replacement is
   a decision claim about a public product, ties
   least-outstanding-requests back to least-connections, and names the
   trade-off the draft omitted (a third party in front of every request).
4. **"Add a second instance" disambiguated** from the `instances` config
   field - see §8's note 2.
5. **Cold-open restatement cut** (§20.6): "something still has to decide
   which instance gets each request" in paragraph 1 was restated in full by
   paragraph 2's "not a scaling win until something distributes requests
   across them". Kept the second, stronger statement; also dropped "by
   habit" as atmosphere.
6. **Dangling self-reference fixed.** "the same cargo-cult shape the lesson
   just named" - the lesson never uses "cargo cult" (§14's row does). Now
   points at the "Common mistakes" bullet that actually names it.

**Checked and deliberately left alone:**

- **Vocabulary boundary (§0.1, §18.2 rule 1) holds.** No reverse-proxy,
  DNS, firewall or API-gateway vocabulary anywhere. "instance", "single
  point of failure" and "hop" are all used in 1.6's own body first; "loop
  step 4 (0.4)" matches 1.6's identical attribution and §14's "steps 4, 6".
  `round-robin` / `least-connections` match the `load-balancer` config
  field's literal option strings.
- **`manifest.ts` not edited** - the `prerequisiteSlugs` exception is
  deliberate and documented; read-only this pass. Verified the entry does
  point at `1-9-deep-dive-methodology` with its inline comment, and that
  3.5's own row lists 3.4 as its prerequisite.
- **Blueprint kept as a single `require` pattern.** There is genuinely one
  right shape here; a second blueprint would be invented variety.
  `commentary` is debrief-only and gated behind a pass. Confirmed the
  starter graph cannot satisfy it (one `app-server` node vs. two injective
  aliases), so the exercise is not handed over solved.
- **Component lists** match §16's audit row - `load-balancer` is homed
  here, the other three come from 1.6, nothing from 3.1-3.3 or 3.5+ leaks
  in. Required equals available, and every one has a job in the blueprint.
- **`validationRuleIds`** - all six resolve in
  `src/validation-engine/rules/index.ts`, and the curation matches what the
  exercise tests. Left `single-instance-load-balancer`'s `warning` severity
  alone: changing it is engine work with cross-chapter reach, out of scope
  for a content pass (see §8 note 1).
