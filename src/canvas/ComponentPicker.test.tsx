import "fake-indexeddb/auto";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { ComponentPicker } from "./ComponentPicker";
import { renderWithCanvasStore } from "./canvas-test-utils";
import { useCustomComponentsStore } from "./custom-components-store";

// ComponentPicker reads/writes the global custom-components store (shared
// across every mode, unlike the per-instance canvas store — see
// custom-components-store.ts) and persists through src/persistence/db.ts's
// IndexedDB-backed table; fake-indexeddb gives that a working backend inside
// jsdom the same way src/persistence/db.test.ts already does.
beforeAll(() => {
  // jsdom doesn't implement scrollIntoView at all — needed by the picker's
  // keyboard-nav effect, which scrolls the active tile into view every time
  // activeIndex changes.
  Element.prototype.scrollIntoView = () => {};
});

beforeEach(() => {
  useCustomComponentsStore.getState().loadCustomComponents([]);
});

afterEach(() => {
  useCustomComponentsStore.getState().loadCustomComponents([]);
});

function openPicker() {
  const utils = renderWithCanvasStore(<ComponentPicker />);
  act(() => utils.api.getState().openComponentPicker());
  return utils;
}

describe("ComponentPicker", () => {
  it("renders nothing when closed", () => {
    const { container } = renderWithCanvasStore(<ComponentPicker />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it("renders the dialog with a search input and the Decoration tools when open", () => {
    openPicker();
    expect(screen.getByRole("dialog", { name: "Add a component" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search components or categories...")).toBeInTheDocument();
    expect(screen.getByText("Add zone")).toBeInTheDocument();
    expect(screen.getByText("Add comment")).toBeInTheDocument();
    expect(screen.getByText("Add flag")).toBeInTheDocument();
    expect(screen.getByText("New component")).toBeInTheDocument();
  });

  it("shows built-in components grouped by category", () => {
    openPicker();
    // "Networking" appears twice: once in the category-jump rail, once as
    // the results section header — both are expected.
    expect(screen.getAllByText("Networking").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Client")).toBeInTheDocument();
  });

  it("typing in the search box filters to matching components only", () => {
    openPicker();
    fireEvent.change(screen.getByPlaceholderText("Search components or categories..."), { target: { value: "sql" } });
    expect(screen.getByText("SQL Database")).toBeInTheDocument();
    expect(screen.queryByText("Client")).not.toBeInTheDocument();
  });

  it("shows the no-match message for a query with no results", () => {
    openPicker();
    fireEvent.change(screen.getByPlaceholderText("Search components or categories..."), { target: { value: "zzzznotreal" } });
    expect(screen.getByText(/No components match/)).toBeInTheDocument();
  });

  it("filters the Decoration tools by query too (label or description match)", () => {
    openPicker();
    fireEvent.change(screen.getByPlaceholderText("Search components or categories..."), { target: { value: "flag" } });
    expect(screen.getByText("Add flag")).toBeInTheDocument();
    expect(screen.queryByText("Add zone")).not.toBeInTheDocument();
  });

  it("clicking a component tile arms pending placement and closes the picker", () => {
    const { api } = openPicker();
    fireEvent.click(screen.getByText("Client"));
    expect(api.getState().componentPicker).toBe(false);
    expect(api.getState().pendingComponentPlacement?.id).toBe("client");
  });

  it("clicking 'Add zone' arms zone placement mode and closes the picker", () => {
    const { api } = openPicker();
    fireEvent.click(screen.getByText("Add zone"));
    expect(api.getState().componentPicker).toBe(false);
    expect(api.getState().placementMode).toBe("zone");
  });

  it("clicking 'Add comment' arms comment placement mode", () => {
    const { api } = openPicker();
    fireEvent.click(screen.getByText("Add comment"));
    expect(api.getState().placementMode).toBe("comment");
  });

  it("clicking 'Add flag' arms start placement mode", () => {
    const { api } = openPicker();
    fireEvent.click(screen.getByText("Add flag"));
    expect(api.getState().placementMode).toBe("start");
  });

  it("pressing Escape closes the picker", () => {
    const { api } = openPicker();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(api.getState().componentPicker).toBe(false);
  });

  it("clicking the backdrop closes the picker", () => {
    const { api } = openPicker();
    const backdrop = document.body.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    expect(api.getState().componentPicker).toBe(false);
  });

  it("prevents the default context menu on the backdrop", () => {
    openPicker();
    const backdrop = document.body.querySelector(".fixed.inset-0") as HTMLElement;
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    const preventSpy = vi.spyOn(event, "preventDefault");
    backdrop.dispatchEvent(event);
    expect(preventSpy).toHaveBeenCalled();
  });

  it("restores focus to whatever was focused before the picker opened, on close", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();
    expect(document.activeElement).toBe(trigger);

    openPicker();
    fireEvent.keyDown(window, { key: "Escape" });

    expect(document.activeElement).toBe(trigger);
    document.body.removeChild(trigger);
  });

  it("ArrowDown moves the active tile forward through the flat nav array", () => {
    openPicker();
    // First item overall is the first Decoration tool ("Add zone").
    expect(screen.getByText("Add zone").closest('[role="option"]')).toHaveAttribute("aria-selected", "true");
    fireEvent.keyDown(window, { key: "ArrowDown" });
    expect(screen.getByText("Add comment").closest('[role="option"]')).toHaveAttribute("aria-selected", "true");
  });

  it("Home jumps to the first tile, End jumps to the last", () => {
    openPicker();
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "Home" });
    expect(screen.getByText("Add zone").closest('[role="option"]')).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(window, { key: "End" });
    expect(screen.getByText("Add zone").closest('[role="option"]')).toHaveAttribute("aria-selected", "false");
  });

  it("Enter activates the current tile (placing a component)", () => {
    const { api } = openPicker();
    // Navigate from Decoration (4 tools) down to the first real component.
    for (let i = 0; i < 4; i++) fireEvent.keyDown(window, { key: "ArrowDown" });
    fireEvent.keyDown(window, { key: "Enter" });
    expect(api.getState().pendingComponentPlacement).toBeTruthy();
  });

  it("clicking 'New component' opens the create-component modal", () => {
    openPicker();
    fireEvent.click(screen.getByText("New component"));
    expect(screen.getByText("New component", { selector: "h2" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Rate Limiter")).toBeInTheDocument();
  });

  it("saving a new custom component adds it to the registry list and closes both the modal and the picker", async () => {
    // "New component" closes the picker's own dialog first (see
    // handleToolSelect in ComponentPicker.tsx — `close()` runs before
    // `setModal`), so only the create-component modal is left on screen;
    // saving closes that too, leaving nothing rendered until the picker is
    // reopened.
    const { api } = openPicker();
    fireEvent.click(screen.getByText("New component"));
    expect(api.getState().componentPicker).toBe(false);

    fireEvent.change(screen.getByPlaceholderText("e.g. Rate Limiter"), { target: { value: "Rate Limiter" } });
    fireEvent.click(screen.getByText("Create component"));

    await waitFor(() => {
      expect(useCustomComponentsStore.getState().customComponents.some((c) => c.label === "Rate Limiter")).toBe(
        true,
      );
    });
    expect(screen.queryByPlaceholderText("e.g. Rate Limiter")).not.toBeInTheDocument();

    // Reopening the picker now shows the newly created component as a tile.
    act(() => api.getState().openComponentPicker());
    expect(screen.getByText("Rate Limiter")).toBeInTheDocument();
  });

  it("shows edit/delete controls only for custom components, not built-ins", () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    openPicker();
    expect(screen.getByLabelText("Edit My Custom")).toBeInTheDocument();
    expect(screen.queryByLabelText("Edit Client")).not.toBeInTheDocument();
  });

  it("clicking Edit on a custom component opens the modal prefilled, in edit mode", () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    openPicker();
    fireEvent.click(screen.getByLabelText("Edit My Custom"));
    expect(screen.getByText("Edit component")).toBeInTheDocument();
    expect(screen.getByDisplayValue("My Custom")).toBeInTheDocument();
  });

  it("deleting an unused custom component shows a confirm dialog, and confirming removes it", async () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    openPicker();
    fireEvent.click(screen.getByLabelText("Delete My Custom"));
    expect(
      screen.getByText((_, el) => el?.tagName === "P" && /Delete.*My Custom.*undone/.test(el.textContent ?? "")),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    await waitFor(() => {
      expect(useCustomComponentsStore.getState().customComponents).toHaveLength(0);
    });
  });

  it("Cancel on the delete-confirm popover dismisses it without deleting", () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    openPicker();
    fireEvent.click(screen.getByLabelText("Delete My Custom"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument();
    expect(useCustomComponentsStore.getState().customComponents).toHaveLength(1);
  });

  it("OK on the usage-blocked popover dismisses it without deleting", () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    const utils = renderWithCanvasStore(<ComponentPicker />);
    const { api } = utils;
    act(() => {
      api.getState().loadCanvasState(
        [{ id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "custom-1", config: {} } }],
        [],
      );
      api.getState().openComponentPicker();
    });
    fireEvent.click(screen.getByLabelText("Delete My Custom"));
    fireEvent.click(screen.getByRole("button", { name: "OK" }));
    expect(screen.queryByRole("button", { name: "OK" })).not.toBeInTheDocument();
    expect(useCustomComponentsStore.getState().customComponents).toHaveLength(1);
  });

  it("deleting a custom component that's in use on the canvas shows a blocking message instead", () => {
    act(() => {
      useCustomComponentsStore.getState().upsertCustomComponent({
        id: "custom-1",
        category: "networking",
        label: "My Custom",
        icon: "server",
        summary: "s",
        docs: "d",
        hasInput: true,
        hasOutput: true,
        fields: [],
      });
    });
    // loadCanvasState resets componentPicker to false (see store.tsx) — it
    // has to run BEFORE the picker opens, or seeding the canvas would close
    // the very dialog this test is about to interact with.
    const utils = renderWithCanvasStore(<ComponentPicker />);
    const { api } = utils;
    act(() => {
      api.getState().loadCanvasState(
        [{ id: "n1", type: "component", position: { x: 0, y: 0 }, data: { componentId: "custom-1", config: {} } }],
        [],
      );
      api.getState().openComponentPicker();
    });

    fireEvent.click(screen.getByLabelText("Delete My Custom"));
    expect(screen.getByText(/used by 1 node/i)).toBeInTheDocument();
    expect(useCustomComponentsStore.getState().customComponents).toHaveLength(1);
  });

  it("respects availableComponentIds (chapter-mode restriction) by hiding out-of-scope components", () => {
    const { api } = openPicker();
    act(() => api.getState().setAvailableComponentIds(["client"]));
    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.queryByText("Application Server")).not.toBeInTheDocument();
  });
});
