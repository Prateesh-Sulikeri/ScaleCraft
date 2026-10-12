/** The 26px dot plane every Home-style page sits on. Spread onto the page's
 *  scroll container's `style`. */
export const DOT_PLANE_STYLE = {
  backgroundImage: "radial-gradient(color-mix(in srgb, var(--border) 85%, transparent) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
} as const;

/**
 * Drafting-sheet plane behind a page's header area: major grid lines every 5
 * dots (130px, aligned through dot centres) and two soft pools of `accent`,
 * both masked to fade out down the page. Static. The parent must be
 * `relative isolate` so the `-z-10` layer sits behind content, not the page.
 */
export function DraftingBackdrop({ accent = "var(--hero-accent)" }: { accent?: string }) {
  const line = "color-mix(in srgb, var(--border) 80%, transparent)";
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[1100px]">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
          backgroundSize: "130px 130px",
          backgroundPosition: "12.5px 12.5px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 30%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            `radial-gradient(ellipse 50% 50% at 75% 30%, color-mix(in srgb, ${accent} 22%, transparent), transparent 72%),` +
            `radial-gradient(ellipse 45% 40% at 18% 22%, color-mix(in srgb, ${accent} 12%, transparent), transparent 70%)`,
        }}
      />
    </div>
  );
}
