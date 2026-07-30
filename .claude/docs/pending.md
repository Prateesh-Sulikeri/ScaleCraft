# Task
Implement a major UX redesign for the ScaleCraft learning flow.

This is an Alpha 3.0.0 feature and should replace the current chapter navigation model.

This is **NOT** adding new chapters yet. That will be part of the next minor releases release/3.0.0-Chapter-content will contain the UI changes first, then from 3.1.0 onwards we add chapter contents into BB and RWE 

This is going to be the single biggest release so far, and the entire grunt of the application is present here. Without this part being perfect, the product has no chance of being market ready 

The goal is to redesign how users enter and navigate the Building Blocks (BB) and Real World Extraction (RWE) learning modes before Milestone 7 begins.

---

# Existing Flow

Current flow:

Home
<br>
↓
<br>
Click Building Blocks
<br>
↓
<br>
Canvas opens immediately
<br>
↓
<br>
Sidebar contains chapter list
<br>
↓
<br>
Selecting a chapter loads chapter content

This flow must be replaced.

---

# New User Flow

Home
<br>
↓
<br>
Click Building Blocks
<br>
↓
<br>
Navigate to a dedicated full-screen "Learning Path" page
<br>
↓
<br>
User browses curriculum
<br>
↓
<br>
Clicks chapter
<br>
↓
<br>
Navigate into chapter workspace (canvas)
<br>
↓
<br>
Completes chapter
<br>
↓
<br>
Progress updates automatically
<br>
↓
<br>
Return to Learning Path whenever desired

Exactly the same flow should exist for Real World Extraction.

---

# Overall Architecture

We now have two distinct experiences.

1.

Learning Path page

This is the curriculum browser.

No canvas.

No top toolbar.

No left canvas sidebar.

Entire screen dedicated to curriculum navigation.

2.

Chapter Workspace

This is the existing chapter page.

Contains:

- Canvas
- Toolbar
- Validation
- Inspector
- Sidebar
- Notes
- Hints
- Everything that currently exists

The Learning Path page launches the Chapter Workspace.

---

# Learning Path Page

Create an entirely new page.

Purpose:

Allow users to browse their progress through the curriculum before entering a chapter.

Think of:

Hello Interview

Educative

Frontend Masters

Notion database

The page should feel like an educational platform rather than a design tool.

---

# Layout

Top:

Large page title

Example:

Building Blocks

or

Real World Extraction

Below:

Overall Progress

Example

Progress

████████░░░░░░░░ 27%

Completed:

6 / 22 Chapters

---

Then:

Curriculum grouped into Sections.

Every Section should be collapsible.

Example

▼ Part 0
How the Web Works

0.1 Client Server Database
0.2 DNS
0.3 Reverse Proxy

▼ Part 1
Scaling Compute

1.1 Vertical vs Horizontal
1.2 Load Balancing
1.3 Statelessness
1.4 Reverse Proxy vs LB vs Gateway

▼ Part 2
Caching

...

etc.

Use CURRICULUM.md / textbook structure exactly.

Do not invent ordering.

---

Section Progress

Each section should display

Section progress bar

Example

Scaling Compute

██████░░░░░

2 / 4 Complete

---

Chapter Rows

Each chapter row should display

Chapter Number

Chapter Name

Difficulty (future ready)

Completion state

Optional lock state (future ready)

Estimated duration (future ready)

Status icon

Example

✔ Completed

○ Not Started

◐ In Progress

No gamification.

No XP.

No streaks.

No levels.

Just progress.

---

Chapter Completion

A chapter automatically becomes Complete when all completion conditions are satisfied.

Do create manual checkboxes.

Completion can either be users choice or the completion validation.

We'll wire this later. (mostly from the validation engine blue-print matching)

Design for it now.

Suggested interface:

chapter.status

NOT_STARTED

IN_PROGRESS

COMPLETED

---

Overall Progress

Top of page should show

Overall %

Completed chapters

Completed sections

Total chapters

Example

8 / 23 chapters

34%

---

Curriculum Download

Top-right of page

Download Curriculum

Downloads our System Design PDF.

The button should use the existing curriculum PDF which I will upload into public/docs.

---

Navigation

Clicking a chapter immediately navigates into the Chapter Workspace.

No intermediate modal.

---

Visual Style

Use existing ScaleCraft styling.

Dark mode.

Minimal.

Professional.

Educational.

Avoid looking like a game.

---

NO Toolbars

The Learning Path page intentionally removes:

Top canvas toolbar

Canvas controls

Canvas minimap

Inspector

Canvas sidebars

Canvas controls

Only curriculum should be visible.

---

Chapter Workspace Changes

The existing canvas page mostly stays the same.

However:

The chapter sidebar is no longer the primary navigation.

Instead,

it becomes a lightweight in-workspace navigator.

It should stay synchronized with the Learning Path.

Meaning

Changing chapters from the sidebar updates exactly the same progress model.

The sidebar becomes another view over the same curriculum state.

Never duplicate state.

---

Sidebar Requirements

Keep current behavior.

Allow opening chapter list.

Allow changing chapters.

Display completion icons.

Display progress.

Keep synchronized with Learning Path.

Single source of truth.

---

Routing

Introduce dedicated routes.

Suggested structure

/building-blocks

Learning Path

/building-blocks/:chapterId

Chapter Workspace

Similarly

/real-world-extraction

Learning Path

/real-world-extraction/:chapterId

Workspace

Avoid query parameter driven navigation.

Use route-based navigation.

---

State

Progress should eventually persist.

Design state cleanly.

Suggested model

Course

↓

Section

↓

Chapter

↓

Completion

Avoid local duplicated state.

---

Data Model

Introduce structures that support

Course

Section

Chapter

Progress

Completion

Estimated duration

Future locking

Future prerequisites

Without refactoring later.

---

Future Compatibility

Design the Learning Path so it can later support

Search

Filters

Resume where I left off

Bookmarks

Continue Learning

Locked chapters

Recently viewed

None need implementation now.

Only architecture.

---

Acceptance Criteria

- New Learning Path page exists.

- Home opens Learning Path instead of Canvas.

- Curriculum grouped by sections.

- Sections collapsible.

- Section progress bars.

- Overall progress bar.

- Chapter completion indicators.

- Download Curriculum button.

- Clicking chapter opens workspace.

- Workspace remains almost unchanged.

- Sidebar synchronized with Learning Path.

- Shared progress model.

- Proper routing.

- Clean component decomposition.

- No duplicated state.

- Production-quality architecture.

---

Implementation Notes

Prioritize architecture over polish.

This redesign becomes the foundation for every future Building Blocks and Real World Extraction chapter.

Milestone 7 (real chapter authoring beginning with BB 1.2 Load Balancing and BB 2.1 Cache-Aside) should plug directly into this new navigation model without requiring another redesign.

The curriculum hierarchy should mirror the textbook exactly, including Parts, chapter numbering, checkpoints, and Real World Extraction organization. Refer to the uploaded *The Crafters Guide to System Design* PDF for the authoritative structure. :contentReference[oaicite:0]{index=0}