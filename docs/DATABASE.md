# Database

Live reference for ScaleCraft's Postgres/Neon setup: how it's provisioned, how
dev/preview/prod are separated, connection strings, the client, migrations,
and the schema. Read this before touching anything in `src/db/`, adding a
table, or debugging a `DATABASE_URL` connection error. For the original
persistence design tradeoffs (why Postgres mirrors Dexie, sync/conflict
model, what's local-only), see `.claude/docs/pending-cloud-sync.md` and
`.claude/docs/ARCHITECTURE.md` ("Persistence"). For the CI/build pipeline
around deploys, see `.claude/docs/TESTING_AND_DEPLOYMENT.md`.

## Provider and integration

Postgres via **Neon**, provisioned through the native **Vercel Marketplace
Neon integration** on the `scale-craft` Vercel project - not a manually
pasted connection string. The integration auto-populates a full var set into
Vercel's env store: `DATABASE_URL`, `DATABASE_URL_UNPOOLED`, `POSTGRES_*`,
`PG*`, `NEON_PROJECT_ID`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`.

Chosen over Supabase for: real free tier with scale-to-zero and no
multi-day pause on inactive free projects, branch-per-PR workflow, and
first-party Vercel integration (`.claude/docs/TECH_STACK.md:42`).

Only two of the auto-populated vars are actually read by app code:
`DATABASE_URL` and `DATABASE_URL_UNPOOLED`. The rest (`POSTGRES_*`, `PG*`,
`NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`) are unused passthroughs from the
integration - ScaleCraft uses Clerk for auth, not Neon Auth, and Drizzle
directly rather than Prisma. Don't wire new code to those unless a real need
shows up.

## Branch-per-environment

Three Vercel environments map to two Neon branches:

| Vercel environment | Neon branch | Branch id | Notes |
|---|---|---|---|
| Development | `development` | `br-billowing-field-awvgzzbt` (host `ep-sweet-union-awxmuy08`) | Dedicated branch, isolated from prod data |
| Preview | `main` (own sub-branch per deployment) | `br-summer-breeze-aww4iph2` | Vercel's Neon integration auto-branches per preview deployment, no manual setup |
| Production | `main` | `br-summer-breeze-aww4iph2` | |

`DATABASE_URL` and `DATABASE_URL_UNPOOLED` each have two separate values in
Vercel: one scoped to "Development" only, one scoped to "Production,
Preview" together (`vercel env ls` shows this directly).

This wasn't the original setup. Initially all three environments shared one
"All Environments" entry pointing at the `main` branch. Fixed **2026-08-12**
so local dev writes can't touch prod data - Preview already auto-branched
for free, so the fix was giving Development its own branch and splitting
the Vercel env entries per-environment. Tracked as a closed checklist item
in `.claude/docs/pending-cloud-sync.md` (Decisions locked 2026-08-12
section) - fully resolved, not an open question.

**Security note:** the `neondb_owner` role password was rotated on both
branches during that change, after an accidental exposure in a terminal
session. If `DATABASE_URL` ever fails with an auth error, check Vercel's
current env var value first - not this doc, not `.env.local` - for the live
credential.

## Connection strings: pooled vs. unpooled

Two distinct strings, two distinct purposes:

- **`DATABASE_URL`** (pooled, PgBouncer) - used by the app at runtime
  (`src/db/client.ts`). Every request-scoped query goes through this.
- **`DATABASE_URL_UNPOOLED`** (direct, session-level) - used only for
  migrations (`drizzle.config.ts`, `scripts/migrate.mjs`). Migrations run
  session-level operations that a pooled PgBouncer connection doesn't
  support, so they need the direct connection.

Never swap these: pointing the app at the unpooled URL exhausts direct
connections under load; pointing migrations at the pooled URL fails.

## Client

`src/db/client.ts` - lazy singleton, deliberately not constructed at module
load:

```ts
export function getDb() {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. ...");
  _db = drizzle(neon(url), { schema });
  return _db;
}
```

Lazy by design - constructing eagerly would crash the whole app any time
`DATABASE_URL` is unset (e.g. running the canvas/validation-engine scaffold
without a Neon project). It only throws when a caller actually touches the
database. Uses `drizzle-orm/neon-http` (`@neondatabase/serverless`), the
HTTP driver - not the websocket/TCP driver - because it's the one that
reliably works from WSL2 dev environments (see Gotchas below).

Every server-side DB access goes through `getDb()`. There is no direct
`neon()`/`drizzle()` call anywhere else in app code.

## Local development setup

1. Copy `.env.example` to `.env.local`.
2. Get the Development-branch `DATABASE_URL` (and `DATABASE_URL_UNPOOLED` if
   you'll run migrations) from Vercel: `vercel env pull .env.local`, or copy
   from the Vercel dashboard (Development environment values). Never reuse
   the Production/Preview values for local dev.
3. `DATABASE_URL` alone is enough to run the app (`npm run dev`) against the
   dev database. Without it, `getDb()` throws only when something actually
   queries the DB - the canvas/validation-engine scaffold itself doesn't
   need it.

`.env.local` is gitignored; never commit it.

## Schema and migrations (Drizzle)

- Schema source of truth: `src/db/schema.ts` (application tables) and
  `src/db/sync/*` (auth-related types).
- `drizzle.config.ts` points at `./src/db/schema.ts`, outputs to `./drizzle`,
  and uses `DATABASE_URL_UNPOOLED` for `dbCredentials.url`.
- **Generate a migration** after a schema change:
  ```bash
  npm run db:generate   # dotenv -e .env.local -- drizzle-kit generate
  ```
- **Apply migrations**:
  ```bash
  npm run db:migrate    # dotenv -e .env.local -- node scripts/migrate.mjs
  ```
  `scripts/migrate.mjs` applies migrations via the HTTP driver
  (`drizzle-orm/neon-http/migrator`), matching `client.ts`'s runtime driver,
  rather than `drizzle-kit migrate`'s websocket path. This sidesteps a WSL2
  gotcha - some networks (WSL2 without a working default route to Neon's
  IPv6 addresses) fail the websocket handshake even though HTTP works fine.
- Applied migrations live in `drizzle/*.sql` with a matching entry in
  `drizzle/meta/_journal.json` and a `drizzle/meta/NNNN_snapshot.json`. Both
  are checked in - never hand-edit `_journal.json` or a snapshot.
- Migrations are applied manually (`npm run db:migrate`) against whichever
  branch `.env.local` points at. There is no automatic migrate-on-deploy
  step in the Vercel build (`vercel.json`'s `buildCommand` is `next build`
  only) - remember to run `db:migrate` against Production/Preview's branch
  after merging a schema change that ships to `main`/`develop`/`release/*`.

### Gotchas (WSL2 / networking)

`@neondatabase/serverless`'s `fetch` intermittently fails with `ETIMEDOUT`
on IPv6 candidates in this environment. `--dns-result-order=ipv4first`
alone doesn't fix it reliably - `db:migrate` already forces
`NODE_OPTIONS=--no-network-family-autoselection`. If `db:migrate` still
fails with a fetch/timeout error, retry a few times; it's networking
flakiness, not a migration problem.

## Schema overview

`src/db/schema.ts` - two families of tables:

**Cloud-sync mirrors** (mirror a Dexie table, see `src/persistence/db.ts`,
`updatedAt` used for last-write-wins conflict resolution across devices):
`savedGraphs`, `customComponents`, `chapterProgress`, `curriculumProgress`,
`examAttempts`, `deepCheckSessions`. All keyed by Clerk `userId`. Complex
nested fields (canvas state, exam answers, AI critiques) are stored as
`jsonb` rather than normalized. Postgres mirrors only the *current* Dexie
shape, not its version history - a Dexie schema change needs a matching
Postgres migration going forward.

**Cloud-only tables** (no Dexie counterpart, nothing to reconcile offline):
`bugReports`, written straight through `/api/bugs`; `bugReportImages`, a
separate table (not a column) so list queries never drag image bytes along,
and so swapping to object storage later (Vercel Blob is the natural fit) is
a table removal rather than a bug-record migration. See
`src/bugs/image-storage.ts` for the storage seam - `bugReports.imageRef` is
an opaque ref only that module parses.

Route Handlers per synced table live under `src/app/api/sync/<table>/`
(saves, custom-components, chapter-progress, curriculum-progress,
exam-attempts, deep-check-sessions) - POST for write-through sync, GET for
one-shot hydrate when a scope has no local Dexie row. Sync model
(debounced write-through, Dexie-first reads, last-write-wins, no offline
queue) is documented in full in `.claude/docs/pending-cloud-sync.md`.

## Deploy gating

`vercel.json`'s `ignoreCommand` (`scripts/check-deploy-branch.sh`) only lets
`main`, `develop`, and `release/*` branches deploy. Every other branch is
skipped at the Vercel layer, so only those three branches ever run against
the Production/Preview Neon branch.
