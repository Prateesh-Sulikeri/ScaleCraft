import type { Course, CourseId } from "./types";

/**
 * The curriculum map — transcribed exactly from .claude/docs/CURRICULUM.md
 * §13 (final map) and §10 (prerequisite graph). Do not reorder, renumber, or
 * retitle: these slugs are both route segments and Dexie persistence keys
 * (see src/persistence/db.ts's CurriculumProgress), so a rename after
 * release orphans progress rows and breaks bookmarks.
 *
 * Only two entries have a real `chapterDefinitionId` in 3.0.0 — every other
 * entry is a real curriculum row with no authored lesson behind it yet
 * (src/content/chapters/index.ts's chapterRegistry stays throwaway/dummy
 * content until 3.1.0). `prerequisiteSlugs` is populated from §10's
 * unit/project-level graph (chapters within a unit are strictly sequential)
 * but nothing reads it yet — see .claude/docs/RELEASE_3.0.0_LEARNING_PATH.md
 * §6, "Locked chapters".
 */
export const courses: Record<CourseId, Course> = {
  "building-blocks": {
    id: "building-blocks",
    title: "Building Blocks",
    subtitle:
      "One concept at a time, with a constrained palette and validation that explains itself.",
    sections: [
      {
        id: "bb-unit-0",
        label: "Unit 0",
        title: "How the Web Serves a Request",
        summary:
          "Nothing else in the curriculum is intelligible without the request/response " +
          "mental model and the reason application servers sit between clients and data.",
        chapters: [
          {
            slug: "0-1-client-server-database",
            number: "0.1",
            title: "Client, Server, Database",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "foundational",
            prerequisiteSlugs: [],
          },
          {
            slug: "0-2-naming-dns-and-the-browser",
            number: "0.2",
            title: "Naming: DNS and the Browser",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "foundational",
            prerequisiteSlugs: ["0-1-client-server-database"],
          },
          {
            slug: "0-3-the-edge-firewall-and-reverse-proxy",
            number: "0.3",
            title: "The Edge: Firewall and Reverse Proxy",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "foundational",
            prerequisiteSlugs: ["0-2-naming-dns-and-the-browser"],
          },
        ],
      },
      {
        id: "bb-unit-1",
        label: "Unit 1",
        title: "Scaling Compute",
        summary:
          "The first scaling pressure a growing system hits is compute saturation — and " +
          "it's the gentlest story, because stateless compute scales trivially.",
        chapters: [
          {
            slug: "1-1-vertical-vs-horizontal-scaling",
            number: "1.1",
            title: "Vertical vs. Horizontal Scaling",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "foundational",
            prerequisiteSlugs: ["0-3-the-edge-firewall-and-reverse-proxy"],
          },
          {
            slug: "1-2-load-balancing",
            number: "1.2",
            title: "Load Balancing",
            kind: "chapter",
            chapterDefinitionId: "bb-dummy-1",
            estimatedMinutes: 35,
            difficulty: "foundational",
            prerequisiteSlugs: ["1-1-vertical-vs-horizontal-scaling"],
          },
          {
            slug: "1-3-statelessness-and-sessions",
            number: "1.3",
            title: "Statelessness and Sessions",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "foundational",
            prerequisiteSlugs: ["1-2-load-balancing"],
          },
          {
            slug: "1-4-reverse-proxy-vs-load-balancer-vs-api-gateway",
            number: "1.4",
            title: "Reverse Proxy vs. Load Balancer vs. API Gateway",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "foundational",
            prerequisiteSlugs: ["1-3-statelessness-and-sessions"],
          },
        ],
      },
      {
        id: "bb-unit-2",
        label: "Unit 2",
        title: "Caching",
        summary:
          "Caching is the highest-leverage, lowest-machinery scaling tool — the natural " +
          "next step once compute scales but the database becomes the bottleneck.",
        chapters: [
          {
            slug: "2-1-cache-aside",
            number: "2.1",
            title: "Cache-Aside",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 35,
            difficulty: "foundational",
            prerequisiteSlugs: ["1-4-reverse-proxy-vs-load-balancer-vs-api-gateway"],
          },
          {
            slug: "2-2-distributed-caching",
            number: "2.2",
            title: "Distributed Caching",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "foundational",
            prerequisiteSlugs: ["2-1-cache-aside"],
          },
          {
            slug: "2-3-caching-at-the-edge-cdn",
            number: "2.3",
            title: "Caching at the Edge: CDN",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "foundational",
            prerequisiteSlugs: ["2-2-distributed-caching"],
          },
          {
            slug: "checkpoint-r1-a-site-that-stays-up",
            number: null,
            title: "Checkpoint · A Site That Stays Up",
            kind: "checkpoint",
            chapterDefinitionId: null,
            estimatedMinutes: 45,
            difficulty: "foundational",
            prerequisiteSlugs: ["2-3-caching-at-the-edge-cdn"],
          },
        ],
      },
      {
        id: "bb-unit-3",
        label: "Unit 3",
        title: "Scaling Data",
        summary:
          "The database has been the untouched bottleneck since Unit 1 by design — data " +
          "is where scaling gets genuinely hard, so it comes after every easier tool.",
        chapters: [
          {
            slug: "3-1-read-replicas-and-replication",
            number: "3.1",
            title: "Read Replicas and Replication",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "intermediate",
            prerequisiteSlugs: ["checkpoint-r1-a-site-that-stays-up"],
          },
          {
            slug: "3-2-choosing-a-database-sql-vs-nosql",
            number: "3.2",
            title: "Choosing a Database: SQL vs. NoSQL",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "intermediate",
            prerequisiteSlugs: ["3-1-read-replicas-and-replication"],
          },
          {
            slug: "3-3-blobs-object-storage",
            number: "3.3",
            title: "Blobs: Object Storage",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "intermediate",
            prerequisiteSlugs: ["3-2-choosing-a-database-sql-vs-nosql"],
          },
          {
            slug: "3-4-search-the-search-engine",
            number: "3.4",
            title: "Search: the Search Engine",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "intermediate",
            prerequisiteSlugs: ["3-3-blobs-object-storage"],
          },
          {
            slug: "3-5-partitioning-and-sharding",
            number: "3.5",
            title: "Partitioning and Sharding",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "intermediate",
            prerequisiteSlugs: ["3-4-search-the-search-engine"],
          },
        ],
      },
      {
        id: "bb-unit-4",
        label: "Unit 4",
        title: "Asynchronous Work",
        summary:
          "Everything so far has been synchronous request/response — the second half " +
          "of real systems is work that happens later.",
        chapters: [
          {
            slug: "4-1-queues-and-workers",
            number: "4.1",
            title: "Queues and Workers",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "intermediate",
            // §10: Unit 4 may be taken before Unit 3 (the one sanctioned
            // branch) — both hang off Checkpoint R1, not off Unit 3.
            prerequisiteSlugs: ["checkpoint-r1-a-site-that-stays-up"],
          },
          {
            slug: "4-2-when-work-fails-dead-letter-queues",
            number: "4.2",
            title: "When Work Fails: Dead Letter Queues",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 20,
            difficulty: "intermediate",
            prerequisiteSlugs: ["4-1-queues-and-workers"],
          },
          {
            slug: "4-3-scheduled-and-ephemeral-compute",
            number: "4.3",
            title: "Scheduled and Ephemeral Compute",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "intermediate",
            prerequisiteSlugs: ["4-2-when-work-fails-dead-letter-queues"],
          },
          {
            slug: "4-4-streams-and-events-event-bus-and-kafka",
            number: "4.4",
            title: "Streams and Events: Event Bus and Kafka",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 35,
            difficulty: "intermediate",
            prerequisiteSlugs: ["4-3-scheduled-and-ephemeral-compute"],
          },
          {
            slug: "checkpoint-r2-the-whole-backend",
            number: null,
            title: "Checkpoint · The Whole Backend",
            kind: "checkpoint",
            chapterDefinitionId: null,
            estimatedMinutes: 60,
            difficulty: "intermediate",
            // §10: both Unit 3 and Unit 4 feed Checkpoint R2.
            prerequisiteSlugs: [
              "3-5-partitioning-and-sharding",
              "4-4-streams-and-events-event-bus-and-kafka",
            ],
          },
        ],
      },
      {
        id: "bb-unit-5",
        label: "Unit 5",
        title: "Distributed Coordination",
        summary:
          "Coordination is the hardest material — it's about agreement, not plumbing — " +
          "and needs every prior mental model to make sense.",
        chapters: [
          {
            slug: "5-1-leaders-and-followers",
            number: "5.1",
            title: "Leaders and Followers",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 30,
            difficulty: "advanced",
            prerequisiteSlugs: ["checkpoint-r2-the-whole-backend"],
          },
          {
            slug: "5-2-agreement-coordinators-and-locks",
            number: "5.2",
            title: "Agreement: Coordinators and Locks",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 35,
            difficulty: "advanced",
            prerequisiteSlugs: ["5-1-leaders-and-followers"],
          },
          {
            slug: "5-3-trade-offs-at-the-core-consistency-and-availability",
            number: "5.3",
            title: "Trade-offs at the Core: Consistency and Availability",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 25,
            difficulty: "advanced",
            prerequisiteSlugs: ["5-2-agreement-coordinators-and-locks"],
          },
        ],
      },
      {
        id: "bb-unit-6",
        label: "Unit 6",
        title: "Designing Whole Systems",
        summary:
          "Everything so far taught components and patterns; nobody has taught the " +
          "process of getting from an ambiguous brief to a graph.",
        chapters: [
          {
            slug: "6-1-from-requirements-to-architecture",
            number: "6.1",
            title: "From Requirements to Architecture",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 60,
            difficulty: "advanced",
            prerequisiteSlugs: ["5-3-trade-offs-at-the-core-consistency-and-availability"],
          },
          {
            slug: "checkpoint-r3-open-brief",
            number: null,
            title: "Checkpoint · Open Brief",
            kind: "checkpoint",
            chapterDefinitionId: null,
            estimatedMinutes: 60,
            difficulty: "advanced",
            prerequisiteSlugs: ["6-1-from-requirements-to-architecture"],
          },
        ],
      },
    ],
  },
  "real-world-extraction": {
    id: "real-world-extraction",
    title: "Real World Extraction",
    subtitle: "Full system-design briefs. More than one architecture passes.",
    sections: [
      {
        id: "rwe-tier-1",
        label: "Tier 1",
        title: "Guided Core",
        summary:
          "The canonical starter system — tiny surface, extreme read/write asymmetry, " +
          "one crisp new problem.",
        chapters: [
          {
            slug: "rwe-1-bitly-url-shortener",
            number: null,
            title: "bit.ly — URL Shortener",
            kind: "chapter",
            chapterDefinitionId: "rwe-dummy-1",
            estimatedMinutes: 75,
            difficulty: "intermediate",
            // §10: RWE-1 unlocks after Unit 3.
            prerequisiteSlugs: ["3-5-partitioning-and-sharding"],
          },
        ],
      },
      {
        id: "rwe-tier-2",
        label: "Tier 2",
        title: "Open Build",
        summary:
          "The first multi-subsystem projects: every piece is familiar on its own, and " +
          "the composition is the lesson.",
        chapters: [
          {
            slug: "rwe-2-instagram-photo-sharing",
            number: null,
            title: "Instagram — Photo Sharing",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 90,
            difficulty: "advanced",
            // §10: RWE-2/3 unlock after Checkpoint R2 (Units 3 and 4).
            prerequisiteSlugs: ["checkpoint-r2-the-whole-backend"],
          },
          {
            slug: "rwe-3-distributed-log-collector",
            number: null,
            title: "Distributed Log Collector",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 90,
            difficulty: "advanced",
            prerequisiteSlugs: ["checkpoint-r2-the-whole-backend"],
          },
        ],
      },
      {
        id: "rwe-tier-3",
        label: "Tier 3",
        title: "Full Systems",
        summary:
          "Full systems that invert earlier assumptions and compose the entire " +
          "curriculum into one coexisting graph.",
        chapters: [
          {
            slug: "rwe-4-whatsapp-messaging",
            number: null,
            title: "WhatsApp — Messaging",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 120,
            difficulty: "advanced",
            // §10: RWE-4 unlocks after Unit 5 (6.1 is a recommendation, not
            // its hard gate — see CURRICULUM.md §10's closing note).
            prerequisiteSlugs: ["5-3-trade-offs-at-the-core-consistency-and-availability"],
          },
          {
            slug: "rwe-5-netflix-video-streaming",
            number: null,
            title: "Netflix — Video Streaming (capstone)",
            kind: "chapter",
            chapterDefinitionId: null,
            estimatedMinutes: 150,
            difficulty: "advanced",
            // §10: RWE-5 is a breadth gate — Unit 5 plus any two of the
            // other four RWE projects. `prerequisiteSlugs` has no quorum
            // ("any N of") semantics yet and nothing reads this field in
            // 3.0.0, so this lists all four candidates rather than
            // approximating a threshold incorrectly as a strict AND.
            prerequisiteSlugs: [
              "5-3-trade-offs-at-the-core-consistency-and-availability",
              "rwe-1-bitly-url-shortener",
              "rwe-2-instagram-photo-sharing",
              "rwe-3-distributed-log-collector",
              "rwe-4-whatsapp-messaging",
            ],
          },
        ],
      },
    ],
  },
};
