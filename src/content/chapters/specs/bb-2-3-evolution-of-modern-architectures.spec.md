# Chapter spec - 2.3 Evolution of Modern Architectures

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
§20 (author instructions). Deliverable 1 of the 6 in pending-content.md's
"Per-chapter deliverables". Lives beside the lesson so a reviewer can check the
prose against the intent that produced it.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-2-3-evolution-of-modern-architectures`)
- Lesson body:
  `public/content/chapters/bb-2-3-evolution-of-modern-architectures.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `2-3-evolution-of-modern-architectures` (`chapterDefinitionId` repointed from
  `null` in this change)

---

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Tell the growth of an architecture as a sequence of forced moves, so the learner can attribute every box in a diagram to a pressure, decide whether their own system has earned its next move, and read Part 3's order as one system growing rather than a parts catalog. |
| Type | Concept |
| Difficulty | foundational |
| Estimated time | 20 minutes (Reader + four stage diagrams + knowledge check; no build - see §4). |
| Prerequisites | 2.2 Where Can Things Go Wrong? |
| Unlocks | 3.1, and through it all of Part 3. This chapter is the frame every Part 3 group is slotted into. |
| Building blocks introduced | None. §16 assigns Part 2 no components; the stage diagrams present components whose home chapters are in Part 3. |
| Stages trained | Stage 3 (the spatial map, §1.4), extended into time - the same map read as a sequence rather than a snapshot. |
| Interview relevance | Medium - step 4, narrative fluency (§14's own row). The chapter's payload is the ability to narrate an architecture as a story of moves rather than to list parts. |
| Production relevance | The inherited-system question: which boxes in this diagram answer a force we still have, which answer a force that has passed, and which were never forced at all. |

## 2. Learning objectives (§5.2)

Five objectives. Practical omitted, the same justified Concept-chapter carve-out
0.2, 0.3, 0.4, 2.1 and 2.2 used - no components introduced, no
construction-family exercise.

1. **Knowledge** - Name the four shapes a growing system passes through, and the
   pressure that ends each one.
2. **Knowledge** - State why relieving a ceiling moves it rather than removing
   it, and name where it moves once the app tier is copied.
3. **Engineering** - Decide whether a given system should make its next
   architectural move yet, naming the force that would justify it and the cost
   it would spend.
4. **Interview** - Narrate an architecture at loop step 4 as a sequence of
   forced moves: the shape today's numbers justify, the first thing that breaks,
   and the move that follows.
5. **Communication** - Justify staying on a simpler shape out loud by naming the
   limit not yet hit, rather than appealing to simplicity as a preference.

Each objective is exercised: 1 by the four shape sections and quiz Q1; 2 by
"Nothing here was designed", the "Where the ceiling went" paragraph and quiz Q3;
3 by "When the answer is 'don't'" and quiz Q5; 4 by "In an interview" and its
§10.3 senior-answer line; 5 by the same section's worked X/Y/Z statement ("we
stayed on one machine, accepting...") and by Q5's framing, which asks for the
response rather than the decision.

Objective 2 is separated from objective 1 deliberately, on the 2.1/2.2
precedent: knowing the sequence and knowing that each move relocates the
bottleneck are separately testable, and the second is the one that makes the
sequence predictive rather than memorized.

## 3. Per-beat outline (§5.3, Concept type per §6)

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening, 2 paragraphs | The candidate who draws the end state at step 4 and cannot say why the cache is there. Two sentences of scene, then stakes: every box went in on a specific day, Part 3 is twenty-six chapters of those boxes in the order a system acquires them, and this chapter is that order. Pays off 2.2's closing tease ("every stop you just learned to distrust is a stop somebody chose to add"). |
| 3 Think first | "Think first" callout | Prediction before any reveal: one machine, traffic doubling monthly - name the first thing you would split off, and one new way the system can fail once you have. The second half is what makes it a 2.2-informed prediction rather than a guess, and it is answered by the "Spends" line of shape two. |
| 4 Mental model | "Nothing here was designed" | The one-sentence anchor: each box is the residue of a limit that was actually reached. Then the cycle that generates the whole chapter - a ceiling gets close (1.2's ceiling), the cheapest split relieves it, the ceiling moves to the next lowest number. One model, no competing metaphor. |
| 5 Visual explanation | Four Mermaid stage diagrams | The §7.1 "scaling evolution (v1 -> v2 -> v3)" diagram, whose named home in that table is this chapter. Progressive reveal per §8.6: one machine, split tiers, copies behind a router, application split into services. Each is introduced before its prose (§8.1) and carries its own one-line caption naming what to notice (§7.2). See §5 below for the Mermaid-versus-graph-JSON call. |
| 6 Core mechanics | The four "Shape N" sections | Each shape gets the same three moves: what it buys, what it spends, and what pressure ends it. The Buys/Spends framing is 1.3's reflex applied at architecture scale rather than a new device. |
| 7 Internal mechanics | "Why the moves come in this order" | The one level down §20.2 asks for, and the chapter's real payload: compute copies for free and state does not, because identical instances owe each other no agreement and copies of data do. That single asymmetry explains the order of the moves and of Part 3's groups. Closed by the group table, which is the §14 "Part 3 reads as one system growing" deliverable in its highest-scan form. |
| 8 Trade-offs | "When the answer is 'don't'" | Two defensible answers, both costed: move before the force arrives (pay complexity for a ceiling you may not reach) or wait (make the move under pressure). Explicitly 1.2's preempt-or-wait at whole-system scale, resolved through a worked 1.3 X/Y/Z statement, with §9 lens 9's contrast (two people versus a hundred engineers) carrying the anti-cargo-cult point. |
| 9-10 Failure modes + scaling | distributed, declared | Both optional for Concept. See §4 - beat 9 is paid in every shape's "Spends" line rather than in a section, and beat 10 is the chapter's entire spine. |
| 11 Production examples | "In production" | Two, per §13's decision-not-company rule, deliberately at opposite poles. Stack Overflow: a large read-heavy workload served from few machines and one primary database, on purpose, accepting dependence on vertical headroom. Amazon: the split into services forced by deploy coupling across teams rather than by request volume. Both stated at decision level, no figures the argument leans on. |
| 12 Common mistakes | "Common mistakes" | Four: drawing the end state, copying a company's shape instead of its forces, treating state like compute, and reading the four shapes as a ladder to climb. The third and fourth are the misconceptions quiz Q4 and Q5 test. |
| 13 Interview lens | "In an interview" | Medium relevance, so shorter than 2.2's: what step 4 is testing (narrative, not inventory), the weak answer, the shape of the strong one, then §10.3's mandatory senior line - built only from this chapter's vocabulary plus 1.2's ceiling, and ending by naming a price (read-your-own-write staleness) rather than a component. |
| 14 Connections | merged into "Next" | Backward: 2.1 (the path, and its "none of them is a default" line), 2.2 (each new box a new failure point), 1.2 (the ceiling method and preempt-or-wait), 1.3 (the reflex and up-versus-out), 0.2 (forces), 0.4 (loop step 4). Six explicit backward connections, over §19's >=2. |
| 15 Recap + knowledge check | "Recap" | Five retrieval anchors; `QuizLauncher` renders the knowledge check automatically. |
| 16 Transition brief | "Your turn" | No build, palette untouched, and the exercise named honestly: the sequence and two judgment calls, both in the knowledge check. Same no-build pattern 0.2/0.3/0.4/2.1/2.2 established. |
| Preview of next | folded into "Next" | Previews **3.1 Networking Fundamentals** with pull generated by this chapter's own material: three shapes' worth of arrows have been drawn without asking what an arrow costs, who can read what crosses it, or who may send one. Verified against `manifest.ts` - 3.1 is the immediate next row and its `prerequisiteSlugs` is `["2-3-evolution-of-modern-architectures"]`. |

## 4. Declared omissions and justifications (§6's written-justification rule)

- **No construction-family exercise (build/completion/fix).** The same
  exception 0.2, 0.3, 0.4, 2.1 and 2.2 recorded (§11.1): §16 assigns Part 2 no
  components, so there is nothing to build with that would not be a forward
  dependency. `availableComponentIds`/`requiredComponentIds` are both `[]`, no
  `starterGraph`, `blueprints: []`, `hasEditorExercise: false`.
- **Failure modes (beat 9) - not a section, and deliberately so.** Optional for
  Concept, and 2.2 is the chapter that owns failure. Here the material appears
  where it belongs to this chapter's argument: every shape's "Spends" line names
  the failure modes that move introduces (an app healthy while its database is
  unreachable; 2.2's whole taxonomy applying between two pieces of your own
  system). Giving it its own section would either duplicate 2.2 or bury the
  point that new failure modes are part of a move's price.
- **Scaling behavior (beat 10) - carried by the spine, not a section.** Optional
  for Concept, and this chapter is §9 lens 7 end to end: the four shapes *are*
  the 10x/100x/1000x answer, stated qualitatively and specifically the way the
  lens demands. A separate "scaling considerations" section would restate the
  chapter.
- **No everyday analogy in the mental-model beat.** §5.3 marks the analogy
  "where honest". "Each box is the residue of a limit somebody hit" is already
  the plain statement; the obvious analogies (a house extended room by room, a
  city growing outward) all imply an end state somebody planned, which is the
  exact claim this chapter denies. 0.3, 0.4, 2.1 and 2.2 declined for the same
  class of reason.
- **§12's nugget devices (Interview / Production / Engineering nuggets) -
  omitted, declared.** Sixth chapter to omit, fifth to declare. Not re-arguing
  it: see `pending-chapters.md` open decision 5, which is overdue and asks that
  chapters stop declaring this one at a time. Equivalent content is carried
  inline (lens 7 in the four shapes, lens 9 in "When the answer is 'don't'",
  lens 1 in every "what ends it" paragraph).
- **§19's "Interview lens sections name which RWE projects exercise this
  chapter's material" - omitted, declared.** Unchanged from 2.2: no RWE project
  is authored, so naming one is a forward reference to content that does not
  exist.

## 5. Diagrams: four Mermaid stages, and why not a `<Walkthrough>`

§7.1's inventory names "Scaling evolution (v1 -> v2 -> v3)" with a typical home
of **2.3** - this chapter is the row. §8.6 asks for that story as 2-4
evolutionary diagrams; four are authored, one per shape.

**Why not a `<Walkthrough>`, which is what 2.1 and 2.2 both used.** Checked
directly against `src/chapters/walkthrough/types.ts`: `WalkthroughProps` takes
one fixed `nodes`/`edges` set, and a step may only `focus`/`highlightNodeIds`/
`highlightEdgeIds` within it. There is no way for a node to not-yet-exist on an
early step. A walkthrough of this chapter would therefore render shape four on
step one, dimmed - showing the destination before the first pressure has been
felt, which is precisely what §7.2's "never open with the final 12-node
architecture" and §20.4's manufacture-the-problem rule forbid. Inverting the
highlight semantics the way 2.2 did would not fix it either, because the four
shapes are genuinely different topologies rather than one topology examined at
four points: shape one's single box is not a dimmed version of shapes two
through four, it is a different claim about where the application and its data
live.

**Why Mermaid rather than ScaleCraft graph JSON.** §7.2 prefers graph JSON for
any topology, and the Reader still cannot render it (`pending-chapters.md` open
decision 3, unresolved). The live precedent is 1.2, whose three-box topology and
decision tree are both Mermaid in a shipped chapter. Applied narrowly here, per
that decision's own lesson from 1.6: **each caption describes only its own
diagram** and none generalizes about edge kinds or topology in the abstract.
Edge labels carry the real edge kind (`request-flow`) so the semantics the
learner has been absorbing since 1.2 stay correct.

**§7.2's once-rule is respected.** Four diagrams, four different topologies, one
drawing each. Shape two is 1.2's topology, drawn once in *this* chapter and
labeled as the callback it is.

## 6. Component budget (§16)

None introduced. `availableComponentIds: []` - the palette is untouched and
nothing this chapter shows is buildable by the learner.

The stage diagrams present `load-balancer` (3.4) and `api-gateway` (3.5) as
named boxes, and the cold open names a cache, a read replica and a queue as
things a candidate drew. This is §14's Part 2 header ("presented diagrams use
components the learner hasn't unlocked yet - explicitly labeled as a guided
tour") and §18.2 rule 2's sanctioned larger exception, the same one 2.1 and 2.2
rely on. The labeling requirement is discharged in "Your turn" ("no new
components on your palette") and by every forward pointer being marked with its
chapter number at first use.

**Forward references: this chapter maps Part 3 on purpose, which is more than
§19's one tease.** §19 allows one forward tease per chapter; this chapter names
3.1, 3.4, 3.5, 3.6, 3.7, 3.9, 3.12, 3.13, 3.14 and 3.17 in prose plus every
group in the table. That is not an overrun of the rule but the same structural
exception 2.1's stop table took (`pending-chapters.md` open decision 12): §14's
own purpose line for 2.3 is "so Part 3's sequence reads as one system growing
rather than a parts catalog", which cannot be delivered without naming the
sequence. Every reference is a marked pointer to where a thing is taught, never
an inline explanation of untaught material - the test §20.2 actually sets. The
one *unmarked* piece of vocabulary introduced is monolith/services, glossed in a
sentence at the point of use; neither term has a home chapter in §16 or §14, so
it is general engineering vocabulary rather than a forward reference.

**Same class of drift as decision 12, one level up.** 2.1's table pre-committed
five chapters' framing; this chapter's table pre-commits all seven Part 3
groups' motivating pressure. Recorded as a new open decision in
`pending-chapters.md` so Group A-G authors check their rows rather than
diverging silently.

## 7. Validation rules (deliverable 4)

None authored, none needed. `validationRuleIds: []` - there is no graph to
validate.

## 8. Quiz (deliverable 5)

Five questions, ids permanent. Ramp 1/1/2/2/3, matching the 0.2/0.3/0.4/2.1/2.2
convention (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK §3's
rough 30/45/25). Ordinary chapter, so §2's 3-6 range applies.

§14's exercise line for this chapter is "ordering + trade-off (when is a
monolith right?)", and the quiz is where both land: Q1 is the ordering, Q5 is
the trade-off, named in §14's own words.

QUIZ_FRAMEWORK §7 tags two of its ten bank questions to 2.3 (Q7, Q8). Both are
used.

| This chapter | Bank source | What changed |
|---|---|---|
| Q1 `ordering` | original | The four shapes in the order a system reaches them. Realizes §14's "ordering" exercise directly. |
| Q2 `single` | §7 Q7 | Level lowered from the bank's 2 to 1: within 2.3 this is the chapter's own stage-one and stage-three material stated explicitly, so it is comprehension rather than cross-part inference, and the ramp needs two level-1 questions. Distractors rewritten wholesale - the bank's "big machines stopped being manufactured" and "programming languages required it" are joke options that §1's rule 3 forbids. The replacements are real positions: scaling up is obsolete on price, splitting is a latency win, and more machines is more availability by construction. |
| Q3 `single` | original | The ceiling-moves claim, tested as a prediction one step past the lesson's own example (four instances rather than two). The only question exercising objective 2. |
| Q4 `single` | original | The compute-versus-state asymmetry, framed as a teammate's proposal. Its correct answer is the chapter's internal-mechanics beat; option D of the *lesson's* common-mistakes list is the same misconception, deliberately. |
| Q5 `single` | §7 Q8 | Level 3, kept. Rewritten from the bank's sketch: the correct option now names both what one unit buys a two-person team and the condition under which the answer flips ("split when a force actually arrives"), and the "monoliths cannot scale" distractor is sharpened into the specific confusion this chapter can now diagnose - one deploy unit versus one machine, which shape three already separated. |

**Position-clustering check** (the bug 0.1/0.2 shipped once). Four lettered
questions (Q2, Q3, Q4, Q5 - Q1 is `ordering` and has no letter position).
Correct options sit at a, c, d, b - four distinct positions. Checked across
siblings per the chapter-author skill's cross-chapter note: 0.4, 1.3, 1.4 and
3.4 open at "b", 2.1 opens at "c", 2.2 opens at "d", so this chapter's first
lettered question opens at "a" - the fourth distinct opening letter, and the
set of four chapter-opening positions is now complete.

Q1's `options` array is a full derangement against `correctOrder`: authored
order is `services, copies, one-machine, tiers` against a correct order of
`one-machine, tiers, copies, services`, so no item sits at its own index and the
rendered order is not the solution.

Scope check: every question draws on 2.3's own material plus 1.2 (ceilings),
1.3 (up versus out, priced), 2.1 (the router as a force) and 2.2 (more machines
is more failure points). Nothing requires a Part 3 chapter. Where later material
is adjacent (replication in Q4, the load balancer's own limits in Q3), it
appears only inside an explanation that names its home chapter, never as
knowledge needed to answer.

## 9. Playtest pass (deliverable 6, §18.2's binding question)

*"Which prior chapter taught each move this exercise requires?"*

| Move | Taught by |
|---|---|
| Know that a component has a ceiling and the system's ceiling is the lowest one on the path (Q3) | 1.2, directly, with worked numbers |
| Know that scaling up and scaling out are both real, priced answers to one bottleneck (Q2) | 1.3, directly - its decision tree and the "ceiling of its own" line |
| Apply buys-and-spends to a decision that is not yet forced (Q5) | 1.3, and re-exercised in this chapter's "When the answer is 'don't'" before the quiz asks for it |
| Know that a router in front of copies is a response to a force, not a default (Q1, Q3) | 2.1, which states exactly that about the load balancer, gateway and firewall |
| Know that more boxes is more failure points (Q2's distractor D) | 2.2, the entire chapter |
| Know that a request between two machines can fail in ways a function call cannot (shape two and four's "Spends") | 2.2's error / hang / disagreement taxonomy |
| Answer an `ordering` quiz question (Q1) | 2.1's own Q1, on this exact chain |
| Recognize step 4 of the Interview Loop as this chapter's home | 0.4, which taught all eight steps by name |

No move is unsourced. The one piece of vocabulary the chain has not supplied is
monolith/services, which the lesson glosses at first use rather than assuming
(§20.1's define-at-first-use rule).

## 10. Comparison to CURRICULUM §14's own row

2.3's row: "Purpose: the scaling-evolution story (one server -> tiers ->
horizontal scale -> services), so Part 3's sequence reads as one system growing
rather than a parts catalog. Interview: Medium: narrative fluency for step 4.
Exercise: ordering + trade-off (when is a monolith right?). Est: 20."

The four named states are the four shape sections, in that order. The "reads as
one system growing" deliverable is the group table in the internal-mechanics
beat plus the per-shape pointers. Interview relevance is treated as Medium,
which is why the interview lens is shorter than 2.2's High one and aimed at
narration rather than at a question type. The exercise is realized as §8
describes.

One judgment call worth recording rather than a divergence:

- **The row's arrow goes "tiers -> horizontal scale -> services" with no stop at
  the data tier**, but the honest engineering story puts a data-tier move
  between the third and fourth shapes - a real system relieves the database
  before it splits the application. The chapter resolves this by naming that
  move where it happens ("Where the ceiling went", after shape three) and
  handing the mechanism to its owning chapters (3.12, 3.13, 3.14) rather than
  authoring a fifth shape. That keeps §14's four states intact, keeps the
  chapter honest about the order, and does not spend Group C and D's material.

## 11. Note for the Opus pass

Not yet run - this is the Sonnet draft only. Five things worth a cold reader's
attention:

- **Prose word count is 2250** (`wc`-style, Mermaid blocks excluded), roughly
  2.2's 2230 and ~25% above 2.1's 1804 for the same 20-minute estimate. A
  density pass was run as a distinct step and cut ~110 words, mostly from the
  two production examples, the shape-one and shape-three prose, and the
  interview quote. The overage is claimed as content: four stage sections plus
  the asymmetry plus the group map. The most likely cut if one is needed is the
  second paragraph of "When the answer is 'don't'", whose team-size contrast
  partly restates §9 lens 9 already carried by the Stack Overflow and Amazon
  pair.
- **The four-Mermaid decision is the judgment call most likely to be
  challenged** (§5 above), since both sibling Part 2 chapters use
  `<Walkthrough>` and this one does not. The reasoning is a capability limit,
  not a preference - but if a cold reader disagrees, the alternative is not a
  walkthrough of the four shapes, it is fewer stage diagrams with more prose.
- **The group table pre-commits all seven Part 3 groups' motivating pressure**
  (§6 above), which is the strongest claim this chapter makes about content
  nobody has written. Each row was written against §14's group briefs; check
  them against those briefs rather than against plausibility.
- **Both production examples are stated from public material at decision
  level.** Stack Overflow's small-fleet monolith and Amazon's early-2000s
  services split. No numbers are load-bearing, deliberately; if either
  characterization reads as overstated the safer edit is to soften the claim
  rather than to add a figure.
- **"Compute copies for free" is the chapter's sharpest sentence and its most
  arguable one.** It means free of coordination, and the lesson charges money
  and operability elsewhere in the same section. The `simplifications` list says
  so. Worth checking that the prose earns the phrase rather than needing the
  disclaimer.
