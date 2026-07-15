"use client";

import { ANNOTATION_COLOR_PRESETS } from "./annotation-colors";

/**
 * A small inline swatch row for Zone/Comment annotation colors — the first
 * swatch shows (and lets you set, via a hidden native `<input type="color">`
 * overlay) the current color, then a fixed set of presets chosen to read
 * clearly in both themes. "nodrag" on the wrapper is xyflow's convention for
 * opting out of the node-drag gesture, same as ZoneNode's label input.
 */
export function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="nodrag flex items-center gap-1.5">
      <label
        title="Custom color"
        className="relative h-4 w-4 shrink-0 cursor-pointer rounded-full border border-border"
        style={{ backgroundColor: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <div className="h-4 w-px bg-border" />
      {ANNOTATION_COLOR_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          title={preset.name}
          aria-label={preset.name}
          onClick={() => onChange(preset.value)}
          className="h-4 w-4 shrink-0 rounded-full border transition-transform hover:scale-110"
          style={{
            backgroundColor: preset.value,
            borderColor:
              value.toLowerCase() === preset.value.toLowerCase() ? "var(--foreground)" : "transparent",
          }}
        />
      ))}
    </div>
  );
}
