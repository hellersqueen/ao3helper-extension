/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Scroll Helpers

Pure math backing visualFeedback.js's configurable auto-scroll speed.
`scrollIntoView({ behavior: 'smooth' })` has no speed knob, so
visualFeedback.js drives its own animation loop using these helpers.

═══════════════════════════════════════════════════════════════════════════ */

export const SCROLL_DURATIONS = {
  slow:   900,
  normal: 450,
  fast:   200,
};

export function getScrollDuration (speed) {
  return SCROLL_DURATIONS[speed] ?? SCROLL_DURATIONS.normal;
}

export function easeInOutQuad (t) {
  const clamped = Math.min(1, Math.max(0, t));
  return clamped < 0.5
    ? 2 * clamped * clamped
    : 1 - Math.pow(-2 * clamped + 2, 2) / 2;
}

export function computeScrollY (startY, targetY, elapsedMs, durationMs) {
  if (durationMs <= 0) return targetY;
  const t = easeInOutQuad(elapsedMs / durationMs);
  return startY + (targetY - startY) * t;
}
