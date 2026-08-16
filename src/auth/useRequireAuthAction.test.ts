import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { ReactElement } from "react";
import { useAuth, useClerk } from "@clerk/nextjs";
import { useRequireAuthAction } from "./useRequireAuthAction";

vi.mock("next/navigation", () => ({
  usePathname: () => "/building-blocks/1-2-load-balancing/lesson",
}));

describe("useRequireAuthAction", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
    vi.mocked(useClerk).mockReset();
  });

  it("runs the action directly and shows no dialog when signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true } as ReturnType<typeof useAuth>);
    const redirectToSignIn = vi.fn();
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

    const { result } = renderHook(() => useRequireAuthAction());
    const action = vi.fn();
    act(() => result.current.requireAuth(action));

    expect(action).toHaveBeenCalledOnce();
    expect(redirectToSignIn).not.toHaveBeenCalled();
    expect(result.current.dialog).toBeNull();
  });

  it("opens a confirm dialog instead of redirecting immediately when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    const redirectToSignIn = vi.fn();
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

    const { result } = renderHook(() => useRequireAuthAction());
    const action = vi.fn();
    act(() => result.current.requireAuth(action));

    expect(action).not.toHaveBeenCalled();
    expect(redirectToSignIn).not.toHaveBeenCalled();
    expect(result.current.dialog).not.toBeNull();
  });

  it("redirects to sign-in with the current path only once the dialog is confirmed", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    const redirectToSignIn = vi.fn();
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

    const { result } = renderHook(() => useRequireAuthAction());
    act(() => result.current.requireAuth(vi.fn()));
    const dialog = result.current.dialog as ReactElement<{ onConfirm: () => void }>;
    act(() => dialog.props.onConfirm());

    expect(redirectToSignIn).toHaveBeenCalledWith({ redirectUrl: "/building-blocks/1-2-load-balancing/lesson" });
    expect(result.current.dialog).toBeNull();
  });

  it("dismisses the dialog and never redirects on cancel", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    const redirectToSignIn = vi.fn();
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

    const { result } = renderHook(() => useRequireAuthAction());
    act(() => result.current.requireAuth(vi.fn()));
    const dialog = result.current.dialog as ReactElement<{ onCancel: () => void }>;
    act(() => dialog.props.onCancel());

    expect(redirectToSignIn).not.toHaveBeenCalled();
    expect(result.current.dialog).toBeNull();
  });
});
