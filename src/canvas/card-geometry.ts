/**
 * The component card's authored geometry - the single source of truth.
 *
 * Lives in its own module, not in ComponentNode.tsx, so non-UI consumers can
 * read it without importing React and @xyflow/react. The authoring invariant
 * gates (src/content/chapters/authoring-invariants.test.ts) are the reason
 * this exists: they used to hand-copy `200`/`65` with a comment asking whoever
 * changed the card to remember to re-measure here. Nobody would have, and the
 * gate would have gone on asserting a card that no longer existed.
 *
 * Changing these means re-deriving the authored starter-graph pitch, the
 * decorator zone formula (CURRICULUM.md §11.5/§11.6) and every authored
 * position. See .claude/docs/pending-design-editor-revamp.md.
 */
export const CARD_WIDTH = 120;
export const CARD_HEIGHT = 96;

/** Resize floors. Not the same thing as the authored default above - a
 * learner may shrink a card below it, and the invariant gates deliberately
 * measure the authored default, not what a resize could reach. */
export const CARD_MIN_WIDTH = 96;
export const CARD_MIN_HEIGHT = 76;

/**
 * The minimum breathing room an *edge* needs between two authored cards:
 * enough run to read its direction, carry a mid-edge label and offer a click
 * target. Deliberately NOT derived from the card size - it is a property of
 * the edge, and it did not shrink when the card did.
 */
export const MIN_HORIZONTAL_GAP = 120;
export const MIN_VERTICAL_GAP = 56;

/**
 * Authored starter-graph pitch (centre-to-centre spacing). Sits above
 * `card + minimum gap` on both axes (140px / 64px of real gap) rather than
 * exactly on the floor, so a learner nudging one card a few pixels does not
 * drop an authored layout under the standard.
 *
 * The two axes are deliberately not symmetric. Horizontal gap is where the
 * tier-to-tier connectors run, and a fan-out needs room for several of them
 * side by side, so it stays wide. Vertical gap only ever carries one short
 * arrow between two stacked cards in the same tier; at the old 99px a tier
 * column was mostly empty space, and a four-deep stack pushed the diagram
 * past 750px tall for 4 cards' worth of content.
 */
export const PITCH_X = 260;
export const PITCH_Y = 160;

/**
 * Padding between a starter-decorator zone and the cards it groups
 * (CURRICULUM.md §11.6). Asymmetric on the vertical: the extra room above is
 * where the zone's own label sits.
 *
 *   zone.position = (PITCH_X * col + 32, PITCH_Y * row - ZONE_PAD_TOP)
 *   zone.width    = PITCH_X * (cols - 1) + CARD_WIDTH + 2 * ZONE_PAD_SIDE
 *   zone.height   = PITCH_Y * (rows - 1) + CARD_HEIGHT + ZONE_PAD_TOP + ZONE_PAD_BOTTOM
 */
export const ZONE_PAD_SIDE = 28;
export const ZONE_PAD_TOP = 40;
export const ZONE_PAD_BOTTOM = 12;

/**
 * What the two vertical pads have to share. `PITCH_Y - CARD_HEIGHT` is 64px,
 * and where one column stacks two zones (bb-3-4's Application over its Build
 * here slot, the only such case today) that budget is split three ways: the
 * upper zone's bottom pad, the gap between the two borders, and the lower
 * zone's label band. At 44/16 the gap came out at 4px and the two dashed
 * boxes read as one merged container; 40/12 leaves 12px. The label band still
 * clears - the label input is ~32px tall including its own margin, so 40px
 * keeps 8px between it and the first card.
 */
export const ZONE_STACK_GAP = PITCH_Y - CARD_HEIGHT - ZONE_PAD_TOP - ZONE_PAD_BOTTOM;

/**
 * How far from a handle a dropped connection still snaps to it
 * (ReactFlow's `connectionRadius`, default 20).
 *
 * Chosen so the union of the four handles' catch radii covers the entire
 * card: the worst-covered point on a CARD_WIDTH x CARD_HEIGHT card is its
 * centre, exactly CARD_WIDTH / 2 from the left and right handles. That makes
 * the whole card a drop target through geometry alone, with no hit-test code
 * of our own - which is the point (see D6 in the revamp doc).
 *
 * Safe against catching a *neighbour's* handle: the tightest authored
 * spacing is MIN_HORIZONTAL_GAP (120px) between card edges, more than
 * twice this radius.
 */
export const CONNECTION_RADIUS = 60;
