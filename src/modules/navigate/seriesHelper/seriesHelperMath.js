/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Series Helper › Pure Helpers

Pure computations backing the series-page features: word totals and reading
time, unavailable-parts detection, next-unread lookup, auto-collapse decision,
and the sequential-vs-anthology title heuristic.

═══════════════════════════════════════════════════════════════════════════ */

const WORDS_PER_MINUTE = 250; // same convention as activityPanel's estimates

export function parseCount (text) {
  if (!text) return null;
  const n = parseInt(String(text).replace(/[,\s]/g, ''), 10);
  return Number.isFinite(n) ? n : null;
}

export function sumWords (counts) {
  return (counts || []).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0);
}

export function formatReadingTime (words) {
  if (!words || words <= 0) return null;
  const minutes = Math.round(words / WORDS_PER_MINUTE);
  if (minutes < 60) return `~${Math.max(1, minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `~${hours} h ${String(rest).padStart(2, '0')} min` : `~${hours} h`;
}

/** Works the series claims to have but that aren't listed (deleted/restricted). */
export function unavailableParts (statedTotal, listedCount) {
  if (!Number.isFinite(statedTotal) || !Number.isFinite(listedCount)) return 0;
  return Math.max(0, statedTotal - listedCount);
}

/** Index of the first work not present in the read set, or -1 if all read. */
export function firstUnreadIndex (workIds, readIds) {
  const read = new Set(readIds || []);
  return (workIds || []).findIndex(id => !read.has(String(id)));
}

/** Remaining parts after the current one; null when unknown. */
export function remainingParts (part, total) {
  if (!Number.isFinite(part) || !Number.isFinite(total)) return null;
  return Math.max(0, total - part);
}

/**
 * Auto-collapse decision for a listing group: a manual choice always wins;
 * otherwise collapse when the group is at least `threshold` works (0 = never).
 */
export function shouldAutoCollapse (count, threshold, manualState) {
  if (manualState === true || manualState === false) return manualState;
  if (!threshold || threshold <= 0) return false;
  return count >= threshold;
}

const SEQUENCE_MARKER = /\b(?:part|book|volume|vol|episode|chapter|arc)\b|\b\d+\b|[#№]\d/i;

function commonPrefixLength (a, b) {
  const max = Math.min(a.length, b.length);
  let i = 0;
  while (i < max && a[i].toLowerCase() === b[i].toLowerCase()) i += 1;
  return i;
}

/**
 * Guess whether a series reads as one continuous story ('seq') or a loose
 * anthology ('anth') from its work titles. Heuristic: sequential series
 * usually number their parts or share a long common title prefix.
 * Returns null when there aren't enough titles to judge.
 */
export function guessSeriesType (titles) {
  const list = (titles || []).map(t => String(t || '').trim()).filter(Boolean);
  if (list.length < 2) return null;

  const withMarker = list.filter(t => SEQUENCE_MARKER.test(t)).length;
  if (withMarker / list.length >= 0.6) return 'seq';

  // Shared prefix of 8+ chars across most consecutive pairs ("Roots I", "Roots II")
  let prefixed = 0;
  for (let i = 1; i < list.length; i += 1) {
    if (commonPrefixLength(list[0], list[i]) >= 8) prefixed += 1;
  }
  if (prefixed / (list.length - 1) >= 0.6) return 'seq';

  return 'anth';
}
