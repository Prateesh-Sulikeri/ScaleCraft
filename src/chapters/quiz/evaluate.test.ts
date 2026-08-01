import { describe, it, expect } from "vitest";
import { evaluateAnswer } from "./evaluate";
import type { QuizQuestion } from "@/content/chapters/types";

function question(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: "q1",
    kind: "single",
    difficulty: 1,
    prompt: "p",
    options: [
      { id: "a", label: "A", explanationMd: "e", correct: true },
      { id: "b", label: "B", explanationMd: "e", correct: false },
    ],
    ...overrides,
  };
}

describe("evaluateAnswer", () => {
  it("single: correct when the selected option is the correct one", () => {
    expect(evaluateAnswer(question(), { kind: "single", optionId: "a" })).toEqual({ correct: true });
  });

  it("single: incorrect when the selected option is not the correct one", () => {
    expect(evaluateAnswer(question(), { kind: "single", optionId: "b" })).toEqual({ correct: false });
  });

  it("estimate: same evaluation as single", () => {
    expect(evaluateAnswer(question({ kind: "estimate" }), { kind: "estimate", optionId: "a" })).toEqual({
      correct: true,
    });
  });

  it("diagram: same evaluation as single", () => {
    expect(evaluateAnswer(question({ kind: "diagram" }), { kind: "diagram", optionId: "b" })).toEqual({
      correct: false,
    });
  });

  describe("multi", () => {
    const q = question({
      kind: "multi",
      options: [
        { id: "a", label: "A", explanationMd: "e", correct: true },
        { id: "b", label: "B", explanationMd: "e", correct: true },
        { id: "c", label: "C", explanationMd: "e", correct: false },
      ],
    });

    it("correct only when the selected set exactly matches the correct set", () => {
      expect(evaluateAnswer(q, { kind: "multi", optionIds: ["a", "b"] })).toEqual({ correct: true });
    });

    it("order of selection does not matter", () => {
      expect(evaluateAnswer(q, { kind: "multi", optionIds: ["b", "a"] })).toEqual({ correct: true });
    });

    it("incorrect when missing a correct option", () => {
      expect(evaluateAnswer(q, { kind: "multi", optionIds: ["a"] })).toEqual({ correct: false });
    });

    it("incorrect when including an extra, wrong option", () => {
      expect(evaluateAnswer(q, { kind: "multi", optionIds: ["a", "b", "c"] })).toEqual({ correct: false });
    });
  });

  describe("ordering", () => {
    const q = question({
      kind: "ordering",
      options: [
        { id: "a", label: "A", explanationMd: "e", correct: false },
        { id: "b", label: "B", explanationMd: "e", correct: false },
        { id: "c", label: "C", explanationMd: "e", correct: false },
      ],
      correctOrder: ["a", "b", "c"],
    });

    it("correct only on the exact sequence", () => {
      expect(evaluateAnswer(q, { kind: "ordering", order: ["a", "b", "c"] })).toEqual({ correct: true });
    });

    it("incorrect on a swapped sequence", () => {
      expect(evaluateAnswer(q, { kind: "ordering", order: ["b", "a", "c"] })).toEqual({ correct: false });
    });

    it("incorrect on a shorter sequence", () => {
      expect(evaluateAnswer(q, { kind: "ordering", order: ["a", "b"] })).toEqual({ correct: false });
    });
  });

  describe("matching", () => {
    const q = question({
      kind: "matching",
      options: [
        { id: "opt-latency", label: "Latency", explanationMd: "e", correct: false },
        { id: "opt-throughput", label: "Throughput", explanationMd: "e", correct: false },
      ],
      pairs: [
        ["p99 response time", "opt-latency"],
        ["requests per second", "opt-throughput"],
      ],
    });

    it("correct only when every pair matches", () => {
      expect(
        evaluateAnswer(q, {
          kind: "matching",
          selections: { "p99 response time": "opt-latency", "requests per second": "opt-throughput" },
        }),
      ).toEqual({ correct: true });
    });

    it("incorrect when one pair is wrong", () => {
      expect(
        evaluateAnswer(q, {
          kind: "matching",
          selections: { "p99 response time": "opt-throughput", "requests per second": "opt-throughput" },
        }),
      ).toEqual({ correct: false });
    });

    it("incorrect when a pair is missing from the selection", () => {
      expect(
        evaluateAnswer(q, { kind: "matching", selections: { "p99 response time": "opt-latency" } }),
      ).toEqual({ correct: false });
    });
  });
});
