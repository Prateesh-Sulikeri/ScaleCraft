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
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
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
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
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
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    const redirectToSignIn = vi.fn();
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn } as unknown as ReturnType<typeof useClerk>);

    const { result } = renderHook(() => useRequireAuthAction());
    act(() => result.current.requireAuth(vi.fn()));
    const dialog = result.current.dialog as ReactElement<{ onConfirm: () => void }>;
    act(() => dialog.props.onConfirm());

    expect(redirectToSignIn).toHaveBeenCalledWith({ redirectUrl: "/building-blocks/1-2-load-balancing/lesson" });
    expect(result.current.dialog).toBeNull();
  });

  // Regression: `isSignedIn` is undefined until Clerk loads, so branching on
  // it alone prompted a signed-in user to sign in (e2e multi-device-sync).
  it("holds a click made before Clerk loads, then runs it once signed in resolves", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: undefined } as ReturnType<
      typeof useAuth
    >);
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn: vi.fn() } as unknown as ReturnType<
      typeof useClerk
    >);

    const { result, rerender } = renderHook(() => useRequireAuthAction());
    const action = vi.fn();
    act(() => result.current.requireAuth(action));

    expect(action).not.toHaveBeenCalled();
    expect(result.current.dialog).toBeNull();

    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: true } as ReturnType<typeof useAuth>);
    act(() => rerender());

    expect(action).toHaveBeenCalledOnce();
    expect(result.current.dialog).toBeNull();
  });

  it("holds a click made before Clerk loads, then prompts once signed out resolves", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: false, isSignedIn: undefined } as ReturnType<
      typeof useAuth
    >);
    vi.mocked(useClerk).mockReturnValue({ redirectToSignIn: vi.fn() } as unknown as ReturnType<
      typeof useClerk
    >);

    const { result, rerender } = renderHook(() => useRequireAuthAction());
    const action = vi.fn();
    act(() => result.current.requireAuth(action));

    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
    act(() => rerender());

    expect(action).not.toHaveBeenCalled();
    expect(result.current.dialog).not.toBeNull();
  });

  it("dismisses the dialog and never redirects on cancel", () => {
    vi.mocked(useAuth).mockReturnValue({ isLoaded: true, isSignedIn: false } as ReturnType<typeof useAuth>);
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
