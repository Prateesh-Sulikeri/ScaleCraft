# Chapter spec - 3.13 Sharding

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts` (`bb-3-13-sharding`)
- Lesson body: `public/content/chapters/bb-3-13-sharding.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug `3-13-sharding`
  (`chapterDefinitionId` flipped from `null` to the id above)

**Wave.** Fourth and final Group C chapter, authored immediately after 3.12 in
this same working tree. Same out-of-wave-plan note every Wave 3/4 chapter's
own spec has carried forward: the real prerequisite (3.12) is already
authored, so no sequencing rule (§18.2) is violated - only
`pending-content.md`'s wave grouping is out of order relative to actual
authoring order.

## 0. Type classification and the missing "config" exercise

CURRICULUM §14's own row states it explicitly, unlike 3.10's own row (which
omitted the label): "Type: Concept, config-weighted (sharding is a
configuration of a database, not a new box - the component philosophy in
action)." §16's own audit confirms it: 3.13 appears in "Concept chapters with
no component (... 3.13 ...)." No ambiguity to resolve here, unlike 3.10.

**The harder finding, a second confirmed instance of 3.10's own class of
gap.** CURRICULUM's own row promises "Exercise: config (shard-key choice ×2
workloads; hot-partition explanations) + trade-off (range vs. hash)," and
§11.1's own "Config" exercise-type table explicitly lists 3.13 in its "Where
used" column (`3.4, 3.13, 3.14, 3.17, 3.24`) - unlike 3.10, where §11.1 didn't
even list the chapter, here CURRICULUM's own two sections agree with each
other on the promise. Checked directly against
`src/content/components/config/data.ts`: `sql-database`'s only field is
`engine` (postgres/mysql); `nosql-database`'s only field is `model`. Neither
has a shard-key field, or anything resembling one. Checked every file in
`src/validation-engine/rules/`: none inspects a shard key, detects a hot
partition, or simulates cross-shard query cost. `search-engine`'s own
`shards` field (a plain number, for search-index parallelism) was checked and
ruled out as a legitimate substitute - it's a different mechanism solving a
different problem (index sharding for a search engine, not primary-key
partitioning of a transactional store), and repurposing it here would
misteach the concept the same way 3.10's own spec ruled out repurposing
`engine`.

**Not hacked around.** Same resolution 3.10's own spec established for an
identical class of gap: this chapter is authored with **no Editor exercise at
all** (`hasEditorExercise: false`), matching §16's own Concept classification
and §11.1's design rule that construction-family exercises are only required
"except justified Concept chapters." Shard-key choice, hot-partition
diagnosis, and the range-vs-hash trade-off are taught through diagrams and
prose, and realized as a six-question, quiz-weighted assessment instead -
QUIZ_FRAMEWORK.md's own bank happens to already carry four questions tagged
"(3.13)" that map onto exactly these three exercise elements (Q8 hot
partition, Q9 range-sharding pathology, Q10 when sharding is wrong, Q11
cross-shard cost), which this pass adapts rather than invents from scratch.
Recorded as a new open decision below, same discipline as decisions 8, 14,
and 17.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Partitioning as the end of the vertical road: shard keys, hot partitions, cross-shard pain, when NOT to shard, per CURRICULUM's own row. |
| Type | Concept, config-weighted, per CURRICULUM §14's own explicit label and §16's own audit (see §0 above). |
| Difficulty | intermediate - fourth Group C chapter, `manifest.ts`'s existing `difficulty: "intermediate"` matches CURRICULUM §14's Group C heading. |
| Estimated time | 30 minutes (Reader + quiz combined, no Editor time since there's no exercise), per CURRICULUM §14's own row and `manifest.ts`'s existing `estimatedMinutes: 30`. |
| Prerequisites | 3.12 Replication - the real curriculum-order prerequisite, already shipped in this same working tree. `manifest.ts`'s `prerequisiteSlugs` already pointed at `3-12-replication` before this chapter was authored - no pulled-forward exception needed. |
| Unlocks | 3.14 Caching (this chapter's own forward tease and the immediate next chapter, per `manifest.ts` row order; also the first chapter of Group D). |
| Building blocks introduced | None. Matches §16's own note that 3.13 is an intentional no-component Concept chapter, and CURRICULUM's own row for 3.13 ("New: none"). |
| Stages trained | Part 3's default (stages 2-4), realized here as reasoning/diagnosis rather than construction (no Editor exercise - see §0). |
| Interview relevance | High, per §14's own note - "senior-level differentiator." |
| Production relevance | Any product whose write volume has genuinely outgrown one machine - Instagram's ID-encoded shard scheme is the in-lesson example. |

## 2. Learning objectives (§5.2)

Five objectives (§5.2's allowed range is 3-7). Practical omitted per §5.2's
own carve-out for pure Concept chapters ("Every category below must be
represented at least once per chapter *except* Practical in pure Concept
chapters") - matching 2.3's and 3.10's own precedent for a no-build chapter.

1. **Knowledge** - Explain what a shard key does and why the same key must
   always resolve to the same shard.
2. **Knowledge** - Compare range and hash sharding: which access pattern
   each keeps cheap, and which it breaks.
3. **Engineering** - Diagnose a hot partition from a shard key that
   concentrates real-world load unevenly.
4. **Engineering** - Decide when sharding is and isn't the right next move,
   naming which cheaper levers must be exhausted first.
5. **Interview** - Name what a cross-shard (scatter-gather) query costs, and
   why it grows with shard count.

Each objective is exercised: 1 by "Splitting the data, not copying it" +
quiz Q1; 2 by "Range vs. hash - the shard key decision" + quiz Q4/Q5; 3 by
the hot-partition paragraph + quiz Q3; 4 by "When sharding is the wrong move"
+ quiz Q2; 5 by "What a query that touches every shard costs" + "In an
interview" + quiz Q6.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | Directly continues 3.12's own "Next" ("3.12 gave every copy of the primary a job... 3.13 Sharding is what happens once that stops being enough - once even the primary's own writes have outgrown one machine, and the data itself has to split, not just copy"). Felt failure: replicas fix reads completely and writes not at all; indexing and bigger hardware both have a ceiling. |
| 3 Think first | "Think first" callout | Prediction prompt: if replicas don't touch write throughput and a bigger machine eventually runs out of room, what's actually left? Never graded. |
| 4-5 Mental model + visual explanation | "Splitting the data, not copying it" | Anchor stated before the diagram; primary diagram is a Mermaid flowchart (app-server routing by shard key to three shard nodes) - a real topology shape (fan-out to independent slices), captioned to contrast directly against 3.12's own replication diagram (copies vs. slices). |
| 6 Core mechanics | Folded into "Splitting the data, not copying it" | Shard key definition and the same-key-same-shard invariant stated directly under the diagram - short enough not to need its own section, same merge-adjacent-short-sections justification 3.9's and 3.10's own specs used. |
| 7-8 Internal mechanics / Trade-offs | "Range vs. hash - the shard key decision" | The chapter's required trade-off (CURRICULUM's own row: "trade-off (range vs. hash)"), realized as a table plus a hot-partition paragraph immediately after - both failure directions a shard key can take, together. |
| 9 Failure modes (o) | Folded into "Range vs. hash" (hot-partition paragraph) and "When sharding is the wrong move" | Optional for Concept type (§6) but substantively covered - CURRICULUM's own row names hot partitions and cross-shard pain explicitly, so this pass keeps them as real content rather than omitting them for being technically optional. |
| 10 Scaling (o) | Folded into "When sharding is the wrong move" | States the ladder (index -> replica -> cache -> shard) as the chapter's own scaling answer, rather than a separate section restating it. |
| 11 Production examples | "In production" | Instagram - unused by any prior chapter (Stripe 3.6, Shopify 3.7, Netflix 3.8, Airbnb 3.9, Stack Overflow 3.10, Discord 3.11, GitHub 3.12), and on-topic: a shard-encoding ID scheme chosen specifically to keep the common lookup path confined to one shard. |
| 12 Common mistakes | "Common mistakes" | Four: sharding before cheaper levers are exhausted; a shard key mismatched to the access pattern; assuming resharding is a config change; assuming range sharding is always wrong. |
| 13 Interview lens | "In an interview" | High relevance, named explicitly as a senior-level differentiator. Mandatory §10.3 senior-answer line built only from this chapter's own vocabulary. |
| 14 Connections + Preview of next | "Connections" / "Next" (forward) | Backward: 3.10 (the ladder this chapter completes), 3.12 (replicas fix reads, not writes - the gap this chapter closes), 3.11 (applies identically to either store family) - past §19's >=2. Forward: 3.14 only, as the one marked tease (in "Next"), also the first chapter of Group D. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors. QuizLauncher renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No Editor CTA (§5.3 beat 16's own carve-out - this chapter has no Editor exercise). States plainly, in the same register 2.3 and 3.10 used, that sharding is a configuration decision the engine doesn't yet expose on canvas, and states what the knowledge check actually measures. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No Editor exercise at all** (`hasEditorExercise: false`). Full reasoning
  in §0 above - CURRICULUM's own row names a Config exercise
  ("shard-key choice... hot-partition explanations") and §11.1 explicitly
  lists this chapter as a Config-exercise chapter, but no component in the
  registry has a shard-key field and no rule inspects one. Justified per
  §11.1's own Concept-chapter carve-out, same class of finding as open
  decision 17, recorded as a new open decision below.
- **Failure modes and Scaling are optional for Concept type (§6) but not
  thinned or omitted** - hot partitions, cross-shard pain, and the
  cheaper-levers-first ladder are all real content here, because CURRICULUM's
  own row names them explicitly as this chapter's actual subject, not
  incidental detail a Concept chapter could skip.
- **No separate Trade-offs section beyond "Range vs. hash."** The hot-partition
  failure mode is folded directly under that table rather than given its own
  heading - both are two ways the same decision (the shard key) can go wrong,
  and treating them as one unit avoids restating the same key-choice
  reasoning twice, which §20.6 forbids.
- **No everyday analogy beyond the diagram itself.** Same minimal-analogy
  choice every prior Group A/B/C chapter made; a second competing metaphor
  would violate §5.3 beat 4's "one model per chapter."
- **No §12 nugget devices.** Open decision 5 remains unresolved; per its own
  note, individual chapters should stop declaring this one by one - this
  entry doesn't add another per-chapter ordinal to the count.
- **Only one production example**, matching every prior chapter's own
  precedent, not §13's allowed 1-3 - the Instagram story is complete on its
  own.
- **Resharding mechanics are named, not walked through** (one sentence: "a
  real migration, not a config edit"). Matches §20.2's depth-deferral pattern
  every prior chapter has used for out-of-scope operational depth; no
  `readingLinks` entry exists to link out to (no textbook URL supplied to
  this project).
- **Coordinator-managed shard placement is named, not taught** - one line in
  `curriculumContext.notYetIntroducedConcepts`, homed in 3.22 (not yet
  taught). This chapter treats the shard key as a fixed, chosen mapping, not
  a dynamically rebalanced system.

## 5. Diagram (§7)

One Mermaid diagram - same narrow exception to §7.2's stated canvas
preference every prior chapter has used, for the same checked reason: no
MDX-embeddable component exists today for rendering `ArchitectureGraph` JSON
as a static diagram inside lesson prose (confirmed again directly, not
assumed, per 3.12's own spec §5 finding).

**Primary (beat 5): shard routing topology.** Application Server routing by
shard key to three shard nodes (each an ordinary database, not a new
component). Captioned to draw a direct contrast with 3.12's own replication
diagram: that one drew copies of the same data; this one draws slices of
different data - the two mechanisms this curriculum could otherwise blur
together, deliberately distinguished in the caption itself.

**No second diagram.** The range-vs-hash trade-off is better served by the
comparison table in "Range vs. hash - the shard key decision" than a second
diagram - higher scan value for a two-row comparison (§20.6), and CURRICULUM's
own diagram inventory names "Sharding / partition layout | Key -> partition
mapping | 3.13" as the one diagram type this chapter needs, not a second.

**No `<Walkthrough>` considered necessary.** The shard-routing diagram is a
static mapping (which key goes to which shard), not an ordering between
requests over time - same reasoning every prior chapter's spec has given for
skipping it. Quiz Q4 (diagram kind) realizes the one genuinely time-sensitive
element (watching write traffic concentrate on the newest shard as ids climb)
as a predict-then-check question instead, the same no-simulator workaround
3.9's, 3.10's, and 3.12's own specs already established.

## 6. Component budget (§16) and cross-reference checks

§16's audit row for 3.13 is absent (same note as 3.6-3.10: intentional
no-component Concept chapters). No new component, no new edge kind.
`availableComponentIds`/`requiredComponentIds`: the full chain through 3.12 -
`browser`, `dns`, `firewall`, `reverse-proxy`, `api-gateway`, `load-balancer`,
`app-server`, `sql-database`, `nosql-database`, `read-replica` - all
required, unchanged from 3.12's own set, consistent with Part 3's
running-example philosophy even with no Editor exercise to place them in (the
diagram and `CurriculumContext.masteredConcepts` still reference the full
chain).

**Open decision 15's Group C row - fourth and final row checked, 2026-08-23 -
matches, and closes out the group.** 2.3's own row for Group C: "Every
instance reaches one database, and it is now the ceiling | 3.10-3.13." 3.10
examined the ceiling, 3.11 asked whether the store's shape fit it, 3.12
relieved it for reads, and this chapter is the last lever for writes - the
final rung of the same ladder 2.3's own row named. All four of Group C's own
rows are now checked; Groups D-G remain open as their own chapters are
authored.

**New open decision raised - the same class of gap as decision 17, now
confirmed a second time.** Unlike decision 17 (where §11.1 didn't even list
3.10 as a Config-exercise chapter, so the gap was self-consistent within
§11.1 alone), here CURRICULUM's own §14 row AND §11.1's own "Config" table
agree with each other that 3.13 should have a config exercise - and the
engine still has no schema for it. This is a stronger, more clearly
unintentional gap than decision 17's own. See the new numbered entry in the
"Open decisions" section below.

## 7. Validation rules (deliverable 4)

None - no Editor exercise exists for this chapter (§0), so no rule can fire on
anything. `validationRuleIds: []`, matching 2.3's and 3.10's own precedent
for a Concept chapter with no build.

## 8. Blueprint and starter graph (deliverable 3, part of it)

None - `blueprints: []`, no `starterGraph` key, matching 2.3's and 3.10's own
precedent exactly. `hasEditorExercise: false` suppresses the exercise row in
`YourTurnCard` and lets `curriculum/progress.ts`'s `deriveStatus` gate
completion on the quiz alone.

## 9. Hints (deliverable 3, part of it)

Three general reasoning hints (not Editor hints, since there's no exercise to
hint at) - same repurposing 2.3's and 3.10's own hints already established
for a no-build Concept chapter, aimed here at the chapter's three hardest
quiz moves (hot-partition diagnosis; the exhaust-cheaper-levers-first
judgment; cross-shard query cost) rather than a directional ramp toward a
Submit fix:

1. Sharding splits the data itself across machines by a key - ask what
   happens when that key sends most of the real-world traffic to just one of
   them.
2. Before reaching for sharding, check whether replicas, caching, and
   indexing are actually exhausted - it's the most expensive lever in the
   data tier, not the first one to reach for.
3. A query that touches every shard doesn't get faster because the data was
   sharded - it gets a fan-out, a wait for the slowest shard, and a merge.
   Ask what that costs before assuming sharding solved the problem outright.

None states a quiz answer directly, matching every prior chapter's own hint
discipline (§11.3) even though these aren't gating a Submit exercise.

## 10. Quiz (deliverable 5)

Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching 3.10's,
3.11's, and 3.12's own ramp exactly - one question heavier than the default
5, read as the same "config-weighted"/"quiz-weighted" license 3.10's own row
established for a no-build chapter.

Q2 adapts QUIZ_FRAMEWORK.md §10's own bank Q10 (tagged "(3.13)": when
sharding is the wrong move), Q3 adapts bank Q8 (tagged "(3.13)": hot
partition from a skewed shard key), Q5 adapts bank Q9 (tagged "(3.13)":
range-sharding's own moving hot spot), Q6 adapts bank Q11 (tagged "(3.13)":
cross-shard scatter-gather cost) - all four reworded with fresh option labels
rather than reproduced verbatim, and all four of this chapter's own reserved
bank questions now spent. Q1 is original, exercising objective 1 by
contrasting sharding against indexing (3.10), replication (3.12), and caching
(3.14, named not taught) directly. Q4 (`diagram` kind) is original, realizing
the time-sensitive half of range-sharding's own pathology (new writes
concentrating on the newest shard as ids climb) as a predict-then-check
question, the same no-simulator workaround 3.9's, 3.10's, and 3.12's own Q4
each established.

Bank Q1-Q7 (tagged "(3.10)", "(3.11)", "(3.12)") were already spent by their
own chapters.

**Position-clustering check.** Correct options sit at b, c, a, d, b, c across
all six questions - all four positions used, "b" and "c" the only repeats,
and no letter repeats in consecutive questions. Checked against 3.12's own
sequence (a, c, d, b, c, a) to avoid opening on the same letter as the
immediately preceding chapter - 3.12 opened "a," this chapter opens "b."

Scope check: every question draws on this chapter's own material plus 3.14
(Q1's option D and the "When sharding is the wrong move" section's own
"cheaper levers" ladder - named, not taught) and 3.22 (`notYetIntroducedConcepts`
only, not referenced in any quiz option). No question requires anything from
3.14 onward as its own correct-answer reasoning.

## 11. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"* - reframed
for a no-build chapter as: which prior chapter taught each move the QUIZ
requires.

| Move | Taught by |
|---|---|
| Distinguish "splitting data" from "copying data" | Building directly on 3.12's own replication topology diagram, deliberately contrasted against this chapter's own diagram in the same beat. |
| Reason from a shard key's own real-world distribution to a hot-partition diagnosis | Building on 1.3's own trade-off reflex (name the cost, not just the benefit) and 3.11's own decision-procedure habit (data shape and access pattern decide, not a label), applied here to a key's own distribution instead of a store family. |
| Apply the "cheapest lever first" ladder (index, then replica, then cache, then shard) | Building directly on 3.10's own recap line ("index before replica, replica before shard") and 3.12's own "What changes at scale" section, both of which already named this exact ordering - this chapter is where the ladder's last rung finally gets examined. |
| Reason about a query's cost without a simulator, from a stated scenario | Building on 1.1's own back-of-envelope habit and 3.9's/3.10's/3.12's own precedent of realizing an unbuildable capability as a diagram-kind quiz question instead. |
| Predict which shard absorbs new writes from a stated key-to-range mapping | Taught fresh in this chapter's own primary diagram and "Range vs. hash" table - no prior chapter covered partition layout. |

No move is unsourced.

## 12. Items flagged for a second pass

- **No Editor exercise at all, the second Group C chapter in a row to lack
  one (§0).** A second reader should confirm this judgment call - that the
  engine genuinely has no way to realize CURRICULUM's own config exercise for
  this chapter either, and that reusing 3.10's own resolution here is
  consistent rather than a habit applied without re-checking. Cross-check
  against the new open decision recorded below.
- **`search-engine`'s own `shards` field was checked and ruled out as a
  substitute for a database shard-key field (§0).** A second reader should
  confirm this reasoning holds - the two fields solve genuinely different
  problems - rather than being an under-examined dismissal.
- **The hot-partition failure mode is folded into "Range vs. hash" rather
  than given its own heading (§4).** A second reader should confirm this
  reads as a deliberate merge of two related failure directions, not as an
  under-covered topic CURRICULUM's own row treats as central.
- **Word count.** 1,267 words (`wc -w` on the raw `.mdx`) for a 30-minute,
  no-build, six-question-quiz chapter - lower than 3.10's own 1,357 for a
  25-minute chapter of the same shape. Flagged for a second reader to confirm
  the shorter length reflects this chapter's genuinely narrower content
  (one central decision - the shard key - examined from several angles)
  rather than under-depth against §20.6's density rule.
- **No formal density revision pass performed as a distinct drafting
  round** - matching every prior chapter's own precedent of flagging a
  self-assessed density claim for the next reviewer to check rather than
  trust.

**Not done (out of `chapter-author` draft mode's scope):** no Opus audit pass
yet. `tsc`/`lint`/`vitest`/`build` not run - content-only pass.
