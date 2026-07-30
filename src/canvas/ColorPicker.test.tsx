import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ColorPicker } from "./ColorPicker";
import { ANNOTATION_COLOR_PRESETS } from "./annotation-colors";

describe("ColorPicker", () => {
  it("renders a swatch button for every preset plus the custom color input", () => {
    render(<ColorPicker value={ANNOTATION_COLOR_PRESETS[0].value} onChange={vi.fn()} />);
    for (const preset of ANNOTATION_COLOR_PRESETS) {
      expect(screen.getByTitle(preset.name)).toBeInTheDocument();
    }
    expect(screen.getByTitle("Custom color")).toBeInTheDocument();
  });

  it("highlights the preset button matching the current value (case-insensitively)", () => {
    // toHaveStyle doesn't reliably match a raw `var(--foo)` CSS value across
    // jsdom/jest-dom versions, so this reads the inline style property
    // directly rather than via that matcher.
    const target = ANNOTATION_COLOR_PRESETS[2];
    render(<ColorPicker value={target.value.toUpperCase()} onChange={vi.fn()} />);
    const button = screen.getByTitle(target.name) as HTMLButtonElement;
    expect(button.style.borderColor).toBe("var(--foreground)");

    const other = ANNOTATION_COLOR_PRESETS[0];
    const otherButton = screen.getByTitle(other.name) as HTMLButtonElement;
    expect(otherButton.style.borderColor).toBe("transparent");
  });

  it("clicking a preset swatch calls onChange with that preset's value", () => {
    const onChange = vi.fn();
    render(<ColorPicker value={ANNOTATION_COLOR_PRESETS[0].value} onChange={onChange} />);

    const target = ANNOTATION_COLOR_PRESETS[3];
    fireEvent.click(screen.getByTitle(target.name));
    expect(onChange).toHaveBeenCalledWith(target.value);
  });

  it("changing the native color input calls onChange with the new color", () => {
    const onChange = vi.fn();
    render(<ColorPicker value="#111111" onChange={onChange} />);
    const colorInput = screen.getByTitle("Custom color").querySelector("input[type='color']") as HTMLInputElement;
    expect(colorInput).toBeInTheDocument();

    // userEvent doesn't support typing into <input type="color">; fireEvent
    // change is the standard way to drive this control in RTL.
    fireEvent.change(colorInput, { target: { value: "#abcdef" } });
    expect(onChange).toHaveBeenCalledWith("#abcdef");
  });
});
