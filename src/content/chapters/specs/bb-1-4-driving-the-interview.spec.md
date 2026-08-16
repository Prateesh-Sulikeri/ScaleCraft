# Chapter spec - 1.4 Driving the Interview

Authored under CURRICULUM.md §5/§6/§20, as part of Phase 10's Part 1
condense (`.claude/docs/pending-6.1.0-poa.md`, Phase 10). Renumbers old
1.11 Driving a System Design Interview to new 1.4 - **not a multi-chapter
condense** like new 1.1-1.3 (single source, single destination), so content
carried forward nearly unchanged rather than rewritten. Source read in
full: old 1.11's lesson, `ChapterDefinition`, and ledger entry.

- Chapter definition: `src/content/chapters/index.ts` (`bb-1-4-driving-the-interview`)
- Lesson body: `public/content/chapters/bb-1-4-driving-the-interview.mdx`
- Manifest row: not yet wired - deferred to the Phase 10 engineering pass.

---

## 0. Why this chapter needed no rewrite

Old 1.11 was already the capstone that runs all eight loop steps together
under time pressure - it doesn't teach new mechanics, it exercises the ones
1.1-1.10 (old numbering) already taught, sequenced under a clock. Condensing
1.1-1.10 into new 1.1-1.3 doesn't change what old 1.11 itself needs to say;
it only changes which chapter numbers its own cross-references point at.
This chapter's content is therefore a near-verbatim carry-forward, not a
compression - the honest amount of editing here is renumbering references
(old "1.1-1.3" -> "Framing the Problem"; old "1.7" -> "Designing the
System"'s ceiling method) and updating `curriculumContext`, not rewriting
prose that was never bloated to begin with.

## 1. Metadata (§5.1)

| Field | Value |
|---|---|
| Purpose | Run all eight Interview Loop steps as one time-boxed conversation, protecting the evidence chain (requirements -> estimate -> design -> pressure -> follow-ups -> close) under a real clock. |
| Type | Process |
| Difficulty | foundational |
| Estimated time | 30 minutes, unchanged from old 1.11 - this is a capstone with real content of its own, not a condensed chapter needing a shorter target. |
| Prerequisites | New 1.3 Defending the Design. |
| Optionality | Optional, gates nothing - unchanged from old 1.11. No downstream slug lists this chapter as a prerequisite; 2.1 hangs off new 1.3 directly. |
| Interview relevance | High - all eight loop steps at once. |

## 2. Quiz - deliberately NOT resized

QUIZ_FRAMEWORK.md §2's new condensed-chapter exception (10-15 questions)
applies to chapters that absorb multiple prior source chapters. This
chapter absorbs exactly one (old 1.11), so the exception doesn't apply -
the ordinary 3-6 question range governs, and old 1.11's 5 questions
(ramp 1/1/2/2/3, one `ordering` question with a verified full derangement)
were already correctly sized. Carried forward with only: ids renamed to the
`bb-1-4-*` prefix, and two explanation strings' old-chapter-number
references updated to name the new chapters by title instead ("the
requirements chain from Framing the Problem" / "the ceiling method from
Designing the System") rather than by a number that no longer means the
same thing.

## 3. `curriculumContext` changes

`position` updated (1.11 of 44 -> 1.4 of 37, both pending final registry
counts). `masteredConcepts` rewritten to cite new 1.1-1.3 instead of old
1.1-1.10, condensed to name what those three chapters actually teach rather
than listing ten old numbers. `notYetIntroducedConcepts` and
`simplifications` unchanged - both were already chapter-number-agnostic.

## 4. Everything else - unchanged from old 1.11

`problemStatement`, `learningObjectives` (5, one per §5.2 category),
component lists (all empty, no build), `hints` (empty, matching old 1.11 -
no build means nothing for a hint to orient toward), lesson structure and
prose. No declared omissions beyond what old 1.11 already declared (the
staged walkthrough is quiz-realized pending the stages UI, per
`pending-content.md`'s standing degradation path).

## 5. Playtest pass

Unchanged from old 1.11's own reasoning: every move in the quiz's miniature
interview is directly taught by new 1.1-1.3, now under their new numbers.
No move is unsourced.

## 6. Items flagged for a second reader

- **Confirm the two updated quiz explanation strings read naturally** -
  "the requirements chain from Framing the Problem" and "the ceiling method
  from Designing the System" replace bare chapter-number citations; check
  they don't read as awkward retrofits.
- **No Opus audit pass has run yet.**
