import { create } from "zustand";
import type { CustomComponentRecord } from "@/content/components/custom";

/** User-created components (see CreateComponentModal.tsx) — the raw,
 * editable records, not derived ComponentDefinitions. registry.ts's
 * getComponent/getAllComponents build a real ComponentDefinition from a
 * record on demand (via content/components/custom.ts's
 * toComponentDefinition) — keeping the record as the source of truth here,
 * rather than a derived definition, is what makes editing possible: a
 * placed ComponentDefinition's live Zod configSchema can't be un-rendered
 * back into editable field specs. This is in-memory state only — same
 * convention as canvas/store.ts: no persistence I/O here. CreateComponentModal's
 * submit handler writes to src/persistence/db.ts's customComponents table AND
 * calls upsertCustomComponent in the same handler; Sandbox's page loads from
 * that table into here on mount.
 *
 * Deliberately a plain global singleton, NOT scoped per mode like
 * canvas/store.ts — a custom component made in Sandbox has to be usable
 * from Building Blocks and Real World Extraction too (CLAUDE.md: "never
 * fork a component's definition for a specific chapter"), so this is
 * shared registry data, not per-mode canvas content. */
type CustomComponentsStore = {
  customComponents: CustomComponentRecord[];
  upsertCustomComponent: (record: CustomComponentRecord) => void;
  deleteCustomComponent: (id: string) => void;
  loadCustomComponents: (records: CustomComponentRecord[]) => void;
};

export const useCustomComponentsStore = create<CustomComponentsStore>((set) => ({
  customComponents: [],

  upsertCustomComponent: (record) => {
    set((state) => {
      const exists = state.customComponents.some((c) => c.id === record.id);
      return {
        customComponents: exists
          ? state.customComponents.map((c) => (c.id === record.id ? record : c))
          : [...state.customComponents, record],
      };
    });
  },

  deleteCustomComponent: (id) => {
    set((state) => ({ customComponents: state.customComponents.filter((c) => c.id !== id) }));
  },

  loadCustomComponents: (records) => {
    set({ customComponents: records });
  },
}));
