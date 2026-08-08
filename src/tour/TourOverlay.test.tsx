import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { TourOverlay, computePopoverPosition, spotlightHole } from "./TourOverlay";
import type { TourStep } from "./types";

function step(overrides: Partial<TourStep> = {}): TourStep {
  return {
    id: "step-1",
    target: null,
    title: "A step",
    body: "Some body copy.",
    ...overrides,
  };
}

/** jsdom has no layout engine, so every getBoundingClientRect is zeros —
 * which is precisely why the whole class of positioning/occlusion bug in
 * .claude/docs/pending.md's punch list was invisible to this suite. Stubbing
 * real geometry onto specific elements is what lets the spotlight/union
 * assertions below mean anything. */
function stubRect(el: Element, rect: { top: number; left: number; width: number; height: number }) {
  el.getBoundingClientRect = () =>
    ({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.left + rect.width,
      bottom: rect.top + rect.height,
      x: rect.left,
      y: rect.top,
      toJSON: () => ({}),
    }) as DOMRect;
}

function baseProps() {
  return {
    stepIndex: 0,
    stepCount: 11,
    onNext: vi.fn(),
    onBack: vi.fn(),
    onSkip: vi.fn(),
    onPause: vi.fn(),
    interactionState: "none" as const,
  };
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("TourOverlay", () => {
  it("renders the step's title and body, and a 1-indexed step counter", () => {
    render(<TourOverlay {...baseProps()} step={step()} stepIndex={2} stepCount={11} />);

    expect(screen.getByText("A step")).toBeInTheDocument();
    expect(screen.getByText("Some body copy.")).toBeInTheDocument();
    expect(screen.getByText("3 / 11")).toBeInTheDocument();
  });

  it("calls onNext when the Next button is clicked", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step()} />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("labels the Next button 'Done' on the last step", () => {
    render(<TourOverlay {...baseProps()} step={step()} stepIndex={10} stepCount={11} />);
    expect(screen.getByRole("button", { name: "Done" })).toBeInTheDocument();
  });

  it("calls onSkip when Skip tour is clicked", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step()} />);

    fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(props.onSkip).toHaveBeenCalledTimes(1);
  });

  it("Escape pauses rather than permanently dismissing", () => {
    // Punch list #11: Escape used to write the permanent dismiss flag with no
    // confirmation and no undo. Users press it reflexively at the popover,
    // meaning "close this", not "never show me this again".
    const props = baseProps();
    render(<TourOverlay {...props} step={step()} />);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(props.onPause).toHaveBeenCalledTimes(1);
    expect(props.onSkip).not.toHaveBeenCalled();
  });

  it("offers a Back control on every step after the first, and none on the first", () => {
    // Punch list #18: 21 steps with no way back at all.
    const props = baseProps();
    const { rerender } = render(<TourOverlay {...props} step={step()} stepIndex={0} />);
    expect(screen.queryByRole("button", { name: "Back" })).not.toBeInTheDocument();

    rerender(<TourOverlay {...props} step={step({ id: "step-2" })} stepIndex={1} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(props.onBack).toHaveBeenCalledTimes(1);
  });

  it("calls onNext on Enter when a Next button is showing", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step()} />);

    fireEvent.keyDown(window, { key: "Enter" });
    expect(props.onNext).toHaveBeenCalledTimes(1);
  });

  it("omits the Next button entirely while a step is waiting on its gesture", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step({ waitFor: () => false })} interactionState="waiting" />);

    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.getByText(/try it to continue/i)).toBeInTheDocument();

    // Enter must not silently advance a waiting step either — only the real
    // gesture (observed by the controller, not this component) does.
    fireEvent.keyDown(window, { key: "Enter" });
    expect(props.onNext).not.toHaveBeenCalled();
  });

  it("shows encouragement copy once a waiting step's gesture is satisfied", () => {
    render(<TourOverlay {...baseProps()} step={step({ waitFor: () => true })} interactionState="satisfied" />);
    expect(screen.getByText(/continuing/i)).toBeInTheDocument();
  });

  it("shows a normal Next button for a gesture step that was already satisfied on entry", () => {
    // Punch list #10: on a resumed run the teaching steps auto-advanced after
    // a dwell with no user action at all, so the exact moments the chapter
    // exists to teach vanished without explanation. The controller now passes
    // "none" for those, which must render a real Next button.
    render(<TourOverlay {...baseProps()} step={step({ waitFor: () => true })} interactionState="none" />);
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.queryByText(/try it to continue/i)).not.toBeInTheDocument();
  });

  it("Skip tour remains available even on an interactive step — never traps the user", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step({ waitFor: () => false })} interactionState="waiting" />);

    fireEvent.click(screen.getByRole("button", { name: "Skip tour" }));
    expect(props.onSkip).toHaveBeenCalledTimes(1);
  });

  it("renders an inert full-screen backdrop for a non-interactive, untargeted step", () => {
    const props = baseProps();
    render(<TourOverlay {...props} step={step()} />);

    const dialog = screen.getByRole("dialog");
    const backdrop = dialog.querySelector(".bg-black\\/50");
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(props.onNext).not.toHaveBeenCalled();
    expect(props.onSkip).not.toHaveBeenCalled();
  });

  it("renders a spotlight ring around a real, modestly-sized target", () => {
    document.body.innerHTML = '<div data-tour="validate">Validate</div>';
    stubRect(document.querySelector('[data-tour="validate"]')!, { top: 10, left: 900, width: 32, height: 32 });

    render(<TourOverlay {...baseProps()} step={step({ target: "validate" })} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.querySelector(".ring-2")).not.toBeNull();
    expect(dialog.getAttribute("data-tour-ambient")).toBeNull();
  });

  it("spotlights `spotlightAlso` surfaces together with the target, as one hole", () => {
    // Punch list #2: the violations dropdown rendered under the tour's own
    // dimming backdrop on the step telling the learner to read it.
    document.body.innerHTML =
      '<div data-tour="validate">Validate</div><div data-tour="validation-details">Explanations</div>';
    stubRect(document.querySelector('[data-tour="validate"]')!, { top: 10, left: 900, width: 32, height: 32 });
    stubRect(document.querySelector('[data-tour="validation-details"]')!, {
      top: 50,
      left: 600,
      width: 384,
      height: 300,
    });

    render(
      <TourOverlay {...baseProps()} step={step({ target: "validate", spotlightAlso: ["validation-details"] })} />,
    );

    const ring = screen.getByRole("dialog").querySelector<HTMLElement>(".ring-2")!;
    // Union of both rects, plus the 8px spotlight padding: top 10 -> 2,
    // left 600 -> 592, right max(932, 984) -> 992, bottom 350 -> 358.
    expect(ring.style.top).toBe("2px");
    expect(ring.style.left).toBe("592px");
    expect(ring.style.width).toBe("400px");
    expect(ring.style.height).toBe("356px");
  });

  it("renders a target too broad to spotlight ambiently — no dimming, no ring, nothing blocked", () => {
    // Punch list #4/#20: the canvas is 70%+ of the viewport, so ringing it
    // carried no information while making the popover unplaceable.
    document.body.innerHTML = '<div data-tour="canvas">Canvas</div>';
    stubRect(document.querySelector('[data-tour="canvas"]')!, { top: 50, left: 200, width: 800, height: 700 });

    render(<TourOverlay {...baseProps()} step={step({ target: "canvas" })} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("data-tour-ambient")).toBe("true");
    expect(dialog.querySelector(".bg-black\\/50")).toBeNull();
    expect(dialog.querySelector(".ring-2")).toBeNull();
  });

  it("draws only the popoverAnchor ring when the primary target is rendered ambiently", () => {
    // Punch list #22: undo-redo drew two rings at once (the canvas hole plus
    // the decorative header ring) with nothing saying which was actionable.
    document.body.innerHTML = '<div data-tour="canvas">Canvas</div><div data-tour="undo-redo">Undo</div>';
    stubRect(document.querySelector('[data-tour="canvas"]')!, { top: 50, left: 200, width: 800, height: 700 });
    stubRect(document.querySelector('[data-tour="undo-redo"]')!, { top: 10, left: 820, width: 70, height: 32 });

    render(<TourOverlay {...baseProps()} step={step({ target: "canvas", popoverAnchor: "undo-redo" })} />);

    expect(screen.getByRole("dialog").querySelectorAll(".ring-2")).toHaveLength(1);
  });

  it("docks the card instead of centering it when a declared target has left the DOM", () => {
    // The step targets the picker, but the picker is gone — the card must
    // not park itself in the middle of the live canvas.
    render(<TourOverlay {...baseProps()} step={step({ target: "component-picker", placement: "right" })} />);

    const card = screen.getByRole("dialog").querySelector<HTMLElement>(".w-80")!;
    // jsdom measures the card as 0x0, so the dock lands at the margin from
    // the bottom-right corner — the point is that it's a corner, not the
    // centre of a 1024x768 viewport.
    expect(card.style.left).toBe(`${1024 - 16}px`);
    expect(card.style.top).toBe(`${768 - 16}px`);
  });

  it("anchors the card to a popoverAnchor that appears mid-step, rather than staying docked over it", () => {
    document.body.innerHTML = '<div data-tour="canvas">Canvas</div><div data-tour="edge-inspector">Edge kind</div>';
    stubRect(document.querySelector('[data-tour="canvas"]')!, { top: 50, left: 200, width: 800, height: 700 });
    stubRect(document.querySelector('[data-tour="edge-inspector"]')!, { top: 640, left: 780, width: 220, height: 90 });

    render(
      <TourOverlay
        {...baseProps()}
        step={step({ target: "canvas", popoverAnchor: "edge-inspector", placement: "top" })}
      />,
    );

    // One ring, on the inspector — and the card sits clear of it rather than
    // docked on top of the edge-kind select.
    const ring = screen.getByRole("dialog").querySelector<HTMLElement>(".ring-2")!;
    expect(ring.style.top).toBe("632px");
    expect(ring.style.left).toBe("772px");
  });

  it("moves focus into the dialog when a step opens", () => {
    // Punch list #15: activeElement stayed on BODY, one Tab away from the
    // header the overlay was supposedly blocking.
    render(<TourOverlay {...baseProps()} step={step()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it("traps Tab inside the dialog on a blocking step, and claims aria-modal only there", () => {
    render(<TourOverlay {...baseProps()} step={step()} />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");

    const next = screen.getByRole("button", { name: "Next" });
    next.focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    window.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Skip tour" }));
  });

  it("does not trap focus on a step waiting for a real gesture, and does not claim to be modal", () => {
    // Trapping here would lock a keyboard user out of the very control the
    // step is asking them to use.
    render(<TourOverlay {...baseProps()} step={step({ waitFor: () => false })} interactionState="waiting" />);

    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("false");

    screen.getByRole("button", { name: "Skip tour" }).focus();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it("announces the gesture status change to screen readers", () => {
    // Punch list #16: no live region anywhere, so the "try it to continue"
    // state was invisible to a screen-reader user.
    render(<TourOverlay {...baseProps()} step={step({ waitFor: () => false })} interactionState="waiting" />);
    expect(screen.getByRole("status")).toHaveTextContent(/try it to continue/i);
  });
});

describe("spotlightHole", () => {
  const viewport = { width: 1366, height: 768 };

  it("pads a normal target out on every side", () => {
    expect(spotlightHole({ top: 100, left: 200, width: 40, height: 40 }, viewport)).toEqual({
      top: 92,
      left: 192,
      width: 56,
      height: 56,
    });
  });

  it("keeps a full-height sidebar's ring inside the viewport on all four edges", () => {
    // Measured live at 1366x768 once chapter 0.1's copy grew: the lesson
    // sidebar's padded hole was {top: 76, left: -8, width: 335, height: 700},
    // so its left edge sat off-screen and its bottom edge 8px below the
    // fold. The learner saw one vertical line down the middle of the screen
    // and nothing that read as a highlight.
    const sidebar = { top: 84, left: 0, width: 319, height: 684 };
    const hole = spotlightHole(sidebar, viewport)!;

    expect(hole.left).toBeGreaterThan(0);
    expect(hole.top).toBeGreaterThan(0);
    expect(hole.left + hole.width).toBeLessThan(viewport.width);
    expect(hole.top + hole.height).toBeLessThan(viewport.height);
  });

  it("leaves the hole unclamped before the first viewport measurement", () => {
    // Clamping against a zero viewport would collapse every hole to nothing.
    expect(spotlightHole({ top: 100, left: 200, width: 40, height: 40 }, { width: 0, height: 0 })).toEqual({
      top: 92,
      left: 192,
      width: 56,
      height: 56,
    });
  });

  it("passes a missing rect straight through", () => {
    expect(spotlightHole(null, viewport)).toBeNull();
  });
});

describe("computePopoverPosition", () => {
  const popover = { width: 320, height: 190 };
  const viewport = { width: 1440, height: 900 };

  it("centers the card when there's no anchor at all", () => {
    expect(computePopoverPosition(null, "bottom", popover, viewport)).toEqual({ top: 355, left: 560 });
  });

  it("docks — never centers — when a declared target simply isn't on screen right now", () => {
    // Reported live on the picker step: choosing a component arms
    // click-to-place and closes the picker, so the step's own target
    // vanished and the card recentred onto the canvas the learner then had
    // to click, parking itself exactly in the way.
    const pos = computePopoverPosition(null, "right", popover, viewport, "dock");
    expect(pos).toEqual({ top: 900 - 190 - 16, left: 1440 - 320 - 16 });
  });

  it("places the card just clear of a normal anchor on the requested side", () => {
    const anchor = { top: 60, left: 600, width: 40, height: 40 };
    expect(computePopoverPosition(anchor, "bottom", popover, viewport)).toEqual({ top: 112, left: 600 });
  });

  it("falls back to another side when the requested one has no room", () => {
    const anchor = { top: 8, left: 600, width: 40, height: 40 };
    // No room above (8px), so it flips below the anchor.
    expect(computePopoverPosition(anchor, "top", popover, viewport).top).toBe(60);
  });

  it("docks a broad anchor's card into the corner instead of running off-screen", () => {
    // The exact regression from punch list #4: a canvas hole of 1116x842
    // inside 1440x900 left no side with room, and the old "most space"
    // fallback deliberately didn't clamp, landing the card at x = -16.
    const canvas = { top: 50, left: 170, width: 1116, height: 842 };
    const pos = computePopoverPosition(canvas, "bottom", popover, viewport);

    expect(pos.left).toBe(1440 - 320 - 16);
    expect(pos.top).toBe(900 - 190 - 16);
  });

  it("never positions the card off-screen, at any viewport size tested in the walkthrough", () => {
    // Punch list #4/#5/#6: identical x = -16 was measured at every size from
    // 1280x720 to 2560x1440, and a mid-tour resize didn't recover.
    const sizes = [
      { width: 1024, height: 640 },
      { width: 1280, height: 720 },
      { width: 1366, height: 768 },
      { width: 1440, height: 900 },
      { width: 1680, height: 1050 },
      { width: 1920, height: 1080 },
      { width: 2560, height: 1440 },
    ];
    for (const size of sizes) {
      // A canvas-shaped target: most of the viewport, offset by a sidebar.
      const canvas = { top: 50, left: 0.22 * size.width, width: 0.78 * size.width, height: 0.93 * size.height };
      for (const placement of ["top", "bottom", "left", "right"] as const) {
        const pos = computePopoverPosition(canvas, placement, popover, size);
        expect(pos.left, `left at ${size.width}x${size.height} ${placement}`).toBeGreaterThanOrEqual(0);
        expect(pos.top, `top at ${size.width}x${size.height} ${placement}`).toBeGreaterThanOrEqual(0);
        expect(pos.left + popover.width).toBeLessThanOrEqual(size.width);
        expect(pos.top + popover.height).toBeLessThanOrEqual(size.height);
      }
    }
  });

  it("keeps a card on-screen even when the popover is nearly as tall as the viewport", () => {
    const anchor = { top: 300, left: 40, width: 40, height: 40 };
    const tall = { width: 320, height: 700 };
    const small = { width: 900, height: 720 };
    const pos = computePopoverPosition(anchor, "left", tall, small);

    expect(pos.left).toBeGreaterThanOrEqual(0);
    expect(pos.top).toBeGreaterThanOrEqual(0);
  });
});
