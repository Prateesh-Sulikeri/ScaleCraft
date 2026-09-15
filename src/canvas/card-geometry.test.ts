import { describe, it, expect } from "vitest";
import {
  CARD_WIDTH,
  CARD_HEIGHT,
  CARD_MIN_WIDTH,
  CARD_MIN_HEIGHT,
  MIN_HORIZONTAL_GAP,
  MIN_VERTICAL_GAP,
  PITCH_X,
  PITCH_Y,
  ZONE_PAD_SIDE,
  ZONE_PAD_TOP,
  ZONE_PAD_BOTTOM,
  ZONE_STACK_GAP,
  CONNECTION_RADIUS,
} from "./card-geometry";

/**
 * The constants' *relationships*, not their values.
 *
 * authoring-invariants.test.ts already checks authored content against these
 * numbers. Nothing checked the numbers against each other, and several of
 * them only work as a set: CONNECTION_RADIUS is derived from CARD_WIDTH,
 * both pitches are derived from a card plus its minimum gap, and
 * ZONE_STACK_GAP is what PITCH_Y has left after the card and the two pads.
 *
 * So a future card resize is the failure this file exists to catch. Bumping
 * CARD_WIDTH back toward the old 200 would silently stop the four handles'
 * catch radii from covering the card - the whole-card drop target (D6) would
 * degrade to four dots again with every other test still green, because
 * nothing renders differently. Same for a pitch change quietly dropping
 * authored layouts onto the gap floor, or a zone pad change merging two
 * stacked zones into one box.
 */
describe("card geometry constants", () => {
  it("resize floors sit below the authored default", () => {
    // A learner may shrink a card; the authored default is what the
    // invariant gates measure, so the floor has to be under it, not on it.
    expect(CARD_MIN_WIDTH).toBeLessThan(CARD_WIDTH);
    expect(CARD_MIN_HEIGHT).toBeLessThan(CARD_HEIGHT);
  });

  it("the four handles' catch radii cover every point on the card", () => {
    // D6: the whole card is a drop target through geometry alone, with no
    // hit-test code of our own. That holds only if no point on the card is
    // further than CONNECTION_RADIUS from its nearest handle.
    //
    // Measured by sampling rather than by a closed form. The tempting
    // shortcut - "the worst point is the centre, so compare against
    // min(w, h) / 2" - is false for a card much wider than it is tall: on a
    // 400x96 card the centre sits 48px from the top handle and looks fine,
    // while a point a quarter of the way along the top edge is ~100px from
    // anything. Sampling has no such blind spot.
    const handles = [
      { x: CARD_WIDTH / 2, y: 0 }, // top
      { x: CARD_WIDTH / 2, y: CARD_HEIGHT }, // bottom
      { x: 0, y: CARD_HEIGHT / 2 }, // left
      { x: CARD_WIDTH, y: CARD_HEIGHT / 2 }, // right
    ];
    const STEP = 2;
    let worst = { dist: 0, x: 0, y: 0 };

    for (let x = 0; x <= CARD_WIDTH; x += STEP) {
      for (let y = 0; y <= CARD_HEIGHT; y += STEP) {
        const nearest = Math.min(
          ...handles.map((h) => Math.hypot(h.x - x, h.y - y)),
        );
        if (nearest > worst.dist) worst = { dist: nearest, x, y };
      }
    }

    expect(
      worst.dist,
      `(${worst.x}, ${worst.y}) is ${worst.dist.toFixed(1)}px from the nearest ` +
        `handle, beyond the ${CONNECTION_RADIUS}px catch radius - the card is ` +
        `no longer a whole-surface drop target`,
    ).toBeLessThanOrEqual(CONNECTION_RADIUS);
  });

  it("a card's catch radius cannot reach its neighbour's handles", () => {
    // The flip side of the rule above: too generous and a drop meant for one
    // card snaps to the card next to it. Two catch radii have to fit inside
    // the tightest gap the authoring gates permit.
    expect(CONNECTION_RADIUS * 2).toBeLessThanOrEqual(MIN_HORIZONTAL_GAP);
  });

  it("the authored pitch clears the card plus its minimum gap on both axes", () => {
    // Strictly above the floor, not on it, so a learner nudging an authored
    // card a few pixels does not drop the layout under the standard that
    // authoring-invariants.test.ts enforces.
    expect(PITCH_X).toBeGreaterThan(CARD_WIDTH + MIN_HORIZONTAL_GAP);
    expect(PITCH_Y).toBeGreaterThan(CARD_HEIGHT + MIN_VERTICAL_GAP);
  });

  it("the horizontal gap stays the wider of the two", () => {
    // Deliberate asymmetry: the horizontal gap carries tier-to-tier
    // connectors and has to fit a fan-out side by side; the vertical one
    // only ever carries a single short arrow within a tier.
    expect(MIN_HORIZONTAL_GAP).toBeGreaterThan(MIN_VERTICAL_GAP);
    expect(PITCH_X - CARD_WIDTH).toBeGreaterThan(PITCH_Y - CARD_HEIGHT);
  });

  it("two stacked zones keep a visible gap between their borders", () => {
    // Below ~12px the two dashed boxes read as one merged container, which
    // is the bug that moved the pads to 40/12 (CURRICULUM.md §11.6).
    expect(ZONE_STACK_GAP).toBe(PITCH_Y - CARD_HEIGHT - ZONE_PAD_TOP - ZONE_PAD_BOTTOM);
    expect(ZONE_STACK_GAP).toBeGreaterThanOrEqual(12);
  });

  it("a zone's label band clears the first card it groups", () => {
    // ZONE_PAD_TOP is the label band. The label input is ~32px tall
    // including its margin, so anything at or under that puts the label on
    // top of the card.
    const LABEL_INPUT_HEIGHT = 32;
    expect(ZONE_PAD_TOP).toBeGreaterThan(LABEL_INPUT_HEIGHT);
  });

  it("a single-column zone is wider than the card it wraps", () => {
    // The zone formula's width term at cols = 1. If the side pad ever went
    // to zero the dashed border would trace the card exactly and stop
    // reading as a grouping.
    const singleColumnWidth = CARD_WIDTH + 2 * ZONE_PAD_SIDE;
    expect(singleColumnWidth).toBeGreaterThan(CARD_WIDTH);
    expect(ZONE_PAD_SIDE).toBeGreaterThan(0);
  });
});
