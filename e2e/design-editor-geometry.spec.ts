import { test, expect, type Locator, type Page } from "@playwright/test";
import { resetSandbox, SANDBOX_SEED_EDGES } from "./helpers";

/**
 * The Design Editor revamp's geometry, in a real browser.
 *
 * Everything here is something jsdom structurally cannot answer, which is the
 * bar playwright.config.ts sets:
 *
 *   - Authored layout. Overlap and spacing are claims about laid-out boxes;
 *     jsdom gives every node a zero-sized rect, so the unit gates check
 *     authored *coordinates* and have to assume the renderer honours them.
 *   - Edge paths. xyflow measures nodes through a ResizeObserver it never
 *     runs under jsdom, so an unmeasured node has no handle bounds and draws
 *     no path at all - ReferenceGraphCanvas says so in its own comment and
 *     unit-tests `buildNodesAndEdges` as a pure function instead. Whether the
 *     thing actually draws was never checked anywhere until here.
 *   - The hover-reveal ports and the whole-card drop radius, which are CSS
 *     `:hover` state and real pointer hit-testing.
 *
 * The layout tests drive /dev/starter-layout-lab, which loads a chapter's
 * authored `starterGraph` straight onto a real Canvas and renders that
 * chapter's Debrief reference diagram beside it. It reads authored content
 * directly, so - unlike the chapter route - a learner's save cannot shadow
 * what is under test, and nothing here writes any saved state.
 */

const LAB = "/dev/starter-layout-lab";

/** Chapters with an authored `starterGraph`, and the subset of those with a
 *  blueprint `referenceGraph` (pending-design-editor-revamp.md, D16).
 *
 *  Pinned rather than read off the page on purpose. Every loop below is
 *  driven by the lab's own chapter list, so a lab that silently stopped
 *  resolving content would iterate nothing and every assertion inside would
 *  pass by never running - the exact shape of vacuous guard the e2e audit
 *  (pending-e2e-quarantine.md) found ~106 of. These make the count itself
 *  the assertion. Update them when a chapter gains or loses a graph. */
const AUTHORED_STARTER_CHAPTERS = 20;
const AUTHORED_REFERENCE_GRAPHS = 19;

/** Screen-space boxes of every component card currently on the live canvas. */
async function cardBoxes(page: Page) {
  const cards = page.locator(".react-flow__node-component");
  const count = await cards.count();
  const boxes = [];
  for (let i = 0; i < count; i++) {
    const box = await cards.nth(i).boundingBox();
    if (box) boxes.push({ ...box, label: (await cards.nth(i).innerText()).replace(/\s+/g, " ") });
  }
  return boxes;
}

/** Every rendered edge's `d` attribute, within a given canvas root. */
async function edgePathData(root: Locator): Promise<string[]> {
  return root
    .locator(".react-flow__edge-path")
    .evaluateAll((els) => els.map((el) => el.getAttribute("d") ?? ""));
}

/** The lab's own readout of what the selected chapter authored. */
async function authoredCounts(page: Page) {
  const text = await page.locator("text=/\\d+ nodes \\/ \\d+ edges/").innerText();
  const [, nodes, edges] = text.match(/(\d+) nodes \/ (\d+) edges/)!;
  return { nodes: Number(nodes), edges: Number(edges) };
}

test("every authored starter graph and reference diagram renders correctly", async ({
  page,
}) => {
  // One pass over every authored chapter, asserting everything the lab can
  // show, in place of three passes asserting one thing each. The three used
  // to be separate tests; they cost three page loads and three full chapter
  // loops to check claims that are all functions of the same selected chapter.
  // playwright.config.ts is explicit that browser time is the cost this
  // suite is managing (102 tests -> 18), and the longer this file ran, the
  // more often multi-device-sync flaked at the tail of the full suite.
  test.slow();
  await page.goto(LAB);
  await expect(page.locator(".react-flow__node-component").first()).toBeVisible();

  const select = page.locator("select");
  const chapterIds = await select.locator("option").evaluateAll((els) =>
    els.map((el) => (el as HTMLOptionElement).value),
  );
  expect(chapterIds.length, "the lab offered no chapters").toBe(AUTHORED_STARTER_CHAPTERS);

  // The reference diagram is the second ReactFlow on the page, in the lab's
  // right-hand column at the width the Debrief actually renders it at.
  const liveCanvas = page.locator(".react-flow").first();
  const reference = page.locator(".react-flow").nth(1);

  let pairsCompared = 0;
  let livePathsChecked = 0;
  let chaptersWithDiagram = 0;
  let chaptersFitting = 0;
  let chaptersPannable = 0;

  for (const chapterId of chapterIds) {
    await select.selectOption(chapterId);
    const { nodes: authoredNodes, edges: authoredEdges } = await authoredCounts(page);

    // 1. Every authored node renders - nothing silently dropped by loadGraph.
    await expect(page.locator(".react-flow__node-component")).toHaveCount(authoredNodes);

    // 2. No two cards overlap.
    const boxes = await cardBoxes(page);
    expect(boxes.length, `${chapterId}: cards failed to measure`).toBe(authoredNodes);
    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        const [p, q] = [boxes[a], boxes[b]];
        // Rectangle intersection in screen space. fitView's zoom scales both
        // boxes equally, so overlap here means overlap in flow space too.
        const overlaps =
          p.x < q.x + q.width &&
          q.x < p.x + p.width &&
          p.y < q.y + q.height &&
          q.y < p.y + p.height;
        expect(
          overlaps,
          `${chapterId}: "${p.label}" and "${q.label}" overlap on the canvas`,
        ).toBe(false);
        pairsCompared++;
      }
    }

    // 3. Every authored edge draws a real path. A path element with an empty
    //    or degenerate `d` renders nothing - precisely the failure jsdom
    //    cannot tell apart from success.
    if (authoredEdges > 0) {
      await expect(liveCanvas.locator(".react-flow__edge-path")).toHaveCount(authoredEdges);
      for (const d of await edgePathData(liveCanvas)) {
        expect(d, `${chapterId}: a live edge is not a real move/curve`).toMatch(/^M[\s\d.,-]/);
        livePathsChecked++;
      }
    }

    // 4. The Debrief reference diagram, where one is authored.
    if (await page.getByText("No reference graph authored.").isVisible()) continue;
    chaptersWithDiagram++;

    const refCards = reference.locator(".react-flow__node");
    await expect(refCards.first()).toBeVisible();

    const refPaths = await edgePathData(reference);
    expect(refPaths.length, `${chapterId}: reference diagram drew no edges`).toBeGreaterThan(0);
    for (const d of refPaths) {
      expect(d, `${chapterId}: a reference edge rendered an empty path`).toMatch(/^M[\s\d.,-]/);
    }

    // How the figure sits in its column. Which of the two cases applies is
    // arithmetic, not a judgement call: the fit floors at REFERENCE_MIN_ZOOM
    // (0.55) because a card's label stops being readable below it, so a
    // drawing wider than `panel / 0.55` cannot be made to fit and the panel
    // pans instead - anchored at the entry point, with its own zoom controls
    // (ReferenceGraphCanvas.tsx). 3.16 onward are past that line: at 13-22
    // nodes no packing reference-layout.ts can pick is narrow enough.
    const panel = (await reference.boundingBox())!;
    const refBoxes = (
      await Promise.all((await refCards.all()).map((c) => c.boundingBox()))
    ).filter((b) => b !== null);
    expect(refBoxes.length, `${chapterId}: reference cards failed to measure`).toBeGreaterThan(0);
    const contentLeft = Math.min(...refBoxes.map((b) => b.x));
    const contentRight = Math.max(...refBoxes.map((b) => b.x + b.width));

    if (contentRight - contentLeft <= panel.width) {
      // Fits: then it has to actually be inside the frame, not merely small.
      chaptersFitting++;
      expect(
        contentRight,
        `${chapterId}: a reference card overflows the diagram's right edge`,
      ).toBeLessThanOrEqual(panel.x + panel.width + 1);
      expect(
        contentLeft,
        `${chapterId}: a reference card overflows the diagram's left edge`,
      ).toBeGreaterThanOrEqual(panel.x - 1);
    } else {
      // Pans: the end that must be on screen is the entry point, i.e. the
      // left edge of the drawing - the whole reason the fit anchors rather
      // than centres, since centring cuts both ends.
      chaptersPannable++;
      expect(
        contentLeft,
        `${chapterId}: the pannable diagram is not anchored at its entry point`,
      ).toBeGreaterThanOrEqual(panel.x - 1);
      expect(
        contentLeft,
        `${chapterId}: the pannable diagram starts past the panel's right edge`,
      ).toBeLessThan(panel.x + panel.width);
    }
  }

  // Every assertion above is the body of a loop or an `if`. Without these,
  // a lab that stopped resolving content would iterate nothing and this test
  // would pass having checked nothing - the exact shape of vacuous test
  // pending-e2e-quarantine.md found ~106 of.
  expect(pairsCompared, "no card pairs were compared").toBeGreaterThan(0);
  expect(livePathsChecked, "no live edge paths were checked").toBeGreaterThan(0);
  expect(chaptersWithDiagram, "wrong number of reference diagrams rendered").toBe(
    AUTHORED_REFERENCE_GRAPHS,
  );
  // Deliberately not a fourth pinned constant: which chapters pan is a
  // function of authored node count and moves with every chapter written.
  // What has to hold is that every diagram took one branch or the other, and
  // that the fitting branch is still exercised at all.
  expect(chaptersFitting + chaptersPannable, "a diagram took neither branch").toBe(
    chaptersWithDiagram,
  );
  expect(chaptersFitting, "no reference diagram fit its panel").toBeGreaterThan(0);
});

test("ports stay hidden until the card is hovered", async ({ page }) => {
  // The reveal is opacity 0 -> 1 on `.react-flow__node:hover` (globals.css).
  // Twenty cards' worth of always-on dots is noise on a graph being read
  // rather than edited, so "hidden at rest" is half the requirement and the
  // half a screenshot would not catch.
  await resetSandbox(page);

  const card = page.locator(".react-flow__node-component").first();
  // `connectionindicator` is xyflow's own class for a handle that can take
  // part in a connection, and the reveal rule is scoped to it - a handle
  // without it is meant to stay invisible even on hover.
  const port = card.locator(".react-flow__handle-right.connectionindicator").first();
  const opacity = () => port.evaluate((el) => getComputedStyle(el).opacity);

  // Move the pointer somewhere that is definitely not a card first: the
  // previous action may have left it over one.
  const pane = (await page.locator(".react-flow__pane").boundingBox())!;
  await page.mouse.move(pane.x + 5, pane.y + pane.height - 5);
  await expect.poll(opacity, { message: "port is visible at rest" }).toBe("0");

  await card.hover();
  await expect.poll(opacity, { message: "port stayed hidden on hover" }).toBe("1");
});

test("a connection dropped on a card's centre still lands", async ({ page }) => {
  // The card centre is the worst-covered point on the card: it is
  // CARD_WIDTH / 2 from the left and right ports, which is exactly what
  // CONNECTION_RADIUS is sized to reach (card-geometry.ts). Drop there and
  // the whole card is a drop target; drop short and it is four dots again.
  // card-geometry.test.ts asserts the arithmetic - this asserts xyflow
  // actually behaves that way.
  await resetSandbox(page);
  const edges = page.locator(".react-flow__edge");
  await expect(edges).toHaveCount(SANDBOX_SEED_EDGES);

  const client = page.locator(".react-flow__node").filter({ hasText: "Client" }).first();
  const database = page.locator(".react-flow__node").filter({ hasText: "SQL Database" }).first();
  const from = (await client.locator(".react-flow__handle-right").first().boundingBox())!;
  const to = (await database.boundingBox())!;

  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  // Dead centre of the target card - nowhere near any of its four ports.
  await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 10 });
  await page.mouse.up();

  await expect(edges).toHaveCount(SANDBOX_SEED_EDGES + 1);
});
