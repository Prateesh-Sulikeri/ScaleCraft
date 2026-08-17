import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BrandMark } from "./BrandMark";

describe("BrandMark", () => {
  it("paints the glyph via a themeable CSS mask, not a baked-in image", () => {
    const { container } = render(<BrandMark size={26} />);
    const mark = container.firstElementChild as HTMLElement;
    expect(mark.style.maskImage).toContain("logo-mask.png");
    expect(mark.style.backgroundColor).toBe("var(--foreground)");
    expect(container.querySelector("img")).toBeNull();
  });

  it("renders at the requested size and stays out of the accessibility tree", () => {
    const { container } = render(<BrandMark size={18} className="opacity-60" />);
    const mark = container.firstElementChild as HTMLElement;
    expect(mark.style.width).toBe("18px");
    expect(mark.style.height).toBe("18px");
    expect(mark).toHaveAttribute("aria-hidden", "true");
    expect(mark).toHaveClass("opacity-60");
  });
});
