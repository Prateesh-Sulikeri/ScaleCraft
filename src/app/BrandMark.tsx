/**
 * The ScaleCraft glyph, at whatever size the caller needs.
 *
 * Rendered via CSS mask (`logo-mask.png`, generated from `logo-mark.png` by
 * keying luminance to alpha) rather than `next/image`: the source PNG has a
 * solid black background baked in with no alpha channel, which reads as an
 * ugly black box in light theme. A mask sources only the glyph's shape and
 * paints it with `background-color: var(--foreground)`, so it adapts to both
 * themes the same way every other themed surface does, with no second
 * per-theme asset needed.
 *
 * Extracted because this exact markup was hand-copied across the app header,
 * Home, and the held loading overlay - three places to fix if the asset or
 * the theming approach ever changes.
 */
export function BrandMark({ size, className }: { size: number; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        width: size,
        height: size,
        backgroundColor: "var(--foreground)",
        WebkitMaskImage: "url(/logo-mask.png)",
        maskImage: "url(/logo-mask.png)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
      }}
    />
  );
}
