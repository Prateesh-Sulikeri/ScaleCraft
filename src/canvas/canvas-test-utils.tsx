"use client";

import type { ReactElement } from "react";
import { render as rtlRender } from "@testing-library/react";
import { CanvasStoreProvider, useCanvasStoreApi } from "./store";

/** Not exported by store.tsx — inferring it from the hook's own return type
 * keeps this file from needing a copy of the store's shape (and from ever
 * touching store.tsx, which is out of scope for this workstream — see
 * .claude/docs/pending.md I.7). */
type CanvasStoreApi = ReturnType<typeof useCanvasStoreApi>;

function ApiCapture({ onReady }: { onReady: (api: CanvasStoreApi) => void }) {
  onReady(useCanvasStoreApi());
  return null;
}

/**
 * Shared test helper for every canvas component test — most of these
 * components (AnnotationEditor, ContextMenu, NodeConfigPopover, EdgeInspector,
 * StartNode, ...) read directly from CanvasStoreProvider's per-instance
 * zustand store rather than taking that state as props, so rendering them in
 * isolation needs a real Provider plus a way to seed state into it before
 * assertions. Renders `ui` inside a fresh CanvasStoreProvider and hands back
 * the underlying store API alongside RTL's usual render result — store
 * mutations are synchronous and flow through the same subscription path a
 * real user action would, so `act(() => api.getState().someAction(...))`
 * from a test re-renders exactly like a real interaction.
 */
export function renderWithCanvasStore(ui: ReactElement) {
  let api: CanvasStoreApi | undefined;
  const utils = rtlRender(
    <CanvasStoreProvider>
      <ApiCapture onReady={(a) => (api = a)} />
      {ui}
    </CanvasStoreProvider>,
  );
  return { ...utils, api: api as CanvasStoreApi };
}

/** jsdom implements neither ResizeObserver — needed unconditionally by
 * @xyflow/react's own internal viewport measurement (so any test rendering a
 * <ReactFlow>/<ReactFlowProvider> tree, including the four custom node
 * components, needs this) and by ComponentNode's manually-resized
 * description-line clamp. Call once per test file, before the first render,
 * e.g. from a `beforeAll`. */
export function stubResizeObserver() {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  global.ResizeObserver = ResizeObserverStub;
}
