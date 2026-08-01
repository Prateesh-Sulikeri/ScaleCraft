import { getComponent } from "@/content/components/registry";
import { categoryColorVar } from "@/canvas/category-colors";
import { EDGE_COLOR_VAR, EDGE_DASH_ARRAY, EDGE_KIND_CAPTIONS } from "@/canvas/edge-styles";
import type { ArchitectureGraph, EdgeKind } from "@/lib/graph";
import type { ComponentCategory } from "@/content/components/types";

/** Decorative — category is already an identity channel layered on top of
 * the text label right next to it (Two-Channel Rule, DESIGN.md §2), not the
 * only way to tell components apart here. */
function CategoryDot({ category }: { category: ComponentCategory | undefined }) {
  if (!category) return null;
  return (
    <span
      aria-hidden="true"
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ backgroundColor: categoryColorVar[category] }}
    />
  );
}

/** Same color + dash-pattern pairing the live canvas uses for this exact
 * kind (see edge-styles.ts) — two redundant channels, not color alone, and
 * unlike CategoryDot this one *is* load-bearing: diagram quiz questions can
 * hinge on reading an edge's kind (QUIZ_FRAMEWORK.md §4), so it needs a real
 * text fallback, not just a decorative glyph. */
function EdgeGlyph({ kind }: { kind: EdgeKind }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <svg width="16" height="8" viewBox="0 0 16 8" aria-hidden="true">
        <line
          x1="0"
          y1="4"
          x2="16"
          y2="4"
          stroke={EDGE_COLOR_VAR[kind]}
          strokeWidth="1.5"
          strokeDasharray={EDGE_DASH_ARRAY[kind]}
        />
      </svg>
      <span className="sr-only">{EDGE_KIND_CAPTIONS[kind]}</span>
    </span>
  );
}

/** A lightweight textual shape summary, not a full canvas render — reusing
 * React Flow here would drag in a heavy dependency tree for what's always a
 * read-only aside (Debrief's reference graphs, quiz diagram questions).
 * "Fit-to-graph initial viewport" (see .claude/docs/pending-quiz-ui.md Phase
 * 5) doesn't apply to this component specifically — there's no viewport to
 * fit, it's a list, not a canvas. What Phase 5 actually asked for and this
 * delivers: real category colors (CategoryDot) and edge-kind color/dash
 * styling (EdgeGlyph), both pulled from the same tokens the live canvas
 * uses, not re-invented here. Shared by Debrief.tsx and
 * chapters/quiz/DiagramQuestion.tsx — do not fork a second copy. */
export function ReadOnlyGraphSummary({ graph }: { graph: ArchitectureGraph }) {
  const nodeFor = (nodeId: string) => graph.nodes.find((n) => n.id === nodeId);
  const componentFor = (nodeId: string) => {
    const node = nodeFor(nodeId);
    return node ? getComponent(node.componentId) : undefined;
  };
  const labelFor = (nodeId: string) => componentFor(nodeId)?.label ?? nodeFor(nodeId)?.componentId ?? nodeId;

  return (
    <div className="rounded-md bg-background/60 p-2 text-xs text-foreground/70">
      {graph.edges.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {graph.edges.map((e) => (
            <li key={e.id} className="flex items-center gap-1.5">
              <CategoryDot category={componentFor(e.source)?.category} />
              <span>{labelFor(e.source)}</span>
              <EdgeGlyph kind={e.kind} />
              <CategoryDot category={componentFor(e.target)?.category} />
              <span>{labelFor(e.target)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {graph.nodes.map((n) => (
            <span key={n.id} className="flex items-center gap-1.5">
              <CategoryDot category={componentFor(n.id)?.category} />
              {labelFor(n.id)}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}
