/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Visual Preferences › Date Age Math

Pure classification of a date's age into display buckets, used to color
dates by recency instead of only reformatting their text.

═══════════════════════════════════════════════════════════════════════════ */

/** @returns {'today'|'week'|'month'|'older'|null} null when the date can't be parsed. */
export function dateAgeBucket (dateLike, now = Date.now()) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const ms = date.getTime();
  if (!Number.isFinite(ms)) return null;

  const diffDays = Math.floor((now - ms) / 86400000);
  if (diffDays < 0) return 'today'; // future/clock-skew dates read as "today"
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return 'week';
  if (diffDays < 30) return 'month';
  return 'older';
}
