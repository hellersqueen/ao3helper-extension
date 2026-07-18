/* ═══════════════════════════════════════════════════════════════════════════

AO3 Helper - Fic Peek › Excerpt Helpers

Pure logic behind chapter selection, cache-key composition, cache-entry
freshness, and full-chapter text capping. Kept separate from ficPeek.js so
these small but fiddly rules (which chapter index a mode picks, when a
cached entry should be treated as stale, how a composite cache key is built
from the settings that actually affect the extracted text) can be tested
without a DOMParser/fetch harness.

═══════════════════════════════════════════════════════════════════════════ */

export const MAX_FULL_CHAPTER_CHARS = 20000;

/**
 * Chapter index to preview for a given chapter-selection mode.
 * @param {number} count - Number of chapters available
 * @param {'first'|'last'|'random'} mode
 * @returns {number} A valid index into a 0-based chapter array (0 when count
 *   is invalid, so callers can safely index without an extra guard).
 */
export function pickChapterIndex (count, mode) {
  if (!Number.isFinite(count) || count < 1) return 0;
  if (mode === 'last') return count - 1;
  if (mode === 'random') return Math.floor(Math.random() * count);
  return 0; // 'first' (default) or any unrecognized mode
}

/**
 * Composite cache key: the settings that change what text gets extracted
 * must be part of the key, otherwise a cached excerpt from a previous
 * combination of settings would be served back unchanged.
 * @param {string} workUrl
 * @param {{chapterMode: string, excerptMode: string, excerptCustomWords?: number}} opts
 */
export function buildCacheKey (workUrl, { chapterMode, excerptMode, excerptCustomWords }) {
  const wordsPart = excerptMode === 'custom' ? String(excerptCustomWords ?? '') : '';
  return `${workUrl}::${chapterMode}::${excerptMode}::${wordsPart}`;
}

/**
 * Whether a cached entry is still within its time-to-live.
 * @param {number} cachedAt - Timestamp (ms) the entry was cached at
 * @param {number} ttlHours - 0 (or non-finite) means "never expires"
 */
export function isCacheEntryFresh (cachedAt, ttlHours) {
  if (!Number.isFinite(cachedAt)) return false;
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) return true;
  return (Date.now() - cachedAt) < ttlHours * 3600 * 1000;
}

/** Caps a full-chapter excerpt so an unusually long chapter can't bloat the DOM. */
export function truncateFullChapterText (text) {
  const str = String(text || '');
  return str.length > MAX_FULL_CHAPTER_CHARS
    ? str.slice(0, MAX_FULL_CHAPTER_CHARS) + '…'
    : str;
}
