# Chapter spec - 3.15 CDN

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-15-cdn`)
- Lesson body: `public/content/chapters/bb-3-15-cdn.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-15-cdn`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Second Group D chapter, authored immediately after 3.14 in this same
working tree. Same out-of-wave-plan note every Wave 3/4 chapter's own spec has
carried forward: the real prerequisite (3.14) is already authored, so no
sequencing rule (§18.2) is violated - only `pending-content.md`'s wave grouping
(Group D is Wave 5) is out of order relative to actual authoring order.

## 0. Type classification

Building Block, per §4/§16 - CURRICULUM §14's own row states "**New: `cdn`**"
and §16's audit table lists "3.15 | `cdn`". Consequence, same as 3.11/3.12/3.14:
Failure modes and Scaling considerations are **M** (mandatory), not **o** - both
appear as full sections.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Caching at the edge: what belongs on a CDN and what must never go there, push vs. pull, and why the steering decision is made at DNS resolution. Per CURRICULUM §14's own row. |
| Type | Building Block (see §0). |
| Difficulty | intermediate - matches `manifest.ts`'s existing `difficulty: "intermediate"` and §14's Group D heading. |
| Estimated time | 25 minutes (Reader + Editor combined), per §14's own row and `manifest.ts`'s existing `estimatedMinutes: 25`. |
| Prerequisites | 3.14 Caching. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-14-caching` before this chapter was authored. |
| Unlocks | 3.16 Search Systems (this chapter's one forward tease and the immediate next chapter, per `manifest.ts` row order). |
| Building blocks introduced | `cdn` (fields `cacheTtlSeconds`, `cacheDynamicContent`). No new edge kind. |
| Stages trained | Part 3's default (stages 2-4) plus a construction stage - a Completion: one node placed on the path, two edges. |
| Interview relevance | High for media-heavy and global systems, per §14's own note - steps 4 (high-level design) and 7 (trade-offs). |
| Production relevance | Any product with users on more than one continent, or whose bytes are mostly static assets. Wikipedia's anonymous-vs-signed-in cache split is the in-lesson example. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's range is 3-7). All five categories present; Practical is
not exempted, since this is a Building Block chapter with a real build.

1. **Knowledge** - Explain what an edge node holds, what happens on a hit and on
   a miss, and which requests the origin still sees once a CDN is in front.
2. **Engineering** - Decide whether a given response belongs at the edge, by
   testing it against two properties (identical for many users; tolerates being
   up to its TTL out of date).
3. **Knowledge** - Contrast pull and push provisioning and name what each costs.
4. **Practical** - Place a CDN on the request path in front of the origin so
   repeat requests for shared bytes are answered near the user, and pass Submit.
5. **Interview** - Answer "why is a CDN steered by DNS rather than by anything
   downstream?" by naming resolution as the earliest point a user can be
   pointed anywhere.
6. **Communication** - Defend fingerprinted filenames plus a long TTL over a
   short TTL, naming what each choice costs.

Each objective is exercised: 1 by the walkthrough + quiz Q2; 2 by "What belongs
at the edge" + quiz Q3; 3 by the walkthrough's pull/push variants + quiz Q2;
4 by the build itself; 5 by "Connections" + quiz Q4; 6 by "Trade-offs" + quiz
Q5.

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Pays off 3.14's own "Next" ("that cache is 5 ms from your app server and 150 ms from a user in Sydney"). Felt pressure: 40 ms in Virginia, most of a second in Sydney, same servers, same hit ratio, no box above 30% CPU. The numbers are the argument - a 200 ms crossing plus two handshake round trips before the first byte. |
| 3 Think first | "Think first" callout | Prediction prompt: every lever so far does work faster or less often; which of them removes the other 560 ms? Never graded. Paid off immediately in "The same bet, about place" and again in "Connections". |
| 4-5 Mental model + visual explanation | "The same bet, about place" | One-sentence anchor before the diagram: 3.14 bet about time, this bets about place. Primary diagram is the `<Walkthrough>` (§7.1's own row: "Caching layers \| Hit/miss branching \| 3.14, 3.15") - see §5 below. |
| 6-7 Core mechanics / deeper dive | "The two things the edge decides", "What belongs at the edge" | The two config fields and the different questions they answer (3.14's own two-knobs shape, deliberately rhymed), then the cacheability rule as two required properties with a five-row worked table, then pull vs. push in one paragraph since the walkthrough carries the mechanics. |
| 8 Trade-offs | "Trade-offs" | Four-row table, costs named both ways: TTL length in both directions, fingerprinting vs. short TTLs, and caching HTML for signed-out visitors (which buys the most and carries the chapter's worst failure). |
| 9 Failure modes | "What breaks" | Mandatory for Building Block (§0). Four: the per-user response served to the wrong person (named as the only one with consequences past latency), the file you can't take back, the origin herd after a global purge (3.14's stampede at a wider radius), and the CDN as a dependency you don't operate. |
| 10 Scaling behavior | "What changes at scale" | Mandatory for Building Block (§0). 10x absorbed, tune cacheability not capacity; 100x the long tail leaves objects cold per-location so origin fetches scale with catalog rather than users, motivating a shield tier; 1000x the cost centre is bytes and the move is appliances inside ISP networks. |
| 11 Production examples | "In production" | Wikipedia - unused by any prior chapter (AWS 3.1, Netflix 3.2/3.8, Google 3.3, Cloudflare 3.4, Uber 3.5, Stripe 3.6, Shopify 3.7, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12, Instagram 3.13, Reddit 3.14), and on-topic per §13's decision-not-company rule: the anonymous/signed-in cache split is this chapter's own rule in operational form. |
| 12 Common mistakes | "Common mistakes" | Four: caching everything including dynamic; TTL as the publishing mechanism; believing a purge reaches browsers; judging the CDN by hit ratio while the worst region is still slow. |
| 13 Interview lens | "In an interview" | High relevance for media/global, steps 4 and 7 named. Mandatory §10.3 senior-answer line, built only from this chapter's own vocabulary (DNS-steered, fingerprinted filenames, short-TTL signed-out pages, per-user off the edge). |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 3.14 (same bet, axis rotated - work vs. distance), 3.2 (the DNS-steering foreshadow, closed), 3.3 (a reverse proxy in a few hundred places, run by someone else) - past §19's >=2. Forward: 3.16 only, stated twice (end of "Connections", then "Next"). |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors (§5.3 allows 3-5). QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | Mandatory (real Editor exercise). States the starter graph (3.14's system, complete and correct), the symptom (unchanging bytes crossing the full distance every request), and - unusually - that Validate will report nothing, because there is no violation to find. Names the shape of the answer ("the only decision capable of sending a user somewhere closer is made at the very front of the path") without naming the component. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **CURRICULUM §14's 3.15 row promises "completion + trade-off (which of five
  asset types belong on the CDN)". The completion is the graded build; the
  trade-off half is quiz Q3, a five-option multi-select, not a canvas
  exercise.** §11.1's Trade-off scenario type wants "2+ presented graphs/configs,
  pick per scenario" - but the choice this row actually names is per *response
  type*, and a response type has no expression on this canvas: there is no
  asset, route, or content-type object in the registry to present two graphs of.
  A five-option multi-select is the honest form of exactly the choice §14
  describes, and it is the form QUIZ_FRAMEWORK §11's own bank Q5 already uses.
  **Not raised as an open decision** - unlike decisions 17 and 19, nothing here
  is a missing engine capability; the canvas models components, and this
  trade-off is not about a component.
- **The `cacheTtlSeconds` / `cacheDynamicContent` config beat is taught and
  quizzed, not gated by the blueprint.** Same reasoning 3.14 recorded for
  `ttlSeconds` and the same underlying gap (open decision 11): a failed config
  predicate leaves the pattern node bound to nothing, so `blueprint-drift.ts`
  reports `missingComponents: ["CDN"]` - "Missing: CDN" with a CDN plainly on
  the canvas. Both fields also default to the correct values for this exercise
  (3600 seconds, dynamic caching off), so gating them would only ever fire for
  a learner who deliberately changed them, and would then mislead. Recorded as
  a further instance under decision 11, not as a new decision.
- **No `forbid` pattern on the blueprint, and the direct `dns -> fw` edge is
  therefore not required to be removed.** See §8 - this is a real finding about
  `blueprint-drift.ts` and is recorded in the ledger under decision 11.
- **Push provisioning is taught but not buildable.** The `cdn` component has no
  push/pull field, so the canvas build is pull-shaped by default. Taught in the
  walkthrough's variant selector and the lesson's own paragraph, recorded in
  `simplifications`. No engine change proposed: a provisioning-model field would
  be a registry change in service of one chapter's prose, which is the shape
  §20.5's never-fork rule exists to discourage.
- **No §12 nugget devices.** Open decision 5 remains unresolved; this is the
  thirteenth chapter to omit and declare rather than make the call unilaterally.
- **No mini challenge (§12, optional device).** No prior chapter has authored
  one.
- **Only one production example** (Wikipedia), matching every prior chapter's
  precedent rather than §13's allowed 1-3.
- **Anycast steering is named in one clause, not taught.** Many real CDNs steer
  with anycast rather than DNS. §14's row explicitly frames this chapter as
  closing 3.2's DNS-steering foreshadow, so DNS is the taught mechanism and
  anycast is disclosed rather than developed. Recorded in `simplifications`;
  quiz Q4's option B leans on the same honesty (its explanation says anycast
  exists, which is why "DNS is the only global protocol" is false).
- **Object storage is not introduced.** The bytes a CDN fronts live in object
  storage in a real system, and that component's home chapter is 3.20. This
  chapter's CDN sits in front of the same origin the browser was already
  reaching, which is legal on canvas and true of plenty of real deployments.
  Recorded in `notYetIntroducedConcepts`.

## 5. Diagrams (§7)

**One diagram, and it is a `<Walkthrough>`** (`src/chapters/walkthrough/`), not
a Mermaid static - the first Part 3 chapter since 3.4 to make that choice. §7.2's
own rule routes here: "if the same nodes/edges benefit from stepping through (a
request tracing a path, an algorithm choosing between instances), author it as a
`<Walkthrough>`". This chapter's topology has a sequence in it that a static
picture cannot carry - the same file is a miss on its first request in a region
and a hit on every one after, and the origin's involvement disappears between
step 3 and step 4.

- **Nodes:** Browser (Sydney), DNS, two `cdn` nodes labeled Edge node (Sydney)
  and Edge node (Frankfurt), and an `app-server` labeled Origin (Virginia). Two
  edge nodes rather than one is deliberate: the per-location nature of a CDN
  cache (each location misses once for itself) is the single most common
  misreading, and one box cannot show it.
- **Edges:** `request-flow` throughout; no `control` or `replication` edge is
  involved, so none of 3.4's `control`-edge gap applies here.
- **Variants:** `pull` and `push`, using the walkthrough's own algorithm
  selector. This is where §14's "push vs. pull" requirement is realized: steps
  3, 4 and 5 branch, and the cost of push (every location stores every object)
  lands as a caption on the step where it shows.
- **Caption:** the "Note:" line beneath names what to notice - the origin is
  reached once per file per location, and only under pull.
- **No second diagram.** §7.2 forbids drawing a topology twice, and the
  exercise's own canvas draws the placement version of the same idea. Two
  tables (cacheability, trade-offs) carry the comparative content that would
  otherwise want a diagram, per §20.6's scan-value rule.
- **No graph-JSON topology diagram**, for the same reason every chapter since
  3.4 has recorded: there is no MDX-embeddable renderer for an
  `ArchitectureGraph` in lesson prose (open decision 3). The `<Walkthrough>` is
  the closest thing to it that exists and renders in the product's own visual
  language, which makes this chapter a partial answer to that decision rather
  than another instance of the workaround.

**One engineering nit found while authoring, flagged not fixed:**
`WalkthroughAlgorithmSelect.tsx` hardcodes `aria-label="Routing algorithm"`. For
this chapter the selector chooses a provisioning model, not a routing algorithm,
so a screen-reader user hears the wrong noun. Sighted users are unaffected (the
diagram's own `description` prop names the choice). Making the label a prop is a
one-line engineering change, out of scope for a content pass.

## 6. Component budget (§16) and cross-reference checks

§16's audit row: "3.15 | `cdn`." Checked directly against
`src/content/components/config/networking.ts`: **`cdn` already exists, fully
wired, with no engine gap.** It declares `cacheTtlSeconds` (0-604800, default
3600) and `cacheDynamicContent` (boolean, default false), with
`relations.inputs` restricted to category `networking` + kind `request-flow` and
`relations.outputs` to `networking` or `compute` + `request-flow`. That makes
`dns -> cdn -> firewall` legal and `app-server -> cdn` illegal, which is the
correct shape for this chapter: a CDN is upstream of the origin, never behind
it. Fourth consecutive chapter needing nothing new from the engine.

**Palette split.** `availableComponentIds` is 3.14's twelve plus `cdn`
(thirteen). `requiredComponentIds` is those minus `distributed-cache` (twelve) -
`distributed-cache` stays available-but-not-required for the reason 3.14's own
spec recorded. Consequence for `authoring-invariants.test.ts`'s brief-spoiler
gate: both "CDN" and "Distributed Cache" are components absent from the starter
graph, so neither string may appear in `exerciseGoal`, `successCriteria`, or any
`starterDecorators` label or comment. Neither does; the brief is phrased entirely
around distance and unchanging bytes, and the gap zone is labeled "Build here".

**Open decision 15's Group D row - second of Group D's three chapters checked,
2026-08-26 - matches.** 2.3's own row for Group D: "reads the database should
not be answering | 3.14-3.16." 3.14 removed the repeat read from the database;
this chapter removes the request from the *network* before it can become a read
at all, which is the same row taken one hop further out. Groups E-G and 3.16
remain open.

**3.2's forward promise checked and paid off.** 3.2's lesson names 3.15 twice:
"why 3.15's CDN, several chapters out, is steered by DNS rather than by anything
downstream of it", and its own recap's last line, "at scale, changing what a name
resolves to IS how you route traffic - the mechanism 3.15's CDN builds on."
§14's row calls this "closes 3.2's DNS-steering foreshadow." Paid off three
ways: in the walkthrough's own first two steps (the steering is the diagram's
opening beat, not a footnote), in "Connections" by name, and in the graded build
itself - the edge the learner draws from DNS to the CDN *is* the steering
decision. Unlike 3.14's own 3.7 promise, this one is paid off in the exercise as
well as in prose.

**No forward-vocabulary violations.** Every ScaleCraft-taught term used (cache,
hit ratio, TTL, staleness, stampede, replica, reverse proxy, resolution, record
TTL, load balancer) has a home chapter at or before 3.14. General engineering
vocabulary introduced just-in-time in a clause, per the writing register:
handshake round trips, fingerprinted filenames, `Cache-Control`, purge, anycast,
shield tier. Terms with a later home (object storage, inverted index, queues)
appear only as marked teases or in `notYetIntroducedConcepts`.

## 7. Validation rules (deliverable 4)

`["no-direct-client-database", "component-relations", "orphan-component",
"missing-input-connection", "orphan-read-replica"]` - 3.14's curated set,
unchanged. No new rule authored.

**This is the first authored starter graph that validates clean on purpose, and
that is the chapter's own pedagogical point.** Every prior Part 3 exercise
opened with a rule violation to read; here the system is genuinely correct and
the problem is geography, which no validation rule measures. The transition
brief says so outright ("Validate will say so, because nothing here is wired
wrong") rather than letting a learner conclude the Validate button is broken,
and hint 1 repeats it. Two consequences worth recording:

- **The graded feedback surface for this chapter is Submit's blueprint drift,
  not Validate.** A learner who submits unchanged gets `missingComponents:
  ["CDN"]`, which is accurate here (the component really is absent) rather than
  the misleading form open decision 11 tracks.
- **The rule set still earns its place during the build.** A CDN dropped on the
  canvas and left unwired fires `missing-input-connection` or
  `orphan-component`; a CDN wired backwards (`app-server -> cdn`) fires
  `component-relations` off the component's own declared inputs. The rules are
  the feedback for a wrong build, not for the starting one.

This is a distinct data point for decision 11, which has so far only asked
whether a namesake fault should be warning- or error-severity. A third answer
exists: a chapter whose exercise has no fault at all, only an absence.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint (`bb-3-15-blueprint`) - one right answer, one pattern (§11.1's
"multiple only when the chapter honestly has more than one"). It requires 3.14's
full solved chain plus a `cdn` node with `dns -> cdn` and `cdn -> fw`, both
`request-flow`.

`starterGraph` is 3.14's starter with 3.14's own answer applied (`app -> cache`
now drawn), reusing the same node positions exactly, with node ids re-prefixed
`bb-3-15-`. Twelve edges, eleven nodes, nothing broken.

**`dns -> fw` is deliberately absent from the blueprint's required edges.** The
cleanest build inserts the CDN into the path and deletes the now-redundant direct
edge; requiring `dns -> fw` would fail exactly that build. Keeping the old edge
also passes, because pattern matching is containment - and that is an honest
outcome rather than a loophole: an origin reachable directly by its own hostname
is real, and is why origin shielding and origin lockdown exist as practices.
The debrief `commentary` names what the origin still serves either way.

**Why not a `forbid` pattern to require the deletion.** `Blueprint.forbid`
exists and `chapter-outcome.ts` honors it, but `blueprint-drift.ts` is
completely forbid-blind: it computes `missingComponents`, `extraComponentIds`
and `mismatchedConnections` from `require` only. A learner who tripped a forbid
pattern would fail Submit and receive a drift report showing **nothing** missing
and **nothing** mismatched. That is a worse failure than the misleading
"Missing: X" open decision 11 already tracks, and no authored chapter uses
`forbid` today. Recorded in the ledger under decision 11 as a fourth shape of the
same drift gap; not worked around here, because the chapter does not actually
need the deletion.

**Starter-graph geometry**, against §11.5: unchanged from 3.14 - nodes span
x 60-700 and y 0-640, bounding box 840x705 (aspect 1.19, under the 2.5:1
ceiling). The CDN's intended slot is (380, 160), the unused middle column of the
second row: 320px from the reverse proxy horizontally (120px gap against the
200px card, exactly the authored minimum), 160px below DNS and above the load
balancer (95px gaps against the 65px card, also the minimum).

**Decorators** (§11.6): 3.14's five tier zones carried over, plus a magenta
**"Build here" gap zone** at (352, 112) covering that empty slot - warranted here
and deliberately absent on 3.14, because this fix is a genuinely missing node in
identifiable empty space rather than a rewire of something already present. Two
slate comments (§11.6 allows at most 2), both restating lesson-public facts and
neither naming a component: the 200 ms crossing plus handshake round trips, and
the byte mix of a product page. Zone/zone overlap checked by hand: the gap zone's
x-range (352-608) is disjoint from the reverse proxy's zone (32-288) in the same
row, and every other zone is in a different row band.

## 9. Hints (deliverable 3, part of it)

Three hints (§11.3's orienting-to-directional ramp, never the answer):

1. Validate has nothing to say, and that is honest - what's wrong is where the
   answer is, not what the answer is. Orienting, and it defuses the "is the
   button broken?" reading this chapter's clean starter uniquely risks.
2. The bytes are identical for every visitor and change only on deploy; keeping
   a copy of an unchanging answer is a move already known, and the question is
   which end of the path it goes at. Directional - restates the cacheability
   rule as a location question.
3. Look at the very front of the path: one thing there decides where a request
   goes before it goes anywhere, and it is the only decision that can differ for
   a user in Sydney. Most directional, and still stops short of "add a CDN and
   draw DNS to it."

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
3.10-3.14's ramp exactly.

QUIZ_FRAMEWORK.md §11's bank reserves two questions for this chapter (Q5 and Q6,
tagged "(3.15)"); both are spent here. Q7/Q8/Q9 (tagged 3.16) were left
untouched.

| This chapter | Source | Notes |
|---|---|---|
| Q1 (single, 1) | original | What the 560 ms actually is. Distractors are the three levers already taught (cache, instances, replica), each wrong for a different articulable reason - the replica one is the strongest and its explanation carries the real point: a copy near the user is useless if the code issuing the read is not. |
| Q2 (single, 1) | original | Pull mechanics and the first-request penalty. The push distractor (C) is stated as a plausible default rather than as a joke option, per §1 point 3. |
| Q3 (multi, 2) | bank Q5 | §14's own "which of five asset types belong on the CDN", authored as the five-option multi-select the row describes. Three correct, two not. Prompt says "select all that apply" per §2's rule for `multi`. |
| Q4 (single, 2) | bank Q6 | Why DNS-steered. Option C (the load balancer could do it but for health checks) is the discrimination the question exists for: by the time any downstream component decides anything, the crossing has already been paid. |
| Q5 (single, 3) | original | Fingerprinted filenames vs. short TTL vs. purge-on-deploy. The purge option's explanation says outright that it works and is the standard fallback - the question is "permanently rather than once", which is the §11.1 rule against secretly-worthless distractors applied to a quiz. |
| Q6 (single, 3) | original | The per-user response served to the wrong customer. Distractors are the two neighbouring chapters' failures (3.12 lag, 3.14 stampede) plus the TTL reflex, which is exactly the misconception the correct answer has to dislodge: a TTL bounds age, never identity. |

**Position-clustering check.** Correct options on the five single-choice
questions sit at d, b, a, c, b - all four positions used, no letter repeating in
consecutive questions. Checked by eye against neighbours (the CI test is
per-chapter, not registry-wide): 3.12 opens on "a", 3.13 on "b", 3.14 on "c", so
this chapter deliberately opens on "d". Q3 is `multi` and carries three correct
options at a, b, d.

**Scope check.** Every question draws only on this chapter's material and its
prerequisite chain. Q6's distractors name 3.12 and 3.14 by their own taught
vocabulary, which is backward reference. No question requires anything from 3.16
onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Add a component from the palette to the canvas | 1.2 onward, and every Completion chapter since (3.1-3.5 are the closest precedents, all of which added a node into empty space marked by a gap zone). |
| Draw a `request-flow` edge between two networking-tier components | 3.1-3.3 established the whole edge chain (`dns -> firewall -> reverse proxy`); this is the same shape at a new component. |
| Insert a component into the middle of an existing path rather than at its end | 3.3 and 3.5 both did exactly this (a reverse proxy, then a gateway, dropped into an established chain). This chapter is the third instance, so the move is familiar. |
| Decide the new component belongs upstream of the firewall rather than behind it | Taught fresh in this chapter's walkthrough and its "Connections" paragraph, both of which precede the exercise: a copy downstream of the firewall is still on the far side of the crossing. A learner who tries `app-server -> cdn` is stopped by `component-relations` and reads why. |
| Act on an exercise where Validate reports nothing | New to this chapter, and named as such in the transition brief and hint 1 rather than left to be discovered. Submit's drift report is the feedback surface, which 3.11 onward has already used alongside Validate. |
| Leave the cache, replica and write paths untouched while adding an edge tier | Building on 3.12's "two paths for two jobs" and 3.14's own result, stated in `successCriteria` as an observable outcome rather than an instruction. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The clean-validating starter graph is a deliberate first (§7).** A reviewer
  should confirm that "Validate has nothing to say" reads as a lesson rather
  than as a broken button, given that twelve prior chapters trained the opposite
  expectation. The brief and hint 1 both address it in prose; whether that is
  enough is a playtest question, not an authoring one.
- **`dns -> fw` is not required to be removed (§8).** A learner can pass with
  both the direct edge and the CDN path drawn. Defended above as honest, but a
  reviewer may prefer the stricter reading - in which case the fix is an engine
  change (teach `blueprint-drift.ts` about `forbid`), not a content change.
- **The trade-off half of §14's exercise line lives in the quiz (§4).** A
  reviewer should confirm a multi-select is an acceptable realization of "the
  trade-off exercise", or scope a canvas form for per-response-type choices,
  which does not exist today.
- **`WalkthroughAlgorithmSelect`'s hardcoded aria-label (§5)** - one-line
  engineering fix, flagged not taken.
- **Word count.** 1,721 words (prose only, excluding the walkthrough's prop
  literals) for a 25-minute estimate, against 3.14's 1,964 for 35 and 3.13's
  1,267 for 30. That is a higher words-per-minute rate than either, and it is a
  self-assessment that should be checked. The argument for it: two dense tables
  account for roughly 250 of those words and read at a glance, and the
  walkthrough consumes reader time that costs no words at all, so the 25 minutes
  is not all prose.
- **A density revision pass was performed as a distinct drafting round** (1,815
  words down to 1,685, cutting the cold open, the failure bullets, the interview
  answer and the Connections paragraph; the anycast disclosure was then added
  back, landing at 1,721). Second chapter to do so rather than flag the claim;
  it should still be checked rather than trusted.

**Verification.** No new tests written and no Playwright. The repo CI pipeline
was run after authoring, per CLAUDE.md's personal-preference note - typecheck,
lint, the full vitest suite and `next build` are all green.
`walkthrough-invariants.test.ts` in particular is what gates this chapter's
`<Walkthrough>`, and the walkthrough-diagram skill treats a green run of it as
part of the deliverable. One existing test needed a mechanical update:
`src/content/chapters/index.test.ts` asserts the exact list of registered
building-blocks chapter ids, and was already failing on `bb-3-14-caching` before
this chapter was authored (3.14's pass never ran it). `bb-3-14-caching` and
`bb-3-15-cdn` were both appended to that list - a registry fixture update, not a
new test.
