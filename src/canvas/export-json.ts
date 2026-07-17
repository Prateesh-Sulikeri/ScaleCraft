import { useCanvasStore } from "./store";

/** The canvas's raw JSON export — shared by ExportMenu's button and the
 * Ctrl/Cmd+E keyboard shortcut (see sandbox/page.tsx) so there's one
 * implementation of "what a JSON export actually is." */
export function exportCanvasAsJson() {
  const { nodes, edges } = useCanvasStore.getState();
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
