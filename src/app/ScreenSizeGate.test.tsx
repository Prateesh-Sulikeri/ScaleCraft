import { describe, it, expect, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScreenSizeGate } from "./ScreenSizeGate";

function mockViewport({
  width,
  screenWidth = width,
  screenHeight = width,
  coarsePointer = false,
}: {
  width: number;
  screenWidth?: number;
  screenHeight?: number;
  coarsePointer?: boolean;
}) {
  Object.defineProperty(window, "innerWidth", { value: width, configurable: true });
  Object.defineProperty(window.screen, "width", { value: screenWidth, configurable: true });
  Object.defineProperty(window.screen, "height", { value: screenHeight, configurable: true });
  window.matchMedia = (query: string) =>
    ({
      matches: query === "(pointer: coarse)" ? coarsePointer : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}

describe("ScreenSizeGate", () => {
  afterEach(() => {
    Object.defineProperty(window, "innerWidth", { value: 1024, configurable: true });
  });

  it("renders children through on a desktop-sized, mouse-primary viewport", () => {
    mockViewport({ width: 1280, coarsePointer: false });
    render(
      <ScreenSizeGate>
        <p>the real app</p>
      </ScreenSizeGate>,
    );
    expect(screen.getByText("the real app")).toBeInTheDocument();
  });

  it("blocks with the desktop-required message on a narrow mouse-primary window", () => {
    mockViewport({ width: 800, coarsePointer: false });
    render(
      <ScreenSizeGate>
        <p>the real app</p>
      </ScreenSizeGate>,
    );
    expect(screen.queryByText("the real app")).not.toBeInTheDocument();
    expect(screen.getByText("ScaleCraft needs a larger screen")).toBeInTheDocument();
    expect(screen.getByText(/current width: 800px/)).toBeInTheDocument();
    expect(screen.getByText(/minimum: 1024px/)).toBeInTheDocument();
  });

  it("blocks a touch-primary (coarse pointer) device below the tablet minimum", () => {
    mockViewport({ width: 700, screenWidth: 700, screenHeight: 1200, coarsePointer: true });
    render(
      <ScreenSizeGate>
        <p>the real app</p>
      </ScreenSizeGate>,
    );
    expect(screen.getByText("ScaleCraft needs a larger screen")).toBeInTheDocument();
    expect(screen.getByText(/minimum: 768px/)).toBeInTheDocument();
  });

  it("allows a tablet-sized, touch-primary device at/above the tablet minimum", () => {
    mockViewport({ width: 820, screenWidth: 820, screenHeight: 1180, coarsePointer: true });
    render(
      <ScreenSizeGate>
        <p>the real app</p>
      </ScreenSizeGate>,
    );
    expect(screen.getByText("the real app")).toBeInTheDocument();
  });
});
