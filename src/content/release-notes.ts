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
      "Validation now recognizes correct architectures, not just wrong ones — chapters have a real pass/fail gate driven by reference blueprints, plus a much broader library of structural checks for catching nonsensical designs (disconnected components, backwards data flow, and more).",
      "New: Deep Check — an optional AI-powered design review. Bring your own API key from Anthropic, OpenAI, Google, xAI, or any OpenAI-compatible provider, save multiple named profiles, and get a trade-off-focused critique of your architecture. Your key stays in your browser and is never sent to our servers; Deep Check never decides pass/fail — that's still the deterministic validation engine's job.",
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
      "Established a formal versioning and release process — this panel will track what changes from here on.",
    ],
  },
];
