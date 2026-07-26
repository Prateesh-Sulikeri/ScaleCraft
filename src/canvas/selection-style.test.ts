import { describe, expect, it } from "vitest";
import { SELECTED_GLOW, HIGHLIGHT_GOLD, HIGHLIGHT_GOLD_RING } from "./selection-style";

describe("selection-style constants", () => {
  it("SELECTED_GLOW is an inset-only box-shadow (never extends past the node's own box)", () => {
    expect(SELECTED_GLOW).toMatch(/^inset /);
    expect(SELECTED_GLOW).toContain("var(--foreground)");
  });

  it("HIGHLIGHT_GOLD is a valid hex color", () => {
    expect(HIGHLIGHT_GOLD).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("HIGHLIGHT_GOLD_RING is inset-only and uses HIGHLIGHT_GOLD as its color", () => {
    expect(HIGHLIGHT_GOLD_RING).toMatch(/^inset /);
    expect(HIGHLIGHT_GOLD_RING).toContain(HIGHLIGHT_GOLD);
  });

  it("HIGHLIGHT_GOLD is distinct from the plain selection glow's color channel", () => {
    expect(SELECTED_GLOW).not.toContain(HIGHLIGHT_GOLD);
  });
});
