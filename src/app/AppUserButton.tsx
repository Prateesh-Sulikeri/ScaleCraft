"use client";

import { UserButton } from "@clerk/nextjs";

/** Pairs with ThemeToggle everywhere it appears — the whole app sits behind
 * Clerk (see proxy.ts), so a signed-in user is present at every one of
 * ThemeToggle's usages. Always rendered immediately to its right. */
export function AppUserButton() {
  return (
    <UserButton
      appearance={{
        elements: {
          userButtonAvatarBox: "h-8 w-8",
        },
      }}
    />
  );
}
