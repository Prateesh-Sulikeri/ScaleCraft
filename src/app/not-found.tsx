"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRightLeft, Box, Home as HomeIcon, User, X, type LucideIcon } from "lucide-react";

/* Both hooks below follow use-large-screen.ts's useSyncExternalStore
 * pattern rather than a setState-in-effect — kept local to this file since
 * nothing else in the app needs either yet. */

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

function subscribeHistory(callback: () => void) {
  window.addEventListener("popstate", callback);
  return () => window.removeEventListener("popstate", callback);
}
function getHistoryLength() {
  return window.history.length;
}
function useCanGoBack(): boolean {
  const length = useSyncExternalStore(subscribeHistory, getHistoryLength, () => 1);
  return length > 1;
}

type RouteTile = {
  id: string;
  label: string;
  icon: LucideIcon;
  x: number;
  y: number;
  fault?: boolean;
};

/* Coordinates are in the SVG's own viewBox units (600x400) — tile positions
 * below are derived from the same numbers so the HTML tiles and the SVG
 * connector paths always agree on where a node sits. */
/* Positions mirror the reference layout's proportions: the flow climbs
 * diagonally from Client to Service, then the broken route peels off to the
 * right and drops back down to the Invalid Route tile — it doesn't keep
 * climbing past Service. */
const TILES: RouteTile[] = [
  { id: "client", label: "Client", icon: User, x: 94, y: 274 },
  { id: "gateway", label: "API Gateway", icon: ArrowRightLeft, x: 251, y: 155 },
  { id: "service", label: "Service", icon: Box, x: 377, y: 83 },
  { id: "invalid", label: "Invalid Route", icon: X, x: 503, y: 241, fault: true },
];

/* The reference's connectors are circuit-trace sine waves, not a single
 * gentle bow — 2-3 bends alternating side to side before straightening into
 * the tile. Building each as one continuous Catmull-Rom-to-Bezier spline
 * (through a straight line's points, nudged perpendicular on alternating
 * sides) keeps every bend smooth with no seam, instead of hand-picked
 * control points that kept producing a kink at the join. */
function wavyPath(x1: number, y1: number, x2: number, y2: number, waves: number, amplitude: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;

  const points = [{ x: x1, y: y1 }];
  for (let i = 1; i < waves; i++) {
    const t = i / waves;
    const sign = i % 2 === 1 ? 1 : -1;
    points.push({ x: x1 + dx * t + nx * amplitude * sign, y: y1 + dy * t + ny * amplitude * sign });
  }
  points.push({ x: x2, y: y2 });

  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
  }
  return d;
}

const FLOW_PATHS = [wavyPath(94, 274, 251, 155, 3, 14), wavyPath(251, 155, 377, 83, 2, 6)];
const FAULT_PATH = wavyPath(377, 83, 503, 241, 4, 20);

/* Every hop's packet animation uses this same duration (see the
 * animateMotion below) so a later hop's packet only departs once the
 * previous hop's packet has actually arrived, not on an arbitrary offset. */
const PULSE_DURATION = 2.6;

const PARTICLES = [
  { left: "12%", top: "20%", delay: "0s" },
  { left: "82%", top: "62%", delay: "1.4s" },
  { left: "55%", top: "85%", delay: "2.6s" },
  { left: "38%", top: "12%", delay: "0.8s" },
];

const NOISE_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

export default function NotFound() {
  const router = useRouter();
  const canGoBack = useCanGoBack();
  const reducedMotion = useReducedMotion();

  return (
    <main className="relative flex flex-1 flex-col overflow-y-auto bg-background lg:flex-row lg:overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(34,211,238,0.16) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: `url("${NOISE_URL}")`, mixBlendMode: "overlay" }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PARTICLES.map((p) => (
          <span
            key={p.left + p.top}
            className="absolute h-1 w-1 rounded-full bg-[var(--state-error)]/50 motion-safe:animate-[float-slow_8s_ease-in-out_infinite]"
            style={{ left: p.left, top: p.top, animationDelay: p.delay }}
          />
        ))}
      </div>

      <div className="relative z-10 flex w-full flex-col justify-center gap-6 px-8 py-16 sm:px-12 lg:w-[40%] lg:px-16 lg:py-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 self-start opacity-100 transition-opacity hover:opacity-70"
        >
          <div
            aria-hidden="true"
            style={{
              width: 28,
              height: 28,
              backgroundColor: "var(--foreground)",
              WebkitMaskImage: "url(/logo-mask.png)",
              maskImage: "url(/logo-mask.png)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
            }}
          />
          <span className="text-base font-semibold text-foreground">ScaleCraft</span>
        </Link>

        <div className="flex flex-col gap-4">
          <p className="font-mono text-[96px] leading-none font-semibold tracking-tight text-foreground sm:text-[120px] lg:text-[140px]">
            404
          </p>
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Route Not Found</h1>
          <p className="max-w-sm text-sm leading-relaxed text-foreground/60">
            The path you&apos;re looking for doesn&apos;t exist in this architecture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--edge-request-flow)" }}
          >
            <HomeIcon size={15} />
            Return Home
          </Link>
          <button
            type="button"
            onClick={() => (canGoBack ? router.back() : router.push("/"))}
            className="flex items-center gap-2 rounded-md border border-border px-4 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground"
          >
            <ArrowLeft size={15} />
            {canGoBack ? "Back to Previous Page" : "Go Back"}
          </button>
        </div>
      </div>

      <div className="relative z-10 flex w-full flex-1 items-center justify-center px-6 pb-16 sm:px-10 lg:pb-0">
        <div className="relative aspect-[3/2] w-full max-w-2xl">
          <svg viewBox="0 0 600 400" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              <marker id="route-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="10" markerHeight="10" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 Z" fill="var(--edge-request-flow)" />
              </marker>
            </defs>
            {FLOW_PATHS.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke="var(--edge-request-flow)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="6 6"
                opacity="0.7"
                markerEnd="url(#route-arrow)"
                className="motion-safe:animate-[dashdraw_1.4s_linear_infinite]"
              />
            ))}
            <path
              d={FAULT_PATH}
              fill="none"
              stroke="var(--state-error)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 6"
              opacity="0.7"
              className="motion-safe:animate-[dashdraw_1.4s_linear_infinite]"
            />

            {!reducedMotion &&
              FLOW_PATHS.map((d, i) => (
                <circle key={d} r="3" fill="var(--edge-request-flow)">
                  {/* begin is i full laps of the *same* duration, not an
                   * arbitrary stagger — the Gateway->Service packet must
                   * only depart once the Client->Gateway packet has actually
                   * arrived. Equal periods keep the two locked in that
                   * relationship on every subsequent loop, not just the
                   * first. */}
                  <animateMotion dur={`${PULSE_DURATION}s`} begin={`${i * PULSE_DURATION}s`} repeatCount="indefinite" path={d} />
                </circle>
              ))}
          </svg>

          {TILES.map((tile, i) => {
            const Icon = tile.icon;
            return (
              <div
                key={tile.id}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 motion-safe:animate-[float-slow_6s_ease-in-out_infinite]"
                style={{
                  left: `${(tile.x / 600) * 100}%`,
                  top: `${(tile.y / 400) * 100}%`,
                  animationDelay: `${i * 0.4}s`,
                }}
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border backdrop-blur-sm sm:h-16 sm:w-16"
                  style={{
                    borderColor: tile.fault
                      ? "var(--state-error)"
                      : "color-mix(in srgb, var(--edge-request-flow) 50%, transparent)",
                    backgroundColor: tile.fault
                      ? "color-mix(in srgb, var(--state-error) 10%, var(--panel))"
                      : "color-mix(in srgb, var(--edge-request-flow) 8%, var(--panel))",
                    boxShadow: tile.fault
                      ? "0 0 24px color-mix(in srgb, var(--state-error) 35%, transparent)"
                      : "0 0 20px color-mix(in srgb, var(--edge-request-flow) 20%, transparent)",
                  }}
                >
                  <Icon
                    size={20}
                    style={{ color: tile.fault ? "var(--state-error)" : "var(--edge-request-flow)" }}
                    className={tile.fault ? "motion-safe:animate-[pulse-glow_2.4s_ease-in-out_infinite]" : undefined}
                  />
                </div>
                <span
                  className="text-xs font-medium whitespace-nowrap"
                  style={{ color: tile.fault ? "var(--state-error)" : "var(--foreground)", opacity: tile.fault ? 1 : 0.7 }}
                >
                  {tile.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
