import { describe, it, expect } from "vitest";
import { parseTourState, serializeTourState, tourStateKey, type TourRunState } from "./tour-state";

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
      { status: "skipped" },
      { status: "completed" },
    ];
    for (const state of states) {
      expect(parseTourState(serializeTourState(state))).toEqual(state);
    }
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
