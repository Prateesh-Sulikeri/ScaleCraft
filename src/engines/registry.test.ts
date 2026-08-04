import { describe, it, expect } from "vitest";
import { getEngine } from "./registry";

describe("engines/registry", () => {
  it("getEngine('validation') dynamically loads the validation engine", async () => {
    const engine = await getEngine("validation");
    expect(engine.id).toBe("validation");
    expect(engine.label).toBe("Validation");
  });

  it("getEngine('deep-check') dynamically loads the deep-check engine", async () => {
    const engine = await getEngine("deep-check");
    expect(engine.id).toBe("deep-check");
    expect(engine.label).toBe("Deep Check");
  });
});
