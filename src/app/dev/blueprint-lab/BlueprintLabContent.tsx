"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@/canvas/Canvas";
import { PageEnter } from "@/app/PageEnter";
import { useCanvasStore, toArchitectureGraph } from "@/canvas/store";
import { buildGraphIndex } from "@/validation-engine/graph-index";
import { matchPattern, type Binding } from "@/validation-engine/pattern";
import { runValidation } from "@/validation-engine/engine";
import { ruleRegistry } from "@/validation-engine/rules";
import type { Blueprint } from "@/content/chapters/types";
import { componentRegistry } from "@/content/components/registry";

// A real, working blueprint already in the codebase (src/content/chapters/
// index.ts's bb-dummy-1 chapter) — a known-good starting point to edit from,
// rather than an empty textarea and a blank page.
const EXAMPLE_BLUEPRINT = {
  id: "example-client-lb-app",
  label: "Client routed through a load balancer to an app server",
  require: {
    id: "example-client-lb-app",
    nodes: [
      { alias: "client", componentId: "client" },
      { alias: "lb", componentId: "load-balancer" },
      { alias: "app", componentId: "app-server" },
    ],
    edges: [
      { from: "client", to: "lb" },
      { from: "lb", to: "app" },
    ],
  },
  forbid: [],
  commentary: "A client should never depend on a single app server directly.",
};

function isBlueprintShaped(value: unknown): value is Blueprint {
  return (
    typeof value === "object" &&
    value !== null &&
    "require" in value &&
    typeof (value as { require: unknown }).require === "object"
  );
}

type ParsedBlueprint = { ok: true; blueprint: Blueprint } | { ok: false; error: string };

function parseBlueprintJson(raw: string): ParsedBlueprint {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Invalid JSON" };
  }
  if (!isBlueprintShaped(value)) {
    return { ok: false, error: "Expected an object with at least a `require` GraphPattern field." };
  }
  return { ok: true, blueprint: value };
}

function BindingList({ bindings, nodeLabel }: { bindings: Binding[]; nodeLabel: (nodeId: string) => string }) {
  if (bindings.length === 0) return <p className="text-xs text-foreground/50">No matches.</p>;
  return (
    <ul className="space-y-1">
      {bindings.slice(0, 5).map((binding, i) => (
        <li key={i} className="rounded border border-border bg-background/50 px-2 py-1 text-xs">
          {Object.entries(binding).map(([alias, nodeId]) => (
            <div key={alias}>
              <span className="text-foreground/50">{alias}</span> = {nodeLabel(nodeId)}
            </div>
          ))}
        </li>
      ))}
      {bindings.length > 5 && (
        <li className="text-xs text-foreground/50">…and {bindings.length - 5} more.</li>
      )}
    </ul>
  );
}

export function BlueprintLabContent() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const [rawJson, setRawJson] = useState(() => JSON.stringify(EXAMPLE_BLUEPRINT, null, 2));

  const graph = useMemo(() => toArchitectureGraph(nodes, edges), [nodes, edges]);
  const index = useMemo(() => buildGraphIndex(graph), [graph]);
  const nodeLabel = (nodeId: string) => {
    const n = graph.nodes.find((n) => n.id === nodeId);
    return n ? `${n.componentId} (${nodeId.slice(0, 8)})` : nodeId;
  };

  const parsed = useMemo(() => parseBlueprintJson(rawJson), [rawJson]);

  const evaluation = useMemo(() => {
    if (!parsed.ok) return null;
    const requireMatches = matchPattern(index, parsed.blueprint.require);
    const forbidResults = (parsed.blueprint.forbid ?? []).map((pattern, i) => ({
      index: i,
      id: pattern.id,
      matches: matchPattern(index, pattern),
    }));
    const blocked = forbidResults.some((f) => f.matches.length > 0);
    const overallMatched = requireMatches.length > 0 && !blocked;
    return { requireMatches, forbidResults, overallMatched };
  }, [parsed, index]);

  const violations = useMemo(() => runValidation(graph, ruleRegistry), [graph]);

  return (
    <PageEnter>
      <header className="flex shrink-0 items-center justify-between border-b border-border px-4 py-2">
        <div>
          <h1 className="text-sm font-semibold text-foreground">Blueprint Lab</h1>
          <p className="text-xs text-foreground/50">
            Dev-only scratch tool — not shipped curriculum. Draw a graph, test a Blueprint&apos;s require/forbid
            patterns against it live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setRawJson(JSON.stringify(EXAMPLE_BLUEPRINT, null, 2))}
          className="rounded border border-border px-2 py-1 text-xs hover:bg-panel"
        >
          Load example
        </button>
      </header>

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="relative flex flex-1 flex-col">
          <Canvas />
        </div>

        <aside className="flex w-96 shrink-0 flex-col gap-3 overflow-y-auto border-l border-border bg-panel p-3">
          <div>
            <label htmlFor="blueprint-json" className="mb-1 block text-xs font-medium text-foreground/70">
              Blueprint JSON (id, label, require, forbid?, commentary)
            </label>
            <textarea
              id="blueprint-json"
              value={rawJson}
              onChange={(e) => setRawJson(e.target.value)}
              spellCheck={false}
              className="h-64 w-full resize-y rounded border border-border bg-background p-2 font-mono text-xs text-foreground"
            />
          </div>

          {!parsed.ok && <p className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-400">{parsed.error}</p>}

          {evaluation && (
            <div className="space-y-3 rounded border border-border p-2">
              <div
                className={`rounded px-2 py-1 text-sm font-semibold ${
                  evaluation.overallMatched ? "bg-green-500/15 text-green-400" : "bg-foreground/5 text-foreground/70"
                }`}
              >
                Blueprint {evaluation.overallMatched ? "MATCHED" : "not matched"}
              </div>

              <div>
                <p className="text-xs font-medium text-foreground/70">
                  require: {evaluation.requireMatches.length} match(es)
                </p>
                <BindingList bindings={evaluation.requireMatches} nodeLabel={nodeLabel} />
              </div>

              {evaluation.forbidResults.map((f) => (
                <div key={f.index}>
                  <p className="text-xs font-medium text-foreground/70">
                    forbid[{f.index}]{f.id ? ` (${f.id})` : ""}: {f.matches.length > 0 ? "blocks match" : "clear"}
                  </p>
                  <BindingList bindings={f.matches} nodeLabel={nodeLabel} />
                </div>
              ))}
            </div>
          )}

          <div className="rounded border border-border p-2">
            <p className="mb-1 text-xs font-medium text-foreground/70">
              Rule violations ({violations.length}, full registry)
            </p>
            {violations.length === 0 ? (
              <p className="text-xs text-foreground/50">None.</p>
            ) : (
              <ul className="space-y-1">
                {violations.map((v, i) => (
                  <li key={i} className="rounded border border-border bg-background/50 px-2 py-1 text-xs">
                    <span
                      className={
                        v.severity === "error"
                          ? "text-red-400"
                          : v.severity === "warning"
                            ? "text-yellow-400"
                            : "text-foreground/50"
                      }
                    >
                      [{v.severity}]
                    </span>{" "}
                    {v.message}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <details className="rounded border border-border p-2 text-xs text-foreground/70">
            <summary className="cursor-pointer font-medium">Component ids / categories cheat sheet</summary>
            <ul className="mt-2 space-y-0.5">
              {componentRegistry.map((c) => (
                <li key={c.id}>
                  <span className="font-mono">{c.id}</span> — {c.category}
                </li>
              ))}
            </ul>
            <p className="mt-2">Edge kinds: request-flow, control, replication, async</p>
          </details>
        </aside>
      </main>
    </PageEnter>
  );
}
