"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { XCircle } from "lucide-react";
import { getComponent } from "@/content/components/registry";
import { ComponentCardVisual } from "@/canvas/ComponentCardVisual";
import { CARD_HEIGHT, CARD_WIDTH } from "@/canvas/card-geometry";
import { categoryColorVar } from "@/canvas/category-colors";
import { stateRingVar } from "@/canvas/validation-visuals";
import type { ValidationState } from "@/canvas/types";

/** Design-size stage, scaled to fit its column. Real 120x96 cards, so the
 *  preview is the editor's own vocabulary, not a drawing of it. */
const STAGE_W = 664;
const STAGE_H = 356;
const ROW_Y = 128;
const MAX_SCALE = 1.25;

type PreviewNode = { id: string; componentId: string; x: number; y: number; state?: ValidationState };

const NODES: readonly PreviewNode[] = [
  { id: "client", componentId: "client", x: 16, y: ROW_Y },
  { id: "lb", componentId: "load-balancer", x: 186, y: ROW_Y },
  { id: "app", componentId: "app-server", x: 356, y: ROW_Y },
  { id: "cache", componentId: "cache", x: 356, y: 12, state: "warning" },
  { id: "db", componentId: "sql-database", x: 526, y: ROW_Y, state: "error" },
];

/** Request-flow edges, left to right along the row. The cache has none -
 *  that missing edge is the bug the callout explains. */
const EDGES: readonly [string, string][] = [
  ["client", "lb"],
  ["lb", "app"],
  ["app", "db"],
];

const byId = new Map(NODES.map((n) => [n.id, n]));
const DB = byId.get("db")!;
const CALLOUT_TOP = ROW_Y + CARD_HEIGHT + 22;

function useFitScale() {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setScale(Math.min(MAX_SCALE, el.clientWidth / STAGE_W));
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, scale };
}

/**
 * Home's hero artifact: a small, static Design Editor board mid-validation.
 * One error, one warning, and the explanation for the error - the product's
 * core loop (build, validate, read why) shown instead of described.
 *
 * Cards render through ComponentCardVisual with live registry definitions,
 * so a card redesign lands here for free. Nothing animates: this is a
 * snapshot of state, and DESIGN.md keeps motion for real state changes.
 */
export function BlueprintPreview() {
  const { ref, scale } = useFitScale();

  return (
    <figure className="flex flex-col overflow-hidden rounded-lg border border-border bg-panel shadow-[0_24px_48px_-32px_rgba(0,0,0,0.45)]">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <span className="truncate font-mono text-[11px] text-foreground/55">real-world-extraction / bitly-url-shortener</span>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-semibold"
          style={{
            color: stateRingVar.error,
            borderColor: `color-mix(in srgb, ${stateRingVar.error} 55%, transparent)`,
            backgroundColor: `color-mix(in srgb, ${stateRingVar.error} 10%, transparent)`,
          }}
        >
          <XCircle size={12} strokeWidth={2} aria-hidden="true" />1 error · 1 warning
        </span>
      </div>

      <figcaption className="sr-only">
        Example board: Client, Load Balancer, Application Server and SQL Database are wired in a row. A Cache sits
        unconnected above the server. Validation flags the database with an error and explains that every read hits
        it because nothing routes through the cache.
      </figcaption>

      <div
        ref={ref}
        aria-hidden="true"
        className="relative w-full"
        style={{
          aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          backgroundImage: "radial-gradient(color-mix(in srgb, var(--border) 85%, transparent) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <div
          className="absolute left-0 top-0"
          style={{ width: STAGE_W, height: STAGE_H, zoom: scale }}
        >
          <svg width={STAGE_W} height={STAGE_H} className="absolute inset-0" fill="none">
            <defs>
              <marker id="bp-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" fill="var(--edge-request-flow)" />
              </marker>
            </defs>
            {EDGES.map(([from, to]) => {
              const a = byId.get(from)!;
              const b = byId.get(to)!;
              const y = a.y + CARD_HEIGHT / 2;
              return (
                <line
                  key={`${from}-${to}`}
                  x1={a.x + CARD_WIDTH + 4}
                  y1={y}
                  x2={b.x - 5}
                  y2={y}
                  stroke="var(--edge-request-flow)"
                  strokeWidth="1.75"
                  markerEnd="url(#bp-arrow)"
                />
              );
            })}
            {/* Leader from the failing card to its explanation. */}
            <line
              x1={DB.x + CARD_WIDTH / 2}
              y1={DB.y + CARD_HEIGHT + 4}
              x2={DB.x + CARD_WIDTH / 2}
              y2={CALLOUT_TOP}
              stroke="var(--state-error)"
              strokeWidth="1.25"
              strokeDasharray="3 3"
            />
          </svg>

          {NODES.map((node) => {
            const definition = getComponent(node.componentId);
            if (!definition) return null;
            return (
              <div
                key={node.id}
                className="absolute flex flex-col rounded-lg border border-border bg-panel p-1.5 shadow-sm"
                style={
                  {
                    left: node.x,
                    top: node.y,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    outline: `2px solid ${node.state ? stateRingVar[node.state] : "var(--border)"}`,
                    outlineOffset: "1px",
                    "--accent": categoryColorVar[definition.category],
                  } as CSSProperties
                }
              >
                <ComponentCardVisual definition={definition} configured={false} validationState={node.state} />
              </div>
            );
          })}

          <div
            className="absolute flex flex-col gap-1.5 rounded-md border bg-panel px-3.5 py-3"
            style={{
              left: 232,
              right: 16,
              top: CALLOUT_TOP,
              borderColor: `color-mix(in srgb, ${stateRingVar.error} 45%, var(--border))`,
            }}
          >
            <span className="flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: stateRingVar.error }}>
              <XCircle size={14} strokeWidth={2} />
              Every read hits the database
            </span>
            <p className="text-[12.5px] leading-snug text-foreground/75">
              The Cache is on the board, but nothing routes through it. Under read-heavy load the SQL primary
              saturates first. Put the Cache on the App Server&apos;s read path.
            </p>
          </div>
        </div>
      </div>
    </figure>
  );
}
