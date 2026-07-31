# ScaleCraft Curriculum Architecture — Master Prompt

You are acting as the **Lead Curriculum Architect** for **ScaleCraft**, an interview-first system design learning platform.

Your task is **NOT** to write the actual chapters.

Your task is to design the **curriculum framework** that every future chapter will follow.

The actual lessons will later be written by **Opus 5**, so what you produce should function as the master specification that every future lesson writer follows.

The file to update is:

```
.claude/docs/CURRICULUM.md
```

Update the existing document carefully rather than rewriting everything from scratch.

Preserve all useful existing content, improve weak sections, reorganize where necessary, and make the document production-quality.

---

# Primary Goal

ScaleCraft is trying to maximize **learning effectiveness**, not simply teach concepts.

Every chapter should gradually transform someone into an engineer who can:

- Reason about distributed systems.
- Think from first principles instead of memorizing patterns.
- Communicate designs clearly.
- Solve ambiguous interview questions.
- Defend engineering decisions.
- Think in trade-offs.
- Connect individual building blocks into complete production systems.
- Understand why real companies made particular engineering decisions.

The curriculum itself should become the canonical blueprint for every future lesson.

Do **not** optimize for completeness alone.

Optimize for **learning progression**, **retention**, **engineering intuition**, and **interview readiness**.

---

# Current Learning Flow

The application now follows this learning journey:

```
Home Canvas
      │
      ▼
Choose Learning Path
      │
      ├── Building Blocks
      └── Real World Extraction
      │
      ▼
Select Chapter
      │
      ▼
Reader
(actual lesson)
      │
      ▼
Design Editor
(student solves a design problem)
```

The curriculum should explicitly support this flow.

Every lesson should naturally transition into the Design Editor.

The learner should feel that the design exercise is the continuation of the lesson—not a separate activity.

---

# Your Role

You are designing the **instructional framework**, not writing the lessons.

Think like:

- Curriculum Designer
- Staff Engineer
- System Design Interviewer
- Technical Author
- Learning Scientist

The output should become the internal specification used by every future AI model that writes ScaleCraft lessons.

Future models should require almost no additional instruction beyond this document.

---

# Educational Research

Study the educational structure, progression, and teaching methodology (NOT the content itself) from:

- Hello Interview
- ByteByteGo
- System Design Primer
- Grokking Modern System Design
- Alex Xu's System Design books
- Other exceptional system design educational resources if useful

Do **NOT** copy proprietary material.

Instead, extract educational patterns such as:

- pacing
- progression
- layering concepts
- interview preparation
- engineering mindset
- concept sequencing
- diagram usage
- reinforcement strategy

Use those insights to improve ScaleCraft's curriculum.

---

# What CURRICULUM.md Should Become

The document should become the master specification for writing every future chapter.

Think of it as both:

- a curriculum guide
- an internal authoring handbook

It should answer:

> "If another AI had to write Chapter 3.14 tomorrow, how should it do it?"

---

# 1. Curriculum Philosophy

Expand this section significantly.

Define:

- How engineers actually learn system design.
- Why the curriculum is organized the way it is.
- Why concepts are introduced in a specific order.
- Why production engineering and interviews differ.
- Why diagrams are essential.
- Why repetition and reinforcement matter.
- Why intuition is more valuable than memorization.

---

# 2. Learning Progression

Clearly define how learners evolve throughout the curriculum.

Example progression:

Stage 1

Learn vocabulary.

Stage 2

Understand components.

Stage 3

Understand interactions.

Stage 4

Understand trade-offs.

Stage 5

Design systems.

Stage 6

Defend systems.

Stage 7

Critique systems.

Improve this if you think it can be better.

---

# 3. Chapter Blueprint

Design a repeatable framework that every chapter follows.

The framework should be comprehensive and intentional.

At minimum define:

## Chapter Metadata

- Purpose
- Difficulty
- Estimated time
- Required prerequisites
- Future chapters unlocked
- Building blocks introduced
- Interview relevance
- Production relevance

---

## Learning Objectives

Separate objectives into categories:

Knowledge

Engineering

Interview

Practical

Communication

---

## Lesson Flow

Design the ideal lesson structure.

Example:

1. Motivation
2. Why this exists
3. Real-world problem
4. Mental model
5. Core intuition
6. Visual explanation
7. Internal mechanics
8. Building blocks
9. Engineering implications
10. Trade-offs
11. Failure scenarios
12. Scaling challenges
13. Production examples
14. Common mistakes
15. Interview notes
16. Summary
17. Transition into Design Editor

Improve this if you think a better structure exists.

---

# 4. Mandatory Sections

Every chapter should contain mandatory sections.

Examples include:

- Motivation
- Problem Statement
- Core Intuition
- Mental Model
- Visual Explanation
- Internal Mechanics
- Real-world Usage
- Trade-offs
- Failure Modes
- Scaling Considerations
- Engineering Notes
- Production Notes
- Interview Notes
- Common Mistakes
- Summary
- Preview of Next Chapter

Expand and improve this list.

---

# 5. Diagram Standards

ScaleCraft is diagram-first.

Define which diagrams should exist in chapters.

Examples:

Architecture diagrams

Request flow

Sequence diagrams

Data flow

Replication

Caching

Sharding

Queues

Leader election

Failure scenarios

Network topology

Scaling evolution

Component relationships

Layer diagrams

State transitions

Consistency models

Storage layouts

Decision trees

Dependency graphs

Whenever a chapter benefits from visualization, diagrams should be mandatory.

---

# 6. Visual Learning Standards

Every chapter should answer:

"What should the learner SEE?"

not just

"What should they READ?"

Prioritize visual understanding over dense text.

---

# 7. Engineering Thinking Framework

Every chapter should repeatedly reinforce engineering thinking.

Examples:

Why does this exist?

What problem is it solving?

Why not use another approach?

What assumptions are being made?

What breaks first?

What scales poorly?

What changes at:

- 10x
- 100x
- 1000x

What operational concerns appear?

How would Google solve this?

How would a startup solve this?

---

# 8. Interview Thinking Framework

Create a repeatable interview framework that appears throughout the curriculum.

Every major chapter should reinforce:

Requirement Gathering

Clarifying Questions

Functional Requirements

Non-functional Requirements

Back-of-the-envelope Estimation

High-level Design

Component Selection

Deep Dives

Identifying Bottlenecks

Trade-offs

Failure Analysis

Optimization

Follow-up Questions

Alternative Designs

Defending Decisions

Driving the Interview

Understanding Interviewer Intent

Common Candidate Mistakes

Senior-level Thinking

This should become one of the defining features of ScaleCraft.

---

# 9. Design Editor Integration

The curriculum should define how lessons transition into practical application.

For every chapter specify:

- What knowledge enters the editor.
- What information is intentionally omitted.
- Expected learner deliverables.
- Evaluation criteria.
- Hint philosophy.
- Difficulty progression.
- How chapters prepare students for increasingly open-ended design problems.

The Reader and Design Editor should feel like one continuous learning experience.

---

# 10. Learning Reinforcement

Design recurring reinforcement systems.

Examples:

Quick Recap

Knowledge Check

Reflection Questions

Think Before Reading

Mini Challenge

Checkpoint

Memory Anchors

Interview Nuggets

Production Nuggets

Engineering Nuggets

Common Pitfalls

Connections to Previous Chapters

Preview of Future Chapters

Spaced Reinforcement Opportunities

---

# 11. Real-world Connections

Every chapter should connect theory with production systems.

Examples:

Google

Netflix

Uber

Stripe

Cloudflare

Meta

Amazon

Discord

LinkedIn

Airbnb

Not detailed implementations.

Instead:

- why they use this
- when they use it
- what trade-offs influenced them

---

# 12. AI Author Instructions

Add a dedicated section for future AI models that generate lessons.

This should effectively become the system prompt for lesson generation.

Include guidance on:

Writing style

Depth

Tone

Complexity

When to simplify

When to defer advanced concepts

When to cross-reference future chapters

How diagrams should be introduced

How examples should be selected

How interview thinking should be balanced with production engineering

How to prevent information overload

How to progressively build intuition

What should NEVER be done

What assumptions should NEVER be made

---

# 13. Difficulty Progression

Clearly define how complexity increases throughout the curriculum.

No lesson should depend on concepts not yet introduced.

Every advanced topic should naturally emerge from previous lessons.

The learner should never feel like they skipped five chapters.

---

# 14. Cross-Chapter Connections

Encourage every chapter to explicitly reference:

Previous concepts

Future concepts

Related building blocks

Common interview systems

Real production systems

The curriculum should feel interconnected rather than isolated.

---

# Separate Deliverable — Quiz Framework

Create a NEW document dedicated entirely to quizzes.

Do NOT place quizzes inside CURRICULUM.md.

---

# Quiz Philosophy

These are NOT school exams.

These are engineering conversations.

Questions should resemble interviewer follow-ups.

Avoid trivia.

Prioritize reasoning.

---

# Every Quiz Should Include

10–20 questions.

Mix:

Conceptual

Scenario-based

Architecture reasoning

Trade-off analysis

Capacity estimation

Failure debugging

Scaling questions

Optimization

Production scenarios

Interview follow-ups

Diagram interpretation

Sequence reasoning

Edge cases

"What would you change?"

"What breaks first?"

"Why?"

"How would this evolve?"

Questions should become progressively harder.

---

# Diagram Questions

Whenever diagrams improve understanding:

Provide:

- Diagram purpose
- Layout description
- Graph JSON compatible with ScaleCraft

I will generate screenshots directly from these graphs.

---

# Quiz Coverage

Produce quizzes for every major curriculum section.

At minimum:

Foundations

Engineering Process

Journey of a Request

Core Infrastructure

Compute

Data

Performance

Asynchronous Systems

Storage

Reliability

Checkpoints

Real World Extraction

Each section should contain approximately 10–20 interview-quality questions.

---

# Building Blocks Curriculum

Use this as the baseline curriculum.

You may reorganize chapters if doing so improves learning progression.

## Part 0 — Foundations

0.1 Welcome to ScaleCraft

0.2 What is System Design?

0.3 Interview Design vs Production Engineering

0.4 The System Design Lifecycle

---

## Part 1 — Engineering Design Process

1.1 Understanding the Problem

1.2 Functional Requirements

1.3 Non-functional Requirements

1.4 Estimating Scale

1.5 Numbers Every Engineer Should Know

1.6 Drawing the First Architecture

1.7 Identifying Bottlenecks

1.8 Engineering Trade-offs

1.9 Deep Dive Methodology

1.10 Communicating & Defending a Design

1.11 Driving a System Design Interview (Optional)

---

## Part 2 — Journey of a Request

2.1 From Browser to Backend

2.2 Where Can Things Go Wrong?

2.3 Evolution of Modern Architectures

---

## Part 3 — Building Blocks

### Core Infrastructure

- Networking Fundamentals
- DNS
- Reverse Proxy
- Load Balancer
- API Gateway

### Compute

- Stateless Services
- Sessions & State Management
- Horizontal Scaling
- Service Discovery

### Data

- Databases
- SQL vs NoSQL
- Replication
- Sharding

### Performance

- Caching
- CDN
- Search Systems

### Asynchronous Systems

- Message Queues
- Event-driven Architecture
- Background Jobs & Scheduling

### Storage

- Object Storage
- File Storage
- Distributed Storage Concepts

### Reliability

- Reliability Patterns
- Rate Limiting
- Observability
- Fault Tolerance

---

## Part 4 — Checkpoints

R1 — A Site That Stays Up

R2 — Building a Complete Backend

R3 — Open System Design

You may improve sequencing and module organization if it results in a better learning experience.

---

# Real World Extraction Curriculum

Expand and improve the Real World Extraction learning path.

Use the following systems as the baseline curriculum.

| Difficulty | Group | System |
|------------|------|--------|
| 1 | URL & Metadata Services | Bitly |
| 1 | Infrastructure Components | Rate Limiter |
| 1 | Infrastructure Components | Distributed Cache |
| 1 | Infrastructure Components | Metrics Monitoring |
| 2 | Messaging & Communication | Notification System |
| 2 | Scheduling & Background Processing | Job Scheduler |
| 2 | Developer / Educational Platforms | LeetCode |
| 2 | Marketplaces & Commerce | Price Tracking Service |
| 2 | Gaming | Online Chess |
| 3 | Storage & File Systems | Google Drive |
| 3 | Storage & File Systems | Google Docs |
| 3 | Content Aggregation & Ranking | Ad Click Aggregator |
| 3 | Search & Discovery | News Aggregator |
| 3 | Search & Discovery | Facebook Post Search |
| 3 | Search & Discovery | Yelp |
| 3 | Marketplaces & Commerce | Payment System |
| 3 | Marketplaces & Commerce | Online Auction |
| 3 | Booking & Reservations | IRCTC |
| 4 | Messaging & Communication | WhatsApp |
| 4 | Matching Platforms | Tinder |
| 4 | Location & Mobility | Uber |
| 4 | Location & Mobility | DoorDash / Zomato |
| 4 | Social Networks & Feeds | InShorts News Feed |
| 4 | Social Networks & Feeds | Instagram |
| 4 | Video & Streaming | YouTube |
| 4 | Marketplaces & Commerce | Robinhood |
| 4 | Maps & Navigation | Google Maps |
| 5 | Storage & Collaboration | Google Docs (Real-time Collaboration Focus) |
| 5 | Location & Mobility | Strava |
| 5 | Social Networks & Feeds | Facebook Live Comments |
| 5 | Video & Streaming | YouTube Top K |
| 5 | Search & Discovery | Web Crawler |

Feel free to reorganize these into better modules, prerequisites, or learning tracks if it improves educational progression.

---

# Success Criteria

The final result should feel like it was produced by a team consisting of:

- Senior Staff Engineers
- Technical Educators
- System Design Interviewers
- Instructional Designers

It should combine the educational quality of:

- Hello Interview
- ByteByteGo
- Grokking
- System Design Primer
- Alex Xu's books

without copying their content.

The framework should make it possible for future AI models to generate world-class lessons with minimal additional prompting.

---

# Final Deliverables

Produce:

1. An updated `.claude/docs/CURRICULUM.md`
   - Production-ready.
   - Expanded and reorganized.
   - Serves as the canonical curriculum and lesson-authoring guide.

2. A separate `QUIZ_FRAMEWORK.md`
   - One quiz specification per major curriculum section.
   - 10–20 interview-quality questions per section.
   - Diagram recommendations.
   - Graph JSON templates/placeholders where diagrams are appropriate.

Both documents should be internally consistent, extensible, and capable of supporting the long-term evolution of ScaleCraft without requiring structural redesign.

**Take your time. Prioritize educational quality over speed. Design the backbone of an entire learning platform, not merely a table of contents.**