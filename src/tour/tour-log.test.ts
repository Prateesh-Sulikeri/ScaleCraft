import { describe, it, expect, afterEach } from "vitest";
import { logTourEvent, dumpTourLog, clearTourLog } from "./tour-log";

afterEach(() => {
  clearTourLog();
});

describe("tour-log", () => {
  it("starts empty", () => {
    expect(dumpTourLog()).toEqual([]);
  });

  it("records an event with its tourId and a timestamp", () => {
    logTourEvent("design-editor", { type: "predicate-threw", stepId: "fix-edge", message: "boom" });

    const [entry] = dumpTourLog();
    expect(entry).toMatchObject({ tourId: "design-editor", type: "predicate-threw", stepId: "fix-edge", message: "boom" });
    expect(typeof entry.at).toBe("number");
  });

  it("keeps entries in the order they were logged", () => {
    logTourEvent("design-editor", { type: "step-entered", stepId: "welcome" });
    logTourEvent("design-editor", { type: "step-entered", stepId: "canvas-intro" });

    expect(dumpTourLog().map((e) => (e as { stepId: string }).stepId)).toEqual(["welcome", "canvas-intro"]);
  });

  it("caps at 200 entries, dropping the oldest first", () => {
    for (let i = 0; i < 205; i++) {
      logTourEvent("design-editor", { type: "step-entered", stepId: `step-${i}` });
    }

    const entries = dumpTourLog();
    expect(entries).toHaveLength(200);
    expect((entries[0] as { stepId: string }).stepId).toBe("step-5");
    expect((entries[199] as { stepId: string }).stepId).toBe("step-204");
  });

  it("clearTourLog empties the buffer", () => {
    logTourEvent("design-editor", { type: "step-entered", stepId: "welcome" });
    clearTourLog();
    expect(dumpTourLog()).toEqual([]);
  });

  it("exposes window.__scaleTour.dump/clear for manual dev inspection", () => {
    logTourEvent("design-editor", { type: "step-entered", stepId: "welcome" });
    const scaleTour = (window as unknown as { __scaleTour: { dump: () => unknown[]; clear: () => void } }).__scaleTour;
    expect(scaleTour.dump()).toHaveLength(1);
    scaleTour.clear();
    expect(dumpTourLog()).toEqual([]);
  });
});
