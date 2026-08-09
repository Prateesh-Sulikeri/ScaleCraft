import { describe, it, expect, afterEach } from "vitest";
import { buildReportUrl, logTourEvent, dumpTourLog, clearTourLog } from "./tour-log";

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

  describe("buildReportUrl", () => {
    it("points at this repo's GitHub new-issue page", () => {
      const url = buildReportUrl("design-editor", "fix-edge");
      expect(url.startsWith("https://github.com/Prateesh-Sulikeri/ScaleCraft/issues/new?")).toBe(true);
    });

    it("names the tour and step in the prefilled title", () => {
      const url = buildReportUrl("design-editor", "fix-edge");
      const title = new URL(url).searchParams.get("title")!;
      expect(title).toContain("design-editor");
      expect(title).toContain("fix-edge");
    });

    it("includes the current log buffer's events in the prefilled body", () => {
      logTourEvent("design-editor", { type: "predicate-threw", stepId: "fix-edge", message: "boom" });
      const url = buildReportUrl("design-editor", "fix-edge");
      const body = new URL(url).searchParams.get("body")!;
      expect(body).toContain("predicate-threw");
      expect(body).toContain("boom");
    });

    it("works with an empty log — nothing to report yet is not an error case", () => {
      const url = buildReportUrl("design-editor", "welcome");
      expect(() => new URL(url)).not.toThrow();
    });

    it("truncates a very large buffer rather than producing an unbounded URL", () => {
      for (let i = 0; i < 200; i++) {
        logTourEvent("design-editor", { type: "step-entered", stepId: `step-with-a-somewhat-long-id-${i}` });
      }
      const url = buildReportUrl("design-editor", "fix-edge");
      const body = new URL(url).searchParams.get("body")!;
      expect(body).toContain("truncated");
      expect(url.length).toBeLessThan(20000);
    });
  });
});
