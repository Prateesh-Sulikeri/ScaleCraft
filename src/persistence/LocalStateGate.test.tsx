import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { LocalStateGate } from "./LocalStateGate";
import { registerCurrentUserId } from "./db";

vi.mock("./db", () => ({
  registerCurrentUserId: vi.fn(),
}));

describe("LocalStateGate", () => {
  afterEach(() => {
    vi.mocked(registerCurrentUserId).mockClear();
  });

  it("registers the userId when signed in", () => {
    render(<LocalStateGate userId="user_123" />);
    expect(registerCurrentUserId).toHaveBeenCalledWith("user_123");
  });

  // Release 6.1.0-alpha Phase 11 (pending-6.1.0-poa.md) - most routes are
  // public now, so this mounts globally (root layout) and a null userId
  // (signed out) is the normal case, not something to register.
  it("does nothing when signed out (userId is null)", () => {
    render(<LocalStateGate userId={null} />);
    expect(registerCurrentUserId).not.toHaveBeenCalled();
  });
});
