# Pending - content follow-ups after Groups F/G and R2/R3

Raised 2026-10-01 after authoring 3.20-3.26, R2 and R3 (branch
`feature/content-groups-f-g`). Numbers in parentheses are open decisions in
`pending-chapters.md`, which holds the full reasoning; this file is the
actionable list.

## Before merging (blocking)

- [ ] **3.25 trace diagram** - Mermaid gantt uses `dateFormat x`; check the axis
      renders as seconds in the browser.
- [ ] **3.23 and 3.26 walkthroughs** - pass `walkthrough-invariants.test.ts`;
      layout never seen in a browser.
- [ ] **R2 and R3 click-through** - R2's blueprint is the largest in the
      curriculum (21-22 nodes, 25-26 edges): check Submit speed and drift
      messages. Confirm an R3 forbid failure reads well end to end.
- [ ] **Cold review of 3.20-3.26, R2, R3** - all one-shot passes, no second
      reader. A fresh session on the diff or `/code-review`.
- [ ] **Confirm two judgment calls** - R3 passes any anti-pattern-free design,
      however small; 3.26 cannot require exactly one Leader (two Leaders plus a
      Coordinator still match).

## Engine (not blocking, real teaching cost)

- [ ] **Config-predicate drift (11)** - a failed config predicate reports
      "Missing: X" with X on the canvas. Hit by R1, 3.24, R2; why most chapters
      avoid gating config. Fix: report config mismatch as its own category.
- [ ] **Rule severity per chapter (11)** - warnings cannot fail Submit, so R1/R2
      pass with an `allow-all` firewall. R3 works around it with `forbid`.
- [ ] **`absent` inside `require` is drift-blind (11)** - forbid is now reported
      by label; `absent` is not. Blocks "exactly one Leader" in 3.26.
- [ ] **Undrawable shapes (8, 20)** - browser/CDN -> object storage (presigned
      upload, CDN origin); storage-node heartbeats -> coordinator; API Gateway ->
      cache (3.24's shared counter). Bites RWE Instagram, YouTube, Drive.
- [ ] **Walkthrough failure state (14)** - no faulted node/edge; Group G uses the
      lit-path workaround.
- [ ] **Missing config schema (17, 19, 23)** - no index, shard-key, timeout,
      retry or idempotency fields; 3.10, 3.13, 3.23 teach these off-canvas.
      Decide once for all three.

## Docs (doc-only commits)

- [ ] **Component docs (22)** - rewrite `coordinator.md` (describes a saga
      orchestrator); fix `lock-service.md` ("state state-changing"), `leader.md`
      (election mechanism, not the role), `object-storage.md` artifacts.
- [ ] **CURRICULUM §14 3.22 row (21)** - cites 3.17, outside 3.22's
      prerequisite chain.
