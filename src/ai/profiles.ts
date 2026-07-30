import { db, type AiProfile } from "@/persistence/db";
import type { AiSettings } from "./settings";

export type { AiProfile };

/** Everything a create/edit form needs to produce — an `AiSettings` plus the
 * user-facing name. `id`/`createdAt`/`updatedAt` are assigned by
 * createProfile/updateProfile, never supplied by the caller. */
export type AiProfileDraft = AiSettings & { name: string };

/** Oldest first — a stable, predictable order for the profile list (not
 * alphabetical, so a freshly created profile doesn't jump around the list
 * relative to insertion order). */
export async function listProfiles(): Promise<AiProfile[]> {
  const all = await db.aiProfiles.toArray();
  return all.sort((a, b) => a.createdAt - b.createdAt);
}

export async function getActiveProfileId(): Promise<string | null> {
  const row = await db.aiActiveProfile.get("default");
  return row?.profileId ?? null;
}

export async function getActiveProfile(): Promise<AiProfile | null> {
  const id = await getActiveProfileId();
  if (id === null) return null;
  return (await db.aiProfiles.get(id)) ?? null;
}

export async function setActiveProfileId(id: string | null): Promise<void> {
  await db.aiActiveProfile.put({ id: "default", profileId: id });
}

/** Auto-activates the new profile only if it's the very first one — every
 * later create leaves the current active profile alone, so adding a second
 * profile never silently switches Deep Check away from the one already in
 * use. */
export async function createProfile(draft: AiProfileDraft): Promise<AiProfile> {
  const now = Date.now();
  const profile: AiProfile = { ...draft, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
  await db.aiProfiles.add(profile);
  const activeId = await getActiveProfileId();
  if (activeId === null) await setActiveProfileId(profile.id);
  return profile;
}

export async function updateProfile(id: string, draft: AiProfileDraft): Promise<AiProfile> {
  const existing = await db.aiProfiles.get(id);
  const updated: AiProfile = {
    ...draft,
    id,
    createdAt: existing?.createdAt ?? Date.now(),
    updatedAt: Date.now(),
  };
  await db.aiProfiles.put(updated);
  return updated;
}

/** Deletes the row only — does not touch the active-profile pointer. A
 * delete's effect on "what's active next" is a UI decision (does the
 * deleted row get reassigned immediately, before an undo window closes, or
 * only once the delete is truly committed?) that belongs to the caller, not
 * this module — see AiProfilesView.tsx's own delete flow. */
export async function deleteProfile(id: string): Promise<void> {
  await db.aiProfiles.delete(id);
}

export function isProfileUsable(profile: AiProfile | null): boolean {
  return profile !== null && profile.apiKey.trim().length > 0;
}
