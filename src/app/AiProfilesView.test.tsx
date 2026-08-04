import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AiProfilesView } from "./AiProfilesView";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { AiProfile } from "@/ai/profiles";

const listProfilesMock = vi.fn();
const createProfileMock = vi.fn();
const updateProfileMock = vi.fn();
const deleteProfileMock = vi.fn();
const restoreProfileMock = vi.fn();
const setActiveProfileIdMock = vi.fn();
const getActiveProfileMock = vi.fn();

vi.mock("@/ai/profiles", () => ({
  listProfiles: (...args: unknown[]) => listProfilesMock(...args),
  createProfile: (...args: unknown[]) => createProfileMock(...args),
  updateProfile: (...args: unknown[]) => updateProfileMock(...args),
  deleteProfile: (...args: unknown[]) => deleteProfileMock(...args),
  restoreProfile: (...args: unknown[]) => restoreProfileMock(...args),
  setActiveProfileId: (...args: unknown[]) => setActiveProfileIdMock(...args),
  getActiveProfile: (...args: unknown[]) => getActiveProfileMock(...args),
}));

function makeProfile(overrides: Partial<AiProfile> = {}): AiProfile {
  return {
    id: "p1",
    name: "Work key",
    ...DEFAULT_AI_SETTINGS,
    apiKey: "sk-test",
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  };
}

describe("AiProfilesView", () => {
  beforeEach(() => {
    listProfilesMock.mockReset();
    createProfileMock.mockReset();
    updateProfileMock.mockReset();
    deleteProfileMock.mockReset().mockResolvedValue(undefined);
    restoreProfileMock.mockReset().mockResolvedValue(undefined);
    setActiveProfileIdMock.mockReset().mockResolvedValue(undefined);
    getActiveProfileMock.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows an empty state with a New Profile CTA when there are no profiles", async () => {
    listProfilesMock.mockResolvedValue([]);
    render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);

    expect(await screen.findByText(/No AI profiles yet/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /New Profile/ })).toBeInTheDocument();
  });

  it("renders the profile list with the active one marked", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    const p2 = makeProfile({ id: "p2", name: "Personal key", providerId: "xai", model: "grok-4" });
    listProfilesMock.mockResolvedValue([p1, p2]);
    render(<AiProfilesView activeProfileId="p2" onActiveProfileChange={vi.fn()} />);

    expect(await screen.findByText("Work key")).toBeInTheDocument();
    expect(screen.getByText("Personal key")).toBeInTheDocument();
    expect(screen.getByText(/xAI/)).toBeInTheDocument();
  });

  it("clicking the already-active profile row is a no-op", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByText("Work key"));

    expect(setActiveProfileIdMock).not.toHaveBeenCalled();
  });

  it("does not commit the initial profile list into state after the component unmounts first", async () => {
    let resolveList!: (profiles: AiProfile[]) => void;
    listProfilesMock.mockReturnValue(new Promise<AiProfile[]>((resolve) => (resolveList = resolve)));
    const { unmount } = render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);

    unmount();
    await act(async () => {
      resolveList([makeProfile({ id: "p1", name: "Work key" })]);
      await Promise.resolve();
    });
    // No assertion beyond "doesn't throw" - the cancelled guard is what
    // prevents a setState-after-unmount warning/crash here.
  });

  it("switches the active profile when a non-active row is clicked", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    const p2 = makeProfile({ id: "p2", name: "Personal key" });
    listProfilesMock.mockResolvedValue([p1, p2]);
    getActiveProfileMock.mockResolvedValue(p2);
    const onActiveProfileChange = vi.fn();
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={onActiveProfileChange} />);

    fireEvent.click(await screen.findByText("Personal key"));

    await waitFor(() => expect(setActiveProfileIdMock).toHaveBeenCalledWith("p2"));
    await waitFor(() => expect(onActiveProfileChange).toHaveBeenCalledWith(p2));
  });

  it("creates a new profile via the inline form and reports the new active profile", async () => {
    listProfilesMock.mockResolvedValue([]);
    // Deliberately not named "New Profile" — that string collides with the
    // "+ New Profile" CTA button's own text.
    const created = makeProfile({ id: "new-1", name: "Fresh Key" });
    createProfileMock.mockResolvedValue(created);
    getActiveProfileMock.mockResolvedValue(created);
    const onActiveProfileChange = vi.fn();
    render(<AiProfilesView activeProfileId={null} onActiveProfileChange={onActiveProfileChange} />);

    fireEvent.click(await screen.findByRole("button", { name: /New Profile/ }));
    fireEvent.change(await screen.findByLabelText("Profile name"), { target: { value: "Fresh Key" } });
    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "sk-new" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(createProfileMock).toHaveBeenCalled());
    expect(createProfileMock.mock.calls[0][0]).toMatchObject({ name: "Fresh Key", apiKey: "sk-new" });
    await waitFor(() => expect(onActiveProfileChange).toHaveBeenCalledWith(created));
    // Back on the list, showing the newly created profile.
    expect(await screen.findByText("Fresh Key")).toBeInTheDocument();
  });

  it("edits an existing profile via its pencil icon, leaving the other profile in the list untouched", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    const p2 = makeProfile({ id: "p2", name: "Personal key" });
    listProfilesMock.mockResolvedValue([p1, p2]);
    const updated = { ...p1, name: "Renamed" };
    updateProfileMock.mockResolvedValue(updated);
    getActiveProfileMock.mockResolvedValue(updated);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Work key" }));
    expect(await screen.findByLabelText("Profile name")).toHaveValue("Work key");

    fireEvent.change(screen.getByLabelText("Profile name"), { target: { value: "Renamed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(updateProfileMock).toHaveBeenCalledWith("p1", expect.objectContaining({ name: "Renamed" })));
    expect(await screen.findByText("Renamed")).toBeInTheDocument();
    expect(screen.getByText("Personal key")).toBeInTheDocument();
  });

  it("delete requires a confirm click before arming undo", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Work key" }));

    // Rendered as `Delete “Work key”?` — curly quotes (&ldquo;/&rdquo;), not straight ones.
    expect(screen.getByText((text) => text.startsWith("Delete") && text.includes("Work key"))).toBeInTheDocument();
    expect(deleteProfileMock).not.toHaveBeenCalled();
  });

  it("deletes immediately on confirm, and undo restores the profile and reverses the active-profile reassignment", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    const p2 = makeProfile({ id: "p2", name: "Personal key" });
    listProfilesMock.mockResolvedValue([p1, p2]);
    getActiveProfileMock.mockResolvedValueOnce(p2).mockResolvedValueOnce(p1);
    const onActiveProfileChange = vi.fn();
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={onActiveProfileChange} />);
    await screen.findByText("Work key");

    // Fake timers only from here — the initial async list load above already
    // settled under real timers, so RTL's own findBy* polling (which relies
    // on real setTimeout) never had to run concurrently with a fake clock
    // nobody is advancing.
    vi.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // Both the reassignment and the real delete happen synchronously on
    // confirm — durable immediately, regardless of what the UI does next
    // (close the panel, switch views, navigate away). No flush needed to
    // observe either call.
    expect(setActiveProfileIdMock).toHaveBeenCalledWith("p2");
    expect(deleteProfileMock).toHaveBeenCalledWith("p1");
    expect(screen.getByText("Profile deleted.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));

    // Undo's effect (restore + reassign + pendingDelete cleared) only lands
    // once its internal awaits resolve. No fake timer is scheduled at this
    // point (the delete's own timeout was already cleared), so
    // advanceTimersByTimeAsync has nothing to advance through and won't
    // drive the microtask queue — flush it directly instead.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(restoreProfileMock).toHaveBeenCalledWith(p1);
    expect(setActiveProfileIdMock).toHaveBeenCalledWith("p1");
    expect(screen.getByText("Work key")).toBeInTheDocument();
    expect(screen.queryByText("Profile deleted.")).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(6000);
    expect(restoreProfileMock).toHaveBeenCalledTimes(1);
  });

  it("drops the row from the local list once the undo window elapses without an undo click, without deleting it again", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);
    await screen.findByText("Work key");

    vi.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(deleteProfileMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Profile deleted.")).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(6000);

    expect(deleteProfileMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Work key")).not.toBeInTheDocument();
  });

  it("'Back to profiles' returns to the list without saving, while creating a new profile", async () => {
    listProfilesMock.mockResolvedValue([]);
    render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: /New Profile/ }));
    expect(await screen.findByLabelText("Profile name")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back to profiles" }));

    expect(screen.queryByLabelText("Profile name")).not.toBeInTheDocument();
    expect(screen.getByText(/No AI profiles yet/)).toBeInTheDocument();
    expect(createProfileMock).not.toHaveBeenCalled();
  });

  it("AiSettingsForm's own Cancel button also returns to the list without saving", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Edit Work key" }));
    expect(await screen.findByLabelText("Profile name")).toHaveValue("Work key");

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByLabelText("Profile name")).not.toBeInTheDocument();
    expect(screen.getByText("Work key")).toBeInTheDocument();
    expect(updateProfileMock).not.toHaveBeenCalled();
  });

  it("'Cancel' on the delete confirmation dismisses it without deleting", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);

    fireEvent.click(await screen.findByRole("button", { name: "Delete Work key" }));
    expect(screen.getByText((text) => text.startsWith("Delete") && text.includes("Work key"))).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText((text) => text.startsWith("Delete") && text.includes("Work key"))).not.toBeInTheDocument();
    expect(deleteProfileMock).not.toHaveBeenCalled();
  });

  it("deleting the only (active) profile reassigns active to null rather than throwing", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    getActiveProfileMock.mockResolvedValue(null);
    render(<AiProfilesView activeProfileId="p1" onActiveProfileChange={vi.fn()} />);
    await screen.findByText("Work key");

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(setActiveProfileIdMock).toHaveBeenCalledWith(null);
  });

  it("undoing the delete of a profile that was not active does not reassign active", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    const p2 = makeProfile({ id: "p2", name: "Personal key" });
    listProfilesMock.mockResolvedValue([p1, p2]);
    render(<AiProfilesView activeProfileId="p2" onActiveProfileChange={vi.fn()} />);
    await screen.findByText("Work key");

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    setActiveProfileIdMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(restoreProfileMock).toHaveBeenCalledWith(p1);
    expect(setActiveProfileIdMock).not.toHaveBeenCalled();
  });

  it("commits the delete even if the component unmounts before the undo window elapses", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    const { unmount } = render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);
    await screen.findByText("Work key");

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    // The real Dexie delete already happened synchronously on confirm —
    // unmounting straight after (closing the panel, switching views,
    // navigating away) can no longer lose it, unlike the old
    // timeout-deferred version of this flow.
    expect(deleteProfileMock).toHaveBeenCalledWith("p1");
    unmount();
  });
});
