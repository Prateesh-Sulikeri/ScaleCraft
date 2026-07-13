# ScaleCraft

An interactive system architecture laboratory — see `INITIAL_THOUGHTS.md` for the
product vision and `CLAUDE.md` / `.claude/docs/` for the full architecture, tech stack,
design language, and MVP scope.

## Status

Pre-MVP scaffold: Next.js app, React Flow canvas, a seed component registry, and the
validation engine wired end-to-end (see `src/app/page.tsx` for a live smoke test —
toggles between a valid and an invalid example graph). Auth (Clerk) and cloud
persistence (Neon/Drizzle) are scaffolded but not wired live — see `src/auth/README.md`
and `.claude/docs/OPEN_QUESTIONS.md`.

## Getting started

```bash
npm install
npm run dev       # http://localhost:3000
npm run test       # validation-engine unit tests
npm run typecheck
npm run lint
```

`DATABASE_URL` / Clerk keys are not required to run the app — copy `.env.example` to
`.env.local` once Neon/Clerk are provisioned.
