const CORNER_SIZE = 18;

type Corner = "tl" | "tr" | "bl" | "br";

const CORNER_POSITION: Record<Corner, string> = {
  tl: "left-3 top-3 border-l border-t",
  tr: "right-3 top-3 border-r border-t",
  bl: "left-3 bottom-3 border-l border-b",
  br: "right-3 bottom-3 border-r border-b",
};

/**
 * Purely decorative viewport-frame corner brackets, Home only - a technical-
 * drawing detail (drafting corners) that frames the whole page rather than
 * any one piece of canvas content, so it's positioned fixed to the
 * viewport instead of living inside HomeCanvas's own react-flow coordinate
 * space (which pans/fits independently of the browser window).
 */
export function HomeBlueprintFrame() {
  return (
    <>
      {(Object.keys(CORNER_POSITION) as Corner[]).map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          style={{ width: CORNER_SIZE, height: CORNER_SIZE }}
          className={`pointer-events-none fixed z-10 border-[color:var(--border)] opacity-60 ${CORNER_POSITION[corner]}`}
        />
      ))}

      <p className="pointer-events-none fixed bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs text-foreground/40">

        Build it. Break it. Understand why.
      </p>
    </>
  );
}
