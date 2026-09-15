"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Canvas } from "@/canvas/Canvas";
import { useCanvasStore } from "@/canvas/store";
import { chapterRegistry } from "@/content/chapters";
import { toDecoratorNodes } from "@/content/chapters/starter-decorators";
import { ReferenceGraphCanvas } from "@/chapters/ReferenceGraphCanvas";

const withStarter = chapterRegistry.filter((c) => c.starterGraph);

export function StarterLayoutLabContent() {
  const params = useSearchParams();
  const loadGraph = useCanvasStore((s) => s.loadGraph);
  const [chapterId, setChapterId] = useState(
    () => params.get("chapter") ?? withStarter[0]?.id ?? "",
  );

  const chapter = useMemo(
    () => withStarter.find((c) => c.id === chapterId),
    [chapterId],
  );
  const referenceGraph = chapter?.blueprints?.[0]?.referenceGraph;

  useEffect(() => {
    if (!chapter?.starterGraph) return;
    loadGraph(chapter.starterGraph, toDecoratorNodes(chapter.starterDecorators ?? []));
  }, [chapter, loadGraph]);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-2">
        <label className="text-xs text-foreground/60">Starter graph</label>
        <select
          className="rounded border border-border bg-panel px-2 py-1 text-xs"
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
        >
          {withStarter.map((c) => (
            <option key={c.id} value={c.id}>
              {c.id}
            </option>
          ))}
        </select>
        <span className="text-xs text-foreground/40">
          {chapter?.starterGraph?.nodes.length ?? 0} nodes /{" "}
          {chapter?.starterGraph?.edges.length ?? 0} edges
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1">
          <Canvas />
        </div>
        {/* The Debrief's read-only diagram, at the sidebar width it actually
         * renders at - the two canvases share edge-routing.ts, so a regression
         * in one is usually a regression in both. */}
        <div className="w-[380px] shrink-0 overflow-y-auto border-l border-border p-3">
          <p className="mb-2 text-xs text-foreground/60">Debrief reference diagram</p>
          {referenceGraph ? (
            <ReferenceGraphCanvas graph={referenceGraph} />
          ) : (
            <p className="text-xs text-foreground/40">No reference graph authored.</p>
          )}
        </div>
      </div>
    </div>
  );
}
