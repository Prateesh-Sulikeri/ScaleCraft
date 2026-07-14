/**
 * The three learning modes from INITIAL_THOUGHTS.md. Broader than
 * ChapterDefinition["mode"] (src/content/chapters/types.ts), which only
 * covers "building-blocks" | "real-world-extraction" — Sandbox has no
 * ChapterDefinition, but still needs an identity for the mode badge/header
 * accent (see .claude/docs/DESIGN_LANGUAGE.md, "Mode color").
 */
export type AppMode = "sandbox" | "building-blocks" | "real-world-extraction";

export const modeLabel: Record<AppMode, string> = {
  sandbox: "Sandbox",
  "building-blocks": "Building Blocks",
  "real-world-extraction": "Real World Extraction",
};

/** CSS var references — see globals.css's `--mode-*` tokens. */
export const modeColorVar: Record<AppMode, string> = {
  sandbox: "var(--mode-sandbox)",
  "building-blocks": "var(--mode-building-blocks)",
  "real-world-extraction": "var(--mode-real-world-extraction)",
};

/** Bold lead-in line for the mode badge's opt-in popover. */
export const modeTagline: Record<AppMode, string> = {
  sandbox: "Free exploration — no objectives, no scoring.",
  "building-blocks": "Guided, constrained lessons — one concept at a time.",
  "real-world-extraction": "Apply what you've learned to a full system design problem.",
};

/** Supporting line under the tagline in the same popover. */
export const modeDescription: Record<AppMode, string> = {
  sandbox:
    "Build anything with the full component library. Validate still checks structural rules " +
    "(e.g. no direct client→database calls), but there's no single correct answer here to " +
    "match — this is the mode for trying things out.",
  "building-blocks":
    "Only the components relevant to the lesson are available, and hints are there if you want " +
    "them — but never forced on you when something fails.",
  "real-world-extraction":
    "A larger component library and multiple valid solutions — validation here looks for " +
    "anti-patterns, not one prescribed shape.",
};
