# Chapter spec - Checkpoint R3: Open System Design

Authored under CURRICULUM.md §5, §6, §14 Part 4, §18.1, §20. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-r3-open-system-design`)
- Lesson body: `public/content/chapters/bb-r3-open-system-design.mdx`
- Manifest row: slug `checkpoint-r3-open-system-design` (`chapterDefinitionId`
  flipped from `null`)

**Completes Building Blocks.** The last row of the Building Blocks manifest.

## 0. Type classification

**Checkpoint** (§4), with §14's defining difference: "full palette, deliberately
underspecified brief, and - critically - **anti-pattern validation only** (the
RWE posture): many graphs pass; anything embodying a taught anti-pattern fails
with the taught explanation." §18.1 names R3 as "the shift". Same four-section
inventory as R1/R2.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Shift the validation posture from "build the expected shape" to "own your choices", inside a familiar palette, before RWE. (§14) |
| Type | Checkpoint |
| Difficulty | advanced |
| Estimated time | 60 minutes |
| Prerequisites | R2 |
| Unlocks | Completes Building Blocks; RWE Tiers 3+ (§17). |
| Building blocks introduced | None. |
| Stages trained | 5, 7, 8 (open design, trade-offs, defense). |
| Interview relevance | High, indirectly: an underspecified prompt answered by stating assumptions is interview step 1-2 under load. |
| Production relevance | Design review: many acceptable designs, judged by what they get wrong. |

## 2. Learning objectives

1. **Knowledge** - Recognize each taught anti-pattern on a graph and name its home
   chapter.
2. **Engineering** - Turn an incomplete brief into written assumptions and derive
   each choice from one.
3. **Practical** - Design on an empty canvas, free of taught anti-patterns; pass
   Submit.
4. **Interview** - Answer an underspecified prompt assumptions-first, naming the
   trade-off behind each major choice.
5. **Communication** - Defend a passing design as one of several, naming what a
   different design would have traded.

Exercised by: 1 -> Submit itself (every forbid and error rule) + Connections
table; 2 -> the assumptions comment the brief asks for + hint 1; 3 -> the build;
4, 5 -> the Debrief commentary, which names three alternative designs that would
also pass.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | Why the posture changes: interviews and reviews judge by mistakes, not by a template. |
| 14 | Connections | R1/R2 vs R3 table (brief, what passes, what fails, warnings). Two habits: write assumptions down, build the smallest design that answers them. |
| 16 | Your turn | Ticketing product, four known constraints, an explicit list of what is not stated, and "How it is judged". |
| Next | Next | R3 completes Building Blocks; RWE Tier 3 onward works this way. |

## 4. Declared omissions and justifications

As R1/R2 (§6 prohibitions, no diagram, no quiz). Additionally, the transition
brief explains the grading rule itself ("How it is judged") - a departure from
R1/R2's "what you are not told", justified because the posture is the lesson and
a learner who does not know warnings now fail would read a forbid failure as a
broken Submit.

## 5. Diagrams

None (§6). The reference design appears only in the Debrief.

## 6. Component budget

All 27 available. **`requiredComponentIds` is empty**, deliberately: requiring
any component is a prescriptive move, and §14 says anti-pattern only. The brief's
constraints (no double sale, survive the on-sale spike, email, reports) are
judged by the learner's own assumptions comment, the Debrief and Deep Check - not
by Submit. Recorded in `simplifications`.

## 7. Validation rules and the anti-pattern set

All ten registry rules are curated. How each one behaves at Submit:

| Rule | Severity | Fails Submit via |
|---|---|---|
| `component-relations` | error | Structural check |
| `missing-input-connection` | error | Structural check |
| `orphan-read-replica` | error | Structural check |
| `request-flow-cycle` | error | Structural check |
| `no-direct-client-database` | error | Structural check (live: `client` is in the palette) |
| `split-brain-risk` | warning | `forbid` pattern `bb-r3-forbid-split-brain` |
| `queue-without-dead-letter-queue` | warning | `forbid` pattern `bb-r3-forbid-queue-without-dlq` |
| `single-instance-load-balancer` | warning | `forbid` pattern `bb-r3-forbid-single-instance-lb` |
| `permissive-firewall` | warning | `forbid` pattern `bb-r3-forbid-permissive-firewall` |
| `orphan-component` | warning | **Does not fail** - clutter, not a taught design mistake |

Each forbid transcribes its rule's own `match` condition into the pattern
language (two leaders and no coordinator; a non-at-most-once queue with no edge to
a DLQ; an LB whose only compute target is one app server at one instance; a
firewall at `allow-all`). The LB forbid is narrower than the rule in one case: a
lone non-app-server compute target (a serverless function behind an LB) warns
but does not fail.

**Why forbid instead of a severity override:** no per-chapter severity override
exists (decision 11), and §14's posture is impossible without one or the other.
`forbid` is the existing, tested mechanism (`chapter-outcome.ts`'s
`blueprintMatches`).

**Drift now reports forbids.** `blueprint-drift.ts` used to be forbid-blind
(decision 11's fourth shape), which would have given R3's failures a generic
"doesn't match" message. Fixed alongside this chapter (2026-10-01): a
`GraphPattern` may carry a `label`, the drift report gains `forbiddenPatterns`,
and Submit's entry reads "Contains something this chapter rules out: <label>".
Each R3 forbid's label names the mistake and its home chapter. Covered by
`blueprint-drift.test.ts`, `chapter-outcome-violations.test.ts` and an R3 case
in `authoring-invariants.test.ts`. This is the **first authored use of
`forbid`**, made after the fix decision 11 asked for.

## 8. Blueprint

One blueprint, deliberately minimal: a `networking` node reaches a `compute` node
by path, which reaches a `data`/`distributed-systems`/`caching`/`messaging` node
by path. The three category lists cover all six registry categories, so
`blueprint-drift.ts`'s `extraComponentIds` is always empty - without that, a
forbid failure would also report every component the learner placed as "not part
of this approach", which in an open checkpoint is false by definition.

A design as small as browser -> app server -> database passes. That is the
anti-pattern posture working as specified, not a gap: nothing in it is a taught
mistake. Flagged in §12 for the user's call.

## 9. Hints

1. Write the assumptions comment first.
2. The brief's correctness line and load line want different things.
3. Warnings fail here, and Submit names which one.

## 10. Quiz

None (§22). QUIZ_FRAMEWORK §15's pre-R3 questions (Q5, Q6) back the Review
affordance. **Q5's premise ("a passing design still gets two warning-severity
notes ... warnings are named trade-offs") does not hold in R3 as built**: every
current warning rule except `orphan-component` is a taught anti-pattern and fails
here, and none represents a trade-off. Q6 (which items fail R3) matches the build.
Raised as open decision 24 and resolved the same day by rewriting Q5.

## 11. Playtest pass (§18.2)

| Move | Taught in |
|---|---|
| Recognize split brain | 3.26 |
| Queue needs a DLQ | 3.17 |
| LB needs two instances behind it | 3.4, 3.8 |
| Firewall closed by default | 3.1 |
| Never wire a client to a database | 1.2 |
| State assumptions before designing | 1.1 |
| Seat inventory on one elected writer | 3.22 (CP-ish per class), 3.26 |
| Pace admission to capacity | 3.24 |
| Tickets by email off the request path | 3.17 |

## 12. Flagged

- **First use of `forbid`** (§7). The drift fix decision 11 asked for landed
  with it, so RWE can use `forbid` the same way.
- **A trivially small design passes** (§8) - inherent to anti-pattern-only
  grading with today's rule set, and kept as specified (decided 2026-10-01). Adding rules that detect "no redundancy in the
  compute tier" or "a stateful store with no replication" would tighten it; that
  is engineering, not content.
- **Open decision 24, resolved 2026-10-01**: QUIZ_FRAMEWORK §15 Q5 described
  warnings as passing trade-offs; rewritten to match R3 as built.
- The brief is ~110 words - the shortest checkpoint brief, on purpose.
