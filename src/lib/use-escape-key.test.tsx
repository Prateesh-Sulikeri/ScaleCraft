import { describe, it, expect, vi } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { useEscapeKey } from "./use-escape-key";

function Surface({ onEscape, enabled }: { onEscape: () => void; enabled?: boolean }) {
  useEscapeKey(onEscape, enabled);
  return null;
}

const pressEscape = () => fireEvent.keyDown(window, { key: "Escape" });

describe("useEscapeKey", () => {
  it("calls the handler on Escape and ignores every other key", () => {
    const onEscape = vi.fn();
    render(<Surface onEscape={onEscape} />);

    fireEvent.keyDown(window, { key: "Enter" });
    fireEvent.keyDown(window, { key: "a" });
    expect(onEscape).not.toHaveBeenCalled();

    pressEscape();
    expect(onEscape).toHaveBeenCalledTimes(1);
  });

  it("closes only the topmost surface when dialogs are nested", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const { rerender } = render(
      <>
        <Surface onEscape={outer} />
        <Surface onEscape={inner} />
      </>,
    );

    pressEscape();
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();

    // Inner unmounts - the outer one becomes live again.
    rerender(<Surface onEscape={outer} />);
    pressEscape();
    expect(outer).toHaveBeenCalledTimes(1);
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it("keeps its place in the stack across a parent re-render", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const { rerender } = render(
      <>
        <Surface onEscape={outer} />
        <Surface onEscape={inner} />
      </>,
    );

    // Re-rendering with fresh inline callbacks must not re-order the stack -
    // the outer surface re-registering above the inner one would send Escape
    // to the wrong dialog.
    rerender(
      <>
        <Surface onEscape={() => outer()} />
        <Surface onEscape={() => inner()} />
      </>,
    );

    pressEscape();
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });

  it("swallows the press while disabled rather than letting it fall through", () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <>
        <Surface onEscape={outer} />
        <Surface onEscape={inner} enabled={false} />
      </>,
    );

    pressEscape();
    expect(inner).not.toHaveBeenCalled();
    // The disabled surface still occupies the top slot - a dialog that
    // declines to close must not hand Escape to whatever is behind it.
    expect(outer).not.toHaveBeenCalled();
  });

  it("uses the latest callback without re-registering", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { rerender } = render(<Surface onEscape={first} />);

    rerender(<Surface onEscape={second} />);
    pressEscape();

    expect(second).toHaveBeenCalledTimes(1);
    expect(first).not.toHaveBeenCalled();
  });

  it("detaches the window listener once every surface has unmounted", () => {
    const onEscape = vi.fn();
    const { unmount } = render(<Surface onEscape={onEscape} />);
    unmount();

    pressEscape();
    expect(onEscape).not.toHaveBeenCalled();
  });
});
