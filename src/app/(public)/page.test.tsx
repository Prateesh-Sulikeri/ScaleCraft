import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import RootPage from "./page";

vi.mock("@/home/HomeDashboard", () => ({ HomeDashboard: () => <div data-testid="home-dashboard" /> }));

describe("RootPage", () => {
  it("renders the Home dashboard", () => {
    render(<RootPage />);
    expect(screen.getByTestId("home-dashboard")).toBeInTheDocument();
  });
});
