"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoadingTransition } from "./LoadingTransition";

/** Same fixed hold as ModeNode.tsx's Home -> mode transition — deliberately
 *  not tied to actual route readiness (see LoadingTransition.tsx: prefetched
 *  routes would otherwise skip the overlay instead of holding it). */
const TRANSITION_HOLD_MS = 700;

type HeldTransitionLinkProps = {
  href: string;
  /** Shown under the mark while the transition holds, e.g. "Opening Load Balancing…". */
  label: string;
  className?: string;
  children: ReactNode;
  "aria-current"?: "page";
  "aria-label"?: string;
};

/**
 * A real `<Link>` (native keyboard activation, focus ring, open-in-new-tab)
 * that intercepts a plain left-click to hold on the branded LoadingTransition
 * before the real navigation fires — the same pattern ModeNode.tsx uses for
 * Home -> mode, applied to Learning Path <-> chapter canvas navigation so
 * that full-remount route change (each chapter mounts its own
 * CanvasStoreProvider) doesn't read as an unannounced jump-cut.
 */
export function HeldTransitionLink({
  href,
  label,
  className,
  children,
  "aria-current": ariaCurrent,
  "aria-label": ariaLabel,
}: HeldTransitionLinkProps) {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setNavigating(true);
    window.setTimeout(() => router.push(href), TRANSITION_HOLD_MS);
  };

  return (
    <Link href={href} onClick={handleClick} aria-current={ariaCurrent} aria-label={ariaLabel} className={className}>
      {children}
      {navigating && <LoadingTransition label={label} />}
    </Link>
  );
}
