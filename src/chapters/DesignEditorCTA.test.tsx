import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/HeldTransitionLink", () => ({
  HeldTransitionLink: ({
    children,
    href,
    label,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    label: string;
    className: string;
  }) => (
    <a href={href} title={label} className={className}>
      {children}
    </a>
  ),
}));

const { DesignEditorCTA } = await import("./DesignEditorCTA");

describe("DesignEditorCTA", () => {
  it("renders 'Begin exercise' button", () => {
    render(<DesignEditorCTA mode="building-blocks" chapterSlug="test-chapter" />);
    expect(screen.getByRole("link", { name: /begin exercise/i })).toBeInTheDocument();
  });

  it("links to the canvas route for building-blocks", () => {
    render(<DesignEditorCTA mode="building-blocks" chapterSlug="test-chapter" />);
    const link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/building-blocks/test-chapter");
  });

  it("links to the canvas route for real-world-extraction", () => {
    render(<DesignEditorCTA mode="real-world-extraction" chapterSlug="my-chapter" />);
    const link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/real-world-extraction/my-chapter");
  });

  it("uses HeldTransitionLink with correct loading label", () => {
    render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    const link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("title", "Opening the Design Editor…");
  });

  it("has correct button styling", () => {
    render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    const link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveClass("inline-flex", "border", "border-border", "rounded-md", "px-4", "py-2");
  });

  it("renders arrow symbol after button text", () => {
    render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    const link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link.textContent).toContain("→");
  });

  it("renders as a task card matching QuizLauncher's row style", () => {
    const { container } = render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("rounded-lg", "border", "border-border");
  });

  it("has correct flex layout", () => {
    const { container } = render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex", "items-center", "justify-between", "gap-4");
  });

  it("works with different chapter slugs", () => {
    const { rerender } = render(<DesignEditorCTA mode="building-blocks" chapterSlug="chapter-1" />);
    let link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/building-blocks/chapter-1");

    rerender(<DesignEditorCTA mode="building-blocks" chapterSlug="chapter-2" />);
    link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/building-blocks/chapter-2");
  });

  it("works with different modes", () => {
    const { rerender } = render(<DesignEditorCTA mode="building-blocks" chapterSlug="test" />);
    let link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/building-blocks/test");

    rerender(<DesignEditorCTA mode="real-world-extraction" chapterSlug="test" />);
    link = screen.getByRole("link", { name: /begin exercise/i });
    expect(link).toHaveAttribute("href", "/real-world-extraction/test");
  });
});
