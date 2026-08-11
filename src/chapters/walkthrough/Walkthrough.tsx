"use client";

import { useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { WalkthroughEdges } from "./WalkthroughEdges";
import { WalkthroughNodeCard } from "./WalkthroughNodeCard";
import { WalkthroughControls, WALKTHROUGH_ICON_BUTTON } from "./WalkthroughControls";
import { WalkthroughAlgorithmSelect } from "./WalkthroughAlgorithmSelect";
import { useFullscreen, useReducedMotion } from "./hooks";
import { useWalkthroughPlayer } from "./player";
import type { WalkthroughProps } from "./types";

/**
 * A read-only, step-indexed spatial diagram embedded in MDX lesson content
 * (release 5.0.0-alpha, see .claude/docs/pending.md's Final Plan) - the
 * AlgoMaster.io-style walkthrough: a small fixed diagram, a caption per
 * step, one node/edge spotlighted at a time, and a video-style transport bar
 * (play/pause, scrub, speed, reset, fullscreen) driving it.
 *
 * Every band of this component is a fixed height - header, diagram (locked
 * by aspect-ratio), caption strip, transport bar. That's a hard requirement,
 * not styling: captions vary from one line to three, and letting the caption
 * band size to its content moved the transport bar vertically on every step,
 * so the Next button slid out from under the pointer mid-walkthrough.
 * Anything added here must keep its own height constant across steps.
 *
 * Conceptually generalizes the Guided Tour's step-sequencing idea
 * (src/tour/TourController.tsx: step index -> highlighted target -> caption
 * -> prev/next) but does NOT reuse that component's implementation - it's
 * deeply coupled to the live editable canvas (Zustand store, localStorage
 * run-state persistence, a watchdog, component-picker/focus-mode gating,
 * `data-tour` DOM anchors), none of which applies to a static diagram
 * sitting inside rendered lesson prose. Playback state is local and
 * unpersisted; there is no canvas dependency.
 */
export function Walkthrough({
  nodes,
  edges,
  steps,
  viewBoxWidth,
  viewBoxHeight,
  algorithms,
  title,
  description,
}: WalkthroughProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const fullscreen = useFullscreen(containerRef);
  const { stepIndex, playing, speed, goTo, togglePlay, reset, cycleSpeed } = useWalkthroughPlayer(steps.length);
  const [selectedAlgorithmId, setSelectedAlgorithmId] = useState(algorithms?.[0]?.id);

  const baseStep = steps[stepIndex];
  const step = (selectedAlgorithmId && baseStep?.variants?.[selectedAlgorithmId]) || baseStep;

  const highlightNodeIds = new Set(step?.highlightNodeIds ?? []);
  const highlightEdgeIds = new Set(step?.highlightEdgeIds ?? []);
  const hasHighlight = highlightNodeIds.size > 0 || highlightEdgeIds.size > 0;

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
    } else if (event.key === " " && event.target === event.currentTarget) {
      // Only when the group itself holds focus: inside the transport bar,
      // Space is the button's own activation key and must stay that.
      event.preventDefault();
      togglePlay();
    }
  }

  if (steps.length === 0) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      role="group"
      aria-roledescription="walkthrough"
      aria-label={title ?? "Diagram walkthrough"}
      onKeyDown={handleKeyDown}
      className={`flex flex-col gap-3 rounded-xl border border-border p-3 outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 ${
        fullscreen.isFullscreen ? "h-full justify-center bg-background p-6" : "bg-background/60"
      }`}
    >
      <div className="flex h-9 items-center justify-between gap-3">
        <div className="min-w-0">
          {title && <p className="truncate text-sm font-semibold leading-tight text-foreground">{title}</p>}
          {description && <p className="truncate text-xs leading-tight text-foreground/60">{description}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {algorithms && algorithms.length > 1 && (
            <WalkthroughAlgorithmSelect
              algorithms={algorithms}
              selectedId={selectedAlgorithmId}
              onSelect={setSelectedAlgorithmId}
            />
          )}
          <button
            type="button"
            onClick={reset}
            aria-label="Reset walkthrough"
            title="Reset to step 1"
            className={WALKTHROUGH_ICON_BUTTON}
          >
            <RotateCcw size={13} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        className="relative mx-auto w-full"
        style={{
          aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}`,
          // In fullscreen the limiting dimension flips from width to height:
          // cap the width at whatever keeps the diagram inside the viewport
          // once the surrounding bands have taken their share.
          maxWidth: fullscreen.isFullscreen
            ? `calc((100vh - 16rem) * ${viewBoxWidth} / ${viewBoxHeight})`
            : undefined,
        }}
      >
        <WalkthroughEdges
          nodes={nodes}
          edges={edges}
          highlightEdgeIds={highlightEdgeIds}
          dimmed={hasHighlight}
          runId={`${stepIndex}-${selectedAlgorithmId ?? ""}`}
          playing={playing}
          speed={speed}
          animatePackets={!reducedMotion}
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

      {/* Fixed height + line-clamp, deliberately: see the component note. A
          caption longer than three lines is an authoring bug, not something
          this band should grow to fit. */}
      <div className="flex h-20 items-center justify-center rounded-lg border border-border bg-panel px-4">
        <p aria-live="polite" className="line-clamp-3 text-center text-sm leading-relaxed text-foreground/80">
          {step.caption}
        </p>
      </div>

      <WalkthroughControls
        total={steps.length}
        currentIndex={stepIndex}
        playing={playing}
        speed={speed}
        isFullscreen={fullscreen.isFullscreen}
        fullscreenSupported={fullscreen.supported}
        onJump={goTo}
        onBack={() => goTo(stepIndex - 1)}
        onNext={() => goTo(stepIndex + 1)}
        onTogglePlay={togglePlay}
        onCycleSpeed={cycleSpeed}
        onToggleFullscreen={fullscreen.toggle}
      />
    </div>
  );
}
