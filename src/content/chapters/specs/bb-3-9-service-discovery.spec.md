# Chapter spec - 3.9 Service Discovery

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-3-9-service-discovery`)
- Lesson body: `public/content/chapters/bb-3-9-service-discovery.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-9-service-discovery`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Same out-of-plan authoring order as 3.6, 3.7 and 3.8 -
`pending-content.md` schedules Group B for Wave 4; this is the fourth and
final Group B chapter authored in this working tree, immediately after 3.8
(already shipped). No sequencing rule (§18.2) is violated - the real
prerequisite (3.8) is already authored - only the wave-grouping plan remains
out of order relative to actual authoring order, same open note the three
prior Group B specs already carried forward.

## 0. Type classification

CURRICULUM §14's own row states an explicit `Type: Concept with config
exercise` for 3.9 - matching §16's own audit note that 3.6-3.10 are
intentional no-component Concept chapters. The chapter carries a real,
Submit-gated Editor exercise (a Config-shaped freshness fix on the `dns`
node), so a Practical objective is included for the same reason 3.6, 3.7 and
3.8's own specs gave.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | How services find each other once instances come and go - the registry pattern, generalized from the load balancer's own already-established health-driven membership (3.4), and the freshness/cost trade-off every discovery mechanism carries. |
| Type | Concept with config exercise (see §0 above; matches CURRICULUM's own row verbatim). |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + Editor combined), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 20`. |
| Prerequisites | 3.8 Horizontal Scaling - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-8-horizontal-scaling` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.10 Databases (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order); 3.26 Fault Tolerance per CURRICULUM's own row ("membership is the precondition of failover"). |
| Building blocks introduced | None. Matches §16's own note that 3.6-3.10 are intentional no-component Concept chapters, and CURRICULUM's own row for 3.9 ("New: none"). `load-balancer` (3.4) is reused as the chapter's own worked example of an already-built registry-shaped mechanism; `dns` (3.2) is reused for its `ttlSeconds` field as the concrete, on-canvas freshness/cost knob. |
| Stages trained | Part 3's default (stages 2-4) plus a freshness-config stage, distinct from 3.6's duplication-safety config, 3.7's reconnection stage, and 3.8's headroom-config stage. |
| Interview relevance | Medium, per §14's own note - surfaces as a follow-up once a design has more than one internal service. |
| Production relevance | Any product whose internal service count has outgrown a hand-maintained address list - Airbnb's SmartStack is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented - Practical included deliberately, per §0 above.

1. **Knowledge** - State what the registry pattern actually answers ("who
   currently counts as this service") as distinct from what routing answers
   ("how do I reach it").
2. **Knowledge** - Explain why the load balancer (3.4) is already a working
   instance of service discovery for one tier, and why the pattern needs
   generalizing (and a name of its own) only once more than one internal
   service needs the same answer.
3. **Engineering** - Contrast health-check-driven freshness (near-immediate,
   costs polling) against TTL-driven freshness (cheap, costs a bounded
   staleness window), and state which mechanism this system already uses for
   each.
4. **Practical** - Lower a starter graph's DNS node `ttlSeconds` until it no
   longer outlasts a stated cutover downtime budget, and pass Submit.
5. **Interview** - Answer "how does service A find service B once B's
   instances change?" naming a registry or DNS-based equivalent, driven by
   health checks, sized against real churn.
6. **Communication** - Predict whether a newly autoscaled instance receives
   traffic before or after it passes its first health check, and explain why
   existing physically isn't the same as being a traffic-eligible member.

Each objective is exercised: 1 by "Membership, not connectivity" + quiz Q1; 2
by "The load balancer already does this, for one tier" + quiz Q3 (bank
adaptation, tagged (3.9)); 3 by "Two ways to answer 'who's current'" + quiz
Q2; 4 by the fix itself + hints; 5 by "In an interview" + quiz Q5 (bank
adaptation, tagged (3.9, 3.4)); 6 by quiz Q4 (diagram, original).

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.8's own "Next" ("once autoscaling is adding and removing them on its own, something has to track which instances actually exist right now"). Felt failure: the load balancer already answers "who's alive" for one tier; the question is what changes once more than one internal service needs the same answer. |
| 3 Think first | "Think first" callout | Prediction prompt: what's actually new about giving this its own chapter instead of folding it into 3.4. Never graded. |
| 4-5 Mental model + visual explanation | "Membership, not connectivity" | One-sentence anchor stated before the diagram; primary diagram is a Mermaid flowchart of the general registry pattern (caller, registry, instances, health signal), explicitly illustrative - not a claim that a registry component exists on canvas - captioned per §7.2. |
| 6 Core mechanics | "The load balancer already does this, for one tier" | The load balancer (3.4) has run this pattern since it was introduced; the general pattern needs a separate name/component only once more than one internal service asks the same question, which this system's current shape doesn't require. `control`-edge canvas gap (open decision 8) disclosed honestly in-prose, third instance after 3.4 and 3.8. |
| 7 Internal mechanics | "Two ways to answer 'who's current'" | Table contrasting health-check-driven freshness (the load balancer, since 3.4) against TTL-driven freshness (DNS, since 3.2) - two legitimate strategies for the same problem, both already present in this system at different points. |
| 8 Trade-offs | Folded into "Two ways to answer 'who's current'" | Both directions' costs stated in the table and the paragraph immediately after it (polling load + grace window vs. cheap lookups + staleness window) rather than a separate section restating the same contrast in fresher words, which §20.6 forbids. |
| 9 Failure modes (o) | "What it costs to get this wrong" | A registry becoming a new single point of failure; a too-loose TTL as silent staleness rather than a crash. |
| 10 Scaling (o) | "What changes at scale" | One person can eyeball a handful of instances; autoscaling reacting without a human in the loop is exactly where discovery stops being optional - the direct payoff of 3.8's own bridge. |
| 11 Production examples | "In production" | Airbnb's SmartStack - unused by any prior chapter (Stripe was 3.6's, Shopify was 3.7's, Netflix was 3.8's), and on-topic: a fleet that outgrew a hand-maintained address list, with the registry itself accepted as new critical infrastructure. |
| 12 Common mistakes | "Common mistakes" | Four: hardcoding addresses once autoscaling exists; a freshness window looser than real churn; treating "passed once" as "healthy forever"; a registry with no redundancy of its own. |
| 13 Interview lens | "In an interview" | Medium relevance, named explicitly. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | Woven through prose / "Next" (forward) | Backward: 3.8 (direct continuation, quoted), 3.4 (the load balancer's own established discovery job), 3.2 (DNS and TTL) - past §19's >=2. Forward: 3.10 only, as the one marked tease (in "Next"). No separate "further out" advance-organizer mention, matching 3.8's own row (which didn't name one either). |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (3.8's own passing system, already fully wired and headroom-correct), the stated scenario (a planned cutover with a 30-second downtime budget against the DNS node's inherited 300-second TTL), the success condition (lower `ttlSeconds` until it can't outlast the cutover, then Submit), and states explicitly that Validate is already clean going in. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No separate Trade-offs section.** Optional-adjacent merge per §6's "merge
  adjacent short sections" rule - both directions' costs are stated in "Two
  ways to answer 'who's current'" (the table plus the paragraph right after
  it) rather than a second section restating the same two rows in fresher
  words, which §20.6 explicitly forbids.
- **DNS's `ttlSeconds` is used as the on-canvas vehicle for the
  freshness/cost trade-off, not as a literal claim that this graph's DNS node
  discovers app-server instances.** In this topology, DNS resolves the
  stack's public entry point (browser -> dns -> firewall -> ... ); the load
  balancer, not DNS, already does real service discovery for the app tier
  (3.4). The lesson states this distinction directly ("Two ways to answer
  'who's current'" table: health-check-driven is the load balancer's own
  mechanism; TTL-driven is DNS's) rather than blurring the two, and the
  graded exercise's scenario (a planned infrastructure cutover) is scoped to
  what DNS's TTL actually controls in this graph - the public address, not
  app-server membership. Flagged in §12 for a second reader to confirm this
  reading holds and doesn't misteach DNS as the app tier's own discovery
  mechanism.
- **No new "Registry" component or edge**, matching CURRICULUM's own row
  ("New: none"). The general pattern is taught via an illustrative Mermaid
  diagram (caller/registry/instances), explicitly captioned as conceptual;
  the graded exercise stays on the two already-registered components (`dns`,
  `load-balancer`) this chapter's content actually reasons about.
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice 1.2/3.1/3.4/3.5/3.6/3.7/3.8 made; a second competing metaphor would
  violate §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved and, per its
  own note (raised at 2.1) that individual chapters should stop declaring
  this one by one, this chapter doesn't add another per-chapter ordinal to
  the count - consistent with every prior Group A/B chapter's own choice.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - Airbnb's SmartStack story is complete on
  its own without a second example diluting it.
- **The 30-second cutover downtime budget is illustrative, handed to the
  learner as a given** - the same "worked example, not an estimation
  exercise" reading 3.8's own spec §4 already established and flagged for a
  second reader; not treated as a new instance of that same question.

## 5. Diagram (§7)

Primary diagram is a Mermaid flowchart of the **general registry pattern**
(Caller, Registry, three Instances, health signal, membership answer) -
explicitly illustrative, not a claim that a registry component exists on
canvas (CURRICULUM's own row: "New: none"). This differs from 3.4/3.6/3.7/3.8's
own Mermaid diagrams, which were all styled as this system's real target
topology; here the diagram intentionally does NOT show this chapter's actual
starter graph, because the concept being taught (the general pattern) and the
graded exercise (a DNS TTL fix on the real topology) are deliberately
different scopes - conflating them into one diagram would misrepresent the
graded exercise as building a registry, which it does not. Captioned per
§7.2 ("the registry, not the caller, tracks who's currently healthy").

No `<Walkthrough>` was considered necessary: the diagram shows a static
pattern, not an ordering between requests over time the way 3.9's own quiz
Q4 (predict-then-check) does - that beat is realized as a diagram-kind quiz
question instead, per the reasoning in §10 below.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.9 is absent (same note as 3.6, 3.7 and 3.8: "3.6-3.10...
are intentional"). No new component, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: the full chain through 3.8 -
`browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`, `load-balancer`,
`app-server`, `sql-database` - all required, unchanged from 3.8's own set,
consistent with Part 3's running-example philosophy.

**Open decision 15's Group B row - fourth and final chapter checked,
2026-08-23 - matches.** 2.3's row for Group B: "Copies of the app tier only
work if a request can land anywhere | 3.6-3.9." This chapter's own content is
the natural close of that arc: 3.6 established that any instance can answer
(request can land anywhere), 3.7 gave displaced state somewhere to go, 3.8
sized the tier to survive losing a copy, and this chapter names the
mechanism (the registry pattern, already running inside 3.4's load balancer)
that makes "which copies currently exist" an answerable question at all -
the precondition every one of the first three chapters silently assumed. All
four Group B rows named in open decision 15 are now checked; see the update
to that decision below.

**Third instance of open decision 8 (`control`-kind edges aren't buildable on
canvas), anticipated by that decision's own "Blocks" line when it was raised
at 3.4.** This chapter's Purpose explicitly names "control edges become
load-bearing" (CURRICULUM §14's own row) - the health signal behind the
registry pattern is exactly the same `control`-kind edge 3.4 introduced and
3.8 already disclosed as not buildable. Handled with the same discipline:
illustrative-only in the lesson's diagram and prose, absent from the graded
`starterGraph`/`blueprint`, disclosed in `curriculumContext.simplifications`.
Not a new finding - decision 8 already named 3.9 as a chapter that would hit
this wall; this is that prediction confirmed, not a fresh instance to
re-litigate.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.9, and no existing rule
tests DNS `ttlSeconds` (verified against
`src/validation-engine/rules/index.ts` - none of the ten registered rules
inspects the `dns` component's config). Writing a new rule is out of this
pass's scope per the `chapter-author` skill.

`validationRuleIds`: 3.8's own curated set unchanged (`no-direct-client-
database`, `component-relations`, `single-instance-load-balancer`,
`missing-input-connection`, `request-flow-cycle`) - none of these fire on
this chapter's own gap (a config value on `dns`, not a topology or
capacity fault), matching 3.4's and 3.8's own precedent of a Config exercise
gated entirely by the blueprint's config predicate, with no Validate-time
warning pointing at the actual fix. The "Your turn" section states this
outright so the learner isn't left hunting for a warning that was never
coming, the same disclosure 3.8's own spec made for its own headroom gap.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-9-blueprint`: the full chain (`browser -> dns -> fw ->
proxy -> gateway -> lb -> app -> db`, all `request-flow`), carrying forward
3.8's own `app` alias config predicate (`instances >= 3`, already satisfied
by the starter) and adding a new predicate on the `dns` alias
(`ttlSeconds <= 30`) - the freshness bar this chapter's own scenario derives
(a 30-second cutover downtime budget; a TTL no larger than that budget bounds
the staleness window to no worse than the cutover itself).

Starter graph: the system as built through 3.8 - browser, DNS at the
inherited `ttlSeconds: 300` default (unchanged since 3.2, never revisited
until now), firewall, reverse proxy, API gateway, load balancer, one
Application Server node at `instances: 3` (3.8's own passing config, carried
forward unchanged), one SQL Database - every edge present, nothing
disconnected or miswired. The sole gap is the DNS node's `ttlSeconds` value.
`entryPointIds: ["bb-3-9-browser"]`.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is already clean here - nothing is wired wrong.
   The gap is between how long the DNS node's current answer stays cached and
   how long the upcoming cutover is actually supposed to take."
2. *Directional* - "At the current 300-second TTL, anyone who resolved the
   old address in the last five minutes keeps using it - about ten times
   longer than the cutover's own 30-second downtime budget."
3. *Directional* - "Lower the DNS node's `ttlSeconds` field until a cached
   answer can't outlast the cutover itself."

None states the exact target number or names a validation rule, matching
every prior chapter's own discipline - the learner derives 30 (or lower) from
the stated scenario, hint 2 doesn't hand it over directly.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default.

Q1 is original, exercising objective 1 (what the registry pattern actually
answers) - no bank question isolates this exact conceptual distinction. Q2 is
original, exercising objective 3 (the two freshness strategies' trade-off) -
no bank question contrasts health-check-driven against TTL-driven freshness
directly; kept at difficulty 1 since it tests straightforward recall of the
table just presented, not an applied scenario. Q3 adapts QUIZ_FRAMEWORK.md
§9's own bank Q7 (tagged "(3.9)" - reserved for this exact chapter: hardcoded
addresses breaking once autoscaling exists), reworded with fresh option
labels rather than reproduced verbatim, exercising objective 2 at the bank's
own tagged difficulty (2). Q4 (`diagram` kind) is original,
realizing CURRICULUM's row's "trace" exercise element as a predict-then-check
question per `pending-content.md`'s own named degradation path (no simulator
UI exists - same precedent 1.6, 1.7, 1.9 and 3.8 already set): a fourth
app-server instance was added by autoscaling moments ago and hasn't completed
its first health check; the learner predicts whether it receives traffic yet.
Distinct from bank Q6 (already used by 3.8's own Q4, an existing instance
dying) and from this chapter's own Q5 (an instance that passes its check but
is broken anyway) - three different failure/membership shapes, not a repeat
of either. Q5 adapts bank Q9 (tagged "(3.9, 3.4)" - reserved for this
chapter: the liveness-vs-readiness gap), reworded, exercising objective 5 and
the mandatory §10.3 interview-lens line.

**Position-clustering check.** Correct options sit at a, c, d, b, a across
all five questions - all four positions used, "a" the only repeat (Q1, Q5).
Checked against 3.6's own sequence (c, a, d, b, c), 3.7's own sequence (b, d,
a, c, b), and 3.8's own sequence (d, a, c, b, a) to avoid the
sibling-clustering pattern the `chapter-author` skill calls out explicitly -
this chapter's opening letter (a) is the one opening letter none of the three
prior Group B chapters used (3.6 opened "c," 3.7 opened "b," 3.8 opened "d"),
so all four Group B chapters now open on a different letter from each other.

Scope check: every question draws on this chapter's own material plus 3.4
(the load balancer's own established discovery/health-check job, Q1/Q2/Q4),
3.2 (DNS and TTL, Q1/Q3), and 3.8 (autoscaling as the motivating pressure,
Q2) - all already-taught. No question requires anything from 3.10 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open a node's config panel and change a numeric field | 3.6's own first config-only fix, reused again by 3.8 - the identical gesture, applied to a different component's field. |
| Run Validate and read that nothing is flagged | 0.1's lesson, reused by every build chapter since; 3.8 was the first chapter where Validate starts and stays clean throughout, and this chapter repeats that same disclosure explicitly in "Your turn." |
| Reason from a stated downtime budget and a stated cache duration to a config target | Building on 1.1's own back-of-envelope habit and 3.8's own headroom-sizing move, aimed here at a freshness window instead of an instance count. |
| Recognize that DNS's `ttlSeconds` (3.2) controls how long a stale answer survives | Taught directly in 3.2, revisited here for the first time since - the field existed but was never load-bearing until this chapter's exercise. |
| Recognize that the load balancer (3.4) is already an instance of the pattern this chapter names | Building directly on 3.4's own health-check mechanism, generalized rather than re-taught from scratch. |
| Predict whether a newly autoscaled instance is traffic-eligible before its first health check | Building on 3.4's own naming of health checks as the failure-detection mechanism, and 3.8's own precedent of realizing a predict-then-check beat as a diagram quiz question. |

No move is unsourced.

## 12. Items flagged for a second pass

- **DNS's `ttlSeconds` as the graded exercise's own knob, scoped to the
  public-address cutover scenario rather than app-server discovery (§4).** A
  second reader should confirm the lesson's "Two ways to answer 'who's
  current'" section draws this distinction clearly enough that a learner
  doesn't come away believing DNS discovers individual app-server instances
  in this topology - it doesn't; the load balancer already does that, and
  DNS's own job here is unrelated to app-tier membership.
- **The illustrative diagram intentionally not matching this chapter's own
  starter graph (§5).** A second reader should confirm that showing the
  general registry pattern (not this system's real topology) is the right
  call given the graded exercise is scoped narrowly to DNS's TTL, rather than
  a missing "target topology" diagram in the style 3.4/3.6/3.7/3.8 all used.
- **Third instance of open decision 8, read as a confirmed prediction rather
  than a new finding (§6).** A second reader should confirm this reading -
  that decision 8 already named 3.9 as a chapter that would hit the
  `control`-edge canvas gap, so this isn't a fresh gap needing its own new
  decision entry.
- **The 30-second cutover downtime budget as a given, worked example (§4).**
  Same class of flag 3.8's own spec raised for its own load figures - a
  second reader should confirm this doesn't blur into §10.1 step 3's
  precision-theater ban, which is scoped to interview back-of-envelope
  estimation specifically, not a stated problem fact.
- **Word count.** 1,212 words at final draft (`wc -w` on the raw `.mdx`) for
  a 20-minute chapter - close to 3.6's own 1,262/20min ratio. Judged
  content-complete against all six objectives and every mandatory §6 section
  (see §3's beat table) rather than short by omission, per §20.6's "length
  follows content" rule - flagged for a second reader to confirm nothing
  load-bearing was cut short.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior Group B chapter's own precedent of flagging
  a self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit pass
yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
