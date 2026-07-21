# Pending — code review findings (2026-07-21)

Senior-engineer review pass over `main` (HEAD `16dbcb9`): obvious bugs, obvious
security issues, and roadmap/design alignment. Findings only — nothing below has
been fixed yet. Remove items as they're resolved.

## P0 — main is red

- ~~Commit `16dbcb9` fails its own CI (9 test failures, 77 typecheck errors in
  `src/flows/*.test.ts`).~~ **Resolved** on branch `fix/flows-workflow-tests`
  (pushed to origin, branched from `development` per convention — not merged).
  Tests were authored against APIs that don't match the real surface
  (partial `ComponentDefinition` objects instead of real ones via
  `getComponent()`, `Connection` objects missing `sourceHandle`/`targetHandle`,
  a non-exported `ScaleCraftDB`, `runValidation` called without its required
  `rules` arg, assertions against a field — `instanceName` — that never
  existed on `ArchitectureGraph`). Also fixed, discovered while getting
  `npm run build` fully green: a pre-existing conditional-hooks bug in
  `ContextMenu.tsx` (early return before several hook calls) that the new
  CI lint step would otherwise have caught as a second red build; dropped
  the `codecov-action@v3` step since nothing generates the coverage file it
  expects (see the P2 nit below, now moot). `npm run build` passes clean.
  **Still true and unaddressed:** the commit sits directly on `main`,
  violating CLAUDE.md's branching convention — this doc's own fix followed
  the convention going forward, but the history isn't rewritten.

## P1 — real bugs in product code

- **Duplicate-ID double-restore** (`src/canvas/store.ts`): delete a node →
  Ctrl+Z (history restores it) → UndoToast still visible → click its "Undo" →
  `undoLastDelete` in `"merge"` mode re-appends the same node/edge IDs on top of
  the already-restored ones. `undo()`/`redo()` never clear `pendingUndo`, and
  merge mode doesn't check for existing IDs. Fix: clear `pendingUndo` on
  `undo`/`redo`, and/or have merge-mode restore skip IDs already present.
- **`reverseEdge` doesn't swap handles** (`store.ts:967`): swaps
  `source`/`target` but not `sourceHandle`/`targetHandle`. Latent breakage —
  works today only because nodes have a single handle per side.
- **Import is unvalidated** (`ProjectMenu.tsx:44` `handleImportFile`): after
  `JSON.parse`, only `Array.isArray` on `nodes`/`edges`, then `as` casts. A
  malformed/hand-edited file (node without `position`, unknown `type`, garbage
  `data`) loads into the store and crashes the canvas at render time. Fix: a
  Zod schema for the save-file shape (~30 lines; Zod is already a dependency).
- **Per-render graph stringify** (`src/app/sandbox/page.tsx:130`):
  `currentGraphKey = JSON.stringify(toArchitectureGraph(nodes, edges))` runs on
  every render, including every frame of a node drag. And because `position` is
  in `ArchitectureGraph`, merely moving a node flags validation results as
  stale with zero topology change. Fix both by stripping positions from the
  staleness key (and memoizing).
- **Allowlist case bug (latent)** (`src/auth/beta-allowlist.ts`): input is
  lowercased but list entries aren't normalized — a future mixed-case entry
  silently never matches. Normalize both sides before milestone 10 wires Clerk.

## P2 — security hardening (current posture is fine: client-only, no secrets)

- **Mermaid `securityLevel` not pinned** (`MermaidBlock.tsx`): SVG injected via
  `dangerouslySetInnerHTML`, relying on Mermaid's *default* `'strict'` level.
  User-authored custom-component docs flow through this. Add
  `securityLevel: "strict"` to `mermaid.initialize` — one line.
- Import validation (above) doubles as the security fix for shared export files.
- Markdown pipeline verified correct as-is: `rehypeRaw` → `rehypeSanitize`
  order in `MarkdownRenderer.tsx` is right; no change needed.
- When milestone 5's LLM validation pass lands: Route Handler behind auth with
  cost caps (MILESTONES.md already says this — don't let a spike shortcut it).
- When Clerk lands: don't ship allowlist emails in the client bundle.
- ~~CI nit: `codecov-action@v3` is deprecated and uploads a coverage file no
  script generates.~~ **Resolved** — dropped in `fix/flows-workflow-tests`.
- Standing item: React Flow `hideAttribution` licensing must be re-checked
  before any monetized/public launch (already in OPEN_QUESTIONS.md).

## Direction / alignment

- **Product-thesis drift (the big one):** every commit since mid-July is
  sandbox/canvas polish (annotation UX, UI overhaul phases 1–5, custom
  components, image export). The differentiating product — chapter framework
  (milestone 6) and the first two chapters (7) — hasn't started, and
  MVP_SCOPE's two-chapter reuse bet remains unproven. Recommendation: declare
  the sandbox feature-complete for MVP; next unit of work is milestone 6.
- **Process conventions lapsed:** `.claude/PROGRESS_LOG.md` ends 2026-07-15
  while ~10 significant commits came after — it no longer describes the repo.
  Either revive the logging-subagent convention + development-branch flow, or
  amend CLAUDE.md to match reality; the half-state is the worst option.
- **Principle tension to re-check at chapter time:** validation is now
  manual-button-only, and custom components fall back to the coarse relations
  matrix — fine for sandbox, but when chapters land, re-evaluate whether
  chapter mode needs more proactive validation ("explanations always shown on
  failure" only bites if failure is ever detected).

## UI / visual review (2026-07-21) — overlap, collision, consistency, rendering

Follow-up pass focused on stacking contexts, positioning, and visual
consistency. The `--z-*` token system added in `b529678` ("Minor colision
fixes") is good, but the migration to it is incomplete and a few genuine
overlap risks remain.

### Z-index token system — incomplete migration
- **`--z-tooltip: 60` is defined in `globals.css:126` but never used.** Every
  tooltip in the app renders at raw `z-50` instead: `Tooltip.tsx:43`,
  `ShortcutsButton.tsx:65`, `Palette.tsx:123`, `Palette.tsx:196`. Raw `z-50`
  ties with `--z-modal: 50`, so tooltip-vs-modal stacking is decided by DOM
  order (portals to `document.body` land last, so tooltips currently win —
  by luck, not by design). Migrate all four to `z-[var(--z-tooltip)]`.
- **Raw z values bypassing tokens elsewhere:** `ShortcutsButton.tsx:79/82`
  (backdrop `z-20`, dropdown `z-30` — the token *numbers*, hardcoded),
  `Palette.tsx:434/436` (color-picker popover backdrop `z-40` / panel `z-50`
  — these equal the *modal* tokens, one tier higher than the dropdown tier
  this UI semantically is), `Palette.tsx:77` (`z-10`), `page.tsx:21/25`
  (`z-10`). One sweep to tokens makes the layering auditable.
- Cosmetic: `globals.css:125-126` — the `--z-toast: 70` comment says
  "(highest)" but `--z-tooltip: 60` is declared *after* it; reorder or fix
  the comment.

### Genuine overlap/collision risks
- **Comments and flags aren't z-pinned the way zones are** (`store.ts:466`
  pins zones to `zIndex: -1`; `addComment`/`addStartMarker` set none). A
  comment drawn or resized over component nodes sits *above* them in
  DOM/render order and swallows their pointer events — nodes under a large
  comment can't be clicked, dragged, or double-click-configured. Either pin
  comments behind components like zones, or accept-and-document. (Flags are
  small, lower risk, same mechanism.)
- **`Tooltip.tsx:26` clamps with a hardcoded 80px half-width** but the
  tooltip is `whitespace-nowrap` variable-width — long labels
  ("Redo (Ctrl+Shift+Z)", "Hide documentation panel") near the right viewport
  edge can still overflow off-screen. Palette's `ToolbarButton` version
  (`Palette.tsx:168-171`) clamps with the real `TOOLTIP_WIDTH` — Tooltip.tsx
  should measure (or use a fixed width) the same way.
- **All portaled tooltips render below their anchor (`rect.bottom + 6`) with
  no vertical flip** — fine for the header/left-palette placements today, but
  any future bottom-edge anchor will clip. Note for when toolbars move.
- **`ContextMenu.tsx:128/221`**: vertical overflow is handled
  (`max-h-[70vh] overflow-y-auto`) but there's no horizontal edge-flip on the
  root menu — right-clicking a node near the right viewport edge can push the
  180px+ menu partially off-screen (the *submenu* flyout has hand-rolled
  edge-flip per NodeConfigPopover's comment; the root menu doesn't).

### Consistency issues (not bugs, but drift)
- **Three separate portaled-tooltip implementations** with diverging styling
  and clamp math: `Tooltip.tsx` (`px-2.5 py-1`, label-only, 80px clamp),
  `PaletteItem`'s inline tooltip (`px-2.5 py-2`, label+summary, fixed width),
  `ToolbarButton`'s inline tooltip (same as PaletteItem but separate copy).
  Consolidate into one Tooltip with an optional description slot.
- **Two dropdown-dismissal patterns:** ProjectMenu/BoardMenu/ShortcutsButton/
  ValidationIndicator use the full-viewport backdrop click-catcher;
  `ModeBadge.tsx:29-35` uses a capture-phase document listener instead (its
  comment explains why — React Flow's stopPropagation eats bubble-phase
  clicks). Pick one: the capture-listener approach actually works *better*
  over the canvas (no invisible layer blocking the first click), so consider
  migrating the backdrop menus to it rather than the reverse.
- **Semantic token misuse in Canvas placement mode** (`Canvas.tsx:606/611/624`):
  the placement hint pill and drag-capture overlay use `--z-modal-backdrop`,
  and the drag-preview rectangle uses `--z-modal` — they work, but none of
  these are modals/backdrops; a `--z-canvas-overlay` tier (or reusing
  dropdown tiers) would keep the token vocabulary honest.
- **`EdgeInspector.tsx:38` sits at `--z-node-chrome` (10)** yet is panel
  chrome (absolute bottom-right of the canvas), not node chrome — harmless
  today, but it's below the dropdown tier, so an open dropdown correctly
  covers it while a node's lock button (same tier) ties with it. Reclassify
  when touched.

## Suggested order of attack

1. Fix/revert `src/flows/` tests (P0 — main is red).
2. Import Zod validation + Mermaid `securityLevel` (~1 hour combined).
3. `pendingUndo` double-restore + `reverseEdge` handles + staleness-key fix.
4. Start milestone 6 (chapter framework) instead of further canvas polish.
