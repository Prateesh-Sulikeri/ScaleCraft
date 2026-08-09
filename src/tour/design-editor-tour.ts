import type { TourStep } from "./types";

/**
 * Chapter 0.1's guided walkthrough of the Design Editor
 * (.claude/docs/pending.md Track A, revised 2026-08-05 after a real-browser
 * walkthrough). Teaches the editor's controls using a starter graph that's
 * deliberately broken (one missing required component, one wrong edge kind —
 * see content/chapters/index.ts's bb-0-1-welcome starterGraph) so Validate
 * has something real to find and the learner practices the actual fix-it
 * loop, not just a click-through.
 *
 * Targeting conventions this script relies on:
 * - A step that asks the learner to *use* the component picker must set
 *   `allowsComponentPicker`, or the controller closes it in the same tick.
 * - A step whose control opens a second surface (Validate and its violations
 *   dropdown) lists that surface in `spotlightAlso`, so the explanation the
 *   step sends the learner to read isn't dimmed and covered by the tour.
 * - Steps target the specific control they're about, not the whole panel it
 *   lives in — a ring around an entire sidebar carries no information.
 */
export const designEditorTour: TourStep[] = [
  {
    id: "welcome",
    target: null,
    title: "Welcome to the Design Editor",
    body:
      "This is where you build architectures. This chapter's starter design has a couple of real problems in it - you'll find and fix them together with this tour.\n\n" +
      "21 steps, about five minutes. Press Esc to pause and pick up where you left off, or skip it entirely - the buttons at the bottom of the lesson sidebar bring it back either way.",
  },
  {
    id: "canvas-intro",
    target: "canvas",
    title: "Your canvas",
    body: "Components live here as cards, connected by edges that show how requests flow between them.",
    placement: "bottom",
  },
  {
    id: "select-a-node",
    target: "canvas",
    title: "Try it: select a component",
    body: "Click any component card on the canvas to select it.",
    placement: "bottom",
    waitFor: (ctx) => ctx.selectedNodeId !== null,
  },
  {
    id: "header-tools",
    target: "header-tools",
    title: "Save, docs, and shortcuts",
    body: "Your work saves automatically. This cluster also opens the documentation panel and the keyboard shortcuts reference.",
    placement: "bottom",
  },
  {
    id: "undo-redo",
    // The real gesture happens on the canvas, so that's the target;
    // popoverAnchor points the card (and its ring) at the undo/redo buttons
    // it's actually describing. The canvas is too broad to spotlight, so
    // only one ring is drawn — the header one (see TourOverlay).
    target: "canvas",
    popoverAnchor: "undo-redo",
    title: "Try it: make Undo available",
    body: "Drag a component to a new spot on the canvas - then glance up here. Undo lights up as soon as there's a change to undo.",
    placement: "bottom",
    waitFor: (ctx) => ctx.canUndo,
  },
  {
    id: "open-picker",
    target: "canvas",
    title: "Try it: open the component picker",
    body: "Press / or right-click anywhere on the canvas to open the component picker.",
    placement: "bottom",
    waitFor: (ctx) => ctx.isComponentPickerOpen,
    allowsComponentPicker: true,
  },
  {
    id: "picker-tour",
    target: "component-picker",
    title: "The component picker",
    body: "Search, or browse by category. Choosing a component here doesn't drop it immediately - it arms it, and your next click on the canvas decides exactly where it lands. You'll do that for real in a moment.",
    placement: "right",
    allowsComponentPicker: true,
  },
  {
    id: "question-pane",
    target: "question-pane",
    title: "The lesson sidebar",
    body: "This panel holds the chapter's question and a link back to the full lesson - it's always one click away.",
    placement: "right",
  },
  {
    id: "hints",
    target: "hint-toggle",
    title: "Hints, if you want them",
    body: "Stuck on something? This chapter has an opt-in hint here - it never shows itself. You decide if and when to look.",
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
    // The results dropdown is the entire point of this step, so it's lit
    // alongside the button rather than dimmed behind the backdrop.
    spotlightAlso: ["validation-details"],
    title: "Try it: run Validate",
    // Doesn't name a specific count — "picker-tour" a few steps back
    // deliberately leaves the picker open (allowsComponentPicker), so a
    // learner who places something early can genuinely change how many
    // issues Validate finds. Naming "two" here was only ever true in the
    // one path where nothing was touched before this step.
    body: "This starter design has real problems in it. Click Validate now to see exactly what and why.",
    placement: "bottom",
    waitFor: (ctx) => ctx.lastValidationErrorCount !== null,
  },
  {
    id: "fix-component",
    target: "canvas",
    // Without this the picker is force-closed the instant it opens, which
    // made this step - and everything after it - impossible to complete.
    allowsComponentPicker: true,
    title: "Fix it: add the missing component",
    body: "Validate flagged a required component that isn't here yet. Open the component picker - it's narrowed down to exactly what's missing - choose it, then click the canvas to drop it. Connect it to the Application Server.",
    placement: "bottom",
    waitFor: (ctx) => ctx.presentComponentIds.includes("sql-database"),
    narrowAvailableComponentIds: ["sql-database"],
  },
  {
    id: "fix-edge",
    target: "canvas",
    // The Edge Inspector renders at the canvas's bottom-right corner, which
    // is exactly where an unanchored card docks — anchoring here moves the
    // card clear of it (and rings it) instead of sitting on top of the very
    // select the step is telling the learner to change.
    popoverAnchor: "edge-inspector",
    placement: "top",
    title: "Fix it: correct the connection",
    body: "One connection has the wrong kind. Click the edge between Client and Application Server, then set its kind to request-flow in the Edge Inspector that appears, bottom-right.",
    waitFor: (ctx) => ctx.edgeKindById["bb-0-1-edge-client-app"] === "request-flow",
  },
  {
    id: "revalidate-clean",
    target: "validate",
    spotlightAlso: ["validation-details"],
    title: "Try it: confirm the fix",
    body: "Click Validate once more - with both issues fixed, it should come back clean.",
    placement: "bottom",
    waitFor: (ctx) => ctx.lastValidationErrorCount === 0,
  },
  {
    id: "deep-check-overview",
    target: "deep-check",
    title: "Deep Check",
    body: "This one is optional and it's here for later: an AI review of your design, framed around what a chapter is teaching. It needs an AI provider configured, so there's nothing to try right now - just so you know what the button is.",
    placement: "bottom",
  },
  {
    id: "submit-intro",
    target: "submit",
    title: "Submit",
    body: "Validate is the quick, repeatable check while you're building. Submit is different - it's the completion gate: it runs that same check, then compares your design against this chapter's target approach.",
    placement: "bottom",
  },
  {
    id: "submit-click",
    target: "submit",
    title: "Try it: run Submit",
    body: "Your design is clean now - click Submit to complete this chapter.",
    placement: "bottom",
    waitFor: (ctx) => ctx.hasSubmittedPassing,
  },
  {
    id: "progress-complete",
    target: "chapter-complete",
    title: "Chapter complete",
    body: "The sidebar marks the chapter complete here - that's the same signal that updates your progress across the whole curriculum.",
    placement: "right",
  },
  {
    id: "debrief",
    target: "debrief",
    title: "The Debrief",
    body: "A passed chapter unlocks this Debrief - commentary on the approach you matched, only ever shown after you've actually solved it.",
    placement: "right",
  },
  {
    // Three short "one more thing" pointers merged into one card (punch list
    // #24): individually they were a tail of blocking overlay steps for
    // things a learner discovers on their own, and none of them asks for a
    // gesture.
    id: "more-to-explore",
    target: "canvas",
    allowsComponentPicker: true,
    title: "One more thing: what else is here",
    body:
      "Right-click a component to configure it - instance counts, engine choice, and more.\n" +
      "The picker's Decoration section has zones, comments, and flags for annotating a design.\n" +
      "Scroll to zoom, drag empty canvas to pan, and use the corner controls to fit the view.",
    placement: "bottom",
  },
  {
    id: "wrap-up",
    target: null,
    title: "You're ready",
    body: "That's the editor. Replay this tour anytime from the bottom of the lesson sidebar - Start over there also resets the canvas to the original design, so the fix-it steps run for real again. Good luck with the chapter.",
  },
];
