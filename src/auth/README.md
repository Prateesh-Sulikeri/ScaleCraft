# Auth

Clerk is wired into `src/app/layout.tsx` (`ClerkProvider`). Reading is public — most
routes render for a signed-out visitor (release 6.1.0-alpha Phase 11) — and only
progress-write actions (mark-complete, quiz launch) gate on sign-in, via
`useRequireAuthAction`.

Sign-up is open, no invite list. A closed-beta allowlist (`beta-allowlist.ts`) was
scaffolded early on but never wired to anything and was deleted in the 6.1.0 close-out
(`pending-6.1.0-poa.md` P2.2) as a deliberate decision, not an oversight — reading being
public made a stub that looked like a gate and wasn't one worse than no gate at all. See
`.claude/docs/OPEN_QUESTIONS.md` for the record of that decision if this needs revisiting.
