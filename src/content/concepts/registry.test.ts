import { describe, expect, it } from "vitest";
import { buildGlossaryRegistry, getGlossaryTerm } from "./registry";
import type { GlossaryTermDefinition } from "./types";

describe("getGlossaryTerm", () => {
  it("finds a known term by id", () => {
    expect(getGlossaryTerm("round-robin")?.title).toBe("Round Robin");
  });

  it("returns undefined for an unknown id", () => {
    expect(getGlossaryTerm("not-a-real-term")).toBeUndefined();
  });
});

describe("buildGlossaryRegistry", () => {
  const term = (id: string): GlossaryTermDefinition => ({ id, title: id, body: id });

  it("returns the terms unchanged when ids are unique", () => {
    const terms = [term("a"), term("b")];
    expect(buildGlossaryRegistry(terms)).toEqual(terms);
  });

  it("throws when two terms share an id", () => {
    expect(() => buildGlossaryRegistry([term("dup"), term("dup")])).toThrow(
      /Duplicate glossary term id/,
    );
  });
});
