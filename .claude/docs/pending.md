# Pending

Live phase-by-phase execution plan for whatever track is *currently* being
built — not an archive. Each track's detailed history lives in
`.claude/PROGRESS_LOG.md` and that track's branch history instead. Clear this
file back to empty once every phase below is done and landed.

## Chapter Reader (intermediate lesson page between Learning Path and Design Editor)

**Why:** insert a documentation-style reading page between the Learning Path
and the canvas, so users read the concept before building it. New flow:
`Home -> Building Blocks/RWE -> Learning Path -> Chapter Reader -> Design Editor`.
Canvas route (`/<mode>/[chapterSlug]`) is explicitly unchanged; the Reader
gets its own `/lesson` sub-route. CTA preview is a live, read-only mini React
Flow render of the chapter's starter graph, not a static mock (both confirmed
with the user). Full plan detail: see this session's approved plan — restated
here phase by phase for tracking.

- [x] **Phase 1 — Lesson content model.** `src/content/chapters/lessons/<chapterId>.md`,
      one file per chapter. `src/content/chapters/lessons.ts` (server-only
      `getLessonMarkdown`, fs-based). `src/chapters/extract-headings.ts` (pure
      heading extractor using `github-slugger`, same engine `rehype-slug`
      already uses so TOC ids match rendered anchors).
- [x] **Phase 2 — Reader route + shared page body.** `src/app/building-blocks/[chapterSlug]/lesson/page.tsx`
      + RWE equivalent, mirroring the existing `[chapterSlug]/page.tsx` guard.
      New `src/chapters/ChapterReader.tsx` (client): SidebarShell + ReaderSidebar
      left, scrollable article center (MarkdownRenderer + CTA), right rail
      (ReadingProgress + TableOfContents). No AppHeader.
- [x] **Phase 3 — Left sidebar (curriculum-only nav).** Extract
      `ChapterNavigator.tsx`'s row list into shared `CurriculumSectionList.tsx`.
      New `ReaderSidebar.tsx` (always-expanded, no collapse toggle). All
      curriculum row links (`ChapterRow.tsx`, `CurriculumSectionList`) point at
      `/<mode>/<slug>/lesson`, reusing `HeldTransitionLink` unchanged.
- [x] **Phase 4 — Reading progress + "On this page" TOC.** `ReadingProgress.tsx`
      (scroll of the article's own container, not window). `TableOfContents.tsx`
      (scrollspy via IntersectionObserver, matches rehype-slug heading ids).
- [x] **Phase 5 — Design Editor CTA + live mini-canvas.** `MiniCanvasPreview.tsx`
      (bare read-only ReactFlow over `chapter.starterGraph`, reusing Canvas.tsx's
      `nodeTypes` and store.tsx's `edgeStyle` — both exported for this). `DesignEditorCTA.tsx`
      wraps it with a "Begin exercise" button on `HeldTransitionLink` -> the
      unchanged canvas route.
- [ ] **Phase 6 — Tests.** New tests for extract-headings, lessons loader,
      ChapterReader, ReaderSidebar/CurriculumSectionList, TableOfContents,
      ReadingProgress, MiniCanvasPreview, DesignEditorCTA still to write.
      `ChapterRow.test.tsx`/`LearningPath.test.tsx`/`ChapterSidebar.test.tsx`
      href assertions were already updated as part of Phase 3 (existing
      assertions on the old href, not new coverage) so the suite stayed
      green through the implementation pass. No expected changes to
      `ChapterWorkspace.test.tsx`/`QuestionPane.test.tsx`.
- [ ] **Phase 7 — Docs.** Add a "Chapter Reader" entry to `DESIGN.md`. Clear this
      file back to empty once everything above lands.

**Verification:** `npm run typecheck && npm run lint && npm test && npm run build`
must exit 0 before any push. Manual click-through of Learning Path -> Reader ->
Begin exercise -> canvas -> question panel, both modes, once the dev server is up.

---

**Separately, still true from the prior track (Learning Path Navigation
Overhaul, Alpha 3.0.0):** all 7 of its phases are done, landed on
`feature/learning-path-page`. Full record:
`.claude/docs/RELEASE_3.0.0_LEARNING_PATH.md` and `.claude/PROGRESS_LOG.md`.
Promoting that branch up through `release/v3.0.0-chapter-content` -> `develop`
-> `main` is still manual review/merge, not tracked here.
