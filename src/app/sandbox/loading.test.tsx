import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import SandboxLoading from "./loading";

describe("SandboxLoading", () => {
  it("renders the pulsing logo placeholder", () => {
    const { container } = render(<SandboxLoading />);
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });
});
