# Responsive site + Design-Editor-only size gate

Release **7.1.0-alpha**. Branch **`feat/size-changes`**, cut from
`staging/v7.1.0-progress-reset`.

Status: **Phase 1 landed** (commit 8f818ae) - decisions D1-D3 taken as
recommended (gate moved to the whole `(protected)` group, thresholds
unchanged, 360px floor). Confirmed via curl against the dev server (no
browser tool available in this session) - a real DevTools pass at
360/390/768/1024/1280/1920 is still owed before this ships. Phase 2 (shared
breakpoint contract, `useIsNarrow()`/`<MobileDrawer>` helpers) next.

## The product call

Today `src/app/layout.tsx` wraps the **entire app** in `<ScreenSizeGate>`.
Anything under 1024px (mouse-primary) or 768px (touch-primary) gets a dead-end
"ScaleCraft needs a larger screen" screen with no way forward. That is wrong
for everything except the canvas: reading a lesson, browsing the Learning Path,
checking progress on Home, taking an exam, and filing a bug are all things a
phone can do perfectly well.

After this work:

- **The Design Editor (canvas) keeps a hard size gate.** Drag-to-place,
  edge-drawing, and node config genuinely do not work at phone width, and
  making them work is not this release.
- **Every other surface renders at any width, down to 360px.** Which means the
  rest of the site has to actually become responsive, because most of it has
  never been laid out for a narrow viewport.

Scale of the change: only **20 of 166** non-test `.tsx` files currently use any
responsive prefix at all. Assume a surface is not responsive unless it appears
in the "already responsive" list in Phase 3.

## Phase 0 - decisions needed

**D1. Which routes keep the gate?** *(recommendation: the whole `(protected)`
group)*

`src/app/(protected)/` already contains exactly the canvas surfaces and nothing
else:

| Route | Component |
|---|---|
| `(protected)/building-blocks/[chapterSlug]` | `ChapterWorkspace` |
| `(protected)/real-world-extraction/[chapterSlug]` | `ChapterWorkspace` |
| `(protected)/sandbox` | Sandbox canvas |
| `(protected)/dev/blueprint-lab` | canvas dev tool |
| `(protected)/dev/walkthrough-lab` | canvas dev tool |
| `(protected)/dev/diagram-question-lab` | canvas dev tool |

So the gate can move from the root layout to `(protected)/layout.tsx` in one
edit, with no per-page wiring and no risk of a new canvas route forgetting it.
The group's existing docstring already calls it "pages that are exercises, not
reading" - the size gate has the same boundary as the auth gate by
construction.

Risk to note: if a future non-canvas page is added under `(protected)` it
inherits a gate it does not want. Acceptable; the alternative (a
`<DesignEditorGate>` each canvas page opts into) is easy to forget the other
way, which fails open.

**D2. Do the thresholds change?** *(recommendation: no)*

Keep `TABLET_MIN_WIDTH = 768` / `DESKTOP_MIN_WIDTH = 1024` and the
coarse/fine-pointer split in `src/lib/use-large-screen.ts` exactly as they are.
The logic there is sound and well-reasoned; only its *scope of application*
is wrong. Do not touch the hook's behaviour in this release.

**D3. Bottom breakpoint?** *(recommendation: 360px)*

360px is the practical floor (iPhone SE / small Android). Below that, allow
horizontal scroll rather than adding another tier. Target widths to verify
against: **360, 390, 768, 1024, 1280, 1920**.

## Phase 1 - relocate the gate

1. `src/app/layout.tsx`: remove the `ScreenSizeGate` import and unwrap its
   children. `LocalStateGate` / `ResetOnSignOut` / `FlushDirtyRows` /
   `RefreshFromCloud` stay where they are, now unwrapped.
2. `src/app/(protected)/layout.tsx`: it is a server component (`await
   auth.protect()`), so wrap `{children}` in `<ScreenSizeGate>` as a client
   child. No `"use client"` on the layout itself.
3. Rewrite the blocked screen in `src/app/ScreenSizeGate.tsx`. It is currently
   a dead end, which was defensible when nothing else rendered. Now it is not:
   the reader, the Learning Path, and Home all work at that width. It needs
   - copy scoped to the editor, not the app ("The Design Editor needs a larger
     screen", not "ScaleCraft needs...");
   - a link to the same chapter's **lesson** route where one exists
     (`/{mode}/{chapterSlug}/lesson`) - the reader is the useful thing to do on
     a phone, and it is the same chapter;
   - a link back to the Learning Path and to Home;
   - the existing `current width / minimum` diagnostic line, kept.
   The gate does not know the chapter slug today. Either read it from
   `useParams()` (it is a client component under a `[chapterSlug]` route) or
   accept an optional prop. `useParams()` is fewer moving parts.
4. `src/app/ScreenSizeGate.test.tsx`: the four existing cases still hold
   (pass-through / blocked-narrow / blocked-coarse / allowed-tablet); update
   the expected heading string and add a case asserting the escape links
   render.
5. `src/app/ShortcutsModal.tsx:125` has a stale comment ("Below 768 the app
   doesn't render at all"). Fix it; the `columnCount` logic itself is fine and
   becomes genuinely load-bearing once the modal can open at 400px.

Ship Phase 1 on its own and confirm it in a browser before starting Phase 3.
After it lands, every non-canvas route renders at 390px - badly. That is the
expected intermediate state and the input to the rest of the work.

## Phase 2 - the shared contract

Tailwind v4 (`@tailwindcss/postcss` ^4), no `tailwind.config`; theme tokens
live in `@theme inline` in `src/app/globals.css`.

- **Use stock breakpoints** (`sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280). Do
  not add named breakpoint tokens. The two arbitrary ones already in the tree
  (`min-[1800px]`, `min-[2200px]`, `min-[2560px]`) are *large*-display step-ups
  and are unaffected by this work - leave them.
- **Mobile-first only.** Write the narrow layout as the base class and add
  `md:` / `lg:` for wider. Do not write `max-md:`; mixing the two directions
  across 100+ files is how this becomes unreviewable.
- **The app shell stays fixed-viewport.** `body` is `h-full overflow-hidden`
  (see the long comment in `src/app/layout.tsx`) and each page owns its own
  scroll region. Do not change that to `min-h-full` to "fix" a narrow layout;
  fix the region instead.
- **Anything that cannot shrink scrolls in its own `overflow-x-auto`
  container** (wide tables, the release-notes grid, code blocks). The page body
  must never scroll horizontally.
- **Tap targets 44px minimum** on the icon-only header controls once they are
  reachable by touch.

Two structural helpers are worth adding once, in Phase 2, rather than
re-solving per surface:

- A **`useIsNarrow()`** hook (or reuse `useViewportWidth()` from
  `src/lib/use-large-screen.ts`) for the handful of places that need a real
  JS branch rather than a CSS one - specifically the sidebar-to-drawer swaps
  in Phase 3.
- A **`<MobileDrawer>`** shell for the three fixed-width `<aside>` sidebars
  that all need the same off-canvas treatment (reader nav, reader ToC, Learning
  Path filters). Slide-in panel + backdrop + Escape to close. Reuse
  `useEscapeKey` and `useBodyScrollLock`, which `CenteredModal` already uses.

## Phase 3 - surface inventory

Ordered by user-facing importance. Each item is independently shippable; commit
per surface.

### 3.1 Global chrome

| File | Problem | Target |
|---|---|---|
| `src/home/HomeHeader.tsx:66` | Brand + `HOME_NAV` + 3 icon controls all in one non-wrapping row | Below `md`, collapse the `<nav>` into a menu button; keep brand and the control cluster |
| `src/home/layout.ts` | `HOME_CONTAINER` is `px-6` at every width | `px-4 md:px-6` |
| `src/learning-path/layout.ts` | `LEARNING_PATH_CONTAINER` same | same |
| `src/home/HomeFooter.tsx:27` | already `flex-wrap`, likely fine | verify only |
| `src/app/AppHeader.tsx:136` | Workspace header: brand + undo/redo + Validate/Submit + tools, no wrapping | **Gated surface.** Leave alone unless it breaks at 1024 |

### 3.2 Home dashboard

`src/home/HomeDashboard.tsx` and children. Partly done already - `ModeSection`
is `md:grid-cols-2 lg:grid-cols-3`, the activity/stats row is `lg:grid-cols-[...]`,
and `HomeHero`, `AtAGlanceCard`, `AlphaAnnouncement` carry some prefixes.

Remaining:
- `src/home/AllActivityModal.tsx:65` - `w-56` fixed sidebar inside a
  `size="full"` modal. Stack the two columns below `md`.
- `src/home/ActivityModeDonut.tsx`, `ActivityRow.tsx`, `RecentActivityCard.tsx`
  - verify at 360px, they are untouched.
- `src/home/FeedbackSurveyModal.tsx` (677 lines) - has some prefixes; audit the
  whole form at 390px.

### 3.3 Learning Path

`src/learning-path/` (18 components). `LearningPath.tsx` already has
`lg:flex-row`, `lg:grid-cols-[minmax(0,1fr)_300px]`, `lg:sticky`. So the
two-column split degrades to stacked correctly. What does not:

- `LearningPath.tsx:178` - `w-full lg:w-80` search is fine; the sibling
  "Collapse all" / "Reset progress" buttons in the same row are `shrink-0` and
  will overflow at 360px. Wrap them.
- `src/learning-path/CourseStats.tsx:104` - `grid-cols-2 sm:grid-cols-4
  xl:w-[460px]`, probably fine, verify.
- `src/learning-path/ChapterRow.tsx` - the densest row in the app (number,
  title, difficulty dots, status, actions). Needs a real narrow layout, not a
  wrap. Highest-effort item in 3.3.
- `src/learning-path/BlueprintGlobe.tsx`, `BlueprintCube.tsx`,
  `blueprint-geometry.tsx` - decorative SVG geometry. Check they scale or hide
  below `md` rather than forcing width.
- `src/learning-path/ResetProgressDialog.tsx`, `SectionCard.tsx`,
  `UpNextCard.tsx`, `CourseHeader.tsx` - audit.

### 3.4 Chapter Reader (highest value on mobile)

`src/chapters/ChapterReader.tsx` is a three-column shell:

```
<aside className="flex w-60 shrink-0 ...">        // line 97, chapter nav
<div className="... flex-1 overflow-y-auto">      // article
  <div className="mx-auto max-w-2xl px-6 py-10 min-[1800px]:max-w-5xl">
<aside className="hidden w-56 ... xl:flex">       // line 190, ToC + controls
```

- The left `w-60` nav (`ReaderSidebar.tsx`) must become a drawer below `lg`.
- The right ToC aside is already `hidden ... xl:flex` - **but** it also holds
  `ReportBugButton`, `ThemeToggle`, and `AppUserButton`, which therefore
  disappear entirely below `xl`. That is a live bug today at 1280px and must be
  fixed as part of this: those three controls need a home that exists at every
  width.
- Article column: `px-6 py-10` to `px-4 py-6 md:px-6 md:py-10`.
- Prose content is the real test. Audit
  `src/canvas/docs-panel/markdown/MarkdownRenderer.tsx` and the MDX components
  for tables, code blocks, and images at 360px - each needs
  `overflow-x-auto` or `max-w-full`.
- `src/chapters/walkthrough/` (6 components) - interactive step diagrams,
  fixed-geometry by nature. Decide per component: scale down, or wrap in a
  horizontally scrollable container with a "best viewed wider" note. Do **not**
  gate them; they are reading content.
- `src/chapters/ReadOnlyGraphSummary.tsx` - static graph render inside the
  lesson, same treatment.
- `src/chapters/YourTurnCard.tsx` - the launcher into the gated editor. It
  should still render on mobile, with the editor CTA showing why it is
  unavailable rather than leading to the block screen.
- `src/chapters/TableOfContents.tsx`, `NextChapterLink.tsx`,
  `CurriculumSectionList.tsx`, `Debrief.tsx`, `glossary/` - audit.

### 3.5 Exams and quizzes

`src/chapters/exam/` (5) + `src/chapters/quiz/` (8). `ExamShell.tsx:126` is a
full-screen fixed portal with `px-6 py-8` and `mx-auto max-w-2xl`, which is
close to workable already.

- `ExamShell.tsx` - `px-4 md:px-6`; verify the sticky footer control row
  (line 171) at 360px.
- `ExamConfirmSubmitDialog.tsx:29` - `w-80 max-w-full`, fine.
- `ExamResults.tsx` - score / pass line / attempt count layout, audit.
- Quiz question bodies - **the diagram-question type is the risk.** If a
  question renders a graph the learner must read to answer, it cannot simply be
  squeezed. Audit `src/chapters/quiz/` and flag any question type that is
  genuinely unusable narrow; that is a Phase 0 follow-up decision, not a
  guess to make silently.

### 3.6 Modals and popovers

`src/app/CenteredModal.tsx:32` - all four sizes are effectively desktop-fixed:

```
default:  "max-h-[95vh] w-[1020px]"        // no max-w at all, overflows below 1020px
wide:     "max-h-[85vh] w-[min(1200px,94vw)]"
viewport: "h-[min(940px,95vh)] w-[min(1340px,96vw)]"
full:     "h-[88vh] w-[min(1320px,94vw)]"
```

`default` is the one that breaks hardest. Fix it to
`w-[min(1020px,94vw)]`, and give every size a narrow-width behaviour (a
near-full-screen sheet below `sm` is usually right). This one edit fixes every
dialog built on the shell at once, so do it before auditing individual dialogs.

Then audit the fixed-width popovers, which are portaled/absolute and can push
off-screen at 360px:
`src/app/ProjectMenu.tsx:98` (`w-64`), `src/app/BoardMenu.tsx:97` (`w-56`),
`src/app/ModeBadge.tsx:54` (`w-72`), `src/app/ValidationIndicator.tsx:116`
(`w-96`), `src/canvas/DeleteConfirmPopover.tsx:36` (`w-64`),
`src/canvas/ContextMenu.tsx:128` (`min-w-[180px]`),
`src/auth/AuthPromptDialog.tsx:29` (`w-80 max-w-full`, already fine).
The canvas ones are inside the gate and are lower priority, but
`ValidationIndicator` and the menus also appear in reader/exam chrome.

`src/tour/TourOverlay.tsx:700` already uses
`w-80 max-w-[calc(100vw-2rem)]` - that is the pattern to copy.

### 3.7 Bug reporting

`src/bugs/` (8 components). `BugForm.tsx` and `BugDetailsView.tsx` already have
prefixes. Remaining: `BugList.tsx`, `BugChips.tsx`, `ImageAttachField.tsx`,
`ReportBugModal.tsx`. Filing a bug from a phone is a real use case, so this is
not optional polish.

### 3.8 Auth and error pages

`src/app/sign-in`, `src/app/sign-up` (Clerk-rendered, mostly responsive already
- verify the wrapper), `src/app/not-found.tsx` (already has prefixes),
`src/app/LoadingTransition.tsx`, `src/app/PageEnter.tsx`.

### 3.9 Explicitly out of scope (behind the gate)

`src/canvas/` (21 components), `src/chapters/ChapterWorkspace.tsx`,
`src/chapters/ChapterSidebar.tsx`, `src/chapters/QuestionPane.tsx`,
`src/app/AppHeader.tsx`, `src/app/SidebarShell.tsx`, `src/app/DeepCheckPanel.tsx`,
`src/tour/`, `src/app/(protected)/dev/*`. Touch these only if something breaks
at exactly 1024px, the new floor for the gated surfaces.

## Testing

- **Unit (vitest).** Update `src/app/ScreenSizeGate.test.tsx` per Phase 1. The
  existing `src/lib/use-large-screen.test.ts` should need no changes - the hook
  is unmodified. Do not write unit tests that assert Tailwind class strings;
  they test nothing and break on every refactor.
- **e2e (Playwright).** `playwright.config.ts` runs a single `Desktop Chrome`
  project with `storageState: "e2e/.auth/user.json"`. Add **one** mobile
  project (`devices["Pixel 7"]` or an explicit 390x844 viewport) running a
  **new, small** spec - not the existing suite. That spec should cover: Home
  renders, Learning Path renders and a chapter is reachable, the lesson reader
  renders and the drawer nav opens, and the Design Editor route shows the block
  screen with a working link back to the lesson.
  Do **not** add mobile runs of `canvas-interactions`, `design-editor-integration`,
  `custom-components`, or `sandbox-persistence`; those exercise gated surfaces.
  Note the existing systemic issue in `.claude/docs/pending-e2e-quarantine.md`
  (~106 `if (count > 0)` guards that pass having asserted nothing) - do not
  write the new spec in that style.
- **Manual.** Chrome DevTools device toolbar at 360 / 390 / 768 / 1024 / 1280 /
  1920, both themes, every surface in Phase 3. This is the real acceptance
  check; the e2e spec is a regression net, not coverage.
- **CI.** `npm run typecheck && npm run lint && npm test && npm run build` at
  session end. Per CLAUDE.md, not after every surface.

## Acceptance criteria

1. Every route except `(protected)/*` renders and is usable at 360px wide, in
   both themes, with no horizontal page scroll.
2. `(protected)/*` shows the editor block screen below the existing thresholds,
   and that screen offers a working route to the chapter's lesson, the Learning
   Path, and Home.
3. No behaviour change at 1280px+ on any surface. This work adds narrow
   layouts; it does not redesign the desktop one.
4. `src/lib/use-large-screen.ts` is unchanged.
5. Reader controls (`ReportBugButton`, `ThemeToggle`, `AppUserButton`) are
   reachable at every width, closing the current below-`xl` disappearance.
6. CI green.

## Docs to update when this lands

- `DESIGN.md` (root) - add a "Responsive" section: the breakpoint contract from
  Phase 2, the mobile-first rule, and the gated-vs-open surface split.
- `.claude/docs/MVP_SCOPE.md` - it currently records the "Desktop-first, mobile
  deferred" call that both `ScreenSizeGate.tsx` and `use-large-screen.ts` cite
  in their docstrings. Narrow that call to the Design Editor.
- `src/content/release-notes.ts` - a 7.1.0-alpha entry, written to
  `.claude/docs/RELEASE_NOTES.md`'s contract (enforced by
  `src/content/release-notes.test.ts`).
- This file - keep the Status line current as phases land.
