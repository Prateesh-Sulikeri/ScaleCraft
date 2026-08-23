# Chapter spec - 3.5 API Gateway

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-5-api-gateway`)
- Lesson body: `public/content/chapters/bb-3-5-api-gateway.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-5-api-gateway`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Wave 3 (Part 2 + Group A Core Infrastructure), per
`pending-content.md`. Fourth and final Group A chapter, immediately after 3.4
Load Balancer (same working tree, same session). Group A is now complete.

## 0. Type classification and the row it's read against

CURRICULUM §14's own row for 3.5 states no explicit `Type:` field (same shape
as 3.2's and 3.3's rows). Classified **Building Block** here, same reasoning
1.2/3.1/3.2/3.3 used for the identical tension: the row's own "New:
`api-gateway`" line introduces a real registry component, and the row's own
exercise names a genuine construction-family activity ("completion... + fix").
This makes Failure modes and Scaling considerations mandatory rather than
optional (§6), and both are genuinely present in this chapter's own content.

**"Completion (multi-service skeleton) + fix (the three roles scrambled)"
only partially maps onto a single buildable Editor exercise - declared here,
not silently narrowed.** Same class of gap decision 7 (pending-chapters.md)
already named for 3.4's "config + trace" promise: §14's exercise line is a
content brief, not a literal spec for the Editor mechanics.

- **Completion, realized as designed.** The starter graph is correctly wired
  end to end except for one missing node in the middle of the chain - the
  same "fault is pure absence" shape 3.1-3.3 each used, adapted here to a gap
  between the reverse proxy and the app tier.
- **"Multi-service skeleton" not realized on the buildable graph.**
  `GraphNode` (`src/lib/graph.ts`) has no per-instance label field. A second,
  visually generic `app-server` node on canvas would render identically to
  the first - it would read as "another instance of the same service" (the
  load balancer's own shape, from 3.4), not "a different service," which
  would actively teach the wrong disambiguation. The multi-service picture
  is instead carried by the lesson's primary diagram (Mermaid, which *can*
  label two boxes "Orders Service" / "Users Service" as text) and by quiz Q2.
  The graded build fronts one service. Same class of finding as decision 3
  (diagram can show more than the buildable graph) and decision 8 (control
  edges shown in the diagram, not exercised on canvas) - not hacked around,
  declared.
- **"Fix (the three roles scrambled)" not realized as a second Editor
  action.** There is no engine concept of a "role" separate from which
  registry component a node literally is, so "scrambled roles" isn't a graph
  fault distinct from a topology fault - there is nothing to build a second
  Fix exercise around without inventing bespoke validation logic outside a
  Completion/Fix exercise's normal shape. Realized instead as the "Three
  components, three jobs" table, the first two Common-mistakes bullets, and
  quiz Q2 (matching, modeled on QUIZ_FRAMEWORK.md §8's own Q8 - the bank's
  published trio-matching example for this exact chapter).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | The client-facing policy layer (routing, auth, rate limiting as config); disambiguate the confused trio reverse proxy / LB / gateway the moment all three exist. |
| Type | Building Block (see §0 above). |
| Difficulty | foundational |
| Estimated time | 25 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 3.4 Load Balancer - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-4-load-balancer` before this chapter was authored - no pulled-forward exception needed, same shape 3.1-3.3 each reported. |
| Unlocks | 3.6 Stateless Services (this chapter's own immediate forward tease, and Group B's first chapter); every later chapter assuming a client-facing policy layer already exists. |
| Building blocks introduced | `api-gateway`. Matches §16's audit row for 3.5 exactly. No new edge kind. |
| Stages trained | Part 3's default plus stage 2 (construction) - the sixth real build in the curriculum, after 1.2, 3.4, 3.1, 3.2, and 3.3. |
| Interview relevance | High, per §14's own note - a perennial follow-up ("gateway vs. LB?"), loop step 4. |
| Production relevance | Any system with more than one internal service and a client-facing policy to enforce (auth, rate limits) runs this pattern - Uber's edge is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented (Building Block, so Practical is not exempt).

1. **Knowledge** - State the API gateway's job: a single client-facing entry
   point that applies auth and rate limiting once, in front of however many
   services exist, then routes by service.
2. **Knowledge** - Distinguish the gateway's job from a reverse proxy's (one
   backend group, no policy) and a load balancer's (identical instances of
   one service, no policy).
3. **Engineering** - Decide when an API gateway is load-bearing (multiple
   services needing consistent policy) versus overkill (one service, no
   shared policy to centralize).
4. **Practical** - Add an API Gateway to a starter graph between the reverse
   proxy and the app tier, wire it correctly, and pass Submit.
5. **Interview** - Answer the "gateway vs. load balancer" follow-up crisply,
   naming what each decides and what each doesn't.
6. **Communication** - Explain, in 1.3's trade-off language, what
   centralizing policy at the gateway buys against what it costs.

Each objective is exercised: 1 by "One entry, one policy, many services" +
"How a request actually gets through" + quiz Q1; 2 by "Three components,
three jobs" + quiz Q2; 3 by "Common mistakes" + quiz Q3; 4 by the build
itself; 5 by "In an interview" + quiz Q5; 6 by "What centralizing policy buys,
and what it costs" + quiz Q4.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly quotes 3.3's own already-shipped "Next" tease (which named 3.5 explicitly, unlike 3.4's own "Next," which was authored before Group A existed and never mentions 3.5 - see §6 below), names what 3.4 added, then poses the new felt pressure: two services, each duplicating its own auth/rate-limit check, drifting apart. |
| 3 Think first | "Think first" callout | Prediction prompt: where should the shared "who's allowed in, how often" question get answered - inside each service, or in one place both sit behind? Never graded; the whole chapter is the payoff. |
| 4-5 Mental model + visual explanation | "One entry, one policy, many services" | One-sentence anchor stated before the diagram, primary diagram (Mermaid, §5 below) immediately after, per §8.1. |
| 6 Core mechanics | "How a request actually gets through" | `requiresAuth` and `rateLimitPerMinute` as the two real config fields, checked once before either service is reached; routing by path is the third piece (matches 2.1's "request shaping" language - see §6 below). |
| 7 Internal mechanics | (folded into beat 6) | Not split into its own section at this chapter's density, same reasoning 3.1-3.3's specs each gave for the identical fold. |
| - Disambiguation | "Three components, three jobs" | Not one of §5.3's 16 numbered beats - an added section directly answering §14's own purpose line ("disambiguate the confused trio... the moment all three exist"). A table, per §20.6's scan-value preference over three paragraphs of prose contrast. |
| 8 Trade-offs | "What centralizing policy buys, and what it costs" | Genuine two-sided call: consistency and one patch point vs. a new hop and the widest blast radius of the three front-door components taught so far. |
| 9 Failure modes | "When the gateway itself is the problem" | **Mandatory for Building Block (§6).** Two failure classes: total outage (correlated across every service, unlike 3.3's single-backend-group 502) and a misconfigured policy value (blast radius, not just an error). Directly exercises quiz Q4. |
| 10 Scaling | "At scale, the gateway becomes the shared ceiling" | **Mandatory for Building Block (§6).** One short paragraph: not the constraint at 10x, becomes the shared ceiling once several services exist and each sends it lightweight-but-cumulative work - the felt limitation Group B's statelessness material (3.6) picks up next (§18.2 rule 3). |
| 11 Production examples | "In production" | Uber - a fresh company from §13's canon list (Cloudflare spent twice, AWS once, Netflix once, Google once - all four already used by 2.1/3.1-3.4; Uber, Stripe, Meta, Discord, LinkedIn, Airbnb all still unused as of this chapter). Who/why/when/trade-off format. |
| 12 Common mistakes | "Common mistakes" | Four: confusing gateway with LB; confusing gateway with reverse proxy; adding a gateway with nothing to centralize; treating the gateway as exempt from the reliability story (it has the widest blast radius, not the narrowest). First two double as the "fix (three roles scrambled)" realization - see §0. |
| 13 Interview lens | "In an interview" | High relevance. Names loop step 4 and the "gateway vs. LB?" follow-up explicitly. Mandatory §10.3 senior-answer line built only from this chapter's and 3.4's own vocabulary. |
| 14 Connections + Preview of next | Backward references woven through prose (1.3, 2.1, 2.3, 3.1-3.4) / "Next" (forward) | Backward: 1.3 (trade-off language, named explicitly in the objective and the trade-offs section), 2.1 (stop-table row, quoted below), 2.3 (Group A's pressure now fully spent), 3.1-3.4 (each named in "Three components, three jobs" or prose) - well past §19's >=2. Forward: 3.6 in "Next" (immediate, matches manifest). No further-out tease this chapter - unlike 3.3's two-tease shape, §14's own 3.5 row names no third connection worth a separately marked tease. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (3.3's own chain, correctly wired; app server and database, correctly wired; nothing connecting the proxy to the app tier), the success condition (API Gateway added and wired into the gap, clean Validate, then Submit), and what's withheld (which specific check fires). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **The multi-service build and the "three roles scrambled" fix - see §0
  above for the full reasoning.** Both are engine-shape findings (no
  per-node label; no "role" concept distinct from component identity), not
  content shortcuts, and both are realized through the lesson/quiz instead
  of a contrived second Editor mechanic.
- **No config predicate gates `requiresAuth` or `rateLimitPerMinute` on
  Submit**, same reasoning 3.3 gave for leaving `terminatesTls` ungated and
  3.2 gave for its DNS TTL field (open decision 11's precedent): both fields
  have real, workload-dependent defaults (`requiresAuth: true`,
  `rateLimitPerMinute: 600`) that are themselves defensible starting points,
  not a trap a learner needs rescuing from by a blueprint gate.
- **Routing rules are not a configurable field on this registry component.**
  `api-gateway`'s only fields are `requiresAuth` and `rateLimitPerMinute` -
  which path reaches which service is expressed by the diagram's edges, not
  an authored routing table. Stated in-lesson and recorded in
  `curriculumContext.simplifications` per open decision 10's own lesson (a
  `simplifications` entry alone doesn't discharge §20.2's honesty
  requirement - the Reader never renders it, so the lesson prose has to say
  it too).
- **No everyday analogy beyond "one entry, one policy, many services."** Same
  minimal-analogy choice 1.2/3.1/3.3/3.4 made; a second competing metaphor
  would violate §5.3 beat 4's "one model per chapter."
- **No second (failure-scenario) diagram.** "When the gateway itself is the
  problem" states both failure classes in prose; neither is really a new
  topology, it's the same one-node-down-or-misconfigured shape 3.3's own 502
  section used, scaled to a wider blast radius - same reasoning 3.1-3.3's
  specs each gave for the identical omission.
- **No §12 nugget devices.** Open decision 5 remains unresolved as of 3.4's
  own instance of it; this chapter is the sixth to omit and declare rather
  than make the call unilaterally.
- **Only one production example**, matching 3.1-3.4's own precedent, not
  §13's allowed 1-3. Uber's edge gateway is a complete, decision-level
  example on its own; a second company for the same decision would restate,
  not add (§20.6).

## 5. Diagram (§7, open decision 3)

**Seventh instance of the same narrow exception** 1.6, 3.4, 2.3 (implicitly),
3.1, 3.2, and 3.3 established. The primary diagram is Mermaid, showing the
client-facing policy layer fronting two named services (Orders, Users) by
path. Captioned narrowly for this diagram only. Unlike the buildable graph
(one service, see §0), the diagram intentionally carries the multi-service
picture the buildable graph structurally cannot - declared, not
inconsistent: §7.2 requires the canvas as the *preferred* renderer where a
topology is expressible as one, and this specific topology (two textually
distinct services) is not expressible as a buildable `ArchitectureGraph`
today (no per-node label field), so Mermaid is the only medium available for
what this chapter actually needs to show.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.5 is `api-gateway`, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: `browser`, `dns`,
`firewall`, `reverse-proxy`, `api-gateway`, `app-server`, `sql-database` -
`client` and `load-balancer` deliberately excluded, matching every prior
Building Block chapter's "no optional piece" precedent; `load-balancer` is
named in prose and quiz only, never required on canvas here, the same way
3.3 named 3.4/3.5 without requiring them.

**Verified against open decision 12's stop-table row for this chapter -
fourth and final of the four rows, all now resolved.** 2.1's own table gives
the API gateway "Auth, rate limits, and request shaping in front of many
services | 3.5." All three pieces hold as written: `requiresAuth` and
`rateLimitPerMinute` are this chapter's own core-mechanics section verbatim,
and "request shaping" is realized as path-based routing to a named service
(the diagram's `/orders/*` / `/users/*` edges and the "How a request
actually gets through" section's "matched to whichever service its path
names"). No change needed to 2.1's row. See the update to decision 12 in
`pending-chapters.md` - Group A's stop-table check is now complete across
all four rows.

**3.4's own "Next" section does not tease 3.5, unlike 3.3's.** Checked
directly: 3.4 was authored standalone before Group A existed (its own
ledger entry, open decision 9) and its "Next" points at 3.8 only. This
chapter's cold open therefore quotes 3.3's tease (which did name 3.5
explicitly) rather than inventing a connection to 3.4's "Next" that was
never written. Not a defect to fix in 3.4 - open decision 9 already flags
3.4's prerequisite-revert and full re-read as separate, future work this
draft pass does not touch.

**No new instance of open decision 9 or 13 raised.** 3.5 introduces no new
edge kind (`control` stays homed at 3.4, per §16), and this chapter's own
`prerequisiteSlugs` in `manifest.ts` was already correct before authoring
(no pulled-forward exception needed).

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.5, and no existing rule
teaches anything gateway-specific (verified directly against
`src/validation-engine/rules/index.ts`). Curated set:

- **`no-direct-client-database`**, **`component-relations`**,
  **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same structural set 3.1-3.3 curated. Note
  that `component-relations` does real teaching work here beyond the
  previous three chapters: `api-gateway`'s own declared contract
  (`inputs: { allowedCategories: ["networking"] }`) means a learner cannot
  wire an app-server's output directly into a gateway - the same
  networking-only-input discipline the registry already enforces for
  `load-balancer`, now visible on a second component.
- **`permissive-firewall` deliberately excluded**, unchanged from 3.2/3.3's
  own reasoning - the starter graph's inherited firewall node is already
  configured `defaultPolicy: "allow-listed"`, and this chapter doesn't teach
  firewall configuration.

`validationRuleIds`: `["no-direct-client-database", "component-relations",
"orphan-component", "missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-5-blueprint`: `browser -> dns -> firewall ->
reverse-proxy -> api-gateway -> app-server -> sql-database`, all edges
`request-flow`. Single right answer at this scale, matching every prior
Building Block chapter's own "one target shape" precedent. No config
predicate (see §4 above for why `requiresAuth`/`rateLimitPerMinute` are left
ungated).

Starter graph: browser, DNS, firewall, and reverse proxy - 3.3's own
blueprint, correctly wired to each other exactly as 3.3 shipped it - plus
app server and database, correctly wired to each other exactly as every
prior chapter has shipped that pair. The reverse proxy has no outgoing edge;
the app server has no incoming edge. Nothing here is illegally connected;
the fault is pure absence in the middle of an otherwise-complete chain,
which is what makes this a **Completion** exercise (§11.1) - matches
CURRICULUM §14's own "completion" wording. `entryPointIds:
["bb-3-5-browser"]`, since the browser node is present and entry-capable
from the start, same as 3.3's own starter graph.

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is telling you the reverse proxy's output goes
   nowhere yet, and the app server has nothing feeding it. One node closes
   both gaps at once."
2. *Directional* - "Add an API Gateway node from the picker (`/` or
   right-click) and wire it between the Reverse Proxy and the Application
   Server - proxy to gateway, gateway to app server."
3. *Directional* - "Both new edges carry request-flow, same as everywhere
   else. Nothing about the gateway's own config (Requires Auth, Rate Limit)
   needs to change from its default for this build."

None states which validation rule fires by name, matching every prior
chapter's own discipline.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default. Four are `single`-kind; Q2 is `matching`.

Q2 models QUIZ_FRAMEWORK.md §8's own Q8 (the bank's published trio-matching
example, explicitly tagged for this chapter) - reworded with fresh option
labels rather than reproduced verbatim. Q1, Q3, Q4, and Q5 are original: Q1
tests the architectural-job distinction directly (with reverse-proxy, LB,
and DNS as named distractors); Q3 tests the centralize-vs-duplicate
Engineering judgment; Q4 tests the blast-radius failure-mode reasoning
directly; Q5 is the "gateway vs. LB?" interview follow-up itself, built only
from this chapter's and 3.4's own vocabulary.

**Position-clustering check.** Correct options sit at c, a, d, b across the
four single-kind questions (Q1/Q3/Q4/Q5) - all four positions used, no
repeat, matching 3.2's own zero-repeat pattern. Checked by eye per the
chapter-author skill's own instruction.

**Matching-question derangement check (Q2).** `pairs[0]`'s correct option
("reverse-proxy") sits at `options` index 2; `pairs[1]`'s ("load-balancer")
sits at index 0; `pairs[2]`'s ("api-gateway") sits at index 1. No pair's
correct option sits at its own pair index - a full derangement, matching
0.2's own Q2/Q3 discipline.

Scope check: every question draws on this chapter's own material plus 3.3
(reverse-proxy's job, Q1/Q2), 3.4 (load-balancer's job, Q1/Q2/Q5), and 1.3
(trade-off framing, Q3) - all already-taught. No question requires anything
from 3.6 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | 0.1's tour, reused without a new tour in every build chapter since. |
| Connect two components and set an edge's kind | 0.1's tour - same gesture, no new UI. |
| Run Validate and read a structural explanation | 0.1's lesson and Fix exercise, reused by every build chapter since, most recently 3.4. |
| Recognize that a correctly-wired chain with one node missing from the middle is missing that node, not miswired | 3.3 already taught this exact shape (gap between two already-correct halves); this chapter reuses it directly rather than introducing a new fault shape. |
| Reason about a new component's job in a topology it hasn't been in before | 1.2/3.1-3.4 - the browser-through-database shape this chapter extends is exactly what 3.3 shipped, with a fifth stop. |
| Reason about a new failure mode a new component introduces | 3.3 already taught the "front-door outage costs what's behind it" shape (502, healthy backends); this chapter widens that to a multi-service blast radius, building on the same vocabulary rather than introducing failure reasoning from scratch. |
| Reason about what changes at 10x/100x for a shared policy layer specifically | New in this chapter (§9 lens 7), building on 1.2/3.1-3.4's own 10x/100x reasoning for their respective components. |
| State a trade-off in 1.3's "we chose X, accepting Y, because Z" form for a new component | 1.3 taught the form; 3.3 was the first to apply it to a component the learner just built; this chapter is the second. |
| Disambiguate three already-individually-taught components against each other | New in this chapter, but only because it is the first chapter where all three exist to disambiguate - each individual component's own job was already taught (3.3, 3.4, this chapter). |

No move is unsourced.

## 12. Items flagged for a second pass

- **The multi-service build/fix realization (§0).** The single most
  load-bearing judgment call in this chapter - a second reader should
  confirm the diagram-carries-what-the-build-cannot reasoning holds, and
  that a learner reading the lesson wouldn't reasonably expect the graded
  build itself to be multi-service given how explicitly the diagram shows
  it.
- **Uber as the production example.** A second reader should confirm this
  reads as a genuine, checkable public claim (edge gateway in front of
  thousands of internal services, centralizing auth) rather than an
  unverifiable specific.
- **The `component-relations` teaching claim in §7** - a second reader
  should confirm a learner who tries to wire an app-server's output
  directly into the gateway actually gets a legible explanation naming the
  networking-only-input contract, not a generic "invalid edge" message.
- **Word count.** 1,356 words at final revision (`wc -w` on the raw
  `.mdx`). Below the 25-minute chapter's proportionate estimate against
  3.3's 1,227/20min ratio (would predict ~1,535) - judged acceptable rather
  than padded to hit the number, per §20.6's "length follows content, not
  the time estimate" rule; flagged for a second reader to confirm nothing
  load-bearing was cut short rather than trusting the density claim.
- **No density revision pass performed as a distinct drafting round** -
  written once against §20.6 directly. Flagged per every prior chapter's own
  precedent of flagging a self-assessed density claim for the next reviewer
  to check rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
