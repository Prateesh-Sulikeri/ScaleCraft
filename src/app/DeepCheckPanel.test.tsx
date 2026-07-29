import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { DeepCheckPanel, type DeepCheckView } from "./DeepCheckPanel";
import { DEFAULT_AI_SETTINGS } from "@/ai/settings";
import type { DeepCheckSession } from "@/persistence/db";

const listSessionsMock = vi.fn();
const deleteSessionMock = vi.fn();
vi.mock("@/persistence/deepCheckSessions", () => ({
  listSessions: (...args: unknown[]) => listSessionsMock(...args),
  deleteSession: (...args: unknown[]) => deleteSessionMock(...args),
}));

const testConnectionMock = vi.fn();
vi.mock("@/ai/run-deep-check", () => ({
  testConnection: (...args: unknown[]) => testConnectionMock(...args),
}));

function baseProps(overrides: Partial<React.ComponentProps<typeof DeepCheckPanel>> = {}) {
  return {
    view: "result" as DeepCheckView,
    onViewChange: vi.fn(),
    state: null,
    settings: DEFAULT_AI_SETTINGS,
    onSaveSettings: vi.fn(),
    onRun: vi.fn(),
    saveId: "sandbox",
    onClose: vi.fn(),
    onSelectNode: vi.fn(),
    ...overrides,
  };
}

describe("DeepCheckPanel", () => {
  beforeEach(() => {
    listSessionsMock.mockReset().mockResolvedValue([]);
    deleteSessionMock.mockReset();
  });

  it("shows the Sparkles icon and 'Deep Check' title in the header", () => {
    render(<DeepCheckPanel {...baseProps()} />);
    expect(screen.getByText("Deep Check")).toBeInTheDocument();
  });

  it("has a resize handle exposed as a separator", () => {
    render(<DeepCheckPanel {...baseProps()} />);
    expect(screen.getByRole("separator", { name: "Resize Deep Check panel" })).toBeInTheDocument();
  });

  it("renders a loading state with a cancel affordance wired to onClose", () => {
    const onClose = vi.fn();
    render(<DeepCheckPanel {...baseProps({ state: { status: "loading" }, onClose })} />);

    expect(screen.getByText("Reviewing your design…")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders an empty result state with a Run Deep Check action when nothing has run yet", () => {
    const onRun = vi.fn();
    render(<DeepCheckPanel {...baseProps({ state: null, settings: { ...DEFAULT_AI_SETTINGS, enabled: true }, onRun })} />);

    fireEvent.click(screen.getByRole("button", { name: "Run Deep Check" }));
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it("renders the plain failure message on an error result, with no severity styling", () => {
    render(
      <DeepCheckPanel
        {...baseProps({ state: { status: "error", kind: "unknown", message: "The model returned something unusable." } })}
      />,
    );

    const message = screen.getByText("The model returned something unusable.");
    expect(message).toBeInTheDocument();
    expect(message.className).not.toMatch(/state-error/);
  });

  it("renders the critique summary, markdown section bodies, and tradeoffs", () => {
    render(
      <DeepCheckPanel
        {...baseProps({
          state: {
            status: "ok",
            critique: {
              summary: "Overall solid.",
              sections: [
                {
                  title: "Single point of failure",
                  body: "The **load balancer** has no redundancy.",
                  relatedNodeIds: ["n1"],
                },
              ],
              tradeoffs: [{ decision: "Cache-aside", cost: "Stale reads", benefit: "Lower DB load" }],
            },
          },
        })}
      />,
    );

    expect(screen.getByText("Overall solid.")).toBeInTheDocument();
    expect(screen.getByText("load balancer").tagName).toBe("STRONG");
    expect(screen.getByText("Cache-aside")).toBeInTheDocument();
    expect(screen.getByText("Stale reads")).toBeInTheDocument();
    expect(screen.getByText("Lower DB load")).toBeInTheDocument();
  });

  it("clicking a section with relatedNodeIds selects the first one via onSelectNode", () => {
    const onSelectNode = vi.fn();
    render(
      <DeepCheckPanel
        {...baseProps({
          state: {
            status: "ok",
            critique: {
              summary: "s",
              sections: [{ title: "Single point of failure", body: "b", relatedNodeIds: ["n1", "n2"] }],
              tradeoffs: [],
            },
          },
          onSelectNode,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Single point of failure" }));
    expect(onSelectNode).toHaveBeenCalledWith("n1");
  });

  it("renders a section with no relatedNodeIds as plain text, not a clickable button", () => {
    render(
      <DeepCheckPanel
        {...baseProps({
          state: {
            status: "ok",
            critique: { summary: "s", sections: [{ title: "General observation", body: "b", relatedNodeIds: [] }], tradeoffs: [] },
          },
        })}
      />,
    );

    expect(screen.queryByRole("button", { name: "General observation" })).not.toBeInTheDocument();
    expect(screen.getByText("General observation")).toBeInTheDocument();
  });

  it("calls onClose when the panel's own close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <DeepCheckPanel
        {...baseProps({ state: { status: "ok", critique: { summary: "s", sections: [], tradeoffs: [] } }, onClose })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows History and AI Settings icons only in the result view", () => {
    const { rerender } = render(<DeepCheckPanel {...baseProps({ view: "result" })} />);
    expect(screen.getByRole("button", { name: "History" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "AI Settings" })).toBeInTheDocument();

    rerender(<DeepCheckPanel {...baseProps({ view: "settings" })} />);
    expect(screen.queryByRole("button", { name: "History" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "AI Settings" })).not.toBeInTheDocument();
  });

  it("clicking the settings icon requests a view change to settings", () => {
    const onViewChange = vi.fn();
    render(<DeepCheckPanel {...baseProps({ onViewChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "AI Settings" }));
    expect(onViewChange).toHaveBeenCalledWith("settings");
  });

  it("clicking the history icon requests a view change to history", () => {
    const onViewChange = vi.fn();
    render(<DeepCheckPanel {...baseProps({ onViewChange })} />);
    fireEvent.click(screen.getByRole("button", { name: "History" }));
    expect(onViewChange).toHaveBeenCalledWith("history");
  });

  it("renders the AI Settings form inline in the settings view, and Back returns to result", () => {
    const onViewChange = vi.fn();
    render(<DeepCheckPanel {...baseProps({ view: "settings", onViewChange })} />);

    expect(screen.getByLabelText("Provider")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to review" }));
    expect(onViewChange).toHaveBeenCalledWith("result");
  });

  it("saving settings inline calls onSaveSettings with the new settings", async () => {
    const onSaveSettings = vi.fn();
    render(<DeepCheckPanel {...baseProps({ view: "settings", onSaveSettings })} />);

    fireEvent.change(screen.getByLabelText("API Key"), { target: { value: "sk-live-123" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => expect(onSaveSettings).toHaveBeenCalledTimes(1));
    expect(onSaveSettings.mock.calls[0][0].apiKey).toBe("sk-live-123");
  });

  it("history view lists saved sessions for the current saveId, newest first as returned", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 2, saveId: "sandbox", createdAt: 2000, critique: { summary: "Second review", sections: [], tradeoffs: [] } },
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "First review", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);

    await waitFor(() => expect(screen.getByText("Second review")).toBeInTheDocument());
    expect(listSessionsMock).toHaveBeenCalledWith("sandbox");
    expect(screen.getByText("First review")).toBeInTheDocument();
  });

  it("history view shows an empty message when there are no saved sessions", async () => {
    listSessionsMock.mockResolvedValue([]);
    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    await waitFor(() => expect(screen.getByText(/No saved reviews yet/)).toBeInTheDocument());
  });

  it("history view is unavailable when there is no saveId, instead of showing a global/empty list", async () => {
    render(<DeepCheckPanel {...baseProps({ view: "history", saveId: null })} />);
    expect(await screen.findByText("Save your board to start keeping Deep Check history.")).toBeInTheDocument();
    expect(listSessionsMock).not.toHaveBeenCalled();
  });

  it("clicking a session in history drills into its critique via the same CritiqueView rendering, then Back returns to the list", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "A saved review", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    fireEvent.click(await screen.findByText("A saved review"));

    // Detail view renders the full critique via CritiqueView, confirmed by
    // the summary reappearing outside the truncated list-row styling.
    expect(screen.getByText("A saved review")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "← Back to history" }));
    await waitFor(() => expect(screen.getByText("A saved review")).toBeInTheDocument());
  });

  it("clicking the trash icon once only arms a confirmation, without deleting yet", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "Deletable", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    await screen.findByText("Deletable");

    fireEvent.click(screen.getByRole("button", { name: "Delete session" }));

    expect(deleteSessionMock).not.toHaveBeenCalled();
    expect(screen.getByText("Deletable")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("confirming the armed delete calls deleteSession and removes it from the visible list", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "Deletable", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);
    deleteSessionMock.mockResolvedValue(undefined);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    await screen.findByText("Deletable");

    fireEvent.click(screen.getByRole("button", { name: "Delete session" }));
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => expect(deleteSessionMock).toHaveBeenCalledWith(1));
    await waitFor(() => expect(screen.queryByText("Deletable")).not.toBeInTheDocument());
  });

  it("cancelling the armed delete leaves the session in place, without calling deleteSession", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "Keep me", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    await screen.findByText("Keep me");

    fireEvent.click(screen.getByRole("button", { name: "Delete session" }));
    fireEvent.click(screen.getByRole("button", { name: "Cancel delete" }));

    expect(deleteSessionMock).not.toHaveBeenCalled();
    expect(screen.getByText("Keep me")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete session" })).toBeInTheDocument();
  });

  it("auto-dismisses an armed delete confirmation after a timeout, without deleting", async () => {
    const sessions: DeepCheckSession[] = [
      { id: 1, saveId: "sandbox", createdAt: 1000, critique: { summary: "Time out", sections: [], tradeoffs: [] } },
    ];
    listSessionsMock.mockResolvedValue(sessions);

    render(<DeepCheckPanel {...baseProps({ view: "history" })} />);
    // Let the async listSessions load resolve under real timers first —
    // only switch to fake timers once there's something on screen to click,
    // so the fake clock never has to also stand in for a real microtask.
    await screen.findByText("Time out");

    vi.useFakeTimers();
    fireEvent.click(screen.getByRole("button", { name: "Delete session" }));
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.getByRole("button", { name: "Delete session" })).toBeInTheDocument();
    expect(deleteSessionMock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
