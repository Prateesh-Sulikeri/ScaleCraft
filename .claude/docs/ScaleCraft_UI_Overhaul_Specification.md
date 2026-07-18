# ScaleCraft UI Overhaul Specification

## Goal

Redesign the documentation and inspector experience so ScaleCraft feels like a professional engineering IDE rather than a canvas with floating utilities.

Core principles:

- Maximize canvas space.
- Make documentation a first-class learning experience.
- Make configuration contextual.
- Reduce persistent UI clutter.
- Keep interactions predictable and IDE-like.

---

# 1. Documentation System

## Current Problems

- Floating sticky-note style documentation clutters the canvas.
- Opening multiple documents creates multiple floating capsules.
- Long-form documentation is difficult to read.
- Reading documentation does not feel immersive.

## New Documentation Panel

Replace floating documentation completely.

Requirements:

- One documentation panel only.
- Docked to the right side.
- Fixed width.
- Extends from top to bottom of the viewport.
- Has its own independent scrolling.
- Never overlaps the canvas.
- Multiple documents open as tabs inside this single panel.

Opening documentation:

- Right-click node → Open Documentation
- Double-click documentation references (future)
- Documentation button in the top-right toolbar

The documentation button should toggle visibility of the documentation panel.

---

## Tabs

Documents should open as tabs similar to VS Code.

Requirements:

- Selecting an already-open document switches to that tab.
- No duplicate tabs.
- Tabs support close.
- Close current document.
- Close all documents.
- Close other documents (optional future enhancement).

---

## Minimize Behaviour

The documentation panel should support minimize.

When minimized:

- Panel disappears from the workspace.
- Open tabs remain in memory.
- Active tab is remembered.
- Scroll position for every document is remembered.
- Unsaved state is preserved.

When restored:

- Same documents reopen.
- Same selected tab.
- Same scroll positions.
- Same reading position.

This should feel like minimizing an IDE side panel—not closing it.

---

## Focus Notes Mode

Provide a dedicated reading experience.

Focus Mode should hide:

- Canvas
- Node palette
- Minimap
- Toolbar (except essential controls)

Documentation expands to occupy most or all of the workspace.

This allows ScaleCraft to double as a textbook.

---

## Rich Markdown

Support:

- Headings
- Tables
- Syntax highlighting
- Mermaid diagrams
- Images
- Callouts
- Notes
- Warnings
- Hyperlinks
- Checklists
- Footnotes
- Collapsible sections

Rendering should resemble GitHub/Obsidian quality.

---

# 2. Inspector Redesign

## Remove Permanent Inspector

The persistent right sidebar should be removed.

Reason:

- Consumes valuable canvas space.
- Most users spend more time building than configuring.

## New Configuration Flow

Node interactions:

Double Click Node

OR

Right Click → Configure

Configuration opens beside the node.

Requirements:

- Contextual floating modal/popover.
- Use shadcn/ui components.
- Position beside node whenever possible.
- Never permanently docked.
- Automatically closes after save or cancel.

---

# 3. Node Redesign

Remove long descriptions beneath nodes.

Each node should instead display:

1. Component name
2. Optional custom name
3. Configuration state

## Configuration Tag

Default:

- Yellow background
- Text: Default

Configured:

- Background inherits node category color.

Example:

Infrastructure → Blue

Networking → Green

Database → Purple

Messaging → Orange

If the node only supports a single configuration that never changes:

Do NOT display a Default badge.

Display a concise descriptive label instead.

---

# 4. Context Menu

Right-click menu should include:

- Configure
- Open Documentation
- Duplicate
- Delete
- Center View
- Highlight Connections

Open Documentation should activate an existing tab if already open.

---

# 5. Top Toolbar

Documentation

- Add Documentation button to the top-right toolbar.
- Button toggles documentation panel.
- Restores minimized state.

Import / Export

Current:

- Separate Import
- Separate Export

New:

Merge into one dropdown:

Project

- Import Project
- Export Project
- Export Image (future)
- Export PDF (future)
- Export Markdown (future)

---

# 6. UX Principles

- Canvas is always the primary focus.
- Documentation is persistent but unobtrusive.
- Inspector is contextual.
- Reduce visual noise.
- Mimic modern IDE behaviour.
- Preserve user context whenever possible.

---

# Acceptance Criteria

- No floating documentation windows remain.
- One docked documentation panel with tabs.
- Documentation panel can be minimized and restored without losing state.
- Rich Markdown rendering.
- Focus Notes Mode available.
- Permanent inspector removed.
- Configuration uses contextual shadcn modal/popover.
- Nodes display compact metadata instead of descriptions.
- Configuration badges indicate state and category.
- Documentation accessible from context menu and top-right toolbar.
- Import and Export consolidated into a single Project dropdown.
