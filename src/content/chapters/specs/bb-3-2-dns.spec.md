# Chapter spec - 3.2 DNS

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-2-dns`)
- Lesson body: `public/content/chapters/bb-3-2-dns.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-2-dns`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Wave 3 (Part 2 + Group A Core Infrastructure), per
`pending-content.md`. Second Group A chapter, immediately after 3.1
Networking Fundamentals (same working tree, same session).

**Process note - self-caught cross-chapter bug, before user review.** The
first drafting pass wrote "How the answer gets found" and "The cost of an
out-of-date answer" as if TTL caching and "a DNS change is never instant"
were new content. They aren't: 2.1's own already-shipped "Before your code
runs" section states both facts explicitly, and closes with "Both phases
are compressed here... 3.2 opens up the first of them" - an explicit,
already-shipped promise that 3.2 would cover the resolver hierarchy 2.1
declined to. The first draft's §4 had also declared that same hierarchy an
omission, directly contradicting 2.1's own plant. Caught by rereading 2.1's
actual lesson body (not just its ledger entry) before finalizing this
chapter, not by the user or an Opus pass. Rewritten: "Finding an answer
nobody has cached" now teaches the root/TLD/authoritative walk 2.1 deferred;
the TTL section reframes from "TTL causes lag" (2.1's fact) to "what TTL to
choose is a decision" (this chapter's own content); the quiz's Q2 was
swapped from a second propagation-lag question to a hierarchy question for
the same reason. Recorded here because it's exactly the class of bug the
Opus audit pass exists to catch - this instance just didn't make it that
far.

## 0. Type classification and the row it's read against

CURRICULUM §14's own row for 3.2 states no explicit `Type:` field (unlike
3.1's row, which said "Concept with a small build"). Classified **Building
Block** here, same reasoning 3.1 and 1.2 used for the identical tension: the
row's own "New: `browser`, `dns`" line introduces two real registry
components, and the exercise is a genuine construction-family build
(completion), which is §4's Building Block definition exactly. This makes
Failure modes and Scaling considerations mandatory rather than optional
(§6) - both are genuinely present in this chapter's own content, not merged
away for padding.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Naming and resolution; DNS as the first routing decision and the first cache the learner meets. |
| Type | Building Block (see §0 above). |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + Editor combined), per CURRICULUM §14's own row. |
| Prerequisites | 3.1 Networking Fundamentals - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-1-networking-fundamentals` before this chapter was authored - no pulled-forward exception needed, same shape 3.1 itself reported for its own prerequisite. |
| Unlocks | 3.3 Reverse Proxy (this chapter's own immediate forward tease); every later chapter that assumes a resolvable, cacheable address exists before the request path starts. |
| Building blocks introduced | `browser`, `dns`. Matches §16's audit row for 3.2 exactly. |
| Stages trained | Part 3's default plus stage 2 (construction) - the fourth real build in the curriculum, after 1.2, 3.4, and 3.1. |
| Interview relevance | Medium, per §14's own note - loop step 4 (high-level design) and step 6 (bottlenecks and failure), the same two steps 3.1 named. |
| Production relevance | Every internet-facing system is reachable by name before it's reachable by address, and every migration or regional failover is bounded by whatever TTL was chosen in advance, not by the moment someone presses save. |

## 2. Learning objectives (§5.2)

Six objectives (§5.2's allowed range is 3-7); all five required categories
represented (Building Block, so Practical is not exempt).

1. **Knowledge** - State what a DNS resolver returns and why that lookup
   happens before, not during, the request.
2. **Knowledge** - Explain what a TTL controls and why a DNS change is a
   gradual cutover, not an instant one.
3. **Engineering** - Choose a TTL length for a stated scenario (a planned
   migration vs. stable production) and justify the trade-off both ways.
4. **Practical** - Add a Browser and a DNS node to a starter graph, wire the
   lookup before the request path, and pass Submit.
5. **Interview** - State, in under a minute, what a DNS failure looks like
   when every server is healthy, and why.
6. **Communication** - Explain why DNS counts as a routing decision at
   scale, not just a lookup, and name the real cost of over-shortening its
   TTL.

Each objective is exercised: 1 by "Turning a name into an address" + quiz
Q1; 2 by "Finding an answer nobody has cached" + "The cost of choosing a
TTL" + quiz Q2; 3 by "The cost of choosing a TTL" + quiz Q3; 4 by the build
itself; 5 by "In an interview" + quiz Q5; 6 by "At scale, resolution becomes
routing" + "Common mistakes".

## 3. Per-beat outline (§5.3, Building Block type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 short paragraphs | Directly continues 3.1's own "Next" tease ("how a client gets an address to send that first packet to in the first place"). The felt pressure: every prior chapter's arrows already know where they're going; a real one doesn't, until a migration makes the gap visible - stale traffic still arriving at an old machine minutes after the DNS record changed. |
| 3 Think first | "Think first" callout | Prediction prompt: does a resolver with no cached answer ask one server or several. Never graded. Deliberately not "is a DNS cutover instant" - 2.1 already answered that in prose, so a prediction prompt on it would ask the learner to guess something the prerequisite chain already told them. Pays off in "Finding an answer nobody has cached." |
| 4-5 Mental model + visual explanation | "Turning a name into an address" | One-sentence anchor built on 2.1's own established framing ("beside the request path, not on it") rather than a new analogy - referencing past chapters liberally is explicitly encouraged (§20.2). Primary diagram, Mermaid per §5 below, precedes the prose explaining it (§8.1). |
| 6 Core mechanics | "Finding an answer nobody has cached" | The resolver hierarchy walk (root -> TLD -> authoritative) 2.1 explicitly deferred ("3.2 opens up the first of them") - see the process note above. Kept to one level of depth (§20.2: "one level down, not three"): three named hops, no further detail on how any one server itself resolves a query. Ties the `dns` component's two config fields (`recordType`, `ttlSeconds`) directly to the mechanism just described. |
| 7 Internal mechanics | (folded into beat 6) | Not split into its own section at this chapter's density - same reasoning 3.1's spec §4 gave for folding its own TLS paragraph into core mechanics. |
| 8 Trade-offs | "The cost of choosing a TTL" | Reframed from 2.1's already-stated fact (a DNS change is bounded by TTL) to this chapter's own content: what TTL to set is a decision, not a fact to know. Genuine two-sided call: short TTL (fast cutover, constant lookup traffic) vs. long TTL (cheap lookups, slow cutover). Both costs named; the lesson states teams shorten deliberately before a planned change rather than running short permanently, which is honest guidance, not a false-balance dodge (§20.2 permits stating which side wins when the domain genuinely favors one). |
| 9 Failure modes | "When the answer itself is wrong" | **Mandatory for Building Block (§6).** Explicitly references 2.2's already-taught "DNS down = complete, immediate failure" (§9 lens 5: what breaks first) without re-teaching it, then adds the new content this chapter actually owns: a wrong-or-stale answer (misconfiguration, a typo, or a still-valid-TTL stale record) as a quieter failure with the same user-visible symptom but a different fix. |
| 10 Scaling | "At scale, resolution becomes routing" | **Mandatory for Building Block (§6).** Lens 7 explicitly, with real numbers: at 10x, lookup volume barely tracks growth because resolver caching absorbs it; at 100x/incident, DNS becomes an active routing tool. Names the real production payoff (regional steering) and the one marked further-out tease (3.15) - see §6 below on the two-tease divergence from 3.1's own single-tease shape. |
| 11 Production examples | "In production" | Netflix's DNS-based regional failover - a public, decision-level claim (moving users off a degraded AWS region by changing what a name resolves to), chosen because 2.1/3.1/3.4 already used Cloudflare and AWS respectively for other decisions; a fourth reach for either would read as convenience rather than fit. |
| 12 Common mistakes | "Common mistakes" | Four: assuming instant cutover; permanently minimal TTL; treating a DNS outage as external; conflating DNS caching with HTTP caching (a mistake only possible now that this chapter introduces both `dns.ttlSeconds` and `browser.honorsCacheControl` in the same session). |
| 13 Interview lens | "In an interview" | Medium relevance. Names loop steps 4 and 6 explicitly, same two steps 3.1 named. Mandatory §10.3 senior-answer line built only from this chapter's own and prior-chapter vocabulary (resolution, TTL, 2.2's failure-class language) - no forward reference. |
| 14 Connections + Preview of next | Backward references woven through prose (2.1, 2.2, 3.1) / "Next" (forward) | Backward: 2.1 (the "beside the path" mental-model anchor, referenced twice), 2.2 (DNS-down failure class), 3.1 (cold open continuation, the inherited firewall/app-server/database chain) - three explicit connections, exceeding §19's >=2, same count 3.1 itself hit. Forward: 3.3 Reverse Proxy in "Next" (immediate, matches manifest, no divergence to declare) plus 3.15 as a separately marked further-out tease in "At scale" - see §6 below. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | States the starter graph (firewall, app server, database from 3.1, already wired - nothing feeds the firewall), the success condition (Browser + DNS added, wired before the request path, clean Validate, then Submit), and what's withheld (which specific gap the validator names). |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **The root/TLD/authoritative walk is presented as a clean three-hop
  chain for one name, omitting redundant servers per level, negative
  caching, and multi-record answers.** §20.2's depth calibration is
  explicit that detail earns inclusion only if it changes a decision the
  learner makes at this stage - none of that extra machinery changes the
  TTL trade-off, the failure-mode reasoning, or anything the build exercise
  tests, so the simpler picture is the honest one. Recorded in
  `curriculumContext.simplifications`. (An earlier draft omitted the whole
  hierarchy instead - see the process note at the top of this spec for why
  that was wrong, not just less detailed.)
- **No everyday analogy beyond reusing 2.1's own "beside the path, not on
  it" framing.** Same minimal-analogy choice 1.2/3.1/3.4 made; introducing a
  second competing metaphor (phone books, address books) would violate
  §5.3 beat 4's "one model per chapter; competing metaphors confuse," since
  2.1 already planted a working one for this exact fact.
- **No second (failure-scenario) diagram.** "When resolution itself is the
  outage" states both failure shapes in prose - the total-outage shape is
  already diagrammed nowhere (it's an absence, not a topology), and the
  stale-answer shape is a timing property, not a topology either. Neither
  is really diagram-shaped, same reasoning 3.1's spec §4 gave for the
  identical omission.
- **No §12 nugget devices.** Open decision 5 remains unresolved as of
  3.1's own instance of it (2026-08-22); this chapter is the sixth to omit
  and declare rather than make the call unilaterally.
- **Only one production example**, matching 3.1/3.4's own precedent, not
  §13's allowed 1-3. Netflix's regional-failover use of DNS is a complete,
  decision-level example on its own; a second company for the same single
  decision (DNS as a routing lever) would restate, not add (§20.6).
- **The root/TLD hierarchy matches `public/content/components/dns.md`'s
  own "How does it work?" section in shape, simplified in detail.** That
  component doc's five-step walk and this chapter's three-named-hops
  version agree on the sequence (root, then TLD, then authoritative); the
  component doc additionally names the client resolver as a fourth,
  separate hop and describes caching as a resolver-optional feature, where
  this chapter treats caching as the default and folds the client-resolver
  step into "a resolver checks its own cache first." The two aren't
  required to match line-for-line - the component doc is a reference page,
  not lesson prose - but flagged here so a second reader can confirm the
  simplification reads as a deliberate choice, not an oversight.

## 5. Diagram (§7, open decision 3)

**Fifth instance of the same narrow exception 1.6, 3.4, 2.3 (implicitly) and
3.1 established.** The Reader still cannot render a ScaleCraft graph-JSON
topology inline (open decision 3 remains open). The primary diagram is
Mermaid, styled as the target topology (`browser -> dns -> firewall ->
app-server -> sql-database`), captioned narrowly for this diagram only, per
1.6/3.4/3.1's own captioning discipline.

**This diagram's caption carries more weight than 3.1's did**, because the
topology it shows is a simplification in a second sense - see §6 below on
the `control`-edge tension. The caption states plainly that DNS is drawn
inline for validation reasons and that the real exchange is separate, so
the diagram doesn't teach a false equivalence even though it draws one for
buildability.

## 6. Component budget (§16) and the control-edge tension

§16's audit row for 3.2 is `browser`, `dns`, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: `browser`, `dns`,
`firewall`, `app-server`, `sql-database` - `client` deliberately excluded
even though it remains available from 1.2 cumulatively, matching
1.6/3.4/3.1's "no optional piece" precedent: Browser is the specific entry
point this chapter's own narrative and exercise need, and every component
in the palette has a job in the one blueprint.

**A real registry/content tension, found authoring this chapter, in the
same class as open decision 8 (`control`-kind edges aren't buildable on
canvas).** 2.1 taught (and QUIZ_FRAMEWORK.md §7's own Q5 tests) that the
browser-to-DNS edge is a `control` edge, not `request-flow` - the lookup
happens "before and outside the request path." Checked directly against
`src/content/components/config/networking.ts`: both `browser.relations.
outputs.allowedKinds` and `dns.relations.inputs.allowedKinds` declare only
`["request-flow"]` - neither endpoint's registry contract accepts a
`control` edge today, and `component-relations.ts` is `severity: "error"`,
so a learner who tried to draw the semantically correct edge kind would
fail Validate for doing the textbook-correct thing.

**Not hacked around**, per open decision 8's own precedent: the buildable
blueprint and starter graph use `request-flow` for the browser-to-dns edge
(the only kind that actually validates), the lesson's diagram caption
states the simplification honestly rather than silently drawing an edge
kind that contradicts 2.1's own teaching without comment, and
`curriculumContext.simplifications` records it explicitly. This is a
second, independent instance of the same engine gap decision 8 named for
load-balancer health checks - flagged in `pending-chapters.md` as an
extension of that decision, not a new one, since the underlying fix
(letting more component pairs declare `control` as an allowed kind) is the
same piece of engineering work either way.

**Forward-tease divergence from 3.1's single-tease shape.** CURRICULUM
§14's own row for 3.2 names two forward connections in its Purpose/Prepares-
for fields: "first cache the learner meets (advance organizer for 3.14)"
and "Prepares for: 3.15 (CDNs are DNS-steered)." §19 permits "at most one
tease per chapter, always marked," but two earlier chapters (0.2 tracked
1.3, 0.3 tracked 1.11) already established the sanctioned pattern of one
immediate tease plus one separately marked further-out tease when a
chapter's own brief calls for it. 3.2 follows that same pattern: 3.3 stays
the single immediate "Next" tease (matches the manifest's actual next
chapter, no divergence), and 3.15 is named once, explicitly marked "several
chapters out," inside "At scale, resolution becomes routing." The 3.14
advance-organizer connection is realized implicitly instead - the TTL/
caching content itself does the scaffolding work without literally naming
"3.14" in prose, since a third named forward chapter in one chapter would
be excessive even under the two-tease pattern's own precedent.

## 7. Validation rules (deliverable 4)

No new rule authored - §14's row names none for 3.2, and no existing rule
teaches anything DNS-specific (verified directly against
`src/validation-engine/rules/index.ts` - there is no TTL- or DNS-aware
rule in the registry). Curated set:

- **`no-direct-client-database`**, **`component-relations`**,
  **`orphan-component`**, **`missing-input-connection`**,
  **`request-flow-cycle`** - the same structural set 3.1 curated, guarding
  the fixed state (a learner could plausibly wire the new Browser or DNS
  node past the firewall, or skip either entirely).
- **`permissive-firewall` deliberately excluded**, unlike 3.1's own set.
  The starter graph's inherited Firewall node is already configured
  `defaultPolicy: "allow-listed"` (a safe value, carried forward
  unchanged from 3.1's own precedent for the same field) - this chapter
  doesn't teach firewall configuration, so curating its namesake rule here
  would test content this chapter never covers.

`validationRuleIds`: `["no-direct-client-database", "component-relations",
"orphan-component", "missing-input-connection", "request-flow-cycle"]`.

## 8. Blueprint and starter graph (deliverable 3, part of it)

One blueprint, `bb-3-2-blueprint`: `browser -> dns -> firewall -> app-server
-> sql-database`, all edges `request-flow` (see §6 above for why `control`
isn't used, despite being the semantically truer kind). Single right
answer at this scale, matching 1.6/3.4/3.1's own "one target shape"
precedent.

**No config predicate on the DNS node.** Unlike 3.1's firewall (`allow-all`
is an unambiguous wrong value gated on Submit), a TTL choice is a genuine,
context-dependent trade-off with no universally wrong default - the same
reasoning 3.4's spec gave for leaving its own algorithm choice ungated
(open decision 11). `dns`'s own default config (`recordType: "A",
ttlSeconds: 300`) is left as the component's own default, untouched by the
blueprint.

Starter graph: firewall, app server, and database - 3.1's own blueprint,
minus its client node, still correctly wired to each other with
`request-flow` edges. The firewall has no incoming edge at all. Nothing
here is illegally connected; the fault is pure absence (no entry point
exists yet), which is what makes this a **Completion** exercise (§11.1)
rather than a Fix - matches CURRICULUM §14's own "Exercise: completion."
`entryPointIds: []` in the starter graph, since no entry-capable node is
present until the learner adds one (matches an existing empty-array
precedent elsewhere in `index.ts`, not a new pattern).

## 9. Hints (deliverable 3, part of it)

Three, orienting before directional, never the answer (§11.3):

1. *Orienting* - "Validate is telling you the firewall has nothing feeding
   into it yet. Something has to resolve an address and send the first
   request before the firewall ever sees traffic."
2. *Directional* - "Add a Browser node and a DNS node from the picker (`/`
   or right-click). Wire Browser to DNS first, then DNS to the Firewall."
3. *Directional* - "Both new edges carry real traffic through the chain -
   request-flow, the same kind you've used since 1.2."

None states which validation rule fires by name, and none states the
correct edge kind's semantic justification beyond what the lesson already
covers - matches 1.6/3.1's precedent.

## 10. Quiz (deliverable 5)

Five questions, ids permanent, ramp 1/1/2/2/3, matching every sibling
chapter's own default. Q1, Q2, Q3, Q5 are `single`-kind; Q4 is `ordering`,
realizing CURRICULUM §14's "trace (what happens when you type a URL)"
exercise as a DNS-resolution-specific trace rather than repeating 2.1's own
"URL to response, end to end" ordering question (2.1's Q1 already owns the
macro journey; this one goes one level into resolution itself, which is
new content).

Q3 is modeled on QUIZ_FRAMEWORK.md §8's own Q3 (the bank's published TTL-
propagation example, explicitly tagged "advance organizer for 3.14 (3.2)"
in the bank itself) - reworded with fresh distractors rather than
reproduced, matching every other chapter's practice of modeling on bank
content, not copying it. Q1, Q4, Q5 are original. Q2 tests the resolver
hierarchy directly (the same content the process note above describes this
chapter adding beyond 2.1) - an earlier draft of Q2 tested propagation lag
instead, which would have duplicated a fact 2.1 already states in prose;
replaced once the lesson itself was corrected.

**Position-clustering check.** Four single-kind questions (Q1/Q2/Q3/Q5);
correct options sit at c, a, d, b - all four positions used, zero repeats,
an improvement on 3.1's own b/c/a/d/b (one repeat) and every earlier
sibling's pattern of at least one repeated letter. Checked by eye per the
chapter-author skill's own instruction (the invariant test is per-chapter,
not registry-wide).

Scope check: every question draws on this chapter's own material plus 2.2
(DNS-outage failure class, referenced not re-taught in Q5) and 1.2/2.1
(three-tier baseline and request stops, referenced not re-taught). No
question requires anything from 3.3 onward.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Open the component picker and place a component | 0.1's tour, reused without a new tour in every build chapter since. |
| Connect two components and set an edge's kind | 0.1's tour - same gesture, no new UI. |
| Run Validate and read a structural explanation | 0.1's lesson and Fix exercise, reused by every build chapter since, most recently 3.1. |
| Recognize that a chain with a correctly-wired tail but no head is missing an entry point, not miswired | New in this chapter - the starter graph's own shape (firewall through database, already correct, nothing feeding in) is the first time a learner meets "the fault is absence, not a wrong wire" with more than one node missing at once. Built directly on 3.1's own single-node version of the same idea. |
| Reason about a new component's job in a topology it hasn't been in before | 1.2/3.1 - the three-tier-plus-firewall shape is the baseline this chapter extends. |
| Reason about a new failure mode a new component introduces | 2.2 already taught the DNS-down failure class explicitly; this chapter adds only the wrong-or-stale-answer variant, building on 2.2's own vocabulary rather than introducing failure reasoning from scratch. |
| Reason about what changes at 10x/100x for a naming/routing layer specifically | New in this chapter (§9 lens 7), building on 1.2/3.1's own 10x/100x reasoning for their respective components. |
| Distinguish a DNS resolver's caching from a browser's HTTP caching | New in this chapter, deliberately built as a "Common mistakes" contrast now that both components exist in the same session. |

No move is unsourced.

## 12. Items flagged for a second pass

- **The control-edge tension (§6).** The single most load-bearing judgment
  call in this chapter - a second reader should confirm the blueprint/
  starter graph choice (request-flow, not control) is the honest resolution
  given the current registry, not a silent content divergence from 2.1's
  own already-shipped teaching.
- **The two-tease divergence from 3.1 (§6).** A second reader should
  confirm the 3.15 further-out tease reads as marked and deliberate,
  matching 0.2/0.3's own precedent for the pattern, rather than as an
  unmarked second forward dependency.
- **No config predicate on the DNS blueprint node (§8).** A second reader
  should confirm this reads as the same class of honest omission 3.4's
  algorithm choice was (open decision 11), not an oversight, since 3.1 (the
  immediately preceding chapter) did gate its own config value.
- **The `public/content/components/dns.md` root/TLD detail vs. this
  chapter's simplified version (§4).** Flagged for a second reader to
  confirm the divergence reads as a deliberate depth-calibration choice.
- **Word count.** 1,159 words at final revision (`wc -w` on the raw
  `.mdx`, after the process-note rewrite added the resolver-hierarchy
  section). Proportionate to 3.1's 1,398 words for 25 minutes, scaled down
  for this chapter's 20 (expected ~1,118 by the same ratio - the actual
  count runs slightly over, consistent with §20.6's "concrete over abstract
  even at slightly greater length": the added hierarchy section replaces an
  assertion 2.1 already made with a worked mechanism, not padding).
- **No density revision pass performed as a distinct drafting round beyond
  the process-note rewrite above** - the rewrite was itself a correctness
  fix, not a density pass. Flagged per every prior chapter's own precedent
  of flagging a self-assessed density claim for the next reviewer to check
  rather than trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit
pass yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
