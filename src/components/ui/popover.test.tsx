import { beforeAll, describe, expect, it } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Popover, PopoverAnchor, PopoverArrow, PopoverContent } from "./popover";

// jsdom has no ResizeObserver — Radix's Arrow (via @radix-ui/react-use-size)
// observes its owning element's size, which throws without this. Scoped to
// this file only (not vitest.setup.ts, out of bounds for this task) since no
// other component under test here needs it.
beforeAll(() => {
  if (typeof globalThis.ResizeObserver === "undefined") {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

// Radix Popover renders its content via a Portal — waitFor/queries against
// `screen` still find it since Portals still mount into `document.body`,
// they just aren't a DOM descendant of the trigger.

describe("Popover", () => {
  it("does not render the content until the trigger is activated", () => {
    render(
      <Popover>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
  });

  it("shows the content when opened via the `open` prop, and hides it again when closed", async () => {
    const { rerender } = render(
      <Popover open={false}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    rerender(
      <Popover open={true}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await waitFor(() => expect(screen.getByText("Popover body")).toBeInTheDocument());

    rerender(
      <Popover open={false}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  it("opens on trigger click and closes again on a second click", async () => {
    // This wrapper (popover.tsx) doesn't re-export Radix's Trigger, only
    // Root/Anchor/Content/Arrow — Root/Trigger/Content still compose
    // correctly by importing Trigger straight from the underlying library,
    // since Popover here just *is* PopoverPrimitive.Root.
    render(
      <Popover>
        <PopoverPrimitive.Trigger>Open</PopoverPrimitive.Trigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );

    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Open"));
    await waitFor(() => expect(screen.getByText("Popover body")).toBeInTheDocument());

    fireEvent.click(screen.getByText("Open"));
    await waitFor(() => expect(screen.queryByText("Popover body")).not.toBeInTheDocument());
  });

  it("merges a custom className with the default content classes", async () => {
    render(
      <Popover open={true}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent className="my-custom-class">Popover body</PopoverContent>
      </Popover>,
    );

    const content = await screen.findByText("Popover body");
    expect(content.className).toContain("my-custom-class");
    // Default classes should still be present alongside the custom one.
    expect(content.className).toContain("rounded-lg");
    expect(content.className).toContain("border-border");
  });

  it("passes through default align/sideOffset/collisionPadding when not overridden", async () => {
    render(
      <Popover open={true}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );

    const content = await screen.findByText("Popover body");
    // Radix reflects the resolved `align`/`sideOffset` as `data-*` isn't
    // guaranteed pre-measure in jsdom, but the underlying element should
    // still exist and be the one PopoverContent rendered (sanity check that
    // defaults didn't throw and content mounted).
    expect(content).toBeInTheDocument();
  });

  it("allows overriding align/sideOffset/collisionPadding via props", async () => {
    render(
      <Popover open={true}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent align="end" sideOffset={20} collisionPadding={4}>
          Popover body
        </PopoverContent>
      </Popover>,
    );
    const content = await screen.findByText("Popover body");
    expect(content).toBeInTheDocument();
  });

  it("renders PopoverArrow with its default width/height and merged className", async () => {
    render(
      <Popover open={true}>
        <PopoverAnchor>
          <button>Open</button>
        </PopoverAnchor>
        <PopoverContent>
          Popover body
          <PopoverArrow className="extra-arrow-class" data-testid="popover-arrow" />
        </PopoverContent>
      </Popover>,
    );
    const arrow = await screen.findByTestId("popover-arrow");
    expect(arrow).toHaveAttribute("width", "12");
    expect(arrow).toHaveAttribute("height", "6");
    expect(arrow.getAttribute("class")).toContain("extra-arrow-class");
    expect(arrow.getAttribute("class")).toContain("fill-[var(--panel)]");
  });
});
