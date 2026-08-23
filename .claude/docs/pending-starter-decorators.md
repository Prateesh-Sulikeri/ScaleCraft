# Starter-graph decorators + Reset to Default

**Status: all 11 tasks (T0-T10) complete on `feat/starter-decorators-and-reset`
(off `fix/design-editor-bugs`). Not merged, not pushed - awaiting review.**
**Plan authored by an Opus planning pass; execution by Sonnet, one task at a time,
committing after each completed task (per user direction).**

## Why

Follow-up to the just-closed `pending-design-editor-exercise.md` (starter-graph
layout fix). The user's complaint this round: the newly-tiered starter graphs
"look random and not in sync with ScaleCraft's design language" - real
architecture diagrams have labeled trust-boundary zones and callouts, bare
component cards floating on a grid don't read as a system. Two asks:

1. A **Reset to Default** button in the BB/RWE top bar, putting the canvas back
   to the chapter's authored starter graph.
2. **Decorators in the starter graph itself** - zones and comments, named and
   colored by client/server/data demarcation, authored into the graph the
   learner starts from.

A full node-card visual redesign is explicitly **out of scope** - deferred by
the user to a future session. This pass only uses the zone/comment/flag
annotation system exactly as it exists today (`src/canvas/ZoneNode.tsx`,
`CommentNode.tsx`, `annotation-colors.ts`) - it was already fully built and
shippable, just never used in any authored `starterGraph`.

## Locked decisions (T0)

Resolved directly with the user before any code was written:

1. **Gap zone**: **include it.** A pink ("Zone Magenta", `#ff3483`) zone marks
   where the learner's fix belongs, in addition to the client/server/data tier
   zones. Accepted tradeoff: this is slightly more directive than the
   brief-calibration rule from the last session, but the user chose it
   explicitly over the more conservative "skip it" option.
2. **Zone locking**: authored zones ship **locked** (`locked: true`). Prevents
   accidental drags of a decorative boundary; the unlock control is still
   available on selection.
3. **Reset button icon**: a **distinct icon**, not `RotateCcw` (already used by
   `BoardMenu`'s "Restore last save" one menu-item away - reusing it would read
   as the same action).
4. **Commit cadence**: commit after each completed task below, same as the
   prior session.
5. **Reset does not touch `chapterProgress`** - unchanged from the existing
   `handleResetToStarter` behavior (see its doc comment in
   `ChapterWorkspace.tsx`). Silently un-passing a chapter from a reset button
   would be a surprise; completion has its own explicit reset on the Learning
   Path.

## Schema decision

`starterDecorators?: StarterDecorator[]` as a **new, separate field** on
`ChapterDefinition`, sibling to `starterGraph`, not inside `ArchitectureGraph`.

Reasoning: `ArchitectureGraph` (`src/lib/graph.ts`) is consumed by
`evaluateChapter`, the validation engine, blueprint matching, and
`ai/prompt.ts`'s payload builder - every one of those iterates `graph.nodes`
expecting a `componentId`. Folding decorators into `ArchitectureGraph` would
force a decorator-skip branch into all of them for zero domain benefit.
`toArchitectureGraph` already drops non-component canvas nodes on the way
*out* (so a learner's own zones never reach validation) - decorators authored
*in* should follow the same boundary symmetrically.

`StarterDecorator` is a small authored union (zone/comment/flag), not raw
React Flow `AnyNodeType` objects - keeps chapter authoring terse. A
`toDecoratorNodes()` helper stamps the React Flow shape (`type`, `zIndex: -1`,
`locked` default) at load time.

## Decorator authoring convention

**Palette** - reuse `ANNOTATION_COLOR_PRESETS` (`src/canvas/annotation-colors.ts`),
not `category-colors.ts`. A zone tinted with a component's own category color
would visually blend into the cards inside it; decorators are a distinct
overlay layer and should look like one.

| Demarcation | Preset | Hex |
|---|---|---|
| Client / edge tier | Blue | `#3b82f6` |
| Server / application tier | Purple | `#a855f7` |
| Data tier | Emerald | `#10b981` |
| Gap zone ("build here") | Pink (Zone Magenta) | `#ff3483` |
| Comments | Slate | `#64748b` |

Amber is reserved/unused this pass.

**Zone vs. comment**: a zone names a tier or trust boundary that already has
at least one component in it, or is the explicit gap zone. A comment carries
one short constraint or observation that isn't a grouping ("all traffic here
is HTTPS") - at most 2 per chapter, never restating `exerciseGoal`, never
naming a component the learner still has to add (same spoiler rule as
`authoring-invariants.test.ts`'s existing brief gate). Flags are not used in
starter graphs this pass.

**Geometry** against the existing 320x160 tiered layout (card 200x65): for a
tier row with `cols` columns starting at `(x0, y0)`:

```
position = { x: x0 - 28, y: y0 - 48 }
width    = 320 * (cols - 1) + 200 + 56
height   = 65 + 48 + 24   // = 137
```

48px top pad clears the zone's own label input without covering the first
card; 24px bottom pad leaves ~23px between vertically adjacent tier zones at
the 160 pitch. Zones never overlap each other or a card, and never enter
`starterGraph.nodes` - the existing spacing/aspect gates from the last session
are untouched by construction.

## Chapter scope

**All 13 chapters that have a `starterGraph`** - verified there are only 14
`starterGraph` entries total in `src/content/chapters/index.ts` (0.1, 1.2,
3.1-3.9, 3.11, 3.12, plus `rwe-dummy-1`, which is thrown away). So "pilot set"
and "full set" are the same 13 chapters from the prior session - no separate
scope decision needed. 0.1/1.2/3.1/3.2 have small graphs and may warrant only
one or two zones; author judgment, not a mandate to force three tiers onto a
two-node graph.

## Task list

- [x] **T0.** Lock decisions above with the user; write this doc. Commit alone.
- [x] **T1.** `src/content/chapters/starter-decorators.ts`: `StarterDecorator`
      union + `toDecoratorNodes()`. `starterDecorators?` field on
      `ChapterDefinition` (`types.ts`). Typecheck only, no consumers yet.
- [x] **T2.** `loadGraph`/`resetGraph` in `store.tsx` take an optional second
      `decorators?: AnyNodeType[]` arg, appended after mapped component nodes.
      Wire both `ChapterWorkspace.tsx` call sites (initial-load reconcile,
      `handleResetToStarter`). Store tests added (4 new, 42/42 passing).
- [x] **T3.** `onResetToStarter` prop on `AppHeader`; render the two-click-arm
      confirm button after `BoardMenu`, distinct `RefreshCw` icon. Pass from
      `ChapterWorkspace.tsx`.
- [x] **T4.** `ChapterWorkspace.test.tsx`/`AppHeader.test.tsx` reset-button
      coverage. In-browser verified via Playwright with a fresh no-saves
      account on BB 0.1 and RWE `rwe-t1-bitly-url-shortener`: button renders
      in both modes, arms on first click, fires+disarms on second.
- [x] **T5.** Author decorators for the small graphs: 0.1, 1.2, 3.1, 3.2.
- [x] **T6.** Author decorators for 3.3-3.9.
- [x] **T7.** Author decorators for 3.11, 3.12.
- [x] **T8.** `authoring-invariants.test.ts`: id-uniqueness, zone/zone
      non-overlap, palette-membership, spoiler-gate gates for decorators.
      23/23 passing (4 new).
- [x] **T9.** In-browser verification pass across all 13 chapters via
      Playwright (forcing Reset to Default first on each, to bypass stale
      pre-decorator saves left on the shared test account by earlier
      verification passes): every chapter's card/zone/comment counts match
      the authored decorators exactly. Screenshot review of 3.12 (widest
      layout, lowest fitView zoom at 0.66), 3.5 (has a gap zone), and 0.1
      (simplest) in both themes - zones and comments render legibly, no
      zone covers a card or an edge label, the pink gap zone on 3.5 sits
      exactly in the empty slot without naming what belongs there.
- [x] **T10.** Docs: `CURRICULUM.md` new §11.6 (decorator convention table +
      geometry formula), `DESIGN.md`'s Zone section (palette paragraph),
      `pending-chapters.md` dated cross-cutting ledger entry, chapter-author
      skill (`SKILL.md`'s `definition` scope list, `author.md`'s scope table
      + a new starterDecorators paragraph), `docs/CHAPTER_AUTHORING.md`'s
      manual field checklist.
