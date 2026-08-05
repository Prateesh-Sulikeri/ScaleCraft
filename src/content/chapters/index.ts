import type { ChapterDefinition } from "./types";

/**
 * The authored chapter registry. Mixed state during Wave 1 content authoring
 * (.claude/docs/pending-content.md):
 *
 * - `bb-0-1-welcome` is real curriculum content, authored against
 *   CURRICULUM.md §5/§6 with a chapter spec in `specs/` beside it.
 * - `bb-dummy-1` and `rwe-dummy-1` are still throwaway shell fixtures
 *   (`placeholder: true`), standing in for 3.4 Load Balancer and RWE Tier 1
 *   Bitly respectively. Wave 1 replaces both - replace them, don't extend
 *   them.
 *
 * Every real chapter carries a sibling spec in `specs/<id>.spec.md`: the
 * §5 blueprint filled in, plus its declared omissions, component-budget
 * justification, and playtest pass. Author the spec first; it is what a
 * reviewer checks the prose against.
 */
export const chapterRegistry: ChapterDefinition[] = [
  {
    id: "bb-0-1-welcome",
    mode: "building-blocks",
    title: "Welcome to ScaleCraft",
    // No `placeholder: true` - this is real authored curriculum content as
    // of Track B (.claude/docs/pending-content.md, Wave 1 chapter 1), not a
    // stand-in. Spec: specs/bb-0-1-welcome.spec.md. Lesson body:
    // public/content/chapters/bb-0-1-welcome.md.
    problemStatement:
      "Your first look at the Design Editor. The starter design on the canvas " +
      "has two real faults in it, on purpose: run Validate to see what and " +
      "why, fix both, then Submit to complete the chapter. A guided tour " +
      "walks you through it - press Esc to pause it, or replay it from the " +
      "pill in the corner.",
    // Five objectives, one per CURRICULUM.md §5.2 category (Knowledge,
    // Engineering, Practical, Interview, Communication). The category tags
    // themselves live in the chapter spec (specs/bb-0-1-welcome.spec.md §2)
    // rather than here - §20.5 forbids inventing new metadata fields, and
    // this one is a bare string[].
    learningObjectives: [
      "Describe the Reader-to-Editor loop and state what Validate and Submit each check.",
      "Decide when to run Validate rather than Submit while a design is still in progress.",
      "Diagnose and fix the two faults in the starter design, then pass Submit.",
      "Explain why being told what is wrong, without being told the fix, is the position an interviewer puts you in.",
      "Restate a validation failure in your own words: which rule fired, on which components, and why it matters.",
    ],
    // Exactly the three components the starter graph and its one fix need.
    // §16 gives all three a home chapter of 1.6, so this is a declared
    // narrow exception, justified in the chapter spec (§6 of
    // specs/bb-0-1-welcome.spec.md): they appear here as scenery for a
    // chapter about the editor, never as a design choice the learner makes.
    // `load-balancer` and `cache` were dropped (2026-08-05, Track B) - they
    // were here only to give the picker more to browse, which is not worth
    // putting two Group A/D components in front of a first-session learner.
    // Narrowed further to just ["sql-database"] for one remediation step by
    // the tour itself (see design-editor-tour.ts's "fix-component" step) -
    // that's a runtime-only override (TourController), not a change to this
    // list.
    availableComponentIds: ["client", "app-server", "sql-database"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    validationRuleIds: ["orphan-component", "missing-input-connection", "request-flow-cycle", "component-relations"],
    // Unlike a real exercise chapter, 0.1 isn't teaching architecture design
    // — it's teaching the editor's own fix-it loop. The starter graph is
    // deliberately broken (see starterGraph below) so Validate has
    // something real to find and the tour walks the learner through
    // actually fixing it before Submit can pass.
    blueprints: [
      {
        id: "bb-0-1-welcome-blueprint",
        label: "Client routed through an app server to a database",
        require: {
          id: "bb-0-1-welcome-blueprint",
          nodes: [
            { alias: "client", componentId: "client" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "client", to: "app" },
            { from: "app", to: "db" },
          ],
        },
        commentary:
          "A client talks to an app server, which reads and writes to a database - the " +
          "smallest shape that's still a real, three-tier architecture. Every later " +
          "chapter builds on this one.",
      },
    ],
    hints: [
      {
        id: "bb-0-1-welcome-hint-1",
        body:
          "Missed part of the guided tour, or want to see it again? Press Esc to pause it " +
          "and pick up where you left off, or use the pill in the bottom-left corner of " +
          "the canvas to resume or replay it.",
      },
    ],
    readingLinks: [],
    editorTourId: "design-editor",
    // Bumped to 2 when Track B rewrote the lesson body to CURRICULUM.md
    // §5.3's beat structure (2026-08-05).
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.1 of 44.",
      masteredConcepts: [],
      notYetIntroducedConcepts: ["Everything - this is the first chapter in the curriculum."],
      // Transcribed from the chapter spec's §5 (specs/bb-0-1-welcome.spec.md).
      // Deep Check reads these as intentional, not as gaps to flag.
      simplifications: [
        "The starter design is deliberately broken (a missing component, a wrong edge kind) - " +
          "this chapter teaches the editor's fix-it loop, not architecture design. The learner " +
          "is not expected to have an opinion on whether the three-tier shape is the right one.",
        "Validation is described only as 'rules that run against your design'. The rule engine's " +
          "pattern matching, severity model, and blueprint-drift comparison are not opened up here.",
        "The three primitive components are named, not taught - what an application server is " +
          "remains 1.6's job.",
      ],
    },
    // First authored quiz in the registry. Ids are permanent persistence
    // keys (QUIZ_FRAMEWORK §2) - never reuse one for a different question.
    // Ramp 1/2/2/3 against §3's rough 30/45/25 target; Q3 is the Foundations
    // bank's Q9 (§5) authored out to full option form. Every question is
    // answerable from 0.1's own material - there is no prerequisite chain to
    // draw on.
    quiz: [
      {
        id: "bb-0-1-welcome-q1",
        kind: "single",
        difficulty: 1,
        prompt:
          "You are a few minutes into a chapter and stuck. The hint in the sidebar is still closed. " +
          "What does ScaleCraft do next?",
        options: [
          {
            id: "a",
            label: "Opens the hint for you once a check fails.",
            correct: false,
            explanationMd:
              "Hints are never surfaced automatically, on any trigger. Opening it for you would take " +
              "away the part that actually transfers: reading the explanation and reasoning to the fix.",
          },
          {
            id: "b",
            label: "Nothing. The hint stays closed until you open it, and opening it is not recorded.",
            correct: true,
            explanationMd:
              "Correct. Hints are a separate, opt-in layer from explanations. You can always fail, read " +
              "the explanation, and reason your own way to a fix without ever opening one - and if you do " +
              "open it, nothing is tracked or penalized.",
          },
          {
            id: "c",
            label: "Reveals the hint automatically after a set number of failed attempts.",
            correct: false,
            explanationMd:
              "Attempt-count triggers are exactly the nudging the product rules out. Nothing counts your " +
              "attempts toward revealing anything.",
          },
          {
            id: "d",
            label: "Shows the hint, but marks the chapter as completed with help.",
            correct: false,
            explanationMd:
              "There is no such mark. Hint use is not tracked and has no effect on whether the chapter " +
              "counts as complete.",
          },
        ],
      },
      {
        id: "bb-0-1-welcome-q2",
        kind: "single",
        difficulty: 2,
        prompt:
          "You are halfway through building a design. Two components are placed, one is not connected " +
          "to anything yet, and you want to know whether what you have so far holds together. Which " +
          "button do you press?",
        options: [
          {
            id: "a",
            label: "Validate - it checks structural coherence on work in progress and explains what it finds.",
            correct: true,
            explanationMd:
              "Correct. Validate is built to be run early and often, including on something half-finished. " +
              "An unconnected component is precisely the kind of thing it reports, with a reason attached.",
          },
          {
            id: "b",
            label: "Submit - it runs everything Validate runs and more, so it gives strictly more information.",
            correct: false,
            explanationMd:
              "Submit does run the structural check first, but it stops there when that check fails. On a " +
              "half-built design you get the same list Validate would have given you and no comparison, so " +
              "it is not a superset worth reaching for mid-build.",
          },
          {
            id: "c",
            label: "Neither - both are meant to be run once the design is finished.",
            correct: false,
            explanationMd:
              "Validate is explicitly the mid-build check. Waiting until the end means finding every " +
              "structural problem at once instead of as you introduce them.",
          },
          {
            id: "d",
            label: "Submit - a half-finished design will fail Validate anyway, so the extra check costs nothing.",
            correct: false,
            explanationMd:
              "A half-finished design failing Validate is the useful outcome, not a wasted one: the failure " +
              "names what is missing. Submit would report the same thing while framing an in-progress design " +
              "as a failed completion attempt.",
          },
        ],
      },
      {
        id: "bb-0-1-welcome-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "ScaleCraft asks you to predict before it reveals an answer, even though you will often predict " +
          "wrong. Why is it built that way?",
        options: [
          {
            id: "a",
            label: "To measure you against other learners.",
            correct: false,
            explanationMd:
              "Nothing here measures you against anyone. ScaleCraft is single-player and there are no " +
              "scores, streaks, or rankings of any kind.",
          },
          {
            id: "b",
            label:
              "Committing to a prediction and then seeing the outcome teaches more than reading the answer. " +
              "Being wrong first is productive.",
            correct: true,
            explanationMd:
              "Correct. Committing to an answer makes the gap between what you expected and what happened " +
              "visible, and that gap is what sticks. Reading a correct answer you never predicted against " +
              "feels like understanding without producing much of it.",
          },
          {
            id: "c",
            label: "To slow the lesson down so the material has time to sink in.",
            correct: false,
            explanationMd:
              "Pacing is not the mechanism. A prediction you never make would cost no time either, and " +
              "would also teach nothing - the commitment is what does the work, not the delay.",
          },
          {
            id: "d",
            label: "To identify learners who are struggling so they can be given extra hints.",
            correct: false,
            explanationMd:
              "Think-first prompts are never graded or recorded, and nothing in the product routes hints " +
              "to you based on how you are doing.",
          },
        ],
      },
      {
        id: "bb-0-1-welcome-q4",
        kind: "single",
        difficulty: 3,
        prompt:
          "Your design passes Validate with no issues, and then passes Submit. A colleague looks at it and " +
          "asks whether it is a good design. What have those two passes actually established?",
        options: [
          {
            id: "a",
            label: "That it is a good design - both checks passed, and that is what the checks are for.",
            correct: false,
            explanationMd:
              "Both checks establish something narrower. Neither one has any knowledge of the requirements " +
              "your colleague has in mind, or of the trade-offs a real decision would turn on.",
          },
          {
            id: "b",
            label:
              "That it is structurally coherent, and that it matches the approach this chapter teaches. " +
              "Whether it is good for a given set of requirements is a judgment neither check makes.",
            correct: true,
            explanationMd:
              "Correct, and the distinction matters for the whole curriculum. Automated checks can confirm " +
              "coherence and conformance to a taught approach. Whether a design is right for a workload, a " +
              "budget, and a failure tolerance is the judgment you are here to build.",
          },
          {
            id: "c",
            label: "That it is structurally coherent, and nothing more - Submit only records completion.",
            correct: false,
            explanationMd:
              "Submit does more than record completion: after the structural check passes, it compares your " +
              "design against the chapter's approach and reports the differences. That is a real second " +
              "finding, just not a verdict on quality.",
          },
          {
            id: "d",
            label:
              "That it is one of many valid designs, and the chapter's preferred approach is essentially " +
              "arbitrary.",
            correct: false,
            explanationMd:
              "A chapter's approach is not arbitrary - it encodes the reasoning the chapter is teaching. It " +
              "is scoped to what you have been taught so far, which is a different limitation from being " +
              "an arbitrary choice.",
          },
        ],
      },
    ],
    // Deliberately broken, not the solved shape (2026-08-05 revision, after
    // an in-editor tour review) — two real, distinct issues for Validate to
    // find and the guided tour to walk the learner through fixing:
    //  1. sql-database (a required component) is entirely absent.
    //  2. The one edge that IS here has the wrong kind: "async" from a
    //     Client is illegal (Client's own relations.outputs.allowedKinds is
    //     ["request-flow"] only — see content/components/config/
    //     networking.ts), so component-relations flags it.
    // See design-editor-tour.ts's "validate-click"/"fix-component"/
    // "fix-edge"/"revalidate-clean" steps for the guided remediation.
    starterGraph: {
      nodes: [
        { id: "bb-0-1-client", componentId: "client", position: { x: 80, y: 140 }, config: {} },
        { id: "bb-0-1-app-server", componentId: "app-server", position: { x: 340, y: 140 }, config: {} },
      ],
      edges: [{ id: "bb-0-1-edge-client-app", source: "bb-0-1-client", target: "bb-0-1-app-server", kind: "async" }],
      entryPointIds: ["bb-0-1-client"],
    },
  },
  {
    id: "bb-dummy-1",
    mode: "building-blocks",
    title: "Placeholder Chapter",
    placeholder: true,
    problemStatement:
      "This is placeholder content for the first Building Blocks chapter - " +
      "real lesson content (starting with load balancing, per CURRICULUM.md) " +
      "lands in a later step. For now, this exists only to prove the chapter " +
      "shell - list, question pane, filtered component picker - works.",
    learningObjectives: ["Placeholder objective - real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server"],
    requiredComponentIds: ["client", "load-balancer", "app-server"],
    // Scoped to the 4 general/structural rules only — not all 10, not none.
    // These never reference a specific not-yet-taught component; they check
    // whether the graph is coherent at all (nothing floating, no missing
    // inputs, no bad cycles, edges respect each component's own declared
    // legal connections), so they're safe at any curriculum stage. The 6
    // domain-specific rules left out (no-direct-client-database,
    // single-instance-load-balancer, permissive-firewall, split-brain-risk,
    // queue-without-dead-letter-queue, orphan-read-replica) are each keyed
    // to one specific component (database, firewall, queue, read-replica)
    // not even in this chapter's palette (client/load-balancer/app-server)
    // — turning those on would be pointless at best, premature at worst.
    // This is what actually catches a malformed wiring *between components
    // this chapter is already teaching* (e.g. a backwards Application
    // Server -> Load Balancer edge) without rejecting on content the
    // chapter hasn't introduced yet. Real per-chapter rule curation is
    // still Step 5's job once this is real content, not a throwaway
    // fixture — chapter-completion state (required components, blueprint
    // match) is a separate mechanism, unaffected by this list either way —
    // see chapter-outcome-violations.ts.
    validationRuleIds: ["orphan-component", "missing-input-connection", "request-flow-cycle", "component-relations"],
    // Throwaway, not real curriculum content — same convention as
    // `placeholder: true` above. Exists purely so there's something concrete
    // to click through end to end (QuestionPane's connected-count line, the
    // pass state, the Debrief) before Step 5 authors real chapters with real
    // blueprints. Step 5 replaces this, doesn't build on it.
    blueprints: [
      {
        id: "bb-dummy-1-blueprint-throwaway",
        label: "Client routed through a load balancer to an app server",
        require: {
          id: "bb-dummy-1-blueprint-throwaway",
          nodes: [
            { alias: "client", componentId: "client" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server" },
          ],
          edges: [
            { from: "client", to: "lb" },
            { from: "lb", to: "app" },
          ],
        },
        commentary:
          "**Throwaway fixture, not real curriculum content.** A client should " +
          "never depend on a single app server directly - routing through a " +
          "load balancer means a server can be replaced or scaled without the " +
          "client ever noticing.",
      },
    ],
    hints: [
      {
        id: "bb-dummy-1-hint-1",
        body: "This is a placeholder hint. Real hints are opt-in, never auto-shown - this one is no different.",
      },
    ],
    readingLinks: [],
    // Placeholder, same convention as the rest of this fixture — but real
    // enough to exercise Deep Check's Building Blocks framing (§10.7) end
    // to end. Approximates CURRICULUM.md's 3.4 Load Balancer entry, which
    // this chapter stands in for per this file's own header comment.
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure - Chapter 3.4 of 44 (placeholder).",
      masteredConcepts: [
        "Networking fundamentals and the trust perimeter (3.1)",
        "DNS resolution and the reverse proxy's single-front-door pattern (3.2-3.3)",
      ],
      notYetIntroducedConcepts: [
        "Statelessness and session externalization (Group B)",
        "Distributed caching (Group D)",
        "Read replicas and data-layer scaling (Group C)",
        "Any queue/async/coordination concepts (Groups E-G)",
      ],
      simplifications: [
        "One load balancer in front of two app servers is the whole lesson - no health-check tuning, no multi-region failover.",
        "Balancing algorithm choice (round-robin vs. least-connections) is a config decision here, not a performance-tuning exercise.",
      ],
    },
    // A single unconnected node, not the solved blueprint — a starter graph
    // that already satisfied the required-components/blueprint check would
    // hand the exercise to the learner solved. Just enough that opening the
    // chapter for the first time doesn't drop the learner on a blank canvas.
    starterGraph: {
      nodes: [{ id: "bb-dummy-1-starter-client", componentId: "client", position: { x: 80, y: 120 }, config: {} }],
      edges: [],
      entryPointIds: [],
    },
  },
  {
    id: "rwe-dummy-1",
    mode: "real-world-extraction",
    title: "Placeholder Project",
    placeholder: true,
    problemStatement:
      "This is placeholder content for Real World Extraction Tier 1's Bitly project " +
      "(per CURRICULUM.md §15.2) - real content lands in a later step. For now, this " +
      "exists only to prove the chapter shell works in this mode too.",
    learningObjectives: ["Placeholder objective - real objectives arrive with real content."],
    availableComponentIds: ["client", "load-balancer", "app-server", "sql-database", "cache"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    // Moot either way — real-world-extraction chapters always run the full
    // rule registry regardless of this field (see chapter-outcome.ts).
    validationRuleIds: [],
    blueprints: [],
    hints: [],
    readingLinks: [],
    // Same reasoning as bb-dummy-1's starterGraph above.
    starterGraph: {
      nodes: [{ id: "rwe-dummy-1-starter-client", componentId: "client", position: { x: 80, y: 120 }, config: {} }],
      edges: [],
      entryPointIds: [],
    },
  },
];

export function getChaptersForMode(mode: ChapterDefinition["mode"]): ChapterDefinition[] {
  return chapterRegistry.filter((c) => c.mode === mode);
}
