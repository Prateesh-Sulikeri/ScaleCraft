"use client";

import { useEffect } from "react";
import { Canvas } from "@/canvas/Canvas";
import { useCanvasStoreApi } from "@/canvas/store";
import { CARD_HEIGHT, CARD_WIDTH, PITCH_X, PITCH_Y } from "@/canvas/card-geometry";

declare global {
  interface Window {
    __scConn?: {
      load: (nodes: { id: string; componentId: string; x: number; y: number }[]) => void;
      edges: () => { id: string; source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null; kind?: string }[];
      nodes: () => { id: string; x: number; y: number; w: number; h: number }[];
      connect: (pairs: [string, string][]) => void;
      clearEdges: () => void;
      geometry: { CARD_WIDTH: number; CARD_HEIGHT: number; PITCH_X: number; PITCH_Y: number };
    };
  }
}

export function ConnectionLabContent() {
  const api = useCanvasStoreApi();

  useEffect(() => {
    window.__scConn = {
      load: (specs) => {
        api.getState().loadCanvasState(
          specs.map((s) => ({
            id: s.id,
            type: "component" as const,
            position: { x: s.x, y: s.y },
            data: { componentId: s.componentId, config: {} },
          })),
          [],
        );
      },
      edges: () =>
        api.getState().edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          kind: e.data?.kind,
        })),
      nodes: () =>
        api
          .getState()
          .nodes.filter((n) => n.type === "component")
          .map((n) => ({
            id: n.id,
            x: n.position.x,
            y: n.position.y,
            w: n.data.width ?? CARD_WIDTH,
            h: n.data.height ?? CARD_HEIGHT,
          })),
      connect: (pairs) => {
        for (const [source, target] of pairs) {
          api.getState().onConnect({ source, target, sourceHandle: null, targetHandle: null });
        }
      },
      clearEdges: () => api.setState({ edges: [] }),
      geometry: { CARD_WIDTH, CARD_HEIGHT, PITCH_X, PITCH_Y },
    };
    return () => {
      delete window.__scConn;
    };
  }, [api]);

  return (
    <div className="h-screen w-screen">
      <Canvas />
    </div>
  );
}
