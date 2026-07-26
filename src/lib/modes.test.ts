import { describe, expect, it } from "vitest";
import { modeColorVar, modeDescription, modeLabel, modeTagline, type AppMode } from "./modes";

const ALL_MODES: AppMode[] = ["sandbox", "building-blocks", "real-world-extraction"];

const RECORDS: Record<string, Record<AppMode, string>> = {
  modeLabel,
  modeColorVar,
  modeTagline,
  modeDescription,
};

describe("mode records", () => {
  it("has a non-empty string entry for every AppMode in every record", () => {
    // Guards against forgetting to add an entry to one of these records when
    // a new AppMode is introduced.
    for (const [recordName, record] of Object.entries(RECORDS)) {
      for (const mode of ALL_MODES) {
        expect(record[mode], `${recordName}.${mode}`).toBeTruthy();
        expect(typeof record[mode]).toBe("string");
      }
    }
  });

  it("modeColorVar references the matching CSS custom property for each mode", () => {
    expect(modeColorVar.sandbox).toBe("var(--mode-sandbox)");
    expect(modeColorVar["building-blocks"]).toBe("var(--mode-building-blocks)");
    expect(modeColorVar["real-world-extraction"]).toBe("var(--mode-real-world-extraction)");
  });

  it("modeLabel has the expected human-readable labels", () => {
    expect(modeLabel.sandbox).toBe("Sandbox");
    expect(modeLabel["building-blocks"]).toBe("Building Blocks");
    expect(modeLabel["real-world-extraction"]).toBe("Real World Extraction");
  });
});
