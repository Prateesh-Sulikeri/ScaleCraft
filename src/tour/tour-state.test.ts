import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { parseTourState, serializeTourState, tourStateKey, useTourState, type TourRunState } from "./tour-state";

describe("tourStateKey", () => {
  it("scopes state per tour id", () => {
    expect(tourStateKey("design-editor")).toBe("sc-tour-design-editor");
  });
});

describe("parseTourState", () => {
  it("treats a missing key as never seen, so a first visit auto-starts", () => {
    expect(parseTourState(null)).toEqual({ status: "unseen" });
    expect(parseTourState("")).toEqual({ status: "unseen" });
  });

  it("round-trips every run state", () => {
    const states: TourRunState[] = [
      { status: "unseen" },
      { status: "running", stepIndex: 7 },
      { status: "paused", stepIndex: 0 },
      { status: "paused", stepIndex: 4, pauseReason: "user" },
      { status: "paused", stepIndex: 4, pauseReason: "surface-loss" },
      { status: "skipped" },
      { status: "completed" },
    ];
    for (const state of states) {
      expect(parseTourState(serializeTourState(state))).toEqual(state);
    }
  });

  it("drops an unrecognised pauseReason rather than trusting it", () => {
    expect(parseTourState(JSON.stringify({ status: "paused", stepIndex: 2, pauseReason: "banana" }))).toEqual({
      status: "paused",
      stepIndex: 2,
    });
  });

  it("degrades corrupt or unrecognised values to unseen rather than throwing", () => {
    // A bad localStorage value should cost a learner a repeated tour, not a
    // crashed workspace.
    expect(parseTourState("not json at all")).toEqual({ status: "unseen" });
    expect(parseTourState("null")).toEqual({ status: "unseen" });
    expect(parseTourState('"a string"')).toEqual({ status: "unseen" });
    expect(parseTourState(JSON.stringify({ status: "banana" }))).toEqual({ status: "unseen" });
  });

  it("repairs a positional state that lost or corrupted its step index", () => {
    expect(parseTourState(JSON.stringify({ status: "running" }))).toEqual({ status: "running", stepIndex: 0 });
    expect(parseTourState(JSON.stringify({ status: "paused", stepIndex: -3 }))).toEqual({
      status: "paused",
      stepIndex: 0,
    });
    expect(parseTourState(JSON.stringify({ status: "paused", stepIndex: "4" }))).toEqual({
      status: "paused",
      stepIndex: 0,
    });
  });

  it("ignores a step index on terminal states", () => {
    expect(parseTourState(JSON.stringify({ status: "completed", stepIndex: 12 }))).toEqual({ status: "completed" });
  });
});

describe("serializeTourState", () => {
  it("stamps a version field, purely additive - nothing reads it yet", () => {
    const raw = serializeTourState({ status: "running", stepIndex: 3 });
    expect(JSON.parse(raw)).toEqual({ version: 1, status: "running", stepIndex: 3 });
    // parseTourState already ignores unknown keys, so the extra field is a
    // non-event for every existing reader - no migration needed.
    expect(parseTourState(raw)).toEqual({ status: "running", stepIndex: 3 });
  });

  it("still parses a value persisted before the version field existed", () => {
    const preVersionRaw = JSON.stringify({ status: "paused", stepIndex: 5, pauseReason: "user" });
    expect(parseTourState(preVersionRaw)).toEqual({ status: "paused", stepIndex: 5, pauseReason: "user" });
  });
});

describe("useTourState", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("adopts a write made by another tab, forwarded via the native storage event", () => {
    // A real cross-tab write never fires a storage event in the tab that
    // made it - only in every OTHER tab. Simulated here as two steps: the
    // localStorage mutation itself (what another tab's setState already
    // did), then the native event this tab's own listener reacts to.
    const key = tourStateKey("design-editor");
    const { result } = renderHook(() => useTourState("design-editor"));
    expect(result.current.state).toEqual({ status: "unseen" });

    act(() => {
      localStorage.setItem(key, serializeTourState({ status: "running", stepIndex: 4 }));
      window.dispatchEvent(new StorageEvent("storage", { key }));
    });

    expect(result.current.state).toEqual({ status: "running", stepIndex: 4 });
  });

  it("ignores a storage event for an unrelated key change to a different tour's state", () => {
    const { result } = renderHook(() => useTourState("design-editor"));

    act(() => {
      localStorage.setItem(tourStateKey("some-other-tour"), serializeTourState({ status: "completed" }));
      window.dispatchEvent(new StorageEvent("storage", { key: tourStateKey("some-other-tour") }));
    });

    expect(result.current.state).toEqual({ status: "unseen" });
  });
});
