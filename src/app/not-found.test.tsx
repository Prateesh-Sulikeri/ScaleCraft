import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import NotFound from "./not-found";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back }),
}));

beforeAll(() => {
  window.matchMedia =
    window.matchMedia ||
    ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }));
});

beforeEach(() => {
  push.mockClear();
  back.mockClear();
});

describe("NotFound", () => {
  it("renders the 404 message and a Home link", () => {
    render(<NotFound />);
    expect(screen.getByText("404")).toBeInTheDocument();
    expect(screen.getByText("Route Not Found")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Return Home/ })).toHaveAttribute("href", "/");
  });

  it("navigates home when there's no history to go back to", () => {
    render(<NotFound />);
    expect(screen.getByRole("button", { name: /Go Back/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Go Back/ }));
    expect(push).toHaveBeenCalledWith("/");
    expect(back).not.toHaveBeenCalled();
  });

  it("goes back through browser history when there is history to go back to", () => {
    window.history.pushState({}, "", "/somewhere");
    render(<NotFound />);
    expect(screen.getByRole("button", { name: /Back to Previous Page/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Back to Previous Page/ }));
    expect(back).toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });
});
