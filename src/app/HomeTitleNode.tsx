const NODE_WIDTH = 420;

/**
 * The ScaleCraft mark + heading, as an actual node in HomeCanvas's node
 * list — not an HTML overlay positioned independently of it. Rendering it
 * outside the canvas's own node layout put it and the mode nodes at two
 * unrelated coordinates (fitView only knows about node bounds), which is
 * what produced a heading stranded near the top with a dead gap before the
 * cards. As a node, it's part of the same bounding box fitView centers, so
 * heading and cards move and center together as one composition — the same
 * relationship Clapet's reference layout has between its "Welcome to..."
 * heading and the option cards below it.
 *
 * The mark renders via CSS mask (`logo-mask.png`, generated from
 * `logo-mark.png` by keying luminance to alpha) rather than `next/image` —
 * the source PNG has a solid black background baked in with no alpha
 * channel, which read as an ugly black box in light theme. A mask sources
 * only the glyph's shape and paints it with `background-color:
 * var(--foreground)`, so it adapts to both themes the same way every other
 * themed surface in the app does, with no second per-theme asset needed.
 */
export function HomeTitleNode() {
  return (
    <div style={{ width: NODE_WIDTH }} className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          style={{
            width: 44,
            height: 44,
            backgroundColor: "var(--foreground)",
            WebkitMaskImage: "url(/logo-mask.png)",
            maskImage: "url(/logo-mask.png)",
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />
        <span className="text-5xl font-semibold tracking-tight">ScaleCraft</span>
      </div>
      <h2 className="text-md text-foreground/60">Design real systems. Understand every trade-off.</h2>
    </div>
  );
}

export { NODE_WIDTH as HOME_TITLE_NODE_WIDTH };
