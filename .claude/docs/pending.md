# Track 3 — AI Deep Check (`feature/ai-deep-check`) — Status: code-complete

**Full spec:** `.claude/docs/validation_agent_design.md` §4 (why/reversals/
constraints) and §10 (implementation spec). This file is the phase-by-phase
execution plan against that spec — not a parallel design doc. If the two ever
disagree, §4/§10 win; fix this file, not the other way around.

**All 6 phases below landed, plus a post-Phase-6 follow-up round** (multi-profile
AI settings, a Help view, and a Cancel-run UX fix — see that section after
Phase 6). Full pipeline (`typecheck`/`lint`/`test`/`build`) green, 912/912
tests, the `chapter-outcome.ts` isolation grep and the key-leak grep both
clean. `validation_agent_design.md`'s Rollout Status and §10.5,
`NEXT_STEPS.md` Step 4.5 all synced to reflect this (see those files — not
duplicated here). Remaining, not something an agent can do:

- **Your final free-form click-through** (all three modes, both themes) —
  Phase 6's own "does it still feel right" bar, never satisfied by an
  automated pipeline alone. Not confirmed done as of this doc-sync pass.
- **The branch is still local-only, unpushed**, per this repo's "ask before
  every push" convention — push and PR review are your call.
- Once merged, this file gets emptied out per its own live-task-list
  convention (see Track 2's precedent, one paragraph below) — not done yet
  since the branch hasn't merged.

**Track 2 is fully closed out — merged.** All 7 phases plus the post-Phase-7
follow-up landed on `feature/validation-pattern-engine` and merged via
**PR #47** into `release/2.0.0-validation-engine-overhaul` (merge commit
`e1b36ff`). Full record: `.claude/PROGRESS_LOG.md`'s 2026-07-27 and 2026-07-28
entries.

**The phase-by-phase plan below is kept as the execution record**, same
convention Track 2's own pending.md content followed until its merge —
not re-summarized here to avoid the record drifting from what's below.

---

**Ground rules for every phase below:**

- **No server secret, ever.** Per §4.4, the key lives in the browser
  (IndexedDB, entered via the Settings UI) and the provider is called
  browser-direct. No Route Handler, no `NEXT_PUBLIC_*` env var, no server-side
  fallback that reads a key from anywhere. If a `.env`/`.env.local` exists in
  this repo with a real provider key in it, **no phase below wires the shipped
  app to read it** — that would silently violate "optional and absent by
  default" (§4.3) and the whole BYO-key-in-browser design (§4.4). Its only
  legitimate use is a throwaway, uncommitted verification script (see Testing
  split, below) — never a code path that ships.
- **Never load-bearing for progression** (§4.3). AI output must never touch
  `ChapterOutcome` or severity. This is checked structurally in Phase 6 (a
  grep, not a promise), not just asserted in prose.
- **Guardrails are structural, not prompted** (§4.5). Every phase that touches
  model output validates it with Zod, filters node ids against the real graph,
  and never partially renders on failure.

**Testing split, throughout:** automated tests (`npm test`) never make a real
network call — every provider adapter is mocked (fetch mocked for
openai/xai/google/openai-compatible, the Anthropic SDK client mocked for
anthropic). A real key (yours, in `.env`, for your own manual testing) is only
ever exercised through a **throwaway script or a manual click-through**,
deleted right after and never committed — same convention Track 2 used for
its scripted-and-deleted Playwright specs. Given a live key will be sitting in
the working tree throughout this track, every commit gets a `git status`/
`git diff` sanity check first, not just the usual staged-files review.

---

## Phase 1 — Provider layer (`src/ai/providers/`, new)

**Scope:** `AiProviderId` (`"anthropic" | "openai" | "google" | "xai" |
"openai-compatible"`), the `AiProvider` interface (§10.1 — `id`, `label`,
`defaultModel`, `suggestedModels`, `complete()`), and five adapters:

- **`anthropic`** — official `@anthropic-ai/sdk` (new dependency),
  `dangerouslyAllowBrowser: true`. Defaults `claude-opus-5`, offers
  `claude-sonnet-5`/`claude-haiku-4-5`. `max_tokens: 16000`, non-streaming.
  **Verify the exact browser-opt-in option/header name against the installed
  SDK version at implementation time** — don't trust this doc's name for it.
  `temperature`/`top_p`/`top_k` are rejected on current Claude models, so
  Tone stays a prompt-only modifier — no slider anywhere in Phase 5's UI.
- **`openai`**, **`xai`**, **`openai-compatible`** — raw `fetch` against the
  OpenAI-compatible chat-completions shape; `openai-compatible` exposes a
  user-supplied `baseUrl` (Ollama/OpenRouter/self-hosted).
- **`google`** — raw `fetch` against the Gemini `generateContent` endpoint.

Every adapter maps a failure to a distinct, user-legible error kind (at least
`auth`, `rate-limit`, `network`, `unknown`) — a bad key is the most likely
failure by far and must never fail silently.

**Judgment call, flagging now rather than after the code lands:** §10.1 says
Anthropic should use `client.messages.parse()` with a Zod `output_config` for
schema-enforced JSON (reusing §10.4's schema), while `complete()`'s declared
return type is uniform `Promise<string>`. Default plan: `complete()` takes an
optional `schema` param; the anthropic adapter uses it via `messages.parse()`
and stringifies the result back into that string return; other adapters
ignore the param and rely on their own JSON mode. The one shared Zod-validate
pass (Phase 3) then runs on every provider's output regardless, per the
spec's own "validation runs on every provider regardless" line — redundant
for Anthropic, but keeps one code path instead of a special case. Say now if
you'd rather Anthropic skip the shared validation pass entirely.

**Automated tests, mocked only:**
1. Each `fetch`-based adapter (openai/xai/google/openai-compatible): request
   shape (URL, auth header, body) is correct; a successful response parses;
   at least three distinct failure modes (401, 429, thrown/network error) map
   to distinct, correctly-labeled `AiProviderError` kinds.
2. `anthropic` adapter: SDK client constructed with the right options
   (mocked client, not a real call); same error-kind mapping on a mocked SDK
   throw.
3. `openai-compatible`'s `baseUrl` actually changes the request URL.

**Done when:** `typecheck`/`lint`/`test`/`build` clean. This phase only adds
new files under `src/ai/` — nothing existing changes yet.

**You verify:** no UI surface yet, but this is the cheapest point to sanity
check your real xAI key against the live adapter — a throwaway Node script
(not committed) calling the `xai` adapter's `complete()` directly. Catching a
wrong endpoint/header here is much cheaper than after four more phases build
on top of it.

---

## Phase 2 — Settings + Dexie v4 (`src/ai/settings.ts`, new;
## `persistence/db.ts`, modified)

**Scope:** `AiSettings` per §10.2 (`id: "default"`, `enabled`, `providerId`,
`model`, `baseUrl?`, `apiKey`, `depth`, `tone`, `level`) with defaults
(`enabled: false` until a key is actually saved). Dexie **schema v4**: add
`aiSettings` table (keyed `"id"`), listing every existing table too, per the
v1→v3 convention already in `db.ts`. `getAiSettings()`/`saveAiSettings()`
helpers. No UI yet — pure data layer, same shape as Track 2's Phase 5.

**Automated tests:** `db.test.ts` extended with an `aiSettings` round-trip
(`put`/`get`/update) against `fake-indexeddb`, same pattern as the existing
`saves`/`chapterProgress` tests.

**Done when:** `typecheck`/`lint`/`test`/`build` clean.

**You verify — real migration risk, same caution as Track 2's Phase 5:**
1. Open the app on your existing v3 profile — confirm no Dexie version-conflict
   console error.
2. DevTools → Application → IndexedDB → `scalecraft` → confirm an
   `aiSettings` object store now exists at version 4.
3. Confirm your existing `saves`/`chapterProgress` data is untouched.

---

## Phase 3 — Prompt assembly, output schema, spoiler gate (`src/ai/prompt.ts`,
## `src/ai/schema.ts`, new)

**Scope:** `aiCritiqueSchema` exactly per §10.4 (`summary` max 600,
`sections` max 6 each with `title` max 80/`body` max 1500/`relatedNodeIds`
default `[]`, `tradeoffs` max 5 default `[]`). `parseAiResponse(raw, realNodeIds)`
— strips a ` ```json ` fence, `JSON.parse`s, Zod-validates, filters
`relatedNodeIds` against the real graph, returns a tagged
success/failure result that **never throws and never partially renders**.
`buildSystemPrompt(settings, ctx)` — the six non-overridable guardrails
(§10.3), tone/depth/level modifiers, hard constraints **restated after** the
payload placeholder so untrusted content in the middle is never the last
word. `buildUserPayload(ctx)` — serialized graph with stable labels, docs for
components actually present, this run's rule violations, the chapter's
problem statement/objectives (chapter modes only), and — **only when
`ctx.passed === true`** — blueprints and commentary.

**This is the highest-weight phase in the track** — the spoiler gate (§10.6)
lives entirely here, enforced by the payload builder simply never populating
the blueprints field pre-pass, not by a prompt instruction to withhold them.
Get this wrong and a pre-pass Building Blocks learner sees the answer.

**Automated tests:**
1. Every schema field's bound (max length/array size) accepted at the
   boundary, rejected just past it.
2. `parseAiResponse`: strips the fence correctly; rejects malformed JSON and
   a response missing a required field (failure variant, never a throw);
   filters out a `relatedNodeIds` entry not present in the supplied node-id
   set while keeping the ones that are.
3. `buildUserPayload({ passed: false, ... })` — assert the blueprints/
   commentary **key is absent**, not an empty array (the spec's "simply
   absent" is a literal claim, test it literally).
4. `buildUserPayload({ passed: true, ... })` — blueprints/commentary present.
5. `buildSystemPrompt` contains all six guardrail statements regardless of
   tone/depth/level combination, and the hard-constraints restatement occurs
   **after** the payload interpolation point (a string-position assertion).
6. A custom component's user-authored `docs` string, once assembled into the
   payload, is inert data only — confirm it can't be positioned in a way a
   naive concatenation would read as an instruction boundary (structural
   check per §4.5 — no test can prove model behavior, only prompt structure).

**Done when:** `typecheck`/`lint`/`test`/`build` clean.

**You verify:** nothing yet — not wired to a network call or UI until
Phase 4/5.

---

## Phase 4 — Orchestration (`src/ai/run-deep-check.ts`, new)

**Scope:** `runDeepCheck(ctx, settings, signal?)` ties Phases 1–3 together —
resolves the adapter from `settings.providerId`, builds both prompt strings,
calls `provider.complete()`, runs `parseAiResponse`, returns one tagged
result (`{ status: "ok", critique } | { status: "error", kind, message }`) so
Phase 5's UI only ever branches on one shape. `AbortSignal` threaded through
for a cancel button. `testConnection(settings)` — a trivial one-line
round-trip reusing the same adapter/error-mapping, for Phase 5's Settings
modal.

**Automated tests, mocked provider only:**
1. Happy path: settings → assembled prompts → adapter called with them →
   valid JSON → `status: "ok"` critique.
2. Adapter auth failure → `status: "error", kind: "auth"`, provider-specific
   message, not a generic string.
3. Malformed JSON from the adapter → `status: "error"`, no partial critique
   ever returned alongside it.
4. `AbortSignal` fired mid-call → call cancels, no result forced through.
5. `testConnection()` happy + auth-failure paths, reusing the same error
   mapping rather than reimplementing it.

**Done when:** `typecheck`/`lint`/`test`/`build` clean.

**You verify:** the first point worth hitting your real xAI key end-to-end,
outside the browser — a throwaway script exercising the full
settings→prompt→provider→parse chain against a live model, before any UI
exists to blame for a bad result. Deleted after, never committed.

---

## Phase 5 — UI: settings modal, Deep Check button, slide-over panel
## (`AppHeader.tsx` modified; new components)

**Scope:**
- `AiSettingsModal` (new): provider/model select, masked API-key field,
  depth/tone/level, `baseUrl` (openai-compatible only), a **Test Connection**
  button (Phase 4's helper), and an explicit, unmissable line stating the key
  is stored in this browser's IndexedDB and never sent to ScaleCraft's
  servers (§10.2 — required, not optional copy).
- **Deep Check** button in `AppHeader.tsx`, beside `ValidationIndicator`.
  Since `AppHeader` is already the one header shared by Sandbox and both
  chapter modes (confirmed in the current file), §10.5's "available in all
  three modes" falls out for free — no per-mode wiring needed. Disabled with
  a tooltip opening Settings when no key/`enabled: false`.
- `DeepCheckPanel` (new, slide-over): renders an `ok` result via
  `react-markdown` + `rehype-sanitize` (already dependencies) — prose, no
  issue counts, no severity colors, visually distinct from the validation
  dropdown per §4.2's first reversal. Loading state, a cancel button wired to
  Phase 4's `AbortSignal`, and the plain "the model returned something
  unusable" failure state.
- Clicking a critique section selects its `relatedNodeIds` via the existing
  canvas selection mechanism — **not** through `nodeStates`, which stays
  reserved for validation state.
- Ctx assembly at each call site: `sandbox/page.tsx` always builds the
  pre-pass shape (no chapter, per §10.6's last line); `ChapterWorkspace.tsx`
  builds ctx from the already-computed `ChapterOutcome` (problem statement,
  objectives, and — only once `passed`— blueprints/commentary via Phase 3's
  gate).

**Automated tests:** `AiSettingsModal` (render/save/test-connection states),
`DeepCheckPanel` (loading/ok/error rendering; section-click fires the
selection callback with the correctly filtered ids), `AppHeader`'s
enabled/disabled Deep Check button logic.

**Done when:** `typecheck`/`lint`/`test`/`build` clean.

**You verify — the real click-through, both themes:**
1. Settings with no key saved — Deep Check disabled with a tooltip; the
   storage disclosure is visible and honest.
2. Paste your real xAI key, pick `xai`, hit Test Connection — a real
   pass/fail, not a stub.
3. Sandbox: build any graph, click Deep Check — slide-over opens with prose
   (no issue-count/severity styling); a section referencing a node
   highlights it via normal selection, not a colored validation ring.
4. Building Blocks, on a chapter **not yet passed**: click Deep Check —
   confirm the response never reveals or alludes to a blueprint's reference
   shape. This is the actual spoiler-gate proof and the one check that
   matters most in this phase.
5. Pass that chapter, click Deep Check again — the response now compares
   your design against the reference blueprints (debrief framing).
6. Toggle light/dark with the panel open; resize narrow — no overflow/
   z-index collision with the canvas or the `ValidationIndicator` dropdown
   (the exact category of bug `CRITIQUE.md` has flagged before).

---

## Phase 6 — Hardening, full regression, docs sync — done

**Scope:**
- Full pipeline: `npm run typecheck && npm run lint && npm test && npm run
  build` — green, not "green last time."
- **Grep-verified, not assumed:** no file under `src/ai/` imports from or
  writes to `chapter-outcome.ts`'s pass/fail decision — the "never
  load-bearing" constraint made structurally checkable, not just claimed.
- **Key-leak check:** grep the actual diff (not just trust `.gitignore`) for
  anything resembling a real provider key, given one sat in the working tree
  for this whole track.
- Doc sync: `validation_agent_design.md`'s Rollout Status (Track 3 → done),
  `MILESTONES.md` milestone 5, `NEXT_STEPS.md` Step 4.5 → fully done (both
  tracks landed).
- This file gets emptied out once merged, matching its own live-task-list
  convention.

**Done when:** pipeline green, docs consistent, key-leak grep clean. **Done** —
verified fresh, not carried over from an earlier pass: `typecheck`/`lint`
(0 errors, 0 warnings — see the post-Phase-6 follow-up below for the two
warnings that used to linger here)/`test` (912/912, 119 files)/`build` all
clean; `git grep` for `chapter-outcome` under `src/ai/` returns nothing; a
provider-key-shape grep across tracked files returns only test fixtures.

**You verify:** a final free-form click-through of all three modes — the
"does it still feel right" bar, same as Track 2's Phase 7. **Not yet done** —
this is the one item in this whole track that stayed genuinely open after
this doc-sync pass; nothing here substitutes for it.

---

## Post-Phase-6 follow-up — multi-profile AI settings, Help view, Cancel fix

Landed after Phase 6's own audit came back clean, in response to explicit
follow-up asks rather than anything in the original §10 spec:

- **Multiple named AI profiles** replace the single fixed `AiSettings` row:
  Dexie v6 (`aiProfiles` + `aiActiveProfile`, migrating any real prior
  configuration into the user's first profile, seamlessly — covered by a real
  version-upgrade test, not just inspection). `src/ai/profiles.ts` (pure
  CRUD) + `AiProfilesView.tsx` (new: list/switch/edit, delete with an inline
  confirm-then-~5s-undo flow, no native dialogs).
- **Help view** (`?` icon in the panel header): what Deep Check does, why
  BYO-key, the provider list rendered from the live registry, and a setup
  guide link.
- **Cancel, on the loading state, no longer closes the whole panel** — it
  only aborts the in-flight request now, since a user cancelling a run may
  just want to switch to Profiles/History/Help rather than lose the panel.
- **The two React Compiler "incompatible library" warnings that used to show
  up on every `lint` run** (`AiSettingsForm.tsx`, `CreateComponentModal.tsx`
  — both from react-hook-form's `watch()` returning a function the compiler
  can't verify is safe to memoize) are gone: both switched to `useWatch`.
  Fixing `AiSettingsForm.tsx`'s case surfaced a real latent bug the warning
  had been masking — a `useEffect` keyed on the watched `providerId` fired
  once on mount (effects always do, regardless of deps), and for a profile
  whose saved model was already legitimately outside the new provider's
  suggested list, that stray mount-time pass silently overwrote it back to
  the provider's default. Fixed by moving the logic into the Provider
  `<select>`'s own `onChange` (via `register`'s `onChange` option) instead of
  an effect — it only runs on a real, user-initiated provider switch now.
- §10.5's disabled-button question (flagged after the original Phase 5 audit
  — the shipped button was never HTML-`disabled`, unlike what §10.5 said) is
  resolved by updating §10.5 to match the shipped, deliberate behavior rather
  than changing the button.

Full pipeline re-verified after this round too — see Phase 6's "Done when"
line above, which reflects this round's state, not the original Phase 6
commit's.

---

## Sequencing note

Phases 1–4 are pure logic (provider adapters, settings/persistence, prompt
assembly, orchestration) — no UI, tests as the gate, real-key checks limited
to throwaway scripts. Phase 2 is the one real Dexie-migration pause point.
Phase 5 is the one actually worth your time clicking through, and the one
where the spoiler gate gets its real proof. Each phase lands as its own
commit on `feature/ai-deep-check` (one branch for the whole track, per
`NEXT_STEPS.md`) — I'll stop after each phase and report rather than batching.
