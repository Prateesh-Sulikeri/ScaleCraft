import { Maximize2, Minimize2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import type { PlaybackSpeed } from "./player";

/** Shared square-icon-button language for every control on this component -
 * the transport buttons here and the Reset button in the header. Exported so
 * those two can't drift apart. */
export const WALKTHROUGH_ICON_BUTTON =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground outline-none transition-colors hover:enabled:bg-border/40 focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:cursor-not-allowed disabled:opacity-40";

/**
 * Video-style transport bar: play/pause, step back/forward, a scrubbable
 * step track, the step counter, a speed cycler, and fullscreen.
 *
 * Every element here is fixed-height and fixed-width-per-slot, which is the
 * point: this replaced a wrapping row of one dot per step, whose height
 * changed with the step count and the container width and moved the Back/
 * Next buttons out from under the pointer.
 *
 * The scrubber is a real `<input type="range">` held at zero opacity over a
 * drawn track, rather than a div with `role="slider"` - dragging, arrow-key
 * and Home/End seeking, and the screen-reader value announcement all come
 * from the platform control, and only the visuals are ours.
 */
export function WalkthroughControls({
  total,
  currentIndex,
  playing,
  speed,
  isFullscreen,
  fullscreenSupported,
  onJump,
  onBack,
  onNext,
  onTogglePlay,
  onCycleSpeed,
  onToggleFullscreen,
}: {
  total: number;
  currentIndex: number;
  playing: boolean;
  speed: PlaybackSpeed;
  isFullscreen: boolean;
  fullscreenSupported: boolean;
  onJump: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  onTogglePlay: () => void;
  onCycleSpeed: () => void;
  onToggleFullscreen: () => void;
}) {
  const percent = total > 1 ? (currentIndex / (total - 1)) * 100 : 0;

  return (
    <div className="flex h-11 items-center gap-1.5 rounded-lg border border-border bg-panel px-2">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
        title={playing ? "Pause" : "Play"}
        className={WALKTHROUGH_ICON_BUTTON}
      >
        {playing ? <Pause size={13} aria-hidden="true" /> : <Play size={13} aria-hidden="true" />}
      </button>
      <button
        type="button"
        onClick={onBack}
        disabled={currentIndex === 0}
        aria-label="Previous step"
        title="Previous step"
        className={WALKTHROUGH_ICON_BUTTON}
      >
        <SkipBack size={13} aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={currentIndex >= total - 1}
        aria-label="Next step"
        title="Next step"
        className={WALKTHROUGH_ICON_BUTTON}
      >
        <SkipForward size={13} aria-hidden="true" />
      </button>

      <div className="mx-1 h-4 w-px shrink-0 bg-border" aria-hidden="true" />

      <div className="relative flex h-7 min-w-0 flex-1 items-center rounded has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-foreground/40">
        <div className="absolute inset-x-0 h-1 rounded-full bg-border" aria-hidden="true" />
        <div className="absolute left-0 h-1 rounded-full bg-foreground/60" style={{ width: `${percent}%` }} aria-hidden="true" />
        {/* Tick per step, but only while they'd stay distinguishable - past
            that they merge into a solid bar and read as noise. */}
        {total <= 20 &&
          Array.from({ length: total }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              className={`absolute h-1.5 w-1.5 rounded-full ${i <= currentIndex ? "bg-foreground/60" : "bg-border"}`}
              style={{ left: `${total > 1 ? (i / (total - 1)) * 100 : 0}%`, transform: "translateX(-50%)" }}
            />
          ))}
        <div
          aria-hidden="true"
          className="absolute h-3 w-3 rounded-full border-2 border-panel bg-foreground transition-[left] duration-200 ease-out motion-reduce:transition-none"
          style={{ left: `${percent}%`, transform: "translateX(-50%)" }}
        />
        {total > 1 && (
          <input
            type="range"
            min={0}
            max={total - 1}
            step={1}
            value={currentIndex}
            onChange={(event) => onJump(Number(event.target.value))}
            aria-label="Step"
            aria-valuetext={`Step ${currentIndex + 1} of ${total}`}
            className="absolute inset-0 w-full cursor-pointer opacity-0"
          />
        )}
      </div>

      <span className="shrink-0 px-1 text-xs tabular-nums text-foreground/60">
        {currentIndex + 1} / {total}
      </span>
      <button
        type="button"
        onClick={onCycleSpeed}
        aria-label={`Playback speed ${speed}x, click to change`}
        title="Playback speed"
        className="h-7 shrink-0 rounded-md border border-border bg-background px-2 text-xs font-medium tabular-nums text-foreground outline-none transition-colors hover:bg-border/40 focus-visible:ring-2 focus-visible:ring-foreground/40"
      >
        {speed}x
      </button>
      {fullscreenSupported && (
        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={isFullscreen ? "Exit fullscreen" : "Expand to fullscreen"}
          title={isFullscreen ? "Exit fullscreen" : "Expand"}
          className={WALKTHROUGH_ICON_BUTTON}
        >
          {isFullscreen ? <Minimize2 size={13} aria-hidden="true" /> : <Maximize2 size={13} aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
