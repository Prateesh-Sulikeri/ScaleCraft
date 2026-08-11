"use client";

import { useMemo, useState } from "react";
import { PageEnter } from "@/app/PageEnter";
import { Walkthrough } from "@/chapters/walkthrough/Walkthrough";
import { normalizeWalkthrough } from "@/chapters/walkthrough/normalize";
import { computeLayout } from "@/chapters/walkthrough/layout";
import { NODE_HEIGHT, NODE_WIDTH } from "@/chapters/walkthrough/geometry";
import { WALKTHROUGH_LAB_FIXTURES } from "./fixtures";
import type { WalkthroughProps } from "@/chapters/walkthrough/types";

function isWalkthroughPropsShape(value: unknown): value is WalkthroughProps {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return Array.isArray(candidate.nodes) && Array.isArray(candidate.edges) && Array.isArray(candidate.steps);
}

/**
 * Dev-only visual check for the Walkthrough authoring pipeline - not linked
 * from any nav, reached by typing the URL directly (same posture as
 * /dev/diagram-question-lab). Authors iterate on props as JSON here, then
 * hand-convert to JSX in the MDX; this deliberately stays JSON-only rather
 * than building a JS/JSX evaluator (.claude/docs/pending-diagram-pipeline.md
 * P4.1).
 *
 * The layout debug overlay is its own panel, not a layer stacked on the
 * live <Walkthrough> render - the shipped component takes no debug prop and
 * has no reachable DOM offsets to align against, so a second panel drawn
 * directly from computeLayout output is the robust way to show column
 * guides and viewBox bounds without touching Walkthrough itself.
 */
export function WalkthroughLabContent() {
  const [fixtureId, setFixtureId] = useState(WALKTHROUGH_LAB_FIXTURES[0].id);
  const [json, setJson] = useState(() => JSON.stringify(WALKTHROUGH_LAB_FIXTURES[0].props, null, 2));
  const [parseError, setParseError] = useState<string | null>(null);
  const [lastGood, setLastGood] = useState<WalkthroughProps>(WALKTHROUGH_LAB_FIXTURES[0].props);
  const [showLayoutDebug, setShowLayoutDebug] = useState(false);

  function selectFixture(id: string) {
    const fixture = WALKTHROUGH_LAB_FIXTURES.find((f) => f.id === id);
    if (!fixture) return;
    setFixtureId(id);
    setJson(JSON.stringify(fixture.props, null, 2));
    setParseError(null);
    setLastGood(fixture.props);
  }

  function handleJsonChange(value: string) {
    setJson(value);
    try {
      const parsed = JSON.parse(value);
      if (!isWalkthroughPropsShape(parsed)) {
        setParseError("props must include nodes[], edges[], and steps[] arrays");
        return;
      }
      setParseError(null);
      setLastGood(parsed);
    } catch (error) {
      setParseError(error instanceof Error ? error.message : "Invalid JSON");
    }
  }

  const { issues } = useMemo(() => normalizeWalkthrough(lastGood), [lastGood]);
  const layout = useMemo(
    () => computeLayout({ nodes: lastGood.nodes, edges: lastGood.edges }),
    [lastGood.nodes, lastGood.edges],
  );
  const viewBoxWidth = lastGood.viewBoxWidth ?? layout.viewBoxWidth;
  const viewBoxHeight = lastGood.viewBoxHeight ?? layout.viewBoxHeight;

  return (
    <PageEnter>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Walkthrough authoring lab</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Dev-only fixtures (not curriculum content) - see fixtures.ts. Iterate on Walkthrough props as JSON, then
            hand-convert to JSX props in the MDX.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            Fixture
            <select
              aria-label="Fixture"
              value={fixtureId}
              onChange={(event) => selectFixture(event.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-sm"
            >
              {WALKTHROUGH_LAB_FIXTURES.map((fixture) => (
                <option key={fixture.id} value={fixture.id}>
                  {fixture.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-foreground/80">
            <input
              type="checkbox"
              checked={showLayoutDebug}
              onChange={(event) => setShowLayoutDebug(event.target.checked)}
            />
            Layout debug overlay
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-2">
            <textarea
              value={json}
              onChange={(event) => handleJsonChange(event.target.value)}
              spellCheck={false}
              aria-label="Walkthrough props JSON"
              className="h-[32rem] w-full rounded-md border border-border bg-panel p-3 font-mono text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
            {parseError && <p className="text-xs text-red-500">Parse error: {parseError}</p>}
          </div>

          <div className="flex flex-col gap-4">
            <Walkthrough {...lastGood} />

            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-semibold text-foreground/80">normalizeWalkthrough issues ({issues.length})</p>
              {issues.length === 0 ? (
                <p className="mt-1 text-xs text-foreground/50">None.</p>
              ) : (
                <ul className="mt-1 space-y-0.5 text-xs text-foreground/70">
                  {issues.map((issue, index) => (
                    <li key={index}>
                      <span className="font-medium">{issue.code}</span>: {issue.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {showLayoutDebug && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-semibold text-foreground/80">
                  Layout debug - viewBox {viewBoxWidth}x{viewBoxHeight}
                </p>
                <div
                  className="relative mx-auto w-full rounded-md border border-dashed border-blue-500/60 bg-panel/40"
                  style={{ aspectRatio: `${viewBoxWidth} / ${viewBoxHeight}` }}
                >
                  {[...layout.positions.entries()].map(([id, position]) => (
                    <div
                      key={id}
                      className="absolute flex items-center justify-center border border-dashed border-blue-500/70 text-[10px] text-blue-600 dark:text-blue-400"
                      style={{
                        left: `${((position.x - NODE_WIDTH / 2) / viewBoxWidth) * 100}%`,
                        top: `${((position.y - NODE_HEIGHT / 2) / viewBoxHeight) * 100}%`,
                        width: `${(NODE_WIDTH / viewBoxWidth) * 100}%`,
                        height: `${(NODE_HEIGHT / viewBoxHeight) * 100}%`,
                      }}
                    >
                      {id}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageEnter>
  );
}
