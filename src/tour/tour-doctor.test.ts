import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { designEditorTour } from "./design-editor-tour";
import type { TourContext, TourStep } from "./types";

/**
 * Static, mechanical guard against the class of bug the resilience-redesign
 * addendum in pending-guided-tour.md diagnoses: "anchor renamed in an
 * unrelated future refactor" turning from a silent runtime dead end into a
 * red CI check at the moment of the refactor. Two checks, over every
 * registered tour script:
 *
 * 1. Every `target`/`spotlightAlso`/`popoverAnchor` a step references
 *    actually exists as a `data-tour="..."` attribute somewhere in the app —
 *    grepped from source, not compared against the TourStepTarget type
 *    (which only proves the string is spelled like a valid target, not that
 *    anything still renders it).
 * 2. Every `waitFor` predicate runs against a handful of synthetic
 *    TourContext fixtures without throwing, and is satisfiable by at least
 *    one of them — the generic version of the airbag's safe-evaluator
 *    fallback, catching a broken predicate before it ships rather than
 *    relying on a learner to hit it live.
 */

const SRC_ROOT = path.resolve(__dirname, "..");
const DATA_TOUR_PATTERN = /data-tour="([^"]+)"/g;

function discoverLiveDataTourAnchors(): Set<string> {
  const anchors = new Set<string>();
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skips this module itself — TourOverlay.tsx's own
        // `data-tour="${target}"` template literal would otherwise be
        // grepped as a literal (bogus) anchor named "${target}".
        if (entry.name === "tour") continue;
        walk(full);
        continue;
      }
      if (!/\.(tsx|ts)$/.test(entry.name)) continue;
      if (entry.name.endsWith(".test.tsx") || entry.name.endsWith(".test.ts")) continue;
      const content = fs.readFileSync(full, "utf8");
      for (const match of content.matchAll(DATA_TOUR_PATTERN)) anchors.add(match[1]);
    }
  }
  walk(SRC_ROOT);
  return anchors;
}

const TOURS: { name: string; steps: TourStep[] }[] = [{ name: "design-editor", steps: designEditorTour }];

const emptyCtx: TourContext = {
  isComponentPickerOpen: false,
  selectedNodeId: null,
  presentComponentIds: [],
  connectedComponentIds: [],
  edges: [],
  lastValidationErrorCount: null,
  hasSubmittedPassing: false,
};

/** Fixtures spanning the three real board states the plan names: a fresh
 * chapter, one mid-fix, and one fully solved — deliberately not exhaustive
 * (that's what per-step tests in design-editor-tour.test.ts are for), just
 * enough that a well-formed predicate has somewhere to become true. */
const FIXTURES: Record<string, TourContext> = {
  empty: emptyCtx,
  midFix: {
    isComponentPickerOpen: true,
    selectedNodeId: "n1",
    presentComponentIds: ["client", "app-server", "sql-database"],
    // Placed but not yet wired to anything — the realistic "mid-fix" state
    // for picker-tour, whose predicate now checks both.
    connectedComponentIds: [],
    edges: [{ sourceComponentId: "client", targetComponentId: "app-server", kind: "async" }],
    lastValidationErrorCount: 1,
    hasSubmittedPassing: false,
  },
  solved: {
    isComponentPickerOpen: false,
    selectedNodeId: null,
    presentComponentIds: ["client", "app-server", "sql-database"],
    connectedComponentIds: ["sql-database"],
    edges: [{ sourceComponentId: "client", targetComponentId: "app-server", kind: "request-flow" }],
    lastValidationErrorCount: 0,
    hasSubmittedPassing: true,
  },
};

describe("tour doctor (static)", () => {
  const liveAnchors = discoverLiveDataTourAnchors();

  it("the scan itself found real data-tour anchors — sanity check for the discovery logic", () => {
    expect(liveAnchors.size).toBeGreaterThan(0);
  });

  for (const { name, steps } of TOURS) {
    describe(name, () => {
      it("every step's target/spotlightAlso/popoverAnchor resolves to a live data-tour anchor", () => {
        for (const step of steps) {
          const referenced = [step.target, step.popoverAnchor, ...(step.spotlightAlso ?? [])].filter(
            (t): t is NonNullable<typeof t> => t != null,
          );
          for (const target of referenced) {
            expect(
              liveAnchors.has(target),
              `step "${step.id}" references data-tour="${target}", which no longer exists anywhere in src/`,
            ).toBe(true);
          }
        }
      });

      it("no waitFor predicate throws against any fixture", () => {
        for (const step of steps) {
          if (!step.waitFor) continue;
          for (const [fixtureName, ctx] of Object.entries(FIXTURES)) {
            expect(
              () => step.waitFor!(ctx),
              `step "${step.id}" threw against the "${fixtureName}" fixture`,
            ).not.toThrow();
          }
        }
      });

      it("every waitFor predicate is satisfiable by at least one fixture", () => {
        for (const step of steps) {
          if (!step.waitFor) continue;
          const satisfiable = Object.values(FIXTURES).some((ctx) => step.waitFor!(ctx));
          expect(
            satisfiable,
            `step "${step.id}"'s predicate is never true against empty/midFix/solved — it can never be completed`,
          ).toBe(true);
        }
      });

      it("no requires predicate throws against any fixture", () => {
        for (const step of steps) {
          if (!step.requires) continue;
          for (const [fixtureName, ctx] of Object.entries(FIXTURES)) {
            expect(
              () => step.requires!(ctx),
              `step "${step.id}"'s requires threw against the "${fixtureName}" fixture`,
            ).not.toThrow();
          }
        }
      });

      it("every requires predicate is satisfiable by at least one fixture", () => {
        // requires describes a structural fact that must be reachable, same
        // as waitFor — an always-false requires would show a false "this
        // changed" note on every single visit to that step.
        for (const step of steps) {
          if (!step.requires) continue;
          const satisfiable = Object.values(FIXTURES).some((ctx) => step.requires!(ctx));
          expect(
            satisfiable,
            `step "${step.id}"'s requires is never true against empty/midFix/solved`,
          ).toBe(true);
        }
      });
    });
  }
});
