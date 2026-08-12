import { auth } from "@clerk/nextjs/server";
import { LocalStateGate } from "@/persistence/LocalStateGate";
import { FlushDirtyRows } from "@/persistence/FlushDirtyRows";

// Single-player app, gated top to bottom: no route under this group is
// public. See CLAUDE.md - "no sign in, no app access." sign-in/sign-up
// live outside this route group so they stay reachable.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth.protect();
  return (
    <>
      <LocalStateGate userId={userId} />
      <FlushDirtyRows />
      {children}
    </>
  );
}
