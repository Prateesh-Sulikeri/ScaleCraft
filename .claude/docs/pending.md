# Pending — code review findings

Originally a senior-engineer review pass over `main` on 2026-07-21. Re-verified
against actual code (not narrative claims) on 2026-07-25 — every P0/P1/P2 item
and nearly all UI/visual items from that review are now fixed. This file is
trimmed down to what's genuinely still open. See git history for this file if
the full original review write-up is needed.

## Closed since 2026-07-21 (verified in code, not just claimed)

- P0 main-is-red — fixed (`fix/flows-workflow-tests`, merged into `development`).
- `pendingUndo` double-restore — `store.ts` `undo()`/`redo()` null `pendingUndo`.
- `reverseEdge` handle swap — `store.ts:1036` swaps `sourceHandle`/`targetHandle`.
- Unvalidated import — `ProjectMenu.tsx` now runs `canvasImportSchema.parse()`
  (`src/canvas/import-schema.ts`).
- Per-render stringify / stale staleness-key — `sandbox/page.tsx` uses a
  memoized, position-stripped `architectureGraphTopologyKey()`.
- Allowlist case bug — `beta-allowlist.ts` lowercases both sides.
- Mermaid `securityLevel: "strict"` — set in `MermaidBlock.tsx`.
- Z-index token migration — complete (`--z-tooltip` in use, `--z-canvas-overlay`
  tier introduced and used by Canvas.tsx placement overlays, ShortcutsButton/
  ComponentPickerRow off raw z-values, globals.css comment ordering fixed).
- Comment/flag z-pinning — `addComment`/`addStartMarker` set `zIndex: -1`.
- Tooltip clamp — real `TOOLTIP_WIDTH` constant replaces the old hardcoded 80px.
- ContextMenu root-menu horizontal edge-flip — present (`ContextMenu.tsx`).
- "Three tooltip implementations" — moot; `Palette.tsx`/`PaletteItem` were
  deleted outright in the Component Picker rewrite (Phase 3).
- `EdgeInspector.tsx` z-tier — reclassified `--z-node-chrome` → `--z-dropdown`
  (2026-07-25), matching that it's floating panel chrome, not node chrome.
- `ModeBadge.tsx` capture-phase listener vs. the backdrop-catcher pattern used
  elsewhere — reviewed, **not a bug**: it sits over the canvas, where React
  Flow's node-drag `stopPropagation()` on mousedown defeats a bubble-phase
  backdrop click-catcher (documented in the component's own comment). The
  other backdrop-pattern menus live in the header, not over canvas, so they
  don't hit this. No change needed.

## Still open

- **React Flow `hideAttribution` licensing** must be re-checked before any
  monetized/public launch. Standing item, not yet triggered.
- **Product-thesis drift**: real chapter content still hasn't landed — the two
  `ChapterDefinition`s wired up in Phase 5 are explicitly throwaway
  placeholders (stated in their own header comment). Milestone 5 (stronger
  validation agent) is next per `.claude/docs/NEXT_STEPS.md`, and gates real
  curriculum content (Steps 5/6) since chapter pass/fail depends on rule
  coverage.
- **Validation principle tension to re-check at chapter time**: validation is
  manual-button-only; re-evaluate whether chapter mode needs more proactive
  validation once real chapters exist.
