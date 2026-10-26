import type { TourStep } from "./types";
import { hasClientAppRequestFlowEdge, hasSqlDatabase } from "./design-editor-predicates";

/**
 * Chapter 0.1's tour for touch devices (release 7.4.0). Same 19 steps, same
 * ids, same order and gating as `designEditorTour` - run state is stored by
 * step index, so a learner switching between iPad and desktop mid-tour
 * resumes at the matching step. Only copy, anchors and placement differ:
 * no mouse, no keyboard, and the compact layout hides the header tools and
 * collapses the sidebar in portrait. `design-editor-tour.test.ts` locks the
 * parity.
 *
 * Steps about something inside the sidebar also light `sidebar-toggle`, so
 * a collapsed sidebar still gives the step something real to point at.
 */
const touchSteps: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Welcome to the Design Editor",
    body:
      "This is where you build architectures. This chapter's starter design has a couple of real problems in it - you'll find and fix them together with this tour.\n\n" +
      "19 steps, about five minutes. Pause to pick up where you left off, or skip it entirely - the buttons at the bottom of the lesson sidebar bring it back either way.",
  },
  {
    id: "canvas-intro",
    target: "canvas",
    title: "Your canvas",
    body: "Components live here as cards, connected by edges that show how requests flow between them. Drag with one finger to move around, pinch to zoom.",
    placement: "bottom",
  },
  {
    id: "select-a-node",
    target: "canvas",
    title: "Try it: select a component",
    body: "Tap any component card. A toolbar appears above it with everything you can do to it - Configure, Connect, Duplicate, Delete, and More.",
    placement: "bottom",
    waitFor: (ctx) => ctx.selectedNodeId !== null,
  },
  {
    id: "header-tools",
    target: "header-more",
    spotlightAlso: ["header-tools"],
    title: "Save, docs, and more",
    body: "Your work saves automatically. The ··· button holds the rest: save now, export, the documentation panel, theme, and Report a bug.",
    placement: "bottom",
  },
  {
    id: "open-picker",
    target: "canvas-dock",
    title: "Try it: open the component picker",
    body: "Tap Add component in the toolbar at the bottom of the canvas.",
    placement: "top",
    waitFor: (ctx) => ctx.isComponentPickerOpen,
    allowsComponentPicker: true,
  },
  {
    id: "picker-tour",
    target: "canvas",
    popoverAnchor: "component-picker",
    allowsComponentPicker: true,
    highlightComponentId: "sql-database",
    title: "Try it: add the SQL Database",
    body:
      "Browse by category, or search. Tapping a component arms it - then tap the canvas where it should land.\n\n" +
      "Then connect it: tap the Application Server, tap Connect in its toolbar, then tap the SQL Database.",
    placement: "top",
    waitFor: hasSqlDatabase,
    requires: hasSqlDatabase,
    hard: true,
  },
  {
    id: "question-pane",
    target: "question-pane",
    spotlightAlso: ["sidebar-toggle"],
    title: "The lesson sidebar",
    body: "The chapter's question and a link back to the full lesson live here. On a narrow screen it starts closed - the panel button at the top-left opens it.",
    placement: "right",
  },
  {
    id: "hints",
    target: "hint-toggle",
    spotlightAlso: ["sidebar-toggle"],
    title: "Hints, if you want them",
    body: "Stuck? This chapter has an opt-in hint in the sidebar - it never shows itself. You decide if and when to look.",
    placement: "right",
  },
  {
    id: "validate-intro",
    target: "validate",
    title: "Validate",
    body: "Validate checks your design against this chapter's rules and always explains what it finds, right here.",
    placement: "bottom",
  },
  {
    id: "validate-click",
    target: "validate",
    spotlightAlso: ["validation-details"],
    title: "Try it: run Validate",
    body: "This starter design has real problems in it. Tap Validate to see exactly what and why.",
    placement: "bottom",
    waitFor: (ctx) => ctx.lastValidationErrorCount !== null,
    noAutoAdvance: true,
    hard: true,
  },
  {
    id: "fix-edge",
    target: "canvas",
    popoverAnchor: "edge-inspector",
    placement: "top",
    title: "Fix it: correct the connection",
    body: "One connection has the wrong kind. Tap the line between Client and Application Server, then set its kind to request-flow in the Edge Inspector that opens.",
    waitFor: hasClientAppRequestFlowEdge,
    requires: hasClientAppRequestFlowEdge,
    hard: true,
  },
  {
    id: "revalidate-clean",
    target: "validate",
    spotlightAlso: ["validation-details"],
    title: "Try it: confirm the fix",
    body: "Tap Validate once more - with both issues fixed, it should come back clean.",
    placement: "bottom",
    waitFor: (ctx) => ctx.lastValidationErrorCount === 0,
    noAutoAdvance: true,
    hard: true,
  },
  {
    id: "deep-check-overview",
    target: "deep-check",
    title: "Deep Check",
    body: "Optional, and here for later: an AI review of your design, framed around what a chapter is teaching. It needs an AI provider configured, so there's nothing to try right now.",
    placement: "bottom",
  },
  {
    id: "submit-intro",
    target: "submit",
    title: "Submit",
    body: "Validate is the quick, repeatable check while you build. Submit is the completion gate: it runs that same check, then compares your design against this chapter's target approach.",
    placement: "bottom",
  },
  {
    id: "submit-click",
    target: "submit",
    title: "Try it: run Submit",
    body: "Your design is clean now - tap Submit to complete this chapter.",
    placement: "bottom",
    waitFor: (ctx) => ctx.hasSubmittedPassing,
    hard: true,
  },
  {
    id: "progress-complete",
    target: "chapter-complete",
    spotlightAlso: ["sidebar-toggle"],
    title: "Chapter complete",
    body: "The sidebar now marks the chapter complete - the same signal that updates your progress across the whole curriculum.",
    placement: "right",
  },
  {
    id: "debrief",
    target: "debrief",
    spotlightAlso: ["sidebar-toggle"],
    title: "The Debrief",
    body: "A passed chapter unlocks a Debrief in the sidebar - commentary on the approach you matched, only shown once you've solved it.",
    placement: "right",
  },
  {
    id: "more-to-explore",
    target: "canvas-dock",
    allowsComponentPicker: true,
    title: "One more thing: what else is here",
    body:
      "Long-press anything for its full menu of actions.\n" +
      "Zone, Note and Flag in this toolbar annotate a design.\n" +
      "The hand and arrow switch what a one-finger drag does: move around, or select several cards at once.",
    placement: "top",
  },
  {
    id: "wrap-up",
    target: null,
    title: "You're ready",
    body: "That's the editor. Replay this tour anytime from the bottom of the lesson sidebar - Start over there also resets the canvas to the original design, so the fix-it steps run for real again. Good luck with the chapter.",
  },
];

export const designEditorTouchTour = touchSteps;
