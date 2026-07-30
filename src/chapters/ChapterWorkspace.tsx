"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, type CanvasHandle } from "@/canvas/Canvas";
import { DocsPanel } from "@/canvas/docs-panel/DocsPanel";
import { FocusModeBar } from "@/canvas/docs-panel/FocusModeBar";
import { UndoToast } from "@/app/UndoToast";
import { AppHeader } from "@/app/AppHeader";
import { PageEnter } from "@/app/PageEnter";
import { SidebarShell } from "@/app/SidebarShell";
import { ChapterSidebar } from "./ChapterSidebar";
import { useCanvasShortcuts } from "@/canvas/use-canvas-shortcuts";
import {
  useCanvasStore,
  useCanvasStoreApi,
  CanvasStoreProvider,
  toArchitectureGraph,
  architectureGraphTopologyKey,
} from "@/canvas/store";
import type { ValidationState } from "@/canvas/types";
import { chapterRegistry } from "@/content/chapters";
import type { ChapterDefinition } from "@/content/chapters/types";
import { evaluateChapter, type ChapterOutcome } from "@/validation-engine/chapter-outcome";
import { chapterDisplayViolations } from "./chapter-outcome-violations";
import { chapterSaveId, db } from "@/persistence/db";
import { getComponent } from "@/content/components/registry";
import type { DeepCheckContext } from "@/ai/prompt";
import { findEntry } from "@/curriculum";
import { useCurriculumProgressStore } from "@/curriculum/progress-store";

type ChapterWorkspaceProps = {
  mode: ChapterDefinition["mode"];
  /** Route-derived, always present — the [chapterSlug] route guard
   *  (src/app/<mode>/[chapterSlug]/page.tsx) 404s before this ever mounts
   *  with an unauthored/unknown slug. */
  chapterSlug: string;
};

/**
 * Shared page body for both chapter modes (/building-blocks/:chapterSlug,
 * /real-world-extraction/:chapterSlug) — header + SidebarShell/ChapterSidebar
 * + Canvas. Header is now AppHeader (item I.3), shared with Sandbox —
 * Save/Project/Board work here too, scoped to the open chapter via
 * chapterSaveId (persistence/db.ts). There is always a chapter open now
 * (route-driven, see RELEASE_3.0.0_LEARNING_PATH.md Phase 4) — the Learning
 * Path (src/learning-path/) is the "no chapter" browsing surface, not this
 * component.
 *
 * Wrapped in its own CanvasStoreProvider (see canvas/store.ts) — each
 * [chapterSlug] route mounts a fresh `<ChapterWorkspace key={chapterSlug}>`,
 * so each gets its own store instance, independent from Sandbox and from
 * every other chapter. This is what fixes the cross-mode canvas leak
 * (.claude/docs/pending.md I.6): a mode/chapter switch tears down the
 * previous store instead of leaving its graph behind for the next one to
 * render.
 */
export function ChapterWorkspace({ mode, chapterSlug }: ChapterWorkspaceProps) {
  return (
    <CanvasStoreProvider>
      <ChapterWorkspaceContent mode={mode} chapterSlug={chapterSlug} />
    </CanvasStoreProvider>
  );
}

function ChapterWorkspaceContent({ mode, chapterSlug }: ChapterWorkspaceProps) {
  const storeApi = useCanvasStoreApi();

  // Guaranteed non-null by the route guard in practice; kept as a real
  // lookup (not a non-null assertion) so a bad slug degrades to `null` ->
  // the defensive `if (!chapter) return null;` below, rather than crashing.
  const entry = findEntry(mode, chapterSlug);
  const chapter = entry?.chapterDefinitionId
    ? (chapterRegistry.find((c) => c.id === entry.chapterDefinitionId) ?? null)
    : null;

  const setAvailableComponentIds = useCanvasStore((s) => s.setAvailableComponentIds);

  // The picker's chapter filter follows the open chapter; cleared on
  // unmount so navigating away — to Sandbox or to another chapter — never
  // leaves Sandbox with a stale filtered registry (the spec's flagged "most
  // likely cross-mode bug").
  useEffect(() => {
    setAvailableComponentIds(chapter?.availableComponentIds ?? null);
    return () => setAvailableComponentIds(null);
  }, [chapter, setAvailableComponentIds]);

  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const undo = useCanvasStore((s) => s.undo);
  const redo = useCanvasStore((s) => s.redo);
  const canUndo = useCanvasStore((s) => s.past.length > 0);
  const canRedo = useCanvasStore((s) => s.future.length > 0);
  const docsPanelOpen = useCanvasStore((s) => !s.docsPanel.minimized || s.docsPanel.focusMode);
  const toggleDocsPanel = useCanvasStore((s) => s.toggleDocsPanel);
  const focusMode = useCanvasStore((s) => s.docsPanel.focusMode);
  const loadGraph = useCanvasStore((s) => s.loadGraph);
  const loadCanvasState = useCanvasStore((s) => s.loadCanvasState);

  const canvasRef = useRef<CanvasHandle>(null);

  // Icon-only header button (see AppHeader) — same 1.5s Save -> Check icon
  // swap as Sandbox.
  const [justSaved, setJustSaved] = useState(false);

  const markVisited = useCurriculumProgressStore((s) => s.markVisited);
  const hydrateProgress = useCurriculumProgressStore((s) => s.hydrate);
  const recordValidationPass = useCurriculumProgressStore((s) => s.recordValidationPass);

  // Makes IN_PROGRESS real (src/curriculum/progress.ts derives it from
  // lastVisitedAt) — fires once per mount, and the route is keyed on
  // chapterSlug (see the [chapterSlug]/page.tsx guard), so a genuine chapter
  // switch always remounts and re-fires this.
  useEffect(() => {
    void markVisited(chapterSlug);
  }, [chapterSlug, markVisited]);

  // The in-workspace sidebar (ChapterSidebar) reads passedChapterIds derived
  // from this same store — needs its own hydrate() call since the Learning
  // Path's hydrate (a separate mount) doesn't reach here.
  useEffect(() => {
    void hydrateProgress();
  }, [hydrateProgress]);

  useEffect(() => {
    // Route guard means `chapter` should already be non-null here; the
    // fallback exists only so a stale/bad slug degrades to an empty canvas
    // instead of crashing (see the defensive `if (!chapter) return null;`
    // at the bottom of this component).
    if (!chapter) {
      loadCanvasState([], []);
      return;
    }
    let cancelled = false;
    db.saves.get(chapterSaveId(chapter.id)).then((save) => {
      if (cancelled) return;
      if (save) {
        loadCanvasState(save.nodes, save.edges);
      } else if (chapter.starterGraph) {
        loadGraph(chapter.starterGraph);
      } else {
        loadCanvasState([], []);
      }
    });
    return () => {
      cancelled = true;
    };
    // Re-run only when the chapter's identity changes — loadGraph/
    // loadCanvasState are stable store actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id]);

  // Each chapter route mounts a fresh CanvasStoreProvider (key={chapterSlug}
  // on the route, see the [chapterSlug]/page.tsx guard), so within one
  // mount `chapter` never changes — closing over it directly here is safe
  // and doesn't need the ref indirection a changing value would require.
  useEffect(() => {
    return () => {
      if (!chapter) return;
      const { nodes, edges } = storeApi.getState();
      void db.saves.put({ id: chapterSaveId(chapter.id), updatedAt: Date.now(), nodes, edges });
    };
  }, [storeApi, chapter]);

  const handleSave = async () => {
    // Defensive only — the route guard means there is always a chapter open.
    if (!chapter) return;
    const { nodes: liveNodes, edges: liveEdges } = storeApi.getState();
    await db.saves.put({
      id: chapterSaveId(chapter.id),
      updatedAt: Date.now(),
      nodes: liveNodes,
      edges: liveEdges,
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  useCanvasShortcuts(handleSave);

  const [chapterOutcome, setChapterOutcome] = useState<ChapterOutcome | null>(null);
  const [checkedGraphKey, setCheckedGraphKey] = useState<string | null>(null);

  // Deep Check's spoiler gate (§10.6) keys off "has this chapter ever been
  // passed" — chapterProgress row existence, not just chapterOutcome.passed
  // from the current session's last Validate click. A returning learner who
  // passed a chapter days ago and reopens it should get debrief framing
  // immediately, before clicking Validate again this session.
  const [passedChapterIds, setPassedChapterIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!chapter) return;
    let cancelled = false;
    db.chapterProgress.get(chapter.id).then((row) => {
      if (cancelled || !row) return;
      setPassedChapterIds((prev) => new Set(prev).add(chapter.id));
    });
    return () => {
      cancelled = true;
    };
  }, [chapter]);
  // Real rule violations plus chapter-level "allowed but not correct"
  // reasons (missing/disconnected required component, blueprint mismatch),
  // merged so the header's Validation pane is the one place a learner looks
  // for "what's wrong and why" — see chapter-outcome-violations.ts.
  const violations = useMemo(
    () => (chapterOutcome && chapter ? chapterDisplayViolations(chapterOutcome, chapter, nodes) : null),
    [chapterOutcome, chapter, nodes],
  );

  const currentGraphKey = useMemo(
    () => architectureGraphTopologyKey(toArchitectureGraph(nodes, edges)),
    [nodes, edges],
  );
  const isStale = violations !== null && checkedGraphKey !== currentGraphKey;

  // Scoped to the open chapter's own validationRuleIds, not the full global
  // registry — a chapter should only ever fail on what it's actually
  // teaching (CLAUDE.md: "that's a config option or a validation rule
  // scoped to that chapter"). evaluateChapter layers the required-component
  // connectivity check and blueprint matching on top of the rule run.
  const handleValidate = () => {
    if (!chapter) return;
    const graph = toArchitectureGraph(nodes, edges);
    const outcome = evaluateChapter(graph, chapter);
    setChapterOutcome(outcome);
    setCheckedGraphKey(architectureGraphTopologyKey(graph));
    if (outcome.passed) {
      void db.chapterProgress
        .put({
          chapterId: chapter.id,
          completedAt: Date.now(),
          matchedBlueprintId: outcome.matchedBlueprintId,
        })
        .then(() => {
          setPassedChapterIds((prev) => new Set(prev).add(chapter.id));
          recordValidationPass(chapter.id);
        });
    }
  };

  // Keyed on the whole ChapterOutcome, not just rule violations — a graph
  // with zero rule violations can still fail the chapter (a required
  // component present but disconnected, or no blueprint matched), and
  // painting every node green in that case would show a learner a false
  // "this is right" signal on a canvas that's still failing overall.
  const nodeStates: Record<string, ValidationState> = {};
  if (chapterOutcome && !isStale) {
    if (chapterOutcome.passed) {
      for (const n of nodes) {
        if (n.type === "component") nodeStates[n.id] = "valid";
      }
    } else {
      // `violations` (the merged, display-facing list — see
      // chapter-outcome-violations.ts) already includes a
      // disconnected-required-component entry with the real offending node
      // ids, so this one loop covers both real rule violations and that
      // chapter-level reason — no separate pass needed.
      for (const v of violations ?? []) {
        for (const id of v.offendingNodeIds) {
          nodeStates[id] = v.severity === "error" ? "error" : "warning";
        }
      }
    }
  }

  const chapterPassed = chapter !== null && passedChapterIds.has(chapter.id);
  // Blueprints only ever reach the payload once passed (the spoiler gate,
  // §10.6, enforced by buildUserPayload — this ctx assembly just supplies
  // what's true, the gate itself lives in ai/prompt.ts).
  const deepCheckCtx: DeepCheckContext = useMemo(() => {
    const graph = toArchitectureGraph(nodes, edges);
    const presentComponentIds = new Set(graph.nodes.map((n) => n.componentId));
    const components = [...presentComponentIds]
      .map((id) => getComponent(id))
      .filter((c) => c !== undefined);
    return {
      graph,
      components,
      violations: violations ?? [],
      passed: chapterPassed,
      ...(chapter
        ? {
            chapter: {
              mode: chapter.mode,
              problemStatement: chapter.problemStatement,
              learningObjectives: chapter.learningObjectives,
              curriculumContext: chapter.curriculumContext,
            },
            blueprints: chapter.blueprints,
          }
        : {}),
    };
  }, [nodes, edges, violations, chapterPassed, chapter]);

  // Route guard makes this unreachable in practice; a degrade, not a crash,
  // for a stale/bad slug.
  if (!chapter) return null;

  return (
    <PageEnter>
      {focusMode ? (
        <FocusModeBar />
      ) : (
        <AppHeader
          mode={mode}
          canvasRef={canvasRef}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          violations={violations}
          isStale={isStale}
          onValidate={handleValidate}
          saveId={chapterSaveId(chapter.id)}
          onSave={handleSave}
          justSaved={justSaved}
          docsPanelOpen={docsPanelOpen}
          toggleDocsPanel={toggleDocsPanel}
          deepCheckCtx={deepCheckCtx}
        />
      )}

      <main className="relative flex min-h-0 flex-1 overflow-hidden">
        {!focusMode && (
          <SidebarShell>
            <ChapterSidebar
              courseId={mode}
              chapterSlug={chapterSlug}
              chapterOutcome={chapterOutcome}
              isStale={isStale}
            />
          </SidebarShell>
        )}
        {/* Stays mounted across focus-mode toggles — see DocsPanel.tsx. */}
        <div className="relative flex flex-1 flex-col">
          <Canvas ref={canvasRef} nodeStates={nodeStates} />
        </div>

        {docsPanelOpen && <DocsPanel />}
      </main>

      <UndoToast />
    </PageEnter>
  );
}
