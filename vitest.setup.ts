import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Unit tests render components in isolation, outside a real ClerkProvider -
// UserButton (unlike next-themes' useTheme) throws without one, so it needs
// a stand-in rather than the real component.
vi.mock("@clerk/nextjs", () => ({
  ClerkProvider: ({ children }: { children?: React.ReactNode }) => children ?? null,
  UserButton: () => null,
  SignInButton: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SignUpButton: ({ children }: { children?: React.ReactNode }) => children ?? null,
  SignIn: () => null,
  SignUp: () => null,
}));
