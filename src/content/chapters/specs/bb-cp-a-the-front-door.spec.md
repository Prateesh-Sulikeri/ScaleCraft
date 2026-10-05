# Chapter spec - Checkpoint A: The Front Door

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20, and the checkpoint
contract in `.claude/docs/pending-checkpoints.md`. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-cp-a-the-front-door`)
- Lesson body: `public/content/chapters/bb-cp-a-the-front-door.mdx`
- Manifest row: slug `checkpoint-a-the-front-door`, number `A`, after 3.5;
  3.6's `prerequisiteSlugs` now points here.

**Inherits R1's checkpoint precedent** (R1 spec §0, §12): four-section lesson,
no diagram, no quiz, requirement list in `problemStatement`, blank canvas. New
here: it is a *group* checkpoint, the first of five added 2026-10-05 so that no
group ends without a composition event (pending-checkpoints.md, "The problem").

## 0. Type classification

**Checkpoint, Build flavor** (blank canvas). §6's Checkpoint column: cold open,
Connections, Transition brief, Preview of next - everything else prohibited. No
new material (§4).

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Assemble the whole Group A front door from a product brief, with two distinct services behind it. |
| Type | Checkpoint (Build) |
| Difficulty | foundational |
| Estimated time | 25 minutes |
| Prerequisites | 3.5 |
| Unlocks | Group B (3.6) |
| Building blocks introduced | None |
| Stages trained | 5 (Design) at small scale; 3-4 in passing |
| Interview relevance | High, indirectly: the front door is the first thing drawn in any design answer. Two sentences in the cold open (§6 prohibits an Interview lens). |

## 2. Learning objectives

1. **Knowledge** - Name, for each requirement, the Group A component that
   answers it and the chapter that taught it.
2. **Engineering** - Order the edge so each stop only receives traffic the stop
   before it has already handled.
3. **Practical** - Assemble the front door on an empty canvas, two distinct
   services behind it, and pass Submit.
4. **Interview** - Explain identical copies (load balancer) versus distinct
   services (gateway) using your own design.
5. **Communication** - Walk one request through the design in a single pass.

Exercised by the build (1-3), the blueprint commentary (5), and the billing
requirement, which fails if billing is placed behind the load balancer (4).

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | Five chapters of slotting one box into a prepared chain; now an empty canvas. Interview framing in one sentence. |
| 14 | Connections | One row per chapter, phrased as the question it answered. Two carry-forward warnings: an inert box earns nothing (3.1), and copies vs. services (3.5). |
| 16 | Your turn | Product paragraph, seven requirements, "what you are not told". |
| Next | Next | 3.6, via the interchangeability every copy was assumed to have. |

## 4. Declared omissions

Same as R1 §4: eleven sections prohibited by §6, no diagram (it would be the
answer), no quiz (§22), `problemStatement` longer than §11.2's 2-3 sentence
norm because the requirement list must sit beside the canvas. Calibration
checked line by line: every bullet states an outcome; none names a component,
field or edge kind.

## 5. Diagrams

None. A diagram of a checkpoint's subject is its answer.

## 6. Component budget and requirement mapping

Palette: Group A plus 1.2's app server and database (8). `client` omitted, as
in R1: the brief says "from a browser", and 3.2 replaced the generic client.
All 8 required.

| Requirement | Answer | Chapter |
|---|---|---|
| One domain name, from a browser | Browser, DNS | 3.2 |
| Perimeter refuses by default | Firewall, `allow-listed` | 3.1 |
| Certificate in one place | Reverse Proxy, `terminatesTls` | 3.3 |
| Auth and per-customer limit, once | API Gateway, `requiresAuth` | 3.5 |
| Projects API on several machines, survives one dying | Load Balancer over two copies | 3.4 |
| Billing, separate service, same domain | Third app server behind the gateway | 3.5 |
| One database, only services reach it | SQL Database from compute | 1.2 |

Interleaving pull (contract rule 2): 1.2's compute-only database rule, and 2.1's
order of a request's stops.

## 7. Validation rules

Group A's warnings (`single-instance-load-balancer`, `permissive-firewall`)
plus the structural set. `no-direct-client-database` cannot fire (no `client`)
and is kept for continuity with R1 (R1 spec §12).

## 8. Blueprints

Two, one system. **Two nodes**: two app servers behind the load balancer, as
3.4 taught. **Instances**: one projects node with `instances >= 2`, which 3.6
teaches next but the card already exposes. Both require billing as a separate
app server fed by the gateway, and config predicates on the three cards whose
setting the brief describes (firewall, proxy, gateway). Checked 2026-10-05 by
a throwaway script: both reference graphs pass; moving billing behind the load
balancer fails.

## 9. Hints

Three: follow one request in (orienting); copies vs. services (directional);
the config-drift message explained (the same workaround R1 and 3.24 carry,
open decision 11).

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

Every move has a source: Browser and DNS (3.2), Firewall and its policy (3.1),
Reverse Proxy and TLS (3.3), Load Balancer and two copies (3.4), API Gateway and
routing to distinct services (3.5), app server and database (1.2). No move
needs an untaught chapter; the instances blueprint accepts an early discovery
but nothing requires it.

## 12. Flagged

- Billing's route is drawn as a gateway edge; the canvas cannot show path-based
  routing.
- Config predicates on default values mean a learner who never opens a config
  panel passes them; they exist to fail a learner who changes one wrongly.
