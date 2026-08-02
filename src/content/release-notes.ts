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
