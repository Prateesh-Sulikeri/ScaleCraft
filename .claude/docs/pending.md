# Pending

Currently empty — no track is in flight. This file is a live phase-by-phase
execution plan for whatever track is *currently* being built, not an archive;
each track's own detailed history lives in `.claude/PROGRESS_LOG.md` and that
track's branch history instead.

**The Learning Path Navigation Overhaul (Alpha 3.0.0) is done** — all 7 phases
(0-7) landed on `feature/learning-path-page`. Full record:
`.claude/docs/RELEASE_3.0.0_LEARNING_PATH.md` (the engineering plan, now with
every phase's actual outcome noted inline) and `.claude/PROGRESS_LOG.md`'s
entries for this branch.

**Not yet done:** promoting `feature/learning-path-page` up through
`release/v3.0.0-chapter-content` → `develop` → `main` — that's manual review
and merge, not something to plan here. Next in sequence per `MILESTONES.md`:
milestone 7, the first two real Building Blocks chapters (3.1.0) — authored by
writing a `ChapterDefinition` and flipping its curriculum manifest entry's
`chapterDefinitionId` from `null` to the new id (see
`.claude/docs/ARCHITECTURE.md`'s "Curriculum manifest vs. ChapterDefinition").
