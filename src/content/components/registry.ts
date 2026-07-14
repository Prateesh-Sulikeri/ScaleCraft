import type { ComponentDefinition } from "./types";
import { networkingComponents } from "./networking";
import { computeComponents } from "./compute";
import { dataComponents } from "./data";
import { cachingComponents } from "./caching";
import { messagingComponents } from "./messaging";
import { distributedSystemsComponents } from "./distributed-systems";

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

export function getComponent(id: string): ComponentDefinition | undefined {
  return componentRegistry.find((c) => c.id === id);
}
