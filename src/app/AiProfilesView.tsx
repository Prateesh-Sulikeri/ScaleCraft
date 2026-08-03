"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Pencil, Plus, Trash2, Undo2 } from "lucide-react";
import { providers } from "@/engines";
import {
  listProfiles,
  createProfile,
  updateProfile,
  deleteProfile,
  restoreProfile,
  setActiveProfileId,
  getActiveProfile,
  type AiProfile,
  type AiProfileDraft,
} from "@/ai/profiles";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import { AiSettingsForm } from "./AiSettingsForm";

/** How long a deleted profile stays undo-able (restorable) before the row
 * is dropped from local state for good. Chosen a beat longer than
 * HistoryView's 4s confirm-arming window (DeepCheckPanel.tsx) since this is
 * a two-step flow (confirm, then undo) rather than one.
 *
 * The delete itself commits to Dexie immediately on confirm, not after this
 * window — an earlier version deferred the real delete until the timeout
 * fired, but that timer lived only in this component's local state, so
 * closing the panel, switching views, or navigating away before it fired
 * unmounted AiProfilesView and either lost the pending delete outright (full
 * navigation/reload) or left a stale re-fetched list that looked like the
 * delete had silently reverted (panel reopened before the timer fired).
 * Deleting up front makes the mutation durable regardless of what the UI
 * does next; Undo now means "restore," not "cancel." */
const UNDO_WINDOW_MS = 5000;

type PendingDelete = {
  profile: AiProfile;
  /** Whether this profile was active at the moment delete was confirmed —
   * if so, active was already reassigned immediately (see
   * handleDeleteConfirm) and must be reassigned back on Undo. */
  wasActive: boolean;
  timeout: ReturnType<typeof setTimeout>;
};

type AiProfilesViewProps = {
  /** The profile Deep Check currently uses — passed down rather than
   * re-derived here so there's exactly one place (DeepCheckButton.tsx) that
   * owns "what Deep Check will run with next." */
  activeProfileId: string | null;
  /** Fired after any mutation that could change the active profile (switch,
   * create-that-auto-activates, edit-of-the-active-profile, delete/undo of
   * the active profile) — always with a freshly re-read value, never
   * inferred locally, so the caller's copy can't drift from Dexie. */
  onActiveProfileChange: (profile: AiProfile | null) => void;
};

/**
 * The panel's "profiles" view (DeepCheckPanel.tsx) — a list of saved AI
 * configurations plus an edit sub-view, mirroring DeepCheckPanel's own
 * HistoryView list⇄detail pattern rather than introducing a new one.
 */
export function AiProfilesView({ activeProfileId, onActiveProfileChange }: AiProfilesViewProps) {
  const [profiles, setProfiles] = useState<AiProfile[] | null>(null);
  const [editing, setEditing] = useState<AiProfile | "new" | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  useEffect(() => {
    let cancelled = false;
    listProfiles().then((loaded) => {
      if (!cancelled) setProfiles(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Don't leave an armed confirmation stuck open indefinitely — same
  // convention as HistoryView's own confirmingId auto-dismiss.
  useEffect(() => {
    if (confirmingId === null) return;
    const timeout = setTimeout(() => setConfirmingId(null), 4000);
    return () => clearTimeout(timeout);
  }, [confirmingId]);

  const refreshActive = async () => {
    onActiveProfileChange(await getActiveProfile());
  };

  const handleSelectActive = async (id: string) => {
    if (id === activeProfileId) return;
    await setActiveProfileId(id);
    await refreshActive();
  };

  const handleDeleteConfirm = (profile: AiProfile) => {
    setConfirmingId(null);
    const wasActive = profile.id === activeProfileId;

    if (wasActive) {
      const remaining = (profiles ?? []).filter((p) => p.id !== profile.id);
      void setActiveProfileId(remaining[0]?.id ?? null).then(refreshActive);
    }

    // Commits immediately — see UNDO_WINDOW_MS's doc comment for why this
    // isn't deferred to the timeout below.
    void deleteProfile(profile.id);

    const timeout = setTimeout(() => {
      setProfiles((prev) => (prev ?? []).filter((p) => p.id !== profile.id));
      setPendingDelete((current) => (current?.profile.id === profile.id ? null : current));
    }, UNDO_WINDOW_MS);

    setPendingDelete({ profile, wasActive, timeout });
  };

  const handleUndoDelete = async () => {
    if (!pendingDelete) return;
    clearTimeout(pendingDelete.timeout);
    await restoreProfile(pendingDelete.profile);
    if (pendingDelete.wasActive) {
      await setActiveProfileId(pendingDelete.profile.id);
      await refreshActive();
    }
    setPendingDelete(null);
  };

  const handleSaveProfile = async (draft: AiProfileDraft) => {
    if (editing === "new" || editing === null) {
      const created = await createProfile(draft);
      setProfiles((prev) => [...(prev ?? []), created]);
    } else {
      const updated = await updateProfile(editing.id, draft);
      setProfiles((prev) => (prev ?? []).map((p) => (p.id === updated.id ? updated : p)));
    }
    await refreshActive();
    setEditing(null);
  };

  if (editing !== null) {
    return (
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setEditing(null)}
          className="self-start text-xs text-foreground/60 underline decoration-foreground/30 underline-offset-2 hover:decoration-foreground"
        >
          ← Back to profiles
        </button>
        <AiSettingsForm
          settings={editing === "new" ? { ...DEFAULT_AI_SETTINGS, name: "" } : editing}
          onSave={handleSaveProfile}
          onCancel={() => setEditing(null)}
        />
      </div>
    );
  }

  if (profiles === null) {
    return <Loader2 size={16} className="animate-spin text-foreground/50" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={() => setEditing("new")}
        className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-border"
      >
        <Plus size={14} />
        New Profile
      </button>

      {profiles.length === 0 && (
        <p className="text-sm text-foreground/60">
          No AI profiles yet. Create one to enable Deep Check.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {profiles.map((profile) => {
          if (pendingDelete?.profile.id === profile.id) {
            return (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 text-sm text-foreground/70"
              >
                <span>Profile deleted.</span>
                <button
                  onClick={handleUndoDelete}
                  className="flex items-center gap-1 font-medium text-foreground hover:underline"
                >
                  <Undo2 size={14} />
                  Undo
                </button>
              </li>
            );
          }

          const isActive = profile.id === activeProfileId;

          if (confirmingId === profile.id) {
            return (
              <li
                key={profile.id}
                className="flex items-center justify-between gap-2 rounded-md border border-border p-2.5 text-sm"
              >
                <span className="text-foreground/70">Delete &ldquo;{profile.name}&rdquo;?</span>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleDeleteConfirm(profile)}
                    className="text-xs font-medium text-state-error hover:underline"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmingId(null)}
                    className="text-xs font-medium text-foreground/60 hover:underline"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            );
          }

          return (
            <li
              key={profile.id}
              className={`flex items-center gap-2 rounded-md border p-2.5 ${
                isActive ? "border-foreground/30 bg-background" : "border-border"
              }`}
            >
              <button
                onClick={() => handleSelectActive(profile.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <span
                  aria-hidden="true"
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    isActive ? "border-state-valid bg-state-valid text-background" : "border-border"
                  }`}
                >
                  {isActive && <Check size={10} />}
                </span>
                <span className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{profile.name}</p>
                  <p className="truncate text-xs text-foreground/60">
                    {providers[profile.providerId].label} · {profile.model}
                  </p>
                </span>
              </button>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => setEditing(profile)}
                  aria-label={`Edit ${profile.name}`}
                  disabled={pendingDelete !== null}
                  className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => setConfirmingId(profile.id)}
                  aria-label={`Delete ${profile.name}`}
                  disabled={pendingDelete !== null}
                  className="flex h-7 w-7 items-center justify-center rounded text-foreground/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
