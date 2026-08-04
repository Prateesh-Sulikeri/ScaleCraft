import { afterEach, describe, expect, it, vi } from "vitest";
import { requestFullscreenBestEffort, exitFullscreenIfActive } from "./exam-fullscreen";

// jsdom implements neither API — stub them directly on the element/document
// per test, and restore afterward so tests don't leak state into each other.
afterEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(document, "fullscreenElement", { value: null, configurable: true });
});

describe("requestFullscreenBestEffort", () => {
  it("resolves true when requestFullscreen succeeds and the element becomes fullscreenElement", async () => {
    const el = document.createElement("div");
    el.requestFullscreen = vi.fn().mockImplementation(() => {
      Object.defineProperty(document, "fullscreenElement", { value: el, configurable: true });
      return Promise.resolve();
    });

    expect(await requestFullscreenBestEffort(el)).toBe(true);
  });

  it("resolves false when requestFullscreen rejects (denied/unsupported)", async () => {
    const el = document.createElement("div");
    el.requestFullscreen = vi.fn().mockRejectedValue(new Error("denied"));

    expect(await requestFullscreenBestEffort(el)).toBe(false);
  });

  it("resolves false when the element has no requestFullscreen at all", async () => {
    const el = document.createElement("div");
    // @ts-expect-error jsdom doesn't implement this API
    delete el.requestFullscreen;

    expect(await requestFullscreenBestEffort(el)).toBe(false);
  });
});

describe("exitFullscreenIfActive", () => {
  it("calls exitFullscreen when the element is the current fullscreenElement", () => {
    const el = document.createElement("div");
    Object.defineProperty(document, "fullscreenElement", { value: el, configurable: true });
    const exitFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = exitFullscreen;

    exitFullscreenIfActive(el);

    expect(exitFullscreen).toHaveBeenCalledTimes(1);
  });

  it("does nothing when the element is not the current fullscreenElement", () => {
    const el = document.createElement("div");
    Object.defineProperty(document, "fullscreenElement", { value: null, configurable: true });
    const exitFullscreen = vi.fn();
    document.exitFullscreen = exitFullscreen;

    exitFullscreenIfActive(el);

    expect(exitFullscreen).not.toHaveBeenCalled();
  });

  it("swallows a rejected exitFullscreen (denied/unsupported) without throwing", async () => {
    const el = document.createElement("div");
    Object.defineProperty(document, "fullscreenElement", { value: el, configurable: true });
    const exitFullscreen = vi.fn().mockRejectedValue(new Error("denied"));
    document.exitFullscreen = exitFullscreen;

    expect(() => exitFullscreenIfActive(el)).not.toThrow();
    // Let the rejected promise's .catch() handler actually run before the test ends.
    await Promise.resolve().then().then();
  });
});
