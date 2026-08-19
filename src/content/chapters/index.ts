import type { ChapterDefinition } from "./types";

/**
 * The authored chapter registry. Mixed state during Wave 1 content authoring
 * (.claude/docs/pending-content.md):
 *
 * - Part 0 (`bb-0-1-welcome` through
 *   `bb-0-4-the-system-design-lifecycle`), Part 1
 *   (`bb-1-1-framing-the-problem` through `bb-1-4-driving-the-interview`)
 *   and `bb-2-1-from-browser-to-backend` are real curriculum content,
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
      "The starter design on the canvas skips the app server: the client is wired straight to " +
      "the database. No tour walks you through this one. Run Validate, read what it reports, and " +
      "use that to decide what to add and what to rewire. Add the missing component, route both " +
      "edges through it, get a clean Validate, then Submit. The lesson also covers finding a " +
      "system's bottleneck (loop step 6) and picking a deep-dive target (loop step 5), both " +
      "exercised by the knowledge check rather than a second build.",
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
        { id: "bb-1-2-client", componentId: "client", position: { x: 80, y: 140 }, config: {} },
        { id: "bb-1-2-sql-database", componentId: "sql-database", position: { x: 400, y: 140 }, config: {} },
      ],
      edges: [
        { id: "bb-1-2-edge-client-db", source: "bb-1-2-client", target: "bb-1-2-sql-database", kind: "request-flow" },
      ],
      entryPointIds: ["bb-1-2-client"],
    },
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
