# Chapter spec - 1.11 Driving a System Design Interview

Authored under CURRICULUM.md §5 (chapter blueprint), §6 (mandatory sections),
and §20 (author instructions). This is the optional final Part 1 chapter.

- Chapter definition: `src/content/chapters/index.ts`
  (`bb-1-11-driving-a-system-design-interview`)
- Lesson body: `public/content/chapters/bb-1-11-driving-a-system-design-interview.mdx`
- Manifest row: `src/curriculum/manifest.ts`, slug
  `1-11-driving-a-system-design-interview`

**Wave.** Wave 2, Part 1, directly after 1.10. It is optional and gates no
later chapter, matching CURRICULUM §14 and §17.

**Type: Process.** §14 names the whole of Part 1 Process type. §16 explicitly
places 1.11 in the no-component list.

## 0. Staged-exercise degradation

CURRICULUM §14 calls for a full staged walkthrough on a tiny brief. The stages
UI does not yet exist, as `pending-content.md` records for all Part 1 Process
chapters. This chapter therefore realizes the walkthrough as five sequenced
quiz scenarios. The lesson discloses the limitation in "Your turn". The
exercise still tests choosing the next loop move under time pressure; it does
not claim to replace a live, branching walkthrough.

## 1. Metadata

| Field | Value |
|---|---|
| Purpose | Run the full interview loop under time structure, read interviewer intent, and avoid common candidate mistakes. |
| Type | Process. |
| Difficulty | foundational |
| Estimated time | 30 minutes, per CURRICULUM §14 and `manifest.ts`. |
| Prerequisites | 1.10 Communicating & Defending a Design. |
| Unlocks | Nothing directly. This is optional; 2.1 remains gated by 1.10. It prepares the learner to use every later Interview lens as one coherent conversation. |
| Building blocks introduced | None. |
| Stages trained | Part 1 default: stages 1, 4, 5. |
| Interview relevance | High - all eight loop steps from 0.4. |
| Production relevance | Time-boxing a design review around decision, constraints, risks, and next evidence. |

## 2. Learning objectives

1. **Knowledge** - State a useful time budget for a 45-minute interview and
   explain why requirements, estimates, and a close need protected time.
2. **Engineering** - Classify a follow-up as changed pressure, a trade-off
   challenge, or a failure/limit question, then return to the relevant prior
   evidence.
3. **Practical** - Given a sequenced tiny-brief interview, choose the next
   move that keeps the design loop intact under the remaining time.
4. **Interview** - Drive an interview by naming the next reasoning move,
   correcting a changed assumption openly, and ending with a concise recap.
5. **Communication** - Explain a time-bound design plan without treating the
   time budget as a rigid script or a reason to bluff certainty.

## 3. Per-beat outline

| Beat | Section in the lesson | Notes |
|---|---|---|
| 1-2 Cold open / why this exists | Untitled opening | Candidate loses the thread because time silently chooses the shape of the interview. Paid off by the time budget and closing practice. |
| 3 Think first | Think first callout | Reader chooses what to protect from time pressure. |
| 4-5 Mental model + visual explanation | "The clock is a design constraint" and "Read the question behind the question" | Time-box table plus a captioned Mermaid decision tree for interviewer intent. |
| 6 Core mechanics | "Drive the room without performing certainty" | Names the next move, parks detail, checks time, and closes the loop. |
| 7 Internal mechanics | Included in core mechanics | The evidence-to-decision-to-revision chain is the internal control mechanism. Separate section would duplicate it. |
| 8 Trade-offs | "The clock is a design constraint" | Coverage versus depth: adapt the budget to pressure without abandoning the loop order. |
| 9-10 Failure modes + scaling | Omitted | No system is being built or scaled. Candidate failure modes are in "Common ways candidates lose the interview." |
| 11 Production example | "In production" | Transfers the same agenda discipline to a design review, without claiming interview timing is production timing. |
| 12 Common mistakes | "Common ways candidates lose the interview" | Five mistakes tied to failures already demonstrated in the lesson. |
| 13 Interview lens | "In an interview" | Mandatory senior-answer line, using only Part 1 vocabulary. |
| 14 Connections + preview | "Next" | Backward: 1.1-1.10 are integrated, with 1.10 directly reused. Immediate next: 2.1, verified in `manifest.ts`. |
| 15 Recap + knowledge check | "Recap" | Four retrieval anchors; quiz is automatically rendered. |
| 16 Transition brief | "Your turn" | Discloses the missing stages UI and redirects to the quiz-realized walkthrough. |

## 4. Declared omissions and simplifications

- **No everyday analogy.** A clock, table, and interview scenario already make
  the mental model concrete; an analogy would add a translation step.
- **No system failure/scaling section.** This is a no-build Process chapter.
  Candidate mistakes are not architectural failure modes and are handled in
  their required dedicated section instead.
- **No nuggets.** Existing Part 1 chapters omit the §12 nugget devices; adding
  them only here would break the established rhythm without improving the
  lesson's density.
- **The 45-minute budget is illustrative.** It teaches protected reasoning
  time, not a universal allocation for every company or brief. The lesson
  states that the budget adapts to actual pressure.

## 5. Component budget, validation rules, blueprint, and hints

No components are introduced. `availableComponentIds`, `requiredComponentIds`,
`validationRuleIds`, `blueprints`, and `hints` are all empty;
`hasEditorExercise: false`. There is no canvas exercise to validate or orient.

## 6. Quiz

Five questions, difficulty ramp 1/1/2/2/3. Together they form one compact
interview: scope the brief, protect requirements, respond to a changed
assumption, handle a failure follow-up, and choose a close under time pressure.
They realize the documented stages-UI degradation in §0. Every option explains
its reasoning. Single-choice correct positions are b/a/d/c to avoid clustering;
the ordering question's authored options are deliberately not in correct order.

## 7. Playtest pass

| Exercise move | Taught by |
|---|---|
| Ask clarifying questions before solving | 1.1 and 1.2 |
| Separate functional requirements, non-functional requirements, and scope | 1.2 and 1.3 |
| Estimate only to the precision that changes a decision | 1.4 and 1.5 |
| Draw and narrate the smallest end-to-end design | 1.6 and 1.10 |
| Find a ceiling and state a trade-off | 1.7 and 1.8 |
| Choose and frame a deep dive | 1.9 |
| Read and answer a follow-up honestly | 1.10 |

No exercise move is unsourced.

## 8. Second-reader checks

- Verify the 45-minute table reads as an adaptable budget, not a memorized
  interview script.
- Verify the quiz scenarios genuinely progress as one walkthrough and do not
  test recall of the table alone.
- Verify the immediate-next preview remains 2.1 if manifest ordering changes.
