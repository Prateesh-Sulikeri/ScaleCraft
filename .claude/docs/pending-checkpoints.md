# Pending - Building Blocks checkpoints rework

**Status: roster authored 2026-10-05** (uncommitted on
`feature/content-groups-f-g`; ledger entry "Checkpoints A, B, C, E, F" in
`pending-chapters.md`). Scoping opened the same day. D, G and Final were checked against
the contract and kept, with small edits. Browser click-through of all five
done 2026-10-07: every blueprint (8 across A-F) passes Submit in under 300 ms,
and each untouched starter fails with named reasons. B's starter shows the
known config-predicate drift ("Missing: DNS, Firewall" with both on canvas),
which its hint 3 already discloses. Still open: the follow-up twist
(engineering).

## The problem

Building Blocks has 37 chapters and 3 checkpoints, all bunched at the end of
groups:

| Stretch | Chapters | Composition events |
|---|---|---|
| Parts 0-2 | 11 | none (one 3-box build in 1.2) |
| Groups A-D (3.1-3.16) | 16 | D only, at the very end |
| Groups E-G (3.17-3.26) | 10 | G only, at the very end |
| After G | - | Final (open design) |

Between 3.1 and Checkpoint D, a learner never assembles anything bigger than a
one-node fix. D then asks for 9 requirements across 4 groups at once, from
memory. The same cliff repeats at Checkpoint G (10 requirements, 3 more groups). And
every chapter exercise before a checkpoint is a fix on a mostly built graph,
so the checkpoint is also the first time the learner places most components
themselves.

A checkpoint should be the moment you *use* what a group taught on something
that looks like a real system: a whole system, or a real slice of one.

## What makes a checkpoint worth doing (proposed contract)

1. **A product, not a parts list.** Requirements are product needs ("a third of
   users are overseas", "the email provider fails for an hour"). Each one maps
   to a taught move, but the brief never names a component.
2. **Interleaved, not just the latest group.** At least one requirement must be
   answered by a move from two or more groups back. Spaced retrieval is the
   point (CURRICULUM §1.3 rule 6).
3. **Scoped to the group, situated in a system.** A group checkpoint gives the
   rest of the system as a starter (the *Extend* flavor below), so the effort
   goes into what the group taught, while the learner still sees where it fits.
   Integration checkpoints (D, G) stay blank.
4. **Every requirement is traceable.** The debrief maps each requirement to
   the part of the reference design that answers it and the chapter that
   taught it, so a learner who passed by luck can see what they missed.
5. **No new concepts, no quiz.** The build is the retrieval; mastery is build
   success (unchanged from §14 Part 4).

### Flavors

| Flavor | Canvas | Tests | Used by |
|---|---|---|---|
| **Build** | Blank | Composing a whole system from a brief | D, G |
| **Extend** | Rest of the system provided, a zone left empty | Composing one tier inside a real system | Group checkpoints |
| **Review** | An inherited system with several planted faults, count stated, no per-fault hints | Spotting what a group taught you to distrust, including config | Config-heavy groups (B) |
| *(Open)* | Blank, anti-pattern validation | Judgment under an incomplete brief | Final |

Review is new to the curriculum. It mirrors real work (you usually inherit a
system) and it is the only honest way to checkpoint Group B, whose chapters
teach config and invariants rather than new boxes.

## Proposed roster (draft for discussion)

Bold rows are new. Times are first guesses.

| # | After | Name (working) | Flavor | Palette | Est |
|---|---|---|---|---|---|
| **1** | 3.5 | The Front Door | Build | 9 | 25 |
| **2** | 3.9 | Inherited Fleet | Review | 9 | 25 |
| **3** | 3.13 | The Data Tier | Extend | 11 | 30 |
| D | 3.16 | A Site That Stays Up | Build | 14 | 45 |
| **4** | 3.19 | Off the Request Path | Extend | 21 | 35 |
| **5** | 3.22 | Where the Bytes Live | Extend | 23 | 30 |
| G | 3.26 | Building a Complete Backend | Build | 27 | 60 |
| Final | G | Open System Design | Open | 27 | 60 |

Building Blocks goes from 3 checkpoints to 8, adding about 2.5 hours.

### 1. The Front Door (after 3.5)
- **Brief sketch:** a small SaaS with two services (accounts, billing) behind
  one domain. Default-closed perimeter, TLS terminated once, auth and per-caller
  limits in one place, and one app instance dying must not drop requests.
- **Retrieves:** all of Group A, plus 1.2 (nothing reaches the DB except
  compute) and 2.1 (request path order).
- **Why it matters:** first time the learner builds the whole edge in order
  rather than slotting one box into a prepared chain.

### 2. Inherited Fleet (after 3.9)
- **Brief sketch:** "you joined last week; this is the system." The front door
  from #1, already drawn, with about 4 planted faults: sessions in instance
  memory, capacity with no N+1 headroom against a stated peak, a 300 s TTL
  before a 30 s cutover, a permissive firewall left over from debugging.
- **Retrieves:** all of Group B, plus 3.1. The firewall fault is the
  interleaving pull.
- **Why it matters:** B teaches invariants, not boxes. Finding violations in a
  system that looks fine is the skill.

### 3. The Data Tier (after 3.13)
- **Brief sketch:** a marketplace. The front door and stateless fleet are
  provided; the data tier is empty. Orders need transactions; the catalog has
  attributes that vary per category; reads outnumber writes 20:1, and a buyer
  must see their own order right after placing it.
- **Retrieves:** Group C (store choice, NoSQL model config, replicas fed by
  replication edges), plus 3.7 (session state has to live somewhere shared).
- **Sharding** has no canvas shape (open decision 17); it stays off this build.

### D (was R1, unchanged position)
Now the integration of A-D rather than the first composition. With 1-3 before
it, D can stay as written; it stops being a cliff.

### 4. Off the Request Path (after 3.19)
- **Brief sketch:** D's job board is provided. Empty async zone. Confirmation
  email that must survive an hour-long provider outage; three teams that each
  need every "listing published" event; a 02:00 report that runs once; bursty
  image resizing that should cost nothing when idle.
- **Retrieves:** all of Group E, plus 3.16 (keeping the search index updated
  off the request path is the interleaving pull).

### 5. Where the Bytes Live (after 3.22)
- **Brief sketch:** a photo-heavy listing site. Uploads, public images through
  a CDN, private documents, and a sharded metadata store that needs a placement
  owner.
- **Retrieves:** Group F, plus 3.15 (CDN in front of the bucket) and 3.12.
- **Engine risk:** browser-to-bucket presigned uploads cannot be drawn (open
  decisions 8/20). The brief has to stay inside what the canvas can express.

### G, Final (were R2, R3, unchanged)
Checkpoint G sits right after Group G and covers it, so Group G needs no
extra checkpoint. Final stays the open-design gateway.

## Considered, not recommended

- **A checkpoint after Part 1 or Part 2.** The palette is 3 components; the
  real skill there (the interview loop) is reasoning the canvas cannot check.
  A checkpoint would be a 3-box build with an essay nobody grades. Better:
  strengthen 1.2's exercise if Part 1 feels thin.
- **A separate Group G checkpoint.** Checkpoint G follows Group G immediately and already
  requires failover, locks and limits.
- **One checkpoint per chapter pair.** Too frequent to feel like composition;
  it becomes a second exercise per chapter.

## Engineering this would need (not scoped yet)

- 5 new manifest rows, chapter definitions, blueprints, starter graphs (Extend
  and Review), lessons. Content work, chapter-author shaped.
- **Config-predicate drift (open decision 11)** bites #2 hardest: a config fault
  currently reports "Missing: X" with X on the canvas. Review needs that fixed,
  or it reads as a bug.
- **Gating existing learners.** New slugs land mid-curriculum. A learner who
  already finished 3.9 would suddenly find an incomplete checkpoint gating
  3.10.
- **Optional: a follow-up stage.** After the first pass, a twist ("sale day,
  10x traffic") requiring a change. This is interview loop step 8. It needs
  multi-stage checkpoint support, which does not exist.

## Open questions

**Defaults taken 2026-10-05** (the user approved authoring without answering
these; each can still be reversed):

- Roster: all five, unmerged.
- Review flavor: shipped in B, with the config-drift workaround in hint 3 and
  the lesson, until open decision 11's engine fix lands.
- Gating: moot today - `prerequisiteSlugs` is not enforced anywhere, so no
  existing learner is locked out. The manifest now routes 3.6, 3.10, 3.14 and
  3.23 through the checkpoints for when it is.
- Follow-up stage: deferred; needs multi-stage checkpoint support.
- Naming: ~~R1-R3 unchanged; group checkpoints use the group letter~~
  **Superseded 2026-10-05** at the user's request ("A B C R1 E? what did D do
  to you"): one scheme, every checkpoint lettered by its group. R1 is now **D**,
  R2 is **G**, R3 is the **Final** checkpoint. Display numbers and all
  learner-facing prose changed; slugs and definition ids keep r1/r2/r3 because
  they are persistence keys. Release notes keep the old names (historical).

Original questions:

1. **Roster.** All five new checkpoints, or a subset? (Alternative: merge #1
   and #2 into one A+B checkpoint after 3.9.)
2. **Review flavor.** Worth introducing, given it depends on the drift fix?
3. **Gating.** Should new checkpoints hard-gate the next group like D/G, or
   be required for new learners and recommended for those already past them?
4. **Follow-up stage.** In scope for this rework, or later?
5. **Naming.** R1-R3 slugs are persistence keys and cannot change. Number the
   new ones into one sequence for display (Checkpoint 1-8), or keep R for the
   big three and name group checkpoints by group?
