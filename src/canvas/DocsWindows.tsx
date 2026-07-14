"use client";

import { useCanvasStore } from "./store";
import { getComponent } from "@/content/components/registry";
import { DocsModal } from "./DocsModal";

/**
 * Renders every open docs window (see store.ts's `docsWindows`, capped at
 * MAX_DOCS_WINDOWS). Deliberately mounted at the page's top level (see
 * page.tsx), not nested inside NodeInspector or tied to node selection —
 * it used to be both, which is why closing/collapsing the inspector or
 * clicking empty canvas used to silently hide or close whatever docs
 * window was open. A docs window's lifetime is now independent of all of
 * that.
 */
export function DocsWindows() {
  const docsWindows = useCanvasStore((s) => s.docsWindows);
  const closeDocsWindow = useCanvasStore((s) => s.closeDocsWindow);
  const setDocsWindowMinimized = useCanvasStore((s) => s.setDocsWindowMinimized);

  return (
    <>
      {docsWindows.map((w, index) => {
        const definition = getComponent(w.componentId);
        if (!definition) return null;
        return (
          <DocsModal
            key={w.componentId}
            index={index}
            title={definition.label}
            docs={definition.docs}
            minimized={w.minimized}
            onMinimizedChange={(minimized) => setDocsWindowMinimized(w.componentId, minimized)}
            onClose={() => closeDocsWindow(w.componentId)}
          />
        );
      })}
    </>
  );
}
