import { describe, it, expect } from "vitest";
import { aiCritiqueSchema, parseAiResponse } from "./schema";

const validSection = (overrides: Partial<{ title: string; body: string; relatedNodeIds: string[] }> = {}) => ({
  title: "T".repeat(80),
  body: "B".repeat(1500),
  relatedNodeIds: [],
  ...overrides,
});

const baseCritique = () => ({
  summary: "S".repeat(600),
  sections: [validSection()],
  tradeoffs: [],
});

describe("aiCritiqueSchema", () => {
  it("accepts summary at exactly 600 chars, rejects 601", () => {
    expect(aiCritiqueSchema.safeParse(baseCritique()).success).toBe(true);
    expect(
      aiCritiqueSchema.safeParse({ ...baseCritique(), summary: "S".repeat(601) }).success,
    ).toBe(false);
  });

  it("accepts up to 6 sections, rejects 7", () => {
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: Array.from({ length: 6 }, () => validSection()),
      }).success,
    ).toBe(true);
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: Array.from({ length: 7 }, () => validSection()),
      }).success,
    ).toBe(false);
  });

  it("accepts a section title at exactly 80 chars, rejects 81", () => {
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: [validSection({ title: "T".repeat(80) })],
      }).success,
    ).toBe(true);
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: [validSection({ title: "T".repeat(81) })],
      }).success,
    ).toBe(false);
  });

  it("accepts a section body at exactly 1500 chars, rejects 1501", () => {
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: [validSection({ body: "B".repeat(1500) })],
      }).success,
    ).toBe(true);
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        sections: [validSection({ body: "B".repeat(1501) })],
      }).success,
    ).toBe(false);
  });

  it("defaults a section's relatedNodeIds to [] when omitted", () => {
    const withoutIds = { title: "T".repeat(80), body: "B".repeat(1500) };
    const result = aiCritiqueSchema.safeParse({ ...baseCritique(), sections: [withoutIds] });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.sections[0].relatedNodeIds).toEqual([]);
  });

  it("accepts up to 5 tradeoffs, rejects 6", () => {
    const tradeoff = { decision: "d", cost: "c", benefit: "b" };
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        tradeoffs: Array.from({ length: 5 }, () => tradeoff),
      }).success,
    ).toBe(true);
    expect(
      aiCritiqueSchema.safeParse({
        ...baseCritique(),
        tradeoffs: Array.from({ length: 6 }, () => tradeoff),
      }).success,
    ).toBe(false);
  });

  it("defaults tradeoffs to [] when omitted entirely", () => {
    const withoutTradeoffs = { summary: "S".repeat(600), sections: [validSection()] };
    const result = aiCritiqueSchema.safeParse(withoutTradeoffs);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.tradeoffs).toEqual([]);
  });
});

describe("parseAiResponse", () => {
  it("strips a ```json fence and parses the content", () => {
    const raw = "```json\n" + JSON.stringify(baseCritique()) + "\n```";
    expect(parseAiResponse(raw, []).status).toBe("ok");
  });

  it("strips a bare ``` fence (no json tag) and parses the content", () => {
    const raw = "```\n" + JSON.stringify(baseCritique()) + "\n```";
    expect(parseAiResponse(raw, []).status).toBe("ok");
  });

  it("parses unfenced JSON directly", () => {
    expect(parseAiResponse(JSON.stringify(baseCritique()), []).status).toBe("ok");
  });

  it("returns an error result, never throws, on malformed JSON", () => {
    expect(() => parseAiResponse("{not json", [])).not.toThrow();
    expect(parseAiResponse("{not json", []).status).toBe("error");
  });

  it("returns an error result, never throws, when a required field is missing", () => {
    const missingSummary = JSON.stringify({ sections: [], tradeoffs: [] });
    expect(() => parseAiResponse(missingSummary, [])).not.toThrow();
    expect(parseAiResponse(missingSummary, []).status).toBe("error");
  });

  it("filters relatedNodeIds against the real node id set, keeping only real ones", () => {
    const withIds = {
      ...baseCritique(),
      sections: [validSection({ relatedNodeIds: ["real-1", "hallucinated", "real-2"] })],
    };
    const result = parseAiResponse(JSON.stringify(withIds), ["real-1", "real-2"]);
    expect(result.status).toBe("ok");
    if (result.status === "ok") {
      expect(result.critique.sections[0].relatedNodeIds).toEqual(["real-1", "real-2"]);
    }
  });
});
