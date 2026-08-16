"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn } from "lucide-react";
import { Show, UserButton } from "@clerk/nextjs";
import { Tooltip } from "@/app/Tooltip";

/**
 * Pairs with ThemeToggle everywhere it appears. Used to assume a signed-in
 * user was always present (the whole app sat behind Clerk) - no longer true
 * since release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md, "read without an
 * account") made reading public. Signed out, this renders a Sign in
 * affordance in the same slot instead - CLAUDE.md's Non-negotiable
 * principles call for offering progress tracking here, not denying access,
 * so it reads as an invitation, not a wall.
 */
export function AppUserButton() {
  const pathname = usePathname();

  return (
    <Show
      when="signed-in"
      fallback={
        <Tooltip label="Sign in to track your progress">
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            aria-label="Sign in"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-panel text-foreground/70 hover:text-foreground"
          >
            <LogIn size={16} />
          </Link>
        </Tooltip>
      }
    >
      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: "h-8 w-8",
          },
        }}
      />
    </Show>
  );
}
