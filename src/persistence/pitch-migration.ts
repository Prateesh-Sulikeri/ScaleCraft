import type { AnyNodeType } from "@/canvas/types";

/**
 * The one-time coordinate rescale for saved graphs, D19/D15 of
 * .claude/docs/pending-design-editor-revamp.md (release 7.2.0-alpha). The
 * Design Editor revamp shrank the authored pitch from 320x160 to 260x195; a
 * save persists positions at whatever pitch was authored when it was written,
 * so an unmigrated save stays stranded at the old spacing under the new,
 * smaller card.
 *
 * A coordinate rescale, not a re-layout: every node's position is scaled
 * toward the graph's own bounding-box origin, so a node the learner
 * deliberately placed off-grid stays proportionally where they put it. Zone
 * and comment boxes rescale their `width`/`height` too, or a tier box stops
 * containing its tier. Component node `width`/`height` are left alone (an
 * explicit resize is the learner's choice, not tied to the pitch - see D11).
 *
 * `PITCH_VERSION` is a marker carried on the save itself (db.ts's
 * `CanvasSave.pitchVersion`, and inside the synced `canvasState` payload -
 * see cloud-sync.ts), not just a Dexie schema version bump. A save can arrive
 * from another device already migrated (cloud sync), and the Dexie version
 * only tracks this browser's schema, not whether a given row's coordinates
 * were already converted - so the version bump alone can double-squash a row
 * that arrives pre-migrated. Every caller must check the marker before
 * calling `migrateNodesToCurrentPitch`, never call it unconditionally.
 */

/** 1 = the original 320x160 pitch, authored before this marker existed.
 * 2 = the 260x195 pitch (release 7.2.0-alpha). Any save missing the field
 * entirely is treated as 1. */
export const CURRENT_PITCH_VERSION = 2;

const OLD_PITCH_X = 320;
const OLD_PITCH_Y = 160;
const NEW_PITCH_X = 260;
const NEW_PITCH_Y = 195;
const SCALE_X = NEW_PITCH_X / OLD_PITCH_X;
const SCALE_Y = NEW_PITCH_Y / OLD_PITCH_Y;

export function needsPitchMigration(pitchVersion: number | undefined | null): boolean {
  return (pitchVersion ?? 1) < CURRENT_PITCH_VERSION;
}

/** Rescales a graph's nodes from the 320x160 pitch to the 260x195 pitch.
 * Pure - callers own writing the result back and stamping `pitchVersion`. */
export function migrateNodesToCurrentPitch(nodes: AnyNodeType[]): AnyNodeType[] {
  if (nodes.length === 0) return nodes;
  const originX = Math.min(...nodes.map((n) => n.position.x));
  const originY = Math.min(...nodes.map((n) => n.position.y));

  return nodes.map((node): AnyNodeType => {
    const position = {
      x: originX + (node.position.x - originX) * SCALE_X,
      y: originY + (node.position.y - originY) * SCALE_Y,
    };
    if (node.type === "zone") {
      return { ...node, position, data: { ...node.data, width: node.data.width * SCALE_X, height: node.data.height * SCALE_Y } };
    }
    if (node.type === "comment") {
      return { ...node, position, data: { ...node.data, width: node.data.width * SCALE_X, height: node.data.height * SCALE_Y } };
    }
    return { ...node, position };
  });
}
