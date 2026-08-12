"use client";

import { useCallback, useEffect, useState } from "react";

export const SPEEDS = [0.5, 1, 1.5, 2] as const;
export type PlaybackSpeed = (typeof SPEEDS)[number];

/** How long autoplay holds one step before advancing, at 1x. Long enough to
 * read a two-line caption, which is what a step's caption is budgeted at
 * (see the fixed caption strip in Walkthrough.tsx). */
export const STEP_HOLD_MS = 3600;

/** One packet's trip along a highlighted edge, at 1x. Shorter than the step
 * hold so a packet visibly arrives and rests before the step turns over. */
export const PACKET_TRAVEL_MS = 1300;

/**
 * Playback state for a Walkthrough: step index plus the video-style
 * transport (play/pause, speed, reset) the controls bar drives.
 *
 * Autoplay is a per-step `setTimeout` rather than one long-lived interval -
 * the timer is torn down and restarted whenever the step, speed, or play
 * state changes, so a manual jump mid-playback gets a full hold on the step
 * it landed on instead of whatever remained of the previous step's.
 */
export function useWalkthroughPlayer(total: number) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);

  const goTo = useCallback(
    (index: number) => setStepIndex(Math.min(Math.max(index, 0), Math.max(total - 1, 0))),
    [total],
  );

  // Playback stops at the end rather than looping - a walkthrough is an
  // argument with a conclusion, and a silent restart makes the last step
  // read as just another frame. Derived rather than written back into
  // `playing` from an effect: reaching the last step is already observable
  // state, so re-recording it would be a second source of truth (and a
  // cascading render) for the same fact.
  const atEnd = stepIndex >= total - 1;
  const isPlaying = playing && !atEnd;

  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setTimeout(() => setStepIndex((i) => Math.min(i + 1, total - 1)), STEP_HOLD_MS / speed);
    return () => window.clearTimeout(id);
  }, [isPlaying, stepIndex, speed, total]);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setPlaying(false);
      return;
    }
    // Play on a finished walkthrough replays it from the top.
    if (atEnd) setStepIndex(0);
    setPlaying(true);
  }, [isPlaying, atEnd]);

  const reset = useCallback(() => {
    setPlaying(false);
    setStepIndex(0);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeed((current) => SPEEDS[(SPEEDS.indexOf(current) + 1) % SPEEDS.length]);
  }, []);

  return { stepIndex, playing: isPlaying, speed, goTo, togglePlay, reset, cycleSpeed };
}
