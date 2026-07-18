"use client";

import { Monitor } from "lucide-react";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useIsLargeScreen, useRequiredWidth, useViewportWidth } from "@/lib/use-large-screen";

/**
 * Hard block, no "continue anyway" — MVP_SCOPE.md already defers touch/mobile
 * support to a later phase rather than a half-working desktop UI, so letting
 * someone past this into the drag/connect/configure canvas on a phone would
 * just trade one bad experience for a worse, unsupported one.
 *
 * Gated on `mounted` (see use-has-mounted.ts) rather than blocking during SSR:
 * there's no `window` on the server to measure, and defaulting to "blocked"
 * pre-hydration would flash this screen at every desktop visitor too. Same
 * "assume the common case until the client can actually check" convention
 * Canvas.tsx already uses for theme resolution.
 */
export function ScreenSizeGate({ children }: { children: React.ReactNode }) {
  const mounted = useHasMounted();
  const isLargeScreen = useIsLargeScreen();
  const width = useViewportWidth();
  const requiredWidth = useRequiredWidth();

  if (mounted && !isLargeScreen) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Monitor size={32} className="text-foreground/50" />
        <div className="max-w-sm space-y-2">
          <h1 className="text-base font-semibold text-foreground">ScaleCraft needs a larger screen</h1>
          <p className="text-pretty text-sm leading-relaxed text-foreground/70">
            Assembling and connecting components precisely is a desktop task — this canvas isn&apos;t built for a
            phone-sized or narrow browser window. Open ScaleCraft on a tablet, or maximize your desktop browser.
          </p>
        </div>
        <p className="font-mono text-[11px] text-foreground/50">
          current width: {width}px · minimum: {requiredWidth}px
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
