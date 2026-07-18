/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Text To Speech › Playback Helpers

Pure computations backing playbackControls.js: speed presets, volume/pitch
clamping, sleep-timer extension, and the pre-sleep volume fade.

═══════════════════════════════════════════════════════════════════════════ */

export const SPEED_PRESETS = {
  comfortable: 0.85,
  normal:      1,
  fast:        1.25,
  audiobook:   1.5,
};

export function clampRange (value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export function clampVolume (value) {
  return clampRange(value, 0, 1, 1);
}

export function clampPitch (value) {
  return clampRange(value, 0, 2, 1);
}

/**
 * Volume factor (0..1) to apply while the sleep timer is winding down.
 * Fades linearly over the last `fadeMs` of the countdown, full volume before that.
 */
export function computeFadeFactor (remainingMs, fadeMs) {
  if (!fadeMs || remainingMs === null || remainingMs === undefined) return 1;
  if (remainingMs >= fadeMs) return 1;
  if (remainingMs <= 0) return 0;
  return remainingMs / fadeMs;
}

export function nextSleepEnd (currentEnd, extraMinutes, now = Date.now()) {
  const base = currentEnd && currentEnd > now ? currentEnd : now;
  return base + extraMinutes * 60000;
}

export function clampSentenceIndex (idx, length) {
  if (length <= 0) return 0;
  return Math.min(length - 1, Math.max(0, idx));
}
