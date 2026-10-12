import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { ConfigForm } from "./ConfigForm";
import { getComponent } from "@/content/components/registry";
import type { ComponentDefinition } from "@/content/components/types";

const appServerDef = getComponent("app-server")!; // number field: instances
const sqlDatabaseDef = getComponent("sql-database")!; // enum field: engine
const followerDef = getComponent("follower")!; // boolean field: readOnly

/** One field's control by its `name`: components have several of each kind. */
function field(role: "spinbutton" | "combobox", name: string): HTMLElement {
  const el = screen.getAllByRole(role).find((e) => e.getAttribute("name") === name);
  if (!el) throw new Error(`no ${role} named ${name}`);
  return el;
}

describe("ConfigForm", () => {
  it("shows a 'no configuration options' message for a component with an empty config shape", () => {
    // The client component has no config fields at all.
    const clientDef = getComponent("client")!;
    render(<ConfigForm definition={clientDef} value={{}} onChange={vi.fn()} />);
    expect(screen.getByText(/no configuration options/i)).toBeInTheDocument();
  });

  it("renders a number input for a numeric field, seeded from the current value", () => {
    render(<ConfigForm definition={appServerDef} value={{ instances: 3 }} onChange={vi.fn()} />);
    const input = field("spinbutton", "instances") as HTMLInputElement;
    expect(input).toHaveValue(3);
  });

  it("calls onChange with the parsed number after editing a numeric field", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={appServerDef} value={{ instances: 1 }} onChange={onChange} />);
    const input = field("spinbutton", "instances");
    fireEvent.change(input, { target: { value: "5" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ instances: 5 }));
    });
  });

  it("renders a select with every enum option for an enum field, seeded from the current value", () => {
    render(<ConfigForm definition={sqlDatabaseDef} value={{ engine: "mysql" }} onChange={vi.fn()} />);
    const select = field("combobox", "engine") as HTMLSelectElement;
    expect(select).toHaveValue("mysql");
    expect(screen.getByRole("option", { name: "postgres" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "mysql" })).toBeInTheDocument();
  });

  it("calls onChange with the new enum value after selecting a different option", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={sqlDatabaseDef} value={{ engine: "postgres" }} onChange={onChange} />);
    fireEvent.change(field("combobox", "engine"), { target: { value: "mysql" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ engine: "mysql" }));
    });
  });

  it("still saves edits on a node saved before newer fields existed", async () => {
    const onChange = vi.fn();
    render(<ConfigForm definition={appServerDef} value={{ instances: 1 }} onChange={onChange} />);
    fireEvent.change(field("spinbutton", "instances"), { target: { value: "3" } });

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ instances: 3, retries: 0 }));
    });
  });

  it("labels a camelCase field name with spaces inserted before each hump", () => {
    render(<ConfigForm definition={appServerDef} value={{ instances: 1 }} onChange={vi.fn()} />);
    expect(screen.getByText("Instances")).toBeInTheDocument();
  });

  it("renders a plain text input for a string field (synthetic definition)", async () => {
    // A synthetic one-field definition keeps this test independent of the
    // registry, matching the shape CreateComponentModal.tsx's custom "Text"
    // field kind produces.
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
