# Release 3.1.0 - UI clean-up fixes

Plan of action. Original ask plus findings from a codebase pass before starting
implementation. Each item below gets its own `type/*` branch off
`release/v3.1.0-ui-clean-up-fixes`.

## 0. Branch cleanup - done

- Verified `wip/home-canvas-and-e2e-fixes` (56 commits) and
  `release/v3.0.0-chapter-content` (44 commits) were fully merged into
  `origin/develop` before deleting anything.
- Deleted both, locally and remotely.
- `main` and `develop` are the only branches left, both in sync with origin.
- Cut and pushed `release/v3.1.0-ui-clean-up-fixes` from `develop`.

## 1. Shared about-style modal - done

Corrected direction: kept the centered backdrop+panel modal (the one
`ReleaseNotesButton.tsx` already had, same convention as
`CreateComponentModal.tsx`), extracted as `CenteredModal.tsx`, and rebuilt
`AboutButton.tsx` on it - not the other way around. `DocsModal.tsx` (floating
draggable window) is now unused by both and was deleted. Small.

## 2. Autosave indicator - done

`useAutosave` (`src/persistence/use-autosave.ts`) fires silently on an 800ms
debounce, no UI signal today. Add a small indicator (e.g. "Saved" / "Saving..."
near the header) that appears only around an actual save event, not on every
render. Small-medium. Needs live verification.

## 3. Custom 404 page

No `not-found.tsx` exists anywhere in `src/app`, currently using Next's
default. Add an in-theme `src/app/not-found.tsx`. Small.

## 4. Em dash audit

1128 occurrences across 225 files, but only ~45 are in actual lesson content,
plus a handful in real UI copy (`AboutButton.tsx`'s `ABOUT_TEXT`, release
notes). The rest (~1080) are in code comments/JSDoc, the repo's own
explanatory-comment style. Scope: user-facing text only (chapter markdown + UI
strings), not source comments - "the site" means what renders, not the
codebase. Medium, mostly mechanical, needs care to not touch comments.

## 5. Collapse-all + search on Learning Path - done

`SectionCard.tsx` already has per-section collapse (local `useState`, decision
D5), needs lifting to `LearningPath.tsx` so one control drives all sections.
Search (chapter name / section name / completion status) doesn't exist yet,
new filter UI needed against `course.sections` / `ChapterStatus` from the
progress store. Medium.

## 6. Completion tracker redesign - done

`OverallProgress.tsx` already renders "0/47 chapters * 0/10 sections", this is
a visual/IA redesign, not new plumbing. Good candidate for `/impeccable
polish`. Small-medium.

## 7. Reading progress bar bug - done

`ReadingProgress.tsx`'s scroll-percent math (`scrollTop / (scrollHeight -
clientHeight)`) looks correct on read. It only listens to `scroll` events, no
`ResizeObserver` on content. Leading hypothesis: async-resizing content
(Mermaid diagrams, images in `MarkdownRenderer`) growing the container after
the last scroll event, so the computed max silently drifts. Needs a live
repro to confirm before fixing. Medium.

## 8. Prerequisite/domain tags in Chapter Reader - done

Data already exists: `CurriculumChapter.prerequisiteSlugs` and `.domain` (32
of 79 entries, all RWE, all BB are `null` by design, confirmed in
`manifest.ts`). Needs: a capsule-tag row in `ChapterReader.tsx` linking to
`/{mode}/{slug}/lesson` for each prereq, and a separate tags section for
`domain` (visually distinct, only rendered for RWE). Medium.

## 9. "On this page" not registering `# 1.` headings - root cause found

Not a parser bug. `TableOfContents.tsx` deliberately filters `h.level >= 2`,
assuming lesson markdown never contains an H1. But `ChapterReader.tsx` renders
`chapter.title` as the page's H1 completely outside `<MarkdownRenderer>`, so
any H1 inside lesson markdown is never a duplicate, it's real content the
author intended as a section heading. The uncommitted edit to
`bb-dummy-1.md` reproduces this exactly with 20 `# 1.` / `# 2.` ... headings.
Fix: change the filter to `h.level >= 1` in `TableOfContents.tsx`. Confident,
low-risk. Fold the `bb-dummy-1.md` repro edit into this branch. Small.

## 10. Visual distinction + numbering for checkpoints - done

`CurriculumChapter.kind: "chapter" | "checkpoint"` already exists but
`ChapterRow.tsx` never reads it, checkpoints render identically to chapters.
`entry.number` is `null` for all 3 existing checkpoints today. Needs: a
distinct badge/style for `kind === "checkpoint"` in `ChapterRow.tsx`, and a
numbering scheme (e.g. `R1`, `R2`, consistent with `MILESTONES.md`'s own
checkpoint naming) populated in `manifest.ts`, supporting multiple checkpoints
per section. Medium.

## Suggested order

Quick wins first (3, 1, 9), then mechanical-but-large (4), then the real
plumbing items (5, 10, 8), then the two needing live verification (2, 7),
then polish (6) last, since `/impeccable` benefits from everything else being
settled first.
