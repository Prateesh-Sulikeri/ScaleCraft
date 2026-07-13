# Tech Stack

Status: **decided**, 2026-07-13. Change this doc (and explain why) before deviating —
don't drift silently.

## Topology: single Next.js app, no separate backend

One Next.js (App Router) application, deployed to Vercel. No standalone backend
service. Rationale (full discussion in conversation history, condensed here):

- The canvas, validation engine, and (MVP-scope) simulation all run **client-side in the
  browser** — that's the local-first design [[ARCHITECTURE]] describes, and it's just
  React/TS code, not something that needs a server.
- The only genuine server-side needs — persistence, auth — are handled by Next.js Route
  Handlers (`app/api/*/route.ts`) calling managed external services (Postgres, Clerk).
  That's "a server-side API," not "a second application to build and operate."
- Things that *would* eventually need an additive service — real-time multiplayer
  editing, heavy server-side quantitative simulation — bolt onto this monolith via a
  managed service (Liveblocks/PartyKit for realtime, Inngest/Vercel Cron for background
  jobs) rather than forcing a rewrite. See [[OPEN_QUESTIONS]] for both.

The pre-existing empty `backend/` and `frontend/` scaffold folders are stale relative to
this decision — the Next.js app will live at repo root (or a single `apps/web` if we
later regret it, but start flat). Clean these up when scaffolding begins.

## Frontend

| Concern | Choice | Why |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | Vercel-native, Route Handlers cover the API surface, SSR available for any future marketing/chapter-index pages that want SEO. |
| Canvas | React Flow (`@xyflow/react`) | See [[RESEARCH]] — MIT, native DAG semantics, custom React nodes, animated-edge primitives for simulation. |
| Editor state | Zustand | Matches React Flow's own recommended pattern for canvas state; avoids Redux ceremony for a solo project. |
| Server/cache state | TanStack Query | Standard fit for Route Handler data fetching, cache invalidation on save. |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) | Accessible primitives (dialogs, tooltips, panels) without hand-rolling a11y; Tailwind keeps the category-color system in [[DESIGN_LANGUAGE]] centralized in config. |
| Forms/config panels | React Hook Form + Zod | Component config schemas are Zod anyway (see [[ARCHITECTURE]]) — reuse the same schema for the panel form and for validation. |
| Local persistence | IndexedDB via Dexie.js | Autosave in-progress diagrams instantly, works offline, no server round-trip on every edit. |

## Backend (within the Next.js app)

| Concern | Choice | Why |
|---|---|---|
| Database | Postgres via Neon | Real free tier, scale-to-zero *without* the multi-day pause Supabase imposes on inactive free projects, branch-per-PR workflow, first-party Vercel integration. |
| ORM | Drizzle | Type-safe, lightweight, edge/serverless-friendly (Prisma's cold-start weight is a bad fit for Vercel functions). |
| Auth | Clerk | Closed beta requires gated signup from day one — Clerk's built-in allowlist/waitlist support avoids building invite infra by hand. Revisit if its free tier or pricing stops fitting once the beta grows (see [[OPEN_QUESTIONS]]). |
| Hosting | Vercel | Free (Hobby) tier for the closed beta. Hobby's ToS is for non-commercial/personal use — budget for the ~$20/mo Pro tier before public/monetized launch, not before. |

## Validation & simulation engines

Both are plain TypeScript modules living inside the Next.js app (not separate packages
at MVP scale — see "Project structure" in [[ARCHITECTURE]]), executed entirely
client-side against the in-memory graph state. No network round-trip for either — that's
what makes feedback instant and offline-capable. Design details in [[ARCHITECTURE]].

## Content authoring

Chapters, component definitions, and validation rules are versioned TypeScript/JSON
living in the repo — not a database, not a headless CMS. Rationale: this is a solo
project where the "content author" and "the engineer" are the same person for the
foreseeable future, so git review/diffing beats CMS ceremony. Pre-saved designs (chapter
starter states, reference solutions, "Real World Extraction" example blueprints) are
JSON fixtures in the same content tree, loaded directly via React Flow's
`setNodes`/`setEdges` — see the "pre-saved design loads" discussion in [[ARCHITECTURE]].

## Testing

Vitest + React Testing Library for units (validation engine rules are pure functions —
should be thoroughly unit tested since they're the pedagogical core of the product);
Playwright for canvas interaction e2e once there's a canvas to test.

## Explicitly deferred, not rejected

- **Turborepo / pnpm workspaces**: not worth the overhead for a solo, single-app project
  right now. Folder-level module boundaries inside one app (see [[ARCHITECTURE]]) give
  most of the benefit without the tooling tax. Revisit if a second app (e.g. a public
  marketing site with a different deploy cadence) or collaborators show up.
- **Real-time collaboration infra**: not deferred, rejected outright. ScaleCraft is a
  single-player product by design, in the beta and after — see [[MVP_SCOPE]]. Don't
  shape persistence or graph state around eventual multiplayer support; there isn't
  going to be any.
- **Quantitative simulation (WASM discrete-event engine, à la SysSimulator)**: a
  multi-week R&D effort on its own — MVP simulation is qualitative/visual only. See
  [[OPEN_QUESTIONS]].
