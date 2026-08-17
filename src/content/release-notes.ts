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
    version: "6.1.1-alpha",
    date: "2026-08-17",
    highlights: [
      "Fixed clicking mark-complete or a quiz right after a page load sometimes saying \"Sign in required\" while you were already signed in, and silently not saving. The action now waits for your session to resolve instead.",
      "Fixed 'On this page' highlighting Knowledge check while you were still at the top of a chapter - nothing is highlighted now until you scroll to a real section.",
      "Lessons now use a wider column on very wide displays instead of the same narrow measure as a laptop. 1080p and below are unchanged.",
    ],
  },
  {
    version: "6.1.0-alpha",
    date: "2026-08-16",
    highlights: [
      "Reading is now public - browse the Learning Path and any chapter's lesson without an account. Signing in is only needed to save progress, take quizzes, or open Sandbox.",
      "Your progress and custom components now sync automatically across devices, and refresh when you switch back to an already-open tab - no more reload needed to see what another device did.",
      "Sandbox now shows the same \"sign in to continue\" prompt as quizzes and mark-complete when you click it signed out, instead of bouncing you straight to the sign-in page.",
      "Signing out now clears your progress from the screen immediately instead of leaving the previous account's data visible until a reload.",
      "Fixed eleven old Building Blocks chapter links from the recent Part 1 reorganization 404ing instead of redirecting to their new chapter.",
      "If a sync ever loses an edit to a newer change from another device (rare), you'll now see a small indicator instead of it disappearing silently.",
    ],
  },
  {
    version: "6.0.0-alpha",
    date: "2026-08-12",
    highlights: [
      "ScaleCraft now requires signing in - your first visit takes you to a sign-up/sign-in screen before you can reach the canvas.",
    ],
  },
  {
    version: "5.0.1-alpha",
    date: "2026-08-12",
    highlights: [
      "Fixed opening a chapter from Learning Path sometimes showing a blank flash before the lesson appeared - the lesson content now starts loading the moment you hover the link, so it's ready by the time the hold animation finishes.",
    ],
  },
  {
    version: "5.0.0-alpha",
    date: "2026-08-11",
    highlights: [
      "3.4 Load Balancer now has a full lesson - routing, health checks, round-robin vs. least-connections, and when to add a second instance - replacing the earlier placeholder text.",
      "New: interactive step-by-step diagrams in lesson content. The Load Balancer chapter's diagram now walks a real request from client to load balancer to app server one step at a time, with a toggle between round-robin and least-connections routing.",
      "New: tap or hover an underlined term inline in a lesson (like \"round-robin\" in the Load Balancer chapter) for a short definition without leaving the page - the start of a growing glossary.",
      "Lessons now compile ahead of time instead of parsing Markdown in your browser every time you open a chapter, laying the groundwork for richer interactive content in future chapters.",
    ],
  },
  {
    version: "4.1.1-alpha",
    date: "2026-08-10",
    highlights: [
      "Fixed 'On this page' sometimes highlighting a leftover section from the chapter you were just reading, instead of the top of the new one you just opened.",
      "Fixed 'On this page' listing Knowledge check after Next - it now matches the order those sections actually appear on the page.",
      "The quiz and design exercise are now one combined card at the end of each chapter instead of two separately-bordered ones, with each row's button turning green once that task is done.",
    ],
  },
  {
    version: "4.1.0-alpha",
    date: "2026-08-10",
    highlights: [
      "Six new Building Blocks chapters: 1.1 Understanding the Problem, 1.2 Functional Requirements, 1.3 Non-functional Requirements, 1.4 Estimating Scale, 1.5 Numbers Every Engineer Should Know, and 1.6 Drawing the First Architecture - a continuous URL-shortener case study, with 1.6 bringing the unit's first canvas build exercise.",
      "New 'Next chapter' navigation once you finish a chapter: a pagination card at the bottom of the lesson, a link next to 'Back to lesson' in the sidebar, and a one-time 'Chapter complete' toast in the canvas itself the moment a Submit passes - all three used to dead-end.",
      "Guided tour reliability pass: the tour now pauses instead of continuing silently if you switch tabs or lose window focus mid-step, stays in sync if you have the app open in multiple tabs, and completes its gated steps in any order instead of requiring a fixed sequence. Also fixed the popover drifting off its target when a step's card changed size, and the violations dropdown closing itself mid-tour.",
      "Fixed EdgeInspector, the zoom/pan controls, and the docked tour card overlapping in the same corner - they now sit side by side. Fixed the tour's closing step still telling learners to scroll to zoom, after canvas navigation changed scroll to pan a while back.",
      "Fixed the sidebar's 'Back to lesson' and 'Learning Path' links - clicking anywhere across the row used to navigate, not just the text or icon. Chapter Reader's sidebar also gained the ScaleCraft logo, linking back home.",
    ],
  },
  {
    version: "4.0.0-alpha",
    date: "2026-08-07",
    highlights: [
      "New: a guided walkthrough for Chapter 0.1 (Welcome to ScaleCraft) - your first chapter starts with a broken diagram, and a step-by-step tour shows you how to diagnose it, add the missing piece, fix the connection, and read Validate's explanation for yourself. Esc pauses instead of dismissing for good, and reloading picks up right where you left off.",
      "Validate and Submit are now separate steps. Validate checks your diagram's structure only, no completion pressure - Submit adds a check against the chapter's target architecture and reports exactly what's missing, extra, or mismatched instead of a bare pass/fail.",
      "New 'Start over' control resets a chapter back to its starter graph, discarding your save and undo history - useful for retrying a chapter or replaying its tour from a clean board. It now lives with the Replay/Resume tour controls in the sidebar, instead of a floating pill that used to cover sidebar content.",
      "Two new Building Blocks chapters: 0.1 Welcome to ScaleCraft (real lesson content, replacing the placeholder) and 0.2 What is System Design? (a quick, canvas-free primer on the five forces behind every design decision - latency, throughput, availability, durability, cost - with its own quiz).",
      "Concept chapters that don't need a diagram exercise (like 0.2) now complete on their quiz alone, instead of requiring a Submit that was never reachable.",
    ],
  },
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
