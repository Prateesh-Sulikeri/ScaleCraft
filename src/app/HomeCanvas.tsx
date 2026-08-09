"use client";

import { useEffect, useMemo } from "react";
import { ReactFlow, ReactFlowProvider, Background, type Node } from "@xyflow/react";
import { useTheme } from "next-themes";
import { useHasMounted } from "@/lib/use-has-mounted";
import { ModeNode } from "@/app/ModeNode";
import { HomeTitleNode, HOME_TITLE_NODE_WIDTH } from "@/app/HomeTitleNode";
import { getCourse } from "@/curriculum";
import { summarizeCourse, type ProgressInputs } from "@/curriculum/progress";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";
import type { CourseId } from "@/curriculum/types";
import type { AppMode } from "@/lib/modes";

export type ModeNodeData = {
  mode: AppMode;
  /** Its absence is what makes a node render disabled instead of navigating
   * somewhere that 404s — kept optional (rather than always required) so a
   * future mode can still land on Home ahead of its route existing. */
  href?: string;
  /** Real per-course progress (src/curriculum/progress.ts's summarizeCourse),
   * not a placeholder — "not started" (0%), "in progress" (0 < percent <
   * 100), "complete" (100%). Omitted for Sandbox: freeform, nothing to
   * complete, so no status to report. */
  status?: "not started" | "in progress" | "complete";
  /** "x / y" chapters, e.g. "7 / 26" — shown small and muted alongside
   * `status`. Always set together with `status`. */
  progressLabel?: string;
  /** 0-100, drives ModeNode's course-level ProgressBar (DESIGN.md's
   * Progress-Is-Not-Validation exception: a *course*-level bar may use the
   * mode's own identity color, unlike section-level bars elsewhere in the
   * app). Omitted for Sandbox alongside `status`, for the same reason. */
  percent?: number;
};
export type ModeNodeType = Node<ModeNodeData, "mode">;
export type TitleNodeType = Node<Record<string, never>, "title">;

const nodeTypes = { mode: ModeNode, title: HomeTitleNode };

const MODE_NODE_WIDTH = 300;
const MODE_ROW = [
  { id: "building-blocks" as const, x: 0, href: "/building-blocks" },
  { id: "real-world-extraction" as const, x: 336, href: "/real-world-extraction" },
  { id: "sandbox" as const, x: 672, href: "/sandbox" },
];
const MODE_ROW_CENTER_X = (MODE_ROW[MODE_ROW.length - 1].x + MODE_NODE_WIDTH) / 2;

function courseProgress(
  courseId: CourseId,
  inputs: ProgressInputs,
): Pick<ModeNodeData, "status" | "progressLabel" | "percent"> {
  const summary = summarizeCourse(getCourse(courseId), inputs);
  const status = summary.percent === 0 ? "not started" : summary.percent === 100 ? "complete" : "in progress";
  return { status, progressLabel: `${summary.completed} / ${summary.total}`, percent: summary.percent };
}

// Content spans roughly x:[0,972] y:[-160,280] (mode row + title, see layout
// below); this pads that out so panning still feels free without letting a
// user scroll into empty space indefinitely — this is a fixed, small
// composition, not an open canvas like Sandbox's.
const HOME_TRANSLATE_EXTENT: [[number, number], [number, number]] = [
  [-350, -510],
  [1322, 630],
];

/**
 * Home is the canvas, not a separate marketing layout — three mode "nodes"
 * on the same xyflow surface Sandbox itself uses (see src/canvas/Canvas.tsx),
 * so the very first screen already looks like the tool a user is about to
 * use, not a landing page bolted in front of it. Navigation is handled by a
 * real <Link> inside ModeNode itself (not an xyflow onNodeClick handler) —
 * that's what gives the Sandbox card native keyboard/focus semantics for
 * free instead of reimplementing them on top of a generic node click.
 *
 * The outer `h-full w-full` wrapper matters: xyflow needs a definite-size
 * ancestor to measure against (see src/canvas/Canvas.tsx's identical
 * wrapper) — without it `.react-flow`'s computed height collapses to 0 and
 * nothing renders, even though the node data itself is correct. That wrapper
 * deliberately does NOT also carry `flex-1` itself (confirmed live: it must
 * not) — combining an explicit `height: 100%` with `flex-grow` on the same
 * box breaks percentage-height resolution for `.react-flow`'s descendants
 * even though the box's own measured height still comes out correct. Same
 * two-level split as Canvas.tsx: the `flex-1` sizing lives one level up, on
 * page.tsx's wrapper around `<HomeCanvas />`, not here.
 */
export function HomeCanvas() {
  const { resolvedTheme } = useTheme();
  const mounted = useHasMounted();
  const colorMode = mounted && resolvedTheme === "light" ? "light" : "dark";
  const backgroundColor = colorMode === "light" ? "#d1d5db" : "#334155";

  const hydrate = useCurriculumProgressStore((s) => s.hydrate);
  const validationPassedDefinitionIds = useCurriculumProgressStore((s) => s.validationPassedDefinitionIds);
  const rowsBySlug = useCurriculumProgressStore((s) => s.rowsBySlug);
  const examAttemptsByDefinition = useCurriculumProgressStore((s) => s.examAttemptsByDefinition);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  // Before hydrate() resolves, the store's default empty Set/Map already
  // renders every course at 0%/"not started" — the same shape a real empty
  // install would have (same convention as LearningPath.tsx) — so there's
  // no separate loading branch to gate and no hydration mismatch to guard
  // against between the server-rendered shell and the first client paint.
  const inputs: ProgressInputs = useMemo(
    () => ({ validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition }),
    [validationPassedDefinitionIds, rowsBySlug, examAttemptsByDefinition],
  );

  // Static layout (positions), dynamic data (status/progressLabel) — three
  // fixed slots, one per AppMode (src/lib/modes.ts), all on one baseline.
  // fitView below handles responsive placement, so the exact spacing here
  // only needs to keep the three from overlapping. `focusable: false` on
  // every node: keyboard navigation goes through ModeNode's own inner
  // <Link>/div instead of xyflow's own node-level tabIndex/role, so Tab
  // reaches real, semantic elements (a real link for every mode now) rather
  // than a generic, non-actionable "group" stop.
  //
  // The title node is part of THIS SAME array specifically so fitView's
  // bounding box includes it — it and the mode row are one composition, not
  // a separately-positioned HTML heading floating above whatever the canvas
  // happens to fit. Centered on the mode row's own center (not the
  // viewport's) so it stays visually paired with the row even as fitView's
  // zoom/offset changes with viewport size.
  const nodes: (ModeNodeType | TitleNodeType)[] = useMemo(
    () => [
      {
        id: "title",
        type: "title",
        position: { x: MODE_ROW_CENTER_X - HOME_TITLE_NODE_WIDTH / 2, y: -160 },
        draggable: false,
        focusable: false,
        selectable: false,
        data: {},
      },
      ...MODE_ROW.map(({ id, x, href }): ModeNodeType => ({
        id,
        type: "mode",
        position: { x, y: 0 },
        data: id === "sandbox" ? { mode: id, href } : { mode: id, href, ...courseProgress(id, inputs) },
        draggable: false,
        focusable: false,
      })),
    ],
    [inputs],
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlowProvider>
        <ReactFlow
          colorMode={colorMode}
          nodes={nodes}
          edges={[]}
          nodeTypes={nodeTypes}
          nodesConnectable={false}
          nodesDraggable={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          translateExtent={HOME_TRANSLATE_EXTENT}
          proOptions={{ hideAttribution: true }}
          fitView
          fitViewOptions={{ padding: 0.25, maxZoom: 1 }}
        >
          <Background gap={50} size={2} color={backgroundColor} />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
