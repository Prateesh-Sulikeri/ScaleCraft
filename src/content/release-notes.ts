/** Which glyph a highlight gets on the release slide. A string key rather than
 *  a lucide component, so this content file stays free of UI imports - the
 *  modal owns the mapping (see ReleaseNotesModal.tsx's HIGHLIGHT_ICON). */
export type ReleaseIconName =
  | "ai"
  | "auth"
  | "canvas"
  | "component"
  | "content"
  | "docs"
  | "fix"
  | "hint"
  | "navigation"
  | "performance"
  | "polish"
  | "progress"
  | "quiz"
  | "sync"
  | "validation";

/** One headline change: a short label and a single sentence saying what it
 *  does for the reader. */
export type ReleaseHighlight = {
  title: string;
  body: string;
  icon: ReleaseIconName;
};

export type ReleaseNote = {
  version: string;
  date: string;
  /** The release in one line, used as the slide's headline. */
  title: string;
  /** Three to four at most - anything smaller belongs in `qualityOfLife`. */
  highlights: ReleaseHighlight[];
  /** Fixes and small wins, one clause each. Omitted when a release has none. */
  qualityOfLife?: string[];
};

/**
 * Most recent first. One entry per release - this is a changelog, not a commit
 * log, so it records what a user would notice, not every internal change.
 *
 * **Do not write an entry from scratch. Follow `.claude/docs/RELEASE_NOTES.md`**
 * - it is the authoring contract (what a title, a highlight, and a
 * quality-of-life line each are, with limits and worked examples). The
 * mechanical half of that contract is enforced by `release-notes.test.ts`, so
 * an entry that ignores it fails CI rather than shipping off-pattern.
 *
 * Read by ReleaseNotesModal.tsx (one release per slide) and release-info.ts
 * (the latest version, and the Home "New" marker).
 *
 * This whole feature is scoped to the Alpha line (see CLAUDE.md's "Release
 * process & versioning") and should be reconsidered, not just kept running
 * unattended, once the project reaches Beta 1.0.
 */
export const releaseNotes: ReleaseNote[] = [
  {
    version: "7.0.0-alpha",
    date: "2026-08-17",
    title: "Home knows where you left off.",
    highlights: [
      {
        title: "Home is a dashboard now",
        body: "One Continue Learning button picks up the exact chapter you left unfinished, with per-mode progress beside it.",
        icon: "progress",
      },
      {
        title: "Your full activity history",
        body: "View all activity opens everything you've done, split across Building Blocks, Real World Extraction, and Sandbox.",
        icon: "navigation",
      },
      {
        title: "Learning Path header, rebuilt",
        body: "The course illustration, overall progress, and four figures at a glance: chapters, sections, progress, and day streak.",
        icon: "content",
      },
      {
        title: "Up next, in two places",
        body: "A new card opens the chapter you should do next, and marks that row in the list so Home and the path always agree.",
        icon: "component",
      },
    ],
    qualityOfLife: [
      "Filter the curriculum by status alongside search",
      "Collapsed parts show a title and completion count",
      "Chapter rows are clickable across their whole width",
      "Each course keeps its own accent colour throughout",
    ],
  },
  {
    version: "6.1.1-alpha",
    date: "2026-08-17",
    title: "Saves that wait for your session.",
    highlights: [
      {
        title: "No more phantom sign-in errors",
        body: "Mark-complete and quizzes clicked right after a page load now wait for your session instead of failing silently.",
        icon: "auth",
      },
      {
        title: "Wider lessons on wide displays",
        body: "Lesson text uses the extra room past 1080p rather than holding a laptop-width column. Smaller screens are unchanged.",
        icon: "docs",
      },
    ],
    qualityOfLife: ["On this page no longer highlights Knowledge check before you scroll"],
  },
  {
    version: "6.1.0-alpha",
    date: "2026-08-16",
    title: "Read without an account. Sync across devices.",
    highlights: [
      {
        title: "Reading is public",
        body: "Browse the Learning Path and any lesson signed out. An account is only needed to save progress, take quizzes, or open Sandbox.",
        icon: "auth",
      },
      {
        title: "Progress follows you",
        body: "Progress and custom components sync automatically, and refresh when you switch back to an already-open tab.",
        icon: "sync",
      },
      {
        title: "One sign-in prompt everywhere",
        body: "Sandbox now asks you to sign in the same way quizzes and mark-complete do, instead of bouncing you to a sign-in page.",
        icon: "component",
      },
      {
        title: "Sync conflicts are visible",
        body: "On the rare occasion an edit loses to a newer change from another device, a small indicator says so rather than nothing.",
        icon: "validation",
      },
    ],
    qualityOfLife: [
      "Signing out clears progress from the screen immediately",
      "Eleven old chapter links redirect instead of 404ing",
    ],
  },
  {
    version: "6.0.0-alpha",
    date: "2026-08-12",
    title: "Accounts arrive.",
    highlights: [
      {
        title: "Sign in to use ScaleCraft",
        body: "Your first visit now goes to a sign-up or sign-in screen before you reach the canvas.",
        icon: "auth",
      },
    ],
  },
  {
    version: "5.0.1-alpha",
    date: "2026-08-12",
    title: "Chapters open without the flash.",
    highlights: [
      {
        title: "Lessons preload on hover",
        body: "Content starts loading the moment you hover a chapter link, so it's ready by the time the hold animation finishes.",
        icon: "performance",
      },
    ],
  },
  {
    version: "5.0.0-alpha",
    date: "2026-08-11",
    title: "Lessons you can step through.",
    highlights: [
      {
        title: "Interactive step-by-step diagrams",
        body: "Walk a real request from client to load balancer to app server one step at a time, and toggle the routing strategy as you go.",
        icon: "canvas",
      },
      {
        title: "3.4 Load Balancer, in full",
        body: "Routing, health checks, round-robin against least-connections, and when a second instance earns its keep.",
        icon: "content",
      },
      {
        title: "Definitions without leaving the page",
        body: "Tap or hover an underlined term for a short definition inline - the start of a growing glossary.",
        icon: "docs",
      },
      {
        title: "Lessons compile ahead of time",
        body: "Markdown is built once rather than parsed in your browser on every open, making room for richer content later.",
        icon: "performance",
      },
    ],
  },
  {
    version: "4.1.1-alpha",
    date: "2026-08-10",
    title: "Reader housekeeping.",
    highlights: [
      {
        title: "On this page tracks the right chapter",
        body: "No more leftover section from the chapter you just left, and Knowledge check now sits where it actually appears.",
        icon: "navigation",
      },
      {
        title: "One Your turn card",
        body: "The quiz and design exercise share a single card at the end of a chapter, each row turning green once it's done.",
        icon: "quiz",
      },
    ],
  },
  {
    version: "4.1.0-alpha",
    date: "2026-08-10",
    title: "Six chapters, and an exit from every dead end.",
    highlights: [
      {
        title: "Unit 1, start to finish",
        body: "1.1 through 1.6 run one continuous URL-shortener case study, and 1.6 brings the unit's first canvas build exercise.",
        icon: "content",
      },
      {
        title: "Next chapter, wherever you finish",
        body: "A pagination card, a sidebar link, and a one-time completion toast in the canvas - all three used to dead-end.",
        icon: "navigation",
      },
      {
        title: "Guided tour reliability pass",
        body: "The tour pauses on tab or focus loss, stays in sync across tabs, and completes its gated steps in any order.",
        icon: "hint",
      },
    ],
    qualityOfLife: [
      "EdgeInspector, zoom controls, and the tour card no longer overlap",
      "Sidebar links are clickable across the whole row",
      "Chapter Reader's sidebar carries the logo, linking home",
      "Tour copy matches the current pan and zoom controls",
    ],
  },
  {
    version: "4.0.0-alpha",
    date: "2026-08-07",
    title: "Validate checks. Submit grades.",
    highlights: [
      {
        title: "Two separate steps",
        body: "Validate reads structure only, with no completion pressure. Submit adds the chapter's target architecture and names what's missing, extra, or mismatched.",
        icon: "validation",
      },
      {
        title: "A guided first chapter",
        body: "0.1 opens on a broken diagram and walks you through diagnosing it. Esc pauses instead of dismissing, and a reload resumes where you were.",
        icon: "hint",
      },
      {
        title: "Two new chapters",
        body: "0.1 Welcome to ScaleCraft, and 0.2 What is System Design? - a canvas-free primer on latency, throughput, availability, durability, and cost.",
        icon: "content",
      },
      {
        title: "Start over",
        body: "Resets a chapter to its starter graph, discarding the save and undo history, from the sidebar rather than a pill covering the canvas.",
        icon: "canvas",
      },
    ],
    qualityOfLife: ["Concept chapters with no diagram complete on their quiz alone"],
  },
  {
    version: "3.4.0-alpha",
    date: "2026-08-04",
    title: "Deploys in under a minute.",
    highlights: [
      {
        title: "CI stopped running twice per deploy",
        body: "Typecheck, lint, and the test suite no longer run directly and again inside the build - roughly ten minutes down to under one.",
        icon: "performance",
      },
      {
        title: "1,443 tests across 178 files",
        body: "Substantially broader coverage across chapters, canvas, quizzes, the validation engine, and AI settings.",
        icon: "polish",
      },
    ],
  },
  {
    version: "3.3.0-alpha",
    date: "2026-08-03",
    title: "Canvas navigation, rebuilt.",
    highlights: [
      {
        title: "Pan and zoom that behave",
        body: "Space or middle-mouse to pan, scroll to pan vertically, Shift+scroll horizontally, and Ctrl/Cmd+scroll to zoom on your cursor.",
        icon: "canvas",
      },
      {
        title: "Zoom and fit shortcuts",
        body: "Ctrl/Cmd with plus, minus, or 0 to zoom or reset, and Shift+1 or Shift+2 to fit the whole graph or just your selection.",
        icon: "navigation",
      },
      {
        title: "A searchable shortcuts reference",
        body: "A sectioned modal instead of a cramped dropdown - search by section or by the shortcut itself.",
        icon: "docs",
      },
    ],
    qualityOfLife: ["Ctrl/Cmd+/ opens documentation for the selected component"],
  },
  {
    version: "3.2.0-alpha",
    date: "2026-08-03",
    title: "Lighter pages, faster canvas.",
    highlights: [
      {
        title: "Up to 60% less code up front",
        body: "Lesson pages, Sandbox, Building Blocks, and Real World Extraction defer the quiz, Markdown, and Deep Check code until you open them.",
        icon: "performance",
      },
      {
        title: "40-50% faster canvas renders",
        body: "All four node types are memoized, so Highlight Connections and Validate stop re-rendering nodes that didn't change.",
        icon: "canvas",
      },
    ],
    qualityOfLife: [
      "Chapter lessons and component docs load on demand",
      "Custom components stop rebuilding schemas every render",
      "AI provider SDKs load only when Deep Check runs",
      "Preview deploys limited to main, develop, and release branches",
    ],
  },
  {
    version: "3.1.0-alpha",
    date: "2026-08-02",
    title: "A Learning Path you can search.",
    highlights: [
      {
        title: "Search, collapse, and a clearer tracker",
        body: "Filter by title, section, or completion status, collapse everything at once, and read a redesigned two-stat tracker.",
        icon: "navigation",
      },
      {
        title: "Prerequisites and domains in the Reader",
        body: "Prerequisite tags link straight to their lesson, and Real World Extraction chapters carry a domain badge.",
        icon: "docs",
      },
    ],
    qualityOfLife: [
      "Reading progress no longer goes stale when diagrams resize the page",
      "On this page keeps numbered headings written as H1s",
      "Manual saves confirm with a brief toast",
      "A themed 404 page, and hyphens in place of em dashes throughout",
    ],
  },
  {
    version: "3.0.1-alpha",
    date: "2026-08-02",
    title: "Sizing and contrast fixes.",
    highlights: [
      {
        title: "Mode cards breathe again",
        body: "Corrected icon and heading sizing on Home, and gave the canvas grid proper contrast in both themes.",
        icon: "fix",
      },
      {
        title: "Two flaky end-to-end specs fixed",
        body: "Zero-height edge hit boxes and a Validate-before-hydration race no longer fail the suite at random.",
        icon: "fix",
      },
    ],
  },
  {
    version: "3.0.0-alpha",
    date: "2026-07-31",
    title: "The Learning Path.",
    highlights: [
      {
        title: "A full curriculum browser",
        body: "26 Building Blocks chapters and 5 Real World Extraction chapters, with completion tracking and a downloadable PDF.",
        icon: "content",
      },
      {
        title: "Every chapter has a URL",
        body: "Chapter Workspace is route-driven now, so links stay shareable and back and forward work as expected.",
        icon: "navigation",
      },
      {
        title: "Progress without leaving your diagram",
        body: "An in-workspace sidebar to jump between chapters, check where you are, and see what unlocks next.",
        icon: "progress",
      },
    ],
  },
  {
    version: "2.1.0-alpha",
    date: "2026-07-30",
    title: "Release notes stay on Home.",
    highlights: [
      {
        title: "One place for the changelog",
        body: "Release notes no longer follow you into Sandbox, Building Blocks, and Real World Extraction.",
        icon: "polish",
      },
    ],
  },
  {
    version: "2.0.0-alpha",
    date: "2026-07-29",
    title: "Validation learns what right looks like.",
    highlights: [
      {
        title: "A real pass/fail gate",
        body: "Reference blueprints let a chapter recognise a correct architecture, alongside a much broader library of structural checks.",
        icon: "validation",
      },
      {
        title: "Deep Check",
        body: "An optional AI design review - bring your own key, save named profiles, get a trade-off critique. Your key never leaves your browser, and it never decides pass or fail.",
        icon: "ai",
      },
    ],
  },
  {
    version: "1.0.1-alpha",
    date: "2026-07-26",
    title: "Deployments unblocked.",
    highlights: [
      {
        title: "Build pipeline fix",
        body: "The test suite was picking up a production React build instead of the test build, failing hundreds of component tests.",
        icon: "fix",
      },
    ],
  },
  {
    version: "1.0.0-alpha",
    date: "2026-07-25",
    title: "The first alpha.",
    highlights: [
      {
        title: "Three modes and a component registry",
        body: "Sandbox, Building Blocks, and Real World Extraction, with live validation, written explanations, and local autosave.",
        icon: "component",
      },
      {
        title: "A formal release process",
        body: "Versioning and release conventions established - this panel tracks what changes from here on.",
        icon: "docs",
      },
    ],
  },
];
