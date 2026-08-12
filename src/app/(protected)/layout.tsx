import { auth } from "@clerk/nextjs/server";

// Single-player app, gated top to bottom: no route under this group is
// public. See CLAUDE.md - "no sign in, no app access." sign-in/sign-up
// live outside this route group so they stay reachable.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();
  return children;
}
