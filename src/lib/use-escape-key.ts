"use client";

import { useEffect, useRef } from "react";

/**
 * Escape-to-dismiss for modals and dialogs.
 *
 * The stack is what makes nesting correct. Every open surface listens on the
 * same window, so without one, a dialog opened from inside another dialog
 * would close both on a single press. Only the most recently mounted handler
 * runs; when it unmounts, the one beneath it becomes live again.
 *
 * Registration is once per mount, driven off a ref rather than the callback
 * itself - callers pass inline arrows, and re-registering on every render
 * would re-push a parent's handler above an already-open child's, silently
 * inverting the stack.
 */
type Slot = { fire: () => void };

const stack: Slot[] = [];

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape") return;
  const top = stack[stack.length - 1];
  if (!top) return;
  // Marks the press as handled so a window-level Escape elsewhere (canvas
  // placement, focus mode) does not also act on it - see
  // canvas/use-canvas-shortcuts.ts, which owns those.
  event.preventDefault();
  event.stopPropagation();
  top.fire();
}

/**
 * `enabled: false` keeps the surface mounted but not dismissable - for a
 * dialog mid-submit, where closing would strand the request. The slot stays
 * claimed either way, so Escape never falls through to the surface
 * underneath.
 */
export function useEscapeKey(onEscape: () => void, enabled = true) {
  // Read at keypress time, so the newest callback runs without the slot ever
  // being re-ordered. Written in an effect rather than during render - a ref
  // mutation in the render body is not safe under concurrent rendering, and
  // there is no keypress to serve between a render and its effects anyway.
  const latest = useRef({ onEscape, enabled });
  useEffect(() => {
    latest.current = { onEscape, enabled };
  });

  useEffect(() => {
    const slot: Slot = {
      fire: () => {
        if (latest.current.enabled) latest.current.onEscape();
      },
    };

    if (stack.length === 0) {
      // Capture phase: a keydown handler on an inner element (a text field, a
      // picker) would otherwise see Escape first.
      window.addEventListener("keydown", onKeyDown, true);
    }
    stack.push(slot);

    return () => {
      const index = stack.lastIndexOf(slot);
      if (index !== -1) stack.splice(index, 1);
      if (stack.length === 0) {
        window.removeEventListener("keydown", onKeyDown, true);
      }
    };
  }, []);
}
