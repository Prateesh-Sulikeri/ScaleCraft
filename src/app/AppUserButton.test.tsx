import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { useAuth } from "@clerk/nextjs";
import { AppUserButton } from "./AppUserButton";

vi.mock("next/navigation", () => ({
  usePathname: () => "/real-world-extraction/1-1-slug/lesson",
}));

describe("AppUserButton", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("renders the UserButton when signed in", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: true } as ReturnType<typeof useAuth>);
    render(<AppUserButton />);
    expect(screen.queryByLabelText("Sign in")).not.toBeInTheDocument();
  });

  it("renders a Sign in affordance carrying the current path when signed out", () => {
    vi.mocked(useAuth).mockReturnValue({ isSignedIn: false } as ReturnType<typeof useAuth>);
    render(<AppUserButton />);
    const link = screen.getByLabelText("Sign in");
    expect(link).toHaveAttribute(
      "href",
      "/sign-in?redirect_url=%2Freal-world-extraction%2F1-1-slug%2Flesson",
    );
  });
});
