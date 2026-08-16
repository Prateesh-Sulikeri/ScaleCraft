import { auth } from "@clerk/nextjs/server";

// Route-level gate for pages that are exercises, not reading: the Design
// Editor canvas, sandbox, and dev tooling. Reading (Learning Path, chapter
// lesson) is public — see src/app/(public) — this group is only what
// actually writes progress (release 6.1.0-alpha Phase 11,
// pending-6.1.0-poa.md). LocalStateGate/FlushDirtyRows/RefreshFromCloud used
// to mount here; they're global now (src/app/layout.tsx) since a signed-in
// user reads progress on public routes too.
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await auth.protect();
  return <>{children}</>;
}
