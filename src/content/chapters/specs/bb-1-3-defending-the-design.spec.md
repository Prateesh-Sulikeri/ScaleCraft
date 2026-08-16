# Chapter spec - 1.3 Defending the Design

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory
sections), §20 (author instructions), as part of Phase 10's Part 1 condense
(`.claude/docs/pending-6.1.0-poa.md`, Phase 10). Replaces old 1.8
Engineering Trade-offs and old 1.10 Communicating & Defending a Design with
one chapter. Source material read in full: both old lessons and their full
ledger entries (`.claude/docs/pending-chapters.md`).

- Chapter definition: `src/content/chapters/index.ts` (`bb-1-3-defending-the-design`)
- Lesson body: `public/content/chapters/bb-1-3-defending-the-design.mdx`
- Manifest row: not yet wired - deferred to the Phase 10 engineering pass,
  same as new 1.1/1.2. **2.1's `prerequisiteSlugs` currently points at old
  `1-10-communicating-and-defending-a-design` and must be repointed to
  `1-3-defending-the-design` in that pass** (POA §10.5 already names this).

---

## 0. Why one chapter, and why the synthesis was already there

Old 1.8 (trade-offs, loop step 7) and old 1.10 (evolve/defend, loop step 8)
were already sequential in a way old 1.1-1.5's separate tests weren't: old
1.10's own text states "defending reuses 1.8's own trade-off reflex,
extended one clause." Condensing them into one chapter makes that existing
connection the chapter's own structure rather than inventing a new
synthesis (contrast new 1.1's and 1.2's beat-7 sections, which had to state
a connection none of their source chapters made explicit).

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Name what a design decision costs (not just what it fixes), and handle a follow-up as new input to test rather than a verdict to react to - loop steps 7 and 8. |
| Type | Process |
| Difficulty | foundational |
| Estimated time | ~15 minutes (Reader + knowledge check; no build - the palette is the previous chapter's three components, unchanged). |
| Prerequisites | New 1.2 Designing the System. |
| Unlocks | New 1.4 (optional capstone) directly; 2.1 (repoint needed, see header). |
| Building blocks introduced | None. |
| Interview relevance | High - loop steps 7-8 (§10.1), the last two steps before a design is judged as a whole. |
| Production relevance | Any publicly defended engineering decision under outside skepticism runs this same test (Dropbox example). |

## 2. Learning objectives (§5.2)

Five objectives, all five categories, Practical exercised by the quiz (same
established Process-chapter convention as every prior no-build Part 1
chapter): state the trade-off statement and five dimensions (Knowledge);
identify which dimensions a decision spends (Engineering); read a follow-up
as evidence or pressure (Interview); pick the correct response in trade-off
and follow-up scenarios (Practical); defend or honestly revise a decision
out loud (Communication).

## 3. Per-beat outline (§5.3, Process type per §6)

| Beat | Section | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening | One continuous scene merging both source chapters' cold opens: propose a fix, get asked its cost, silence; later, a follow-up hits, and the design gets erased and redrawn without testing it first. |
| 3 Think first | "Think first" callout | Both prompts kept (cost of the fix; first thing to check on a 10x-writes follow-up), matching the chapter's two-part scope. |
| 4-6 Mental model / visual / core mechanics | "The reflex: name what you spent" | X/Y/Z statement, the five-dimensions table (old 1.8, largely unchanged), and the bigger-machine-vs-instances trade-off kept genuinely two-sided. |
| 7 Internal mechanics | "Reading a follow-up" + "Defending reuses the same reflex" | Old 1.10's decision-tree diagram and two-question test, plus the one-clause extension to X/Y/Z - this is where the two source chapters' own stated connection becomes the chapter's own beat 7. |
| 8 Trade-offs | Folded into beat 6 (bigger machine vs. instances) and the redesign-live-vs-name-it timing call | §6 permits merging adjacent short sections; this chapter's whole subject already is trade-offs, so a separate beat-8 section would restate rather than add. |
| 9-10 Failure modes / scaling | omitted | Optional for Process (§6), same as both source chapters - no system exists in this chapter to fail or scale on its own. |
| 11 Production examples | "In production" | Only Dropbox kept (from old 1.10) - covers both loop steps in one example (a named trade-off, defended under public skepticism). Old 1.8's Uber example cut; justified in §4. |
| 12 Common mistakes | "Common mistakes" | Five, condensed from both source chapters' four each. |
| 13 Interview lens | "In an interview" | One senior-answer line spanning both steps (name the trade-off, then defend it against a later follow-up). |
| 14 Connections | folded into "Next" | Backward: new 1.2 (bottleneck/deep-dive method, named twice) and 0.4 (loop steps 7-8). Meets §19's >=2. |
| 15 Recap | "Recap" | Five anchors, covering both halves. |
| 16 Transition brief | "Your turn" | States no build, names the quiz as covering both loop steps. |

## 4. Declared omissions and justifications

- **Uber's consistency example cut**, keeping only Dropbox. Two production
  examples for a ~15-minute condensed chapter is disproportionate (same
  reasoning as new 1.1/1.2's own cuts), and Dropbox alone already
  illustrates both this chapter's halves (naming a trade-off, defending it
  under challenge) where Uber only illustrated one dimension.
- **Failure modes/scaling omitted** - optional for Process, no system to
  fail or scale.
- **No everyday analogy** - same choice every Part 1 chapter has made.

## 5. Quiz (13 questions, condensed-chapter exception)

| Topic (old chapter) | Questions |
|---|---|
| Trade-off reflex, five dimensions (old 1.8) | Q1-Q5 |
| Follow-up reading, defending (old 1.10) | Q6-Q10 |
| Synthesis (new to this chapter) | Q11-Q13 |

Q3 is `multi` (select all dimensions genuinely spent), modeling old 1.8's
own trade-off-scenario exercise shape. Q12 directly tests the Dropbox
example's actual point (per §4's justification for keeping it) rather than
its surface details, guarding against the tourism trap §13 warns about.
**Position-clustering check.** 12 single-kind questions (all but Q3); a×3,
b×3, c×3, d×3 - checked by eye, no clustering.

## 6. Playtest pass (§18.2's binding question)

Every move (naming a trade-off, reading a follow-up, defending or revising)
is directly taught in this chapter's own text, built on new 1.2's bottleneck/
deep-dive material (which decision is under scrutiny) and 0.4's loop-step
framing. No move is unsourced.

## 7. Items flagged for a second reader

- **Only one production example kept.** Justified in §4; flagged in case
  Uber's cut example was doing load-bearing work this pass didn't notice.
- **The X/Y/Z-plus-one-clause structure is a direct restatement of what old
  1.10 already said explicitly**, not new synthesis this pass invented -
  flagged so a reviewer doesn't mistake this chapter's beat 7 for the same
  kind of new-idea claim new 1.1/1.2 made in their own beat 7.
- **No Opus audit pass has run yet.**
