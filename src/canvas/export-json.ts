import type { AnyNodeType, ArchitectureEdgeType } from "./types";

/** The canvas's raw JSON export — shared by ProjectMenu's button and the
 * Ctrl/Cmd+E keyboard shortcut (see sandbox/page.tsx) so there's one
 * implementation of "what a JSON export actually is." Takes nodes/edges
 * directly rather than reaching into the store itself — the store is now a
 * per-mode instance (see store.ts's CanvasStoreProvider), so a plain
 * standalone function like this one has no store of its own to read. */
export function exportCanvasAsJson(nodes: AnyNodeType[], edges: ArchitectureEdgeType[]) {
  const blob = new Blob([JSON.stringify({ nodes, edges }, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `scalecraft-canvas-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
