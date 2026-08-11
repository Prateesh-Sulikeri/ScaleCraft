import type { ChapterDefinition } from "./types";

/**
 * The authored chapter registry. Mixed state during Wave 1 content authoring
 * (.claude/docs/pending-content.md):
 *
 * - `bb-0-1-welcome`, `bb-0-2-what-is-system-design`,
 *   `bb-0-3-interview-design-vs-production-engineering`,
 *   `bb-0-4-the-system-design-lifecycle`, and
 *   `bb-1-1-understanding-the-problem` are real curriculum content,
 *   authored against CURRICULUM.md §5/§6 with a chapter spec in `specs/`
 *   beside each.
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
        { id: "bb-0-1-client", componentId: "client", position: { x: 80, y: 140 }, config: {} },
        { id: "bb-0-1-app-server", componentId: "app-server", position: { x: 340, y: 140 }, config: {} },
      ],
      edges: [{ id: "bb-0-1-edge-client-app", source: "bb-0-1-client", target: "bb-0-1-app-server", kind: "async" }],
      entryPointIds: ["bb-0-1-client"],
    },
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
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.2 of 44.",
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
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.3 of 44.",
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
    curriculumContext: {
      position: "Building Blocks, Part 0: Foundations - Chapter 0.4 of 44.",
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
  {
    id: "bb-1-1-understanding-the-problem",
    mode: "building-blocks",
    title: "Understanding the Problem",
    // Real authored content (Wave 2 chapter 1 - first Part 1 chapter, see
    // pending-content.md). Spec:
    // specs/bb-1-1-understanding-the-problem.spec.md. Lesson body:
    // public/content/chapters/bb-1-1-understanding-the-problem.md.
    problemStatement:
      "A clarifying question only earns its place if a different answer would change the design - " +
      "everything else is conversation. This chapter teaches that one test, and where to look for " +
      "the questions worth asking (scope, scale, usage pattern, non-negotiables). No build: the " +
      "knowledge check gives you a brief and a list of candidate questions, and asks you to pick " +
      "only the ones that pass the test.",
    // Five objectives - all five §5.2 categories present. Process chapters
    // don't get the Concept-only Practical carve-out (spec §2); Practical is
    // honestly exercised by the quiz's multi-select question standing in for
    // CURRICULUM §14's staged exercise (spec §5 - stages UI doesn't exist yet,
    // per pending-content.md's documented degradation).
    learningObjectives: [
      "Knowledge - State the test that decides whether a candidate clarifying question is worth asking: would a different answer change the design.",
      "Engineering - Apply the test to a list of candidate questions for a brief and identify which ones would materially change the architecture.",
      "Interview - Ask two or three targeted clarifying questions inside the interview's small clarify-and-scope budget, instead of reciting a checklist or skipping the step.",
      "Practical - Given a brief and a list of candidate clarifying questions, select exactly the ones that pass the test.",
      "Communication - Name, out loud, which specific design decision a clarifying question's answer would flip.",
    ],
    // No components introduced (§16 homes the three primitives at 1.6) and no
    // construction-family exercise - the staged exercise CURRICULUM §14
    // specifies degrades to the quiz's multi-select question (spec §5),
    // pending-content.md's documented approach for Part 1 chapters until the
    // stages UI lands.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-1-hint-1",
        body:
          "Not sure if a question counts? Ask: if the answer came back the opposite way, would you " +
          "draw something different? If not, it's not a clarifying question.",
      },
      {
        id: "bb-1-1-hint-2",
        body:
          "A question can sound technical and still fail the test - database choice and programming " +
          "language don't change the shape of the architecture, even though they sound like design " +
          "decisions.",
      },
      {
        id: "bb-1-1-hint-3",
        body:
          "Check the four categories - scope, scale, usage pattern, non-negotiables - for whichever " +
          "one is still unpinned in the brief you're given. Not every category needs a question every " +
          "time.",
      },
    ],
    readingLinks: [],
    // 2: Opus pass. Fixed the cache/read-replica claim (a read:write ratio
    // does not make either "close to mandatory" - 0.2 splits them on repeated
    // rows vs. read capacity), removed an invented "0.4's ~5-10 minutes of 45"
    // budget 0.4 never taught, corrected "0.4's dotted arrow starts right
    // here" (it runs step 8 -> step 2), reframed database choice as a decision
    // rather than "changes nothing" (3.11 would contradict that), dropped
    // unsupported \n line breaks from the Mermaid labels, gave the 1.2 preview
    // real pull (§6), and simplified several long sentences (§20.1/§20.6).
    // See spec §13 and pending-chapters.md.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.1 of 44.",
      masteredConcepts: [
        "The five forces, and the cache / read-replica example used to illustrate them (0.2).",
        "The interview register and the production register, judged against the same test on different clocks (0.3).",
        "The Interview Loop's eight steps, with clarify as step 1 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Functional and non-functional requirements as formal categories - 1.2 and 1.3 turn today's clarifying answers into those.",
        "Estimation math and the numbers-every-engineer-should-know landmarks - 1.4-1.5.",
      ],
      simplifications: [
        "The four categories (scope, scale, usage pattern, non-negotiables) cover most real clarifying " +
          "questions but aren't an exhaustive taxonomy - a working set for this stage, not a formula.",
        "CURRICULUM.md §14 specifies this chapter's exercise as a staged pick-4-of-10 flow; the stages " +
          "UI doesn't exist yet, so it's realized here as a quiz multi-select question instead (see the " +
          "chapter spec §5) - the skill tested is the same, the mechanic is simpler.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2/0.3/0.4's convention. Q1 models and
    // expands QUIZ_FRAMEWORK.md §6's own Q1 (same URL-shortener scenario),
    // also standing in for CURRICULUM §14's staged exercise (spec §5). Q2-Q5
    // are original. Correct-position spread (c, a, d, b for the four
    // single-kind questions) checked by eye against the clustering bug fixed
    // in 0.1/0.2.
    quiz: [
      {
        id: "bb-1-1-understanding-the-problem-q1",
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
              "A 1000:1 ratio makes caching and read replicas close to mandatory; a near-1:1 ratio " +
              "doesn't. The answer decides an entire branch of the design.",
          },
          {
            id: "b",
            label: "What programming language should I use?",
            correct: false,
            explanationMd:
              "Neither answer changes the architecture - this asks the interviewer to design for you, " +
              "not a question about the problem.",
          },
          {
            id: "c",
            label: "Roughly how many links are created per day?",
            correct: true,
            explanationMd:
              "Scale in orders of magnitude changes whether a single database is plausible at all, and " +
              "sets up 1.4's estimation work later.",
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
              "doesn't. That's a real fork, not a detail.",
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
        id: "bb-1-1-understanding-the-problem-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A teammate suggests asking \"what testing framework should we use for this?\" as a " +
          "clarifying question before designing the system. Is this a clarifying question by this " +
          "chapter's test?",
        options: [
          {
            id: "a",
            label: "Yes - any question asked before drawing the design counts as clarifying.",
            correct: false,
            explanationMd:
              "Timing isn't the test. A question asked early can still fail it if no answer would " +
              "change the design.",
          },
          {
            id: "b",
            label: "Yes - testing strategy is technically part of system design.",
            correct: false,
            explanationMd:
              "True in a broad sense, but irrelevant here - the test is whether a different answer " +
              "changes the architecture, not whether the topic is design-adjacent.",
          },
          {
            id: "c",
            label: "No - a different answer wouldn't change the architecture, so it fails the test.",
            correct: true,
            explanationMd:
              "Correct. Neither \"Jest\" nor \"Vitest\" changes a single box or edge in the resulting " +
              "design - the defining property of a non-clarifying question.",
          },
          {
            id: "d",
            label: "No - because it doesn't fall under scope, scale, usage pattern, or non-negotiables.",
            correct: false,
            explanationMd:
              "Right conclusion, wrong reasoning - the four categories are where to look, not the test " +
              "itself. A question can sit in a category and still fail it.",
          },
        ],
      },
      {
        id: "bb-1-1-understanding-the-problem-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A candidate spends the first 15 minutes of a 45-minute interview asking clarifying " +
          "questions before drawing anything. What's the most likely problem?",
        options: [
          {
            id: "a",
            label:
              "The candidate is burning the interview's small clarify-and-scope budget, leaving less " +
              "time for the design itself.",
            correct: true,
            explanationMd:
              "Correct. 0.4 already put clarify and requirements at roughly 5-10 of the interview's 45 " +
              "minutes combined - 15 minutes on clarify alone eats into design time directly.",
          },
          {
            id: "b",
            label: "None - more clarifying questions always produce a better design.",
            correct: false,
            explanationMd:
              "Only questions that pass the test improve the design; past that point, more questions " +
              "just spend the clock without changing anything.",
          },
          {
            id: "c",
            label: "Clarifying should happen only after a first draft is already on the board.",
            correct: false,
            explanationMd:
              "This is the cold open's own mistake restated as a rule - drawing before scoping is what " +
              "forces the redraw in the first place.",
          },
          {
            id: "d",
            label: "The interviewer will conclude the candidate doesn't understand the problem.",
            correct: false,
            explanationMd:
              "About appearances, not the real cost - the actual issue is the spent clock, not how it " +
              "looks to be asking questions.",
          },
        ],
      },
      {
        id: "bb-1-1-understanding-the-problem-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "\"Design a chat app.\" A candidate asks: \"should messages be end-to-end encrypted?\" Is " +
          "this worth asking?",
        options: [
          {
            id: "a",
            label: "No - encryption is a security detail, not an architecture question.",
            correct: false,
            explanationMd:
              "It sounds like an implementation detail the way database choice does, but the answer " +
              "here actually changes what the server can do - see option d.",
          },
          {
            id: "b",
            label: "No - all messaging apps use end-to-end encryption by default, so the answer is already known.",
            correct: false,
            explanationMd:
              "Not a safe default to assume, and beside the point - the question is whether the answer " +
              "would change the design, not what's typical.",
          },
          {
            id: "c",
            label: "Yes - but only because compliance requirements always require asking about encryption.",
            correct: false,
            explanationMd:
              "Compliance can be a reason to ask, but it's not this question's reason - the design " +
              "impact holds even with no compliance requirement in play.",
          },
          {
            id: "d",
            label:
              "Yes - a different answer changes what the server can do with message content (search, " +
              "moderation, storage), which is a real architecture fork.",
            correct: true,
            explanationMd:
              "Correct. End-to-end encrypted means the server can't read message content at all - " +
              "search and moderation features built server-side become impossible, not just harder.",
          },
        ],
      },
      {
        id: "bb-1-1-understanding-the-problem-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "You ask \"read-heavy or write-heavy?\" and the interviewer answers \"read-heavy, about " +
          "1000:1.\" Which of 0.2's five forces does this answer most directly start to pin down?",
        options: [
          {
            id: "a",
            label: "Durability - reads don't touch how safely data is stored.",
            correct: false,
            explanationMd:
              "Durability is about not losing data once written - a read:write ratio doesn't speak to " +
              "that at all.",
          },
          {
            id: "b",
            label:
              "Latency and throughput - it decides whether caching and a read replica are worth the " +
              "added complexity.",
            correct: true,
            explanationMd:
              "Correct. A heavy read skew is exactly the signal 0.2 used for when a cache pays for " +
              "itself - it's a latency/throughput trade before it's anything else.",
          },
          {
            id: "c",
            label: "Cost only - caching is primarily a cost-cutting move.",
            correct: false,
            explanationMd:
              "Cost is a real secondary effect (0.2's own cache example), but \"only\" is too narrow - " +
              "the primary driver is latency and throughput, not cost.",
          },
          {
            id: "d",
            label: "None of the five - read:write ratio is a scale detail, not a force.",
            correct: false,
            explanationMd:
              "The ratio itself is a usage-pattern fact, but what it *does* to the design is exactly " +
              "how a force operates - it changes which trade-off matters.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-2-functional-requirements",
    mode: "building-blocks",
    title: "Functional Requirements",
    // Real authored content (Wave 2, second Part 1 chapter). Spec:
    // specs/bb-1-2-functional-requirements.spec.md. Lesson body:
    // public/content/chapters/bb-1-2-functional-requirements.md.
    problemStatement:
      "A feature only belongs on the system's Must-have list if the system fails at its core job " +
      "without it - everything else is Should, Could, or Won't (this pass), and writing the cut " +
      "list down is what keeps it cut. This chapter teaches that test and the Must/Should/Could/" +
      "Won't vocabulary for scoping a feature list ruthlessly. No build: the knowledge check gives " +
      "you a brief and a list of candidate features and asks you to sort them.",
    // Five objectives - all five §5.2 categories present, same as 1.1 (Process
    // chapters don't get the Concept-only Practical carve-out). Practical is
    // exercised by the quiz's multi-select question standing in for CURRICULUM
    // §14's staged checklist exercise (spec §5 - stages UI doesn't exist yet).
    learningObjectives: [
      "Knowledge - State the test that decides whether a feature belongs on the Must-have list: the system fails its core job without it.",
      "Engineering - Sort a list of candidate features for a brief into Must, Should, Could, and Won't using that test.",
      "Interview - Name the Must-have list crisply and state why one or two features are deliberately deferred, inside the interview's requirements step.",
      "Practical - Given a brief and a list of candidate features, select exactly the ones that belong on the Must-have list.",
      "Communication - State out loud why a specific feature was cut, not just that it was cut.",
    ],
    // No components introduced (§16 homes the three primitives at 1.6) and no
    // construction-family exercise - same degradation as 1.1: the staged
    // checklist CURRICULUM §14 specifies becomes the quiz's multi-select
    // question (spec §5) until the stages UI lands.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-2-hint-1",
        body:
          "Ask whether the system's one job would actually fail without this feature - not whether " +
          "the feature would be nice to have.",
      },
      {
        id: "bb-1-2-hint-2",
        body:
          "If a feature only makes sense because a clarifying question's answer confirmed it (1.1), " +
          "that confirmed answer is what moves it into Must - not your intuition about what this " +
          "kind of product usually has.",
      },
      {
        id: "bb-1-2-hint-3",
        body:
          "Should, Could, and Won't aren't \"no\" - they're \"not this pass.\" Write the deferred " +
          "ones down instead of silently dropping them.",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-08), driven by user feedback that the
    // chapter dragged and didn't cohere. Cold open no longer states the answer
    // before the think-first prompt (and "five features" now matches the seven
    // listed), the primary diagram became a four-outcome router so the test and
    // the MoSCoW buckets are one model instead of two (this also drops the
    // near-identical decision-tree echo of 1.1), "In production" was rewritten
    // to explain Shape Up before using it, and "In production" moved after the
    // trade-offs section to restore §5.3's beat order. See spec §13.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.2 of 44.",
      masteredConcepts: [
        "The clarifying-question test from 1.1, and its URL shortener worked example (heavy read " +
          "skew, confirmed link expiry).",
        "The Interview Loop's eight steps, with requirements as step 2 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Non-functional requirements as a formal category - numbers-shaped promises like latency, " +
          "availability, consistency, durability, cost (1.3).",
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Estimation math and the numbers-every-engineer-should-know landmarks (1.4-1.5).",
      ],
      simplifications: [
        "Must/Should/Could/Won't (MoSCoW) is one popular prioritization scheme, not the only valid " +
          "one - a working vocabulary for this stage, not a claim it's the single correct method.",
        "CURRICULUM.md §14 specifies this chapter's exercise as a staged checklist with feedback; " +
          "the stages UI doesn't exist yet, so it's realized here as a quiz multi-select question " +
          "instead (see the chapter spec §5), the same documented degradation pattern 1.1 used.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2/0.3/0.4/1.1's convention. Q1 stands in for
    // CURRICULUM §14's staged checklist exercise (spec §5), continuing 1.1's
    // URL shortener brief for continuity across the loop's first two steps.
    // Q2-Q5 are original. Correct-position spread for the four single-kind
    // questions (b, a, c, d) checked by eye against the clustering bug fixed
    // in 0.1/0.2.
    quiz: [
      {
        id: "bb-1-2-functional-requirements-q1",
        kind: "multi",
        difficulty: 1,
        prompt:
          "Same URL shortener brief as 1.1, now confirmed: heavy read skew, and links expire after " +
          "a year. Select ALL of the following that belong on the Must-have list.",
        options: [
          {
            id: "a",
            label: "Create a short link from a long URL.",
            correct: true,
            explanationMd: "Half of the core job. The system has no product at all without it.",
          },
          {
            id: "b",
            label: "Redirect a short link to its original URL.",
            correct: true,
            explanationMd: "The other half of the core job - create with no redirect is not a product either.",
          },
          {
            id: "c",
            label: "Automatically expire links once the confirmed date passes.",
            correct: true,
            explanationMd:
              "The confirmed non-negotiable from 1.1 moved this into Must - a fact about this brief, " +
              "not an assumption about URL shorteners in general.",
          },
          {
            id: "d",
            label: "Custom vanity aliases.",
            correct: false,
            explanationMd:
              "Real value, but the core loop works fine with random codes - Could, not Must, for this " +
              "brief's audience.",
          },
          {
            id: "e",
            label: "A dashboard of click counts.",
            correct: false,
            explanationMd:
              "Nothing in the confirmed brief requires it. Won't (this pass) - write it down rather " +
              "than build it now.",
          },
          {
            id: "f",
            label: "Reject a malformed URL before shortening it.",
            correct: false,
            explanationMd:
              "Should, not Must - it makes the core job safe, but the core job (create, redirect) " +
              "still exists without this check.",
          },
          {
            id: "g",
            label: "User accounts to manage links.",
            correct: false,
            explanationMd: "Won't (this pass) - nothing in the brief makes accounts part of the core job.",
          },
          {
            id: "h",
            label: "QR code generation for each short link.",
            correct: false,
            explanationMd: "Could - genuinely useful, no dependency on create-and-redirect working.",
          },
        ],
      },
      {
        id: "bb-1-2-functional-requirements-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A ticket-booking app's brief says: \"search must return results in under 300 ms, and " +
          "users can filter results by date.\" Which part is a functional requirement?",
        options: [
          {
            id: "a",
            label: "\"Returns results in under 300 ms.\"",
            correct: false,
            explanationMd:
              "A promise about how well the system performs, not what it does - a non-functional " +
              "requirement (1.3's territory).",
          },
          {
            id: "b",
            label: "\"Users can filter results by date.\"",
            correct: true,
            explanationMd:
              "Correct. A specific thing the system does - exactly the kind of feature the " +
              "Must/Should/Could/Won't test sorts.",
          },
          {
            id: "c",
            label: "Both are functional requirements.",
            correct: false,
            explanationMd:
              "The latency line says nothing about what the system does, only how well it does " +
              "something else - not a feature.",
          },
          {
            id: "d",
            label: "Neither - both are implementation details the interviewer should specify.",
            correct: false,
            explanationMd:
              "Filtering by date is a real feature choice, not an implementation detail like database " +
              "choice or language (1.1).",
          },
        ],
      },
      {
        id: "bb-1-2-functional-requirements-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "Halfway through a build, a teammate says: \"wait, doesn't this need user accounts? I " +
          "assumed that was obvious.\" The feature was never discussed in scoping. What's the " +
          "actual failure here?",
        options: [
          {
            id: "a",
            label:
              "The Won't-have list was never written down, so an assumed feature could sneak back " +
              "in as if it had always been in scope.",
            correct: true,
            explanationMd:
              "Correct. The category isn't what failed - the missing write-down is what let an " +
              "assumption stand in for a decision.",
          },
          {
            id: "b",
            label: "The feature should have been built from the start - user accounts are always Must-have.",
            correct: false,
            explanationMd:
              "Whether it's Must depends on the brief and the audience, not a blanket rule about the " +
              "product category.",
          },
          {
            id: "c",
            label: "Nothing went wrong - catching a missing feature mid-build is exactly what code review is for.",
            correct: false,
            explanationMd:
              "The problem isn't that it surfaced - it's that whatever decision was made about it was " +
              "never written down for the team to check against.",
          },
          {
            id: "d",
            label: "The team should have built every conceivable feature to avoid this exact conversation.",
            correct: false,
            explanationMd: "This chapter's own cold open, just moved later into the build instead of the interview.",
          },
        ],
      },
      {
        id: "bb-1-2-functional-requirements-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Team A sells branded short links to marketing departments. Team B is building a personal " +
          "tool for one person's own links. Where does \"custom aliases\" belong for each?",
        options: [
          {
            id: "a",
            label: "Must for both - custom aliases are always a core URL-shortener feature.",
            correct: false,
            explanationMd:
              "The category depends on the audience the brief establishes, not the product category " +
              "in general.",
          },
          {
            id: "b",
            label: "Could for both - branding is a marketing concern, never part of the core job.",
            correct: false,
            explanationMd:
              "True for Team B, not Team A - for a product sold to marketing teams, branded links are " +
              "the reason the product gets used at all.",
          },
          {
            id: "c",
            label:
              "Must for Team A, Could for Team B - the same feature sits in a different bucket " +
              "because the audience changes what \"the core job\" means.",
            correct: true,
            explanationMd:
              "Correct. Team A's product is unusable for its actual customers without it; Team B's " +
              "core loop works fine with random codes.",
          },
          {
            id: "d",
            label: "Won't for both - aliases are polish, not a real requirement.",
            correct: false,
            explanationMd: "Dismisses the audience-dependent judgment call entirely - wrong for Team A specifically.",
          },
        ],
      },
      {
        id: "bb-1-2-functional-requirements-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "In 1.1, \"do we need click analytics?\" was worth asking because a different answer " +
          "changes the design. Suppose the interviewer answers yes. Where does \"click-count " +
          "dashboard\" move on today's list?",
        options: [
          {
            id: "a",
            label: "It stays Won't (this pass) - analytics is never core to a URL shortener.",
            correct: false,
            explanationMd:
              "The sort responds to the confirmed brief, not a fixed rule about URL shorteners - the " +
              "same reasoning that put expiry in Must.",
          },
          {
            id: "b",
            label: "It moves to Could - a confirmed answer only ever adds optional value.",
            correct: false,
            explanationMd:
              "A \"yes\" to a question that changes the design redefines the core job - it doesn't " +
              "just add an extra.",
          },
          {
            id: "c",
            label: "Nothing changes - 1.1's questions only affect scale and architecture, not the feature list.",
            correct: false,
            explanationMd:
              "1.1's own test (would a different answer change the design) applies to feature scope " +
              "exactly as much as topology - that's the bridge this chapter builds.",
          },
          {
            id: "d",
            label:
              "It moves to Must - a confirmed \"yes\" to a non-negotiable clarifying question makes " +
              "the feature part of the system's actual job, the same way expiry did.",
            correct: true,
            explanationMd:
              "Correct. A confirmed answer from 1.1 is exactly what moved expiry into Must here too - " +
              "the same mechanism, a different feature.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-3-non-functional-requirements",
    mode: "building-blocks",
    title: "Non-functional Requirements",
    // Real authored content (Wave 2, third Part 1 chapter). Spec:
    // specs/bb-1-3-non-functional-requirements.spec.md. Lesson body:
    // public/content/chapters/bb-1-3-non-functional-requirements.md.
    problemStatement:
      "A non-functional requirement is a functional requirement's how well partner (1.2) - stated " +
      "as a number you'd defend, not an adjective you'd say. This chapter turns 0.2's five forces " +
      "into their measurable shapes (a latency budget, a throughput floor, an availability " +
      "percentage, a durability tolerance, a cost ceiling) and teaches why the number, not the " +
      "feeling, is what actually constrains a design. No build: the knowledge check gives you " +
      "three described products and asks you to match each to the number that dominates it.",
    // Five objectives - all five §5.2 categories present, same as 1.1/1.2
    // (Process chapters don't get the Concept-only Practical carve-out).
    // Practical is exercised by the quiz's matching question standing in for
    // CURRICULUM §14's own exercise description (spec §5 - no stages UI
    // needed here, unlike 1.1/1.2's degradation, since §14's own row never
    // called this one "staged").
    learningObjectives: [
      "Knowledge - State what makes a promise a non-functional requirement: a number about how well the system performs, not what it does, tied to one of 0.2's five forces.",
      "Engineering - Translate a described product's dominant pressure into the NFR-shaped number that actually constrains its design (a latency budget, an availability target, a durability tolerance) instead of a vague adjective.",
      "Interview - State a non-functional requirement as a number with a stated reason, instead of an adjective like 'fast' or 'reliable', inside the interview's requirements step.",
      "Practical - Given three described products, match each to the number that actually dominates its design.",
      "Communication - Justify why one force is prioritized over another for a given product, naming the cost of buying the extra nine or the tighter budget.",
    ],
    // No components introduced (§16 homes the three primitives at 1.6) and no
    // construction-family exercise - same pattern 1.1/1.2 established for
    // Part 1's no-build Process chapters.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-3-hint-1",
        body:
          "Read the requirement and ask: is it a number you could check against a dashboard, or is " +
          "it an adjective like \"fast\" or \"reliable\" that nobody could actually test?",
      },
      {
        id: "bb-1-3-hint-2",
        body:
          "Ask which single force (0.2) this product's worst failure story is about - what actually " +
          "goes wrong for the user, and which of the five forces does that belong to?",
      },
      {
        id: "bb-1-3-hint-3",
        body:
          "Durability answers \"is the data still there\"; availability answers \"can I reach it " +
          "right now.\" Don't let one product's number stand in for the other.",
      },
    ],
    readingLinks: [],
    // 2: Opus proofread pass (2026-08-09). Density fix - the primary diagram
    // and the core-mechanics table stated the same force-to-number-shape
    // mapping twice, so the table's middle column was cut and it now carries
    // worked examples only. Also: p99 defined at first use, a false
    // "availability compounds the same way" bridge rewritten, "buys back 10x
    // less downtime" -> "cuts downtime tenfold" (body + recap), the senior
    // line's "fifth nine" -> "fourth nine" (it sits at 99.9%), S3's 99.9%
    // labelled as its service-agreement figure, and "Your turn" given the
    // withheld-information line it was missing. See spec §13.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.3 of 44.",
      masteredConcepts: [
        "0.2's five forces (latency, throughput, availability, durability, cost) and that they " +
          "trade against each other.",
        "1.2's Must/Should/Could/Won't feature list - the thing this chapter attaches numeric " +
          "promises to.",
        "The Interview Loop's eight steps, with requirements as step 2 (0.4).",
      ],
      notYetIntroducedConcepts: [
        "Estimation math - turning a user count into QPS, storage, and bandwidth (1.4-1.5). This " +
          "chapter names the shape of the number; deriving it from scale is next.",
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Consistency as a formal design concern, deferred to 3.22 - not one of the five forces this " +
          "curriculum teaches (0.2).",
      ],
      simplifications: [
        "Nines-to-downtime figures use a 365.25-day year and standard rounding - illustrative, not " +
          "exact SLA legal language.",
        "Real NFR-setting also weighs measured historical data and business risk tolerance, " +
          "compressed here into \"name the dominant force and defend the number.\"",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2/0.3/0.4/1.1/1.2's convention. Q1 stands in
    // for CURRICULUM §14's own exercise ("match NFRs to three described
    // products; explanation per match") directly - no degradation flag
    // needed, unlike 1.1/1.2's staged-exercise substitutions. Q2-Q5 are
    // original. Correct-position spread for the four single-kind questions
    // (b, c, a, d) checked by eye against the clustering bug fixed in 0.1/0.2.
    quiz: [
      {
        id: "bb-1-3-non-functional-requirements-q1",
        kind: "matching",
        difficulty: 1,
        prompt: "Match each product to the number that actually dominates its design.",
        // Option order is a full derangement against pairs' order below
        // (durability, throughput, latency vs. pairs' latency, durability,
        // throughput) - no pair's correct option sits at its own index.
        options: [
          {
            id: "durability-nfr",
            label: "99.999999999% durability - a stored file is essentially never lost",
            correct: true,
            explanationMd:
              "A scan can't be re-taken from that moment - losing the file is unrecoverable in a way " +
              "a slow load never is.",
          },
          {
            id: "throughput-nfr",
            label: "Accepts 50,000 votes in the same three minutes without dropping any",
            correct: true,
            explanationMd:
              "The whole risk is the concurrent spike; each individual vote landing a few hundred ms " +
              "slower barely matters.",
          },
          {
            id: "latency-nfr",
            label: "p99 response time under 150 ms",
            correct: true,
            explanationMd:
              "Someone standing on a curb expects the app to feel instant - a slow response reads as " +
              "broken, not busy.",
          },
        ],
        pairs: [
          ["A ride-hailing app's driver-match request, tapped by someone standing on a curb", "latency-nfr"],
          [
            "A hospital archiving every patient's MRI scan for the legally required 7 years, with no way to re-take an old scan",
            "durability-nfr",
          ],
          [
            "A conference Q&A app collecting audience up-votes during the single most-attended talk of the day",
            "throughput-nfr",
          ],
        ],
      },
      {
        id: "bb-1-3-non-functional-requirements-q2",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these is a properly stated non-functional requirement?",
        options: [
          {
            id: "a",
            label: "The checkout page should feel snappy.",
            correct: false,
            explanationMd: "\"Snappy\" isn't a number - nobody can check it against a dashboard.",
          },
          {
            id: "b",
            label: "p99 checkout latency under 300 ms.",
            correct: true,
            explanationMd: "Correct. A percentile, a number, and a unit - testable and specific.",
          },
          {
            id: "c",
            label: "Users can apply a discount code at checkout.",
            correct: false,
            explanationMd:
              "This is what the system does, not how well it does it - a functional requirement " +
              "(1.2), not an NFR.",
          },
          {
            id: "d",
            label: "The system should be reliable.",
            correct: false,
            explanationMd: "Same problem as \"snappy\" - an adjective nobody can measure or defend.",
          },
        ],
      },
      {
        id: "bb-1-3-non-functional-requirements-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "A team is deciding between 99.9% and 99.99% availability for an internal reporting tool " +
          "12 employees check during business hours. What's the strongest argument against the " +
          "extra nine?",
        options: [
          {
            id: "a",
            label: "It's technically impossible to reach 99.99% without a full multi-region deployment.",
            correct: false,
            explanationMd: "Possible, just not free - this overstates the barrier.",
          },
          {
            id: "b",
            label: "Nines don't matter for internal tools, only customer-facing ones.",
            correct: false,
            explanationMd:
              "A blanket rule, not a judgment - some internal tools (a deploy pipeline) genuinely " +
              "need high availability. This one's usage pattern is the real reason, not its " +
              "internal label.",
          },
          {
            id: "c",
            label:
              "The extra nine buys back about 8 hours of yearly downtime, but the failover " +
              "machinery and on-call burden it costs aren't justified by a tool 12 people check " +
              "during business hours.",
            correct: true,
            explanationMd:
              "Correct. The number isn't free, and nothing here describes a force under enough " +
              "pressure to justify the cost (0.2's cost force).",
          },
          {
            id: "d",
            label: "There's no real difference between the two numbers.",
            correct: false,
            explanationMd:
              "The nines table says otherwise - roughly 8 hours a year versus roughly 53 minutes a " +
              "year, a real gap.",
          },
        ],
      },
      {
        id: "bb-1-3-non-functional-requirements-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A candidate says: \"the system needs to be highly available and fast.\" What's the " +
          "interviewer's strongest follow-up?",
        options: [
          {
            id: "a",
            label: "\"Give me a number for each, and tell me why not a different one.\"",
            correct: true,
            explanationMd:
              "Correct - forcing the adjective into something the design can actually be checked " +
              "against is the whole move this chapter teaches.",
          },
          {
            id: "b",
            label: "Nothing - the candidate named the right forces.",
            correct: false,
            explanationMd: "Naming the forces (0.2) is step one; nothing here is a number yet.",
          },
          {
            id: "c",
            label: "\"Which programming language will you use to achieve that?\"",
            correct: false,
            explanationMd:
              "Language is a decision for the candidate to make (1.1), not a fact that changes the " +
              "NFR.",
          },
          {
            id: "d",
            label: "Move on to the next requirement - availability and speed are always assumed.",
            correct: false,
            explanationMd: "Assuming a force needs no number skips the entire point of this chapter.",
          },
        ],
      },
      {
        id: "bb-1-3-non-functional-requirements-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "A teammate says: \"99.999999999% durability and 99.99% availability are basically the " +
          "same guarantee, restated twice.\" What's wrong with that claim?",
        options: [
          {
            id: "a",
            label:
              "Nothing's wrong - both numbers describe how trustworthy the system is, so they can " +
              "be quoted interchangeably.",
            correct: false,
            explanationMd:
              "Interchanging them hides a real gap: a system can hold every byte perfectly while " +
              "being completely unreachable, or the reverse (0.2).",
          },
          {
            id: "b",
            label: "Durability is just a stricter version of availability - more nines, same idea.",
            correct: false,
            explanationMd:
              "Not the same axis - one asks whether a write survives, the other asks whether the " +
              "system answers right now. More nines doesn't turn one into the other.",
          },
          {
            id: "c",
            label: "The claim is right for storage systems, but wrong for compute systems.",
            correct: false,
            explanationMd:
              "Invents a boundary the two forces don't actually have - the distinction (0.2) applies " +
              "to any system that stores something, not a storage-versus-compute split.",
          },
          {
            id: "d",
            label:
              "They measure different failures - durability asks whether a write survives, " +
              "availability asks whether the system answers right now, and a system can fail one " +
              "without failing the other.",
            correct: true,
            explanationMd:
              "Correct. S3's own two numbers make this concrete: a lost byte and a brief outage are " +
              "different failures with different engineering answers.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-4-estimating-scale",
    mode: "building-blocks",
    title: "Estimating Scale",
    // Real authored content (Wave 2, fourth Part 1 chapter). Spec:
    // specs/bb-1-4-estimating-scale.spec.md. Lesson body:
    // public/content/chapters/bb-1-4-estimating-scale.md.
    problemStatement:
      "Estimation turns a daily volume into an order of magnitude - QPS, storage, bandwidth - using " +
      "a day's ~10^5-second shortcut, never a precise figure. This chapter teaches when that " +
      "estimate actually changes a design decision (a number sitting near a real threshold) and " +
      "when refining it further is wasted effort (a number nowhere close to one). No build: the " +
      "knowledge check gives you a product's daily volume and asks you to pick the right " +
      "order-of-magnitude bucket for each output in turn.",
    // Five objectives - all five §5.2 categories present, same as 1.1/1.2/1.3
    // (Process chapters don't get the Concept-only Practical carve-out).
    // Practical is exercised by the quiz's estimate-kind questions standing in
    // for CURRICULUM §14's own staged bucket-choice exercise (spec §5 - same
    // stages-UI degradation pattern 1.1/1.2 used).
    learningObjectives: [
      "Knowledge - State the ~10^5-seconds-a-day shortcut and explain why an order-of-magnitude answer, not a precise one, is estimation's actual deliverable.",
      "Engineering - Convert a product's daily volume into average QPS, peak QPS, storage, and bandwidth, and identify which of those numbers actually changes a design decision.",
      "Interview - State an estimate as a round number with the benchmark named, in a couple of minutes, instead of computing a precise figure.",
      "Practical - Given a product's daily volume, choose the correct order-of-magnitude bucket for QPS, storage, and bandwidth, with a stated reason.",
      "Communication - Justify why a peak-load estimate deserves more scrutiny than a storage estimate for a specific product, naming the threshold each one is or isn't near.",
    ],
    // No components introduced (§16 homes the three primitives at 1.6) and no
    // construction-family exercise - same no-build Process pattern 1.1/1.2/1.3
    // established.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-4-hint-1",
        body:
          "Convert the daily number into a rate first - divide by about 10^5 seconds in a day - " +
          "before worrying about anything else.",
      },
      {
        id: "bb-1-4-hint-2",
        body:
          "A rate by itself isn't the whole answer - ask whether a peak multiplier (2-10x, from the " +
          "product's own usage pattern) would push that rate past a threshold that matters.",
      },
      {
        id: "bb-1-4-hint-3",
        body:
          "Check whether the number you're estimating is close to a threshold that would change the " +
          "design, or comfortably far from one - that's what decides how much precision it's worth.",
      },
    ],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-09).
    // 2: Opus proofread (2026-08-09) - diagram's storage/bandwidth branches
    //    corrected to match the prose, caption's "bandwidth doesn't spike"
    //    claim fixed, lens-7 sentence made specific, "Your turn" no longer
    //    promises a bandwidth question the quiz doesn't ask.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.4 of 44.",
      masteredConcepts: [
        "0.4's loop step 3 (users -> QPS -> storage -> bandwidth) and that estimation runs in " +
          "powers of ten, never precise figures.",
        "1.1's clarifying-question test and its 1000:1 read:write ratio example for the URL " +
          "shortener, confirmed here as the real number for that brief.",
        "1.3's non-functional requirements (p99 latency, availability) as the numbers a design has " +
          "to satisfy - this chapter estimates the load those numbers have to hold up under.",
      ],
      notYetIntroducedConcepts: [
        "The landmark latency/throughput/storage ratios (RAM vs. disk vs. network, same-datacenter " +
          "vs. cross-continent) - 1.5's own material, deliberately not front-loaded here.",
        "Any specific component or edge kind - none are introduced until 1.6.",
        "How a peak-QPS number actually gets handled architecturally (more than one machine, a way " +
          "to add more) - 1.6 onward. This chapter only identifies which number would force that " +
          "decision, not how the decision gets built.",
      ],
      simplifications: [
        "Bytes-per-record and bytes-per-response figures are illustrative round numbers (\"call it " +
          "500 bytes\"), not measured - the skill being taught is picking a defensible round number " +
          "and stating it, not precision.",
        "A day is treated as ~10^5 seconds (actual: 86,400) throughout - that rounding is the " +
          "chapter's own point, not an error to correct.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2/0.3/0.4/1.1/1.2/1.3's convention. Q1-Q2
    // stand in for CURRICULUM §14's own "staged estimation with
    // order-of-magnitude buckets" exercise (spec §5 - same stages-UI
    // degradation 1.1/1.2 used), using the `estimate` quiz kind
    // (QUIZ_FRAMEWORK §2's bucket-choice format) on a fresh product rather
    // than the lesson's own URL-shortener numbers, so the check tests
    // transfer, not recall. Q3-Q5 are original. Correct-position spread for
    // the three single-kind questions (c, a, d) checked by eye against the
    // clustering bug fixed in 0.1/0.2.
    quiz: [
      {
        id: "bb-1-4-estimating-scale-q1",
        kind: "estimate",
        difficulty: 1,
        prompt:
          "A photo-sharing app has 50 million daily active users, each opening the feed about 4 " +
          "times a day. What's the order of magnitude for average feed-load QPS?",
        options: [
          {
            id: "a",
            label: "~20 requests per second",
            correct: false,
            explanationMd:
              "Off by two orders of magnitude - 200 million opens a day is nowhere near this small " +
              "once divided by ~10^5 seconds.",
          },
          {
            id: "b",
            label: "~2,000 requests per second",
            correct: true,
            explanationMd:
              "Correct. 50M x 4 = 200 million opens a day; divided by ~10^5 seconds a day lands at " +
              "about 2,000 QPS.",
          },
          {
            id: "c",
            label: "~200,000 requests per second",
            correct: false,
            explanationMd:
              "This treats the daily total itself as a per-second rate - dividing by seconds in a " +
              "day is the step that's missing.",
          },
          {
            id: "d",
            label: "~20,000,000 requests per second",
            correct: false,
            explanationMd:
              "This is roughly the daily total, not a rate - a request every day isn't the same " +
              "unit as a request every second.",
          },
        ],
      },
      {
        id: "bb-1-4-estimating-scale-q2",
        kind: "estimate",
        difficulty: 1,
        prompt:
          "That same app logs one analytics row per feed-open, about 200 bytes each, kept for 90 " +
          "days. What's the order of magnitude for total stored analytics data?",
        options: [
          {
            id: "a",
            label: "~4 megabytes",
            correct: false,
            explanationMd:
              "Off by six orders of magnitude - 200 million rows a day for 90 days is far more than " +
              "a few thousand rows' worth of data.",
          },
          {
            id: "b",
            label: "~4 gigabytes",
            correct: false,
            explanationMd:
              "Off by three orders of magnitude - a single day's rows alone (200 million x 200 " +
              "bytes) already clear a gigabyte before 90 days of accumulation.",
          },
          {
            id: "c",
            label: "~4 terabytes",
            correct: true,
            explanationMd:
              "Correct. 200 million rows/day x 90 days x 200 bytes lands around 3.6 trillion bytes " +
              "- a few terabytes, the point where a single ordinary database's disk stops being the " +
              "obvious answer.",
          },
          {
            id: "d",
            label: "~4 petabytes",
            correct: false,
            explanationMd:
              "Overshoots by three orders of magnitude - petabyte scale needs a much larger daily " +
              "volume or a much longer retention window than this brief states.",
          },
        ],
      },
      {
        id: "bb-1-4-estimating-scale-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "Average feed-load QPS for that app is about 2,000. A viral post could spike traffic well " +
          "above that average. What's the strongest way to account for it?",
        options: [
          {
            id: "a",
            label: "Assume peak equals average, since averages already smooth out spikes.",
            correct: false,
            explanationMd:
              "An average is a daily mean by construction - it can't also describe a short burst " +
              "above it.",
          },
          {
            id: "b",
            label: "Always assume peak is exactly 100x average, regardless of the product.",
            correct: false,
            explanationMd:
              "A fixed multiplier ignores the product's own usage pattern - the right multiplier is " +
              "a judgment (2-10x, occasionally more for something genuinely viral), not a constant.",
          },
          {
            id: "c",
            label:
              "Multiply average by a small factor (2-10x) based on how bursty this product's usage " +
              "pattern actually is, then check whether that crosses a real capacity threshold.",
            correct: true,
            explanationMd:
              "Correct. The multiplier comes from the product, not a formula, and the whole point is " +
              "finding out whether the peak number crosses into territory that changes what gets " +
              "built.",
          },
          {
            id: "d",
            label: "Skip peak entirely, since only creates spike, not reads.",
            correct: false,
            explanationMd:
              "Reads spike too - a viral post drives redirects and feed-loads, not new links or new " +
              "posts.",
          },
        ],
      },
      {
        id: "bb-1-4-estimating-scale-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A teammate spends fifteen minutes computing this app's storage figure down to the exact " +
          "byte, after already rounding it to \"a few terabytes.\" What's the strongest critique?",
        options: [
          {
            id: "a",
            label:
              "The order-of-magnitude answer already told you it needs real infrastructure beyond " +
              "a single database's disk - more decimal places wouldn't change that decision.",
            correct: true,
            explanationMd:
              "Correct. Once a number has already crossed the threshold that matters, refining it " +
              "further is exactly the wasted precision this chapter opened with.",
          },
          {
            id: "b",
            label: "None - more precision is always better.",
            correct: false,
            explanationMd:
              "More precision costs time; it's only worth spending when the answer is close enough " +
              "to a threshold that it could flip which side you land on.",
          },
          {
            id: "c",
            label: "The estimate should have been in bytes from the start, never terabytes.",
            correct: false,
            explanationMd:
              "The unit is cosmetic - terabytes and bytes describe the same number; the critique is " +
              "about spending time, not which unit was chosen.",
          },
          {
            id: "d",
            label: "Storage never matters enough to estimate at all.",
            correct: false,
            explanationMd:
              "It mattered enough here to change the answer from \"any database\" to \"real " +
              "infrastructure\" - the critique is about over-precision, not skipping the estimate.",
          },
        ],
      },
      {
        id: "bb-1-4-estimating-scale-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "A teammate claims: \"Since the URL shortener's storage and bandwidth came out tiny, " +
          "estimation barely mattered for that system.\" What's the strongest correction?",
        options: [
          {
            id: "a",
            label: "Estimation only matters for large-scale systems, not modest ones.",
            correct: false,
            explanationMd:
              "The URL shortener is modest and estimation still mattered - for peak QPS, just not " +
              "for the other two numbers.",
          },
          {
            id: "b",
            label:
              "All four numbers matter equally on every system, so this one was actually a rare " +
              "exception.",
            correct: false,
            explanationMd:
              "The opposite pattern - which numbers matter varies by system, and this system " +
              "happened to have exactly one that did.",
          },
          {
            id: "c",
            label:
              "Since three of four numbers turned out tiny, none of them were worth computing in " +
              "the first place.",
            correct: false,
            explanationMd:
              "You don't know a number is tiny until you check it - skipping the check isn't the " +
              "lesson, computing it quickly and moving on is.",
          },
          {
            id: "d",
            label:
              "It mattered for peak QPS, the one number that sat near a real threshold - estimation " +
              "matters exactly where a number is close enough to a threshold to change the design, " +
              "and this system had exactly one such number.",
            correct: true,
            explanationMd:
              "Correct. Storage and bandwidth being trivial here doesn't mean estimation didn't " +
              "matter - it means estimation is what revealed they didn't.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-5-numbers-every-engineer-should-know",
    mode: "building-blocks",
    title: "Numbers Every Engineer Should Know",
    // Real authored content (Wave 2, fifth Part 1 chapter). Spec:
    // specs/bb-1-5-numbers-every-engineer-should-know.spec.md. Lesson body:
    // public/content/chapters/bb-1-5-numbers-every-engineer-should-know.md.
    problemStatement:
      "Some numbers are cheaper to memorize outright than to derive live - the latency ladder from RAM " +
      "through SSD, a same-datacenter network hop, a disk seek, and a cross-continent network hop, each " +
      "roughly one to two orders of magnitude past the one before, with one pair that swaps order. This " +
      "chapter teaches the ladder and the ratios between its rungs, not just the raw figures. No build: " +
      "the knowledge check asks you to rank a short list of operations fastest to slowest using the " +
      "ladder, then estimate the rough total latency of a request built from a stated combination of them.",
    // Five objectives - all five §5.2 categories present (Process chapters
    // don't get the Concept-only Practical carve-out, same as 1.1-1.4).
    learningObjectives: [
      "Knowledge - State the five-rung latency ladder (RAM, SSD, same-datacenter network, disk seek, cross-continent network) in the correct relative order without deriving it from scratch.",
      "Engineering - Decide whether a design's dominant latency cost is a compute problem or a data-locality problem, by naming which rung of the ladder a given operation sits on.",
      "Interview - Quantify a cache's or a nearby copy's benefit as a rough order-of-magnitude number, using the ladder, instead of a bare 'it's faster.'",
      "Practical - Given a short list of operations, rank them fastest to slowest using the ladder's ratios, and estimate the order-of-magnitude latency of a request built from a stated combination of them.",
      "Communication - Explain in one sentence why a same-datacenter network round trip can beat a local disk seek, naming the physical reason.",
    ],
    // No components introduced (§16 homes the three primitives at 1.6) and no
    // construction-family exercise - same no-build Process pattern
    // 1.1/1.2/1.3/1.4 established.
    availableComponentIds: [],
    requiredComponentIds: [],
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    hints: [
      {
        id: "bb-1-5-hint-1",
        body:
          "Start from the ends of the ladder you're most sure of - RAM is the fastest, cross-continent " +
          "network is the slowest - then place the rest relative to those two.",
      },
      {
        id: "bb-1-5-hint-2",
        body:
          "A disk seek is mechanical - something physically has to move. A same-datacenter network hop " +
          "is electrical. That difference is worth thinking about when you're unsure which one wins.",
      },
      {
        id: "bb-1-5-hint-3",
        body:
          "For the estimate drill, find the single slowest operation in the combination first - the " +
          "total is dominated by that one, not the precise sum of all of them.",
      },
    ],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-09).
    // 2: Opus proofread (2026-08-09) - "rung" now defined at first use and the
    //    ladder given one fixed orientation (was used to mean both faster and
    //    slower), the RAM/SSD/network ratio chain made arithmetically
    //    consistent (SSD "~10s of microseconds" -> "~10 microseconds",
    //    SSD -> datacenter edge "~10x" -> "~50x"), the diagram flipped to TD so
    //    it matches the ladder metaphor, and roughly a dozen multi-clause
    //    sentences split. See spec §13.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.5 of 44.",
      masteredConcepts: [
        "1.4's estimation shortcut (~10^5 seconds/day) and its own distinction between a number worth " +
          "deriving and a number that's already close enough to a threshold that refining it wastes " +
          "time - reapplied here to numbers worth memorizing instead of deriving at all.",
        "0.2's five forces, specifically the cache force (a cache buys latency by keeping hot data " +
          "closer than its source) - this chapter supplies the physical ratios that force explains.",
        "1.3's non-functional requirements as numbers-shaped promises (p99 latency, availability) - the " +
          "budgets this chapter's ladder has to fit inside.",
      ],
      notYetIntroducedConcepts: [
        "Any specific component or edge kind - none are introduced until 1.6.",
        "Named replication or consistency mechanisms for keeping a nearby copy in sync - referenced " +
          "only as 'a real mechanism' here, taught starting 3.12 and 3.22.",
        "CDNs, regions, or any named way of placing data near users - 1.5 teaches only the raw latency " +
          "gap those mechanisms close, not the mechanisms themselves (home: 3.15 and later).",
      ],
      simplifications: [
        "The ladder's figures are order-of-magnitude landmarks, not measured benchmarks for any " +
          "specific vendor or hardware generation - real numbers vary by SSD generation, network path, " +
          "and workload. The ratio between rungs is the durable fact; the exact millisecond isn't.",
        "\"Same-datacenter\" and \"cross-continent\" stand in for the two ends of the network-distance " +
          "spectrum worth having memorized, not an exhaustive list of real network distances.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2-1.4's convention. Q1 (ordering) and Q2
    // (estimate) directly realize CURRICULUM §14's "ranking + estimation
    // drills" exercise - not a stages-UI degradation like 1.1/1.2/1.4's,
    // since §14's row never calls this exercise "staged" (same non-
    // degradation judgment call 1.3 made). Q3-Q5 are original, modeled on
    // QUIZ_FRAMEWORK §6's own Q5/Q6 (already written against this chapter)
    // without reusing their wording. Correct-position spread for the three
    // single-kind questions (c, a, d) checked by eye against the clustering
    // bug fixed in 0.1/0.2.
    quiz: [
      {
        id: "bb-1-5-numbers-every-engineer-should-know-q1",
        kind: "ordering",
        difficulty: 1,
        prompt:
          "Order these five operations from fastest to slowest: a RAM reference, an SSD read, a " +
          "same-datacenter network round trip, a local disk seek, a cross-continent network round trip.",
        // Full derangement against correctOrder - Ordering.tsx shows this
        // array's authored order with no shuffle, so a naturally-ordered
        // draft would ship pre-solved.
        options: [
          {
            id: "ssd",
            label: "SSD read",
            correct: true,
            explanationMd:
              "Second - roughly 10-100x slower than a RAM reference, but no moving parts, so still far " +
              "ahead of anything on this list involving a network or a spinning disk.",
          },
          {
            id: "cross",
            label: "Cross-continent network round trip",
            correct: true,
            explanationMd:
              "Last - bounded by real physical distance and the cables a signal has to cross; roughly " +
              "150-300x the same-datacenter round trip, and no code shortens that floor.",
          },
          {
            id: "ram",
            label: "RAM reference",
            correct: true,
            explanationMd: "First - electrical, a few nanoseconds, the fastest rung on the ladder.",
          },
          {
            id: "samedc",
            label: "Same-datacenter network round trip",
            correct: true,
            explanationMd:
              "Third - pays queuing and OS overhead on top of wire speed, but that wire is measured in " +
              "feet, which is why it still beats a disk seek.",
          },
          {
            id: "disk",
            label: "Local disk seek",
            correct: true,
            explanationMd:
              "Fourth, not third - a physical arm moving across a spinning platter is a real mechanical " +
              "delay, slower than a network hop to the machine next door.",
          },
        ],
        correctOrder: ["ram", "ssd", "samedc", "disk", "cross"],
      },
      {
        id: "bb-1-5-numbers-every-engineer-should-know-q2",
        kind: "estimate",
        difficulty: 1,
        prompt:
          "A request does one RAM lookup, then one same-datacenter network round trip to another " +
          "service. What's the order of magnitude for the pair's total latency?",
        options: [
          {
            id: "a",
            label: "~1 microsecond",
            correct: false,
            explanationMd:
              "This ignores the network hop entirely - a same-datacenter round trip alone runs closer " +
              "to a millisecond, a thousand times slower than this.",
          },
          {
            id: "b",
            label: "~1 millisecond",
            correct: true,
            explanationMd:
              "Correct. The RAM lookup (~100 ns) is negligible next to the same-datacenter round trip " +
              "(~0.5-1 ms), which dominates the pair's total.",
          },
          {
            id: "c",
            label: "~1 second",
            correct: false,
            explanationMd:
              "Roughly a thousand times too slow for one same-datacenter hop - that scale of delay " +
              "usually means several hops, not one, or a cross-continent leg in the mix.",
          },
          {
            id: "d",
            label: "~100 seconds",
            correct: false,
            explanationMd:
              "Nothing on this ladder costs anywhere near this much - even a cross-continent round trip " +
              "is roughly five orders of magnitude faster than this.",
          },
        ],
      },
      {
        id: "bb-1-5-numbers-every-engineer-should-know-q3",
        kind: "single",
        difficulty: 2,
        prompt:
          "An engineer designs a service to read straight from local disk instead of adding a small " +
          "cache reachable over the datacenter network, reasoning that \"local is always faster than " +
          "the network.\" What's the strongest critique?",
        options: [
          {
            id: "a",
            label: "The critique is wrong - local disk is always faster than any network hop.",
            correct: false,
            explanationMd:
              "This is exactly the assumption the ladder disproves - a same-datacenter round trip is " +
              "typically faster than a disk seek, not slower.",
          },
          {
            id: "b",
            label: "The engineer should have used a faster CPU instead of worrying about storage at all.",
            correct: false,
            explanationMd:
              "A faster CPU doesn't touch either the disk-seek delay or the network round trip - neither " +
              "is a compute cost.",
          },
          {
            id: "c",
            label:
              "The assumption is backwards for this pair: a disk seek is typically slower than a " +
              "same-datacenter network round trip, which is exactly why fetching from a nearby cache " +
              "over the network can beat reading local disk.",
            correct: true,
            explanationMd:
              "Correct. This is the ladder's one out-of-order pair, and it's the reason large-scale " +
              "services put a memory cache between the app tier and the database in the first place.",
          },
          {
            id: "d",
            label: "Neither disk nor network latency matters once the response is compressed.",
            correct: false,
            explanationMd:
              "Compression shrinks payload size, not the seek delay or the round-trip time being " +
              "compared here - it addresses a different cost entirely.",
          },
        ],
      },
      {
        id: "bb-1-5-numbers-every-engineer-should-know-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A service's cross-continent API calls add roughly 150 ms per round trip. Which change " +
          "actually addresses that cost?",
        options: [
          {
            id: "a",
            label:
              "Serve the request from a location physically closer to the user - a cross-continent " +
              "round trip's ~150 ms is mostly the distance a signal has to travel, not code running slowly.",
            correct: true,
            explanationMd:
              "Correct. Distance sets a physical floor on round-trip time; the only way to lower it is " +
              "to shorten the distance.",
          },
          {
            id: "b",
            label: "Give the origin server more CPU cores.",
            correct: false,
            explanationMd:
              "More compute doesn't touch a physical-distance floor - the 150 ms isn't being spent " +
              "processing the request.",
          },
          {
            id: "c",
            label: "Compress the response body further.",
            correct: false,
            explanationMd:
              "Compression shrinks transfer time, a small fraction of the total next to the propagation " +
              "delay a cross-continent hop pays regardless of payload size.",
          },
          {
            id: "d",
            label: "Retry the request automatically if it seems slow.",
            correct: false,
            explanationMd:
              "A retry pays the same ~150 ms again - it doesn't reduce the cost, it repeats it.",
          },
        ],
      },
      {
        id: "bb-1-5-numbers-every-engineer-should-know-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "1.4 taught you to compute an order-of-magnitude estimate from first principles and spend " +
          "extra precision only where a number sits near a real threshold. How does that rule apply to " +
          "this chapter's landmark ratios?",
        options: [
          {
            id: "a",
            label: "It doesn't - these ratios should always be re-derived from physics for accuracy.",
            correct: false,
            explanationMd:
              "1.4 never asked for re-derivation by default - it endorsed a memorized shortcut " +
              "(~10^5 seconds/day) precisely to avoid rebuilding a number from scratch each time.",
          },
          {
            id: "b",
            label:
              "Since these ratios are memorized constants, no engineer should ever bother measuring a " +
              "real system's actual numbers.",
            correct: false,
            explanationMd:
              "This overcorrects - 1.4's rule is to spend precision where an estimate sits near a real " +
              "threshold, not to never measure anything.",
          },
          {
            id: "c",
            label:
              "The two rules are unrelated - 1.4 was about traffic volume and this chapter is about " +
              "physical latency, so they don't share a lesson.",
            correct: false,
            explanationMd:
              "Both chapters teach the same rule (order of magnitude first, precision only where it " +
              "earns its keep) applied to two different kinds of numbers.",
          },
          {
            id: "d",
            label:
              "The rule is identical: memorize the ladder as a fast default, and spend time measuring a " +
              "system's real numbers only when an estimate built from the ladder lands close enough to " +
              "a threshold to matter.",
            correct: true,
            explanationMd:
              "Correct. The ladder is this chapter's version of 1.4's ~10^5-seconds shortcut - a fast " +
              "default good enough until a real threshold says otherwise.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-6-drawing-the-first-architecture",
    mode: "building-blocks",
    title: "Drawing the First Architecture",
    // Real authored curriculum content (Wave 2, Part 1, pending-content.md).
    // Spec: specs/bb-1-6-drawing-the-first-architecture.spec.md. Lesson body:
    // public/content/chapters/bb-1-6-drawing-the-first-architecture.md.
    // First Building Block chapter (§4) - 1.1-1.5 were Concept/Process with
    // no components, no starterGraph, no blueprints. This one has all three
    // for real, plus §16's formal introduction of the three primitives that
    // 0.1 only borrowed as narrow scenery.
    problemStatement:
      "The starter design on the canvas skips the app server: the client is wired straight to " +
      "the database. No tour walks you through this one. Run Validate, read what it reports, and " +
      "use that to decide what to add and what to rewire. Add the missing component, route both " +
      "edges through it, get a clean Validate, then Submit.",
    // Six objectives (§5.2 allows 3-7): all five required categories, plus a
    // second Engineering objective for the two beats (Failure modes,
    // Scaling) that are mandatory for Building Block but were optional for
    // every Concept/Process chapter so far. Category tags live in the spec
    // (specs/bb-1-6-drawing-the-first-architecture.spec.md §2).
    learningObjectives: [
      "State the job each of the three primitive components does, and why the app server sits between the other two.",
      "Decide why a client should never connect directly to a database, naming the concrete risk it creates.",
      "Identify what breaks first in a one-app-server design, and state qualitatively what changes at 10x and 100x traffic.",
      "Fix a starter graph that skips the app server: add the missing component, route both edges through it, and pass a clean Validate then Submit.",
      "Produce a defensible first architecture for a simple product in under a minute, naming each component's job as you draw it.",
      "Explain, in your own words, why the no-direct-client-database validation failure fires and what it is protecting against.",
    ],
    // §16's audit row for 1.6 exactly: client, app-server, sql-database is
    // this chapter's home, not a borrowed exception. The exercise requires
    // all three - a minimal three-tier build has no optional piece, so
    // required equals available.
    availableComponentIds: ["client", "app-server", "sql-database"],
    requiredComponentIds: ["client", "app-server", "sql-database"],
    // no-direct-client-database is the chapter's namesake rule (fires on the
    // starter graph's client -> sql-database edge regardless of edge kind).
    // component-relations fires on the same edge for an independent reason:
    // BOTH endpoint contracts reject it (client's outputs.allowedCategories is
    // ["networking","compute"], sql-database's inputs.allowedCategories is
    // ["compute","caching"]), and since component-relations.ts tests
    // !outputCategoryOk first, the message the learner reads names the
    // Client's output rules, not the database's input rules. The other three
    // rules fire on graph coherence, not on any concept this chapter hasn't
    // taught, so they can't surface an idea ahead of its home chapter. None of
    // them reports the absent app-server - that comes from
    // runChapterValidation's missingRequiredComponentIds check over
    // requiredComponentIds (chapter-outcome.ts), not from a rule.
    validationRuleIds: [
      "no-direct-client-database",
      "component-relations",
      "orphan-component",
      "missing-input-connection",
      "request-flow-cycle",
    ],
    blueprints: [
      {
        id: "bb-1-6-blueprint",
        label: "Client through an app server to a database",
        require: {
          id: "bb-1-6-blueprint",
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
        id: "bb-1-6-hint-1",
        body:
          "Validate names what's on the canvas and what's missing. Of the three jobs - receive, " +
          "decide, store - which one has no component doing it yet?",
      },
      {
        id: "bb-1-6-hint-2",
        body:
          "The picker (`/` or right-click) has all three components available. The missing one " +
          "belongs between the two already present, not beside them.",
      },
      {
        id: "bb-1-6-hint-3",
        body:
          "A request-flow edge already runs straight from the client to the database. Once the " +
          "missing piece is placed, decide what happens to that edge rather than leaving it where it is.",
      },
    ],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-09).
    // 2: Opus proofread (2026-08-09) - diagram caption no longer claims
    //    request-flow "only ever" runs client -> app -> db (false as a general
    //    claim about the edge kind, and 3.4 breaks it) nor that the exercise
    //    checks "one rule" (five are curated, and the starter graph's one bad
    //    edge trips two), the Instagram example rewritten to a defensible
    //    claim (it overclaimed a single primary Postgres "serving millions of
    //    users"; by then Instagram had many app servers and sharded Postgres),
    //    "Next" given the backward connections §19 requires in beat 14 (it had
    //    none - 1.4/1.5 both carry them), and the senior line's "saturate"
    //    changed to the chapter's own "run out of headroom" (§10.3; saturation
    //    is 1.7's word). See spec §13.
    lessonVersion: 2,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.6 of 44.",
      masteredConcepts: [
        "The Reader-to-Editor loop, Validate vs. Submit, and reading a validation explanation (0.1).",
        "The five forces: latency, throughput, availability, durability, cost (0.2).",
        "Interview vs. production registers, and the eight-step Interview Loop, including step 4 (0.3-0.4).",
        "Scoping a problem with clarifying questions (1.1) and functional requirements (1.2).",
        "Non-functional requirements as numbers-shaped promises (1.3).",
        "Order-of-magnitude estimation, including this chapter's own running system's 1000:1 read:write ratio (1.4).",
        "The latency ladder and its ratios, referenced here as headroom/saturation language (1.5).",
      ],
      notYetIntroducedConcepts: [
        "Multiple app-server instances and routing traffic across them - a load balancer (3.4).",
        "Caching (3.14), read replicas and NoSQL (3.11-3.12).",
        "Formal, systematic bottleneck-finding methodology (1.7) - this chapter applies the idea informally, once.",
        "Real authentication/authorization mechanics - named as the app server's job, not implemented.",
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
      ],
    },
    // Five questions, ramp 1/1/2/2/3 (matching 0.2-1.5's convention). Q2 is
    // modeled on QUIZ_FRAMEWORK.md §6's own Q7 - the bank's published
    // example for this exact chapter and rule - reworded and re-laid-out
    // rather than copied verbatim. Position-clustering checked by eye across
    // the four single-kind questions (Q1/Q3/Q4/Q5): correct options sit at
    // b, a, c, d - four distinct positions.
    quiz: [
      {
        id: "bb-1-6-drawing-the-first-architecture-q1",
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
        id: "bb-1-6-drawing-the-first-architecture-q2",
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
        id: "bb-1-6-drawing-the-first-architecture-q3",
        kind: "single",
        difficulty: 2,
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
              "illegal connection dodge the rule by picking a different kind, which is exactly what the " +
              "rule is written to prevent.",
          },
          {
            id: "c",
            label: "It only fires if the database initiates the connection.",
            correct: false,
            explanationMd:
              "A database has no legal outgoing path to a client at all in this registry - this " +
              "distinction doesn't apply here. The rule fires on the client-to-database direction, " +
              "never the reverse.",
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
        id: "bb-1-6-drawing-the-first-architecture-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Today's design has exactly one app-server instance. It crashes. What happens?",
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
        id: "bb-1-6-drawing-the-first-architecture-q5",
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
            explanationMd:
              "Directly contradicted by what this chapter teaches: at 100x, one app-server instance " +
              "genuinely cannot serve the load.",
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
    ],
    // Deliberately broken, matching 0.1's own "two real, distinct issues"
    // pattern (§11.1 - fix exercises ship symptoms, never "find the bug"
    // blind):
    //  1. app-server (a required component) is entirely absent.
    //  2. The one edge present runs client -> sql-database directly, kind
    //     "request-flow" (the only kind a client may legally emit at all -
    //     see content/components/config/networking.ts's relations). It is
    //     illegal because of what it connects, not because of its kind -
    //     the more realistic and more instructive fault, and the reason
    //     no-direct-client-database checks endpoints unconditionally on
    //     kind (see that rule's own module comment).
    starterGraph: {
      nodes: [
        { id: "bb-1-6-client", componentId: "client", position: { x: 80, y: 140 }, config: {} },
        { id: "bb-1-6-sql-database", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
      ],
      edges: [
        { id: "bb-1-6-edge-client-db", source: "bb-1-6-client", target: "bb-1-6-sql-database", kind: "request-flow" },
      ],
      entryPointIds: ["bb-1-6-client"],
    },
  },
  {
    id: "bb-1-7-identifying-bottlenecks",
    mode: "building-blocks",
    title: "Identifying Bottlenecks",
    // Real authored curriculum content (Wave 2, Part 1, pending-content.md).
    // Spec: specs/bb-1-7-identifying-bottlenecks.spec.md. Lesson body:
    // public/content/chapters/bb-1-7-identifying-bottlenecks.md.
    // Reverts to Process (§4) - unlike 1.6, no components introduced. Same
    // no-build shape as 1.1-1.5: hasEditorExercise: false, empty component/
    // blueprint/validation-rule lists.
    problemStatement:
      "No canvas build this chapter - the palette is still 1.6's three components, and this " +
      "chapter's method doesn't need a fourth. The knowledge check shows three small designs, " +
      "each with stated component ceilings, and asks you to predict which one saturates first " +
      "before revealing the reasoning - the predict-then-check drill this chapter is built " +
      "around, run directly in the quiz rather than on canvas.",
    // Five objectives (§5.2 allows 3-7): all five required categories, same
    // Process pattern 1.1-1.5 used (no Concept-only Practical carve-out).
    // Category tags live in the spec
    // (specs/bb-1-7-identifying-bottlenecks.spec.md §2).
    learningObjectives: [
      "State the method: a system's throughput ceiling is the lowest per-component ceiling on the request path, not an average or a guess by reputation.",
      "Distinguish a component that is slow (higher per-request latency, ceiling unchanged) from one that is unscalable (at its throughput ceiling).",
      "Given two components' ceilings, identify today's bottleneck and explain why that answer can flip as the ceilings change.",
      "Answer 'what breaks first?' for a shown design in under a minute, naming the ceiling-comparison mechanism rather than a memorized answer.",
      "State, out loud, the trade-off between adding capacity before a ceiling is reached and waiting until it's real.",
    ],
    // §16: no components introduced this chapter (1.7 is in the no-component
    // list alongside 1.1-1.5 and 1.8-1.11) - the three primitives stay homed
    // at 1.6.
    availableComponentIds: [],
    requiredComponentIds: [],
    // No canvas exercise, nothing to validate - same justification 1.1-1.5
    // and 0.2-0.4 recorded.
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    // No hints - no build/Fix exercise for a hint to orient toward, same as
    // every other no-build chapter so far (0.2-0.4, 1.1-1.5).
    hints: [],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-10).
    lessonVersion: 1,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.7 of 44.",
      masteredConcepts: [
        "1.6's three-component shape (client, app server, sql database) and its own specific " +
          "answer to 'what breaks first' at today's scale - generalized here into a method that " +
          "works on any design, not just that one.",
        "1.6's app-server `instances` config field, reused directly in this chapter's diagram " +
          "questions to vary which component has the lower ceiling.",
        "1.4/1.5's numbers-comparison habit (order-of-magnitude estimation, the latency ladder) - " +
          "the raw material any real ceiling comparison is built from.",
      ],
      notYetIntroducedConcepts: [
        "Any mechanism for actually distributing traffic across more than one app-server " +
          "instance - that's 3.4's load balancer. This chapter names that more instances CAN " +
          "raise a ceiling without explaining how requests get distributed across them.",
        "Read replicas, sharding, or any named way a database's ceiling could be raised - all " +
          "later material (3.12, 3.13). This chapter treats a database's ceiling as fixed on " +
          "purpose, since no mechanism for raising it exists yet on the taught palette.",
      ],
      simplifications: [
        "Ceiling numbers in the lesson diagram and the quiz's diagram questions are round, " +
          "illustrative figures for teaching the comparison, not measurements of any real " +
          "component or system.",
        "'Ceiling' is this chapter's own instructional term for a component's maximum sustained " +
          "throughput - not an engine concept or a config field, the same status as 1.5's 'rung.'",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2-1.6's convention. Three of five are
    // diagram-kind, directly realizing CURRICULUM §14's "predict-then-check
    // on three presented graphs" exercise text - see spec §0 for why this is
    // a simulator-UI degradation (pending-content.md's own named case), not a
    // stages-UI one. Q1/Q3/Q5 share one topology (client -> app-server ->
    // sql-database) with varying `instances` config and stated ceilings, so
    // the same shape yields three different correct answers as the numbers
    // change - the chapter's own central point, tested structurally.
    quiz: [
      {
        id: "bb-1-7-identifying-bottlenecks-q1",
        kind: "diagram",
        difficulty: 1,
        prompt:
          "1.6's shape: one app-server instance (ceiling 1,000 req/s) feeding one database " +
          "(ceiling 5,000 req/s). Traffic is climbing steadily. Which component saturates first?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 140 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 220, y: 140 }, config: {} },
            { id: "d1", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
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
            label: "The app server - it has the lower of the two ceilings on this path.",
            correct: true,
            explanationMd:
              "Correct. 1,000 req/s is lower than the database's 5,000, and the system's ceiling " +
              "is always the lowest one on the path - this is 1.6's own answer, reached here by " +
              "the general method instead of a one-off fact about that chapter's numbers.",
          },
          {
            id: "b",
            label: "The database - databases are usually the first thing to run out of capacity.",
            correct: false,
            explanationMd:
              "A reputation-based guess, not a ceiling comparison. Here the database's stated " +
              "ceiling is the higher of the two, so it isn't the constraint yet.",
          },
          {
            id: "c",
            label: "Both at the same time - they're connected, so they saturate together.",
            correct: false,
            explanationMd:
              "Being connected doesn't make two ceilings equal. 1,000 and 5,000 are different " +
              "numbers, and the lower one binds first.",
          },
          {
            id: "d",
            label: "The client - it's the first component on the path.",
            correct: false,
            explanationMd:
              "Position on the path doesn't determine the bottleneck, and the client issues " +
              "requests rather than serving them - it has no throughput ceiling of its own here.",
          },
        ],
      },
      {
        id: "bb-1-7-identifying-bottlenecks-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A request path has three components, each with a different maximum sustained " +
          "throughput. Which one determines when the whole system starts failing under rising load?",
        options: [
          {
            id: "a",
            label: "Whichever one has the highest per-request latency.",
            correct: false,
            explanationMd:
              "That's a slow component, not necessarily an unscalable one - the chapter's own " +
              "central distinction. Latency and throughput ceiling are different measurements.",
          },
          {
            id: "b",
            label: "Whichever one has the lowest throughput ceiling.",
            correct: true,
            explanationMd:
              "Correct. The system's overall ceiling is the lowest per-component ceiling on the " +
              "path - not the average, not the priciest component, whichever number is smallest.",
          },
          {
            id: "c",
            label: "Whichever one is first in the request path.",
            correct: false,
            explanationMd:
              "Position on the path is unrelated to capacity - a component can sit anywhere and " +
              "still hold the lowest ceiling.",
          },
          {
            id: "d",
            label: "Whichever one is the most expensive to run.",
            correct: false,
            explanationMd: "Cost and throughput capacity are independent - neither implies the other.",
          },
        ],
      },
      {
        id: "bb-1-7-identifying-bottlenecks-q3",
        kind: "diagram",
        difficulty: 2,
        prompt:
          "Same shape, new numbers: the app server is now configured with 5 instances (aggregate " +
          "ceiling 5,000 req/s). This database's ceiling is 3,000 req/s - heavier queries than " +
          "before. Which component saturates first now?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 140 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 220, y: 140 }, config: { instances: 5 } },
            { id: "d1", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
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
            label: "The app server again - it was the bottleneck last time, so it still is.",
            correct: false,
            explanationMd:
              "The plausible-looking pattern-match, and wrong here: the numbers changed. 5,000 is " +
              "now higher than the database's 3,000, so the app server is no longer the constraint.",
          },
          {
            id: "b",
            label: "The database - its 3,000 req/s ceiling is now the lower of the two.",
            correct: true,
            explanationMd:
              "Correct. Same topology as Q1, opposite answer, because the numbers changed - the " +
              "bottleneck is a comparison between today's ceilings, not a fixed property of a " +
              "component.",
          },
          {
            id: "c",
            label: "Both at once - they're within 2,000 of each other, close enough to count as tied.",
            correct: false,
            explanationMd: "3,000 and 5,000 are different numbers; the lower one binds first regardless of the gap size.",
          },
          {
            id: "d",
            label: "Neither - the client is the bottleneck in this version.",
            correct: false,
            explanationMd: "The client still has no throughput ceiling of its own in this shape - nothing about that changed.",
          },
        ],
      },
      {
        id: "bb-1-7-identifying-bottlenecks-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "A database's query latency has been climbing as its largest table grows - queries that " +
          "used to return in 5ms now take 40ms - but its measured requests-per-second ceiling " +
          "under load testing hasn't moved. Is the database now the system's bottleneck?",
        options: [
          {
            id: "a",
            label:
              "Not necessarily - this is a slow problem (higher per-request latency), not evidence " +
              "the database is at its throughput ceiling. The two are different failures with " +
              "different fixes.",
            correct: true,
            explanationMd:
              "Correct. Slow and unscalable are not the same failure - fixing a slow query often " +
              "means an index or rewrite; fixing an unscalable one means adding capacity somewhere " +
              "on the path. Nothing here shows the ceiling itself has moved.",
          },
          {
            id: "b",
            label: "Yes - any slowdown means it's now the bottleneck.",
            correct: false,
            explanationMd:
              "This conflates the chapter's own central distinction. Higher latency alone doesn't " +
              "show the throughput ceiling has been reached.",
          },
          {
            id: "c",
            label: "It doesn't matter, since the queries still return successfully.",
            correct: false,
            explanationMd:
              "A real problem exists here (worth fixing), it's just the wrong category of problem - " +
              "dismissing it isn't the correction either.",
          },
          {
            id: "d",
            label: "The app server must now be the bottleneck instead.",
            correct: false,
            explanationMd: "Nothing in the scenario says anything about the app server's ceiling - this is an unsupported leap.",
          },
        ],
      },
      {
        id: "bb-1-7-identifying-bottlenecks-q5",
        kind: "diagram",
        difficulty: 3,
        prompt:
          "Same shape, app server now at 10 instances (aggregate ceiling far above the database's " +
          "3,000 req/s). Traffic keeps climbing toward the database's ceiling. What happens to the " +
          "system's overall throughput ceiling if the app server adds 10 more instances on top of that?",
        graph: {
          nodes: [
            { id: "c1", componentId: "client", position: { x: 40, y: 140 }, config: {} },
            { id: "a1", componentId: "app-server", position: { x: 220, y: 140 }, config: { instances: 10 } },
            { id: "d1", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
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
            label: "Nothing changes for the system's ceiling - the database is already the binding constraint.",
            correct: true,
            explanationMd:
              "Correct. Once the database's fixed ceiling is the lower of the two, more app-server " +
              "capacity doesn't raise the system's overall ceiling - it moves further from being the " +
              "constraint, not toward it.",
          },
          {
            id: "b",
            label: "The system ceiling rises proportionally with the new app-server capacity.",
            correct: false,
            explanationMd:
              "This is only true while the app server is the lower ceiling. Once the database binds, " +
              "adding app-server capacity stops moving the system's overall number.",
          },
          {
            id: "c",
            label: "The database's own ceiling rises too, since more app-server capacity is feeding it.",
            correct: false,
            explanationMd: "No mechanism supports this - nothing about the database itself changed.",
          },
          {
            id: "d",
            label: "The app server becomes the bottleneck again.",
            correct: false,
            explanationMd:
              "Backwards - adding even more app-server capacity moves it further from being the " +
              "constraint, not back toward it.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-8-engineering-trade-offs",
    mode: "building-blocks",
    title: "Engineering Trade-offs",
    // Real authored curriculum content (Wave 2, Part 1, pending-content.md).
    // Spec: specs/bb-1-8-engineering-trade-offs.spec.md. Lesson body:
    // public/content/chapters/bb-1-8-engineering-trade-offs.md.
    // Process type, same no-build shape as 1.1-1.7: hasEditorExercise: false,
    // empty component/blueprint/validation-rule lists. §16 places 1.8 in the
    // no-component list alongside 1.1-1.5 and 1.7/1.9-1.11.
    problemStatement:
      "No canvas build this chapter - the palette is still 1.6's three components, and naming " +
      "a cost doesn't need a fourth. The knowledge check presents three trade-off scenarios and " +
      "asks you to pick the statement that names both what's bought and what's spent, not just " +
      "the benefit - the trade-off drill this chapter is built around, run directly in the quiz.",
    // Five objectives (§5.2 allows 3-7): all five required categories,
    // including a real Practical objective per 1.1/1.2/1.4/1.5's precedent
    // (Process chapters do not get the Concept-only Practical carve-out).
    // Category tags live in the spec
    // (specs/bb-1-8-engineering-trade-offs.spec.md §2).
    learningObjectives: [
      "State the reflex format 'we chose X, accepting Y, because Z' and name the five dimensions a design decision can spend: latency, consistency, complexity, money, operability.",
      "Given a design decision, walk the five dimensions and name which ones it actually spends, not just the benefit it buys.",
      "Answer 'what did that cost you?' for a proposed fix in one sentence, naming the specific dimension spent, inside the interview's trade-offs step (0.4 step 7).",
      "Given three trade-off scenarios, choose the statement that names both what's bought and what's spent, and reject options claiming a cost-free choice or naming the wrong dimension.",
      "State a decision already made in this chapter out loud in the 'we chose X, accepting Y, because Z' format, naming a real cost on both sides.",
    ],
    // §16: no components introduced this chapter (1.8 is in the
    // no-component list alongside 1.1-1.5, 1.7, 1.9-1.11) - the three
    // primitives stay homed at 1.6.
    availableComponentIds: [],
    requiredComponentIds: [],
    // No canvas exercise, nothing to validate - same justification 1.1-1.7
    // and 0.2-0.4 recorded.
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    // No hints - no build/Fix exercise for a hint to orient toward, same as
    // every other no-build chapter so far (0.2-0.4, 1.1-1.7).
    hints: [],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-10).
    lessonVersion: 1,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.8 of 44.",
      masteredConcepts: [
        "1.7's bottleneck-and-ceiling vocabulary and its own 'add more app-server instances' fix, " +
          "reused directly as this chapter's worked decision.",
        "1.6's three-component shape and its `instances` config field, reused in the diagram and " +
          "the 'bigger machine' comparison.",
        "0.2's five forces (specifically cost), which this chapter refines into five sharper " +
          "decision-spending dimensions.",
      ],
      notYetIntroducedConcepts: [
        "Any mechanism for routing traffic across multiple app-server instances (3.4's load " +
          "balancer) - named as a real cost of the 'add instances' branch without explaining how " +
          "it would work.",
        "The formal consistency model (strong vs. eventual, quorums, CAP) - 3.22's territory. " +
          "'Consistency' here is a working, informal name for one of the five dimensions, not the " +
          "deep model.",
        "Replication, sharding, or any other named mechanism that raises a database's ceiling " +
          "(3.12, 3.13) - not referenced in this chapter's examples.",
      ],
      simplifications: [
        "The five cost dimensions (latency, consistency, complexity, money, operability) are a " +
          "practical working set for stating trade-offs at this stage, not an exhaustive or " +
          "formally-defined taxonomy - same status as 0.2's five forces.",
        "'Consistency' is used here as plain language ('does everyone asking right now get the " +
          "same answer') rather than any of the formal models 3.22 teaches.",
        "The quiz's synchronous/asynchronous write-path example is a generic illustration, not " +
          "tied to any specific mechanism this curriculum has introduced yet (replication is " +
          "3.12; queues are 3.17).",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2-1.7's convention. Q2/Q4/Q5 realize
    // CURRICULUM §14's "trade-off scenarios x3" exercise text directly - see
    // spec §10 for why this needed no simulator/stages-UI degradation note
    // (single/multi quiz kinds already cover this exercise shape natively).
    quiz: [
      {
        id: "bb-1-8-engineering-trade-offs-q1",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these is a COMPLETE trade-off statement, not just a benefit claim?",
        options: [
          {
            id: "a",
            label: "\"We added a cache - it's much faster now.\"",
            correct: false,
            explanationMd:
              "Names a benefit only. Nothing here says what the cache costs - this is exactly the " +
              "gap the cold open opens with.",
          },
          {
            id: "b",
            label: "\"We chose the simpler design because simpler is always better.\"",
            correct: false,
            explanationMd:
              "\"Always better\" isn't a stated cost, it's an unexamined rule. No specific decision, " +
              "no specific price.",
          },
          {
            id: "c",
            label:
              "\"We added more app-server instances, accepting a bigger bill and more moving " +
              "parts to run, because the app server had the lower ceiling.\"",
            correct: true,
            explanationMd:
              "Correct. X (more instances), Y (bigger bill, more moving parts), and Z (the lower " +
              "ceiling, from 1.7) are all present - the reflex this chapter trains.",
          },
          {
            id: "d",
            label: "\"We're not sure yet - it depends.\"",
            correct: false,
            explanationMd:
              "Bare \"it depends\" with no named variable and no commitment isn't a trade-off " +
              "statement, it's a non-answer (0.3's own \"it depends\" fix applies here too).",
          },
        ],
      },
      {
        id: "bb-1-8-engineering-trade-offs-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "You're deciding between two fixes for the app-server bottleneck: add three more " +
          "instances, or move to one much larger machine. Which statement correctly names a real " +
          "trade-off for the 'more instances' choice?",
        options: [
          {
            id: "a",
            label:
              "More instances buys near-linear headroom, but spends more money and adds " +
              "operational surface - more things deployed and monitored.",
            correct: true,
            explanationMd:
              "Correct. This is exactly the cost this chapter walks through: money and " +
              "operability, not latency or consistency.",
          },
          {
            id: "b",
            label: "More instances is strictly better since it fixes the bottleneck with no downside.",
            correct: false,
            explanationMd:
              "The \"free lunch\" claim this chapter warns against - every real branch spends " +
              "something.",
          },
          {
            id: "c",
            label: "More instances mainly costs latency, since requests take longer to route.",
            correct: false,
            explanationMd:
              "Nothing about adding stateless instances slows down a single request's path - " +
              "latency is the wrong dimension here.",
          },
          {
            id: "d",
            label: "More instances costs nothing until the database also needs to scale.",
            correct: false,
            explanationMd:
              "The money and complexity costs happen immediately, not on some future trigger - " +
              "this dismisses a cost already being paid.",
          },
        ],
      },
      {
        id: "bb-1-8-engineering-trade-offs-q3",
        kind: "multi",
        difficulty: 2,
        prompt:
          "A team switches a write path from synchronous confirmation (every write waits for the " +
          "follow-on step to finish before returning success) to asynchronous (return success " +
          "immediately, finish the follow-on work in the background). Select ALL dimensions this " +
          "change plausibly spends.",
        options: [
          {
            id: "a",
            label: "Consistency",
            correct: true,
            explanationMd:
              "Correct. A reader checking immediately after the write might see the old state, " +
              "since the background work hasn't finished yet.",
          },
          {
            id: "b",
            label: "Complexity",
            correct: true,
            explanationMd:
              "Correct. Now there's background work to track and something to do if it fails " +
              "later, after the caller has already moved on.",
          },
          {
            id: "c",
            label: "Latency",
            correct: false,
            explanationMd:
              "Wrong direction: this change makes the write path faster, not slower. Latency is " +
              "what's bought here, not spent.",
          },
          {
            id: "d",
            label: "Money",
            correct: false,
            explanationMd:
              "Nothing about moving work to the background adds or removes infrastructure spend " +
              "on its own.",
          },
        ],
      },
      {
        id: "bb-1-8-engineering-trade-offs-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "The bigger-machine option for the app-server bottleneck keeps everything on one " +
          "instance. Which statement correctly names what it spends?",
        options: [
          {
            id: "a",
            label: "Nothing - a single bigger machine avoids every cost the instances option has.",
            correct: false,
            explanationMd:
              "The free-lunch claim again. A bigger machine still costs money at a worse rate and " +
              "still has a ceiling.",
          },
          {
            id: "b",
            label: "It spends consistency, since one machine can drift out of sync with itself.",
            correct: false,
            explanationMd:
              "A single instance has nothing to drift from - consistency is about multiple readers " +
              "or copies disagreeing, not one machine alone.",
          },
          {
            id: "c",
            label: "It spends operability, since one machine is harder to monitor than many.",
            correct: false,
            explanationMd:
              "Backwards: one thing to watch is less operational surface than several, per this " +
              "chapter's own text.",
          },
          {
            id: "d",
            label:
              "It spends money at a worse rate than smaller instances, and it still has a " +
              "ceiling of its own - just a higher one.",
            correct: true,
            explanationMd:
              "Correct. Bigger machines cost more than proportionally more, and 1.7's whole point " +
              "was that every component has a ceiling, including a large single one.",
          },
        ],
      },
      {
        id: "bb-1-8-engineering-trade-offs-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "Two teams face the same app-server bottleneck. Team A expects slow, steady growth for " +
          "the next year. Team B doesn't know if traffic will double next month or stay flat. " +
          "Which pairing best matches each team to a defensible choice, with the reasoning?",
        options: [
          {
            id: "a",
            label: "Both teams should choose instances - it's the objectively better option regardless of growth pattern.",
            correct: false,
            explanationMd:
              "There is no universal winner here - that's what makes this a genuine trade-off " +
              "rather than a settled question.",
          },
          {
            id: "b",
            label:
              "Team A leans toward the bigger machine (predictable growth makes today's " +
              "simplicity worth a ceiling that's further off); Team B leans toward instances " +
              "(uncertain growth makes it cheaper to be wrong in small increments than to hit a " +
              "hard wall on one machine).",
            correct: true,
            explanationMd:
              "Correct. Predictability favors paying for simplicity now; uncertainty favors the " +
              "option that fails smaller and more often instead of all at once.",
          },
          {
            id: "c",
            label: "Both teams should choose the bigger machine - simplicity is always worth it until a real bottleneck appears.",
            correct: false,
            explanationMd:
              "Same error as always-instances, opposite direction - simplicity is a real benefit, " +
              "not an automatic win over every alternative.",
          },
          {
            id: "d",
            label:
              "Team A leans toward instances (steady growth means frequent small additions); " +
              "Team B leans toward the bigger machine (uncertainty means avoiding operational " +
              "complexity).",
            correct: false,
            explanationMd:
              "The pairing is inverted: steady, predictable growth is exactly when paying for " +
              "simplicity up front pays off, and uncertainty is when a hard-to-resize single " +
              "machine is the riskier bet.",
          },
        ],
      },
    ],
  },
  {
    id: "bb-1-9-deep-dive-methodology",
    mode: "building-blocks",
    title: "Deep Dive Methodology",
    // Real authored curriculum content (Wave 2, Part 1, pending-content.md).
    // Spec: specs/bb-1-9-deep-dive-methodology.spec.md. Lesson body:
    // public/content/chapters/bb-1-9-deep-dive-methodology.md.
    // Process type, same no-build shape as 1.1-1.8: hasEditorExercise: false,
    // empty component/blueprint/validation-rule lists. §16 places 1.9 in the
    // no-component list alongside 1.1-1.5, 1.7-1.8, 1.10-1.11.
    problemStatement:
      "No canvas build this chapter - the palette is still 1.6's three components, and picking " +
      "a deep-dive target doesn't need a fourth. The knowledge check shows a design with its " +
      "stated requirements and asks you to pick the right deep-dive target from four candidates, " +
      "reading why each of the others misses - the exercise this chapter is built around, run " +
      "directly in the quiz.",
    // Five objectives (§5.2 allows 3-7): all five required categories,
    // including a real Practical objective per 1.1/1.2/1.4/1.5/1.8's
    // precedent (Process chapters do not get the Concept-only Practical
    // carve-out). Category tags live in the spec
    // (specs/bb-1-9-deep-dive-methodology.spec.md §2).
    learningObjectives: [
      "State the two-question method for picking a deep-dive target: which requirement is closest to its limit right now, and which component on the path (1.7's ceiling method) is where that pressure actually lands.",
      "Given a design and its requirements, name the correct deep-dive target and reject one chosen for familiarity, novelty, or 'cover everything a little.'",
      "Narrate a deep dive that states the target and reason before diving, goes one level down, and explicitly resurfaces to the whole design, inside interview loop step 5 (0.4).",
      "Given four candidate deep-dive targets for a shown design and its requirements, choose the one the evidence supports and reject options optimizing for familiarity, appearing impressive, or shallow coverage of everything.",
      "When two requirements are both under real pressure, name both out loud and commit to which one gets the deep dive now, rather than splitting attention shallowly across both.",
    ],
    // §16: no components introduced this chapter (1.9 is in the
    // no-component list alongside 1.1-1.5, 1.7-1.8, 1.10-1.11) - the three
    // primitives stay homed at 1.6.
    availableComponentIds: [],
    requiredComponentIds: [],
    // No canvas exercise, nothing to validate - same justification 1.1-1.8
    // and 0.2-0.4 recorded.
    validationRuleIds: [],
    blueprints: [],
    hasEditorExercise: false,
    // No hints - no build/Fix exercise for a hint to orient toward, same as
    // every other no-build chapter so far (0.2-0.4, 1.1-1.8).
    hints: [],
    readingLinks: [],
    // 1: Sonnet draft (2026-08-10).
    lessonVersion: 1,
    curriculumContext: {
      position: "Building Blocks, Part 1: Engineering Design Process - Chapter 1.9 of 44.",
      masteredConcepts: [
        "1.3's non-functional requirements (the numbers-shaped promises attached to 0.2's five " +
          "forces) - reused directly as the input to 'which requirement is closest to its limit.'",
        "1.7's ceiling method (the lowest per-component ceiling on the path) - reused to confirm " +
          "where a stressed requirement's pressure actually lands in the current design.",
        "1.8's trade-off reflex and 0.3's 'name the variable and commit' pattern - reused for the " +
          "one-dive-or-two decision when two requirements compete for the same time.",
        "1.5's cross-continent round-trip figure - reused as the floor that makes a latency " +
          "requirement point at 'wherever the request spends its time' rather than one named " +
          "component.",
        "1.6's three-component shape - the design every quiz scenario presents.",
      ],
      notYetIntroducedConcepts: [
        "Any mechanism that actually relieves a stressed read or write path - read replicas " +
          "(3.12), caches (3.14), sharding (3.13), or safer write/durability machinery (3.20, " +
          "3.26). This chapter finds where the pressure is; it never proposes how to relieve it.",
        "Load balancing or any routing across multiple app-server instances (3.4) - not " +
          "referenced.",
        "Geographic distribution machinery (CDNs, regions - 3.15) - the latency example names the " +
          "distance problem without naming a fix.",
      ],
      simplifications: [
        "'One level down' stays at the depth 1.6-1.8 already established (what happens " +
          "conceptually when a read or write is handled) - it does not introduce real " +
          "replication, durability, or storage mechanisms, all later material.",
        "The 'two requirements under pressure at once' scenario (quiz Q5) is a designed teaching " +
          "device for the one-dive-or-two decision, not a claim that real designs typically have " +
          "exactly two competing pressures.",
      ],
    },
    // Ramp 1/1/2/2/3, matching 0.2-1.8's convention. Q2 and Q4 directly
    // realize CURRICULUM §14's "given a design + requirements, pick the
    // right deep-dive target from four; explanation per option" exercise
    // text - see spec §10 for why this needed no simulator/stages-UI
    // degradation note (a single-choice quiz question already covers this
    // exercise shape natively, same as 1.8's own trade-off scenarios).
    quiz: [
      {
        id: "bb-1-9-deep-dive-methodology-q1",
        kind: "single",
        difficulty: 1,
        prompt: "Which of these is the correct method for picking a deep-dive target?",
        options: [
          {
            id: "a",
            label: "Pick the component you can explain in the most detail.",
            correct: false,
            explanationMd:
              "The cold open's own failure: familiarity with a component says nothing about " +
              "whether it's under pressure.",
          },
          {
            id: "b",
            label: "Pick whichever component sounds most advanced or interesting to discuss.",
            correct: false,
            explanationMd:
              "Sounding impressive isn't evidence of pressure - this is the 'flashiest piece' " +
              "mistake the chapter warns against.",
          },
          {
            id: "c",
            label:
              "Pick the component where the requirement closest to breaking actually lands, " +
              "confirmed with the ceiling method.",
            correct: true,
            explanationMd:
              "Correct. Two questions, not a guess: which requirement is closest to its limit " +
              "(1.3), and which component is where that pressure lands (1.7's ceiling method).",
          },
          {
            id: "d",
            label: "Give every component in the design equal time.",
            correct: false,
            explanationMd:
              "This is 'deep-diving everything' - a shallow pass over every subsystem instead of " +
              "real depth on the one or two that matter.",
          },
        ],
      },
      {
        id: "bb-1-9-deep-dive-methodology-q2",
        kind: "single",
        difficulty: 1,
        prompt:
          "A URL shortener (1.6's shape: client, app server, sql database) has one requirement " +
          "under real pressure: reads outnumber writes 1,000 to 1, and read latency must stay low " +
          "as traffic grows. Which is the strongest deep-dive target?",
        options: [
          {
            id: "a",
            label: "The read path - how the database serves repeated reads as load rises.",
            correct: true,
            explanationMd:
              "Correct. The stated requirement is entirely about reads at rising volume - that's " +
              "exactly where the pressure lands.",
          },
          {
            id: "b",
            label: "The write path - how new short links get created.",
            correct: false,
            explanationMd:
              "Nothing in the stated requirement mentions write volume or write correctness - " +
              "this targets a dimension that isn't under pressure here.",
          },
          {
            id: "c",
            label: "The client's rendering code.",
            correct: false,
            explanationMd:
              "The client isn't part of this design's throughput or latency ceiling - it issues " +
              "requests, it doesn't serve them.",
          },
          {
            id: "d",
            label: "A little of everything, so nothing is missed.",
            correct: false,
            explanationMd:
              "Deep-diving everything reads as a shallow pass, not depth - and the requirement " +
              "already points at one specific place.",
          },
        ],
      },
      {
        id: "bb-1-9-deep-dive-methodology-q3",
        kind: "multi",
        difficulty: 2,
        prompt:
          "Which of these describe going 'one level down without losing the room'? Select ALL " +
          "that apply.",
        options: [
          {
            id: "a",
            label: "State the target and the reason for it before describing any internal detail.",
            correct: true,
            explanationMd:
              "Correct. Naming the plan out loud before diving is what lets the interviewer " +
              "follow why this detail matters.",
          },
          {
            id: "b",
            label: "After the detail, reconnect it to the rest of the design in one sentence.",
            correct: true,
            explanationMd:
              "Correct. This is the deliberate resurface - without it, the interviewer stops " +
              "tracking why the dive mattered.",
          },
          {
            id: "c",
            label: "Once you start, keep going until the interviewer stops you - stopping early looks unprepared.",
            correct: false,
            explanationMd:
              "This is exactly how a candidate loses the room: talking past the point where the " +
              "detail is still serving the conversation.",
          },
          {
            id: "d",
            label: "Skip mentioning the rest of the design again - the interviewer already remembers it.",
            correct: false,
            explanationMd:
              "Assuming the interviewer is still tracking the whole design without a resurface is " +
              "the failure mode this technique exists to prevent.",
          },
        ],
      },
      {
        id: "bb-1-9-deep-dive-methodology-q4",
        kind: "single",
        difficulty: 2,
        prompt:
          "Same shape, a different requirement this time: no write may be lost, even if the app " +
          "server restarts mid-request. Which deep-dive target does the requirement point to?",
        options: [
          {
            id: "a",
            label: "The read path.",
            correct: false,
            explanationMd:
              "The stated requirement is about writes surviving a crash - reads aren't mentioned " +
              "and aren't under pressure here.",
          },
          {
            id: "b",
            label: "The write path - specifically how the database confirms a write actually finished.",
            correct: true,
            explanationMd:
              "Correct. Durability of writes is the stated pressure; the write path is where it " +
              "lands.",
          },
          {
            id: "c",
            label: "Add a cache in front of the database.",
            correct: false,
            explanationMd:
              "Wrong dimension - a cache addresses latency and repeated reads, not durability, " +
              "and no such mechanism is on this chapter's taught palette yet.",
          },
          {
            id: "d",
            label: "The client, since it's what the user directly interacts with.",
            correct: false,
            explanationMd:
              "Direct user interaction isn't the same as being under pressure - the client has no " +
              "durability behavior of its own here.",
          },
        ],
      },
      {
        id: "bb-1-9-deep-dive-methodology-q5",
        kind: "single",
        difficulty: 3,
        prompt:
          "A design review surfaces two requirements under real pressure at once: a 10x read " +
          "spike is coming, and no write may be lost. There's time for one real deep dive today. " +
          "What's the strongest move?",
        options: [
          {
            id: "a",
            label: "Split the remaining time evenly between both, going one level down on neither.",
            correct: false,
            explanationMd:
              "Two shallow dives read as two things half-understood - this is the 'one dive or " +
              "two' mistake the chapter warns against.",
          },
          {
            id: "b",
            label: "Pick whichever one is more technically impressive to discuss.",
            correct: false,
            explanationMd:
              "Impressiveness isn't evidence of pressure - both requirements need to be judged on " +
              "how close each actually is to breaking.",
          },
          {
            id: "c",
            label: "Refuse to choose, and mention both throughout without going deep on either.",
            correct: false,
            explanationMd:
              "A restatement of 0.3's own 'it depends' non-answer - naming both without " +
              "committing to one isn't a plan.",
          },
          {
            id: "d",
            label:
              "Name both pressures out loud, pick the one closer to breaking today for the real " +
              "dive, and state explicitly that the other is next if time allows.",
            correct: true,
            explanationMd:
              "Correct. This names the variable and commits (0.3's pattern), while keeping the " +
              "second pressure visible instead of silently dropped.",
          },
        ],
      },
    ],
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
      "to decide what's missing. Add a second App Server to the canvas - a second box, not a higher " +
      "Instances count on the one already there - wire it the same way the first one is wired, get " +
      "a clean Validate, then Submit.",
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
        "Building Blocks, Group A: Core Infrastructure - Chapter 3.4 of 44 (pulled forward per " +
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
        { id: "bb-3-4-client", componentId: "client", position: { x: 80, y: 160 }, config: {} },
        { id: "bb-3-4-lb", componentId: "load-balancer", position: { x: 280, y: 160 }, config: {} },
        { id: "bb-3-4-app1", componentId: "app-server", position: { x: 480, y: 160 }, config: {} },
        { id: "bb-3-4-db", componentId: "sql-database", position: { x: 680, y: 160 }, config: {} },
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
