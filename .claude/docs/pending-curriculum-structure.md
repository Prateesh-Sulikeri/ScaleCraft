# Curriculum Manifest Migration - Plan of Action

You are acting as the **implementation engineer** for migrating `src/curriculum/manifest.ts`
(the Learning Path's data source) to the restructured curriculum in `CURRICULUM.md` v2.0
(Parts 0-4, 44 chapters + 3 checkpoints; RWE Tiers 1-5, 32 projects). You do NOT rewrite
curriculum content or the quiz banks - this is a data-model/manifest task, scoped to
`src/curriculum/`. If you hit a genuine spec contradiction, propose a doc edit rather than
resolving it unilaterally - see the two schema questions already flagged below.

This plan exists because `manifest.ts` still transcribes the *old* v1 map (0.1-6.1, R1-R3,
31 entries) against the *old* CURRICULUM.md §13, while the live CURRICULUM.md has moved to
§14/§15/§17/§23 with a materially different shape (47 BB entries, 32 RWE projects, five RWE
tiers instead of three). Nothing downstream should be built against the stale structure.

## Read first, in this order

1. `.claude/docs/CURRICULUM.md`:
   - §14 (Building Blocks curriculum - Parts 0-3 chapter-by-chapter, Part 4 checkpoints)
   - §15 (Real World Extraction - 5-tier roster, §15.1 shared project structure)
   - §16 (component/edge introduction audit - do not reorder past this)
   - §17 (prerequisite graph, part/group/tier level - mermaid diagram)
   - §18.2 (sequencing rules, binding on all authors)
   - §21.1, §21.4 (data-model mapping + the v1->v3 migration table - this is the load-bearing
     section for this task)
   - §23 (final curriculum map - the flat list to transcribe against)
2. Current code: `src/curriculum/manifest.ts` (the file being replaced), `src/curriculum/types.ts`
   (`Course`/`CurriculumSection`/`CurriculumChapter`), `src/curriculum/manifest.test.ts`
   (invariants that will need updated counts), `src/curriculum/index.ts` (`allEntries`,
   `findEntry` - anything that walks the manifest).
3. `src/persistence/db.ts` - `CurriculumProgress` (keyed by `slug`) and `ChapterProgress` -
   the two tables a slug rename can orphan.
4. `.claude/docs/RELEASE_3.0.0_LEARNING_PATH.md` §6 ("Locked chapters") - how
   `prerequisiteSlugs` is meant to gate the UI (not yet enforced in 3.0.0 per the current
   manifest header comment - confirm whether this migration is expected to also wire up
   enforcement or just correct the data).
5. Orient in code with graphify before opening files: `graphify query "curriculum manifest
   learning path"`, `graphify explain "CurriculumChapter"`.

## What's actually changing (counts, for sanity-checking your own work)

- Building Blocks: 4 (Part 0) + 11 (Part 1) + 3 (Part 2) + 26 (Part 3, seven groups A-G) +
  3 checkpoints (Part 4) = **47 entries** (44 chapters + 3 checkpoints, matches §21.3's
  totals). Current manifest has 26.
- Real World Extraction: 4 (Tier 1) + 5 (Tier 2) + 9 (Tier 3) + 9 (Tier 4) + 5 (Tier 5) =
  **32 entries**, across **5 tiers** instead of the current 3. Current manifest has 5.
- Section/group boundaries change shape too: Part 3 is now seven named groups (A Core
  Infrastructure, B Compute, C Data, D Performance, E Async Systems, F Storage,
  G Reliability) rather than "Unit 1" through "Unit 6" - decide whether `CurriculumSection`
  maps one-to-one to each Part/Group or whether Parts 0-2 collapse differently; §14's own
  headers are the source of truth for section boundaries.

## Phase 1 - Confirm/extend the data model

- Re-read `CurriculumChapter`/`CurriculumSection` (`src/curriculum/types.ts`) against §14/§15's
  richer per-project metadata. §15.2 says "the Learning Path renders tiers as sections; domain
  is a chip on each row" - **`domain` is not a field on `CurriculumChapter` today.** This is a
  schema question, flag it (see Open Questions) rather than silently adding or silently
  omitting it.
- Decide whether "Reinforces" / "New concepts" (§15.2's table columns) are manifest data (surfaced
  in the UI) or authoring-only metadata that stays in CURRICULUM.md and never reaches code. Do
  not add fields "just in case" - only add what a concrete UI surface will read (project
  principle: no speculative schema growth).
- `Difficulty` (`foundational" | "intermediate" | "advanced"`) already exists and maps cleanly
  onto §14's per-part/group defaults - no change expected there.

## Phase 2 - Rebuild `courses["building-blocks"]`

- One `CurriculumSection` per §14 Part/Group (Part 0, Part 1, Part 2, then 3.A-3.G, then a
  Part 4 checkpoints section, OR fold checkpoints into their gating group - decide against
  §23's flat structure, which nests checkpoints inline after the group they gate).
- Every chapter row: `slug`, `number` (e.g. `"3.4"`, `null` for checkpoints), `title`,
  `kind`, `chapterDefinitionId` (see Phase 4), `estimatedMinutes` (the `Est:` field per
  chapter in §14), `difficulty` (per part/group default table in §18.1),
  `prerequisiteSlugs`.
- `prerequisiteSlugs`: strictly sequential within a group (§17's opening line) using the
  previous chapter's slug; cross-group edges follow the §17 mermaid graph exactly (e.g.
  Group E and Group F both gate only on R1, not on each other - the one sanctioned branch,
  same pattern the current manifest already documents for Units 3/4). 1.11 is optional and
  gates nothing - don't list it as anyone's prerequisite.
- R1/R2/R3 gating notes in §14 Part 4 are unusually specific (R1 gates Groups E/F/G + RWE
  Tier 1; R2 gates Tier 2; R3 gates Tier 3 and completes Building Blocks) - transcribe these
  exactly, they're a change from the current three-checkpoint gating.

## Phase 3 - Rebuild `courses["real-world-extraction"]`

- One `CurriculumSection` per tier (5 sections, was 3).
- Tier unlock gates per §15.2's header line for each tier: T1 after R1, T2 after R2, T3
  after R3, T4 after "R3 + any 2 Tier-3 projects", T5 after "any 2 Tier-4 projects".
- **T4/T5 "any N of" gating cannot be expressed by `prerequisiteSlugs` (strict AND)** - this
  is a pre-existing, already-documented gap (see the current manifest's Netflix-entry
  comment, now generalized to every T4/T5 project). Do not invent a workaround schema in
  this pass; carry the same honest comment forward, listing all candidate slugs the way the
  current manifest does for its one example, and leave real "any N of" semantics to whenever
  unlock enforcement actually lands (OPEN_QUESTIONS.md-style trigger, per CURRICULUM §21.1).
- Domain per project is in §15.2's table if Phase 1 decides to keep it.

## Phase 4 - Slug migration and the two dummy definitions

- Read §21.4's v1->v3 mapping table closely - it is the authoritative old-slug -> new-chapter
  mapping. Per-chapter, decide: same slug (content is genuinely the same lesson) or new slug
  + a one-time Dexie progress-row migration (old-slug -> new-slug). This is a per-chapter
  authoring-time decision per §21.4 - do not blanket-apply one policy to all 26 old entries.
- The two entries with real `chapterDefinitionId`s today (`bb-dummy-1` at `1-2-load-balancing`,
  `rwe-dummy-1` at `rwe-1-bitly-url-shortener`) need their `chapterDefinitionId` re-homed onto
  whichever new-map slug now represents that content (per §21.4: v1 1.2 -> v3 3.4 Load
  Balancer; v1 RWE-1 bit.ly -> v3 RWE Tier 1 Bitly, same project). §21.4 explicitly says these
  two "carry no migration weight" as placeholder content, but the slug they're attached to
  still has to resolve correctly post-migration or `manifest.test.ts`'s
  `chapterDefinitionId`-resolution check breaks.
- **Whether any real Dexie migration code is needed at all depends on whether the app has
  live user data on the old slugs yet** - see Open Questions. Don't write a migration
  function speculatively if the answer is "no one has progress rows yet."
- Update the stale code comments §21.4 calls out by name: any comment referencing
  "CURRICULUM.md §10/§13" (manifest.ts's own header, and any other file) now means §17/§23 -
  fix these in the same change, don't leave them dangling.

## Phase 5 - Tests and downstream consumers

- Rewrite `manifest.test.ts`'s hardcoded counts (`26` -> `47` BB entries, `5` -> `32` RWE
  entries) and add coverage for whatever Phase 1-4 actually shipped (e.g. domain field
  present iff RWE, if it lands; every §17 group-gate edge represented).
- Grep for other hardcoded assumptions about the old shape: chapter counts, unit labels
  ("Unit 1" etc.), tier counts, anywhere the Learning Path page or `ChapterSidebar` /
  `ChapterRow` might assume 3 RWE tiers or 6 BB units instead of 7 groups / 5 tiers. Use
  graphify (`graphify explain "CurriculumSection"`) to find every consumer before assuming
  the UI needs no changes - it likely renders section labels generically already, but verify
  rather than assume.

## Design and process requirements

- Git: one branch off the (already-updated) release branch, e.g.
  `chore/curriculum-manifest-migration`. Full local pipeline
  (`npm run typecheck && npm run lint && npm test && npm run build`) green before any push;
  ask before pushing; never merge it yourself.
- After a significant session, spawn the progress-log subagent per root CLAUDE.md. Run
  `graphify update .` after code changes.
- This is a data-only change (no new UI) unless Phase 1's `domain` question resolves to
  "yes, add it and render it" - if so, that's a small `impeccable layout` pass on the
  Learning Path row, not a redesign.

## Definition of done

- `courses["building-blocks"]` has 47 entries matching §14/§23 exactly (numbers, titles,
  slugs, difficulty, estimatedMinutes, prerequisiteSlugs).
- `courses["real-world-extraction"]` has 32 entries across 5 tiers matching §15.2/§23.
- The two authored dummy definitions resolve against their new-map slugs; `manifest.test.ts`
  passes with updated invariants.
- No stale §10/§13 references remain in code comments (§21.4).
- Pipeline green; zero regressions in the existing suite.

## Open questions (resolve with the user before starting the affected phase)

1. **Phase 1:** Does `CurriculumChapter` gain a `domain` field for the RWE chip §15.2
   describes, or is that deferred? Does anything need "Reinforces"/"New concepts" in code,
   or is that authoring-doc-only?
2. **Phase 2:** Does `CurriculumSection` map one-to-one to each §14 Part/Group (7 sections
   for Part 3 alone), or should some collapse for a shorter Learning Path page? Check
   against `.claude/docs/DESIGN.md` / current Learning Path screenshots before deciding.
3. **Phase 4:** Is there live user data (Dexie `curriculumProgress`/`chapterProgress` rows)
   on any current slug that a slug rename would orphan, or is the app still pre-launch
   enough that a straight cutover is safe? This determines whether Phase 4 needs an actual
   migration function or just clean new slugs.
4. **Phase 4:** For each of the 26 current v1 slugs, same-slug-keep vs. new-slug-plus-migration
   is a per-chapter call per §21.4 - work through the mapping table with the user (or Opus's
   content-authoring track) rather than deciding unilaterally chapter-by-chapter.
