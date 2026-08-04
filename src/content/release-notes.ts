export type ReleaseNote = {
  version: string;
  date: string;
  highlights: string[];
};

/**
 * Most recent first. One entry per release, a handful of short bullets each
 * — this is a changelog, not a commit log, so it records what a user would
 * notice, not every internal change. Read by ReleaseNotesButton.tsx. This
 * whole feature is scoped to the Alpha line (see CLAUDE.md's "Release
 * process & versioning") and should be reconsidered, not just kept running
 * unattended, once the project reaches Beta 1.0.
 */
export const releaseNotes: ReleaseNote[] = [
  {
    version: "3.4.0-alpha",
    date: "2026-08-04",
    highlights: [
      "Vercel deploys are dramatically faster - typecheck, lint, and the full test suite no longer run twice per deploy (once directly, once again inside the build script), cutting build time from around 10 minutes to under a minute. CI already gates all of that on every pull request, so deploys now just build.",
      "The automated test suite grew to 1,443 tests across 178 files with substantially higher coverage across chapters, canvas, quizzes, the validation engine, and AI settings - catching regressions earlier without slowing down deploys.",
    ],
  },
  {
    version: "3.3.0-alpha",
    date: "2026-08-03",
    highlights: [
      "Canvas navigation overhaul: pan with Space+drag or middle-mouse-drag, scroll to pan vertically, Shift+scroll to pan horizontally, and Ctrl/Cmd+scroll or a trackpad pinch to zoom - zoom now stays centered on your cursor instead of drifting.",
      "New keyboard shortcuts: Ctrl/Cmd+plus/minus/0 to zoom in, out, or reset to 100%, and Shift+1 / Shift+2 to fit the whole graph or just your current selection into view.",
      "The keyboard shortcuts reference is now a searchable, sectioned modal instead of a cramped dropdown - open it from the header icon or the new ? shortcut, and search by section (\"navigation\") or by shortcut (\"undo\").",
      "New shortcut: Ctrl/Cmd+/ opens documentation for the selected component directly, no need to reach for the right-click menu.",
    ],
  },
  {
    version: "3.2.0-alpha",
    date: "2026-08-03",
    highlights: [
      "Faster page loads across the app: lesson pages now load up to 60% less code up front, and Sandbox, Building Blocks, and Real World Extraction routes are 40-41% lighter, by deferring the quiz, markdown-rendering, and Deep Check code until you actually open them.",
      "Chapter lessons and component docs now load on demand instead of shipping in every page's bundle.",
      "Canvas now renders 40-50% faster when toggling Highlight Connections or running Validate - all four node types (components, zones, comments, flags) are now memoized, preventing unnecessary re-renders when only some nodes change.",
      "Custom components no longer rebuild their validation schemas on every render - significant speedup when working with multiple user-defined components.",
      "AI provider SDKs (Anthropic, OpenAI, Google, xAI) only load when you actually use Deep Check, not in routes that only show the provider list.",
      "Vercel deployments now only trigger for main, develop, and release/* branches - no more unnecessary preview deployments for feature branches.",
    ],
  },
  {
    version: "3.1.0-alpha",
    date: "2026-08-02",
    highlights: [
      "Learning Path gets a collapse-all control, a search box (filter by title, section, or completion status), a redesigned two-stat completion tracker, and distinct flag-icon styling with R1-R3 numbering for checkpoint chapters.",
      "Chapter Reader now shows prerequisite tags (linking straight to their lesson) and domain badges for Real World Extraction chapters.",
      "Fixed the reading progress bar going stale when diagrams or images resize the page after your last scroll, and fixed 'On this page' dropping numbered headings written as H1s in lesson content.",
      "Manual saves (the Save button or Ctrl+S) now confirm with a brief toast, alongside the existing Saving.../Saved header indicator.",
      "Added a themed custom 404 page.",
      "Replaced em dashes with hyphens across chapter content and UI copy, per house style.",
    ],
  },
  {
    version: "3.0.1-alpha",
    date: "2026-08-02",
    highlights: [
      "Fixed the Home screen's mode-selector cards - corrected icon and heading sizing that made the cards feel cramped, and gave the canvas background grid proper theme-aware contrast in both light and dark mode.",
      "Stabilized the end-to-end test suite: fixed two failing Playwright specs - edge-click interactions on the canvas (React Flow's straight edges have a zero-height hit box that made plain clicks time out) and a race condition where the sandbox's Validate button was checked before the page header finished hydrating.",
    ],
  },
  {
    version: "3.0.0-alpha",
    date: "2026-07-31",
    highlights: [
      "Learning Path - a full-screen curriculum browser for Building Blocks (26 chapters) and Real World Extraction (5 chapters). Navigate chapters by row, track completion progress across all sections, and download the full curriculum as a PDF.",
      "Chapter Workspace now uses route-driven navigation - every chapter has its own URL, so links stay shareable and back/forward work as expected.",
      "In-workspace progress sidebar - see where you are in the learning path without leaving your diagram. Jump to any chapter, check your progress at a glance, and know which chapters unlock next.",
    ],
  },
  {
    version: "2.1.0-alpha",
    date: "2026-07-30",
    highlights: [
      "Release notes now live on the Home page only, instead of following you into Sandbox, Building Blocks, and Real World Extraction.",
    ],
  },
  {
    version: "2.0.0-alpha",
    date: "2026-07-29",
    highlights: [
      "Validation now recognizes correct architectures, not just wrong ones - chapters have a real pass/fail gate driven by reference blueprints, plus a much broader library of structural checks for catching nonsensical designs (disconnected components, backwards data flow, and more).",
      "New: Deep Check - an optional AI-powered design review. Bring your own API key from Anthropic, OpenAI, Google, xAI, or any OpenAI-compatible provider, save multiple named profiles, and get a trade-off-focused critique of your architecture. Your key stays in your browser and is never sent to our servers; Deep Check never decides pass/fail - that's still the deterministic validation engine's job.",
    ],
  },
  {
    version: "1.0.1-alpha",
    date: "2026-07-26",
    highlights: [
      "Fixed a build pipeline bug that was blocking deployments (test suite was picking up a production React build instead of the test build, failing hundreds of component tests).",
    ],
  },
  {
    version: "1.0.0-alpha",
    date: "2026-07-25",
    highlights: [
      "First alpha: Sandbox, Building Blocks, and Real World Extraction modes, a full component registry, live validation with explanations, and local autosave.",
      "Established a formal versioning and release process - this panel will track what changes from here on.",
    ],
  },
];
