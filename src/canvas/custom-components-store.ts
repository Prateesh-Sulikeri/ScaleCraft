import { create } from "zustand";
import type { CustomComponentRecord } from "@/content/components/custom";
import { db, type CustomComponentRow } from "@/persistence/db";
import { hydrateCustomComponents } from "@/persistence/cloud-sync";
import { reconcileRows } from "@/persistence/reconcile";

function stripSyncMeta(row: CustomComponentRow): CustomComponentRecord {
  const { id, category, label, icon, summary, docs, hasInput, hasOutput, fields } = row;
  return { id, category, label, icon, summary, docs, hasInput, hasOutput, fields };
}

/**
 * Reconciles the Dexie `customComponents` table against the cloud (release
 * 6.1.0-alpha Phase 3, pending-6.1.0-poa.md) and populates the store from the
 * merged result — per-id last-write-wins (reconcile.ts). Replaces the old
 * hydrate-on-empty that used to live inline in sandbox/page.tsx's mount
 * effect, which only ever ran on a genuinely empty local table and, being
 * Sandbox-only, never reconciled at all for a session that only ever opened
 * a chapter (audit S9).
 */
async function performHydrate(set: (partial: Partial<CustomComponentsStore>) => void): Promise<void> {
  const [local, remote] = await Promise.all([db.customComponents.toArray(), hydrateCustomComponents()]);
  if (!remote.ok) {
    // Abort (Phase 6, pending-6.1.0-poa.md - fixes audit S5): see
    // progress-store.ts's identical branch for why a failed fetch can't be
    // treated as "the cloud has nothing." `hydrated` stays false so the
    // next hydrate() call retries.
    set({ customComponents: local.map(stripSyncMeta) });
    return;
  }
  const { merged, toWrite } = reconcileRows(local, remote.data, (r) => r.id);
  if (toWrite.length > 0) await db.customComponents.bulkPut(toWrite);
  set({ hydrated: true, customComponents: merged.map(stripSyncMeta) });
}

/** In-flight dedup only — see progress-store.ts's identical pattern for why
 * this isn't also the "already hydrated" check. */
let inFlightHydrate: Promise<void> | null = null;

/** User-created components (see CreateComponentModal.tsx) — the raw,
 * editable records, not derived ComponentDefinitions. registry.ts's
 * getComponent/getAllComponents build a real ComponentDefinition from a
 * record on demand (via content/components/custom.ts's
 * toComponentDefinition) — keeping the record as the source of truth here,
 * rather than a derived definition, is what makes editing possible: a
 * placed ComponentDefinition's live Zod configSchema can't be un-rendered
 * back into editable field specs.
 *
 * Deliberately a plain global singleton, NOT scoped per mode like
 * canvas/store.ts — a custom component made in Sandbox has to be usable
 * from Building Blocks and Real World Extraction too (CLAUDE.md: "never
 * fork a component's definition for a specific chapter"), so this is
 * shared registry data, not per-mode canvas content. Mounted from both
 * ChapterWorkspace and Sandbox (whichever mounts first wins the hydrate). */
type CustomComponentsStore = {
  customComponents: CustomComponentRecord[];
  hydrated: boolean;
  /** Reconciling read from Dexie + the cloud — idempotent, safe to call from
   *  every mounting surface. ComponentPicker's mutators await this first
   *  (Phase 3.3's invariant: no mutator runs before its table's
   *  reconciliation has completed). */
  hydrate: () => Promise<void>;
  upsertCustomComponent: (record: CustomComponentRecord) => void;
  deleteCustomComponent: (id: string) => void;
  /** Direct in-memory replace, no Dexie/cloud I/O — used by tests and by
   *  `hydrate()` itself once it has the merged result in hand. */
  loadCustomComponents: (records: CustomComponentRecord[]) => void;
};

export const useCustomComponentsStore = create<CustomComponentsStore>((set, get) => ({
  customComponents: [],
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return Promise.resolve();
    if (inFlightHydrate) return inFlightHydrate;
    inFlightHydrate = performHydrate(set).finally(() => {
      inFlightHydrate = null;
    });
    return inFlightHydrate;
  },

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
