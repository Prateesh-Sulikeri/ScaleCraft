import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import WalkthroughLabPage from "./page";

describe("WalkthroughLabPage", () => {
  it("renders the walkthrough lab content", () => {
    render(<WalkthroughLabPage />);
    expect(screen.getByRole("heading", { name: "Walkthrough authoring lab" })).toBeInTheDocument();
  });
});
