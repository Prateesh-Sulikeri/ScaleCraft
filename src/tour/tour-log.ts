/**
 * The tour's only telemetry: a capped local ring buffer, never a backend —
 * no telemetry infra exists in this app and none should be built
 * speculatively (see pending-guided-tour.md's resilience addendum). Proves
 * existence of a problem (a predicate threw, a target never resolved), not
 * its rate — silent abandoners are silent by definition.
 *
 * Dev/support channel: `window.__scaleTour.dump()` for manual inspection,
 * plus `buildReportUrl()` below, which the watchdog and resolution-failed
 * cards (TourOverlay.tsx) link out to.
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

const REPORT_REPO = "Prateesh-Sulikeri/ScaleCraft";
// Keeps the encoded URL well clear of practical browser/GitHub length
// limits even with a full 200-entry buffer — this is a diagnostic excerpt,
// not a guarantee of completeness; the note below points at the full buffer.
const MAX_LOG_CHARS_IN_REPORT = 6000;

/**
 * A "Report a problem" link's target: a GitHub new-issue page prefilled with
 * where the learner got stuck and this tour run's local event buffer, so a
 * maintainer isn't debugging blind. Nothing is sent automatically — GitHub's
 * own compose form is the review step before anything is actually filed
 * (pending-guided-tour.md's watchdog section, "visible before sending").
 */
export function buildReportUrl(tourId: string, stepId: string): string {
  const events = dumpTourLog();
  let dump = JSON.stringify(events, null, 2);
  const truncated = dump.length > MAX_LOG_CHARS_IN_REPORT;
  if (truncated) dump = dump.slice(0, MAX_LOG_CHARS_IN_REPORT);

  const title = `Guided tour stuck: ${tourId} / ${stepId}`;
  const body =
    `The guided tour ("${tourId}") got stuck on step "${stepId}".\n\n` +
    "What were you doing right before this? (optional, but helpful)\n\n" +
    "---\n" +
    "Diagnostic log, from this browser's window.__scaleTour.dump():\n\n" +
    "```json\n" +
    dump +
    (truncated ? "\n… truncated" : "") +
    "\n```\n" +
    (truncated ? `\n(${events.length} events total — truncated above for URL length; the full log is still in localStorage under "scalecraft:tour-log".)` : "");

  return `https://github.com/${REPORT_REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

if (typeof window !== "undefined") {
  (window as unknown as { __scaleTour?: { dump: () => LoggedTourEvent[]; clear: () => void } }).__scaleTour = {
    dump: dumpTourLog,
    clear: clearTourLog,
  };
}
