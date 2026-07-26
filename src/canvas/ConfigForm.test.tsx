import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { ConfigForm } from "./ConfigForm";
import { getComponent } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";

const appServerDef = getComponent("app-server")!; // number field: instances
const sqlDatabaseDef = getComponent("sql-database")!; // enum field: engine
const followerDef = getComponent("follower")!; // boolean field: readOnly

describe("ConfigForm", () => {
  it("shows a 'no configuration options' message for a component with an empty config shape", () => {
    // The client component has no config fields at all.
    const clientDef = getComponent("client")!;
    render(<ConfigForm definition={clientDef} value={{}} onChange={vi.fn()} />);
    expect(screen.getByText(/no configuration options/i)).toBeInTheDocument();
  });

  it("renders a number input for a numeric field, seeded from the current value", () => {
    render(<ConfigForm definition={appServerDef} value={{ instances: 3 }} onChange={vi.fn()} />);
    const input = screen.getByRole("spinbutton") as HTMLInputElement;
    expect(input).toHaveValue(3);
  });

  it("calls onChange with the parsed number after editing a numeric field", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={appServerDef} value={{ instances: 1 }} onChange={onChange} />);
    const input = screen.getByRole("spinbutton");
    fireEvent.change(input, { target: { value: "5" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ instances: 5 }));
    });
  });

  it("renders a select with every enum option for an enum field, seeded from the current value", () => {
    render(<ConfigForm definition={sqlDatabaseDef} value={{ engine: "mysql" }} onChange={vi.fn()} />);
    const select = screen.getByRole("combobox") as HTMLSelectElement;
    expect(select).toHaveValue("mysql");
    expect(screen.getByRole("option", { name: "postgres" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "mysql" })).toBeInTheDocument();
  });

  it("calls onChange with the new enum value after selecting a different option", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={sqlDatabaseDef} value={{ engine: "postgres" }} onChange={onChange} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "mysql" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ engine: "mysql" }));
    });
  });

  it("labels a camelCase field name with spaces inserted before each hump", () => {
    render(<ConfigForm definition={appServerDef} value={{ instances: 1 }} onChange={vi.fn()} />);
    expect(screen.getByText("Instances")).toBeInTheDocument();
  });

  it("renders a plain text input for a string field (no built-in component has one, so this uses a synthetic definition)", async () => {
    // No component in the current registry declares a `kind: "string"`
    // field — that fallback branch (any ZodType that isn't
    // ZodEnum/ZodNumber/ZodBoolean) still needs coverage, so this
    // constructs a minimal definition with one directly, matching the same
    // shape CreateComponentModal.tsx's custom "Text" field kind produces.
    const stringFieldDef: ComponentDefinition = {
      id: "synthetic-string-field",
      category: "networking",
      label: "Synthetic",
      icon: "server",
      inputs: [],
      outputs: [],
      configSchema: z.object({ region: z.string() }),
      defaultConfig: { region: "us-east-1" },
      summary: "test fixture",
      docs: "test fixture",
    };
    const onChange = vi.fn();
    render(<ConfigForm definition={stringFieldDef} value={{ region: "us-east-1" }} onChange={onChange} />);
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveValue("us-east-1");

    fireEvent.change(input, { target: { value: "eu-west-1" } });
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ region: "eu-west-1" }));
    });
  });

  it("renders a checkbox for a boolean field, reflecting the seeded value", () => {
    render(<ConfigForm definition={followerDef} value={{ readOnly: true }} onChange={vi.fn()} />);
    expect(screen.getByRole("checkbox")).toBeChecked();
  });

  it("calls onChange with the flipped boolean after toggling the checkbox", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={followerDef} value={{ readOnly: true }} onChange={onChange} />);
    fireEvent.click(screen.getByRole("checkbox"));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ readOnly: false }));
    });
  });
});
