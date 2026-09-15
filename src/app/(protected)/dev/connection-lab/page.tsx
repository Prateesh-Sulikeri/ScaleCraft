import { CanvasStoreProvider } from "@/canvas/store";
import { ConnectionLabContent } from "./ConnectionLabContent";

/**
 * Dev-only scratch harness for the connect gesture - not linked from any nav.
 *
 * Loads a fixed grid of cards at the real authored pitch onto a real Canvas and
 * exposes the store on `window.__scConn`, so a Playwright driver can perform an
 * actual pointer drag and then read back which edge it produced. Drag
 * ergonomics are geometry plus xyflow's own hit-testing, and neither survives
 * jsdom - a unit test can only assert the pure helpers, never the gesture.
 */
export default function ConnectionLabPage() {
  return (
    <CanvasStoreProvider>
      <ConnectionLabContent />
    </CanvasStoreProvider>
  );
}
