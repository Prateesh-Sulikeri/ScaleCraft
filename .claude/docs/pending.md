# Pending work

Release 3.2.0 (infra clean-up) is done - all 6 phases (bundle-analysis baseline,
content extraction, content access layer, engine package extraction, UI
code-splitting, verify) shipped and verified, see `.claude/PROGRESS_LOG.md`'s
2026-08-03 entries for the full record. That plan is no longer active; this file
now holds candidate follow-on work found during a performance audit done right
after 3.2.0 wrapped, not yet scoped to a release. Scope/ordering is the user's
call - could be its own release, or a "drop 2" batch cut from
`release/v3.2.0-infra-clean-up` before it merges to `develop`.

---

## Candidate action items (performance audit, 2026-08-03)

Found by tracing actual render/data-access code after 3.2.0's bundle-splitting
work, not from a stale doc. Roughly in priority order - #1 and #2 compound each
other and are cheap; #3 needs a bundle-analyzer re-run to size before deciding
how much effort it's worth.

### 1. Canvas node components aren't memoized

`src/canvas/Canvas.tsx` (~L470, the `nodes` useMemo) rebuilds a brand-new data
object for every node whenever `highlight`, `nodeStates` (validation), or
`spaceHeld` changes. `ComponentNode`/`ZoneNode`/`CommentNode`/`StartNode`
(`src/canvas/ComponentNode.tsx:42` etc.) are plain functions, not wrapped in
`React.memo`. Result: clicking "Highlight Connections" on one node, or running
Validate, re-renders every node on the board, not just the ones whose
appearance actually changed. Fine at a dozen nodes, will show up as jank as
graphs grow (Sandbox is open-ended by design).

**Fix:** wrap the four node components in `React.memo`; stop spreading a fresh
`style`/`data` object onto nodes whose highlight/validation state didn't
actually change.

### 2. Custom components rebuild a Zod schema on every render

`getComponent()` (`src/content/components/registry.ts:64`) is called inside
`ComponentNode`'s render body. For built-ins that's a cheap array `.find()`
over a registry built once at module load. For **user-created custom
components**, it calls `toComponentDefinition()` ->
`generateComponentDefinition()` (`src/content/components/generate.ts:54`),
which constructs a fresh `z.object(...)` schema from scratch on every call, no
cache. Combined with #1, every custom-component node rebuilds its Zod schema
on every irrelevant canvas re-render.

**Fix:** memoize `toComponentDefinition` per record (e.g. keyed by id,
invalidated on edit).

### 3. AI provider SDKs still ride along eagerly through `@/engines`

Already noted as an open, unscheduled item in this doc's old Phase 3 section
("provider-adapter eagerness... a known, undecided follow-on") - confirmed
still true, and bigger than that note implied. `src/engines/index.ts` does
`export * from "./deep-check"`, which re-exports `providers`/`getProvider`
straight from `@/ai/providers/index.ts`, which statically imports all 5
provider files - including `anthropic.ts`, which pulls in the real
`@anthropic-ai/sdk` package. 11 files import from `@/engines`
(`sandbox/page.tsx`, `AiSettingsForm.tsx`, `AiProfilesView.tsx`,
`DeepCheckPanel.tsx`, etc.), and several import real values from that barrel,
not just types - tree-shaking through 3 layers of barrel re-export is a bad bet
for keeping those SDKs out of routes that never touch Deep Check.

**Fix:** split each provider's lightweight metadata (`id`/`label`/
`defaultModel`, needed for the Settings dropdown) from its actual `complete()`
implementation; dynamic-import only the selected provider's implementation at
call time. Re-run the bundle analyzer first to confirm the actual weight this
is costing non-Deep-Check routes before committing effort.

Along side this item, let us add support to more AI models, from the providers we 
already serve. This helps to have more variaty of direct intergations. 
Let us improve our prompts a bit more to give better answers and have fine tuning 
options optmized for better more personalized results. 


### 4. Vercel deployment fix

Currently vercel deploys ever single branch we create which is something I do not want
I want it to deploy only the release/*, develop and main branches
so something like:
```
if [[ "$BRANCH" == "main" || 
"$BRANCH" == "develop" || 
"$BRANCH" == release/* ]]; then
echo "✅ Deploying $BRANCH"
exit 1
fi

echo "🛑 Skipping deployment for $BRANCH"
exit 0
```
or something better that you can comeup with. 

### Update the release update
- update the release updates
- uodate graphify
