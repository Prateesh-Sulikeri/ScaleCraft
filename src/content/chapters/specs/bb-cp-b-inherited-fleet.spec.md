# Chapter spec - Checkpoint B: Inherited Fleet

Authored under CURRICULUM.md §5, §6, §14 Part 4, §20, and the checkpoint
contract in `.claude/docs/pending-checkpoints.md`. Deliverable 1 of 6.

- Chapter definition: `src/content/chapters/index.ts` (`bb-cp-b-inherited-fleet`)
- Lesson body: `public/content/chapters/bb-cp-b-inherited-fleet.mdx`
- Manifest row: slug `checkpoint-b-inherited-fleet`, number `B`, after 3.9;
  3.10's `prerequisiteSlugs` now points here.

**The curriculum's first Review-flavor checkpoint**: an inherited system with
a stated number of planted faults, no per-fault prompt, and requirements as the
only guide. It departs from R1's precedent in one way - it has a
`starterGraph` (and so `starterDecorators`) - because the system under review
has to be on the canvas.

## 0. Type classification

**Checkpoint, Review flavor.** §6's Checkpoint column: cold open, Connections,
Transition brief, Preview of next. No new material (§4). Group B introduced no
components (§16), so a Build checkpoint would re-test Group A; Review tests what
Group B actually taught - properties a fleet must keep.

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Audit an inherited system against its requirements and fix four planted faults, three from Group B and one from Group A. |
| Type | Checkpoint (Review) |
| Difficulty | foundational |
| Estimated time | 25 minutes |
| Prerequisites | 3.9 |
| Unlocks | Group C (3.10) |
| Building blocks introduced | None |
| Stages trained | 6 (bottlenecks and failure) and 8 (evolve and defend) |
| Interview relevance | High: "is this ready for Monday?" is the review question an interviewer asks of a candidate's own diagram. Framed in the cold open. |

## 2. Learning objectives

1. **Knowledge** - Name the invariant each fault breaks and its chapter.
2. **Engineering** - Compute N+1 from a stated peak and per-instance capacity.
3. **Practical** - Find and fix every fault without being told where, and pass
   Submit.
4. **Interview** - Check a design against requirements one line at a time.
5. **Communication** - Report each fault in one actionable sentence.

## 3. Per-beat outline

| Beat | Section | Notes |
|---|---|---|
| 1-2 | Opener | You rarely build what you run; inherited faults are disagreements with the brief, not broken wiring. |
| 14 | Connections | One row per Group B chapter as the property it taught, plus 3.1's inert firewall. Names that two faults are numbers without giving them. |
| 16 | Your turn | The system, four requirements, a stated count of four, and how judging works (Validate sees one). |
| Next | Next | 3.10, via the database every fix leaned on. |

## 4. Declared omissions

As R1 §4. Additionally: the brief states the fault *count*, deliberately. A
Review exercise without a count has no finish line, and §11.3's hint
philosophy is about not naming the fix, not about hiding the scope.

## 5. Diagrams

None.

## 6. Fault inventory and component budget

Palette: identical to 3.9's (Group A's 8). All required; nothing is added.

| Fault | On the canvas | Fix | Chapter | Visible to Validate |
|---|---|---|---|---|
| Open perimeter | Firewall `allow-all` | `allow-listed` | 3.1 | Yes (`permissive-firewall`) |
| Login lost between machines | Second fleet card has no edge to the database | Wire it, or fold into one card | 3.6, 3.7 | No |
| No N+1 headroom | 2 + 1 = 3 instances for 450 rps at 150 each | 4 or more in total | 3.8 | No |
| Stale address after cutover | DNS `ttlSeconds` 300 against a 30 s window | 30 or less | 3.9 | No |

Three instances in total keeps `single-instance-load-balancer` quiet, so only
the firewall is visible. Interleaving pull: the firewall (Group A).

## 7. Validation rules

Same set as Checkpoint A. The audit is against the brief, not the rule set, so
the blueprints carry the three invisible checks.

## 8. Blueprints

Three blueprints for one fixed system, because a pattern cannot sum instances
across cards: one card with `instances >= 4`; two cards at `>= 2` each; two
cards at `>= 3` and any. All three carry the same `forbid`: an app server fed by
the load balancer with no edge to the database. Without it, containment would
pass a design that raised one card and left the unwired one in place. Checked
2026-10-05 by a throwaway script: the starter fails; each reference passes;
"fix three, leave the unwired card" fails; "wire it but stay at 2 + 1" fails.

## 9. Hints

Three, none naming a fault's location: audit line by line (Validate finds one);
two faults are numbers and the brief holds both; compare the two fleet cards'
connections, plus the config-drift message explained.

## 10. Quiz

None (§22).

## 11. Playtest pass (§18.2)

Every fix has a source: firewall policy (3.1), a copy that keeps state is not
interchangeable and sessions belong in a shared store (3.6, 3.7 - 3.7's own fix
was this edge), N+1 instance count (3.8 - same arithmetic, same field), TTL
inside the change window (3.9 - same field, same bar of 30 s).

## 12. Flagged

- The starter decorators carry no "Build here" zone, correctly (§11.6: nothing
  is missing). The handover comment sets the scene without pointing at a card.
- Config-predicate drift (open decision 11) hits this checkpoint hardest: three
  of four fixes are config. Hint 3 and the lesson's "How it is judged" line
  carry the workaround until the engine reports config mismatches by name.
