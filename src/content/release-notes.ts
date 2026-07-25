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
    version: "1.0.0-alpha.0",
    date: "2026-07-25",
    highlights: [
      "First alpha: Sandbox, Building Blocks, and Real World Extraction modes, a full component registry, live validation with explanations, and local autosave.",
      "Established a formal versioning and release process — this panel will track what changes from here on.",
    ],
  },
];
