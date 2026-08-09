/**
 * The tour's only telemetry: a capped local ring buffer, never a backend —
 * no telemetry infra exists in this app and none should be built
 * speculatively (see pending-guided-tour.md's resilience addendum). Proves
 * existence of a problem (a predicate threw, a target never resolved), not
 * its rate — silent abandoners are silent by definition.
 *
 * Dev/support channel only, read via `window.__scaleTour.dump()`. A later
 * slice may add a "Report a problem" affordance that reads this buffer; none
 * exists yet.
 */

const STORAGE_KEY = "scalecraft:tour-log";
const MAX_ENTRIES = 200;

export type TourLogEvent =
  | { type: "step-entered"; stepId: string }
  | { type: "advanced-via"; stepId: string; via: string }
  | { type: "predicate-threw"; stepId: string; message: string }
  | { type: "resolution-failed"; stepId: string; target: string }
  | { type: "watchdog-fired"; stepId: string }
  | { type: "requires-broke"; stepId: string }
  | { type: "reconciled-via"; stepId: string; how: string }
  | { type: "tour-exited-via"; via: string };

export type LoggedTourEvent = TourLogEvent & { tourId: string; at: number };

function readLog(): LoggedTourEvent[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as LoggedTourEvent[]) : [];
  } catch {
    return [];
  }
}

function writeLog(entries: LoggedTourEvent[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    // Quota exceeded or private-mode storage — a diagnostic nicety, never
    // worth crashing the tour over.
  }
}

export function logTourEvent(tourId: string, event: TourLogEvent) {
  const entries = readLog();
  entries.push({ ...event, tourId, at: Date.now() });
  writeLog(entries);
}

export function dumpTourLog(): LoggedTourEvent[] {
  return readLog();
}

export function clearTourLog() {
  writeLog([]);
}

if (typeof window !== "undefined") {
  (window as unknown as { __scaleTour?: { dump: () => LoggedTourEvent[]; clear: () => void } }).__scaleTour = {
    dump: dumpTourLog,
    clear: clearTourLog,
  };
}
