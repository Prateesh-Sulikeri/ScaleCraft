import type { MouseEvent as ReactMouseEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useResizableWidth } from "./use-resizable-width";

function mouseDownEvent(clientX: number) {
  return { preventDefault: vi.fn(), clientX } as unknown as ReactMouseEvent;
}

describe("useResizableWidth", () => {
  it("starts at defaultWidth", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    expect(result.current.width).toBe(200);
  });

  it("calls preventDefault on mouse down", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    const event = mouseDownEvent(100);
    act(() => {
      result.current.onMouseDown(event);
    });
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it("grows the width when dragging right with grows='right'", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));
    });
    expect(result.current.width).toBe(250);
  });

  it("reverses the delta when grows='left'", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "left"));
    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));
    });
    expect(result.current.width).toBe(150);
  });

  it("clamps to the min and max bounds", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: -1000 }));
    });
    expect(result.current.width).toBe(100);

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10000 }));
    });
    expect(result.current.width).toBe(400);
  });

  it("sets col-resize cursor and disables text selection while dragging, restoring both on mouseup", () => {
    document.body.style.cursor = "default";
    document.body.style.userSelect = "auto";
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));

    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    expect(document.body.style.cursor).toBe("col-resize");
    expect(document.body.style.userSelect).toBe("none");

    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(document.body.style.cursor).toBe("default");
    expect(document.body.style.userSelect).toBe("auto");
  });

  it("calls onCommit exactly once with the final width on mouseup", () => {
    const onCommit = vi.fn();
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right", onCommit));

    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    expect(onCommit).toHaveBeenCalledTimes(1);
    expect(onCommit).toHaveBeenCalledWith(250);
  });

  it("does not throw when onCommit is omitted", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    expect(() => {
      act(() => {
        window.dispatchEvent(new MouseEvent("mouseup"));
      });
    }).not.toThrow();
  });

  it("ignores mousemove after mouseup has ended the drag", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));
    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));
    });
    expect(result.current.width).toBe(200);
  });

  it("starting a new drag uses the current (possibly already-resized) width as the new base", () => {
    const { result } = renderHook(() => useResizableWidth(200, 100, 400, "right"));

    act(() => {
      result.current.onMouseDown(mouseDownEvent(100));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mouseup"));
    });
    expect(result.current.width).toBe(250);

    act(() => {
      result.current.onMouseDown(mouseDownEvent(50));
    });
    act(() => {
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 70 }));
    });
    expect(result.current.width).toBe(270);
  });
});
