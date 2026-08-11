import { useEffect, useRef, useState } from "react";
import { PACKET_TRAVEL_MS } from "./player";
import { pointOnCubic, type CubicSegment } from "./geometry";

/** Trailing dots behind the packet head, as a fraction of the trip behind it
 * and the opacity each is drawn at. Reads as direction of travel without a
 * blur filter or a stroke-dash trick. */
const TAIL = [
  { lag: 0.035, opacity: 0.45 },
  { lag: 0.07, opacity: 0.22 },
];

/**
 * One packet traveling a highlighted edge, positioned frame by frame from
 * `requestAnimationFrame` and evaluated arithmetically (geometry.ts's
 * `pointOnCubic`).
 *
 * This replaced an SMIL `<animateMotion>` implementation that never visibly
 * ran: SMIL resolves begin times against the *document* timeline rather than
 * the element's mount time, so a walkthrough mounted seconds into a page's
 * life starts already past its own begin time and renders frozen at the end
 * of the path. Working around that needs an imperative `beginElement()`,
 * which is unavailable in jsdom and gives no way to pause, resume, or rescale
 * the animation - all three of which the transport bar needs. A rAF loop
 * owns its own clock, so pause/speed/reset are all just arithmetic on it.
 *
 * The loop lives here rather than in the player so that only this element
 * re-renders per frame - the node cards and edge paths above it are
 * step-scoped state and must not re-render 60 times a second.
 *
 * Rewinding on a step change is the caller's job, via a `key` that includes
 * the step and algorithm (see WalkthroughEdges): a remount resets both the
 * progress state and the elapsed clock in one move, with no reset effect to
 * race the animation loop's own.
 */
export function WalkthroughPacket({
  segment,
  color,
  playing,
  speed,
}: {
  segment: CubicSegment;
  color: string;
  playing: boolean;
  speed: number;
}) {
  const [progress, setProgress] = useState(0);
  const elapsedRef = useRef(0);

  useEffect(() => {
    let frame = 0;
    let previous: number | null = null;
    const tick = (now: number) => {
      elapsedRef.current += previous === null ? 0 : (now - previous) * speed;
      previous = now;
      if (playing) {
        // Autoplay keeps traffic flowing for as long as the step is held;
        // a paused player gets exactly one trip, then the packet rests at
        // its destination.
        setProgress((elapsedRef.current % PACKET_TRAVEL_MS) / PACKET_TRAVEL_MS);
        frame = requestAnimationFrame(tick);
      } else if (elapsedRef.current < PACKET_TRAVEL_MS) {
        setProgress(elapsedRef.current / PACKET_TRAVEL_MS);
        frame = requestAnimationFrame(tick);
      } else {
        setProgress(1);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  const head = pointOnCubic(segment, progress);

  return (
    <g data-walkthrough-packet="">
      {/* Filtered, not clamped: a tail dot whose lag is longer than the trip
          so far would otherwise stack on the packet's own origin. */}
      {TAIL.filter((dot) => progress > dot.lag).map((dot) => {
        const point = pointOnCubic(segment, progress - dot.lag);
        return <circle key={dot.lag} cx={point.x} cy={point.y} r={3} fill={color} opacity={dot.opacity} />;
      })}
      <circle cx={head.x} cy={head.y} r={7.5} fill={color} opacity={0.22} />
      <circle cx={head.x} cy={head.y} r={4} fill={color} />
    </g>
  );
}
