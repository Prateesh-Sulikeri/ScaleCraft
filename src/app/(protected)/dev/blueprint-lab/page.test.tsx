import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { stubResizeObserver } from "@/canvas/canvas-test-utils";
import BlueprintLabPage from "./page";

vi.mock("@/canvas/Canvas", () => ({ Canvas: () => null }));

beforeAll(() => {
  stubResizeObserver();
});

describe("BlueprintLabPage", () => {
  it("renders BlueprintLabContent inside a CanvasStoreProvider", () => {
    render(<BlueprintLabPage />);
    expect(screen.getByRole("heading", { name: "Blueprint Lab" })).toBeInTheDocument();
  });
});
