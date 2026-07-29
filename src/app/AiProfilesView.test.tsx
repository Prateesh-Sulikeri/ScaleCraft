import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { AiProfilesView } from "./AiProfilesView";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { AiProfile } from "@/ai/profiles";

const listProfilesMock = vi.fn();
const createProfileMock = vi.fn();
const updateProfileMock = vi.fn();
const deleteProfileMock = vi.fn();
const setActiveProfileIdMock = vi.fn();
const getActiveProfileMock = vi.fn();

vi.mock("@/ai/profiles", () => ({
  listProfiles: (...args: unknown[]) => listProfilesMock(...args),
  createProfile: (...args: unknown[]) => createProfileMock(...args),
  updateProfile: (...args: unknown[]) => updateProfileMock(...args),
  deleteProfile: (...args: unknown[]) => deleteProfileMock(...args),
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

  it("edits an existing profile via its pencil icon", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
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

  it("undo restores the profile and reverses an active-profile reassignment without ever deleting it", async () => {
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

    // handleDeleteConfirm calls setActiveProfileId synchronously (it's the
    // function *call*, not what happens after it resolves, that's sync) —
    // no flush needed to observe this call.
    expect(setActiveProfileIdMock).toHaveBeenCalledWith("p2");
    expect(screen.getByText("Profile deleted.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    expect(setActiveProfileIdMock).toHaveBeenCalledWith("p1");

    // Undo's *effect* on the row (pendingDelete cleared) only lands once its
    // two internal awaits resolve. No fake timer is scheduled at this point
    // (the delete's own timeout was already cleared), so
    // advanceTimersByTimeAsync has nothing to advance through and won't
    // drive the microtask queue — flush it directly instead.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(screen.getByText("Work key")).toBeInTheDocument();
    expect(screen.queryByText("Profile deleted.")).not.toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(6000);
    expect(deleteProfileMock).not.toHaveBeenCalled();
  });

  it("commits the delete once the undo window elapses without an undo click", async () => {
    const p1 = makeProfile({ id: "p1", name: "Work key" });
    listProfilesMock.mockResolvedValue([p1]);
    render(<AiProfilesView activeProfileId={null} onActiveProfileChange={vi.fn()} />);
    await screen.findByText("Work key");

    vi.useFakeTimers();

    fireEvent.click(screen.getByRole("button", { name: "Delete Work key" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(screen.getByText("Profile deleted.")).toBeInTheDocument();

    await vi.advanceTimersByTimeAsync(6000);

    expect(deleteProfileMock).toHaveBeenCalledWith("p1");
    expect(screen.queryByText("Work key")).not.toBeInTheDocument();
  });
});
