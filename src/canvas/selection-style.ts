/** Shared "this node is selected" visual — a neutral ring drawn `inset`
 * (inside the node's own border), not an outward blur. An earlier version
 * used an outward `box-shadow` glow; with several small annotations placed
 * close together (flags/comments), the blur radius reached into neighboring
 * nodes and read as a rendering glitch rather than a selection state — inset
 * never extends past the node's own box, so it can't collide with anything
 * next to it regardless of spacing. Exported once so ComponentNode/ZoneNode/
 * CommentNode/StartNode apply the exact same treatment on their own
 * `selected` prop instead of drifting per-file. */
export const SELECTED_GLOW = "inset 0 0 0 2px color-mix(in srgb, var(--foreground) 55%, transparent)";

/** The "Highlight Connections" accent (see ContextMenu.tsx) — deliberately a
 * warm gold, distinct from every other color channel already in play
 * (category color, validation-state ring, zone/comment/flag accent color,
 * SELECTED_GLOW above) so "this is part of the highlighted path" reads as
 * its own, unambiguous signal. Same inset-only reasoning as SELECTED_GLOW —
 * no outward blur, so it can't bleed into a dimmed neighbor sitting right
 * next to a highlighted node. */
export const HIGHLIGHT_GOLD = "#f2b90a";
export const HIGHLIGHT_GOLD_RING = `inset 0 0 0 2px ${HIGHLIGHT_GOLD}`;
