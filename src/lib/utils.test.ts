import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins plain class strings", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, null, "c")).toBe("a c");
  });

  it("supports the clsx object/array forms", () => {
    expect(cn("a", { b: true, c: false }, ["d", "e"])).toBe("a b d e");
  });

  it("merges conflicting tailwind classes, keeping the last one", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("merges conflicting tailwind classes across conditional input", () => {
    expect(cn("text-red-500", true && "text-blue-500")).toBe("text-blue-500");
  });

  it("returns an empty string for no input", () => {
    expect(cn()).toBe("");
  });
});
