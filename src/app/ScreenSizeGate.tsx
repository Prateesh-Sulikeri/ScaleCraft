"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { BookOpen, Home, Monitor } from "lucide-react";
import { useHasMounted } from "@/lib/use-has-mounted";
import { useIsLargeScreen, useRequiredWidth, useViewportWidth } from "@/lib/use-large-screen";

const READABLE_MODES = ["building-blocks", "real-world-extraction"] as const;
type ReadableMode = (typeof READABLE_MODES)[number];

function isReadableMode(segment: string | undefined): segment is ReadableMode {
  return (READABLE_MODES as readonly string[]).includes(segment ?? "");
}

/**
 * Scoped to `(protected)/layout.tsx` (release 7.1.0-alpha, pending-
 * responsive.md) - only the Design Editor, sandbox, and dev canvas tools are
 * gated now, so this only ever interrupts an exercise, never reading.
 *
 * Hard block, no "continue anyway". Tablets got full touch support in
 * release 7.4.0; phones are out of the editor permanently (the reader is
 * the phone product), so there is nothing to continue into.
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
  const pathname = usePathname();
  const params = useParams();

  if (mounted && !isLargeScreen) {
    const mode = isReadableMode(pathname.split("/")[1]) ? pathname.split("/")[1] : undefined;
    const chapterSlug = typeof params.chapterSlug === "string" ? params.chapterSlug : undefined;
    const lessonHref = mode && chapterSlug ? `/${mode}/${chapterSlug}/lesson` : undefined;
    const learningPathHref = `/${mode ?? "building-blocks"}`;

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <Monitor size={32} className="text-foreground/50" />
        <div className="max-w-sm space-y-2">
          <h1 className="text-base font-semibold text-foreground">The Design Editor needs a larger screen</h1>
          <p className="text-pretty text-sm leading-relaxed text-foreground/70">
            The canvas works on a tablet or a computer, not a phone. On a phone, the lesson is the place to be.
            On a computer, widen your browser window.
          </p>
        </div>
        <p className="font-mono text-[11px] text-foreground/50">
          current width: {width}px · minimum: {requiredWidth}px
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {lessonHref && (
            <Link
              href={lessonHref}
              className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--edge-request-flow)" }}
            >
              <BookOpen size={15} />
              Read the lesson instead
            </Link>
          )}
          <Link
            href={learningPathHref}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            Learning Path
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <Home size={15} />
            Home
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
