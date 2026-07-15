import type { ComponentDefinition } from "./types";
import { networkingComponents } from "./networking";
import { computeComponents } from "./compute";
import { dataComponents } from "./data";
import { cachingComponents } from "./caching";
import { messagingComponents } from "./messaging";
import { distributedSystemsComponents } from "./distributed-systems";
import { useCanvasStore } from "@/canvas/store";
import { toComponentDefinition } from "./custom";

/**
 * The global component registry — every chapter references components from
 * here by id via `availableComponentIds`; components are never redefined per
 * chapter. Split into one file per category (see .claude/docs/DESIGN_LANGUAGE.md's
 * Color System table for the same six categories) purely for file size —
 * this barrel is still the single source of truth other modules import from.
 * Covers the full "Core Components" list from INITIAL_THOUGHTS.md.
 */
export const componentRegistry: ComponentDefinition[] = [
  ...networkingComponents,
  ...computeComponents,
  ...dataComponents,
  ...cachingComponents,
  ...messagingComponents,
  ...distributedSystemsComponents,
];

/**
 * Every user-created custom component (see CreateComponentModal.tsx) lives
 * in the canvas store as a raw, editable CustomComponentRecord — not a
 * ComponentDefinition — so it can be edited/deleted later (a live Zod
 * configSchema can't be un-rendered back into editable field specs, see
 * store.ts's comment on `customComponents`). `getAllComponents` builds a
 * real ComponentDefinition from each record on demand and merges both lists
 * so Palette/ContextMenu show one combined, reactive list. A plain
 * `useCanvasStore.getState()` snapshot read (not the `useCanvasStore()`
 * hook) is safe here: a custom component is always registered before it's
 * ever placed on canvas, so `getComponent` doesn't need to be reactive to
 * find one — it just needs the current list at call time.
 */
export function getAllComponents(): ComponentDefinition[] {
  return [...componentRegistry, ...useCanvasStore.getState().customComponents.map(toComponentDefinition)];
}

export function getComponent(id: string): ComponentDefinition | undefined {
  const builtin = componentRegistry.find((c) => c.id === id);
  if (builtin) return builtin;
  const record = useCanvasStore.getState().customComponents.find((c) => c.id === id);
  return record ? toComponentDefinition(record) : undefined;
}
