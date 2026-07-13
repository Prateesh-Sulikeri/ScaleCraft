# Auth

Not wired into `src/app/layout.tsx` yet — deliberately. `ClerkProvider` requires
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` at runtime; wiring it in before
a Clerk project exists would make `npm run dev` crash for anyone without those keys set.
See `.claude/docs/OPEN_QUESTIONS.md` ("Clerk's closed-beta allowlist mechanics") — that
spike needs to happen before this gets wired in for real.

`beta-allowlist.ts` sketches the intended shape (check an invited-email list before
allowing sign-in) so the plan is captured in code, not just in the docs — implement it
once a Clerk project + keys exist.
