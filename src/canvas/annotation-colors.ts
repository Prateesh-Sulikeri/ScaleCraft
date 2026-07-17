/**
 * Shared color options for Zone/Comment annotations (see ZoneNode.tsx,
 * CommentNode.tsx, ColorPicker.tsx). Presets are plain hex, not app color
 * tokens like `--category-*` — they're rendered via `color-mix(...)` against
 * a transparent/panel background at low opacity, so the same hex reads fine
 * against both the dark and light theme's panel/background without needing
 * a separate light/dark value per preset.
 */
export const ANNOTATION_COLOR_PRESETS: { name: string; value: string }[] = [
  { name: "Pink", value: "#ff3483" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Emerald", value: "#10b981" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Purple", value: "#a855f7" },
  { name: "Slate", value: "#64748b" },
];

export const DEFAULT_ZONE_COLOR = "#ff3483";
export const DEFAULT_COMMENT_COLOR = "#3b82f6";
/** A Flag's (see StartNode.tsx) default color, user-recolorable per
 * instance via the same ColorPicker — a flag isn't only "start reading
 * here" anymore, so different colors can mark different things (e.g. red
 * for "known issue", green for "verified path"). Gold by default: distinct
 * from every category/state/mode hue and every other annotation default. */
export const DEFAULT_FLAG_COLOR = "#eab308";
