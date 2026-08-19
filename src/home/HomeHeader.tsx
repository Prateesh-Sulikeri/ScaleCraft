"use client";

import Link from "next/link";
import { FileText, Map, type LucideIcon } from "lucide-react";
import { BrandMark } from "@/app/BrandMark";
import { ThemeToggle } from "@/app/ThemeToggle";
import { AppUserButton } from "@/app/AppUserButton";
import { ReportBugButton } from "@/bugs/ReportBugButton";
import { HOME_CONTAINER } from "./layout";
import { HOME_NAV, type HomeNavItem } from "./links";

const NAV_ICON: Record<string, LucideIcon> = {
  ScaleDocs: FileText,
  Roadmap: Map,
};

/** An upcoming area reads as muted text plus a "Soon" chip and is not
 *  focusable, so Tab never lands on something that cannot be activated. A
 *  linked item (none yet - see HOME_NAV) renders as a real link. */
function NavItem({ item }: { item: HomeNavItem }) {
  const Icon = NAV_ICON[item.label];
  const body = (
    <>
      {Icon && <Icon size={14} aria-hidden="true" />}
      {item.label}
    </>
  );

  if (item.upcoming || !item.href) {
    return (
      <span
        aria-disabled="true"
        className="flex cursor-default items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-foreground/40"
      >
        {body}
        <span className="rounded-sm border border-border px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-foreground/45">
          Soon
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className="flex items-center gap-1.5 rounded-md border border-transparent px-2.5 py-1.5 text-sm font-medium text-foreground/60 transition-colors duration-150 ease-out hover:text-foreground"
    >
      {body}
    </Link>
  );
}

/**
 * Home's own top bar. Deliberately not AppHeader (src/app/AppHeader.tsx):
 * that one is the *workspace* header - it carries undo/redo, Validate, Save,
 * the docs toggle, and a mode-colored bottom accent, none of which exist on a
 * dashboard. What they do share is reused directly: BrandMark, ThemeToggle,
 * AppUserButton.
 *
 * There is no "Home" tab. The brand lockup on the left is already the link
 * home, and a tab sitting beside it was two controls for one destination.
 */
export function HomeHeader() {
  return (
    <header className="sticky top-0 z-[var(--z-dropdown)] border-b border-border bg-background/85 backdrop-blur">
      <div className={`${HOME_CONTAINER} flex items-center justify-between gap-4 py-2.5`}>
        <div className="flex min-w-0 items-center gap-4">
          <Link
            href="/"
            aria-label="ScaleCraft home"
            className="flex shrink-0 items-center gap-2.5 transition-opacity duration-150 ease-out hover:opacity-70"
          >
            <BrandMark size={26} />
            <span className="text-base font-semibold tracking-tight">ScaleCraft</span>
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-1">
            {HOME_NAV.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {/* Was a "Soon" chip until the flow existed. Now the real trigger,
           * and icon-only like every other header control - the labelled
           * version was only ever labelled to explain what was coming. Sits
           * left of the theme toggle, the same slot it occupies in the
           * Chapter Reader, the exam shell, and the Design Editor header, so
           * it is in one place across the app rather than per-page. */}
          <ReportBugButton />
          <ThemeToggle />
          <AppUserButton />
        </div>
      </div>
    </header>
  );
}
