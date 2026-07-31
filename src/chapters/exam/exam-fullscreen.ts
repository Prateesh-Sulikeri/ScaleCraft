/**
 * Isolates the Fullscreen API so ExamShell stays mockable — jsdom implements
 * neither `requestFullscreen` nor `exitFullscreen`. Best-effort only: real
 * fullscreen requires a user gesture and can be denied or unsupported
 * (Safari's vendor-prefixed API, iOS Safari's lack of one at all), and
 * ExamShell's own `fixed inset-0` layout already looks the same either way
 * — "proctored" here means full-screen/focused presentation, not
 * anti-cheat (browsers don't let a page block Escape-exit or detect tab
 * switches from a normal page; see .claude/docs/pending-quiz-ui.md
 * addendum).
 */
export async function requestFullscreenBestEffort(el: HTMLElement): Promise<boolean> {
  try {
    await el.requestFullscreen?.();
    return document.fullscreenElement === el;
  } catch {
    return false;
  }
}

export function exitFullscreenIfActive(el: HTMLElement): void {
  if (document.fullscreenElement === el) {
    void document.exitFullscreen?.().catch(() => {});
  }
}
