import { afterEach, describe, expect, it } from "vitest";
import { BETA_ALLOWLIST, isAllowedForBeta } from "./beta-allowlist";

afterEach(() => {
  // BETA_ALLOWLIST ships empty in source (stub table); tests mutate the
  // exported array in-memory to exercise the non-empty path, then restore it.
  BETA_ALLOWLIST.length = 0;
});

describe("isAllowedForBeta", () => {
  it("denies everyone when the allowlist is empty", () => {
    expect(BETA_ALLOWLIST).toHaveLength(0);
    expect(isAllowedForBeta("anyone@example.com")).toBe(false);
  });

  it("allows an exact-case match", () => {
    BETA_ALLOWLIST.push("you@example.com");
    expect(isAllowedForBeta("you@example.com")).toBe(true);
  });

  it("is case-insensitive on both the allowlist entry and the input email", () => {
    BETA_ALLOWLIST.push("You@Example.com");
    expect(isAllowedForBeta("you@example.com")).toBe(true);
    expect(isAllowedForBeta("YOU@EXAMPLE.COM")).toBe(true);
  });

  it("denies an email that isn't on the list", () => {
    BETA_ALLOWLIST.push("you@example.com");
    expect(isAllowedForBeta("someoneelse@example.com")).toBe(false);
  });
});
