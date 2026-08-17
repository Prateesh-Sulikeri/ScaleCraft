import { BlueprintGlow } from "./blueprint-geometry";

/**
 * Deliberately NOT isometric, and deliberately not made of blocks.
 *
 * Every other decorative object in the app - Home's announcement cluster, this
 * page's own Building Blocks cube - is translucent cubes on a 2:1 isometric
 * grid. A fourth one reads as the same drawing again no matter how it is
 * arranged, which is exactly what happened to two earlier drafts of this file.
 * A sphere in orthographic projection shares the language (thin lines, one
 * hue, hidden geometry dashed) without sharing the form.
 */
const CX = 100;
const CY = 110;
const R = 50;
/** Globe tilt, so the north pole leans away and the parallels read as ellipses
 *  rather than straight lines. */
const TILT = (18 * Math.PI) / 180;

/** Where the extracted patch is taken from, in degrees. Upper right of the
 *  visible face: far enough from the limb that the patch is not foreshortened
 *  into a sliver, far enough from centre that lifting it leaves a visible
 *  hole. */
const PATCH_LAT: [number, number] = [8, 48];
const PATCH_LON: [number, number] = [22, 64];
/** Offset from the patch's place on the globe to where it is held for study. */
const LIFT: [number, number] = [52, -52];

/** The bracket frame around the lifted patch. */
const FRAME_W = 21;
const FRAME_H = 22;
const ARM = 6;

const rad = (deg: number) => (deg * Math.PI) / 180;
const round = (n: number) => Math.round(n * 100) / 100;

type Projected = { x: number; y: number; front: boolean };

/** Orthographic projection of a point on the unit sphere, tilted about the
 *  screen's x-axis. `front` is the near hemisphere - what the viewer can
 *  actually see. */
function project(x: number, y: number, z: number): Projected {
  const yTilted = y * Math.cos(TILT) - z * Math.sin(TILT);
  const zTilted = y * Math.sin(TILT) + z * Math.cos(TILT);
  return { x: CX + R * x, y: CY - R * yTilted, front: zTilted > 0 };
}

/** A point at latitude/longitude on the sphere. */
function atLatLon(latDeg: number, lonDeg: number): Projected {
  const lat = rad(latDeg);
  const lon = rad(lonDeg);
  return project(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon));
}

/** Sample a great or small circle into screen points. */
function circle(pointAt: (theta: number) => Projected, steps = 72): Projected[] {
  return Array.from({ length: steps + 1 }, (_, i) => pointAt((i / steps) * 2 * Math.PI));
}

/**
 * Split a sampled circle into runs on the same side of the sphere, so the near
 * half can be drawn solid and the far half dashed. A wireframe that draws both
 * halves identically reads as a flat mandala, not a sphere.
 */
function runs(points: Projected[]): { front: boolean; d: string }[] {
  const out: { front: boolean; d: string }[] = [];
  let current: { front: boolean; d: string } | null = null;
  for (const point of points) {
    if (!current || current.front !== point.front) {
      current = { front: point.front, d: `M${round(point.x)} ${round(point.y)}` };
      out.push(current);
    } else {
      current.d += ` L${round(point.x)} ${round(point.y)}`;
    }
  }
  return out;
}

function pathFrom(points: Projected[], close = false): string {
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${round(p.x)} ${round(p.y)}`).join(" ");
  return close ? `${d} Z` : d;
}

/** The patch's outline, walked corner to corner along the sphere so its edges
 *  keep the curvature they have on the surface. Translating this path is what
 *  makes the lifted copy read as a piece of the sphere rather than a flat card
 *  sitting near it. */
function patchOutline(steps = 12): Projected[] {
  const [lat0, lat1] = PATCH_LAT;
  const [lon0, lon1] = PATCH_LON;
  const along = (from: number, to: number, i: number) => from + ((to - from) * i) / steps;
  const points: Projected[] = [];
  for (let i = 0; i <= steps; i += 1) points.push(atLatLon(lat0, along(lon0, lon1, i)));
  for (let i = 1; i <= steps; i += 1) points.push(atLatLon(along(lat0, lat1, i), lon1));
  for (let i = 1; i <= steps; i += 1) points.push(atLatLon(lat1, along(lon1, lon0, i)));
  for (let i = 1; i <= steps; i += 1) points.push(atLatLon(along(lat1, lat0, i), lon0));
  return points;
}

const PARALLELS = [-45, 0, 45];
const MERIDIANS = [0, 45, 90, 135];

/**
 * "Real World Extraction" as one drawing: a wireframe globe with a single
 * panel lifted off its surface and held in corner brackets, over the dashed
 * outline of the hole it left.
 *
 * The mode is about looking at a real product and deriving the system behind
 * it, so the subject is the world itself with one piece pulled out for study -
 * and the globe is already this mode's glyph everywhere else in the app
 * (`modeIcon` in src/lib/modes.ts), so the page's illustration and its icon
 * finally say the same thing.
 *
 * Its Building Blocks counterpart (BlueprintCube) is the unit alone; this is
 * where a unit gets taken from. Same drafting conventions - thin lines, one
 * hue at several opacities, hidden geometry dashed, a plumb/leader line rather
 * than a floating object - drawn on a sphere instead of a grid.
 *
 * Plain inline SVG with no dependency: the mesh is real orthographic
 * projection, computed here, which is why the parallels foreshorten correctly
 * toward the poles instead of being drawn as evenly spaced arcs. Purely
 * decorative, so `aria-hidden`.
 */
export function BlueprintGlobe({ className = "" }: { className?: string }) {
  const parallels = PARALLELS.map((lat) => ({
    lat,
    runs: runs(
      circle((theta) =>
        project(Math.cos(rad(lat)) * Math.sin(theta), Math.sin(rad(lat)), Math.cos(rad(lat)) * Math.cos(theta)),
      ),
    ),
  }));

  const meridians = MERIDIANS.map((lon) => ({
    lon,
    runs: runs(
      circle((theta) =>
        project(Math.sin(rad(lon)) * Math.cos(theta), Math.sin(theta), Math.cos(rad(lon)) * Math.cos(theta)),
      ),
    ),
  }));

  const outline = patchOutline();
  const corners = [
    atLatLon(PATCH_LAT[0], PATCH_LON[0]),
    atLatLon(PATCH_LAT[0], PATCH_LON[1]),
    atLatLon(PATCH_LAT[1], PATCH_LON[1]),
    atLatLon(PATCH_LAT[1], PATCH_LON[0]),
  ];
  const holeCentre = {
    x: corners.reduce((sum, c) => sum + c.x, 0) / corners.length,
    y: corners.reduce((sum, c) => sum + c.y, 0) / corners.length,
  };
  const liftedCentre = { x: holeCentre.x + LIFT[0], y: holeCentre.y + LIFT[1] };

  return (
    <svg
      viewBox="0 0 240 190"
      aria-hidden="true"
      data-illustration="globe"
      className={`h-full w-full text-[var(--course-accent)] ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <BlueprintGlow id="blueprint-globe-glow" cx={CX + 12} cy={CY - 8} rx={106} ry={76} />

      {/* The sphere itself: a faint disc, then the limb. */}
      <circle cx={CX} cy={CY} r={R} fill="currentColor" fillOpacity="0.05" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.25" />

      {/* Mesh. The far half of every circle is dashed and dimmer - the same
       * hidden-line convention the cube uses for its back edges. */}
      <g fill="none" strokeWidth="1">
        {[...parallels.flatMap((p) => p.runs.map((r) => ({ key: `lat-${p.lat}`, ...r }))),
          ...meridians.flatMap((m) => m.runs.map((r) => ({ key: `lon-${m.lon}`, ...r })))].map((run, i) => (
          <path
            key={`${run.key}-${i}`}
            d={run.d}
            stroke="currentColor"
            strokeOpacity={run.front ? 0.32 : 0.13}
            strokeDasharray={run.front ? undefined : "3 4"}
          />
        ))}
      </g>

      {/* The hole the panel came out of: its outline dashed, its corners
       * ticked, so the vacated patch is legible against the mesh behind it. */}
      <path d={pathFrom(outline, true)} fill="var(--panel)" fillOpacity="0.5" />
      <path
        d={pathFrom(outline, true)}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <g fill="currentColor" fillOpacity="0.55">
        {corners.map((corner) => (
          <circle key={`${round(corner.x)}-${round(corner.y)}`} cx={corner.x} cy={corner.y} r="1.4" />
        ))}
      </g>

      {/* Leader line - the panel is extracted, not floating for effect. */}
      <path
        d={`M${round(holeCentre.x)} ${round(holeCentre.y)} L${round(liftedCentre.x)} ${round(liftedCentre.y)}`}
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.28"
        strokeWidth="1"
        strokeDasharray="2 4"
      />

      {/* The extracted panel: the same curved quad, moved. */}
      <g transform={`translate(${LIFT[0]} ${LIFT[1]})`}>
        <path d={pathFrom(outline, true)} fill="currentColor" fillOpacity="0.16" />
        <path d={pathFrom(outline, true)} fill="none" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.25" />
      </g>

      {/* Corner brackets - four marks, never a closed rectangle. A full box
       * reads as a card behind the panel instead of an instrument pointed at
       * it. */}
      <g stroke="currentColor" strokeWidth="1" strokeOpacity="0.45" fill="none">
        {[
          `M${liftedCentre.x - FRAME_W} ${liftedCentre.y - FRAME_H + ARM} L${liftedCentre.x - FRAME_W} ${liftedCentre.y - FRAME_H} L${liftedCentre.x - FRAME_W + ARM} ${liftedCentre.y - FRAME_H}`,
          `M${liftedCentre.x + FRAME_W - ARM} ${liftedCentre.y - FRAME_H} L${liftedCentre.x + FRAME_W} ${liftedCentre.y - FRAME_H} L${liftedCentre.x + FRAME_W} ${liftedCentre.y - FRAME_H + ARM}`,
          `M${liftedCentre.x - FRAME_W} ${liftedCentre.y + FRAME_H - ARM} L${liftedCentre.x - FRAME_W} ${liftedCentre.y + FRAME_H} L${liftedCentre.x - FRAME_W + ARM} ${liftedCentre.y + FRAME_H}`,
          `M${liftedCentre.x + FRAME_W - ARM} ${liftedCentre.y + FRAME_H} L${liftedCentre.x + FRAME_W} ${liftedCentre.y + FRAME_H} L${liftedCentre.x + FRAME_W} ${liftedCentre.y + FRAME_H - ARM}`,
        ].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}
