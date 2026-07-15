/**
 * Next.js App Router route-segment loading UI. Doesn't fire on today's
 * client-side navigation (Sandbox has no server-side data fetch to suspend
 * on — see LoadingTransition.tsx for the branded transition that actually
 * covers that case), but this is the correct convention to have in place
 * for whenever auth/persistence (milestones 9-10) add real server
 * round-trips to this route.
 */
export default function SandboxLoading() {
  return (
    // `flex-1`, not `h-full` — body (layout.tsx) is `min-h-full flex
    // flex-col`, so a child needs to grow via flex, not assume a height
    // context that isn't actually there (same gotcha documented at length
    // in HomeCanvas.tsx/Canvas.tsx re: h-full vs. flex-1).
    <div className="flex flex-1 flex-col items-center justify-center bg-background">
      <div
        aria-hidden="true"
        style={{
          width: 56,
          height: 56,
          backgroundColor: "var(--foreground)",
          WebkitMaskImage: "url(/logo-mask.png)",
          maskImage: "url(/logo-mask.png)",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
        }}
        className="motion-safe:animate-pulse"
      />
    </div>
  );
}
