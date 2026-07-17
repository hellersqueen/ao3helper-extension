/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Page Controls › Page Jump Targets

Pure helpers computing the destination pages of the quick-jump controls:
custom-step jumps, percent jumps, and the random page button.

═══════════════════════════════════════════════════════════════════════════ */

/** Clamps a page number into [1, max]. */
export function clampPage (page, max) {
  if (!Number.isFinite(page)) return 1;
  return Math.min(Math.max(Math.round(page), 1), Math.max(max, 1));
}

/** Sanitizes a user-configured jump step (falls back when absurd). */
export function normalizeStep (step, fallback) {
  const n = parseInt(String(step), 10);
  return Number.isFinite(n) && n >= 1 && n <= 10000 ? n : fallback;
}

/** Page at a fraction of the listing: percentPage(0.5, 200) → 100. */
export function percentPage (fraction, max) {
  return clampPage(Math.round(max * fraction), max);
}

/**
 * A random page different from the current one (unless there is only one).
 * @param {() => number} rng — injectable for tests, defaults to Math.random
 */
export function randomPage (current, max, rng = Math.random) {
  if (max <= 1) return 1;
  let page = 1 + Math.floor(rng() * max);
  page = clampPage(page, max);
  if (page === current) page = page === max ? page - 1 : page + 1;
  return clampPage(page, max);
}
