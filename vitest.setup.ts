import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Unit tests render components in isolation, outside a real ClerkProvider -
// UserButton (unlike next-themes' useTheme) throws without one, so it needs
// a stand-in rather than the real component.
//
// useAuth/useClerk/Show default to "signed in" - the assumption every test
// made before release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) made most
// routes public, when the whole app sat behind auth.protect(). Tests that
// exercise the signed-out path override these per-case via
// vi.mocked(useAuth).mockReturnValue(...).
const mockUseAuth = vi.fn(() => ({ isSignedIn: true }));

vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
  UserButton: () => null,
  SignInButton: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SignUpButton: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SignIn: () => null,
  SignUp: () => null,
  useAuth: mockUseAuth,
  useClerk: vi.fn(() => ({ redirectToSignIn: vi.fn() })),
  // Delegates to the same mocked useAuth so a test overriding it via
  // vi.mocked(useAuth).mockReturnValue(...) also drives Show correctly,
  // instead of Show always resolving "signed-in" true independently.
  Show: ({
    when,
    children,
    fallback,
  }: {
    when: string;
    children?: React.ReactNode;
    fallback?: React.ReactNode;
  }) => {
    const { isSignedIn } = mockUseAuth();
    if (when === "signed-in") return isSignedIn ? (children ?? null) : (fallback ?? null);
    return fallback ?? null;
  },
}));
