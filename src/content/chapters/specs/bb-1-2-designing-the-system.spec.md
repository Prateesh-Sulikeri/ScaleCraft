# Chapter spec - 1.2 Designing the System

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory
sections), §20 (author instructions), as part of Phase 10's Part 1 condense
(`.claude/docs/pending-6.1.0-poa.md`, Phase 10). Replaces old 1.6 Drawing
the First Architecture, 1.7 Identifying Bottlenecks, and 1.9 Deep Dive
Methodology with one chapter. Source material read in full before drafting:
all three old lessons, old 1.6's complete `ChapterDefinition` (component
lists, blueprint, `starterGraph`, all five quiz questions), and old
1.7/1.9's ledger entries.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-2-designing-the-system`)
- Lesson body: `public/content/chapters/bb-1-2-designing-the-system.mdx`
- Manifest row: not yet wired - deferred to the Phase 10 engineering pass,
  same as new 1.1.

---

## 0. Why this chapter is Building Block type, not Process

Old 1.6 was the first Building Block chapter in Part 1 (real components, a
real starter graph, a real Fix exercise); old 1.7 and 1.9 were Process
(no build). Condensing them into one chapter makes the combined chapter
Building Block, since it still ships a real canvas exercise - the type
follows the strongest exercise present, not an average. This has a real
consequence per §6: Failure modes, Scaling, and Production examples all
become mandatory ("M") rather than optional ("o"), unlike new 1.1 and new
1.3 which stay Process. All three are genuinely present in this chapter (see
§3 below), not merged away.

## 1. §10.3's must-survive requirement - what was preserved exactly

The POA is explicit that old 1.6's component introduction and first Fix
exercise are "product machinery, not prose" and must survive intact. Kept
byte-for-byte or near-identical from old 1.6's `ChapterDefinition`:

- `availableComponentIds` / `requiredComponentIds`: `["client", "app-server", "sql-database"]`, unchanged.
- `validationRuleIds`: the same five rules, unchanged, including the code
  comment explaining why `component-relations`' message names the client's
  output rules rather than the database's input rules.
- `blueprints`: the same single `require` pattern (client -> app -> db, both
  `request-flow`), same `commentary`. Only the `id` changed (`bb-1-6-blueprint`
  -> `bb-1-2-blueprint`) to match the new chapter id.
- `starterGraph`: the same deliberately-broken graph (app-server absent,
  `client -> sql-database` direct edge at kind `request-flow`), same
  structure, only node/edge ids renamed to the `bb-1-2-*` prefix.
- Quiz Q1-Q4: old 1.6's Q1, Q2 (the diagram question), Q3, Q4 carried
  forward essentially unchanged (Q2's graph JSON is identical; Q1/Q3/Q4's
  prompts and options are unchanged). Old 1.6's Q5 (the 100x scaling
  question) also survives, renumbered to Q11 to sit with this chapter's
  other difficulty-3 synthesis questions rather than at the end of a
  five-question set.
- The "Your turn" transition brief's instructions (no tour, run Validate,
  add the missing component, route both edges, clean Validate then Submit)
  are unchanged from old 1.6's own wording.

Everything else (surrounding lesson prose, the rest of the quiz, hints,
`curriculumContext`) is new or condensed from old 1.7/1.9.

## 2. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Produce the minimal viable architecture from requirements, find what breaks first as traffic grows, and pick a defensible deep-dive target - loop steps 4, 5, and 6 in one chapter. |
| Type | Building Block |
| Difficulty | foundational |
| Estimated time | ~25 minutes (Reader + a real Editor build - honestly higher than new 1.1/1.3's ~15 minutes, since this chapter is the only one of the four carrying a real canvas exercise, same as old 1.6 alone was 30 minutes against 1.1-1.5's 15-25). Flagged in §11 below as a deliberate deviation from Phase 10's flat "~15 min" planning average. |
| Prerequisites | New 1.1 Framing the Problem. |
| Unlocks | New 1.3 Designing the System directly; every later Building Block chapter (this is the shape they all extend). |
| Building blocks introduced | `client`, `app-server`, `sql-database`; edge kind `request-flow`. Unchanged from old 1.6 - §16's home for these three stays this chapter. |
| Stages trained | Building Block default: stage 2 (construction, the real Fix exercise) plus Part 1's stage 4/5 continuation (bottleneck comparison, deep-dive targeting). |
| Interview relevance | High - loop steps 4-6 (§10.1), the core of every design interview's middle third. |
| Production relevance | The same three-tier shape (client, app tier, data store) is the actual starting shape of most production systems, per the Instagram example. |

## 3. Per-beat outline (§5.3, Building Block type per §6 - all sections mandatory)

| Beat | Section | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening | Continues directly from new 1.1's own "Next" tease. Names all three loop steps (4-6) up front rather than introducing them one at a time as the three source chapters did separately. |
| 3 Think first | "Think first" callout | Unchanged in spirit from old 1.6's own prompt (fewest boxes a real system needs). |
| 4 Mental model | Implicit in "The minimal shape"'s opening line | "Three jobs, three boxes" - same one-sentence anchor old 1.6 used. |
| 5 Visual explanation | Mermaid diagram, "The minimal shape" | **Combines old 1.6's topology diagram and old 1.7's abstract ceiling diagram into one** - the same three real components, now annotated with example ceiling numbers on the app server and database. This does double duty (shows mediation AND the ceiling concept) without redrawing the same topology twice, which §7.2 prohibits. Mermaid-as-topology exception reused from old 1.6 (the narrow, chapter-scoped precedent, not a general license). |
| 6 Core mechanics | "What each box does" / "Why the database never talks to the client directly" / "One instance, for now" | Condensed from old 1.6, largely unchanged content. |
| 7 Internal mechanics | "Two methods for looking closer" | **New synthesis**, not present in any source chapter: states that the bottleneck method (old 1.7) and the deep-dive targeting method (old 1.9) are the same underlying comparison (which requirement is under pressure, which component is where it lands) asked as two different questions. Exercised directly by quiz Q13. |
| 8 Trade-offs | "Two trade-offs, both genuinely two-sided" | Merges old 1.7's preempt-vs-wait and old 1.9's one-dive-vs-split-time - both kept genuinely two-sided per §11.1, no secretly-correct answer in either. |
| 9 Failure modes | "What breaks first" | Mandatory for Building Block. Condensed from old 1.6's app-server-crash-vs-database-crash asymmetry. |
| 10 Scaling | "What changes at 10x and 100x" | Mandatory for Building Block. Merges old 1.6's scaling section with old 1.7's "why the bottleneck moves" (app-tier scales near-linearly; a single database primary's ceiling stays fixed). |
| 11 Production examples | "In production" | Mandatory for Building Block. Kept only Instagram (from old 1.6); cut old 1.7's Twitter and old 1.9's Amazon-100ms examples - justified in §5 below. |
| 12 Common mistakes | "Common mistakes" | Five, one or two condensed from each of the three source chapters. |
| 13 Interview lens | "In an interview" | One senior-answer line threading design -> bottleneck -> deep-dive-target in sequence, replacing three separate senior lines. |
| 14 Connections | folded into "Next" | Backward: 0.4 (loop steps 4-6, named twice) and new 1.1 (traffic estimate/landmark ratios, named twice). Meets §19's >=2. |
| 15 Recap | "Recap" | Five retrieval anchors, one per major idea. |
| 16 Transition brief | "Your turn" | Unchanged from old 1.6 - the same Fix exercise, same instructions. |
| Preview of next | folded into "Next" | Previews new 1.3 "Defending the Design" (loop steps 7-8) - matches old 1.9's own tease target (1.10), renumbered. |

## 4. Diagram novelty and §7.2 compliance

Old 1.6's Mermaid-topology exception was explicitly scoped narrowly to that
chapter (`pending-chapters.md` open decision #3). This chapter inherits that
same exception for the same topology (it's the same three components, same
Fix exercise), not a new or extended license - no new topology diagram is
introduced. The deep-dive decision tree (beat 7, modeled on old 1.9's own)
is a different diagram family (decision tree, not architecture/topology) and
needed no exception. Per §7.2, "a chapter draws a given topology exactly
once" - satisfied: the topology appears once (beat 5), annotated with
ceiling numbers rather than drawn a second time for old 1.7's abstract
ceiling diagram.

## 5. Declared omissions and justifications (§6's written-justification rule)

- **Two of three production examples cut.** Old 1.7's Twitter example and
  old 1.9's Amazon 100ms-latency example are both genuinely good, but three
  examples for one condensed chapter is disproportionate (same reasoning new
  1.1's spec §4 used for its own cuts). Kept Instagram because it anchors
  the chapter's own core teaching (the minimal three-tier shape as a real
  production starting point), which the other two don't directly illustrate.
- **No everyday analogy in the mental-model beat** - same choice every
  source chapter made.

## 6. Component budget (§16)

`client`, `app-server`, `sql-database` - unchanged from old 1.6, this
chapter's home per the audit. No exceptions to declare.

## 7. Validation rules and blueprint

Unchanged from old 1.6 - see §1 above. No new rules authored.

## 8. Quiz (13 questions, condensed-chapter exception)

| Topic (old chapter) | Questions |
|---|---|
| Build / design / the Fix exercise (old 1.6) | Q1-Q4, Q11 |
| Bottleneck / ceiling method (old 1.7) | Q5-Q8 |
| Deep-dive targeting (old 1.9) | Q9-Q10 |
| Synthesis (new to this chapter) | Q12, Q13 |

Q1-Q4 and Q11 are old 1.6's own Q1-Q5, carried forward with ids renamed
(§1). Q5 (diagram-kind) models old 1.7's predict-then-check diagram
questions, reusing the chapter's own topology with example ceiling numbers
stated in the prompt (component `config` has no generic numeric-ceiling
field, so numbers live in prose, matching old 1.7's own convention). Q6-Q10,
Q12-Q13 are original to this chapter. Q13 specifically exercises beat 7's
new synthesis point.

**Position-clustering check.** 11 single-kind questions (Q1, Q3, Q4, Q6-Q13);
correct options: a×3, b×3, c×3, d×2 - checked by eye, no clustering.

## 9. Playtest pass (§18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Fix a starter graph, run Validate, read the explanation, Submit | 0.1's guided tour and 1.6's own unguided precedent (this is the same exercise). |
| Reason about mediation (authentication/authorization/business rules) | This chapter's own "Why the database never talks to the client directly" - no prior chapter names it. |
| Compare component ceilings to find a bottleneck | New to this chapter, self-contained (the comparison is given in each question's own prompt). |
| Apply the two-question deep-dive method | New to this chapter, built on new 1.1's requirements material (which requirement is closest to its limit). |
| Read a Mermaid decision-tree diagram | Familiar shape from new 1.1's own primary diagram. |

No move is unsourced.

## 10. Comparison to CURRICULUM §14's own rows

§14 still describes old 1.6, 1.7, and 1.9 as three separate rows (with
1.6's row over-promising a simulator trace, per `pending-chapters.md` open
decision #7 - unresolved, inherited as-is, not fixed by this condense).
CURRICULUM.md needs updating for the new 1.1-1.4 structure - engineering-
pass work (POA §10.5), not content-authoring.

## 11. Items flagged for a second reader

- **Estimated time (~25 min) is honestly higher than new 1.1/1.3's ~15
  min**, since this is the only one of the four new chapters with a real
  build. This is a deliberate deviation from Phase 10's "3 × 15" planning
  arithmetic (POA §10.1), not an oversight - flagged for the user to
  confirm the deviation reads as intentional rather than as the condense
  failing to hit its target.
- **The combined topology-plus-ceiling diagram (beat 5)** is new structure,
  not present in either source chapter individually. Flagged for a second
  reader to confirm it reads as doing double duty cleanly rather than as
  overloaded.
- **Beat 7's "two methods, one comparison" synthesis** (like new 1.1's own
  beat 7) has no direct precedent in the three source chapters. Flagged for
  the same reason new 1.1's spec flagged its own synthesis beat.
- **No Opus audit pass has run yet.**
