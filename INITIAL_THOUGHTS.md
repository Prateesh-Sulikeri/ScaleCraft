# ScaleCraft - Initial Thoughts

## Vision

ScaleCraft is not intended to be a game. It is an interactive system architecture laboratory that complements the System Design textbook. The objective is to teach users how to build and reason about real-world distributed systems by assembling architectures from reusable components.

The textbook explains concepts and trade-offs. ScaleCraft provides a practical environment where those concepts are applied.

---

# Learning Modes

## 1. Building Blocks

Purpose:
Introduce core system design concepts through guided, constrained exercises.

Characteristics:

- Every chapter presents a problem statement.
- Each chapter defines the available components.
- Only components relevant to the learning objective are available.
- Users assemble a working architecture using drag-and-drop.
- Components have predefined connection rules.
- Hints are available.
- Each component exposes contextual documentation explaining its purpose.
- Exploration is intentionally limited to keep the learner focused.

The restriction is based on the chapter, not the mode.

---

## 2. Real World Extraction

Purpose:
Apply foundational knowledge to complete system design problems.

Examples:

- URL Shortener
- Distributed Log Collector
- Instagram
- Netflix
- Bit.ly
- WhatsApp

Characteristics:

- Larger component library.
- Multiple valid solutions.
- Less restrictive validation.
- Richer trade-off analysis.
- Supporting reading material remains available.

The objective is to complete a complete production-ready architecture rather than simply placing components correctly.

---

## 3. Sandbox

Purpose:
Free exploration.

Characteristics:

- No objectives.
- No validation constraints beyond component rules.
- No scoring.
- Full experimentation.

---

# Core Design Principle

The platform is built around reusable architectural components rather than individual problems.

The same components introduced during foundational chapters are reused throughout advanced system design exercises.

Learning complexity comes from component composition, not from introducing entirely new mechanics.

---

# Core Components

## Networking

- Client
- Browser
- DNS
- CDN
- Reverse Proxy
- API Gateway
- Load Balancer
- Firewall

## Compute

- Application Server
- Worker
- Cron Job
- Serverless Function

## Data

- SQL Database
- NoSQL Database
- Read Replica
- Object Storage
- Search Engine

## Caching

- Cache
- Distributed Cache

## Messaging

- Message Queue
- Kafka
- Event Bus
- Dead Letter Queue

## Distributed Systems

- Coordinator
- Leader
- Follower
- Lock Service

Additional components can be introduced later, but the majority of future chapters should be expressible using these primitives.

---

# Component Philosophy

Components are not static icons.

Each component should define:

- Inputs
- Outputs
- Configuration
- Validation Rules
- Runtime Behaviour
- Documentation

The same component should be reusable across every chapter.

---

# Chapter Definition

Each chapter defines:

- Problem Statement
- Learning Objectives
- Available Components
- Required Components
- Validation Rules
- Success Criteria
- Optional Hints
- Supporting Reading Material

Example:

- Caching chapter:
    - Cache available.
    - Kafka unavailable.
    - Objective focuses exclusively on caching concepts.

Component availability is determined by the educational objective of the chapter.

---

# Validation Philosophy

Validation should explain architectural reasoning rather than simply marking answers incorrect.

Example:

Instead of:

"Invalid."

Provide:

"The database should not be directly exposed to clients because application servers enforce authentication, authorization and business logic."

The goal is to teach architectural thinking.

---

# Architecture Model

The editor maintains an Architecture Graph.

Properties:

- Directed
- Acyclic
- Represents forward request/data flow
- Used for validation

Runtime request/response behaviour is part of the simulator and should not require reverse edges in the architecture graph.

---

# Long-Term Goal

ScaleCraft should become an interactive companion to the textbook.

Textbook:
- Explains concepts.
- Covers theory.
- Discusses trade-offs.

ScaleCraft:
- Builds architectures.
- Validates decisions.
- Simulates behaviour.
- Reinforces intuition through practical application.

Both products should share the same architectural vocabulary, reusable components and mental model.
