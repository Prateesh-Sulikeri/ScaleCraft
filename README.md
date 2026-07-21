# ScaleCraft

**An interactive system-design learning lab.** Assemble real-world
architectures — load balancers, databases, caches, queues — on a canvas, and
get validation feedback that explains the *architectural reasoning* behind
every failure, not just "invalid." Progress from constrained guided chapters
to open-ended sandbox building.

Not a game, not a diagramming tool: a practical companion to a system-design
textbook, built around one core principle — **the same reusable components
serve every chapter and mode**, so learning complexity comes from
composition, not new mechanics.

## Current status

**Sandbox is fully playable; chapters are next.** The interactive canvas,
27-component registry, validation engine (10 explanatory rules), docked docs
panel, custom component creation, annotations (zones/comments/flags),
undo/redo, and local save/load + JSON/image export all work today at
`/sandbox`. The chapter framework, guided chapters, auth, and cloud sync are
planned — see [docs/FEATURES.md](docs/FEATURES.md) for the full shipped/
planned inventory.

## Documentation

| Doc | What it covers |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Product requirements: vision, learning modes, principles, MVP scope |
| [docs/TRD.md](docs/TRD.md) | Technical requirements: stack, data models, non-functional requirements |
| [docs/SYSTEM_DESIGN.md](docs/SYSTEM_DESIGN.md) | Engineering design: subsystems, flows, key decisions |
| [docs/FEATURES.md](docs/FEATURES.md) | Feature inventory: shipped / in progress / planned / rejected |
| [DESIGN.md](DESIGN.md) | Visual design system: colors, typography, components, a11y |
| [INITIAL_THOUGHTS.md](INITIAL_THOUGHTS.md) | Original product vision |
| `.claude/docs/` | Working planning docs: milestones, open questions, research, critiques |

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /sandbox
```

Quality gates (all enforced in CI on `main` and `development`):

```bash
npm run typecheck
npm run lint
npm test           # vitest — validation rules, store, persistence, flows
npm run build
```

No environment variables are required — the app is fully client-side today.
`DATABASE_URL` (Neon) and Clerk keys only become relevant when auth/cloud
sync land; copy `.env.example` to `.env.local` at that point.

## Tech stack

Next.js 16 (App Router, TypeScript, Tailwind v4) · React Flow canvas ·
Zustand state · Zod-driven config schemas · Dexie/IndexedDB local-first
persistence · react-markdown + Mermaid docs · Vitest. Planned: Clerk (auth),
Neon + Drizzle (cloud sync), Vercel (hosting).

## Contributing / workflow

Solo project. Work branches off `development` (the integration branch); `main`
receives merges via PR. New units of work get their own branch from
`development`.
