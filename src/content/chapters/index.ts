import type { ChapterDefinition } from "./types";

/**
 * The authored chapter registry. Mixed state during Wave 1 content authoring
 * (.claude/docs/pending-content.md):
 *
 * - Part 0 (`bb-0-1-welcome` through
 *   `bb-0-4-the-system-design-lifecycle`), Part 1
 *   (`bb-1-1-framing-the-problem` through `bb-1-4-driving-the-interview`)
 *   and Part 2 (`bb-2-1-from-browser-to-backend` through
 *   `bb-2-3-evolution-of-modern-architectures`, complete) are real
 *   curriculum content, authored against CURRICULUM.md §5/§6 with a
 *   chapter spec in `specs/` beside each.
 * - `bb-dummy-1` was replaced by real content, `bb-3-4-load-balancer`
 *   (pulled forward from Wave 3, see pending-content.md/pending-chapters.md).
 *   `rwe-dummy-1` is still a throwaway shell fixture (`placeholder: true`),
 *   standing in for RWE Tier 1 Bitly - replace it, don't extend it.
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
      "buttons at the bottom of this sidebar.",
    exerciseGoal: "Run Validate to find what's broken, fix both faults, then Submit.",
    successCriteria: [
      "Every component the blueprint requires is present and properly connected.",
      "Validate reports zero issues, and Submit passes.",
    ],
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
          "and pick up where you left off, or use the buttons at the bottom of this sidebar " +
          "to resume or replay it. Start over there also puts the canvas back to the " +
          "original starting design, so the tour's fix-it steps run for real again.",
      },
    ],
    readingLinks: [],
    editorTourId: "design-editor",
    // 2: Track B rewrote the body to CURRICULUM.md §5.3's beat structure.
    // 3: density revision pass against the new §20.6, 1262 words to 667.
    // Both 2026-08-05.
    lessonVersion: 3,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.1 of 37.",
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
            label: "Reveals the hint automatically after a set number of failed attempts.",
            correct: false,
            explanationMd:
              "Attempt-count triggers are exactly the nudging the product rules out. Nothing counts your " +
              "attempts toward revealing anything.",
          },
          {
            id: "c",
            label: "Nothing. The hint stays closed until you open it, and opening it is not recorded.",
            correct: true,
            explanationMd:
              "Correct. Hints are a separate, opt-in layer from explanations. You can always fail, read " +
              "the explanation, and reason your own way to a fix without ever opening one - and if you do " +
              "open it, nothing is tracked or penalized.",
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
            label: "To slow the lesson down so the material has time to sink in.",
            correct: false,
            explanationMd:
              "Pacing is not the mechanism. A prediction you never make would cost no time either, and " +
              "would also teach nothing - the commitment is what does the work, not the delay.",
          },
          {
            id: "c",
            label: "To identify learners who are struggling so they can be given extra hints.",
            correct: false,
            explanationMd:
              "Think-first prompts are never graded or recorded, and nothing in the product routes hints " +
              "to you based on how you are doing.",
          },
          {
            id: "d",
            label:
              "Committing to a prediction and then seeing the outcome teaches more than reading the answer. " +
              "Being wrong first is productive.",
            correct: true,
            explanationMd:
              "Correct. Committing to an answer makes the gap between what you expected and what happened " +
              "visible, and that gap is what sticks. Reading a correct answer you never predicted against " +
              "feels like understanding without producing much of it.",
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
            id: "b",
            label: "That it is a good design - both checks passed, and that is what the checks are for.",
            correct: false,
            explanationMd:
              "Both checks establish something narrower. Neither one has any knowledge of the requirements " +
              "your colleague has in mind, or of the trade-offs a real decision would turn on.",
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
        { id: "bb-0-1-client", componentId: "client", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-0-1-app-server", componentId: "app-server", position: { x: 380, y: 160 }, config: {} },
      ],
      edges: [{ id: "bb-0-1-edge-client-app", source: "bb-0-1-client", target: "bb-0-1-app-server", kind: "async" }],
      entryPointIds: ["bb-0-1-client"],
    },
    starterDecorators: [
      { kind: "zone", id: "bb-0-1-zone-client", label: "Client", position: { x: 32, y: 112 }, width: 256, height: 137, color: "#3b82f6" },
      { kind: "zone", id: "bb-0-1-zone-app", label: "Application", position: { x: 352, y: 112 }, width: 256, height: 137, color: "#a855f7" },
    ],
  },
  {
    id: "bb-0-2-what-is-system-design",
    mode: "building-blocks",
    title: "What is System Design?",
    // Real authored content (Track B, Wave 1 chapter 2). Spec:
    // specs/bb-0-2-what-is-system-design.spec.md. Lesson body:
    // public/content/chapters/bb-0-2-what-is-system-design.md.
    problemStatement:
      "System design gets used for everything from picking a database to drawing boxes on a " +
      "whiteboard. This chapter replaces the phrase with five forces every design trades " +
      "against - latency, throughput, availability, durability, cost - and asks you to name " +
      "the dominant one across five short systems in the knowledge check.",
    // Four objectives - Practical omitted per CURRICULUM.md §5.2's explicit
    // carve-out ("except Practical in pure Concept chapters"). This chapter
    // has no construction-family exercise (§11.1's justified-Concept-chapter
    // exception, see spec §6) - "Practical" application happens in the
    // trade-off-pick quiz question, not the canvas, so it is folded under
    // Engineering rather than invented as a separate untested category.
    learningObjectives: [
      "Knowledge - Name the five forces (latency, throughput, availability, durability, cost) and state what each measures.",
      "Engineering - Decide whether a proposed change is justified by identifying which force, if any, is actually under pressure.",
      "Interview - Translate an interviewer's stated constraint (\"assume heavy read traffic\") into the force it is actually testing.",
      "Communication - Explain a trade-off in both directions: what a decision buys and what it costs, naming both forces involved.",
    ],
    // No components introduced (§16 homes the first three at 1.6) and no
    // construction-family exercise - a justified Concept-chapter exception
    // per §11.1, spec §4. The chapter is Reader + knowledge check only.
    // hasEditorExercise: false suppresses YourTurnCard's exercise row (nothing to open)
    // and switches curriculum/progress.ts's deriveStatus to gate COMPLETED
    // on the exam pass alone, since there is no Submit to record a
    // validation pass.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-0-2-hint-1",
        body:
          "Stuck on which force a described system depends on most? Ask what its worst possible " +
          "failure would look like - a lost byte, an unreachable button, a slow response, or a " +
          "huge bill - and match the force to that failure.",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-06). Fixed the "Next" section to preview
    // 0.3 (§6 requires the actual next chapter; it previewed 1.3 and skipped
    // 0.3), removed an undefined forward reference to Interview Loop "step 2"
    // (§10.1 is not taught until 0.4/Part 1, and 0.1 already used "loop" for
    // something else), captioned the diagram (§7.2), paid off the cold open,
    // and corrected two trade-off claims. See spec §10.
    lessonVersion: 2,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.2 of 37.",
      masteredConcepts: ["The Reader-to-Editor loop, Validate vs. Submit, and hints-on-request (0.1)."],
      notYetIntroducedConcepts: [
        "Non-functional requirements as numeric targets - that's 1.3.",
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Named consistency models (CAP, quorums) - that's 3.22.",
      ],
      simplifications: [
        "The five forces get one-sentence definitions, not formalized as measurable NFRs yet - " +
          "that is 1.3's job.",
        "Trade-off examples (a cache, cross-datacenter replication) name a component-shaped idea " +
          "without teaching the component - every component stays untaught until its home chapter.",
        "Availability vs. durability is drawn as a clean distinction here; real failure modes often " +
          "blend both - the clean version is intentional at this stage.",
        "The five forces are this curriculum's working frame, not an exhaustive list of everything a " +
          "design is judged on - consistency (3.22) and security (from 3.1 on) are deferred to their " +
          "own chapters. The lesson says so rather than implying the five are complete.",
      ],
    },
    // Ramp 1/1/2/2/3. Q1 models the Foundations bank's Q1 (QUIZ_FRAMEWORK.md
    // §5); Q2's pairs are the bank's Q2, verbatim (they are the five forces'
    // own definitions, already exactly matched to this lesson's diagram);
    // Q3 is the chapter's own "trade-off pick" exercise (CURRICULUM.md §14),
    // five described systems each matched to their dominant force; Q4 models
    // the bank's Q7 (no force under pressure -> change nothing); Q5 is
    // original, testing the availability/durability distinction from
    // "Ways to misread this".
    quiz: [
      {
        id: "bb-0-2-what-is-system-design-q1",
        kind: "single",
        difficulty: 1,
        prompt:
          "A teammate says \"system design is about knowing lots of AWS services.\" What is the " +
          "best correction?",
        options: [
          {
            id: "a",
            label: "It is about memorizing standard architectures for common products.",
            correct: false,
            explanationMd:
              "Memorized shapes stop working the moment the requirements differ, which they always " +
              "do. The lesson's Stripe/Netflix contrast used the same five forces to reach opposite " +
              "designs.",
          },
          {
            id: "b",
            label:
              "It is about reasoning under constraints - latency, throughput, availability, durability, " +
              "cost - and defending the trade-offs between them.",
            correct: true,
            explanationMd:
              "Correct. Services and specific patterns change constantly; the five forces and the " +
              "trade-off reasoning between them are the stable discipline underneath.",
          },
          {
            id: "c",
            label: "It is about writing scalable code.",
            correct: false,
            explanationMd:
              "Code-level performance is one lever on latency and throughput, but it says nothing " +
              "about availability, durability, or cost - the discipline is broader than implementation.",
          },
          {
            id: "d",
            label: "It is mostly about databases.",
            correct: false,
            explanationMd:
              "Databases are one place these forces show up, not the discipline itself - the same " +
              "five forces govern the choice of load balancer, cache, or queue just as much.",
          },
        ],
      },
      {
        id: "bb-0-2-what-is-system-design-q2",
        kind: "matching",
        difficulty: 1,
        prompt: "Match each concern to the force it names.",
        // Option order deliberately does not mirror pairs' order below - each
        // pair's correct option sits at a different index than the pair
        // itself, so the dropdown position carries no signal (caught in
        // review: an identity-order draft made every row's Nth option the
        // answer to its Nth pair).
        options: [
          {
            id: "throughput",
            label: "Throughput",
            correct: true,
            explanationMd: "How many requests the system survives per second - a volume measurement.",
          },
          {
            id: "cost",
            label: "Cost",
            correct: true,
            explanationMd: "What the other four are bought with - the bill for whatever trade-off was made.",
          },
          {
            id: "durability",
            label: "Durability",
            correct: true,
            explanationMd: "Whether data already written is still there later, independent of reachability.",
          },
          {
            id: "latency",
            label: "Latency",
            correct: true,
            explanationMd: "How long one request takes to complete - a single-request measurement.",
          },
          {
            id: "availability",
            label: "Availability",
            correct: true,
            explanationMd: "The fraction of time the system answers at all, regardless of how well.",
          },
        ],
        pairs: [
          ["p99 response time", "latency"],
          ["requests per second the system survives", "throughput"],
          ["fraction of time the system answers at all", "availability"],
          ["data still exists after a crash", "durability"],
          ["the bill", "cost"],
        ],
      },
      {
        id: "bb-0-2-what-is-system-design-q3",
        kind: "matching",
        difficulty: 2,
        prompt: "Match each system to the force that dominates its design.",
        // Same derangement discipline as Q2 - option order does not mirror
        // pairs' order.
        options: [
          {
            id: "latency",
            label: "Latency",
            correct: true,
            explanationMd:
              "A response slower than roughly 100 ms reads as broken to someone actively typing - " +
              "speed is the entire product here, not a secondary concern.",
          },
          {
            id: "cost",
            label: "Cost",
            correct: true,
            explanationMd:
              "Low value, low urgency, no one watching in real time - minimizing spend is the only " +
              "force genuinely under pressure.",
          },
          {
            id: "availability",
            label: "Availability",
            correct: true,
            explanationMd:
              "Being unreachable when it matters is the catastrophic failure - a briefly stale alert " +
              "is far safer than no alert at all.",
          },
          {
            id: "throughput",
            label: "Throughput",
            correct: true,
            explanationMd:
              "Surviving a sudden 50x spike in concurrent requests without falling over is the whole " +
              "problem - each individual request being a few ms slower is a minor cost by comparison.",
          },
          {
            id: "durability",
            label: "Durability",
            correct: true,
            explanationMd:
              "A lost or corrupted write is the catastrophic failure here - money that silently " +
              "disappears is worse than a slow or briefly unreachable ledger.",
          },
        ],
        pairs: [
          ["A bank's transaction ledger recording money movements", "durability"],
          ["A hospital's patient-monitoring alert system", "availability"],
          ["A checkout page hit by 50x normal traffic during a ten-minute flash sale", "throughput"],
          ["Search-as-you-type autocomplete suggestions", "latency"],
          ["A weekly analytics report emailed to 12 people", "cost"],
        ],
      },
      {
        id: "bb-0-2-what-is-system-design-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Your internal tool has 40 users and one server sitting at 2% CPU. A teammate suggests " +
          "adding a cache to \"future-proof it.\" What is the strongest response?",
        options: [
          {
            id: "a",
            label: "Add the cache now - it is easier to build before real usage arrives.",
            correct: false,
            explanationMd:
              "Building ahead of any pressure is exactly the cost this lesson warns about: complexity " +
              "with no offsetting benefit today, and possibly the wrong shape once real usage arrives.",
          },
          {
            id: "b",
            label: "Add a read replica instead, since databases are always the eventual bottleneck.",
            correct: false,
            explanationMd:
              "\"Always eventually\" is not \"under pressure now\" - the same reasoning error as the " +
              "cache suggestion, aimed at a different component.",
          },
          {
            id: "c",
            label:
              "Change nothing - no force here is under pressure, so any of these additions is a cost " +
              "with no benefit yet.",
            correct: true,
            explanationMd:
              "Correct. 2% CPU and 40 users means latency, throughput, and availability all have " +
              "headroom to spare - the only force actually affected by adding a cache right now is " +
              "cost, moving in the wrong direction.",
          },
          {
            id: "d",
            label: "Add both the cache and a load balancer, since extra headroom is never wrong.",
            correct: false,
            explanationMd:
              "Headroom is never free - it is bought with cost, one of the five forces, and this tool " +
              "has shown no other force that needs buying it.",
          },
        ],
      },
      {
        id: "bb-0-2-what-is-system-design-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "During a brief network partition, a write request to your database times out and the " +
          "client shows an error - but every previously-committed write is still intact once the " +
          "partition heals. Which force actually failed here, and which one held?",
        // Correct option sits at d here on purpose. Q1's is at b and Q4's at c;
        // with only three single-kind questions in this chapter, leaving this
        // one at b as well would have put 2 of 3 on the same letter - passing
        // the invariant test but reproducing the habit the test exists to
        // catch (see quiz-invariants.test.ts).
        options: [
          {
            id: "a",
            label: "Durability failed; availability held.",
            correct: false,
            explanationMd:
              "This reverses the two definitions - durability is about whether committed writes " +
              "survive, not about whether a given request could be reached.",
          },
          {
            id: "b",
            label: "Both failed - a timeout means the request was fully lost, including its effect on prior data.",
            correct: false,
            explanationMd:
              "A request that never committed had no effect on prior data to lose - there is nothing " +
              "for durability to have failed at.",
          },
          {
            id: "c",
            label: "Neither - a timeout during a partition is a latency problem, not availability or durability.",
            correct: false,
            explanationMd:
              "Latency describes how long a completed response took. A request that never got a " +
              "response at all is unavailability, not slowness.",
          },
          {
            id: "d",
            label:
              "Availability failed (the request could not be served); durability held (nothing already " +
              "written was lost).",
            correct: true,
            explanationMd:
              "Correct. A request going unanswered during a partition is exactly what unavailability " +
              "looks like. Durability only speaks to writes that already committed, and none of those " +
              "were touched.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-0-3-interview-design-vs-production-engineering",
    mode: "building-blocks",
    title: "Interview Design vs. Production Engineering",
    // Real authored content (Track B, Wave 1 chapter 3 - Wave 1 redefined
    // 2026-08-06 to Part 0 only, see pending-content.md). Spec:
    // specs/bb-0-3-interview-design-vs-production-engineering.spec.md.
    // Lesson body:
    // public/content/chapters/bb-0-3-interview-design-vs-production-engineering.md.
    problemStatement:
      "Interview design and production engineering get judged by the same rubric, but they " +
      "reward different things under different pressure. This chapter names the two registers " +
      "explicitly so a later Interview lens or Production note never reads as the wrong one. No " +
      "build: the knowledge check applies the distinction to five new scenarios.",
    // Four objectives - Practical omitted per CURRICULUM.md §5.2's carve-out
    // for pure Concept chapters (same justified exception as 0.2, spec §6):
    // no components introduced, no construction-family exercise.
    learningObjectives: [
      "Knowledge - State what each register (interview, production) rewards and over what time horizon.",
      "Engineering - Decide whether a proposed design's complexity is justified by a real force under pressure, in either register.",
      "Interview - Recognize an interviewer's request to switch from the interview register to the production register, and answer in the new register on request.",
      "Communication - Defend a design decision by naming which register you're answering in and why the choice would or wouldn't change in the other one.",
    ],
    // No components introduced (§16 homes the first three at 1.6) and no
    // construction-family exercise - same justified Concept-chapter
    // exception 0.2 used (§11.1, spec §4). Reader + knowledge check only.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-0-3-hint-1",
        body:
          "Stuck on which register a scenario is testing? Ask what the cost of being wrong is - a " +
          "missed signal in one conversation, or a page at 3am - and match the register to that cost.",
      },
      {
        id: "bb-0-3-hint-2",
        body:
          "For a \"what's the strongest read\" question, check whether the proposed complexity has a " +
          "named force under pressure behind it (0.2) - if it doesn't, that alone tells you the read.",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-06). Rebalanced register: replaced
    // untaught vocabulary the argument leaned on (sharded/multi-region,
    // replication lag, MongoDB/Cassandra) with plain descriptions, defined
    // "register" at first use, grounded the diagram and the boring/reversible
    // cells in a concrete decision, and rewrote the senior-answer line, which
    // had contradicted the chapter's own thesis. Also added the "it depends"
    // fix the lens claimed to teach but didn't (Q5). See spec §11.
    lessonVersion: 2,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.3 of 37.",
      masteredConcepts: [
        "The Reader-to-Editor loop and the interview-shaped framing of a validation failure (0.1).",
        "The five forces and 'no force under pressure, no justified complexity' (0.2).",
      ],
      notYetIntroducedConcepts: [
        "The numbered Interview Loop and its eight steps - that's 0.4.",
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Staged, step-by-step interview practice - that's 1.1 onward and 1.11.",
      ],
      simplifications: [
        "The interview/production contrast is drawn as a clean two-register split for teaching; real " +
          "engineering conversations blend both constantly - the clean version is intentional at this " +
          "stage.",
        "Examples name a company's public decision, not their full internal reasoning - the lesson " +
          "states the decision and its trade-off, not implementation detail.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2's convention. Q1 models QUIZ_FRAMEWORK.md
    // §5's Q3, Q2 models that bank's Q4, Q5 models that bank's Q10 - all
    // three explicitly tagged "(0.3)" in the bank. Q3 and Q4 are original.
    // Correct-position spread (c, b, a, d for the four single-kind
    // questions) checked by eye against the clustering bug fixed in 0.1/0.2.
    quiz: [
      {
        id: "bb-0-3-interview-design-vs-production-engineering-q1",
        kind: "single",
        difficulty: 1,
        prompt: "In a system design interview, which is most valued?",
        options: [
          {
            id: "a",
            label: "Producing the single correct architecture.",
            correct: false,
            explanationMd:
              "There usually isn't one - Stack Overflow's restraint and Discord's migration were both " +
              "correct, for opposite reasons. Interviews test the reasoning, not a memorized shape.",
          },
          {
            id: "b",
            label: "Exhaustive depth on every component.",
            correct: false,
            explanationMd:
              "Depth is sampled, not exhaustive - going deep everywhere leaves no time to establish " +
              "breadth or name trade-offs, both of which are weighted more heavily.",
          },
          {
            id: "c",
            label: "Structured breadth-first reasoning, clear communication, and named trade-offs.",
            correct: true,
            explanationMd:
              "Correct. The interview register rewards reasoning made visible - what you considered and " +
              "why - over any single architectural answer.",
          },
          {
            id: "d",
            label: "Speed of drawing the diagram.",
            correct: false,
            explanationMd:
              "A fast diagram with no reasoning behind it is the scale-theater failure from the cold " +
              "open - impressive-looking, unjustified, and it falls apart at the first follow-up.",
          },
        ],
      },
      {
        id: "bb-0-3-interview-design-vs-production-engineering-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Which statement about production engineering vs. interviews is true?",
        options: [
          {
            id: "a",
            label: "Production rewards the cleverest architecture.",
            correct: false,
            explanationMd:
              "Backwards - production rewards boring and reversible, since the cost of a clever choice " +
              "going wrong is a real outage, not a missed signal.",
          },
          {
            id: "b",
            label:
              "Production rewards boring, operable choices; interviews reward visible reasoning about " +
              "alternatives.",
            correct: true,
            explanationMd:
              "Correct. Same underlying question - is this justified - but a 45-minute conversation and " +
              "a multi-year operational bet reward different things.",
          },
          {
            id: "c",
            label: "Interview skills and production skills are unrelated.",
            correct: false,
            explanationMd:
              "They share the same test (is this justified by a real force under pressure) - only the " +
              "reward and the time horizon differ, not the underlying discipline.",
          },
          {
            id: "d",
            label: "Production designs never involve estimation.",
            correct: false,
            explanationMd:
              "Production estimation is constant - capacity planning and monitoring thresholds are " +
              "estimation with real stakes, not a skill unique to interviews.",
          },
        ],
      },
      {
        id: "bb-0-3-interview-design-vs-production-engineering-q3",
        kind: "multi",
        difficulty: 2,
        prompt: "Select all statements that describe the production register (select all that apply).",
        options: [
          {
            id: "a",
            label: "The default posture is not to build something until a real force is under pressure.",
            correct: true,
            explanationMd:
              "Correct default posture for production - the same 'no force, no justified complexity' " +
              "test from 0.2, applied to an operational decision instead of a design one.",
          },
          {
            id: "b",
            label: "Being wrong costs a missed signal in one conversation, nothing more.",
            correct: false,
            explanationMd:
              "That's the interview register's low stakes. Production's cost of being wrong is a real " +
              "outage - money and trust, not a missed signal.",
          },
          {
            id: "c",
            label: "A boring, reversible choice is preferred over a clever one, all else equal.",
            correct: true,
            explanationMd:
              "Correct - boring wins by default in production, though not by rule (Discord's migration " +
              "shows justified complexity still beats an unjustified boring choice).",
          },
          {
            id: "d",
            label: "The goal is to narrate your reasoning aloud for someone evaluating you in real time.",
            correct: false,
            explanationMd:
              "That's the interview register. Production is instrumented and monitored, not narrated to " +
              "a live evaluator.",
          },
          {
            id: "e",
            label: "Someone other than the original author may have to operate this decision for years.",
            correct: true,
            explanationMd:
              "Correct - production's time horizon is months to years and the decision usually outlives " +
              "the person who made it, which is exactly why boring and well-understood wins by default.",
          },
        ],
      },
      {
        id: "bb-0-3-interview-design-vs-production-engineering-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "In an interview, a candidate designing a todo app for an internal team of 15 people opens by " +
          "describing a multi-region, event-driven, sharded architecture, unprompted. What's the " +
          "strongest read on this?",
        options: [
          {
            id: "a",
            label:
              "Weak signal - the complexity has no requirement or force behind it; a strong candidate " +
              "would have asked about scale first, and the same instinct would be reckless in production.",
            correct: true,
            explanationMd:
              "Correct. Fifteen users is not a force under pressure on anything - the same unjustified " +
              "complexity from the cold open, just with different nouns.",
          },
          {
            id: "b",
            label: "Strong signal - proposing advanced architecture unprompted shows depth of knowledge.",
            correct: false,
            explanationMd:
              "Depth shown without a reason to show it is exactly the scale-theater failure this chapter " +
              "opened with - it reads as knowing vocabulary, not judgment.",
          },
          {
            id: "c",
            label: "Neutral - architecture choices in interviews don't need to match the stated scale.",
            correct: false,
            explanationMd:
              "They do - the interview register still tests whether a choice is justified, and a stated " +
              "scale of 15 users is information a strong candidate would use, not ignore.",
          },
          {
            id: "d",
            label:
              "Strong signal, but only if the candidate can also explain every component's internals.",
            correct: false,
            explanationMd:
              "Internals depth doesn't fix an unjustified choice at the root - explaining a sharding " +
              "scheme in detail is still scale theater if nothing requires sharding at all.",
          },
        ],
      },
      {
        id: "bb-0-3-interview-design-vs-production-engineering-q5",
        kind: "single",
        difficulty: 3,
        prompt: "A candidate answers every follow-up question with \"it depends.\" What's the interviewer's likely read, and the fix?",
        options: [
          {
            id: "a",
            label: "Good - it always does depend, so no fix is needed.",
            correct: false,
            explanationMd:
              "Often true and still the wrong answer to give - unresolved dependence with no named " +
              "variable reads as avoiding a commitment, not as precision.",
          },
          {
            id: "b",
            label: "The candidate should pick one answer and defend it against every follow-up regardless.",
            correct: false,
            explanationMd:
              "That overcorrects into ignoring real variables that would actually change the answer - " +
              "the fix is naming the dependency, not pretending it doesn't exist.",
          },
          {
            id: "c",
            label: "The candidate should ask the interviewer to decide instead.",
            correct: false,
            explanationMd:
              "Handing the decision back is a bigger red flag than \"it depends\" - it abandons the " +
              "reasoning the interview register is specifically rewarding.",
          },
          {
            id: "d",
            label:
              "Non-committal; the fix is to name the variable and commit per branch: \"it depends on X - " +
              "if A, I'd do P because...; if B, Q.\"",
            correct: true,
            explanationMd:
              "Correct. A senior answer makes the dependency explicit and still commits - the branching " +
              "itself is the reasoning the interviewer is listening for.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-0-4-the-system-design-lifecycle",
    mode: "building-blocks",
    title: "The System Design Lifecycle",
    // Real authored content (Track B, Wave 1 chapter 4 - closes out Wave 1 /
    // Part 0, see pending-content.md). Spec:
    // specs/bb-0-4-the-system-design-lifecycle.spec.md. Lesson body:
    // public/content/chapters/bb-0-4-the-system-design-lifecycle.md.
    problemStatement:
      "The Interview Loop is the eight-step sequence every later Part 1 chapter drills one at a " +
      "time: clarify, requirements, estimate, high-level design, deep dive, bottlenecks and " +
      "failure, trade-offs, evolve and defend. This chapter previews the whole map before you " +
      "live any single step. No build: the knowledge check asks you to place the eight steps in " +
      "order yourself.",
    // Four objectives - Practical omitted per CURRICULUM.md §5.2's carve-out
    // for pure Concept chapters (same justified exception as 0.2/0.3, spec
    // §6): no components introduced, no construction-family exercise.
    learningObjectives: [
      "Knowledge - Name the Interview Loop's eight steps in order and state what each one produces.",
      "Engineering - Decide, given a mid-design follow-up, how much of the loop needs to be re-run versus patched locally.",
      "Interview - Recognize which loop step a follow-up question is targeting, and answer inside that step rather than defending the whole design.",
      "Communication - Narrate which step of the loop you're in during a design conversation, the way a senior candidate does.",
    ],
    // No components introduced (§16 homes the first three at 1.6) and no
    // construction-family exercise - same justified Concept-chapter
    // exception 0.2/0.3 used (§11.1, spec §4). Reader + knowledge check
    // only; the ordering quiz question (Q3) realizes CURRICULUM §14's
    // "ordering exercise" for this chapter.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-0-4-hint-1",
        body:
          "Stuck on where a step goes? Ask what it needs from the step before it - each step in " +
          "the loop only works once the step above it already exists.",
      },
      {
        id: "bb-0-4-hint-2",
        body:
          "Deep dive, bottlenecks, and trade-offs (5, 6, 7) are easy to swap. All three need a " +
          "design to already exist (step 4) - re-read \"What each step produces\" for what each " +
          "one adds on top of that design.",
      },
      {
        id: "bb-0-4-hint-3",
        body:
          "For a \"how much do I redo\" question, check requirements (step 2) first - most " +
          "follow-ups either leave it alone (so the fix is local) or change it (so more of the " +
          "loop has to re-run).",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-06), lesson scope - grammar and
    // sentence-level ambiguity only, structure untouched per user direction.
    // Fixed a comma splice, a tense shift and an unresolved "one answer /
    // the other" in the cold open, an appositive pile-up in "How far back to
    // go", a dangling "narrated aloud", "does the same job as a narrative
    // memo" (read as a comparison), pronoun number on "requirements", and
    // three loose demonstratives. Glossed QPS at first use (§18.2 rule 1)
    // and dropped a banned "just". See spec §11 and pending-chapters.md.
    lessonVersion: 2,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.4 of 37.",
      masteredConcepts: [
        "The five forces and 'no force under pressure, no justified complexity' (0.2).",
        "The interview register and production register, judged against the same test on different clocks (0.3).",
      ],
      notYetIntroducedConcepts: [
        "Any specific component or edge kind - none are introduced until 1.6.",
        "The mechanics of any individual loop step (clarifying questions, NFR numbers, estimation math, deep-dive technique) - each gets its own chapter in 1.1-1.11.",
        "Interviewer-intent literacy and staged, timed interview practice in full - 1.10-1.11.",
      ],
      simplifications: [
        "The loop is drawn as a clean eight-step sequence with one dotted return edge; real design " +
          "conversations branch and backtrack more than one arrow can show - intentional so the " +
          "shape is learnable before it's exercised.",
        "Google's design-doc and Amazon's 6-pager descriptions name the publicly documented parts " +
          "of each practice, not their full internal templates.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2's/0.3's convention. Q1 and Q2 model
    // QUIZ_FRAMEWORK.md §5's Q6 and its causal-order idea respectively; Q3
    // is modeled on that bank's own Q5, written for this chapter. Q4 and Q5
    // are original. Correct-position spread (b, d, a, c for the four
    // single-kind questions) checked by eye against the clustering bug
    // fixed in 0.1/0.2.
    quiz: [
      {
        id: "bb-0-4-the-system-design-lifecycle-q1",
        kind: "single",
        difficulty: 1,
        prompt: "You're asked, cold, to \"design a ride-sharing app.\" What's the strongest first move?",
        options: [
          {
            id: "a",
            label: "Draw a client, a load balancer, app servers, and a database to get something on the board.",
            correct: false,
            explanationMd:
              "The cold open's own mistake - it looks productive, but half of it may need to be redrawn " +
              "once the actual scope shows up.",
          },
          {
            id: "b",
            label: "Ask who's using it, what the core feature is, and what's explicitly out of scope.",
            correct: true,
            explanationMd:
              "Correct. That's step 1, Clarify - every later step depends on the answer, including the " +
              "estimate and the architecture itself.",
          },
          {
            id: "c",
            label: "Estimate a plausible number of riders and drivers to size the system.",
            correct: false,
            explanationMd:
              "Estimate is step 3 - it needs scope and requirements (steps 1-2) first, or the number is a " +
              "guess dressed up as math.",
          },
          {
            id: "d",
            label: "Ask the interviewer which database they'd prefer for this kind of app.",
            correct: false,
            explanationMd:
              "A real question, but not a clarifying one - it doesn't change what the system needs to do, " +
              "which is what step 1 is actually for.",
          },
        ],
      },
      {
        id: "bb-0-4-the-system-design-lifecycle-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A candidate is confident the system needs to handle \"roughly a million users\" and wants to " +
          "skip from clarifying scope straight to sketching the architecture, without estimating first. " +
          "What's the risk?",
        options: [
          {
            id: "a",
            label: "None - if you already know the scale, estimating again is redundant.",
            correct: false,
            explanationMd:
              "\"Roughly a million users\" isn't a QPS, storage, or bandwidth number yet - the design " +
              "choices in step 4 are made against those, not against a headcount.",
          },
          {
            id: "b",
            label: "The interviewer will assume the candidate can't do arithmetic.",
            correct: false,
            explanationMd:
              "That's about appearances, not the actual dependency at stake - the real risk is guessing " +
              "the numbers step 4 needs instead of deriving them.",
          },
          {
            id: "c",
            label: "Estimate always comes after high-level design, so skipping ahead is actually the correct order.",
            correct: false,
            explanationMd:
              "This reverses the real order - estimate (3) precedes high-level design (4) because scale " +
              "drives the design choices, not the other way around.",
          },
          {
            id: "d",
            label:
              "Step 4's design choices - entry point, data store - depend on numbers that \"a million users\" " +
              "alone doesn't give you; skipping estimate means guessing those numbers instead of deriving them.",
            correct: true,
            explanationMd:
              "Correct. A headcount isn't a QPS or a storage figure - estimate is the step that turns one " +
              "into the other, and step 4 needs the result.",
          },
        ],
      },
      {
        id: "bb-0-4-the-system-design-lifecycle-q3",
        kind: "ordering",
        difficulty: 2,
        prompt: "Put the Interview Loop's eight steps in order, from the first thing a candidate does to the last.",
        // Full derangement against correctOrder below - Ordering.tsx shows
        // this array's order with no shuffle, so an already-correct draft
        // would ship pre-solved (the same discipline 0.2's matching
        // questions applied to `pairs` vs. `options`).
        options: [
          {
            id: "bottlenecks",
            label: "Bottlenecks & failure",
            correct: true,
            explanationMd:
              "Comes after a design exists (step 4) and after the deep dive (5) - you need something " +
              "concrete before you can say what breaks first.",
          },
          {
            id: "evolve-defend",
            label: "Evolve & defend",
            correct: true,
            explanationMd:
              "Last - responding to follow-ups only makes sense once there's a design, trade-offs, and " +
              "failure modes already on the table to defend.",
          },
          {
            id: "clarify",
            label: "Clarify",
            correct: true,
            explanationMd: "First - scope has to exist before anything else can be sized, designed, or defended.",
          },
          {
            id: "deep-dive",
            label: "Deep dive",
            correct: true,
            explanationMd:
              "Comes after the high-level design (4) exists - you go one level down on a specific part of " +
              "something that's already been sketched.",
          },
          {
            id: "trade-offs",
            label: "Trade-offs",
            correct: true,
            explanationMd:
              "Comes after bottlenecks (6) - naming the roads not taken is easier once you know what the " +
              "chosen road actually breaks on.",
          },
          {
            id: "high-level-design",
            label: "High-level design",
            correct: true,
            explanationMd:
              "Comes after estimate (3) - entry point and data-store choices are made against a scale, not " +
              "a guess.",
          },
          {
            id: "requirements",
            label: "Requirements",
            correct: true,
            explanationMd: "Second - functional and non-functional promises only make sense once scope (1) is fixed.",
          },
          {
            id: "estimate",
            label: "Estimate",
            correct: true,
            explanationMd:
              "Third - turning scope and requirements (1-2) into QPS, storage, and bandwidth numbers, " +
              "before any design decision uses them.",
          },
        ],
        correctOrder: [
          "clarify",
          "requirements",
          "estimate",
          "high-level-design",
          "deep-dive",
          "bottlenecks",
          "trade-offs",
          "evolve-defend",
        ],
      },
      {
        id: "bb-0-4-the-system-design-lifecycle-q4",
        kind: "single",
        difficulty: 2,
        prompt: "Mid-design, the interviewer says: \"now this needs to handle 10x the writes.\" What's the strongest response?",
        options: [
          {
            id: "a",
            label:
              "Recompute the estimate for the new number, then check which parts of the high-level design " +
              "still hold - redo only what the new number actually changes.",
            correct: true,
            explanationMd:
              "Correct. This is the loop's own re-entry move - check requirements/estimate first, then " +
              "redo only what they actually change.",
          },
          {
            id: "b",
            label: "Say the current design already handles it, since it wasn't designed with a ceiling in mind.",
            correct: false,
            explanationMd:
              "Dismisses a real force under pressure (0.2) without checking - no stated ceiling isn't the " +
              "same as verified at 10x.",
          },
          {
            id: "c",
            label: "Redraw the whole design from clarify onward, since any earlier assumption might now be wrong.",
            correct: false,
            explanationMd:
              "Always safe, but the loop rewards re-running only what a specific follow-up actually " +
              "touches - redoing everything spends time you don't have without new information to justify it.",
          },
          {
            id: "d",
            label: "Say \"it depends what kind of writes\" and wait for the interviewer to specify further.",
            correct: false,
            explanationMd:
              "\"It depends\" without naming the variable and answering both branches is the exact " +
              "non-commitment 0.3 flagged - the fix is to say what it depends on and commit.",
          },
        ],
      },
      {
        id: "bb-0-4-the-system-design-lifecycle-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Which statement best describes how the interview register and the production register each run " +
          "this same eight-step loop?",
        options: [
          {
            id: "a",
            label: "Production skips clarify and requirements, since there's no interviewer to ask.",
            correct: false,
            explanationMd:
              "Production still needs scope and requirements - they're written down, in a design doc's " +
              "goals and non-goals, instead of spoken to a listener.",
          },
          {
            id: "b",
            label: "Only steps 4 through 8 apply in production; the first three are interview formalities.",
            correct: false,
            explanationMd:
              "Google's and Amazon's own design-doc formats devote real space to scope and requirements " +
              "before any design appears - tempting since interviews compress them, but wrong.",
          },
          {
            id: "c",
            label:
              "Both registers run all eight steps in the same order; the interview narrates them in one " +
              "sitting, production stretches them across days and writes them down.",
            correct: true,
            explanationMd:
              "Correct. Same loop, same order, different clock and different artifact - the point \"Same " +
              "loop, on paper\" makes with Google's and Amazon's own documented practices.",
          },
          {
            id: "d",
            label: "The production register runs the loop in reverse, starting from trade-offs since a design already exists.",
            correct: false,
            explanationMd:
              "An invented mechanism - production design docs still open with goals and requirements, the " +
              "same order the loop runs in everywhere else.",
          },
        ],
      },
    ],
  },
  // --- Phase 10 (6.1.0-alpha) condense: new 1.1-1.4 replace old 1.1-1.11 ---
  // See .claude/docs/pending-6.1.0-poa.md Phase 10 and
  // .claude/docs/pending-chapters.md's "1.1 Framing the Problem" entry.
  // Added alongside the old eleven, not yet wired into manifest.ts and not
  // yet replacing them - that happens in the engineering pass once all four
  // new chapters are authored (POA Phase 10, 10.5).
  {
    id: "bb-1-1-framing-the-problem",
    mode: "building-blocks",
    title: "Framing the Problem",
    // Real authored content (Phase 10 condense of old 1.1-1.5 into one
    // chapter). Spec: specs/bb-1-1-framing-the-problem.spec.md. Lesson body:
    // public/content/chapters/bb-1-1-framing-the-problem.mdx.
    problemStatement:
      "A decision - a clarifying question, a candidate feature, a claimed number, a digit of " +
      "precision - earns the time it costs only if a different answer would change what you build. " +
      "This chapter teaches that one test, applied to the Interview Loop's first three steps: " +
      "clarify, requirements (functional and non-functional), and estimate. No build: the knowledge " +
      "check covers all three steps, and none of the answers are given away in advance.",
    learningObjectives: [
      "Knowledge - State the shared test that decides whether a clarifying question, a candidate feature, or a claimed number is worth the time it costs: would a different answer change what you build.",
      "Engineering - Apply the test to sort a feature list into Must/Should/Could/Won't and to pick which clarifying questions are worth asking.",
      "Interview - Turn a vague requirement into a defensible number (latency, throughput, availability, durability, cost) and an order-of-magnitude estimate, inside the interview's small clarify-through-estimate budget.",
      "Practical - Given a brief, a list of candidate clarifying questions, and a list of candidate features, correctly identify which ones pass the test.",
      "Communication - Name, out loud, which specific design decision a clarifying answer, a Must-have cut, or a chosen number would flip.",
    ],
    // No components introduced (§16 homes the three primitives at the next
    // chapter, Designing the System) and no construction-family exercise -
    // same justified Process-chapter pattern the absorbed chapters used.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-1-framing-hint-1",
        body:
          "Stuck on whether something (a question, a feature, a number) is worth the time? Ask: if the " +
          "answer came back the opposite way, would you build something different? If not, skip it.",
      },
      {
        id: "bb-1-1-framing-hint-2",
        body:
          "For Must vs. the rest: does the system fail its core job without this feature, or does it " +
          "just become less nice to use? Only the first one is Must.",
      },
      {
        id: "bb-1-1-framing-hint-3",
        body:
          "A non-functional requirement should be a number you could check on a dashboard, not a word " +
          "like \"fast\" or \"reliable.\" If you can't test it, it isn't finished being specified.",
      },
      {
        id: "bb-1-1-framing-hint-4",
        body:
          "Before computing a ratio from scratch, check the landmark table - RAM, SSD, same-datacenter, " +
          "disk, cross-continent. One of those five is almost always what the question is really asking.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.1 of 37.",
      masteredConcepts: [
        "The five forces (0.2): latency, throughput, availability, durability, cost.",
        "The interview register and the production register, judged against the same test on different clocks (0.3).",
        "The Interview Loop's eight steps, with clarify/requirements/estimate as steps 1-3 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Any specific component or edge kind - none are introduced until the next chapter, Designing the System.",
        "High-level design, deep dives, and bottleneck analysis - loop steps 4-6, taught next.",
        "Trade-off statements and defending a design under follow-ups - loop steps 7-8.",
      ],
      simplifications: [
        "The four clarifying categories (scope, scale, usage pattern, non-negotiables) cover most real " +
          "clarifying questions but aren't an exhaustive taxonomy - a working set for this stage, not a " +
          "formula.",
        "CURRICULUM.md §14's original per-chapter staged exercises (pick-4-of-10, a staged checklist, " +
          "staged estimation buckets) are realized here as ordinary quiz questions instead - the stages " +
          "UI doesn't exist yet (see the chapter spec §5), the same documented degradation the absorbed " +
          "chapters used.",
      ],
    },
    // 12 questions (Process-chapter exception, QUIZ_FRAMEWORK.md §2), ramp
    // 4/6/2 across difficulty 1/2/3 (33/50/17, close to the 30/45/25 target).
    // At least one question per absorbed topic: clarify (Q1), functional
    // requirements (Q3, Q10), non-functional requirements (Q2, Q4, Q7),
    // estimation (Q5, Q6), landmark numbers (Q8, Q9), synthesis across steps
    // (Q11, Q12). Correct-position spread for the 11 single/estimate-kind
    // questions checked by eye: a x3, b x2, c x3, d x3 - no clustering.
    quiz: [
      {
        id: "bb-1-1-framing-the-problem-q1",
        kind: "multi",
        difficulty: 1,
        prompt:
          "\"Design a URL shortener.\" Select ALL of the following candidate questions that would " +
          "materially change the design.",
        options: [
          {
            id: "a",
            label: "What's the expected read-to-write ratio?",
            correct: true,
            explanationMd:
              "A 1000:1 ratio sends the design work to the read path; near 1:1 flips it to the write " +
              "path - a real fork, and the same number estimation reuses later.",
          },
          {
            id: "b",
            label: "What programming language should I use?",
            correct: false,
            explanationMd:
              "Neither answer changes the architecture - a decision you make, not a fact about the " +
              "problem.",
          },
          {
            id: "c",
            label: "Roughly how many links are created per day?",
            correct: true,
            explanationMd:
              "Scale in orders of magnitude changes whether a single database is plausible at all, and " +
              "feeds directly into estimation.",
          },
          {
            id: "d",
            label: "Should short codes be 6 characters or 8?",
            correct: false,
            explanationMd:
              "Cosmetic within the same storage scheme either way - nothing downstream changes based on " +
              "the answer.",
          },
          {
            id: "e",
            label: "Do links ever expire or get deleted?",
            correct: true,
            explanationMd:
              "A non-negotiable: \"yes\" means a cleanup/expiry subsystem exists at all; \"no\" means it " +
              "doesn't - and it can move a feature straight into the Must-have list.",
          },
          {
            id: "f",
            label: "What should the product be called?",
            correct: false,
            explanationMd: "Doesn't touch the architecture under any answer - not a clarifying question at all.",
          },
          {
            id: "g",
            label: "Do we need click analytics?",
            correct: true,
            explanationMd:
              "\"Yes\" adds an entire async subsystem (event capture, aggregation) that \"no\" never " +
              "requires - one of the largest forks on this list.",
          },
          {
            id: "h",
            label: "Which cloud provider should host this?",
            correct: false,
            explanationMd:
              "An infrastructure choice that sits outside the architecture this exercise is scoping - " +
              "the design looks the same either way.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these is a non-functional requirement, not a feature?",
        options: [
          {
            id: "a",
            label: "Users can create a short link.",
            correct: false,
            explanationMd: "A feature: what the system does, not how well it does it.",
          },
          {
            id: "b",
            label: "Users can view their click history.",
            correct: false,
            explanationMd: "Also a feature.",
          },
          {
            id: "c",
            label: "Redirects complete in under 200 ms at p99.",
            correct: true,
            explanationMd:
              "A performance promise, a functional requirement's \"how well\" partner - the definition " +
              "of non-functional.",
          },
          {
            id: "d",
            label: "Users can set a custom alias.",
            correct: false,
            explanationMd: "A feature.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q3",
        kind: "single",
        difficulty: 1,
        prompt:
          "For the URL shortener, clarifying confirmed links must expire after a year. Which bucket " +
          "does \"automatic expiry\" belong in, and why?",
        options: [
          {
            id: "a",
            label:
              "Must - the confirmed answer means a shortener that keeps every link forever isn't the " +
              "system that was asked for.",
            correct: true,
            explanationMd:
              "Correct. A confirmed clarifying answer can move a feature straight into Must, even though " +
              "expiry might sound like polish on a different brief.",
          },
          {
            id: "b",
            label: "Should - it protects the core job but isn't strictly required.",
            correct: false,
            explanationMd:
              "Expiry isn't optional polish here - the clarifying answer made it part of the core job " +
              "itself, not something that just protects it.",
          },
          {
            id: "c",
            label: "Could - real value, nothing core depends on it.",
            correct: false,
            explanationMd: "Wrong bucket: a specific clarifying answer moved this out of Could.",
          },
          {
            id: "d",
            label: "Won't (this pass) - deferred and written down.",
            correct: false,
            explanationMd: "The opposite of what was confirmed.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q4",
        kind: "single",
        difficulty: 1,
        prompt:
          "A teammate says the checkout API needs to be \"highly available.\" What's missing before " +
          "this becomes a real requirement?",
        options: [
          {
            id: "a",
            label: "Nothing - \"highly available\" is specific enough to design against.",
            correct: false,
            explanationMd: "An adjective can't be tested; nobody can prove or disprove a feeling.",
          },
          {
            id: "b",
            label: "A description of which cloud region it runs in.",
            correct: false,
            explanationMd: "Doesn't turn the adjective into a testable promise.",
          },
          {
            id: "c",
            label: "A list of features it depends on.",
            correct: false,
            explanationMd: "Unrelated to making the availability claim testable.",
          },
          {
            id: "d",
            label:
              "A number - a percentage of uptime, converted to the downtime budget it implies.",
            correct: true,
            explanationMd:
              "Correct. \"99.9% uptime, measured monthly\" can be checked against a dashboard; \"highly " +
              "available\" cannot.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q5",
        kind: "estimate",
        difficulty: 2,
        prompt:
          "A photo-sharing app serves 20 million photo views a day. Order of magnitude, roughly what's " +
          "the average QPS?",
        options: [
          { id: "a", label: "~20 QPS", correct: false, explanationMd: "Off by four orders of magnitude." },
          {
            id: "b",
            label: "~200 QPS",
            correct: true,
            explanationMd:
              "2×10^7 requests over ~10^5 seconds/day is ~200 - divide by the power of ten, don't reach " +
              "for a calculator.",
          },
          { id: "c", label: "~20,000 QPS", correct: false, explanationMd: "Off by two orders of magnitude." },
          { id: "d", label: "~2,000,000 QPS", correct: false, explanationMd: "That's the daily total, not a rate." },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q6",
        kind: "estimate",
        difficulty: 2,
        prompt:
          "That same app averages ~200 QPS. Which is the most defensible peak estimate to design around?",
        options: [
          {
            id: "a",
            label: "Also ~200 QPS - peak equals average.",
            correct: false,
            explanationMd: "Ignores that real traffic bursts above average.",
          },
          {
            id: "b",
            label: "~20,000 QPS - always plan for 100x average.",
            correct: false,
            explanationMd: "100x is not a fixed constant; it isn't grounded in this product's usage pattern.",
          },
          {
            id: "c",
            label:
              "Somewhere between ~400 and ~2,000 QPS - a 2-10x multiple chosen from the product's usage " +
              "pattern.",
            correct: true,
            explanationMd:
              "Peak is a small multiple of average, sized from how bursty the product's own traffic " +
              "actually is - not a fixed constant either way.",
          },
          {
            id: "d",
            label: "Impossible to estimate without exact traffic logs.",
            correct: false,
            explanationMd: "Order-of-magnitude estimation is exactly the tool for exactly this situation.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q7",
        kind: "single",
        difficulty: 2,
        prompt:
          "A service moves its availability target from 99.9% to 99.99%. What does that one extra nine " +
          "actually buy, and cost?",
        options: [
          {
            id: "a",
            label:
              "About 8 fewer hours of downtime a year, and roughly an order of magnitude more " +
              "engineering to hold it.",
            correct: true,
            explanationMd:
              "Correct. Each extra nine cuts downtime tenfold and costs roughly an order of magnitude " +
              "more engineering - real machinery, not a free upgrade.",
          },
          {
            id: "b",
            label: "About 8 fewer minutes of downtime, for free.",
            correct: false,
            explanationMd: "Understates the time saved and ignores the real engineering cost.",
          },
          {
            id: "c",
            label: "Nothing measurable - nines above 99.9% are marketing.",
            correct: false,
            explanationMd: "The nines-to-downtime table converts each one into real, checkable hours.",
          },
          {
            id: "d",
            label: "A guarantee the service never goes down.",
            correct: false,
            explanationMd: "No availability number is a zero-downtime guarantee.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q8",
        kind: "single",
        difficulty: 2,
        prompt: "Reading a row from SSD instead of from RAM (a cache hit) costs roughly:",
        options: [
          { id: "a", label: "About the same.", correct: false, explanationMd: "RAM and SSD are not the same order of magnitude." },
          { id: "b", label: "~2x slower.", correct: false, explanationMd: "Understates the real gap." },
          { id: "c", label: "~1,000,000x slower.", correct: false, explanationMd: "Overstates the gap by several orders of magnitude." },
          {
            id: "d",
            label: "On the order of 10-100x slower.",
            correct: true,
            explanationMd:
              "The ratio, not the raw nanoseconds, is what changes designs - it's why a memory cache " +
              "pays for itself.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q9",
        kind: "single",
        difficulty: 2,
        prompt:
          "Which is typically faster: a network round trip to another machine in the same datacenter, " +
          "or a seek on that same machine's local disk?",
        options: [
          {
            id: "a",
            label: "The local disk seek - local always beats network.",
            correct: false,
            explanationMd: "The exact assumption this chapter's landmark table contradicts.",
          },
          {
            id: "b",
            label: "The same-datacenter network round trip.",
            correct: true,
            explanationMd:
              "The counter-intuitive pair: reaching a nearby machine's memory usually beats reading your " +
              "own disk, which is why a memory cache sits between an app server and its database at all.",
          },
          { id: "c", label: "They're always identical.", correct: false, explanationMd: "The gap is roughly an order of magnitude, not zero." },
          {
            id: "d",
            label: "Neither - it depends entirely on the cloud provider.",
            correct: false,
            explanationMd: "The ratio is a property of the hardware and the network, not the vendor.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q10",
        kind: "single",
        difficulty: 2,
        prompt:
          "Custom aliases (choosing your own short code instead of a random one) is Must-have for a " +
          "marketing team's branded-link tool, but Could for a personal link shortener. Why does the " +
          "same feature land in different buckets?",
        options: [
          {
            id: "a",
            label: "Marketing teams pay more, so they get more features.",
            correct: false,
            explanationMd: "Pricing has nothing to do with the Must-have test.",
          },
          {
            id: "b",
            label: "Custom aliases are technically harder to build for marketing use.",
            correct: false,
            explanationMd: "The feature is the same feature either way - implementation difficulty isn't the test.",
          },
          {
            id: "c",
            label:
              "The audience decides what the system's core job is - for one, branded links ARE the " +
              "product; for the other, the core loop works fine with random codes.",
            correct: true,
            explanationMd:
              "Correct. The Must-have test asks whether the core job fails without the feature, and the " +
              "audience is what defines the core job.",
          },
          {
            id: "d",
            label: "The MoSCoW test is inconsistent and doesn't apply to judgment calls.",
            correct: false,
            explanationMd: "The test is consistent - it's the audience-dependent input that changes.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q11",
        kind: "single",
        difficulty: 3,
        prompt:
          "In the URL shortener example, the 1000:1 ratio from clarifying, the expiry answer from " +
          "requirements, and the storage estimate from step 3 are related how?",
        options: [
          {
            id: "a",
            label:
              "Each answer feeds the next step directly - the ratio becomes the actual traffic split " +
              "used in estimation, and the expiry promise becomes the retention window storage " +
              "multiplies by.",
            correct: true,
            explanationMd:
              "Correct. The loop's steps aren't independent boxes; each one spends an answer a prior " +
              "step already bought instead of recomputing from scratch.",
          },
          {
            id: "b",
            label: "They're independent facts that happen to appear in the same interview.",
            correct: false,
            explanationMd: "Each later step directly reuses an earlier answer as real input, not coincidence.",
          },
          {
            id: "c",
            label: "Only the ratio matters; expiry and storage are unrelated details.",
            correct: false,
            explanationMd: "Expiry directly sets the retention window the storage estimate depends on.",
          },
          {
            id: "d",
            label: "The estimate should be computed first, then checked against the earlier answers.",
            correct: false,
            explanationMd: "Reverses the loop's actual order - estimation depends on requirements, not the reverse.",
          },
        ],
      },
      {
        id: "bb-1-1-framing-the-problem-q12",
        kind: "single",
        difficulty: 3,
        prompt:
          "A candidate spends 20 of their 45 interview minutes on clarifying, requirements, and " +
          "estimation combined, then rushes the high-level design. What's the most accurate read?",
        options: [
          {
            id: "a",
            label: "Strong work - thoroughness on the fundamentals is always rewarded.",
            correct: false,
            explanationMd: "Thoroughness that starves the rest of the loop isn't strength.",
          },
          {
            id: "b",
            label: "Fine, as long as every number was precise to the decimal.",
            correct: false,
            explanationMd: "Decimal precision is exactly the wasted effort this chapter warns against.",
          },
          {
            id: "c",
            label: "Irrelevant - the clock doesn't matter as long as the final design is correct.",
            correct: false,
            explanationMd: "The interview's fixed clock is part of what's being evaluated, not incidental.",
          },
          {
            id: "d",
            label:
              "A budgeting mistake - these three steps together are worth roughly 10-15 minutes; the " +
              "overrun starved the steps that actually produce the architecture.",
            correct: true,
            explanationMd:
              "Correct. Clarify and requirements together get roughly 5-10 minutes, estimation about 5 " +
              "more - the rest of the loop still needs the other 30.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-2-designing-the-system",
    mode: "building-blocks",
    title: "Designing the System",
    // Real authored content (Phase 10 condense of old 1.6 Drawing the First
    // Architecture + old 1.7 Identifying Bottlenecks + old 1.9 Deep Dive
    // Methodology into one chapter). Spec:
    // specs/bb-1-2-designing-the-system.spec.md. Lesson body:
    // public/content/chapters/bb-1-2-designing-the-system.mdx.
    // Building Block type (not Process), because it carries a real canvas
    // build - the first one in the condensed Part 1. §10.3's must-survive
    // requirement (POA Phase 10): the component introduction and the first
    // Fix exercise are preserved intact from old 1.6 - same
    // available/required component ids, same validation rules, same
    // blueprint, same starterGraph. Only the surrounding lesson prose (now
    // also covering old 1.7's bottleneck method and old 1.9's deep-dive
    // targeting) and the quiz/hints changed.
    problemStatement:
      "The starter design on the canvas skips a step: the client is wired straight to the " +
      "database, with nothing between them. No tour walks you through this one - Validate will " +
      "tell you what's wrong. The lesson also covers finding a system's bottleneck (loop step 6) " +
      "and picking a deep-dive target (loop step 5), both exercised by the knowledge check rather " +
      "than a second build.",
    exerciseGoal: "Give the client's requests somewhere to be decided before they touch storage.",
    successCriteria: [
      "The client no longer connects directly to the database.",
      "Every request reaches the database only after passing through another component.",
      "Validate reports zero issues, and Submit passes.",
    ],
    learningObjectives: [
      "State the job each of the three primitive components does, and why the app server sits between the other two.",
      "Decide why a client should never connect directly to a database, naming the concrete risk it creates.",
      "Fix a starter graph that skips the app server: add the missing component, route both edges through it, and pass a clean Validate then Submit.",
      "Find a system's bottleneck by comparing component ceilings, and distinguish a slow component from an unscalable one.",
      "Pick a deep-dive target using two questions - which requirement is closest to its limit, and which component is where that pressure lands.",
      "State qualitatively what changes at 10x and 100x traffic for a simple three-tier design.",
      "Explain, in your own words, why the no-direct-client-database validation failure fires and what it is protecting against.",
    ],
    // §16's audit row for the component-introduction chapter, unchanged from
    // old 1.6: client, app-server, sql-database, all three required.
    availableComponentIds: ["client", "app-server", "sql-database"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    // Unchanged from old 1.6 - see that chapter's own comment (preserved
    // below) for why component-relations' message names the client's output
    // rules rather than the database's input rules.
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-1-2-blueprint",
        label: "Client through an app server to a database",
        require: {
          id: "bb-1-2-blueprint",
          nodes: [
            { alias: "client", componentId: "client" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "client", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "A client talks to an app server, which is the only thing that reads or writes to the " +
          "database - the smallest shape that is still a real, three-tier architecture. Every later " +
          "Building Block chapter extends this shape; none of them replace it.",
      },
    ],
    hints: [
      {
        id: "bb-1-2-hint-1",
        body:
          "Validate names what's on the canvas and what's missing. Of the three jobs - receive, " +
          "decide, store - which one has no component doing it yet?",
      },
      {
        id: "bb-1-2-hint-2",
        body:
          "The picker (`/` or right-click) has all three components available. The missing one " +
          "belongs between the two already present, not beside them.",
      },
      {
        id: "bb-1-2-hint-3",
        body:
          "A request-flow edge already runs straight from the client to the database. Once the " +
          "missing piece is placed, decide what happens to that edge rather than leaving it where it is.",
      },
      {
        id: "bb-1-2-hint-4",
        body:
          "For a bottleneck question: a system's ceiling is always its lowest number on the path, " +
          "never the average of every component's ceiling.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.2 of 37.",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The five forces: latency, throughput, availability, durability, cost (0.2).",
        "The eight-step Interview Loop (0.4), and the shared test behind clarify/requirements/estimate (new 1.1).",
        "This system's own 1000:1 read:write ratio, latency budget, and landmark ratios (new 1.1).",
      ],
      notYetIntroducedConcepts: [
        "Multiple app-server instances and routing traffic across them - a load balancer (3.4).",
        "Caching (3.14), read replicas and NoSQL (3.11-3.12).",
        "Real authentication/authorization mechanics - named as the app server's job, not implemented.",
        "Trade-off statements and defending a design under follow-ups - loop steps 7-8, taught next.",
      ],
      simplifications: [
        "Only one app-server instance is ever in scope. The instances config field exists on the " +
          "component but this chapter never asks the learner to touch it - what has to change to run " +
          "more than one safely is 3.4's job.",
        "Mediation (authentication, authorization, business rules) is named as the app server's job, " +
          "not implemented as real mechanics. The point here is only that some layer must own it and " +
          "the client must not be it.",
        "The database is treated as a single, undifferentiated store. SQL vs. NoSQL, replication, and " +
          "read replicas are all later material (3.11-3.12) and are not previewed here.",
        "Bottleneck ceilings and deep-dive targets are stated in quiz prompts as given numbers, not " +
          "derived on canvas - the same quiz-realized pattern old 1.7/1.9 used for their own " +
          "predict-then-check and target-picking exercises.",
      ],
    },
    // 13 questions (condensed-chapter exception, QUIZ_FRAMEWORK.md §2), ramp
    // 4/6/3 across difficulty 1/2/3 (31/46/23, close to 30/45/25). At least
    // one question per absorbed topic: build/design (Q1-Q4, old 1.6),
    // bottleneck/ceiling (Q5-Q8, old 1.7), deep-dive targeting (Q9-Q10, old
    // 1.9), synthesis (Q11-Q13). Q2 reuses old 1.6's own diagram-question
    // shape and graph almost exactly, since the Fix exercise it tests is
    // preserved intact per POA §10.3. Position-clustering checked by eye
    // across the 11 single-kind questions: a x3, b x3, c x3, d x2 - no
    // clustering.
    quiz: [
      {
        id: "bb-1-2-designing-the-system-q1",
        kind: "single",
        difficulty: 1,
        prompt: "What is the app server's job in the three-tier shape you just built?",
        options: [
          {
            id: "a",
            label: "Durably store the data.",
            correct: false,
            explanationMd: "That's the database's job. The app server never keeps data of its own.",
          },
          {
            id: "b",
            label: "Check who is asking, apply the product's business rules, and only then read or write.",
            correct: true,
            explanationMd:
              "Correct. The app server is the only component allowed to touch the database, and " +
              "mediation is the whole reason it sits between the other two.",
          },
          {
            id: "c",
            label: "Issue the original request.",
            correct: false,
            explanationMd: "That's the client's job - it originates the request; it doesn't decide anything about it.",
          },
          {
            id: "d",
            label: "Both store the data and issue the request.",
            correct: false,
            explanationMd:
              "This conflates the other two components' jobs into one that does neither - the app " +
              "server does neither storage nor origination, it mediates between them.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q2",
        kind: "diagram",
        difficulty: 1,
        prompt:
          "This design has client -> app server -> sql database, plus a second edge straight from " +
          "the client to the database. Which edge should not exist, and why?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 100 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 220, y: 100 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 400, y: 100 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "c1", target: "a1", kind: "request-flow" },
            { id: "e2", source: "a1", target: "d1", kind: "request-flow" },
            { id: "e3", source: "c1", target: "d1", kind: "request-flow" },
          ],
          entryPointIds: ["c1"],
        },
        options: [
          {
            id: "a",
            label: "e1 - the client should reach the app server through a firewall first.",
            correct: false,
            explanationMd:
              "A firewall isn't introduced until 3.1 and isn't required at this scale. e1 is a legitimate " +
              "client-to-app-server edge, exactly the shape this chapter teaches.",
          },
          {
            id: "b",
            label: "e2 - the app server should not talk to the database directly.",
            correct: false,
            explanationMd:
              "e2 is the one edge in this graph doing exactly what it should - the app server is the " +
              "only component that is supposed to reach the database.",
          },
          {
            id: "c",
            label: "e3 - it bypasses the app server's authentication, authorization, and business logic.",
            correct: true,
            explanationMd:
              "Correct. A direct client-to-database edge skips every check the app server exists to " +
              "make, which is exactly what no-direct-client-database catches - the same fault this " +
              "chapter's own starter graph ships with.",
          },
          {
            id: "d",
            label: "All three edges are fine as drawn.",
            correct: false,
            explanationMd:
              "e3 is not fine - a graph with a direct client-to-database edge fails Validate, " +
              "regardless of what else is drawn correctly alongside it.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q3",
        kind: "single",
        difficulty: 1,
        prompt:
          "no-direct-client-database fires on a client-to-database edge no matter what kind that " +
          "edge is given. Why?",
        options: [
          {
            id: "a",
            label:
              "The rule checks which components an edge connects, not what kind it's labeled - the " +
              "problem is the missing mediation, not the edge's label.",
            correct: true,
            explanationMd:
              "Correct. A request-flow edge straight from client to database is exactly as illegal as " +
              "any other kind would be - nothing about relabeling it fixes the missing app server.",
          },
          {
            id: "b",
            label: "It only checks edges of kind async.",
            correct: false,
            explanationMd:
              "There is no kind filter on this rule at all - checking only one kind would let the same " +
              "illegal connection dodge the rule by picking a different kind.",
          },
          {
            id: "c",
            label: "It only fires if the database initiates the connection.",
            correct: false,
            explanationMd:
              "A database has no legal outgoing path to a client at all in this registry - the rule " +
              "fires on the client-to-database direction, never the reverse.",
          },
          {
            id: "d",
            label: "It only fires once every other validation rule has already passed.",
            correct: false,
            explanationMd:
              "Validation rules are independent - this one fires on its own match, at the same time as " +
              "any other rule that also matches the same graph.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q4",
        kind: "single",
        difficulty: 1,
        prompt: "Today's design has exactly one app-server instance. It crashes. What happens?",
        options: [
          {
            id: "a",
            label: "Reads keep working; only writes fail.",
            correct: false,
            explanationMd:
              "There is no separate read path in this design - the app server is the only route to the " +
              "database for anything, reads included.",
          },
          {
            id: "b",
            label: "The database serves cached responses.",
            correct: false,
            explanationMd: "No cache exists yet in this architecture - that component doesn't arrive until 3.14.",
          },
          {
            id: "c",
            label: "Nothing responds at all - the app server is the only path to the database.",
            correct: true,
            explanationMd:
              "Correct. Its absence is total, not partial: with the one component that mediates access " +
              "gone, there is no route left to the database for anything.",
          },
          {
            id: "d",
            label: "Clients fall back to a direct database connection.",
            correct: false,
            explanationMd:
              "Nothing in this architecture permits that - it's the exact edge no-direct-client-database " +
              "exists to forbid, crash or no crash.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q5",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "Client -> one app-server instance -> sql database. The app server sustains roughly 800 " +
          "req/s; the database sustains roughly 5,000 req/s of this workload. As traffic climbs, " +
          "which component saturates first?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 100 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 220, y: 100 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 400, y: 100 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "c1", target: "a1", kind: "request-flow" },
            { id: "e2", source: "a1", target: "d1", kind: "request-flow" },
          ],
          entryPointIds: ["c1"],
        },
        options: [
          {
            id: "a",
            label: "The database - it always saturates first.",
            correct: false,
            explanationMd:
              "Not here: 5,000 req/s is the higher ceiling of the two. \"Databases always break first\" " +
              "is reputation, not a comparison of today's numbers.",
          },
          {
            id: "b",
            label: "The app server - it has the lower ceiling on this path.",
            correct: true,
            explanationMd:
              "Correct. A system's ceiling is the lowest ceiling on the path, and 800 is lower than " +
              "5,000 here - a fact about these numbers, not a permanent rule about app servers.",
          },
          {
            id: "c",
            label: "The client - it originates the traffic.",
            correct: false,
            explanationMd: "The client has no ceiling of its own in this model - it isn't serving requests, it's issuing them.",
          },
          {
            id: "d",
            label: "Both at exactly the same traffic level.",
            correct: false,
            explanationMd: "The two ceilings are different numbers, so they aren't reached at the same traffic level.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q6",
        kind: "single",
        difficulty: 2,
        prompt:
          "A database's individual queries get slower as a table grows, but its requests-per-second " +
          "ceiling hasn't moved. Is this a bottleneck?",
        options: [
          {
            id: "a",
            label: "Yes - anything getting worse under load is the bottleneck by definition.",
            correct: false,
            explanationMd: "Conflates \"slow\" with \"unscalable\" - the two are different problems with different fixes.",
          },
          {
            id: "b",
            label:
              "Not yet a capacity bottleneck - it's a slow problem (worth fixing with an index or " +
              "query rewrite), not a hard ceiling.",
            correct: true,
            explanationMd:
              "Correct. Throughput ceiling and per-request latency are different measurements - one can " +
              "move without the other.",
          },
          {
            id: "c",
            label: "No - only the app server can ever be a bottleneck.",
            correct: false,
            explanationMd: "Any component on the path can be the lowest-ceiling one, given the right numbers.",
          },
          {
            id: "d",
            label: "It's unmeasurable without a simulator.",
            correct: false,
            explanationMd: "The distinction (ceiling moved vs. didn't) is exactly what's given in the scenario - no simulator needed.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q7",
        kind: "single",
        difficulty: 2,
        prompt:
          "App-server instances are added until the app server is no longer the bottleneck. What " +
          "happens to the system's ceiling next?",
        options: [
          {
            id: "a",
            label: "There is no ceiling anymore - the system scales indefinitely.",
            correct: false,
            explanationMd: "The database primary's ceiling is still there, and now it's the binding one.",
          },
          {
            id: "b",
            label:
              "The database's ceiling becomes the system's ceiling instead, even though nothing " +
              "about the database changed.",
            correct: true,
            explanationMd:
              "Correct. A single database primary's ceiling stays roughly fixed regardless of app-tier " +
              "capacity - only the comparison moved, not the database itself.",
          },
          {
            id: "c",
            label: "The client becomes the bottleneck.",
            correct: false,
            explanationMd: "The client has no ceiling of its own in this model.",
          },
          {
            id: "d",
            label: "The app server remains the bottleneck regardless of how many instances exist.",
            correct: false,
            explanationMd: "Directly contradicts the premise - adding instances is exactly what raised its ceiling.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q8",
        kind: "single",
        difficulty: 2,
        prompt:
          "A known future ceiling is still months away. What does this chapter say about adding " +
          "capacity now versus waiting?",
        options: [
          {
            id: "a",
            label: "Always preempt - waiting is always the wrong call.",
            correct: false,
            explanationMd: "Stated as genuinely two-sided - preempting has a real cost too (complexity today for a wall that might arrive later or not at all).",
          },
          {
            id: "b",
            label: "Always wait - premature scaling is always wasted effort.",
            correct: false,
            explanationMd: "Also one-sided - waiting risks a scramble under load, which has its own real cost.",
          },
          {
            id: "c",
            label:
              "Neither is free; the right call depends on how expensive an outage is versus how " +
              "confidently the growth curve can be predicted.",
            correct: true,
            explanationMd: "Correct. Both options have a named cost - this is a genuine trade-off, not a rule with one right answer.",
          },
          {
            id: "d",
            label: "The choice doesn't matter as long as the ceiling is known.",
            correct: false,
            explanationMd: "Knowing the ceiling doesn't remove the trade-off between paying now and paying (differently) later.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q9",
        kind: "single",
        difficulty: 2,
        prompt:
          "A design's read traffic is about to grow 10x and is already the tightest requirement; " +
          "the write path has generous headroom. Which is the defensible deep-dive target, and why?",
        options: [
          {
            id: "a",
            label:
              "The read path - it's the requirement closest to its limit, and that's where the " +
              "pressure lands.",
            correct: true,
            explanationMd:
              "Correct. Both questions point the same way here: which requirement is closest to " +
              "breaking, and which component is where that pressure lands.",
          },
          {
            id: "b",
            label: "The write path - writes are always the harder problem to explain.",
            correct: false,
            explanationMd: "Not supported by this scenario's own numbers - the pressure named here is on reads.",
          },
          {
            id: "c",
            label: "Whichever one the candidate personally knows better.",
            correct: false,
            explanationMd: "Exactly the failure mode this chapter names - picking by comfort instead of by evidence.",
          },
          {
            id: "d",
            label: "Both, split evenly.",
            correct: false,
            explanationMd: "Splitting when only one requirement is genuinely under pressure reads as two shallow answers instead of one real one.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q10",
        kind: "single",
        difficulty: 2,
        prompt:
          "A candidate spends eight minutes deep-diving one component's internals and never connects " +
          "it back to the rest of the design. What's the failure, and the fix?",
        options: [
          {
            id: "a",
            label:
              "Losing the room - the fix is a deliberate resurface, one sentence reconnecting the " +
              "detail to the whole design.",
            correct: true,
            explanationMd: "Correct. Going deep is fine; disappearing into it without ever coming back up is what loses the interviewer.",
          },
          {
            id: "b",
            label: "Nothing is wrong - more depth is always better.",
            correct: false,
            explanationMd: "Depth without a return trip is exactly the failure mode this chapter names.",
          },
          {
            id: "c",
            label: "The candidate picked the wrong component entirely.",
            correct: false,
            explanationMd: "The scenario doesn't say the target was wrong - it says the candidate never came back up, a separate problem.",
          },
          {
            id: "d",
            label: "The fix is to avoid deep dives altogether.",
            correct: false,
            explanationMd: "Deep dives are the point of loop step 5 - the fix is resurfacing, not avoiding depth.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q11",
        kind: "single",
        difficulty: 3,
        prompt: "Traffic grows 100x, using only today's three components. What's the first real limitation?",
        options: [
          {
            id: "a",
            label: "The database fails first.",
            correct: false,
            explanationMd:
              "Plausible-sounding, but not what this design actually hits first - the single app-server " +
              "instance runs out of headroom before the database does.",
          },
          {
            id: "b",
            label: "The client can't send requests fast enough.",
            correct: false,
            explanationMd: "Clients aren't the bottleneck in this shape - nothing about issuing a request is capacity-limited here.",
          },
          {
            id: "c",
            label: "Nothing changes; the shape still works at any scale.",
            correct: false,
            explanationMd: "Directly contradicted by what this chapter teaches: at 100x, one app-server instance genuinely cannot serve the load.",
          },
          {
            id: "d",
            label:
              "The single app-server instance can't serve the load, and nothing yet decides how to " +
              "split traffic across more than one.",
            correct: true,
            explanationMd:
              "Correct. This is exactly the wall this chapter's own Scaling section names - solving it " +
              "needs a new component, which 3.4 introduces.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q12",
        kind: "single",
        difficulty: 3,
        prompt:
          "Two requirements are both genuinely close to breaking at once. This chapter's advice on " +
          "splitting the remaining deep-dive time evenly between them is:",
        options: [
          {
            id: "a",
            label: "Always do it - fairness between requirements is the safest default.",
            correct: false,
            explanationMd: "The chapter's actual position is narrower than this - see the correct option.",
          },
          {
            id: "b",
            label:
              "Defensible only when both pressures are genuinely close to breaking - otherwise two " +
              "shallow dives read as two things half-understood.",
            correct: true,
            explanationMd:
              "Correct. Splitting is usually wrong because it trades a demonstrated real dive for two " +
              "shallow ones - it's only defensible in the genuinely-both-critical case this question " +
              "describes.",
          },
          {
            id: "c",
            label: "Never do it - always pick exactly one target no matter what.",
            correct: false,
            explanationMd: "Too absolute - the chapter allows splitting specifically when both pressures are real.",
          },
          {
            id: "d",
            label: "It depends entirely on which requirement was mentioned first.",
            correct: false,
            explanationMd: "Order of mention isn't the chapter's test - closeness to breaking is.",
          },
        ],
      },
      {
        id: "bb-1-2-designing-the-system-q13",
        kind: "single",
        difficulty: 3,
        prompt:
          "You've found the app server has the lowest ceiling on the path (the bottleneck method), " +
          "and separately picked the read path as the deep-dive target because throughput is closest " +
          "to its limit (the deep-dive method). How are these two findings related?",
        options: [
          {
            id: "a",
            label:
              "They're coincidentally about the same system - the two methods are otherwise " +
              "unrelated.",
            correct: false,
            explanationMd: "Understates the connection - both methods run the identical requirement-to-component comparison.",
          },
          {
            id: "b",
            label:
              "They're the same underlying comparison asked as two different questions - which " +
              "requirement is under pressure, and which component that pressure lands on.",
            correct: true,
            explanationMd:
              "Correct. \"What's the bottleneck\" and \"where should I go deeper\" both reduce to " +
              "comparing requirements against components - this chapter's own \"two methods, one " +
              "comparison\" point.",
          },
          {
            id: "c",
            label: "The bottleneck method is only for Building Block chapters; deep-dive targeting is unrelated.",
            correct: false,
            explanationMd: "Not a real distinction - both methods apply to any architecture, regardless of chapter type.",
          },
          {
            id: "d",
            label: "Whichever finding came first should be discarded in favor of the second.",
            correct: false,
            explanationMd: "Both findings are valid and reinforce each other - neither one invalidates the other.",
          },
        ],
      },
    ],
    // Deliberately broken, matching 0.1's own "two real, distinct issues"
    // pattern (§11.1 - fix exercises ship symptoms, never "find the bug"
    // blind), unchanged from old 1.6:
    //  1. app-server (a required component) is entirely absent.
    //  2. The one edge present runs client -> sql-database directly, kind
    //     request-flow - illegal because of what it connects, not because of
    //     its kind - the more realistic and more instructive fault, and the
    //     reason no-direct-client-database checks endpoints unconditionally
    //     on kind (see that rule's own module comment).
    starterGraph: {
      nodes: [
        { id: "bb-1-2-client", componentId: "client", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-1-2-sql-database", componentId: "sql-database", position: { x: 380, y: 160 }, config: {} },
      ],
      edges: [
        { id: "bb-1-2-edge-client-db", source: "bb-1-2-client", target: "bb-1-2-sql-database", kind: "request-flow" },
      ],
      entryPointIds: ["bb-1-2-client"],
    },
    starterDecorators: [
      { kind: "zone", id: "bb-1-2-zone-client", label: "Client", position: { x: 32, y: 112 }, width: 256, height: 137, color: "#3b82f6" },
      { kind: "zone", id: "bb-1-2-zone-data", label: "Data", position: { x: 352, y: 112 }, width: 256, height: 137, color: "#10b981" },
      { kind: "zone", id: "bb-1-2-zone-gap", label: "Build here", position: { x: 32, y: 272 }, width: 256, height: 137, color: "#ff3483" },
    ],
  },
  {
    id: "bb-1-3-defending-the-design",
    mode: "building-blocks",
    title: "Defending the Design",
    // Real authored content (Phase 10 condense of old 1.8 Engineering
    // Trade-offs + old 1.10 Communicating & Defending a Design into one
    // chapter). Spec: specs/bb-1-3-defending-the-design.spec.md. Lesson
    // body: public/content/chapters/bb-1-3-defending-the-design.mdx.
    problemStatement:
      "Every real design decision buys something and spends something, and every follow-up is " +
      "new input to weigh, not a verdict on what you already drew. This chapter teaches both: the " +
      "trade-off reflex (we chose X, accepting Y, because Z) and the follow-up test (new evidence " +
      "or only pressure, and does the design already survive it). No build: the knowledge check " +
      "covers both loop steps.",
    learningObjectives: [
      "Knowledge - State the three-part trade-off statement and the five dimensions a decision commonly spends.",
      "Engineering - Given a decision, identify which dimensions it genuinely spends versus leaves untouched.",
      "Interview - Read a follow-up as new evidence or only pressure, and decide whether the current design already survives it before changing anything.",
      "Practical - Given trade-off and follow-up scenarios, pick the response that names both what's bought and spent, or that correctly evolves only the piece that breaks.",
      "Communication - Defend a decision by restating why its reason still holds, or name honestly what changed when it doesn't.",
    ],
    // No components introduced - Process type, same as every non-build Part
    // 1 chapter. The palette is still the previous chapter's three
    // components; this chapter adds no fourth.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-3-hint-1",
        body:
          "A trade-off statement is incomplete until it names what was spent, not just what was " +
          "fixed. Check the five dimensions - latency, consistency, complexity, money, operability - " +
          "against the decision.",
      },
      {
        id: "bb-1-3-hint-2",
        body:
          "\"It's a bit more complex\" doesn't name a dimension. Which specific one - more moving " +
          "parts, more to monitor, more to deploy - actually changed?",
      },
      {
        id: "bb-1-3-hint-3",
        body:
          "For a follow-up: ask whether it's genuinely new evidence or just pressure on a choice " +
          "already made. Only evidence can justify changing the design.",
      },
      {
        id: "bb-1-3-hint-4",
        body:
          "If the design already survives the new evidence, the right move is to say so and explain " +
          "why - not to redesign something that doesn't need it.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.3 of 37.",
      masteredConcepts: [
        "The three-tier shape, component ceilings, and deep-dive targeting (new 1.2).",
        "The five forces (0.2) and this system's own requirements and estimates (new 1.1).",
        "The eight-step Interview Loop, including steps 7-8 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "The full consistency model - strong vs. eventual, quorums, CAP (3.22). \"Consistency\" here is a working name, not the full model.",
        "Durability machinery that would let a write survive a mid-crash restart (3.20, 3.26) - named as a real, currently-unsolved gap, not glossed over.",
        "Running the full eight-step loop under a real interview clock - the next chapter.",
      ],
      simplifications: [
        "The write-survives-a-restart gap is deliberately left unsolved, not quietly patched with an " +
          "untaught mechanism - stated honestly in the lesson body, not just recorded here.",
        "\"Consistency\" is used as a working name for one of the five spend dimensions, not the full " +
          "strong/eventual/quorum model that arrives at 3.22.",
      ],
    },
    // 13 questions (condensed-chapter exception, QUIZ_FRAMEWORK.md §2), ramp
    // 4/6/3. At least one question per absorbed topic: trade-off reflex (Q1-
    // Q5, old 1.8), follow-up reading (Q6-Q10, old 1.10), synthesis (Q11-
    // Q13). Position-clustering checked by eye across the 12 single-kind
    // questions (all but Q3, which is multi): a x3, b x3, c x3, d x3 - no
    // clustering.
    quiz: [
      {
        id: "bb-1-3-defending-the-design-q1",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these is a COMPLETE trade-off statement?",
        options: [
          {
            id: "a",
            label: "We added more app-server instances.",
            correct: false,
            explanationMd: "Names the decision (X) only - no reason, no cost.",
          },
          {
            id: "b",
            label:
              "We added more app-server instances, accepting more infrastructure cost and " +
              "operational surface, because the app server has the lower ceiling today.",
            correct: true,
            explanationMd: "Correct. All three blanks filled: X (the decision), Y (what it spends), Z (why).",
          },
          {
            id: "c",
            label: "We added more app-server instances because the app server was the bottleneck.",
            correct: false,
            explanationMd: "Names X and Z, but not Y - the cost is still missing.",
          },
          {
            id: "d",
            label: "Adding more app-server instances is the right call here.",
            correct: false,
            explanationMd: "A verdict, not a trade-off statement - none of X, Y, or Z is stated explicitly.",
          },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q2",
        kind: "single",
        difficulty: 1,
        prompt: "\"Every added instance is a real line on the bill\" names which spend dimension?",
        options: [
          { id: "a", label: "Latency", correct: false, explanationMd: "Latency is about request time, not spend." },
          { id: "b", label: "Money", correct: true, explanationMd: "Correct. A literal infrastructure/operational cost is the money dimension." },
          { id: "c", label: "Consistency", correct: false, explanationMd: "Consistency is about whether concurrent readers see the same answer, not cost." },
          { id: "d", label: "Operability", correct: false, explanationMd: "Operability is about day-to-day running difficulty, a related but distinct dimension from the bill itself." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q3",
        kind: "multi",
        difficulty: 1,
        prompt:
          "\"We added more app-server instances\" (the app server is stateless). Select ALL " +
          "dimensions this decision genuinely spends.",
        options: [
          {
            id: "a",
            label: "Money",
            correct: true,
            explanationMd: "Every added instance is a real infrastructure cost.",
          },
          {
            id: "b",
            label: "Latency",
            correct: false,
            explanationMd: "Unaffected - adding instances doesn't change how long one request takes.",
          },
          {
            id: "c",
            label: "Consistency",
            correct: false,
            explanationMd: "Unaffected - a stateless app server means which instance answers never changes the answer.",
          },
          {
            id: "d",
            label: "Complexity",
            correct: true,
            explanationMd: "More instances is more moving parts and more independent failure modes.",
          },
          {
            id: "e",
            label: "Operability",
            correct: true,
            explanationMd: "More instances means more things deployed, monitored, and eventually routed across.",
          },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q4",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these actually names a spend dimension?",
        options: [
          { id: "a", label: "\"It's a bit more complex.\"", correct: false, explanationMd: "Vague - names no specific dimension or mechanism." },
          {
            id: "b",
            label: "\"More operational surface, more things to monitor.\"",
            correct: true,
            explanationMd: "Correct. Specific and checkable against the operability dimension.",
          },
          { id: "c", label: "\"It's not great, honestly.\"", correct: false, explanationMd: "Not a cost statement at all." },
          { id: "d", label: "\"Some trade-offs exist.\"", correct: false, explanationMd: "Acknowledges trade-offs exist without naming any." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q5",
        kind: "single",
        difficulty: 2,
        prompt: "Between adding more app-server instances and moving to one bigger machine, which is correct?",
        options: [
          {
            id: "a",
            label: "More instances is always correct - horizontal scaling is always the better choice.",
            correct: false,
            explanationMd: "Too absolute - a bigger machine buys back real simplicity, at a real cost.",
          },
          {
            id: "b",
            label: "A bigger machine is always correct - fewer moving parts always wins.",
            correct: false,
            explanationMd: "Also too absolute - it still has a ceiling of its own, and costs money at a worse rate.",
          },
          {
            id: "c",
            label:
              "Neither is simply correct - steady growth favors the bigger machine's simplicity, " +
              "uncertain growth favors instances since the ceiling problem returns slower.",
            correct: true,
            explanationMd: "Correct. Both options are genuinely defensible, depending on the growth pattern - that's the point of a real trade-off.",
          },
          {
            id: "d",
            label: "It doesn't matter which one is picked.",
            correct: false,
            explanationMd: "It does matter - the two options have different real costs, just not a universal winner.",
          },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q6",
        kind: "single",
        difficulty: 2,
        prompt: "\"Why not just use a bigger machine?\" after you've already justified adding instances. This follow-up is:",
        options: [
          {
            id: "a",
            label: "New evidence - a real requirement changed.",
            correct: false,
            explanationMd: "Nothing about the requirements changed - this challenges a choice already made.",
          },
          {
            id: "b",
            label: "Only pressure - a challenge to a decision already made, unless it names something the trade-off missed.",
            correct: true,
            explanationMd: "Correct. The move is to defend: restate what more instances buys and costs.",
          },
          { id: "c", label: "A sign the original design was wrong.", correct: false, explanationMd: "A challenge is not automatically a verdict." },
          { id: "d", label: "Impossible to classify without more information.", correct: false, explanationMd: "The test above classifies it directly: no new fact was introduced." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q7",
        kind: "single",
        difficulty: 2,
        prompt: "Writes grow 10x (real new evidence), and the write path already has enough headroom to absorb it. What's the right move?",
        options: [
          {
            id: "a",
            label: "Redesign the write path anyway, to be safe.",
            correct: false,
            explanationMd: "Unnecessary - the test's second question (does it already survive) answered yes.",
          },
          {
            id: "b",
            label: "Say so, and explain why the current design already handles it - no redesign.",
            correct: true,
            explanationMd: "Correct. New evidence that the design already survives needs acknowledgment, not a rebuild.",
          },
          { id: "c", label: "Ignore the question and move on.", correct: false, explanationMd: "The follow-up still deserves an answer, even a short one." },
          { id: "d", label: "Erase the diagram and start over.", correct: false, explanationMd: "The cold open's own failure mode - the design didn't need to change at all here." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q8",
        kind: "single",
        difficulty: 2,
        prompt: "Writes grow 10x (real new evidence), and the write path does NOT already have headroom. What's the right move?",
        options: [
          {
            id: "a",
            label: "Evolve only the piece that breaks, not the whole design.",
            correct: true,
            explanationMd: "Correct. A real gap gets a targeted fix - the rest of the design that isn't implicated stays as it was.",
          },
          { id: "b", label: "Say the design already handles it.", correct: false, explanationMd: "Contradicts the premise - it doesn't already have headroom." },
          { id: "c", label: "Redesign the entire system from scratch.", correct: false, explanationMd: "The cold open's own failure - a full redesign when one piece needs to change." },
          { id: "d", label: "Defend the original decision without changing anything.", correct: false, explanationMd: "Defending only makes sense when the reason still holds - here it doesn't." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q9",
        kind: "single",
        difficulty: 2,
        prompt: "Defending a decision extends the trade-off statement by which clause?",
        options: [
          {
            id: "a",
            label: "\"...and Z hasn't changed, so X still holds.\"",
            correct: true,
            explanationMd: "Correct. Defending reuses the same X/Y/Z reflex, adding a check on whether the reason still holds.",
          },
          { id: "b", label: "\"...and here is a completely new design.\"", correct: false, explanationMd: "That's redesigning, not defending." },
          { id: "c", label: "\"...trust me, it's fine.\"", correct: false, explanationMd: "Not a defensible claim - names nothing." },
          { id: "d", label: "\"...the interviewer is wrong to ask.\"", correct: false, explanationMd: "Treats the follow-up as an accusation instead of input to test - exactly the mistake this chapter names." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q10",
        kind: "single",
        difficulty: 2,
        prompt: "A follow-up exposes a real, small gap with almost no interview time left. What's the more defensible move?",
        options: [
          {
            id: "a",
            label: "Redesign it live in full detail regardless of time.",
            correct: false,
            explanationMd: "Spends minutes the rest of the loop may need, for a gap that's already been named.",
          },
          {
            id: "b",
            label: "Name the fix conceptually - what would change and roughly what it costs - without drawing it live.",
            correct: true,
            explanationMd: "Correct. Proves the same judgment faster when time is short; drawing it live is the better call only when time allows.",
          },
          { id: "c", label: "Deny the gap exists.", correct: false, explanationMd: "The gap is real - naming it honestly is stronger than denying it." },
          { id: "d", label: "Change the subject.", correct: false, explanationMd: "Leaves the follow-up unanswered, which reads worse than a short honest answer." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q11",
        kind: "single",
        difficulty: 3,
        prompt:
          "A candidate names a decision's cost correctly (X/Y/Z), then later gets a follow-up that " +
          "genuinely changes Z. What should happen to X?",
        options: [
          {
            id: "a",
            label: "X must stay unchanged - defending means never changing a decision.",
            correct: false,
            explanationMd: "Defending only holds while Z holds - this scenario says Z changed.",
          },
          {
            id: "b",
            label:
              "X should be reconsidered - if the reason (Z) that justified it no longer holds, the " +
              "honest move is naming what changed and updating the design.",
            correct: true,
            explanationMd:
              "Correct. \"Z hasn't changed, so X still holds\" only works while Z is true - when it " +
              "isn't, the honest opposite applies.",
          },
          { id: "c", label: "X and Z are independent - X never depends on Z.", correct: false, explanationMd: "Z is literally the stated reason for X - they're linked by construction." },
          { id: "d", label: "The whole design should be redrawn from scratch.", correct: false, explanationMd: "Evolves only the piece the changed reason actually touches, not everything." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q12",
        kind: "single",
        difficulty: 3,
        prompt:
          "Dropbox's 2016 move off S3 is used as this chapter's production example. What does it " +
          "actually illustrate?",
        options: [
          {
            id: "a",
            label: "The specific storage architecture Dropbox built.",
            correct: false,
            explanationMd: "This curriculum never explains Dropbox's storage implementation - that's not the point of the example.",
          },
          {
            id: "b",
            label:
              "A trade-off named and defended in public under real skepticism, running the same " +
              "evidence-vs-pressure test this chapter teaches.",
            correct: true,
            explanationMd:
              "Correct. Dropbox treated \"why not stay on S3?\" as real evidence, confirmed the existing " +
              "setup didn't already survive it, and defended the resulting trade-off with numbers.",
          },
          { id: "c", label: "Proof that leaving a cloud provider is always the right move.", correct: false, explanationMd: "Presented as a defensible decision at their specific scale, not a general recommendation - §9 lens 9." },
          { id: "d", label: "An example of caving to outside pressure.", correct: false, explanationMd: "The opposite - they held their ground and explained the reasoning, rather than reversing course." },
        ],
      },
      {
        id: "bb-1-3-defending-the-design-q13",
        kind: "single",
        difficulty: 3,
        prompt:
          "A candidate hears \"what if this needs to work globally?\", immediately says \"you're " +
          "right, let me redo this,\" and erases the whole diagram before checking anything. What " +
          "mistake is this?",
        options: [
          {
            id: "a",
            label: "Refusing to budge - holding a decision that no longer fits.",
            correct: false,
            explanationMd: "The opposite happened here - the candidate changed course immediately, not held firm.",
          },
          {
            id: "b",
            label:
              "Caving immediately - changing the design the moment it's challenged, without checking " +
              "whether the original reasoning still holds.",
            correct: true,
            explanationMd: "Correct. The follow-up test was skipped entirely - no check for new evidence, no check for existing headroom.",
          },
          { id: "c", label: "Vague cost language.", correct: false, explanationMd: "The mistake here isn't about naming a cost - it's about reacting before testing." },
          { id: "d", label: "This is the correct response to any follow-up.", correct: false, explanationMd: "Directly contradicted by the chapter's own follow-up test - most paths don't end in a full redesign." },
        ],
      },
    ],
  },
  {
    id: "bb-1-4-driving-the-interview",
    mode: "building-blocks",
    title: "Driving the Interview",
    // Real authored content (Phase 10 renumber of old 1.11 Driving a System
    // Design Interview - single source chapter, not a multi-chapter
    // condense like new 1.1-1.3, so content carried forward nearly
    // unchanged. Spec: specs/bb-1-4-driving-the-interview.spec.md. Lesson
    // body: public/content/chapters/bb-1-4-driving-the-interview.mdx.
    // §16 puts this in the no-component list. Optional, gates nothing -
    // same as old 1.11.
    problemStatement:
      "No canvas build this chapter - driving a time-bound design conversation needs no new " +
      "component. The knowledge check runs a compact interview walkthrough: preserve the " +
      "requirements-to-design evidence chain, answer a follow-up from that evidence, and close " +
      "with the design's cost and next risk.",
    learningObjectives: [
      "State a useful time budget for a 45-minute interview and explain why requirements, estimates, and a close need protected time.",
      "Classify a follow-up as changed pressure, a trade-off challenge, or a failure/limit question, then return to the relevant prior evidence.",
      "Given a sequenced tiny-brief interview, choose the next move that keeps the design loop intact under the remaining time.",
      "Drive an interview by naming the next reasoning move, correcting a changed assumption openly, and ending with a concise recap.",
      "Explain a time-bound design plan without treating the time budget as a rigid script or a reason to bluff certainty.",
    ],
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.4 of 37 (optional).",
      masteredConcepts: [
        "The complete eight-step Interview Loop (0.4), lived across new 1.1-1.3.",
        "The shared clarify/requirements/estimate test and landmark ratios (new 1.1).",
        "The smallest end-to-end client/app-server/database shape, the ceiling method, and deep-dive targeting (new 1.2).",
        "The trade-off reflex and the follow-up test for evolving or defending a decision (new 1.3).",
      ],
      notYetIntroducedConcepts: [
        "The request's actual browser-to-backend path (2.1) - previewed only in this chapter's Next section.",
        "Specific scaling mechanisms beyond the three primitives - this chapter coordinates the process and does not add a new solution palette.",
        "A live branching stages exercise - the stages UI is not yet implemented, so the walkthrough is quiz-realized and disclosed in the lesson.",
      ],
      simplifications: [
        "The 45-minute allocation is an illustrative budget for protecting the reasoning chain, not a universal interview script; the lesson says to adapt it to the brief.",
        "The quiz presents a linear miniature interview so each decision can receive explanation; real interviews branch, backtrack, and permit more than one defensible time allocation.",
      ],
    },
    // Unchanged from old 1.11: 5 questions, ramp 1/1/2/2/3. Not a condensed
    // chapter (single source, old 1.11 -> new 1.4), so the condensed-chapter
    // quiz exception does not apply - the ordinary 3-6 range still governs,
    // and 5 was already correctly sized. Only ids and old-numbering
    // cross-references in explanations were updated (old "1.1-1.3"/"1.7" ->
    // "the requirements chapter"/"the ceiling method", matching new 1.1/1.2).
    quiz: [
      {
        id: "bb-1-4-driving-the-interview-q1",
        kind: "single",
        difficulty: 1,
        prompt:
          "Two minutes into a 45-minute interview, the brief is 'design a service for sharing photos.' " +
          "What is the strongest next move?",
        options: [
          {
            id: "a",
            label: "Start drawing the upload path so there is a concrete design to discuss.",
            correct: false,
            explanationMd:
              "A concrete path helps only after the product and its pressure are known. Drawing now makes unstated assumptions expensive to unwind.",
          },
          {
            id: "b",
            label: "Ask which user flows matter, what scale matters, and what is explicitly out of scope before choosing the shape.",
            correct: true,
            explanationMd:
              "Correct. This protects the requirements chain from Framing the Problem. A short set of high-leverage questions prevents solving an imagined product.",
          },
          {
            id: "c",
            label: "Estimate global storage capacity to the nearest gigabyte before asking questions.",
            correct: false,
            explanationMd:
              "This is precision theater before there is even a stated traffic or retention assumption. Estimate only when it can change a decision.",
          },
          {
            id: "d",
            label: "Pick the database first, since it is the hardest decision to revise later.",
            correct: false,
            explanationMd:
              "A database choice has no evidence behind it yet. Requirements create the pressure that makes any later choice defensible.",
          },
        ],
      },
      {
        id: "bb-1-4-driving-the-interview-q2",
        kind: "ordering",
        difficulty: 1,
        prompt:
          "You have clarified a tiny brief. Put these next moves in the order that keeps the evidence chain intact.",
        // Full derangement: Ordering renders this authored order before the
        // learner rearranges it.
        options: [
          {
            id: "draw",
            label: "Draw the smallest end-to-end design.",
            correct: true,
            explanationMd: "The diagram answers the requirements once their pressure has been estimated.",
          },
          {
            id: "tradeoff",
            label: "Name the first ceiling and the trade-off it forces.",
            correct: true,
            explanationMd: "A trade-off is justified after a concrete design exposes a pressure point.",
          },
          {
            id: "requirements",
            label: "State the functional requirements, non-functional requirements, and scope boundary.",
            correct: true,
            explanationMd: "Requirements are the evidence the rest of the interview must answer.",
          },
          {
            id: "estimate",
            label: "Estimate the order of magnitude that could change the design.",
            correct: true,
            explanationMd: "Estimation calibrates the requirements before the design commits to a shape.",
          },
        ],
        correctOrder: ["requirements", "estimate", "draw", "tradeoff"],
      },
      {
        id: "bb-1-4-driving-the-interview-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "You stated that reads dominate, then the interviewer clarifies that the product has a write-heavy ingestion flow. What is the strongest response?",
        options: [
          {
            id: "a",
            label: "Name the changed assumption, revisit the affected path, and explain which earlier decision may now change.",
            correct: true,
            explanationMd:
              "Correct. The new fact is evidence, not an accusation. A narrow revision keeps the reasoning chain visible and preserves work that still holds.",
          },
          {
            id: "b",
            label: "Keep the read-heavy design because changing a diagram mid-interview looks uncertain.",
            correct: false,
            explanationMd:
              "This protects appearance over correctness. Revising openly when a requirement changes is the stronger signal.",
          },
          {
            id: "c",
            label: "Discard the entire design and restart from the beginning without explaining the change.",
            correct: false,
            explanationMd:
              "The new evidence may affect one path, not every decision. Starting over also removes the thread the interviewer was evaluating.",
          },
          {
            id: "d",
            label: "Argue that write volume is an implementation detail and continue to the deep dive.",
            correct: false,
            explanationMd:
              "Write volume can be exactly the pressure that determines the correct deep dive. Ignoring it abandons requirement-driven design.",
          },
        ],
      },
      {
        id: "bb-1-4-driving-the-interview-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "At minute 31, the core design is on the board. The interviewer asks, 'what breaks first if traffic doubles?' What should drive your answer?",
        options: [
          {
            id: "a",
            label: "The component that is most familiar to explain in detail.",
            correct: false,
            explanationMd:
              "Familiarity is not evidence. The deep dive belongs where the stated pressure actually lands.",
          },
          {
            id: "b",
            label: "A tour through every component so no part of the diagram is skipped.",
            correct: false,
            explanationMd:
              "Breadth without prioritization spends the remaining time while avoiding the actual question.",
          },
          {
            id: "c",
            label: "A new component added immediately, because more traffic always requires more machinery.",
            correct: false,
            explanationMd:
              "Check the current ceiling first. Adding machinery before identifying the limit is an unmotivated fix.",
          },
          {
            id: "d",
            label: "The lowest ceiling on the hot path, using the stated estimates to explain the symptom and response.",
            correct: true,
            explanationMd:
              "Correct. This is the ceiling method from Designing the System, used under the interview clock: evidence selects the pressure point, then the response earns its trade-off.",
          },
        ],
      },
      {
        id: "bb-1-4-driving-the-interview-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "With three minutes left, your design and main trade-off are clear. Which close best demonstrates control of the interview?",
        options: [
          {
            id: "a",
            label: "Introduce a second, unrelated architecture to show breadth.",
            correct: false,
            explanationMd:
              "A new architecture has no time to earn its assumptions or trade-offs. It obscures the design the room has already evaluated.",
          },
          {
            id: "b",
            label: "Keep deep-diving into implementation details until the interviewer stops you.",
            correct: false,
            explanationMd:
              "Detail without a close can leave the interviewer unsure what design and cost you actually chose.",
          },
          {
            id: "c",
            label: "Recap the requirement that drove the design, the cost accepted, and the next risk you would test with more time.",
            correct: true,
            explanationMd:
              "Correct. This closes the evidence-to-decision loop, demonstrates trade-off ownership, and names the next honest investigation without bluffing completion.",
          },
          {
            id: "d",
            label: "Claim there are no remaining risks because the design handles the stated scale.",
            correct: false,
            explanationMd:
              "A design can meet today's stated pressure and still have a next limit worth naming. Pretending otherwise blocks useful follow-ups.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-2-1-from-browser-to-backend",
    mode: "building-blocks",
    title: "From Browser to Backend",
    // Real authored content (Wave 3, first Part 2 chapter). Spec:
    // specs/bb-2-1-from-browser-to-backend.spec.md. Lesson body:
    // public/content/chapters/bb-2-1-from-browser-to-backend.mdx.
    problemStatement:
      "Every request runs the same three phases in the same order: resolve a name into an " +
      "address, connect and secure a channel, then exchange data over it. This chapter traces one " +
      "request through every stop between a browser and your database, and back, so each Part 3 " +
      "component later lands at an address you already know. No build: the knowledge check is the " +
      "trace itself.",
    // Five objectives. Practical omitted per CURRICULUM.md §5.2's carve-out
    // for pure Concept chapters (same justified exception 0.2/0.3/0.4 used,
    // spec §4): no components introduced, no construction-family exercise.
    learningObjectives: [
      "Knowledge - Name the stops a request passes through from browser to database and back, in order.",
      "Knowledge - State which phases finish before application code runs, and why DNS is not on the request path.",
      "Engineering - Decide where TLS should terminate for a given system, naming what that choice buys and spends.",
      "Interview - Answer \"walk me through what happens when a user loads the page\" as an ordered route rather than a diagram.",
      "Communication - Name which stop of the journey a follow-up question is aimed at, and answer at that stop.",
    ],
    // No components introduced (§16 assigns Part 2 none - every stop on the
    // tour is homed in 3.1-3.5) and no construction-family exercise, so the
    // palette stays empty. The components the lesson and quiz *present* are
    // §14's sanctioned Part 2 guided tour, not palette entries - see spec §6.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-2-1-hint-1",
        body:
          "For an ordering question, ask what each stop needs from the one before it. Nothing can " +
          "connect before there is an address, and nothing can be exchanged before there is a " +
          "channel.",
      },
      {
        id: "bb-2-1-hint-2",
        body:
          "Two of the stops finish before your application code runs at all. Which two, and what " +
          "does that imply about where they can appear on a request path?",
      },
      {
        id: "bb-2-1-hint-3",
        body:
          "When a question turns on an edge kind, re-read what that edge actually carries. Not " +
          "every arrow on a diagram moves the request's own data.",
      },
      {
        id: "bb-2-1-hint-4",
        body:
          "For the TLS question, run 1.3's reflex: name what the choice buys and what it spends, " +
          "then ask which of the five dimensions actually changed.",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-18). Corrected three claims about the
    // curriculum's own shape: "almost every component in Part 3" sits on the
    // client-to-app-server arrow (only Group A does), "Group A is nothing but
    // that segment" (3.2 is Group A and is beside the path by this chapter's
    // own argument), and the stop table's "TCP + TLS handshake: no chapter of
    // its own" (§14 gives it to 3.1 at concept level). Also fixed the QUIC /
    // HTTP-3 conflation, replaced the TLS 1.2-only "third of a second"
    // handshake figure with a per-version 200-300 ms range, glossed
    // "recursive resolver" at first use (§20.1), and bridged 1.2's Client
    // card to the tour's Browser card. See spec §12.
    lessonVersion: 2,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 2: Journey of a Request - Chapter 2.1 of 37.",
      masteredConcepts: [
        "The three-tier shape (client, app server, database) and why no edge skips the app server (1.2).",
        "The five forces (0.2), plus this system's own requirements, latency budget and read:write ratio (1.1).",
        "The trade-off reflex - we chose X, accepting Y, because Z - and the five spend dimensions (1.3).",
        "The eight-step Interview Loop, and that this chapter serves step 4 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Every stop on the tour as a buildable component: firewall (3.1), browser and DNS (3.2), reverse proxy (3.3), load balancer (3.4), API gateway (3.5). Presented here, homed there.",
        "What the user sees when any one of these stops fails - the next chapter walks the same path failure-first (2.2).",
        "How this architecture got this shape in the first place, from one server to tiers (2.3).",
        "Caching as a concept and the CDN as a component (3.14-3.15). DNS answer caching is described as a property of DNS, not taught as the general technique.",
      ],
      simplifications: [
        "Resolution is described as one lookup against a resolver. The real hierarchy of root, TLD and " +
          "authoritative name servers is 3.2's material - stated as a compression in the lesson body, " +
          "not only recorded here.",
        "TLS is described as a handshake that secures the channel. Version and cipher negotiation, " +
          "certificate chains and revocation are all out of scope at this stage, and stated as such " +
          "in the lesson body.",
        "The tour presents components the learner cannot build yet, per CURRICULUM.md §14's Part 2 " +
          "header and §18.2 rule 2. The lesson labels itself a tour explicitly rather than letting " +
          "the forward reference pass silently.",
        "\"The edge\" is used as the collective name for the segment between browser and app server. " +
          "Which components actually occupy it is a per-system decision, named in the lesson rather " +
          "than settled.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3 - the same convention 0.2/0.3/0.4 used
    // (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK.md §3's
    // rough 30/45/25). Q1, Q2, Q3 and Q4 are modeled on QUIZ_FRAMEWORK.md
    // §7's Q1, Q2, Q5 and Q9 respectively - the four bank questions tagged
    // to 2.1. Q5 is original. Correct-position spread across the four
    // lettered questions is c, a, d, b - four distinct positions, and
    // deliberately not opening on "b", which four sibling chapters already
    // use for their own Q1.
    quiz: [
      {
        id: "bb-2-1-from-browser-to-backend-q1",
        kind: "ordering",
        difficulty: 1,
        prompt:
          "A user types your URL and hits enter. Put the stops in the order the request actually " +
          "reaches them, from the first thing that happens to the last.",
        // Full derangement against correctOrder below - Ordering.tsx renders
        // this array in exactly this order with no shuffle, so a
        // naturally-ordered draft would ship pre-solved.
        options: [
          {
            id: "database",
            label: "The database returns the rows",
            correct: true,
            explanationMd:
              "Last of the outbound stops. The database is reached only by the app server, and only " +
              "after every earlier phase has already succeeded.",
          },
          {
            id: "app-server",
            label: "The app server runs the business logic",
            correct: true,
            explanationMd:
              "Your code's first appearance in the journey. Everything before this point happened " +
              "without the application being involved at all.",
          },
          {
            id: "dns",
            label: "DNS resolves the hostname to an IP address",
            correct: true,
            explanationMd:
              "The resolve phase, and the first thing that happens. A URL names a host; the network " +
              "routes only to addresses.",
          },
          {
            id: "edge",
            label: "The edge accepts the request and forwards it inward",
            correct: true,
            explanationMd:
              "The request's first contact with your infrastructure. It arrives over the connection " +
              "opened in the previous step and is routed on from there.",
          },
          {
            id: "tls",
            label: "A TCP connection opens and a TLS handshake completes",
            correct: true,
            explanationMd:
              "The connect phase. It needs an address to connect to, so it cannot precede resolution, " +
              "and no request data moves until it finishes.",
          },
        ],
        correctOrder: ["dns", "tls", "edge", "app-server", "database"],
      },
      {
        id: "bb-2-1-from-browser-to-backend-q2",
        kind: "single",
        difficulty: 1,
        prompt: "In one sentence, what is DNS's job in the journey of a request?",
        options: [
          {
            id: "a",
            label: "It encrypts traffic between the browser and the server.",
            correct: false,
            explanationMd:
              "That is TLS, and it happens in the connect phase after an address already exists. DNS " +
              "carries no encryption responsibility.",
          },
          {
            id: "b",
            label: "It spreads incoming requests across healthy backend instances.",
            correct: false,
            explanationMd:
              "That is a load balancer's job (3.4), and it acts on requests already inside your " +
              "infrastructure. DNS runs before any request has been sent.",
          },
          {
            id: "c",
            label: "It translates a hostname into an address, before any connection is made.",
            correct: true,
            explanationMd:
              "Correct. Resolution is the first phase and it is a precondition for the second - there " +
              "is nothing to open a connection to until it finishes.",
          },
          {
            id: "d",
            label: "It stores recently requested pages so repeat visitors get them faster.",
            correct: false,
            explanationMd:
              "DNS does cache, but it caches name-to-address answers, not page content. Serving content " +
              "from a nearer copy is a CDN's job (3.15).",
          },
        ],
      },
      {
        id: "bb-2-1-from-browser-to-backend-q3",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "This diagram traces a request from the browser through the perimeter to the database. " +
          "The browser-to-DNS edge is drawn as a `control` edge while every other edge is " +
          "`request-flow`. Why?",
        graph: {
          nodes: [
            { id: "b1", componentId: "browser", position: { x: 40, y: 240 }, config: {} },
            { id: "n1", componentId: "dns", position: { x: 40, y: 100 }, config: {} },
            { id: "f1", componentId: "firewall", position: { x: 220, y: 240 }, config: {} },
            { id: "p1", componentId: "reverse-proxy", position: { x: 400, y: 240 }, config: {} },
            { id: "s1", componentId: "app-server", position: { x: 580, y: 240 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 760, y: 240 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "b1", target: "n1", kind: "control" },
            { id: "e2", source: "b1", target: "f1", kind: "request-flow" },
            { id: "e3", source: "f1", target: "p1", kind: "request-flow" },
            { id: "e4", source: "p1", target: "s1", kind: "request-flow" },
            { id: "e5", source: "s1", target: "d1", kind: "request-flow" },
          ],
          entryPointIds: ["b1"],
        },
        options: [
          {
            id: "a",
            label:
              "DNS is consulted before the request path exists, and the request's own data never " +
              "travels through it.",
            correct: true,
            explanationMd:
              "Correct. Resolution runs beside the journey rather than on it. Edge kinds carry meaning, " +
              "and drawing this one as request-flow would claim DNS carries traffic it never sees.",
          },
          {
            id: "b",
            label: "DNS is optional, and control edges mark the parts of a design you can remove.",
            correct: false,
            explanationMd:
              "DNS is not optional here - without it the browser has no address at all. Edge kind " +
              "describes what an edge carries, not how load-bearing the component is.",
          },
          {
            id: "c",
            label: "Control edges are faster, so latency-sensitive lookups are drawn that way.",
            correct: false,
            explanationMd:
              "An edge kind is a semantic label, not a performance setting. Nothing about the drawing " +
              "changes how quickly a lookup returns.",
          },
          {
            id: "d",
            label: "It is a rendering choice to keep the DNS box visually separate from the main row.",
            correct: false,
            explanationMd:
              "The layout follows the edge kind, not the other way around. The kind is chosen first, " +
              "because the validator and every future diagram read it as meaning.",
          },
        ],
      },
      {
        id: "bb-2-1-from-browser-to-backend-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "In the tiered architecture this chapter traced, TLS terminates at the reverse proxy " +
          "rather than at the app server. What is the strongest reason for putting it there?",
        options: [
          {
            id: "a",
            label: "TLS can only terminate at whichever component is first to receive the request.",
            correct: false,
            explanationMd:
              "It can terminate further in, or be re-established on the internal hop. Where it " +
              "terminates is a decision, which is exactly why it has costs on both sides.",
          },
          {
            id: "b",
            label: "Internal traffic is faster when it is unencrypted, and speed is the deciding factor.",
            correct: false,
            explanationMd:
              "There is a real CPU cost to encrypting every internal hop, but it is rarely what decides " +
              "this. The operational argument - one place to hold and renew certificates - carries more " +
              "weight than the cycles.",
          },
          {
            id: "c",
            label: "The database cannot accept encrypted connections, so TLS has to stop before it.",
            correct: false,
            explanationMd:
              "Databases do accept encrypted connections. Nothing downstream forces the termination " +
              "point; the choice is made on operational grounds.",
          },
          {
            id: "d",
            label:
              "Certificates live and get renewed in one place, and every internal hop is readable " +
              "while you debug it.",
            correct: true,
            explanationMd:
              "Correct, and the cost is named alongside it: request bodies travel your internal network " +
              "in the clear. That is only acceptable while the network itself is trustworthy.",
          },
        ],
      },
      {
        id: "bb-2-1-from-browser-to-backend-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Your company moves onto shared infrastructure where other tenants' workloads run on the " +
          "same internal network. A teammate proposes re-encrypting traffic between the reverse " +
          "proxy and the app servers. Using 1.3's trade-off reflex, what is the strongest response?",
        options: [
          {
            id: "a",
            label:
              "Reject it - TLS already terminated at the edge, so the connection is secure and the " +
              "internal hop adds nothing.",
            correct: false,
            explanationMd:
              "Termination at the edge secures the hop from the user to the edge and nothing past it. " +
              "The internal hop is exactly the segment the move onto shared infrastructure just changed.",
          },
          {
            id: "b",
            label:
              "Accept it - the reason edge termination held was a trusted internal network, and that " +
              "reason no longer applies; it buys confidentiality on the internal hop and spends " +
              "certificate management on every instance.",
            correct: true,
            explanationMd:
              "Correct, and it is the full reflex: the follow-up is new evidence, the original " +
              "justification (Z) has changed, so the decision changes with it - and the new cost gets " +
              "named rather than waved through.",
          },
          {
            id: "c",
            label:
              "Reject it - adding encryption inside the perimeter is complexity for its own sake, and " +
              "complexity is one of the five dimensions worth protecting.",
            correct: false,
            explanationMd:
              "Complexity is a real cost, but naming a cost is not the same as weighing it. Here it is " +
              "weighed against a confidentiality requirement that genuinely changed, so the cost is one " +
              "to pay, not one to hide behind.",
          },
          {
            id: "d",
            label:
              "Accept it - encryption everywhere is the correct default, so the original decision was " +
              "a mistake that should be corrected.",
            correct: false,
            explanationMd:
              "Right conclusion, wrong reasoning. The original decision was sound under the conditions " +
              "it was made in; treating it as a mistake skips the part an interviewer is listening for, " +
              "which is what specifically changed.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-2-2-where-can-things-go-wrong",
    mode: "building-blocks",
    title: "Where Can Things Go Wrong?",
    // Real authored content (Wave 3, second Part 2 chapter). Spec:
    // specs/bb-2-2-where-can-things-go-wrong.spec.md. Lesson body:
    // public/content/chapters/bb-2-2-where-can-things-go-wrong.mdx.
    problemStatement:
      "2.1 traced one request through every stop between a browser and your database. This chapter " +
      "breaks that path at each stop in turn and asks the only question that matters to a user: what " +
      "do they actually experience? Errors, hangs, and the failures where the client and the server " +
      "disagree about what happened. No build: the knowledge check is the prediction.",
    // Five objectives. Practical omitted per CURRICULUM.md §5.2's carve-out
    // for pure Concept chapters (the same justified exception 0.2/0.3/0.4 and
    // 2.1 used, spec §4): no components introduced, no construction-family
    // exercise.
    learningObjectives: [
      "Knowledge - Name what a user experiences when each stop on the request path fails, and which of those failures your own monitoring cannot see.",
      "Knowledge - State why a client that times out cannot know whether its request succeeded.",
      "Engineering - Choose a timeout for a given hop, naming what a shorter or longer one buys and spends, and why the budget shrinks inward.",
      "Interview - Answer \"what happens if X fails?\" as a symptom, a blast radius and a detection path rather than a component name.",
      "Communication - Translate a user report of \"the site is down\" into a specific claim about which segment of the path failed, and for whom.",
    ],
    // No components introduced (§16 assigns Part 2 none) and no
    // construction-family exercise, so the palette stays empty. The lesson
    // re-presents 2.1's five tour components; that is §14's sanctioned Part 2
    // guided tour, not a palette entry - see spec §6.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-2-2-hint-1",
        body:
          "For the matching question, ask where each failure sits relative to your own code. A break " +
          "before your code runs and a break inside it do not reach the user as the same thing.",
      },
      {
        id: "bb-2-2-hint-2",
        body:
          "When a question turns on what a user experiences, separate two things: whether any answer " +
          "came back at all, and how long they waited to find that out.",
      },
      {
        id: "bb-2-2-hint-3",
        body:
          "\"Every server is healthy\" rules out some stops, not the whole path. Which stops does your " +
          "monitoring never see traffic from in the first place?",
      },
      {
        id: "bb-2-2-hint-4",
        body:
          "For the timeout question, run 1.3's reflex in both directions: name what a longer wait " +
          "buys, then name who is paying for it and for how long.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 2: Journey of a Request - Chapter 2.2 of 37.",
      masteredConcepts: [
        "The stops a request passes between browser and database, and that resolve and connect finish before application code runs (2.1).",
        "That DNS sits beside the request path rather than on it, drawn as a control edge (2.1).",
        "The three-tier shape and that only the app server reaches the database (1.2).",
        "The trade-off reflex - we chose X, accepting Y, because Z - and that a changed premise reopens a settled decision (1.3).",
        "The eight-step Interview Loop, and that this chapter serves step 6, bottlenecks and failure (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Every remedy for the failures taught here: timeouts with backoff, retry budgets, idempotency, circuit breakers, bulkheads (3.23). Named once as Group G's subject, never taught.",
        "Measuring partial failure honestly - logs, metrics, traces, SLIs and SLOs (3.25). The lesson states that 'what fraction, for which users' is the honest question without teaching how it is answered.",
        "Redundancy, failover and graceful degradation as design techniques rather than as incident decisions (3.26).",
        "Every stop on the path as a buildable component: firewall (3.1), browser and DNS (3.2), reverse proxy (3.3), load balancer (3.4), API gateway (3.5).",
        "How the architecture acquired this many stops in the first place - the scaling-evolution story (2.3).",
      ],
      simplifications: [
        "The error / hang / disagreement taxonomy is this chapter's own teaching frame, not a standard " +
          "term of art. It organizes symptoms by where on the path they originate; nothing downstream " +
          "depends on the names.",
        "The timeout figures (30 s browser, 10 s edge, 2 s database) are illustrative round numbers " +
          "chosen to make the shrink-inward rule visible, not recommended defaults. The lesson presents " +
          "them as an ordering, not as values to copy.",
        "Retry amplification is described only as a multiplication of attempts. Backoff, jitter, retry " +
          "budgets and circuit breakers are 3.23's material and are named as its subject in the lesson " +
          "rather than explained.",
        "Partial failure is taught at the level of 'some users, all functionality' versus 'all users, " +
          "some functionality'. Quantifying it is 3.25's material; the lesson names the honest question " +
          "and stops there.",
        "The lesson re-presents 2.1's five tour components and its browser-to-DNS control edge, per " +
          "CURRICULUM.md §14's Part 2 header and §18.2 rule 2. It labels itself as the same tour walked " +
          "a second time rather than letting the forward reference pass silently.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3 - the convention 0.2/0.3/0.4/2.1 use
    // (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK.md §3's
    // rough 30/45/25). Q2, Q3 and Q4 are modeled on QUIZ_FRAMEWORK.md §7's
    // Q3, Q6 and Q4 - three of the four bank questions tagged to 2.2. Q1 and
    // Q5 are original; bank Q10's insight is carried by the trade-off section
    // and Q1's fourth pair instead (see spec §8). Correct-position spread
    // across the four lettered questions is d, b, a, c - four distinct
    // positions.
    quiz: [
      {
        id: "bb-2-2-where-can-things-go-wrong-q1",
        kind: "matching",
        difficulty: 1,
        prompt:
          "Match each failure to what the user actually experiences. Every server in the system is " +
          "running unless the failure says otherwise.",
        // Option order is a full derangement against pairs below - no pair's
        // correct option sits at that pair's own index, so dropdown position
        // carries no signal.
        options: [
          {
            id: "fast-error",
            label: "A clear error page in well under a second, produced by your own code",
            correct: true,
            explanationMd:
              "The request reached your application and your application answered. This is the cheapest " +
              "failure there is: fast, specific, and nothing is left holding a connection.",
          },
          {
            id: "disagreement",
            label: "An error on the client, and the row is in the database anyway",
            correct: true,
            explanationMd:
              "The work happened and the news did not come back. The two sides now hold different " +
              "beliefs about the same request, and neither can discover it alone.",
          },
          {
            id: "silence",
            label: "Nothing is sent at all, and nothing you monitor registers anything",
            correct: true,
            explanationMd:
              "A failure before the request exists cannot show up in your metrics, because there is no " +
              "request to count. Absence is the only signal, and most dashboards do not watch for it.",
          },
          {
            id: "hang",
            label: "A long wait, then a timeout, with no explanation behind it",
            correct: true,
            explanationMd:
              "Something downstream is alive but not answering. Every hop between the user and the " +
              "fault holds a connection open for the whole wait, and the user learns nothing at the end.",
          },
        ],
        pairs: [
          ["Your DNS provider is having a global outage", "silence"],
          ["The database answers, but every query now takes 60 seconds", "hang"],
          ["The app server is healthy and its database connection is refused", "fast-error"],
          ["The write commits, and the response is lost on the way back", "disagreement"],
        ],
      },
      {
        id: "bb-2-2-where-can-things-go-wrong-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "Your DNS provider is having a global outage. Every server you own is healthy and every " +
          "dashboard is green. A user who has never visited your site before types the URL and hits " +
          "enter. What do they experience?",
        options: [
          {
            id: "a",
            label:
              "A slow page, because the browser retries the lookup several times before it finally " +
              "resolves.",
            correct: false,
            explanationMd:
              "Retrying a lookup that has no answer produces no page to be slow. The failure is total " +
              "for this user, not degraded.",
          },
          {
            id: "b",
            label: "A security warning, because the connection to your server cannot be verified.",
            correct: false,
            explanationMd:
              "A certificate warning requires a connection to have been attempted. Without an address " +
              "there is nothing to connect to, so TLS never begins.",
          },
          {
            id: "c",
            label: "The page loads from the browser's cache, since your content has not changed.",
            correct: false,
            explanationMd:
              "This user has never visited, so nothing is cached for them. Cached DNS answers and " +
              "cached page content are different things, and neither exists here.",
          },
          {
            id: "d",
            label:
              "Complete failure to reach the site. The name never becomes an address, so nothing is " +
              "ever sent.",
            correct: true,
            explanationMd:
              "Correct. Resolution precedes connection, so the first hop fails before any of your " +
              "infrastructure is touched - which is also why none of your monitoring notices.",
          },
        ],
      },
      {
        id: "bb-2-2-where-can-things-go-wrong-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "Users in one country report that the site is down. Your dashboards show every server " +
          "healthy, CPU normal, and an error rate of zero. Which failure class is most likely?",
        options: [
          {
            id: "a",
            label: "A bug in the application code that only triggers for certain request patterns.",
            correct: false,
            explanationMd:
              "Your own code failing produces errors in your own logs. An error rate of exactly zero " +
              "is evidence that those requests are not arriving at all.",
          },
          {
            id: "b",
            label:
              "A path problem between those users and you: routing, a stale or failing DNS answer, or " +
              "a regional edge failure.",
            correct: true,
            explanationMd:
              "Correct. \"Down\" describes a journey, and this journey ends before it reaches anything " +
              "you measure. Geographic scoping is the tell: the users differ, so the path differs.",
          },
          {
            id: "c",
            label: "Data corruption affecting only the rows belonging to those users.",
            correct: false,
            explanationMd:
              "Bad data surfaces as errors or wrong answers from your application, both of which you " +
              "would see. This failure produces absence instead.",
          },
          {
            id: "d",
            label: "Disks filling up on the app servers, which fails requests before they are logged.",
            correct: false,
            explanationMd:
              "A resource problem on your own servers would show in your own metrics and would not " +
              "respect a national border. Nothing about a full disk selects users by country.",
          },
        ],
      },
      {
        id: "bb-2-2-where-can-things-go-wrong-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A user submits a payment. Your app server sends the write to the database, its two-second " +
          "timeout fires, and the client is shown an error. Which statement is true?",
        options: [
          {
            id: "a",
            label:
              "The write may have succeeded or failed. A timeout means no answer arrived, not that the " +
              "work did not happen.",
            correct: true,
            explanationMd:
              "Correct, and it is the fact underneath every \"did my payment go through?\" screen. The " +
              "write may have committed with the response lost on the way back.",
          },
          {
            id: "b",
            label: "The write definitely failed, because the app server never received a confirmation.",
            correct: false,
            explanationMd:
              "Not receiving a confirmation and the work not happening are different claims. Treating " +
              "them as the same thing is how systems double-charge people.",
          },
          {
            id: "c",
            label:
              "The write definitely succeeded, because the database received it before the timeout " +
              "fired.",
            correct: false,
            explanationMd:
              "Receiving a request is not committing it. The database may have been too slow to reach " +
              "the commit, or may have failed after receiving it.",
          },
          {
            id: "d",
            label:
              "Timeouts only create ambiguity on reads. A write either commits or rolls back, so its " +
              "outcome is always knowable.",
            correct: false,
            explanationMd:
              "The database does know the outcome. The client is the one that does not, and the client " +
              "is who has to decide what to do next.",
          },
        ],
      },
      {
        id: "bb-2-2-where-can-things-go-wrong-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "In an interview you have said your app server times out database queries after two " +
          "seconds. The interviewer pushes back: \"Why not thirty? More requests would succeed.\" " +
          "What is the strongest response?",
        options: [
          {
            id: "a",
            label:
              "Two seconds is the standard for database timeouts, and thirty is outside normal " +
              "practice.",
            correct: false,
            explanationMd:
              "An appeal to convention is not a reason. The interviewer is asking what the number buys " +
              "and spends, which is the part a senior answer supplies.",
          },
          {
            id: "b",
            label:
              "Thirty seconds would put far more load on the database, which is already the component " +
              "under pressure.",
            correct: false,
            explanationMd:
              "Waiting longer does not issue more queries. Retries do that; a longer timeout holds " +
              "resources open, which is a real cost but a different one.",
          },
          {
            id: "c",
            label:
              "A few slow requests would succeed, and everything else waits with them: every hop in " +
              "front holds a connection for thirty seconds, the user gets a hang instead of an answer, " +
              "and the ambiguous window is fifteen times longer.",
            correct: true,
            explanationMd:
              "Correct, and it names both sides. The short timeout buys a fast, actionable error and " +
              "spends the requests that were only slow - a trade chosen because a hang tells the user " +
              "nothing they can act on.",
          },
          {
            id: "d",
            label:
              "It would make no practical difference, since the browser gives up after thirty seconds " +
              "anyway.",
            correct: false,
            explanationMd:
              "That is the stacking mistake. With equal budgets the whole chain hangs the full thirty " +
              "seconds and the user gets nothing; the inner timeout has to be the shorter one to " +
              "protect anything.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-2-3-evolution-of-modern-architectures",
    mode: "building-blocks",
    title: "Evolution of Modern Architectures",
    // Real authored content (Wave 3, third and final Part 2 chapter). Spec:
    // specs/bb-2-3-evolution-of-modern-architectures.spec.md. Lesson body:
    // public/content/chapters/bb-2-3-evolution-of-modern-architectures.mdx.
    problemStatement:
      "2.1 mapped the request path and 2.2 broke it. Neither said where the boxes came from. This " +
      "chapter is the same system told in time rather than space: one machine, split tiers, copies " +
      "of the app tier, then the application split into services - and the pressure that forced each " +
      "move. No build: the knowledge check is the sequence and the judgment.",
    // Five objectives. Practical omitted per CURRICULUM.md §5.2's carve-out
    // for pure Concept chapters (the same justified exception 0.2/0.3/0.4,
    // 2.1 and 2.2 used, spec §4): no components introduced, no
    // construction-family exercise.
    learningObjectives: [
      "Knowledge - Name the four shapes a growing system passes through, and the pressure that ends each one.",
      "Knowledge - State why relieving a ceiling moves it rather than removing it, and name where it moves once the app tier is copied.",
      "Engineering - Decide whether a given system should make its next architectural move yet, naming the force that would justify it and the cost it would spend.",
      "Interview - Narrate an architecture at loop step 4 as a sequence of forced moves: the shape today's numbers justify, the first thing that breaks, and the move that follows.",
      "Communication - Justify staying on a simpler shape out loud by naming the limit not yet hit, rather than appealing to simplicity as a preference.",
    ],
    // No components introduced (§16 assigns Part 2 none) and no
    // construction-family exercise, so the palette stays empty. The lesson's
    // four stage diagrams present components the learner has not unlocked;
    // that is §14's sanctioned Part 2 guided tour, not a palette entry - see
    // spec §6.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-2-3-hint-1",
        body:
          "Every shape in this chapter exists because a ceiling was relieved somewhere else. When a " +
          "question asks what happens next, look for the box whose demands were just multiplied.",
      },
      {
        id: "bb-2-3-hint-2",
        body:
          "For the ordering question, ask what each move needs to already exist before it makes any " +
          "sense. Something that spreads requests across copies is meaningless until there are copies.",
      },
      {
        id: "bb-2-3-hint-3",
        body:
          "When a proposal reuses a move that worked before, check what made the original move cheap. " +
          "Machines that remember nothing and machines that remember everything do not copy alike.",
      },
      {
        id: "bb-2-3-hint-4",
        body:
          "For the startup question, run 1.3's reflex on the split itself: name what it buys them this " +
          "quarter, then name who operates the result on a Tuesday night.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Part 2: Journey of a Request - Chapter 2.3 of 37.",
      masteredConcepts: [
        "The ceiling method: every component has one, and the system's ceiling is the lowest number on the path (1.2).",
        "The preempt-or-wait trade-off on a known future ceiling (1.2).",
        "The trade-off reflex - we chose X, accepting Y, because Z - and the five cost dimensions, latency, consistency, complexity, money, operability (1.3).",
        "Scaling up versus scaling out as two priced answers to the same bottleneck, and that a bigger machine has a ceiling of its own (1.3).",
        "The stops on the request path and the edge as a segment several components share (2.1), including 2.1's own statement that the load balancer, gateway and firewall exist because a specific force showed up.",
        "That every added stop is another failure point, and the error / hang / disagreement classes a user experiences (2.2).",
        "Forces as the thing a design answers to (0.2), and the eight-step Interview Loop, this chapter serving step 4 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "How a load balancer actually distributes requests, and health checks (3.4). Named as the router the third shape needs, never explained.",
        "Statelessness as a property, and where displaced session state lives (3.6, 3.7). The lesson states the constraint - nothing a user depends on may live in one instance's memory - without naming or teaching the property.",
        "The economics and mechanics of scaling out (3.8), service discovery (3.9), and the API gateway's policy role (3.5).",
        "Every data-tier move: replication and lag (3.12), sharding (3.13), caching (3.14). Named once each as where the ceiling goes after the app tier is copied, with no mechanism.",
        "Moving work off the request path (3.17), and consistency as a named model with its own vocabulary (3.22).",
        "The patterns for surviving the failure modes each move adds (3.23-3.26).",
      ],
      simplifications: [
        "The four shapes are a teaching spine, not a law. Real systems skip moves, make them in a " +
          "different order, or make half of one; the claim is that each move answers a pressure, not " +
          "that every system walks the same four steps.",
        "The data-tier moves (read copies, a faster layer in front, splitting the data) are named as " +
          "where the ceiling lands after the app tier is copied, and deliberately not taught. Their " +
          "chapters own the mechanism and the consistency cost.",
        "'Monolith' and 'services' are used at the level of the deploy unit only - one unit versus " +
          "several, each owning its data. The finer taxonomy and the failure of the naive version of " +
          "this split are not covered.",
        "'Compute copies for free' means free of coordination, not free of money or operational load; " +
          "the lesson charges both under what the move spends.",
        "The four stage diagrams are Mermaid rather than ScaleCraft graph JSON, because the Reader " +
          "cannot render a graph-JSON topology today (the same narrow exception 1.2's diagrams use). " +
          "Edge labels name the real edge kind so the semantics stay correct.",
        "Both production examples are stated at decision level from public material, with no figures " +
          "the argument depends on.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3 - the convention 0.2/0.3/0.4/2.1/2.2 use
    // (2 level-1, 2 level-2, 1 level-3 of 5 rounds to QUIZ_FRAMEWORK.md §3's
    // rough 30/45/25). Q2 and Q5 are modeled on QUIZ_FRAMEWORK.md §7's Q7 and
    // Q8, the two bank questions tagged to 2.3; Q1, Q3 and Q4 are original and
    // realize §14's "ordering + trade-off" exercise. Correct-position spread
    // across the four lettered questions is a, c, d, b - four distinct
    // positions, and "a" is a fourth distinct opening letter across siblings
    // (0.4/1.3/1.4/3.4 open at b, 2.1 at c, 2.2 at d).
    quiz: [
      {
        id: "bb-2-3-evolution-of-modern-architectures-q1",
        kind: "ordering",
        difficulty: 1,
        prompt:
          "Put the four shapes in the order a growing system reaches them, from the one it starts on " +
          "to the one it reaches last.",
        // Full derangement against correctOrder below - Ordering.tsx renders
        // this array in exactly this order with no shuffle, so a
        // naturally-ordered draft would ship pre-solved.
        options: [
          {
            id: "services",
            label: "The application is split into services, each deployed on its own and owning its data",
            correct: true,
            explanationMd:
              "Last, and the only move usually forced by something other than traffic. It is also the " +
              "hardest to undo, which is why it is not made early.",
          },
          {
            id: "copies",
            label: "Identical copies of the app tier, with something in front spreading requests across them",
            correct: true,
            explanationMd:
              "Third. It needs the tiers already split, because you can only copy the application once " +
              "the data is not sitting on the same machine as it.",
          },
          {
            id: "one-machine",
            label: "One machine running the application and its database together",
            correct: true,
            explanationMd:
              "First, and further from a toy than it looks: no network between the parts, one thing to " +
              "deploy, one thing to watch.",
          },
          {
            id: "tiers",
            label: "The application and the database on separate machines",
            correct: true,
            explanationMd:
              "Second. It buys independent sizing and stops a deploy from endangering the data, at the " +
              "cost of a network hop on every query.",
          },
        ],
        correctOrder: ["one-machine", "tiers", "copies", "services"],
      },
      {
        id: "bb-2-3-evolution-of-modern-architectures-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "Why did architectures evolve toward split tiers and copies of the app tier, rather than " +
          "toward ever-bigger single machines?",
        options: [
          {
            id: "a",
            label:
              "A single machine has a ceiling of its own and is one failure domain. Splitting lets each " +
              "part grow, and fail, on its own.",
            correct: true,
            explanationMd:
              "Correct. Buying a bigger machine is a real move and gets made constantly - it stops " +
              "working because there is a largest machine, and because everything on it shares one fate.",
          },
          {
            id: "b",
            label:
              "Large machines stopped being cost-competitive at any size, so scaling up is no longer a " +
              "serious option.",
            correct: false,
            explanationMd:
              "Scaling up is still the right first answer for many systems, and 1.3 priced it as a real " +
              "branch. What ends it is the ceiling, not the price list.",
          },
          {
            id: "c",
            label:
              "Requests complete faster across several machines than on one, so splitting is a latency " +
              "win.",
            correct: false,
            explanationMd:
              "Backwards. Every split adds a network hop, so it spends latency. What it buys is headroom " +
              "and independent failure, not speed per request.",
          },
          {
            id: "d",
            label:
              "More machines makes a system more available by construction, since there are more of them " +
              "to serve traffic.",
            correct: false,
            explanationMd:
              "More machines is also more things that can break (2.2). Availability comes from removing " +
              "the parts that are fatal alone, and each split adds failure modes of its own.",
          },
        ],
      },
      {
        id: "bb-2-3-evolution-of-modern-architectures-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "Your app tier ran out of headroom, so you put a load balancer in front of four identical " +
          "app-server instances. Traffic keeps growing. Where does the ceiling land next, and why?",
        options: [
          {
            id: "a",
            label:
              "The app tier again, because each added instance costs coordination with the others.",
            correct: false,
            explanationMd:
              "Identical instances coordinate nothing - that is exactly what makes this move cheap. The " +
              "cost landed somewhere else instead.",
          },
          {
            id: "b",
            label:
              "Nowhere for a long time. The shape scales by adding instances, so headroom is now a " +
              "purchasing decision.",
            correct: false,
            explanationMd:
              "It scales the tier you copied, and only that tier. Relieving a ceiling moves it; it never " +
              "removes it.",
          },
          {
            id: "c",
            label:
              "The database. Four instances multiply the demand on the one thing all of them share.",
            correct: true,
            explanationMd:
              "Correct, and it is why the data groups are the longest stretch of Part 3. The moves " +
              "available there spend correctness rather than money, which makes them harder than this one.",
          },
          {
            id: "d",
            label:
              "The load balancer, since every request now passes through a single box in front of the " +
              "instances.",
            correct: false,
            explanationMd:
              "A defensible worry, and worth naming in an interview - but a load balancer's whole job is " +
              "high request volume, and nothing about this move multiplied its work the way it " +
              "multiplied the database's.",
          },
        ],
      },
      {
        id: "bb-2-3-evolution-of-modern-architectures-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Copying the app tier worked, so a teammate proposes fixing the database ceiling the same " +
          "way: run four copies of the database, each accepting reads and writes. What is the " +
          "strongest objection?",
        options: [
          {
            id: "a",
            label: "A database cannot be copied. A system has exactly one, by definition.",
            correct: false,
            explanationMd:
              "Copies of a database are ordinary and have their own chapter (3.12). The problem is not " +
              "whether you can make them, it is what they owe each other afterwards.",
          },
          {
            id: "b",
            label:
              "Four database machines cost considerably more than four app-server machines, so the " +
              "move is not worth it.",
            correct: false,
            explanationMd:
              "Money is real but it is the smaller cost here, and it would be worth paying. The " +
              "objection that actually stops this proposal is about correctness.",
          },
          {
            id: "c",
            label:
              "The load balancer only spreads client requests. It has no way to route traffic to a " +
              "database.",
            correct: false,
            explanationMd:
              "A routing detail, not the objection. Even with routing solved, the four copies would " +
              "still have the problem the correct answer names.",
          },
          {
            id: "d",
            label:
              "The copies hold state and would have to agree. Two writes landing on different copies " +
              "leave the system with two versions of the truth.",
            correct: true,
            explanationMd:
              "Correct, and it is the asymmetry the whole chapter turns on. App servers copy freely " +
              "because they remember nothing; keeping copies of data in agreement costs either latency " +
              "or correctness, which is 3.12's subject.",
          },
        ],
      },
      {
        id: "bb-2-3-evolution-of-modern-architectures-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "A two-person startup with no users yet asks whether to launch as services rather than one " +
          "application, \"because that is what Netflix does.\" What is the strongest response?",
        options: [
          {
            id: "a",
            label:
              "Launch split. Splitting later is a far more expensive migration than starting that way.",
            correct: false,
            explanationMd:
              "A real argument, and it loses on the numbers: it spends operational load every day, " +
              "starting now, against a migration that only happens if the product succeeds enough to " +
              "need it.",
          },
          {
            id: "b",
            label:
              "Launch as one application. None of the forces that split an application are present at " +
              "two people, and one unit is operable by two people. Split when a force actually arrives.",
            correct: true,
            explanationMd:
              "Correct. Netflix's shape is an answer to Netflix's constraints; borrowing the answer " +
              "without the question buys nothing and spends complexity, operability and a network in the " +
              "middle of your own code.",
          },
          {
            id: "c",
            label:
              "Launch split, because one application cannot grow past a single machine and they would " +
              "hit that wall immediately.",
            correct: false,
            explanationMd:
              "One application runs on as many machines as you like - that is the third shape, copies of " +
              "the app tier, and it is still one deploy unit. Splitting the unit is a different move.",
          },
          {
            id: "d",
            label:
              "Launch as one application, because splitting an application is the wrong call at any " +
              "size: it only ever adds failure modes.",
            correct: false,
            explanationMd:
              "The right conclusion from the wrong rule. The split is correct when the forces show up, " +
              "which is why Amazon made it - the argument is about this team today, not about services " +
              "in general.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-3-1-networking-fundamentals",
    mode: "building-blocks",
    title: "Networking Fundamentals",
    // Real authored content (Wave 3, first Group A chapter). Spec:
    // specs/bb-3-1-networking-fundamentals.spec.md. Lesson body:
    // public/content/chapters/bb-3-1-networking-fundamentals.mdx. First
    // Group A chapter authored, so its real curriculum-order prerequisite
    // (2.3) is already shipped - no pulled-forward exception needed
    // (manifest.ts's prerequisiteSlugs already points at
    // "2-3-evolution-of-modern-architectures").
    problemStatement:
      "The starter graph is the client, app server, and database you've built before - nothing sits " +
      "between the client and the app server yet. Run Validate to see what's missing and why an " +
      "unfiltered gap there is a problem.",
    exerciseGoal:
      "Requests reach the app tier straight from the client, with nothing checking them at the " +
      "door first.",
    successCriteria: [
      "Something now sits between the client and the app server, actively filtering rather than " +
        "passing everything through.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented (Building Block, so Practical is not exempt). Category
    // tags live in the spec §2.
    learningObjectives: [
      "State what a firewall's defaultPolicy decides and why an allow-all policy filters nothing.",
      "Distinguish TCP from UDP at the concept level and state why most request-response traffic needs TCP's delivery guarantees.",
      "Decide between default-deny and default-allow for a perimeter and name the real cost either way.",
      "Add a Firewall to a starter graph between the client and the app tier, configure a real filtering policy, and pass Submit.",
      "State, in an interview, what a firewall is and is not protecting against, in under a minute.",
      "Explain why a permissive firewall is a configuration bug rather than a topology bug, and what that implies about validating configuration alongside structure.",
    ],
    // Cumulative palette: 1.2's three components plus this chapter's own
    // (§16's audit row for 3.1 is `firewall`). Required equals available -
    // every component has a specific job in the one blueprint, matching
    // 1.6/3.4's own "no optional piece" precedent. Nothing from 3.2-3.5
    // leaks in even as scenery.
    availableComponentIds: ["client", "firewall", "app-server", "sql-database"],
    requiredComponentIds: ["client", "firewall", "app-server", "sql-database"],
    // permissive-firewall is the namesake rule (fires when a Firewall's
    // defaultPolicy is "allow-all" - see the starter graph and blueprint
    // config predicate below). no-direct-client-database and
    // component-relations guard against a learner mis-wiring the fix (e.g.
    // routing the client straight to the app server, skipping the firewall
    // entirely, or straight to the database). orphan-component,
    // missing-input-connection and request-flow-cycle are the same
    // structural set every prior Building Block chapter curated, for graph
    // coherence rather than untaught content.
    validationRuleIds: [
      "permissive-firewall",
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-1-blueprint",
        label: "Client through a real firewall to the app tier",
        require: {
          id: "bb-3-1-blueprint",
          nodes: [
            { alias: "client", componentId: "client" },
            // The config predicate is what makes this a real config gate,
            // not just a topology check - a Firewall left at "allow-all"
            // can't bind this alias, so the blueprint (and Submit) fails
            // even though the node and its wiring are otherwise correct.
            // See spec §8 for why this chapter gates config on Submit where
            // 3.4's algorithm choice deliberately didn't (there, both
            // options were defensible; here, one is a real bug).
            { alias: "fw", componentId: "firewall", config: [{ field: "defaultPolicy", op: "neq", value: "allow-all" }] },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "client", to: "fw", kind: "request-flow" },
            { from: "fw", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "The firewall sits between the client and everything else, filtering on address, port and " +
          "protocol before any of it is reachable. It doesn't replace the app server's own job of " +
          "mediating database access - it's a second, earlier gate, not a substitute for the first one.",
      },
    ],
    hints: [
      {
        id: "bb-3-1-hint-1",
        body:
          "Validate names what's connected and what isn't. Right now the client reaches the app server " +
          "with nothing in between deciding whether it should.",
      },
      {
        id: "bb-3-1-hint-2",
        body:
          "Add a Firewall node from the picker (`/` or right-click) and wire it between the Client and " +
          "the Application Server - client to firewall, firewall to app server.",
      },
      {
        id: "bb-3-1-hint-3",
        body:
          "Open the Firewall's config panel and check `defaultPolicy`. One of the three options filters " +
          "nothing at all - it's the one this chapter's own rule is named for.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure - Chapter 3.1 of 37.",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The three-tier shape - client, app server, sql database - and why the app server mediates all database access (1.2).",
        "The trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The request's stops (browser, DNS, the edge, app server, database), the edge as a segment several components share, and that firewall/reverse-proxy/load-balancer/API-gateway 'exist because a specific force showed up' rather than by default (2.1).",
        "The TCP-then-TLS connect phase and its round-trip cost, and that where TLS terminates is a real trade-off - this chapter doesn't re-teach either, only what the handshake buys conceptually (2.1).",
        "That every added stop is another failure point, and the error/hang/disagreement classes a user experiences (2.2).",
        "The four architecture shapes and that Group A's pressure is 'traffic has to be resolved, admitted and routed before your code sees it' (2.3).",
      ],
      notYetIntroducedConcepts: [
        "DNS and the resolve phase that precedes the connect phase (3.2) - named as 'before any of this' in the transition brief, not explained.",
        "The reverse proxy's single-front-door pattern, and where TLS termination actually happens as an architectural decision - 2.1 already taught that trade-off; this chapter only teaches what a handshake buys, not where it should end (3.3).",
        "The load balancer and API gateway, and the full reverse-proxy/load-balancer/gateway disambiguation (3.4, 3.5).",
        "Everything past Group A - statelessness, data-tier scaling, caching, and so on.",
      ],
      simplifications: [
        "A firewall here filters on source address, destination port and protocol only - real perimeter " +
          "products (NAT, stateful connection tracking, deep packet inspection) go further; none of that " +
          "changes the default-deny decision this chapter teaches.",
        "TCP vs. UDP is taught at the concept level (guarantees vs. none) to motivate why most " +
          "request-response traffic picks TCP - congestion control, retransmission timers and the rest " +
          "of the transport layer's internals are out of scope.",
        "TLS is covered only for what the handshake buys (encryption, server identity) - termination " +
          "location was already taught as a trade-off in 2.1 and is not re-taught here.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q1 and Q2 are modeled on
    // QUIZ_FRAMEWORK.md §8's own Q1 and Q2 (the bank's published examples
    // for this exact chapter) - reworded rather than reproduced, matching
    // every other chapter's practice. Q3-Q5 are original, covering TCP vs.
    // UDP, the TLS handshake at concept level, and the defense-in-depth
    // judgment "Common mistakes" sets up. Position-clustering checked by
    // eye: correct options sit at b, c, a, d, b - all four positions used,
    // "b" the only repeat (twice of five), no clustering.
    quiz: [
      {
        id: "bb-3-1-networking-fundamentals-q1",
        kind: "single",
        difficulty: 1,
        prompt: "A firewall's architectural job, stated precisely, is to:",
        options: [
          {
            id: "a",
            label: "Encrypt traffic between the client and whatever is behind it.",
            correct: false,
            explanationMd: "Encryption is TLS's job, a different layer entirely - a firewall can filter traffic without ever touching what's inside it.",
          },
          {
            id: "b",
            label: "Decide which traffic is even allowed to approach what's behind it, based on address, port and protocol.",
            correct: true,
            explanationMd:
              "Correct. A firewall never asks who you are or what you want - only whether this source, " +
              "port and protocol combination is on the allowed list at all.",
          },
          {
            id: "c",
            label: "Distribute incoming requests across multiple backend instances.",
            correct: false,
            explanationMd: "That's a load balancer's job (3.4) - a firewall doesn't route or distribute anything, it only admits or drops.",
          },
          {
            id: "d",
            label: "Authenticate the user making the request.",
            correct: false,
            explanationMd: "Authentication checks who's asking; a firewall never gets that far - it operates before identity is anyone's business.",
          },
        ],
      },
      {
        id: "bb-3-1-networking-fundamentals-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A teammate sets a new Firewall's defaultPolicy to allow-all, reasoning \"we can lock it down " +
          "later, this way nothing breaks while we're still building.\" What will Validate's explanation say?",
        options: [
          {
            id: "a",
            label: "Nothing - allow-all is the safest starting policy for a system still under construction.",
            correct: false,
            explanationMd: "The opposite is true - allow-all is the one policy that filters nothing, regardless of how early the system is.",
          },
          {
            id: "b",
            label: "The firewall needs to be replaced with an API gateway.",
            correct: false,
            explanationMd: "A different component with a different job (3.5) - swapping components doesn't fix a config value.",
          },
          {
            id: "c",
            label: "The firewall's default policy allows everything through, so it isn't restricting traffic at all.",
            correct: true,
            explanationMd:
              "Correct - this is permissive-firewall firing. The firewall is present on the diagram and " +
              "doing nothing, which is worse than looking undefended, because it looks defended.",
          },
          {
            id: "d",
            label: "Firewalls can only be configured after the app server is deployed.",
            correct: false,
            explanationMd: "Not a real constraint - a firewall's policy is just a config field, set whenever the node exists.",
          },
        ],
      },
      {
        id: "bb-3-1-networking-fundamentals-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate proposes UDP for a normal checkout API \"because it's faster - no handshake.\" " +
          "What's the strongest objection?",
        options: [
          {
            id: "a",
            label: "UDP guarantees neither delivery nor ordering, so the application would have to rebuild retries and ordering itself for traffic that can't afford to silently drop a request.",
            correct: true,
            explanationMd:
              "Correct. UDP is genuinely faster to start, but a checkout request that vanishes silently " +
              "is a worse failure than the one handshake TCP spends to guarantee it arrives.",
          },
          {
            id: "b",
            label: "UDP isn't supported by firewalls, so it can't be filtered at the perimeter.",
            correct: false,
            explanationMd: "A firewall filters by protocol among other fields - UDP is filterable exactly like TCP, this isn't the real objection.",
          },
          {
            id: "c",
            label: "UDP can't be encrypted, so it's a security risk regardless of the API.",
            correct: false,
            explanationMd: "TLS-like encryption over UDP exists (e.g. QUIC, which 2.1 named) - the real objection is the missing delivery guarantee, not encryption.",
          },
          {
            id: "d",
            label: "UDP and TCP cost the same round trips, so there's no real trade-off either way.",
            correct: false,
            explanationMd: "There is a real trade-off - TCP's handshake costs a round trip UDP skips; the question is whether what that round trip buys is worth it here.",
          },
        ],
      },
      {
        id: "bb-3-1-networking-fundamentals-q4",
        kind: "single",
        difficulty: 2,
        prompt: "At the point a TLS handshake completes, what has it actually bought, at concept level?",
        options: [
          {
            id: "a",
            label: "A faster connection for every request that follows, since TLS compresses traffic.",
            correct: false,
            explanationMd: "TLS doesn't compress or speed up traffic - if anything it costs a round trip up front. Its job is encryption and identity, not speed.",
          },
          {
            id: "b",
            label: "Confirmation that the app server's business logic is free of bugs.",
            correct: false,
            explanationMd: "TLS operates on the channel, not the application behind it - it says nothing about what the app server does with a request once it arrives.",
          },
          {
            id: "c",
            label: "A replacement for the firewall, since the channel is now secure.",
            correct: false,
            explanationMd: "TLS secures what's inside the channel; a firewall decides whether traffic reaches the channel at all - different layers, and neither substitutes for the other.",
          },
          {
            id: "d",
            label: "An encrypted channel, and proof the server is who it claims to be.",
            correct: true,
            explanationMd: "Correct - both are what the handshake buys. 2.1 already priced what it costs; this is what that cost pays for.",
          },
        ],
      },
      {
        id: "bb-3-1-networking-fundamentals-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Your firewall default-denies everything except the app tier's port. A teammate argues this " +
          "makes every later gate (a reverse proxy, an API gateway) redundant, since \"nothing gets in " +
          "that isn't already allowed.\" What's the strongest response?",
        options: [
          {
            id: "a",
            label: "Agreed - once the perimeter default-denies, nothing behind it needs its own admission logic.",
            correct: false,
            explanationMd: "This is the defense-in-depth mistake the chapter's own \"Common mistakes\" names - a single working layer isn't a reason to assume no other layer is needed.",
          },
          {
            id: "b",
            label: "A firewall filters on address, port and protocol only - it can't see whether a specific admitted request is well-formed, authenticated, or abusive, which is a different layer's job.",
            correct: true,
            explanationMd:
              "Correct. Being on the allowed port and protocol says nothing about whether one particular " +
              "request behind that door should be trusted - that's exactly the gap later components fill.",
          },
          {
            id: "c",
            label: "The firewall should be removed instead, since it's slower than the components behind it.",
            correct: false,
            explanationMd: "Speed isn't the issue in question, and removing the perimeter check would reopen the cold open's exact failure - this doesn't answer the teammate's claim.",
          },
          {
            id: "d",
            label: "Firewalls already terminate TLS, so they duplicate what a reverse proxy does.",
            correct: false,
            explanationMd: "Not what this firewall does - it filters by address, port and protocol beneath the encrypted channel, and doesn't terminate TLS.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: the client and app server are
    // both correctly wired to each other and to the database, and nothing
    // here is a wiring mistake - the fault is purely the missing perimeter
    // (matches 1.6/3.4's "fix ships symptoms, never find-the-bug-blind"
    // precedent, adapted for a Completion rather than a Fix exercise).
    starterGraph: {
      nodes: [
        { id: "bb-3-1-client", componentId: "client", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-1-app", componentId: "app-server", position: { x: 380, y: 160 }, config: {} },
        { id: "bb-3-1-db", componentId: "sql-database", position: { x: 700, y: 160 }, config: {} },
      ],
      edges: [
        { id: "bb-3-1-e1", source: "bb-3-1-client", target: "bb-3-1-app", kind: "request-flow" },
        { id: "bb-3-1-e2", source: "bb-3-1-app", target: "bb-3-1-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-1-client"],
    },
    starterDecorators: [
      { kind: "zone", id: "bb-3-1-zone-client", label: "Client", position: { x: 32, y: 112 }, width: 256, height: 137, color: "#3b82f6" },
      { kind: "zone", id: "bb-3-1-zone-app", label: "Application", position: { x: 352, y: 112 }, width: 256, height: 137, color: "#a855f7" },
      { kind: "zone", id: "bb-3-1-zone-data", label: "Data", position: { x: 672, y: 112 }, width: 256, height: 137, color: "#10b981" },
      { kind: "zone", id: "bb-3-1-zone-gap", label: "Build here", position: { x: 32, y: 272 }, width: 256, height: 137, color: "#ff3483" },
    ],
  },
  {
    id: "bb-3-2-dns",
    mode: "building-blocks",
    title: "DNS",
    // Real authored content (Wave 3, second Group A chapter). Spec:
    // specs/bb-3-2-dns.spec.md. Lesson body:
    // public/content/chapters/bb-3-2-dns.mdx. Real curriculum-order
    // prerequisite (3.1) is already shipped in this same working tree - no
    // pulled-forward exception needed (manifest.ts's prerequisiteSlugs
    // already points at "3-1-networking-fundamentals").
    problemStatement:
      "The starter graph has the firewall, app server, and database from 3.1, already wired to each " +
      "other - nothing feeds into the firewall yet. Run Validate to see what's missing before you " +
      "fix it.",
    exerciseGoal:
      "Nothing sits in front of the firewall - there's no entry point, and no way to turn a " +
      "human-readable address into something the network can route to.",
    successCriteria: [
      "Something now feeds a request into the firewall from outside the system.",
      "The address lookup happens before the request reaches the app tier, not after.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented (Building Block, so Practical is not exempt). Category
    // tags live in the spec §2.
    learningObjectives: [
      "State what a DNS resolver returns and why that lookup happens before, not during, the request.",
      "Explain what a TTL controls and why a DNS change is a gradual cutover, not an instant one.",
      "Choose a TTL length for a stated scenario (a planned migration vs. stable production) and justify the trade-off both ways.",
      "Add a Browser and a DNS node to a starter graph, wire the lookup before the request path, and pass Submit.",
      "State, in under a minute, what a DNS failure looks like when every server is healthy, and why.",
      "Explain why DNS counts as a routing decision at scale, not just a lookup, and name the real cost of over-shortening its TTL.",
    ],
    // Cumulative palette: this chapter's own two new components (§16's
    // audit row for 3.2) plus 3.1's firewall/app-server/sql-database chain.
    // `client` deliberately excluded - Browser is the specific entry point
    // this chapter's exercise needs, and required equals available,
    // matching 1.6/3.4/3.1's own "no optional piece" precedent.
    availableComponentIds: ["browser", "dns", "firewall", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "app-server", "sql-database"],
    // No new namesake rule this chapter (§14's row names no new rule for
    // 3.2, and none of the existing rules teach anything DNS-specific -
    // verified against src/validation-engine/rules/index.ts). The curated
    // set is the same structural guard 3.1 used, minus permissive-firewall
    // (that rule is 3.1's own content, not this chapter's - the firewall
    // node here is inherited, already correctly configured, and not what
    // this exercise teaches).
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-2-blueprint",
        label: "Browser resolves an address, then the request path from 3.1 carries it",
        require: {
          id: "bb-3-2-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "The lookup happens before the request, not instead of it - DNS hands back an address, then " +
          "the same request path 3.1 built carries the traffic the rest of the way.",
      },
    ],
    hints: [
      {
        id: "bb-3-2-hint-1",
        body:
          "Validate is telling you the firewall has nothing feeding into it yet. Something has to " +
          "resolve an address and send the first request before the firewall ever sees traffic.",
      },
      {
        id: "bb-3-2-hint-2",
        body:
          "Add a Browser node and a DNS node from the picker (`/` or right-click). Wire Browser to DNS " +
          "first, then DNS to the Firewall.",
      },
      {
        id: "bb-3-2-hint-3",
        body:
          "Both new edges carry real traffic through the chain - request-flow, the same kind you've " +
          "used since 1.2.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure - Chapter 3.2 of 37.",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The three-tier shape - client, app server, sql database (1.2).",
        "The trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The request's stops including DNS (named, not yet taught), the edge as a shared segment, and the `control` edge kind - this chapter's own lookup was drawn that way in 2.1's presented diagram (2.1).",
        "The TCP-then-TLS connect phase and its round-trip cost, and that DNS answers are cached with a TTL so a change is never instant - both taught in 2.1's own compressed form; this chapter is explicitly what 2.1 named as the first of two compressed details it would 'open up' (2.1).",
        "The error/hang/disagreement failure classes a user experiences, including that a DNS outage means complete, immediate failure - referenced, not re-taught (2.2).",
        "The four architecture shapes and that Group A's pressure is 'traffic has to be resolved, admitted and routed before your code sees it' (2.3).",
        "The trust perimeter, a firewall's defaultPolicy, TCP vs. UDP at concept level, and what a TLS handshake buys (3.1).",
      ],
      notYetIntroducedConcepts: [
        "The reverse proxy's single-front-door pattern (3.3) - named as 'the request DNS just pointed you to' in the transition tease, not explained.",
        "The load balancer, API gateway, and the full reverse-proxy/load-balancer/gateway disambiguation (3.4, 3.5).",
        "Real caching as a formal pattern (cache-aside, hit/miss) - TTL is this chapter's advance organizer for it, not the thing itself (3.14).",
        "CDN mechanics in full - this chapter only teaches that DNS is what steers one (3.15).",
      ],
      simplifications: [
        "The resolver hierarchy is presented as a clean three-hop walk (root, then TLD, then " +
          "authoritative) for one name. Real resolvers also handle multiple records per name, negative " +
          "caching, and query redundant servers at each level - none of that changes the TTL trade-off " +
          "or the failure reasoning this chapter teaches.",
        "The buildable exercise wires DNS inline (browser -> dns -> firewall) so the canvas can " +
          "validate it. The `dns` component's registry contract only accepts request-flow edges today, " +
          "not the control edge 2.1 taught for this exact lookup - conceptually the resolution and the " +
          "request stay two separate exchanges, as the lesson's diagram caption states, but that " +
          "distinction isn't enforced on canvas yet.",
        "DNS-based routing is presented as TTL-bounded name changes only - real systems combine it " +
          "with health checks, weighted/latency-based records, and anycast, out of scope at this stage.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q1, Q2, Q3, Q5 are single-kind; Q4 is
    // ordering, realizing CURRICULUM §14's "trace (what happens when you
    // type a URL)" exercise as a DNS-resolution-specific trace rather than
    // repeating 2.1's own URL-to-response ordering question (2.1's Q1
    // already covers the macro journey; this one goes one level into
    // resolution itself, mirroring the lesson's own "Finding an answer
    // nobody has cached" section). Q2 tests the resolver hierarchy this
    // chapter opens up beyond 2.1's compressed mention - deliberately not a
    // second propagation-lag question, since 2.1 already stated that fact
    // in prose (Q3 owns the TTL-cost judgment instead). Q3 is modeled on
    // QUIZ_FRAMEWORK.md §8's own Q3 (the bank's published TTL-propagation
    // example, explicitly earmarked "advance organizer for 3.14 (3.2)"),
    // reworded rather than copied. Position-clustering checked by eye:
    // correct options (single-kind only) sit at c, a, d, b - all four
    // positions used, zero repeats.
    quiz: [
      {
        id: "bb-3-2-dns-q1",
        kind: "single",
        difficulty: 1,
        prompt: "DNS's actual output, precisely, is:",
        options: [
          {
            id: "a",
            label: "A faster connection to the app server, since resolution warms up the network path.",
            correct: false,
            explanationMd: "Resolution doesn't touch the connection at all - it happens before one exists, and buys no speed on the connection that follows.",
          },
          {
            id: "b",
            label: "The rendered contents of the page the user requested.",
            correct: false,
            explanationMd: "DNS never sees the request itself, only the name - the app server and database are what produce a response.",
          },
          {
            id: "c",
            label: "The address to send the request to, resolved before any connection starts.",
            correct: true,
            explanationMd: "Correct. DNS's entire job is a name-to-address translation - nothing about the request itself is involved.",
          },
          {
            id: "d",
            label: "A decision about which of several healthy backends should handle the request.",
            correct: false,
            explanationMd: "That's a load balancer's job (3.4) - DNS returns one answer per lookup, it doesn't distribute traffic across instances.",
          },
        ],
      },
      {
        id: "bb-3-2-dns-q2",
        kind: "single",
        difficulty: 1,
        prompt: "A resolver has no cached answer for a name. What does it actually do to find one?",
        options: [
          {
            id: "a",
            label:
              "Walks a short chain: asks who's authoritative for the top-level suffix, then who's " +
              "authoritative for the exact domain, then asks that server directly.",
            correct: true,
            explanationMd:
              "Correct. A cold lookup is a few hops, not a broadcast or a guess - and it only happens " +
              "once per TTL window, which is why 2.1 could call resolution \"usually free.\"",
          },
          {
            id: "b",
            label: "Sends one broadcast query and uses whichever server responds first.",
            correct: false,
            explanationMd: "DNS resolution is a directed chain of specific lookups, not a broadcast race against unknown responders.",
          },
          {
            id: "c",
            label: "Waits for the browser itself to supply the address.",
            correct: false,
            explanationMd: "The browser is the one asking - it has no address to supply, that's the entire reason the lookup exists.",
          },
          {
            id: "d",
            label: "Guesses based on similar domain names it has already cached.",
            correct: false,
            explanationMd: "A resolver never infers an answer from unrelated names - every domain resolves through its own chain.",
          },
        ],
      },
      {
        id: "bb-3-2-dns-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A team sets every DNS record's TTL to one second, reasoning \"lower is always safer.\" " +
          "What's the real cost?",
        options: [
          {
            id: "a",
            label: "Nothing - a lower TTL has no downside.",
            correct: false,
            explanationMd: "TTL is a genuine trade-off, not a free dial - a very low value has a real, ongoing cost.",
          },
          {
            id: "b",
            label: "DNS refuses TTLs that low, so the setting is silently ignored.",
            correct: false,
            explanationMd: "Not a real constraint - ttlSeconds accepts values from 0 up; nothing rejects a short one.",
          },
          {
            id: "c",
            label: "Short TTLs break the TLS handshake running over the connection that follows.",
            correct: false,
            explanationMd: "TTL governs the DNS answer's cache lifetime, a separate concern from what 3.1 taught about what a TLS handshake buys - the two don't interact.",
          },
          {
            id: "d",
            label:
              "Resolvers can't cache the answer meaningfully, so nearly every request pays a full " +
              "lookup - a constant tax for a benefit (fast failover) used rarely.",
            correct: true,
            explanationMd:
              "Correct. A one-second TTL means almost nothing gets cached - the fast-failover benefit " +
              "is real but rare, while the lookup tax is paid on nearly every request, always.",
          },
        ],
      },
      {
        id: "bb-3-2-dns-q4",
        kind: "ordering",
        difficulty: 2,
        prompt: "Order what happens during DNS resolution, from the moment a name is looked up.",
        options: [
          {
            id: "step-cache",
            label: "The resolver checks its own cache for that name.",
            correct: true,
            explanationMd: "Third: only after the browser's own cache misses does the lookup reach a resolver, whose own cache is checked next.",
          },
          {
            id: "step-browser",
            label: "The browser checks whether it already has a cached answer for this name.",
            correct: true,
            explanationMd: "First: the cheapest possible answer is one already on hand, so the browser's own cache is checked before anything leaves the machine.",
          },
          {
            id: "step-return",
            label: "The answer returns to the browser and gets cached for its TTL.",
            correct: true,
            explanationMd: "Last: once an address is found, it comes back and gets cached - the point at which this specific lookup ends.",
          },
          {
            id: "step-resolver",
            label: "On a miss, the lookup goes to a resolver.",
            correct: true,
            explanationMd: "Second: a miss on the browser's own cache is what sends the lookup out to a resolver in the first place.",
          },
          {
            id: "step-authoritative",
            label: "On a miss, the resolver queries an authoritative server for the name.",
            correct: true,
            explanationMd: "Fourth: only once the resolver's own cache also misses does it go ask an authoritative source directly.",
          },
        ],
        correctOrder: ["step-browser", "step-resolver", "step-cache", "step-authoritative", "step-return"],
      },
      {
        id: "bb-3-2-dns-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Dashboards show every server healthy, but users in one region report the site completely " +
          "unreachable - not slow, an instant failure with nothing loading. Strongest first hypothesis?",
        options: [
          {
            id: "a",
            label: "The database in that region is corrupted.",
            correct: false,
            explanationMd: "A database problem would show up in your own dashboards - this failure is invisible to infrastructure that's never being reached.",
          },
          {
            id: "b",
            label:
              "A path problem before your infrastructure is ever reached - most likely DNS resolution " +
              "failing for that region's resolvers.",
            correct: true,
            explanationMd:
              "Correct. Instant, total failure with healthy dashboards is 2.2's own signature for a " +
              "problem upstream of your servers - and DNS failing means the name never became an " +
              "address, so nothing you operate was ever touched.",
          },
          {
            id: "c",
            label: "A bug shipped in the last deploy.",
            correct: false,
            explanationMd: "A code bug would still let requests arrive and fail there - this failure never reaches a server at all, healthy or not.",
          },
          {
            id: "d",
            label: "The disk is full on every app server in that region.",
            correct: false,
            explanationMd: "That would show as errors on requests that did arrive, and dashboards report every server healthy - the failure is earlier than that.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: the firewall, app server, and
    // database (3.1's own blueprint minus its client node) are correctly
    // wired to each other, and nothing here is a wiring mistake - the fault
    // is purely the missing front two nodes (matches 1.6/3.1's "fix ships
    // symptoms, never find-the-bug-blind" precedent, adapted for a
    // Completion exercise).
    starterGraph: {
      nodes: [
        { id: "bb-3-2-fw", componentId: "firewall", position: { x: 60, y: 160 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-2-app", componentId: "app-server", position: { x: 380, y: 160 }, config: {} },
        { id: "bb-3-2-db", componentId: "sql-database", position: { x: 700, y: 160 }, config: {} },
      ],
      edges: [
        { id: "bb-3-2-e1", source: "bb-3-2-fw", target: "bb-3-2-app", kind: "request-flow" },
        { id: "bb-3-2-e2", source: "bb-3-2-app", target: "bb-3-2-db", kind: "request-flow" },
      ],
      entryPointIds: [],
    },
    starterDecorators: [
      { kind: "zone", id: "bb-3-2-zone-edge", label: "Edge", position: { x: 32, y: 112 }, width: 256, height: 137, color: "#3b82f6" },
      { kind: "zone", id: "bb-3-2-zone-app", label: "Application", position: { x: 352, y: 112 }, width: 256, height: 137, color: "#a855f7" },
      { kind: "zone", id: "bb-3-2-zone-data", label: "Data", position: { x: 672, y: 112 }, width: 256, height: 137, color: "#10b981" },
      { kind: "zone", id: "bb-3-2-zone-gap", label: "Build here", position: { x: 32, y: -48 }, width: 576, height: 137, color: "#ff3483" },
    ],
  },
  {
    id: "bb-3-3-reverse-proxy",
    mode: "building-blocks",
    title: "Reverse Proxy",
    // Real authored content (Wave 3, third Group A chapter). Spec:
    // specs/bb-3-3-reverse-proxy.spec.md. Lesson body:
    // public/content/chapters/bb-3-3-reverse-proxy.mdx. Real curriculum-order
    // prerequisite (3.2) is already shipped in this same working tree - no
    // pulled-forward exception needed (manifest.ts's prerequisiteSlugs
    // already points at "3-2-dns").
    problemStatement:
      "The starter graph carries 3.2's own chain - browser, DNS, firewall - plus the app server and " +
      "database, already wired to each other. Nothing connects the firewall's output to the app tier " +
      "yet. Run Validate to see what's missing.",
    exerciseGoal: "The firewall has nowhere to send a request once it's let one through - the path to the app tier is broken.",
    successCriteria: [
      "Something now sits between the firewall and the app tier, carrying the request the rest of the way.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented (Building Block, so Practical is not exempt). Category
    // tags live in the spec §2.
    learningObjectives: [
      "State what a reverse proxy does when a request arrives and why one address in front of many backends makes the backend swappable.",
      "Distinguish a reverse proxy from a forward proxy by which side it stands in front of.",
      "Decide what cross-cutting work belongs at the proxy layer (TLS termination, compression, static serving) versus a different layer entirely.",
      "Add a Reverse Proxy to a starter graph between the firewall and the app tier, wire it correctly, and pass Submit.",
      "Diagnose a healthy-backends-but-502-at-the-edge failure and state the first hypothesis in under a minute.",
      "Explain, in 1.3's trade-off language, why one front door trades a single point of failure and an extra hop for backend swappability and centralized cross-cutting concerns.",
    ],
    // Cumulative palette: this chapter's own new component (§16's audit row
    // for 3.3 is `reverse-proxy`) plus 3.1/3.2's browser, dns, firewall,
    // app-server, sql-database. `client` deliberately excluded, matching
    // 1.6/3.4/3.1/3.2's own "no optional piece" precedent - Browser is
    // already the established entry point. Required equals available.
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "app-server", "sql-database"],
    // No new namesake rule this chapter (§14's row names none for 3.3, and
    // no existing rule teaches anything reverse-proxy-specific - verified
    // against src/validation-engine/rules/index.ts). Same structural set
    // 3.1/3.2 curated, minus permissive-firewall (the inherited firewall
    // node is already safely configured and this chapter doesn't teach
    // firewall config).
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-3-blueprint",
        label: "One front door between the perimeter and the app tier",
        require: {
          id: "bb-3-3-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "The proxy is the one address anything outside ever learns - the firewall decided whether " +
          "traffic gets this far, the proxy decides where it goes next, and the app tier behind it can " +
          "change shape without either of those first two stops noticing.",
      },
    ],
    hints: [
      {
        id: "bb-3-3-hint-1",
        body:
          "Validate is telling you the firewall's output has nowhere to go yet, and the app server has " +
          "nothing feeding it. One node fills both gaps at once.",
      },
      {
        id: "bb-3-3-hint-2",
        body:
          "Add a Reverse Proxy node from the picker (`/` or right-click) and wire it between the " +
          "Firewall and the Application Server - firewall to proxy, proxy to app server.",
      },
      {
        id: "bb-3-3-hint-3",
        body:
          "Both new edges carry real traffic - request-flow, the same kind you've used since 1.2. " +
          "Nothing about this component's config needs to change from its default.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure - Chapter 3.3 of 37.",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The three-tier shape - client, app server, sql database (1.2).",
        "The trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The request's stops, the edge as a shared segment, and that the reverse proxy is 'the single front door: terminates TLS, routes by host or path' (2.1's own stop-table row for this chapter).",
        "The reverse proxy already shown terminating TLS and forwarding inward in 2.1's own walkthrough, and the full termination trade-off (one certificate and readable internal hops, against plaintext on your own network) already priced there - this chapter builds on that decision, it does not re-derive it (2.1).",
        "The error/hang/disagreement failure classes a user experiences (2.2).",
        "The four architecture shapes and that Group A's pressure is 'traffic has to be resolved, admitted and routed before your code sees it' (2.3).",
        "The trust perimeter and a firewall's defaultPolicy (3.1); DNS resolution and TTL (3.2).",
      ],
      notYetIntroducedConcepts: [
        "The load balancer and what forces it into existence once one proxy instance isn't enough (3.4).",
        "The API gateway, and the full reverse-proxy/load-balancer/gateway disambiguation now that all three exist (3.5).",
        "Everything past Group A.",
      ],
      simplifications: [
        "The proxy routes to a single backend group in this chapter's build - real reverse proxies " +
          "route different hosts or paths to different backend pools, described at concept level here " +
          "but not exercised, since this curriculum's running example has only one backend group so far.",
        "Authentication and rate limiting are explicitly kept out of this chapter's account of what the " +
          "proxy does, even though some real reverse-proxy products can be configured to do both - " +
          "CURRICULUM §14 reserves that ground for 3.5's API Gateway so the trio's roles stay " +
          "disambiguated rather than blurred from the first of the three.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q1 is modeled on QUIZ_FRAMEWORK.md
    // §8's own Q4 (the bank's published forward-vs-reverse example);
    // Q5 is modeled on the bank's own Q11 (the 502-with-healthy-backends
    // scenario, explicitly tagged for this chapter). Q2-Q4 are original.
    // Position-clustering checked by eye: correct options sit at c, a, d,
    // b, c - all four positions used, "c" the only repeat (twice of five).
    quiz: [
      {
        id: "bb-3-3-reverse-proxy-q1",
        kind: "single",
        difficulty: 1,
        prompt: "A reverse proxy differs from a forward proxy in that it:",
        options: [
          {
            id: "a",
            label: "Only ever runs alongside a firewall, never on its own.",
            correct: false,
            explanationMd: "Not a real constraint - a reverse proxy's job doesn't depend on what else is on the diagram with it.",
          },
          {
            id: "b",
            label: "Hides the client from the server it's asking, not the other way around.",
            correct: false,
            explanationMd: "That's a forward proxy's job - it stands in front of clients. A reverse proxy stands in front of servers and hides them instead.",
          },
          {
            id: "c",
            label: "Stands in front of servers, presenting one address for whatever is actually behind it.",
            correct: true,
            explanationMd:
              "Correct. A reverse proxy is server-side: the client only ever sees the proxy's address, " +
              "never what's actually answering behind it.",
          },
          {
            id: "d",
            label: "Can only be used once TLS is already terminated somewhere else.",
            correct: false,
            explanationMd: "Backwards - the reverse proxy is usually where TLS terminates in the first place, not something that has to wait for it.",
          },
        ],
      },
      {
        id: "bb-3-3-reverse-proxy-q2",
        kind: "single",
        difficulty: 1,
        prompt: "The reverse proxy's architectural job, stated precisely, is to:",
        options: [
          {
            id: "a",
            label: "Present one address for whatever is behind it, so the backend can change shape without any client-facing change.",
            correct: true,
            explanationMd:
              "Correct. Swappability is the whole point - nothing outside the proxy ever learns how many " +
              "backends there are or what they run.",
          },
          {
            id: "b",
            label: "Distribute requests evenly across several backend instances.",
            correct: false,
            explanationMd: "That's a load balancer's job (3.4) - this chapter's proxy fronts one backend group, it doesn't spread traffic across several instances of it.",
          },
          {
            id: "c",
            label: "Authenticate the user making the request.",
            correct: false,
            explanationMd: "That's the API gateway's job (3.5) - a reverse proxy routes by host and path, it never asks who's asking.",
          },
          {
            id: "d",
            label: "Resolve a hostname to an IP address before a connection exists.",
            correct: false,
            explanationMd: "That's DNS's job (3.2), and it already happened before the request ever reached this stop.",
          },
        ],
      },
      {
        id: "bb-3-3-reverse-proxy-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate says \"the reverse proxy secures every request, so we're done thinking about " +
          "TLS.\" What's the precise correction?",
        options: [
          {
            id: "a",
            label: "TLS isn't something a reverse proxy can do at all.",
            correct: false,
            explanationMd: "It's the opposite - terminating TLS is one of the proxy's own central jobs, controlled by its own terminatesTls field.",
          },
          {
            id: "b",
            label: "The firewall already handles TLS, so the proxy's own setting doesn't matter.",
            correct: false,
            explanationMd: "3.1's firewall filters by address, port and protocol beneath the encrypted channel - it never touches TLS, which is entirely this component's own job.",
          },
          {
            id: "c",
            label: "TLS only matters for DNS lookups, not for the request path.",
            correct: false,
            explanationMd: "DNS resolution (3.2) never carries encrypted traffic at all - TLS is entirely a property of the request path, not the lookup that precedes it.",
          },
          {
            id: "d",
            label:
              "Termination happens here by choice (terminatesTls), and 2.1 already priced that trade-off " +
              "- traffic behind the proxy is still readable by anything with access unless it's " +
              "re-encrypted inward.",
            correct: true,
            explanationMd:
              "Correct. \"Secure\" isn't binary - 2.1's own table named exactly what edge termination " +
              "buys and what it costs, and that cost (plaintext on your own network) doesn't vanish just " +
              "because the proxy exists.",
          },
        ],
      },
      {
        id: "bb-3-3-reverse-proxy-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate argues the reverse proxy should be removed since it \"just adds a hop and a " +
          "failure point for no benefit.\" What's the strongest response?",
        options: [
          {
            id: "a",
            label: "Agreed - remove it once TLS is handled somewhere else.",
            correct: false,
            explanationMd: "This concedes the teammate's framing - the proxy's value was never only TLS termination, so relocating that one job doesn't answer the objection.",
          },
          {
            id: "b",
            label:
              "Both costs are real, but they buy something specific: the backend behind it can be " +
              "resized, moved, or rewritten without a single client-facing change. Removing it trades " +
              "that swappability away.",
            correct: true,
            explanationMd:
              "Correct. The hop and the failure point are genuine costs, not imagined ones - the " +
              "argument for keeping the proxy has to name what they buy, not deny that they cost anything.",
          },
          {
            id: "c",
            label: "It should stay only because DNS depends on it existing.",
            correct: false,
            explanationMd: "Not true - 3.2's DNS resolution finishes before the proxy is ever reached and doesn't depend on it at all.",
          },
          {
            id: "d",
            label: "It's free once traffic is encrypted, so there's no real hop cost.",
            correct: false,
            explanationMd: "Encryption and the extra network hop are unrelated costs - encrypting traffic doesn't make an additional stop in the request path disappear.",
          },
        ],
      },
      {
        id: "bb-3-3-reverse-proxy-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "After a deploy, users see 502 errors from the edge, but every app-server dashboard shows " +
          "healthy, zero-error traffic. Strongest first hypothesis?",
        options: [
          {
            id: "a",
            label: "The database is down.",
            correct: false,
            explanationMd: "A database outage would still show up as errors on the app-server dashboards, which report healthy here - the failure is earlier than that.",
          },
          {
            id: "b",
            label: "DNS TTL expired for the domain.",
            correct: false,
            explanationMd: "A stale DNS answer produces a connection failure to the wrong or no address, not a 502 - a 502 means the proxy itself is up and answering.",
          },
          {
            id: "c",
            label:
              "The proxy's own upstream configuration (address, port, or path) no longer matches where " +
              "the app server actually is, so requests never reach it at all.",
            correct: true,
            explanationMd:
              "Correct. A 502 is the proxy's own answer, and it means the proxy couldn't reach whatever " +
              "it's configured to forward to - exactly what a deploy that moves the app server without " +
              "updating the proxy's config produces.",
          },
          {
            id: "d",
            label: "The firewall is blocking legitimate traffic.",
            correct: false,
            explanationMd: "A firewall block would drop or hang the connection before it reached the proxy at all, not surface as the proxy's own 502 response.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: browser, DNS, and firewall are
    // correctly wired to each other, and app server to database is
    // correctly wired too - nothing here is a wiring mistake, matching
    // 1.6/3.1/3.2's "fix ships symptoms, never find-the-bug-blind"
    // precedent. The fault is purely the missing front door between them.
    starterGraph: {
      nodes: [
        { id: "bb-3-3-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-3-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-3-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-3-app", componentId: "app-server", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-3-db", componentId: "sql-database", position: { x: 60, y: 320 }, config: {} },
      ],
      edges: [
        { id: "bb-3-3-e1", source: "bb-3-3-browser", target: "bb-3-3-dns", kind: "request-flow" },
        { id: "bb-3-3-e2", source: "bb-3-3-dns", target: "bb-3-3-fw", kind: "request-flow" },
        { id: "bb-3-3-e3", source: "bb-3-3-app", target: "bb-3-3-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-3-browser"],
    },
  },
  {
    id: "bb-3-4-load-balancer",
    mode: "building-blocks",
    title: "Load Balancer",
    // Real authored curriculum content (Wave 2, pulled forward per
    // pending-content.md, replacing the bb-dummy-1 placeholder). Spec:
    // specs/bb-3-4-load-balancer.spec.md. Lesson body:
    // public/content/chapters/bb-3-4-load-balancer.mdx (MDX since the
    // Release 5.0.0-alpha migration - see lessonFormat below).
    // Pulled-forward exception (see spec §0): this chapter's real
    // prerequisite (3.3 Reverse Proxy) isn't authored yet - manifest.ts's
    // prerequisiteSlugs points at 1-9 instead until Group A lands.
    problemStatement:
      "The starter graph has one load balancer routing to a single app-server instance - a load " +
      "balancer over one backend balances nothing. Run Validate, read what it reports, and use that " +
      "to decide what's missing.",
    exerciseGoal: "A load balancer with only one instance behind it isn't balancing anything - it's just an extra hop.",
    successCriteria: [
      "The load balancer now distributes traffic across more than one real destination.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7): all five required categories, plus a
    // second Engineering objective for the algorithm trade-off. Category
    // tags live in the spec (specs/bb-3-4-load-balancer.spec.md §2).
    learningObjectives: [
      "State the two jobs a load balancer does (route requests, remove unhealthy instances) and why routing alone isn't load balancing.",
      "Decide why a load balancer in front of a single instance adds a failure point without adding capacity.",
      "Choose round-robin vs. least-connections for a stated workload and justify the choice against that workload's request-duration variance.",
      "Fix a starter graph with an under-provisioned load balancer: add a second instance, wire it identically, and pass a clean Validate then Submit.",
      "State, in an interview, what happens when one instance behind a load balancer dies, and name the follow-up risk the load balancer itself now carries.",
      "Explain why the load balancer becomes a new single point of failure the moment it exists, and what production systems do about it.",
    ],
    // Cumulative palette: 1.6's three components plus this chapter's own.
    // Required equals available - every component has a specific job in the
    // exercise, matching 1.6's own "no optional piece" precedent.
    availableComponentIds: ["client", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["client", "load-balancer", "app-server", "sql-database"],
    // single-instance-load-balancer is the namesake rule (fires when a
    // load-balancer's total downstream capacity is below 2 - see the
    // starter graph's single app-server instance below). no-direct-client-
    // database and component-relations guard against a learner mis-wiring
    // the fix (e.g. routing the new instance's output straight to the
    // client, or skipping the load balancer entirely) using only rules
    // already taught in 1.6. orphan-component, missing-input-connection and
    // request-flow-cycle are the same structural set 1.6 curated, for the
    // same reason: graph coherence, not untaught content.
    validationRuleIds: [
      "single-instance-load-balancer",
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-4-blueprint",
        label: "Client through a load balancer to two app-server instances",
        require: {
          id: "bb-3-4-blueprint",
          nodes: [
            { alias: "client", componentId: "client" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app1", componentId: "app-server" },
            { alias: "app2", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "client", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app1", kind: "request-flow" },
            { from: "lb", to: "app2", kind: "request-flow" },
            { from: "app1", to: "db", kind: "request-flow" },
            { from: "app2", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "Two app-server instances behind one load balancer, both still mediating access to the " +
          "database the way 1.6 established - the load balancer adds distribution and health checking " +
          "on top, it doesn't change who's allowed to touch the data.",
      },
    ],
    hints: [
      {
        id: "bb-3-4-hint-1",
        body:
          "Validate names what's connected and what isn't. The load balancer already routes to one " +
          "instance - how many backends does it need before \"balancing\" means anything?",
      },
      {
        id: "bb-3-4-hint-2",
        body: "Add a second App Server node from the picker (`/` or right-click), positioned like the first one.",
      },
      {
        id: "bb-3-4-hint-3",
        body:
          "Wire the new instance exactly the way the existing one connects to the load balancer and " +
          "the database - same edge kinds, same direction.",
      },
    ],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-11).
    // 2: Opus proofread pass (2026-08-11). Disclosed the control-edge engine
    // gap in the lesson body itself (§20.2 requires the honest statement in
    // the prose, not only in curriculumContext.simplifications, which only
    // ever reaches the Deep Check prompt), fixed the diagram caption's
    // "losing a control edge" mechanic (a failed check removes an instance,
    // the edge doesn't vanish), rewrote the Cloudflare example to §13's
    // who/why/when/trade-off format (the "core product" framing was an
    // overclaim and "nearest healthy server" smuggled in untaught geo
    // routing), disambiguated "add a second instance" from the app-server
    // Instances config field (bumping it satisfies the rule but not the
    // blueprint), removed a cold-open restatement (§20.6), and corrected a
    // dangling "cargo-cult" self-reference. See spec §13.
    // v3: embedded the interactive Walkthrough diagram (Release 5.0.0-alpha
    // step 4) after the "two edge kinds" paragraph.
    // v4: walkthrough v2 - new fixed-viewBox coordinates, plus a
    // round-robin/least-connections algorithm toggle with per-step variants.
    // v5: wrapped round-robin's first mention in a <Ref> glossary reference
    // (Release 5.0.0-alpha glossary pilot).
    lessonVersion: 5,
    // Migrated to MDX (Release 5.0.0-alpha step 2 of the build order, see
    // pending.md) - first chapter to move off the legacy react-markdown
    // path. Lesson body: public/content/chapters/bb-3-4-load-balancer.mdx.
    lessonFormat: "mdx",
    curriculumContext: {
      position:
        "Building Blocks, Group A: Core Infrastructure - Chapter 3.4 of 37 (pulled forward per " +
        "pending-content.md; see this chapter's spec §0 for the declared prerequisite exception).",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The five forces and the eight-step Interview Loop, including steps 4 and 6 (0.2-0.4).",
        "Scoping, requirements, and estimation (1.1-1.5).",
        "The three-tier shape - client, app server, sql database - and why the app server mediates all database access (1.6).",
        "Systematic bottleneck-finding and trade-off/deep-dive methodology (1.7-1.9).",
      ],
      notYetIntroducedConcepts: [
        "The trust perimeter, DNS, and the reverse proxy's single-front-door pattern (3.1-3.3) - this chapter's real curriculum-order prerequisite, not yet authored.",
        "API gateways and the reverse-proxy/load-balancer/gateway trio (3.5).",
        "Horizontal scaling as its own named topic, and manufacturing more than two instances on purpose (3.8).",
        "Statelessness and session externalization (3.6-3.7) - this chapter's app-server instances are treated as interchangeable without saying why that has to be true.",
        "Caching, read replicas, and any data-layer scaling (Groups C-D).",
      ],
      simplifications: [
        "Exactly two app-server instances are ever in scope. Choosing how many is 3.8's job; this chapter only teaches that more than one needs something routing between them.",
        "Health checks (`control` edges) are taught and shown in the lesson diagram but not exercised on canvas - the registry's load-balancer/app-server relations contracts don't yet accept a control-kind edge between them (both declare allowedKinds: [\"request-flow\"] only). Flagged as an engine gap in the spec and pending-chapters.md, not worked around.",
        "Algorithm choice (round-robin vs. least-connections) is a config decision discussed in the lesson and quiz, not enforced by a validation rule - both are legitimate for different workloads, so there is no single correct config to check for.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q2 and Q4 are modeled on
    // QUIZ_FRAMEWORK.md §8's own Q5 and Q7 (the bank's published examples
    // for this exact chapter) - reworded with a fresh graph/workload rather
    // than copied verbatim, matching every other chapter's practice.
    // Position-clustering checked by eye across the four single-kind
    // questions (Q1/Q3/Q4/Q5): correct options sit at b, a, c, d.
    quiz: [
      {
        id: "bb-3-4-load-balancer-q1",
        kind: "single",
        difficulty: 1,
        prompt: "What does a load balancer do that simply adding a second app-server instance doesn't?",
        options: [
          {
            id: "a",
            label: "Makes each instance individually faster.",
            correct: false,
            explanationMd: "A load balancer doesn't speed up any single instance - it decides which instance handles which request.",
          },
          {
            id: "b",
            label: "Decides which instance gets each request, and stops sending traffic to one that's stopped answering.",
            correct: true,
            explanationMd:
              "Correct. A second instance with nothing routing between them doesn't help - both jobs, " +
              "routing and health checking, are the load balancer's.",
          },
          {
            id: "c",
            label: "Encrypts traffic between the client and the app servers.",
            correct: false,
            explanationMd: "Encryption isn't this component's job in this curriculum's model - nothing here changes because a load balancer exists.",
          },
          {
            id: "d",
            label: "Stores session state so either instance can serve a returning user.",
            correct: false,
            explanationMd: "Where session state lives is 3.7's problem - a load balancer's own job is routing and health checking, not storage.",
          },
        ],
      },
      {
        id: "bb-3-4-load-balancer-q2",
        kind: "diagram",
        difficulty: 1,
        prompt:
          "This design has a load balancer routing to exactly one app-server instance, which reaches " +
          "the database. What will Validate flag, and why?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 100 }, config: {} },
            { id: "lb1", componentId: "load-balancer", position: { x: 220, y: 100 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 400, y: 100 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 580, y: 100 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "c1", target: "lb1", kind: "request-flow" },
            { id: "e2", source: "lb1", target: "a1", kind: "request-flow" },
            { id: "e3", source: "a1", target: "d1", kind: "request-flow" },
          ],
          entryPointIds: ["c1"],
        },
        options: [
          {
            id: "a",
            label: "Nothing - the graph is fine as drawn.",
            correct: false,
            explanationMd:
              "A load balancer over exactly one instance is exactly the fault this chapter's own rule checks for - it doesn't pass silently.",
          },
          {
            id: "b",
            label: "The load balancer should also connect directly to the database.",
            correct: false,
            explanationMd: "A load balancer routing traffic and a load balancer touching the database are unrelated jobs - nothing here calls for that edge.",
          },
          {
            id: "c",
            label: "A load balancer over a single backend adds a hop and a failure point without adding capacity or redundancy.",
            correct: true,
            explanationMd:
              "Correct - this is single-instance-load-balancer firing. Routing across one instance is " +
              "no routing decision at all, and the load balancer is now one more thing that can fail.",
          },
          {
            id: "d",
            label: "The client should also connect directly to the app server, bypassing the load balancer.",
            correct: false,
            explanationMd: "That would recreate the exact problem 1.6 already ruled out - a component skipping the layer meant to mediate it.",
          },
        ],
      },
      {
        id: "bb-3-4-load-balancer-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A load balancer sends a periodic check to each backend instance, separate from real request traffic. What does this protect against?",
        options: [
          {
            id: "a",
            label: "Routing requests to an instance that's crashed, hung, or stopped responding.",
            correct: true,
            explanationMd:
              "Correct. Without a health check, the load balancer has no way to know an instance is " +
              "dead and keeps sending it a fair share of traffic anyway.",
          },
          {
            id: "b",
            label: "The need for TLS between the load balancer and its backends.",
            correct: false,
            explanationMd: "Health checks and encryption are unrelated concerns - a health-checked instance can still be unencrypted, and vice versa.",
          },
          {
            id: "c",
            label: "Round-robin sending too many requests to the same instance.",
            correct: false,
            explanationMd: "Round-robin's fairness is about request count, not liveness - a health check answers a different question entirely.",
          },
          {
            id: "d",
            label: "The database running out of connections.",
            correct: false,
            explanationMd: "A health check only looks at the app-server instances it routes to - it has no visibility into the database at all.",
          },
        ],
      },
      {
        id: "bb-3-4-load-balancer-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Workload A: thumbnail generation, every request takes about 20ms. Workload B: report " +
          "generation, requests range from 200ms to 40 seconds. Best algorithm pairing?",
        options: [
          {
            id: "a",
            label: "Round-robin for both.",
            correct: false,
            explanationMd: "Round-robin's fairness assumption breaks under B's wide duration spread - a few long requests can pile onto one instance regardless of turn order.",
          },
          {
            id: "b",
            label: "Least-connections for both.",
            correct: false,
            explanationMd: "Least-connections costs more to track and buys nothing when requests are already uniform, like A's - round-robin is just as fair there, for less overhead.",
          },
          {
            id: "c",
            label: "A: round-robin (cheap and fair under uniform load); B: least-connections (long requests pile up unevenly under round-robin).",
            correct: true,
            explanationMd:
              "Correct. Algorithm choice is workload-dependent - both are legitimate configs, applied to " +
              "the workload that actually needs them.",
          },
          {
            id: "d",
            label: "Whichever algorithm is fastest to compute, for both.",
            correct: false,
            explanationMd: "Compute cost isn't the deciding factor here - both algorithms are cheap; the question is which one matches the workload's request-duration variance.",
          },
        ],
      },
      {
        id: "bb-3-4-load-balancer-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "You've put a load balancer in front of two healthy, health-checked app-server instances. " +
          "What new failure mode did you just introduce?",
        options: [
          {
            id: "a",
            label: "No new failure mode - the load balancer only removes them.",
            correct: false,
            explanationMd: "The load balancer is itself a component sitting in front of everything else - it doesn't only remove risk, it also concentrates it.",
          },
          {
            id: "b",
            label: "The two app-server instances can no longer reach each other directly.",
            correct: false,
            explanationMd: "Nothing in this architecture ever had app-server instances talking to each other - that was never a capability that existed to lose.",
          },
          {
            id: "c",
            label: "Requests now take measurably longer because of the extra hop, and that's the main new risk.",
            correct: false,
            explanationMd: "An extra hop is real but minor - the risk this chapter actually teaches is availability, not latency.",
          },
          {
            id: "d",
            label:
              "The load balancer itself is now a single point of failure - if it goes down, every " +
              "healthy instance behind it becomes unreachable at once.",
            correct: true,
            explanationMd:
              "Correct. This is why production load balancers run redundant or as a managed service - " +
              "the goal isn't removing every single point of failure, it's moving it somewhere cheaper to make redundant.",
          },
        ],
      },
    ],
    // Deliberately under-provisioned, matching 1.6's "fix, not find-the-bug-
    // blind" precedent (§11.1): the load balancer and its one backend are
    // both correctly wired to each other and to the database - nothing here
    // is a wiring mistake, the fault is purely capacity (single-instance-
    // load-balancer). No control edges (see curriculumContext.simplifications
    // - the registry doesn't yet accept one between these two components).
    starterGraph: {
      nodes: [
        { id: "bb-3-4-client", componentId: "client", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-4-lb", componentId: "load-balancer", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-4-app1", componentId: "app-server", position: { x: 380, y: 160 }, config: {} },
        { id: "bb-3-4-db", componentId: "sql-database", position: { x: 60, y: 320 }, config: {} },
      ],
      edges: [
        { id: "bb-3-4-edge-client-lb", source: "bb-3-4-client", target: "bb-3-4-lb", kind: "request-flow" },
        { id: "bb-3-4-edge-lb-app1", source: "bb-3-4-lb", target: "bb-3-4-app1", kind: "request-flow" },
        { id: "bb-3-4-edge-app1-db", source: "bb-3-4-app1", target: "bb-3-4-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-4-client"],
    },
  },
  {
    id: "bb-3-5-api-gateway",
    mode: "building-blocks",
    title: "API Gateway",
    // Real authored content (Wave 3, fourth Group A chapter - Group A
    // complete). Spec: specs/bb-3-5-api-gateway.spec.md. Lesson body:
    // public/content/chapters/bb-3-5-api-gateway.mdx. Real curriculum-order
    // prerequisite (3.4) is already shipped in this same working tree - no
    // pulled-forward exception needed (manifest.ts's prerequisiteSlugs
    // already points at "3-4-load-balancer").
    problemStatement:
      "The starter graph carries 3.3's own chain - browser, DNS, firewall, reverse proxy - already " +
      "wired to each other, plus an app server wired to a database. Nothing connects the reverse " +
      "proxy's output to the app tier yet. Run Validate to see what's missing.",
    exerciseGoal:
      "The reverse proxy has nowhere to send a request once it accepts one - the path to the app " +
      "tier is broken, and there's no single place left to apply policy across services.",
    successCriteria: [
      "Something now sits between the reverse proxy and the app tier, carrying the request the rest of the way.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented (Building Block, so Practical is not exempt). Category
    // tags live in the spec §2.
    learningObjectives: [
      "State the API gateway's job: a single client-facing entry point that applies auth and rate limiting once, in front of however many services exist, then routes by service.",
      "Distinguish the gateway's job from a reverse proxy's (one backend group, no policy) and a load balancer's (identical instances of one service, no policy).",
      "Decide when an API gateway is load-bearing (multiple services needing consistent policy) versus overkill (one service, no shared policy to centralize).",
      "Add an API Gateway to a starter graph between the reverse proxy and the app tier, wire it correctly, and pass Submit.",
      "Answer the \"gateway vs. load balancer\" interview follow-up crisply, naming what each decides and what each doesn't.",
      "Explain, in 1.3's trade-off language, what centralizing policy at the gateway buys (consistency, one place to patch) against what it costs (a new hop, the widest blast radius of the three front-door components).",
    ],
    // Cumulative palette: this chapter's own new component (§16's audit row
    // for 3.5 is `api-gateway`) plus 3.1-3.3's browser, dns, firewall,
    // reverse-proxy, app-server, sql-database. `client` and `load-balancer`
    // deliberately excluded - load-balancer is referenced by name in prose
    // and quiz only, not required on canvas here, matching 3.3's own
    // precedent of naming 3.4/3.5 without requiring them. Required equals
    // available.
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "app-server", "sql-database"],
    // No new namesake rule this chapter (§14's row names none for 3.5, and
    // no existing rule teaches anything gateway-specific - verified against
    // src/validation-engine/rules/index.ts). Same structural set 3.1-3.3
    // curated, minus permissive-firewall (the inherited firewall node is
    // already safely configured and this chapter doesn't teach firewall
    // config).
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-5-blueprint",
        label: "One policy layer between the front door and the app tier",
        require: {
          id: "bb-3-5-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "The gateway is the last stop before the app tier that gets to say no - by the time a " +
          "request reaches the app server, the gateway has already decided who's asking and how " +
          "often, which is exactly what neither the proxy nor a bare app server ever checked.",
      },
    ],
    hints: [
      {
        id: "bb-3-5-hint-1",
        body:
          "Validate is telling you the reverse proxy's output goes nowhere yet, and the app server has " +
          "nothing feeding it. One node closes both gaps at once.",
      },
      {
        id: "bb-3-5-hint-2",
        body:
          "Add an API Gateway node from the picker (`/` or right-click) and wire it between the " +
          "Reverse Proxy and the Application Server - proxy to gateway, gateway to app server.",
      },
      {
        id: "bb-3-5-hint-3",
        body:
          "Both new edges carry request-flow, same as everywhere else. Nothing about the gateway's own " +
          "config (Requires Auth, Rate Limit) needs to change from its default for this build.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group A: Core Infrastructure - Chapter 3.5 of 37 (final chapter in Group A).",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The three-tier shape (1.2) and the trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The request's stops, and that the API gateway's own stop-table row is 'auth, rate limits, and request shaping in front of many services' (2.1's own row for this chapter).",
        "The four architecture shapes and that Group A's pressure - traffic has to be resolved, admitted and routed before your code sees it - is now fully spent across 3.1-3.3 (2.3).",
        "The trust perimeter and a firewall's defaultPolicy (3.1); DNS resolution and TTL (3.2).",
        "The reverse proxy's single front door, and its own drawn line - routing lives here, authentication and rate limiting don't (3.3).",
        "The load balancer's job: distributing traffic across identical, health-checked instances of one service, with algorithm choice as a config decision (3.4).",
      ],
      notYetIntroducedConcepts: [
        "Statelessness, and why it's what lets any tier - including a gateway - scale by adding instances rather than needing session affinity (3.6).",
        "Session externalization (3.7), horizontal scaling as its own named topic (3.8), and service discovery (3.9).",
        "Everything past Group A - data, caching, async systems, storage, and reliability.",
      ],
      simplifications: [
        "The buildable exercise fronts a single service; the multi-service picture (the reason a gateway " +
          "is more than 'a proxy that also checks auth') is shown in the lesson's diagram and prose, not " +
          "the graded build. The registry's buildable graph node has no per-instance label, so a second, " +
          "visually generic app-server node on canvas wouldn't actually read as 'a different service' - " +
          "only as another identical instance, which is the load balancer's own shape from 3.4. Declared " +
          "honestly rather than building a two-node graph that doesn't teach what it claims to.",
        "Routing rules (which path reaches which service) aren't a configurable field on this registry " +
          "component - requiresAuth and rateLimitPerMinute are the only two config fields. Which service a " +
          "request reaches is expressed by which edge exists, not by an authored routing table.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q2 models QUIZ_FRAMEWORK.md §8's own
    // Q8 (the bank's published trio-matching example) - reworded with fresh
    // wording rather than reproduced. Q1, Q3, Q4, Q5 are original.
    // Position-clustering checked by eye across the four single-kind
    // questions (Q1/Q3/Q4/Q5): correct options sit at c, a, d, b - all four
    // positions used, no repeat.
    quiz: [
      {
        id: "bb-3-5-api-gateway-q1",
        kind: "single",
        difficulty: 1,
        prompt: "The API gateway's architectural job, stated precisely, is to:",
        options: [
          {
            id: "a",
            label: "Resolve a hostname to an address before any connection exists.",
            correct: false,
            explanationMd: "That's DNS's job (3.2), and it already finished before the request ever reached this stop.",
          },
          {
            id: "b",
            label: "Present one address for a single backend group, with no policy logic of its own.",
            correct: false,
            explanationMd: "That's a reverse proxy's job (3.3) - it routes by host and path, but never checks who's asking or how often.",
          },
          {
            id: "c",
            label:
              "Serve as the single client-facing entry point for policy - authentication and rate " +
              "limiting - applied once for however many services sit behind it, then route by service.",
            correct: true,
            explanationMd:
              "Correct. The gateway centralizes exactly the checks a reverse proxy and a load balancer " +
              "neither one performs.",
          },
          {
            id: "d",
            label: "Distribute requests evenly across several identical backend instances.",
            correct: false,
            explanationMd: "That's a load balancer's job (3.4) - a gateway doesn't know or care whether the service behind it has one instance or ten.",
          },
        ],
      },
      {
        id: "bb-3-5-api-gateway-q2",
        kind: "matching",
        difficulty: 1,
        prompt: "Match each job to the component that owns it.",
        // Derangement: pairs[0]'s correct option ("reverse-proxy") sits at
        // options index 2, pairs[1]'s ("load-balancer") sits at index 0,
        // pairs[2]'s ("api-gateway") sits at index 1 - no pair's correct
        // option sits at its own pair index.
        options: [
          {
            id: "load-balancer",
            label: "Load Balancer",
            correct: true,
            explanationMd:
              "Distributes traffic across identical, health-checked copies of one service - it has no " +
              "idea what the request is asking for, only which instance is next (3.4).",
          },
          {
            id: "api-gateway",
            label: "API Gateway",
            correct: true,
            explanationMd:
              "The client-facing policy layer: decides who's allowed in and how often, once, then " +
              "routes by service rather than by instance (3.5).",
          },
          {
            id: "reverse-proxy",
            label: "Reverse Proxy",
            correct: true,
            explanationMd:
              "Fronts one backend group and decides where a request goes by host or path - no " +
              "authentication, no rate limiting, no spreading across instances (3.3).",
          },
        ],
        pairs: [
          ["One front door for a single backend group, no policy logic", "reverse-proxy"],
          ["Spread traffic across identical, health-checked instances of one service", "load-balancer"],
          ["Client-facing policy layer: auth and rate limits, applied once across however many services exist", "api-gateway"],
        ],
      },
      {
        id: "bb-3-5-api-gateway-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate argues the gateway's policy checks (auth, rate limiting) should each be " +
          "reimplemented inside every service instead, since it's \"simpler than routing everything " +
          "through one shared component.\" What's the strongest response?",
        options: [
          {
            id: "a",
            label:
              "Duplicating the check trades a shared hop for inconsistency - every service can enforce " +
              "a slightly different rule, and every service has to be independently patched when the " +
              "policy changes.",
            correct: true,
            explanationMd:
              "Correct. Centralizing isn't free, but the alternative isn't free either - it's paid in " +
              "drift, not in a visible hop.",
          },
          {
            id: "b",
            label: "Agreed - each service should own its own auth and rate limiting.",
            correct: false,
            explanationMd: "This is exactly the duplication the gateway exists to remove - every service reimplementing the same check independently is how the two checks drift apart in the first place.",
          },
          {
            id: "c",
            label: "It doesn't matter either way, since rate limiting doesn't affect correctness.",
            correct: false,
            explanationMd: "Correctness isn't the only thing at stake - an inconsistent or missing check is a real security and availability gap, not a cosmetic one.",
          },
          {
            id: "d",
            label: "The gateway should be removed entirely once there's more than one service.",
            correct: false,
            explanationMd: "Backwards - more services is exactly when centralizing the same check across all of them starts paying off.",
          },
        ],
      },
      {
        id: "bb-3-5-api-gateway-q4",
        kind: "single",
        difficulty: 2,
        prompt: "A gateway in front of three services goes down entirely for two minutes. What happens to the three services behind it?",
        options: [
          {
            id: "a",
            label: "Only the service the gateway happens to be routing to at that moment is affected.",
            correct: false,
            explanationMd: "The gateway is the single thing every request to any of the three passes through first - there's no partial failure here.",
          },
          {
            id: "b",
            label: "Nothing - each service has its own load balancer, so traffic reroutes automatically.",
            correct: false,
            explanationMd: "A service's own load balancer only reroutes traffic among that service's own instances - it can't reach around a dead gateway sitting in front of it.",
          },
          {
            id: "c",
            label: "Only requests requiring authentication are affected; unauthenticated ones pass through.",
            correct: false,
            explanationMd: "The gateway itself is down - there's no path through it for any request, authenticated or not.",
          },
          {
            id: "d",
            label:
              "All three become unreachable at once, even though each one is individually healthy - the " +
              "gateway is the one thing every request to any of them has to pass through first.",
            correct: true,
            explanationMd:
              "Correct. This is the wider blast radius a gateway carries compared to a reverse proxy: " +
              "one proxy outage costs one backend group; one gateway outage costs every service behind it.",
          },
        ],
      },
      {
        id: "bb-3-5-api-gateway-q5",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"You've already got a load balancer. Why add a gateway too?\" Strongest answer?",
        options: [
          {
            id: "a",
            label: "They do the same job, so only one is needed - drop whichever came second.",
            correct: false,
            explanationMd: "They don't do the same job - a load balancer spreads traffic across identical copies of one service; a gateway centralizes policy across however many services exist. Neither replaces the other.",
          },
          {
            id: "b",
            label:
              "The load balancer solves distributing traffic within one service; the gateway solves who's " +
              "allowed in and how often, across every service - once there's more than one service or a " +
              "policy to enforce consistently, that's a job the load balancer was never built to do.",
            correct: true,
            explanationMd: "Correct - names both jobs precisely and states the condition that makes the gateway load-bearing, matching a senior-level answer.",
          },
          {
            id: "c",
            label: "The gateway makes the load balancer unnecessary once it's in place.",
            correct: false,
            explanationMd: "A gateway routes to a service, not to a specific healthy instance of it - a service with more than one instance still needs its own load balancer behind the gateway.",
          },
          {
            id: "d",
            label: "Only the gateway matters; the load balancer was a mistake.",
            correct: false,
            explanationMd: "The load balancer already solved a real problem in 3.4 (spreading load across identical instances) - the gateway solves a different one, it doesn't retroactively make the first one wrong.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: browser, DNS, firewall, and
    // reverse proxy are correctly wired to each other (3.3's own chain), and
    // app server to database is correctly wired too - nothing here is a
    // wiring mistake, matching 1.6/3.1-3.4's "fix ships symptoms, never
    // find-the-bug-blind" precedent. The fault is purely the missing policy
    // layer between them.
    starterGraph: {
      nodes: [
        { id: "bb-3-5-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-5-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-5-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-5-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-5-app", componentId: "app-server", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-5-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-5-e1", source: "bb-3-5-browser", target: "bb-3-5-dns", kind: "request-flow" },
        { id: "bb-3-5-e2", source: "bb-3-5-dns", target: "bb-3-5-fw", kind: "request-flow" },
        { id: "bb-3-5-e3", source: "bb-3-5-fw", target: "bb-3-5-proxy", kind: "request-flow" },
        { id: "bb-3-5-e4", source: "bb-3-5-app", target: "bb-3-5-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-5-browser"],
    },
  },
  {
    id: "bb-3-6-stateless-services",
    mode: "building-blocks",
    title: "Stateless Services",
    // Real authored content (Wave 3 continuation, first Group B chapter).
    // Spec: specs/bb-3-6-stateless-services.spec.md. Lesson body:
    // public/content/chapters/bb-3-6-stateless-services.mdx. Real
    // curriculum-order prerequisite (3.5) is already shipped in this same
    // working tree - manifest.ts's prerequisiteSlugs already points at
    // "3-5-api-gateway", no pulled-forward exception needed.
    problemStatement:
      "The starter graph is the system as built through 3.5: browser, DNS, firewall, reverse proxy, " +
      "API gateway, load balancer, one app server, one database - all correctly wired, nothing " +
      "missing. Something in the app server's own configuration undermines the load balancer " +
      "sitting in front of it.",
    exerciseGoal:
      "The load balancer in front of the app server isn't actually balancing anything - a single " +
      "number in the app server's own configuration is the reason.",
    successCriteria: [
      "The load balancer now has more than one real destination to route to.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented. Concept type does not exempt Practical here - unlike a
    // no-build Concept chapter (0.2, 0.3), this chapter has a real
    // Submit-gated fix, so a Practical objective is genuinely exercisable
    // (matches 3.1's own "Concept with small build" precedent).
    learningObjectives: [
      "State what makes a service stateless: any instance can answer any request because no response depends on a specific instance's memory of an earlier one.",
      "Distinguish state that's safe to keep local (recomputable, disposable) from state that isn't (anything the next request needs to see correctly, regardless of which instance answers it).",
      "Decide, for a piece of app-tier state, whether pinning it to one instance or moving it to a shared store is the more honest call given the situation, and name the cost of each.",
      "Fix a starter graph's under-provisioned load balancer by raising the Application Server's own Instances field - not adding a second node - and pass Submit.",
      "Answer \"is autoscaling free once you're stateless?\" without overclaiming that displaced state disappears rather than relocates.",
      "Explain, in 1.3's trade-off language, what pinning a user to one instance buys against what moving their state out of the app tier costs.",
    ],
    // Cumulative palette through 3.5 - this chapter's own §16 audit row is
    // "New: none," so nothing is added. Required equals available: every
    // node in the starter graph has a specific job in the fix (the load
    // balancer/app-server pair is the exercise's own subject; the rest is
    // the already-correct system the exercise is embedded in, matching the
    // curriculum's running-example philosophy for Part 3 - CURRICULUM §14's
    // own intro to the part).
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    // single-instance-load-balancer is 3.4's own namesake rule, reused here
    // for a different reason - see spec §7. No new rule authored (verified
    // against src/validation-engine/rules/index.ts; nothing existing or
    // needed teaches statelessness directly, and authoring a new rule is
    // outside this pass's scope per the chapter-author skill). Same
    // structural set 3.1-3.5 curated for the rest, minus permissive-firewall
    // (inherited firewall node is already safely configured; this chapter
    // doesn't teach firewall config).
    validationRuleIds: [
      "single-instance-load-balancer",
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-6-blueprint",
        label: "The same system, one instance count changed",
        require: {
          id: "bb-3-6-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server", config: [{ field: "instances", op: "gte", value: 2 }] },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "Nothing about the topology changed - the same load balancer, the same single app-server " +
          "node, the same edges. Only the Instances count moved. That's the entire chapter: once a " +
          "tier keeps nothing that only one of its instances remembers, giving it more capacity is a " +
          "number to change, not a system to redesign.",
      },
    ],
    hints: [
      {
        id: "bb-3-6-hint-1",
        body:
          "Validate is naming the load balancer's own capacity, not anything wired wrong - every edge " +
          "in this graph is already correct.",
      },
      {
        id: "bb-3-6-hint-2",
        body: "Open the Application Server's config panel (click the node) and look at Instances. It's still 1.",
      },
      {
        id: "bb-3-6-hint-3",
        body:
          "Raise Instances to 2 or more on that same node - don't add a second Application Server " +
          "node, that's a different exercise's fix.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group B: Compute - Chapter 3.6 of 37 (first chapter in Group B).",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The three-tier shape (1.2) and the trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The load balancer's job: distributing traffic across identical, health-checked instances of one service, and that a load balancer over a single instance is a pass-through, not a load balancer (3.4).",
        "The API gateway's job as the client-facing policy layer, and that Group A's own front door - firewall, DNS, reverse proxy, load balancer, API gateway - is now complete (3.5).",
        "The scaling-evolution story: copies of the app tier are the cheapest way to relieve a compute ceiling, and 2.3's own foreshadow that this only works if a request can land anywhere.",
      ],
      notYetIntroducedConcepts: [
        "Where displaced state actually lives, and the sticky-vs-externalized trade-off in full (3.7).",
        "Horizontal scaling as its own named topic, and service discovery (3.8, 3.9).",
        "Everything past Group B - data, caching, async systems, storage, and reliability.",
      ],
      simplifications: [
        "The buildable exercise fixes the load balancer's capacity by raising the Application Server's " +
          "own Instances field, not by adding a second node - which is 3.4's own fix, for a " +
          "structurally different starting graph. Both are real moves an engineer can make; this " +
          "chapter's blueprint specifically requires the config change because proving that scaling " +
          "out is 'just a number' once a tier is stateless is this chapter's own point, stated " +
          "honestly in the lesson's own 'Your turn' section, not left implicit.",
        "Session affinity / sticky routing is named in the lesson but not built or configured on " +
          "canvas here - no registry component has a representable config field for it today, and its " +
          "full cost accounting belongs to 3.7.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q1 models QUIZ_FRAMEWORK.md §9's own
    // Q1 (the bank's published definition question for this exact chapter) -
    // reworded with fresh option labels. Q2-Q5 are original, each scoped
    // away from 3.7-3.9 material per the bank's own per-question tags.
    // Position-clustering checked by eye: correct options sit at c, a, d, b,
    // c across the five single-kind questions - all four positions used,
    // "c" the only repeat (Q1, Q5).
    quiz: [
      {
        id: "bb-3-6-stateless-services-q1",
        kind: "single",
        difficulty: 1,
        prompt: "\"Stateless service\" means, precisely:",
        options: [
          {
            id: "a",
            label: "The service stores no data anywhere.",
            correct: false,
            explanationMd: "The database is real, shared state every instance reaches identically - statelessness is about the instances, not about whether data exists at all.",
          },
          {
            id: "b",
            label: "The service has no configuration.",
            correct: false,
            explanationMd: "Configuration and state are unrelated - a stateless app server can still have a config field like Instances.",
          },
          {
            id: "c",
            label: "Any instance can answer any request, because no response depends on a specific instance's memory of an earlier one.",
            correct: true,
            explanationMd: "Correct. State exists - it just can't live only in one instance's memory, or that instance becomes the only one who can answer correctly.",
          },
          {
            id: "d",
            label: "The service never fails.",
            correct: false,
            explanationMd: "Statelessness is about what an instance remembers, not about whether it can crash - a stateless instance can still die, it just doesn't take anyone's state with it.",
          },
        ],
      },
      {
        id: "bb-3-6-stateless-services-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "Two app-server instances behind a load balancer. A user adds an item to their cart, " +
          "reloads the page, and the cart is empty. Most likely root cause:",
        options: [
          {
            id: "a",
            label: "The cart addition was held in the instance that served the first request; the reload landed on the other one.",
            correct: true,
            explanationMd: "Correct. The load balancer never promised the second request would return to the same instance - only that it would reach a healthy one.",
          },
          {
            id: "b",
            label: "The database lost the write.",
            correct: false,
            explanationMd: "Nothing here points at the database - the failure pattern (works once, vanishes on reload) is exactly what per-instance memory produces, not a lost write.",
          },
          {
            id: "c",
            label: "The load balancer is misconfigured.",
            correct: false,
            explanationMd: "The load balancer did its job correctly - it routed to a healthy instance both times. The bug is in what the app tier assumed about where it would route.",
          },
          {
            id: "d",
            label: "The user's browser cleared its cache.",
            correct: false,
            explanationMd: "A cache clear wouldn't reproduce this specific pattern (the same user, the same session, a reload) - the state that vanished lived on the server side, not the client.",
          },
        ],
      },
      {
        id: "bb-3-6-stateless-services-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "An app-server instance keeps an in-memory cache of a slow-to-compute value. Different " +
          "instances sometimes cache slightly different copies of it. Is this a statelessness violation?",
        options: [
          {
            id: "a",
            label: "Yes - all local memory on an app server is forbidden.",
            correct: false,
            explanationMd: "Overcorrection. The rule is about what a response depends on, not about whether memory is used at all.",
          },
          {
            id: "b",
            label: "Only if the cache holds more than roughly a megabyte of data.",
            correct: false,
            explanationMd: "Size has nothing to do with it - a one-byte value that changes what a user is entitled to see is the real problem; a large cache of a recomputable value is not.",
          },
          {
            id: "c",
            label: "No - caching is a job for a dedicated cache component, not the app server.",
            correct: false,
            explanationMd: "That's a real pattern (later in the curriculum), but it's not why this specific case is safe - this case is safe because losing the value costs nothing but a recompute.",
          },
          {
            id: "d",
            label: "No - losing it or recomputing it doesn't change what the user is entitled to see, only how fast they see it.",
            correct: true,
            explanationMd: "Correct. This is exactly the state that's safe to keep local: disposable, recomputable, never the reason a request gets the wrong answer.",
          },
        ],
      },
      {
        id: "bb-3-6-stateless-services-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate proposes routing each user's repeat requests back to the same instance " +
          "instead of moving state out of the app tier. Strongest response?",
        options: [
          {
            id: "a",
            label: "Agreed - pinning is free and solves the problem for good.",
            correct: false,
            explanationMd: "It isn't free - it buys time at the cost of re-coupling a user to one instance's availability.",
          },
          {
            id: "b",
            label: "It avoids a network hop today, but it re-creates the coupling instances-are-interchangeable was supposed to remove: lose that instance, and every user pinned to it loses their state too.",
            correct: true,
            explanationMd: "Correct - names the real benefit (no new hop yet) and the real cost (a reintroduced single point of failure per pinned user), both ways, in 1.3's form.",
          },
          {
            id: "c",
            label: "It's strictly worse than externalizing state in every case, full stop.",
            correct: false,
            explanationMd: "Overclaims - pinning is a genuine stopgap with a real, statable cost, not a mistake in every situation.",
          },
          {
            id: "d",
            label: "It only matters for read-heavy traffic.",
            correct: false,
            explanationMd: "The read/write mix isn't the relevant axis here - what matters is whether the state changes what a future request needs to see correctly.",
          },
        ],
      },
      {
        id: "bb-3-6-stateless-services-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Interviewer: \"Your services are stateless, so autoscaling is just adding boxes, right?\" " +
          "Strongest answer?",
        options: [
          {
            id: "a",
            label: "Yes, exactly - nothing else about the system changes.",
            correct: false,
            explanationMd: "Overclaims. The state that used to live in the app tier didn't disappear - it moved somewhere, and that somewhere now has to hold up under the added load too.",
          },
          {
            id: "b",
            label: "No - statelessness and autoscaling are unrelated concepts.",
            correct: false,
            explanationMd: "They're directly related - a new instance can only take real traffic immediately if it isn't missing anything a request depends on, which is exactly what statelessness guarantees.",
          },
          {
            id: "c",
            label: "Mostly - but any state the app tier doesn't hold now lives in a shared store, and that store is what actually has to hold up under the added load.",
            correct: true,
            explanationMd: "Correct. Statelessness relocates the problem rather than deleting it - the senior-level nuance is naming where it went, not claiming it vanished.",
          },
          {
            id: "d",
            label: "Only if the new instances are the same size as the existing ones.",
            correct: false,
            explanationMd: "Instance size is a capacity-planning detail, not what makes adding instances safe or unsafe - statelessness is.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: every node and edge is
    // correctly wired end to end - the fault is purely a config value
    // (Instances: 1 on a node behind a load balancer), the first purely
    // config-only Fix this curriculum has shipped (3.1's permissive-firewall
    // gate is also config-only, but on a Completion exercise with a missing
    // node, not a Fix on an otherwise-complete graph).
    starterGraph: {
      nodes: [
        { id: "bb-3-6-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-6-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-6-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-6-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-6-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-6-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-6-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 1 } },
        { id: "bb-3-6-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-6-e1", source: "bb-3-6-browser", target: "bb-3-6-dns", kind: "request-flow" },
        { id: "bb-3-6-e2", source: "bb-3-6-dns", target: "bb-3-6-fw", kind: "request-flow" },
        { id: "bb-3-6-e3", source: "bb-3-6-fw", target: "bb-3-6-proxy", kind: "request-flow" },
        { id: "bb-3-6-e4", source: "bb-3-6-proxy", target: "bb-3-6-gateway", kind: "request-flow" },
        { id: "bb-3-6-e5", source: "bb-3-6-gateway", target: "bb-3-6-lb", kind: "request-flow" },
        { id: "bb-3-6-e6", source: "bb-3-6-lb", target: "bb-3-6-app", kind: "request-flow" },
        { id: "bb-3-6-e7", source: "bb-3-6-app", target: "bb-3-6-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-6-browser"],
    },
  },
  {
    id: "bb-3-7-sessions-and-state-management",
    mode: "building-blocks",
    title: "Sessions & State Management",
    // Real authored content (Wave 3 continuation, second Group B chapter).
    // Spec: specs/bb-3-7-sessions-and-state-management.spec.md. Lesson body:
    // public/content/chapters/bb-3-7-sessions-and-state-management.mdx. Real
    // curriculum-order prerequisite (3.6) is already shipped in this same
    // working tree - manifest.ts's prerequisiteSlugs already points at
    // "3-6-stateless-services", no pulled-forward exception needed.
    problemStatement:
      "The starter graph is the system as built through 3.6: two Application Server instances " +
      "behind the load balancer, everything upstream correctly wired. The SQL Database is on the " +
      "canvas but disconnected - no edges in or out. Run Validate to see what that costs the " +
      "system.",
    exerciseGoal:
      "Two load-balanced app-server instances lost track of where a user's session lives, and the " +
      "database already on this canvas is sitting idle.",
    successCriteria: [
      "The database is no longer disconnected - the app server can reach it.",
      "Every instance behind the load balancer can serve any request, regardless of which one handled the user last.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented - Practical included for the same reason 3.6's own spec
    // gave (a real Submit-gated exercise exists, unlike a no-build Concept
    // chapter such as 0.2/0.3).
    learningObjectives: [
      "State the two ways displaced session state can go: pinned to the instance that first served it (sticky routing), or moved into a store every instance reaches the same way (externalizing).",
      "Explain the mechanism of sticky routing precisely: the load balancer keys its routing decision on a stable client identifier - a routing change, not a data-location change.",
      "Decide, for a given product's traffic and failure profile, whether sticky routing or externalizing is the more honest default, and name the cost of each.",
      "Reconnect a starter graph's disconnected SQL Database to the Application Server with a request-flow edge, externalizing sessions into the store the system already requires, and pass Submit.",
      "Answer \"why not just use sticky sessions?\" without dismissing it as strictly wrong, naming its real (if temporary) benefit and its real cost.",
      "Explain why externalizing here requires no new component - the app server's existing database connection does the job - rather than assuming a dedicated session store is needed.",
    ],
    // Cumulative palette through 3.6, unchanged - this chapter's own §16
    // audit row is "New: none." sql-database is reused for a second job
    // (session store, not just business data) - the "same component, second
    // job" pattern §19 names explicitly using this exact pairing.
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    // orphan-component is the namesake fault - the SQL Database node has no
    // edges at all in the starter graph. No new rule authored (verified
    // against src/validation-engine/rules/index.ts; nothing existing or
    // needed teaches session placement directly, and authoring a new rule
    // is outside this pass's scope per the chapter-author skill). 3.6's own
    // curated set minus single-instance-load-balancer, which isn't this
    // chapter's concern (instances: 2 is already the starter's own config).
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-7-blueprint",
        label: "The same system, the database wired back in",
        require: {
          id: "bb-3-7-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "The topology was already complete except for one edge. Reconnecting the Application " +
          "Server to the SQL Database doesn't just fix a missing wire - it's the same connection " +
          "that now carries session reads and writes alongside business data, which is the entire " +
          "point: externalizing state didn't need a new component, only for the app tier to treat " +
          "sessions the same way it already treats everything else it can't afford to lose.",
      },
    ],
    hints: [
      {
        id: "bb-3-7-hint-1",
        body:
          "Validate is naming a component with no connections at all - nothing here is about the " +
          "load balancer's own routing algorithm.",
      },
      {
        id: "bb-3-7-hint-2",
        body: "The SQL Database node has no edges in or out. Look at what used to connect to it.",
      },
      {
        id: "bb-3-7-hint-3",
        body:
          "Draw a request-flow edge from the Application Server to the SQL Database - the same kind " +
          "of connection 1.2 first taught. There's no sticky-session toggle to find anywhere on this " +
          "canvas; that's not how this fix works.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group B: Compute - Chapter 3.7 of 37 (second chapter in Group B).",
      masteredConcepts: [
        "Statelessness: any instance can answer any request because nothing it needs lives only in that instance's own memory (3.6).",
        "The two candidate ways displaced state can go - pinned to one instance or moved to a shared store - as an unresolved fork (3.6).",
        "The three-tier shape (1.2) and the trade-off reflex - we chose X, accepting Y, because Z (1.3).",
        "The load balancer's routing job, and that copies of the app tier are now real, health-checked instances rather than a single pass-through (3.4, 3.6).",
        "2.3's own foreshadow: copies of the app tier only work if a request can land anywhere (Group B's motivating pressure).",
      ],
      notYetIntroducedConcepts: [
        "Horizontal scaling as its own named topic, and service discovery (3.8, 3.9).",
        "A purpose-built, faster session/cache store - 3.14 names it; this chapter deliberately externalizes into the SQL database already required instead.",
        "Everything past Group B - data, caching, async systems, storage, and reliability.",
      ],
      simplifications: [
        "Sticky routing is explained mechanically (keying the load balancer's decision on a stable " +
          "client identifier) but is not configurable on canvas - no registry component exposes a " +
          "session-affinity field today. Stated in the lesson's own \"How each one actually works\" " +
          "section, not left implicit in this list alone.",
        "The buildable exercise externalizes sessions into the SQL database already required by this " +
          "system, not into a dedicated session store or cache - matching this chapter's own row in " +
          "CURRICULUM.md. A faster, purpose-built store is explicitly named as arriving later (3.14), " +
          "not pretended not to exist.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q2 models QUIZ_FRAMEWORK.md §9's own
    // Q3 (tagged "(3.7)," reserved for this exact chapter) with fresh option
    // labels. Q1, Q3, Q4 are original; Q5 goes one level past the bank's own
    // Q8 by naming the specific store this chapter's exercise builds.
    // Position-clustering checked by eye: correct options sit at b, d, a, c,
    // b - all four positions used, "b" the only repeat (Q1, Q5), and the
    // opening letter (b) deliberately differs from 3.6's own opening letter
    // (c) to avoid a cross-chapter clustering pattern.
    quiz: [
      {
        id: "bb-3-7-sessions-and-state-management-q1",
        kind: "single",
        difficulty: 1,
        prompt: "Sticky sessions (session affinity) work by:",
        options: [
          {
            id: "a",
            label: "Storing a copy of session data on every instance so any of them can serve it correctly.",
            correct: false,
            explanationMd: "That describes replicating the data itself, which sticky routing doesn't do - the session still lives on exactly one instance.",
          },
          {
            id: "b",
            label: "Keying the load balancer's routing decision on a stable client identifier, so repeat requests from the same client land on the same instance every time.",
            correct: true,
            explanationMd: "Correct. It's a routing decision, not a data-location change - the session data never moves, the load balancer just stops distributing that client's traffic.",
          },
          {
            id: "c",
            label: "Disabling the load balancer's health checks so instances never fail over.",
            correct: false,
            explanationMd: "Unrelated - health checks and routing-by-identifier are independent mechanisms; disabling one doesn't produce the other.",
          },
          {
            id: "d",
            label: "Moving session storage into a separate, dedicated component reachable by every instance.",
            correct: false,
            explanationMd: "That's externalizing - the opposite approach. Sticky routing keeps the data exactly where it already was.",
          },
        ],
      },
      {
        id: "bb-3-7-sessions-and-state-management-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Sticky sessions fix the reload-loses-cart bug from 3.6. What did you silently give up?",
        options: [
          {
            id: "a",
            label: "Nothing - sticky sessions are free once configured.",
            correct: false,
            explanationMd: "Overclaims. The cost doesn't show up until the pinned instance goes away - but it's real and it's coming.",
          },
          {
            id: "b",
            label: "The ability to use a database at all.",
            correct: false,
            explanationMd: "Sticky routing has nothing to do with whether the app tier can reach a database - the two are unrelated.",
          },
          {
            id: "c",
            label: "TLS termination.",
            correct: false,
            explanationMd: "Unrelated - TLS termination happens elsewhere in the request path and isn't affected by how the load balancer picks an instance.",
          },
          {
            id: "d",
            label: "Even load distribution and clean failover: an instance's death now logs out everyone who happened to be pinned to it, and busy users pin load unevenly.",
            correct: true,
            explanationMd: "Correct. Sticky sessions trade correctness pressure for availability pressure - a real option with a real, statable cost.",
          },
        ],
      },
      {
        id: "bb-3-7-sessions-and-state-management-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "Product A is an internal admin console, ~15 employees, fixed traffic, never autoscales. " +
          "Product B is a consumer checkout flow that autoscales aggressively during flash sales. " +
          "Which pairing is the more honest default?",
        options: [
          {
            id: "a",
            label:
              "Sticky is a defensible stopgap for A, where losing one instance mid-incident affects a handful of employees; " +
              "externalize for B, where autoscaling constantly changes which instances even exist, so any affinity table sticky routing built keeps going stale.",
            correct: true,
            explanationMd: "Correct - reads the call off each product's own traffic and failure profile rather than applying one rule to both.",
          },
          {
            id: "b",
            label: "Sticky for both - it's simpler to configure, and consistency doesn't matter for either product.",
            correct: false,
            explanationMd: "Ignores B's autoscaling churn - sticky's whole assumption (instances mostly stay around) breaks exactly where autoscaling is aggressive.",
          },
          {
            id: "c",
            label: "Externalize for both, always - sticky is never a defensible choice.",
            correct: false,
            explanationMd: "Overclaims. Sticky is a genuine stopgap for A's low-stakes, low-churn traffic - not a mistake in every situation.",
          },
          {
            id: "d",
            label: "The choice depends only on team size, not on traffic pattern.",
            correct: false,
            explanationMd: "Team size isn't the relevant axis - what matters is how often instances come and go, and what an unlucky death costs.",
          },
        ],
      },
      {
        id: "bb-3-7-sessions-and-state-management-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "The starter graph already connects the Application Server to the SQL Database for " +
          "business data. What does \"externalizing sessions\" actually require on canvas?",
        options: [
          {
            id: "a",
            label: "A new, dedicated session-store component alongside the database.",
            correct: false,
            explanationMd: "Not needed - that would be introducing a new component for a job the existing database connection can already do.",
          },
          {
            id: "b",
            label: "A new edge kind distinct from request-flow.",
            correct: false,
            explanationMd: "Session reads and writes are still ordinary queries - the same request-flow kind already used for business data.",
          },
          {
            id: "c",
            label: "Nothing new - the same connection the app server already uses for business data now also carries session reads and writes.",
            correct: true,
            explanationMd: "Correct. This is the \"same component, second job\" pattern - reusing existing machinery, not building new machinery.",
          },
          {
            id: "d",
            label: "Removing the load balancer, since sessions no longer need routing.",
            correct: false,
            explanationMd: "The load balancer's job (distributing requests across instances) is unrelated to where session data lives.",
          },
        ],
      },
      {
        id: "bb-3-7-sessions-and-state-management-q5",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"You externalized sessions into a shared database. What new risk did that introduce?\" Strongest answer?",
        options: [
          {
            id: "a",
            label: "None - the risk just moved, it didn't change size.",
            correct: false,
            explanationMd: "Misses the concentration effect - moving every instance's sessions into one dependency changes what a single failure now costs.",
          },
          {
            id: "b",
            label: "The store is now a single dependency every instance needs for every session touch - if it goes down, every user is logged out at once, not just one instance's share.",
            correct: true,
            explanationMd: "Correct - the senior-level nuance is naming what got concentrated, not just claiming the problem is solved.",
          },
          {
            id: "c",
            label: "The load balancer becomes unnecessary once sessions are externalized.",
            correct: false,
            explanationMd: "The load balancer still distributes every request across instances - externalizing sessions doesn't change that job.",
          },
          {
            id: "d",
            label: "Sessions become permanently unreadable once moved to a database.",
            correct: false,
            explanationMd: "The database is exactly as readable as any other query it serves - nothing about moving session data there makes it unreadable.",
          },
        ],
      },
    ],
    // Deliberately incomplete, not miswired: every edge except one is
    // correctly wired end to end - the SQL Database node has zero edges in
    // or out, matching orphan-component's exact trigger condition, and the
    // fix is reconnecting it, not adding or removing any other node.
    starterGraph: {
      nodes: [
        { id: "bb-3-7-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-7-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-7-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-7-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-7-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-7-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-7-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 2 } },
        { id: "bb-3-7-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-7-e1", source: "bb-3-7-browser", target: "bb-3-7-dns", kind: "request-flow" },
        { id: "bb-3-7-e2", source: "bb-3-7-dns", target: "bb-3-7-fw", kind: "request-flow" },
        { id: "bb-3-7-e3", source: "bb-3-7-fw", target: "bb-3-7-proxy", kind: "request-flow" },
        { id: "bb-3-7-e4", source: "bb-3-7-proxy", target: "bb-3-7-gateway", kind: "request-flow" },
        { id: "bb-3-7-e5", source: "bb-3-7-gateway", target: "bb-3-7-lb", kind: "request-flow" },
        { id: "bb-3-7-e6", source: "bb-3-7-lb", target: "bb-3-7-app", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-7-browser"],
    },
  },
  {
    id: "bb-3-8-horizontal-scaling",
    mode: "building-blocks",
    title: "Horizontal Scaling",
    // Real authored content (Wave 3 continuation, third Group B chapter).
    // Spec: specs/bb-3-8-horizontal-scaling.spec.md. Lesson body:
    // public/content/chapters/bb-3-8-horizontal-scaling.mdx. Real
    // curriculum-order prerequisite (3.7) is already shipped in this same
    // working tree - manifest.ts's prerequisiteSlugs already points at
    // "3-7-sessions-and-state-management", no pulled-forward exception
    // needed.
    problemStatement:
      "The starter graph is the system as built through 3.7 - every edge already wired correctly, " +
      "including the Application Server's connection to the SQL Database. Validate is already " +
      "clean. This service peaks at 300 requests/second, and each Application Server instance is " +
      "tested to handle 150.",
    exerciseGoal:
      "Right now the fleet has exactly enough capacity for peak load and not one request more - " +
      "losing a single instance would drop below what peak requires.",
    successCriteria: [
      "The Application Server's instance count leaves enough spare capacity that losing any one instance still covers peak load.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented - Practical included for the same reason 3.6's and 3.7's
    // own specs gave (a real Submit-gated exercise exists here).
    learningObjectives: [
      "Distinguish vertical scaling (a bigger instance) from horizontal scaling (more identical instances), and state which of each one's costs is structural rather than incidental.",
      "Explain why duplicating a stateless instance behind an existing load balancer requires no new component or edge - a one-field config change, not new architecture.",
      "Compute an N+1 instance count from a stated peak load and a stated per-instance capacity, so that losing any single instance still leaves enough capacity.",
      "Raise a starter graph's Application Server instance count to satisfy a stated headroom requirement, and pass Submit.",
      "Answer \"why not just get a bigger box?\" without dismissing vertical scaling outright, naming when it's the honest simpler call and what it structurally can't do.",
      "Predict what a client experiences when one of several health-checked instances stops responding, including the health check's real (non-instant) reaction time.",
    ],
    // Cumulative palette through 3.7, unchanged - this chapter's own §16
    // audit row is "New: none." A second instance IS the lesson: 3.4's load
    // balancer and 3.6's statelessness are what make duplicating a config
    // change instead of new engineering.
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    // No new rule authored - §14's row names none for 3.8, and no existing
    // rule teaches instance-count headroom (single-instance-load-balancer
    // only fires below capacity 2; this chapter's own bar is 3). Curated set
    // matches 3.6's own list (single-instance-load-balancer relevant again
    // since this chapter's whole topic is instance count), verified against
    // src/validation-engine/rules/index.ts.
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "single-instance-load-balancer",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-8-blueprint",
        label: "The same system, headroom for one failure",
        require: {
          id: "bb-3-8-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server", config: [{ field: "instances", op: "gte", value: 3 }] },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "Nothing about the topology changed again - same load balancer, same single app-server " +
          "node, same edges. Only the Instances count moved, from exactly enough for peak load to " +
          "enough that losing any one instance still covers it. That's the whole chapter: once the " +
          "tier is stateless and already load-balanced, sizing for a failure is a number, not a " +
          "redesign.",
      },
    ],
    hints: [
      {
        id: "bb-3-8-hint-1",
        body:
          "Validate is already clean here - nothing is wired wrong. The gap is between what this " +
          "system's stated peak load requires and what current capacity covers if one instance goes " +
          "down right now.",
      },
      {
        id: "bb-3-8-hint-2",
        body:
          "At 150 requests/second per instance and a 300 requests/second peak, two instances is " +
          "exactly enough today - with nothing left over if either one fails.",
      },
      {
        id: "bb-3-8-hint-3",
        body:
          "Raise the Application Server's own Instances field until losing any single instance still " +
          "leaves the survivors covering 300 requests/second combined.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group B: Compute - Chapter 3.8 of 37 (third chapter in Group B).",
      masteredConcepts: [
        "The load balancer's job: distribute traffic across multiple identical backends, health-checked (3.4).",
        "Statelessness: any instance can answer any request because nothing it needs lives only in that instance's own memory (3.6).",
        "Session state now lives in a shared store every instance reaches identically, not pinned to one instance (3.7).",
        "2.3's own foreshadow: copies of the app tier only work if a request can land anywhere (Group B's motivating pressure).",
        "The back-of-envelope estimation habit - order-of-magnitude reasoning from a stated load to a concrete number (1.1).",
      ],
      notYetIntroducedConcepts: [
        "Service discovery and dynamic membership tracking as instances start and stop on their own (3.9).",
        "Autoscaling as an automated system, rather than an instance count a person sets by hand.",
        "Everything past Group B - data, caching, async systems, storage, and reliability.",
      ],
      simplifications: [
        "`control`-kind edges (health checks) are described in prose and diagrams only - no registry " +
          "component accepts one on canvas today (checked directly against `load-balancer`'s and " +
          "`app-server`'s own `relations` fields). Stated honestly in the lesson's own \"Why " +
          "duplicating is a number, not a project\" section, not left implicit in this list alone.",
        "The 300 requests/second peak and 150-per-instance figures are an illustrative worked example, " +
          "not a claim about any real system's measured load - used to make the N+1 headroom " +
          "reasoning concrete without asking the learner to invent an estimate from scratch.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q1 models QUIZ_FRAMEWORK.md §9's own
    // Q4 (tagged "(3.8)"); Q5's cliffhanger framing draws on the same bank's
    // Q5 without reproducing it (that scenario predates the load balancer
    // existing, already resolved by 3.4 and not this chapter's own point).
    // Q4 adapts bank Q6's diagram scenario to three instances and this
    // chapter's own headroom numbers - the degraded realization of "predict
    // (kill an instance mid-simulation)" from CURRICULUM's own row, since no
    // simulator UI exists yet (pending-content.md's own named degradation
    // path). Position-clustering checked by eye: correct options sit at d,
    // a, c, b, a - all four positions used, "a" the only repeat (Q2, Q5),
    // and the opening letter (d) matches neither 3.6's own opening ("c") nor
    // 3.7's own opening ("b").
    quiz: [
      {
        id: "bb-3-8-horizontal-scaling-q1",
        kind: "single",
        difficulty: 1,
        prompt:
          "Vertical scaling (a bigger box) and horizontal scaling (more boxes) both add capacity. " +
          "What eventually forces every system toward horizontal?",
        options: [
          {
            id: "a",
            label: "Horizontal scaling is cheaper per unit of capacity at any scale.",
            correct: false,
            explanationMd: "Overclaims - cost isn't the structural reason, and it isn't universally true at every scale either.",
          },
          {
            id: "b",
            label: "Vertical scaling requires running a load balancer, which is more operational overhead.",
            correct: false,
            explanationMd: "Backwards - vertical scaling is what doesn't need a load balancer at all; that's part of its appeal for the right workload.",
          },
          {
            id: "c",
            label: "DNS can only resolve a hostname to one machine.",
            correct: false,
            explanationMd: "Unrelated - DNS resolution has nothing to do with how many instances sit behind a load balancer.",
          },
          {
            id: "d",
            label: "A hardware ceiling - no machine is arbitrarily larger - and a single-failure-domain risk: one box is one outage.",
            correct: true,
            explanationMd: "Correct. Vertical scaling runs out of room to buy eventually, and until then it's still one box - lose it, lose everything.",
          },
        ],
      },
      {
        id: "bb-3-8-horizontal-scaling-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Duplicating a third Application Server instance behind the existing load balancer requires:",
        options: [
          {
            id: "a",
            label:
              "No new component or edge - the load balancer already routes to any number of backends, and any " +
              "instance answers identically because the tier is stateless; it's a one-field config change.",
            correct: true,
            explanationMd: "Correct. 3.4 and 3.6 already did the real work - this chapter's own point is that scaling out is now just a number.",
          },
          {
            id: "b",
            label: "A second load balancer, since one can't route to more than two backends.",
            correct: false,
            explanationMd: "A load balancer isn't limited to two backends - routing to any number of identical instances is exactly its job.",
          },
          {
            id: "c",
            label: "A new `control`-kind edge, drawn by hand from the load balancer to each instance.",
            correct: false,
            explanationMd: "No registry component accepts a `control` edge on canvas today - health checking is real, but it isn't a wire you draw.",
          },
          {
            id: "d",
            label: "Moving session data out of the app tier first.",
            correct: false,
            explanationMd: "Already done in 3.7 and unrelated to instance count - externalizing sessions and duplicating instances are independent moves.",
          },
        ],
      },
      {
        id: "bb-3-8-horizontal-scaling-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "This service peaks at 300 requests/second; one instance tested to 150 before latency climbs. Two " +
          "instances covers peak exactly, with nothing spare. Why does this chapter's exercise ask for three?",
        options: [
          {
            id: "a",
            label: "Load balancers only distribute evenly across an odd number of backends.",
            correct: false,
            explanationMd: "Not a real constraint - a load balancer distributes across any number of backends, odd or even.",
          },
          {
            id: "b",
            label: "Three is simply the registry's default instance count.",
            correct: false,
            explanationMd: "The Application Server's own default is 1, not 3 - this number comes from the load math, not a default.",
          },
          {
            id: "c",
            label:
              "So losing any single instance under peak load still leaves the survivors covering 300 combined " +
              "(2 x 150) - headroom for a failure, not just enough for today.",
            correct: true,
            explanationMd: "Correct - N+1: size for measured load, then add one more so a single failure doesn't drop capacity below what's needed.",
          },
          {
            id: "d",
            label: "Sticky sessions require an odd number of instances to hash correctly.",
            correct: false,
            explanationMd: "Unrelated - this system externalizes sessions (3.7) and sticky routing isn't in use here at all.",
          },
        ],
      },
      {
        id: "bb-3-8-horizontal-scaling-q4",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "Three Application Server instances sit behind the load balancer, each health-checked, sized so any " +
          "two cover peak load. One instance stops responding. Assuming the tier is stateless and health " +
          "checks are working, what happens?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 240 }, config: {} },
            { id: "lb1", componentId: "load-balancer", position: { x: 220, y: 240 }, config: {} },
            { id: "s1", componentId: "app-server", position: { x: 420, y: 100 }, config: {} },
            { id: "s2", componentId: "app-server", position: { x: 420, y: 240 }, config: {} },
            { id: "s3", componentId: "app-server", position: { x: 420, y: 380 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 620, y: 240 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "c1", target: "lb1", kind: "request-flow" },
            { id: "e2", source: "lb1", target: "s1", kind: "request-flow" },
            { id: "e3", source: "lb1", target: "s2", kind: "request-flow" },
            { id: "e4", source: "lb1", target: "s3", kind: "request-flow" },
            { id: "e5", source: "s1", target: "d1", kind: "request-flow" },
            { id: "e6", source: "s2", target: "d1", kind: "request-flow" },
            { id: "e7", source: "s3", target: "d1", kind: "request-flow" },
            { id: "e8", source: "lb1", target: "s1", kind: "control" },
            { id: "e9", source: "lb1", target: "s2", kind: "control" },
            { id: "e10", source: "lb1", target: "s3", kind: "control" },
          ],
          entryPointIds: ["c1"],
        },
        options: [
          {
            id: "a",
            label: "Total outage until the dead instance is manually replaced.",
            correct: false,
            explanationMd: "Statelessness plus health-checked balancing means the survivors take over - a manual replacement isn't what restores service.",
          },
          {
            id: "b",
            label:
              "A brief blip until the next health check marks it down; after that, requests spread across the " +
              "remaining two, which together still cover peak load exactly - the third instance was headroom, " +
              "not spare capacity going to waste.",
            correct: true,
            explanationMd: "Correct - this is what N+1 buys: a real but brief gap, then full coverage from the survivors, not degraded service.",
          },
          {
            id: "c",
            label: "Nothing changes at all - the load balancer compensates instantly with zero delay.",
            correct: false,
            explanationMd: "Overclaims. The load balancer reacts on its next health check, not the instant the instance actually dies.",
          },
          {
            id: "d",
            label: "Half of all requests fail permanently, even after the health check reacts.",
            correct: false,
            explanationMd: "Overclaims permanence - once the check marks the instance down, traffic stops routing to it and the survivors cover load.",
          },
        ],
      },
      {
        id: "bb-3-8-horizontal-scaling-q5",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"Why not just get a bigger box instead of adding instances?\" Strongest answer?",
        options: [
          {
            id: "a",
            label:
              "For a small, predictable workload a bigger box can be the honest, simpler call - no load balancer " +
              "or health checks to run. But it hits a real ceiling and stays a single point of failure; " +
              "horizontal has neither limit, at the cost of the coordination already in place here.",
            correct: true,
            explanationMd: "Correct - names when vertical is genuinely the right call and what it structurally can't do, rather than dismissing it.",
          },
          {
            id: "b",
            label: "Bigger boxes are always the wrong call - horizontal scaling has no downsides.",
            correct: false,
            explanationMd: "Overclaims. Vertical scaling is a real, defensible choice for the right workload - dismissing it outright misses the trade-off.",
          },
          {
            id: "c",
            label: "Vertical scaling is cheaper at any scale, so it should always be preferred.",
            correct: false,
            explanationMd: "Overclaims the other direction - vertical scaling's cost advantage doesn't hold once a workload outgrows what one box can do.",
          },
          {
            id: "d",
            label: "The two approaches are interchangeable; the choice doesn't matter.",
            correct: false,
            explanationMd: "Dismisses a real trade-off - the two approaches fail differently, which is exactly what a senior answer names.",
          },
        ],
      },
    ],
    // Nothing to fix: every edge is already correctly wired, including the
    // Application Server -> SQL Database connection 3.7 taught. The sole
    // gap is the Instances config field, sized for exactly today's peak
    // with no headroom - matching this chapter's own Config-exercise shape
    // (§11.1), the same realization 3.6 used for its own instance-count fix.
    starterGraph: {
      nodes: [
        { id: "bb-3-8-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-8-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-8-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-8-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-8-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-8-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-8-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 2 } },
        { id: "bb-3-8-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-8-e1", source: "bb-3-8-browser", target: "bb-3-8-dns", kind: "request-flow" },
        { id: "bb-3-8-e2", source: "bb-3-8-dns", target: "bb-3-8-fw", kind: "request-flow" },
        { id: "bb-3-8-e3", source: "bb-3-8-fw", target: "bb-3-8-proxy", kind: "request-flow" },
        { id: "bb-3-8-e4", source: "bb-3-8-proxy", target: "bb-3-8-gateway", kind: "request-flow" },
        { id: "bb-3-8-e5", source: "bb-3-8-gateway", target: "bb-3-8-lb", kind: "request-flow" },
        { id: "bb-3-8-e6", source: "bb-3-8-lb", target: "bb-3-8-app", kind: "request-flow" },
        { id: "bb-3-8-e7", source: "bb-3-8-app", target: "bb-3-8-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-8-browser"],
    },
  },
  {
    id: "bb-3-9-service-discovery",
    mode: "building-blocks",
    title: "Service Discovery",
    // Real authored content (Wave 3 continuation, fourth and final Group B
    // chapter). Spec: specs/bb-3-9-service-discovery.spec.md. Lesson body:
    // public/content/chapters/bb-3-9-service-discovery.mdx. Real
    // curriculum-order prerequisite (3.8) is already shipped in this same
    // working tree - manifest.ts's prerequisiteSlugs already points at
    // "3-8-horizontal-scaling", no pulled-forward exception needed.
    problemStatement:
      "This system's public DNS record still carries the 300-second default TTL set back in 3.2. " +
      "Ops is cutting the whole stack over to new infrastructure with a 30-second downtime budget.",
    exerciseGoal: "Make sure no client is still hitting the old address once the cutover window has closed.",
    successCriteria: [
      "The DNS node's cached answers cannot outlive the deploy's own downtime budget.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7); all five required categories
    // represented - Practical included for the same reason 3.6/3.7/3.8's own
    // specs gave (a real Submit-gated exercise exists here).
    learningObjectives: [
      "State what the registry pattern actually answers (\"who currently counts as this service\") as distinct from what routing answers (\"how do I reach it\").",
      "Explain why the load balancer (3.4) is already a working instance of service discovery for one tier, and why the pattern needs generalizing only once more than one internal service needs the same answer.",
      "Contrast health-check-driven freshness (near-immediate, costs polling) against TTL-driven freshness (cheap, costs a bounded staleness window), and state which mechanism this system already uses for each.",
      "Lower a starter graph's DNS node ttlSeconds until it no longer outlasts a stated cutover downtime budget, and pass Submit.",
      "Answer \"how does service A find service B once B's instances change?\" naming a registry or DNS-based equivalent, driven by health checks, sized against real churn.",
      "Predict whether a newly autoscaled instance receives traffic before or after it passes its first health check, and explain why existing physically isn't the same as being a traffic-eligible member.",
    ],
    // Cumulative palette through 3.8, unchanged - this chapter's own §16
    // audit row is "New: none." The load balancer (3.4) is reused as the
    // chapter's own worked example of an already-built registry-shaped
    // mechanism; DNS (3.2) is reused for its ttlSeconds field as the
    // concrete, on-canvas freshness/cost knob.
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    // No new rule authored - §14's row names none for 3.9, and no existing
    // rule inspects the dns component's config (verified against
    // src/validation-engine/rules/index.ts). Curated set matches 3.8's own
    // list unchanged - none of these fire on this chapter's own gap (a
    // config value on dns, not a topology or capacity fault), the same
    // Config-exercise-gated-by-blueprint-alone shape 3.4 and 3.8 both used.
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "single-instance-load-balancer",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-3-9-blueprint",
        label: "The same system, a freshness window that can't outlast a cutover",
        require: {
          id: "bb-3-9-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns", config: [{ field: "ttlSeconds", op: "lte", value: 30 }] },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server", config: [{ field: "instances", op: "gte", value: 3 }] },
            { alias: "db", componentId: "sql-database" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
          ],
        },
        commentary:
          "Nothing about the topology changed - same DNS record, same load balancer, same three " +
          "app-server instances. Only the TTL moved, from a default nobody had revisited since 3.2 to " +
          "a number that can't outlast the cutover it's meant to survive. That's the whole chapter: " +
          "membership freshness is a config value with a real cost on both sides, not a detail to " +
          "leave at its default.",
      },
    ],
    hints: [
      {
        id: "bb-3-9-hint-1",
        body:
          "Validate is already clean here - nothing is wired wrong. The gap is between how long the " +
          "DNS node's current answer stays cached and how long the upcoming cutover is actually " +
          "supposed to take.",
      },
      {
        id: "bb-3-9-hint-2",
        body:
          "At the current 300-second TTL, anyone who resolved the old address in the last five " +
          "minutes keeps using it - about ten times longer than the cutover's own 30-second downtime " +
          "budget.",
      },
      {
        id: "bb-3-9-hint-3",
        body: "Lower the DNS node's ttlSeconds field until a cached answer can't outlast the cutover itself.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group B: Compute - Chapter 3.9 of 37 (fourth and final chapter in Group B).",
      masteredConcepts: [
        "The load balancer's job: distribute traffic across multiple identical backends, health-checked (3.4).",
        "Statelessness: any instance can answer any request (3.6); session state lives in a shared store, not pinned to one instance (3.7).",
        "Horizontal scaling: sizing instance count for measured load plus headroom for a single failure, as a config value (3.8).",
        "DNS resolves a name to an address and caches that answer for ttlSeconds (3.2) - introduced but not yet load-bearing until this chapter.",
        "2.3's own foreshadow: copies of the app tier only work if a request can land anywhere (Group B's motivating pressure, now closed out).",
      ],
      notYetIntroducedConcepts: [
        "A dedicated registry component or service (Consul/etcd/ZooKeeper-shaped) - this curriculum's palette has none; the load balancer's own health-check mechanism is the only on-canvas instance of the pattern.",
        "Autoscaling as an automated decision engine (when to add/remove instances) - assumed to already be happening, never built.",
        "Leader/follower roles and failover (3.26) - membership tracking is their precondition, not the mechanism itself.",
        "Everything past Group B - data, caching, async systems, storage, and reliability.",
      ],
      simplifications: [
        "`control`-kind edges (health signals feeding a registry's membership decision) are described in prose and diagrams only - " +
          "no registry component accepts one on canvas today (checked directly against every registered component's own " +
          "`relations` field), the same disclosed gap 3.4 and 3.8 already named.",
        "DNS's ttlSeconds is used as the on-canvas vehicle for the general freshness/cost trade-off, not as a claim that this " +
          "graph's DNS node discovers app-server instances - in this topology DNS resolves the stack's public entry point; " +
          "the load balancer already does real service discovery for the app tier (3.4). Stated directly in the lesson's own " +
          "\"Two ways to answer 'who's current'\" section, not left implicit in this list alone.",
        "The 30-second cutover downtime budget is an illustrative worked example, not a claim about any real system's " +
          "measured migration window - used to make the freshness-window reasoning concrete without asking the learner to " +
          "invent a number from scratch.",
      ],
    },
    // Five questions, ramp 1/1/2/2/3. Q3 models QUIZ_FRAMEWORK.md §9's own
    // bank Q7 (tagged "(3.9)"); Q5 models the same bank's Q9 (tagged "(3.9,
    // 3.4)"). Q4 (diagram kind) is original, realizing CURRICULUM's row's
    // "trace" exercise element as a predict-then-check question per
    // pending-content.md's own named degradation path (no simulator UI
    // exists), distinct from bank Q6 (already used by 3.8's own Q4, an
    // existing instance dying) and from this chapter's own Q5 (an instance
    // that passes its check but is broken anyway). Position-clustering
    // checked by eye: correct options sit at a, c, d, b, a - all four
    // positions used, "a" the only repeat (Q1, Q5), and the opening letter
    // (a) is the one none of 3.6 ("c"), 3.7 ("b"), or 3.8 ("d") used, so all
    // four Group B chapters now open on a different letter from each other.
    quiz: [
      {
        id: "bb-3-9-service-discovery-q1",
        kind: "single",
        difficulty: 1,
        prompt: "The registry pattern (or a load balancer acting as one) exists to answer which question?",
        options: [
          {
            id: "a",
            label: "Who currently counts as a healthy member of this service - not how to route to any one of them.",
            correct: true,
            explanationMd: "Correct. Routing (how to reach an instance) and membership (who's currently alive) are different questions - discovery answers the second one.",
          },
          {
            id: "b",
            label: "Which network path has the lowest latency between two machines.",
            correct: false,
            explanationMd: "That's a routing/networking concern, not what service discovery tracks.",
          },
          {
            id: "c",
            label: "How to encrypt traffic between services.",
            correct: false,
            explanationMd: "That's TLS's job, unrelated to tracking which instances currently exist.",
          },
          {
            id: "d",
            label: "How many total requests per second the system can handle.",
            correct: false,
            explanationMd: "That's a capacity question (3.8's own topic), not a membership question.",
          },
        ],
      },
      {
        id: "bb-3-9-service-discovery-q2",
        kind: "single",
        difficulty: 1,
        prompt: "This system uses two different freshness strategies: the load balancer's health checks (3.4), and DNS's ttlSeconds (3.2). What's the real trade-off between them?",
        options: [
          {
            id: "a",
            label: "Health checks are always better, since DNS-based freshness has no legitimate use.",
            correct: false,
            explanationMd: "Overclaims - DNS-based freshness is a real, legitimate strategy, cheap and widely used; it just has a different cost profile.",
          },
          {
            id: "b",
            label: "TTL-based freshness is always cheaper and should replace health checks everywhere.",
            correct: false,
            explanationMd: "Health checks catch failures near-immediately; replacing them with a TTL would reintroduce a staleness window the load balancer doesn't have today.",
          },
          {
            id: "c",
            label: "Health checks detect failure near-immediately at the cost of polling load; TTL-based caching is cheap per lookup but can stay stale for up to the full TTL.",
            correct: true,
            explanationMd: "Correct. Both are legitimate; the choice is about which cost (polling load vs. a bounded staleness window) fits the situation.",
          },
          {
            id: "d",
            label: "There is no real difference - both mechanisms behave identically in practice.",
            correct: false,
            explanationMd: "They behave differently: one is an active probe with near-immediate detection, the other is a cached answer with a bounded delay.",
          },
        ],
      },
      {
        id: "bb-3-9-service-discovery-q3",
        kind: "single",
        difficulty: 2,
        prompt: "Instances now scale up and down automatically. Hardcoding today's instance addresses into a config file instead of relying on health-driven membership breaks because:",
        options: [
          {
            id: "a",
            label: "Config files have a hard size limit that a growing instance list will eventually exceed.",
            correct: false,
            explanationMd: "Not the real failure mode - the list going stale happens long before any size limit would matter.",
          },
          {
            id: "b",
            label: "Autoscaling and hardcoded configs are fundamentally incompatible and can never coexist.",
            correct: false,
            explanationMd: "Overclaims - plenty of systems ran this way before autoscaling; it's slow and error-prone, not impossible.",
          },
          {
            id: "c",
            label: "The load balancer can no longer reload its configuration once it starts.",
            correct: false,
            explanationMd: "Not the mechanism here - the problem is the list being wrong, not the load balancer's ability to reload it.",
          },
          {
            id: "d",
            label: "Membership is now dynamic - the set of healthy instances changes faster than a hand-edited list can be kept accurate.",
            correct: true,
            explanationMd: "Correct. The list drifts from reality within the first scale-up or scale-down, exactly the gap health-driven discovery closes.",
          },
        ],
      },
      {
        id: "bb-3-9-service-discovery-q4",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "A fourth Application Server instance was added by autoscaling two seconds ago and has not yet completed its first health check. Does it receive traffic yet?",
        graph: {
          nodes: [
            { id: "q4-c1", componentId: "client", position: { x: 40, y: 240 }, config: {} },
            { id: "q4-lb1", componentId: "load-balancer", position: { x: 220, y: 240 }, config: {} },
            { id: "q4-s1", componentId: "app-server", position: { x: 400, y: 80 }, config: {} },
            { id: "q4-s2", componentId: "app-server", position: { x: 400, y: 240 }, config: {} },
            { id: "q4-s3", componentId: "app-server", position: { x: 400, y: 400 }, config: {} },
            { id: "q4-s4", componentId: "app-server", position: { x: 400, y: 560 }, config: {} },
            { id: "q4-d1", componentId: "sql-database", position: { x: 580, y: 240 }, config: {} },
          ],
          edges: [
            { id: "q4-e1", source: "q4-c1", target: "q4-lb1", kind: "request-flow" },
            { id: "q4-e2", source: "q4-lb1", target: "q4-s1", kind: "request-flow" },
            { id: "q4-e3", source: "q4-lb1", target: "q4-s2", kind: "request-flow" },
            { id: "q4-e4", source: "q4-lb1", target: "q4-s3", kind: "request-flow" },
            { id: "q4-e5", source: "q4-lb1", target: "q4-s4", kind: "request-flow" },
            { id: "q4-e6", source: "q4-s1", target: "q4-d1", kind: "request-flow" },
            { id: "q4-e7", source: "q4-s2", target: "q4-d1", kind: "request-flow" },
            { id: "q4-e8", source: "q4-s3", target: "q4-d1", kind: "request-flow" },
            { id: "q4-e9", source: "q4-s4", target: "q4-d1", kind: "request-flow" },
            { id: "q4-e10", source: "q4-lb1", target: "q4-s1", kind: "control" },
            { id: "q4-e11", source: "q4-lb1", target: "q4-s2", kind: "control" },
            { id: "q4-e12", source: "q4-lb1", target: "q4-s3", kind: "control" },
            { id: "q4-e13", source: "q4-lb1", target: "q4-s4", kind: "control" },
          ],
          entryPointIds: ["q4-c1"],
        },
        options: [
          {
            id: "a",
            label: "Yes - existing behind the load balancer is enough to start receiving traffic immediately.",
            correct: false,
            explanationMd: "Existing physically isn't the same as being a member - the registry (here, the load balancer's own check) hasn't confirmed it's healthy yet.",
          },
          {
            id: "b",
            label: "No - it's excluded from routing until it passes its first health check and is added to the healthy set.",
            correct: true,
            explanationMd: "Correct. Membership is health-driven: an instance only becomes eligible for traffic once its first check succeeds, not the moment it exists.",
          },
          {
            id: "c",
            label: "Yes, but only for read requests until the check passes.",
            correct: false,
            explanationMd: "Health-driven membership doesn't split by request type - an instance is either a member or it isn't.",
          },
          {
            id: "d",
            label: "No - new instances are never added to an existing load balancer's rotation.",
            correct: false,
            explanationMd: "Overclaims - new instances are added routinely (that's the whole point of autoscaling); the gate is the health check, not a ban on joining.",
          },
        ],
      },
      {
        id: "bb-3-9-service-discovery-q5",
        kind: "single",
        difficulty: 3,
        prompt: "An interviewer follow-up: \"An autoscaled instance passes its health check, but every request it serves errors. Old instances are fine. What's going on?\"",
        options: [
          {
            id: "a",
            label: "The health check confirms the process is running (liveness), not that it can actually do its job (readiness) - a passing check and a broken app can coexist.",
            correct: true,
            explanationMd: "Correct. Liveness and readiness are different questions; a check that only verifies the process is up says nothing about a missing config or dependency.",
          },
          {
            id: "b",
            label: "The load balancer is over capacity and dropping requests at random.",
            correct: false,
            explanationMd: "Doesn't explain why only the new instances fail while old ones are fine under the same load.",
          },
          {
            id: "c",
            label: "DNS is returning a stale address for the new instances.",
            correct: false,
            explanationMd: "DNS in this system resolves the public entry point, not individual app-server addresses - it isn't in the path this symptom would come from.",
          },
          {
            id: "d",
            label: "The database is rejecting connections from the new instances' IP addresses.",
            correct: false,
            explanationMd: "Possible in principle, but doesn't fit \"passes its health check\" - a rejected DB connection would typically fail the check too if the check exercises real dependencies.",
          },
        ],
      },
    ],
    // Nothing to fix: every edge is already correctly wired, and instance
    // count is already at 3.8's own passing bar (instances: 3). The sole
    // gap is the DNS node's ttlSeconds, still at 3.2's own 300-second
    // default and never revisited until now - matching this chapter's own
    // Config-exercise shape (§11.1), the same realization 3.4 and 3.8 used.
    starterGraph: {
      nodes: [
        { id: "bb-3-9-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-9-dns", componentId: "dns", position: { x: 380, y: 0 }, config: { ttlSeconds: 300 } },
        { id: "bb-3-9-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-9-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-9-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-9-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-9-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 3 } },
        { id: "bb-3-9-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-9-e1", source: "bb-3-9-browser", target: "bb-3-9-dns", kind: "request-flow" },
        { id: "bb-3-9-e2", source: "bb-3-9-dns", target: "bb-3-9-fw", kind: "request-flow" },
        { id: "bb-3-9-e3", source: "bb-3-9-fw", target: "bb-3-9-proxy", kind: "request-flow" },
        { id: "bb-3-9-e4", source: "bb-3-9-proxy", target: "bb-3-9-gateway", kind: "request-flow" },
        { id: "bb-3-9-e5", source: "bb-3-9-gateway", target: "bb-3-9-lb", kind: "request-flow" },
        { id: "bb-3-9-e6", source: "bb-3-9-lb", target: "bb-3-9-app", kind: "request-flow" },
        { id: "bb-3-9-e7", source: "bb-3-9-app", target: "bb-3-9-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-9-browser"],
    },
  },
  {
    id: "bb-3-10-databases",
    mode: "building-blocks",
    title: "Databases",
    // Real authored content (first Group C chapter, authored immediately
    // after Group B completed in this working tree). Spec:
    // specs/bb-3-10-databases.spec.md. Lesson body:
    // public/content/chapters/bb-3-10-databases.mdx. Real curriculum-order
    // prerequisite (3.9) is already shipped in this same working tree -
    // manifest.ts's prerequisiteSlugs already points at
    // "3-9-service-discovery", no pulled-forward exception needed.
    problemStatement:
      "Every service you've built since 1.2 ends at the same single database, never duplicated for " +
      "free the way the app tier was. This chapter asks what that database actually promises (ACID, " +
      "at concept level), why an index turns a scan into a lookup, and why the moves that come after " +
      "this chapter spend correctness rather than money. No build: the knowledge check is whether you " +
      "can read a query's cost off its own access pattern and defend the guarantees you're relying on.",
    // Five objectives (§5.2 allows 3-7). Practical omitted per §5.2's own
    // carve-out for pure Concept chapters (matching 2.3's precedent) - see
    // spec §0 for why no Editor exercise exists here despite a non-empty
    // palette.
    learningObjectives: [
      "State what each of the four ACID guarantees actually promises, and why naively duplicating a database breaks all four at once.",
      "Explain why an index turns a table scan into a lookup, and what it costs on every write.",
      "Diagnose whether a slow query is failing because of table size (an uncached scan) before reaching for a replica, a cache, or a bigger machine.",
      "Answer \"how would you make this query fast at scale?\" naming indexing as the first, cheapest lever, before any infrastructure change.",
      "Justify a query's cost out loud by pointing at its access pattern (scan vs. lookup), not the table's row count alone.",
    ],
    // Cumulative palette through 3.9, unchanged - this chapter's own §16
    // audit row is absent (3.6-3.10 are intentional no-component Concept
    // chapters). CURRICULUM's own row: "New: none (deepens sql-database)."
    availableComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    requiredComponentIds: ["browser", "dns", "firewall", "reverse-proxy", "api-gateway", "load-balancer", "app-server", "sql-database"],
    // No Editor exercise (see hasEditorExercise below) - no rules to curate.
    validationRuleIds: [],
    blueprints: [],
    // False: no construction-family exercise. CURRICULUM §14's own row asks
    // for a "config (indexes; observe simulated query cost)" exercise, but
    // sql-database's only field is `engine` (postgres/mysql) - no `indexes`
    // field or query-cost simulation exists anywhere in the engine (checked
    // against src/content/components/config/data.ts and every registered
    // validation rule). Not hacked around: the scan-vs-index cost is taught
    // via diagram and realized as quiz Q4 (a predict-then-check, the same
    // no-simulator workaround 3.9's own Q4 used), and "quiz-weighted" is
    // CURRICULUM's own row's own wording for this chapter. See spec §0 and
    // the new open decision recorded in pending-chapters.md.
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-3-10-hint-1",
        body:
          "A slow query's first diagnosis question is whether it's scanning or using an index - table " +
          "size explains why something that was fine yesterday is slow today, not a code change.",
      },
      {
        id: "bb-3-10-hint-2",
        body:
          "An index trades write cost for read speed. If an option claims an index is free, check what " +
          "it costs on the way in, not just the way out.",
      },
      {
        id: "bb-3-10-hint-3",
        body:
          "When duplication is on the table, ask what happens the instant two independent copies both " +
          "accept a write. If there's no way to say which one is \"the\" answer, ACID's guarantees " +
          "stopped holding.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group C: Data - Chapter 3.10 of 37 (first chapter in Group C).",
      masteredConcepts: [
        "The load balancer distributes traffic across health-checked backends (3.4); app-server instances are stateless and interchangeable (3.6); displaced session state lives in a shared store (3.7); instance count is a sized config value (3.8); membership is health-driven (3.9).",
        "2.3's own foreshadow: every instance reads and writes the same database, and the moves available there spend correctness rather than money (Group C's own motivating pressure, now examined directly).",
        "sql-database has been part of the system since 1.2, most recently reused in 3.7 as an explicit session store with a promised faster layer arriving in 3.14.",
      ],
      notYetIntroducedConcepts: [
        "The SQL-vs-NoSQL decision procedure (3.11) - this chapter assumes a relational store without defending the choice.",
        "Replication roles, replication lag, and read-your-writes (3.12).",
        "Sharding, shard keys, and hot partitions (3.13).",
        "Caching and distributed caching (3.14) - the faster layer 3.7 already promised.",
        "Isolation levels and concurrency-control mechanics beyond the one-sentence ACID definition - out of ScaleCraft's depth budget at this stage (§20.2), homed in the private textbook.",
        "Everything past Group C.",
      ],
      simplifications: [
        "ACID is taught at concept level only - one sentence per guarantee, no isolation-level taxonomy " +
          "(read committed vs. serializable, etc.). The detail doesn't change any decision this stage " +
          "asks the learner to make.",
        "No `indexes` config field or query-cost simulation exists on sql-database today (checked " +
          "directly against every registered component's own `fields` and every registered validation " +
          "rule) - the scan-vs-index cost is taught through diagrams and a predict-then-check quiz " +
          "question, not a buildable canvas exercise, matching CURRICULUM's own row wording for this " +
          "chapter (\"quiz-weighted\"). Recorded as a new open decision in pending-chapters.md, same " +
          "discipline as the `control`-edge gap named at 3.4.",
        "The Stack Overflow production example is stated at decision level from public material (a " +
          "small number of powerful machines, heavy indexing discipline before sharding) with no " +
          "throughput or hardware figures the argument depends on.",
      ],
    },
    // Six questions (§3's sanctioned 3-6 range), ramp 1/1/1/2/2/3 rounding to
    // roughly QUIZ_FRAMEWORK.md §3's 30/45/25 split, leaning slightly toward
    // "quiz-weighted" per CURRICULUM's own row. Q1 and Q3 model
    // QUIZ_FRAMEWORK.md §10's own bank Q1/Q2 (both tagged "(3.10)"),
    // reworded rather than reproduced verbatim. Q4 (diagram kind) is
    // original, realizing CURRICULUM's row's "observe simulated query cost"
    // element as a predict-then-check question, the same no-simulator
    // workaround 3.9's own Q4 established. Correct options sit at c, a, d,
    // b, a, c - all four positions used, "a" and "c" the only repeats, and
    // no letter appears twice in a row.
    quiz: [
      {
        id: "bb-3-10-databases-q1",
        kind: "single",
        difficulty: 1,
        prompt: "An index makes a lookup faster because it:",
        options: [
          {
            id: "a",
            label: "Stores the whole table in memory instead of on disk.",
            correct: false,
            explanationMd: "That's what a cache does (3.14), not what an index does - an index is still stored on disk alongside the table.",
          },
          {
            id: "b",
            label: "Compresses the table so there's less data to read.",
            correct: false,
            explanationMd: "Compression and indexing are different mechanisms - an index doesn't shrink the table, it changes how it's searched.",
          },
          {
            id: "c",
            label: "Maintains a separate, sorted structure that turns a per-row scan into a small number of jumps - at the cost of extra work on every write.",
            correct: true,
            explanationMd: "Correct. The read speedup is real, and it isn't free: every write now has to keep that sorted structure current too.",
          },
          {
            id: "d",
            label: "Duplicates the table onto a second machine.",
            correct: false,
            explanationMd: "That's replication (3.12), a different mechanism solving a different problem (copies for reads/safety, not lookup speed).",
          },
        ],
      },
      {
        id: "bb-3-10-databases-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Your database acknowledges a write, and the machine crashes one second later. When it restarts, the row is still there. Which ACID guarantee is this?",
        options: [
          {
            id: "a",
            label: "Durability - once a write is acknowledged, it survives a crash the instant after.",
            correct: true,
            explanationMd: "Correct. That's exactly what durability promises - the acknowledgment itself is a claim about surviving a crash.",
          },
          {
            id: "b",
            label: "Atomicity - the write finished completely rather than half-applying.",
            correct: false,
            explanationMd: "Atomicity is about a multi-step write completing entirely or not at all, not about surviving a crash after it's done.",
          },
          {
            id: "c",
            label: "Consistency - the write obeyed the data's own declared rules.",
            correct: false,
            explanationMd: "Consistency is about the write respecting constraints (like a balance never going negative), not about crash survival.",
          },
          {
            id: "d",
            label: "Isolation - no other transaction saw the write half-finished.",
            correct: false,
            explanationMd: "Isolation is about concurrent transactions not seeing each other's unfinished work, not about what happens after a crash.",
          },
        ],
      },
      {
        id: "bb-3-10-databases-q3",
        kind: "single",
        difficulty: 2,
        prompt: "A query is fast against a 10k-row table and unusably slow against the same table at 100M rows. The FIRST thing to check:",
        options: [
          {
            id: "a",
            label: "Whether the network between the app server and the database got slower.",
            correct: false,
            explanationMd: "Nothing about growing the table changes network latency - the symptom points at the query itself, not the network.",
          },
          {
            id: "b",
            label: "Whether the programming language driving the query changed.",
            correct: false,
            explanationMd: "The query's own cost against the data is the issue here, not which language issued it.",
          },
          {
            id: "c",
            label: "Whether the client machine running the app server has enough RAM.",
            correct: false,
            explanationMd: "The cost lives in the database's own read pattern, not the calling machine's memory.",
          },
          {
            id: "d",
            label: "Whether the query is scanning every row instead of using an index - growth turns a scan from invisible into catastrophic.",
            correct: true,
            explanationMd: "Correct. A scan's cost grows with row count; at 10k rows that's invisible, at 100M it's the whole problem.",
          },
        ],
      },
      {
        id: "bb-3-10-databases-q4",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "This SQL Database holds a users table with no index on email. A login query filters WHERE email = ?. The table is about to grow from 5M rows to 50M. What happens to that query's cost, and why?",
        graph: {
          nodes: [
            { id: "q4-c1", componentId: "client", position: { x: 60, y: 200 }, config: {} },
            { id: "q4-a1", componentId: "app-server", position: { x: 260, y: 200 }, config: {} },
            { id: "q4-d1", componentId: "sql-database", position: { x: 460, y: 200 }, config: {} },
          ],
          edges: [
            { id: "q4-e1", source: "q4-c1", target: "q4-a1", kind: "request-flow" },
            { id: "q4-e2", source: "q4-a1", target: "q4-d1", kind: "request-flow" },
          ],
          entryPointIds: ["q4-c1"],
        },
        options: [
          {
            id: "a",
            label: "It gets cheaper - more rows means better statistics for the query planner to work with.",
            correct: false,
            explanationMd: "Overclaims - with no index, there's no planner shortcut available; more rows to check only adds cost.",
          },
          {
            id: "b",
            label: "It gets roughly 10x more expensive - with no index, the query scans every row, so cost scales directly with row count.",
            correct: true,
            explanationMd: "Correct. A scan checks every row; 10x the rows means roughly 10x the work, with no index to shortcut it.",
          },
          {
            id: "c",
            label: "It becomes impossible to run at all once the table crosses a fixed row-count limit.",
            correct: false,
            explanationMd: "Overclaims - there's no hard cutoff; the query keeps running, just proportionally slower as rows grow.",
          },
          {
            id: "d",
            label: "It stays about the same - the database automatically compensates for table growth.",
            correct: false,
            explanationMd: "Databases don't add indexes on their own - with no index, growth is passed straight through to query cost.",
          },
        ],
      },
      {
        id: "bb-3-10-databases-q5",
        kind: "single",
        difficulty: 3,
        prompt: "A teammate proposes adding an index to every column on a heavily-written table, \"just to be safe.\" What's wrong with the plan?",
        options: [
          {
            id: "a",
            label: "Every index adds work to every write and consumes disk space - only the columns actual queries filter or sort on are worth the cost.",
            correct: true,
            explanationMd: "Correct. Indexing is a trade, not a free upgrade - on a heavily-written table, that write cost compounds fast.",
          },
          {
            id: "b",
            label: "Nothing - more indexes can only help query performance, never hurt it.",
            correct: false,
            explanationMd: "Overclaims - every index adds write-side cost regardless of whether any query ever uses it.",
          },
          {
            id: "c",
            label: "Databases silently ignore indexes past a fixed maximum count, so the extra ones do nothing.",
            correct: false,
            explanationMd: "Not a real mechanism - the indexes are maintained (and cost write time) whether or not that's the actual failure mode here.",
          },
          {
            id: "d",
            label: "Indexes only help tables under 10k rows, so a heavily-written table wouldn't benefit anyway.",
            correct: false,
            explanationMd: "Inverts the real relationship - an index's read benefit grows with table size; the problem here is write cost, not a size ceiling.",
          },
        ],
      },
      {
        id: "bb-3-10-databases-q6",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"Reads got slow as the product grew. Walk me through your first move.\" Strongest answer:",
        options: [
          {
            id: "a",
            label: "Add a read replica immediately - more copies always fix read latency.",
            correct: false,
            explanationMd: "Skips the cheaper diagnosis - a replica copies whatever cost the query already has, including a scan.",
          },
          {
            id: "b",
            label: "Shard the database so each machine handles a smaller slice of the data.",
            correct: false,
            explanationMd: "Sharding buys capacity at a permanent complexity cost (3.13) - reaching for it before cheaper levers are exhausted is premature.",
          },
          {
            id: "c",
            label: "Check whether the slow query is scanning instead of using an index - it's the cheapest fix and often the actual cause, before adding any new infrastructure.",
            correct: true,
            explanationMd: "Correct. Naming the cheapest, most likely fix first (and only escalating past it) is the senior signal here.",
          },
          {
            id: "d",
            label: "Switch to a NoSQL store, since relational databases don't scale.",
            correct: false,
            explanationMd: "Folklore, not a diagnosis - a well-indexed relational database on real hardware carries far more load than this assumes (see the Stack Overflow example).",
          },
        ],
      },
    ],
  },
  {
    id: "bb-3-11-sql-vs-nosql",
    mode: "building-blocks",
    title: "SQL vs. NoSQL",
    // Real authored content (second Group C chapter, authored immediately
    // after 3.10 in this same working tree). Spec:
    // specs/bb-3-11-sql-vs-nosql.spec.md. Lesson body:
    // public/content/chapters/bb-3-11-sql-vs-nosql.mdx. Real curriculum-order
    // prerequisite (3.10) is already shipped in this same working tree -
    // manifest.ts's prerequisiteSlugs already points at "3-10-databases", no
    // pulled-forward exception needed.
    problemStatement:
      "3.10 assumed a relational store was always the answer and never defended it. The catalog's " +
      "relational schema has been fighting its own data every sprint - a NoSQL Database already " +
      "sits on the canvas, disconnected and configured for the wrong shape.",
    exerciseGoal:
      "Give the catalog a store that actually fits how its data looks and how it's accessed - not " +
      "the one 3.10 defaulted to.",
    successCriteria: [
      "The NoSQL Database's model configuration matches the catalog's actual data shape.",
      "The Application Server can read and write through it.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7). All five categories present -
    // Building Block type per §4/§16 (introduces nosql-database), so the
    // Practical exemption 3.10's own Concept classification used doesn't
    // apply here.
    learningObjectives: [
      "State the decision procedure for a store choice: does the data need multi-row transactions or joins across entities, does its shape vary row to row, will writes outgrow one machine - roughly in that order.",
      "Explain what a NoSQL store trades away (multi-row transactions, ad-hoc joins) for what it gains (a schema that varies row to row, horizontal write scale built in).",
      "Given a workload's shape, access pattern, and scale, decide SQL, NoSQL, or defend \"either\" - and name the cost of the choice, not just the benefit.",
      "Add a NoSQL Database configured with the model matching a given workload's data shape, connect it to the Application Server, and pass Submit.",
      "Answer \"would you use SQL or NoSQL here?\" by naming the actual constraint the workload puts on the store, not a memorized rule.",
      "Defend a store choice out loud, naming both what it buys and what it costs, for a workload where the answer is genuinely \"either.\"",
    ],
    // Cumulative palette through 3.10 plus this chapter's own new component.
    // CURRICULUM §16's own row: "3.11 | nosql-database".
    availableComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
    ],
    requiredComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
    ],
    // Curated set matches 3.7's own list minus request-flow-cycle (this
    // exercise's only possible mistakes are a missing wire and a wrong
    // config value, not a cycle) - a wired-but-misconfigured node is caught
    // by the blueprint's own config predicate, not a standalone rule.
    validationRuleIds: ["no-direct-client-database", "component-relations", "orphan-component", "missing-input-connection"],
    blueprints: [
      {
        id: "bb-3-11-blueprint",
        label: "The catalog gets a store that fits its shape",
        require: {
          id: "bb-3-11-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
            { alias: "nosql", componentId: "nosql-database", config: [{ field: "model", op: "eq", value: "document" }] },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
            { from: "app", to: "nosql", kind: "request-flow" },
          ],
        },
        commentary:
          "The SQL Database never moved - orders and accounts still need the transactions it gives " +
          "for free. What changed is that the catalog's own varying-attribute problem now has a store " +
          "shaped for it: `model: document` holds a record that can vary field to field with no " +
          "migration, which is exactly what the fixed relational schema was fighting every sprint. " +
          "This is the chapter's own thesis in miniature - not a replacement, a second store for a " +
          "second shape.",
      },
    ],
    hasEditorExercise: true,
    hints: [
      {
        id: "bb-3-11-hint-1",
        body:
          "Validate is naming a component with no incoming connection - that's a wiring problem, " +
          "separate from whatever the NoSQL Database's own config is set to.",
      },
      {
        id: "bb-3-11-hint-2",
        body:
          "Look at what the catalog's own attributes do from one product category to the next before " +
          "trusting the `model` value that's already there - it was set to a guess, not an answer.",
      },
      {
        id: "bb-3-11-hint-3",
        body:
          "A key-value store answers \"give me the value for this exact key,\" nothing else. Ask " +
          "whether that's actually the catalog's problem, or something a different `model` value " +
          "describes better.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group C: Data - Chapter 3.11 of 37 (second chapter in Group C).",
      masteredConcepts: [
        "sql-database has been part of the system since 1.2, and 3.10 named what it actually promises (ACID at concept level) and why an index turns a scan into a lookup - this chapter assumes that lesson without repeating it.",
        "2.3's own foreshadow: every instance reaches one database, and it is now the ceiling (Group C's own motivating pressure) - 3.10 examined the ceiling directly; this chapter examines whether a relational store was the right shape to hit it with in the first place.",
        "The full request chain through 3.10 (browser through app-server to sql-database) is unchanged and still passing - nothing about it broke, a second, different-shaped problem was added alongside it.",
      ],
      notYetIntroducedConcepts: [
        "Replication, primary/replica roles, and read-your-writes (3.12).",
        "Sharding, shard keys, and hot partitions (3.13) - named here only as the SQL-side answer to the same write-ceiling pressure a NoSQL store solves natively.",
        "Caching and distributed caching (3.14).",
        "CAP theorem and isolation-level depth for NoSQL consistency models beyond \"usually strong per key, weaker across entities\" - out of ScaleCraft's depth budget at this stage (§20.2), homed in the private textbook.",
        "Everything past Group C.",
      ],
      simplifications: [
        "NoSQL consistency is taught at one sentence of depth (\"usually strongly consistent per key, " +
          "weaker guarantees across entities\") with no CAP-theorem taxonomy - the detail doesn't change " +
          "any decision this stage asks the learner to make.",
        "The four `model` values (key-value, document, wide-column, graph) are named with one " +
          "distinguishing sentence each, not taught in depth - matching §20.4's new-idea-cluster budget " +
          "for a single chapter; a deeper pass on any one model would be its own chapter's worth of " +
          "material, not this one's.",
        "The \"either\" scenario's real-world deciding factor (what a team already operates well) is " +
          "named honestly as outside what a decision tree can encode, not modeled as a fourth branch.",
        "The Discord production example is stated at decision level from public material (message " +
          "volume and access pattern drove a wide-column NoSQL store) with no throughput or hardware " +
          "figures the argument depends on.",
      ],
    },
    // Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
    // 3.10's own ramp. Q3 and Q5 adapt QUIZ_FRAMEWORK.md §10's own bank Q3
    // and Q4 (both tagged "(3.11)", reserved for this exact chapter),
    // reworded with fresh option labels rather than reproduced verbatim. Q1,
    // Q2, Q4, and Q6 are original. Correct options sit at b, d, a, c, b, d -
    // all four positions used, "b" and "d" the only repeats, no letter
    // repeats in consecutive questions, and the chapter doesn't open on "c"
    // the way 3.10 did.
    quiz: [
      {
        id: "bb-3-11-sql-vs-nosql-q1",
        kind: "single",
        difficulty: 1,
        prompt: "The right first question when choosing between a SQL and a NoSQL store for a new workload is:",
        options: [
          {
            id: "a",
            label: "Which one is faster.",
            correct: false,
            explanationMd: "Neither is categorically faster - both are fast at the access pattern they're built for and slow outside it.",
          },
          {
            id: "b",
            label: "Whether the data needs multi-row transactions or joins, how its shape varies, and how writes need to scale.",
            correct: true,
            explanationMd: "Correct. Shape and access pattern decide it first; scale only breaks the tie for what's left.",
          },
          {
            id: "c",
            label: "Which one the last project used.",
            correct: false,
            explanationMd: "Familiarity is a real, honest factor in the \"either\" case - but it's not the first question, and it isn't one at all when the workload's shape already decides.",
          },
          {
            id: "d",
            label: "Which one is more scalable in general.",
            correct: false,
            explanationMd: "\"More scalable\" isn't a property of the store in isolation - a well-indexed SQL store outscales a badly-fit NoSQL one for the wrong workload.",
          },
        ],
      },
      {
        id: "bb-3-11-sql-vs-nosql-q2",
        kind: "single",
        difficulty: 1,
        prompt: "What does a NoSQL store typically give up in exchange for a flexible schema and built-in horizontal write scale?",
        options: [
          {
            id: "a",
            label: "The ability to store JSON-shaped data.",
            correct: false,
            explanationMd: "Backwards - a document-shaped NoSQL store is built specifically for JSON-shaped records.",
          },
          {
            id: "b",
            label: "Durability of acknowledged writes.",
            correct: false,
            explanationMd: "Durability isn't the trade here - what's given up is multi-row transactions and joins across entities, not whether a single write survives a crash.",
          },
          {
            id: "c",
            label: "All consistency guarantees, even within a single key.",
            correct: false,
            explanationMd: "Overclaims - most NoSQL stores are strongly consistent per key; what's actually given up is guarantees across entities, not correctness within one.",
          },
          {
            id: "d",
            label: "Multi-row transactions and ad-hoc joins across entities.",
            correct: true,
            explanationMd: "Correct. That's the real trade - and exactly why a checkout ledger stays relational even at scale.",
          },
        ],
      },
      {
        id: "bb-3-11-sql-vs-nosql-q3",
        kind: "single",
        difficulty: 2,
        prompt: "Which requirement makes a relational store nearly non-negotiable?",
        options: [
          {
            id: "a",
            label: "Multi-row transactions that must all succeed or all fail together, like debiting one account and crediting another.",
            correct: true,
            explanationMd: "Correct. That's ACID across rows - a relational store's own superpower, and the one thing hardest to hand-roll safely elsewhere.",
          },
          {
            id: "b",
            label: "Storing records with a JSON-like shape.",
            correct: false,
            explanationMd: "Shape alone doesn't force it - a document-model NoSQL store handles JSON-shaped records natively.",
          },
          {
            id: "c",
            label: "High read volume.",
            correct: false,
            explanationMd: "Read volume is addressed by replicas (3.12) or a cache (3.14) regardless of which store family is underneath - it doesn't decide SQL vs. NoSQL on its own.",
          },
          {
            id: "d",
            label: "A single, predictable key-to-value lookup.",
            correct: false,
            explanationMd: "That's the shape a key-value NoSQL store is built for - the opposite of a relational requirement.",
          },
        ],
      },
      {
        id: "bb-3-11-sql-vs-nosql-q4",
        kind: "single",
        difficulty: 2,
        prompt: "A session token is looked up by one key, with no joins and moderate volume. The strongest answer for which store to use:",
        options: [
          {
            id: "a",
            label: "SQL, because it's the safer default for anything involving user accounts.",
            correct: false,
            explanationMd: "Invents a technical reason where the workload's own shape doesn't require one - session-token lookup has no transaction or join to protect.",
          },
          {
            id: "b",
            label: "NoSQL, because it's built for scale and SQL isn't.",
            correct: false,
            explanationMd: "\"Built for scale\" isn't the deciding factor here either - a well-indexed SQL store handles this shape and volume without strain.",
          },
          {
            id: "c",
            label: "Either is defensible - the real decision is what the team already operates well, not a technical wall.",
            correct: true,
            explanationMd: "Correct. This is the scenario candidates most often get wrong by inventing a side to pick.",
          },
          {
            id: "d",
            label: "Neither - this workload needs a cache, not a database.",
            correct: false,
            explanationMd: "Conflates two different questions - caching (3.14) is about where the copy lives on the read path, not which store owns the record.",
          },
        ],
      },
      {
        id: "bb-3-11-sql-vs-nosql-q5",
        kind: "single",
        difficulty: 3,
        prompt: "A teammate says, \"we need NoSQL because we'll be big.\" The strongest response:",
        options: [
          {
            id: "a",
            label: "Agree - scale always eventually forces a move to NoSQL.",
            correct: false,
            explanationMd: "Treats scale as a prophecy rather than a property of a specific access pattern - a well-indexed relational store with replicas carries most products very far.",
          },
          {
            id: "b",
            label: "Ask for the data's shape and access pattern first - joins and transactions are expensive to give up, and most products never actually hit a write ceiling that forces the question.",
            correct: true,
            explanationMd: "Correct. Store choice is a decision procedure over shape, access pattern, and scale - not a prophecy about future size.",
          },
          {
            id: "c",
            label: "Refuse - NoSQL is never the right choice.",
            correct: false,
            explanationMd: "Overcorrects into the opposite dogma - Discord's own message store is a real, public counterexample.",
          },
          {
            id: "d",
            label: "Agree to use both stores for everything from day one, to stay safe.",
            correct: false,
            explanationMd: "Running two stores for data that doesn't need it is pure operational cost with no matching benefit - the decision procedure exists to avoid exactly this.",
          },
        ],
      },
      {
        id: "bb-3-11-sql-vs-nosql-q6",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"Walk me through how you'd decide between SQL and NoSQL for this design.\" Strongest opening move:",
        options: [
          {
            id: "a",
            label: "State a personal preference for one family and defend it throughout the interview.",
            correct: false,
            explanationMd: "Signals dogma, not judgment - the strongest candidates apply a procedure, not a preference.",
          },
          {
            id: "b",
            label: "Ask which one the interviewer's own company uses.",
            correct: false,
            explanationMd: "Dodges the actual reasoning the question is testing for, rather than demonstrating it.",
          },
          {
            id: "c",
            label: "List every NoSQL model (key-value, document, wide-column, graph) and their differences before touching the requirements.",
            correct: false,
            explanationMd: "Technology tourism - impressive-sounding but answers a question nobody asked before the workload's own shape is even on the table.",
          },
          {
            id: "d",
            label: "Start from the requirements: does this data need cross-row transactions or joins, does its shape vary, and what's the write volume - then name the store the answer implies.",
            correct: true,
            explanationMd: "Correct. Leading with the workload's own constraints, not a label, is the senior signal this whole chapter is built around.",
          },
        ],
      },
    ],
    // Completion-shaped: the full chain through 3.10 is unchanged and
    // already passing. The catalog's NoSQL Database sits on canvas,
    // disconnected, with `model: "key-value"` - a deliberate wrong guess
    // (not the registry's own default, "document") so the exercise tests
    // the model decision for real, not just wiring one edge.
    starterGraph: {
      nodes: [
        { id: "bb-3-11-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-11-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-11-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-11-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-11-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-11-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-11-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 3 } },
        { id: "bb-3-11-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
        { id: "bb-3-11-nosql", componentId: "nosql-database", position: { x: 380, y: 480 }, config: { model: "key-value" } },
      ],
      edges: [
        { id: "bb-3-11-e1", source: "bb-3-11-browser", target: "bb-3-11-dns", kind: "request-flow" },
        { id: "bb-3-11-e2", source: "bb-3-11-dns", target: "bb-3-11-fw", kind: "request-flow" },
        { id: "bb-3-11-e3", source: "bb-3-11-fw", target: "bb-3-11-proxy", kind: "request-flow" },
        { id: "bb-3-11-e4", source: "bb-3-11-proxy", target: "bb-3-11-gateway", kind: "request-flow" },
        { id: "bb-3-11-e5", source: "bb-3-11-gateway", target: "bb-3-11-lb", kind: "request-flow" },
        { id: "bb-3-11-e6", source: "bb-3-11-lb", target: "bb-3-11-app", kind: "request-flow" },
        { id: "bb-3-11-e7", source: "bb-3-11-app", target: "bb-3-11-db", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-11-browser"],
    },
  },
  {
    id: "bb-3-12-replication",
    mode: "building-blocks",
    title: "Replication",
    // Real authored content (third Group C chapter, authored immediately
    // after 3.11 in this same working tree). Spec:
    // specs/bb-3-12-replication.spec.md. Lesson body:
    // public/content/chapters/bb-3-12-replication.mdx. Real curriculum-order
    // prerequisite (3.11) is already shipped in this same working tree -
    // manifest.ts's prerequisiteSlugs already points at "3-11-sql-vs-nosql",
    // no pulled-forward exception needed.
    problemStatement:
      "Reads and writes both go through the one primary database, and reads outnumber writes by an " +
      "order of magnitude. A Read Replica is already on the canvas, wired the same way every other " +
      "data component in this system was wired so far.",
    exerciseGoal: "Give reads their own path to a copy of the primary - without letting anything write to that copy.",
    successCriteria: [
      "The Read Replica's data comes from the primary, not from the application tier.",
      "The Application Server can serve reads from the replica.",
      "Validate reports zero issues, and Submit passes.",
    ],
    // Six objectives (§5.2 allows 3-7). All five categories present - Building
    // Block type per §4/§16 (introduces read-replica + edge kind replication).
    learningObjectives: [
      "Explain what a Read Replica is and the one-way replication stream that keeps it current.",
      "Explain replication lag and why it's the mechanism behind read-your-writes, the first consistency guarantee this curriculum makes non-free.",
      "Choose synchronous or asynchronous replication for a given workload and name the real cost of each.",
      "Wire a Read Replica to receive a replication feed from a database and serve reads back to the Application Server, correcting an illegal write-shaped edge, and pass Submit.",
      "Answer \"what happens when a user reloads right after writing?\" by naming replication lag and the fix - route that specific read to the primary.",
      "Defend why replicas fix a read bottleneck but not a write one, naming the next lever instead of just adding more copies.",
    ],
    // Cumulative palette through 3.11 plus this chapter's own new component.
    // CURRICULUM §16's own row: "3.12 | read-replica + edge replication".
    availableComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
      "read-replica",
    ],
    requiredComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
      "read-replica",
    ],
    // Matches 3.11's curated set plus orphan-read-replica, this chapter's own
    // namesake rule per CURRICULUM's own note ("the orphan-read-replica rule
    // is the teaching instrument").
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "orphan-read-replica",
    ],
    blueprints: [
      {
        id: "bb-3-12-blueprint",
        label: "Reads and writes finally take different paths",
        require: {
          id: "bb-3-12-blueprint",
          nodes: [
            { alias: "browser", componentId: "browser" },
            { alias: "dns", componentId: "dns" },
            { alias: "fw", componentId: "firewall" },
            { alias: "proxy", componentId: "reverse-proxy" },
            { alias: "gateway", componentId: "api-gateway" },
            { alias: "lb", componentId: "load-balancer" },
            { alias: "app", componentId: "app-server" },
            { alias: "db", componentId: "sql-database" },
            { alias: "nosql", componentId: "nosql-database", config: [{ field: "model", op: "eq", value: "document" }] },
            { alias: "replica", componentId: "read-replica" },
          ],
          edges: [
            { from: "browser", to: "dns", kind: "request-flow" },
            { from: "dns", to: "fw", kind: "request-flow" },
            { from: "fw", to: "proxy", kind: "request-flow" },
            { from: "proxy", to: "gateway", kind: "request-flow" },
            { from: "gateway", to: "lb", kind: "request-flow" },
            { from: "lb", to: "app", kind: "request-flow" },
            { from: "app", to: "db", kind: "request-flow" },
            { from: "app", to: "nosql", kind: "request-flow" },
            { from: "db", to: "replica", kind: "replication" },
            { from: "replica", to: "app", kind: "request-flow" },
          ],
        },
        commentary:
          "The edge that ran straight from the Application Server into the Replica is gone - that edge " +
          "tried to query the Replica the same way every other data component in this system gets " +
          "queried, and a Replica's own input port only accepts a replication feed from a real database, " +
          "never a query. In its place: one edge carrying the replication stream in from the primary, and " +
          "one edge carrying reads back out to the Application Server. Reads and writes now travel " +
          "genuinely different paths - the split this chapter is about.",
      },
    ],
    hasEditorExercise: true,
    hints: [
      {
        id: "bb-3-12-hint-1",
        body:
          "Validate names two separate problems on the Read Replica - one about what already connects to " +
          "it, one about what's missing. Look at both before touching anything.",
      },
      {
        id: "bb-3-12-hint-2",
        body:
          "The edge already drawn into the Replica comes from the Application Server. Check what kind of " +
          "edge a Replica's own input port is actually built to accept - is that what's there?",
      },
      {
        id: "bb-3-12-hint-3",
        body:
          "Once the wrong edge is gone, the Replica needs a real source (a replication feed from a " +
          "database) and a real destination for what it serves back out (reads reaching the Application " +
          "Server) - two edges, not one, and neither points the same direction as the one you started " +
          "with.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group C: Data - Chapter 3.12 of 37 (third chapter in Group C).",
      masteredConcepts: [
        "3.10's own ACID guarantees applied to a single primary, and 3.11's decision procedure for which " +
          "store family runs underneath it - this chapter treats both store families identically, since " +
          "orphan-read-replica accepts a replication feed from either.",
        "The full request chain through 3.11 (browser through app-server to sql-database and " +
          "nosql-database) is unchanged and still passing.",
        "1.1's own landmark ratio: reads usually outnumber writes by an order of magnitude or more - the " +
          "pressure this chapter's whole motivation rests on.",
        "3.8's own offload pattern (add a copy, spread the load) - this chapter applies the same shape to " +
          "a data-tier component for the first time, with a new rule (only one copy may accept writes) " +
          "the app tier's own copies never needed.",
      ],
      notYetIntroducedConcepts: [
        "Sharding, shard keys, and hot partitions (3.13).",
        "Leader/follower roles formalized, failover, and split-brain (3.26) - this chapter teaches " +
          "replication as mechanism only; who's allowed to become primary if the primary dies is 3.26's " +
          "own question, deliberately deferred.",
        "CAP theorem, quorums, and the consistency spectrum (3.22) - replication lag is this curriculum's " +
          "first taste of the same tension, at mechanism level only.",
        "Everything past Group C's own remaining chapter (3.13).",
      ],
      simplifications: [
        "One primary, one replica is the topology taught and tested - real systems often run several " +
          "replicas, sometimes chained off each other or spread across regions; named in \"What changes " +
          "at scale,\" not modeled.",
        "Replication lag is treated as a real-world phenomenon the learner reasons about qualitatively, " +
          "not as a number with a formula behind it - `replicationLagBudgetMs` is a tolerance a system " +
          "designer sets, not something this stage computes.",
        "What happens to the system if the primary itself fails is out of scope - that's 3.26's own " +
          "subject. This chapter only covers a replica going stale or unavailable for reads, never a " +
          "primary needing replacement.",
      ],
    },
    // Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
    // 3.10's and 3.11's own ramp. Q3 adapts QUIZ_FRAMEWORK.md §10's own bank
    // Q6 (writing to a replica), Q4 adapts bank Q5 (diagram, replication
    // lag) with a corrected edge direction (see spec §10's doc-drift note),
    // Q5 adapts bank Q7 (sync vs. async). Q1, Q2, and Q6 are original.
    // Correct options sit at a, c, d, b, c, a - all four positions used, "a"
    // and "c" the only repeats, no letter repeats in consecutive questions,
    // and the chapter doesn't open on "b" the way 3.11 did.
    quiz: [
      {
        id: "bb-3-12-replication-q1",
        kind: "single",
        difficulty: 1,
        prompt:
          "Reads are competing with writes for the same primary database's CPU and disk, and every query " +
          "involved is legitimate - nothing is actually wrong with any single one. The standard first move:",
        options: [
          {
            id: "a",
            label: "Add a Read Replica fed by replication from the primary, and route read queries to it.",
            correct: true,
            explanationMd: "Correct. This removes read contention without touching the single-writer guarantee 3.10 established.",
          },
          {
            id: "b",
            label: "Add a second primary database and split writes between them.",
            correct: false,
            explanationMd: "Two independent primaries have no way to agree on which write happened first - 3.10's own naive-duplication warning, applied.",
          },
          {
            id: "c",
            label: "Shard the data across multiple databases (3.13, not yet taught).",
            correct: false,
            explanationMd: "Sharding solves a write-ceiling problem. This workload's primary is fine on writes - the pressure described is read contention.",
          },
          {
            id: "d",
            label: "Put a cache in front of the database (3.14, not yet taught).",
            correct: false,
            explanationMd: "A bigger lever than this problem needs, and it doesn't help reads that genuinely need the primary's latest data.",
          },
        ],
      },
      {
        id: "bb-3-12-replication-q2",
        kind: "single",
        difficulty: 1,
        prompt: "A Read Replica node sits on the canvas with no incoming edge from any database. What happens to it?",
        options: [
          {
            id: "a",
            label: "It automatically pulls from whichever database is nearest.",
            correct: false,
            explanationMd: "Replication isn't automatic - it needs the edge itself, the mechanism the diagram shows.",
          },
          {
            id: "b",
            label: "It serves the last cached response until reconnected.",
            correct: false,
            explanationMd: "Conflates caching (3.14) with replication - a Replica isn't a cache, and it never got a first copy to serve.",
          },
          {
            id: "c",
            label: "It never receives any data - reads from it are permanently empty or stale.",
            correct: true,
            explanationMd: "Correct. A Replica's only source of truth is the replication stream, and without one, there's nothing behind it.",
          },
          {
            id: "d",
            label: "It silently starts serving writes as if it were the primary.",
            correct: false,
            explanationMd: "A Replica has no promotion mechanism at this stage (3.26, not yet taught) and no write path at all.",
          },
        ],
      },
      {
        id: "bb-3-12-replication-q3",
        kind: "single",
        difficulty: 2,
        prompt: "Writing directly to a Read Replica is wrong because:",
        options: [
          {
            id: "a",
            label: "Replicas are slower at writes than primaries.",
            correct: false,
            explanationMd: "Not the real issue - the problem isn't speed, it's that a Replica has no mechanism to reconcile a write with the primary's own history.",
          },
          {
            id: "b",
            label: "Replicas don't have disks.",
            correct: false,
            explanationMd: "Replicas store real data on real disks - the restriction is about role, not hardware.",
          },
          {
            id: "c",
            label: "It's fine, as long as the application retries on failure.",
            correct: false,
            explanationMd: "Retrying doesn't fix a fork - if the write partially succeeds, the Replica's copy now disagrees with the primary with no reconciliation path.",
          },
          {
            id: "d",
            label: "A Replica's contents are defined as a copy of the primary - a write there either fails outright or forks the data into two divergent histories.",
            correct: true,
            explanationMd: "Correct. Role discipline is what makes replication sound at all.",
          },
        ],
      },
      {
        id: "bb-3-12-replication-q4",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "A user updates their profile, then immediately reloads the page and sees the OLD name. Using " +
          "the diagram, why?",
        graph: {
          nodes: [
            { id: "app", componentId: "app-server", position: { x: 220, y: 240 }, config: {} },
            { id: "db", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
            { id: "replica", componentId: "read-replica", position: { x: 580, y: 240 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "app", target: "db", kind: "request-flow" },
            { id: "e2", source: "db", target: "replica", kind: "replication" },
            { id: "e3", source: "replica", target: "app", kind: "request-flow" },
          ],
          entryPointIds: ["app"],
        },
        options: [
          {
            id: "a",
            label: "The write failed.",
            correct: false,
            explanationMd: "Nothing in the diagram suggests a failed write - the primary accepted it over e1.",
          },
          {
            id: "b",
            label: "The write went to the primary (e1); the reload's read came back over the replication edge's own downstream (e3) before replication (e2) caught up.",
            correct: true,
            explanationMd: "Correct. This is replication lag - the learner points at the lagging edge.",
          },
          {
            id: "c",
            label: "The Replica rejected the read.",
            correct: false,
            explanationMd: "A stale Replica still answers reads - it just answers with old data, it doesn't refuse.",
          },
          {
            id: "d",
            label: "The browser cached the page.",
            correct: false,
            explanationMd: "The diagram shows a server-side replication issue, not a client-side caching layer (that arrives in 3.14).",
          },
        ],
      },
      {
        id: "bb-3-12-replication-q5",
        kind: "single",
        difficulty: 3,
        prompt: "Sync vs. async replication - the honest one-line trade:",
        options: [
          {
            id: "a",
            label: "Sync is always safer, so always choose it.",
            correct: false,
            explanationMd: "Ignores the real cost - every write waiting on the slowest replica, and the primary's availability coupled to the replica's.",
          },
          {
            id: "b",
            label: "Async loses data constantly, so it should never be used.",
            correct: false,
            explanationMd: "Overclaims - async only loses the newest, unreplicated writes, and only if the primary fails at that exact moment.",
          },
          {
            id: "c",
            label: "Sync buys no-lost-writes at the price of write latency and coupled availability; async buys fast writes at the price of a real loss window on primary failure.",
            correct: true,
            explanationMd: "Correct. Both are legitimate postures with a named cost - the same CP/AP reasoning 3.22 formalizes later, seeded here at the mechanism level.",
          },
          {
            id: "d",
            label: "They're interchangeable in practice - pick whichever is simpler to operate.",
            correct: false,
            explanationMd: "They differ on a real axis (whether an acknowledged write can be lost) - not a matter of operational taste.",
          },
        ],
      },
      {
        id: "bb-3-12-replication-q6",
        kind: "single",
        difficulty: 3,
        prompt:
          "Interviewer: \"You've added five read replicas, but writes are still slow under load. What's " +
          "actually wrong with that fix?\"",
        options: [
          {
            id: "a",
            label: "Replicas only offload reads - every write still funnels through the one primary, so a write bottleneck needs a different lever (eventually sharding, not more replicas).",
            correct: true,
            explanationMd: "Correct. Naming which side of the read/write split a fix actually addresses is the senior read here.",
          },
          {
            id: "b",
            label: "Nothing - keep adding replicas until writes speed up too.",
            correct: false,
            explanationMd: "The misconception under test - replica count has no relationship to write throughput at all.",
          },
          {
            id: "c",
            label: "Switch some of the replicas to accept writes directly, to spread the load.",
            correct: false,
            explanationMd: "Forks the data the same way any direct write to a Replica does - the fix this chapter's own build exercise corrects, applied at a larger scale.",
          },
          {
            id: "d",
            label: "The replicas must be misconfigured - check their replicationLagBudgetMs.",
            correct: false,
            explanationMd: "Confuses two different levers - lag budget governs how stale a read is allowed to be, not how fast the primary accepts writes.",
          },
        ],
      },
    ],
    // Completion-shaped: the full chain through 3.11 is unchanged and
    // already passing. The Read Replica sits on canvas with one edge already
    // drawn - straight from the Application Server, the same request-flow
    // move that wired every other data component so far, pointed at a
    // component whose input port only accepts a replication feed. This one
    // starter fault trips both orphan-read-replica (no replication source)
    // and component-relations (the edge's own category/kind is illegal on
    // the Replica's input) at once.
    starterGraph: {
      nodes: [
        { id: "bb-3-12-browser", componentId: "browser", position: { x: 60, y: 0 }, config: {} },
        { id: "bb-3-12-dns", componentId: "dns", position: { x: 380, y: 0 }, config: {} },
        { id: "bb-3-12-fw", componentId: "firewall", position: { x: 700, y: 0 }, config: { defaultPolicy: "allow-listed" } },
        { id: "bb-3-12-proxy", componentId: "reverse-proxy", position: { x: 60, y: 160 }, config: {} },
        { id: "bb-3-12-gateway", componentId: "api-gateway", position: { x: 60, y: 320 }, config: {} },
        { id: "bb-3-12-lb", componentId: "load-balancer", position: { x: 380, y: 320 }, config: {} },
        { id: "bb-3-12-app", componentId: "app-server", position: { x: 700, y: 320 }, config: { instances: 3 } },
        { id: "bb-3-12-db", componentId: "sql-database", position: { x: 60, y: 480 }, config: {} },
        { id: "bb-3-12-nosql", componentId: "nosql-database", position: { x: 380, y: 480 }, config: { model: "document" } },
        { id: "bb-3-12-replica", componentId: "read-replica", position: { x: 700, y: 480 }, config: {} },
      ],
      edges: [
        { id: "bb-3-12-e1", source: "bb-3-12-browser", target: "bb-3-12-dns", kind: "request-flow" },
        { id: "bb-3-12-e2", source: "bb-3-12-dns", target: "bb-3-12-fw", kind: "request-flow" },
        { id: "bb-3-12-e3", source: "bb-3-12-fw", target: "bb-3-12-proxy", kind: "request-flow" },
        { id: "bb-3-12-e4", source: "bb-3-12-proxy", target: "bb-3-12-gateway", kind: "request-flow" },
        { id: "bb-3-12-e5", source: "bb-3-12-gateway", target: "bb-3-12-lb", kind: "request-flow" },
        { id: "bb-3-12-e6", source: "bb-3-12-lb", target: "bb-3-12-app", kind: "request-flow" },
        { id: "bb-3-12-e7", source: "bb-3-12-app", target: "bb-3-12-db", kind: "request-flow" },
        { id: "bb-3-12-e8", source: "bb-3-12-app", target: "bb-3-12-nosql", kind: "request-flow" },
        { id: "bb-3-12-e9", source: "bb-3-12-app", target: "bb-3-12-replica", kind: "request-flow" },
      ],
      entryPointIds: ["bb-3-12-browser"],
    },
  },
  {
    id: "bb-3-13-sharding",
    mode: "building-blocks",
    title: "Sharding",
    // Real authored content (fourth and final Group C chapter, authored
    // immediately after 3.12 in this same working tree). Spec:
    // specs/bb-3-13-sharding.spec.md. Lesson body:
    // public/content/chapters/bb-3-13-sharding.mdx. Real curriculum-order
    // prerequisite (3.12) is already shipped in this same working tree -
    // manifest.ts's prerequisiteSlugs already points at "3-12-replication",
    // no pulled-forward exception needed.
    problemStatement:
      "3.12's replicas fixed a read problem completely and a write problem not at all - if the " +
      "primary's own writes have outgrown one machine, more replicas don't help. This chapter is the " +
      "last lever: splitting the data itself across independent machines by a shard key, once " +
      "indexing, replicas, and caching are genuinely exhausted. No build: the knowledge check is " +
      "whether you can pick a shard key for a stated access pattern, defend range vs. hash, and name " +
      "what a cross-shard query actually costs.",
    // Five objectives (§5.2 allows 3-7). Practical omitted per §5.2's own
    // carve-out for pure Concept chapters (matching 2.3's and 3.10's own
    // precedent) - see spec §0 for why no Editor exercise exists here.
    learningObjectives: [
      "Explain what a shard key does and why the same key must always resolve to the same shard.",
      "Compare range and hash sharding: which access pattern each keeps cheap, and which it breaks.",
      "Diagnose a hot partition from a shard key that concentrates real-world load unevenly.",
      "Decide when sharding is and isn't the right next move, naming which cheaper levers must be exhausted first.",
      "Name what a cross-shard (scatter-gather) query costs, and why it grows with shard count.",
    ],
    // Cumulative palette through 3.12, unchanged - this chapter's own §16
    // audit row is absent (3.6-3.10, 3.13 are intentional no-component
    // Concept chapters). CURRICULUM's own row: "New: none."
    availableComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
      "read-replica",
    ],
    requiredComponentIds: [
      "browser",
      "dns",
      "firewall",
      "reverse-proxy",
      "api-gateway",
      "load-balancer",
      "app-server",
      "sql-database",
      "nosql-database",
      "read-replica",
    ],
    // No Editor exercise (see hasEditorExercise below) - no rules to curate.
    validationRuleIds: [],
    blueprints: [],
    // False: no construction-family exercise. CURRICULUM §14's own row asks
    // for a "config (shard-key choice; hot-partition explanations) +
    // trade-off (range vs. hash)" exercise, but no component in the
    // registry has a shard-key field, and sharding is explicitly a
    // configuration of an existing database, not a new component (per
    // CURRICULUM's own Type note) - checked directly against
    // src/content/components/config/data.ts (sql-database's only field is
    // `engine`; nosql-database's only field is `model`) and every
    // registered validation rule (none inspects a shard key or simulates
    // cross-shard cost). Same class of finding as 3.10's own missing
    // `indexes` field (open decision 17), now confirmed a second time on
    // this chapter. Not hacked around: shard-key choice, hot partitions, and
    // range-vs-hash are taught via diagram and prose and realized as a
    // six-question, quiz-weighted assessment instead, the same resolution
    // 3.10's own spec established. See spec §0 and the new open decision
    // recorded in pending-chapters.md.
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-3-13-hint-1",
        body:
          "Sharding splits the data itself across machines by a key - ask what happens when that key " +
          "sends most of the real-world traffic to just one of them.",
      },
      {
        id: "bb-3-13-hint-2",
        body:
          "Before reaching for sharding, check whether replicas, caching, and indexing are actually " +
          "exhausted - it's the most expensive lever in the data tier, not the first one to reach for.",
      },
      {
        id: "bb-3-13-hint-3",
        body:
          "A query that touches every shard doesn't get faster because the data was sharded - it gets a " +
          "fan-out, a wait for the slowest shard, and a merge. Ask what that costs before assuming " +
          "sharding solved the problem outright.",
      },
    ],
    readingLinks: [],
    lessonVersion: 1,
    lessonFormat: "mdx",
    curriculumContext: {
      position: "Building Blocks, Group C: Data - Chapter 3.13 of 37 (fourth and final chapter in Group C).",
      masteredConcepts: [
        "3.10's own ladder: an index is the cheapest lever, a bigger machine buys real but finite " +
          "headroom - this chapter is where that ladder runs out.",
        "3.12's own replicas fix read throughput completely and write throughput not at all - the exact " +
          "gap this chapter's whole motivation rests on.",
        "3.11's own decision procedure: either store family (sql-database or nosql-database) can be " +
          "sharded the same way; a NoSQL store's own built-in partitioning already makes part of this " +
          "decision by default.",
        "The full request chain through 3.12 (browser through app-server to sql-database, " +
          "nosql-database, and read-replica) is unchanged and still passing.",
      ],
      notYetIntroducedConcepts: [
        "Caching and distributed caching (3.14) - named here as a cheaper lever than sharding, not taught.",
        "Coordinator-managed shard placement (3.22, not yet taught) - this chapter treats shard " +
          "assignment as a fixed, chosen key, not a dynamically rebalanced system.",
        "Everything past Group C - Group D (Performance) begins with 3.14.",
      ],
      simplifications: [
        "No `shardKey` config field or cross-shard query simulation exists on any database component " +
          "today (checked directly against every registered component's own `fields` and every " +
          "registered validation rule) - shard-key choice, hot partitions, and range-vs-hash are taught " +
          "through diagrams and a six-question, quiz-weighted assessment, not a buildable canvas " +
          "exercise, matching 3.10's own resolution for an identical class of gap. Recorded as a new " +
          "open decision in pending-chapters.md.",
        "Resharding (moving data between shards after a key stops fitting) is named as a real cost, not " +
          "walked through mechanically - the operational detail doesn't change any decision this stage " +
          "asks the learner to make.",
        "The Instagram production example is stated at decision level from public material (a custom " +
          "ID scheme encoding shard number, chosen to keep by-ID lookups confined to one shard) with no " +
          "throughput or hardware figures the argument depends on.",
      ],
    },
    // Six questions (§3's sanctioned 3-6 range), ramp 1/1/2/2/3/3, matching
    // 3.10's, 3.11's, and 3.12's own ramp exactly - one question heavier
    // than the default 5, read as the same "quiz-weighted" license 3.10's
    // own row used. Q2 adapts QUIZ_FRAMEWORK.md §10's own bank Q10 (tagged
    // "(3.13)": when sharding is the wrong move), Q3 adapts bank Q8 (tagged
    // "(3.13)": hot partition from a skewed shard key), Q5 adapts bank Q9
    // (tagged "(3.13)": range-sharding's own moving hot spot), Q6 adapts
    // bank Q11 (tagged "(3.13)": cross-shard scatter-gather cost) - all four
    // reworded with fresh option labels rather than reproduced verbatim. Q1
    // and Q4 (diagram) are original. Correct options sit at b, c, a, d, b, c
    // - all four positions used, "b" and "c" the only repeats, no letter
    // repeats in consecutive questions, and the chapter doesn't open on "a"
    // the way 3.12 did.
    quiz: [
      {
        id: "bb-3-13-sharding-q1",
        kind: "single",
        difficulty: 1,
        prompt: "What does sharding actually do, compared to the moves you've already met?",
        options: [
          {
            id: "a",
            label: "Keeps one copy of the data but makes reads faster by indexing it more heavily.",
            correct: false,
            explanationMd: "That's indexing (3.10) - the data stays whole on one machine, only the lookup path changes.",
          },
          {
            id: "b",
            label: "Splits the data itself across multiple independent machines by a key, so each machine holds only a slice - not a full copy.",
            correct: true,
            explanationMd: "Correct. No machine holds everything anymore - that's the whole point, and the whole cost.",
          },
          {
            id: "c",
            label: "Keeps one full copy on the primary and streams read-only copies to other machines.",
            correct: false,
            explanationMd: "That's replication (3.12) - every replica still holds the full dataset, just slightly behind.",
          },
          {
            id: "d",
            label: "Adds a faster layer in front of the database that serves repeat reads without touching it.",
            correct: false,
            explanationMd: "That's caching (3.14, not yet taught) - the underlying database is untouched either way.",
          },
        ],
      },
      {
        id: "bb-3-13-sharding-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A single, well-indexed primary is still handling its write load comfortably, but a teammate " +
          "wants to shard it anyway, \"to be ready.\" The strongest response:",
        options: [
          {
            id: "a",
            label: "Agree - sharding is always the right long-term move eventually.",
            correct: false,
            explanationMd: "Treats sharding as inevitable rather than a response to an actual write ceiling - many systems never hit one.",
          },
          {
            id: "b",
            label: "Disagree outright - sharding is never worth the complexity.",
            correct: false,
            explanationMd: "Overcorrects - sharding is the right call once writes genuinely outgrow one machine, just not before.",
          },
          {
            id: "c",
            label: "Ask whether replicas, caching, and indexing are actually exhausted first - sharding buys capacity at a permanent complexity cost the cheaper levers don't carry.",
            correct: true,
            explanationMd: "Correct. Sharding is the most expensive lever in the data tier - reach for it last, not first.",
          },
          {
            id: "d",
            label: "Agree, but only if the team also switches to a NoSQL store first.",
            correct: false,
            explanationMd: "Conflates two separate decisions - 3.11's store-family choice and this chapter's own partitioning decision aren't the same question.",
          },
        ],
      },
      {
        id: "bb-3-13-sharding-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A social app shards its posts table by user_id. A single account with 100M followers posts " +
          "once. What breaks, and why did the shard key cause it?",
        options: [
          {
            id: "a",
            label: "That account's shard becomes a hot partition - every read for the post hammers one shard while the rest sit idle, because the key concentrated a skewed workload onto one machine.",
            correct: true,
            explanationMd: "Correct. Shard-key choice is workload analysis, not formality - a hot key is its canonical failure.",
          },
          {
            id: "b",
            label: "Nothing - sharding absorbs any load increase automatically.",
            correct: false,
            explanationMd: "Sharding distributes rows, not runtime load per row - a skewed key can still send all the traffic to one machine.",
          },
          {
            id: "c",
            label: "All shards fail at once, evenly.",
            correct: false,
            explanationMd: "The opposite of what happens - the load concentrates on exactly one shard while the others stay idle.",
          },
          {
            id: "d",
            label: "The post itself is lost, since one shard can't hold that much traffic.",
            correct: false,
            explanationMd: "Conflates load with data loss - the post is stored fine; it's the read traffic hammering one machine that breaks.",
          },
        ],
      },
      {
        id: "bb-3-13-sharding-q4",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "This system range-shards its database by a numeric user_id: Shard A holds ids 0-33M, Shard B " +
          "holds 33M-66M, Shard C holds 66M-100M. New signups are assigned the next sequential id. Which " +
          "shard absorbs all new-user write traffic, and why?",
        graph: {
          nodes: [
            { id: "app", componentId: "app-server", position: { x: 60, y: 220 }, config: {} },
            { id: "sa", componentId: "sql-database", position: { x: 320, y: 80 }, config: {} },
            { id: "sb", componentId: "sql-database", position: { x: 320, y: 220 }, config: {} },
            { id: "sc", componentId: "sql-database", position: { x: 320, y: 360 }, config: {} },
          ],
          edges: [
            { id: "e1", source: "app", target: "sa", kind: "request-flow" },
            { id: "e2", source: "app", target: "sb", kind: "request-flow" },
            { id: "e3", source: "app", target: "sc", kind: "request-flow" },
          ],
          entryPointIds: ["app"],
        },
        options: [
          {
            id: "a",
            label: "Shard A - new ids are always assigned the lowest available range first.",
            correct: false,
            explanationMd: "Backwards - sequential ids climb, they don't backfill the lowest range.",
          },
          {
            id: "b",
            label: "All three evenly - the database balances new writes across shards automatically.",
            correct: false,
            explanationMd: "Nothing about range-sharding rebalances writes - each id still routes to exactly one fixed range.",
          },
          {
            id: "c",
            label: "Whichever shard already has the most rows.",
            correct: false,
            explanationMd: "Not how range-sharding routes - placement depends on the id's own value, not the shard's current row count.",
          },
          {
            id: "d",
            label: "Shard C - every new, higher id lands in the highest range, so new writes concentrate there permanently.",
            correct: true,
            explanationMd: "Correct. This is range-sharding's own moving hot spot - the newest shard absorbs every new write, forever.",
          },
        ],
      },
      {
        id: "bb-3-13-sharding-q5",
        kind: "single",
        difficulty: 3,
        prompt: "Range-sharding an append-heavy event table by timestamp. The predictable pathology, and hash-sharding's own trade in exchange:",
        options: [
          {
            id: "a",
            label: "Reads become impossible under range-sharding.",
            correct: false,
            explanationMd: "Reads still work - they're just concentrated wherever the data they need actually lives.",
          },
          {
            id: "b",
            label: "Every new write lands on the newest shard - a permanently moving hot spot; hash-sharding fixes that by spreading writes evenly, at the cost of losing cheap range scans.",
            correct: true,
            explanationMd: "Correct. Range vs. hash is the chapter's central trade-off, each breaking a different access pattern.",
          },
          {
            id: "c",
            label: "Old shards fill up forever under range-sharding, with no way to reclaim space.",
            correct: false,
            explanationMd: "Old shards stop receiving new writes once their range is full of past data - they don't grow unbounded.",
          },
          {
            id: "d",
            label: "Timestamps can't be used as a shard key at all.",
            correct: false,
            explanationMd: "They can be - the pathology is real but not a prohibition; it's exactly the trade-off this question is testing.",
          },
        ],
      },
      {
        id: "bb-3-13-sharding-q6",
        kind: "single",
        difficulty: 3,
        prompt: "Interviewer: \"Your sharded design needs one query that touches every shard. Walk me through the cost.\" Strongest answer:",
        options: [
          {
            id: "a",
            label: "Cross-shard queries are impossible once the data is sharded.",
            correct: false,
            explanationMd: "They're possible, just expensive - naming the real mechanism is the point, not declaring it impossible.",
          },
          {
            id: "b",
            label: "The database handles it invisibly, at no extra cost.",
            correct: false,
            explanationMd: "Overclaims - fanning out to every shard and merging is real, visible work with a real latency cost.",
          },
          {
            id: "c",
            label: "Scatter-gather: fan out to every shard, wait for the slowest, merge the results - latency becomes the p99 of N machines and grows with shard count; design around it with denormalization or a separate index.",
            correct: true,
            explanationMd: "Correct. Naming the tail-latency mechanism, not just the term \"scatter-gather,\" is the senior read here.",
          },
          {
            id: "d",
            label: "Route the query to whichever shard holds the most data and accept an approximate answer.",
            correct: false,
            explanationMd: "Silently returning a wrong answer isn't a cost mitigation - it's a correctness bug dressed up as an optimization.",
          },
        ],
      },
    ],
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
