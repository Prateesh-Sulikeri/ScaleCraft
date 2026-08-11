"use client";

import { useState } from "react";
import { WalkthroughEdges } from "./WalkthroughEdges";
import { WalkthroughNodeCard } from "./WalkthroughNodeCard";
import { WalkthroughControls } from "./WalkthroughControls";
import { WalkthroughAlgorithmToggle } from "./WalkthroughAlgorithmToggle";
import type { WalkthroughProps } from "./types";

/**
 * A read-only, step-indexed spatial diagram embedded in MDX lesson content
 * (release 5.0.0-alpha, see .claude/docs/pending.md's Final Plan) - the
 * AlgoMaster.io-style walkthrough: a small fixed diagram, a step counter,
 * each step highlighting one node/edge with a caption, discrete state, not
 * continuous animation (beyond the per-step packet - see WalkthroughEdges).
 *
 * Conceptually generalizes the Guided Tour's step-sequencing idea
 * (src/tour/TourController.tsx: step index -> highlighted target -> caption
 * -> prev/next) but does NOT reuse that component's implementation - it's
 * deeply coupled to the live editable canvas (Zustand store, localStorage
 * run-state persistence, a watchdog, component-picker/focus-mode gating,
 * `data-tour` DOM anchors), none of which applies to a static diagram
 * sitting inside rendered lesson prose. This is plain local step-index
 * state, nothing persisted, no canvas dependency.
 */
export function Walkthrough({ nodes, edges, steps, viewBoxWidth, viewBoxHeight, algorithms }: WalkthroughProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(algorithms?.[0]?.id);

  const baseStep = steps[stepIndex];
  const step = (selectedAlgorithmId && baseStep?.variants?.[selectedAlgorithmId]) || baseStep;

  const highlightNodeIds = new Set(step?.highlightNodeIds ?? []);
  const highlightEdgeIds = new Set(step?.highlightEdgeIds ?? []);
  const hasHighlight = highlightNodeIds.size > 0 || highlightEdgeIds.size > 0;

  function goTo(index: number) {
    setStepIndex(Math.min(Math.max(index, 0), steps.length - 1));
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    // Scoped to this element only (not window-level like ExamShell.tsx) -
    // this is one aside embedded in scrollable prose, not a full-page
    // modal, so a window listener would hijack arrows for every
    // walkthrough on the page regardless of focus.
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(stepIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(stepIndex + 1);
    }
  }

  if (steps.length === 0) return null;

  return (
    <div
      tabIndex={0}
      role="group"
      aria-roledescription="walkthrough"
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4 rounded-lg border border-border bg-background/60 p-4 outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      {algorithms && algorithms.length > 0 && (
        <WalkthroughAlgorithmToggle
          algorithms={algorithms}
          selectedId={selectedAlgorithmId}
          onSelect={setSelectedAlgorithmId}
        />
      )}
      <div className="relative w-full" style={{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}` }}>
        <WalkthroughEdges
          nodes={nodes}
          edges={edges}
          highlightEdgeIds={highlightEdgeIds}
          dimmed={hasHighlight}
          animationKey={`${stepIndex}-${selectedAlgorithmId ?? ""}`}
          viewBoxWidth={viewBoxWidth}
          viewBoxHeight={viewBoxHeight}
        />
        {nodes.map((node) => (
          <WalkthroughNodeCard
            key={node.id}
            node={node}
            left={(node.position.x / viewBoxWidth) * 100}
            top={(node.position.y / viewBoxHeight) * 100}
            highlighted={highlightNodeIds.has(node.id)}
            dimmed={hasHighlight && !highlightNodeIds.has(node.id)}
            viewBoxWidth={viewBoxWidth}
            viewBoxHeight={viewBoxHeight}
          />
        ))}
      </div>
      <p aria-live="polite" className="text-center text-sm leading-relaxed text-foreground/80">
        {step.caption}
      </p>
      <WalkthroughControls total={steps.length} currentIndex={stepIndex} onJump={goTo} onBack={() => goTo(stepIndex - 1)} onNext={() => goTo(stepIndex + 1)} />
    </div>
  );
}
